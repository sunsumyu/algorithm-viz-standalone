import { chromium } from 'playwright';
import fs from 'fs';

async function run() {
  console.log('[E2E-TEST] Launching browser...');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const execPath = fs.existsSync(edgePath) ? edgePath : (fs.existsSync(chromePath) ? chromePath : undefined);

  const browser = await chromium.launch({
    executablePath: execPath,
    headless: true
  });

  const page = await browser.newPage();
  
  const logs = [];
  page.on('console', msg => {
    console.log(`[BROWSER ${msg.type().toUpperCase()}]:`, msg.text());
    logs.push(`[${msg.type()}]: ${msg.text()}`);
  });

  page.on('pageerror', err => {
    console.error(`[PAGE ERROR]:`, err.message);
    logs.push(`[PAGE ERROR]: ${err.message}\n${err.stack}`);
  });

  page.on('response', res => {
    if (res.status() >= 400) {
      console.error(`[HTTP ${res.status()}]: ${res.url()}`);
    }
  });

  page.on('requestfailed', req => {
    console.warn(`[REQ FAILED]: ${req.url()} - ${req.failure()?.errorText}`);
  });

  console.log('[E2E-TEST] Navigating to http://127.0.0.1:3000/unique-paths-lite.html ...');
  await page.goto('http://127.0.0.1:3000/unique-paths-lite.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
  await page.waitForTimeout(1000);

  const codeSnippetText = await page.evaluate(() => {
    const codeContainer = document.getElementById('code-display-container') || document.querySelector('.code-container') || document.querySelector('pre');
    return codeContainer ? codeContainer.textContent : null;
  });

  console.log('[E2E-TEST] Extracted Code Snippet:\n', codeSnippetText);

  // 验证是否有 class= 泄露到文本中
  if (codeSnippetText && codeSnippetText.includes('class="text-amber-300"')) {
    console.error('❌ BUG DETECTED: HTML tag leaked into code text!');
  } else {
    console.log('✅ PASS: Code text is clean and correctly rendered!');
  }

  await browser.close();
}

run().catch(err => {
  console.error('[E2E-TEST] Error:', err);
  process.exit(1);
});
