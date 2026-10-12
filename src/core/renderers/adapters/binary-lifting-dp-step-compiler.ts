import { AdvancedStep } from '../../../algorithms/categories/advanced-topics/advanced-124-134/advanced-124-134-shared';
import { BINARY_LIFTING_DP_LINES } from '../../../algorithms/categories/advanced-topics/advanced-124-134/advanced-124-134-stage-codes';

export interface BinaryLiftingDpStep extends AdvancedStep {
  start: number;
  cur: number;
  targetSteps: number;
  remainingSteps: number;
  k: number;
  jumpDist: number;
  path: number[];
  finalResult?: number;
}

export function buildBinaryLiftingDpSteps(
  n: number,
  succ: number[],
  start: number,
  stepsCount: number
): BinaryLiftingDpStep[] {
  const steps: BinaryLiftingDpStep[] = [];
  const lines = BINARY_LIFTING_DP_LINES;

  const maxK = Math.floor(Math.log2(Math.max(1, stepsCount))) + 1;
  // to[u][k]
  const to: number[][] = Array.from({ length: n }, () => new Array(maxK + 1).fill(0));
  for (let i = 0; i < n; i++) {
    to[i][0] = succ[i];
  }
  for (let k = 1; k <= maxK; k++) {
    for (let i = 0; i < n; i++) {
      to[i][k] = to[to[i][k - 1]][k - 1];
    }
  }

  let cur = start;
  let remaining = stepsCount;
  const path = [cur];

  // Step 0: 入口
  steps.push({
    start,
    cur,
    targetSteps: stepsCount,
    remainingSteps: remaining,
    k: maxK,
    jumpDist: 0,
    path: [...path],
    decision: `主函数入口：从起始状态 #${start} 出发，利用倍增 DP 模拟快速转移 ${stepsCount} 步`,
    message: `步数二进制分解: ${stepsCount} = (${stepsCount.toString(2)})_2，仅需 O(log Steps) 次倍增跳转`,
    log: `enter queryLiftingDP(start=${start}, steps=${stepsCount})`,
    codeLine: lines.entry,
    metrics: { '起始节点': `#${start}`, '目标跳转步数': stepsCount, '二进制位数': maxK + 1 },
  });

  for (let k = maxK; k >= 0; k--) {
    const bitVal = 1 << k;
    const isBitSet = (remaining & bitVal) !== 0;

    steps.push({
      start,
      cur,
      targetSteps: stepsCount,
      remainingSteps: remaining,
      k,
      jumpDist: bitVal,
      path: [...path],
      decision: `检查二进制第 ${k} 位 (权值 2^${k} = ${bitVal})：${isBitSet ? '位为 1，需要跳跃' : '位为 0，无需跳跃跳过'}`,
      message: `剩余待跳转步数: ${remaining}`,
      log: `checkBit(k=${k}, bitVal=${bitVal}, isBitSet=${isBitSet})`,
      codeLine: lines.checkBit,
      metrics: { '当前位置': `#${cur}`, '考查跨度': bitVal, '是否跳跃': isBitSet ? '是' : '否' },
    });

    if (isBitSet) {
      const nxtNode = to[cur][k];
      remaining -= bitVal;
      cur = nxtNode;
      path.push(cur);

      steps.push({
        start,
        cur,
        targetSteps: stepsCount,
        remainingSteps: remaining,
        k,
        jumpDist: bitVal,
        path: [...path],
        decision: `⚡ 瞬间跨越 2^${k} = ${bitVal} 步！通过 to[${path[path.length - 2]}][${k}] 直达目标节点 #${cur}`,
        message: `跳转完成，剩余待跳步数更新为: ${remaining}`,
        log: `jumpPower: k=${k}, dist=${bitVal}, reach #${cur}`,
        codeLine: lines.jumpPower,
        metrics: { '跳转跨度': bitVal, '跃迁至': `#${cur}`, '剩余步数': remaining },
        statusBadge: { text: `跳跃 2^${k} (${bitVal}) 步 ➔ #${cur}`, type: 'warning' },
      });
    }
  }

  // 终态
  steps.push({
    start,
    cur,
    targetSteps: stepsCount,
    remainingSteps: 0,
    k: -1,
    jumpDist: 0,
    path: [...path],
    finalResult: cur,
    decision: `✅ 倍增跳转完成！从 #${start} 成功转移 ${stepsCount} 步，最终抵达状态: #${cur}`,
    message: `跳转轨迹: [${path.map(p => `#${p}`).join(' ➔ ')}]。将原 O(S) 线性模拟降至极速 O(log S)`,
    log: `binary lifting finished, destination = #${cur}`,
    codeLine: lines.returnAns,
    metrics: { '最终到达状态': `#${cur}`, '总消耗跳转步数': stepsCount, '跳转总次数': path.length - 1 },
    statusBadge: { text: `最终抵达: #${cur}`, type: 'success' },
  });

  return steps;
}
