#!/usr/bin/env node
'use strict';
// Run only inside a verified QA guest. No host/browser auto-discovery.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const http = require('node:http');
const crypto = require('node:crypto');

async function main() {
  const output = process.argv[2];
  if (!output) throw new Error('Usage: node smoke.cjs NEW_OUTPUT_DIRECTORY');
  fs.mkdirSync(output, { recursive: false }); // Never overwrite an earlier run.
  const started = new Date().toISOString();
  const report = { schema: 'cua-qa.smoke.v1', status: 'running', started_at: started,
    fixture_sha256: null, checks: [], errors: [], browser_closed: false, server_closed: false };
  const html = '<!doctype html><html lang="en"><meta charset="utf-8"><title>Cua QA fixture</title>' +
    '<h1>Isolated browser smoke test</h1><label>Task <input id="task"></label>' +
    '<button id="add">Add task</button><ul id="list"></ul>' +
    '<script>document.querySelector("#add").onclick=()=>{const input=document.querySelector("#task");' +
    'if(!input.value.trim())return;const li=document.createElement("li");' +
    'li.textContent=input.value;document.querySelector("#list").append(li);input.value=""};</script></html>';
  report.fixture_sha256 = crypto.createHash('sha256').update(html).digest('hex');
  let browser, server;
  try {
    const moduleName = process.env.QA_PLAYWRIGHT_MODULE || 'playwright';
    let chromium;
    try { ({ chromium } = require(moduleName)); }
    catch { throw new Error('Playwright is missing. Stage/install it in this guest or set QA_PLAYWRIGHT_MODULE.'); }
    if (!chromium) throw new Error('The selected module has no Chromium launcher.');
    server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(html);
    });
    await new Promise((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    browser = await chromium.launch({
      headless: true,
      chromiumSandbox: true,
      timeout: 30000,
      ...(process.env.QA_BROWSER_EXECUTABLE ? { executablePath: process.env.QA_BROWSER_EXECUTABLE } : {})
    });
    report.browser_version = browser.version();
    const context = await browser.newContext({ viewport: { width: 1100, height: 720 } });
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    page.on('pageerror', error => report.errors.push(error.message));
    page.on('console', msg => { if (msg.type() === 'error') report.errors.push(msg.text()); });
    await page.goto('http://127.0.0.1:' + server.address().port, { waitUntil: 'load' });
    assert.equal(await page.title(), 'Cua QA fixture');
    report.checks.push('fixture loaded');
    await page.getByLabel('Task', { exact: true }).fill('Verify isolated QA');
    await page.getByRole('button', { name: 'Add task', exact: true }).click();
    assert.equal(await page.locator('li').count(), 1);
    assert.equal(await page.locator('li').textContent(), 'Verify isolated QA');
    report.checks.push('task added through browser input');
    assert.equal(await page.getByLabel('Task', { exact: true }).inputValue(), '');
    await page.getByRole('button', { name: 'Add task', exact: true }).click();
    assert.equal(await page.locator('li').count(), 1);
    report.checks.push('empty task rejected');
    await page.screenshot({ path: path.join(output, 'browser.png'), fullPage: true });
    assert.deepEqual(report.errors, []);
    report.checks.push('no browser console or page errors');
    report.status = 'passed';
  } catch (error) {
    report.status = 'failed';
    report.errors.push(error.message);
    process.exitCode = 1;
  } finally {
    if (browser) {
      try { await browser.close(); report.browser_closed = true; }
      catch (e) { report.errors.push('Browser cleanup: ' + e.message); report.status = 'failed'; process.exitCode = 1; }
    } else report.browser_closed = true;
    if (server) {
      await new Promise(resolve => server.close(resolve));
      report.server_closed = true;
    } else report.server_closed = true;
    report.finished_at = new Date().toISOString();
    fs.writeFileSync(path.join(output, 'result.json'), JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify(report));
  }
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
