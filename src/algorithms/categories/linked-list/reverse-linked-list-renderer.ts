/**
 * 反转链表可视化器 — 4-Card 标准现代架构
 * LeetCode 206：双指针迭代，暂存 next 后继，原地反转指针指向
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  REVERSE_LINKED_LIST_PROBLEM_HTML,
  REVERSE_LINKED_LIST_ANALYSIS_HTML,
  REVERSE_LINKED_LIST_CODE_LANGUAGES,
} from './reverse-linked-list-problem-content';
import template from './reverse-linked-list.html?raw';

export interface RLStep {
  values: number[];
  /** nextDir[i] = i.next 指向的下标（-1 表示 null） */
  nextDir: number[];
  preIndex: number; // -1 = null
  curIndex: number; // -1 = null
  cachedNext: number; // 当前暂存的 next 节点下标（-1 表示 null 或无）
  reversedCount: number;
  action: 'init' | 'cache_next' | 'reverse_pointer' | 'advance_pre' | 'advance_cur' | 'done';
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

export function buildReverseSteps(values: number[]): RLStep[] {
  const steps: RLStep[] = [];
  const n = values.length;

  if (n === 0) {
    steps.push({
      values: [],
      nextDir: [],
      preIndex: -1,
      curIndex: -1,
      cachedNext: -1,
      reversedCount: 0,
      action: 'done',
      message: '链表为空，直接返回 null',
      codeLine: 1,
    });
    return steps;
  }

  // 初始：0 -> 1 -> 2 -> ... -> -1
  const nextDir = values.map((_, i) => (i + 1 < n ? i + 1 : -1));
  let pre = -1;
  let cur = 0;
  let reversed = 0;

  // Step 0: init
  steps.push({
    values: [...values],
    nextDir: [...nextDir],
    preIndex: pre,
    curIndex: cur,
    cachedNext: -1,
    reversedCount: reversed,
    action: 'init',
    message: `初始化：pre = null, cur = head (节点 ${values[0]})，准备双指针迭代反转`,
    codeLine: 2,
  });

  while (cur !== -1) {
    const next = nextDir[cur];

    // 1. 暂存 next
    steps.push({
      values: [...values],
      nextDir: [...nextDir],
      preIndex: pre,
      curIndex: cur,
      cachedNext: next,
      reversedCount: reversed,
      action: 'cache_next',
      message: `① 暂存后继：next = cur.next (节点 ${next === -1 ? 'null' : values[next]})，防止反转后链表断裂`,
      codeLine: 5,
    });

    // 2. 反转 cur.next = pre
    nextDir[cur] = pre;
    reversed++;
    steps.push({
      values: [...values],
      nextDir: [...nextDir],
      preIndex: pre,
      curIndex: cur,
      cachedNext: next,
      reversedCount: reversed,
      action: 'reverse_pointer',
      message: `② 反转指向：cur.next = pre，将节点 ${values[cur]} 的指针逆转指向 ${pre === -1 ? 'null' : `节点 ${values[pre]}`}`,
      codeLine: 6,
    });

    // 3. pre = cur
    pre = cur;
    steps.push({
      values: [...values],
      nextDir: [...nextDir],
      preIndex: pre,
      curIndex: cur,
      cachedNext: next,
      reversedCount: reversed,
      action: 'advance_pre',
      message: `③ 前驱跟进：pre = cur，pre 指针移动到节点 ${values[pre]}`,
      codeLine: 7,
    });

    // 4. cur = next
    cur = next;
    steps.push({
      values: [...values],
      nextDir: [...nextDir],
      preIndex: pre,
      curIndex: cur,
      cachedNext: next,
      reversedCount: reversed,
      action: 'advance_cur',
      message: `④ 当前前进：cur = next，cur 指针移动到 ${cur === -1 ? 'null' : `节点 ${values[cur]}`}`,
      codeLine: 8,
    });
  }

  // done
  steps.push({
    values: [...values],
    nextDir: [...nextDir],
    preIndex: pre,
    curIndex: -1,
    cachedNext: -1,
    reversedCount: reversed,
    action: 'done',
    message: `🎉 反转完成！cur == null 循环结束，新链表头节点为 pre (节点 ${values[pre]})，返回 pre`,
    codeLine: 10,
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class ReverseLinkedListVisualizer extends StepVisualizer<RLStep> {
  protected codeLanguages = REVERSE_LINKED_LIST_CODE_LANGUAGES;
  protected codeLines = REVERSE_LINKED_LIST_CODE_LANGUAGES['java'];
  protected codePanelTitle = '反转链表 代码调试';

  private sandboxContainer: HTMLElement | null = null;
  private pointersContainer: HTMLElement | null = null;
  private decisionMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#rll-sandbox-container');
    this.pointersContainer = this.root.querySelector('#rll-pointers-container');
    this.decisionMonitorContainer = this.root.querySelector('#rll-decision-monitor-container');
    this.metricsContainer = this.root.querySelector('#rll-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.rll-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const input = this.root?.querySelector('#input-list') as HTMLInputElement | null;
        if (input && btn.dataset.val) {
          input.value = btn.dataset.val;
          this.start();
        }
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: REVERSE_LINKED_LIST_PROBLEM_HTML,
      analysisHtml: REVERSE_LINKED_LIST_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): RLStep[] {
    const input = this.root?.querySelector('#input-list') as HTMLInputElement | null;
    const values = parseValues(input?.value || '1,2,3,4,5');
    return buildReverseSteps(values);
  }

  protected renderStep(step: RLStep): void {
    const values = step.values;
    const nextDir = step.nextDir;
    const pre = step.preIndex;
    const cur = step.curIndex;
    const cachedNext = step.cachedNext;

    // 1. 渲染链表拓扑沙盘 (Card 1)
    if (this.sandboxContainer) {
      // 构造节点与连接线 HTML
      const nodesHtml = values
        .map((val, idx) => {
          const isCur = cur === idx;
          const isPre = pre === idx;
          const isNext = cachedNext === idx;
          const targetNext = nextDir[idx];
          const isReversed = targetNext === -1 ? pre === idx : targetNext < idx;

          // 指针徽标
          const pointerBadges: string[] = [];
          if (isPre) pointerBadges.push('<span style="background: #fbbf24; color: #78350f; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">pre</span>');
          if (isCur) pointerBadges.push('<span style="background: #2563eb; color: #ffffff; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">cur</span>');
          if (isNext) pointerBadges.push('<span style="background: #9333ea; color: #ffffff; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">next</span>');

          return `
            <div style="display: flex; align-items: center; gap: 6px;">
              <!-- 节点盒 -->
              <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
                <!-- 指针标识栏 -->
                <div style="min-height: 14px; display: flex; gap: 2px;">
                  ${pointerBadges.join('')}
                </div>

                <!-- 节点主体 -->
                <div style="min-width: 44px; height: 44px; padding: 0 10px; border-radius: 10px; background: ${isCur ? '#eff6ff' : isPre ? '#fffbeb' : '#ffffff'}; border: 2px solid ${isCur ? '#2563eb' : isPre ? '#f59e0b' : '#e2e8f0'}; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.04); position: relative;">
                  <span style="font-size: 13.5px; font-weight: 800; color: ${isCur ? '#1d4ed8' : isPre ? '#b45309' : '#0f172a'}; font-family: 'JetBrains Mono', monospace;">
                    ${val}
                  </span>
                  <span style="font-size: 8.5px; color: #94a3b8; font-family: monospace;">idx:${idx}</span>
                </div>

                <!-- 指针目标 -->
                <div style="font-size: 9px; color: ${isReversed ? '#10b981' : '#64748b'}; font-weight: 700; font-family: monospace;">
                  &rarr; ${targetNext === -1 ? 'null' : values[targetNext]}
                </div>
              </div>

              <!-- 连接箭头 -->
              ${
                idx < values.length - 1
                  ? `<div style="font-size: 14px; font-weight: 800; color: ${nextDir[idx] === idx - 1 ? '#10b981' : '#cbd5e1'}; display: flex; align-items: center;">
                      ${nextDir[idx] === idx - 1 ? '◀' : '▶'}
                    </div>`
                  : ''
              }
            </div>
          `;
        })
        .join('');

      this.sandboxContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <!-- 链表主视图 -->
          <div style="display: flex; align-items: center; gap: 6px; overflow-x: auto; padding: 6px 2px; min-height: 80px;">
            <!-- null 虚拟起点 -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
              <div style="min-height: 14px;">
                ${pre === -1 ? '<span style="background: #fbbf24; color: #78350f; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">pre</span>' : ''}
              </div>
              <div style="min-width: 40px; height: 44px; border-radius: 10px; background: #f1f5f9; border: 1.5px dashed #cbd5e1; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #94a3b8; font-family: monospace;">
                null
              </div>
              <div style="font-size: 9px; color: #94a3b8;">前驱起点</div>
            </div>

            <div style="font-size: 14px; color: #cbd5e1;">|</div>

            ${nodesHtml}

            <div style="font-size: 14px; color: #cbd5e1;">|</div>

            <!-- null 尾端 -->
            <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
              <div style="min-height: 14px;">
                ${cur === -1 ? '<span style="background: #2563eb; color: #ffffff; padding: 1px 4px; border-radius: 4px; font-size: 9px; font-weight: 800;">cur</span>' : ''}
              </div>
              <div style="min-width: 40px; height: 44px; border-radius: 10px; background: #f1f5f9; border: 1.5px dashed #cbd5e1; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: #94a3b8; font-family: monospace;">
                null
              </div>
              <div style="font-size: 9px; color: #94a3b8;">尾端终点</div>
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
            <span>pre 指针 (前驱):</span>
            <span style="font-family: monospace; font-weight:800; color: #d97706;">
              ${pre === -1 ? 'null' : `[${pre}] 值 ${values[pre]}`}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>cur 指针 (当前):</span>
            <span style="font-family: monospace; font-weight:800; color: #2563eb;">
              ${cur === -1 ? 'null (结束)' : `[${cur}] 值 ${values[cur]}`}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>next 暂存 (后继):</span>
            <span style="font-family: monospace; font-weight:800; color: #9333ea;">
              ${cachedNext === -1 ? 'null / 无' : `[${cachedNext}] 值 ${values[cachedNext]}`}
            </span>
          </div>
        </div>
      `;
    }

    // 3. 渲染反转迭代决策监视器 (Card 2 Center)
    if (this.decisionMonitorContainer) {
      let actionBadge = '';
      if (step.action === 'cache_next') actionBadge = '<span style="background:#f3e8ff; color:#9333ea; padding:2px 6px; border-radius:4px; font-weight:700;">① 暂存 next = cur.next</span>';
      else if (step.action === 'reverse_pointer') actionBadge = '<span style="background:#ecfdf5; color:#059669; padding:2px 6px; border-radius:4px; font-weight:700;">② 反转 cur.next = pre</span>';
      else if (step.action === 'advance_pre') actionBadge = '<span style="background:#fffbeb; color:#d97706; padding:2px 6px; border-radius:4px; font-weight:700;">③ 跟进 pre = cur</span>';
      else if (step.action === 'advance_cur') actionBadge = '<span style="background:#eff6ff; color:#2563eb; padding:2px 6px; border-radius:4px; font-weight:700;">④ 前进 cur = next</span>';
      else actionBadge = '<span style="background:#ecfdf5; color:#059669; padding:2px 6px; border-radius:4px; font-weight:700;">🎉 反转完成</span>';

      this.decisionMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>当前操作阶段:</span>
            ${actionBadge}
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 双指针原则: <strong>先存后继防断链，再改指向，双指针依次平移</strong></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染新链表头节点 (Card 2 Bottom)
    if (this.metricsContainer) {
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>反转后新头节点 (pre): <strong style="color: #059669; font-family: monospace; font-size: 13.5px;">${pre >= 0 ? `节点 ${values[pre]}` : '尚未就绪'}</strong></span>
            <span style="font-family: monospace; font-weight: 700; color: #2563eb;">已反转 ${step.reversedCount} / ${values.length} 节点</span>
          </div>
        </div>
      `;
    }

    const badgeReversed = this.root?.querySelector('#badge-reversed-count');
    if (badgeReversed) {
      badgeReversed.textContent = `已反转: ${step.reversedCount} / ${values.length}`;
    }

    // 5. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let badgeColor = '#64748b';
        let badgeBg = '#f1f5f9';
        let badgeText = '扫描';

        if (st.action === 'cache_next') {
          badgeColor = '#9333ea';
          badgeBg = '#f3e8ff';
          badgeText = '暂存';
        } else if (st.action === 'reverse_pointer') {
          badgeColor = '#059669';
          badgeBg = '#ecfdf5';
          badgeText = '反转';
        } else if (st.action === 'advance_pre' || st.action === 'advance_cur') {
          badgeColor = '#2563eb';
          badgeBg = '#eff6ff';
          badgeText = '平移';
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
  id: 'reverse-linked-list',
  name: '反转链表',
  viewId: 'algo-reverse-linked-list-view',
  category: 'linked-list',
  description: 'LeetCode 206 · 双指针迭代原地修改指针指向，暂存 next 节点防止链表断裂',
  icon: '🔗',
  template,
  Visualizer: ReverseLinkedListVisualizer,
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '透彻掌握单链表双指针迭代与原地指针反转技巧，理解暂存 next 防止断链的本质',
});
