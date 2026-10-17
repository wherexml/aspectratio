import urllib.request,urllib.error,json,sys,xml.etree.ElementTree as ET
from html.parser import HTMLParser
from pathlib import Path
base=sys.argv[1];origin=sys.argv[2] if len(sys.argv)>2 else None
class P(HTMLParser):
 def __init__(self):super().__init__();self.m=[];self.l=[]
 def handle_starttag(self,t,a):
  if t=='meta':self.m.append(dict(a))
  if t=='link':self.l.append(dict(a))
class NoRedirect(urllib.request.HTTPRedirectHandler):
 def redirect_request(self,*a):return None
op=urllib.request.build_opener(NoRedirect)
op.addheaders=[("User-Agent", "AspectRatioCanvas-DeploymentCheck/1.0")]
rows=[]
paths=['/','/image-aspect-ratio','/video-aspect-ratio','/ultrawide-aspect-ratio-calculator','/?utm_source=check','/sitemap.xml','/robots.txt','/image-aspect-ratio/?utm_source=check','/missing-seo-page']
for path in paths:
 try:r=op.open(base+path,timeout=15)
 except urllib.error.HTTPError as ex:r=ex
 body=r.read().decode();p=P();p.feed(body);headers=dict(r.headers);can=[x['href'] for x in p.l if x.get('rel')=='canonical']
 if path.startswith('/missing'):assert r.status==404
 elif path.startswith('/image-aspect-ratio/'):assert r.status==308 and r.headers['Location']=='/image-aspect-ratio?utm_source=check'
 elif path=='/sitemap.xml':
  assert r.status==200 and 'application/xml' in r.headers['Content-Type'];assert len(ET.fromstring(body))==0
 elif path=='/robots.txt':assert r.status==200 and 'text/plain' in r.headers['Content-Type'] and 'Sitemap:' not in body
 else:
  assert r.status==200, (path,r.status,body[:100])
  assert [x.get('content') for x in p.m if x.get('name')=='robots']==['noindex, nofollow']
  assert r.headers['X-Robots-Tag']=='noindex, nofollow'
  assert can==([origin+path.split('?')[0]] if origin else [])
 rows.append(dict(path=path,status=r.status,canonical=can,headers=headers,pass_=True))
for path in ['/sitemap.xml','/robots.txt']:
 r=op.open(urllib.request.Request(base+path,method='HEAD'),timeout=15);assert r.status==200 and not r.read();rows.append(dict(path=path,method='HEAD',status=r.status,pass_=True))
print(json.dumps(rows,indent=2))
