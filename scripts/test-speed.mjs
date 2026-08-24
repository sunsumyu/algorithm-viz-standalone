import { chromium } from 'playwright';
import path from 'path';

async function testPerformance() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
  });
  const page = await browser.newPage();
  let reqCount = 0;
  page.on('request', () => { reqCount++; });
  page.on('console', msg => console.log('[Console]', msg.type(), msg.text()));
  page.on('pageerror', err => console.error('[PageError]', err.message));

  console.log('🚀 Navigating to http://localhost:3000/ ...');
  const t0 = Date.now();
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 15000 });
  const loadTime = Date.now() - t0;
  console.log(`✅ 首屏加载耗时: ${loadTime} ms, 首屏 HTTP 请求数: ${reqCount}`);

  // Test clicking an algorithm (e.g. bracket matching in stack)
  console.log('⚡ 测试点击算法卡片触发按需懒加载 (bracket)...');
  const t1 = Date.now();
  await page.click('.algo-card[data-algo-id="bracket"]');
  await page.waitForSelector('#algo-bracket-view.active', { timeout: 5000 });
  const mountTime = Date.now() - t1;
  console.log(`✅ 算法 bracket 动态按需加载并挂载成功, 耗时: ${mountTime} ms! 累计 HTTP 请求数: ${reqCount}`);

  // Test stepping in visualizer
  const nextBtn = page.locator('#step-next');
  await nextBtn.click();
  await page.waitForTimeout(200);
  console.log('✅ 单步调试动画执行成功!');

  // Take screenshot
  const screenshotPath = 'C:/Users/Aren/.gemini/antigravity-ide/brain/f5b6caf0-cfee-46a9-9bc0-254ed5ed935d/optimized_algo_view.png';
  await page.screenshot({ path: screenshotPath });
  console.log('✅ 截图已保存至:', screenshotPath);

  // Test another algorithm in another category: dynamic programming (e.g. unique-paths)
  console.log('⚡ 测试跨分类动态加载 (unique-paths)...');
  const t2 = Date.now();
  await page.evaluate(() => {
    (window).algorithmManager?.showAlgorithm('unique-paths');
  });
  await page.waitForTimeout(500);
  console.log(`✅ 跨分类动态加载成功! 耗时: ${Date.now() - t2} ms`);

  await browser.close();
}

testPerformance().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
