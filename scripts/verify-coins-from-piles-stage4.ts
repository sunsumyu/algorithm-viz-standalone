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
    if (msg.type() === 'error' || msg.text().includes('coins-from-piles')) {
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
  await page.waitForTimeout(2500);

  const mountRes = await page.evaluate(async () => {
    const vEngine = (window as any).viewMountEngine;
    if (vEngine && vEngine.showAlgorithm) {
      const viz = await vEngine.showAlgorithm('coins-from-piles');
      return { success: !!viz, id: 'coins-from-piles' };
    }
    return { success: false, reason: 'no vEngine' };
  });
  console.log('[Playwright] 挂载结果:', mountRes);
  await page.waitForTimeout(3000);

  // 切换到 Stage 4 (阶段 4: 一维滚动空间压缩)
  console.log('[Playwright] 切换至 Stage 4 (空间优化)...');
  const frame = page.frameLocator('iframe').first();
  const stage4Btn = frame.getByText('空间优化').first();
  if (await stage4Btn.count() > 0) {
    await stage4Btn.click();
    console.log('[Playwright] 已点击 iframe 内的 空间优化 按钮');
  } else {
    console.log('[Playwright] iframe 内未找到 空间优化 按钮，尝试查找包含 4 的按钮');
    const btn4 = frame.locator('button:has-text("4"), div:has-text("4")').first();
    if (await btn4.count() > 0) {
      await btn4.click();
      console.log('[Playwright] 点击了包含 4 的元素');
    }
  }
  await page.waitForTimeout(3000);

  // 检查 Card 1 和 Card 2 的标题与内容
  const cardInspection = await page.evaluate(() => {
    const card1Title = document.getElementById('card1-title')?.textContent?.trim() || '';
    const card2Title = document.getElementById('card2-title')?.textContent?.trim() || '';
    const sandboxEl = document.querySelector('.coins-from-piles-sandbox');
    const memoSlots = Array.from(document.querySelectorAll('.viz-memo-slot')).map(el => el.textContent?.trim());
    const slotLabels = Array.from(document.querySelectorAll('.viz-memo-slot, [id^="memo-slot-"]')).map(el => el.parentElement?.textContent?.trim() || el.textContent?.trim());
    return {
      card1Title,
      card2Title,
      hasSandboxInCard1: !!sandboxEl,
      memoSlotsCount: memoSlots.length,
      slotSnippets: slotLabels.slice(0, 5),
    };
  });
  console.log('[Playwright] Card 1 & Card 2 审查:', JSON.stringify(cardInspection, null, 2));

  // 步进播放查看代码行内提示与状态转移 (Step 24: transition)
  const slider = frame.locator('#slider-progress').first();
  if (await slider.count() > 0) {
    console.log('[Playwright] 调整进度条至 Step 24 (index 23: transition)...');
    await slider.fill('23');
    await slider.dispatchEvent('input');
    await slider.dispatchEvent('change');
    await page.waitForTimeout(1500);
  }

  // 截取决策天平卡片截图
  const decScreenshot = 'C:/Users/Aren/.gemini/antigravity-ide/brain/29fdbdf7-31a9-43f5-ba3e-edad583b8bbd/coins_piles_stage4_decisions.png';
  console.log('[Playwright] 截取滚动数组决策看板至:', decScreenshot);
  await page.screenshot({ path: decScreenshot, fullPage: true });

  // 点击【背包与组桶】(拟物沙盘)
  console.log('[Playwright] 点击【背包与组桶】切换至沙盘视图...');
  const sandboxBtn = frame.locator('#btn-stage4-sandbox').first();
  if (await sandboxBtn.count() > 0) {
    await sandboxBtn.click();
    await page.waitForTimeout(1500);
    const sandboxScreenshot = 'C:/Users/Aren/.gemini/antigravity-ide/brain/29fdbdf7-31a9-43f5-ba3e-edad583b8bbd/coins_piles_stage4_sandbox.png';
    console.log('[Playwright] 截取阶段 4 拟物沙盘截图至:', sandboxScreenshot);
    await page.screenshot({ path: sandboxScreenshot, fullPage: true });
  }

  // 点击【状态依赖树】
  console.log('[Playwright] 点击【状态依赖树】切换至依赖树视图...');
  const treeBtn = frame.locator('#btn-stage4-tree').first();
  if (await treeBtn.count() > 0) {
    await treeBtn.click();
    await page.waitForTimeout(1500);
    const treeScreenshot = 'C:/Users/Aren/.gemini/antigravity-ide/brain/29fdbdf7-31a9-43f5-ba3e-edad583b8bbd/coins_piles_stage4_tree.png';
    console.log('[Playwright] 截取阶段 4 状态依赖树截图至:', treeScreenshot);
    await page.screenshot({ path: treeScreenshot, fullPage: true });
  }

  await browser.close();
  console.log('[Playwright] Stage 4 全子视图自动化核验完成！');
}

main().catch((err) => {
  console.error('[Playwright] 运行失败:', err);
  process.exit(1);
});
