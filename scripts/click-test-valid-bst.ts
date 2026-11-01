/**
 * Valid BST 点击测试脚本（Playwright Headless · 1920×1080）
 *
 * 点击测试范围（聚焦近期改动）：
 *  1. 全量步进（含 USNE 合成的 到达语句/聚焦递归调用 帧）与代码行高亮联动
 *  2. 行内聚焦高亮 .inline-token-focus 是否落在递归调用表达式上
 *  3. 变量悬停提示（root / root.left 成员访问链）
 *  4. Card 2 监视卡动态最小高度与内容溢出检测
 *  5. Splitter 拖拽（监视卡 / 日志卡）
 *  6. 阶段切换与多语言切换
 *  7. 自动播放 / 暂停
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
const consoleErrors: string[] = [];
const pageErrors: string[] = [];

function addFinding(area: string, severity: Finding['severity'], desc: string, evidence: string): void {
  findings.push({ area, severity, desc, evidence });
  console.log(`   🚨 [${severity}] ${area}: ${desc}`);
}

async function findBrowserExecutable(): Promise<string | undefined> {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return undefined;
}

async function main(): Promise<void> {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const execPath = await findBrowserExecutable();
  const browser = await chromium.launch({ executablePath: execPath, headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const page = await context.newPage();

  // 预注入 mock 授权凭证，绕过阻断式激活弹窗（浏览器环境为 mock 验签）
  await context.addInitScript(() => {
    const payload = { v: 1, uid: 'click-test', exp: 0, user_id: 'tester', tier: 3 };
    const key = btoa(JSON.stringify(payload)) + '.mock-signature';
    localStorage.setItem('alg_viz_client_license_v1', key);
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => pageErrors.push(String(err)));

  const shot = async (name: string) => page.screenshot({ path: path.join(ARTIFACT_DIR, name) });

  try {
    // ============ 加载应用 ============
    console.log('📄 打开应用首页 ...');
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(2500);
    await shot('01_home.png');

    // ============ 打开 Valid BST ============
    console.log('🌲 打开 Valid BST（验证二叉搜索树）...');
    const opened = await page.evaluate(async () => {
      const engine = (window as any).viewMountEngine;
      if (!engine) return 'no-engine';
      const viz = await engine.showAlgorithm('valid-bst');
      return viz ? 'ok' : 'failed';
    });
    if (opened !== 'ok') {
      addFinding('挂载', 'P0', `showAlgorithm('valid-bst') 失败: ${opened}`, '');
      await shot('02_mount_fail.png');
      throw new Error('mount failed');
    }
    await page.waitForSelector('#btn-step-next', { timeout: 15000 });
    await page.waitForTimeout(1200);
    await shot('02_valid_bst_initial.png');

    // ============ Test A: 全量步进 ============
    console.log('⏩ Test A: 全量步进 ...');
    const totalSteps = await page.evaluate(() => {
      const el = document.getElementById('log-count');
      const m = el?.textContent?.match(/(\d+)\s*\/\s*(\d+)/);
      return m ? Number(m[2]) : 0;
    });
    console.log(`   总步数: ${totalSteps}`);

    if (totalSteps <= 0) {
      addFinding('步进', 'P0', 'log-count 未显示有效步数', (await page.textContent('#log-count')) || '');
    }

    const stepRecords: Array<Record<string, unknown>> = [];
    let prevLine = '';
    let frozenCount = 0;
    let maxFrozen = { count: 0, step: 0, line: '' };

    for (let i = 1; i <= Math.min(totalSteps, 400); i++) {
      const nextDisabled = await page.evaluate(
        () => (document.getElementById('btn-step-next') as HTMLButtonElement | null)?.disabled
      );
      if (nextDisabled) break;
      await page.click('#btn-step-next');
      await page.waitForTimeout(60);
      const rec = await page.evaluate(() => {
        const activeLineEl = document.querySelector('.code-line.active');
        const monitorCard = document.querySelector('.dsp-left-section .dsp-card:last-child') as HTMLElement | null;
        const liveText = document.getElementById('dsp-live-text');
        const sandbox = document.getElementById('dsp-sandbox-container');
        const focusToken = activeLineEl?.querySelector('.inline-token-focus') as HTMLElement | null;
        const logCount = document.getElementById('log-count')?.textContent || '';
        const canvas = sandbox?.querySelector('canvas') as HTMLCanvasElement | null;
        let canvasBlank: boolean | null = null;
        if (canvas) {
          try {
            const ctx = canvas.getContext('2d');
            if (ctx) {
              const w = canvas.width;
              const h = canvas.height;
              const step = Math.max(1, Math.floor(w / 40));
              let nonZero = 0;
              let sampled = 0;
              for (let x = 0; x < w; x += step) {
                for (let y = 0; y < h; y += step) {
                  const d = ctx.getImageData(x, y, 1, 1).data;
                  sampled++;
                  if (d[3] !== 0) nonZero++;
                }
              }
              canvasBlank = sampled > 0 && nonZero === 0;
            }
          } catch {
            canvasBlank = null;
          }
        }
        return {
          logCount,
          activeLine: activeLineEl?.getAttribute('data-line') || null,
          activeRaw: (activeLineEl as HTMLElement | null)?.dataset?.raw || null,
          focusText: focusToken?.textContent || null,
          focusParentLine: focusToken ? (focusToken.closest('.code-line') as HTMLElement | null)?.getAttribute('data-line') : null,
          liveText: liveText?.textContent || '',
          monitorH: monitorCard?.offsetHeight ?? null,
          monitorOverflow: monitorCard ? monitorCard.scrollHeight - monitorCard.clientHeight : null,
          canvasBlank,
        };
      });
      (rec as any).stepIdx = i;
      stepRecords.push(rec);

      // 检测 1：代码行高亮丢失（断电）
      if (!rec.activeLine) {
        addFinding('代码联动', 'P1', `第 ${i} 步无活跃代码行高亮（highlight 冻结/丢失）`, `logCount=${rec.logCount}`);
      }
      // 检测 2：同一行冻结计数
      if (rec.activeLine === prevLine && rec.activeLine) {
        frozenCount++;
        if (frozenCount > maxFrozen.count) maxFrozen = { count: frozenCount, step: i, line: String(rec.activeLine) };
      } else {
        frozenCount = 0;
      }
      prevLine = String(rec.activeLine);
      // 检测 3：Card 2 内容溢出被截断
      if (typeof rec.monitorOverflow === 'number' && rec.monitorOverflow > 4) {
        addFinding('Card2 监视卡', 'P1', `第 ${i} 步 Card 2 内容溢出 ${rec.monitorOverflow}px 被裁剪`, `monitorH=${rec.monitorH} logCount=${rec.logCount}`);
      }
      // 检测 4：画布断电（全透明）
      if (rec.canvasBlank === true) {
        addFinding('沙盘画布', 'P1', `第 ${i} 步画布全空白（断电）`, `logCount=${rec.logCount}`);
      }
    }

    // 检测 5：行内聚焦 token 是否在递归调用步出现且位置合理
    const focusSteps = stepRecords.filter((r) => r.focusText);
    console.log(`   🎯 行内聚焦步数: ${focusSteps.length}`);
    if (focusSteps.length === 0) {
      addFinding('行内聚焦', 'P1', '全流程从未出现 .inline-token-focus 聚焦递归调用', '');
    } else {
      const badFocus = focusSteps.filter((r) => {
        const t = String(r.focusText || '');
        return !(t.includes('(') || t.includes('if') || t.includes('return'));
      });
      if (badFocus.length > 0) {
        addFinding('行内聚焦', 'P2', `有 ${badFocus.length} 步聚焦块不在调用表达式上`, JSON.stringify(badFocus.slice(0, 3).map((r) => ({ step: r.stepIdx, text: r.focusText }))));
      }
    }

    // 检测 6：合成帧存在性 —— 递归调用应有连续同行的 到达/聚焦 两帧
    const arriveSteps = stepRecords.filter((r) => String(r.liveText || '').includes('到达'));
    console.log(`   📌 到达语句合成帧: ${arriveSteps.length} 个`);
    if (arriveSteps.length === 0) {
      addFinding('合成帧', 'P2', '未检测到「到达XX语句」合成帧（USNE 二次高亮分化未生效?）', '');
    }

    // 冻结行报告（同一行连续超过 6 步需人工确认是否合理）
    if (maxFrozen.count >= 6) {
      addFinding('代码联动', 'P2', `活跃行 L${maxFrozen.line} 连续 ${maxFrozen.count} 步未变化（第 ${maxFrozen.step} 步附近）`, '可能是递归基底循环属正常，也可能是冻结 bug');
    }

    await shot('03_stepped_end.png');

    // ============ Test B: 变量悬停提示 ============
    console.log('🖱️ Test B: 变量悬停提示 ...');
    // 回退到中段步骤（有活跃节点）
    const halfBack = Math.floor(totalSteps / 3);
    for (let i = 0; i < halfBack; i++) {
      await page.click('#btn-step-prev');
      await page.waitForTimeout(20);
    }
    await page.waitForTimeout(400);

    const hoverInfo = await page.evaluate(() => {
      const active = document.querySelector('.code-line.active') as HTMLElement | null;
      if (!active) return { found: false };
      const idents = Array.from(active.querySelectorAll('.algo-code-ident')) as HTMLElement[];
      return {
        found: idents.length > 0,
        idents: idents.map((el) => ({ text: el.textContent, hasVar: Boolean(el.dataset?.var) })),
        raw: active.dataset?.raw || '',
      };
    });
    console.log(`   活跃行标识符: ${JSON.stringify(hoverInfo.idents?.slice(0, 8))} raw="${hoverInfo.raw}"`);

    if (!hoverInfo.found) {
      addFinding('悬停提示', 'P1', '活跃代码行上找不到 .algo-code-ident 标识符元素（无法悬停）', `raw=${hoverInfo.raw}`);
    } else {
      // 悬停 root / node 标识符
      const target = page.locator('.code-line.active .algo-code-ident', { hasText: /^(root|node|cur|curr|current)$/ }).first();
      if (await target.count()) {
        await target.hover();
        await page.waitForTimeout(500);
        const tip1 = await page.evaluate(() => {
          const tip = document.getElementById('algo-debug-hover-tooltip');
          return { visible: tip ? tip.style.display !== 'none' && tip.style.opacity !== '0' : false, text: tip?.textContent || '' };
        });
        console.log(`   hover root -> visible=${tip1.visible} text="${tip1.text.slice(0, 120)}"`);
        if (!tip1.visible) {
          addFinding('悬停提示', 'P1', `悬停「root」后 tooltip 未显示`, `activeRaw=${hoverInfo.raw}`);
        } else if (!tip1.text.includes('Node') && !tip1.text.includes('null')) {
          addFinding('悬停提示', 'P2', `悬停「root」tooltip 内容未包含节点信息`, tip1.text.slice(0, 120));
        }
        await shot('04_hover_root.png');
        await page.mouse.move(10, 10);
        await page.waitForTimeout(300);
      } else {
        console.log('   （活跃行无 root/node 标识符，跳过 root 悬停）');
      }

      // 悬停成员属性 root.left / root.right 的属性 token
      const memberTarget = page.locator('.code-line.active .algo-code-ident', { hasText: /^(left|right|val)$/ }).first();
      if (await memberTarget.count()) {
        await memberTarget.hover();
        await page.waitForTimeout(500);
        const tip2 = await page.evaluate(() => {
          const tip = document.getElementById('algo-debug-hover-tooltip');
          return { visible: tip ? tip.style.display !== 'none' && tip.style.opacity !== '0' : false, text: tip?.textContent || '' };
        });
        console.log(`   hover member -> visible=${tip2.visible} text="${tip2.text.slice(0, 140)}"`);
        if (!tip2.visible) {
          addFinding('悬停提示', 'P1', `悬停成员属性 token 后 tooltip 未显示（成员访问链解析失败）`, `activeRaw=${hoverInfo.raw}`);
        } else {
          const memberName = (await memberTarget.textContent()) || '';
          if (tip2.text.includes('undefined') || tip2.text.length < 5) {
            addFinding('悬停提示', 'P2', `悬停「${memberName}」tooltip 内容异常`, tip2.text.slice(0, 140));
          }
        }
        await shot('05_hover_member.png');
        await page.mouse.move(10, 10);
      }
    }

    // ============ Test C: 回退到底再前进一致性 ============
    console.log('⏪ Test C: 回退到底部 ...');
    for (let i = 0; i < totalSteps + 5; i++) {
      const disabled = await page.evaluate(() => (document.getElementById('btn-step-prev') as HTMLButtonElement | null)?.disabled);
      if (disabled) break;
      await page.click('#btn-step-prev');
      await page.waitForTimeout(15);
    }
    await page.waitForTimeout(400);
    const atStart = await page.evaluate(() => ({
      count: document.getElementById('log-count')?.textContent || '',
      active: document.querySelector('.code-line.active')?.getAttribute('data-line') || null,
    }));
    console.log(`   回退到底: count="${atStart.count}" activeLine=${atStart.active}`);
    await shot('06_rewound_start.png');

    // ============ Test D: Splitter 拖拽 ============
    console.log('↕️ Test D: Splitter 拖拽 ...');
    const splitters = await page.locator('.algo-splitter').count();
    console.log(`   splitter 数量: ${splitters}`);
    const vSplitters = page.locator('.algo-splitter-vertical');
    const n = await vSplitters.count();
    for (let si = 0; si < n; si++) {
      const sp = vSplitters.nth(si);
      const box = await sp.boundingBox();
      if (!box) continue;
      const probeCards = () =>
        page.evaluate(() => {
          const probe = (el: HTMLElement | null) =>
            el ? { h: el.offsetHeight, overflow: el.scrollHeight - el.clientHeight } : null;
          const monitor = document.querySelector('.dsp-left-section .dsp-card:last-child') as HTMLElement | null;
          const log = document.querySelector('.dsp-log-card') as HTMLElement | null;
          return { monitor: probe(monitor), log: probe(log) };
        });
      const before = await probeCards();
      // 向上拖 90px（压缩下方卡片）
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 90, { steps: 6 });
      await page.mouse.up();
      await page.waitForTimeout(400);
      const after = await probeCards();
      console.log(
        `   splitter#${si} 拖前 monitor=${JSON.stringify(before.monitor)} log=${JSON.stringify(before.log)} -> 拖后 monitor=${JSON.stringify(after.monitor)} log=${JSON.stringify(after.log)}`
      );
      if (after.monitor && after.monitor.overflow > 6) {
        addFinding('Splitter', 'P1', `splitter#${si} 拖拽后监视卡内容溢出 ${after.monitor.overflow}px 被截断`, JSON.stringify(after.monitor));
      }
      if (after.log && after.log.overflow > 6) {
        addFinding('Splitter', 'P1', `splitter#${si} 拖拽后日志卡内容溢出 ${after.log.overflow}px 被截断`, JSON.stringify(after.log));
      }
    }
    await shot('07_splitter_dragged.png');

    // ============ Test E: 阶段切换 ============
    console.log('🔀 Test E: 阶段切换 ...');
    const stageIds = await page.evaluate(() =>
      Array.from(document.querySelectorAll('.dsp-stage-tab-btn')).map((b) => ({
        id: (b as HTMLElement).dataset?.stage,
        text: b.textContent?.trim(),
      }))
    );
    console.log(`   阶段: ${JSON.stringify(stageIds)}`);
    for (const st of stageIds) {
      if (!st.id) continue;
      await page.click(`.dsp-stage-tab-btn[data-stage="${st.id}"]`);
      await page.waitForTimeout(900);
      const state = await page.evaluate(() => {
        const codeLines = document.querySelectorAll('#code-lines-wrapper .code-line').length;
        const active = document.querySelector('.code-line.active')?.getAttribute('data-line') || null;
        const count = document.getElementById('log-count')?.textContent || '';
        const title = document.getElementById('header-algo-title')?.textContent || '';
        return { codeLines, active, count, title };
      });
      console.log(`   → [${st.id}] codeLines=${state.codeLines} active=${state.active} count="${state.count}" title="${state.title}"`);
      if (state.codeLines === 0) {
        addFinding('阶段切换', 'P1', `切换到阶段 ${st.id} 后代码终端为空`, '');
      }
      await shot(`08_stage_${st.id}.png`);
    }

    // ============ Test F: 多语言切换 ============
    console.log('🌐 Test F: 多语言切换 ...');
    const langBtns = await page.evaluate(() =>
      Array.from(document.querySelectorAll('#code-lang-tabs [data-lang]')).map((b) => (b as HTMLElement).dataset?.lang)
    );
    console.log(`   语言按钮: ${JSON.stringify(langBtns)}`);
    for (const lang of langBtns) {
      if (!lang) continue;
      await page.click(`#code-lang-tabs [data-lang="${lang}"]`);
      await page.waitForTimeout(500);
      const langState = await page.evaluate(() => {
        const active = document.querySelector('.code-line.active');
        return {
          active: active?.getAttribute('data-line') || null,
          raw: (active as HTMLElement | null)?.dataset?.raw || '',
        };
      });
      console.log(`   → ${lang}: activeLine=${langState.active} raw="${langState.raw.slice(0, 50)}"`);
      if (!langState.active) {
        addFinding('多语言', 'P2', `切换语言 ${lang} 后无活跃行高亮`, '');
      }
    }

    // ============ Test G: 自动播放 ============
    console.log('▶️ Test G: 自动播放/暂停 ...');
    const countBefore = await page.textContent('#log-count');
    await page.click('#btn-play-pause');
    await page.waitForTimeout(2500);
    const midState = await page.evaluate(() => ({
      count: document.getElementById('log-count')?.textContent || '',
      active: document.querySelector('.code-line.active')?.getAttribute('data-line') || null,
    }));
    await page.click('#btn-play-pause'); // 暂停
    await page.waitForTimeout(300);
    console.log(`   播放前="${countBefore}" 播放2.5s后="${midState.count}" active=${midState.active}`);
    if (countBefore === midState.count) {
      addFinding('自动播放', 'P2', '点击播放 2.5s 后步数未前进', `before=${countBefore}`);
    }
    await shot('09_play_pause.png');

    // ============ 汇总 ============
    console.log('\n================ 点击测试汇总 ================');
    console.log(`页面 JS 错误 (pageerror): ${pageErrors.length}`);
    pageErrors.slice(0, 10).forEach((e) => console.log(`   [pageerror] ${e.slice(0, 200)}`));
    const meaningfulConsole = consoleErrors.filter(
      (e) => !e.includes('favicon') && !e.includes('DevTools') && !e.includes('Tauri') && !e.includes('[Security]')
    );
    console.log(`控制台错误 (console.error): ${meaningfulConsole.length}`);
    meaningfulConsole.slice(0, 10).forEach((e) => console.log(`   [console] ${e.slice(0, 200)}`));
    console.log(`交互缺陷 findings: ${findings.length}`);
    findings.forEach((f, i) => console.log(`   ${i + 1}. [${f.severity}][${f.area}] ${f.desc} | ${f.evidence}`));

    fs.writeFileSync(
      path.join(ARTIFACT_DIR, 'findings.json'),
      JSON.stringify({ findings, pageErrors, consoleErrors: meaningfulConsole }, null, 2)
    );
    fs.writeFileSync(path.join(ARTIFACT_DIR, 'step-records.json'), JSON.stringify(stepRecords, null, 2));
  } finally {
    await browser.close();
  }

  if (pageErrors.length > 0 || findings.some((f) => f.severity === 'P0' || f.severity === 'P1')) {
    process.exit(2);
  }
  process.exit(0);
}

main().catch((e) => {
  console.error('测试脚本崩溃:', e);
  process.exit(1);
});
