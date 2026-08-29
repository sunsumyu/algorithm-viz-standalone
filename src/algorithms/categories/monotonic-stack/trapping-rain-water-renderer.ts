/**
 * 接雨水可视化器（单调栈）— 4-Card 标准现代架构
 * LeetCode 42：单调递减栈，按行横向切片累加凹槽雨水 (h * w)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  TRAPPING_RAIN_WATER_PROBLEM_HTML,
  TRAPPING_RAIN_WATER_ANALYSIS_HTML,
  TRAPPING_RAIN_WATER_CODE_LANGUAGES,
} from './trapping-rain-water-problem-content';
import template from './trapping-rain-water.html?raw';

export interface WaterLayer {
  leftIdx: number;
  rightIdx: number;
  bottomHeight: number;
  topHeight: number;
}

export interface TRWStep {
  heights: number[];
  currentIndex: number;
  stack: number[]; // 存储下标
  totalWater: number;
  leftIdx: number | null;
  midIdx: number | null;
  rightIdx: number | null;
  layerWater: number;
  waterLayers: WaterLayer[];
  waterPerColumn: number[];
  action: 'init' | 'scan' | 'trap_layer' | 'push' | 'done';
  message: string;
  codeLine: number;
}

export function buildTrappingRainWaterSteps(rawHeights: number[]): TRWStep[] {
  const steps: TRWStep[] = [];
  const n = rawHeights.length;

  if (n <= 2) {
    steps.push({
      heights: [...rawHeights],
      currentIndex: -1,
      stack: [],
      totalWater: 0,
      leftIdx: null,
      midIdx: null,
      rightIdx: null,
      layerWater: 0,
      waterLayers: [],
      waterPerColumn: new Array(n).fill(0),
      action: 'done',
      message: '柱子数量小于等于 2，无法构成凹槽，接雨水总量为 0',
      codeLine: 2,
    });
    return steps;
  }

  const stack: number[] = [];
  let totalWater = 0;
  const waterLayers: WaterLayer[] = [];
  const waterPerColumn = new Array(n).fill(0);

  steps.push({
    heights: [...rawHeights],
    currentIndex: -1,
    stack: [],
    totalWater: 0,
    leftIdx: null,
    midIdx: null,
    rightIdx: null,
    layerWater: 0,
    waterLayers: [],
    waterPerColumn: [...waterPerColumn],
    action: 'init',
    message: `初始化：共 ${n} 根柱子，单调栈初始为空，按行横向结算凹槽雨水`,
    codeLine: 4,
  });

  for (let i = 0; i < n; i++) {
    const curH = rawHeights[i];

    steps.push({
      heights: [...rawHeights],
      currentIndex: i,
      stack: [...stack],
      totalWater,
      leftIdx: null,
      midIdx: null,
      rightIdx: i,
      layerWater: 0,
      waterLayers: [...waterLayers],
      waterPerColumn: [...waterPerColumn],
      action: 'scan',
      message: `🔍 考察柱子 [${i}] (高度 ${curH})：与单调栈顶 ${stack.length > 0 ? `[${stack[stack.length - 1]}] (高度 ${rawHeights[stack[stack.length - 1]]})` : '（栈空）'} 比对`,
      codeLine: 6,
    });

    while (stack.length > 0 && curH > rawHeights[stack[stack.length - 1]]) {
      const mid = stack.pop()!;
      const midH = rawHeights[mid];

      if (stack.length > 0) {
        const left = stack[stack.length - 1];
        const leftH = rawHeights[left];

        const h = Math.min(leftH, curH) - midH;
        const w = i - left - 1;
        const layerVol = h * w;

        if (layerVol > 0) {
          totalWater += layerVol;
          waterLayers.push({
            leftIdx: left,
            rightIdx: i,
            bottomHeight: midH,
            topHeight: Math.min(leftH, curH),
          });

          // 更新列雨水
          for (let col = left + 1; col < i; col++) {
            waterPerColumn[col] += h;
          }

          steps.push({
            heights: [...rawHeights],
            currentIndex: i,
            stack: [...stack],
            totalWater,
            leftIdx: left,
            midIdx: mid,
            rightIdx: i,
            layerWater: layerVol,
            waterLayers: [...waterLayers],
            waterPerColumn: [...waterPerColumn],
            action: 'trap_layer',
            message: `🌊 触发凹槽横向蓄水！左壁 [${left}] (${leftH}), 槽底 [${mid}] (${midH}), 右壁 [${i}] (${curH}) &rarr; 高度 h=${h}, 宽度 w=${w}, 本层蓄水 = ${layerVol} 单位！累计 = ${totalWater}`,
            codeLine: 11,
          });
        }
      }
    }

    stack.push(i);

    steps.push({
      heights: [...rawHeights],
      currentIndex: i,
      stack: [...stack],
      totalWater,
      leftIdx: null,
      midIdx: null,
      rightIdx: null,
      layerWater: 0,
      waterLayers: [...waterLayers],
      waterPerColumn: [...waterPerColumn],
      action: 'push',
      message: `📥 将柱子 [${i}] (高度 ${curH}) 压入单调栈，维持栈内单调递减`,
      codeLine: 13,
    });
  }

  steps.push({
    heights: [...rawHeights],
    currentIndex: n - 1,
    stack: [...stack],
    totalWater,
    leftIdx: null,
    midIdx: null,
    rightIdx: null,
    layerWater: 0,
    waterLayers: [...waterLayers],
    waterPerColumn: [...waterPerColumn],
    action: 'done',
    message: `🎉 接雨水计算完成！所有凹槽按层横向累加，最终可接雨水总量为 ${totalWater} 单位`,
    codeLine: 15,
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class TrappingRainWaterVisualizer extends StepVisualizer<TRWStep> {
  protected codeLanguages = TRAPPING_RAIN_WATER_CODE_LANGUAGES;
  protected codeLines = TRAPPING_RAIN_WATER_CODE_LANGUAGES['java'];
  protected codePanelTitle = '接雨水 代码调试';

  private sandboxContainer: HTMLElement | null = null;
  private grooveContainer: HTMLElement | null = null;
  private decisionMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#trw-sandbox-container');
    this.grooveContainer = this.root.querySelector('#trw-groove-container');
    this.decisionMonitorContainer = this.root.querySelector('#trw-decision-monitor-container');
    this.metricsContainer = this.root.querySelector('#trw-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.trw-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const hEl = this.root?.querySelector('#input-height') as HTMLInputElement | null;
        if (hEl && btn.dataset.height) hEl.value = btn.dataset.height;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: TRAPPING_RAIN_WATER_PROBLEM_HTML,
      analysisHtml: TRAPPING_RAIN_WATER_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): TRWStep[] {
    const hEl = this.root?.querySelector('#input-height') as HTMLInputElement | null;
    const rawHeights = (hEl?.value || '0,1,0,2,1,0,1,3,2,1,2,1')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    return buildTrappingRainWaterSteps(rawHeights.length ? rawHeights : [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]);
  }

  protected renderStep(step: TRWStep): void {
    const heights = step.heights;
    const stack = step.stack;
    const waterPerCol = step.waterPerColumn;
    const n = heights.length;

    // 1. 渲染柱状地形与蓄水池沙盘 (Card 1)
    if (this.sandboxContainer && n > 0) {
      const curIdx = step.currentIndex;
      const isDone = step.action === 'done';

      const maxH = Math.max(...heights, 1);

      // 上方：地形与积水柱状堆叠
      const colsHtml = heights
        .map((h, idx) => {
          const isCurrent = idx === curIdx && !isDone;
          const isLeft = idx === step.leftIdx;
          const isMid = idx === step.midIdx;
          const inStack = stack.includes(idx);
          const waterH = waterPerCol[idx] ?? 0;

          const totalHeightUnits = h + waterH;
          const colHeightPx = Math.max(8, Math.round((h / (maxH + 1)) * 90));
          const waterHeightPx = Math.round((waterH / (maxH + 1)) * 90);

          let barBg = '#475569';
          let border = '#334155';

          if (isMid) {
            barBg = '#ef4444';
            border = '#dc2626';
          } else if (isLeft) {
            barBg = '#3b82f6';
            border = '#2563eb';
          } else if (isCurrent) {
            barBg = '#0284c7';
            border = '#0369a1';
          } else if (inStack) {
            barBg = '#fbbf24';
            border = '#d97706';
          }

          return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; min-width: 22px; max-width: 44px;">
              <span style="font-size: 8.5px; font-weight: 700; color: ${waterH > 0 ? '#0284c7' : '#64748b'}; font-family: monospace;">
                ${waterH > 0 ? `+${waterH}` : ''}
              </span>
              <div style="width: 100%; height: 95px; display: flex; flex-direction: column; justify-content: flex-end; align-items: center;">
                <!-- 积水部分 -->
                ${waterHeightPx > 0 ? `<div style="width: 18px; height: ${waterHeightPx}px; background: rgba(56, 189, 248, 0.75); border: 1px solid #38bdf8; border-radius: 4px 4px 0 0;"></div>` : ''}
                <!-- 实体柱子部分 -->
                <div style="width: 18px; height: ${colHeightPx}px; background: ${barBg}; border: 1px solid ${border}; border-radius: ${waterHeightPx > 0 ? '0' : '4px 4px 0 0'}; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 8.5px; font-weight: 800;">
                  ${h}
                </div>
              </div>
              <span style="font-size: 8.5px; color: ${isMid ? '#ef4444' : isLeft ? '#3b82f6' : isCurrent ? '#0284c7' : '#94a3b8'}; font-weight: 700;">
                ${isMid ? '底' : isLeft ? '左' : isCurrent ? '右' : `[${idx}]`}
              </span>
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
              <span style="color: #0284c7;">h=${heights[idx]}</span>
            </div>
          `;
        })
        .join('');

      this.sandboxContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <!-- 柱子与积水展示 -->
          <div style="display: flex; justify-content: space-around; align-items: flex-end; padding: 2px 0; border-bottom: 1px solid #e2e8f0;">
            ${colsHtml}
          </div>

          <!-- 单调栈容器 -->
          <div style="display: flex; align-items: center; gap: 8px; padding-top: 2px;">
            <span style="font-size: 10.5px; font-weight: 700; color: #475569; white-space: nowrap;">🥞 单调栈 (栈底 &rarr; 栈顶):</span>
            <div style="display: flex; gap: 4px; overflow-x: auto; flex: 1; align-items: center; min-height: 28px;">
              ${stack.length > 0 ? stackItemsHtml : '<span style="font-size: 10.5px; color: #94a3b8;">栈空</span>'}
            </div>
          </div>
        </div>
      `;
    }

    // 2. 渲染凹槽三要素 (Card 2 Left)
    if (this.grooveContainer) {
      const left = step.leftIdx;
      const mid = step.midIdx;
      const right = step.rightIdx;

      this.grooveContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>左壁 & 凹槽底 & 右壁:</span>
            <span style="font-family: monospace; font-weight:800; color: #0284c7; font-size: 12.5px;">
              ${mid !== null ? `左[${left}] (${heights[left!]}) | 底[${mid}] (${heights[mid]}) | 右[${right}] (${heights[right!]})` : '暂无凹槽触发'}
            </span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>凹槽本层蓄水量 (h &times; w):</span>
            <span style="font-family: monospace; font-weight:700; color: #059669;">
              ${step.layerWater > 0 ? `+${step.layerWater} 单位` : '0'}
            </span>
          </div>
        </div>
      `;
    }

    // 3. 渲染横向切片蓄水监视器 (Card 2 Center)
    if (this.decisionMonitorContainer) {
      const isTrap = step.action === 'trap_layer';
      const isPush = step.action === 'push';

      this.decisionMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>计算状态:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isTrap ? '#eff6ff' : isPush ? '#f8fafc' : '#ecfdf5'}; color: ${isTrap ? '#0284c7' : isPush ? '#475569' : '#059669'}; border: 1px solid ${isTrap ? '#bfdbfe' : isPush ? '#e2e8f0' : '#a7f3d0'};">
              ${isTrap ? `🌊 凹槽蓄水 (+${step.layerWater})` : isPush ? '📥 压入栈顶 (递减)' : '🔍 比对栈顶'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 准则: <code style="color:#0284c7; font-family:monospace;">h = min(left, right) - mid; volume = h * (right - left - 1)</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染累计雨水总量看板 (Card 2 Bottom)
    if (this.metricsContainer) {
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>当前累计蓄水量: <strong style="color: #0284c7; font-family: monospace; font-size: 13.5px;">${step.totalWater}</strong> 单位</span>
            <span style="font-family: monospace; font-weight: 700; color: #059669;">横向切片累加最优解</span>
          </div>
        </div>
      `;
    }

    const badgeWater = this.root?.querySelector('#badge-total-water');
    if (badgeWater) {
      badgeWater.textContent = `累计接水: ${step.totalWater} 单位`;
    }

    // 5. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let badgeColor = '#64748b';
        let badgeBg = '#f1f5f9';
        let badgeText = '扫描';

        if (st.action === 'trap_layer') {
          badgeColor = '#0284c7';
          badgeBg = '#eff6ff';
          badgeText = '蓄水';
        } else if (st.action === 'push') {
          badgeColor = '#475569';
          badgeBg = '#f8fafc';
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
  id: 'trapping-rain-water',
  name: '接雨水',
  viewId: 'algo-trapping-rain-water-view',
  category: 'monotonic-stack',
  description: '单调递减栈按行横向切片累加凹槽雨水，槽底出栈以左壁和当前右壁计算蓄水量',
  icon: '💧',
  template,
  Visualizer: TrappingRainWaterVisualizer,
  difficulty: 3,
  levelOrder: 4,
  learningGoal: '掌握单调栈在二维几何与物理蓄水中的横向分层计算思想，理解凹槽底出栈时与左右壁构建积水矩形的本质',
});
