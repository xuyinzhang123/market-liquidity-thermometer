import importlib.util
import unittest
from datetime import date, timedelta
from pathlib import Path

spec = importlib.util.spec_from_file_location('collector', Path(__file__).with_name('auto-liquidity.py'))
c = importlib.util.module_from_spec(spec)
spec.loader.exec_module(c)


def article(day='2026-11-09', row='<td>隔夜</td><td>1.25%</td><td>1820亿元</td><td>1820亿元</td>', extra=''):
    d = date.fromisoformat(day)
    return f'<meta name="PubDate" content="{day}"><div id="zoom"><p>{d.year}年{d.month}月{d.day}日中国人民银行逆回购操作</p><table><tr><td>期限</td></tr><tr>{row}</tr></table>{extra}打印本页'


def rates(day='2026-11-09'):
    return {'data':{'showDateCN':day+' 17:00'}, 'records':[
        {'date':day[2:], 'productCode':'DR001','weightedRate':'1.3100','latestRate':'9.99'},
        {'date':day[2:], 'productCode':'DR007','weightedRate':'1.3580','latestRate':'9.99'}]}


class CollectorTest(unittest.TestCase):
    def test_actual_award_not_bid(self):
        a = c.parse_announcement(article(row='<td>隔夜</td><td>1.25%</td><td>1900亿元</td><td>1820亿元</td>'),'https://www.pbc.gov.cn/test')
        self.assertEqual(a['rows'][0]['amt'],1820)

    def test_zero_and_prose_overnight(self):
        a=c.parse_announcement(article(row='<td>7天</td><td>0亿元</td><td>0亿元</td>',extra='同时，开展了2580亿元隔夜逆回购操作。'),'url')
        self.assertEqual([(r['term'],r['amt']) for r in a['rows']],[(7,0),(1,2580)])

    def test_unknown_page_is_not_zero_operation(self):
        with self.assertRaises(ValueError): c.parse_announcement('<html>请稍后重试</html>','url')
        with self.assertRaises(ValueError): c.parse_announcement(article(row='<td>未知期限</td>'),'url')

    def test_announcement_date_mismatch(self):
        with self.assertRaises(ValueError): c.parse_announcement(article().replace('2026年11月9日','2026年11月6日'),'url')

    def test_weighted_not_latest_and_no_fake_r(self):
        day,stamp,r=c.parse_rates(rates(),'2026-11-09')
        self.assertEqual(r['dr001'],1.31)
        self.assertIsNone(r['r001'])

    def test_stale_future_duplicate_invalid_rates(self):
        for modify in ('future','duplicate','bad','mismatch'):
            r=rates()
            if modify=='future': r=rates('2026-11-10')
            if modify=='duplicate': r['records'].append(r['records'][0])
            if modify=='bad': r['records'][0]['weightedRate']='NaN'
            if modify=='mismatch': r['records'][0]['date']='26-11-06'
            with self.subTest(modify=modify),self.assertRaises(ValueError): c.parse_rates(r,'2026-11-09')

    def test_missing_history_not_zero(self):
        with self.assertRaises(ValueError): c.parse_history('2026-11-06,,,,,,,1.34\n')

    def fixture(self):
        days=[]
        d=date(2026,10,12)
        while d<=date(2026,11,9):
            if d.weekday()<5: days.append(d.isoformat())
            d+=timedelta(days=1)
        a=[{'date':d,'rows':[{'date':d,'term':1,'amt':1000,'rate':1.25,'url':'url'}], 'url':'url','sha256':'abc'} for d in days]
        h={d:{'dr001':1.28,'dr007':1.36} for d in days}
        return a,h

    def test_weekend_maturity_and_five_days(self):
        a,h=self.fixture()
        ops=c.build_ops(a,'2026-11-09',h)
        self.assertEqual(len({r['date'] for r in ops}),5)
        self.assertEqual(ops[0]['date'],'2026-11-09')
        self.assertEqual(ops[0]['due'],1000)  # Friday overnight matures Monday

    def test_missing_announcement_blocks(self):
        a,h=self.fixture()
        a=[x for x in a if x['date']!='2026-11-05']
        with self.assertRaises(ValueError): c.build_ops(a,'2026-11-09',h)

    def test_missing_long_maturity_history_blocks(self):
        a,h=self.fixture()
        a[0]['rows'][0]['term']=63
        with self.assertRaises(ValueError): c.build_ops(a,'2026-11-09',h)

    def test_trend_and_retry_idempotence(self):
        a,h=self.fixture()
        prev={'date':'2026-11-06','rev':1,'market':{},'history':[],'marketStats':[]}
        out=c.make_snapshot(prev,a,rates(),h,'2026-11-09')
        self.assertEqual(out['chg001'],3.0)
        self.assertEqual(out['chg007'],-0.2)
        self.assertEqual(out['collection']['trendBaseDate'],'2026-11-02')
        self.assertEqual(c.make_snapshot(out,a,rates(),h,'2026-11-09'),out)
        self.assertEqual(prev['date'],'2026-11-06')

    def test_morning_keeps_aligned_previous_day(self):
        a,h=self.fixture()
        prev={'date':'2026-11-06','rev':1,'market':{}}
        out=c.make_snapshot(prev,a,rates('2026-11-06'),h,'2026-11-09')
        self.assertEqual(out['date'],'2026-11-06')
        self.assertTrue(all(r['date']<='2026-11-06' for r in out['ops']))


if __name__ == '__main__': unittest.main()
