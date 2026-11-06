/* 中国流动性温度计 · 每日数据文件
   由定时自动化任务更新；页面打开时若日期更新会自动采纳。
   单位：利率 %，利差 bp，金额 亿元。amt=操作投放，due=当日到期。 */
window.PBEC_DATA = {
  date: "2026-11-06",
  rev: 1,   /* 同一天修正数据时 +1；页面也支持按内容自动识别，不依赖本字段 */
  policyRate: 1.25,
  termPremium: 10,
  dr001: 1.260,
  dr007: 1.320,
  r001: 1.285,
  r007: 1.355,
  chg001: -8,
  chg007: -5,
  factors: { tax:false, monthEnd:false, quarter:false, festival:false, bond:true, fiscal:false },
  ops: [
    { date:"2026-11-06", type:"7天逆回购", amt:2575, due:7720 },
    { date:"2026-11-05", type:"隔夜逆回购", amt:2630, due:3725 },
    { date:"2026-11-05", type:"买断式逆回购（3个月）", amt:3000, due:5000 }
  ],

  /* A股两市成交额（亿元），prevAmount = 前一交易日全天成交额 */
  market: {
    date: "2026-11-05",
    amount: 21173.89,
    prevAmount: 20369.97,
    prevDate: "2026-11-04",
    source: "2026-11-05 收盘 · 沪深两市成交额 21,173.89 亿（环比 +803.92 亿 / +3.9%）"
  },

  /* 历史快照：score 为按当前 V0 模型回算值（标注 estimate）；缺数据的字段为 null */
  history: [
    { date:"2026-11-06", score:40.5, verdict:"中性", dr001:1.260, dr007:1.320,
      spread:-3.0, net:-5145, amount:null, amountChg:null, estimate:false,
      note:"央行单日净回笼 5145 亿；DR001 贴政策利率、较月均回落，价格信号显示资金面平稳偏松。" },
    { date:"2026-11-05", score:52.4, verdict:"中性", dr001:1.260, dr007:1.320,
      spread:-3.0, net:-1095, amount:21173.89, amountChg:803.92, estimate:true,
      note:"央行净回笼 1095 亿；两市成交 21,173.89 亿、较前日 +803.92 亿（+3.9%）；买断式逆回购 3000 亿缩量续作。分数为按当前模型回算。" },
    { date:"2026-11-04", score:null, verdict:"—", dr001:1.2591, dr007:null,
      spread:null, net:null, amount:20369.97, amountChg:null, estimate:true,
      note:"DR001 报 1.2591%，为近 4 个月最低；央行公告将于 11-05 开展 3000 亿买断式逆回购。成交额由 11-05 环比数据倒推，仅供参照。" }
  ],

  /* 流动性状态 → 市场表现 每日样本（从 2026-11-06 开始积累，页面与自动化共同追加） */
  marketStats: [
    { date:"2026-11-06", score:40.5, state:"中性", shPct:-1.14, szPct:-2.22,
      fundNet:-431.19, amountChg:-3432.95,
      note:"盘中快照（11:30）：两市主力资金净流出 431.19 亿；成交额较前日同时段 -3,432.95 亿。" }
  ]
};
