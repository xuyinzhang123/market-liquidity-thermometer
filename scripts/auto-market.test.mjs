import test from 'node:test';
import assert from 'node:assert/strict';
import { chinaTime, parseDaily, mergeMarket, mergeIntraday } from './auto-market.mjs';

const clock = { date: '2026-11-07', hour: 18 };
const payload = (code, rows) => ({ data: { code, klines: rows.map(([date, n]) => `${date},1,1,1,1,1,${n}`) } });
const sh = parseDaily(payload('000001', [['2026-11-05', 8e11], ['2026-11-06', 9e11]]), '1.000001', clock);
const sz = parseDaily(payload('399001', [['2026-11-05', 7e11], ['2026-11-06', 8e11]]), '0.399001', clock);

test('北京时间跨日不使用 UTC 日期', () => {
  assert.deepEqual(chinaTime(new Date('2026-11-06T17:00:00Z')), { date: '2026-11-07', hour: 1 });
});
test('周末保留真实交易日期，前日基准来自独立日线，不污染流动性或统计', () => {
  const prev = { date: '2026-11-02', rev: 2, dr007: 1.5, ops: [{ date: '2026-11-02' }],
    market: { date: '2026-11-05', amount: 1234 }, history: [{ score: 42 }], marketStats: [{ score: 42 }] };
  const next = mergeMarket(prev, sh, sz);
  assert.equal(next.market.date, '2026-11-06');
  assert.equal(next.market.amount, 17000);
  assert.equal(next.market.prevAmount, 15000);
  const { market, ...core } = next;
  const { market: oldMarket, ...oldCore } = prev;
  assert.deepEqual(core, oldCore);
  assert.equal(prev.market.amount, 1234);
  assert.deepEqual(mergeMarket(next, sh, sz), next);
});
test('拒绝错代码、缺失金额、重复日期、未来数据、盘中数据及两市错日', () => {
  assert.throws(() => parseDaily(payload('399001', [['2026-11-05', 8e11], ['2026-11-06', 9e11]]), '1.000001', clock));
  assert.throws(() => parseDaily(payload('000001', [['2026-11-05', ''], ['2026-11-06', 9e11]]), '1.000001', clock));
  assert.throws(() => parseDaily(payload('000001', [['2026-11-06', 8e11], ['2026-11-06', 9e11]]), '1.000001', clock));
  assert.throws(() => parseDaily(payload('000001', [['2026-11-05', 8e11], ['2026-11-08', 9e11]]), '1.000001', clock));
  assert.throws(() => parseDaily(payload('000001', [['2026-11-05', 8e11], ['2026-11-06', 9e11]]), '1.000001', { date: '2026-11-06', hour: 12 }));
  assert.throws(() => mergeMarket({ market: { date: '2026-11-05' } }, sh, [{ ...sz[0], date: '2026-11-04' }, sz[1]]));
  assert.throws(() => mergeMarket({ market: { date: '2026-11-07' } }, sh, sz));
});

test('早盘休市不伪造日期，盘中重复更新保留前日全天基准', () => {
  const prev = { date: '2026-11-05', ops: [], history: [], marketStats: [],
    market: { date: '2026-11-05', amount: 15000, prevAmount: 14000, prevDate: '2026-11-04', source: '2026-11-05 收盘' } };
  const quote = (day, n = 1e11) => ({ data: { diff: ['000001', '399001'].map(f12 => ({
    f12, f6: n, f124: Date.parse(day + 'T02:30:00Z') / 1000
  })) } });
  const during = { date: '2026-11-06', hour: 10 };
  assert.equal(mergeIntraday(prev, quote('2026-11-05'), during), null);
  assert.equal(mergeIntraday(prev, quote('2026-11-06', 0), during), null);
  const next = mergeIntraday(prev, quote('2026-11-06'), during);
  assert.equal(next.market.amount, 2000);
  assert.equal(next.market.prevAmount, 15000);
  assert.equal(next.date, prev.date);
  assert.match(next.market.source, /10:30 盘中累计/);
  const again = mergeIntraday(next, quote('2026-11-06', 2e11), during);
  assert.equal(again.market.amount, 4000);
  assert.equal(again.market.prevAmount, 15000);
  assert.equal(again.market.prevDate, '2026-11-05');
  assert.deepEqual(again.history, []);
  assert.equal(mergeIntraday({ ...next, market: { ...next.market, source: '收盘' } }, quote('2026-11-06'), during), null);
  assert.throws(() => mergeIntraday(prev, quote('2026-11-07'), during));
  assert.throws(() => mergeIntraday(prev, { data: { diff: [] } }, during));
});
