/** LCA 阶段 2/3 逐步验证：阶段内全量步进 + 指标演化 + 终态输出 */
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
      btoa(JSON.stringify({ v: 1, uid: 'lca23', exp: 0, user_id: 'l', tier: 3 })) + '.s'
    );
  });
  const pageErrors: string[] = [];
  page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 220)));

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(2500);
  await page.evaluate(async () => {
    await (window as any).viewMountEngine.showAlgorithm('lca');
  });
  await page.waitForSelector('#btn-step-next', { timeout: 20000 });
  await page.waitForTimeout(900);

  for (const stage of ['stage-2', 'stage-3']) {
    console.log(`\n========== ${stage} ==========`);
    await page.click(`.dsp-stage-tab-btn[data-stage="${stage}"]`);
    await page.waitForTimeout(900);

    const stageProbe = await page.evaluate(() => ({
      codeLines: document.querySelectorAll('#code-lines-wrapper .code-line').length,
      count: document.getElementById('log-count')?.textContent || '',
      active: document.querySelector('.code-line.active')?.getAttribute('data-line') || null,
    }));
    console.log(`   初始: codeLines=${stageProbe.codeLines} count="${stageProbe.count}" active=L${stageProbe.active}`);

    let missingLine = 0;
    let steps = 0;
    let finalLive = '';
    for (let i = 0; i < 80; i++) {
      const disabled = await page.evaluate(() => (document.getElementById('btn-step-next') as HTMLButtonElement)?.disabled);
      if (disabled) break;
      await page.click('#btn-step-next');
      await page.waitForTimeout(30);
      steps++;
      const st = await page.evaluate(() => ({
        active: document.querySelector('.code-line.active')?.getAttribute('data-line') || null,
        metrics: Array.from(document.querySelectorAll('.dsp-metrics-grid .dsp-metric-value')).map((el) => el.textContent?.trim()),
        live: (document.getElementById('dsp-live-text')?.textContent || '').replace(/\s+/g, ' ').slice(0, 70),
        out: document.getElementById('dsp-output-val')?.textContent || '',
      }));
      if (!st.active) missingLine++;
      finalLive = `${st.live} | out=${st.out} | metrics=${JSON.stringify(st.metrics.slice(0, 4))}`;
    }
    console.log(`   步进 ${steps} 步 | 无高亮帧=${missingLine}`);
    console.log(`   终态: ${finalLive}`);
    if (missingLine > 0) console.log(`   🚨 [P1] ${stage} 有 ${missingLine} 步无代码高亮`);
    await page.screenshot({ path: `D:/tmp/algo-viz-click-test/lca_${stage}_end.png` });
  }

  console.log(`\npageerror: ${pageErrors.length}`);
  pageErrors.slice(0, 5).forEach((e) => console.log(`   [pageerror] ${e.slice(0, 180)}`));
  await browser.close();
  process.exit(pageErrors.length > 0 ? 2 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
