/**
 * 合并两个有序数组可视化器（逆向双指针）
 * LeetCode 88
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  MERGE_SORTED_ARRAY_PROBLEM_HTML,
  MERGE_SORTED_ARRAY_ANALYSIS_HTML,
  MERGE_SORTED_ARRAY_CODE_LANGUAGES,
} from './merge-sorted-array-problem-content';
import template from './merge-sorted-array.html?raw';

export interface MSAStep {
  nums1: (number | null)[];
  nums2: number[];
  m: number;
  n: number;
  p1: number; // nums1 当前待比较指针
  p2: number; // nums2 当前待比较指针
  k: number;  // 写入目标位置
  action: 'init' | 'compare' | 'fill_p1' | 'fill_p2' | 'done';
  chosenSource?: 'nums1' | 'nums2';
  chosenValue?: number;
  message: string;
  codeLine: number;
}

export function parseValues(input: string, defaultVals: number[]): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return arr.length > 0 ? arr : defaultVals;
}

export function buildMSASteps(nums1Valid: number[], nums2Arr: number[]): MSAStep[] {
  const steps: MSAStep[] = [];
  const m = nums1Valid.length;
  const n = nums2Arr.length;
  // 物理 nums1 长度为 m + n，初始后 n 个为 null
  const nums1Full: (number | null)[] = [...nums1Valid, ...new Array(n).fill(null)];
  const nums2Copy = [...nums2Arr];

  let p1 = m - 1;
  let p2 = n - 1;
  let k = m + n - 1;

  steps.push({
    nums1: [...nums1Full],
    nums2: [...nums2Copy],
    m,
    n,
    p1,
    p2,
    k,
    action: 'init',
    message: `初始化：nums1 有效长度 m=${m}，nums2 长度 n=${n}。分配写入指针 k=${k}，p1=${p1}，p2=${p2}。从后向前比较填充。`,
    codeLine: 2,
  });

  while (p2 >= 0) {
    if (p1 >= 0) {
      const v1 = nums1Full[p1] as number;
      const v2 = nums2Copy[p2];

      steps.push({
        nums1: [...nums1Full],
        nums2: [...nums2Copy],
        m,
        n,
        p1,
        p2,
        k,
        action: 'compare',
        message: `比较末尾元素：nums1[${p1}]=${v1} 与 nums2[${p2}]=${v2}。`,
        codeLine: 6,
      });

      if (v1 > v2) {
        nums1Full[k] = v1;
        steps.push({
          nums1: [...nums1Full],
          nums2: [...nums2Copy],
          m,
          n,
          p1,
          p2,
          k,
          action: 'fill_p1',
          chosenSource: 'nums1',
          chosenValue: v1,
          message: `nums1[${p1}]=${v1} > nums2[${p2}]=${v2}，将 ${v1} 写入 nums1[${k}]。p1 和 k 前移。`,
          codeLine: 7,
        });
        p1--;
      } else {
        nums1Full[k] = v2;
        steps.push({
          nums1: [...nums1Full],
          nums2: [...nums2Copy],
          m,
          n,
          p1,
          p2,
          k,
          action: 'fill_p2',
          chosenSource: 'nums2',
          chosenValue: v2,
          message: `nums1[${p1}]=${v1} <= nums2[${p2}]=${v2}，将 ${v2} 写入 nums1[${k}]。p2 和 k 前移。`,
          codeLine: 9,
        });
        p2--;
      }
    } else {
      // p1 已经全部处理完，直接把 nums2 剩余元素拷贝进 nums1
      const v2 = nums2Copy[p2];
      nums1Full[k] = v2;
      steps.push({
        nums1: [...nums1Full],
        nums2: [...nums2Copy],
        m,
        n,
        p1,
        p2,
        k,
        action: 'fill_p2',
        chosenSource: 'nums2',
        chosenValue: v2,
        message: `nums1 原有效元素已处理完 (p1 < 0)，将 nums2[${p2}]=${v2} 写入 nums1[${k}]。`,
        codeLine: 9,
      });
      p2--;
    }
    k--;
  }

  steps.push({
    nums1: [...nums1Full],
    nums2: [...nums2Copy],
    m,
    n,
    p1,
    p2,
    k,
    action: 'done',
    message: `🎉 合并完成！最终 nums1 为 [${nums1Full.join(', ')}]。`,
    codeLine: 12,
  });

  return steps;
}

export class MergeSortedArrayVisualizer extends StepVisualizer<MSAStep> {
  protected codeLanguages = MERGE_SORTED_ARRAY_CODE_LANGUAGES;
  protected codeLines = MERGE_SORTED_ARRAY_CODE_LANGUAGES['java'];
  protected codePanelTitle = '合并两个有序数组 代码调试';

  private canvasContainer: HTMLElement | null = null;
  private p1MonitorVal: HTMLElement | null = null;
  private p2MonitorVal: HTMLElement | null = null;
  private kMonitorVal: HTMLElement | null = null;
  private stepActionDesc: HTMLElement | null = null;
  private stepPhaseBadge: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.canvasContainer = this.root.querySelector('#msa-canvas-container');
    this.p1MonitorVal = this.root.querySelector('#p1-monitor-val');
    this.p2MonitorVal = this.root.querySelector('#p2-monitor-val');
    this.kMonitorVal = this.root.querySelector('#k-monitor-val');
    this.stepActionDesc = this.root.querySelector('#step-action-desc');
    this.stepPhaseBadge = this.root.querySelector('#step-phase-badge');
    this.logContainer = this.root.querySelector('#exec-log-stream');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 预设 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.msa-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const n1Input = this.root?.querySelector('#input-nums1') as HTMLInputElement | null;
        const n2Input = this.root?.querySelector('#input-nums2') as HTMLInputElement | null;
        if (n1Input && btn.dataset.n1 !== undefined) n1Input.value = btn.dataset.n1;
        if (n2Input && btn.dataset.n2 !== undefined) n2Input.value = btn.dataset.n2;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: MERGE_SORTED_ARRAY_PROBLEM_HTML,
      analysisHtml: MERGE_SORTED_ARRAY_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): MSAStep[] {
    const nums1Input = this.root?.querySelector('#input-nums1') as HTMLInputElement | null;
    const nums2Input = this.root?.querySelector('#input-nums2') as HTMLInputElement | null;
    const n1 = parseValues(nums1Input ? nums1Input.value : '', [1, 2, 3]).sort((a, b) => a - b);
    const n2 = parseValues(nums2Input ? nums2Input.value : '', [2, 5, 6]).sort((a, b) => a - b);
    return buildMSASteps(n1, n2);
  }

  protected renderStep(step: MSAStep): void {
    if (!step) return;

    if (this.stepActionDesc) this.stepActionDesc.textContent = step.message;
    if (this.p1MonitorVal) this.p1MonitorVal.textContent = step.p1 >= 0 ? `[${step.p1}]=${step.nums1[step.p1]}` : '已越界 (-1)';
    if (this.p2MonitorVal) this.p2MonitorVal.textContent = step.p2 >= 0 ? `[${step.p2}]=${step.nums2[step.p2]}` : '已越界 (-1)';
    if (this.kMonitorVal) this.kMonitorVal.textContent = step.k >= 0 ? `[${step.k}]` : '已完成 (-1)';

    if (this.stepPhaseBadge) {
      if (step.action === 'init') {
        this.stepPhaseBadge.textContent = '初始化';
        this.stepPhaseBadge.style.color = '#3b82f6';
      } else if (step.action === 'compare') {
        this.stepPhaseBadge.textContent = '双指针比对';
        this.stepPhaseBadge.style.color = '#2563eb';
      } else if (step.action === 'fill_p1' || step.action === 'fill_p2') {
        this.stepPhaseBadge.textContent = `写入 ${step.chosenValue}`;
        this.stepPhaseBadge.style.color = '#f59e0b';
      } else if (step.action === 'done') {
        this.stepPhaseBadge.textContent = '合并完成';
        this.stepPhaseBadge.style.color = '#10b981';
      }
    }

    this.renderCanvas(step);

    // 日志流
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let bg = st.action === 'done' ? '#f0fdf4' : '#eff6ff';
        let color = st.action === 'done' ? '#15803d' : '#1d4ed8';
        let border = st.action === 'done' ? '#bbf7d0' : '#bfdbfe';
        return `<div style="padding: 4px 8px; border-radius: 6px; background: ${bg}; color: ${color}; border: 1px solid ${border}; margin-bottom: 4px;">
          <span style="color:#94a3b8;">[Step ${idx + 1}]</span> ${st.message}
        </div>`;
      });
      this.logContainer.innerHTML = logs.join('');
      this.logContainer.scrollTop = this.logContainer.scrollHeight;
      if (this.logCountEl) {
        this.logCountEl.textContent = `${this.currentIndex + 1} 条记录`;
      }
    }
  }

  private renderCanvas(step: MSAStep): void {
    if (!this.canvasContainer) return;

    const totalLen1 = step.nums1.length;
    const len2 = step.nums2.length;

    let html = `
      <div style="display: flex; flex-direction: column; gap: 16px; width: 100%; align-items: center; justify-content: center; padding: 10px 0;">
        
        <!-- nums1 区域 (带 p1 和 k 指针) -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
          <div style="font-size: 11.5px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 6px;">
            <span>nums1 物理存储区 (长度 ${totalLen1})</span>
            <span style="font-size: 10.5px; font-weight: normal; color: #64748b;">(前 ${step.m} 个有效，后 ${step.n} 个待写入)</span>
          </div>
          <div style="display: flex; gap: 6px; position: relative;">
    `;

    for (let i = 0; i < totalLen1; i++) {
      const val = step.nums1[i];
      const isP1 = step.p1 === i;
      const isK = step.k === i;
      const isFilledInStep = step.k === i && (step.action === 'fill_p1' || step.action === 'fill_p2');

      let bg = '#ffffff';
      let border = '2px solid #cbd5e1';
      let textColor = '#0f172a';

      if (val === null) {
        bg = '#f8fafc';
        border = '2px dashed #94a3b8';
        textColor = '#94a3b8';
      }

      if (isK) {
        border = '2px solid #f59e0b';
        bg = isFilledInStep ? '#fef3c7' : '#fffbeb';
      } else if (isP1) {
        border = '2px solid #3b82f6';
        bg = '#eff6ff';
      }

      html += `
        <div style="display: flex; flex-direction: column; align-items: center; width: 38px; position: relative;">
          <!-- 顶部指针标签 (p1 / k) -->
          <div style="height: 18px; display: flex; align-items: center; justify-content: center;">
            ${isP1 ? '<span style="background: #3b82f6; color: white; font-size: 9px; font-weight: bold; padding: 1px 4px; border-radius: 4px;">p1</span>' : ''}
            ${isK ? '<span style="background: #f59e0b; color: white; font-size: 9px; font-weight: bold; padding: 1px 4px; border-radius: 4px; margin-left: 2px;">k</span>' : ''}
          </div>
          <!-- 数值盒子 -->
          <div style="width: 38px; height: 38px; border-radius: 8px; background: ${bg}; border: ${border}; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: ${textColor}; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: all 0.2s ease;">
            ${val !== null ? val : '∅'}
          </div>
          <!-- 下标 -->
          <div style="font-size: 10px; color: #64748b; margin-top: 2px; font-family: monospace;">[${i}]</div>
        </div>
      `;
    }

    html += `
          </div>
        </div>

        <!-- 分割指示 -->
        <div style="display: flex; align-items: center; gap: 6px; color: #94a3b8; font-size: 11px;">
          <span>↑ 逆向合并与数据回填</span>
        </div>

        <!-- nums2 区域 (带 p2 指针) -->
        <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
          <div style="font-size: 11.5px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 6px;">
            <span>nums2 来源数组 (长度 ${len2})</span>
          </div>
          <div style="display: flex; gap: 6px; position: relative;">
    `;

    for (let j = 0; j < len2; j++) {
      const val = step.nums2[j];
      const isP2 = step.p2 === j;

      let bg = '#ffffff';
      let border = '2px solid #cbd5e1';
      let textColor = '#0f172a';

      if (isP2) {
        border = '2px solid #10b981';
        bg = '#ecfdf5';
      }

      html += `
        <div style="display: flex; flex-direction: column; align-items: center; width: 38px; position: relative;">
          <!-- 顶部指针标签 (p2) -->
          <div style="height: 18px; display: flex; align-items: center; justify-content: center;">
            ${isP2 ? '<span style="background: #10b981; color: white; font-size: 9px; font-weight: bold; padding: 1px 4px; border-radius: 4px;">p2</span>' : ''}
          </div>
          <!-- 数值盒子 -->
          <div style="width: 38px; height: 38px; border-radius: 8px; background: ${bg}; border: ${border}; display: flex; align-items: center; justify-content: center; font-size: 14px; font-weight: 700; color: ${textColor}; box-shadow: 0 1px 2px rgba(0,0,0,0.05); transition: all 0.2s ease;">
            ${val}
          </div>
          <!-- 下标 -->
          <div style="font-size: 10px; color: #64748b; margin-top: 2px; font-family: monospace;">[${j}]</div>
        </div>
      `;
    }

    html += `
          </div>
        </div>
      </div>
    `;

    this.canvasContainer.innerHTML = html;
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
    if (this.terminalInstance) this.terminalInstance.highlightLine(0);
  }
}

registerAlgorithm({
  id: 'merge-sorted-array',
  name: '合并两个有序数组（双指针）',
  viewId: 'algo-merge-sorted-array-view',
  category: 'linked-list',
  description: '逆向双指针从后向前填充，O(m+n) 时间 O(1) 额外空间',
  icon: '🔀',
  template,
  Visualizer: MergeSortedArrayVisualizer,
  difficulty: 1,
  levelOrder: 6,
  learningGoal: '学会从后向前的逆向双指针合并技术，避免元素后移与额外空间消耗',
});