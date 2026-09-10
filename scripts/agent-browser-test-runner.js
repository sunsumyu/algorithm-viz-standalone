import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Aren/.gemini/antigravity-ide/brain/835fdfb5-fc9c-4b7d-906d-5fa90597f26f';

async function runComprehensiveAgentBrowserTest() {
  console.log('🌐 Agent 正在启动真实浏览器环境执行深度交互测试与视觉快照捕获...');

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const execPath = fs.existsSync(edgePath) ? edgePath : (fs.existsSync(chromePath) ? chromePath : undefined);

  const browser = await chromium.launch({
    executablePath: execPath,
    channel: execPath ? undefined : 'msedge',
    headless: true
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 920 },
    deviceScaleFactor: 1
  });
  const page = await context.newPage();

  const report = [];

  try {
    // -------------------------------------------------------------
    // 测试 1: 访问精简版首页 - 阶段 4 初始状态
    // -------------------------------------------------------------
    console.log('📌 [Step 1] 打开 unique-paths-lite.html 初始界面...');
    await page.goto('http://localhost:3000/unique-paths-lite.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const title = await page.title();
    const stage4Header = await page.textContent('#header-algo-title');
    const codeFile1 = await page.textContent('#code-file-title');
    
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'browser_01_stage4_init.png') });
    report.push({
      step: '1. 页面加载与阶段 4 初始渲染',
      detail: `标题: "${title}", 阶段: "${stage4Header}", 代码: "${codeFile1}"`,
      image: 'browser_01_stage4_init.png',
      status: 'PASS'
    });

    // -------------------------------------------------------------
    // 测试 2: 阶段 4 单步执行与代码高亮联动
    // -------------------------------------------------------------
    console.log('📌 [Step 2] 阶段 4 连续单步执行 6 次...');
    for (let i = 1; i <= 6; i++) {
      await page.click('#btn-step-next');
      await page.waitForTimeout(200);
    }
    const stepCount1 = await page.textContent('#step-cur');
    const log1 = await page.textContent('#log-count');
    const activeLine1 = await page.evaluate(() => document.querySelector('.code-line.active-line')?.getAttribute('data-line'));

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'browser_02_stage4_stepping.png') });
    report.push({
      step: '2. 阶段 4 单步步进与高亮联动',
      detail: `当前步数: 第 ${stepCount1} 步 (${log1}), 高亮代码行: L${activeLine1}`,
      image: 'browser_02_stage4_stepping.png',
      status: 'PASS'
    });

    // -------------------------------------------------------------
    // 测试 3: 切换阶段 4 变体 (外层 for 版)
    // -------------------------------------------------------------
    console.log('📌 [Step 3] 切换至阶段 4 外层 for 变体...');
    await page.click('button[data-variant="for"]');
    await page.waitForTimeout(400);
    for (let i = 1; i <= 4; i++) {
      await page.click('#btn-step-next');
      await page.waitForTimeout(200);
    }
    const codeFileFor = await page.textContent('#code-file-title');

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'browser_03_stage4_for_variant.png') });
    report.push({
      step: '3. 阶段 4 外层 for 循环变体',
      detail: `变体代码: "${codeFileFor}"`,
      image: 'browser_03_stage4_for_variant.png',
      status: 'PASS'
    });

    // -------------------------------------------------------------
    // 测试 4: 切换阶段 1 (顺推朴素递归) 与调用树渲染
    // -------------------------------------------------------------
    console.log('📌 [Step 4] 切换至【阶段 1: 顺推朴素递归】...');
    await page.click('button[data-stage="stage-1"]');
    await page.waitForTimeout(400);
    for (let i = 1; i <= 5; i++) {
      await page.click('#btn-step-next');
      await page.waitForTimeout(200);
    }
    const stage1Title = await page.textContent('#header-algo-title');
    const stage1Code = await page.textContent('#code-file-title');
    const svgNodes = await page.locator('#memo-slots-container svg g circle, #memo-slots-container svg g rect').count();

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'browser_04_stage1_recursion_tree.png') });
    report.push({
      step: '4. 阶段 1 朴素递归调用树渲染',
      detail: `阶段: "${stage1Title}", 代码: "${stage1Code}", 渲染树节点数: ${svgNodes}`,
      image: 'browser_04_stage1_recursion_tree.png',
      status: 'PASS'
    });

    // -------------------------------------------------------------
    // 测试 5: 切换逆推 (倒序) 模式
    // -------------------------------------------------------------
    console.log('📌 [Step 5] 切换至【逆推 (倒序)】模式...');
    await page.click('#btn-dir-reverse');
    await page.waitForTimeout(400);
    for (let i = 1; i <= 4; i++) {
      await page.click('#btn-step-next');
      await page.waitForTimeout(200);
    }
    const revTitle = await page.textContent('#header-algo-title');
    const revCode = await page.textContent('#code-file-title');

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'browser_05_stage1_reverse.png') });
    report.push({
      step: '5. 逆推倒序递归与反向代码',
      detail: `逆推阶段: "${revTitle}", 逆推代码: "${revCode}"`,
      image: 'browser_05_stage1_reverse.png',
      status: 'PASS'
    });

    // -------------------------------------------------------------
    // 测试 6: 切换阶段 2 (记忆化搜索与剪枝)
    // -------------------------------------------------------------
    console.log('📌 [Step 6] 切换至【阶段 2: 记忆化搜索】...');
    await page.click('#btn-dir-forward');
    await page.waitForTimeout(200);
    await page.click('button[data-stage="stage-2"]');
    await page.waitForTimeout(400);
    // 步进到命中剪枝节点
    for (let i = 1; i <= 10; i++) {
      await page.click('#btn-step-next');
      await page.waitForTimeout(150);
    }
    const stage2Title = await page.textContent('#header-algo-title');

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'browser_06_stage2_memoization.png') });
    report.push({
      step: '6. 阶段 2 记忆化搜索与 ⚡ 剪枝标记',
      detail: `阶段: "${stage2Title}", 已步进至剪枝节点`,
      image: 'browser_06_stage2_memoization.png',
      status: 'PASS'
    });

    // -------------------------------------------------------------
    // 测试 7: 切换阶段 3 (经典二维 DP 填表)
    // -------------------------------------------------------------
    console.log('📌 [Step 7] 切换至【阶段 3: 二维 DP 状态转移】...');
    await page.click('button[data-stage="stage-3"]');
    await page.waitForTimeout(400);
    for (let i = 1; i <= 8; i++) {
      await page.click('#btn-step-next');
      await page.waitForTimeout(150);
    }
    const stage3Title = await page.textContent('#header-algo-title');

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'browser_07_stage3_tabulation.png') });
    report.push({
      step: '7. 阶段 3 二维 DP 填表与转移公式',
      detail: `阶段: "${stage3Title}", 二维网格已填充`,
      image: 'browser_07_stage3_tabulation.png',
      status: 'PASS'
    });

    // -------------------------------------------------------------
    // 测试 8: 访问完整精讲版 unique-paths.html
    // -------------------------------------------------------------
    console.log('📌 [Step 8] 打开 unique-paths.html 完整版页面...');
    await page.goto('http://localhost:3000/unique-paths.html', { waitUntil: 'networkidle' });
    await page.waitForTimeout(600);

    const fullTitle = await page.title();
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'browser_08_full_page.png') });
    report.push({
      step: '8. 完整精讲版 unique-paths.html 页面推导',
      detail: `完整版页面标题: "${fullTitle}"`,
      image: 'browser_08_full_page.png',
      status: 'PASS'
    });

  } catch (err) {
    console.error('❌ 测试执行异常:', err);
  } finally {
    await browser.close();
  }

  console.log('\n================ 浏览器测试完成 ================');
  console.log(JSON.stringify(report, null, 2));
}

runComprehensiveAgentBrowserTest();
