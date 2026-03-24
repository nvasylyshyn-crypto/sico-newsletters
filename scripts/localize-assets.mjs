import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const PUBLIC_DIR = path.resolve('public');
const ASSETS_DIR = path.join(PUBLIC_DIR, 'assets', 'external');

if (!fs.existsSync(ASSETS_DIR)) {
  fs.mkdirSync(ASSETS_DIR, { recursive: true });
}

const EXTERNAL_PATTERNS = [
  /https?:\/\/inktanksolutions\.s3\.amazonaws\.com\/[^\s"'()]+/g,
  /https?:\/\/s3\.amazonaws\.com\/inktanksolutions\/[^\s"'()]+/g,
  /https?:\/\/stackpath\.bootstrapcdn\.com\/[^\s"'()]+/g,
  /https?:\/\/code\.jquery\.com\/[^\s"'()]+/g,
  /https?:\/\/cdn\.jsdelivr\.net\/[^\s"'()]+/g,
  /https?:\/\/fonts\.googleapis\.com\/[^\s"'()]+/g,
  /https?:\/\/fonts\.gstatic\.com\/[^\s"'()]+/g,
  /https?:\/\/ajax\.googleapis\.com\/[^\s"'()]+/g,
  /https?:\/\/d3e54v103j8qbb\.cloudfront\.net\/[^\s"'()]+/g,
  /https?:\/\/rocketway\.net\/[^\s"'()]+/g,
  /https?:\/\/(?:www\.|research\.)?sicobank\.com\/[^\s"'()]+/g,
];

function decodeHtmlEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function encodeHtmlAmpersands(value) {
  return value.replace(/&/g, '&amp;');
}

async function downloadAsset(url) {
  try {
    const decodedUrl = decodeHtmlEntities(url);
    const response = await fetch(decodedUrl);
    if (!response.ok) throw new Error(`Failed to fetch ${decodedUrl}: ${response.statusText}`);

    const buffer = Buffer.from(await response.arrayBuffer());
    const urlHash = crypto.createHash('md5').update(decodedUrl).digest('hex').substring(0, 8);
    const fileName = path.basename(new URL(decodedUrl).pathname) || 'asset';
    const localName = `${urlHash}_${fileName}`;
    const localPath = path.join(ASSETS_DIR, localName);
    
    fs.writeFileSync(localPath, buffer);
    console.log(`Downloaded: ${decodedUrl} -> ${localName}`);
    return `assets/external/${localName}`;
  } catch (error) {
    if (error.message.includes('Not Found')) {
       // Silently fail for known missing assets to avoid log clutter
       return null;
    }
    console.error(`Error downloading ${url}:`, error.message);
    return null;
  }
}

async function processFiles() {
  const files = [];
  const walk = (dir) => {
    fs.readdirSync(dir).forEach(file => {
      const fullPath = path.join(dir, file);
      if (fs.statSync(fullPath).isDirectory()) {
        if (file !== 'node_modules' && file !== '.next') {
          walk(fullPath);
        }
      } else if (/\.(html|css|js)$/.test(file)) {
        files.push(fullPath);
      }
    });
  };

  walk(PUBLIC_DIR);

  const urlMap = new Map();
  const allExternalUrls = new Set();

  for (const file of files) {
    const content = fs.readFileSync(file, 'utf8');
    for (const pattern of EXTERNAL_PATTERNS) {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(url => allExternalUrls.add(url));
      }
    }
  }

  console.log(`Found ${allExternalUrls.size} unique external URLs.`);

  for (const url of allExternalUrls) {
    const localPath = await downloadAsset(url);
    if (localPath) {
      urlMap.set(url, localPath);
    }
  }

  for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    let changed = false;

    for (const [url, localPath] of urlMap) {
      const absoluteLocalPath = '/' + path.join('newsletters', localPath).replace(/\\/g, '/');
      const encodedUrl = encodeHtmlAmpersands(url);

      for (const sourceUrl of new Set([url, decodeHtmlEntities(url), encodedUrl])) {
        const escapedUrl = sourceUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedUrl, 'g');

        if (regex.test(content)) {
          content = content.replace(regex, absoluteLocalPath);
          changed = true;
        }
      }

      if (url.includes('jquery-3.4.1.slim.min.js')) {
        content = content.replaceAll('jquery-3.4.1.slim.min.j', 'jquery-3.4.1.slim.min.js');
      }
      if (url.includes('popper.min.js')) {
        content = content.replaceAll('popper.min.j', 'popper.min.js');
      }
      if (url.includes('bootstrap.min.js')) {
        content = content.replaceAll('bootstrap.min.j', 'bootstrap.min.js');
      }
      if (url.includes('bootstrap.min.css')) {
        content = content.replaceAll('bootstrap.min.cs', 'bootstrap.min.css');
      }

      if (content.includes('jquery-3.4.1.slim.min.js') || content.includes('popper.min.js') || content.includes('bootstrap.min.js') || content.includes('bootstrap.min.css')) {
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(file, content);
      console.log(`Updated: ${path.relative(PUBLIC_DIR, file)}`);
    }
  }
}

processFiles().catch(console.error);
