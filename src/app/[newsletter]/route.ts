import fs from 'node:fs';
import path from 'node:path';

const ENTRY_FILES: Record<string, string> = {
  '1h25': '1h25/index.html',
  '1h2025': '1h2025/index.html',
  '1h24': '1h24/index.html',
  '2h23': '2h23/index.html',
  '1q2023': '1q2023/index.html',
  '2h2022': '2h2022/index.html',
  '1h2022': '1h2022/index.html',
  MailShot: 'MailShot/index.html',
  '2h2020': '2h2020/2h2020-mailshot.html',
};

function injectBaseHref(html: string, slug: string) {
  const baseHref = `/newsletters/${slug}/`;

  if (html.includes('<base ')) {
    return html.replace(/<base[^>]*href=["'][^"']*["'][^>]*>/i, `<base href="${baseHref}">`);
  }

  if (html.includes('</head>')) {
    return html.replace('</head>', `  <base href="${baseHref}">\n</head>`);
  }

  return html;
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ newsletter: string }> },
) {
  const { newsletter } = await context.params;
  const entryFile = ENTRY_FILES[newsletter];

  if (!entryFile) {
    return new Response('Not found', { status: 404 });
  }

  const filePath = path.join(process.cwd(), 'public', entryFile);

  if (!fs.existsSync(filePath)) {
    return new Response('Not found', { status: 404 });
  }

  const html = fs.readFileSync(filePath, 'utf8');
  const body = injectBaseHref(html, newsletter);

  return new Response(body, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'public, max-age=0, must-revalidate',
    },
  });
}
