/**
 * 面板等比缩放核验 (Splitter Proportional Resize Verification)
 *  1. valid-bst 声明式布局（.dsp-main-layout 网格）：1920 全屏 -> 1200 -> 900 逐级缩窗
 *  2. 断言左右面板占比全程保持（等比智能缩放），严禁右面板固定 px 挤压左侧
 *  3. 恢复大窗口后占比同样保持（双向缩放）
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'D:/tmp/algo-viz-splitter-resize';
const BASE_URL = 'http://localhost:23300';

interface Measure {
  viewport: number;
  leftW: number;
  rightW: number;
  rightRatio: number;
}

const pageErrors: string[] = [];

async function findBrowserExecutable(): Promise<string | undefined> {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return undefined;
}

async function main(): Promise<void> {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const browser = await chromium.launch({ executablePath: await findBrowserExecutable(), headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const page = await context.newPage();
  await context.addInitScript(() => {
    const payload = { v: 1, uid: 'splitter-resize-test', exp: 0, user_id: 'tester', tier: 3 };
    localStorage.setItem('alg_viz_client_license_v1', btoa(JSON.stringify(payload)) + '.mock-signature');
    // 清空分割条历史记忆，确保从黄金默认（大屏 50%）出发
    sessionStorage.clear();
    Object.keys(localStorage).filter((k) => k.startsWith('algo-splitter:')).forEach((k) => localStorage.removeItem(k));
  });
  page.on('pageerror', (err) => pageErrors.push(String(err)));

  const measure = async (w: number, h: number): Promise<Measure> => {
    await page.setViewportSize({ width: w, height: h });
    await page.waitForTimeout(650); // 等待 ResizeObserver 回调与布局稳定
    return await page.evaluate((vw: number) => {
      const layout = document.querySelector('.dsp-main-layout') as HTMLElement | null;
      const left = document.querySelector('.dsp-left-section') as HTMLElement | null;
      const right = document.querySelector('.dsp-right-section') as HTMLElement | null;
      const total = layout?.clientWidth || 1;
      const leftW = left?.clientWidth || 0;
      const rightW = right?.clientWidth || 0;
      return { viewport: vw, leftW, rightW, rightRatio: Number((rightW / total).toFixed(3)) };
    }, w);
  };

  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2500);
    await page.evaluate(async () => {
      await (window as any).viewMountEngine.showAlgorithm('valid-bst');
    });
    await page.waitForSelector('.dsp-main-layout', { timeout: 15000 });
    await page.waitForTimeout(900);

    const samples: Measure[] = [];
    for (const [w, h] of [[1920, 1080], [1400, 900], [1200, 800], [900, 700], [1200, 800], [1920, 1080]] as const) {
      const m = await measure(w, h);
      samples.push(m);
      console.log(`📐 viewport=${w}x${h} -> 左=${m.leftW}px 右=${m.rightW}px 右占比=${(m.rightRatio * 100).toFixed(1)}%`);
    }

    // 等比断言：任意相邻采样占比漂移 <= 8%（clamp 边界允许小幅偏移）
    const findings: string[] = [];
    for (let i = 1; i < samples.length; i++) {
      const drift = Math.abs(samples[i].rightRatio - samples[0].rightRatio);
      if (drift > 0.08) {
        findings.push(`viewport=${samples[i].viewport} 占比 ${(samples[i].rightRatio * 100).toFixed(1)}% 偏离基准 ${(samples[0].rightRatio * 100).toFixed(1)}% 超限 ${(drift * 100).toFixed(1)}pp`);
      }
    }
    // 小窗口下右面板严禁保持全屏时的绝对像素（等比后应显著变小）
    const full = samples[0];
    const small = samples.find((s) => s.viewport === 900)!;
    if (small.rightW >= full.rightW * 0.85) {
      findings.push(`小窗口右面板 ${small.rightW}px ≈ 全屏 ${full.rightW}px（固定像素未缩放）`);
    }
    if (small.leftW < 300) {
      findings.push(`小窗口左面板被挤压至 ${small.leftW}px (<300px)`);
    }

    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'resize-small-900.png') });

    console.log('\n================ 等比缩放核验汇总 ================');
    console.log(`pageerror: ${pageErrors.length}`);
    pageErrors.slice(0, 5).forEach((e) => console.log(`   [pageerror] ${e.slice(0, 160)}`));
    console.log(`findings: ${findings.length}`);
    findings.forEach((f) => console.log(`   🚨 ${f}`));
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'result.json'), JSON.stringify({ samples, findings, pageErrors }, null, 2));
    process.exit(findings.length > 0 || pageErrors.length > 0 ? 2 : 0);
  } finally {
    await browser.close();
  }
}

main().catch((e) => {
  console.error('核验脚本崩溃:', e);
  process.exit(1);
});
