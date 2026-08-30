/**
 * 用栈实现队列可视化器 — 声明式配置化架构 (Declarative Visualizer)
 * LeetCode 232：输入栈 inStack 处理 push，输出栈 outStack 处理 pop/peek，outStack 为空时一次性倾倒转移
 * 严格遵循 Zero-Subbox 规范，100% 扁平画板，杜绝多层白色卡片嵌套
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import { DualStructureVisualAdapter } from '../../../core/renderers/adapters/dual-structure-visual-adapter';
import {
  IMPLEMENT_QUEUE_USING_STACK_PROBLEM_HTML,
  IMPLEMENT_QUEUE_USING_STACK_ANALYSIS_HTML,
  IMPLEMENT_QUEUE_USING_STACK_CODE_LANGUAGES,
} from './implement-queue-using-stack-problem-content';

export interface MQStep {
  inStack: number[];
  outStack: number[];
  outputs: Array<{ op: string; value: number | boolean }>;
  currentOp: string;
  transferHappened: boolean;
  action: 'init' | 'push' | 'transfer' | 'pop' | 'peek' | 'empty' | 'done';
  message: string;
  codeLine: number;
}

export function buildImplementQueueUsingStackSteps(rawOpsInput: string): MQStep[] {
  const steps: MQStep[] = [];
  const inStack: number[] = [];
  const outStack: number[] = [];
  const outputs: Array<{ op: string; value: number | boolean }> = [];

  const rawOps = (rawOpsInput || 'push 1, push 2, peek, pop, empty')
    .split(/[,，;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);

  steps.push({
    inStack: [],
    outStack: [],
    outputs: [],
    currentOp: 'init',
    transferHappened: false,
    action: 'init',
    message: '初始化：inStack (输入栈) 与 outStack (输出栈) 均为空',
    codeLine: 4,
  });

  for (let i = 0; i < rawOps.length; i++) {
    const opStr = rawOps[i];
    const parts = opStr.split(/\s+/);
    const op = parts[0].toLowerCase();
    const val = parts.length > 1 ? parseInt(parts[1], 10) : NaN;

    if (op === 'push') {
      const num = isNaN(val) ? 1 : val;
      inStack.push(num);

      steps.push({
        inStack: [...inStack],
        outStack: [...outStack],
        outputs: [...outputs],
        currentOp: `push(${num})`,
        transferHappened: false,
        action: 'push',
        message: `📥 执行 push(${num})：直接压入 inStack 栈顶`,
        codeLine: 8,
      });
    } else if (op === 'pop') {
      let transfer = false;
      if (outStack.length === 0) {
        transfer = true;
        while (inStack.length > 0) {
          outStack.push(inStack.pop()!);
        }

        steps.push({
          inStack: [...inStack],
          outStack: [...outStack],
          outputs: [...outputs],
          currentOp: 'dumpStackIn()',
          transferHappened: true,
          action: 'transfer',
          message: '🔀 outStack 为空！触发倾倒转移：将 inStack 全部元素依次弹出并压入 outStack，原顺序完全逆转为队头优先！',
          codeLine: 19,
        });
      }

      if (outStack.length > 0) {
        const popped = outStack.pop()!;
        outputs.push({ op: 'pop', value: popped });

        steps.push({
          inStack: [...inStack],
          outStack: [...outStack],
          outputs: [...outputs],
          currentOp: 'pop()',
          transferHappened: transfer,
          action: 'pop',
          message: `📤 执行 pop()：从 outStack 弹出栈顶元素 ${popped}（即队列头部）并返回`,
          codeLine: 14,
        });
      } else {
        steps.push({
          inStack: [...inStack],
          outStack: [...outStack],
          outputs: [...outputs],
          currentOp: 'pop()',
          transferHappened: false,
          action: 'pop',
          message: '⚠️ 队列为空，pop() 无元素可弹出',
          codeLine: 14,
        });
      }
    } else if (op === 'peek' || op === 'top') {
      let transfer = false;
      if (outStack.length === 0) {
        transfer = true;
        while (inStack.length > 0) {
          outStack.push(inStack.pop()!);
        }

        steps.push({
          inStack: [...inStack],
          outStack: [...outStack],
          outputs: [...outputs],
          currentOp: 'dumpStackIn()',
          transferHappened: true,
          action: 'transfer',
          message: '🔀 peek 操作检测到 outStack 为空，先执行倾倒转移',
          codeLine: 19,
        });
      }

      if (outStack.length > 0) {
        const peekVal = outStack[outStack.length - 1];
        outputs.push({ op: 'peek', value: peekVal });

        steps.push({
          inStack: [...inStack],
          outStack: [...outStack],
          outputs: [...outputs],
          currentOp: 'peek()',
          transferHappened: transfer,
          action: 'peek',
          message: `🔍 执行 peek()：查看到当前队头元素为 ${peekVal}（不弹出）`,
          codeLine: 23,
        });
      } else {
        steps.push({
          inStack: [...inStack],
          outStack: [...outStack],
          outputs: [...outputs],
          currentOp: 'peek()',
          transferHappened: false,
          action: 'peek',
          message: '⚠️ 队列为空，peek() 无队头元素',
          codeLine: 23,
        });
      }
    } else if (op === 'empty') {
      const isEmpty = inStack.length === 0 && outStack.length === 0;
      outputs.push({ op: 'empty', value: isEmpty });

      steps.push({
        inStack: [...inStack],
        outStack: [...outStack],
        outputs: [...outputs],
        currentOp: 'empty()',
        transferHappened: false,
        action: 'empty',
        message: `⚖️ 执行 empty()：inStack 与 outStack 均${isEmpty ? '为空，返回 true' : '不全为空，返回 false'}`,
        codeLine: 27,
      });
    }
  }

  steps.push({
    inStack: [...inStack],
    outStack: [...outStack],
    outputs: [...outputs],
    currentOp: 'done',
    transferHappened: false,
    action: 'done',
    message: '🎉 操作序列执行完毕！',
    codeLine: 30,
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<MQStep>({
  id: 'implement-queue-using-stack',
  name: '用栈实现队列',
  category: 'stack',
  icon: '🔄',
  badge: {
    mode: '双栈架构·均摊 O(1)',
    complexity: '均摊 O(1) · O(n)',
  },
  card1Title: '🔄 双栈交互与队列逻辑流沙盘',
  card2Title: '📦 队列状态与指标监控',
  card2Desc: '当前操作指令、双栈元素容量与出队输出记录',
  legend: [
    { label: '📥 输入栈 inStack', color: '#2563eb' },
    { label: '📤 输出栈 outStack', color: '#10b981' },
    { label: '🔀 倾倒倒置流', color: '#f59e0b' },
  ],
  inputs: [
    {
      id: 'input-ops',
      label: '操作序列',
      type: 'text',
      defaultValue: 'push 1, push 2, peek, pop, empty',
      width: '180px',
      placeholder: 'push 1, push 2, peek...',
    },
  ],
  presets: [
    {
      label: '经典示例',
      values: { 'input-ops': 'push 1, push 2, peek, pop, empty' },
    },
    {
      label: '交替出入队',
      values: { 'input-ops': 'push 1, push 2, push 3, pop, push 4, pop, pop, pop' },
    },
    {
      label: '连续窥探',
      values: { 'input-ops': 'push 10, push 20, push 30, peek, pop, peek' },
    },
  ],
  metrics: [
    { id: 'queue-size', label: '队列总元素数', color: '#2563eb' },
    { id: 'in-size', label: 'inStack 大小', color: '#3b82f6' },
    { id: 'out-size', label: 'outStack 大小', color: '#10b981' },
  ],
  codeLanguages: IMPLEMENT_QUEUE_USING_STACK_CODE_LANGUAGES,
  problemHtml: IMPLEMENT_QUEUE_USING_STACK_PROBLEM_HTML,
  analysisHtml: IMPLEMENT_QUEUE_USING_STACK_ANALYSIS_HTML,
  buildSteps: (inputs) => buildImplementQueueUsingStackSteps(inputs['input-ops']),
  renderCanvas: (container, step) => {
    // 渲染扁平双栈沙盘（绝无任何嵌套白色 card 边框）
    DualStructureVisualAdapter.renderDualStack(container, step);

    // 更新指标卡片
    const root = container.closest('#algo-implement-queue-using-stack-view');
    if (root) {
      const qSizeEl = root.querySelector('#metric-queue-size');
      const inSizeEl = root.querySelector('#metric-in-size');
      const outSizeEl = root.querySelector('#metric-out-size');
      const totalSize = step.inStack.length + step.outStack.length;

      if (qSizeEl) qSizeEl.textContent = `${totalSize}`;
      if (inSizeEl) inSizeEl.textContent = `${step.inStack.length}`;
      if (outSizeEl) outSizeEl.textContent = `${step.outStack.length}`;

      // 在 Card 2 中展示出队与窥探记录流
      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const outputsHtml =
          step.outputs.length === 0
            ? '<span style="color: #94a3b8; font-size: 11px; font-style: italic;">暂无出队记录</span>'
            : step.outputs
                .map(
                  (out, idx) => `
                  <span style="display: inline-flex; align-items: center; gap: 3px; background: #ffffff; border: 1px solid #cbd5e1; padding: 1px 6px; border-radius: 4px; font-size: 10.5px; font-family: monospace;">
                    <span style="color: #64748b;">#${idx + 1}</span>
                    <strong style="color: ${out.op === 'pop' ? '#dc2626' : '#2563eb'};">${out.op}</strong>: ${out.value}
                  </span>
                `
                )
                .join(' ');

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 4px; padding: 4px 0;">
            <span style="font-size: 10.5px; font-weight: 700; color: #475569;">出队与窥探输出记录:</span>
            <div style="display: flex; flex-wrap: wrap; gap: 4px;">${outputsHtml}</div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'implement-queue-using-stack',
  name: '用栈实现队列',
  viewId: 'algo-implement-queue-using-stack-view',
  category: 'stack',
  description: '双栈架构：输入栈 inStack 处理 push，输出栈 outStack 为空时一次性倾倒反转实现 FIFO',
  icon: '🔄',
  template,
  Visualizer,
  difficulty: 1,
  levelOrder: 4,
  learningGoal: '掌握双栈组合出 FIFO 队列的精妙架构，理解均摊时间复杂度 O(1) 的倒栈触发准则',
});
