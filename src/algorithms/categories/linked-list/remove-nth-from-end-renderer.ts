/**
 * 删除链表的倒数第 N 个结点可视化器 — 4-Card 标准现代架构
 * LeetCode 19：dummyHead 虚拟头节点 + 快慢指针定距一趟扫描
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  REMOVE_NTH_FROM_END_PROBLEM_HTML,
  REMOVE_NTH_FROM_END_ANALYSIS_HTML,
  REMOVE_NTH_FROM_END_CODE_LANGUAGES,
} from './remove-nth-from-end-problem-content';
import template from './remove-nth-from-end.html?raw';

export interface RNStep {
  values: number[];
  fast: number; // -1 = dummy, values.length = null
  slow: number; // -1 = dummy
  removedIndex: number; // -1 表示未删除
  action: 'init' | 'fast_advance' | 'move_together' | 'delete_node' | 'done';
  message: string;
  codeLine: number;
}

export function parseValues(input: string): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return arr.length > 0 ? arr : [1, 2, 3, 4, 5];
}

export function buildRNSteps(values: number[], n: number): RNStep[] {
  const steps: RNStep[] = [];
  const len = values.length;

  if (len === 0 || n > len || n <= 0) {
    steps.push({
      values: [...values],
      fast: -1,
      slow: -1,
      removedIndex: -1,
      action: 'done',
      message: '输入不合法：链表为空或 n 超过链表总长度',
      codeLine: 1,
    });
    return steps;
  }

  // 1. 初始化
  let fast = -1; // -1 为 dummyHead
  let slow = -1;
  steps.push({
    values: [...values],
    fast,
    slow,
    removedIndex: -1,
    action: 'init',
    message: `创建虚拟头节点 dummyHead 指向 head，fast = slow = dummyHead。准备让 fast 先走 ${n + 1} 步建立定距窗口。`,
    codeLine: 2,
  });

  // 2. fast 先走 n + 1 步 (从 -1 走到 n-1，再走到 n)
  for (let i = 0; i <= n; i++) {
    fast = fast === -1 ? 0 : fast + 1;
    steps.push({
      values: [...values],
      fast,
      slow,
      removedIndex: -1,
      action: 'fast_advance',
      message: `① fast 先行第 ${i + 1} / ${n + 1} 步：fast 移动到 ${fast >= len ? 'null' : `节点 ${values[fast]}`}`,
      codeLine: 8,
    });
  }

  // 3. fast 与 slow 同时移动
  while (fast < len) {
    fast++;
    slow = slow === -1 ? 0 : slow + 1;
    steps.push({
      values: [...values],
      fast,
      slow,
      removedIndex: -1,
      action: 'move_together',
      message: `② 同步平移：fast 和 slow 同时前进 1 步 (保持间距)。fast=${fast >= len ? 'null' : `节点 ${values[fast]}`}, slow=${slow === -1 ? 'dummyHead' : `节点 ${values[slow]}`}`,
      codeLine: 13,
    });
  }

  // 4. 删除 slow.next
  const targetIdx = slow + 1;
  const targetVal = values[targetIdx];
  const nextVals = [...values];
  nextVals.splice(targetIdx, 1);

  steps.push({
    values: [...values],
    fast,
    slow,
    removedIndex: targetIdx,
    action: 'delete_node',
    message: `③ 跨越删除：fast 已到达末尾 null，slow.next 指向待删除的倒数第 ${n} 个节点 (节点 ${targetVal})。执行 slow.next = slow.next.next 完成删除！`,
    codeLine: 18,
  });

  // 5. done
  steps.push({
    values: nextVals,
    fast,
    slow,
    removedIndex: targetIdx,
    action: 'done',
    message: `🎉 删除完成！返回 dummyHead.next (新头节点 ${nextVals.length > 0 ? `节点 ${nextVals[0]}` : 'null'})`,
    codeLine: 19,
  });

  return steps;
}

export class RemoveNthFromEndVisualizer extends StepVisualizer<RNStep> {
  protected codeLanguages = REMOVE_NTH_FROM_END_CODE_LANGUAGES;
  protected codeLines = REMOVE_NTH_FROM_END_CODE_LANGUAGES['java'];
  protected codePanelTitle = '删除链表的倒数第 N 个结点 代码调试';

  private sandboxContainer: HTMLElement | null = null;
  private pointersContainer: HTMLElement | null = null;
  private decisionMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#rn-sandbox-container');
    this.pointersContainer = this.root.querySelector('#rn-pointers-container');
    this.decisionMonitorContainer = this.root.querySelector('#rn-decision-monitor-container');
    this.metricsContainer = this.root.querySelector('#rn-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: REMOVE_NTH_FROM_END_PROBLEM_HTML,
      analysisHtml: REMOVE_NTH_FROM_END_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): RNStep[] {
    const inputList = this.root?.querySelector('#input-list') as HTMLInputElement | null;
    const inputN = this.root?.querySelector('#input-n') as HTMLInputElement | null;
    const values = parseValues(inputList?.value || '1,2,3,4,5');
    const n = parseInt(inputN?.value || '2', 10);
    return buildRNSteps(values, n);
  }

  protected renderStep(step: RNStep): void {
    const originalValues = parseValues((this.root?.querySelector('#input-list') as HTMLInputElement | null)?.value || '1,2,3,4,5');
    const fast = step.fast;
    const slow = step.slow;
    const removed = step.removedIndex;
    const isDone = step.action === 'done';

    // 1. 渲染双指针定距滑窗沙盘 (Card 1)
    if (this.sandboxContainer) {
      const nodesHtml = originalValues
        .map((val, idx) => {
          const isFast = fast === idx;
          const isSlow = slow === idx;
          const isTarget = removed === idx;

          const pointerBadges: string[] = [];
          if (isSlow) pointerBadges.push('<span style="background: #059669; color: #ffffff; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">slow</span>');
          if (isFast) pointerBadges.push('<span style="background: #2563eb; color: #ffffff; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">fast</span>');

          return `
            <div style="display: flex; align-items: center; gap: 6px;">
              <!-- 节点盒 -->
              <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
                <div style="min-height: 14px; display: flex; gap: 2px;">
                  ${pointerBadges.join('')}
                </div>

                <div style="min-width: 44px; height: 44px; padding: 0 10px; border-radius: 10px; background: ${isTarget ? '#fef2f2' : isFast ? '#eff6ff' : isSlow ? '#ecfdf5' : '#ffffff'}; border: 2px ${isTarget ? 'dashed #ef4444' : isFast ? 'solid #2563eb' : isSlow ? 'solid #059669' : 'solid #e2e8f0'}; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: ${isDone && isTarget ? 0.35 : 1}; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
                  <span style="font-size: 13.5px; font-weight: 800; color: ${isTarget ? '#ef4444' : isFast ? '#1d4ed8' : isSlow ? '#047857' : '#0f172a'}; font-family: 'JetBrains Mono', monospace; text-decoration: ${isDone && isTarget ? 'line-through' : 'none'};">
                    ${val}
                  </span>
                  <span style="font-size: 8.5px; color: #94a3b8; font-family: monospace;">idx:${idx}</span>
                </div>

                <div style="font-size: 9px; color: ${isTarget ? '#ef4444' : '#64748b'}; font-weight: 700;">
                  ${isTarget ? '待删' : `第 ${idx + 1} 项`}
                </div>
              </div>

              <!-- 连接箭头 -->
              ${
                idx < originalValues.length - 1
                  ? `<div style="font-size: 14px; font-weight: 800; color: ${isDone && isTarget ? '#ef4444' : '#cbd5e1'};">▶</div>`
                  : ''
              }
            </div>
          `;
        })
        .join('');

      this.sandboxContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 6px; overflow-x: auto; padding: 6px 2px; min-height: 80px;">
            <!-- dummyHead 节点 -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
              <div style="min-height: 14px; display: flex; gap: 2px;">
                ${slow === -1 ? '<span style="background: #059669; color: #ffffff; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">slow</span>' : ''}
                ${fast === -1 ? '<span style="background: #2563eb; color: #ffffff; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">fast</span>' : ''}
              </div>
              <div style="min-width: 44px; height: 44px; border-radius: 10px; background: #f8fafc; border: 2px solid #64748b; display: flex; flex-direction: column; align-items: center; justify-content: center;">
                <span style="font-size: 11px; font-weight: 800; color: #334155; font-family: monospace;">dummy</span>
                <span style="font-size: 8.5px; color: #64748b;">(0)</span>
              </div>
              <div style="font-size: 9px; color: #64748b; font-weight: 700;">虚拟头</div>
            </div>

            <div style="font-size: 14px; font-weight: 800; color: #94a3b8;">▶</div>

            ${nodesHtml}

            <div style="font-size: 14px; font-weight: 800; color: #cbd5e1;">▶</div>

            <!-- 末尾 null -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
              <div style="min-height: 14px;">
                ${fast >= originalValues.length ? '<span style="background: #2563eb; color: #ffffff; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">fast</span>' : ''}
              </div>
              <div style="min-width: 40px; height: 44px; border-radius: 10px; background: #f1f5f9; border: 1.5px dashed #cbd5e1; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #94a3b8; font-family: monospace;">
                null
              </div>
              <div style="font-size: 9px; color: #94a3b8;">末尾终止</div>
            </div>
          </div>
        </div>
      `;
    }

    // 2. 渲染指针位置 (Card 2 Left)
    if (this.pointersContainer) {
      this.pointersContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>fast 指针位置:</span>
            <span style="font-family: monospace; font-weight:800; color: #2563eb;">
              ${fast === -1 ? 'dummyHead' : fast >= originalValues.length ? 'null (末尾)' : `[${fast}] 值 ${originalValues[fast]}`}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>slow 指针位置:</span>
            <span style="font-family: monospace; font-weight:800; color: #059669;">
              ${slow === -1 ? 'dummyHead' : `[${slow}] 值 ${originalValues[slow]}`}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>待删除目标 (slow.next):</span>
            <span style="font-family: monospace; font-weight:800; color: #ef4444;">
              ${slow + 1 < originalValues.length ? `[${slow + 1}] 节点 ${originalValues[slow + 1]}` : '无'}
            </span>
          </div>
        </div>
      `;
    }

    // 3. 渲染删除指令监视器 (Card 2 Center)
    if (this.decisionMonitorContainer) {
      let actionBadge = '';
      if (step.action === 'fast_advance') actionBadge = '<span style="background:#eff6ff; color:#2563eb; padding:2px 6px; border-radius:4px; font-weight:700;">① fast 先行 (拉开间距)</span>';
      else if (step.action === 'move_together') actionBadge = '<span style="background:#ecfdf5; color:#059669; padding:2px 6px; border-radius:4px; font-weight:700;">② fast & slow 同步平移</span>';
      else if (step.action === 'delete_node') actionBadge = '<span style="background:#fef2f2; color:#ef4444; padding:2px 6px; border-radius:4px; font-weight:700;">③ slow.next = slow.next.next</span>';
      else actionBadge = '<span style="background:#ecfdf5; color:#059669; padding:2px 6px; border-radius:4px; font-weight:700;">🎉 删除完成</span>';

      this.decisionMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>当前阶段:</span>
            ${actionBadge}
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 定距原理: <strong>fast 先走 n+1 步后，fast 触底时 slow 恰好在目标前驱</strong></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染新链表头节点 (Card 2 Bottom)
    if (this.metricsContainer) {
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>当前链表头 (dummy.next): <strong style="color: #059669; font-family: monospace; font-size: 13px;">${step.values.length > 0 ? `节点 ${step.values[0]}` : 'null (空链表)'}</strong></span>
            <span style="font-family: monospace; font-weight: 700; color: #2563eb;">剩余节点数: ${step.values.length}</span>
          </div>
        </div>
      `;
    }

    const badgeGap = this.root?.querySelector('#badge-gap-count');
    if (badgeGap) {
      const gap = Math.max(0, fast - slow);
      badgeGap.textContent = `指针间距: ${gap} 步`;
    }

    // 5. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let badgeColor = '#64748b';
        let badgeBg = '#f1f5f9';
        let badgeText = '扫描';

        if (st.action === 'fast_advance') {
          badgeColor = '#2563eb';
          badgeBg = '#eff6ff';
          badgeText = '先行';
        } else if (st.action === 'move_together') {
          badgeColor = '#059669';
          badgeBg = '#ecfdf5';
          badgeText = '平移';
        } else if (st.action === 'delete_node') {
          badgeColor = '#ef4444';
          badgeBg = '#fef2f2';
          badgeText = '删除';
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
  id: 'remove-nth-from-end',
  name: '删除链表的倒数第 N 个结点',
  viewId: 'algo-remove-nth-from-end-view',
  category: 'linked-list',
  description: 'LeetCode 19 · 虚拟头节点 + 快慢指针定距一趟扫描完成倒数第 N 个节点跨越删除',
  icon: '✂️',
  template,
  Visualizer: RemoveNthFromEndVisualizer,
  difficulty: 2,
  levelOrder: 2,
  learningGoal: '掌握虚拟头节点 (dummyHead) 消除特判与快慢指针定距一趟扫描删除链表结点的核心技巧',
});
