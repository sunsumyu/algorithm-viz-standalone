/**
 * 用队列实现栈可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * LeetCode 225：单队列循环旋转法，push 后将前面 size - 1 个元素出队再入队重新排到队尾，保持队头始终为栈顶
 * 严格遵循 Zero-Subbox 规范，100% 扁平画板，杜绝多层白色卡片嵌套
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import { DualStructureVisualAdapter } from '../../../core/renderers/adapters/dual-structure-visual-adapter';
import {
  IMPLEMENT_STACK_USING_QUEUE_PROBLEM_HTML,
  IMPLEMENT_STACK_USING_QUEUE_ANALYSIS_HTML,
  IMPLEMENT_STACK_USING_QUEUE_CODE_LANGUAGES,
} from './implement-stack-using-queue-problem-content';

export interface MSStep {
  queue: number[];
  outputs: Array<{ op: string; value: number | boolean }>;
  currentOp: string;
  rotatingItem: number | null;
  rotateStep: number;
  totalRotate: number;
  action: 'init' | 'push_offer' | 'rotate_step' | 'pop' | 'top' | 'empty' | 'done';
  message: string;
  codeLine: number;
}

export function buildImplementStackUsingQueueSteps(rawOpsInput: string): MSStep[] {
  const steps: MSStep[] = [];
  const queue: number[] = [];
  const outputs: Array<{ op: string; value: number | boolean }> = [];

  const rawOps = (rawOpsInput || 'push 1, push 2, top, pop, empty')
    .split(/[,，;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  steps.push({
    queue: [],
    outputs: [],
    currentOp: 'init',
    rotatingItem: null,
    rotateStep: 0,
    totalRotate: 0,
    action: 'init',
    message: '初始化：单队列为空，采用入队后循环旋转 (size - 1) 次策略',
    codeLine: 4,
  });

  for (let i = 0; i < rawOps.length; i++) {
    const opStr = rawOps[i];
    const parts = opStr.split(/\s+/);
    const op = parts[0].toLowerCase();
    const val = parts.length > 1 ? parseInt(parts[1], 10) : NaN;

    if (op === 'push') {
      const num = isNaN(val) ? 1 : val;
      const prevSize = queue.length;

      queue.push(num);

      steps.push({
        queue: [...queue],
        outputs: [...outputs],
        currentOp: `push(${num})`,
        rotatingItem: null,
        rotateStep: 0,
        totalRotate: prevSize,
        action: 'push_offer',
        message: `📥 执行 push(${num})：首先进入队尾，准备将前面的 ${prevSize} 个元素循环旋转排到其后`,
        codeLine: 7,
      });

      // 旋转前面 prevSize 个元素
      for (let r = 0; r < prevSize; r++) {
        const rot = queue.shift()!;
        queue.push(rot);

        steps.push({
          queue: [...queue],
          outputs: [...outputs],
          currentOp: `rotate(${r + 1}/${prevSize})`,
          rotatingItem: rot,
          rotateStep: r + 1,
          totalRotate: prevSize,
          action: 'rotate_step',
          message: `🔄 旋转中 (${r + 1}/${prevSize})：将队头元素 ${rot} 出队并重新推到队尾，使最新元素 ${num} 逐步移向队头`,
          codeLine: 10,
        });
      }
    } else if (op === 'pop') {
      if (queue.length > 0) {
        const popped = queue.shift()!;
        outputs.push({ op: 'pop', value: popped });

        steps.push({
          queue: [...queue],
          outputs: [...outputs],
          currentOp: 'pop()',
          rotatingItem: null,
          rotateStep: 0,
          totalRotate: 0,
          action: 'pop',
          message: `📤 执行 pop()：队头即当前栈顶元素 ${popped}，直接 O(1) 出队并返回`,
          codeLine: 14,
        });
      } else {
        steps.push({
          queue: [...queue],
          outputs: [...outputs],
          currentOp: 'pop()',
          rotatingItem: null,
          rotateStep: 0,
          totalRotate: 0,
          action: 'pop',
          message: '⚠️ 队列为空，pop() 无元素可出栈',
          codeLine: 14,
        });
      }
    } else if (op === 'top' || op === 'peek') {
      if (queue.length > 0) {
        const topVal = queue[0];
        outputs.push({ op: 'top', value: topVal });

        steps.push({
          queue: [...queue],
          outputs: [...outputs],
          currentOp: 'top()',
          rotatingItem: null,
          rotateStep: 0,
          totalRotate: 0,
          action: 'top',
          message: `🔍 执行 top()：查看当前队头（即栈顶）元素为 ${topVal}（不弹出）`,
          codeLine: 18,
        });
      } else {
        steps.push({
          queue: [...queue],
          outputs: [...outputs],
          currentOp: 'top()',
          rotatingItem: null,
          rotateStep: 0,
          totalRotate: 0,
          action: 'top',
          message: '⚠️ 队列为空，top() 无栈顶元素',
          codeLine: 18,
        });
      }
    } else if (op === 'empty') {
      const isEmpty = queue.length === 0;
      outputs.push({ op: 'empty', value: isEmpty });

      steps.push({
        queue: [...queue],
        outputs: [...outputs],
        currentOp: 'empty()',
        rotatingItem: null,
        rotateStep: 0,
        totalRotate: 0,
        action: 'empty',
        message: `⚖️ 执行 empty()：队列${isEmpty ? '为空，返回 true' : '非空，返回 false'}`,
        codeLine: 22,
      });
    }
  }

  steps.push({
    queue: [...queue],
    outputs: [...outputs],
    currentOp: 'done',
    rotatingItem: null,
    rotateStep: 0,
    totalRotate: 0,
    action: 'done',
    message: '🎉 操作序列执行完毕！',
    codeLine: 25,
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<MSStep>({
  id: 'implement-stack-using-queue',
  name: '用队列实现栈',
  category: 'stack',
  icon: '🥞',
  badge: {
    mode: '单队列自环旋转',
    complexity: 'O(n) · O(n)',
  },
  card1Title: '🥞 队列内部循环旋转与栈顶对齐沙盘',
  card2Title: '📦 栈状态与出栈输出监控',
  card2Desc: '当前操作指令、单队列容量与出栈/栈顶记录序列',
  legend: [
    { label: '🥇 队头 (即栈顶 Top)', color: '#0d9488' },
    { label: '🔄 旋转中元素', color: '#fbbf24' },
    { label: '🚶 队内其它元素', color: '#94a3b8' },
  ],
  inputs: [
    {
      id: 'input-ops',
      label: '操作序列',
      type: 'text',
      defaultValue: 'push 1, push 2, top, pop, empty',
      width: '180px',
      placeholder: 'push 1, push 2, top...',
    },
  ],
  presets: [
    {
      label: '经典示例',
      values: { 'input-ops': 'push 1, push 2, top, pop, empty' },
    },
    {
      label: '三次压栈与连续出栈',
      values: { 'input-ops': 'push 10, push 20, push 30, pop, top, pop' },
    },
  ],
  metrics: [
    { id: 'stack-size', label: '栈内元素总数', color: '#0d9488' },
    { id: 'top-val', label: '当前栈顶 Top', color: '#0f766e' },
    { id: 'rotate-progress', label: '旋转进度', color: '#b45309' },
  ],
  codeLanguages: IMPLEMENT_STACK_USING_QUEUE_CODE_LANGUAGES,
  problemHtml: IMPLEMENT_STACK_USING_QUEUE_PROBLEM_HTML,
  analysisHtml: IMPLEMENT_STACK_USING_QUEUE_ANALYSIS_HTML,
  buildSteps: (inputs) => buildImplementStackUsingQueueSteps(inputs['input-ops']),
  renderCanvas: (container, step) => {
    // 渲染扁平单队列沙盘（绝无任何嵌套白色 card 边框）
    DualStructureVisualAdapter.renderQueueRotation(container, step);

    // 更新指标卡片
    const root = container.closest('#algo-implement-stack-using-queue-view');
    if (root) {
      const sSizeEl = root.querySelector('#metric-stack-size');
      const topValEl = root.querySelector('#metric-top-val');
      const rotProgressEl = root.querySelector('#metric-rotate-progress');

      if (sSizeEl) sSizeEl.textContent = `${step.queue.length}`;
      if (topValEl) topValEl.textContent = step.queue.length > 0 ? `${step.queue[0]}` : '—';
      if (rotProgressEl) {
        rotProgressEl.textContent =
          step.totalRotate > 0 ? `${step.rotateStep} / ${step.totalRotate}` : '无需旋转';
      }

      // 在 Card 2 中展示出栈与 top 记录流
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const outputsHtml =
          step.outputs.length === 0
            ? '<span style="color: #94a3b8; font-size: 11px; font-style: italic;">暂无出栈记录</span>'
            : step.outputs
                .map(
                  (out, idx) => `
                  <span style="display: inline-flex; align-items: center; gap: 3px; background: #ffffff; border: 1px solid #cbd5e1; padding: 1px 6px; border-radius: 4px; font-size: 10.5px; font-family: monospace;">
                    <span style="color: #64748b;">#${idx + 1}</span>
                    <strong style="color: ${out.op === 'pop' ? '#dc2626' : '#0d9488'};">${out.op}</strong>: ${out.value}
                  </span>
                `
                )
                .join(' ');

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 4px; padding: 4px 0;">
            <span style="font-size: 10.5px; font-weight: 700; color: #475569;">出栈与栈顶查看记录:</span>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">${outputsHtml}</div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'implement-stack-using-queue',
  name: '用队列实现栈',
  viewId: 'algo-implement-stack-using-queue-view',
  category: 'stack',
  description: '单队列循环旋转法：push 入队后将前面 size - 1 个元素出队再入队，保持队头为栈顶',
  icon: '🥞',
  template,
  Visualizer,
  difficulty: 1,
  levelOrder: 5,
  learningGoal: '掌握单队列通过自环旋转实现 LIFO 栈的精简思想，实现真正的 O(1) Pop 与 Top 查询',
});
