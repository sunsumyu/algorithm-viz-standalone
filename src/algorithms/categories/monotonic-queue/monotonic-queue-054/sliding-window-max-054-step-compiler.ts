/**
 * Class 054: Code01 滑动窗口最大值 (Sliding Window Maximum) - 步进编译器
 * LeetCode 239
 */

import { CODE01_SLIDING_WINDOW_LINES } from './queue-054-stage-codes';
import { Step054 } from './queue-054-shared';

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
        title: `窗口 [${l}..${r}] 移动: 淘汰队尾劣质值`,
        description: `新元素 nums[${r}]=${valR} 即将进窗，队尾存在较小值 [${popped.map(p => `nums[${p}]=${nums[p]}`).join(', ')}]，直接淘汰！`,
        decision: `下标 ${popped.join(', ')} 永远不可能成为该窗口及后续窗口的最大值，直接弹出。`,
        message: '保证队头到队尾单调递减。',
        log: `popBack: indices [${popped.join(', ')}] by val ${valR}`,
        codeLine: lines.popBackCur,
        statusBadge: { text: '淘汰队尾小值', type: 'warning' },
        nums,
        k,
        curIdx: r,
        windowLeft: l,
        windowRight: r,
        deque: [...deque],
        ansList: [...ansList],
        metrics: { '活动窗口': `[${l}..${r}]`, '新进元素': valR, '队头最大值': deque.length > 0 ? nums[deque[0]] : valR },
      });
    }

    // 新元素入队
    deque.push(r);

    steps.push({
      title: `窗口 [${l}..${r}] 移动: 下标 r=${r} 入队`,
      description: `nums[${r}]=${valR} 成功进队尾，当前队列状态 [${deque.join(', ')}]。`,
      decision: `窗口右边界对齐 r=${r}。`,
      message: '接下来检查队头是否仍在当前窗口合法生存期内。',
      log: `push: index ${r} (val ${valR})`,
      codeLine: lines.pushCur,
      nums,
      k,
      curIdx: r,
      windowLeft: l,
      windowRight: r,
      deque: [...deque],
      ansList: [...ansList],
      metrics: { '活动窗口': `[${l}..${r}]`, '队头下标': deque[0], '队头值': nums[deque[0]] },
    });

    // 收集当前窗口最大值（队头）
    const maxVal = nums[deque[0]];
    ansList.push(maxVal);

    steps.push({
      title: `窗口 [${l}..${r}] 答案收集`,
      description: `窗口 [${l}..${r}] (长度 ${k}) 内的最大值即为队头元素 nums[${deque[0]}]=${maxVal}！记录答案。`,
      decision: `将 ${maxVal} 追加至答案集，当前已收集 ${ansList.length} 个结果。`,
      message: '队头在经过严格单调筛选后，恒为当前合法窗口的全局最大值。',
      log: `collect max: ans[${l}] = ${maxVal}`,
      codeLine: lines.recordMax,
      statusBadge: { text: '收集窗口最大值', type: 'success' },
      nums,
      k,
      curIdx: r,
      windowLeft: l,
      windowRight: r,
      deque: [...deque],
      ansList: [...ansList],
      metrics: { '当前窗口': `[${l}..${r}]`, '最大值': maxVal, '已收集结果': `[${ansList.join(', ')}]` },
    });

    // 检查队头是否过期 (deque[0] == l)
    if (deque[0] === l) {
      const expired = deque.shift()!;
      steps.push({
        title: `窗口准备右移: 队头下标 ${expired} 过期出队`,
        description: `当前窗口左边界即将跨过下标 ${l}，队头下标 ${expired} 已不在下一轮窗口范围内，必须从队头出队！`,
        decision: `移除队头 ${expired}，由次大候选者晋升为新队头。`,
        message: '双端队列的高效性：头部检查是否过期，尾部维护单调性。',
        log: `expire head: index ${expired}`,
        codeLine: lines.popExpired,
        statusBadge: { text: '队头过期出队', type: 'info' },
        nums,
        k,
        curIdx: r,
        windowLeft: l + 1,
        windowRight: r,
        deque: [...deque],
        ansList: [...ansList],
        metrics: { '过期下标': expired, '新队头': deque.length > 0 ? nums[deque[0]] : '空' },
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
