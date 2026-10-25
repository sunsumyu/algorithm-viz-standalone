import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: true, channel: 'msedge' });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  await page.addInitScript(() => {
    localStorage.setItem(
      'alg_viz_client_license_v1',
      'eyJ2IjoxLCJ1aWQiOiJERVYtTE9DQUwiLCJleHAiOjAsInVzZXJfaWQiOiJWSVBfVVNFUl82Nzc3NjIiLCJ0aWVyIjozfQ.bNkOSGU6mJ_FU1c6cairP6nuCwSPw4khvOiy84TPqvHXZwFHNif8Z9HtwWtd4cmBVx_qi4q2AEhgSeRv21KCAQ'
    );
  });

  await page.goto('http://localhost:23300/', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  await page.evaluate(async () => {
    const vEngine = (window as any).viewMountEngine;
    if (vEngine?.showAlgorithm) {
      await vEngine.showAlgorithm('coins-from-piles');
    }
  });
  await page.waitForTimeout(2500);

  const frame = page.frameLocator('iframe').first();
  await frame.locator('#slider-progress').waitFor({ state: 'visible' });

  // 等待 slider-progress 的 max 变为 > 0
  for (let i = 0; i < 20; i++) {
    const maxVal = await frame.locator('#slider-progress').getAttribute('max');
    if (Number(maxVal) > 0) break;
    await page.waitForTimeout(200);
  }

  const results: any[] = [];
  for (let stepIdx = 18; stepIdx <= 24; stepIdx++) {
    await frame.locator('#slider-progress').fill(String(stepIdx));
    await frame.locator('#slider-progress').dispatchEvent('input');
    await frame.locator('#slider-progress').dispatchEvent('change');
    await page.waitForTimeout(300);

    const info = await frame.locator('body').evaluate(() => {
      const activeLine = document.querySelector('.code-line.active, .code-line.is-active') as HTMLElement | null;
      return {
        lineNum: activeLine?.getAttribute('data-line'),
        text: activeLine?.querySelector('.algo-code-line-text')?.textContent?.trim() || activeLine?.textContent?.trim(),
      };
    });
    results.push({ stepIdx, stepNumber: stepIdx + 1, ...info });
  }

  console.log(JSON.stringify(results, null, 2));
  await browser.close();
}

main().catch(console.error);
