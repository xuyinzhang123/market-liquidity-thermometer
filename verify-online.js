/* 运行时验证：在模拟浏览器环境里加载 dist/online.html 的脚本（截断初始化块），
   逐项验证迁移、null 覆盖、归档日期、口径分组、同日数据修正。
   期望值全部从内联的 PBEC_DATA 动态读取 —— 更新 data.js 后本测试仍然成立。 */
'use strict';
const fs = require('fs');
const vm = require('vm');

const html = fs.readFileSync(require('path').join(__dirname, 'dist', 'online.html'), 'utf8');
const scripts = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
  .map(m => m[1]).filter(s => s.trim());
const code = scripts.join('\n').split('/* 初始化 */')[0];

const dataScript = scripts.find(s => /window\.PBEC_DATA\s*=/.test(s));
if (!dataScript) { console.error('dist/online.html 缺少内联 PBEC_DATA'); process.exit(1); }
const box = { window: {} };
vm.runInNewContext(dataScript, box, { filename: 'inline-data.js' });
const D = box.window.PBEC_DATA;
if (!D) { console.error('内联 PBEC_DATA 解析失败'); process.exit(1); }

function load(seed, patchedCode) {
  const LS = Object.assign({}, seed);
  const store = {
    getItem: k => (k in LS ? LS[k] : null),
    setItem: (k, v) => { LS[k] = String(v); },
    removeItem: k => { delete LS[k]; }
  };
  const el = () => ({
    textContent: '', innerHTML: '', value: '', title: '', className: '', style: {},
    onclick: null, onchange: null, dataset: {}, children: [],
    appendChild(){}, removeChild(){}, setAttribute(){}, addEventListener(){},
    querySelector(){ return el(); }, querySelectorAll(){ return []; },
    insertAdjacentHTML(){}, getContext(){ return {}; }, classList:{add(){},remove(){}}
  });
  const elements = {};
  const document = {
    getElementById: id => elements[id] || (elements[id] = el()), createElement: () => el(), head: el(), body: el(),
    querySelector: () => el(), querySelectorAll: () => [], addEventListener(){}
  };
  /* 把「今天」固定为数据快照日：归档闸门依赖日期匹配，测试不能随运行日期漂移 */
  const AS_OF = Date.parse(D.date + 'T12:00:00Z');
  const ctx = {
    console, document, localStorage: store,
    Date: class extends Date {
      constructor(...a){ super(...(a.length ? a : [AS_OF])); }
      static now(){ return AS_OF; }
    },
    setInterval: () => 0, setTimeout: () => 0, clearTimeout: () => {},
    addEventListener(){}, alert(){}, fetch: () => Promise.resolve({})
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  /* let/const 是词法绑定，不会挂到 globalThis，用尾部导出桥接 */
  const bridge = ';globalThis.__test = { get S(){return S;}, set S(v){S=v;}, '
               + 'msKey: d => msKey(d), get sig(){return S._dataSig;} };';
  vm.runInContext((patchedCode || code) + '\n' + bridge, ctx, { filename: 'online.inline.js' });
  return { ctx, LS, api: ctx.__test, elements };
}

let pass = 0, fail = 0;
const check = (name, cond, extra) => {
  (cond ? pass++ : fail++);
  console.log((cond ? '  [PASS] ' : '  [FAIL] ') + name + (extra ? '  → ' + extra : ''));
};

const MS = (D.marketStats || []).filter(s=>(s.method||'legacy')===(D.collection?.method||'legacy'));
const expScore = (D.history || []).find(h => h.date === D.date && h.score != null);
const msSrc = MS.find(x => x.date===D.date && (x.mode||'v0')==='v0') || {};

console.log('=== 1. 首次加载：评分未漂移、旧脏样本被迁移 ===');
const dirty = {
  'pboc_market_stats': JSON.stringify([
    { date: D.date, score: MS[0] ? MS[0].score : null, state: '中性',
      shPct: null, fundNet: null, note: '旧逻辑污染' }
  ]),
  'pboc_thermo_history': JSON.stringify([{ date: D.date, score: null, note: '旧逻辑污染' }]),
  'pboc_thermo_v1': JSON.stringify({ _dataDate: D.date, dr007: D.dr007 + 0.18 })
};
const a = load(dirty);
const total = a.ctx.computeScore().total;
check('评分与数据快照一致',
  Number.isFinite(total) && (!expScore || Math.abs(total - expScore.score) < 0.6),
  'total=' + total.toFixed(2) + (expScore ? ' recorded=' + expScore.score : ' (无同日历史记录)'));
check('迁移标记写入 schema=2', a.LS['pboc_thermo_schema'] === '2');
check('旧 marketStats 已清空', a.LS['pboc_market_stats'] === '[]');
check('旧 history 已清空', a.LS['pboc_thermo_history'] === '[]');
const ms0 = a.ctx.getMarketStats();
check('权威样本仍来自 data.js',
  ms0.length === MS.length && MS.every(x => ms0.some(y => y.date === x.date)),
  'n=' + ms0.length);
const rec0 = ms0.find(y => y.date === msSrc.date);
check('shPct 真值未被 null 覆盖',
  msSrc.shPct == null || (!!rec0 && rec0.shPct === msSrc.shPct),
  'shPct=' + (rec0 || {}).shPct);
check('data.js 同日修正已被采纳',
  Math.abs(a.api.S.dr007 - D.dr007) < 1e-9,
  'dr007=' + a.api.S.dr007 + ' vs ' + D.dr007);
check('内容签名已落盘', typeof a.api.S._dataSig === 'string' && a.api.S._dataSig.length > 20);

console.log('=== 2. 归档：真实日历日 + 口径分组 ===');
a.ctx.archiveMarket();
const ms1 = a.ctx.getMarketStats();
const today = a.ctx.todayStr();
const rec = ms1.find(x => x.note === '页面自动归档');
check('归档日期 = 本地日历日（非数据快照日）',
  !!rec && rec.date === today, 'date=' + (rec || {}).date + ' today=' + today);
check('归档记录带 mode', !!rec && rec.mode === 'v0', 'mode=' + (rec || {}).mode);
check('分批到达时保留已取到的 shPct',
  msSrc.shPct == null || (!!rec && rec.shPct === msSrc.shPct),
  'shPct=' + (rec || {}).shPct);
a.api.S.mode = 'price';
a.ctx.archiveMarket();
const ms2 = a.ctx.getMarketStats();
check('切口径后两条样本并存、不互相覆盖',
  ms2.some(x => (x.mode || 'v0') === 'v0') && ms2.some(x => x.mode === 'price'),
  'n=' + ms2.length + ' keys=' + ms2.map(x => a.api.msKey(x)).join(','));

console.log('=== 3. 同一天 data.js 内容修正会重新采纳 ===');
const D2 = JSON.parse(JSON.stringify(D));
D2.dr007 = Math.round((D.dr007 + 0.09) * 1000) / 1000;
const code2 = code.replace(dataScript, 'window.PBEC_DATA = ' + JSON.stringify(D2) + ';');
const b = load({ 'pboc_thermo_schema': '2', 'pboc_thermo_v1': a.LS['pboc_thermo_v1'] }, code2);
check('同日修正生效（快照内容变化）',
  Math.abs(b.api.S.dr007 - D2.dr007) < 1e-9,
  'dr007=' + b.api.S.dr007 + ' → ' + D2.dr007);
check('数据日期未变', b.api.S._dataDate === D.date, 'date=' + D.date);

console.log('=== 4. 断更保护 + 历史曲线口径隔离 ===');
const stale = JSON.parse(JSON.stringify(D));
stale.date = '2000-01-01';
const codeStale = code.replace(dataScript, 'window.PBEC_DATA = ' + JSON.stringify(stale) + ';');
const c = load({}, codeStale);
c.ctx.archiveToday(c.ctx.computeScore());
c.ctx.archiveMarket();
check('断更时不生成伪「当天」历史记录',
  (JSON.parse(c.LS['pboc_thermo_history'] || '[]')).length === 0);
check('断更时行情成功也不生成统计样本',
  (JSON.parse(c.LS['pboc_market_stats'] || '[]')).length === 0);

const e = load({ 'pboc_thermo_schema': '2' });
e.ctx.archiveToday(e.ctx.computeScore());
e.api.S.mode = 'price';
e.ctx.archiveToday(e.ctx.computeScore());
const histToday = e.ctx.getHistory().filter(h => h.date === D.date && h.estimate === false);
check('切口径后两条历史并存、不互相覆盖',
  histToday.some(h => (h.mode || 'v0') === 'v0') && histToday.some(h => h.mode === 'price'),
  'n=' + histToday.length + ' keys=' + histToday.map(h => e.api.msKey(h)).join(','));

const scoped = load({'pboc_thermo_schema':'2'});
scoped.LS['pboc_market_stats'] = JSON.stringify([{date:D.date,mode:'v0',method:D.collection?.method||'legacy',shPct:1.23,fundNet:45}]);
scoped.ctx.archiveMarket();
check('同日已取得行情不被缺失值覆盖（固定非空样本）', scoped.ctx.getMarketStats().some(s=>s.date===D.date&&s.shPct===1.23&&s.fundNet===45));
try{ scoped.ctx.renderAll(); check('缺失可选R利率时页面仍能完整渲染',true); }catch(error){check('缺失可选R利率时页面仍能完整渲染',false,error.message);}
console.log('=== 5. Issue #3：旧点可见、方法间断线、统计不混合 ===');
const chartData=JSON.parse(JSON.stringify(D));
chartData.collection={...(chartData.collection||{}),method:'auto-repo-v1'};
chartData.history=[
  {date:'2026-11-05',score:52.4,estimate:true},
  {date:'2026-11-06',score:40.5,estimate:false},
  {date:'2026-11-09',score:33.8,method:'auto-repo-v1'},
  {date:'2026-11-10',score:34,method:'auto-repo-v1'},
  {date:'2026-11-09',score:41,mode:'price',method:'auto-repo-v1'},
  {date:'2026-11-04',score:null,estimate:true}
];
chartData.marketStats=[
  {date:'2026-11-06',score:40.5,shPct:-1.14,state:'中性'},
  {date:'2026-11-09',score:33.8,method:'auto-repo-v1',state:'偏紧',shPct:null}
];
const chartCode=code.replace(dataScript,'window.PBEC_DATA = '+JSON.stringify(chartData)+';');
const chart=load({'pboc_thermo_schema':'2'},chartCode);
const points=chart.ctx.getChartRecords();
check('11月6日旧点恢复且与统计重复项合并',points.filter(h=>h.date==='2026-11-06').length===1);
check('旧分数原样保留，空评分不造点',points.find(h=>h.date==='2026-11-06').score===40.5&&!points.some(h=>h.date==='2026-11-04'));
const segments=chart.ctx.historyChartSegments(points);
check('不同方法和回算之间不连线，同方法新记录可连线',segments.length===3&&segments[0].points.length===1&&segments[1].points.length===1&&segments[2].points.length===2);
check('概率统计仍然排除旧口径',chart.ctx.getMarketStats().length===1&&chart.ctx.getMarketStats()[0].date==='2026-11-09');
chart.ctx.renderStats(); chart.ctx.renderHistory();
check('曲线和历史表均有旧口径标识',chart.elements.statChart.innerHTML.includes('旧口径')&&chart.elements.histBody.innerHTML.includes('2026-11-06')&&chart.elements.histBody.innerHTML.includes('旧口径'));
chart.api.S.mode='price';
check('切换价格优先不挪用旧V0分数',chart.ctx.getChartRecords().length===1&&chart.ctx.getChartRecords()[0].score===41);
chart.ctx.archiveToday(chart.ctx.computeScore());chart.ctx.archiveMarket();
check('新归档保留其他方法的原记录',chart.ctx.getHistory(true).some(h=>h.date==='2026-11-06'&&!h.method)&&chart.ctx.getMarketStats(true).some(h=>h.date==='2026-11-06'&&!h.method));
console.log('\n结果：' + pass + ' 通过 / ' + fail + ' 失败');
process.exit(fail ? 1 : 0);
