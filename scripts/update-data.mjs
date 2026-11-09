#!/usr/bin/env node
/* update-data.mjs — 独立数据更新脚本（不依赖任何私有平台或自动化服务）
 *
 *   node scripts/update-data.mjs --offline --check   离线自检：结构 + 评分一致性，不联网不写文件
 *   node scripts/update-data.mjs --dry-run           拉取行情并打印变更计划，不写文件
 *   node scripts/update-data.mjs                    拉取行情 + 合并手工录入 → 写回 data.js
 *   node scripts/update-data.mjs --date 2026-11-06  同日校正（仅接受当天，无法补录历史行情）
 *
 * 设计约束：
 *  1. 评分复用 liquidity-dashboard.html 里的 computeScore()，绝不复制第二套公式。
 *  2. 央行操作 / 政策利率 / DR001 / DR007 无稳定开放 API，只能由 data/manual-input.json 录入。
 *     脚本不猜测、不编造这些数值；缺失时沿用现有快照并在来源记录里标注。
 *  3. 任何一个字段越界或行情拉取失败，直接中止且不写文件（避免半截数据入库）。
 *  4. 生成的 data.js 保持人工可读，字段顺序与现有快照一致。
 */
'use strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA_FILE = path.join(ROOT, 'data.js');
const MANUAL_FILE = path.join(ROOT, 'data', 'manual-input.json');
const ONLINE_FILE = path.join(ROOT, 'dist', 'online.html');
const PROVENANCE = path.join(ROOT, 'data', 'provenance.json');
const QUOTE_URL = 'https://push2.eastmoney.com/api/qt/ulist.np/get'
  + '?fltt=2&secids=1.000001,0.399001&fields=f2,f3,f6,f12,f14,f62';

const args = process.argv.slice(2);
const has = f => args.includes(f);
const opt = f => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const OFFLINE = has('--offline');
const CHECK = has('--check');
const DRY = has('--dry-run');
const DATE = opt('--date');

const fail = msg => { console.error('[中止] ' + msg); process.exit(1); };
const ok = msg => console.log('  [OK] ' + msg);

/* ---------- 本地日历日（Asia/Shanghai，避免 toISOString 的 UTC 偏移坑） ---------- */
function todayCN() {
  const p = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Shanghai', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const g = t => p.find(x => x.type === t).value;
  return `${g('year')}-${g('month')}-${g('day')}`;
}

/* ---------- 把 JS 对象写成可读的 data.js（键不加引号，保留注释头） ---------- */
function fmt(v, ind = 1) {
  if (v === null || v === undefined) return 'null';
  if (typeof v === 'string') return JSON.stringify(v);
  if (typeof v === 'number') return Number.isFinite(v) ? String(v) : 'null';
  if (typeof v === 'boolean') return String(v);
  const pad = '  '.repeat(ind);
  const padEnd = '  '.repeat(Math.max(0, ind - 1));
  if (Array.isArray(v)) {
    if (!v.length) return '[]';
    return '[\n' + v.map(x => pad + fmt(x, ind + 1)).join(',\n') + '\n' + padEnd + ']';
  }
  if (typeof v === 'object') {
    const keys = Object.keys(v);
    if (!keys.length) return '{}';
    return '{\n' + keys.map(k => pad + k + ': ' + fmt(v[k], ind + 1)).join(',\n')
      + '\n' + padEnd + '}';
  }
  return 'null';
}
function toDataJS(D) {
  return '/* 中国流动性温度计 · 每日数据文件\n'
    + '   由 scripts/update-data.mjs 生成；字段规范见 docs/data-and-methodology.md。\n'
    + '   单位：利率 %，利差 bp，金额 亿元。amt=操作投放，due=当日到期。 */\n'
    + 'window.PBEC_DATA = ' + fmt(D, 0) + ';\n';
}

/* ---------- 复用页面自身的 computeScore()，不引入第二套评分实现 ---------- */
function scoreWith(D) {
  if (!fs.existsSync(ONLINE_FILE)) fail('缺少 dist/online.html，请先运行 npm run build');
  const html = fs.readFileSync(ONLINE_FILE, 'utf8');
  const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
    .map(m => m[1]).filter(s => s.trim());
  const idx = scripts.findIndex(s => /window\.PBEC_DATA\s*=/.test(s));
  if (idx < 0) fail('dist/online.html 里找不到内联的 window.PBEC_DATA');
  scripts[idx] = 'window.PBEC_DATA = ' + JSON.stringify(D) + ';';
  const code = scripts.join('\n').split('/* 初始化 */')[0];

  const store = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
  const el = () => ({
    textContent: '', innerHTML: '', value: '', title: '', className: '', style: {},
    onclick: null, onchange: null, dataset: {}, children: [],
    appendChild() {}, removeChild() {}, setAttribute() {}, addEventListener() {},
    querySelector() { return el(); }, querySelectorAll() { return []; },
    insertAdjacentHTML() {}, getContext() { return {}; }, classList: { add() {}, remove() {} }
  });
  const document = {
    getElementById: () => el(), createElement: () => el(), head: el(), body: el(),
    querySelector: () => el(), querySelectorAll: () => [], addEventListener() {}
  };
  const ctx = {
    console, document, localStorage: store,
    setInterval: () => 0, setTimeout: () => 0, clearTimeout: () => {},
    addEventListener() {}, alert() {}, fetch: () => Promise.resolve({})
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  vm.runInContext(code, ctx, { filename: 'online.inline.js' });
  if (typeof ctx.computeScore !== 'function') fail('页面里找不到 computeScore()，评分复算失败');
  return ctx.computeScore().total;
}

/* ---------- 数值护栏 ---------- */
const num = (v, lo, hi, label) => {
  if (typeof v !== 'number' || !Number.isFinite(v) || v < lo || v > hi) {
    fail(`${label} = ${v}，超出合理区间 [${lo}, ${hi}]`);
  }
  return v;
};
function validate(D, prev) {
  for (const k of ['date', 'policyRate', 'dr001', 'dr007', 'ops', 'market', 'history', 'marketStats']) {
    if (!(k in D)) fail(`data.js 缺少必填字段 ${k}`);
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(D.date)) fail('date 格式应为 YYYY-MM-DD');
  num(D.policyRate, 0, 10, 'policyRate');
  for (const k of ['dr001', 'dr007']) num(D[k], 0, 10, k);
  for (const k of ['r001', 'r007']) {
    if (D[k] == null && D.collection?.missingOptional?.includes(k.toUpperCase())) continue;
    num(D[k], 0, 10, k);
  }
  for (const k of ['chg001', 'chg007']) num(D[k], -300, 300, k);
  if (!Array.isArray(D.ops) || D.ops.length > 20) fail('ops 必须是数组且不超过 20 条');
  for (const o of D.ops) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(o.date || '')) fail('ops 里有非法 date');
    num(o.amt, 0, 100000, 'ops.amt'); num(o.due, 0, 100000, 'ops.due');
  }
  num(D.market.amount, 1000, 60000, 'market.amount');
  if (!Array.isArray(D.history) || !Array.isArray(D.marketStats)) fail('history / marketStats 必须是数组');
  /* 利率单日跳变超过 30bp 视为疑似错数 */
  if (prev) {
    for (const k of ['dr001', 'dr007']) {
      if (Math.abs(D[k] - prev[k]) > 0.30) {
        fail(`${k} 从 ${prev[k]} 跳到 ${D[k]}（>30bp），疑似错数，拒绝写入。请核对后手工修正`);
      }
    }
  }
}

/* ---------- 行情 ---------- */
async function fetchQuotes() {
  const res = await fetch(QUOTE_URL, {
    signal: AbortSignal.timeout(8000),
    headers: { 'User-Agent': 'Mozilla/5.0', 'Accept': 'application/json' }
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  const j = await res.json();
  const raw = j && j.data && j.data.diff;
  const rows = Array.isArray(raw) ? raw : Object.values(raw || {});
  if (rows.length < 2) throw new Error('行情返回不足 2 个指数');
  const sh = rows.find(r => String(r.f12) === '000001');
  const sz = rows.find(r => String(r.f12) === '399001');
  if (!sh || !sz) throw new Error('找不到上证 / 深证成指');
  const amount = (Number(sh.f6) + Number(sz.f6)) / 1e8;
  const fundNet = (Number(sh.f62) + Number(sz.f62)) / 1e8;
  const shPct = Number(sh.f3), szPct = Number(sz.f3);
  num(shPct, -15, 15, '上证涨跌幅'); num(szPct, -15, 15, '深证涨跌幅');
  num(amount, 1000, 60000, '两市成交额(亿元)');
  if (Number.isFinite(fundNet)) num(fundNet, -5000, 5000, '主力净流入(亿元)');
  return {
    amount: Math.round(amount * 100) / 100,
    fundNet: Number.isFinite(fundNet) ? Math.round(fundNet * 100) / 100 : null,
    shPct, szPct
  };
}

/* ---------- 主流程 ---------- */
function readData() {
  const text = fs.readFileSync(DATA_FILE, 'utf8');
  const sandbox = { window: {} };
  vm.runInNewContext(text, sandbox, { filename: 'data.js' });
  const D = sandbox.window.PBEC_DATA;
  if (!D || typeof D !== 'object') fail('data.js 里没有有效的 window.PBEC_DATA');
  return D;
}

const prev = readData();
validate(prev, null);
const score = scoreWith(prev);
console.log('当前快照: date=' + prev.date + ' rev=' + (prev.rev || 1) + ' 复算评分=' + score.toFixed(2));

if (CHECK || OFFLINE) {
  const recorded = (prev.history || []).find(h => h.date === prev.date && h.score != null);
  if (recorded && Math.abs(recorded.score - score) > 0.6) {
    fail(`data.js 记录的分数 ${recorded.score} 与页面复算 ${score.toFixed(2)} 不一致`);
  }
  ok('data.js 结构校验通过');
  ok('评分与页面 computeScore() 一致' + (recorded ? `（记录 ${recorded.score}）` : ''));
  ok('离线自检完成，未联网、未写文件');
  process.exit(0);
}

const today = DATE || todayCN();
let quotes;
try {
  quotes = await fetchQuotes();
  ok(`行情：两市 ${quotes.amount} 亿 | 上证 ${quotes.shPct}% | 深证 ${quotes.szPct}% | 主力 ${quotes.fundNet} 亿`);
} catch (e) {
  fail('行情拉取失败：' + e.message + '。未写入任何文件；可稍后重试，或用 --offline --check 做离线自检');
}

/* 手工录入字段：只允许白名单，防止意外覆盖结构 */
let manual = {};
if (fs.existsSync(MANUAL_FILE)) {
  try { manual = JSON.parse(fs.readFileSync(MANUAL_FILE, 'utf8')); }
  catch (e) { fail('data/manual-input.json 不是合法 JSON：' + e.message); }
}
const ALLOWED = ['policyRate', 'termPremium', 'dr001', 'dr007', 'r001', 'r007',
  'chg001', 'chg007', 'factors', 'ops', 'market'];
const D = structuredClone(prev);
for (const k of ALLOWED) {
  if (!(k in manual)) continue;
  if (k === 'factors') D.factors = { ...D.factors, ...manual.factors };
  else if (k === 'market') D.market = { ...D.market, ...manual.market };
  else D[k] = manual[k];
}

/* 数据新鲜度闸门：央行操作与银行间利率只能手工录入。
   缺当天录入时，不得把旧快照标成当天，也不得生成「旧分数 + 新行情」的统计样本。
   --date 只接受当天：行情接口只返回当前值，取不到历史行情。 */
const hasRatesToday = ['policyRate', 'dr001', 'dr007'].every(k => typeof manual[k] === 'number');
const hasOpsToday = Array.isArray(manual.ops) && manual.ops.some(o => o.date === today);
const staleReason = today !== todayCN()
  ? `--date ${today} 不是今天，行情接口无法取到该日历史行情`
  : (!hasRatesToday || !hasOpsToday
      ? `缺少 ${today} 的手工录入（policyRate / dr001 / dr007 与当日 ops）`
      : '');
if (staleReason) {
  const msg = staleReason + '；已拒绝把旧数据标成当天或生成当日统计样本。'
            + '请填写 data/manual-input.json 后重跑（--date 仅接受当天）。';
  if (DRY) { console.log('[WARN] ' + msg + '\n--dry-run：未写入任何文件'); process.exit(0); }
  fail(msg);
}

D.date = today;
D.rev = prev.date === today ? Number(prev.rev || 1) + 1 : 1;
/* 同日重复运行时，上次的 amount 只是当日盘中累计值，不能当作「前日全天」基准 */
const sameDayRerun = prev.market.date === today;
const prevAmount = (manual.market && manual.market.prevAmount != null)
  ? manual.market.prevAmount
  : (sameDayRerun ? prev.market.prevAmount : prev.market.amount);
D.market = {
  ...D.market,
  date: today,
  amount: quotes.amount,
  prevAmount,
  prevDate: (manual.market && manual.market.prevDate)
         || (sameDayRerun ? prev.market.prevDate : prev.market.date),
  source: `行情接口取数 ${new Date().toISOString()} · 两市成交额 ${quotes.amount} 亿（盘中为当日累计值，非全天口径）`
};
validate(D, prev);

const newScore = scoreWith(D);
const state = newScore >= 60 ? '宽松' : (newScore >= 40 ? '中性' : '偏紧');
const sample = {
  date: today,
  score: Math.round(newScore * 100) / 100,
  state,
  shPct: quotes.shPct,
  szPct: quotes.szPct,
  fundNet: quotes.fundNet,
  amountChg: null,
  note: '由 scripts/update-data.mjs 归档；amountChg 需同时段分钟口径，脚本不推算，留空'
};
const ms = (D.marketStats || []).filter(x => x.date !== today);
ms.push(sample);
D.marketStats = ms.sort((a, b) => a.date.localeCompare(b.date)).slice(-120);

console.log('\n变更计划:');
console.log('  date        ' + prev.date + ' -> ' + D.date + '  (rev ' + D.rev + ')');
console.log('  market      ' + prev.market.amount + ' -> ' + D.market.amount + ' 亿');
console.log('  评分        ' + score.toFixed(2) + ' -> ' + newScore.toFixed(2) + '  [' + state + ']');
console.log('  marketStats ' + (prev.marketStats || []).length + ' -> ' + D.marketStats.length + ' 条');
console.log('  手工字段    ' + (Object.keys(manual).length ? Object.keys(manual).join(', ') : '无（沿用现有快照）'));

if (DRY) { console.log('\n--dry-run：未写入任何文件'); process.exit(0); }

fs.writeFileSync(DATA_FILE, toDataJS(D), 'utf8');
fs.mkdirSync(path.dirname(PROVENANCE), { recursive: true });
fs.writeFileSync(PROVENANCE, JSON.stringify({
  generatedAt: new Date().toISOString(), date: today, rev: D.rev,
  score: sample.score, quotes, manualFields: Object.keys(manual),
  quoteSource: QUOTE_URL
}, null, 2) + '\n', 'utf8');
console.log('\n[OK] 已写入 data.js 与 data/provenance.json');
console.log('     下一步：npm run build 重新生成 dist/');
