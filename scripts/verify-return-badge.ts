/**
 * 返回徽章顶层抽象核验 (ReturnStepDecorator Visual Verification)
 *  1. valid-bst（声明式树路径，用户截图场景）：全量步进，核验返回帧 ↩ 徽章挂载/清除/return-line 联动
 *  2. tree-diameter（声明式 DP 路径，return down + right 后序归约）：核验徽章跨类目生效
 *  3. 全程 1920×1080 全高清视口 + 独立无头隔离，零桌面污染
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'D:/tmp/algo-viz-return-badge';
const BASE_URL = 'http://localhost:23300';

interface StepRecord {
  idx: string;
  raw: string;
  hasBadge: boolean;
  isReturnLine: boolean;
  live: string;
}

interface Finding {
  algo: string;
  severity: 'P0' | 'P1' | 'P2';
  desc: string;
  evidence: string;
}
const findings: Finding[] = [];
const pageErrors: string[] = [];

function addFinding(algo: string, severity: Finding['severity'], desc: string, evidence: string): void {
  findings.push({ algo, severity, desc, evidence });
  console.log(`   🚨 [${severity}] ${algo}: ${desc} | ${evidence}`);
}

async function findBrowserExecutable(): Promise<string | undefined> {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  ];
  for (const c of candidates) if (fs.existsSync(c)) return c;
  return undefined;
}

async function walkAllSteps(page: import('playwright').Page, algoId: string, maxSteps = 400): Promise<StepRecord[]> {
  const opened = await page.evaluate(async (id: string) => {
    const engine = (window as any).viewMountEngine;
    const viz = await engine.showAlgorithm(id);
    return viz ? 'ok' : 'failed';
  }, algoId);
  if (opened !== 'ok') throw new Error(`mount failed for ${algoId}`);
  await page.waitForSelector('#btn-step-next', { timeout: 15000 });
  await page.waitForTimeout(900);

  const records: StepRecord[] = [];
  for (let i = 0; i < maxSteps; i++) {
    const disabled = await page.evaluate(() => (document.getElementById('btn-step-next') as HTMLButtonElement)?.disabled);
    if (disabled) break;
    await page.click('#btn-step-next');
    await page.waitForTimeout(18);
    const rec = await page.evaluate(() => ({
      idx: document.getElementById('step-cur')?.textContent || String(i),
      raw: ((document.querySelector('.code-line.active') as HTMLElement | null)?.dataset?.raw || '').trim(),
      hasBadge: !!document.querySelector('.code-line.active .code-return-icon'),
      isReturnLine: !!document.querySelector('.code-line.active.return-line'),
      live: (document.getElementById('dsp-live-text')?.textContent || '').trim(),
    }));
    records.push(rec);
  }
  return records;
}

function analyze(records: StepRecord[], algoId: string, shotDir: string): void {
  const badgeSteps = records.filter((r) => r.hasBadge);
  console.log(`   步数=${records.length} 返回徽章步=${badgeSteps.length}`);

  // 全量打印徽章帧供人工复核误报
  badgeSteps.forEach((r) =>
    console.log(`      ↩ #${r.idx} raw="${r.raw.slice(0, 58)}" live="${r.live.slice(0, 58)}"`),
  );

  if (badgeSteps.length === 0) {
    addFinding(algoId, 'P0', '全量步进未出现任何返回徽章帧', `total=${records.length}`);
    return;
  }

  // 徽章与 return-line 紫色返回行必须严格联动
  const desync = badgeSteps.filter((r) => !r.isReturnLine);
  if (desync.length > 0) {
    addFinding(algoId, 'P1', '存在 hasBadge 但缺 return-line 紫色返回行的失联帧', JSON.stringify(desync.slice(0, 3)));
  }

  // 跨步残留防护：徽章帧之后必须存在被干净清除的后续帧
  const lastBadgeIdx = records.reduce((acc, r, i) => (r.hasBadge ? i : acc), -1);
  if (lastBadgeIdx >= 0 && lastBadgeIdx < records.length - 1) {
    const after = records[lastBadgeIdx + 1];
    if (after.hasBadge) {
      addFinding(algoId, 'P2', '返回徽章帧后的下一帧仍残留徽章（可能连续两帧均为返回帧，人工复核）', JSON.stringify(after));
    } else {
      console.log(`   ✅ 清除联动: 徽章帧 #${records[lastBadgeIdx].idx} -> 下一帧 #${after.idx} 徽章已清除`);
    }
  }

  // 文本兜底分类抽检：live 解说含「返回」的帧应出现徽章（软校验，仅报告）
  const textReturnSteps = records.filter((r) => r.live.includes('返回'));
  const missed = textReturnSteps.filter((r) => !r.hasBadge);
  console.log(`   文本含「返回」帧=${textReturnSteps.length} 其中无徽章=${missed.length}`);
  missed.slice(0, 5).forEach((m) =>
    console.log(`      ⚠️ #${m.idx} raw="${m.raw.slice(0, 60)}" live="${m.live.slice(0, 70)}"`),
  );

  // 截图：首个返回徽章帧
  const firstBadge = badgeSteps[0];
  console.log(`   首个返回帧: #${firstBadge.idx} raw="${firstBadge.raw.slice(0, 70)}" live="${firstBadge.live.slice(0, 70)}"`);
}

async function main(): Promise<void> {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const execPath = await findBrowserExecutable();
  const browser = await chromium.launch({ executablePath: execPath, headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const page = await context.newPage();

  await context.addInitScript(() => {
    const payload = { v: 1, uid: 'return-badge-test', exp: 0, user_id: 'tester', tier: 3 };
    localStorage.setItem('alg_viz_client_license_v1', btoa(JSON.stringify(payload)) + '.mock-signature');
  });

  page.on('pageerror', (err) => pageErrors.push(String(err)));
  const shot = async (name: string) => page.screenshot({ path: path.join(ARTIFACT_DIR, name) });

  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2500);

    // 视口初始化检查（browser-viewport-debugging 契约 1.2）
    const vp = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      isLgActive: window.innerWidth >= 1024,
    }));
    console.log(`📐 视口: ${vp.innerWidth}x${vp.innerHeight} lg双栏=${vp.isLgActive}`);
    if (vp.innerWidth !== 1920 || vp.innerHeight !== 1080) {
      addFinding('viewport', 'P1', '视口未达全高清 1920×1080', JSON.stringify(vp));
    }

    // ============ 用例 1: valid-bst（声明式树路径） ============
    console.log('🌳 用例 1: valid-bst 全量步进 ...');
    const bstRecords = await walkAllSteps(page, 'valid-bst');
    analyze(bstRecords, 'valid-bst', ARTIFACT_DIR);
    const bstBadgeIdx = bstRecords.findIndex((r) => r.hasBadge);
    if (bstBadgeIdx >= 0) {
      // 回退到首个徽章帧前的现场重新步进到该帧进行截图
      await page.evaluate(async (id: string) => {
        const engine = (window as any).viewMountEngine;
        await engine.showAlgorithm(id);
      }, 'valid-bst');
      await page.waitForTimeout(700);
      for (let i = 0; i <= bstBadgeIdx; i++) {
        const disabled = await page.evaluate(() => (document.getElementById('btn-step-next') as HTMLButtonElement)?.disabled);
        if (disabled) break;
        await page.click('#btn-step-next');
        await page.waitForTimeout(16);
      }
      await page.waitForTimeout(350);
      const codeBox = await page.locator('.terminal-body, #code-view-container').first().boundingBox();
      if (codeBox) {
        await page.screenshot({
          path: path.join(ARTIFACT_DIR, 'valid-bst-return-badge.png'),
          clip: { x: Math.max(0, codeBox.x - 12), y: Math.max(0, codeBox.y - 12), width: codeBox.width + 24, height: Math.min(1080, codeBox.height + 24) },
        });
      }
      await shot('valid-bst-return-full.png');
      console.log('   📸 已截图 valid-bst-return-badge.png / valid-bst-return-full.png');
    }

    // ============ 用例 2: path-sum（声明式回溯路径：递归下探 + 返回撤销） ============
    console.log('🌲 用例 2: path-sum 全量步进 ...');
    const diaRecords = await walkAllSteps(page, 'path-sum');
    analyze(diaRecords, 'path-sum', ARTIFACT_DIR);
    const diaBadgeIdx = diaRecords.findIndex((r) => r.hasBadge);
    if (diaBadgeIdx >= 0) {
      await page.evaluate(async (id: string) => {
        const engine = (window as any).viewMountEngine;
        await engine.showAlgorithm(id);
      }, 'path-sum');
      await page.waitForTimeout(700);
      for (let i = 0; i <= diaBadgeIdx; i++) {
        const disabled = await page.evaluate(() => (document.getElementById('btn-step-next') as HTMLButtonElement)?.disabled);
        if (disabled) break;
        await page.click('#btn-step-next');
        await page.waitForTimeout(16);
      }
      await page.waitForTimeout(350);
      const codeBox = await page.locator('.terminal-body, #code-view-container').first().boundingBox();
      if (codeBox) {
        await page.screenshot({
          path: path.join(ARTIFACT_DIR, 'path-sum-return-badge.png'),
          clip: { x: Math.max(0, codeBox.x - 12), y: Math.max(0, codeBox.y - 12), width: codeBox.width + 24, height: Math.min(1080, codeBox.height + 24) },
        });
      }
      console.log('   📸 已截图 path-sum-return-badge.png');
    } else {
      await shot('path-sum-no-badge.png');
    }

    // ============ 汇总 ============
    console.log('\n================ 返回徽章核验汇总 ================');
    console.log(`pageerror: ${pageErrors.length}`);
    pageErrors.slice(0, 8).forEach((e) => console.log(`   [pageerror] ${e.slice(0, 200)}`));
    console.log(`findings: ${findings.length}`);
    findings.forEach((f, i) => console.log(`   ${i + 1}. [${f.severity}][${f.algo}] ${f.desc} | ${f.evidence.slice(0, 160)}`));

    fs.writeFileSync(path.join(ARTIFACT_DIR, 'findings.json'), JSON.stringify({ findings, pageErrors }, null, 2));
  } finally {
    await browser.close();
  }
  process.exit(findings.some((f) => f.severity !== 'P2') || pageErrors.length > 0 ? 2 : 0);
}

main().catch((e) => {
  console.error('核验脚本崩溃:', e);
  process.exit(1);
});
