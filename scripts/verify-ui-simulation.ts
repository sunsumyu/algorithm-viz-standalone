import { chromium } from 'playwright';

async function main() {
  console.log('[Playwright] Launching browser...');
  const browser = await chromium.launch({
    headless: true,
    channel: 'msedge',
  });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  page.on('console', (msg) => {
    console.log(`[Browser Console ${msg.type()}]:`, msg.text());
  });

  page.on('pageerror', (err) => {
    console.error('[Browser Error]:', err.message);
  });

  // Inject license before page load
  await page.addInitScript(() => {
    localStorage.setItem(
      'alg_viz_client_license_v1',
      'eyJ2IjoxLCJ1aWQiOiJERVYtTE9DQUwiLCJleHAiOjAsInVzZXJfaWQiOiJWSVBfVVNFUl82Nzc3NjIiLCJ0aWVyIjozfQ.bNkOSGU6mJ_FU1c6cairP6nuCwSPw4khvOiy84TPqvHXZwFHNif8Z9HtwWtd4cmBVx_qi4q2AEhgSeRv21KCAQ'
    );
  });

  console.log('[Playwright] Navigating to http://localhost:3000/...');
  await page.goto('http://localhost:3000/', { waitUntil: 'domcontentloaded', timeout: 30000 });

  // Wait for application UI to initialize
  await page.waitForTimeout(2000);

  // Search or click for graph theory algorithm
  console.log('[Playwright] Evaluating page state...');
  const pageState = await page.evaluate(async () => {
    const reg = (window as any).algorithmRegistry;
    const vEngine = (window as any).viewMountEngine;
    return {
      title: document.title,
      algorithmCount: reg ? reg.getAllMetadata().length : 0,
      activeViewId: vEngine ? vEngine.getCurrentViewId?.() : null,
    };
  });
  console.log('[Playwright] Initial page state:', pageState);

  // Mount dfs-theory directly via showAlgorithm
  console.log('[Playwright] Calling showAlgorithm("dfs-theory")...');
  const mountResult = await page.evaluate(async () => {
    try {
      const vEngine = (window as any).viewMountEngine;
      if (vEngine) {
        const viz = await vEngine.showAlgorithm('dfs-theory');
        return { success: !!viz, hasViz: !!viz };
      }
      return { success: false, error: 'viewMountEngine not found' };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });
  console.log('[Playwright] Mount result:', mountResult);

  await page.waitForTimeout(1500);

  // Check what rendered
  const uiInspection = await page.evaluate(() => {
    const card1 = document.querySelector('.dsp-card1-sandbox, .dsp-card1, [class*="card1"]');
    const svg = document.querySelector('svg');
    const card2 = document.querySelector('.dsp-card2-metrics, .dsp-card2, [class*="card2"]');
    const codePanel = document.querySelector('.code-terminal, .dsp-code-panel, #code-panel');
    const allButtons = Array.from(document.querySelectorAll('button')).map((b) => ({
      text: b.textContent?.trim(),
      id: b.id,
      className: b.className,
      title: b.title,
    }));
    
    return {
      hasCard1: !!card1,
      card1Classes: card1?.className,
      hasSvg: !!svg,
      svgViewBox: svg?.getAttribute('viewBox'),
      svgBoundingBox: svg ? { width: svg.getBoundingClientRect().width, height: svg.getBoundingClientRect().height } : null,
      hasCard2: !!card2,
      card2TextSnippet: card2?.textContent?.slice(0, 300),
      hasCodePanel: !!codePanel,
      codeLinesCount: document.querySelectorAll('.code-line, [class*="code-line"]').length,
      activeCodeLine: document.querySelector('.active-code-line, .highlight-line, .code-line.active')?.textContent?.trim(),
      allButtons: allButtons.filter((b) => b.text || b.title || b.id).slice(0, 25),
    };
  });

  console.log('[Playwright] UI Inspection:', JSON.stringify(uiInspection, null, 2));

  // Capture Full HD screenshot
  console.log('[Playwright] Capturing screenshot...');
  const screenshotPath = 'F:/chain/algorithm-viz-standalone/scripts/dfs-theory-screenshot.png';
  await page.screenshot({ path: screenshotPath, fullPage: true });
  console.log('[Playwright] Saved screenshot to', screenshotPath);

  // Simulate stepping operations: click "单步" button
  console.log('[Playwright] Clicking #btn-step-next 3 times...');
  for (let i = 1; i <= 3; i++) {
    await page.evaluate(() => {
      const nextBtn = document.getElementById('btn-step-next');
      if (nextBtn) nextBtn.click();
    });
    await page.waitForTimeout(400);
  }

  // Inspect after stepping
  const afterStep = await page.evaluate(() => {
    const currentActiveLine = document.querySelector('.active-code-line, .highlight-line, .code-line.active, tr.active')?.textContent?.trim();
    const card2Text = document.querySelector('.dsp-card2-metrics, .dsp-card2')?.textContent?.trim();
    const svgState = Array.from(document.querySelectorAll('.dfs-node-group text')).map((t) => t.textContent?.trim());
    return {
      activeLine: currentActiveLine,
      card2Summary: card2Text?.slice(0, 200),
      svgLabels: svgState,
    };
  });
  console.log('[Playwright] After 3 Steps Inspection:', afterStep);

  // Capture second screenshot after stepping
  const screenshot2Path = 'F:/chain/algorithm-viz-standalone/scripts/dfs-theory-step3-screenshot.png';
  await page.screenshot({ path: screenshot2Path, fullPage: true });
  console.log('[Playwright] Saved step 3 screenshot to', screenshot2Path);

  // --- Test BFS Theory ---
  console.log('[Playwright] Calling showAlgorithm("bfs-theory")...');
  await page.evaluate(async () => {
    const vEngine = (window as any).viewMountEngine;
    if (vEngine) await vEngine.showAlgorithm('bfs-theory');
  });
  await page.waitForTimeout(1000);
  for (let i = 1; i <= 3; i++) {
    await page.evaluate(() => {
      const nextBtn = document.getElementById('btn-step-next');
      if (nextBtn) nextBtn.click();
    });
    await page.waitForTimeout(300);
  }
  const bfsScreenshotPath = 'F:/chain/algorithm-viz-standalone/scripts/bfs-theory-screenshot.png';
  await page.screenshot({ path: bfsScreenshotPath, fullPage: true });
  console.log('[Playwright] Saved BFS screenshot to', bfsScreenshotPath);

  // --- Test Graph Theory ---
  console.log('[Playwright] Calling showAlgorithm("graph-theory")...');
  await page.evaluate(async () => {
    const vEngine = (window as any).viewMountEngine;
    if (vEngine) await vEngine.showAlgorithm('graph-theory');
  });
  await page.waitForTimeout(1000);
  for (let i = 1; i <= 3; i++) {
    await page.evaluate(() => {
      const nextBtn = document.getElementById('btn-step-next');
      if (nextBtn) nextBtn.click();
    });
    await page.waitForTimeout(300);
  }
  const gtScreenshotPath = 'F:/chain/algorithm-viz-standalone/scripts/graph-theory-screenshot.png';
  await page.screenshot({ path: gtScreenshotPath, fullPage: true });
  console.log('[Playwright] Saved Graph Theory screenshot to', gtScreenshotPath);

  await browser.close();
  console.log('[Playwright] All UI simulations completed successfully.');
}

main().catch((err) => {
  console.error('[Playwright] Fatal error:', err);
  process.exit(1);
});
