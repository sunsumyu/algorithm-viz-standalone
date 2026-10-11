import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

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
  log?: string;
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

export function withMetrics(steps: TRWStep[]): TRWStep[] {
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
