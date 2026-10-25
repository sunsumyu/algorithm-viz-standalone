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

  page.on('console', (msg) => {
    if (msg.type() === 'error' || msg.text().includes('coins-from-piles') || msg.text().includes('Preset')) {
      console.log(`[Browser ${msg.type()}]:`, msg.text());
    }
  });

  page.on('pageerror', (err) => {
    console.error('[Browser Error]:', err.message);
  });

  // 注入开发许可证
  await page.addInitScript(() => {
    localStorage.setItem(
      'alg_viz_client_license_v1',
      'eyJ2IjoxLCJ1aWQiOiJERVYtTE9DQUwiLCJleHAiOjAsInVzZXJfaWQiOiJWSVBfVVNFUl82Nzc3NjIiLCJ0aWVyIjozfQ.bNkOSGU6mJ_FU1c6cairP6nuCwSPw4khvOiy84TPqvHXZwFHNif8Z9HtwWtd4cmBVx_qi4q2AEhgSeRv21KCAQ'
    );
  });

  console.log('[Playwright] 导航至 http://localhost:23300/ 并挂载 coins-from-piles ...');
  await page.goto('http://localhost:23300/', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2000);
  await page.evaluate(async () => {
    const vEngine = (window as any).viewMountEngine;
    if (vEngine && vEngine.showAlgorithm) {
      await vEngine.showAlgorithm('coins-from-piles');
    }
  });
  await page.waitForTimeout(2000);

  // 检查预设下拉菜单 options
  const presetInfo = await page.evaluate(() => {
    const select = document.getElementById('stage-preset-select') as HTMLSelectElement | null;
    if (!select) return { error: 'stage-preset-select not found' };
    const options = Array.from(select.options).map((opt, i) => ({
      index: i,
      value: opt.value,
      text: opt.textContent?.trim(),
      selected: opt.selected,
    }));
    return {
      selectValue: select.value,
      selectedIndex: select.selectedIndex,
      options,
    };
  });
  console.log('[Playwright] 案例下拉菜单状态:', JSON.stringify(presetInfo, null, 2));

  // 切换到 Case 2: 栈顶高面值 [100,1,3]
  console.log('[Playwright] 切换至 Case 2 (栈顶高面值 [100,1,3])...');
  const switchRes = await page.evaluate(() => {
    const select = document.getElementById('stage-preset-select') as HTMLSelectElement | null;
    if (!select) return { error: 'select not found' };
    select.value = '1';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    return { success: true, newVal: select.value };
  });
  console.log('[Playwright] 案例切换事件派发:', switchRes);

  await page.waitForTimeout(2000);

  // 切换到沙盘子视图 (点击 Card 2 上的 [沙盘] 标签)
  console.log('[Playwright] 点击 #btn-sub-sandbox 切换到硬币栈沙盘视图...');
  await page.evaluate(() => {
    const sandboxBtn = document.getElementById('btn-sub-sandbox');
    if (sandboxBtn) sandboxBtn.click();
  });
  await page.waitForTimeout(1000);

  // 校验沙盘渲染：栈 0 栈顶是否已是 +100，第 2 枚是否已是 +1
  const sandboxInspection = await page.evaluate(() => {
    const sandbox = document.querySelector('.coins-from-piles-sandbox');
    const topBar = document.querySelector('.coins-from-piles-sandbox > div:first-child')?.textContent?.trim();
    
    // 获取第一个栈的所有硬币卡片文本
    const coinsTexts = Array.from(document.querySelectorAll('.coins-from-piles-sandbox [class*="rounded-md"]'))
      .map(el => el.textContent?.trim())
      .filter(t => t && (t.includes('+100') || t.includes('+1') || t.includes('+3') || t.includes('+7')));

    return {
      hasSandbox: !!sandbox,
      topBarSnippet: topBar,
      firstPileCoins: coinsTexts.slice(0, 6),
    };
  });
  console.log('[Playwright] 新 Case 沙盘初态审查:', JSON.stringify(sandboxInspection, null, 2));

  console.log('[Playwright] 通过 iframe 操纵播放条至 Step 25...');
  const frame = page.frameLocator('iframe').first();
  await frame.locator('#slider-progress').fill('24');
  await frame.locator('#slider-progress').dispatchEvent('input');
  await frame.locator('#slider-progress').dispatchEvent('change');
  await page.waitForTimeout(1000);
  await page.waitForTimeout(1500);

  // 切回 DP 表格视图审查最终 DP 矩阵值
  console.log('[Playwright] 点击 #btn-sub-matrix 查看 DP 表格终态...');
  await page.evaluate(() => {
    const matrixBtn = document.getElementById('btn-sub-matrix');
    if (matrixBtn) matrixBtn.click();
  });
  await page.waitForTimeout(1000);

  const finalInspection = await page.evaluate(() => {
    const allCells = Array.from(document.querySelectorAll('td, .grid-cell')).map(c => c.textContent?.trim());
    const finalVal = allCells.reverse().find(t => t && /^\d+$/.test(t));
    return {
      tableFinalVal: finalVal,
      lastRowCells: allCells.slice(-5),
    };
  });
  console.log('[Playwright] 终态 DP 表审查:', JSON.stringify(finalInspection, null, 2));

  // 再切回沙盘截取终态高清图
  await page.evaluate(() => {
    const sandboxBtn = document.getElementById('btn-sub-sandbox');
    if (sandboxBtn) sandboxBtn.click();
  });
  await page.waitForTimeout(1000);

  // 截取全高清 1920x1080 视口截图存入工件目录
  const screenshotPath = 'C:/Users/Aren/.gemini/antigravity-ide/brain/29fdbdf7-31a9-43f5-ba3e-edad583b8bbd/coins_piles_case2_fhd.png';
  console.log('[Playwright] 截取 1920x1080 FHD 屏幕截图保存至:', screenshotPath);
  await page.screenshot({ path: screenshotPath, fullPage: true });

  await browser.close();
  console.log('[Playwright] 自动化测试与核验圆满完成！');
}

main().catch((err) => {
  console.error('[Playwright] 运行失败:', err);
  process.exit(1);
});
