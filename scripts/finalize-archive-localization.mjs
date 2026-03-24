import fs from 'node:fs';
import path from 'node:path';

const PUBLIC_DIR = path.resolve('public');
const TEXT_EXTENSIONS = new Set(['.html', '.css', '.js']);

function walk(dir) {
  const files = [];

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!['node_modules', '.next'].includes(entry.name)) {
        files.push(...walk(fullPath));
      }
      continue;
    }

    if (TEXT_EXTENSIONS.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

const directReplacements = [
  ['/newsletters/assets/external/f79d1604_Adapting-New-Realities.html', '/newsletters/MailShot/Adapting-New-Realities.html'],
  ['/newsletters/assets/external/4f6f7399_Financial-Results.html', '/newsletters/MailShot/Financial-Results.html'],
  ['/newsletters/assets/external/082c204e_NewsHighlights.html', '/newsletters/MailShot/NewsHighlights.html'],
  ['/newsletters/assets/external/cef33e63_qa.html', '/newsletters/MailShot/qa.html'],
  ['/newsletters/assets/external/e4d80235_viewpoint.html', '/newsletters/MailShot/viewpoint.html'],
  ['/newsletters/assets/external/0ccd644f_research.html', '/newsletters/MailShot/research.html'],
  ['/newsletters/assets/external/efe4661b_New-Appointments.html', '/newsletters/MailShot/New-Appointments.html'],
  ['/newsletters/assets/external/06ee9296_Awards.html', '/newsletters/MailShot/Awards.html'],
  ['/newsletters/assets/external/ad2e3f9b_events.html', '/newsletters/MailShot/events.html'],
  ['/newsletters/assets/external/54b4b30c_Social-Responsibility.html', '/newsletters/MailShot/Social-Responsibility.html'],
  ['./sspotlight.html', './spotlight.html'],
  ['./ssustainability.html', './sustainability.html'],
  ['url(https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/fonts/subset-ScubaOffc-Medium.woff)', 'url(/newsletters/assets/external/subset-ScubaOffc-Medium.woff)'],
  ['url(https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/fonts/subset-ScubaOffc-Light.woff)', 'url(/newsletters/assets/external/subset-ScubaOffc-Light.woff)'],
  ['url(https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/fonts/TrolaText-Light.woff)', 'url(/newsletters/assets/external/TrolaText-Light.woff)'],
  ['url(https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/fonts/TrolaText-Bold.woff)', 'url(/newsletters/assets/external/TrolaText-Bold.woff)'],
];

let changedFiles = 0;

for (const filePath of walk(PUBLIC_DIR)) {
  const original = fs.readFileSync(filePath, 'utf8');
  let updated = original;

  for (const [from, to] of directReplacements) {
    updated = updated.replaceAll(from, to);
  }

  updated = updated.replace(/<link href="https:\/\/fonts\.googleapis\.com" rel="preconnect">\s*/g, '');
  updated = updated.replace(/<link href="https:\/\/fonts\.gstatic\.com" rel="preconnect" crossorigin="anonymous">\s*/g, '');
  updated = updated.replace(/<script src="\/newsletters\/assets\/external\/3a3adf98_webfont\.js"[^>]*><\/script>\s*/g, '');
  updated = updated.replace(/<script type="text\/javascript">WebFont\.load\([\s\S]*?\);\s*<\/script>\s*/g, '');
  updated = updated.replace(/<iframe src="https:\/\/www\.googletagmanager\.com\/ns\.html\?id=GTM-NQB2NLG"[\s\S]*?<\/iframe>\s*/g, '');

  if (updated !== original) {
    fs.writeFileSync(filePath, updated);
    changedFiles += 1;
  }
}

console.log(`Finalized archive localization in ${changedFiles} files.`);
