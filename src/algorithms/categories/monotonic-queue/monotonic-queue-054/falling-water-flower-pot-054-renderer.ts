/**
 * Class 054: Code03 接取落水的最小花盆 (Falling Water Flowerpot)
 * 几何坐标排序 + 双指针滑窗 + 双单调队列维护落水时间差 / 洛谷 P2698 / USACO 2012 Mar Silver
 *
 * 遵循死门禁规范：
 * - 纯净沙盘契约，零 h1~h6
 * - 四语言精准 1-based 行号联动
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { QUEUE_054_PROBLEMS } from './queue-054-problem-content';
import { CODE03_FLOWER_POT_CODES, CODE03_FLOWER_POT_LINES } from './queue-054-stage-codes';
import { Step054, renderFallingWaterFlowerPotBoard } from './queue-054-shared';

export interface WaterPoint {
  x: number;
  y: number;
  id: number;
}

export function buildFallingWaterFlowerPotSteps(rawPoints?: Array<[number, number]>, rawD?: number): Step054[] {
  const steps: Step054[] = [];
  const lines = CODE03_FLOWER_POT_LINES;

  const defaultPts: Array<[number, number]> = [
    [6, 3],
    [2, 4],
    [4, 10],
    [10, 15],
  ];
  const inputPts = rawPoints && rawPoints.length > 0 ? rawPoints : defaultPts;
  const d = rawD !== undefined && rawD > 0 ? rawD : 5;

  // 1. 初始化
  steps.push({
    title: '算法初始化',
    description: `共有 ${inputPts.length} 滴水，目标落水时间差 D = ${d}。准备寻找能接住时间差 ≥ ${d} 的最小花盆宽度。`,
    decision: '第一步：由于花盆放置在 x 轴上一段连续区间，水滴必须先按照 x 坐标升序排列！',
    message: '排序后，任何一段花盆范围必然对应水滴序列中的连续子数组。',
    log: `enter minFlowerpot: N=${inputPts.length}, D=${d}`,
    codeLine: lines.entry,
    d,
    points: inputPts.map(([x, y], id) => ({ x, y, id })),
    curL: -1,
    curR: -1,
    bestW: Infinity,
    currentDiff: 0,
    validWindow: false,
    metrics: { '水滴总数': inputPts.length, '目标时间差 D': d, '最小花盆宽度': '尚未确定' },
  });

  // 2. 排序
  const points: WaterPoint[] = inputPts
    .map(([x, y], id) => ({ x, y, id }))
    .sort((a, b) => a.x - b.x);

  steps.push({
    title: '水滴按 X 坐标升序排序',
    description: `排序后水滴坐标: ${points.map(p => `(${p.x}, ${p.y})`).join(', ')}。`,
    decision: '排序完毕，花盆两端水滴跨度直接等于 x[r] - x[l]。',
    message: '接下来使用双指针维护花盆左右边界水滴，用双单调队列动态追踪花盆内最大与最小高度。',
    log: `sorted points by x`,
    codeLine: lines.sortPoints,
    d,
    points: [...points],
    curL: -1,
    curR: -1,
    bestW: Infinity,
    currentDiff: 0,
    validWindow: false,
    metrics: { '排序后起点 X': points[0].x, '终点 X': points[points.length - 1].x },
  });

  const n = points.length;
  const maxQ: number[] = []; // 单调递减，维护高度 y 的最大值
  const minQ: number[] = []; // 单调递增，维护高度 y 的最小值
  let bestW = Infinity;
  let r = 0;

  for (let l = 0; l < n; l++) {
    // 扩张 r 直到时间差满足 >= d 或 r 达到边界
    while (r < n) {
      const curMaxY = maxQ.length > 0 ? points[maxQ[0]].y : 0;
      const curMinY = minQ.length > 0 ? points[minQ[0]].y : 0;
      const diffY = curMaxY - curMinY;

      // 如果当前已经满足 >= d，停止扩张 r
      if (maxQ.length > 0 && diffY >= d) {
        break;
      }

      // 将 r 加入双单调队列
      const nextY = points[r].y;
      while (maxQ.length > 0 && points[maxQ[maxQ.length - 1]].y <= nextY) {
        maxQ.pop();
      }
      maxQ.push(r);

      while (minQ.length > 0 && points[minQ[minQ.length - 1]].y >= nextY) {
        minQ.pop();
      }
      minQ.push(r);

      r++;

      const updatedMaxY = points[maxQ[0]].y;
      const updatedMinY = points[minQ[0]].y;
      const updatedDiff = updatedMaxY - updatedMinY;
      const isOk = updatedDiff >= d;

      steps.push({
        title: `右边界水滴 #${r - 1} 纳进花盆`,
        description: `将水滴 (${points[r - 1].x}, ${points[r - 1].y}) 纳入花盆区间 [${points[l].x} .. ${points[r - 1].x}]。当前最高落水 y=${updatedMaxY}，最低 y=${updatedMinY}，时间差 Δy = ${updatedDiff}。`,
        decision: isOk ? `Δy = ${updatedDiff} ≥ D(${d})，达到目标时间差！准备结算花盆宽度。` : `Δy = ${updatedDiff} < D(${d})，尚未达到目标时间差，继续向右探寻水滴。`,
        message: '双单调队列保证在 O(1) 内获取区间落水时间极差。',
        log: `expandR: r=${r}, diffY=${updatedDiff}`,
        codeLine: lines.expandR,
        statusBadge: isOk ? { text: '时间差达标', type: 'success' } : { text: '时间差未达标', type: 'info' },
        d,
        points: [...points],
        curL: l,
        curR: r - 1,
        bestW: bestW === Infinity ? -1 : bestW,
        currentDiff: updatedDiff,
        validWindow: isOk,
        metrics: { '花盆左界 x': points[l].x, '花盆右界 x': points[r - 1].x, '当前宽度 W': points[r - 1].x - points[l].x, '落水时间差': updatedDiff },
      });
    }

    // 检查当前窗口是否满足 >= d
    const curMaxY = maxQ.length > 0 ? points[maxQ[0]].y : 0;
    const curMinY = minQ.length > 0 ? points[minQ[0]].y : 0;
    const diffY = curMaxY - curMinY;

    if (diffY >= d) {
      const curW = points[r - 1].x - points[l].x;
      if (curW < bestW) {
        bestW = curW;
        steps.push({
          title: `更新全局最小花盆宽度: W = ${bestW}`,
          description: `花盆区间 [${points[l].x} .. ${points[r - 1].x}] 覆盖的水滴落水时间差为 ${diffY} ≥ ${d}，宽度为 ${curW}，刷新历史最小宽度记录！`,
          decision: `记录更优花盆宽度 bestW = ${bestW}。`,
          message: '尝试寻找更窄的花盆接住相差充足时间的水滴。',
          log: `updateAns: minW=${bestW} from [${points[l].x}..${points[r - 1].x}]`,
          codeLine: lines.updateAns,
          statusBadge: { text: `刷新最小宽度: ${bestW}`, type: 'success' },
          d,
          points: [...points],
          curL: l,
          curR: r - 1,
          bestW,
          currentDiff: diffY,
          validWindow: true,
          metrics: { '最小花盆宽度': bestW, '达标时间差': diffY },
        });
      }
    }

    // 弹出左边界水滴 l
    let poppedL = false;
    if (maxQ.length > 0 && maxQ[0] === l) {
      maxQ.shift();
      poppedL = true;
    }
    if (minQ.length > 0 && minQ[0] === l) {
      minQ.shift();
      poppedL = true;
    }

    if (poppedL) {
      steps.push({
        title: `左端水滴 #${l} 移出花盆`,
        description: `花盆左边界即将收缩离开水滴 (${points[l].x}, ${points[l].y})，从对应单调队列中弹出该水滴。`,
        decision: `左指针 l 从 ${l} 右移到 ${l + 1}，尝试缩小花盆左端。`,
        message: '通过左端收缩排查是否有更小的花盆同样能满足时间差。',
        log: `popL: index ${l}`,
        codeLine: lines.popL,
        d,
        points: [...points],
        curL: l + 1 < n ? l + 1 : l,
        curR: r - 1,
        bestW: bestW === Infinity ? -1 : bestW,
        currentDiff: maxQ.length > 0 && minQ.length > 0 ? points[maxQ[0]].y - points[minQ[0]].y : 0,
        validWindow: false,
        metrics: { '下一个左端水滴': l + 1 < n ? `#${l + 1}` : '结束', '当前最小宽度': bestW === Infinity ? -1 : bestW },
      });
    }
  }

  // 结算
  const finalAns = bestW === Infinity ? -1 : bestW;
  steps.push({
    title: '算法执行完毕',
    description: finalAns === -1
      ? `所有水滴任意组合的时间差均无法达到 D = ${d}，无解，返回 -1。`
      : `计算完毕！接住落水时间差至少为 ${d} 的最小花盆宽度为 ${finalAns}。`,
    decision: `最终返回 answer = ${finalAns}。`,
    message: '全流程排序 O(N log N)，双指针与单调队列扫描 O(N)，总耗时 O(N log N)。',
    log: `done minFlowerpot: ans=${finalAns}`,
    codeLine: lines.returnAns,
    statusBadge: finalAns === -1 ? { text: '无解', type: 'warning' } : { text: `最优宽度 ${finalAns}`, type: 'success' },
    d,
    points: [...points],
    curL: -1,
    curR: -1,
    bestW: finalAns,
    currentDiff: 0,
    validWindow: finalAns !== -1,
    metrics: { '最终最小花盆宽度': finalAns },
  });

  return steps;
}

export const fallingWaterFlowerPot054Renderer = registerDeclarativeAlgorithm<Step054>({
  id: 'falling-water-flower-pot-054',
  aliases: [
    'class054-code03',
    'falling-water-flowerpot',
    'falling-water-flower-pot',
    'luogu-p2698',
    'usaco-flowerpot',
    'falling-water-flowerpot-054',
  ],
  name: '接取落水最小花盆 (Class 054)',
  category: 'monotonic-queue',
  difficulty: 'hard',
  badge: { mode: '坐标排序+单调队列', complexity: 'O(N log N)' },
  description: '水滴坐标排序 + 双指针滑窗 + 双单调队列维护最高/最低落水时间差：求能接住时间差 ≥ D 的最小花盆宽度 (洛谷 P2698)',
  learningGoal: '掌握单调队列与坐标排序、双指针在二维几何与物理落水模型中的联合应用，体会 O(1) 极差维护与滑动窗口收缩的精妙契合。',
  icon: '🪴',

  inputs: [
    {
      id: 'points',
      label: '水滴坐标对 (x, y; 分号隔开)',
      type: 'text',
      defaultValue: '6, 3; 2, 4; 4, 10; 10, 15',
      placeholder: '例如: 6, 3; 2, 4; 4, 10; 10, 15',
    },
    {
      id: 'd',
      label: '目标时间差 D',
      type: 'number',
      defaultValue: 5,
      min: 1,
      max: 100,
    },
  ],

  presets: [
    {
      label: '洛谷样例: (6,3),(2,4),(4,10),(10,15), D=5 (答案: 2)',
      values: { points: '6, 3; 2, 4; 4, 10; 10, 15', d: 5 },
    },
    {
      label: '平缓小高差: (1,1),(3,2),(5,3), D=4 (无解: -1)',
      values: { points: '1, 1; 3, 2; 5, 3', d: 4 },
    },
    {
      label: '同点垂直水滴: (5,1),(5,8),(9,12), D=7 (答案: 0)',
      values: { points: '5, 1; 5, 8; 9, 12', d: 7 },
    },
  ],

  problemContent: QUEUE_054_PROBLEMS.fallingWaterFlowerPot054,
  codeLanguages: CODE03_FLOWER_POT_CODES,

  generateSteps: (params?: Record<string, any>) => {
    let pts: Array<[number, number]> = [
      [6, 3],
      [2, 4],
      [4, 10],
      [10, 15],
    ];
    let d = 5;

    if (params && params.points) {
      const pairs = String(params.points)
        .split(/[;；]+/)
        .map(pair => {
          const coords = pair.split(/[,，\s]+/).filter(Boolean).map(Number);
          return coords.length >= 2 && !isNaN(coords[0]) && !isNaN(coords[1])
            ? [coords[0], coords[1]] as [number, number]
            : null;
        })
        .filter((item): item is [number, number] => item !== null);
      if (pairs.length > 0) pts = pairs;
    }

    if (params && params.d !== undefined) {
      const parsedD = parseInt(params.d, 10);
      if (!isNaN(parsedD) && parsedD > 0) d = parsedD;
    }

    return buildFallingWaterFlowerPotSteps(pts, d);
  },

  renderCanvas: (container, step) => {
    container.innerHTML = renderFallingWaterFlowerPotBoard(step);
  },
});
