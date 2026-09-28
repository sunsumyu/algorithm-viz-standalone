/**
 * Class 054: Code01 滑动窗口最大值 (Sliding Window Maximum)
 * 经典单调队列入门模版 / LeetCode 239
 *
 * 遵循死门禁规范：
 * - 唯一事实来源，综合旧版本 inputs/presets 与新版本 4 语言源码行号
 * - 纯净沙盘契约，零 h1~h6
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { QUEUE_054_PROBLEMS } from './queue-054-problem-content';
import { CODE01_SLIDING_WINDOW_CODES, CODE01_SLIDING_WINDOW_LINES } from './queue-054-stage-codes';
import { Step054, renderSlidingWindowBoard } from './queue-054-shared';

export function buildSlidingWindowMaxSteps(rawNums?: number[], rawK?: number): Step054[] {
  const steps: Step054[] = [];
  const lines = CODE01_SLIDING_WINDOW_LINES;

  const nums = rawNums && rawNums.length > 0 ? [...rawNums] : [1, 3, -1, -3, 5, 3, 6, 7];
  const k = rawK !== undefined && rawK > 0 ? Math.min(rawK, nums.length) : 3;
  const n = nums.length;

  const deque: number[] = []; // 存储下标
  const ansList: number[] = [];

  // 0. 主函数入口
  steps.push({
    title: '算法初始化',
    description: `准备为数组 [${nums.join(', ')}] 计算长度为 K=${k} 的滑动窗口最大值。`,
    decision: '创建双端队列 Deque，保持从队头到队尾对应数值单调递减；队头下标永远是当前窗口最大值！',
    message: '单调队列核心哲学：如果后来者数值更大，前面的较小者在剩余生存期内绝无可能胜出，直接淘汰出队。',
    log: `enter maxSlidingWindow: n=${n}, k=${k}`,
    codeLine: lines.entry,
    nums,
    k,
    curIdx: -1,
    windowLeft: -1,
    windowRight: -1,
    deque: [],
    ansList: [],
    metrics: { '数组长度 N': n, '窗口大小 K': k, '已收集答案数': 0 },
  });

  // 1. 先形成长度为 k - 1 的初始前置半窗口
  for (let i = 0; i < k - 1; i++) {
    const val = nums[i];

    // 淘汰劣质小值
    const popped: number[] = [];
    while (deque.length > 0 && nums[deque[deque.length - 1]] <= val) {
      popped.push(deque.pop()!);
    }

    if (popped.length > 0) {
      steps.push({
        title: `初始窗口构建: 下标 i=${i} 淘汰较小值`,
        description: `新元素 nums[${i}]=${val} 进入窗口，队尾存在较小值 [${popped.map(p => `nums[${p}]=${nums[p]}`).join(', ')}]，直接淘汰！`,
        decision: `淘汰下标 ${popped.join(', ')}，保持队列从大到小单调性。`,
        message: '双端队列只留下真正有竞争力的候选值。',
        log: `popBack: indices [${popped.join(', ')}] by val ${val}`,
        codeLine: lines.popBackPre,
        statusBadge: { text: '淘汰队尾小值', type: 'warning' },
        nums,
        k,
        curIdx: i,
        windowLeft: 0,
        windowRight: i,
        deque: [...deque],
        ansList: [...ansList],
        metrics: { '当前下标': i, '队头最大值': deque.length > 0 ? nums[deque[0]] : val },
      });
    }

    deque.push(i);

    steps.push({
      title: `初始窗口构建: 下标 i=${i} 入队`,
      description: `nums[${i}]=${val} 入队，当前队列下标为 [${deque.join(', ')}]。`,
      decision: `下标 ${i} 进队尾，初始半窗口长度拓展至 ${i + 1}。`,
      message: '等待窗口长度拓展至 K，即可产生首个最大值答案。',
      log: `push: index ${i} (val ${val})`,
      codeLine: lines.pushPre,
      nums,
      k,
      curIdx: i,
      windowLeft: 0,
      windowRight: i,
      deque: [...deque],
      ansList: [...ansList],
      metrics: { '当前下标': i, '窗口内元素数': i + 1, '队头最大值': nums[deque[0]] },
    });
  }

  // 2. 窗口右滑，收集每一个长度为 k 的窗口最大值
  const m = n - k + 1;
  for (let l = 0, r = k - 1; l < m; l++, r++) {
    const valR = nums[r];

    // 淘汰比当前 r 小的值
    const popped: number[] = [];
    while (deque.length > 0 && nums[deque[deque.length - 1]] <= valR) {
      popped.push(deque.pop()!);
    }

    if (popped.length > 0) {
      steps.push({
        title: `窗口 [${l}..${r}]: 右边界 r=${r} 进窗淘汰`,
        description: `新右端点 nums[${r}]=${valR} 加入，淘汰队尾较小值 [${popped.map(p => `nums[${p}]=${nums[p]}`).join(', ')}]。`,
        decision: `淘汰劣质元素，nums[${r}]=${valR} 更加年轻且数值更大！`,
        message: '越年轻越大者优先保留，老且小者被迅速淘汰。',
        log: `popBack: indices [${popped.join(', ')}]`,
        codeLine: lines.popBackCur,
        statusBadge: { text: '淘汰小值', type: 'warning' },
        nums,
        k,
        curIdx: r,
        windowLeft: l,
        windowRight: r,
        deque: [...deque],
        ansList: [...ansList],
        metrics: { '当前活动窗口': `[${l}..${r}]`, '待入值': valR },
      });
    }

    deque.push(r);

    // 收集最大值
    const curMax = nums[deque[0]];
    ansList.push(curMax);

    steps.push({
      title: `窗口 [${l}..${r}]: 记录最大值 ${curMax}`,
      description: `完整窗口 [${l}..${r}] 形成，队头 deque[0]=${deque[0]} 对应数值 ${curMax} 即为当前窗口最大值！`,
      decision: `答案数组追加最大值 ${curMax}，已收集答案数: ${ansList.length}。`,
      message: 'O(1) 时间直接读取队头元素，最大值瞬间出炉。',
      log: `recordMax: window [${l}..${r}] -> max=${curMax}`,
      codeLine: lines.recordMax,
      statusBadge: { text: `产出最值 ${curMax}`, type: 'success' },
      nums,
      k,
      curIdx: r,
      windowLeft: l,
      windowRight: r,
      deque: [...deque],
      ansList: [...ansList],
      metrics: { '当前活动窗口': `[${l}..${r}]`, '窗口最大值': curMax, '已收录答案': ansList.length },
    });

    // 检查队头是否过期
    if (deque[0] === l) {
      const expiredIdx = deque.shift()!;
      steps.push({
        title: `窗口 [${l}..${r}]: 队头下标 ${expiredIdx} 过期弹出`,
        description: `窗口左边界 l=${l} 即将右移移出窗口，队头下标正好为 ${expiredIdx}，必须从队头出队！`,
        decision: `队头下标 ${expiredIdx} 已不在下一个窗口范围内，安全出队。`,
        message: '只有当队头下标恰好等于当前窗口左端点时才出队，其它位置无需处理。',
        log: `popExpired: head index ${expiredIdx}`,
        codeLine: lines.popExpired,
        statusBadge: { text: '队头过期出队', type: 'info' },
        nums,
        k,
        curIdx: r,
        windowLeft: l + 1,
        windowRight: r,
        deque: [...deque],
        ansList: [...ansList],
        metrics: { '过期下标': expiredIdx, '下一个左端点': l + 1 },
      });
    }
  }

  // 3. 完成
  steps.push({
    title: '算法执行完毕',
    description: `所有长度为 ${k} 的滑动窗口最大值已计算完毕，最终结果: [${ansList.join(', ')}]。`,
    decision: `返回结果数组，共 ${ansList.length} 个最大值。`,
    message: '全流程单调队列均摊时间复杂度严格 O(N)，空间复杂度 O(K)。',
    log: 'done slidingWindowMax',
    codeLine: lines.returnAns,
    statusBadge: { text: '计算完成', type: 'success' },
    nums,
    k,
    curIdx: n - 1,
    windowLeft: n - k,
    windowRight: n - 1,
    deque: [...deque],
    ansList: [...ansList],
    metrics: { '总答案数': ansList.length, '最终队列': deque.length },
  });

  return steps;
}

export const slidingWindowMax054Renderer = registerDeclarativeAlgorithm<Step054>({
  id: 'sliding-window-max-054',
  aliases: [
    'class054-code01',
    'sliding-window-max',
    'sliding-window-maximum',
    'sliding-window-maximum-239',
    'leetcode-239',
    'monotonic-queue-basic-054',
  ],
  name: '滑动窗口最大值 (Class 054)',
  category: 'monotonic-queue',
  difficulty: 'hard',
  badge: { mode: '单调双端队列', complexity: 'O(N)' },
  description: '单调双端队列经典应用：维护队头到队尾单调递减，O(1) 瞬时获取当前滑动窗口内的最大元素 (LeetCode 239)',
  learningGoal: '彻底掌握单调双端队列核心哲学：后入且更大者淘汰老旧劣质元素，队头严格维护当前活动窗口最大值。',
  icon: '🪟',

  inputs: [
    {
      id: 'nums',
      label: '数组元素 (逗号分隔)',
      type: 'text',
      defaultValue: '1, 3, -1, -3, 5, 3, 6, 7',
      placeholder: '例如: 1, 3, -1, -3, 5, 3, 6, 7',
    },
    {
      id: 'k',
      label: '窗口大小 K',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 20,
    },
  ],

  presets: [
    {
      label: '经典案例: [1, 3, -1, -3, 5, 3, 6, 7], K=3',
      values: { nums: '1, 3, -1, -3, 5, 3, 6, 7', k: 3 },
    },
    {
      label: '单调递减: [9, 8, 7, 6, 5, 4], K=3',
      values: { nums: '9, 8, 7, 6, 5, 4', k: 3 },
    },
    {
      label: '单调递增: [1, 2, 3, 4, 5, 6], K=3',
      values: { nums: '1, 2, 3, 4, 5, 6', k: 3 },
    },
    {
      label: '重复元素: [4, 4, 4, 2, 4, 1], K=2',
      values: { nums: '4, 4, 4, 2, 4, 1', k: 2 },
    },
  ],

  problemContent: QUEUE_054_PROBLEMS.slidingWindowMax054,
  codeLanguages: CODE01_SLIDING_WINDOW_CODES,

  generateSteps: (params?: Record<string, any>) => {
    let nums = [1, 3, -1, -3, 5, 3, 6, 7];
    let k = 3;

    if (params && params.nums) {
      const parsed = String(params.nums)
        .split(/[,，\s]+/)
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n));
      if (parsed.length > 0) nums = parsed;
    }

    if (params && params.k !== undefined) {
      const parsedK = parseInt(params.k, 10);
      if (!isNaN(parsedK) && parsedK > 0) k = parsedK;
    }

    return buildSlidingWindowMaxSteps(nums, k);
  },

  renderCanvas: (container, step) => {
    container.innerHTML = renderSlidingWindowBoard(step);
  },
});
