/**
 * 划分字母区间可视化器（贪心算法）— 4-Card 标准现代架构
 * LeetCode 763：记录每个字符最后出现下标，遍历维护最远边界，达到边界即贪心切割
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  PARTITION_LABELS_PROBLEM_HTML,
  PARTITION_LABELS_ANALYSIS_HTML,
  PARTITION_LABELS_CODE_LANGUAGES,
} from './partition-labels-problem-content';
import template from './partition-labels.html?raw';

export interface PartitionStep {
  str: string;
  currentIndex: number;
  currentChar: string;
  lastOccurrence: Record<string, number>;
  currentEnd: number;
  partitionStart: number;
  partitions: number[];
  cutIndices: number[];
  action: 'init' | 'scan' | 'cut' | 'done';
  message: string;
  codeLine: number;
}

export function buildPartitionLabelsSteps(s: string): PartitionStep[] {
  const steps: PartitionStep[] = [];
  const n = s.length;

  if (n === 0) {
    steps.push({
      str: '',
      currentIndex: -1,
      currentChar: '',
      lastOccurrence: {},
      currentEnd: 0,
      partitionStart: 0,
      partitions: [],
      cutIndices: [],
      action: 'done',
      message: '字符串为空，划分片段数为 0',
      codeLine: 2,
    });
    return steps;
  }

  // 1. 统计每个字符最后出现的位置
  const lastOccurrence: Record<string, number> = {};
  for (let i = 0; i < n; i++) {
    lastOccurrence[s[i]] = i;
  }

  steps.push({
    str: s,
    currentIndex: -1,
    currentChar: '',
    lastOccurrence: { ...lastOccurrence },
    currentEnd: 0,
    partitionStart: 0,
    partitions: [],
    cutIndices: [],
    action: 'init',
    message: `第 1 步：统计所有 ${Object.keys(lastOccurrence).length} 种不同字符的最后出现下标`,
    codeLine: 7,
  });

  let start = 0;
  let end = 0;
  const partitions: number[] = [];
  const cutIndices: number[] = [];

  for (let i = 0; i < n; i++) {
    const char = s[i];
    const lastPos = lastOccurrence[char];
    const oldEnd = end;
    end = Math.max(end, lastPos);

    steps.push({
      str: s,
      currentIndex: i,
      currentChar: char,
      lastOccurrence: { ...lastOccurrence },
      currentEnd: end,
      partitionStart: start,
      partitions: [...partitions],
      cutIndices: [...cutIndices],
      action: 'scan',
      message: `🔍 扫描 s[${i}]='${char}' (最后出现在 [${lastPos}])，当前片段边界更新为 max(${oldEnd}, ${lastPos}) = ${end}`,
      codeLine: 12,
    });

    if (i === end) {
      const len = end - start + 1;
      partitions.push(len);
      cutIndices.push(i);

      steps.push({
        str: s,
        currentIndex: i,
        currentChar: char,
        lastOccurrence: { ...lastOccurrence },
        currentEnd: end,
        partitionStart: start,
        partitions: [...partitions],
        cutIndices: [...cutIndices],
        action: 'cut',
        message: `✂️ 触碰最远边界 [${i}]！片段 "${s.substring(start, end + 1)}" 内字符后续不再出现，切分出长度为 ${len} 的片段！`,
        codeLine: 14,
      });

      start = i + 1;
    }
  }

  steps.push({
    str: s,
    currentIndex: n - 1,
    currentChar: '',
    lastOccurrence: { ...lastOccurrence },
    currentEnd: n - 1,
    partitionStart: start,
    partitions: [...partitions],
    cutIndices: [...cutIndices],
    action: 'done',
    message: `🎉 字符串划分完成！共划分为 ${partitions.length} 个片段：[${partitions.join(', ')}]`,
    codeLine: 18,
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class PartitionLabelsVisualizer extends StepVisualizer<PartitionStep> {
  protected codeLanguages = PARTITION_LABELS_CODE_LANGUAGES;
  protected codeLines = PARTITION_LABELS_CODE_LANGUAGES['java'];
  protected codePanelTitle = '划分字母区间 代码调试';

  private sandboxContainer: HTMLElement | null = null;
  private lastPosContainer: HTMLElement | null = null;
  private decisionMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#pl-sandbox-container');
    this.lastPosContainer = this.root.querySelector('#pl-last-pos-container');
    this.decisionMonitorContainer = this.root.querySelector('#pl-decision-monitor-container');
    this.metricsContainer = this.root.querySelector('#pl-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.pl-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const sEl = this.root?.querySelector('#input-s') as HTMLInputElement | null;
        if (sEl && btn.dataset.str) sEl.value = btn.dataset.str;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: PARTITION_LABELS_PROBLEM_HTML,
      analysisHtml: PARTITION_LABELS_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): PartitionStep[] {
    const sEl = this.root?.querySelector('#input-s') as HTMLInputElement | null;
    const s = sEl?.value?.trim() || 'ababcbacadefegdehijhklij';
    return buildPartitionLabelsSteps(s);
  }

  protected renderStep(step: PartitionStep): void {
    const s = step.str;
    const n = s.length;

    // 1. 渲染字符切片沙盘 (Card 1)
    if (this.sandboxContainer && n > 0) {
      const curIdx = step.currentIndex;
      const isDone = step.action === 'done';

      const cellsHtml = s
        .split('')
        .map((char, idx) => {
          const isCurrent = idx === curIdx && !isDone;
          const isEnd = idx === step.currentEnd;
          const isCut = step.cutIndices.includes(idx);
          const isWithinCurrentPartition = idx >= step.partitionStart && idx <= step.currentEnd;

          let bg = '#ffffff';
          let borderColor = '#e2e8f0';
          let textColor = '#0f172a';

          if (isCurrent) {
            bg = '#eef2ff';
            borderColor = '#4f46e5';
            textColor = '#4f46e5';
          } else if (isEnd) {
            bg = '#fef3c7';
            borderColor = '#f59e0b';
            textColor = '#b45309';
          } else if (isWithinCurrentPartition) {
            bg = '#f8fafc';
            borderColor = '#c7d2fe';
            textColor = '#4338ca';
          }

          return `
            <div style="display: flex; align-items: center; gap: 4px;">
              <div style="display: flex; flex-direction: column; align-items: center; gap: 3px;">
                <span style="font-size: 8.5px; color: ${isCurrent ? '#4f46e5' : isEnd ? '#b45309' : '#94a3b8'}; font-weight: 700;">
                  ${isCurrent ? '📍' : isEnd ? '🏁' : `[${idx}]`}
                </span>
                <div style="width: 32px; height: 36px; border-radius: 8px; background: ${bg}; border: 1.5px solid ${borderColor}; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
                  ${char}
                </div>
              </div>
              ${isCut ? `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 36px; color: #10b981; font-weight: 800; font-size: 13px;">✂️</div>` : ''}
            </div>
          `;
        })
        .join('');

      this.sandboxContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <!-- 边界信息 -->
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
            <span>当前扫描: <code style="color:#4f46e5;">[${curIdx}]='${step.currentChar || '-'}'</code></span>
            <span>当前最远边界: <strong style="color: #b45309; font-family: monospace;">[${step.currentEnd}]</strong></span>
          </div>
        </div>

        <!-- 字符流水平条 -->
        <div style="display: flex; gap: 4px; overflow-x: auto; align-items: center; padding: 6px 0;">
          ${cellsHtml}
        </div>
      `;
    }

    // 2. 渲染字符与最后位置 (Card 2 Left)
    if (this.lastPosContainer) {
      const char = step.currentChar;
      const last = char ? step.lastOccurrence[char] : -1;

      this.lastPosContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>字符 <code style="color:#4f46e5; font-weight:700;">'${char || '-'}'</code> 最后位置:</span>
            <span style="font-family: monospace; font-weight:700; color: #4f46e5;">[${last >= 0 ? last : '-'}]</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>当前片段范围:</span>
            <span style="font-family: monospace; font-weight:700; color: #059669;">[${step.partitionStart} .. ${step.currentEnd}]</span>
          </div>
        </div>
      `;
    }

    // 3. 渲染切割点判定监视器 (Card 2 Center)
    if (this.decisionMonitorContainer) {
      const isCut = step.action === 'cut';
      const isDone = step.action === 'done';

      this.decisionMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>切割判定:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isCut ? '#ecfdf5' : isDone ? '#eef2ff' : '#f8fafc'}; color: ${isCut ? '#059669' : isDone ? '#4f46e5' : '#64748b'}; border: 1px solid ${isCut ? '#a7f3d0' : isDone ? '#c7d2fe' : '#e2e8f0'};">
              ${isCut ? '✂️ 触碰右界 (即刻切割)' : isDone ? '🏁 全部切分完成' : '🔍 扫描扩展右边界'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 准则: <code style="color:#4f46e5; font-family:monospace;">if (i == max(lastOccur)) cut();</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染最终划分结果看板 (Card 2 Bottom)
    if (this.metricsContainer) {
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>已划分片段数: <strong style="color: #4f46e5; font-family: monospace; font-size: 13.5px;">${step.partitions.length}</strong> 个</span>
            <span style="font-family: monospace; font-weight: 700; color: #059669;">片段长度: [${step.partitions.join(', ')}]</span>
          </div>
        </div>
      `;
    }

    const badgePart = this.root?.querySelector('#badge-partition-count');
    if (badgePart) {
      badgePart.textContent = `片段数: ${step.partitions.length} 个`;
    }



    // 7. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let badgeColor = '#64748b';
        let badgeBg = '#f1f5f9';
        let badgeText = '扫描';

        if (st.action === 'cut') {
          badgeColor = '#059669';
          badgeBg = '#ecfdf5';
          badgeText = '切割';
        } else if (st.action === 'done') {
          badgeColor = '#4f46e5';
          badgeBg = '#eef2ff';
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
  id: 'partition-labels',
  name: '划分字母区间',
  viewId: 'algo-partition-labels-view',
  category: 'greedy',
  description: '统计各字符最后出现位置，贪心更新最远覆盖边界，到达边界即刻切割',
  icon: '✂️',
  template,
  Visualizer: PartitionLabelsVisualizer,
  difficulty: 2,
  levelOrder: 10,
  learningGoal: '掌握字符区间最远右边界贪心切分模型，熟练运用贪心寻找自然边界',
});
