// Reuse the page's scoring function; no duplicate scoring formula.
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const data = JSON.parse(fs.readFileSync(0, 'utf8'));
const html = fs.readFileSync(path.join(__dirname, '..', 'liquidity-dashboard.html'), 'utf8');
const code = [...html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)]
  .map(m => m[1]).filter(Boolean).join('\n').split('/* 初始化 */')[0];
const element = () => ({style:{}, classList:{add(){},remove(){}},setAttribute(){}});
const context = {console, Date, Intl, document:{getElementById:element,querySelectorAll:()=>[]},
  localStorage:{getItem:()=>null,setItem(){},removeItem(){}}, setInterval(){},setTimeout(){}};
context.window = context;
context.PBEC_DATA = data;
vm.createContext(context);
vm.runInContext(code, context, {timeout:2000});
const result = vm.runInContext(`['v0','price'].map(mode=>{S.mode=mode; const r=computeScore();
  return {mode,score:+r.total.toFixed(2),verdict:verdictOf(r.total).t,net:r.st.todayNet,
    spread:+r.spread7.toFixed(4)};})`, context);
process.stdout.write(JSON.stringify(result));
