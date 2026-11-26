/* 市场流动性温度计 · 股市行情自动更新，流动性数据日期单独保留。 */
window.PBEC_DATA = {
  "date": "2026-11-23",
  "rev": 1,
  "policyRate": 1.25,
  "termPremium": 10,
  "dr001": 1.2621,
  "dr007": 1.372,
  "r001": null,
  "r007": null,
  "chg001": -3.97,
  "chg007": -2.4,
  "factors": {
    "tax": false,
    "monthEnd": false,
    "quarter": false,
    "festival": false,
    "bond": false,
    "fiscal": false
  },
  "ops": [
    {
      "date": "2026-11-23",
      "type": "隔夜逆回购",
      "amt": 4995,
      "due": 3795
    },
    {
      "date": "2026-11-20",
      "type": "隔夜逆回购",
      "amt": 3795,
      "due": 7675
    },
    {
      "date": "2026-11-19",
      "type": "隔夜逆回购",
      "amt": 7675,
      "due": 7002
    },
    {
      "date": "2026-11-18",
      "type": "隔夜逆回购",
      "amt": 7002,
      "due": 7140
    },
    {
      "date": "2026-11-17",
      "type": "隔夜逆回购",
      "amt": 7140,
      "due": 4600
    }
  ],
  "market": {
    "date": "2026-11-26",
    "amount": 13173.77,
    "prevAmount": 13830.98,
    "prevDate": "2026-11-25",
    "source": "2026-11-26 收盘 · 东方财富沪深指数日线成交额（自动更新；不代表流动性评分已更新）"
  },
  "history": [
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
      "date": "2026-11-09",
      "mode": "v0",
      "score": 33.8,
      "verdict": "偏紧",
      "net": -440,
      "spread": 0.8,
      "dr001": 1.31,
      "dr007": 1.358,
      "estimate": false,
      "method": "auto-repo-v1",
      "note": "常规质押逆回购（隔夜及有公告的其他期限）；不含买断式逆回购、MLF、国库现金定存与国债买卖；2026-11-09 17:00 加权利率，日终"
    },
    {
      "date": "2026-11-09",
      "mode": "price",
      "score": 41,
      "verdict": "中性",
      "net": -440,
      "spread": 0.8,
      "dr001": 1.31,
      "dr007": 1.358,
      "estimate": false,
      "method": "auto-repo-v1",
      "note": "常规质押逆回购（隔夜及有公告的其他期限）；不含买断式逆回购、MLF、国库现金定存与国债买卖；2026-11-09 17:00 加权利率，日终"
    },
    {
      "date": "2026-11-10",
      "mode": "v0",
      "score": 37.31,
      "verdict": "偏紧",
      "net": 80,
      "spread": -0.07,
      "dr001": 1.3201,
      "dr007": 1.3493,
      "estimate": false,
      "method": "auto-repo-v1",
      "note": "常规质押逆回购（隔夜及有公告的其他期限）；不含买断式逆回购、MLF、国库现金定存与国债买卖；2026-11-10 17:00 加权利率，日终"
    },
    {
      "date": "2026-11-10",
      "mode": "price",
      "score": 43.04,
      "verdict": "中性",
      "net": 80,
      "spread": -0.07,
      "dr001": 1.3201,
      "dr007": 1.3493,
      "estimate": false,
      "method": "auto-repo-v1",
      "note": "常规质押逆回购（隔夜及有公告的其他期限）；不含买断式逆回购、MLF、国库现金定存与国债买卖；2026-11-10 17:00 加权利率，日终"
    },
    {
      "date": "2026-11-11",
      "mode": "v0",
      "score": 39.09,
      "verdict": "偏紧",
      "net": -30,
      "spread": 4.18,
      "dr001": 1.327,
      "dr007": 1.3918,
      "estimate": false,
      "method": "auto-repo-v1",
      "note": "常规质押逆回购（隔夜及有公告的其他期限）；不含买断式逆回购、MLF、国库现金定存与国债买卖；2026-11-11 17:00 加权利率，日终"
    },
    {
      "date": "2026-11-11",
      "mode": "price",
      "score": 38.87,
      "verdict": "偏紧",
      "net": -30,
      "spread": 4.18,
      "dr001": 1.327,
      "dr007": 1.3918,
      "estimate": false,
      "method": "auto-repo-v1",
      "note": "常规质押逆回购（隔夜及有公告的其他期限）；不含买断式逆回购、MLF、国库现金定存与国债买卖；2026-11-11 17:00 加权利率，日终"
    },
    {
      "date": "2026-11-12",
      "mode": "v0",
      "score": 43.72,
      "verdict": "中性",
      "net": 1970,
      "spread": 4.6,
      "dr001": 1.3256,
      "dr007": 1.396,
      "estimate": false,
      "method": "auto-repo-v1",
      "note": "常规质押逆回购（隔夜及有公告的其他期限）；不含买断式逆回购、MLF、国库现金定存与国债买卖；2026-11-12 17:00 加权利率，日终"
    },
    {
      "date": "2026-11-12",
      "mode": "price",
      "score": 40.83,
      "verdict": "中性",
      "net": 1970,
      "spread": 4.6,
      "dr001": 1.3256,
      "dr007": 1.396,
      "estimate": false,
      "method": "auto-repo-v1",
      "note": "常规质押逆回购（隔夜及有公告的其他期限）；不含买断式逆回购、MLF、国库现金定存与国债买卖；2026-11-12 17:00 加权利率，日终"
    },
    {
      "date": "2026-11-13",
      "mode": "v0",
      "score": 49.29,
      "verdict": "中性",
      "net": -200,
      "spread": 2.23,
      "dr001": 1.2926,
      "dr007": 1.3723,
      "estimate": false,
      "method": "auto-repo-v1",
      "note": "常规质押逆回购（隔夜及有公告的其他期限）；不含买断式逆回购、MLF、国库现金定存与国债买卖；2026-11-13 17:00 加权利率，日终"
    },
    {
      "date": "2026-11-13",
      "mode": "price",
      "score": 47.38,
      "verdict": "中性",
      "net": -200,
      "spread": 2.23,
      "dr001": 1.2926,
      "dr007": 1.3723,
      "estimate": false,
      "method": "auto-repo-v1",
      "note": "常规质押逆回购（隔夜及有公告的其他期限）；不含买断式逆回购、MLF、国库现金定存与国债买卖；2026-11-13 17:00 加权利率，日终"
    },
    {
      "date": "2026-11-16",
      "mode": "v0",
      "score": 47.29,
      "verdict": "中性",
      "net": 960,
      "spread": 4.6,
      "dr001": 1.3018,
      "dr007": 1.396,
      "estimate": false,
      "method": "auto-repo-v1",
      "note": "常规质押逆回购（隔夜及有公告的其他期限）；不含买断式逆回购、MLF、国库现金定存与国债买卖；2026-11-16 17:00 加权利率，日终"
    },
    {
      "date": "2026-11-16",
      "mode": "price",
      "score": 43.64,
      "verdict": "中性",
      "net": 960,
      "spread": 4.6,
      "dr001": 1.3018,
      "dr007": 1.396,
      "estimate": false,
      "method": "auto-repo-v1",
      "note": "常规质押逆回购（隔夜及有公告的其他期限）；不含买断式逆回购、MLF、国库现金定存与国债买卖；2026-11-16 17:00 加权利率，日终"
    },
    {
      "date": "2026-11-17",
      "mode": "v0",
      "score": 49.81,
      "verdict": "中性",
      "net": 2540,
      "spread": 5.86,
      "dr001": 1.3035,
      "dr007": 1.4086,
      "estimate": false,
      "method": "auto-repo-v1",
      "note": "常规质押逆回购（隔夜及有公告的其他期限）；不含买断式逆回购、MLF、国库现金定存与国债买卖；2026-11-17 17:00 加权利率，日终"
    },
    {
      "date": "2026-11-17",
      "mode": "price",
      "score": 43.71,
      "verdict": "中性",
      "net": 2540,
      "spread": 5.86,
      "dr001": 1.3035,
      "dr007": 1.4086,
      "estimate": false,
      "method": "auto-repo-v1",
      "note": "常规质押逆回购（隔夜及有公告的其他期限）；不含买断式逆回购、MLF、国库现金定存与国债买卖；2026-11-17 17:00 加权利率，日终"
    },
    {
      "date": "2026-11-18",
      "mode": "v0",
      "score": 54.17,
      "verdict": "中性",
      "net": -138,
      "spread": 3.5,
      "dr001": 1.2892,
      "dr007": 1.385,
      "estimate": false,
      "method": "auto-repo-v1",
      "note": "常规质押逆回购（隔夜及有公告的其他期限）；不含买断式逆回购、MLF、国库现金定存与国债买卖；2026-11-18 17:00 加权利率，日终"
    },
    {
      "date": "2026-11-18",
      "mode": "price",
      "score": 49.3,
      "verdict": "中性",
      "net": -138,
      "spread": 3.5,
      "dr001": 1.2892,
      "dr007": 1.385,
      "estimate": false,
      "method": "auto-repo-v1",
      "note": "常规质押逆回购（隔夜及有公告的其他期限）；不含买断式逆回购、MLF、国库现金定存与国债买卖；2026-11-18 17:00 加权利率，日终"
    },
    {
      "date": "2026-11-19",
      "mode": "v0",
      "score": 58.15,
      "verdict": "中性",
      "net": 673,
      "spread": 0.92,
      "dr001": 1.2554,
      "dr007": 1.3592,
      "estimate": false,
      "method": "auto-repo-v1",
      "note": "常规质押逆回购（隔夜及有公告的其他期限）；不含买断式逆回购、MLF、国库现金定存与国债买卖；2026-11-19 17:00 加权利率，日终"
    },
    {
      "date": "2026-11-19",
      "mode": "price",
      "score": 55.39,
      "verdict": "中性",
      "net": 673,
      "spread": 0.92,
      "dr001": 1.2554,
      "dr007": 1.3592,
      "estimate": false,
      "method": "auto-repo-v1",
      "note": "常规质押逆回购（隔夜及有公告的其他期限）；不含买断式逆回购、MLF、国库现金定存与国债买卖；2026-11-19 17:00 加权利率，日终"
    },
    {
      "date": "2026-11-20",
      "mode": "v0",
      "score": 49.82,
      "verdict": "中性",
      "net": -3880,
      "spread": 1.39,
      "dr001": 1.2629,
      "dr007": 1.3639,
      "estimate": false,
      "method": "auto-repo-v1",
      "note": "常规质押逆回购（隔夜及有公告的其他期限）；不含买断式逆回购、MLF、国库现金定存与国债买卖；2026-11-20 17:00 加权利率，日终"
    },
    {
      "date": "2026-11-20",
      "mode": "price",
      "score": 49.58,
      "verdict": "中性",
      "net": -3880,
      "spread": 1.39,
      "dr001": 1.2629,
      "dr007": 1.3639,
      "estimate": false,
      "method": "auto-repo-v1",
      "note": "常规质押逆回购（隔夜及有公告的其他期限）；不含买断式逆回购、MLF、国库现金定存与国债买卖；2026-11-20 17:00 加权利率，日终"
    },
    {
      "date": "2026-11-23",
      "mode": "v0",
      "score": 50.05,
      "verdict": "中性",
      "net": 1200,
      "spread": 2.2,
      "dr001": 1.2621,
      "dr007": 1.372,
      "estimate": false,
      "method": "auto-repo-v1",
      "note": "常规质押逆回购（隔夜及有公告的其他期限）；不含买断式逆回购、MLF、国库现金定存与国债买卖；2026-11-23 17:00 加权利率，日终"
    },
    {
      "date": "2026-11-23",
      "mode": "price",
      "score": 49.57,
      "verdict": "中性",
      "net": 1200,
      "spread": 2.2,
      "dr001": 1.2621,
      "dr007": 1.372,
      "estimate": false,
      "method": "auto-repo-v1",
      "note": "常规质押逆回购（隔夜及有公告的其他期限）；不含买断式逆回购、MLF、国库现金定存与国债买卖；2026-11-23 17:00 加权利率，日终"
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
    },
    {
      "date": "2026-11-09",
      "mode": "v0",
      "method": "auto-repo-v1",
      "score": 33.8,
      "state": "偏紧",
      "shPct": null,
      "szPct": null,
      "fundNet": null,
      "amountChg": null,
      "note": "自动评分样本；市场表现未采集，不以其他日期行情配对"
    },
    {
      "date": "2026-11-09",
      "mode": "price",
      "method": "auto-repo-v1",
      "score": 41,
      "state": "中性",
      "shPct": null,
      "szPct": null,
      "fundNet": null,
      "amountChg": null,
      "note": "自动评分样本；市场表现未采集，不以其他日期行情配对"
    },
    {
      "date": "2026-11-10",
      "mode": "v0",
      "method": "auto-repo-v1",
      "score": 37.31,
      "state": "偏紧",
      "shPct": null,
      "szPct": null,
      "fundNet": null,
      "amountChg": null,
      "note": "自动评分样本；市场表现未采集，不以其他日期行情配对"
    },
    {
      "date": "2026-11-10",
      "mode": "price",
      "method": "auto-repo-v1",
      "score": 43.04,
      "state": "中性",
      "shPct": null,
      "szPct": null,
      "fundNet": null,
      "amountChg": null,
      "note": "自动评分样本；市场表现未采集，不以其他日期行情配对"
    },
    {
      "date": "2026-11-11",
      "mode": "v0",
      "method": "auto-repo-v1",
      "score": 39.09,
      "state": "偏紧",
      "shPct": null,
      "szPct": null,
      "fundNet": null,
      "amountChg": null,
      "note": "自动评分样本；市场表现未采集，不以其他日期行情配对"
    },
    {
      "date": "2026-11-11",
      "mode": "price",
      "method": "auto-repo-v1",
      "score": 38.87,
      "state": "偏紧",
      "shPct": null,
      "szPct": null,
      "fundNet": null,
      "amountChg": null,
      "note": "自动评分样本；市场表现未采集，不以其他日期行情配对"
    },
    {
      "date": "2026-11-12",
      "mode": "v0",
      "method": "auto-repo-v1",
      "score": 43.72,
      "state": "中性",
      "shPct": null,
      "szPct": null,
      "fundNet": null,
      "amountChg": null,
      "note": "自动评分样本；市场表现未采集，不以其他日期行情配对"
    },
    {
      "date": "2026-11-12",
      "mode": "price",
      "method": "auto-repo-v1",
      "score": 40.83,
      "state": "中性",
      "shPct": null,
      "szPct": null,
      "fundNet": null,
      "amountChg": null,
      "note": "自动评分样本；市场表现未采集，不以其他日期行情配对"
    },
    {
      "date": "2026-11-13",
      "mode": "v0",
      "method": "auto-repo-v1",
      "score": 49.29,
      "state": "中性",
      "shPct": null,
      "szPct": null,
      "fundNet": null,
      "amountChg": null,
      "note": "自动评分样本；市场表现未采集，不以其他日期行情配对"
    },
    {
      "date": "2026-11-13",
      "mode": "price",
      "method": "auto-repo-v1",
      "score": 47.38,
      "state": "中性",
      "shPct": null,
      "szPct": null,
      "fundNet": null,
      "amountChg": null,
      "note": "自动评分样本；市场表现未采集，不以其他日期行情配对"
    },
    {
      "date": "2026-11-16",
      "mode": "v0",
      "method": "auto-repo-v1",
      "score": 47.29,
      "state": "中性",
      "shPct": null,
      "szPct": null,
      "fundNet": null,
      "amountChg": null,
      "note": "自动评分样本；市场表现未采集，不以其他日期行情配对"
    },
    {
      "date": "2026-11-16",
      "mode": "price",
      "method": "auto-repo-v1",
      "score": 43.64,
      "state": "中性",
      "shPct": null,
      "szPct": null,
      "fundNet": null,
      "amountChg": null,
      "note": "自动评分样本；市场表现未采集，不以其他日期行情配对"
    },
    {
      "date": "2026-11-17",
      "mode": "v0",
      "method": "auto-repo-v1",
      "score": 49.81,
      "state": "中性",
      "shPct": null,
      "szPct": null,
      "fundNet": null,
      "amountChg": null,
      "note": "自动评分样本；市场表现未采集，不以其他日期行情配对"
    },
    {
      "date": "2026-11-17",
      "mode": "price",
      "method": "auto-repo-v1",
      "score": 43.71,
      "state": "中性",
      "shPct": null,
      "szPct": null,
      "fundNet": null,
      "amountChg": null,
      "note": "自动评分样本；市场表现未采集，不以其他日期行情配对"
    },
    {
      "date": "2026-11-18",
      "mode": "v0",
      "method": "auto-repo-v1",
      "score": 54.17,
      "state": "中性",
      "shPct": null,
      "szPct": null,
      "fundNet": null,
      "amountChg": null,
      "note": "自动评分样本；市场表现未采集，不以其他日期行情配对"
    },
    {
      "date": "2026-11-18",
      "mode": "price",
      "method": "auto-repo-v1",
      "score": 49.3,
      "state": "中性",
      "shPct": null,
      "szPct": null,
      "fundNet": null,
      "amountChg": null,
      "note": "自动评分样本；市场表现未采集，不以其他日期行情配对"
    },
    {
      "date": "2026-11-19",
      "mode": "v0",
      "method": "auto-repo-v1",
      "score": 58.15,
      "state": "中性",
      "shPct": null,
      "szPct": null,
      "fundNet": null,
      "amountChg": null,
      "note": "自动评分样本；市场表现未采集，不以其他日期行情配对"
    },
    {
      "date": "2026-11-19",
      "mode": "price",
      "method": "auto-repo-v1",
      "score": 55.39,
      "state": "中性",
      "shPct": null,
      "szPct": null,
      "fundNet": null,
      "amountChg": null,
      "note": "自动评分样本；市场表现未采集，不以其他日期行情配对"
    },
    {
      "date": "2026-11-20",
      "mode": "v0",
      "method": "auto-repo-v1",
      "score": 49.82,
      "state": "中性",
      "shPct": null,
      "szPct": null,
      "fundNet": null,
      "amountChg": null,
      "note": "自动评分样本；市场表现未采集，不以其他日期行情配对"
    },
    {
      "date": "2026-11-20",
      "mode": "price",
      "method": "auto-repo-v1",
      "score": 49.58,
      "state": "中性",
      "shPct": null,
      "szPct": null,
      "fundNet": null,
      "amountChg": null,
      "note": "自动评分样本；市场表现未采集，不以其他日期行情配对"
    },
    {
      "date": "2026-11-23",
      "mode": "v0",
      "method": "auto-repo-v1",
      "score": 50.05,
      "state": "中性",
      "shPct": null,
      "szPct": null,
      "fundNet": null,
      "amountChg": null,
      "note": "自动评分样本；市场表现未采集，不以其他日期行情配对"
    },
    {
      "date": "2026-11-23",
      "mode": "price",
      "method": "auto-repo-v1",
      "score": 49.57,
      "state": "中性",
      "shPct": null,
      "szPct": null,
      "fundNet": null,
      "amountChg": null,
      "note": "自动评分样本；市场表现未采集，不以其他日期行情配对"
    }
  ],
  "collection": {
    "method": "auto-repo-v1",
    "rateTime": "2026-11-23 17:00",
    "ratePhase": "日终",
    "trendBaseDate": "2026-11-16",
    "operationScope": "常规质押逆回购（隔夜及有公告的其他期限）；不含买断式逆回购、MLF、国库现金定存与国债买卖",
    "factorScope": "税期14–18日、月/季末最后4个自然日为日历假设；春节、政府债和财政因素未自动判定，取中性",
    "missingOptional": [
      "R001",
      "R007"
    ],
    "sources": {
      "rates": "https://www.chinamoney.com.cn/r/cms/www/chinamoney/data/currency/prr-md.json",
      "rateHistory": "https://www.chinamoney.com.cn/r/cms/www/chinamoney/data/currency/prr-chrt.csv",
      "operations": "https://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125431/125475/index.html"
    },
    "announcements": [
      {
        "date": "2026-11-23",
        "url": "https://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125431/125475/2026112309000142020/index.html",
        "sha256": "8a839bde513fc4c02a7278ef5476c68b41be1888513f43f5ae31e7bbcaa62ade"
      },
      {
        "date": "2026-11-20",
        "url": "https://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125431/125475/2026112008523941940/index.html",
        "sha256": "2591d8194a91b775f28a305346aee8e56020ca24e04d9c8f342d1690b0f79e0c"
      },
      {
        "date": "2026-11-19",
        "url": "https://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125431/125475/2026111908555223899/index.html",
        "sha256": "3ab5e8fceafdd42feb7288d17b66b68c05bc7eabf9e0ccc8776603e4e1e24d06"
      },
      {
        "date": "2026-11-18",
        "url": "https://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125431/125475/2026111808511557962/index.html",
        "sha256": "fd7ebb58873f3e41d044b4fff9dced5ffe5ddc7274caf44a0c55770a2625b942"
      },
      {
        "date": "2026-11-17",
        "url": "https://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125431/125475/2026111708520297433/index.html",
        "sha256": "e9f424e8619c80810f554d27d7ae3c330600673c2b54dd6d5ecfcfcd885fde8d"
      },
      {
        "date": "2026-11-16",
        "url": "https://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125431/125475/2026111609020776084/index.html",
        "sha256": "9413f756ad6336b0f4078c394a9e5eae1d4d77dda54d4d3d27b2b99892642761"
      },
      {
        "date": "2026-11-13",
        "url": "https://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125431/125475/2026111308562844801/index.html",
        "sha256": "927b599e62a43573c7f2dbab66b966c1dd529311d5391b867f113d49dcc9fbf4"
      },
      {
        "date": "2026-11-12",
        "url": "https://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125431/125475/2026111208502561107/index.html",
        "sha256": "4398c2b553096f6b9dd4f0e18daf430c064f703a484904dfb6fcd47ba3dddf19"
      },
      {
        "date": "2026-11-11",
        "url": "https://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125431/125475/2026111108534983582/index.html",
        "sha256": "647e2a2540d54dfd602f15f211a6a036633d172d80669af050834c040538a025"
      },
      {
        "date": "2026-11-10",
        "url": "https://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125431/125475/2026111008535086262/index.html",
        "sha256": "8aa60c083da73c587c727ee3bfe5590810b8fcc03da5d814a3f717c221cd4de8"
      },
      {
        "date": "2026-11-09",
        "url": "https://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125431/125475/2026110908582629771/index.html",
        "sha256": "0f17006c4f865655d104dc0740f31dbcd6dcacf14d5ab6ed8553f3a2b5eb5c4e"
      },
      {
        "date": "2026-11-06",
        "url": "https://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125431/125475/2026110609100813149/index.html",
        "sha256": "c01470c56458c9f630c5c7572b0797288777fc00d2e1bd5a68f6061a9293d90e"
      },
      {
        "date": "2026-11-05",
        "url": "https://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125431/125475/2026110509101362150/index.html",
        "sha256": "d09eb75b3dbd67ff64aa6fdee92883105c4cdf4d565b259d5b36220e08332af2"
      },
      {
        "date": "2026-11-04",
        "url": "https://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125431/125475/2026110408563592581/index.html",
        "sha256": "65b77e7666f21290abfc4f07c64d39803c7728528ac61b4d7ca12e2abb675af3"
      },
      {
        "date": "2026-11-03",
        "url": "https://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125431/125475/2026110309140391220/index.html",
        "sha256": "f30ac86ff391cf0561a83d12f82d5616c6aac92848849ba42d4abd17da24e7c5"
      },
      {
        "date": "2026-11-02",
        "url": "https://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125431/125475/2026110208540841613/index.html",
        "sha256": "265433791f3f215b2f5cecfd6c7e4718dde228f10f9750634a5423f8745a37a6"
      },
      {
        "date": "2026-10-30",
        "url": "https://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125431/125475/2026103008462393538/index.html",
        "sha256": "35739d40ba49a9cf03980ca0b297cd65d0d6d59ec6ed49e3d9a87712b322d5fd"
      },
      {
        "date": "2026-10-29",
        "url": "https://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125431/125475/2026102908501935376/index.html",
        "sha256": "383470d77e562b1aaf50c257e88dcedc49c7aa281b63b62f2704c112030a1a5a"
      },
      {
        "date": "2026-10-28",
        "url": "https://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125431/125475/2026102808465912088/index.html",
        "sha256": "5586821af9af0f810bb8affae5b26b2c984d70ea68c68b5d60759ccab24dced0"
      },
      {
        "date": "2026-10-27",
        "url": "https://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125431/125475/2026102708510355509/index.html",
        "sha256": "a2e020ab07aef997fe37a3e272902b4d02b7b92a729ff78259da3cd6fe277020"
      }
    ]
  }
};
