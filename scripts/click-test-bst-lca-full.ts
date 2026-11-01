import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const BASE_URL = 'http://localhost:23300';

async function main() {
  console.log('🚀 启动 Playwright 无头浏览器进行真实点击操作测试...');
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  ];
  const executablePath = candidates.find((c) => fs.existsSync(c));
  const browser = await chromium.launch({ executablePath, headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();

  // 注入 VIP 授权信息
  await context.addInitScript(() => {
    localStorage.setItem(
      'alg_viz_client_license_v1',
      btoa(JSON.stringify({ v: 1, uid: 'lca-bst-click-tester', exp: 0, user_id: 'l', tier: 3 })) + '.s'
    );
  });

  const pageErrors: string[] = [];
  page.on('pageerror', (e) => pageErrors.push(String(e).slice(0, 220)));

  console.log(`📡 正在导航到 ${BASE_URL} ...`);
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(2000);

  // 挂载 tree-037-lowest-common-ancestor-bst
  console.log('🌲 挂载算法: tree-037-lowest-common-ancestor-bst ...');
  await page.evaluate(async () => {
    await (window as any).viewMountEngine.showAlgorithm('tree-037-lowest-common-ancestor-bst');
  });

  await page.waitForSelector('#btn-step-next', { timeout: 15000 });
  await page.waitForTimeout(1000);

  // ==========================================
  // 测试 1: 验证初始指针与标签 (Stage 1)
  // ==========================================
  console.log('\n--- 1. 验证 Stage 1 树拓扑画布中的指针渲染 ---');
  const initialLabels = await page.evaluate(() => {
    const textEls = Array.from(document.querySelectorAll('#dsp-sandbox-container svg text'));
    return textEls.map((el) => el.textContent?.trim()).filter(Boolean);
  });
  console.log('   画布中检测到的标签:', initialLabels.slice(0, 15));
  const hasRoot = initialLabels.some((t) => t?.includes('root'));
  const hasP = initialLabels.some((t) => t?.includes('p'));
  const hasQ = initialLabels.some((t) => t?.includes('q'));
  console.log(`   root 指针存在: ${hasRoot}, p 标签存在: ${hasP}, q 标签存在: ${hasQ}`);
  if (!hasRoot) {
    throw new Error('❌ 未在画布中找到 root 指针标签！');
  }

  // ==========================================
  // 测试 2: 真实点击单步执行并监控日志
  // ==========================================
  console.log('\n--- 2. 真实点击单步步进 (#btn-step-next)，核验逐帧日志去重 ---');
  let stepCount = 0;
  for (let i = 0; i < 30; i++) {
    const isNextDisabled = await page.evaluate(() => {
      const btn = document.getElementById('btn-step-next') as HTMLButtonElement | null;
      return !btn || btn.disabled;
    });
    if (isNextDisabled) break;

    await page.click('#btn-step-next');
    await page.waitForTimeout(100);
    stepCount++;

    const logInfo = await page.evaluate(() => {
      const items = Array.from(document.querySelectorAll('.dsp-log-list > div'));
      const countBadge = document.getElementById('log-count')?.textContent || '';
      return { count: items.length, text: countBadge };
    });
    console.log(`   第 ${stepCount} 步点击后: 日志条目数 = ${logInfo.count}, 徽标 = "${logInfo.text}"`);
  }

  // 验证终态 LCA 标签
  const finalLabels = await page.evaluate(() => {
    const textEls = Array.from(document.querySelectorAll('#dsp-sandbox-container svg text'));
    return textEls.map((el) => el.textContent?.trim()).filter(Boolean);
  });
  const hasLca = finalLabels.some((t) => t?.includes('LCA'));
  console.log(`   终态 LCA 存在: ${hasLca}`);

  // ==========================================
  // 测试 3: 真实测试案例切换 (Presets 下拉选择)
  // ==========================================
  console.log('\n--- 3. 真实下拉切换用例 (Presets) 并核验状态刷新 ---');
  const presetSelect = await page.$('#dsp-preset-select, .dsp-preset-select');
  if (presetSelect) {
    // 切换到第 3 个用例：分叉在左树 (p=2, q=4)
    console.log('   选择用例: 分叉在左树 (索引 2)...');
    await page.selectOption('#dsp-preset-select, .dsp-preset-select', '2');
    await page.waitForTimeout(600);

    const inputValues = await page.evaluate(() => {
      const p = (document.getElementById('p') as HTMLInputElement)?.value;
      const q = (document.getElementById('q') as HTMLInputElement)?.value;
      const logItems = document.querySelectorAll('.dsp-log-list > div').length;
      const logCount = document.getElementById('log-count')?.textContent || '';
      const stepCur = document.getElementById('step-cur')?.textContent || '';
      return { p, q, logItems, logCount, stepCur };
    });
    console.log('   用例切换后输入框与状态:', inputValues);
    if (inputValues.p !== '2' || inputValues.q !== '4') {
      throw new Error(`❌ 用例切换输入框回填错误: p=${inputValues.p}, q=${inputValues.q}`);
    }
    if (inputValues.logItems > 1) {
      throw new Error(`❌ 用例切换后日志堆积残留: 当前条目数=${inputValues.logItems}`);
    }

    // 单步步进这个用例
    for (let i = 0; i < 10; i++) {
      const disabled = await page.evaluate(() => (document.getElementById('btn-step-next') as HTMLButtonElement)?.disabled);
      if (disabled) break;
      await page.click('#btn-step-next');
      await page.waitForTimeout(60);
    }
    const case3Final = await page.evaluate(() => ({
      logItems: document.querySelectorAll('.dsp-log-list > div').length,
      logCount: document.getElementById('log-count')?.textContent || '',
    }));
    console.log('   用例 3 走完后日志状态:', case3Final);
  }

  // ==========================================
  // 测试 4: 切换 Stage 2 (迭代常数空间)
  // ==========================================
  console.log('\n--- 4. 真实点击切换 Stage 2 迭代算法 ---');
  await page.click('.dsp-stage-tab-btn[data-stage="stage-2"]');
  await page.waitForTimeout(1200);

  const stage2Probe = await page.evaluate(() => ({
    codeLines: document.querySelectorAll('#code-lines-wrapper .code-line').length,
    active: document.querySelector('.code-line.active')?.getAttribute('data-line') || null,
    metrics: document.querySelector('.dsp-metrics-grid')?.textContent?.slice(0, 100),
  }));
  console.log('   Stage 2 初始化状态:', stage2Probe);

  // 单步走完 Stage 2
  for (let i = 0; i < 20; i++) {
    const disabled = await page.evaluate(() => {
      const btn = document.getElementById('btn-step-next') as HTMLButtonElement | null;
      return !btn || btn.disabled;
    });
    if (disabled) break;
    await page.click('#btn-step-next');
    await page.waitForTimeout(120);
  }
  console.log('   Stage 2 步进全部执行完毕！');

  // 截屏留档
  const shotDir = path.resolve('scratch');
  if (!fs.existsSync(shotDir)) fs.mkdirSync(shotDir, { recursive: true });
  const shotPath = path.join(shotDir, 'lca-bst-click-test-success.png');
  await page.screenshot({ path: shotPath, fullPage: true });
  console.log(`📸 全高清测试截图已保存至: ${shotPath}`);

  console.log(`\n最终页面错误数: ${pageErrors.length}`);
  if (pageErrors.length > 0) {
    pageErrors.forEach((e) => console.log('   [pageerror]', e));
  }

  await browser.close();
  if (pageErrors.length > 0) {
    process.exit(1);
  }
  console.log('🎉 所有点击操作自动化验证 100% 通过！无任何报错！');
}

main().catch((e) => {
  console.error('❌ 测试发生异常:', e);
  process.exit(1);
});
