/**
 * Class 055: Code02 满足不等式的最大值 (Max Value of Equation)
 * 公式分离 (xj + yj) + (yi - xi) + 单调递减队列维护历史最大权值 / LeetCode 1499
 *
 * 遵循死门禁规范：
 * - 纯净沙盘契约，零 h1~h6
 * - 四语言精准 1-based 行号联动
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { QUEUE_055_PROBLEMS } from './queue-055-problem-content';
import { CODE02_MAX_EQUATION_CODES, CODE02_MAX_EQUATION_LINES } from './queue-055-stage-codes';
import { Step055, renderMaxValueOfEquationBoard } from './queue-055-shared';

export function buildMaxValueOfEquationSteps(rawPoints?: Array<[number, number]>, rawK?: number): Step055[] {
  const steps: Step055[] = [];
  const lines = CODE02_MAX_EQUATION_LINES;

  const defaultPts: Array<[number, number]> = [
    [1, 3],
    [2, 0],
    [5, 10],
    [6, -10],
  ];
  const points = rawPoints && rawPoints.length > 0 ? rawPoints : defaultPts;
  const k = rawK !== undefined && rawK > 0 ? rawK : 1;
  const n = points.length;

  const deque: Array<[number, number]> = []; // [x, y - x]
  let ans = -Infinity;

  // 0. 入口
  steps.push({
    title: '算法初始化',
    description: `共有 ${n} 个按 X 升序排列的点，最大距离限制 K = ${k}。寻找 yi + yj + |xi - xj| 的最大值。`,
    decision: '数学展开：因 xi < xj，式子化简为 (xj + yj) + (yi - xi)。固定点 j 时，只需寻找历史点中 yi - xi 最大的点！',
    message: '使用单调队列存储历史点的 (x, y - x)，保持权值 y - x 单调递减。',
    log: `enter findMaxValueOfEquation: n=${n}, k=${k}`,
    codeLine: lines.entry,
    points,
    maxEquationK: k,
    curPointIdx: -1,
    pointDeque: [],
    curBestAns: -Infinity,
    matchedPair: null,
    metrics: { '点集数量': n, '距离限制 K': k, '全局最优指标': '待求解' },
  });

  for (let i = 0; i < n; i++) {
    const [x, y] = points[i];
    const curWeight = y - x;

    // 1. 队头过期：如果历史点的 x 距离当前 x 超过了 k，过期出队
    const expiredList: Array<[number, number]> = [];
    while (deque.length > 0 && deque[0][0] + k < x) {
      expiredList.push(deque.shift()!);
    }

    if (expiredList.length > 0) {
      steps.push({
        title: `点 #${i} (${x}, ${y}): 队头超出距离 K 过期弹出`,
        description: `当前点 x = ${x}，队头点 [${expiredList.map(([ex, ey]) => `(${ex}, ${ey})`).join(', ')}] 的 x 距离差超过了 K(${k})！`,
        decision: `队头点永久过期，出队！`,
        message: '单调队列动态维护滑动有效距离窗口。',
        log: `expireHead: points [${expiredList.map(p => p[0]).join(', ')}] with curX=${x}`,
        codeLine: lines.expireHead,
        statusBadge: { text: '队头超出范围出队', type: 'info' },
        points,
        maxEquationK: k,
        curPointIdx: i,
        pointDeque: [...deque],
        curBestAns: ans === -Infinity ? -Infinity : ans,
        matchedPair: null,
        metrics: { '当前点 X': x, '过期移出数': expiredList.length },
      });
    }

    // 2. 队头即为当前最优配对
    if (deque.length > 0) {
      const [headX, headDiff] = deque[0];
      const curVal = x + y + headDiff;
      const isNewBest = curVal > ans;
      if (isNewBest) ans = curVal;

      steps.push({
        title: `点 #${i} (${x}, ${y}): 与队头配对计算指标`,
        description: `当前点 (${x}, ${y}) 与队头点 (${headX}, 权值${headDiff}) 配对：(x+y)=${x + y} + (yi-xi)=${headDiff} = ${curVal}。`,
        decision: isNewBest ? `刷新历史最高指标: ${ans}！` : `当前组合指标 ${curVal} 未超越历史最优 ${ans}。`,
        message: '队头永远是有效距离范围内权值 yi - xi 最大的前置点。',
        log: `updateAns: pair with (${headX}) -> val=${curVal}, ans=${ans}`,
        codeLine: lines.updateAns,
        statusBadge: isNewBest ? { text: `刷新最大值: ${ans}`, type: 'success' } : { text: `当前配对: ${curVal}`, type: 'info' },
        points,
        maxEquationK: k,
        curPointIdx: i,
        pointDeque: [...deque],
        curBestAns: ans,
        matchedPair: { prev: [headX, headDiff + headX], cur: [x, y], val: curVal },
        metrics: { '当前配对值': curVal, '全局最优': ans, '间距': x - headX },
      });
    }

    // 3. 维护 y - x 从大到小单调递减
    const poppedTail: Array<[number, number]> = [];
    while (deque.length > 0 && deque[deque.length - 1][1] <= curWeight) {
      poppedTail.push(deque.pop()!);
    }

    if (poppedTail.length > 0) {
      steps.push({
        title: `点 #${i} (${x}, ${y}): 队尾劣质权值淘汰`,
        description: `当前点权值 y-x = ${curWeight}，队尾点 [${poppedTail.map(([px, py]) => `权值${py}`).join(', ')}] 权值更小且生存期更短。`,
        decision: `新点横坐标更大且权值更大，直接淘汰队尾劣质点！`,
        message: '单调递减队列保证队内每一个点都在未来的某个窗口具有竞争力。',
        log: `popTail: popped ${poppedTail.length} points`,
        codeLine: lines.popTail,
        statusBadge: { text: '淘汰队尾较小权值', type: 'warning' },
        points,
        maxEquationK: k,
        curPointIdx: i,
        pointDeque: [...deque],
        curBestAns: ans,
        matchedPair: null,
        metrics: { '当前点权值': curWeight, '淘汰数量': poppedTail.length },
      });
    }

    // 入队
    deque.push([x, curWeight]);

    steps.push({
      title: `点 #${i} (${x}, ${y}) 入队作为未来前驱`,
      description: `(${x}, 权值${curWeight}) 进入队列尾部，当前单调队列大小为 ${deque.length}。`,
      decision: `该点将作为后续点的候选前置点进行比对。`,
      message: '单调队列完成当前点的处理，推进至下一个点。',
      log: `pushCur: point (${x}, ${y}), weight=${curWeight}`,
      codeLine: lines.pushCur,
      points,
      maxEquationK: k,
      curPointIdx: i,
      pointDeque: [...deque],
      curBestAns: ans,
      matchedPair: null,
      metrics: { '队列长度': deque.length, '当前队头权值': deque[0][1] },
    });
  }

  // 4. 结算
  steps.push({
    title: '算法执行完毕',
    description: `所有点扫描完毕，满足不等式 |xi - xj| ≤ ${k} 的最大指标值为 ${ans}。`,
    decision: `最终返回 answer = ${ans}。`,
    message: '全流程每个点至多进出队列一次，时间复杂度严格 O(N)。',
    log: `done findMaxValueOfEquation: ans=${ans}`,
    codeLine: lines.returnAns,
    statusBadge: { text: `计算完毕: ${ans}`, type: 'success' },
    points,
    maxEquationK: k,
    curPointIdx: n - 1,
    pointDeque: [...deque],
    curBestAns: ans,
    matchedPair: null,
    metrics: { '最终最大值': ans },
  });

  return steps;
}

export const maxValueOfEquation055Renderer = registerDeclarativeAlgorithm<Step055>({
  id: 'max-value-of-equation-055',
  aliases: [
    'class055-code02',
    'max-value-of-equation',
    'max-value-of-equation-1499',
    'leetcode-1499',
  ],
  name: '满足不等式最大值 (Class 055)',
  category: 'monotonic-queue',
  difficulty: 'hard',
  badge: { mode: '数学分离+单调队列', complexity: 'O(N)' },
  description: '展开绝对值化简为 (xj + yj) + (yi - xi)：单调递减队列动态维护有效跨度内历史最大 yi - xi 权值 (LeetCode 1499)',
  learningGoal: '掌握不等式与绝对值在几何有序点集中的数学拆解技巧，体会单调队列维护多变量分离极值的核心解题模式。',
  icon: '📐',

  inputs: [
    {
      id: 'points',
      label: '点集坐标对 (x, y; 分号隔开, x升序)',
      type: 'text',
      defaultValue: '1, 3; 2, 0; 5, 10; 6, -10',
      placeholder: '例如: 1, 3; 2, 0; 5, 10; 6, -10',
    },
    {
      id: 'k',
      label: '最大距离限制 K',
      type: 'number',
      defaultValue: 1,
      min: 1,
      max: 100,
    },
  ],

  presets: [
    {
      label: 'LeetCode 样例 1: (1,3),(2,0),(5,10),(6,-10), K=1 (答案: 4)',
      values: { points: '1, 3; 2, 0; 5, 10; 6, -10', k: 1 },
    },
    {
      label: 'LeetCode 样例 2: (0,0),(3,0),(9,2), K=3 (答案: 3)',
      values: { points: '0, 0; 3, 0; 9, 2', k: 3 },
    },
    {
      label: '大高差跨度: (1,10),(2,15),(3,25),(7,30), K=2 (答案: 41)',
      values: { points: '1, 10; 2, 15; 3, 25; 7, 30', k: 2 },
    },
  ],

  problemContent: QUEUE_055_PROBLEMS.maxValueOfEquation055,
  codeLanguages: CODE02_MAX_EQUATION_CODES,

  generateSteps: (params?: Record<string, any>) => {
    let pts: Array<[number, number]> = [
      [1, 3],
      [2, 0],
      [5, 10],
      [6, -10],
    ];
    let k = 1;

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

    if (params && params.k !== undefined) {
      const parsedK = parseInt(params.k, 10);
      if (!isNaN(parsedK) && parsedK > 0) k = parsedK;
    }

    return buildMaxValueOfEquationSteps(pts, k);
  },

  renderCanvas: (container, step) => {
    container.innerHTML = renderMaxValueOfEquationBoard(step);
  },
});
