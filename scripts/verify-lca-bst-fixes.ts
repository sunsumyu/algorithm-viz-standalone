import { JSDOM } from 'jsdom';
import assert from 'assert';
import { lowestCommonAncestorBst037Visualizer } from '../src/algorithms/categories/tree/tree-036-037/lowest-common-ancestor-bst-037-renderer';
import { renderLcaBstCanvas } from '../src/core/renderers/adapters/lowest-common-ancestor-bst-canvas-adapter';
import { buildLcaBstStage1RecursiveSteps, buildLcaBstStage2IterativeSteps } from '../src/core/renderers/adapters/lowest-common-ancestor-bst-step-compiler';
import { ExecutionLogPresenter } from '../src/core/renderers/execution-log-presenter';

async function testLcaBst() {
  console.log('🧪 Starting LCA BST Fixes Verification...');

  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="app"></div></body></html>');
  (globalThis as any).window = dom.window;
  (globalThis as any).document = dom.window.document;
  (globalThis as any).HTMLElement = dom.window.HTMLElement;
  (globalThis as any).Event = dom.window.Event;

  // 1. 验证指针 (Pointers) 在树节点 labels 上的正确渲染
  console.log('Step 1: Testing pointer labels on canvas...');
  const steps1 = buildLcaBstStage1RecursiveSteps('6, 2, 8, 0, 4, 7, 9, null, null, 3, 5', 3, 5);
  assert(steps1.length >= 4);

  // 第一步: root 位于 6, 目标为 p=3, q=5
  const step0Container = document.createElement('div');
  renderLcaBstCanvas(step0Container, steps1[0]);
  const svg0 = step0Container.querySelector('svg');
  assert(svg0 !== null);
  const svgText0 = step0Container.innerHTML;
  // 必须包含 root 指针以及目标 p, q
  assert(svgText0.includes('root'), 'Must include root pointer');
  assert(svgText0.includes('p'), 'Must include p label');
  assert(svgText0.includes('q'), 'Must include q label');
  console.log('  ✓ Step 0 correctly renders root, p, and q labels on tree');

  // 最后一步: 命中 LCA (节点 4)
  const lastStepContainer = document.createElement('div');
  renderLcaBstCanvas(lastStepContainer, steps1[steps1.length - 1]);
  const lastSvgText = lastStepContainer.innerHTML;
  assert(lastSvgText.includes('🎯 LCA'), 'Must include 🎯 LCA');
  console.log('  ✓ Final step correctly displays 🎯 LCA label on tree');

  // 2. 验证执行日志清空与去重 (No Log Accumulation Bug)
  console.log('Step 2: Testing execution log idempotency and no accumulation...');
  const logContainer = document.createElement('div');
  const countEl = document.createElement('span');

  // 模拟从 step 0 逐步单步前进到 step 3
  for (let i = 0; i < steps1.length; i++) {
    ExecutionLogPresenter.renderStepLogs(logContainer, steps1, i, countEl);
    // 渲染的日志项数必须严格等于 i + 1 (+ 最终步骤完成条目)
    const expectedChildren = i === steps1.length - 1 ? i + 2 : i + 1;
    if (logContainer.children.length !== expectedChildren) {
      throw new Error(`Log children count mismatch at step ${i}: got ${logContainer.children.length}, expected ${expectedChildren}`);
    }
  }
  console.log('  ✓ ExecutionLogPresenter idempotently renders logs without accumulation across steps');

  // 3. 验证 Preset 切换后的日志干净重置
  console.log('Step 3: Testing preset case switch and clean log refresh...');
  const stepsCase3 = buildLcaBstStage1RecursiveSteps('6, 2, 8, 0, 4, 7, 9, null, null, 3, 5', 2, 4);
  assert(stepsCase3.length === 4);
  // 重置并渲染新 case 的第 0 步
  ExecutionLogPresenter.renderStepLogs(logContainer, stepsCase3, 0, countEl);
  assert(logContainer.children.length === 1);
  assert(countEl.textContent === '1 / 4 记录');
  console.log('  ✓ Log container cleanly resets to 1 / 4 when switching preset case');

  // 4. 验证 Stage 2 (迭代 O(1)) 指针展示
  console.log('Step 4: Testing Stage 2 iterative pointers...');
  const stage2Steps = buildLcaBstStage2IterativeSteps('6, 2, 8, 0, 4, 7, 9, null, null, 3, 5', 2, 4);
  assert(stage2Steps.length >= 4);
  const s2Container = document.createElement('div');
  renderLcaBstCanvas(s2Container, stage2Steps[0]);
  assert(s2Container.innerHTML.includes('root'), 'Must include root pointer in Stage 2');
  console.log('  ✓ Stage 2 correctly renders root pointer on tree canvas');

  console.log('🎉 All LCA BST automated verification checks PASSED successfully!');
}

testLcaBst().catch((e) => {
  console.error('❌ Verification failed:', e);
  process.exit(1);
});
