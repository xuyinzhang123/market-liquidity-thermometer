#!/usr/bin/env node
/* build-online.js — 中国流动性温度计 · 发布包构建
   用法：node build-online.js
   输入：./liquidity-dashboard.html + ./data.js
   输出：./dist/index.html、./dist/data.js、./dist/online.html
   online.html = index.html 里 <script src="data.js"></script> 内联替换为 data.js 内容。
   路径基于 __dirname，任意工作目录可运行；幂等，可重复执行。
   本文件把源码与数据合并为可分发的单文件页面，供静态托管或离线打开使用。
*/
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SRC_HTML = path.join(ROOT, 'liquidity-dashboard.html');
const SRC_DATA = path.join(ROOT, 'data.js');
const DIST = path.join(ROOT, 'dist');
const TAG = '<script src="data.js"></script>';

const html = fs.readFileSync(SRC_HTML, 'utf8');
const data = fs.readFileSync(SRC_DATA, 'utf8');

if (!/window\.PBEC_DATA\s*=/.test(data)) {
  throw new Error('data.js 缺少 window.PBEC_DATA 定义，构建中止');
}
const hits = html.split(TAG).length - 1;
if (hits !== 1) {
  throw new Error('主页面里 ' + TAG + ' 应恰好出现 1 次，实际 ' + hits + ' 次，构建中止');
}

fs.mkdirSync(DIST, { recursive: true });
fs.writeFileSync(path.join(DIST, 'index.html'), html, 'utf8');
fs.writeFileSync(path.join(DIST, 'data.js'), data, 'utf8');

const safe = data.replace(/<\/script/gi, '<\\/script');
const online = html.replace(TAG, '<script>\n' + safe + '\n</script>');
fs.writeFileSync(path.join(DIST, 'online.html'), online, 'utf8');

const date = (data.match(/date:\s*["'](\d{4}-\d{2}-\d{2})["']/) || [null, '?'])[1];
console.log('[OK] dist/online.html  ' + Buffer.byteLength(online, 'utf8') + ' bytes');
console.log('     data.js 内联 ' + Buffer.byteLength(data, 'utf8') + ' bytes · 数据日期 ' + date);
