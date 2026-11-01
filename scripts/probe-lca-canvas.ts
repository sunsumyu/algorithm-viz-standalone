/** 逐帧复现 LCA 推演树「提前结算」失同步：每步 dump 画布帧徽章 / 底部结论 / 绿色节点数 / 指标区 */
import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = 'http://localhost:23300';

async function main(): Promise<void> {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  ];
  const browser = await chromium.launch({ executablePath: candidates.find((c) => fs.existsSync(c)), headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  await context.addInitScript(() => {
    localStorage.setItem(
      'alg_viz_client_license_v1',
      btoa(JSON.stringify({ v: 1, uid: 'lca', exp: 0, user_id: 'lca', tier: 3 })) + '.s'
    );
  });
  page.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 200)));

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2200);
  await page.evaluate(async () => {
    await (window as any).viewMountEngine.showAlgorithm('lca');
  });
  await page.waitForSelector('#btn-step-next', { timeout: 20000 });
  await page.waitForTimeout(900);

  const snap = () =>
    page.evaluate(() => {
      const sandbox = document.getElementById('dsp-sandbox-container');
      const text = sandbox?.textContent || '';
      const settledBadges = (text.match(/已结算/g) || []).length;
      const finalResultMentions = (text.match(/最终结果[=＝][^·\n]*/g) || []).map((m) => m.trim()).slice(0, 3);
      // 绿色（已捕获 LCA）节点近似统计：fill/stroke 为绿色系的 circle
      const greenNodes = sandbox ? sandbox.querySelectorAll('circle[stroke="#10b981"], circle[stroke="#059669"], circle[fill="#10b981"], circle[fill="#059669"]').length : -1;
      const logCount = document.getElementById('log-count')?.textContent || '';
      const metrics = Array.from(document.querySelectorAll('.dsp-metrics-grid .dsp-metric-value')).map((el) => el.textContent?.trim());
      const live = (document.getElementById('dsp-live-text')?.textContent || '').replace(/\s+/g, ' ').slice(0, 80);
      return { settledBadges, finalResultMentions, greenNodes, logCount, metrics: metrics.slice(0, 8), live };
    });

  console.log('初始(第1步前):', JSON.stringify(await snap()));
  for (let i = 1; i <= 14; i++) {
    const disabled = await page.evaluate(() => (document.getElementById('btn-step-next') as HTMLButtonElement)?.disabled);
    if (disabled) break;
    await page.click('#btn-step-next');
    await page.waitForTimeout(60);
    const s = await snap();
    console.log(
      `第${String(s.logCount.match(/\d+/)?.[0] || i).padStart(2)}步 | settled×${s.settledBadges} | greenNodes=${s.greenNodes} | 最终结果=${JSON.stringify(s.finalResultMentions)} | metrics=${JSON.stringify(s.metrics)} | ${s.live.slice(0, 56)}`
    );
  }
  await page.screenshot({ path: 'D:/tmp/algo-viz-click-test/lca_step2_repro.png' });
  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
