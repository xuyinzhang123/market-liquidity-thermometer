/* 市场流动性温度计 · 股市行情自动更新，流动性数据日期单独保留。 */
window.PBEC_DATA = {
  "date": "2026-11-06",
  "rev": 1,
  "policyRate": 1.25,
  "termPremium": 10,
  "dr001": 1.26,
  "dr007": 1.32,
  "r001": 1.285,
  "r007": 1.355,
  "chg001": -8,
  "chg007": -5,
  "factors": {
    "tax": false,
    "monthEnd": false,
    "quarter": false,
    "festival": false,
    "bond": true,
    "fiscal": false
  },
  "ops": [
    {
      "date": "2026-11-06",
      "type": "7天逆回购",
      "amt": 2575,
      "due": 7720
    },
    {
      "date": "2026-11-05",
      "type": "隔夜逆回购",
      "amt": 2630,
      "due": 3725
    },
    {
      "date": "2026-11-05",
      "type": "买断式逆回购（3个月）",
      "amt": 3000,
      "due": 5000
    }
  ],
  "market": {
    "date": "2026-11-09",
    "amount": 14826.13,
    "prevAmount": 16577.94,
    "prevDate": "2026-11-06",
    "source": "2026-11-09 收盘 · 东方财富沪深指数日线成交额（自动更新；不代表流动性评分已更新）"
  },
  "history": [
    {
      "date": "2026-11-06",
      "score": 40.5,
      "verdict": "中性",
      "dr001": 1.26,
      "dr007": 1.32,
      "spread": -3,
      "net": -5145,
      "amount": null,
      "amountChg": null,
      "estimate": false,
      "note": "央行单日净回笼 5145 亿；DR001 贴政策利率、较月均回落，价格信号显示资金面平稳偏松。"
    },
    {
      "date": "2026-11-05",
      "score": 52.4,
      "verdict": "中性",
      "dr001": 1.26,
      "dr007": 1.32,
      "spread": -3,
      "net": -1095,
      "amount": 21173.89,
      "amountChg": 803.92,
      "estimate": true,
      "note": "央行净回笼 1095 亿；两市成交 21,173.89 亿、较前日 +803.92 亿（+3.9%）；买断式逆回购 3000 亿缩量续作。分数为按当前模型回算。"
    },
    {
      "date": "2026-11-04",
      "score": null,
      "verdict": "—",
      "dr001": 1.2591,
      "dr007": null,
      "spread": null,
      "net": null,
      "amount": 20369.97,
      "amountChg": null,
      "estimate": true,
      "note": "DR001 报 1.2591%，为近 4 个月最低；央行公告将于 11-05 开展 3000 亿买断式逆回购。成交额由 11-05 环比数据倒推，仅供参照。"
    }
  ],
  "marketStats": [
    {
      "date": "2026-11-06",
      "score": 40.5,
      "state": "中性",
      "shPct": -1.14,
      "szPct": -2.22,
      "fundNet": -431.19,
      "amountChg": -3432.95,
      "note": "盘中快照（11:30）：两市主力资金净流出 431.19 亿；成交额较前日同时段 -3,432.95 亿。"
    }
  ]
};
