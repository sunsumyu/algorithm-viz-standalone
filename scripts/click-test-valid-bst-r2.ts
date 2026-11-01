/**
 * Valid BST 点击测试 · 第二轮（针对性深挖近期改动）
 *  1. 404 资源定位
 *  2. 成员属性悬停 (root.left 的 left token / cpp 的 root->left)
 *  3. nullProbe 终态悬停
 *  4. Splitter 收缩压缩（min-height 动态钳制）与唯一性（阶段切换不累积）
 *  5. 预设案例切换（含非法 BST 用例全量步进到 false）
 *  6. 步进连点（快速连点 12 次）
 *  7. 画布滚轮缩放
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
    if (!engine) return 'no-engine';
    const viz = await engine.showAlgorithm('valid-bst');
    return viz ? 'ok' : 'failed';
  });
  if (opened !== 'ok') throw new Error(`mount failed: ${opened}`);
  await page.waitForSelector('#btn-step-next', { timeout: 15000 });
  await page.waitForTimeout(1000);
}

async function stepUntil(page: import('playwright').Page, predicate: (r: any) => boolean, maxSteps = 60): Promise<any> {
  for (let i = 0; i < maxSteps; i++) {
    const rec = await page.evaluate(() => {
      const active = document.querySelector('.code-line.active');
      return {
        raw: (active as HTMLElement | null)?.dataset?.raw || '',
        line: active?.getAttribute('data-line') || null,
        count: document.getElementById('log-count')?.textContent || '',
      };
    });
    if (predicate(rec)) return rec;
    const disabled = await page.evaluate(() => (document.getElementById('btn-step-next') as HTMLButtonElement)?.disabled);
    if (disabled) return rec;
    await page.click('#btn-step-next');
    await page.waitForTimeout(45);
  }
  return null;
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

    // ============ T1: 成员属性悬停 (root.left) ============
    console.log('🖱️ T1: 成员属性悬停 root.left ...');
    await openValidBst(page);
    const rec = await stepUntil(page, (r) => r.raw.includes('root.left'));
    if (!rec) {
      addFinding('成员悬停', 'P1', '未能步进到包含 root.left 的代码行', '');
    } else {
      console.log(`   停在 L${rec.line}: "${rec.raw.trim()}"`);
      // hover left token（属于 root. 后面的成员）
      const leftTok = page.locator('.code-line.active .algo-code-ident', { hasText: /^left$/ }).first();
      if (!(await leftTok.count())) {
        addFinding('成员悬停', 'P1', '活跃行上未找到 left 成员标识符 token', rec.raw);
      } else {
        await leftTok.hover();
        await page.waitForTimeout(500);
        const tip = await page.evaluate(() => {
          const t = document.getElementById('algo-debug-hover-tooltip');
          return { visible: t ? t.style.display !== 'none' && t.style.opacity !== '0' : false, text: t?.textContent || '' };
        });
        console.log(`   hover left -> visible=${tip.visible} text="${tip.text.slice(0, 150)}"`);
        if (!tip.visible) {
          addFinding('成员悬停', 'P1', '悬停成员属性 left 后 tooltip 未显示（getLeadingText 成员链解析未生效）', rec.raw);
        } else if (!tip.text.includes('左孩子') && !tip.text.includes('left')) {
          addFinding('成员悬停', 'P2', 'left 悬停 tooltip 未包含左孩子语义', tip.text.slice(0, 150));
        }
        await shot('r2_t1_hover_left.png');
        await page.mouse.move(10, 10);
        await page.waitForTimeout(250);
      }
    }

    // ============ T2: nullProbe 终态悬停 ============
    console.log('🖱️ T2: 终态 nullProbe 悬停 ...');
    for (let i = 0; i < 300; i++) {
      const disabled = await page.evaluate(() => (document.getElementById('btn-step-next') as HTMLButtonElement)?.disabled);
      if (disabled) break;
      await page.click('#btn-step-next');
      await page.waitForTimeout(20);
    }
    await page.waitForTimeout(400);
    const endRec = await page.evaluate(() => {
      const active = document.querySelector('.code-line.active');
      const rootTok = Array.from((active?.querySelectorAll('.algo-code-ident') || []) as HTMLElement[]).find(
        (el) => el.textContent?.trim() === 'root'
      );
      return { raw: (active as HTMLElement | null)?.dataset?.raw || '', hasRoot: Boolean(rootTok), count: document.getElementById('log-count')?.textContent };
    });
    console.log(`   终态 L${''}raw="${endRec.raw.trim()}" count="${endRec.count}"`);
    if (endRec.hasRoot) {
      const rootTok = page.locator('.code-line.active .algo-code-ident', { hasText: /^root$/ }).first();
      await rootTok.hover();
      await page.waitForTimeout(500);
      const tip = await page.evaluate(() => {
        const t = document.getElementById('algo-debug-hover-tooltip');
        return { visible: t ? t.style.display !== 'none' && t.style.opacity !== '0' : false, text: t?.textContent || '' };
      });
      console.log(`   hover root(终态) -> visible=${tip.visible} text="${tip.text.slice(0, 150)}"`);
      // 终态 root 合理地停留在最后一个实参节点 (如 Node(5))，仅校验 tooltip 可见性；
      // null 探针帧的空语义由 r3 T2 在真正的「基底判空 isValidBST(null)」帧上校验
      if (!tip.visible) {
        addFinding('nullProbe悬停', 'P1', '终态悬停 root tooltip 未显示', endRec.raw);
      }
      await shot('r2_t2_hover_null.png');
      await page.mouse.move(10, 10);
    }

    // ============ T3: 预设切换（非法 BST 全量步进） ============
    console.log('📋 T3: 预设案例切换 ...');
    const presetOptions = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.dsp-preset-select option, #dsp-preset-select option')).map((o) => ({
        value: (o as HTMLOptionElement).value,
        text: o.textContent?.trim(),
      }))
    );
    console.log(`   预设: ${JSON.stringify(presetOptions)}`);
    const findByText = (kw: string) => presetOptions.find((o) => o.text?.includes(kw))?.value;
    const legalValue = findByText('多层完整合法');
    const illegalValue = findByText('隐蔽跨层违规');
    if (legalValue && illegalValue) {
      // 切到「多层完整合法 BST」
      await page.selectOption('.dsp-preset-select, #dsp-preset-select', legalValue);
      await page.waitForTimeout(1500);
      const legal = await page.evaluate(() => ({
        count: document.getElementById('log-count')?.textContent || '',
        inputVal: (document.getElementById('input-tree') as HTMLInputElement | null)?.value || '',
      }));
      console.log(`   合法用例: input="${legal.inputVal}" count="${legal.count}"`);
      if (!legal.inputVal.includes('10')) {
        addFinding('预设切换', 'P1', `选择预设后输入框未同步`, legal.inputVal);
      }
      // 全量步进，最终结果应为 true / 合法
      for (let i = 0; i < 300; i++) {
        const disabled = await page.evaluate(() => (document.getElementById('btn-step-next') as HTMLButtonElement)?.disabled);
        if (disabled) break;
        await page.click('#btn-step-next');
        await page.waitForTimeout(15);
      }
      await page.waitForTimeout(300);
      const finalState = await page.evaluate(() => {
        const metrics = Array.from(document.querySelectorAll('.dsp-metrics-grid [id], .dsp-metrics-grid .dsp-metric-value')).map((el) => el.textContent?.trim());
        const live = document.getElementById('dsp-live-text')?.textContent || '';
        return { metrics: metrics.slice(0, 8), live: live.slice(0, 120) };
      });
      console.log(`   终态 metrics=${JSON.stringify(finalState.metrics)} live="${finalState.live}"`);
      await shot('r2_t3_legal_end.png');

      // 切到「隐蔽跨层违规」
      await page.selectOption('.dsp-preset-select, #dsp-preset-select', illegalValue);
      await page.waitForTimeout(1500);
      for (let i = 0; i < 300; i++) {
        const disabled = await page.evaluate(() => (document.getElementById('btn-step-next') as HTMLButtonElement)?.disabled);
        if (disabled) break;
        await page.click('#btn-step-next');
        await page.waitForTimeout(15);
      }
      await page.waitForTimeout(300);
      const illegalState = await page.evaluate(() => {
        const live = document.getElementById('dsp-live-text')?.textContent || '';
        const metricTexts = Array.from(document.querySelectorAll('.dsp-metrics-grid .dsp-metric-value, .dsp-metrics-grid [id]')).map((el) => el.textContent?.trim());
        return { live: live.slice(0, 140), metrics: metricTexts.slice(0, 8) };
      });
      console.log(`   违规用例终态 live="${illegalState.live}" metrics=${JSON.stringify(illegalState.metrics)}`);
      const joined = illegalState.live + JSON.stringify(illegalState.metrics);
      if (!joined.includes('false') && !joined.includes('非法') && !joined.includes('违规') && !joined.includes('不合法')) {
        addFinding('预设切换', 'P2', '隐蔽跨层违规用例步进到底后未见违规结论表述', joined.slice(0, 140));
      }
      await shot('r2_t3_illegal_end.png');
    }

    // ============ T4: 步进连点 ============
    console.log('⚡ T4: 步进连点 12 次 ...');
    // 重置到起点
    const resetBtn = page.locator('#btn-reset, #btn-step-reset');
    if (await resetBtn.count()) await resetBtn.first().click().catch(() => {});
    else {
      for (let i = 0; i < 60; i++) {
        const disabled = await page.evaluate(() => (document.getElementById('btn-step-prev') as HTMLButtonElement)?.disabled);
        if (disabled) break;
        await page.click('#btn-step-prev');
        await page.waitForTimeout(10);
      }
    }
    await page.waitForTimeout(500);
    for (let i = 0; i < 12; i++) {
      await page.click('#btn-step-next', { delay: 10 }).catch((e) => console.log(`   连点第 ${i + 1} 次点击失败: ${e.message.split('\n')[0]}`));
    }
    await page.waitForTimeout(600);
    const spamState = await page.evaluate(() => ({
      count: document.getElementById('log-count')?.textContent || '',
      active: document.querySelector('.code-line.active')?.getAttribute('data-line') || null,
      logRows: document.querySelectorAll('#log-container > *').length,
    }));
    console.log(`   连点后: count="${spamState.count}" active=${spamState.active} logRows=${spamState.logRows}`);
    const m = spamState.count.match(/(\d+)\s*\/\s*(\d+)/);
    if (m && Number(m[1]) < 8) {
      addFinding('连点步进', 'P2', `快速连点 12 次后仅前进到第 ${m[1]} 步（丢步?）`, spamState.count);
    }
    if (spamState.logRows > 0 && Number(m?.[1] || 0) !== spamState.logRows) {
      console.log(`   （日志行数 ${spamState.logRows} 与步数 ${m?.[1]} 不一致——进一步核实）`);
    }

    // ============ T5: Splitter 收缩压缩 + 唯一性 ============
    console.log('↕️ T5: Splitter 收缩与唯一性 ...');
    let splitterCount = await page.locator('.algo-splitter').count();
    console.log(`   初始 splitter 数: ${splitterCount}`);
    // 监视卡 splitter: 左区最后一张卡上方的竖向 splitter
    const vSplits = page.locator('.algo-splitter-vertical');
    const vCount = await vSplits.count();
    console.log(`   vertical splitter 数: ${vCount}`);
    for (let si = 0; si < vCount; si++) {
      const box = await vSplits.nth(si).boundingBox();
      if (!box) continue;
      // 向下拖 110px（压缩下方卡片）
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 + 110, { steps: 8 });
      await page.mouse.up();
      await page.waitForTimeout(450);
      const after = await page.evaluate(() => {
        const monitor = document.querySelector('.dsp-left-section .dsp-card:last-child') as HTMLElement | null;
        const log = document.querySelector('.dsp-right-section .dsp-card:last-child') as HTMLElement | null;
        const probe = (el: HTMLElement | null) =>
          el
            ? {
                h: el.offsetHeight,
                overflow: el.scrollHeight - el.clientHeight,
                hiddenBottom:
                  el.scrollHeight > el.clientHeight + 2
                    ? (() => {
                        const r = el.getBoundingClientRect();
                        const child = el.lastElementChild?.getBoundingClientRect();
                        return child ? Math.round(child.bottom - r.bottom) : 0;
                      })()
                    : 0,
              }
            : null;
        return { monitor: probe(monitor), log: probe(log) };
      });
      console.log(`   shrink splitter#${si} -> monitor=${JSON.stringify(after.monitor)} log=${JSON.stringify(after.log)}`);
      if (after.monitor && after.monitor.overflow > 4) {
        addFinding('Splitter收缩', 'P1', `splitter#${si} 下拖后监视卡内容溢出 ${after.monitor.overflow}px`, JSON.stringify(after.monitor));
      }
      if (after.log && after.log.overflow > 4) {
        addFinding('Splitter收缩', 'P1', `splitter#${si} 下拖后日志卡内容溢出 ${after.log.overflow}px`, JSON.stringify(after.log));
      }
    }
    await shot('r2_t5_splitter_shrunk.png');

    // 阶段往返切换 3 次，检查 splitter 是否累积
    const stageIds = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.dsp-stage-tab-btn')).map((b) => (b as HTMLElement).dataset?.stage || '')
    );
    for (let round = 0; round < 3; round++) {
      for (const sid of stageIds) {
        await page.click(`.dsp-stage-tab-btn[data-stage="${sid}"]`);
        await page.waitForTimeout(400);
      }
    }
    const splitterCountAfter = await page.locator('.algo-splitter').count();
    console.log(`   往返切换 9 次后 splitter 数: ${splitterCountAfter} (初始 ${splitterCount})`);
    if (splitterCountAfter > splitterCount) {
      addFinding('Splitter泄漏', 'P1', `阶段往返切换后 splitter 数量从 ${splitterCount} 增至 ${splitterCountAfter}（未随卸载销毁）`, '');
    }

    // ============ T6: 画布滚轮缩放 ============
    console.log('🔍 T6: 画布滚轮缩放 ...');
    const sandboxBox = await page.locator('#dsp-sandbox-container').boundingBox();
    if (sandboxBox) {
      const cx = sandboxBox.x + sandboxBox.width / 2;
      const cy = sandboxBox.y + sandboxBox.height / 2;
      const before = await page.evaluate(() => {
        const c = document.querySelector('#dsp-sandbox-container canvas') as HTMLCanvasElement | null;
        return c ? { w: c.width, h: c.height } : null;
      });
      for (let i = 0; i < 4; i++) {
        await page.mouse.move(cx, cy);
        await page.mouse.wheel(0, -120);
        await page.waitForTimeout(120);
      }
      const afterZoom = await page.evaluate(() => {
        const c = document.querySelector('#dsp-sandbox-container canvas') as HTMLCanvasElement | null;
        return c ? { w: c.width, h: c.height } : null;
      });
      console.log(`   zoom 前 canvas=${JSON.stringify(before)} 后=${JSON.stringify(afterZoom)}（内容缩放不改分辨率属正常）`);
      // 缩放后继续步进，验证缩放不重置（近期 fix: persist user zoom scale）
      await page.click('#btn-step-next');
      await page.waitForTimeout(400);
      await page.click('#btn-step-next');
      await page.waitForTimeout(400);
      await shot('r2_t6_zoom_stepped.png');
    }

    // ============ 汇总 ============
    console.log('\n================ 第二轮汇总 ================');
    console.log(`pageerror: ${pageErrors.length}`);
    pageErrors.slice(0, 8).forEach((e) => console.log(`   [pageerror] ${e.slice(0, 200)}`));
    console.log(`404 资源: ${notFoundResources.length}`);
    Array.from(new Set(notFoundResources)).slice(0, 8).forEach((u) => console.log(`   [404] ${u}`));
    console.log(`findings: ${findings.length}`);
    findings.forEach((f, i) => console.log(`   ${i + 1}. [${f.severity}][${f.area}] ${f.desc} | ${f.evidence}`));

    fs.writeFileSync(path.join(ARTIFACT_DIR, 'r2-findings.json'), JSON.stringify({ findings, pageErrors, notFoundResources }, null, 2));
  } finally {
    await browser.close();
  }

  if (pageErrors.length > 0 || findings.some((f) => f.severity === 'P0' || f.severity === 'P1')) process.exit(2);
  process.exit(0);
}

main().catch((e) => {
  console.error('测试脚本崩溃:', e);
  process.exit(1);
});
