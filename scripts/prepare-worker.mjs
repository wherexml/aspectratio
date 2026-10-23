import { readFileSync, writeFileSync } from 'node:fs';
const path = '.output/server/wrangler.json';
const config = JSON.parse(readFileSync(path, 'utf8'));
config.name = 'aspect-ratio-canvas';
config.account_id = '43886d80333268731ba049d55af60272';
config.compatibility_date = '2026-10-16';
config.workers_dev = true;
config.preview_urls = false;
// Keep Wrangler local preview on loopback instead of inferring the public route.
config.dev = { ...config.dev, host: '127.0.0.1' };
config.routes = [
  { pattern: 'imageaspectratio.com', custom_domain: true },
  { pattern: 'www.imageaspectratio.com', custom_domain: true },
];
writeFileSync(path, JSON.stringify(config, null, 2) + '\n');
