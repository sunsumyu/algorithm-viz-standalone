/**
 * 接雨水可视化器（单调栈）— 声明式 4-Card 标准架构
 * LeetCode 42：单调递减栈，按行横向切片累加凹槽雨水 (h * w)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';
import {
  TRAPPING_RAIN_WATER_PROBLEM_HTML,
  TRAPPING_RAIN_WATER_ANALYSIS_HTML,
  TRAPPING_RAIN_WATER_CODE_LANGUAGES,
} from './trapping-rain-water-problem-content';

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
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export function buildTrappingRainWaterSteps(rawHeights: number[]): TRWStep[] {
  const steps: TRWStep[] = [];
  const n = rawHeights.length;

  const lines = {
    init: { java: [4, 5], cpp: [5, 6], python: [5, 6], javascript: [2, 3] },
    scan: { java: [6, 7], cpp: [7, 8], python: [7, 8], javascript: [4, 5] },
    trapLayer: { java: [8, 13], cpp: [9, 14], python: [9, 14], javascript: [6, 11] },
    push: { java: 16, cpp: 17, python: 15, javascript: 14 },
    done: { java: 18, cpp: 19, python: 16, javascript: 16 },
  };

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
      codeLine: lines.done,
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
    codeLine: lines.init,
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
      codeLine: lines.scan,
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
            codeLine: lines.trapLayer,
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
      codeLine: lines.push,
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
    codeLine: lines.done,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: TRWStep[]): TRWStep[] {
  return steps.map((s) => {
    const heights = s.heights;
    let action = '🔍 比对栈顶';
    if (s.action === 'trap_layer') action = `🌊 凹槽蓄水 (+${s.layerWater})`;
    else if (s.action === 'push') action = '📥 压入栈顶 (递减)';
    else if (s.action === 'done') action = '🎉 计算完成';
    else if (s.action === 'init') action = '初始化';

    return {
      ...s,
      log: s.message,
      metrics: {
        'groove-3':
          s.midIdx !== null
            ? `左[${s.leftIdx}] (${heights[s.leftIdx!]}) | 底[${s.midIdx}] (${heights[s.midIdx]}) | 右[${s.rightIdx}] (${heights[s.rightIdx!]})`
            : '暂无凹槽触发',
        'layer-water': s.layerWater > 0 ? `+${s.layerWater} 单位` : '0',
        'total-water': `${s.totalWater} 单位`,
        action,
      },
    };
  });
}

/** 主视觉：柱状地形 + 按列蓄水堆叠 + 单调栈沙盘 */
export function renderTrappingRainWaterCanvas(container: HTMLElement, step: TRWStep): void {
  const heights = step.heights;
  const stack = step.stack;
  const waterPerCol = step.waterPerColumn;
  const n = heights.length;

  if (n === 0) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

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
            ${waterHeightPx > 0 ? `<div style="width: 18px; height: ${waterHeightPx}px; background: rgba(56, 189, 248, 0.75); border: 1px solid #38bdf8; border-radius: 4px 4px 0 0;"></div>` : ''}
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

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box;">
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

registerDeclarativeAlgorithm({
  id: 'trapping-rain-water',
  name: '接雨水',
  category: 'monotonic-stack',
  description: '单调递减栈按行横向切片累加凹槽雨水，槽底出栈以左壁和当前右壁计算蓄水量',
  icon: '💧',
  difficulty: 3,
  levelOrder: 4,
  learningGoal: '掌握单调栈在二维几何与物理蓄水中的横向分层计算思想，理解凹槽底出栈时与左右壁构建积水矩形的本质',
  inputs: [
    {
      id: 'height',
      label: '柱子高度数组',
      type: 'text',
      defaultValue: '0,1,0,2,1,0,1,3,2,1,2,1',
      placeholder: '0,1,0,2,1,0,1,3,2,1,2,1',
    },
  ],
  presets: [
    { label: '示例 1 (6滴水)', values: { height: '0,1,0,2,1,0,1,3,2,1,2,1' } },
    { label: '示例 2 (9滴水)', values: { height: '4,2,0,3,2,5' } },
    { label: '单边陡降', values: { height: '5,4,1,2' } },
    { label: '单调递增 (0滴水)', values: { height: '1,2,3,4,5' } },
  ],
  metrics: [
    { id: 'groove-3', label: '左壁 & 凹槽底 & 右壁', color: '#0284c7' },
    { id: 'layer-water', label: '凹槽本层蓄水量', color: '#059669' },
    { id: 'total-water', label: '当前累计蓄水量', color: '#0284c7' },
    { id: 'action', label: '计算状态', color: '#2563eb' },
  ],
  legend: [
    { label: '🌊 蓝色蓄水池', color: '#0284c7' },
    { label: '🧱 黑色实体柱', color: '#475569' },
    { label: '🥞 凹槽支撑栈', color: '#fbbf24' },
  ],
  codeLanguages: TRAPPING_RAIN_WATER_CODE_LANGUAGES,
  problemHtml: TRAPPING_RAIN_WATER_PROBLEM_HTML,
  analysisHtml: TRAPPING_RAIN_WATER_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const rawHeights = String(inputs.height ?? '0,1,0,2,1,0,1,3,2,1,2,1')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    return withMetrics(
      buildTrappingRainWaterSteps(
        rawHeights.length ? rawHeights : [0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]
      )
    );
  },
  renderCanvas: (container, step) =>
    renderTrappingRainWaterCanvas(container, step as TRWStep),
});
