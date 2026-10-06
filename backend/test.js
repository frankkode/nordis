const assert = require('assert');
const app = require('./server');

const server = app.listen(0, async () => {
  const base = `http://127.0.0.1:${server.address().port}`;
  const post = (body) => fetch(`${base}/api/contact`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
  try {
    assert.strictEqual((await (await fetch(`${base}/api/health`)).json()).name, 'nordis');
    assert.ok((await (await fetch(`${base}/api/services`)).json()).length > 0);
    assert.strictEqual((await post({})).status, 400);
    assert.strictEqual((await post({ name: 'A', email: 'a@b.co', message: 'Hello there, Nordis' })).status, 201);
    assert.strictEqual((await fetch(`${base}/`)).status, 200);
    console.log('all tests passed');
  } catch (e) {
    console.error(e);
    process.exitCode = 1;
  } finally {
    server.close();
  }
});
