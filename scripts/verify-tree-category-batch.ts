/**
 * 二叉树类目全量逐个深度体检 v2 (Tree Category Deep Health Check)
 *
 * 与 v1 差异：每个算法【走完全部步骤】并【遍历所有阶段】，全程监听 console/page 错误，
 * 逐步采样画布健康度 (SVG 常驻防断电)，每个算法留档终态截图。
 *
 * 判定 (全部满足才 PASS)：
 *   1. 详情页挂载且沙盘容器存在
 *   2. 每个阶段步进走到底 (>= 4 步)，中途无异常
 *   3. 全程零 console/page 错误
 *   4. 树形范式算法沙盘 SVG 起步与终态均常驻 (防断电)
 *
 * 运行：vite-node scripts/verify-tree-category-batch.ts (需 dev server @ 23300)
 */

import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';

const BASE_URL = 'http://localhost:23300';
const OUT_DIR = 'D:/tmp/tree-category-check/v2';
const VIEWPORT = { width: 1920, height: 1080 };

const ALGOS: [string, string][] = [
  ['tree-traversal', '二叉树遍历'],
  ['tree-invert', '翻转二叉树'],
  ['tree-symmetric', '对称二叉树'],
  ['tree-recursion-patterns-019', '二叉树高频递归套路'],
  ['tree-traversal-iterative-020', '二叉树迭代遍历'],
  ['tree-serialization-021', '二叉树序列化与反序列化'],
  ['max-sum-bst-036', '二叉搜索子树最大键值和'],
  ['tree-serialization-037', '二叉树后序与高级序列化'],
  ['binary-tree-level', '二叉树的层序遍历'],
  ['bst-delete', '二叉搜索树中的删除'],
  ['bst-min-diff', '二叉搜索树的最小绝对差'],
  ['bst-modes', '二叉搜索树中的众数'],
  ['bst-search', '二叉搜索树中的搜索与插入'],
  ['bst-to-gst', '把二叉搜索树转换为累加树'],
  ['build-tree', '从前序/后序与中序遍历构造二叉树'],
  ['lca', '二叉树的最近公共祖先'],
  ['path-sum', '路径总和与收集所有路径'],
  ['sorted-array-to-bst', '有序数组转二叉搜索树'],
  ['valid-bst', '验证二叉搜索树'],
  ['tree-depth', '二叉树的最大深度'],
  ['min-depth', '二叉树最小深度'],
  ['binary-tree-maximum-path-sum', '二叉树中的最大路径和'],
  ['sum-root-to-leaf-numbers', '求根节点到叶节点数字之和'],
  ['all-paths', '二叉树所有路径'],
  ['left-leaves', '左叶子之和'],
  ['bottom-left', '找树左下角的值'],
  ['merge-trees', '合并二叉树'],
  ['find-duplicate-subtrees', '寻找重复的子树'],
  ['max-tree', '最大二叉树'],
  ['tree-036-zigzag-level-order', '二叉树锯齿形层序遍历'],
  ['tree-036-width-of-binary-tree', '二叉树最大宽度'],
  ['tree-036-preorder-serialize', '二叉树先序序列化与反序列化'],
  ['tree-036-levelorder-serialize', '二叉树按层序列化与反序列化'],
  ['tree-036-completeness-binary-tree', '完全二叉树检验'],
  ['tree-036-count-complete-tree-nodes', '完全二叉树节点个数'],
  ['tree-037-lowest-common-ancestor-bst', '二叉搜索树最近公共祖先'],
  ['tree-037-balanced-binary-tree', '判断平衡二叉树'],
  ['tree-037-trim-bst', '修剪二叉搜索树'],
  ['tree-037-house-robber-iii', '打家劫舍 III'],
];

interface StageResult {
  stageLabel: string;
  stepsWalked: number;
  svgAtStart: number;
  svgAtEnd: number;
}
interface CheckResult {
  id: string;
  name: string;
  stages: StageResult[];
  consoleErrors: string[];
  ok: boolean;
  note: string;
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: VIEWPORT, deviceScaleFactor: 1 });
  await context.addInitScript(() => {
    const payload = { v: 1, uid: 'tree-deep-check', exp: 0, user_id: 'tester', tier: 3 };
    localStorage.setItem('alg_viz_client_license_v1', btoa(JSON.stringify(payload)) + '.mock-signature');
  });

  const results: CheckResult[] = [];
  let shared: any = null;

  for (const [id, name] of ALGOS) {
    const errors: string[] = [];
    const work = await context.newPage();
    work.on('console', (m: any) => { if (m.type() === 'error') errors.push(m.text().slice(0, 150)); });
    work.on('pageerror', (e: any) => errors.push('[pageerror] ' + String(e).slice(0, 150)));
    if (shared) await shared.close().catch(() => {});
    shared = work;

    const r: CheckResult = { id, name, stages: [], consoleErrors: [], ok: false, note: '' };
    try {
      await work.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      await work.locator('#search-input').waitFor({ state: 'visible', timeout: 15000 });
      await work.locator('#search-input').fill(name.slice(0, 12));
      const card = work.locator('.algo-card').filter({ hasText: name.slice(0, 10) }).first();
      await card.waitFor({ state: 'visible', timeout: 8000 });
      await card.click();
      await work.waitForSelector('#dsp-sandbox-container', { timeout: 15000 });
      await work.waitForTimeout(1800);

      // 枚举所有阶段 tab
      const stageBtns = work.locator('.dsp-stage-tab-btn');
      const stageCount = await stageBtns.count();

      for (let s = 0; s < Math.max(1, stageCount); s++) {
        let stageLabel = `默认阶段`;
        if (stageCount > 0) {
          const btn = stageBtns.nth(s);
          stageLabel = (await btn.textContent() ?? '').trim().slice(0, 18) || `阶段${s + 1}`;
          await btn.click();
          await work.waitForTimeout(1200);
        }

        const svgAtStart = await work.evaluate(() => document.querySelectorAll('#dsp-sandbox-container svg').length);

        // 走完全部步骤
        let stepsWalked = 0;
        for (let i = 0; i < 80; i++) {
          const next = work.locator('#btn-step-next').first();
          if (!(await next.count())) break;
          if (await next.isDisabled().catch(() => true)) break;
          await next.click();
          stepsWalked++;
          await work.waitForTimeout(120);
        }
        await work.waitForTimeout(400);

        const svgAtEnd = await work.evaluate(() => document.querySelectorAll('#dsp-sandbox-container svg').length);
        r.stages.push({ stageLabel, stepsWalked, svgAtStart, svgAtEnd });
      }

      const minSteps = Math.min(...r.stages.map((s) => s.stepsWalked));
      const treeParadigm = r.stages.some((s) => s.svgAtStart > 0);
      const blackout = treeParadigm && r.stages.some((s) => s.svgAtStart > 0 && s.svgAtEnd === 0);
      const emptyWalk = r.stages.some((s) => s.stepsWalked < 4);

      r.ok = errors.length === 0 && !blackout && !emptyWalk;
      if (!r.ok) {
        r.note = [
          errors.length ? `${errors.length} 条错误` : '',
          blackout ? '画布断电(SVG 消失)' : '',
          emptyWalk ? `步数不足(${minSteps})` : '',
        ].filter(Boolean).join(' · ');
        await work.screenshot({ path: path.join(OUT_DIR, `FAIL-${id}.png`) });
      } else {
        await work.screenshot({ path: path.join(OUT_DIR, `OK-${id}.png`) });
      }
    } catch (err: any) {
      r.note = `异常: ${String(err?.message || err).slice(0, 80)}`;
      await work.screenshot({ path: path.join(OUT_DIR, `ERR-${id}.png`) }).catch(() => {});
    }
    r.consoleErrors = errors.slice(0, 3);
    results.push(r);
    const stageSummary = r.stages.map((s) => `${s.stageLabel}:${s.stepsWalked}步`).join(' | ');
    console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${id.padEnd(38)} ${stageSummary} ${r.note}`);
  }

  await shared?.close().catch(() => {});
  await browser.close();
  fs.writeFileSync(path.join(OUT_DIR, 'report.json'), JSON.stringify(results, null, 1));
  const fails = results.filter((x) => !x.ok);
  console.log('========================================');
  console.log(`总计 ${results.length} · 通过 ${results.length - fails.length} · 失败 ${fails.length}`);
  if (fails.length) console.log('失败清单:', fails.map((f) => f.id).join(', '));
}

main().catch((e) => { console.error(e); process.exitCode = 1; });
