import urllib.request,urllib.error,json,sys,xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
base=sys.argv[1];origin=sys.argv[2] if len(sys.argv)>2 else None
mode=sys.argv[3] if len(sys.argv)>3 else "preview"
assert mode in ("preview", "indexable"), "Mode must be preview or indexable"
indexable=mode=="indexable"
assert not indexable or origin, "Indexable verification requires canonical origin"
expected_robots="index, follow" if indexable else "noindex, nofollow"
site_paths=["/","/image-aspect-ratio","/video-aspect-ratio","/ultrawide-aspect-ratio-calculator","/about","/contact","/privacy","/terms"]
class P(HTMLParser):
 def __init__(self):super().__init__();self.m=[];self.l=[];self.s=[];self.in_json=False
 def handle_starttag(self,t,a):
  if t=='meta':self.m.append(dict(a))
  if t=='link':self.l.append(dict(a))
  if t=='script' and dict(a).get('type')=='application/ld+json':self.in_json=True;self.s.append('')
 def handle_data(self,data):
  if self.in_json:self.s[-1]+=data
 def handle_endtag(self,t):
  if t=='script':self.in_json=False
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*a):return None
op=urllib.request.build_opener(NoRedirect)
op.addheaders=[("User-Agent", "AspectRatioCanvas-DeploymentCheck/1.0")]
rows=[]
paths=site_paths+['/?utm_source=check','/sitemap.xml','/robots.txt','/image-aspect-ratio/?utm_source=check','/missing-seo-page']
for path in paths:
 try:r=op.open(base+path,timeout=15)
 except urllib.error.HTTPError as ex:r=ex
 body=r.read().decode();p=P();p.feed(body);headers=dict(r.headers);can=[x['href'] for x in p.l if x.get('rel')=='canonical']
 if path.startswith('/missing'):assert r.status==404
 elif path.startswith('/image-aspect-ratio/'):assert r.status==308 and r.headers['Location']=='/image-aspect-ratio?utm_source=check'
 elif path=='/sitemap.xml':
  assert r.status==200 and 'application/xml' in r.headers['Content-Type'];assert [loc.text for loc in ET.fromstring(body).iter('{http://www.sitemaps.org/schemas/sitemap/0.9}loc')]==([origin+p for p in site_paths] if indexable else [])
 elif path=='/robots.txt':assert r.status==200 and 'text/plain' in r.headers['Content-Type'] and 'Allow: /' in body;assert (f'Sitemap: {origin}/sitemap.xml' in body) if origin else ('Sitemap:' not in body)
 else:
  assert r.status==200, (path,r.status,body[:100])
  assert [x.get('content') for x in p.m if x.get('name')=='robots']==[expected_robots]
  assert 'noindex' not in r.headers.get('X-Robots-Tag','').lower() if indexable else r.headers.get('X-Robots-Tag')==expected_robots
  assert can==([origin+path.split('?')[0]] if origin else [])
  assert len(p.s)==1, (path, 'Expected one JSON-LD graph', len(p.s))
  graph=json.loads(p.s[0])['@graph']
  assert graph[0]['@type']=='WebSite' and graph[0]['name']=='Aspect Ratio Calculator'
  assert graph[1]['@type']==('WebPage' if path in ['/about','/contact','/privacy','/terms'] else 'WebApplication')
  assert graph[1].get('url')==(origin+path.split('?')[0] if origin else None)
  assert [x.get('content') for x in p.m if x.get('property')=='og:site_name']==['Aspect Ratio Calculator']
 rows.append(dict(path=path,status=r.status,canonical=can,headers=headers,pass_=True))
for path in ['/sitemap.xml','/robots.txt']:
 r=op.open(urllib.request.Request(base+path,method='HEAD'),timeout=15);assert r.status==200 and not r.read();rows.append(dict(path=path,method='HEAD',status=r.status,pass_=True))
print(json.dumps(rows,indent=2))
