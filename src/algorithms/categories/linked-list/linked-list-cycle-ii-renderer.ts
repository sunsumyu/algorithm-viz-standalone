/**
 * 环形链表 II 可视化器 — 4-Card 标准现代架构
 * LeetCode 142：快慢指针相遇与入口数学推导 (x = z)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  LINKED_LIST_CYCLE_II_PROBLEM_HTML,
  LINKED_LIST_CYCLE_II_ANALYSIS_HTML,
  LINKED_LIST_CYCLE_II_CODE_LANGUAGES,
} from './linked-list-cycle-ii-problem-content';
import template from './linked-list-cycle-ii.html?raw';

export interface CycleStep {
  values: number[];
  pos: number; // 入环下标，-1 无环
  fast: number; // fast / index2 当前下标 (-1 表示 null)
  slow: number; // slow / index1 当前下标 (-1 表示 null)
  meetIndex: number; // 相遇点下标，-1 未相遇
  entryIndex: number; // 入环口下标，-1 未确定
  phase: 'init' | 'chase' | 'meet' | 'find_entry' | 'done_entrance' | 'no_cycle';
  message: string;
  codeLine: number;
}

export function buildCycleSteps(values: number[], pos: number): CycleStep[] {
  const steps: CycleStep[] = [];
  const n = values.length;

  if (n === 0) return steps;

  steps.push({
    values,
    pos,
    fast: 0,
    slow: 0,
    meetIndex: -1,
    entryIndex: -1,
    phase: 'init',
    message: pos === -1 ? '链表无环。fast 与 slow 从 head (下标 0) 出发。' : `链表有环 (尾节点连回下标 ${pos})。fast (每次2步) 与 slow (每次1步) 开始追逐。`,
    codeLine: 2,
  });

  if (pos === -1) {
    let fast = 0;
    let slow = 0;
    while (fast < n && fast + 1 < n) {
      fast += 2;
      slow += 1;
      steps.push({
        values,
        pos,
        fast: Math.min(fast, n),
        slow: Math.min(slow, n),
        meetIndex: -1,
        entryIndex: -1,
        phase: 'chase',
        message: `fast 走2步到 ${fast >= n ? 'null' : `[${fast}](${values[fast]})`}，slow 走1步到 [${slow}](${values[slow]})`,
        codeLine: 6,
      });
    }
    steps.push({
      values,
      pos,
      fast: -1,
      slow,
      meetIndex: -1,
      entryIndex: -1,
      phase: 'no_cycle',
      message: 'fast 到达 null (fast == null || fast.next == null)，说明无环，返回 null。',
      codeLine: 17,
    });
    return steps;
  }

  // 有环：阶段 1 追逐
  const next = (i: number): number => (i === n - 1 ? pos : i + 1);

  let fast = 0;
  let slow = 0;
  let meet = -1;

  for (let iter = 0; iter < 40; iter++) {
    const f1 = next(fast);
    const f2 = next(f1);
    const s1 = next(slow);

    fast = f2;
    slow = s1;

    if (fast === slow) {
      meet = fast;
      steps.push({
        values,
        pos,
        fast,
        slow,
        meetIndex: meet,
        entryIndex: -1,
        phase: 'meet',
        message: `🎉 fast 与 slow 在下标 [${meet}] (值 ${values[meet]}) 处相遇！开始启动阶段二：推纳入环口 (x = z)。`,
        codeLine: 9,
      });
      break;
    } else {
      steps.push({
        values,
        pos,
        fast,
        slow,
        meetIndex: -1,
        entryIndex: -1,
        phase: 'chase',
        message: `fast 走2步到 [${fast}](${values[fast]})，slow 走1步到 [${slow}](${values[slow]})`,
        codeLine: 6,
      });
    }
  }

  // 阶段 2: index1 = head, index2 = meet，每次各走 1 步
  let index1 = 0;
  let index2 = meet;

  steps.push({
    values,
    pos,
    fast: index2,
    slow: index1,
    meetIndex: meet,
    entryIndex: -1,
    phase: 'find_entry',
    message: `阶段二初始化：index1 指向 head (下标 0)，index2 指向相遇点 (下标 ${meet})，每次各走 1 步。`,
    codeLine: 12,
  });

  while (index1 !== index2) {
    index1 = next(index1);
    index2 = next(index2);

    if (index1 === index2) {
      break;
    }

    steps.push({
      values,
      pos,
      fast: index2,
      slow: index1,
      meetIndex: meet,
      entryIndex: -1,
      phase: 'find_entry',
      message: `index1 移动到 [${index1}](${values[index1]})，index2 移动到 [${index2}](${values[index2]})`,
      codeLine: 14,
    });
  }

  // 找到入环口
  steps.push({
    values,
    pos,
    fast: index2,
    slow: index1,
    meetIndex: meet,
    entryIndex: index1,
    phase: 'done_entrance',
    message: `🎉 index1 与 index2 在下标 [${index1}] (值 ${values[index1]}) 处相遇！成功锁定入环起始节点！`,
    codeLine: 16,
  });

  return steps;
}

export class LinkedListCycleIIVisualizer extends StepVisualizer<CycleStep> {
  protected codeLanguages = LINKED_LIST_CYCLE_II_CODE_LANGUAGES;
  protected codeLines = LINKED_LIST_CYCLE_II_CODE_LANGUAGES['java'];
  protected codePanelTitle = '环形链表 II 代码调试';

  private sandboxContainer: HTMLElement | null = null;
  private pointersContainer: HTMLElement | null = null;
  private decisionMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#llc-sandbox-container');
    this.pointersContainer = this.root.querySelector('#llc-pointers-container');
    this.decisionMonitorContainer = this.root.querySelector('#llc-decision-monitor-container');
    this.metricsContainer = this.root.querySelector('#llc-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: LINKED_LIST_CYCLE_II_PROBLEM_HTML,
      analysisHtml: LINKED_LIST_CYCLE_II_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): CycleStep[] {
    const select = this.root?.querySelector('#select-cycle-case') as HTMLSelectElement | null;
    const val = select?.value || 'ex1';
    if (val === 'ex1') return buildCycleSteps([3, 2, 0, -4], 1);
    if (val === 'ex2') return buildCycleSteps([1, 2], 0);
    return buildCycleSteps([1], -1);
  }

  protected renderStep(step: CycleStep): void {
    const values = step.values;
    const pos = step.pos;
    const isPhase2 = step.phase === 'find_entry' || step.phase === 'done_entrance';

    // 1. 渲染环形拓扑沙盘 (Card 1)
    if (this.sandboxContainer) {
      const nodesHtml = values
        .map((val, idx) => {
          const isEntrance = pos !== -1 && idx === pos;
          const isMeetNode = step.meetIndex !== -1 && idx === step.meetIndex;

          const pointerBadges: string[] = [];
          if (step.slow === idx) {
            pointerBadges.push(
              `<span style="background:#059669; color:#ffffff; padding:1px 4px; border-radius:4px; font-size:9px; font-weight:800;">${isPhase2 ? 'idx1' : 'slow'}</span>`
            );
          }
          if (step.fast === idx) {
            pointerBadges.push(
              `<span style="background:#2563eb; color:#ffffff; padding:1px 4px; border-radius:4px; font-size:9px; font-weight:800;">${isPhase2 ? 'idx2' : 'fast'}</span>`
            );
          }

          let borderColor = '#e2e8f0';
          let bgColor = '#ffffff';
          if (isEntrance) {
            borderColor = '#ec4899';
            bgColor = '#fdf2f8';
          }
          if (isMeetNode) {
            borderColor = '#8b5cf6';
          }

          return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 3px; position: relative;">
              <div style="min-height: 14px; display: flex; gap: 2px;">
                ${pointerBadges.join('')}
              </div>
              <div style="min-width: 44px; height: 44px; padding: 0 8px; border-radius: 10px; background: ${bgColor}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                <span style="font-size: 13px; font-weight: 800; color: ${isEntrance ? '#be185d' : '#0f172a'}; font-family: 'JetBrains Mono', monospace;">
                  ${val}
                </span>
                <span style="font-size: 8.5px; color: #94a3b8; font-family: monospace;">[${idx}]</span>
              </div>
              ${isEntrance ? '<span style="font-size: 9px; color: #ec4899; font-weight: 800;">入环点</span>' : ''}
              ${isMeetNode ? '<span style="font-size: 9px; color: #8b5cf6; font-weight: 800;">相遇点</span>' : ''}
            </div>
          `;
        })
        .join(`
          <div style="display: flex; align-items: center; color: #94a3b8; font-size: 14px; margin-top: 14px;">▶</div>
        `);

      const loopBackHtml =
        pos !== -1
          ? `
        <div style="width: 100%; display: flex; align-items: center; justify-content: center; margin-top: 8px;">
          <div style="display: flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; background: #fdf2f8; border: 1px dashed #ec4899; color: #be185d; font-size: 10.5px; font-weight: 700;">
            <span>↩ 末尾节点 [${values.length - 1}] 指向入环节点 [${pos}] (构成环状闭合)</span>
          </div>
        </div>
      `
          : `
        <div style="width: 100%; display: flex; align-items: center; justify-content: center; margin-top: 8px;">
          <div style="display: flex; align-items: center; gap: 6px; padding: 4px 12px; border-radius: 20px; background: #f1f5f9; border: 1px dashed #cbd5e1; color: #64748b; font-size: 10.5px;">
            <span>末尾节点指向 null (无环线性单链表)</span>
          </div>
        </div>
      `;

      this.sandboxContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%;">
          <div style="display: flex; align-items: center; gap: 8px; overflow-x: auto; padding: 6px 0;">
            ${nodesHtml}
          </div>
          ${loopBackHtml}
        </div>
      `;
    }

    // 2. 渲染指针追踪 (Card 2 Left)
    if (this.pointersContainer) {
      const p1Label = isPhase2 ? 'index1 (head出发)' : 'slow (1步/拍)';
      const p2Label = isPhase2 ? 'index2 (相遇点出发)' : 'fast (2步/拍)';

      const p1Val = step.slow === -1 ? 'null' : `[${step.slow}] (值 ${values[step.slow]})`;
      const p2Val = step.fast === -1 ? 'null' : `[${step.fast}] (值 ${values[step.fast]})`;

      this.pointersContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>${p1Label}:</span>
            <span style="font-family: monospace; font-weight: 800; color: #059669;">${p1Val}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>${p2Label}:</span>
            <span style="font-family: monospace; font-weight: 800; color: #2563eb;">${p2Val}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>相遇判定 (${isPhase2 ? 'idx1 == idx2' : 'fast == slow'}):</span>
            <span style="font-family: monospace; font-weight: 800; color: ${step.phase === 'meet' || step.phase === 'done_entrance' ? '#059669' : '#64748b'};">
              ${step.phase === 'meet' || step.phase === 'done_entrance' ? 'true' : 'false'}
            </span>
          </div>
        </div>
      `;
    }

    // 3. 渲染阶段监视器 (Card 2 Center)
    if (this.decisionMonitorContainer) {
      let phaseBadge = '';
      if (step.phase === 'init') phaseBadge = '<span style="background:#eff6ff; color:#2563eb; padding:2px 6px; border-radius:4px; font-weight:700;">初始化</span>';
      else if (step.phase === 'chase') phaseBadge = '<span style="background:#fef3c7; color:#d97706; padding:2px 6px; border-radius:4px; font-weight:700;">阶段一: 环内快慢追击</span>';
      else if (step.phase === 'meet') phaseBadge = '<span style="background:#f3e8ff; color:#9333ea; padding:2px 6px; border-radius:4px; font-weight:700;">🎉 阶段一完成: 相遇</span>';
      else if (step.phase === 'find_entry') phaseBadge = '<span style="background:#eff6ff; color:#2563eb; padding:2px 6px; border-radius:4px; font-weight:700;">阶段二: 等速同步寻入口</span>';
      else if (step.phase === 'done_entrance') phaseBadge = '<span style="background:#ecfdf5; color:#059669; padding:2px 6px; border-radius:4px; font-weight:700;">🏆 阶段二完成: 锁定入环口</span>';
      else phaseBadge = '<span style="background:#fef2f2; color:#ef4444; padding:2px 6px; border-radius:4px; font-weight:700;">无环判定</span>';

      this.decisionMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>当前算法阶段:</span>
            ${phaseBadge}
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 数学定理: <strong>2(x+y) = x+y+n(y+z) &rArr; x = (n-1)(y+z)+z</strong></div>
            <div>• 当 n=1 时: <strong>x = z</strong> (head 出发与相遇点出发必定在入环口相遇)</div>
          </div>
        </div>
      `;
    }

    // 4. 渲染入环结果 (Card 2 Bottom)
    if (this.metricsContainer) {
      let resultText = '<span style="color:#64748b;">判定追击中...</span>';
      if (step.phase === 'done_entrance') {
        resultText = `<strong style="color: #059669; font-family: monospace; font-size: 13px;">索引 [${step.entryIndex}] (值 ${values[step.entryIndex]})</strong>`;
      } else if (step.phase === 'no_cycle') {
        resultText = '<strong style="color: #ef4444; font-family: monospace; font-size: 13px;">null (链表无环)</strong>';
      }

      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>入环起始节点 (Cycle Entrance): ${resultText}</span>
            <span style="font-family: monospace; font-weight: 700; color: #2563eb;">定理证明完毕</span>
          </div>
        </div>
      `;
    }

    const badgeStatus = this.root?.querySelector('#badge-cycle-status') as HTMLElement | null;
    if (badgeStatus) {
      if (step.phase === 'done_entrance') {
        badgeStatus.textContent = '入环点已锁定';
        badgeStatus.style.background = '#ecfdf5';
        badgeStatus.style.color = '#059669';
      } else if (step.phase === 'no_cycle') {
        badgeStatus.textContent = '无环';
        badgeStatus.style.background = '#fef2f2';
        badgeStatus.style.color = '#ef4444';
      } else if (step.phase === 'meet') {
        badgeStatus.textContent = '环内相遇';
        badgeStatus.style.background = '#f3e8ff';
        badgeStatus.style.color = '#9333ea';
      } else {
        badgeStatus.textContent = '追击中';
        badgeStatus.style.background = '#eff6ff';
        badgeStatus.style.color = '#2563eb';
      }
    }

    // 5. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let badgeColor = '#64748b';
        let badgeBg = '#f1f5f9';
        let badgeText = '扫描';

        if (st.phase === 'chase') {
          badgeColor = '#d97706';
          badgeBg = '#fef3c7';
          badgeText = '追击';
        } else if (st.phase === 'meet') {
          badgeColor = '#9333ea';
          badgeBg = '#f3e8ff';
          badgeText = '相遇';
        } else if (st.phase === 'find_entry') {
          badgeColor = '#2563eb';
          badgeBg = '#eff6ff';
          badgeText = '寻径';
        } else if (st.phase === 'done_entrance') {
          badgeColor = '#059669';
          badgeBg = '#ecfdf5';
          badgeText = '锁定';
        } else if (st.phase === 'no_cycle') {
          badgeColor = '#ef4444';
          badgeBg = '#fef2f2';
          badgeText = '无环';
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
  id: 'linked-list-cycle-ii',
  name: '环形链表 II',
  viewId: 'algo-linked-list-cycle-ii-view',
  category: 'linked-list',
  description: 'LeetCode 142 · 快慢指针判断环形与相遇点，严谨数学推导 (x = z) 寻找入环口',
  icon: '🔄',
  template,
  Visualizer: LinkedListCycleIIVisualizer,
  difficulty: 2,
  levelOrder: 4,
  learningGoal: '掌握 Floyd 判圈算法数学推导原理与快慢双指针协作技巧',
});
