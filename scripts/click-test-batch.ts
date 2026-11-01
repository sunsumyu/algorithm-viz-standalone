/**
 * 批量点击测试：核心层改动（USNE 合成帧 / 行内聚焦 / 二叉树悬停解析 /
 * Card 2 动态高度 / Splitter）影响面的横向回归。
 *
 * 每个算法执行：
 *  1. 全量步进：活跃行丢失 / Card2 溢出 / SVG 断电 / 输出胶囊 undefined 检测
 *  2. 悬停提示：活跃行首个非关键字标识符悬停，tooltip 必须可见且无 undefined
 *  3. 多语言切换：每个语言切换后必须有活跃行
 *  4. 阶段切换：每个阶段代码行数必须 > 0
 *  5. 回退到底：步数必须回到 1
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const ARTIFACT_DIR = 'D:/tmp/algo-viz-click-test';
const BASE_URL = 'http://localhost:23300';

interface Finding {
  algo: string;
  area: string;
  severity: 'P0' | 'P1' | 'P2';
  desc: string;
  evidence: string;
}

const ALGOS: Array<{ id: string; kind: 'tree' | 'grid' | 'dp' }> = [
  { id: 'tree-depth', kind: 'tree' },
  { id: 'min-depth', kind: 'tree' },
  { id: 'path-sum', kind: 'tree' },
  { id: 'tree-invert', kind: 'tree' },
  { id: 'tree-symmetric', kind: 'tree' },
  { id: 'lca', kind: 'tree' },
  { id: 'binary-tree-level', kind: 'tree' },
  { id: 'merge-trees', kind: 'tree' },
  { id: 'bst-search', kind: 'tree' },
  { id: 'bottom-left', kind: 'tree' },
  { id: 'max-tree', kind: 'tree' },
  { id: 'bst-delete', kind: 'tree' },
  { id: 'tree-serialization-037', kind: 'tree' },
  { id: 'sum-root-to-leaf-numbers', kind: 'tree' },
  { id: 'all-paths', kind: 'tree' },
  { id: 'binary-tree-maximum-path-sum', kind: 'tree' },
  { id: 'trie-tree-017', kind: 'tree' },
  { id: 'burst-balloons', kind: 'dp' },
  { id: 'coins-from-piles', kind: 'dp' },
  { id: 'buying-hay-min-cost', kind: 'dp' },
  { id: 'unbounded-knapsack-standard', kind: 'dp' },
  { id: 'knapsack-01-standard', kind: 'dp' },
  { id: 'tsp-bitmask-dp', kind: 'dp' },
  { id: 'unique-paths', kind: 'grid' },
];

const KEYWORDS = new Set([
  'if', 'else', 'while', 'for', 'return', 'null', 'true', 'false', 'new', 'public', 'private',
  'class', 'void', 'static', 'this', 'self', 'const', 'let', 'var', 'function', 'def', 'int',
  'boolean', 'TreeNode', 'Solution', 'Optional', 'not', 'and', 'or', 'None', 'is', 'in', 'Math',
  'max', 'min', 'System', 'out', 'println', 'print', 'cout', 'endl', 'std', 'vector', 'stack',
]);

async function findBrowserExecutable(): Promise<string | undefined> {
  const candidates = [
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  ];
  return candidates.find((c) => fs.existsSync(c));
}

async function main(): Promise<void> {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  const browser = await chromium.launch({ executablePath: await findBrowserExecutable(), headless: true });
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  const page = await context.newPage();

  await context.addInitScript(() => {
    localStorage.setItem(
      'alg_viz_client_license_v1',
      btoa(JSON.stringify({ v: 1, uid: 'batch', exp: 0, user_id: 'batch', tier: 3 })) + '.s'
    );
  });

  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  page.on('pageerror', (err) => pageErrors.push(err.message.slice(0, 300)));
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 200));
  });

  const findings: Finding[] = [];
  const add = (algo: string, area: string, severity: Finding['severity'], desc: string, evidence: string) => {
    if (findings.some((f) => f.algo === algo && f.desc === desc)) return;
    findings.push({ algo, area, severity, desc, evidence });
    console.log(`   🚨 [${severity}][${area}] ${desc} | ${evidence.slice(0, 130)}`);
  };

  const onlyArg = process.argv.find((a) => a.startsWith('--only='));
  const algoList = onlyArg ? ALGOS.filter((a) => a.id === onlyArg.slice(7)) : ALGOS;

  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.waitForTimeout(2500);

  for (const { id, kind } of algoList) {
    console.log(`\n========== 🧪 ${id} (${kind}) ==========`);
    try {
      // 回到选择器并重新挂载，保证独立挂载生命周期
      await page.evaluate(() => (window as any).viewMountEngine?.showSelector?.());
      await page.waitForTimeout(350);
      const ok = await page.evaluate(async (algoId) => {
        const viz = await (window as any).viewMountEngine.showAlgorithm(algoId);
        return viz ? 'ok' : 'failed';
      }, id);
      if (ok !== 'ok') {
        add(id, '挂载', 'P0', 'showAlgorithm 失败', '');
        continue;
      }
      let mounted = true;
      try {
        await page.waitForSelector('#btn-step-next', { timeout: 30000 });
      } catch {
        // 大类目分包首次编译可能超时，重挂载一次
        await page.evaluate(async (algoId) => {
          await (window as any).viewMountEngine.showSelector?.();
          await (window as any).viewMountEngine.showAlgorithm(algoId);
        }, id);
        try {
          await page.waitForSelector('#btn-step-next', { timeout: 30000 });
        } catch {
          mounted = false;
        }
      }
      if (!mounted) {
        add(id, '挂载', 'P1', '60s 内未出现步进控件（挂载超时）', '');
        continue;
      }
      await page.waitForTimeout(900);

      // ---- 1. 全量步进 ----
      let hoverDone = false;
      let consecutiveBlank = 0;
      let stepIdx = 0;
      let endState = { out: '', live: '', count: '' };
      for (let click = 0; click < 350; click++) {
        const disabled = await page.evaluate(() => (document.getElementById('btn-step-next') as HTMLButtonElement)?.disabled);
        if (disabled) break;
        await page.click('#btn-step-next');
        await page.waitForTimeout(14);
        stepIdx++;
        const st = await page.evaluate(() => {
          const active = document.querySelector('.code-line.active');
          const monitor = document.querySelector('.dsp-left-section .dsp-card:last-child') as HTMLElement | null;
          const sandbox = document.getElementById('dsp-sandbox-container');
          const svg = sandbox?.querySelector('svg');
          const visualCount = sandbox ? sandbox.querySelectorAll('svg circle, svg rect, svg path.node-shape, canvas, table, [class*="cell"], [class*="node"]').length : -1;
          return {
            activeLine: active?.getAttribute('data-line') || null,
            monitorOverflow: monitor ? monitor.scrollHeight - monitor.clientHeight : 0,
            hasSvg: Boolean(svg),
            visualCount,
            out: document.getElementById('dsp-output-val')?.textContent || '',
            live: (document.getElementById('dsp-live-text')?.textContent || '').replace(/\s+/g, ' ').slice(0, 70),
            count: document.getElementById('log-count')?.textContent || '',
          };
        });
        endState = { out: st.out, live: st.live, count: st.count };
        if (!st.activeLine && stepIdx > 1) {
          add(id, '代码联动', 'P1', `第 ${stepIdx} 步无活跃代码行高亮`, st.count);
        }
        if (st.monitorOverflow > 6) {
          add(id, 'Card2', 'P1', `第 ${stepIdx} 步 Card 2 内容溢出 ${st.monitorOverflow}px`, st.count);
        }
        if (st.visualCount === 0) consecutiveBlank++;
        else consecutiveBlank = 0;
        if (consecutiveBlank === 4) {
          add(id, '沙盘', 'P1', `第 ${stepIdx} 步前后连续 4 步画布无任何可视节点（断电）`, st.count);
        }
        if (st.out === 'undefined') {
          add(id, '输出胶囊', 'P2', `第 ${stepIdx} 步输出胶囊显示 undefined`, st.count);
        }

        // ---- 2. 悬停测试（步进中段做一次）----
        if (!hoverDone && stepIdx >= 8) {
          const identInfo = await page.evaluate((kwList: string[]) => {
            const active = document.querySelector('.code-line.active') as HTMLElement | null;
            if (!active) return null;
            const kw = new Set(kwList);
            const idents = (Array.from(active.querySelectorAll('.algo-code-ident')) as HTMLElement[]).filter(
              (el) => el.textContent && !kw.has(el.textContent.trim())
            );
            return idents.length ? idents[0].textContent?.trim() : null;
          }, Array.from(KEYWORDS));
          if (identInfo) {
            const tok = page.locator('.code-line.active .algo-code-ident', { hasText: new RegExp(`^${identInfo}$`) }).first();
            await tok.hover();
            await page.waitForTimeout(420);
            const tip = await page.evaluate(() => {
              const t = document.getElementById('algo-debug-hover-tooltip');
              return {
                visible: t ? t.style.display !== 'none' && t.style.opacity !== '0' : false,
                text: (t?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120),
              };
            });
            console.log(`   hover "${identInfo}" -> visible=${tip.visible} "${tip.text.slice(0, 80)}"`);
            if (!tip.visible) {
              add(id, '悬停', 'P1', `悬停「${identInfo}」tooltip 未显示`, endState.count);
            } else if (tip.text.includes('undefined')) {
              add(id, '悬停', 'P2', `悬停「${identInfo}」tooltip 内容含 undefined`, tip.text);
            }
            await page.mouse.move(10, 10);
            await page.waitForTimeout(200);
          }
          hoverDone = true;
        }
      }
      console.log(`   步进 ${stepIdx} 步 -> out="${endState.out}" count="${endState.count}"`);

      // ---- 3. 多语言切换 ----
      const langs = await page.evaluate(() =>
        Array.from(document.querySelectorAll('#code-lang-tabs [data-lang]')).map((b) => (b as HTMLElement).dataset?.lang || '')
      );
      for (const lang of langs) {
        await page.click(`#code-lang-tabs [data-lang="${lang}"]`);
        await page.waitForTimeout(350);
        const hasActive = await page.evaluate(() => Boolean(document.querySelector('.code-line.active')));
        if (!hasActive) add(id, '多语言', 'P2', `切换 ${lang} 后无活跃行`, endState.count);
      }

      // ---- 4. 阶段切换 + 逐阶段步进 ----
      const stages = await page.evaluate(() =>
        Array.from(document.querySelectorAll('.dsp-stage-tab-btn')).map((b) => ({ id: (b as HTMLElement).dataset?.stage || '', text: b.textContent?.trim().slice(0, 18) }))
      );
      for (const st of stages) {
        if (!st.id) continue;
        await page.click(`.dsp-stage-tab-btn[data-stage="${st.id}"]`);
        await page.waitForTimeout(800);
        const codeLines = await page.evaluate(() => document.querySelectorAll('#code-lines-wrapper .code-line').length);
        if (codeLines === 0) add(id, '阶段切换', 'P1', `阶段 ${st.id}(${st.text}) 代码行数为 0`, '');

        // 阶段内步进（有界），检测 Card 2 溢出与高亮丢失
        let stageSteps = 0;
        let stageMissing = 0;
        for (let i = 0; i < 60; i++) {
          const disabled = await page.evaluate(() => (document.getElementById('btn-step-next') as HTMLButtonElement)?.disabled);
          if (disabled) break;
          await page.click('#btn-step-next');
          await page.waitForTimeout(12);
          stageSteps++;
          const st2 = await page.evaluate(() => {
            const monitor = document.querySelector('.dsp-left-section .dsp-card:last-child') as HTMLElement | null;
            return {
              active: Boolean(document.querySelector('.code-line.active')),
              ov: monitor ? monitor.scrollHeight - monitor.clientHeight : 0,
            };
          });
          if (!st2.active && stageSteps > 1) stageMissing++;
          if (st2.ov > 6) {
            add(id, 'Card2', 'P1', `[${st.id}] 第 ${stageSteps} 步 Card 2 内容溢出 ${st2.ov}px`, st2.ov.toString());
          }
        }
        if (stageMissing > 2) add(id, '代码联动', 'P1', `[${st.id}] ${stageMissing} 步无活跃代码行`, '');
      }
      console.log(`   阶段 ${stages.length} 个 / 语言 ${langs.length} 种切换完成`);

      // ---- 5. 回退到底 ----
      let rewound = 0;
      for (let i = 0; i < 400; i++) {
        const disabled = await page.evaluate(() => (document.getElementById('btn-step-prev') as HTMLButtonElement)?.disabled);
        if (disabled) break;
        await page.click('#btn-step-prev');
        await page.waitForTimeout(8);
        rewound++;
      }
      await page.waitForTimeout(300);
      const startCount = await page.evaluate(() => document.getElementById('log-count')?.textContent || '');
      if (!/^1\s*\//.test(startCount.trim())) {
        add(id, '回退', 'P2', `回退到底后步数非 1: "${startCount}"`, `rewound=${rewound}`);
      } else {
        console.log(`   回退 ${rewound} 步 -> "${startCount}" ✅`);
      }
    } catch (err) {
      add(id, '异常', 'P1', `测试流程异常: ${(err as Error).message.split('\n')[0].slice(0, 100)}`, '');
    }
  }

  console.log('\n================ 批量测试汇总 ================');
  console.log(`pageerror 总数: ${pageErrors.length}`);
  Array.from(new Set(pageErrors)).slice(0, 10).forEach((e) => console.log(`   [pageerror] ${e.slice(0, 180)}`));
  const meaningful = consoleErrors.filter((e) => !e.includes('favicon'));
  console.log(`console.error 总数 (除 favicon): ${meaningful.length}`);
  Array.from(new Set(meaningful)).slice(0, 6).forEach((e) => console.log(`   [console] ${e.slice(0, 150)}`));
  console.log(`findings: ${findings.length}`);
  findings.forEach((f, i) => console.log(`   ${i + 1}. [${f.severity}][${f.algo}/${f.area}] ${f.desc} | ${f.evidence.slice(0, 100)}`));

  fs.writeFileSync(path.join(ARTIFACT_DIR, 'batch-findings.json'), JSON.stringify({ findings, pageErrors, consoleErrors: meaningful }, null, 2));
  await browser.close();
  process.exit(findings.some((f) => f.severity !== 'P2') || pageErrors.length > 0 ? 2 : 0);
}

main().catch((e) => {
  console.error('批量测试崩溃:', e);
  process.exit(1);
});
