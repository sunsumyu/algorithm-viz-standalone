import { chromium } from 'playwright';

async function main() {
  console.log('[Playwright] 启动无头 Edge/Chromium 浏览器 (1920x1080 FHD)...');
  const browser = await chromium.launch({
    headless: true,
    channel: 'msedge',
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  // 注入开发许可证
  await page.addInitScript(() => {
    localStorage.setItem(
      'alg_viz_client_license_v1',
      'eyJ2IjoxLCJ1aWQiOiJERVYtTE9DQUwiLCJleHAiOjAsInVzZXJfaWQiOiJWSVBfVVNFUl82Nzc3NjIiLCJ0aWVyIjozfQ.bNkOSGU6mJ_FU1c6cairP6nuCwSPw4khvOiy84TPqvHXZwFHNif8Z9HtwWtd4cmBVx_qi4q2AEhgSeRv21KCAQ'
    );
  });

  console.log('[Playwright] 导航至 http://localhost:23300/ ...');
  await page.goto('http://localhost:23300/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  await page.waitForTimeout(2000);

  const mountRes = await page.evaluate(async () => {
    const vEngine = (window as any).viewMountEngine;
    if (vEngine && vEngine.showAlgorithm) {
      const viz = await vEngine.showAlgorithm('coins-from-piles');
      return { success: !!viz, id: 'coins-from-piles' };
    }
    return { success: false, reason: 'no vEngine' };
  });
  console.log('[Playwright] coins-from-piles 挂载结果:', mountRes);
  await page.waitForTimeout(3000);

  const frame = page.frames().find((f) => f.url() === 'about:srcdoc');
  if (!frame) {
    throw new Error('未找到 about:srcdoc frame！');
  }

  const stages = [
    { num: 1, name: '递归' },
    { num: 2, name: '记忆化' },
    { num: 3, name: '二维DP' },
    { num: 4, name: '空间优化' },
  ];

  for (const st of stages) {
    console.log(`\n================== [Stage ${st.num}: ${st.name}] 巡检 ==================`);
    const btn = frame.locator(`[data-stage="stage-${st.num}"]`).first();
    await btn.click();
    await page.waitForTimeout(2000);

    const info = await frame.evaluate(() => {
      const card1Title = document.getElementById('card1-title')?.textContent?.trim() || '';
      const card2Title = document.getElementById('card2-title')?.textContent?.trim() || '';
      const lineRows = document.querySelectorAll('.code-line, [data-line]');
      const activeLine = document.querySelector('.code-line.bg-amber-500\\/20, .code-line.bg-amber-500\\/15, .line-highlight, [data-active="true"]');
      const activeLineText = activeLine?.textContent?.trim() || '';
      const inlineHints = Array.from(document.querySelectorAll('.inline-var-hint, .inline-action-hint')).map((el) => el.textContent?.trim());
      const logText = document.getElementById('viz-log-stream')?.textContent?.trim() || '';
      return {
        card1Title,
        card2Title,
        lineCount: lineRows.length,
        activeLineText: activeLineText.slice(0, 100),
        inlineHints: inlineHints.slice(0, 4),
        logSnippet: logText.slice(0, 80),
      };
    });

    console.log(`[Stage ${st.num}] Card 1: "${info.card1Title}", Card 2: "${info.card2Title}"`);
    console.log(`[Stage ${st.num}] 代码行数: ${info.lineCount}, 当前高亮行: "${info.activeLineText}"`);
    console.log(`[Stage ${st.num}] 内联提示:`, info.inlineHints);
    console.log(`[Stage ${st.num}] 最新日志: "${info.logSnippet}"`);

    // 截图保存
    const screenshotPath = `C:/Users/Aren/.gemini/antigravity-ide/brain/29fdbdf7-31a9-43f5-ba3e-edad583b8bbd/coins_piles_stage${st.num}_verified.png`;
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`[Stage ${st.num}] 截图已保存至: ${screenshotPath}`);
  }

  // 逆推倒序寻源巡检
  console.log(`\n================== [逆推倒序寻源] 巡检 ==================`);
  const revBtn = frame.locator('.dir-tab-btn:has-text("逆推倒序寻源")').first();
  if (await revBtn.count() > 0) {
    await revBtn.click();
    console.log('[Playwright] 已点击【逆推倒序寻源】按钮');
    await page.waitForTimeout(2500);

    const revInfo = await frame.evaluate(() => {
      const card1Title = document.getElementById('card1-title')?.textContent?.trim() || '';
      const card2Title = document.getElementById('card2-title')?.textContent?.trim() || '';
      const activeLine = document.querySelector('.code-line.bg-amber-500\\/20, .code-line.bg-amber-500\\/15, .line-highlight, [data-active="true"]');
      const activeLineText = activeLine?.textContent?.trim() || '';
      const logText = document.getElementById('viz-log-stream')?.textContent?.trim() || '';
      return {
        card1Title,
        card2Title,
        activeLineText: activeLineText.slice(0, 100),
        logSnippet: logText.slice(0, 80),
      };
    });
    console.log(`[Reverse] Card 1: "${revInfo.card1Title}", Card 2: "${revInfo.card2Title}"`);
    console.log(`[Reverse] 当前高亮行: "${revInfo.activeLineText}"`);
    console.log(`[Reverse] 最新日志: "${revInfo.logSnippet}"`);

    const revScreenshot = `C:/Users/Aren/.gemini/antigravity-ide/brain/29fdbdf7-31a9-43f5-ba3e-edad583b8bbd/coins_piles_reverse_verified.png`;
    await page.screenshot({ path: revScreenshot, fullPage: false });
    console.log(`[Reverse] 截图已保存至: ${revScreenshot}`);
  }

  await browser.close();
  console.log('\n[Playwright] 全阶段 1-4 与逆序巡检验证全部完成！');
}

main().catch((err) => {
  console.error('[Playwright Error]:', err);
  process.exit(1);
});
