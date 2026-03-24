import fs from 'node:fs';
import path from 'node:path';

const PAGE_PATH = path.resolve('public/assets/external/cf312322_index.html');
const OUTPUT_DIR = path.resolve('public/assets/external/annual-reports');
const BASE_URL = 'https://www.sicobank.com/annualReports/';

const INITIAL_ASSETS = [
  'images/favicon-32x32.png',
  'images/logo-1.png',
  'images/ie8-panel/warning_bar_0000_us.jpg',
  'css/bootstrap.css',
  'css/style.css',
  'css/novi.css',
  'css/jquery.mmenu.all.css',
  'js/core.min.js',
  'js/script.js',
  'js/jquery.mmenu.all.js',
  'js/invokation.js',
  'js/html5shiv.min.js',
];

const TEXT_EXTENSIONS = new Set(['.css', '.js', '.html']);
const downloaded = new Set();

function ensureParent(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function toAbsoluteUrl(target, currentUrl = BASE_URL) {
  if (!target || target.startsWith('data:') || target.startsWith('#')) {
    return null;
  }

  if (target.startsWith('//')) {
    return `https:${target}`;
  }

  return new URL(target, currentUrl).toString();
}

function toLocalFilePath(url) {
  const parsed = new URL(url);
  const relative = parsed.pathname.replace(/^\/annualReports\//, '');
  return path.join(OUTPUT_DIR, relative);
}

async function download(url) {
  if (downloaded.has(url)) {
    return;
  }

  downloaded.add(url);
  const response = await fetch(url);
  if (!response.ok) {
    console.warn(`Skipping ${url}: ${response.status}`);
    return;
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const filePath = toLocalFilePath(url);
  ensureParent(filePath);
  fs.writeFileSync(filePath, buffer);

  const ext = path.extname(filePath).toLowerCase();
  if (!TEXT_EXTENSIONS.has(ext)) {
    return;
  }

  const text = buffer.toString('utf8');
  const nestedUrls = new Set();

  const cssUrlPattern = /url\((['"]?)([^'")]+)\1\)/g;
  for (const match of text.matchAll(cssUrlPattern)) {
    const nested = toAbsoluteUrl(match[2], url);
    if (nested && nested.startsWith(BASE_URL)) {
      nestedUrls.add(nested);
    }
  }

  const importPattern = /@import\s+(?:url\()?['"]?([^'")]+)['"]?\)?/g;
  for (const match of text.matchAll(importPattern)) {
    const nested = toAbsoluteUrl(match[1], url);
    if (nested && nested.startsWith(BASE_URL)) {
      nestedUrls.add(nested);
    }
  }

  for (const nested of nestedUrls) {
    await download(nested);
  }
}

async function main() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  for (const asset of INITIAL_ASSETS) {
    await download(new URL(asset, BASE_URL).toString());
  }

  let html = fs.readFileSync(PAGE_PATH, 'utf8');

  html = html.replace(
    /<link rel="stylesheet" type="text\/css" href="\/\/fonts\.googleapis\.com\/css\?family=Open\+Sans:400,600,700">\s*/g,
    '',
  );
  html = html.replace(
    /<script async="" src="https:\/\/www\.youtube\.com\/iframe_api"><\/script>/g,
    '',
  );

  const replacements = {
    'images/favicon-32x32.png': '/newsletters/assets/external/annual-reports/images/favicon-32x32.png',
    'images/logo-1.png': '/newsletters/assets/external/annual-reports/images/logo-1.png',
    'images/ie8-panel/warning_bar_0000_us.jpg': '/newsletters/assets/external/annual-reports/images/ie8-panel/warning_bar_0000_us.jpg',
    'css/bootstrap.css': '/newsletters/assets/external/annual-reports/css/bootstrap.css',
    'css/style.css': '/newsletters/assets/external/annual-reports/css/style.css',
    'css/novi.css': '/newsletters/assets/external/annual-reports/css/novi.css',
    'css/jquery.mmenu.all.css': '/newsletters/assets/external/annual-reports/css/jquery.mmenu.all.css',
    'js/core.min.js': '/newsletters/assets/external/annual-reports/js/core.min.js',
    'js/script.js': '/newsletters/assets/external/annual-reports/js/script.js',
    'js/jquery.mmenu.all.js': '/newsletters/assets/external/annual-reports/js/jquery.mmenu.all.js',
    'js/invokation.js': '/newsletters/assets/external/annual-reports/js/invokation.js',
    'js/html5shiv.min.js': '/newsletters/assets/external/annual-reports/js/html5shiv.min.js',
  };

  for (const [from, to] of Object.entries(replacements)) {
    html = html.replaceAll(`"${from}"`, `"${to}"`);
  }

  fs.writeFileSync(PAGE_PATH, html);
  console.log('Localized annual report assets.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
