/**
 * Class 055: Code01 和至少为 K 的最短子数组 (Shortest Subarray with Sum at Least K)
 * 前缀和 + 单调递增队列头尾双向弹出 / LeetCode 862
 *
 * 遵循死门禁规范：
 * - 纯净沙盘契约，零 h1~h6
 * - 四语言精准 1-based 行号联动
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { QUEUE_055_PROBLEMS } from './queue-055-problem-content';
import { CODE01_SHORTEST_SUBARRAY_CODES, CODE01_SHORTEST_SUBARRAY_LINES } from './queue-055-stage-codes';
import { Step055, renderShortestSubarrayBoard } from './queue-055-shared';

export function buildShortestSubarraySteps(rawArr?: number[], rawK?: number): Step055[] {
  const steps: Step055[] = [];
  const lines = CODE01_SHORTEST_SUBARRAY_LINES;

  const arr = rawArr && rawArr.length > 0 ? [...rawArr] : [2, -1, 2, 1];
  const k = rawK !== undefined && rawK > 0 ? rawK : 3;
  const n = arr.length;

  // 1. 计算前缀和 sum[0..n]
  const sum: number[] = new Array(n + 1).fill(0);
  for (let i = 0; i < n; i++) {
    sum[i + 1] = sum[i] + arr[i];
  }

  // 0. 入口
  steps.push({
    title: '算法初始化',
    description: `原数组包含正负数 [${arr.join(', ')}]，目标寻找子数组累加和 ≥ ${k} 的最短长度。`,
    decision: '为什么滑动窗口失效？因为数组含负数，累加和非单调；必须构建前缀和数组 sum 并使用单调队列！',
    message: '核心思想：求 sum[i] - sum[j] >= K 且 i - j 最小。',
    log: `enter shortestSubarray: n=${n}, k=${k}`,
    codeLine: lines.entry,
    arr,
    sum: [0],
    k,
    curI: -1,
    deque: [],
    bestLen: Infinity,
    activeMatch: null,
    metrics: { '数组长度': n, '目标累加和 K': k, '最短长度': '尚未找到' },
  });

  steps.push({
    title: '计算前缀和数组 sum',
    description: `前缀和数组计算完毕: [${sum.join(', ')}]。sum[i] 代表前 i 个数的和。`,
    decision: '任意子数组 arr[j..i-1] 的累加和直接等于 sum[i] - sum[j]。',
    message: '单调队列将保存前缀和下标，队列内前缀和保持单调递增。',
    log: `computed prefix sum: [${sum.join(', ')}]`,
    codeLine: lines.prefixSum,
    arr,
    sum: [...sum],
    k,
    curI: -1,
    deque: [],
    bestLen: Infinity,
    activeMatch: null,
    metrics: { '前缀和总项数': n + 1, '最大前缀和': Math.max(...sum) },
  });

  const deque: number[] = [];
  let ans = Infinity;

  // 遍历前缀和下标 0 到 n
  for (let i = 0; i <= n; i++) {
    const curSum = sum[i];

    // 1. 队头尝试满足 sum[i] - sum[deque[0]] >= k 结算答案
    while (deque.length > 0 && curSum - sum[deque[0]] >= k) {
      const j = deque.shift()!;
      const curLen = i - j;
      if (curLen < ans) ans = curLen;

      steps.push({
        title: `队头达标弹出: 匹配区间 arr[${j}..${i - 1}]`,
        description: `sum[${i}](${curSum}) - sum[${j}](${sum[j]}) = ${curSum - sum[j]} ≥ K(${k})！长度 = ${curLen}。`,
        decision: `下标 ${j} 达成指标！后续的 i' 更大，以 ${j} 开头的子数组长度只增不减，故 ${j} 永久淘汰！`,
        message: '队头果断出队，保证每个前缀和下标只被当作最优左端点结算一次。',
        log: `popHead: j=${j}, i=${i}, len=${curLen} -> ans=${ans}`,
        codeLine: lines.popHead,
        statusBadge: { text: `达标最短: ${curLen}`, type: 'success' },
        arr,
        sum: [...sum],
        k,
        curI: i,
        deque: [...deque],
        bestLen: ans,
        activeMatch: { l: j, r: i, sumDiff: curSum - sum[j] },
        metrics: { '达标区间': `[${j}..${i - 1}]`, '区间累加和': curSum - sum[j], '当前最短': ans },
      });
    }

    // 2. 队尾淘汰劣质大前缀和
    const popped: number[] = [];
    while (deque.length > 0 && sum[deque[deque.length - 1]] >= curSum) {
      popped.push(deque.pop()!);
    }

    if (popped.length > 0) {
      steps.push({
        title: `队尾单调性淘汰: 移除较劣下标 [${popped.join(', ')}]`,
        description: `新前缀和 sum[${i}]=${curSum} 准备入队。原队尾 [${popped.map(p => `sum[${p}]=${sum[p]}`).join(', ')}] 数值更大或相等。`,
        decision: `下标 ${i} 既比它们靠右（长度更短），前缀和又更小（更容易让后续差值达标），降维打击淘汰队尾！`,
        message: '单调队列严格保持前缀和单调递增，剔除无用大前缀和。',
        log: `popTail: indices [${popped.join(', ')}] by sum[${i}]=${curSum}`,
        codeLine: lines.popTail,
        statusBadge: { text: '淘汰劣质前缀和', type: 'warning' },
        arr,
        sum: [...sum],
        k,
        curI: i,
        deque: [...deque],
        bestLen: ans === Infinity ? -1 : ans,
        activeMatch: null,
        metrics: { '淘汰下标数': popped.length, '待入前缀和': curSum },
      });
    }

    deque.push(i);

    steps.push({
      title: `前缀和下标 i=${i} 入队`,
      description: `sum[${i}]=${curSum} 进入队列尾部，当前单调队列下标: [${deque.join(', ')}]。`,
      decision: `保留下标 ${i} 作为未来前缀和的潜在左边界候选。`,
      message: '单调递增队列等待后续更大的 sum[i\'] 前来匹配。',
      log: `pushTail: i=${i}, val=${curSum}`,
      codeLine: lines.pushTail,
      arr,
      sum: [...sum],
      k,
      curI: i,
      deque: [...deque],
      bestLen: ans === Infinity ? -1 : ans,
      activeMatch: null,
      metrics: { '当前前缀和': curSum, '队列长度': deque.length },
    });
  }

  // 3. 结算
  const finalAns = ans === Infinity ? -1 : ans;
  steps.push({
    title: '算法执行完毕',
    description: finalAns === -1
      ? `遍历完毕，没有任何子数组的累加和达到 K = ${k}，返回 -1。`
      : `计算完毕！累加和至少为 ${k} 的最短子数组长度为 ${finalAns}。`,
    decision: `最终返回 answer = ${finalAns}。`,
    message: '每个前缀和至多入队一次、出队两次，总时间复杂度严格 O(N)。',
    log: `done shortestSubarray: ans=${finalAns}`,
    codeLine: lines.returnAns,
    statusBadge: finalAns === -1 ? { text: '无解 (-1)', type: 'warning' } : { text: `最短长度: ${finalAns}`, type: 'success' },
    arr,
    sum: [...sum],
    k,
    curI: n,
    deque: [...deque],
    bestLen: finalAns,
    activeMatch: null,
    metrics: { '最终结果': finalAns },
  });

  return steps;
}

export const shortestSubarraySumK055Renderer = registerDeclarativeAlgorithm<Step055>({
  id: 'shortest-subarray-sum-k-055',
  aliases: [
    'class055-code01',
    'shortest-subarray-sum-k',
    'shortest-subarray-862',
    'leetcode-862',
  ],
  name: '和至少为 K 的最短子数组 (Class 055)',
  category: 'monotonic-queue',
  difficulty: 'hard',
  badge: { mode: '前缀和+双向队列', complexity: 'O(N)' },
  description: '克服负数累加和非单调困境：前缀和转换 + 单调递增队列头尾双向弹出，求和 ≥ K 的最短连续子数组 (LeetCode 862)',
  learningGoal: '深刻理解负数破坏滑窗单调性时前缀和转换的妙用，掌握队头达标永久结算与队尾小值降维打击的单调队列精髓。',
  icon: '⚡',

  inputs: [
    {
      id: 'nums',
      label: '数组元素 (逗号隔开, 可含负数)',
      type: 'text',
      defaultValue: '2, -1, 2, 1',
      placeholder: '例如: 2, -1, 2, 1',
    },
    {
      id: 'k',
      label: '目标累加和 K',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 100,
    },
  ],

  presets: [
    {
      label: '经典案例: [2, -1, 2, 1], K=3 (答案: 2, 即 [2, 1])',
      values: { nums: '2, -1, 2, 1', k: 3 },
    },
    {
      label: '单元素达标: [1], K=1 (答案: 1)',
      values: { nums: '1', k: 1 },
    },
    {
      label: '包含大负数: [84, -37, 32, 40, 95], K=167 (答案: 3)',
      values: { nums: '84, -37, 32, 40, 95', k: 167 },
    },
  ],

  problemContent: QUEUE_055_PROBLEMS.shortestSubarraySumK055,
  codeLanguages: CODE01_SHORTEST_SUBARRAY_CODES,

  generateSteps: (params?: Record<string, any>) => {
    let nums = [2, -1, 2, 1];
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

    return buildShortestSubarraySteps(nums, k);
  },

  renderCanvas: (container, step) => {
    container.innerHTML = renderShortestSubarrayBoard(step);
  },
});
