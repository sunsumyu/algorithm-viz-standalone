/**
 * 下一个更大元素 II 可视化器（单调栈 · 循环数组）— 4-Card 标准现代架构
 * LeetCode 503：利用取模 2n 轮循环遍历 (i % n)，单调递增栈（栈头到栈底）
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  NEXT_GREATER_ELEMENT_II_PROBLEM_HTML,
  NEXT_GREATER_ELEMENT_II_ANALYSIS_HTML,
  NEXT_GREATER_ELEMENT_II_CODE_LANGUAGES,
} from './next-greater-element-ii-problem-content';
import template from './next-greater-element-ii.html?raw';

export interface NGE2Step {
  nums: number[];
  currentIndex: number; // 0 到 2n-1
  actualIndex: number;  // currentIndex % n
  lap: number;          // 0 = 第 1 轮, 1 = 第 2 轮
  stack: number[];      // 存储实际下标
  result: number[];
  poppedIndex: number | null;
  action: 'init' | 'scan' | 'pop_resolve' | 'push' | 'done';
  message: string;
  codeLine: number;
}

export function buildNextGreaterElementIISteps(rawNums: number[]): NGE2Step[] {
  const steps: NGE2Step[] = [];
  const n = rawNums.length;

  if (n === 0) {
    steps.push({
      nums: [],
      currentIndex: -1,
      actualIndex: -1,
      lap: 0,
      stack: [],
      result: [],
      poppedIndex: null,
      action: 'done',
      message: '输入数组为空，返回空数组',
      codeLine: 2,
    });
    return steps;
  }

  const result = new Array(n).fill(-1);
  const stack: number[] = [];

  steps.push({
    nums: [...rawNums],
    currentIndex: -1,
    actualIndex: -1,
    lap: 0,
    stack: [],
    result: [...result],
    poppedIndex: null,
    action: 'init',
    message: `初始化：共 ${n} 个元素，结果数组全置 -1，通过模拟 2 轮遍历 (0 &rarr; ${2 * n - 1}) 处理循环边界`,
    codeLine: 4,
  });

  for (let i = 0; i < 2 * n; i++) {
    const idx = i % n;
    const lap = i < n ? 0 : 1;
    const curVal = rawNums[idx];

    steps.push({
      nums: [...rawNums],
      currentIndex: i,
      actualIndex: idx,
      lap,
      stack: [...stack],
      result: [...result],
      poppedIndex: null,
      action: 'scan',
      message: `🔁 模拟步数 [${i}] (第 ${lap + 1} 轮, 实际下标 [${idx}], 值 ${curVal})：与栈顶 ${stack.length > 0 ? `下标 [${stack[stack.length - 1]}] (${rawNums[stack[stack.length - 1]]})` : '（栈空）'} 比对`,
      codeLine: 8,
    });

    while (stack.length > 0 && curVal > rawNums[stack[stack.length - 1]]) {
      const topIdx = stack.pop()!;
      result[topIdx] = curVal;

      steps.push({
        nums: [...rawNums],
        currentIndex: i,
        actualIndex: idx,
        lap,
        stack: [...stack],
        result: [...result],
        poppedIndex: topIdx,
        action: 'pop_resolve',
        message: `🔥 循环破局！下标 [${idx}] (${curVal}) > 栈顶下标 [${topIdx}] (${rawNums[topIdx]})！设置 res[${topIdx}] = ${curVal}，出栈！`,
        codeLine: 9,
      });
    }

    stack.push(idx);

    steps.push({
      nums: [...rawNums],
      currentIndex: i,
      actualIndex: idx,
      lap,
      stack: [...stack],
      result: [...result],
      poppedIndex: null,
      action: 'push',
      message: `📥 将下标 [${idx}] (值 ${curVal}) 压入单调栈，维持单调递减`,
      codeLine: 11,
    });
  }

  steps.push({
    nums: [...rawNums],
    currentIndex: 2 * n - 1,
    actualIndex: n - 1,
    lap: 1,
    stack: [...stack],
    result: [...result],
    poppedIndex: null,
    action: 'done',
    message: `🎉 2 轮循环遍历结算完成！最终循环下一个更大元素数组：[${result.join(', ')}]`,
    codeLine: 13,
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class NextGreaterElementIIVisualizer extends StepVisualizer<NGE2Step> {
  protected codeLanguages = NEXT_GREATER_ELEMENT_II_CODE_LANGUAGES;
  protected codeLines = NEXT_GREATER_ELEMENT_II_CODE_LANGUAGES['java'];
  protected codePanelTitle = '下一个更大元素 II 代码调试';

  private sandboxContainer: HTMLElement | null = null;
  private indexContainer: HTMLElement | null = null;
  private decisionMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#nge2-sandbox-container');
    this.indexContainer = this.root.querySelector('#nge2-index-container');
    this.decisionMonitorContainer = this.root.querySelector('#nge2-decision-monitor-container');
    this.metricsContainer = this.root.querySelector('#nge2-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.nge2-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nEl = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
        if (nEl && btn.dataset.nums) nEl.value = btn.dataset.nums;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: NEXT_GREATER_ELEMENT_II_PROBLEM_HTML,
      analysisHtml: NEXT_GREATER_ELEMENT_II_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): NGE2Step[] {
    const nEl = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
    const rawNums = (nEl?.value || '1,2,1')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    return buildNextGreaterElementIISteps(rawNums.length ? rawNums : [1, 2, 1]);
  }

  protected renderStep(step: NGE2Step): void {
    const nums = step.nums;
    const stack = step.stack;
    const result = step.result;
    const n = nums.length;

    // 1. 渲染循环数组展开与单调栈沙盘 (Card 1)
    if (this.sandboxContainer && n > 0) {
      const curIdx = step.currentIndex;
      const actIdx = step.actualIndex;
      const isDone = step.action === 'done';

      // 展开为 2 轮条带
      const doubleArray = [...nums, ...nums];
      const ribbonsHtml = doubleArray
        .map((num, i) => {
          const isCurrent = i === curIdx && !isDone;
          const origIdx = i % n;
          const isRound2 = i >= n;
          const inStack = stack.includes(origIdx);
          const isPopped = origIdx === step.poppedIndex;
          const resVal = result[origIdx];

          let bg = '#ffffff';
          let border = isRound2 ? '#c7d2fe' : '#e2e8f0';
          let textColor = isRound2 ? '#4f46e5' : '#0f172a';

          if (isCurrent) {
            bg = '#eef2ff';
            border = '#4f46e5';
            textColor = '#4338ca';
          } else if (isPopped) {
            bg = '#ecfdf5';
            border = '#10b981';
            textColor = '#059669';
          } else if (inStack) {
            bg = '#fffbeb';
            border = '#fde68a';
            textColor = '#d97706';
          }

          return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
              <span style="font-size: 8px; color: ${isCurrent ? '#4f46e5' : isRound2 ? '#818cf8' : '#94a3b8'}; font-weight: 700;">
                ${isRound2 ? `R2[${origIdx}]` : `[${origIdx}]`}
              </span>
              <div style="width: 44px; height: 44px; border-radius: 10px; background: ${bg}; border: 2px solid ${border}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                <span>${num}</span>
                <span style="font-size: 8.5px; color: ${resVal !== -1 ? '#10b981' : '#94a3b8'}; font-weight: 700;">
                  ${resVal !== -1 ? `&rarr;${resVal}` : ''}
                </span>
              </div>
            </div>
          `;
        })
        .join('');

      // 栈内展示
      const stackItemsHtml = stack
        .map((idx) => {
          return `
            <div style="padding: 2px 8px; border-radius: 6px; background: #fffbeb; border: 1.5px solid #fde68a; color: #b45309; font-size: 11px; font-weight: 800; font-family: 'JetBrains Mono', monospace; display: flex; align-items: center; gap: 4px;">
              <span>[${idx}]</span>
              <span style="color: #4f46e5;">val: ${nums[idx]}</span>
            </div>
          `;
        })
        .join('');

      this.sandboxContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <!-- 循环展开条带 -->
          <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #475569;">
            <span>🔄 循环 2 轮展开 (第 1 轮 [0..${n - 1}] + 第 2 轮 [${n}..${2 * n - 1}]):</span>
            <span style="color: #4f46e5;">当前轮次: 第 ${step.lap + 1} 轮 (i=${curIdx >= 0 ? curIdx : '-'})</span>
          </div>
          <div style="display: flex; gap: 5px; overflow-x: auto; padding: 2px 0;">
            ${ribbonsHtml}
          </div>

          <!-- 单调栈容器 -->
          <div style="display: flex; align-items: center; gap: 8px; padding-top: 2px; border-top: 1px dashed #e2e8f0;">
            <span style="font-size: 10.5px; font-weight: 700; color: #475569; white-space: nowrap;">🥞 单调栈 (栈底 &rarr; 栈顶):</span>
            <div style="display: flex; gap: 4px; overflow-x: auto; flex: 1; align-items: center; min-height: 28px;">
              ${stack.length > 0 ? stackItemsHtml : '<span style="font-size: 10.5px; color: #94a3b8;">栈空</span>'}
            </div>
          </div>
        </div>
      `;
    }

    // 2. 渲染循环索引与栈顶 (Card 2 Left)
    if (this.indexContainer) {
      const curIdx = step.currentIndex;
      const actIdx = step.actualIndex;
      const topIdx = stack.length > 0 ? stack[stack.length - 1] : null;

      this.indexContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>循环步数与实际下标:</span>
            <span style="font-family: monospace; font-weight:800; color: #4f46e5; font-size: 12.5px;">
              ${curIdx >= 0 ? `i=${curIdx} &rarr; [${actIdx}] (值 ${nums[actIdx]})` : '-'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>当前栈顶下标与值:</span>
            <span style="font-family: monospace; font-weight:700; color: #d97706;">
              ${topIdx !== null ? `[${topIdx}] (值 ${nums[topIdx]})` : '（栈空）'}
            </span>
          </div>
        </div>
      `;
    }

    // 3. 渲染单调栈出栈决策监视器 (Card 2 Center)
    if (this.decisionMonitorContainer) {
      const isPop = step.action === 'pop_resolve';
      const isPush = step.action === 'push';

      this.decisionMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>操作决策:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isPop ? '#ecfdf5' : isPush ? '#eef2ff' : '#f8fafc'}; color: ${isPop ? '#059669' : isPush ? '#4338ca' : '#64748b'}; border: 1px solid ${isPop ? '#a7f3d0' : isPush ? '#c7d2fe' : '#e2e8f0'};">
              ${isPop ? `🔥 循环找到更大值 (res[${step.poppedIndex}] = ${result[step.poppedIndex ?? 0]})` : isPush ? '📥 压入栈顶 (维持单调递减)' : '🔍 比对栈顶'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 准则: <code style="color:#4f46e5; font-family:monospace;">循环遍历 2n 次，用 i%n 自动连接数组首尾</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染最终循环答案看板 (Card 2 Bottom)
    if (this.metricsContainer) {
      const resolvedCount = result.filter((r) => r !== -1).length;
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>答案数组: <strong style="color: #4f46e5; font-family: monospace; font-size: 13.5px;">[${result.join(', ')}]</strong></span>
            <span style="font-family: monospace; font-weight: 700; color: #059669;">已确定 ${resolvedCount} / ${n} 个</span>
          </div>
        </div>
      `;
    }

    const badgeResolved = this.root?.querySelector('#badge-resolved-count');
    if (badgeResolved) {
      const resolvedCount = result.filter((r) => r !== -1).length;
      badgeResolved.textContent = `已确定: ${resolvedCount} / ${n}`;
    }

    // 5. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let badgeColor = '#64748b';
        let badgeBg = '#f1f5f9';
        let badgeText = '扫描';

        if (st.action === 'pop_resolve') {
          badgeColor = '#059669';
          badgeBg = '#ecfdf5';
          badgeText = '结算';
        } else if (st.action === 'push') {
          badgeColor = '#4f46e5';
          badgeBg = '#eef2ff';
          badgeText = '入栈';
        } else if (st.action === 'done') {
          badgeColor = '#10b981';
          badgeBg = '#ecfdf5';
          badgeText = '完成';
        }

        return `
          <div style="display: flex; align-items: flex-start; gap: 6px; padding: 3px 0; border-bottom: 1px solid #f8fafc; font-size: 11px;">
            <span style="color: #94a3b8; font-family: monospace; font-size: 10px; min-width: 24px;">#${idx + 1}</span>
            <span style="background: ${badgeBg}; color: ${badgeColor}; padding: 1px 5px; border-radius: 4px; font-weight: 700; font-size: 10px;">${badgeText}</span>
            <span style="color: #334155; flex: 1;">${st.message}</span>
          </div>
        `;
      });

      this.logContainer.innerHTML = logs.join('');
      this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }
    if (this.logCountEl) {
      this.logCountEl.textContent = `${this.currentIndex + 1} / ${this.steps.length} 记录`;
    }
  }

  public reset(): void {
    super.reset();
    if (this.sandboxContainer) this.sandboxContainer.innerHTML = '';
  }
}

registerAlgorithm({
  id: 'next-greater-element-ii',
  name: '下一个更大元素 II',
  viewId: 'algo-next-greater-element-ii-view',
  category: 'monotonic-stack',
  description: '循环数组通过取模模拟 2 轮遍历 (i % n)，单调递减栈寻找循环右侧首个更大元素',
  icon: '🔄',
  template,
  Visualizer: NextGreaterElementIIVisualizer,
  difficulty: 2,
  levelOrder: 3,
  learningGoal: '掌握循环数组在单调栈中的取模模拟技巧，理解两轮遍历即可完备覆盖循环边界的数学原理',
});
