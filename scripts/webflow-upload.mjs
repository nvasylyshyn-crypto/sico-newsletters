import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function loadEnvLocal() {
  const envPath = path.resolve('.env.local');
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) process.env[m[1]] = m[2];
  }
}
loadEnvLocal();

const TOKEN = process.env.WEBFLOW_API_TOKEN;
const SITE_ID = process.env.WEBFLOW_SITE_ID;

if (!TOKEN || !SITE_ID) {
  console.error('Missing WEBFLOW_API_TOKEN or WEBFLOW_SITE_ID');
  process.exit(1);
}

async function uploadFile(filePath) {
  const buffer = fs.readFileSync(filePath);
  const fileName = path.basename(filePath);
  const hash = crypto.createHash('md5').update(buffer).digest('hex');

  const createRes = await fetch(`https://api.webflow.com/v2/sites/${SITE_ID}/assets`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      accept: 'application/json',
      'content-type': 'application/json',
    },
    body: JSON.stringify({ fileName, fileHash: hash }),
  });

  if (!createRes.ok) {
    const text = await createRes.text();
    throw new Error(`create-asset failed for ${filePath}: ${createRes.status} ${text}`);
  }

  const data = await createRes.json();
  const { uploadUrl, uploadDetails, hostedUrl } = data;

  const form = new FormData();
  for (const [k, v] of Object.entries(uploadDetails)) {
    form.append(k, v);
  }
  form.append('file', new Blob([buffer]), fileName);

  const uploadRes = await fetch(uploadUrl, { method: 'POST', body: form });
  if (!uploadRes.ok && uploadRes.status !== 201) {
    const text = await uploadRes.text();
    throw new Error(`S3 upload failed for ${filePath}: ${uploadRes.status} ${text}`);
  }

  return hostedUrl;
}

async function main() {
  const files = process.argv.slice(2);
  if (files.length === 0) {
    console.error('Usage: node scripts/webflow-upload.mjs <file1> <file2> ...');
    process.exit(1);
  }

  const mapping = {};
  let done = 0;
  for (const f of files) {
    try {
      const hostedUrl = await uploadFile(f);
      mapping[f] = hostedUrl;
      done++;
      if (done % 10 === 0 || done === files.length) {
        console.error(`  ${done}/${files.length} uploaded...`);
      }
    } catch (err) {
      console.error(`FAILED: ${f}: ${err.message}`);
    }
  }

  console.log(JSON.stringify(mapping, null, 2));
}

main();
