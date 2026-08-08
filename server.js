import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = process.cwd();
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
createServer(async (req, res) => {
  const pathname = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const safePath = normalize(pathname).replace(/^\.\.(\/|\\|$)/, '');
  try {
    const body = await readFile(join(root, safePath));
    res.writeHead(200, { 'content-type': `${types[extname(safePath)] || 'application/octet-stream'}; charset=utf-8` });
    res.end(body);
  } catch { res.writeHead(404); res.end('Not found'); }
}).listen(process.env.PORT || 3000, () => console.log('Veil Feedback at http://localhost:3000'));
