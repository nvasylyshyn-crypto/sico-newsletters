import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const publicRoot = path.join(projectRoot, 'public');

const textExtensions = new Set(['.html', '.css']);

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...walk(fullPath));
      continue;
    }

    if (textExtensions.has(path.extname(entry.name))) {
      files.push(fullPath);
    }
  }

  return files;
}

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function normalizeRelativePath(fromFile, targetFile, { forceTrailingSlash = false } = {}) {
  const fromDir = path.dirname(fromFile);
  let relativePath = path.relative(fromDir, targetFile);

  if (!relativePath || relativePath === '') {
    relativePath = '.';
  }

  let posixPath = toPosix(relativePath);

  if (!posixPath.startsWith('.')) {
    posixPath = `./${posixPath}`;
  }

  if (forceTrailingSlash && !posixPath.endsWith('/')) {
    posixPath += '/';
  }

  return posixPath;
}

function resolveSicoUrl(filePath, rawUrl) {
  const nestedExternalMatch = rawUrl.match(/^https?:\/\/sicobank\.com\/[^/]+\/(https?:\/\/.+)$/);

  if (nestedExternalMatch) {
    const nestedUrl = nestedExternalMatch[1];

    if (/^https?:\/\/(?:www\.)?sicobank\.com\//.test(nestedUrl)) {
      return resolveSicoUrl(filePath, nestedUrl.replace('://www.sicobank.com/', '://sicobank.com/'));
    }

    return nestedUrl;
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(rawUrl);
  } catch {
    return rawUrl;
  }

  if (!/^https?:$/.test(parsedUrl.protocol) || !['sicobank.com', 'www.sicobank.com'].includes(parsedUrl.hostname)) {
    return rawUrl;
  }

  const fileRelativeToPublic = path.relative(publicRoot, filePath);
  const [issueRoot] = fileRelativeToPublic.split(path.sep);

  if (!issueRoot) {
    return rawUrl;
  }

  let targetPath = decodeURIComponent(parsedUrl.pathname);
  const suffix = `${parsedUrl.search}${parsedUrl.hash}`;

  if (targetPath.startsWith('/Themes/Default/')) {
    const localTarget = path.join(publicRoot, issueRoot, targetPath.slice(1));

    if (!fs.existsSync(localTarget)) {
      return rawUrl;
    }

    return `${normalizeRelativePath(filePath, localTarget)}${suffix}`;
  }

  const normalizedTarget = targetPath.replace(/^\/+/, '');
  const localTarget = path.join(publicRoot, normalizedTarget);

  if (fs.existsSync(localTarget) && fs.statSync(localTarget).isFile()) {
    return `${normalizeRelativePath(filePath, localTarget)}${suffix}`;
  }

  if (fs.existsSync(localTarget) && fs.statSync(localTarget).isDirectory()) {
    return `${normalizeRelativePath(filePath, localTarget, { forceTrailingSlash: true })}${suffix}`;
  }

  return rawUrl;
}

let changedFiles = 0;

for (const filePath of walk(publicRoot)) {
  const original = fs.readFileSync(filePath, 'utf8');
  const updated = original.replace(/https?:\/\/sicobank\.com[^\s"'()<>]*/g, (rawUrl) =>
    resolveSicoUrl(filePath, rawUrl),
  );

  if (updated !== original) {
    fs.writeFileSync(filePath, updated);
    changedFiles += 1;
  }
}

console.log(`Normalized legacy archive URLs in ${changedFiles} files.`);
