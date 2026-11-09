"""Public PBOC + CFETS collector. Python standard library only; fail closed.

The automated operation scope is conventional collateralised reverse repos.
It is explicitly NOT total central-bank liquidity (MLF/outright repos excluded).
"""
import argparse
import csv
import hashlib
import html
import io
import json
import os
import re
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from datetime import date, datetime, timedelta, timezone
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import urljoin

ROOT = Path(__file__).resolve().parent.parent
PBOC = 'https://www.pbc.gov.cn/zhengcehuobisi/125207/125213/125431/125475/index.html'
RATES = 'https://www.chinamoney.com.cn/r/cms/www/chinamoney/data/currency/prr-md.json'
HISTORY = 'https://www.chinamoney.com.cn/r/cms/www/chinamoney/data/currency/prr-chrt.csv'
METHOD = 'auto-repo-v1'
CN = timezone(timedelta(hours=8))


def fetch(url):
    last = None
    for _ in range(3):
        try:
            req = Request(url, headers={'User-Agent': 'Mozilla/5.0', 'Accept': '*/*'})
            with urlopen(req, timeout=18) as response:
                raw = response.read(3_000_001)
                if len(raw) > 3_000_000:
                    raise ValueError('响应过大')
                return raw.decode('utf-8-sig')
        except Exception as error:
            last = error
            time.sleep(0.5)
    raise RuntimeError(f'{url}: {last}')


def text(value):
    return re.sub(r'\s+', '', html.unescape(re.sub(r'<[^>]+>', '', value)))


def number(value, low=0, high=100000):
    if value is None or str(value).strip() in ('', '-', '---'):
        raise ValueError('缺少数值')
    n = float(str(value).replace(',', '').replace('亿元', '').replace('%', ''))
    if not low <= n <= high:
        raise ValueError(f'数值越界: {value}')
    return n


def parse_list(page):
    result = []
    for href, title in re.findall(r'<a\b[^>]*href=["\']([^"\']+)["\'][^>]*>(.*?)</a>', page, re.S | re.I):
        if '公开市场业务交易公告' in text(title) and re.search(r'/\d{17,}/index\.html$', href):
            url = urljoin(PBOC, href)
            if url not in result:
                result.append(url)
    if len(result) < 12:
        raise ValueError('央行公告列表不足，拒绝推测缺失操作日')
    return result


def parse_announcement(page, url):
    match = re.search(r'<meta\s+name=["\']PubDate["\']\s+content=["\'](\d{4}-\d{2}-\d{2})', page, re.I)
    if not match:
        raise ValueError('公告缺少发布日期')
    day = match[1]
    # Only the actual article body, never a meta-description or navigation table.
    body = re.split(r'<div\b[^>]*id=["\']zoom["\'][^>]*>', page, maxsplit=1, flags=re.I)
    if len(body) != 2:
        raise ValueError('公告正文格式变化')
    body = body[1].split('打印本页')[0]
    published_day = re.search(r'(\d{4})年(\d{1,2})月(\d{1,2})日', text(body))
    if not published_day or date(*map(int, published_day.groups())).isoformat() != day:
        raise ValueError(f'公告发布日期与操作日不一致: {url} {day} {text(body)[:180]}')
    rows = []
    for table in re.findall(r'<table\b.*?</table>', body, re.S | re.I):
        if '逆回购' not in text(body) or '期限' not in text(table):
            continue
        for row in re.findall(r'<tr\b.*?</tr>', table, re.S | re.I):
            cells = [text(c) for c in re.findall(r'<t[dh]\b[^>]*>(.*?)</t[dh]>', row, re.S | re.I)]
            if not cells or not re.fullmatch(r'隔夜|\d+天', cells[0]):
                continue
            term = 1 if cells[0] == '隔夜' else int(cells[0][:-1])
            if term not in (1, 7, 14, 28, 63):
                raise ValueError('未知逆回购期限')
            rates = [number(c, 0, 10) for c in cells[1:] if '%' in c]
            amounts = [number(c) for c in cells[1:] if '亿元' in c]
            if not amounts:
                raise ValueError('公告缺少中标量')
            rows.append({'date': day, 'term': term, 'amt': amounts[-1], 'rate': rates[-1] if rates else None, 'url': url})
    overnight = re.search(r'开展了([\d,.]+)亿元隔夜逆回购操作', text(body))
    if overnight and not any(r['term'] == 1 for r in rows):
        rows.append({'date':day,'term':1,'amt':number(overnight[1]),'rate':None,'url':url})
    if not rows:
        raise ValueError('公告没有可验证的常规逆回购行（不把解析失败当作零投放）')
    if len({r['term'] for r in rows}) != len(rows):
        raise ValueError('公告期限重复')
    return {'date': day, 'rows': rows, 'url': url, 'sha256': hashlib.sha256(json.dumps(rows,sort_keys=True).encode()).hexdigest()}


def parse_rates(payload, today):
    stamp = payload.get('data', {}).get('showDateCN', '')
    if not re.fullmatch(r'\d{4}-\d{2}-\d{2} \d{2}:\d{2}', stamp):
        raise ValueError('利率缺少明确时间')
    day = stamp[:10]
    if day > today:
        raise ValueError('利率日期在未来')
    records = payload.get('records', [])
    result = {}
    for code in ('DR001', 'DR007'):
        matches = [r for r in records if r.get('productCode') == code]
        if len(matches) != 1 or '20' + matches[0].get('date', '') != day:
            raise ValueError('利率明细与时间戳不一致或品种重复')
        result[code.lower()] = number(matches[0].get('weightedRate'), 0, 10)
    # R and DR must never be substituted for one another.
    for code in ('R001', 'R007'):
        rows = [r for r in records if r.get('productCode') == code]
        result[code.lower()] = number(rows[0]['weightedRate'], 0, 10) if len(rows) == 1 and '20'+rows[0].get('date','') == day else None
    return day, stamp, result


def parse_history(value):
    rows = {}
    for row in csv.reader(io.StringIO(value)):
        if not row or not re.fullmatch(r'\d{4}-\d{2}-\d{2}', row[0]):
            continue
        date.fromisoformat(row[0])
        if len(row) < 8:
            raise ValueError('DR 历史列数变化')
        item = {'dr001': number(row[6], 0, 10), 'dr007': number(row[7], 0, 10)}
        if row[0] in rows:
            raise ValueError('DR 历史日期重复')
        rows[row[0]] = item
    if len(rows) < 6:
        raise ValueError('DR 历史不足六个交易日')
    return rows


def build_ops(announcements, target, rate_history):
    by_day = {a['date']: a for a in announcements if a['date'] <= target}
    days = sorted(by_day)
    window = days[-5:]
    if len(window) != 5 or window[-1] != target:
        raise ValueError('缺少五个操作日')
    # CFETS trading dates cross-check PBOC list; never silently skip a missing article.
    expected = sorted(d for d in rate_history if d <= target)[-5:]
    if expected != window:
        raise ValueError('央行公告操作日与资金利率交易日不一致')
    if (date.fromisoformat(window[0]) - date.fromisoformat(days[0])).days < 14:
        raise ValueError('到期计算的公告回溯区间不足14天')
    ops = {(d, r['term']): {'date': d, 'type': '隔夜逆回购' if r['term'] == 1 else f"{r['term']}天逆回购", 'amt': r['amt'], 'due': 0}
           for d in window for r in by_day[d]['rows']}
    for d in days:
        for r in by_day[d]['rows']:
            nominal = (date.fromisoformat(d) + timedelta(days=r['term'])).isoformat()
            due_day = next((x for x in days if x >= nominal), None)
            if due_day in window:
                # Holidays/weekends roll to the next observed PBOC business date.
                key = due_day, r['term']
                ops.setdefault(key, {'date': due_day, 'type': '隔夜逆回购' if r['term'] == 1 else f"{r['term']}天逆回购", 'amt': 0, 'due': 0})
                ops[key]['due'] += r['amt']
            if r['term'] > 14 and nominal >= window[0]:
                raise ValueError('发现长周期质押逆回购，需要扩展到期回溯区间')
    return sorted(ops.values(), key=lambda o: (o['date'], o['type']), reverse=True)


def calendar(day):
    d = date.fromisoformat(day)
    last = (d.replace(day=28) + timedelta(days=4)).replace(day=1) - timedelta(days=1)
    return {'tax': 14 <= d.day <= 18, 'monthEnd': (last-d).days <= 3,
            'quarter': d.month in (3,6,9,12) and (last-d).days <= 3,
            'festival': False, 'bond': False, 'fiscal': False}


def make_snapshot(previous, announcements, rates, history, today):
    day, stamp, values = parse_rates(rates, today)
    history = dict(history)
    history[day] = {k: values[k] for k in ('dr001','dr007')}
    if day < previous['date']:
        raise ValueError('拒绝用较旧利率覆盖已发布数据')
    if day not in {a['date'] for a in announcements}:
        raise ValueError('尚无与资金利率同日的央行公告')
    window = sorted(d for d in history if d <= day)
    if len(window) < 6:
        raise ValueError('缺少五交易日前基准')
    base_day = window[-6]
    same_day = next(a for a in announcements if a['date'] == day)
    # Current regime: overnight policy rate; use 7D only for dates before the switch.
    overnight = [r for r in same_day['rows'] if r['term'] == 1]
    if not overnight or overnight[0]['rate'] is None:
        raise ValueError('当日公告缺少隔夜政策利率，拒绝沿用旧锚')
    out = json.loads(json.dumps(previous))
    out.update(values)
    out.update(date=day, policyRate=overnight[0]['rate'], termPremium=previous.get('termPremium',10),
               ops=build_ops(announcements, day, history), factors=calendar(day))
    for k in ('dr001','dr007'):
        out['chg'+k[2:]] = round((values[k] - history[base_day][k])*100, 4)
    out['collection'] = {
        'method': METHOD, 'rateTime': stamp, 'ratePhase': '日终' if stamp[11:16] >= '17:00' else '盘中',
        'trendBaseDate': base_day,
        'operationScope': '常规质押逆回购（隔夜及有公告的其他期限）；不含买断式逆回购、MLF、国库现金定存与国债买卖',
        'factorScope': '税期14–18日、月/季末最后4个自然日为日历假设；春节、政府债和财政因素未自动判定，取中性',
        'missingOptional': [k.upper() for k in ('r001','r007') if values[k] is None],
        'sources': {'rates':RATES,'rateHistory':HISTORY,'operations':PBOC},
        'announcements': [{'date':a['date'],'url':a['url'],'sha256':a['sha256']} for a in announcements],
    }
    # Do not churn revisions on identical retries.
    changed = any(out.get(k) != previous.get(k) for k in ('date','policyRate','dr001','dr007','r001','r007','chg001','chg007','ops','factors','collection'))
    out['rev'] = (previous.get('rev',1)+1 if day == previous['date'] else 1) if changed else previous.get('rev',1)
    return out


def read_snapshot():
    # Existing data.js is JS, so use Node to read local trusted repository data.
    command = "const fs=require('fs'),vm=require('vm');const c={window:{}};vm.runInNewContext(fs.readFileSync('data.js','utf8'),c);process.stdout.write(JSON.stringify(c.window.PBEC_DATA));"
    return json.loads(subprocess.check_output(['node','-e',command],cwd=ROOT,text=True,encoding='utf-8'))


def atomic(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    temp = path.with_suffix(path.suffix+'.tmp')
    temp.write_text(content, encoding='utf-8')
    os.replace(temp,path)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--dry-run', action='store_true')
    args = parser.parse_args()
    today = datetime.now(CN).date().isoformat()
    previous = read_snapshot()
    status = {'attemptDate':today,'lastScoreDate':previous['date'],'state':'waiting','missing':[]}
    try:
        with ThreadPoolExecutor(max_workers=3) as pool:
            fetched = list(pool.map(fetch,[PBOC,RATES,HISTORY]))
        urls = parse_list(fetched[0])
        with ThreadPoolExecutor(max_workers=4) as pool:
            announcements = list(pool.map(lambda u:parse_announcement(fetch(u),u),urls))
        if any(a['date'] > today for a in announcements):
            raise ValueError('央行公告日期在未来')
        latest = max(announcements,key=lambda a:a['date'])
        status['latestAnnouncement'] = {'date':latest['date'],'url':latest['url'], 'operations':latest['rows']}
        out = make_snapshot(previous, announcements, json.loads(fetched[1]), parse_history(fetched[2]), today)
        scored = json.loads(subprocess.check_output(['node',str(ROOT/'scripts/score-snapshot.cjs')],input=json.dumps(out),cwd=ROOT,text=True,encoding='utf-8'))
        # History is recorded by method + date + mode, never paired with a different market date.
        for result in scored:
            record = {'date':out['date'], **result, 'dr001':out['dr001'],'dr007':out['dr007'],
                      'estimate':False,'method':METHOD,'note':out['collection']['operationScope']+'；'+out['collection']['rateTime']+' 加权利率，'+out['collection']['ratePhase']}
            out['history'] = [h for h in out.get('history',[]) if (h['date'],h.get('mode','v0')) != (record['date'],record['mode'])] + [record]
            stats = {'date':out['date'],'mode':result['mode'],'method':METHOD,'score':result['score'],
                     'state':'宽松' if result['score']>=60 else ('中性' if result['score']>=40 else '偏紧'),
                     'shPct':None,'szPct':None,'fundNet':None,'amountChg':None,
                     'note':'自动评分样本；市场表现未采集，不以其他日期行情配对'}
            old = next((s for s in out.get('marketStats',[]) if s['date']==stats['date'] and s.get('mode','v0')==stats['mode']),{})
            for k in ('shPct','szPct','fundNet','amountChg'):
                if old.get(k) is not None: stats[k] = old[k]
            out['marketStats'] = [s for s in out.get('marketStats',[]) if (s['date'],s.get('mode','v0')) != (stats['date'],stats['mode'])] + [stats]
        out['history'] = sorted(out['history'],key=lambda h:h['date'])[-120:]
        out['marketStats'] = sorted(out['marketStats'],key=lambda h:h['date'])[-240:]
        status.update(state='updated' if out['date']==today else 'waiting',lastScoreDate=out['date'],rateTime=out['collection']['rateTime'])
        if out['date'] != today:
            status['missing'] = ['当天 DR001/DR007 加权利率尚未发布；保留最近同日完整快照']
        if args.dry_run:
            print(json.dumps({'status':status,'snapshot':out},ensure_ascii=False,indent=2))
            return
        if out != previous:
            atomic(ROOT/'data.js','/* 自动采集：来源、时间、口径见 collection；不把旧数据标成当天。 */\nwindow.PBEC_DATA = '+json.dumps(out,ensure_ascii=False,indent=2)+';\n')
        atomic(ROOT/'data/collection-status.json',json.dumps(status,ensure_ascii=False,indent=2)+'\n')
        print(json.dumps({'status':status,'scores':scored},ensure_ascii=False))
    except Exception as error:
        status.update(state='error',missing=[str(error)])
        print('评分采集中止，保留原快照：'+str(error),file=sys.stderr)
        if not args.dry_run:
            atomic(ROOT/'data/collection-status.json',json.dumps(status,ensure_ascii=False,indent=2)+'\n')
        sys.exit(1)


if __name__ == '__main__':
    main()
