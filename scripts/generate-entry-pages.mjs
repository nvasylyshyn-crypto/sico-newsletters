import fs from 'node:fs';
import path from 'node:path';

const PUBLIC_DIR = path.resolve('public');

const ENTRIES = [
  ['1h25.html', '1h25/index.html', '/newsletters/1h25/'],
  ['1h2025.html', '1h2025/index.html', '/newsletters/1h2025/'],
  ['1h24.html', '1h24/index.html', '/newsletters/1h24/'],
  ['2h23.html', '2h23/index.html', '/newsletters/2h23/'],
  ['1q2023.html', '1q2023/index.html', '/newsletters/1q2023/'],
  ['2h2022.html', '2h2022/index.html', '/newsletters/2h2022/'],
  ['1h2022.html', '1h2022/index.html', '/newsletters/1h2022/'],
  ['MailShot.html', 'MailShot/index.html', '/newsletters/MailShot/'],
  ['2h2020.html', '2h2020/2h2020-mailshot.html', '/newsletters/2h2020/'],
];

for (const [outputName, sourceName, baseHref] of ENTRIES) {
  const sourcePath = path.join(PUBLIC_DIR, sourceName);
  const outputPath = path.join(PUBLIC_DIR, outputName);

  let html = fs.readFileSync(sourcePath, 'utf8');

  if (html.includes('<base ')) {
    html = html.replace(/<base[^>]*href=["'][^"']*["'][^>]*>/i, `<base href="${baseHref}">`);
  } else if (html.includes('</head>')) {
    html = html.replace('</head>', `  <base href="${baseHref}">\n</head>`);
  }

  fs.writeFileSync(outputPath, html);
  console.log(`Generated ${outputName} from ${sourceName}`);
}
