/**
 * Valid BST 点击测试 · 第三轮（收尾核实）
 *  1. null 探针步悬停与画布 ∅ 探针渲染
 *  2. 预设 4「隐蔽跨层违规」全量步进 -> 违规结论 + 输出 false
 *  3. 预设 3「多层完整合法」全量步进 -> Accepted + true
 *  4. SVG 沙盘滚轮缩放 + 步进后缩放持久化
 *  5. 日志卡 Splitter 收缩溢出检测（.dsp-log-card）
 *  6. 404 资源 URL 捕获
 *  7. init 行号核实（新增映射是否接线）
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'D:/tmp/algo-viz-click-test';
const BASE_URL = 'http://localhost:23300';

interface Finding {
  area: string;
  severity: 'P0' | 'P1' | 'P2';
  desc: string;
  evidence: string;
}
const findings: Finding[] = [];
const pageErrors: string[] = [];
const notFoundResources: string[] = [];

function addFinding(area: string, severity: Finding['severity'], desc: string, evidence: string): void {
  findings.push({ area, severity, desc, evidence });
  console.log(`   🚨 [${severity}] ${area}: ${desc} | ${evidence}`);
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

async function openValidBst(page: import('playwright').Page): Promise<void> {
  const opened = await page.evaluate(async () => {
    const engine = (window as any).viewMountEngine;
    const viz = await engine.showAlgorithm('valid-bst');
    return viz ? 'ok' : 'failed';
  });
  if (opened !== 'ok') throw new Error('mount failed');
  await page.waitForSelector('#btn-step-next', { timeout: 15000 });
  await page.waitForTimeout(900);
}

async function stepToEnd(page: import('playwright').Page, maxSteps = 300): Promise<void> {
  for (let i = 0; i < maxSteps; i++) {
    const disabled = await page.evaluate(() => (document.getElementById('btn-step-next') as HTMLButtonElement)?.disabled);
    if (disabled) return;
    await page.click('#btn-step-next');
    await page.waitForTimeout(12);
  }
}

async function main(): Promise<void> {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const execPath = await findBrowserExecutable();
  const browser = await chromium.launch({ executablePath: execPath, headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const page = await context.newPage();

  await context.addInitScript(() => {
    const payload = { v: 1, uid: 'click-test', exp: 0, user_id: 'tester', tier: 3 };
    localStorage.setItem('alg_viz_client_license_v1', btoa(JSON.stringify(payload)) + '.mock-signature');
  });

  page.on('pageerror', (err) => pageErrors.push(String(err)));
  page.on('response', (res) => {
    if (res.status() === 404) notFoundResources.push(res.url());
  });
  const shot = async (name: string) => page.screenshot({ path: path.join(ARTIFACT_DIR, name) });

  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2500);
    await openValidBst(page);

    // ============ T1: init 行号核实 ============
    console.log('🔎 T1: init 步行号核实 ...');
    const initLine = await page.evaluate(() => {
      // 重置到第 1 步
      return {
        count: document.getElementById('log-count')?.textContent || '',
        active: document.querySelector('.code-line.active')?.getAttribute('data-line'),
        raw: (document.querySelector('.code-line.active') as HTMLElement | null)?.dataset?.raw || '',
      };
    });
    console.log(`   第 1 步: count="${initLine.count}" active=L${initLine.active} raw="${initLine.raw.trim()}"`);
    if (initLine.active !== '2') {
      addFinding('init行号', 'P2', `init 映射(java:2) 未接线：第 1 步高亮 L${initLine.active}（entry）而非 L2 prev=null 初始化行`, initLine.raw.trim());
    }

    // ============ T2: null 探针步 ============
    console.log('🖱️ T2: null 探针步悬停与 ∅ 渲染 ...');
    let nullStepInfo: any = null;
    for (let i = 0; i < 60; i++) {
      const disabled = await page.evaluate(() => (document.getElementById('btn-step-next') as HTMLButtonElement)?.disabled);
      if (disabled) break;
      await page.click('#btn-step-next');
      await page.waitForTimeout(25);
      const probe = await page.evaluate(() => {
        const live = document.getElementById('dsp-live-text')?.textContent || '';
        const active = document.querySelector('.code-line.active');
        const sandbox = document.getElementById('dsp-sandbox-container');
        const nodeCount = sandbox ? sandbox.querySelectorAll('svg circle, svg g[class*=node], svg text').length : -1;
        return {
          live: live.slice(0, 80),
          raw: (active as HTMLElement | null)?.dataset?.raw || '',
          nodeCount,
          hasNullProbeHint: live.includes('空') || live.includes('null') || live.includes('∅'),
        };
      });
      if (probe.raw.includes('root == null') && (probe.live.includes('基底判空') || (probe.live.includes('为空') && !probe.live.includes('非空') && !probe.live.includes('未命中')))) {
        nullStepInfo = probe;
        break;
      }
    }
    if (!nullStepInfo) {
      console.log('   （未找到 root==null 探针步，回退查找）');
    } else {
      console.log(`   null 步: raw="${nullStepInfo.raw.trim()}" live="${nullStepInfo.live}" 节点数=${nullStepInfo.nodeCount}`);
      await shot('r3_t2_null_step.png');
      const rootTok = page.locator('.code-line.active .algo-code-ident', { hasText: /^root$/ }).first();
      if (await rootTok.count()) {
        await rootTok.hover();
        await page.waitForTimeout(450);
        const tip = await page.evaluate(() => {
          const t = document.getElementById('algo-debug-hover-tooltip');
          return { visible: t ? t.style.display !== 'none' && t.style.opacity !== '0' : false, text: t?.textContent || '' };
        });
        console.log(`   hover root(null步) -> visible=${tip.visible} text="${tip.text.slice(0, 160)}"`);
        if (!tip.visible) {
          addFinding('nullProbe悬停', 'P1', 'null 探针步悬停 root 无 tooltip', nullStepInfo.raw);
        } else if (!tip.text.includes('null') && !tip.text.includes('空')) {
          addFinding('nullProbe悬停', 'P2', 'null 探针步 root tooltip 未显示空语义', tip.text.slice(0, 160));
        }
        await page.mouse.move(10, 10);
      }
    }

    // ============ T3: 预设 4 隐蔽跨层违规 ============
    console.log('📋 T3: 预设4 隐蔽跨层违规 全量步进 ...');
    await page.selectOption('.dsp-preset-select, #dsp-preset-select', '3');
    await page.waitForTimeout(1500);
    await stepToEnd(page, 300);
    await page.waitForTimeout(400);
    const illegal = await page.evaluate(() => {
      const live = document.getElementById('dsp-live-text')?.textContent || '';
      const outVal = document.getElementById('dsp-output-val')?.textContent || '';
      const outStatus = document.getElementById('dsp-output-status')?.textContent || '';
      const count = document.getElementById('log-count')?.textContent || '';
      const metrics = Array.from(document.querySelectorAll('.dsp-metrics-grid .dsp-metric-value')).map((el) => el.textContent?.trim());
      return { live: live.slice(0, 140), outVal, outStatus, count, metrics };
    });
    console.log(`   终态: out="${illegal.outVal}" status="${illegal.outStatus}" count="${illegal.count}"`);
    console.log(`   live="${illegal.live}"`);
    console.log(`   metrics=${JSON.stringify(illegal.metrics)}`);
    if (illegal.outVal !== 'false') {
      addFinding('违规用例', 'P1', `隐蔽跨层违规 (10,5,15,null,null,6,20) 最终输出应为 false，实际 "${illegal.outVal}"`, illegal.count);
    }
    const allText = illegal.live + illegal.outStatus + JSON.stringify(illegal.metrics);
    if (!allText.includes('false') && !allText.includes('违规') && !allText.includes('非法') && !allText.includes('不合法')) {
      addFinding('违规用例', 'P2', '隐蔽跨层违规终态缺少违规结论表述', allText.slice(0, 140));
    }
    await shot('r3_t3_illegal_end.png');

    // ============ T4: 预设 2 多层完整合法 ============
    console.log('📋 T4: 预设2 多层完整合法 全量步进 ...');
    await page.selectOption('.dsp-preset-select, #dsp-preset-select', '2');
    await page.waitForTimeout(1500);
    await stepToEnd(page, 300);
    await page.waitForTimeout(400);
    const legal = await page.evaluate(() => {
      const live = document.getElementById('dsp-live-text')?.textContent || '';
      const outVal = document.getElementById('dsp-output-val')?.textContent || '';
      const outStatus = document.getElementById('dsp-output-status')?.textContent || '';
      const count = document.getElementById('log-count')?.textContent || '';
      return { live: live.slice(0, 120), outVal, outStatus, count };
    });
    console.log(`   终态: out="${legal.outVal}" status="${legal.outStatus}" count="${legal.count}" live="${legal.live}"`);
    if (legal.outVal !== 'true') {
      addFinding('合法用例', 'P1', `多层完整合法 (10,5,15,3,7,12,18) 最终输出应为 true，实际 "${legal.outVal}"`, legal.count);
    }
    await shot('r3_t4_legal_end.png');

    // ============ T5: SVG 滚轮缩放 + 持久化 ============
    console.log('🔍 T5: SVG 滚轮缩放与持久化 ...');
    const sbBox = await page.locator('#dsp-sandbox-container').boundingBox();
    if (sbBox) {
      const measure = () =>
        page.evaluate(() => {
          const svg = document.querySelector('#dsp-sandbox-container svg');
          if (!svg) return { hasSvg: false };
          const circles = svg.querySelectorAll('circle');
          if (circles.length === 0) return { hasSvg: true, circles: 0 };
          const c = circles[0] as SVGCircleElement;
          const r = c.getBoundingClientRect();
          const g = svg.querySelector('g[transform]') as SVGGElement | null;
          return { hasSvg: true, circles: circles.length, firstR: Math.round(r.width), gTransform: g?.getAttribute('transform') || '' };
        });
      const before = await measure();
      console.log(`   缩放前: ${JSON.stringify(before)}`);
      await page.mouse.move(sbBox.x + sbBox.width / 2, sbBox.y + sbBox.height / 2);
      for (let i = 0; i < 4; i++) {
        await page.mouse.wheel(0, -120);
        await page.waitForTimeout(130);
      }
      const after = await measure();
      console.log(`   缩放后: ${JSON.stringify(after)}`);
      const zoomChanged =
        before.firstR !== after.firstR || (before.gTransform || '') !== (after.gTransform || '');
      if (!zoomChanged && after.circles > 0) {
        addFinding('画布缩放', 'P2', '滚轮缩放后 SVG 节点尺寸/transform 未变化（缩放无效?）', `${JSON.stringify(before)} -> ${JSON.stringify(after)}`);
      }
      // 步进 2 次检查缩放持久化（若处于终点则回退，避免 next 禁用）
      await page.click('#btn-step-prev');
      await page.waitForTimeout(350);
      await page.click('#btn-step-prev');
      await page.waitForTimeout(500);
      const persisted = await measure();
      console.log(`   步进后: ${JSON.stringify(persisted)}`);
      const persistedOk =
        (persisted.firstR === after.firstR && (persisted.gTransform || '') === (after.gTransform || '')) ||
        Math.abs((persisted.firstR || 0) - (after.firstR || 0)) <= 1;
      if (!persistedOk && persisted.circles > 0) {
        addFinding('缩放持久化', 'P2', `步进后缩放被重置: 缩放后 firstR=${after.firstR}/transform="${after.gTransform}" -> 步进后 firstR=${persisted.firstR}/transform="${persisted.gTransform}"`, '');
      }
      await shot('r3_t5_zoom_persist.png');
    }

    // ============ T6: 日志卡 Splitter 收缩 ============
    console.log('↕️ T6: 日志卡 Splitter 收缩 ...');
    const vSplits = page.locator('.algo-splitter-vertical');
    const vCount = await vSplits.count();
    for (let si = 0; si < vCount; si++) {
      const box = await vSplits.nth(si).boundingBox();
      if (!box) continue;
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 130, { steps: 8 });
      await page.mouse.up();
      await page.waitForTimeout(450);
      const state = await page.evaluate(() => {
        const probe = (el: HTMLElement | null) =>
          el ? { h: el.offsetHeight, overflow: el.scrollHeight - el.clientHeight } : null;
        const monitor = document.querySelector('.dsp-left-section .dsp-card:last-child') as HTMLElement | null;
        const log = document.querySelector('.dsp-log-card') as HTMLElement | null;
        return { monitor: probe(monitor), log: probe(log) };
      });
      console.log(`   shrink splitter#${si} -> monitor=${JSON.stringify(state.monitor)} log=${JSON.stringify(state.log)}`);
      if (state.log && state.log.overflow > 6) {
        addFinding('日志卡收缩', 'P1', `splitter#${si} 下拖后日志卡内容溢出 ${state.log.overflow}px`, JSON.stringify(state.log));
      }
    }
    await shot('r3_t6_logcard_shrunk.png');

    // ============ 汇总 ============
    console.log('\n================ 第三轮汇总 ================');
    console.log(`pageerror: ${pageErrors.length}`);
    pageErrors.slice(0, 8).forEach((e) => console.log(`   [pageerror] ${e.slice(0, 200)}`));
    console.log(`404 资源: ${notFoundResources.length}`);
    Array.from(new Set(notFoundResources)).slice(0, 8).forEach((u) => console.log(`   [404] ${u}`));
    console.log(`findings: ${findings.length}`);
    findings.forEach((f, i) => console.log(`   ${i + 1}. [${f.severity}][${f.area}] ${f.desc} | ${f.evidence}`));

    fs.writeFileSync(path.join(ARTIFACT_DIR, 'r3-findings.json'), JSON.stringify({ findings, pageErrors, notFoundResources }, null, 2));
  } finally {
    await browser.close();
  }
  process.exit(findings.some((f) => f.severity !== 'P2') || pageErrors.length > 0 ? 2 : 0);
}

main().catch((e) => {
  console.error('测试脚本崩溃:', e);
  process.exit(1);
});
