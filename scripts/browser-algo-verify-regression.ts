/**
 * 浏览器回归验证：GridUniquePathsCompiler 和 TwoPassNeighborStepCompiler 受影响算法
 */
import { chromium, type Browser, type Page } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

const VIEWPORT = { width: 1920, height: 1080 };
const BASE_URL = 'http://localhost:3000';
const SCREENSHOT_DIR = path.join(process.cwd(), 'screenshots');

if (!fs.existsSync(SCREENSHOT_DIR)) fs.mkdirSync(SCREENSHOT_DIR);

interface TestResult { algoId: string; algoName: string; phase: string; passed: boolean; evidence: string; }
const results: TestResult[] = [];

const ok = (algoId: string, name: string, phase: string, evidence: string) => results.push({ algoId, algoName: name, phase, passed: true, evidence });
const fail = (algoId: string, name: string, phase: string, evidence: string) => results.push({ algoId, algoName: name, phase, passed: false, evidence });

async function screenshot(page: Page, name: string) {
  const p = path.join(SCREENSHOT_DIR, `reg_${name}.png`);
  await page.screenshot({ path: p, fullPage: true });
  console.log(`   📸 ${p}`);
}

async function waitForHydration(page: Page, ms = 800) {
  await page.waitForTimeout(ms);
}

async function gotoCatalog(page: Page) {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await waitForHydration(page, 1500);
}

async function clickAlgorithmCard(page: Page, algoName: string, searchExact: string = algoName): Promise<boolean> {
  const searchInput = page.locator('#search-input');
  await searchInput.fill(searchExact);
  await waitForHydration(page, 1000);

  const cards = page.locator('.algo-card');
  const count = await cards.count();
  
  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const cardText = await card.textContent().catch(() => '');
    // Check if the card contains the algorithm name (anywhere in the text)
    if (cardText.includes(algoName)) {
      await card.scrollIntoViewIfNeeded();
      await page.waitForTimeout(300);
      await card.click();
      await page.waitForTimeout(2000);
      return true;
    }
  }
  return false;
}

async function getActiveCodeLine(page: Page): Promise<string> {
  const selectors = ['.algo-code-line.is-active', '.code-line.active-line', '[data-line].is-active'];
  for (const sel of selectors) {
    const line = await page.locator(sel).first().getAttribute('data-line').catch(() => null);
    if (line) return line;
  }
  const frame = page.frames().find(f => f.url() !== page.url());
  if (frame) {
    for (const sel of selectors) {
      const line = await frame.locator(sel).first().getAttribute('data-line').catch(() => null);
      if (line) return line;
    }
  }
  // Fallback: check for inline style highlighting
  const allFrames = [page, ...(frame ? [frame] : [])];
  for (const ctx of allFrames) {
    const lines = await ctx.locator('.code-line').all();
    for (const line of lines) {
      const style = await line.getAttribute('style').catch(() => '');
      if (style && style.includes('rgba(37, 99, 235')) {
        const dataLine = await line.getAttribute('data-line').catch(() => null);
        if (dataLine) return dataLine;
      }
    }
  }
  // Fallback: check Physics HUD
  const hudLine = await page.locator('.physics-hud, [data-el="physics-hud"]').locator('text=Code Line:').textContent().catch(() => '');
  const lineMatch = hudLine.match(/Line (\d+)/);
  if (lineMatch) return lineMatch[1];
  return 'none';
}

async function getStepProgress(page: Page): Promise<string> {
  const selectors = ['#log-count', '[data-el="step-counter"]', '.step-counter'];
  for (const sel of selectors) {
    const el = await page.locator(sel).first().textContent().catch(() => '');
    if (el && el.trim()) return el.trim();
  }
  const frame = page.frames().find(f => f.url() !== page.url());
  if (frame) {
    for (const sel of selectors) {
      const el = await frame.locator(sel).first().textContent().catch(() => '');
      if (el && el.trim()) return el.trim();
    }
  }
  return '';
}

async function verifyDetailPageBasics(page: Page, algoId: string, algoName: string): Promise<boolean> {
  await waitForHydration(page, 2000);

  const codeLineSelectors = ['.algo-code-line', '.code-line', '[data-line]'];
  let codeLines = 0;
  let matchedSelector = '';
  for (const sel of codeLineSelectors) {
    const count = await page.locator(sel).count();
    if (count > 0) { codeLines = count; matchedSelector = sel; break; }
  }
  if (codeLines === 0) {
    const frame = page.frames().find(f => f.url() !== page.url());
    if (frame) {
      for (const sel of codeLineSelectors) {
        const count = await frame.locator(sel).count().catch(() => 0);
        if (count > 0) { codeLines = count; matchedSelector = `${sel}(iframe)`; break; }
      }
    }
  }

  const stepBtnSelectors = ['#btn-step-next', 'button[data-action="step-next"]', 'button:has-text("下一步")', 'button:has-text("▶")'];
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

  const iframeCount = await page.locator('iframe').count();
  const svgCount = await page.locator('svg').count();
  const hasVisualContent = codeLines > 0 || iframeCount > 0 || svgCount > 5 || stepBtnVisible;

  if (!hasVisualContent && codeLines === 0) {
    await waitForHydration(page, 2000);
    for (const sel of codeLineSelectors) {
      const count = await page.locator(sel).count();
      if (count > 0) { codeLines = count; matchedSelector = sel; break; }
    }
    const retryIframe = await page.locator('iframe').count();
    const retrySvg = await page.locator('svg').count();
    if (codeLines === 0 && retryIframe === 0 && retrySvg < 5) {
      fail(algoId, algoName, '详情页基础', `代码行数仍为 0（iframe=${retryIframe}，svg=${retrySvg}）`);
      return false;
    }
  }
  ok(algoId, algoName, '详情页基础', `代码行数=${codeLines}[${matchedSelector}], 步进按钮=${stepBtnVisible}, iframe=${iframeCount}, svg=${svgCount}`);
  return true;
}

async function clickStepNext(page: Page, times: number) {
  const btnSelectors = ['#btn-step-next', 'button[data-action="step-next"]', 'button:has-text("下一步")', 'button:has-text("▶")'];
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
  // Try iframe
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

async function testAlgo(page: Page, algo: { id: string; name: string; search: string }) {
  console.log(`\n    ${algo.id}: ${algo.name}`);
  await gotoCatalog(page);

  const searchInput = page.locator('#search-input');
  await searchInput.fill(algo.search);
  await waitForHydration(page, 600);

  const cardFound = await clickAlgorithmCard(page, algo.name, algo.search);
  if (!cardFound) {
    fail(algo.id, algo.name, '卡片点击', '卡片未找到');
    return;
  }

  await screenshot(page, `${algo.id}_detail`);
  await verifyDetailPageBasics(page, algo.id, algo.name);

  // Check if we need to apply parameters first (for algorithms with input controls)
  const progress = await getStepProgress(page);
  if (progress === '0 / 0' || progress === '') {
    // Only try clicking "应用" button if step counter is 0/0
    const applyBtn = page.locator('button:has-text("应用")').first();
    const applyBtnCount = await applyBtn.count();
    const applyBtnVisible = applyBtnCount > 0 && await applyBtn.isVisible().catch(() => false);
    console.log(`   [info] Progress=${progress}, ApplyBtn count=${applyBtnCount}, visible=${applyBtnVisible}`);
    if (applyBtnVisible) {
      console.log('   [info] Clicking 应用 button to generate steps...');
      await applyBtn.click();
      await waitForHydration(page, 2000);
    }
  }

  await clickStepNext(page, 5);
  const activeLine = await getActiveCodeLine(page);
  const finalProgress = await getStepProgress(page);
  console.log(`    步进后 → 高亮行: ${activeLine}, 进度: ${finalProgress}`);
  await screenshot(page, `${algo.id}_stepped`);

  if (activeLine !== 'none') {
    ok(algo.id, algo.name, '步进联动', `高亮行=${activeLine}, 进度=${finalProgress}`);
  } else {
    fail(algo.id, algo.name, '步进联动', '无活跃代码行');
  }
}

async function main() {
  console.log('🚀 回归验证：GridUniquePathsCompiler & TwoPassNeighborStepCompiler 受影响算法\n');

  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const execPath = fs.existsSync(edgePath) ? edgePath : fs.existsSync(chromePath) ? chromePath : undefined;

  const browser: Browser = await chromium.launch({ executablePath: execPath, headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await context.newPage();

  try {
    // Group 5: GridUniquePathsCompiler 受影响算法
    const gridAlgos = [
      { id: 'unique-paths', name: '不同路径', search: '不同路径' },
      { id: 'unique-paths-ii', name: '不同路径 II', search: '不同路径 II' },
      { id: 'min-path-sum', name: '最小路径和', search: '最小路径和' },
    ];

    console.log('🔷 [Group 5] GridUniquePathsCompiler 受影响算法');
    for (const algo of gridAlgos) await testAlgo(page, algo);

    // Group 6: TwoPassNeighborStepCompiler 受影响算法
    const twoPassAlgos = [
      { id: 'candy', name: '分发糖果', search: '分发糖果' },
      { id: 'monotone-digits', name: '单调递增的数字', search: '单调递增的数字' },
      { id: 'wiggle-subsequence', name: '摆动序列', search: '摆动序列' },
    ];

    console.log('\n🔷 [Group 6] TwoPassNeighborStepCompiler 受影响算法');
    for (const algo of twoPassAlgos) await testAlgo(page, algo);

  } catch (err) {
    console.error('❌ 测试运行异常:', err);
  } finally {
    await browser.close();
  }

  console.log('\n\n' + '='.repeat(70));
  console.log('📊 回归测试结果汇总');
  console.log('='.repeat(70));

  const passed = results.filter(r => r.passed);
  const failed = results.filter(r => !r.passed);

  for (const r of results) {
    console.log(`${r.passed ? '✅' : '❌'} [${r.algoId}] ${r.phase}: ${r.evidence}`);
  }

  console.log('\n' + '-'.repeat(70));
  console.log(`总计: ${results.length} 项 | ✅ 通过: ${passed.length} | ❌ 失败: ${failed.length}`);
  if (failed.length === 0) console.log('🎉 全部通过!');
  else {
    console.log('\n失败项:');
    for (const r of failed) console.log(`   ❌ [${r.algoId}] ${r.algoName} - ${r.phase}: ${r.evidence}`);
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
