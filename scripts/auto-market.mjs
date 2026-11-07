#!/usr/bin/env node
// 无密钥的盘中/收盘行情更新。只更新 market，绝不推进流动性日期或生成评分样本。
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export function chinaTime(now = new Date()) {
  const parts = new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', hourCycle: 'h23'
  }).formatToParts(now);
  const get = key => parts.find(p => p.type === key).value;
  return { date: `${get('year')}-${get('month')}-${get('day')}`, hour: Number(get('hour')) };
}

const amount = value => {
  if (value === '' || value == null) throw new Error('成交额缺失');
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0 || n > 6e12) throw new Error('成交额无效或越界');
  return n;
};

export function parseDaily(json, secid, clock) {
  const data = json?.data;
  if (data?.code !== secid.split('.')[1] || !Array.isArray(data.klines) || data.klines.length < 2) {
    throw new Error(`${secid} 缺少最近两日行情，或指数代码不符`);
  }
  const rows = data.klines.map(line => {
    const cells = line.split(',');
    const date = cells[0];
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date > clock.date) throw new Error('行情日期无效或在未来');
    return { date, amount: amount(cells[6]) };
  }).sort((a, b) => a.date.localeCompare(b.date)).slice(-2);
  if (rows[0].date >= rows[1].date) throw new Error('行情日期重复');
  if (rows[1].date === clock.date && clock.hour < 16) throw new Error('尚未完成收盘，不更新全天行情');
  return rows;
}

export function mergeMarket(previous, sh, sz) {
  if (sh.length !== 2 || sz.length !== 2 || sh.some((r, i) => r.date !== sz[i].date)) {
    throw new Error('沪深两市交易日期不一致');
  }
  if (sh[1].date < previous.market.date) throw new Error('接口返回旧行情，拒绝倒退');
  const total = i => Math.round((sh[i].amount + sz[i].amount) / 1e6) / 100;
  if (total(1) < 1000 || total(1) > 60000 || total(0) < 1000 || total(0) > 60000) {
    throw new Error('两市成交额超出校验范围');
  }
  const next = structuredClone(previous);
  next.market = {
    date: sh[1].date, amount: total(1), prevAmount: total(0), prevDate: sh[0].date,
    source: `${sh[1].date} 收盘 · 东方财富沪深指数日线成交额（自动更新；不代表流动性评分已更新）`
  };
  return next;
}

export function mergeIntraday(previous, json, clock) {
  const rows = json?.data?.diff;
  if (!Array.isArray(rows)) throw new Error('盘中行情格式异常');
  const indexes = ['000001', '399001'].map(code => {
    const row = rows.find(r => r.f12 === code);
    if (!row || typeof row.f124 !== 'number' || row.f124 <= 0) throw new Error('缺少指数或行情时间戳');
    const at = chinaTime(new Date(row.f124 * 1000));
    if (at.date > clock.date) throw new Error('行情日期在未来');
    return { row, at };
  });
  if (indexes[0].at.date !== indexes[1].at.date) throw new Error('两市盘中行情日期不一致');
  // 开盘前/休市仅返回上一个交易日数据时，不伪造今天的成交额。
  if (indexes[0].at.date !== clock.date) return null;
  if (indexes.every(({ row }) => row.f6 === 0)) return null;
  const total = indexes.reduce((sum, { row }) => sum + amount(row.f6), 0);
  const value = Math.round(total / 1e6) / 100;
  if (value > 60000) throw new Error('盘中两市成交额越界');
  if (previous.market.date > clock.date) throw new Error('不允许行情日期倒退');
  if (previous.market.date === clock.date && /收盘/.test(previous.market.source || '')) return null;
  // 盘中只在已知上一交易日全天基准时比较，不把旧盘中值当作全天值。
  const sameDate = previous.market.date === clock.date;
  if (!sameDate && !/收盘/.test(previous.market.source || '')) throw new Error('缺少已确认的前日收盘基准');
  const seconds = Math.min(...indexes.map(({ row }) => row.f124));
  const time = new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(new Date(seconds * 1000));
  const next = structuredClone(previous);
  next.market = { date: clock.date, amount: value,
    prevAmount: sameDate ? previous.market.prevAmount : previous.market.amount,
    prevDate: sameDate ? previous.market.prevDate : previous.market.date,
    source: `${clock.date} ${time} 盘中累计 · 东方财富（前日基准为全天，盘中不可直接比较；流动性评分未更新）` };
  return next;
}

async function fetchIntraday() {
  const url = 'https://push2.eastmoney.com/api/qt/ulist.np/get?fltt=2&secids=1.000001,0.399001&fields=f6,f12,f124';
  const response = await fetch(url, { signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

async function fetchDaily(secid, clock) {
  const url = new URL('https://push2his.eastmoney.com/api/qt/stock/kline/get');
  url.search = new URLSearchParams({ secid, klt: '101', fqt: '0', lmt: '2', end: clock.date.replaceAll('-', ''),
    fields1: 'f1,f2,f3,f4,f5,f6', fields2: 'f51,f52,f53,f54,f55,f56,f57,f58,f59,f60,f61' });
  let last;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(15000), headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return parseDaily(await res.json(), secid, clock);
    } catch (error) { last = error; }
  }
  throw last;
}

async function main() {
  const file = path.join(ROOT, 'data.js');
  const box = { window: {} };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), box, { timeout: 1000 });
  const prev = box.window.PBEC_DATA;
  const clock = chinaTime();
  let next;
  if (clock.hour < 16) {
    next = mergeIntraday(prev, await fetchIntraday(), clock);
    if (!next) {
      console.log('尚无当天有效盘中成交、已保留收盘快照或处于休市；不修改数据。央行操作与资金利率仍未接通自动采集。');
      return;
    }
  } else {
    const [sh, sz] = await Promise.all([fetchDaily('1.000001', clock), fetchDaily('0.399001', clock)]);
    next = mergeMarket(prev, sh, sz);
  }
  if (JSON.stringify(next.market) === JSON.stringify(prev.market)) {
    console.log('行情无变化，未写入文件（周末和休市日通常如此）');
    return;
  }
  console.log(`行情 ${next.market.date}: ${next.market.amount} 亿元；前一交易日全天 ${next.market.prevDate}: ${next.market.prevAmount} 亿元`);
  console.log(`流动性评分数据仍为 ${prev.date}，未修改利率、操作流水、评分或历史统计。`);
  if (process.argv.includes('--dry-run')) { console.log('--dry-run：未写入文件'); return; }
  const text = '/* 市场流动性温度计 · 股市行情自动更新，流动性数据日期单独保留。 */\n'
    + 'window.PBEC_DATA = ' + JSON.stringify(next, null, 2) + ';\n';
  const temp = file + '.tmp';
  fs.writeFileSync(temp, text, 'utf8');
  fs.renameSync(temp, file);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error('更新中止，原快照保留：' + error.message); process.exitCode = 1; });
}
