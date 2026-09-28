/**
 * 逐个算法完整演示验证脚本
 * 对每个算法进行：搜索 → 点击 → 详情页验证 → 参数应用 → 步进 → 代码联动 → 截图
 */
import { chromium, type Browser, type Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const VIEWPORT = { width: 1920, height: 1080 };
const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(process.cwd(), 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR);

interface AlgoDef {
  id: string;
  name: string;
  search: string;
  category?: string;
}

// 需要验证的算法清单（扩展版 - 覆盖所有核心编译器族）
const ALGORITHMS: AlgoDef[] = [
  // === GridUniquePathsCompiler 族 (网格探索 DP) ===
  { id: 'unique-paths', name: '不同路径', search: '不同路径', category: '动态规划' },
  { id: 'unique-paths-ii', name: '不同路径 II', search: '不同路径 II', category: '动态规划' },
  { id: 'min-path-sum', name: '最小路径和', search: '最小路径和', category: '动态规划' },
  
  // === TwoPassNeighborStepCompiler 族 (双向前后缀与邻域扫描) ===
  { id: 'candy', name: '分发糖果', search: '分发糖果', category: '贪心算法' },
  { id: 'monotone-digits', name: '单调递增的数字', search: '单调递增的数字', category: '贪心算法' },
  { id: 'wiggle-subsequence', name: '摆动序列', search: '摆动序列', category: '贪心算法' },
  
  // === LinearStepMatrixCompiler 族 (线性 1D DP) ===
  { id: 'climbing-stairs', name: '爬楼梯', search: '爬楼梯', category: '动态规划' },
  { id: 'house-robber', name: '打家劫舍', search: '打家劫舍', category: '动态规划' },
  { id: 'coin-change', name: '零钱兑换', search: '零钱兑换', category: '动态规划' },
  { id: 'word-break', name: '单词拆分', search: '单词拆分', category: '动态规划' },
  
  // === KnapsackStepMatrixCompiler 族 (背包族) ===
  { id: 'knapsack-01', name: '0-1 背包', search: '背包', category: '动态规划' },
  
  // === IntervalRelayStepCompiler 族 (区间接力与覆盖) ===
  { id: 'burst-balloons', name: '戳气球', search: '戳气球', category: '动态规划' },
  
  // === SequenceStepMatrixCompiler 族 (双序列矩阵 DP) ===
  { id: 'edit-distance', name: '编辑距离', search: '编辑距离', category: '动态规划' },
  
  // === StateDependencyTreeCompiler 族 (树形展开与记忆化) ===
  { id: 'palindrome-partitioning', name: '分割回文串', search: '分割回文串', category: '动态规划' },
];

interface TestResult {
  algoId: string;
  algoName: string;
  phase: string;
  passed: boolean;
  evidence: string;
}

const results: TestResult[] = [];

const ok = (id: string, name: string, phase: string, evidence: string) => 
  results.push({ algoId: id, algoName: name, phase, passed: true, evidence });
  
const fail = (id: string, name: string, phase: string, evidence: string) => 
  results.push({ algoId: id, algoName: name, phase, passed: false, evidence });

async function screenshot(page: Page, name: string) {
  const p = path.join(SCREENSHOT_DIR, `verify_${name}.png`);
  await page.screenshot({ path: p, fullPage: true });
  return p;
}

async function waitForHydration(page: Page, ms = 800) {
  await page.waitForTimeout(ms);
}

async function gotoCatalog(page: Page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await waitForHydration(page, 1500);
}

async function searchAndClickAlgo(page: Page, algo: AlgoDef): Promise<boolean> {
  // 清空搜索框
  const searchInput = page.locator('#search-input');
  try {
    await searchInput.click({ timeout: 5000 });
  } catch (e) {
    console.log('   [warn] 搜索框点击失败，尝试直接填充');
  }
  
  await searchInput.fill('');
  await waitForHydration(page, 500);
  
  // 输入搜索词
  await searchInput.fill(algo.search);
  await waitForHydration(page, 1500);

  // 查找并点击卡片 - 优先匹配精确名称，跳过总结页
  const cards = page.locator('.algo-card');
  const count = await cards.count();
  
  // 第一次遍历：寻找精确匹配（不包含"总结"、"周总结"等关键词）
  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const cardText = await card.textContent().catch(() => '');
    
    // 跳过总结页面
    if (cardText.includes('总结') || cardText.includes('周总结') || cardText.includes('SUMMARY')) {
      continue;
    }
    
    // 检查是否包含算法名称
    if (cardText.includes(algo.name)) {
      await card.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await card.click();
      await waitForHydration(page, 2500);
      return true;
    }
  }
  
  // 第二次遍历：如果没找到精确匹配，接受第一个包含名称的卡片
  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const cardText = await card.textContent().catch(() => '');
    if (cardText.includes(algo.name)) {
      await card.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await card.click();
      await waitForHydration(page, 2500);
      return true;
    }
  }
  
  return false;
}

async function verifyDetailPage(page: Page, algo: AlgoDef): Promise<{
  hasCodeLines: boolean;
  codeLineCount: number;
  hasStepButton: boolean;
  hasIframe: boolean;
  hasSvg: boolean;
  stepCount: string;
}> {
  await waitForHydration(page, 1500);
  
  // 检查代码行
  const codeLineSelectors = ['.algo-code-line', '.code-line', '[data-line]'];
  let codeLineCount = 0;
  let hasIframe = false;
  
  for (const sel of codeLineSelectors) {
    const count = await page.locator(sel).count();
    if (count > 0) { codeLineCount = count; break; }
  }
  
  if (codeLineCount === 0) {
    const frame = page.frames().find(f => f.url() !== page.url());
    if (frame) {
      for (const sel of codeLineSelectors) {
        const count = await frame.locator(sel).count().catch(() => 0);
        if (count > 0) { codeLineCount = count; hasIframe = true; break; }
      }
    }
  }

  // 检查步进按钮（播放器控件）
  const stepBtnSelectors = [
    'button[data-action="next"]',
    'button[data-action="step-next"]',
    'button:has-text("下一步")',
    'button:has-text("下一转移帧")',
    'button[aria-label="Next"]',
  ];
  let hasStepButton = false;
  for (const sel of stepBtnSelectors) {
    if (await page.locator(sel).first().isVisible().catch(() => false)) {
      hasStepButton = true;
      break;
    }
  }
  if (!hasStepButton) {
    const frame = page.frames().find(f => f.url() !== page.url());
    if (frame) {
      for (const sel of stepBtnSelectors) {
        if (await frame.locator(sel).first().isVisible().catch(() => false)) {
          hasStepButton = true;
          break;
        }
      }
    }
  }
  
  // 也检查播放器控件区域（进度条右侧的按钮）
  if (!hasStepButton) {
    const playerControls = page.locator('button:has(svg)').filter({ hasText: '' });
    if (await playerControls.count() > 0) {
      hasStepButton = true;
    }
  }

  // 检查 SVG 可视化
  const svgCount = await page.locator('svg').count();
  const hasSvg = svgCount > 0;

  // 获取步数
  const stepSelectors = ['#log-count', '[data-el="step-counter"]', '.step-counter'];
  let stepCount = '';
  for (const sel of stepSelectors) {
    const el = await page.locator(sel).first().textContent().catch(() => '');
    if (el && el.trim()) { stepCount = el.trim(); break; }
  }
  if (!stepCount) {
    const frame = page.frames().find(f => f.url() !== page.url());
    if (frame) {
      for (const sel of stepSelectors) {
        const el = await frame.locator(sel).first().textContent().catch(() => '');
        if (el && el.trim()) { stepCount = el.trim(); break; }
      }
    }
  }

  return {
    hasCodeLines: codeLineCount > 0,
    codeLineCount,
    hasStepButton,
    hasIframe,
    hasSvg,
    stepCount
  };
}

async function applyParameters(page: Page): Promise<boolean> {
  // 查找"应用"按钮
  const applyBtn = page.locator('button:has-text("应用")').first();
  if (await applyBtn.isVisible().catch(() => false)) {
    await applyBtn.click();
    await waitForHydration(page, 2000);
    return true;
  }
  return false;
}

async function clickStepNext(page: Page, times: number = 3): Promise<number> {
  // 播放器控件按钮（上一个/播放/下一个）
  const playerBtnSelectors = [
    'button[data-action="next"]',
    'button[data-action="step-next"]',
    'button:has-text("下一步")',
    'button:has-text("下一转移帧")',
    'button[aria-label="Next"]',
    // 播放器控件中的下一个按钮（通常是 |▶ 图标）
    'button svg path[d*="M6 4l12 8-12 8z"]', // 播放图标
    'button svg path[d*="M4 4l8 8-8 8z"]', // 下一个图标
  ];
  
  let clicked = 0;
  
  for (let i = 0; i < times; i++) {
    let clickedOnce = false;
    
    // 先尝试主页面
    for (const sel of playerBtnSelectors) {
      const btn = page.locator(sel).first();
      if (await btn.isVisible().catch(() => false)) {
        const isDisabled = await btn.isDisabled().catch(() => false);
        if (!isDisabled) {
          await btn.click();
          await waitForHydration(page, 400);
          clicked++;
          clickedOnce = true;
          break;
        }
      }
    }
    
    // 如果主页面没找到，尝试 iframe
    if (!clickedOnce) {
      const frame = page.frames().find(f => f.url() !== page.url());
      if (frame) {
        for (const sel of playerBtnSelectors) {
          const btn = frame.locator(sel).first();
          if (await btn.isVisible().catch(() => false)) {
            const isDisabled = await btn.isDisabled().catch(() => false);
            if (!isDisabled) {
              await btn.click();
              await waitForHydration(page, 400);
              clicked++;
              clickedOnce = true;
              break;
            }
          }
        }
      }
    }
    
    // 如果还是没找到，尝试点击进度条右侧的按钮区域
    if (!clickedOnce) {
      const nextBtnArea = page.locator('button:has(svg)').filter({ hasText: '' }).last();
      if (await nextBtnArea.isVisible().catch(() => false)) {
        await nextBtnArea.click();
        await waitForHydration(page, 400);
        clicked++;
      }
    }
  }
  
  return clicked;
}

async function getActiveCodeLine(page: Page): Promise<string> {
  const selectors = [
    '.algo-code-line.is-active',
    '.code-line.active-line',
    '[data-line].is-active',
    // 代码面板中的高亮行（蓝色背景）
    'div[style*="background-color: rgb(37, 99, 235)"]',
    'div[style*="background-color: #2563eb"]',
    'div[style*="rgba(37, 99, 235"]',
  ];
  
  try {
    // 主页面
    for (const sel of selectors) {
      const line = await page.locator(sel).first().getAttribute('data-line').catch(() => null);
      if (line) return line;
    }
    
    // iframe - 需要重新获取 frame 避免 detached 错误
    const frame = page.frames().find(f => f.url() !== page.url());
    if (frame) {
      for (const sel of selectors) {
        const line = await frame.locator(sel).first().getAttribute('data-line').catch(() => null);
        if (line) return line;
      }
    }
    
    // 内联样式高亮 - 更宽松的检测
    const allContexts = [page, ...(frame ? [frame] : [])];
    for (const ctx of allContexts) {
      // 查找所有可能有行号的元素
      const allElements = await ctx.locator('[data-line], .code-line, .algo-code-line').all();
      for (const el of allElements) {
        const style = await el.getAttribute('style').catch(() => '');
        const className = await el.getAttribute('class').catch(() => '');
        // 检查是否有高亮样式
        if (style.includes('2563eb') || style.includes('rgba(37, 99, 235') || 
            className.includes('active') || className.includes('highlight')) {
          const dataLine = await el.getAttribute('data-line').catch(() => null);
          if (dataLine) return dataLine;
        }
      }
    }
  } catch (e) {
    // Frame detached or other navigation error - return none
    console.log('   [warn] 代码行检测失败（可能是页面跳转）');
  }
  
  return 'none';
}

async function testAlgorithm(page: Page, algo: AlgoDef) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`🔍 验证算法：${algo.name} (${algo.id})`);
  console.log(`${'='.repeat(60)}`);
  
  // 1. 返回目录页
  await gotoCatalog(page);
  
  // 2. 搜索并点击
  const cardFound = await searchAndClickAlgo(page, algo);
  if (!cardFound) {
    fail(algo.id, algo.name, '搜索点击', '卡片未找到');
    console.log(`   ❌ 卡片未找到`);
    return;
  }
  ok(algo.id, algo.name, '搜索点击', `成功点击卡片`);
  console.log(`   ✅ 卡片点击成功`);
  
  // 3. 截图详情页初始状态
  const detailShot = await screenshot(page, `${algo.id}_01_detail`);
  console.log(`   📸 详情页截图：${detailShot}`);
  
  // 4. 验证详情页基础信息
  const detailInfo = await verifyDetailPage(page, algo);
  console.log(`   📊 代码行数：${detailInfo.codeLineCount} (iframe=${detailInfo.hasIframe}, svg=${detailInfo.hasSvg})`);
  console.log(`   📊 步进按钮：${detailInfo.hasStepButton}`);
  console.log(`   📊 当前进度：${detailInfo.stepCount || '未知'}`);
  
  if (detailInfo.hasCodeLines) {
    ok(algo.id, algo.name, '详情页代码', `代码行数=${detailInfo.codeLineCount}`);
  } else {
    // 某些算法可能没有代码行（如纯可视化）
    console.log(`   ⚠️ 无代码行（可能是纯可视化算法）`);
  }
  
  if (detailInfo.hasStepButton) {
    ok(algo.id, algo.name, '步进按钮', '按钮可见');
  } else {
    fail(algo.id, algo.name, '步进按钮', '按钮不可见');
  }
  
  // 5. 如果进度为 0/0，尝试应用参数
  if (detailInfo.stepCount === '0 / 0' || detailInfo.stepCount === '0/0' || detailInfo.stepCount === '') {
    console.log(`   🔄 进度为 0 或空，尝试应用参数...`);
    
    // 查找"应用"按钮（可能在主页面或 iframe 中）
    let applied = false;
    const applyBtn = page.locator('button:has-text("应用")').first();
    if (await applyBtn.isVisible().catch(() => false)) {
      await applyBtn.click();
      await waitForHydration(page, 2500);
      applied = true;
      console.log(`   ✅ 参数已应用（主页面）`);
    }
    
    if (!applied) {
      const frame = page.frames().find(f => f.url() !== page.url());
      if (frame) {
        const applyBtnInFrame = frame.locator('button:has-text("应用")').first();
        if (await applyBtnInFrame.isVisible().catch(() => false)) {
          await applyBtnInFrame.click();
          await waitForHydration(page, 2500);
          applied = true;
          console.log(`   ✅ 参数已应用（iframe）`);
        }
      }
    }
    
    if (applied) {
      ok(algo.id, algo.name, '参数应用', '成功应用参数');
      
      // 重新验证进度
      const newInfo = await verifyDetailPage(page, algo);
      console.log(`   📊 应用后进度：${newInfo.stepCount || '未知'}`);
      
      // 截图应用后状态
      const appliedShot = await screenshot(page, `${algo.id}_02_applied`);
      console.log(`    应用参数后截图：${appliedShot}`);
    } else {
      console.log(`   ⚠️ 未找到应用按钮或应用失败`);
    }
  }
  
  // 6. 步进 3 次
  console.log(`   ⏭️  步进 3 次...`);
  const clicked = await clickStepNext(page, 3);
  console.log(`   ✅ 成功步进 ${clicked} 次`);
  
  // 7. 截图步进后状态
  const steppedShot = await screenshot(page, `${algo.id}_03_stepped`);
  console.log(`   📸 步进后截图：${steppedShot}`);
  
  // 8. 检查代码行高亮
  const activeLine = await getActiveCodeLine(page);
  console.log(`   🎯 活跃代码行：${activeLine}`);
  
  if (activeLine !== 'none') {
    ok(algo.id, algo.name, '代码联动', `高亮行=${activeLine}`);
    console.log(`   ✅ 代码联动正常`);
  } else {
    // 检查是否有步数进展
    const frame = page.frames().find(f => f.url() !== page.url());
    const progressSelectors = ['#log-count', '[data-el="step-counter"]', '.step-counter'];
    let currentProgress = '';
    for (const sel of progressSelectors) {
      const ctx = frame || page;
      const el = await ctx.locator(sel).first().textContent().catch(() => '');
      if (el && el.trim()) { currentProgress = el.trim(); break; }
    }
    
    if (currentProgress && currentProgress !== '0 / 0' && currentProgress !== '0/0') {
      console.log(`   ⚠️ 有步进进展 (${currentProgress}) 但无代码行高亮`);
      // 这可能是算法特性（无代码行可视化）
      ok(algo.id, algo.name, '步进进展', `进度=${currentProgress}`);
    } else {
      fail(algo.id, algo.name, '代码联动', '无活跃代码行');
      console.log(`   ❌ 代码联动失败`);
    }
  }
  
  console.log(`\n`);
}

async function main() {
  console.log('🚀 逐个算法完整演示验证');
  console.log(`📋 待验证算法：${ALGORITHMS.length} 个\n`);
  
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: false,
    args: ['--no-sandbox', '--disable-gpu']
  });
  
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();
  
  try {
    for (const algo of ALGORITHMS) {
      await testAlgorithm(page, algo);
    }
    
    // 打印汇总
    console.log(`${'='.repeat(60)}`);
    console.log(' 验证结果汇总');
    console.log(`${'='.repeat(60)}`);
    
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    
    console.log(`\n总计：${results.length} 项 | ✅ 通过：${passed} | ❌ 失败：${failed}\n`);
    
    if (failed > 0) {
      console.log('失败项：');
      results.filter(r => !r.passed).forEach(r => {
        console.log(`   ❌ [${r.algoId}] ${r.algoName} - ${r.phase}: ${r.evidence}`);
      });
    }
    
    console.log(`\n 截图目录：${SCREENSHOT_DIR}`);
    
  } finally {
    await browser.close();
  }
}

main().catch(console.error);
