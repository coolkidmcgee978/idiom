const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'local-data');
const dataFile = path.join(dataDir, 'storage.json');

function readStore() {
  try {
    return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  } catch {
    return {};
  }
}

function writeStore(store) {
  fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(dataFile, JSON.stringify(store, null, 2), 'utf8');
}

module.exports = function (app) {
  app.use('/api/storage', (req, res) => {
    const key = decodeURIComponent(req.url.replace(/^\//, '').split('?')[0]);

    if (req.method === 'GET') {
      const store = readStore();
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(key ? store[key] ?? null : store));
      return;
    }

    if (req.method === 'POST') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        const store = readStore();
        store[key] = JSON.parse(body);
        writeStore(store);
        res.statusCode = 200;
        res.end('ok');
      });
      return;
    }

    if (req.method === 'DELETE') {
      const store = readStore();
      delete store[key];
      writeStore(store);
      res.statusCode = 200;
      res.end('ok');
      return;
    }

    res.statusCode = 405;
    res.end();
  });
};