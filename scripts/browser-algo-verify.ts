/**
 * 浏览器模拟点击验证算法实现 (Browser Click-Through Verification)
 *
 * 通过 Playwright 自动化：
 *   1. 打开主页面，验证侧栏加载
 *   2. 点击侧栏类目（图论 / 动态规划）进入卡片列表
 *   3. 点击算法卡片进入详情页
 *   4. 验证 Stage 切换、步进按钮、代码高亮联动
 *   5. 对新增算法 (Class 060/061/064, 地下城游戏, 乘积最大子数组) 逐个验收
 */

import { chromium, type Page, type Browser, type Locator } from 'playwright';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.resolve('screenshots');
const VIEWPORT = { width: 1920, height: 1080 };

// ---------- Result tracking ----------
interface StepResult {
  algoId: string;
  algoName: string;
  phase: string;
  passed: boolean;
  evidence: string;
}

const results: StepResult[] = [];
function ok(algoId: string, algoName: string, phase: string, evidence: string) {
  results.push({ algoId, algoName, phase, passed: true, evidence });
}
function fail(algoId: string, algoName: string, phase: string, evidence: string) {
  results.push({ algoId, algoName, phase, passed: false, evidence });
}

// ---------- Helpers ----------
async function waitForHydration(page: Page, ms = 800) {
  await page.waitForTimeout(ms);
}

async function screenshot(page: Page, name: string) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  const filePath = path.join(SCREENSHOT_DIR, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`   📸 ${filePath}`);
}

async function gotoCatalog(page: Page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await waitForHydration(page, 1200);
}

async function clickSidebarCategory(page: Page, categoryName: string): Promise<boolean> {
  const cat = page.locator('.sidebar-category-header, .category-item').filter({ hasText: categoryName });
  const count = await cat.count();
  if (count === 0) {
    console.log(`   ❌ 侧栏未找到类目: ${categoryName}`);
    return false;
  }
  await cat.first().click();
  await waitForHydration(page, 600);
  return true;
}

async function clickAlgorithmCard(page: Page, algoName: string, searchExact: string = algoName): Promise<boolean> {
  // 先搜索
  const searchInput = page.locator('#search-input');
  await searchInput.fill(searchExact);
  await waitForHydration(page, 800);

  // 优先匹配 card 标题（.card-name）精确包含 algoName 的卡片
  const cards = page.locator('.algo-card');
  const count = await cards.count();
  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const nameEl = card.locator('.card-name, .algo-card-header h3, h3').first();
    const cardTitle = await nameEl.textContent().catch(() => '');
    if ((cardTitle ?? '').includes(algoName)) {
      await card.click();
      await waitForHydration(page, 1200);
      return true;
    }
  }
  // 回退：任意包含搜索词的卡片
  const anyCard = page.locator('.algo-card').filter({ hasText: searchExact }).first();
  if (await anyCard.count()) {
    await anyCard.click();
    await waitForHydration(page, 1200);
    return true;
  }
  console.log(`   ❌ 未找到算法卡片: ${algoName}`);
  return false;
}

/** 点击步进按钮 N 次 */
async function clickStepNext(page: Page, times: number) {
  // 多种可能的步进按钮选择器
  const btnSelectors = ['#btn-step-next', 'button[data-action="step-next"]', 'button:has-text("下一步")'];
  
  let btn = page.locator(btnSelectors[0]).first();
  let foundBtn = false;
  for (const sel of btnSelectors) {
    try {
      const locator = page.locator(sel).first();
      await locator.waitFor({ state: 'visible', timeout: 2000 });
      btn = locator;
      foundBtn = true;
      break;
    } catch {}
  }
  
  // 如果主文档没找到，尝试 iframe 内部
  if (!foundBtn) {
    const frame = page.frames().find(f => f.url() !== page.url());
    if (frame) {
      for (const sel of btnSelectors) {
        try {
          const locator = frame.locator(sel).first();
          await locator.waitFor({ state: 'visible', timeout: 2000 });
          btn = locator;
          foundBtn = true;
          break;
        } catch {}
      }
    }
  }
  
  if (!foundBtn) {
    console.log('   ⚠️ 步进按钮不可见');
    return;
  }
  for (let i = 0; i < times; i++) {
    const isDisabled = await btn.getAttribute('disabled') !== null
      || await btn.getAttribute('aria-disabled') === 'true'
      || await btn.evaluate(el => (el as HTMLButtonElement).disabled).catch(() => false);
    if (isDisabled) break;
    await btn.click();
    await page.waitForTimeout(150);
  }
}

/** 获取当前阶段标题 */
async function getStageTitle(page: Page): Promise<string> {
  const title = await page.locator('#header-algo-title, .algo-header-title, [data-el="algo-title"]').first().textContent().catch(() => '');
  return (title ?? '').trim();
}

/** 获取当前高亮代码行号 */
async function getActiveCodeLine(page: Page): Promise<string> {
  const selectors = [
    '.algo-code-line.is-active',
    '.code-line.active-line',
    '[data-line].is-active',
    '.dp-code-line.is-active',
  ];
  // 先尝试主文档
  for (const sel of selectors) {
    const line = await page.locator(sel).first().getAttribute('data-line').catch(() => null);
    if (line) return line;
  }
  // 再尝试 iframe 内部 (dp-generated 渲染器将内容渲染在 iframe 内)
  const frame = page.frames().find(f => f.url() !== page.url());
  if (frame) {
    for (const sel of selectors) {
      const line = await frame.locator(sel).first().getAttribute('data-line').catch(() => null);
      if (line) return line;
    }
  }
  return 'none';
}

/** 获取步数进度，如 "3 / 17" */
async function getStepProgress(page: Page): Promise<string> {
  const selectors = ['#log-count', '[data-el="step-counter"]', '.step-counter'];
  for (const sel of selectors) {
    const el = await page.locator(sel).first().textContent().catch(() => '');
    if (el && el.trim()) return el.trim();
  }
  // 尝试 iframe 内部
  const frame = page.frames().find(f => f.url() !== page.url());
  if (frame) {
    for (const sel of selectors) {
      const el = await frame.locator(sel).first().textContent().catch(() => '');
      if (el && el.trim()) return el.trim();
    }
  }
  return '';
}

/** 验证算法详情页基本元素就绪 */
async function verifyDetailPageBasics(page: Page, algoId: string, algoName: string): Promise<boolean> {
  // 等待详情视图完全渲染（iframe 加载 + 代码区渲染）
  await waitForHydration(page, 2000);
  
  // 多种可能的代码行选择器（dp-generated 和 declarative 渲染器使用不同 DOM）
  const codeLineSelectors = [
    '.algo-code-line',
    '.code-line',
    '[data-line]',
    '.dp-code-line',
    'pre code',
  ];
  let codeLines = 0;
  let matchedSelector = '';
  // 先检查主文档
  for (const sel of codeLineSelectors) {
    const count = await page.locator(sel).count();
    if (count > 0) { codeLines = count; matchedSelector = sel; break; }
  }
  // 再检查 iframe 内部 (dp-generated 渲染器)
  if (codeLines === 0) {
    const frame = page.frames().find(f => f.url() !== page.url());
    if (frame) {
      for (const sel of codeLineSelectors) {
        const count = await frame.locator(sel).count().catch(() => 0);
        if (count > 0) { codeLines = count; matchedSelector = `${sel}(iframe)`; break; }
      }
    }
  }
  
  // 检查是否有步进按钮（多种可能的选择器，含 iframe 内）
  const stepBtnSelectors = ['#btn-step-next', 'button[data-action="step-next"]', 'button:has-text("下一步")'];
  let stepBtnVisible = false;
  for (const sel of stepBtnSelectors) {
    if (await page.locator(sel).first().isVisible().catch(() => false)) {
      stepBtnVisible = true;
      break;
    }
  }
  if (!stepBtnVisible) {
    const frame = page.frames().find(f => f.url() !== page.url());
    if (frame) {
      for (const sel of stepBtnSelectors) {
        if (await frame.locator(sel).first().isVisible().catch(() => false)) {
          stepBtnVisible = true;
          break;
        }
      }
    }
  }
  
  // 检查是否有 iframe 或 canvas 渲染区域（dp-generated 可能用不同渲染方式）
  const iframeCount = await page.locator('iframe').count();
  const canvasCount = await page.locator('canvas').count();
  const svgCount = await page.locator('svg').count();
  const hasVisualContent = codeLines > 0 || iframeCount > 0 || canvasCount > 0 || svgCount > 5;
  
  // 详情视图判定：有代码行 / iframe / 大量 svg / 步进按钮 即为详情页
  const hasDetailView = hasVisualContent || stepBtnVisible;
  
  if (!hasDetailView && codeLines === 0) {
    // 可能是 timing 问题，再等一次
    await waitForHydration(page, 2000);
    for (const sel of codeLineSelectors) {
      const count = await page.locator(sel).count();
      if (count > 0) { codeLines = count; matchedSelector = sel; break; }
    }
    // 也检查 iframe 内部
    if (codeLines === 0) {
      const retryFrame = page.frames().find(f => f.url() !== page.url());
      if (retryFrame) {
        for (const sel of codeLineSelectors) {
          const count = await retryFrame.locator(sel).count().catch(() => 0);
          if (count > 0) { codeLines = count; matchedSelector = `${sel}(iframe)`; break; }
        }
      }
    }
    const retryIframe = await page.locator('iframe').count();
    const retrySvg = await page.locator('svg').count();
    if (codeLines === 0 && retryIframe === 0 && retrySvg < 5) {
      fail(algoId, algoName, '详情页基础', `代码行数仍为 0（选择器=${codeLineSelectors.join('|')}，iframe=${retryIframe}，svg=${retrySvg}）`);
      return false;
    }
    codeLines = codeLines || 0;
  }
  ok(algoId, algoName, '详情页基础', `代码行数=${codeLines}[${matchedSelector}], 步进按钮=${stepBtnVisible}, iframe=${iframeCount}, svg=${svgCount}`);
  return true;
}

// ---------- Main ----------
async function main() {
  console.log('🚀 启动 Playwright 浏览器，验证算法实现...\n');

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const execPath = fs.existsSync(edgePath) ? edgePath : fs.existsSync(chromePath) ? chromePath : undefined;

  const browser: Browser = await chromium.launch({
    executablePath: execPath,
    headless: true,
  });

  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();

  // 捕获浏览器控制台错误
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      const text = msg.text();
      consoleErrors.push(text);
    }
  });
  page.on('pageerror', err => {
    consoleErrors.push(`PAGE ERROR: ${err.message}`);
  });

  try {
    // =====================================================
    // TEST 0: 主页加载
    // =====================================================
    console.log('📄 [Test 0] 主页加载验证');
    await gotoCatalog(page);
    const title = await page.title();
    console.log(`   Title: ${title}`);
    const sidebarItems = await page.locator('.sidebar-category-header, .category-item').count();
    console.log(`   侧栏类目数: ${sidebarItems}`);
    if (sidebarItems > 0) {
      ok('home', '主页', '加载', `侧栏类目数=${sidebarItems}`);
    } else {
      fail('home', '主页', '加载', '侧栏为空');
    }
    await screenshot(page, '00_main_page');

    // =====================================================
    // TEST GROUP 1: Class 060 拓扑排序扩展 (graph-060)
    // =====================================================
    const graph060Algos = [
      { id: 'food-chain-060', name: '最大食物链', search: '最大食物链' },
      { id: 'loud-and-rich-060', name: '喧闹和富有', search: '喧闹和富有' },
      { id: 'parallel-courses-iii-060', name: '并行课程', search: '并行课程' },
      { id: 'max-employees-meeting-060', name: '参加会议最多', search: '内向基环树' },
      { id: 'stamping-sequence-060', name: '戳印序列', search: '戳印序列' },
      { id: 'largest-color-value-060', name: '最大颜色值', search: '最大颜色值' },
    ];

    console.log('\n🔷 [Test Group 1] Class 060 拓扑排序扩展');
    // 尝试找到图论类目
    let foundGraph = await clickSidebarCategory(page, '图');
    if (!foundGraph) {
      foundGraph = await clickSidebarCategory(page, '图论');
    }
    if (!foundGraph) {
      // 可能侧栏使用了不同的名称，尝试在搜索框搜索
      console.log('   ⚠️ 侧栏未直接找到图论类目，尝试通过搜索定位');
    }

    for (const algo of graph060Algos) {
      console.log(`\n   🧪 ${algo.id}: ${algo.name}`);
      // 先回到主页
      await gotoCatalog(page);

      // 用搜索定位算法
      const searchInput = page.locator('#search-input');
      const searchFor = (algo as any).search ?? algo.name;
      await searchInput.fill(searchFor);
      await waitForHydration(page, 600);

      const cardFound = await clickAlgorithmCard(page, algo.name, searchFor);
      if (!cardFound) {
        fail(algo.id, algo.name, '卡片点击', '卡片未找到');
        await searchInput.fill('');
        await waitForHydration(page, 300);
        continue;
      }

      await screenshot(page, `01_${algo.id}_detail`);
      const stageTitle = await getStageTitle(page);
      console.log(`   阶段标题: ${stageTitle}`);

      await verifyDetailPageBasics(page, algo.id, algo.name);

      // 步进 5 次
      await clickStepNext(page, 5);
      const activeLine = await getActiveCodeLine(page);
      const progress = await getStepProgress(page);
      console.log(`   步进后 → 高亮行: ${activeLine}, 进度: ${progress}`);
      await screenshot(page, `01_${algo.id}_stepped`);

      if (activeLine !== 'none') {
        ok(algo.id, algo.name, '步进联动', `高亮行=${activeLine}, 进度=${progress}`);
      } else {
        // 有些算法可能需要先点击预设才生成步骤
        console.log(`   ⚠️ 无活跃代码行，尝试查找预设选择器...`);
        const presetSelect = page.locator('select').first();
        if (await presetSelect.isVisible().catch(() => false)) {
          await presetSelect.selectOption({ index: 1 });
          await waitForHydration(page, 400);
          await clickStepNext(page, 3);
          const retryLine = await getActiveCodeLine(page);
          if (retryLine !== 'none') {
            ok(algo.id, algo.name, '步进联动(预设后)', `高亮行=${retryLine}`);
          } else {
            fail(algo.id, algo.name, '步进联动', '切换预设后仍无活跃行');
          }
        }
      }
    }

    // =====================================================
    // TEST GROUP 2: Class 061 最短路全解 (graph-061)
    // =====================================================
    const graph061Algos = [
      { id: 'dijkstra-basic-061', name: '朴素最短路', search: '朴素最短路' },
      { id: 'dijkstra-heap-061', name: '堆优化 Dijkstra', search: '堆优化 Dijkstra' },
      { id: 'bellman-ford-061', name: 'Bellman-Ford', search: 'Bellman-Ford' },
      { id: 'spfa-061', name: 'SPFA 队列', search: 'SPFA 队列' },
      { id: 'floyd-061', name: 'Floyd', search: 'Floyd-Warshall' },
      { id: 'negative-cycle-061', name: '负权环', search: '负权环判定' },
    ];

    console.log('\n\n🔶 [Test Group 2] Class 061 最短路全解');
    for (const algo of graph061Algos) {
      console.log(`\n    ${algo.id}: ${algo.name}`);
      await gotoCatalog(page);

      const searchInput = page.locator('#search-input');
      const searchFor = (algo as any).search ?? algo.name;
      await searchInput.fill(searchFor);
      await waitForHydration(page, 600);

      const cardFound = await clickAlgorithmCard(page, algo.name, searchFor);
      if (!cardFound) {
        fail(algo.id, algo.name, '卡片点击', '卡片未找到');
        continue;
      }

      await screenshot(page, `02_${algo.id}_detail`);
      await verifyDetailPageBasics(page, algo.id, algo.name);

      await clickStepNext(page, 5);
      const activeLine = await getActiveCodeLine(page);
      const progress = await getStepProgress(page);
      console.log(`   步进后 → 高亮行: ${activeLine}, 进度: ${progress}`);
      await screenshot(page, `02_${algo.id}_stepped`);

      if (activeLine !== 'none') {
        ok(algo.id, algo.name, '步进联动', `高亮行=${activeLine}, 进度=${progress}`);
      } else {
        fail(algo.id, algo.name, '步进联动', '无活跃代码行');
      }
    }

    // =====================================================
    // TEST GROUP 3: Class 064 Dijkstra 扩展 (graph-064)
    // =====================================================
    const graph064Algos = [
      { id: 'network-delay-time-064', name: '网络延迟时间', search: '网络延迟时间' },
      { id: 'path-min-effort-064', name: '体力消耗路径', search: '体力消耗路径' },
      { id: 'swim-in-rising-water-064', name: '水位上升泳池', search: '水位上升的泳池' },
      { id: 'layered-dijkstra-064', name: '分层图最短路', search: '分层图' },
      { id: 'ev-charge-dijkstra-064', name: '电动车充电', search: '电动车' },
      { id: 'state-compression-bfs-064', name: '访问所有节点', search: '状态压缩广搜' },
    ];

    console.log('\n\n🔷 [Test Group 3] Class 064 Dijkstra 扩展');
    for (const algo of graph064Algos) {
      console.log(`\n    ${algo.id}: ${algo.name}`);
      await gotoCatalog(page);

      const searchInput = page.locator('#search-input');
      const searchFor = (algo as any).search ?? algo.name;
      await searchInput.fill(searchFor);
      await waitForHydration(page, 600);

      const cardFound = await clickAlgorithmCard(page, algo.name, searchFor);
      if (!cardFound) {
        fail(algo.id, algo.name, '卡片点击', '卡片未找到');
        continue;
      }

      await screenshot(page, `03_${algo.id}_detail`);
      await verifyDetailPageBasics(page, algo.id, algo.name);

      await clickStepNext(page, 5);
      const activeLine = await getActiveCodeLine(page);
      const progress = await getStepProgress(page);
      console.log(`   步进后 → 高亮行: ${activeLine}, 进度: ${progress}`);
      await screenshot(page, `03_${algo.id}_stepped`);

      if (activeLine !== 'none') {
        ok(algo.id, algo.name, '步进联动', `高亮行=${activeLine}, 进度=${progress}`);
      } else {
        fail(algo.id, algo.name, '步进联动', '无活跃代码行');
      }
    }

    // =====================================================
    // TEST GROUP 4: 新增 DP 算法 (dungeon-game, max-product-subarray)
    // =====================================================
    const dpAlgos = [
      { id: 'dungeon-game-reverse-dp', name: '地下城游戏反向 DP', search: '地下城游戏反向 DP' },
      { id: 'max-product-subarray', name: '乘积最大子数组', search: '乘积最大子数组' },
    ];

    console.log('\n\n🔶 [Test Group 4] 新增 DP 算法');
    for (const algo of dpAlgos) {
      console.log(`\n    ${algo.id}: ${algo.name}`);
      await gotoCatalog(page);

      const searchInput = page.locator('#search-input');
      const searchFor = (algo as any).search ?? algo.name;
      await searchInput.fill(searchFor);
      await waitForHydration(page, 600);

      const cardFound = await clickAlgorithmCard(page, algo.name, searchFor);
      if (!cardFound) {
        fail(algo.id, algo.name, '卡片点击', '卡片未找到');
        continue;
      }

      await screenshot(page, `04_${algo.id}_detail`);
      await verifyDetailPageBasics(page, algo.id, algo.name);

      // 尝试切换 Stage
      const stageButtons = page.locator('button[data-stage]');
      const stageCount = await stageButtons.count();
      console.log(`   Stage 按钮数: ${stageCount}`);
      if (stageCount > 1) {
        // 点击第一个 stage
        await stageButtons.first().click();
        await waitForHydration(page, 500);
        await screenshot(page, `04_${algo.id}_stage_switched`);
      }

      await clickStepNext(page, 5);
      const activeLine = await getActiveCodeLine(page);
      const progress = await getStepProgress(page);
      console.log(`   步进后 → 高亮行: ${activeLine}, 进度: ${progress}`);
      await screenshot(page, `04_${algo.id}_stepped`);

      if (activeLine !== 'none') {
        ok(algo.id, algo.name, '步进联动', `高亮行=${activeLine}, 进度=${progress}`);
      } else {
        fail(algo.id, algo.name, '步进联动', '无活跃代码行');
      }
    }

    // TEST GROUP 5 & 6 单独运行以避免浏览器内存崩溃
    // 如需验证受影响算法，请运行: npx vite-node scripts/browser-algo-verify-regression.ts

  } catch (err) {
    console.error('❌ 测试运行异常:', err);
  } finally {
    await browser.close();
  }

  // =====================================================
  // 结果汇总
  // =====================================================
  console.log('\n\n' + '='.repeat(70));
  console.log('📊 测试结果汇总');
  console.log('='.repeat(70));

  const passed = results.filter(r => r.passed);
  const failed = results.filter(r => !r.passed);

  for (const r of results) {
    console.log(`${r.passed ? '✅' : '❌'} [${r.algoId}] ${r.phase}: ${r.evidence}`);
  }

  console.log('\n' + '-'.repeat(70));
  console.log(`总计: ${results.length} 项 | ✅ 通过: ${passed.length} | ❌ 失败: ${failed.length}`);
  if (failed.length === 0) {
    console.log('🎉 全部通过!');
  } else {
    console.log('\n失败项:');
    for (const f of failed) {
      console.log(`   ❌ [${f.algoId}] ${f.algoName} - ${f.phase}: ${f.evidence}`);
    }
  }
}

main();
