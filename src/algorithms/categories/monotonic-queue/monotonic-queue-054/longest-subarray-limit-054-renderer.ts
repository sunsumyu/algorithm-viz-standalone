/**
 * Class 054: Code02 绝对差不超过限制的最长连续子数组 (Longest Subarray with Limit)
 * 双单调队列协同维护滑动窗口极差 / LeetCode 1438
 *
 * 遵循死门禁规范：
 * - 唯一事实来源，统合历史别名 valid-subarray-limit-055
 * - 纯净沙盘契约，零 h1~h6
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { QUEUE_054_PROBLEMS } from './queue-054-problem-content';
import { CODE02_LONGEST_SUBARRAY_CODES, CODE02_LONGEST_SUBARRAY_LINES } from './queue-054-stage-codes';
import { Step054, renderLongestSubarrayLimitBoard } from './queue-054-shared';

export function buildLongestSubarrayLimitSteps(rawNums?: number[], rawLimit?: number): Step054[] {
  const steps: Step054[] = [];
  const lines = CODE02_LONGEST_SUBARRAY_LINES;

  const nums = rawNums && rawNums.length > 0 ? [...rawNums] : [8, 2, 4, 7];
  const limit = rawLimit !== undefined && rawLimit >= 0 ? rawLimit : 4;
  const n = nums.length;

  const maxDeque: number[] = []; // 单调递减，队头最大
  const minDeque: number[] = []; // 单调递增，队头最小
  let ans = 0;
  let r = 0;

  // 0. 入口
  steps.push({
    title: '算法初始化',
    description: `在数组 [${nums.join(', ')}] 中寻找极差 (Max - Min) ≤ ${limit} 的最长连续子数组。`,
    decision: '同时维护递减队列 maxDeque 与递增队列 minDeque，使任意时刻窗口极差以 O(1) 立即获知！',
    message: '窗口由双指针 [l, r) 动态界定，r 尽可能右移试探，l 适时收缩淘汰过期元素。',
    log: `enter longestSubarray: n=${n}, limit=${limit}`,
    codeLine: lines.entry,
    nums,
    limit,
    left: 0,
    right: 0,
    maxVal: 0,
    minVal: 0,
    ansLen: 0,
    maxDeque: [],
    minDeque: [],
    metrics: { '限制 limit': limit, '初始左指针': 0, '当前最优长度': 0 },
  });

  for (let l = 0; l < n; l++) {
    // 尝试拓展 r
    while (r < n) {
      const nextVal = nums[r];
      const curMax = maxDeque.length > 0 ? Math.max(nums[maxDeque[0]], nextVal) : nextVal;
      const curMin = minDeque.length > 0 ? Math.min(nums[minDeque[0]], nextVal) : nextVal;

      // 检查加入 nums[r] 后极差是否仍在 limit 内
      if (curMax - curMin > limit) {
        steps.push({
          title: `指针 R=${r} 试探超限: 极差 ${curMax - curMin} > ${limit}`,
          description: `若将 nums[${r}]=${nextVal} 纳入窗口，窗口极差为 ${curMax} - ${curMin} = ${curMax - curMin} > limit(${limit})，无法再右延！`,
          decision: `r 停止扩张，当前以 l=${l} 为起点的最长合法区间固定为 [${l} .. ${r - 1}]，长度为 ${r - l}。`,
          message: '双单调队列保证在未实际入队前即能预知极差合法性。',
          log: `checkFail: r=${r}, val=${nextVal}, diff=${curMax - curMin} > limit`,
          codeLine: lines.checkOk,
          statusBadge: { text: '极差超限拦截', type: 'warning' },
          nums,
          limit,
          left: l,
          right: r,
          maxVal: curMax,
          minVal: curMin,
          ansLen: ans,
          maxDeque: [...maxDeque],
          minDeque: [...minDeque],
          metrics: { '当前窗口': `[${l}..${r - 1}]`, '超限极差': curMax - curMin, '限制': limit },
        });
        break;
      }

      // 将 r 加入 maxDeque (递减) 与 minDeque (递增)
      while (maxDeque.length > 0 && nums[maxDeque[maxDeque.length - 1]] <= nextVal) {
        maxDeque.pop();
      }
      maxDeque.push(r);

      while (minDeque.length > 0 && nums[minDeque[minDeque.length - 1]] >= nextVal) {
        minDeque.pop();
      }
      minDeque.push(r);

      r++;

      const validMax = nums[maxDeque[0]];
      const validMin = nums[minDeque[0]];

      steps.push({
        title: `指针 R 扩展至 ${r}: 窗口 [${l}..${r - 1}] 合法`,
        description: `nums[${r - 1}]=${nextVal} 顺利入队。当前窗口最大值 ${validMax}，最小值 ${validMin}，极差 ${validMax - validMin} ≤ ${limit}。`,
        decision: `右边界扩展成功，当前窗口长度增长为 ${r - l}。`,
        message: '双队列同步维护，maxDeque[0] 恒为峰值，minDeque[0] 恒为谷值。',
        log: `pushR: r=${r - 1}, max=${validMax}, min=${validMin}`,
        codeLine: lines.pushR,
        statusBadge: { text: '扩展合法区间', type: 'info' },
        nums,
        limit,
        left: l,
        right: r,
        maxVal: validMax,
        minVal: validMin,
        ansLen: ans,
        maxDeque: [...maxDeque],
        minDeque: [...minDeque],
        metrics: { '当前有效区间': `[${l}..${r - 1}]`, '当前窗口极差': validMax - validMin },
      });
    }

    // 更新全局最优
    const curLen = r - l;
    if (curLen > ans) {
      ans = curLen;
      steps.push({
        title: `更新最长合法长度 Ans = ${ans}`,
        description: `以 l=${l} 起始的最长合法子数组为 [${l} .. ${r - 1}]，其长度为 ${curLen}，刷新历史最优！`,
        decision: `全局答案 ans 更新为 ${ans}。`,
        message: '记录当前左端点能辐射的最大合法连续长度。',
        log: `updateAns: l=${l}, len=${curLen} -> ans=${ans}`,
        codeLine: lines.updateAns,
        statusBadge: { text: `刷新最长: ${ans}`, type: 'success' },
        nums,
        limit,
        left: l,
        right: r,
        maxVal: maxDeque.length > 0 ? nums[maxDeque[0]] : 0,
        minVal: minDeque.length > 0 ? nums[minDeque[0]] : 0,
        ansLen: ans,
        maxDeque: [...maxDeque],
        minDeque: [...minDeque],
        metrics: { '刷新长度': ans, '窗口范围': `[${l}..${r - 1}]` },
      });
    }

    // 弹出过期左边界 l
    let poppedAny = false;
    if (maxDeque.length > 0 && maxDeque[0] === l) {
      maxDeque.shift();
      poppedAny = true;
    }
    if (minDeque.length > 0 && minDeque[0] === l) {
      minDeque.shift();
      poppedAny = true;
    }

    if (poppedAny) {
      steps.push({
        title: `左指针 L=${l} 右移: 移出过期端点`,
        description: `下标 ${l} 即将脱离窗口，若其位于 maxDeque 或 minDeque 队头，必须出队！`,
        decision: `l 从 ${l} 推进到 ${l + 1}，准备考察下一个起点的最长连续子数组。`,
        message: '双指针每个下标至多进出双队列各一次，均摊时间复杂度严格 O(N)。',
        log: `popL: index ${l}`,
        codeLine: lines.popL,
        nums,
        limit,
        left: l + 1,
        right: r,
        maxVal: maxDeque.length > 0 ? nums[maxDeque[0]] : 0,
        minVal: minDeque.length > 0 ? nums[minDeque[0]] : 0,
        ansLen: ans,
        maxDeque: [...maxDeque],
        minDeque: [...minDeque],
        metrics: { '下一个左指针': l + 1, '当前最优': ans },
      });
    }
  }

  // 结算
  steps.push({
    title: '算法执行完毕',
    description: `遍历结束，数组 [${nums.join(', ')}] 中满足极差 ≤ ${limit} 的最长连续子数组长度为 ${ans}。`,
    decision: `返回结果 ans = ${ans}。`,
    message: '双单调队列协同解法时间复杂度 O(N)，空间复杂度 O(N)。',
    log: `done longestSubarray: ans=${ans}`,
    codeLine: lines.returnAns,
    statusBadge: { text: '计算完毕', type: 'success' },
    nums,
    limit,
    left: n,
    right: n,
    maxVal: 0,
    minVal: 0,
    ansLen: ans,
    maxDeque: [],
    minDeque: [],
    metrics: { '最终最长合法长度': ans },
  });

  return steps;
}

export const longestSubarrayLimit054Renderer = registerDeclarativeAlgorithm<Step054>({
  id: 'longest-subarray-limit-054',
  aliases: [
    'class054-code02',
    'longest-subarray-limit',
    'longest-subarray-limit-1438',
    'leetcode-1438',
    'valid-subarray-limit-055',
  ],
  name: '绝对差限制最长子数组 (Class 054)',
  category: 'monotonic-queue',
  difficulty: 'medium',
  badge: { mode: '双单调队列极差', complexity: 'O(N)' },
  description: '双单调队列协同：maxDeque 与 minDeque 分别维护滑动窗口极值，双指针贪心寻找极差 ≤ limit 的最长连续子数组 (LeetCode 1438)',
  learningGoal: '理解双单调队列在动态极差维护中的威力，掌握双指针配合单调队列在 O(N) 复杂度解决滑动窗口极值约束问题。',
  icon: '🎯',

  inputs: [
    {
      id: 'nums',
      label: '数组元素 (逗号分隔)',
      type: 'text',
      defaultValue: '8, 2, 4, 7',
      placeholder: '例如: 8, 2, 4, 7',
    },
    {
      id: 'limit',
      label: '最大允许极差 limit',
      type: 'number',
      defaultValue: 4,
      min: 0,
      max: 100,
    },
  ],

  presets: [
    {
      label: '经典案例: [8, 2, 4, 7], limit=4 (答案: 2)',
      values: { nums: '8, 2, 4, 7', limit: 4 },
    },
    {
      label: '全量达标: [10, 1, 2, 4, 7, 2], limit=5 (答案: 4)',
      values: { nums: '10, 1, 2, 4, 7, 2', limit: 5 },
    },
    {
      label: '单调平缓: [4, 2, 2, 2, 4, 4, 2, 2], limit=0 (答案: 3)',
      values: { nums: '4, 2, 2, 2, 4, 4, 2, 2', limit: 0 },
    },
  ],

  problemContent: QUEUE_054_PROBLEMS.longestSubarrayLimit054,
  codeLanguages: CODE02_LONGEST_SUBARRAY_CODES,

  generateSteps: (params?: Record<string, any>) => {
    let nums = [8, 2, 4, 7];
    let limit = 4;

    if (params && params.nums) {
      const parsed = String(params.nums)
        .split(/[,，\s]+/)
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n));
      if (parsed.length > 0) nums = parsed;
    }

    if (params && params.limit !== undefined) {
      const parsedLimit = parseInt(params.limit, 10);
      if (!isNaN(parsedLimit) && parsedLimit >= 0) limit = parsedLimit;
    }

    return buildLongestSubarrayLimitSteps(nums, limit);
  },

  renderCanvas: (container, step) => {
    container.innerHTML = renderLongestSubarrayLimitBoard(step);
  },
});
