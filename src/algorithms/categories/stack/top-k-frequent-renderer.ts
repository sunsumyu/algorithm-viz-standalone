/**
 * 前 K 个高频元素可视化器 — 4-Card 标准现代架构
 * LeetCode 347：哈希统计频次 + 维护大小为 k 的小顶堆 (Min-Heap)，堆顶淘汰低频元素
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  TOP_K_FREQUENT_PROBLEM_HTML,
  TOP_K_FREQUENT_ANALYSIS_HTML,
  TOP_K_FREQUENT_CODE_LANGUAGES,
} from './top-k-frequent-problem-content';
import template from './top-k-frequent.html?raw';

export interface HeapItem {
  num: number;
  freq: number;
}

export interface TKFStep {
  nums: number[];
  k: number;
  freqMap: Map<number, number>;
  heap: HeapItem[]; // 小顶堆存储（按 freq 升序）
  currentEntry: { num: number; freq: number } | null;
  poppedRoot: HeapItem | null;
  result: number[];
  action: 'init' | 'count_freq' | 'heap_push' | 'heap_poll_min' | 'collect_result' | 'done';
  message: string;
  codeLine: number;
}

export function buildTopKFrequentSteps(rawNums: number[], k: number): TKFStep[] {
  const steps: TKFStep[] = [];
  const nums = [...rawNums];
  const n = nums.length;

  if (n === 0 || k <= 0) {
    steps.push({
      nums: [],
      k,
      freqMap: new Map(),
      heap: [],
      currentEntry: null,
      poppedRoot: null,
      result: [],
      action: 'done',
      message: '输入无效或 k <= 0',
      codeLine: 1,
    });
    return steps;
  }

  // 1. 统计频率
  const freqMap = new Map<number, number>();
  for (const num of nums) {
    freqMap.set(num, (freqMap.get(num) || 0) + 1);
  }

  steps.push({
    nums: [...nums],
    k,
    freqMap: new Map(freqMap),
    heap: [],
    currentEntry: null,
    poppedRoot: null,
    result: [],
    action: 'init',
    message: `初始化：共 ${n} 个元素，统计得到 ${freqMap.size} 个不同元素的出现频次，准备建立容量为 k=${k} 的小顶堆`,
    codeLine: 2,
  });

  // 2. 遍历频率字典，维护大小为 k 的小顶堆
  const heap: HeapItem[] = [];

  const heapPush = (item: HeapItem) => {
    heap.push(item);
    heap.sort((a, b) => a.freq - b.freq); // 小顶堆按频率升序
  };

  const heapPoll = (): HeapItem => {
    const min = heap.shift()!;
    return min;
  };

  for (const [num, freq] of freqMap.entries()) {
    heapPush({ num, freq });

    steps.push({
      nums: [...nums],
      k,
      freqMap: new Map(freqMap),
      heap: [...heap],
      currentEntry: { num, freq },
      poppedRoot: null,
      result: [],
      action: 'heap_push',
      message: `📥 将元素 ${num} (频次 ${freq}) 压入小顶堆，当前堆大小: ${heap.length}`,
      codeLine: 6,
    });

    if (heap.length > k) {
      const popped = heapPoll();

      steps.push({
        nums: [...nums],
        k,
        freqMap: new Map(freqMap),
        heap: [...heap],
        currentEntry: { num, freq },
        poppedRoot: popped,
        result: [],
        action: 'heap_poll_min',
        message: `💥 堆大小超过 k=${k}！弹出堆顶最小频次元素 ${popped.num} (频次 ${popped.freq}) 淘汰`,
        codeLine: 8,
      });
    }
  }

  // 3. 收集结果
  const result: number[] = [...heap].reverse().map((h) => h.num);

  steps.push({
    nums: [...nums],
    k,
    freqMap: new Map(freqMap),
    heap: [...heap],
    currentEntry: null,
    poppedRoot: null,
    result: [...result],
    action: 'collect_result',
    message: `🥇 遍历结束！留在小顶堆中的 ${k} 个元素即为最高频 Top-${k} 元素，逆序提取结果: [${result.join(', ')}]`,
    codeLine: 12,
  });

  steps.push({
    nums: [...nums],
    k,
    freqMap: new Map(freqMap),
    heap: [...heap],
    currentEntry: null,
    poppedRoot: null,
    result: [...result],
    action: 'done',
    message: `🎉 前 K 个高频元素计算完成！最终 Top-${k} 结果为：[${result.join(', ')}]`,
    codeLine: 15,
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class TopKFrequentVisualizer extends StepVisualizer<TKFStep> {
  protected codeLanguages = TOP_K_FREQUENT_CODE_LANGUAGES;
  protected codeLines = TOP_K_FREQUENT_CODE_LANGUAGES['java'];
  protected codePanelTitle = '前 K 个高频元素 代码调试';

  private sandboxContainer: HTMLElement | null = null;
  private heapStatusContainer: HTMLElement | null = null;
  private decisionMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#tkf-sandbox-container');
    this.heapStatusContainer = this.root.querySelector('#tkf-heap-status-container');
    this.decisionMonitorContainer = this.root.querySelector('#tkf-decision-monitor-container');
    this.metricsContainer = this.root.querySelector('#tkf-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.tkf-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const nEl = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
        const kEl = this.root?.querySelector('#input-k') as HTMLInputElement | null;
        if (nEl && btn.dataset.nums) nEl.value = btn.dataset.nums;
        if (kEl && btn.dataset.k) kEl.value = btn.dataset.k;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: TOP_K_FREQUENT_PROBLEM_HTML,
      analysisHtml: TOP_K_FREQUENT_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): TKFStep[] {
    const nEl = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
    const kEl = this.root?.querySelector('#input-k') as HTMLInputElement | null;

    const rawNums = (nEl?.value || '1,1,1,2,2,3')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    const k = parseInt(kEl?.value || '2', 10);

    return buildTopKFrequentSteps(rawNums.length ? rawNums : [1, 1, 1, 2, 2, 3], isNaN(k) ? 2 : k);
  }

  protected renderStep(step: TKFStep): void {
    const freqMap = step.freqMap;
    const heap = step.heap;
    const result = step.result;

    // 1. 渲染频率统计与小顶堆沙盘 (Card 1)
    if (this.sandboxContainer) {
      // 频率字典列表
      const freqHtml = Array.from(freqMap.entries())
        .map(([num, freq]) => {
          const isCurrent = step.currentEntry?.num === num;
          return `
            <div style="padding: 3px 8px; border-radius: 6px; background: ${isCurrent ? '#fffbeb' : '#f8fafc'}; border: 1.5px solid ${isCurrent ? '#f59e0b' : '#e2e8f0'}; color: ${isCurrent ? '#b45309' : '#334155'}; font-size: 11px; font-weight: 700; font-family: monospace; display: flex; align-items: center; gap: 4px;">
              <span>值: <strong>${num}</strong></span>
              <span style="color: #d97706;">(${freq}次)</span>
            </div>
          `;
        })
        .join('');

      // 小顶堆 (堆顶最小在左)
      const heapHtml = heap
        .map((item, idx) => {
          const isRoot = idx === 0;
          return `
            <div style="padding: 3px 10px; border-radius: 6px; background: ${isRoot ? '#fef2f2' : '#ecfdf5'}; border: 1.5px solid ${isRoot ? '#f87171' : '#a7f3d0'}; color: ${isRoot ? '#ef4444' : '#047857'}; font-size: 11.5px; font-weight: 800; font-family: 'JetBrains Mono', monospace;">
              <span>${item.num}</span>
              <span style="font-size: 10px; color: ${isRoot ? '#b91c1c' : '#059669'};">(频:${item.freq})${isRoot ? ' [堆顶最小]' : ''}</span>
            </div>
          `;
        })
        .join('');

      this.sandboxContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <!-- 频率哈希表 -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #d97706;">
              <span>📊 哈希频次统计表 (Map):</span>
              <span>项数: ${freqMap.size}</span>
            </div>
            <div style="display: flex; gap: 5px; overflow-x: auto; min-height: 26px; align-items: center;">
              ${freqHtml}
            </div>
          </div>

          <!-- 小顶堆展示 -->
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 10px; display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; justify-content: space-between; font-size: 10.5px; font-weight: 700; color: #059669;">
              <span>🥞 容量为 k=${step.k} 的小顶堆 (堆顶频次最小 &rarr; 堆底):</span>
              <span>容量: ${heap.length} / ${step.k}</span>
            </div>
            <div style="display: flex; gap: 5px; overflow-x: auto; min-height: 26px; align-items: center;">
              ${heap.length > 0 ? heapHtml : '<span style="font-size: 10px; color: #94a3b8;">小顶堆为空</span>'}
            </div>
          </div>
        </div>
      `;
    }

    // 2. 渲染小顶堆状态 (Card 2 Left)
    if (this.heapStatusContainer) {
      const topItem = heap.length > 0 ? heap[0] : null;

      this.heapStatusContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>当前考察项:</span>
            <span style="font-family: monospace; font-weight:800; color: #d97706; font-size: 13px;">
              ${step.currentEntry ? `值 ${step.currentEntry.num} (频次 ${step.currentEntry.freq})` : '（结束）'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>堆顶元素 (最小频次):</span>
            <span style="font-family: monospace; font-weight:700; color: #ef4444;">
              ${topItem ? `值 ${topItem.num} (频次 ${topItem.freq})` : '无'}
            </span>
          </div>
        </div>
      `;
    }

    // 3. 渲染小顶堆决策监视器 (Card 2 Center)
    if (this.decisionMonitorContainer) {
      const isPoll = step.action === 'heap_poll_min';
      const isPush = step.action === 'heap_push';

      this.decisionMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>堆维护状态:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isPoll ? '#fef2f2' : isPush ? '#eff6ff' : '#ecfdf5'}; color: ${isPoll ? '#ef4444' : isPush ? '#2563eb' : '#059669'}; border: 1px solid ${isPoll ? '#fecaca' : isPush ? '#bfdbfe' : '#a7f3d0'};">
              ${isPoll ? `💥 淘汰最小堆顶 ${step.poppedRoot?.num}` : isPush ? '📥 元素入堆调整' : '🥇 Top-K 已就绪'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 准则: <code style="color:#d97706; font-family:monospace;">小顶堆大小超过 k 时，弹出堆顶最小频次元素</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染最终 Top-K 结果看板 (Card 2 Bottom)
    if (this.metricsContainer) {
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>Top-${step.k} 高频结果: <strong style="color: #d97706; font-family: monospace; font-size: 13px;">[${result.join(', ')}]</strong></span>
            <span style="font-family: monospace; font-weight: 700; color: #059669;">当前堆内 ${heap.length} / ${step.k} 项</span>
          </div>
        </div>
      `;
    }

    const badgeSize = this.root?.querySelector('#badge-heap-size');
    if (badgeSize) {
      badgeSize.textContent = `堆容量: ${heap.length} / ${step.k}`;
    }

    // 5. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let badgeColor = '#64748b';
        let badgeBg = '#f1f5f9';
        let badgeText = '扫描';

        if (st.action === 'heap_push') {
          badgeColor = '#2563eb';
          badgeBg = '#eff6ff';
          badgeText = '入堆';
        } else if (st.action === 'heap_poll_min') {
          badgeColor = '#ef4444';
          badgeBg = '#fef2f2';
          badgeText = '淘汰';
        } else if (st.action === 'collect_result' || st.action === 'done') {
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
  id: 'top-k-frequent',
  name: '前 K 个高频元素',
  viewId: 'algo-top-k-frequent-view',
  category: 'stack',
  description: '哈希统计频率 + 维护大小为 k 的小顶堆 (Min-Heap)，淘汰最小频率堆顶，保留最高频前 K 项',
  icon: '📊',
  template,
  Visualizer: TopKFrequentVisualizer,
  difficulty: 2,
  levelOrder: 7,
  learningGoal: '掌握优先级队列与小顶堆在 Top-K 极值问题中的高效运用，理解为什么求前 K 大元素需要维护小顶堆',
});
