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

function replaceAll(content, replacements) {
  let next = content;

  for (const [from, to] of replacements) {
    next = next.replaceAll(from, to);
  }

  return next;
}

const directReplacements = [
  ['.cs"', '.css"'],
  [".cs'", ".css'"],
  ['.cs)', '.css)'],
  ['.cs ', '.css '],
  ['.j"', '.js"'],
  [".j'", ".js'"],
  ['.j)', '.js)'],
  ['.j ', '.js '],
  ['sshaping-up.html', 'shaping-up.html'],
  ['sspotlight.html', 'spotlight.html'],
  ['ssustainability.html', 'sustainability.html'],
  ['q&amp;a.html', 'qanda.html'],
  ['q&a.html', 'qanda.html'],
  ['1h25/1h25/', '1h25/'],
  ['https://www.sicobank.com/MailShot/', '/newsletters/MailShot/'],
  ['https://sicobank.com/MailShot/', '/newsletters/MailShot/'],
  ['https://www.sicobank.com/annualReports/index.html', '/newsletters/assets/external/cf312322_index.html'],
  ['https://www.sicobank.com/annualReports/index.html ', '/newsletters/assets/external/cf312322_index.html'],
  ['https://sicobank.com/Themes/Default/img/favicons/apple-touch-icon.png', '/newsletters/assets/external/c85d44fc_apple-touch-icon.png'],
  ['https://sicobank.com/Themes/Default/img/favicons/favicon-32x32.png', '/newsletters/assets/external/123a14fa_favicon-32x32.png'],
  ['https://sicobank.com/Themes/Default/img/favicons/favicon-16x16.png', '/newsletters/assets/external/2fde5680_favicon-16x16.png'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/innerlogo-right.jpg', '/newsletters/assets/external/bf8abc46_innerlogo-right.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/awards-icon-1.jpg', '/newsletters/assets/external/c2c8c103_awards-icon-1.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/financial.jpg', '/newsletters/assets/external/a10fb3f6_financial.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/xl/8.jpg', '/newsletters/assets/external/cd6b70ea_8.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/xl/1.jpg', '/newsletters/assets/external/3af179d2_1.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/xl/2.jpg', '/newsletters/assets/external/aef0f956_2.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/xl/3.jpg', '/newsletters/assets/external/cc221fa0_3.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/xl/4.jpg', '/newsletters/assets/external/d08effb9_4.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/xl/5.jpg', '/newsletters/assets/external/83efe40b_5.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/xl/6.jpg', '/newsletters/assets/external/5361bc2a_6.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/xl/7.jpg', '/newsletters/assets/external/a2c8cabb_7.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/xl/9.jpg', '/newsletters/assets/external/69bc793e_9.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/xl/10.jpg', '/newsletters/assets/external/65f07c80_10.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/xl/11.jpg', '/newsletters/assets/external/c82c9cf6_11.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/xl/13.jpg', '/newsletters/assets/external/2bb8d012_13.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/chart.png', '/newsletters/assets/external/659dbb30_chart.png'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/xl/FR-1.jpg', '/newsletters/assets/external/ccc26baa_FR-1.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/xl/FR-2.jpg', '/newsletters/assets/external/d0fc1873_FR-2.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/xl/FR-3.jpg', '/newsletters/assets/external/1a9fcb66_FR-3.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/xl/FR-4.jpg', '/newsletters/assets/external/c1197e43_FR-4.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/xl/AIESEC-Women-Empowerment.jpg', '/newsletters/assets/external/b7e64c66_AIESEC-Women-Empowerment.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/xl/no-print-day.jpg', '/newsletters/assets/external/b955118e_no-print-day.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/xl/Ironman--CSR----Internal.jpg', '/newsletters/assets/external/d80e05e0_Ironman--CSR----Internal.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/xl/Alia-Early-Intervention.jpg', '/newsletters/assets/external/79fd9cc5_Alia-Early-Intervention.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/xl/Think-Pink-and-Movember---CSR---Internal.jpg', '/newsletters/assets/external/39c560ae_Think-Pink-and-Movember---CSR---Internal.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/xl/Global-InvestorsMENAConference-Internal.jpg', '/newsletters/assets/external/553bf762_Global-InvestorsMENAConference-Internal.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/xl/Tradequest.jpg', '/newsletters/assets/external/19a2da5e_Tradequest.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/xl/44th-Annual-ICA---Conferences---Internal.jpg', '/newsletters/assets/external/bc93b550_44th-Annual-ICA---Conferences---Internal.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/xl/Mentorship-Program---Conferences---Internal.jpg', '/newsletters/assets/external/2c6f6c24_Mentorship-Program---Conferences---Internal.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/xl/cd.jpg', '/newsletters/assets/external/84fc905d_cd.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/Salman.jpg', '/newsletters/assets/external/b225216a_Salman.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/husain.jpg', '/newsletters/assets/external/982f0d3d_husain.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/Fatima-Mansour.jpg', '/newsletters/assets/external/72cadee9_Fatima-Mansour.jpg'],
  ['https://inktanksolutions.s3.amazonaws.com/SICO-Mailshot/image/Naser-Obaid.jpg', '/newsletters/assets/external/33597051_Naser-Obaid.jpg'],
  ['images/“.svg', 'images/Vector.svg'],
];

let changedFiles = 0;

for (const filePath of walk(PUBLIC_DIR)) {
  const original = fs.readFileSync(filePath, 'utf8');
  let updated = replaceAll(original, directReplacements);

  // Repair /newsletters/assets/external links with truncated css/js suffixes.
  updated = updated.replace(
    /(\/newsletters\/assets\/external\/[^"'()\s]+)\.cs(?=(["')\s]))/g,
    '$1.css',
  );
  updated = updated.replace(
    /(\/newsletters\/assets\/external\/[^"'()\s]+)\.j(?=(["')\s]))/g,
    '$1.js',
  );

  // Repair local file references with truncated css/js suffixes.
  updated = updated.replace(/((?:\.\/)?(?:css|js)\/[^"'()\s]+)\.cs(?=(["')\s]))/g, '$1.css');
  updated = updated.replace(/((?:\.\/)?(?:css|js)\/[^"'()\s]+)\.j(?=(["')\s]))/g, '$1.js');

  if (updated !== original) {
    fs.writeFileSync(filePath, updated);
    changedFiles += 1;
  }
}

console.log(`Repaired broken links in ${changedFiles} files.`);
