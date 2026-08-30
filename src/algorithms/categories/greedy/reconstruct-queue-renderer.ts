/**
 * 根据身高重建队列可视化器（贪心算法）— 4-Card 标准现代架构
 * LeetCode 406：[身高降序, k 升序] 排序，高个子先入队，矮个子直接按 k 插入对应槽位
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  RECONSTRUCT_QUEUE_PROBLEM_HTML,
  RECONSTRUCT_QUEUE_ANALYSIS_HTML,
  RECONSTRUCT_QUEUE_CODE_LANGUAGES,
} from './reconstruct-queue-problem-content';
import template from './reconstruct-queue.html?raw';

export interface RQStep {
  sorted: Array<[number, number]>;
  currentIndex: number;
  currentPerson: [number, number] | null;
  queue: Array<[number, number]>;
  insertIndex: number;
  action: 'init' | 'sort' | 'insert' | 'done';
  message: string;
  codeLine: number;
}

export function buildReconstructQueueSteps(rawPeople: Array<[number, number]>): RQStep[] {
  const steps: RQStep[] = [];
  const n = rawPeople.length;

  if (n === 0) {
    steps.push({
      sorted: [],
      currentIndex: -1,
      currentPerson: null,
      queue: [],
      insertIndex: -1,
      action: 'done',
      message: '输入为空，返回空数组',
      codeLine: 1,
    });
    return steps;
  }

  // 1. 身高降序，k 升序
  const sorted = rawPeople.map(([h, k]) => [h, k] as [number, number]).sort((a, b) => {
    if (a[0] === b[0]) return a[1] - b[1];
    return b[0] - a[0];
  });

  const queue: Array<[number, number]> = [];

  steps.push({
    sorted: sorted.map(([h, k]) => [h, k]),
    currentIndex: -1,
    currentPerson: null,
    queue: [],
    insertIndex: -1,
    action: 'sort',
    message: `第 1 步：按 [身高降序, k 升序] 排序完成：${sorted.map((p) => `[${p[0]},${p[1]}]`).join(', ')}`,
    codeLine: 4,
  });

  for (let i = 0; i < n; i++) {
    const p = sorted[i];
    const targetK = p[1];

    queue.splice(targetK, 0, [p[0], p[1]]);

    steps.push({
      sorted: sorted.map(([h, k]) => [h, k]),
      currentIndex: i,
      currentPerson: [p[0], p[1]],
      queue: queue.map(([h, k]) => [h, k]),
      insertIndex: targetK,
      action: 'insert',
      message: `📥 处理人员 [${p[0]}, ${p[1]}] (身高 ${p[0]}, 前方需 ${p[1]} 个更高者) &rarr; 贪心插入到队列 index = ${targetK} 处！`,
      codeLine: 8,
    });
  }

  steps.push({
    sorted: sorted.map(([h, k]) => [h, k]),
    currentIndex: n - 1,
    currentPerson: null,
    queue: queue.map(([h, k]) => [h, k]),
    insertIndex: -1,
    action: 'done',
    message: `🎉 队列重建完成！最终满足所有人身前身高要求：${queue.map((p) => `[${p[0]},${p[1]}]`).join(', ')}`,
    codeLine: 10,
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class ReconstructQueueVisualizer extends StepVisualizer<RQStep> {
  protected codeLanguages = RECONSTRUCT_QUEUE_CODE_LANGUAGES;
  protected codeLines = RECONSTRUCT_QUEUE_CODE_LANGUAGES['java'];
  protected codePanelTitle = '根据身高重建队列 代码调试';

  private sandboxContainer: HTMLElement | null = null;
  private personContainer: HTMLElement | null = null;
  private decisionMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#rq-sandbox-container');
    this.personContainer = this.root.querySelector('#rq-person-container');
    this.decisionMonitorContainer = this.root.querySelector('#rq-decision-monitor-container');
    this.metricsContainer = this.root.querySelector('#rq-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.rq-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const pEl = this.root?.querySelector('#input-people') as HTMLInputElement | null;
        if (pEl && btn.dataset.people) pEl.value = btn.dataset.people;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: RECONSTRUCT_QUEUE_PROBLEM_HTML,
      analysisHtml: RECONSTRUCT_QUEUE_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): RQStep[] {
    const pEl = this.root?.querySelector('#input-people') as HTMLInputElement | null;
    let people: Array<[number, number]> = [];
    try {
      const parsed = JSON.parse(pEl?.value || '[[7,0],[4,4],[7,1],[5,0],[6,1],[5,2]]');
      if (Array.isArray(parsed) && parsed.every((p) => Array.isArray(p) && p.length >= 2)) {
        people = parsed.map((p) => [Number(p[0]), Number(p[1])]);
      }
    } catch {
      people = [
        [7, 0],
        [4, 4],
        [7, 1],
        [5, 0],
        [6, 1],
        [5, 2],
      ];
    }

    return buildReconstructQueueSteps(people);
  }

  protected renderStep(step: RQStep): void {
    const sorted = step.sorted;
    const queue = step.queue;
    const n = sorted.length;

    // 1. 渲染排序流与重建队列沙盘 (Card 1)
    if (this.sandboxContainer && n > 0) {
      const curIdx = step.currentIndex;
      const isDone = step.action === 'done';

      // 上方：待处理源序列 (按身高降序)
      const sortedHtml = sorted
        .map(([h, k], idx) => {
          const isCurrent = idx === curIdx && !isDone;
          const isProcessed = idx < curIdx || isDone;

          let bg = '#ffffff';
          let borderColor = '#e2e8f0';
          let textColor = '#0f172a';

          if (isCurrent) {
            bg = '#f0fdf4';
            borderColor = '#16a34a';
            textColor = '#16a34a';
          } else if (isProcessed) {
            bg = '#f8fafc';
            borderColor = '#cbd5e1';
            textColor = '#94a3b8';
          }

          return `
            <div style="width: 44px; height: 42px; border-radius: 8px; background: ${bg}; border: 1.5px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
              <span>${h}</span>
              <span style="font-size: 8.5px; color: #64748b;">k=${k}</span>
            </div>
          `;
        })
        .join('');

      // 下方：动态插入形成的重建队列
      const queueHtml = queue
        .map(([h, k], idx) => {
          const isJustInserted = idx === step.insertIndex;

          let bg = '#ffffff';
          let borderColor = '#a7f3d0';
          let textColor = '#065f46';

          if (isJustInserted) {
            bg = '#ecfdf5';
            borderColor = '#10b981';
            textColor = '#047857';
          }

          return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
              <span style="font-size: 8.5px; color: ${isJustInserted ? '#10b981' : '#94a3b8'}; font-weight: 700;">
                [${idx}]
              </span>
              <div style="width: 46px; height: 46px; border-radius: 10px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 12px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 4px rgba(0,0,0,0.04);">
                <span>h=${h}</span>
                <span style="font-size: 9px; color: #059669; font-weight: 700;">k=${k}</span>
              </div>
            </div>
          `;
        })
        .join('');

      this.sandboxContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <!-- 待排序列标题 -->
          <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #475569;">
            <span>1️⃣ 待插入序列 (按身高降序, k 升序):</span>
            <span style="color: #16a34a;">已处理: ${Math.min(n, Math.max(0, curIdx + 1))} / ${n}</span>
          </div>
          <div style="display: flex; gap: 6px; overflow-x: auto; padding: 2px 0;">
            ${sortedHtml}
          </div>

          <!-- 重建队列槽位 -->
          <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #059669; margin-top: 4px; border-top: 1px dashed #e2e8f0; padding-top: 6px;">
            <span>2️⃣ 重建后的队列 (按照 k 值精准插入对应槽位):</span>
            <span>当前队长: ${queue.length}</span>
          </div>
          <div style="display: flex; gap: 6px; overflow-x: auto; padding: 2px 0; min-height: 52px; align-items: center;">
            ${queue.length > 0 ? queueHtml : '<span style="font-size: 11px; color: #94a3b8; padding-left: 4px;">队列初始为空...</span>'}
          </div>
        </div>
      `;
    }

    // 2. 渲染当前待插人员 (Card 2 Left)
    if (this.personContainer) {
      const p = step.currentPerson;

      this.personContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>当前待插人员:</span>
            <span style="font-family: monospace; font-weight:800; color: #16a34a; font-size: 12.5px;">
              ${p ? `[身高: ${p[0]}, k: ${p[1]}]` : '-'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>目标插入槽位 index:</span>
            <span style="font-family: monospace; font-weight:700; color: #2563eb;">
              ${step.insertIndex >= 0 ? `第 [${step.insertIndex}] 位` : '-'}
            </span>
          </div>
        </div>
      `;
    }

    // 3. 渲染贪心插入槽位监视器 (Card 2 Center)
    if (this.decisionMonitorContainer) {
      const isInsert = step.action === 'insert';

      this.decisionMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>插入决策:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isInsert ? '#ecfdf5' : '#eff6ff'}; color: ${isInsert ? '#059669' : '#2563eb'}; border: 1px solid ${isInsert ? '#a7f3d0' : '#bfdbfe'};">
              ${isInsert ? `📥 插入 queue[${step.insertIndex}]` : '🔍 准备排序就绪'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 准则: <code style="color:#16a34a; font-family:monospace;">高个子先入队确定骨架，矮个子插入不破坏高个子k值</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染最终重建队列快照看板 (Card 2 Bottom)
    if (this.metricsContainer) {
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>已入队人数: <strong style="color: #16a34a; font-family: monospace; font-size: 13.5px;">${queue.length}</strong> / ${n}</span>
            <span style="font-family: monospace; font-weight: 700; color: #059669;">${queue.map((p) => `[${p[0]},${p[1]}]`).join(', ')}</span>
          </div>
        </div>
      `;
    }

    const badgeQueue = this.root?.querySelector('#badge-queue-size');
    if (badgeQueue) {
      badgeQueue.textContent = `队列人数: ${queue.length}`;
    }


    // 7. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let badgeColor = '#64748b';
        let badgeBg = '#f1f5f9';
        let badgeText = '步骤';

        if (st.action === 'insert') {
          badgeColor = '#16a34a';
          badgeBg = '#f0fdf4';
          badgeText = `插[${st.insertIndex}]`;
        } else if (st.action === 'done') {
          badgeColor = '#059669';
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
  id: 'reconstruct-queue',
  name: '根据身高重建队列',
  viewId: 'algo-reconstruct-queue-view',
  category: 'greedy',
  description: '身高降序且 k 升序排序，高个子先入队确定相对骨架，矮个子直接按 k 插入槽位',
  icon: '👥',
  template,
  Visualizer: ReconstructQueueVisualizer,
  difficulty: 2,
  levelOrder: 15,
  learningGoal: '掌握双维度贪心问题的排序拆解技巧，理解高维度先入队、低维度插空的经典解法',
});
