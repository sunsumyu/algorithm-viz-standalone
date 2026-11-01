/**
 * unique-paths / unique-paths-ii 功能级点击测试（iframe 内部驱动）
 * 验证用户最新重构的 grid-unique-paths-compiler 端到端行为：
 *  步进、代码高亮联动、播放/暂停、日志推进、无 JS 错误
 */
import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = 'http://localhost:23300';
const findings: string[] = [];
const pageErrors: string[] = [];

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
      btoa(JSON.stringify({ v: 1, uid: 'up', exp: 0, user_id: 'up', tier: 3 })) + '.s'
    );
  });
  page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 220)));

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);

  for (const algoId of ['unique-paths', 'unique-paths-ii']) {
    console.log(`\n========== 🧪 ${algoId} ==========`);
    await page.evaluate(() => (window as any).viewMountEngine?.showSelector?.());
    await page.waitForTimeout(350);
    const ok = await page.evaluate(async (id) => {
      const viz = await (window as any).viewMountEngine.showAlgorithm(id);
      return viz ? 'ok' : 'failed';
    }, algoId);
    if (ok !== 'ok') {
      findings.push(`${algoId}: 挂载失败`);
      continue;
    }
    await page.waitForTimeout(1800);

    // 定位 iframe 并等待内部步进控件
    const frameHandle = await page.waitForSelector('iframe', { timeout: 15000 });
    const frame = await frameHandle.contentFrame();
    if (!frame) {
      findings.push(`${algoId}: iframe 不可访问`);
      continue;
    }
    try {
      await frame.waitForSelector('#btn-step-next', { timeout: 15000 });
    } catch {
      findings.push(`${algoId}: iframe 内无 #btn-step-next`);
      continue;
    }
    await page.waitForTimeout(800);

    // 步进 15 步，检查代码高亮与日志推进
    let advanced = 0;
    let lastActiveLine: string | null = null;
    let missingLine = 0;
    for (let i = 0; i < 15; i++) {
      const disabled = await frame.evaluate(() => (document.getElementById('btn-step-next') as HTMLButtonElement)?.disabled);
      if (disabled) break;
      await frame.click('#btn-step-next');
      await page.waitForTimeout(60);
      const st = await frame.evaluate(() => ({
        active: document.querySelector('.code-line.active')?.getAttribute('data-line') || null,
        count: document.getElementById('log-count')?.textContent || '',
        logRows: document.querySelectorAll('#log-container > *').length,
      }));
      if (st.active) lastActiveLine = st.active;
      else missingLine++;
      advanced++;
    }
    console.log(`   步进 ${advanced} 步 | 活跃行=${lastActiveLine} | 无高亮帧=${missingLine}`);
    if (advanced === 0) findings.push(`${algoId}: iframe 内步进 0 次前进`);
    if (missingLine > 3) findings.push(`${algoId}: ${missingLine} 步无代码高亮`);

    // 播放 2s + 暂停
    const before = await frame.evaluate(() => document.getElementById('log-count')?.textContent || '');
    const playBtn = await frame.$('#btn-play-pause');
    if (playBtn) {
      await playBtn.click();
      await page.waitForTimeout(2000);
      await playBtn.click();
      await page.waitForTimeout(300);
      const after = await frame.evaluate(() => document.getElementById('log-count')?.textContent || '');
      console.log(`   播放前="${before}" 播放2s后="${after}"`);
      if (before === after) findings.push(`${algoId}: 播放 2s 步数未前进`);
    } else {
      console.log('   （无播放按钮，跳过）');
    }
    await page.screenshot({ path: `D:/tmp/algo-viz-click-test/upp_${algoId}.png` });
  }

  console.log('\n================ unique-paths 家族汇总 ================');
  console.log(`pageerror: ${pageErrors.length}`);
  pageErrors.slice(0, 6).forEach((e) => console.log(`   [pageerror] ${e.slice(0, 180)}`));
  console.log(`findings: ${findings.length}`);
  findings.forEach((f) => console.log(`   🚨 ${f}`));
  await browser.close();
  process.exit(findings.length > 0 || pageErrors.length > 0 ? 2 : 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
