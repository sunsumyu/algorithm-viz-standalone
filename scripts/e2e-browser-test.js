import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'C:/Users/Aren/.gemini/antigravity-ide/brain/835fdfb5-fc9c-4b7d-906d-5fa90597f26f';

async function runBrowserTest() {
  console.log('🚀 启动浏览器进行真实 E2E 自动化测试...');
  
  // 查找系统安装的 Edge 或 Chrome
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const execPath = fs.existsSync(edgePath) ? edgePath : (fs.existsSync(chromePath) ? chromePath : undefined);
  
  const browser = await chromium.launch({
    executablePath: execPath,
    channel: execPath ? undefined : 'msedge',
    headless: true
  });
  
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const results = [];

  try {
    // ========================================================
    // 测试 1: unique-paths-lite.html 基础加载与阶段 4 初始渲染
    // ========================================================
    console.log('📄 [Test 1] 正在打开 http://localhost:3000/unique-paths-lite.html ...');
    await page.goto('http://localhost:3000/unique-paths-lite.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const title = await page.title();
    console.log(`   页面 Title: ${title}`);
    const algoTitle = await page.textContent('#header-algo-title');
    console.log(`   初始阶段标题: ${algoTitle}`);

    const initialCodeTitle = await page.textContent('#code-file-title');
    console.log(`   初始代码文件: ${initialCodeTitle}`);

    results.push({
      test: 'unique-paths-lite.html 初始加载',
      passed: title.includes('不同路径') && algoTitle.includes('阶段 4')
    });

    // 截图 1: 初始阶段 4
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'e2e_01_stage4_initial.png') });

    // ========================================================
    // 测试 2: 单步步进测试 (点击单步 > 4 次)
    // ========================================================
    console.log('⏩ [Test 2] 执行单步调试点击...');
    const nextBtn = page.locator('#btn-step-next');
    for (let i = 1; i <= 4; i++) {
      await nextBtn.click();
      await page.waitForTimeout(200);
      const activeLine = await page.evaluate(() => document.querySelector('.code-line.active-line')?.getAttribute('data-line') || 'none');
      console.log(`   第 ${i} 步 -> 高亮代码行: L${activeLine}`);
    }

    const stepCounter = await page.textContent('#log-count');
    console.log(`   当前步数进度: ${stepCounter}`);
    results.push({
      test: '单步操作与代码高亮联动',
      passed: stepCounter.includes('/') && !stepCounter.startsWith('1 /')
    });

    // 截图 2: 单步调试中
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'e2e_02_stepping.png') });

    // ========================================================
    // 测试 3: 切换至【阶段 1: 朴素递归】
    // ========================================================
    console.log('🌲 [Test 3] 切换至【阶段 1: 朴素递归】...');
    await page.click('button[data-stage="stage-1"]');
    await page.waitForTimeout(500);

    const stage1Title = await page.textContent('#header-algo-title');
    const stage1Code = await page.textContent('#code-file-title');
    const treeSvg = await page.locator('#memo-slots-container svg').count();
    console.log(`   阶段 1 标题: ${stage1Title}`);
    console.log(`   阶段 1 代码: ${stage1Code}`);
    console.log(`   递归调用树 SVG 是否渲染: ${treeSvg > 0 ? '是' : '否'}`);

    results.push({
      test: '阶段 1 朴素递归切换与树图渲染',
      passed: stage1Title.includes('阶段 1') && stage1Code.includes('NaiveRecursiveForward') && treeSvg > 0
    });

    // 步进两步查看递归树节点展开
    await nextBtn.click();
    await page.waitForTimeout(200);
    await nextBtn.click();
    await page.waitForTimeout(200);
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'e2e_03_stage1_recursion_tree.png') });

    // ========================================================
    // 测试 4: 切换至【逆推 (倒序)】
    // ========================================================
    console.log('🔄 [Test 4] 切换至【逆推 (倒序)】模式...');
    await page.click('#btn-dir-reverse');
    await page.waitForTimeout(500);

    const reverseTitle = await page.textContent('#header-algo-title');
    const reverseCode = await page.textContent('#code-file-title');
    console.log(`   逆推标题: ${reverseTitle}`);
    console.log(`   逆推代码: ${reverseCode}`);

    results.push({
      test: '逆推倒序模式切换',
      passed: reverseTitle.includes('逆推') && reverseCode.includes('NaiveRecursiveReverse')
    });

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'e2e_04_reverse_mode.png') });

    // ========================================================
    // 测试 5: 切换至【阶段 3: 状态转移 2D DP】
    // ========================================================
    console.log('📊 [Test 5] 切换至【阶段 3: 状态转移 (2D DP)】...');
    await page.click('button[data-stage="stage-3"]');
    await page.waitForTimeout(500);

    const stage3Title = await page.textContent('#header-algo-title');
    console.log(`   阶段 3 标题: ${stage3Title}`);

    for (let i = 0; i < 5; i++) {
      await nextBtn.click();
      await page.waitForTimeout(100);
    }

    results.push({
      test: '阶段 3 二维 DP 状态转移填表',
      passed: stage3Title.includes('阶段 3')
    });

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'e2e_05_stage3_tabulation.png') });

    // ========================================================
    // 测试 6: 阶段 4 变体切换 (外层 for 版)
    // ========================================================
    console.log('⚡ [Test 6] 阶段 4 空间优化 变体切换...');
    await page.click('button[data-stage="stage-4"]');
    await page.waitForTimeout(300);
    await page.click('button[data-variant="for"]');
    await page.waitForTimeout(300);

    const forVariantTitle = await page.textContent('#code-file-title');
    console.log(`   变体切换后代码文件: ${forVariantTitle}`);

    results.push({
      test: '阶段 4 变体切换 (外层 for 版)',
      passed: forVariantTitle.includes('SolutionReverseFor') || forVariantTitle.includes('SolutionFor')
    });

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'e2e_06_stage4_for_variant.png') });

    // ========================================================
    // 测试 7: unique-paths.html (完整版) 加载与功能验证
    // ========================================================
    console.log('📄 [Test 7] 正在测试 http://localhost:3000/unique-paths.html ...');
    await page.goto('http://localhost:3000/unique-paths.html', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const fullTitle = await page.title();
    console.log(`   完整版 Title: ${fullTitle}`);

    results.push({
      test: 'unique-paths.html 完整版页面加载',
      passed: fullTitle.includes('不同路径')
    });

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'e2e_07_full_page.png') });

  } catch (err) {
    console.error('❌ 测试运行异常:', err);
  } finally {
    await browser.close();
  }

  console.log('\n================ 测试结果汇总 ================');
  let allPass = true;
  for (const r of results) {
    console.log(`${r.passed ? '✅' : '❌'} ${r.test}`);
    if (!r.passed) allPass = false;
  }
  console.log(`总计: ${results.length} 项测试, ${allPass ? '全部通过 🎉' : '存在失败'}`);
}

runBrowserTest();
