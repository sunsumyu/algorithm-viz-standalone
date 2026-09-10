/**
 * Class 129: 倍增优化 DP (Binary Lifting DP)
 * 洛谷 P1613 跑路 / 环形转移倍增
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_124_134_PROBLEMS } from './advanced-124-134-problem-content';
import { BINARY_LIFTING_DP_CODES, BINARY_LIFTING_DP_LINES } from './advanced-124-134-stage-codes';
import { AdvancedStep } from './advanced-124-134-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

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

export const binaryLiftingDpVisualizer = registerDeclarativeAlgorithm<BinaryLiftingDpStep>({
  id: 'binary-lifting-dp-129',
  name: '倍增优化 DP (Class 129)',
  category: 'dynamic-programming',
  icon: '⚡',
  difficulty: 2,
  levelOrder: 129,
  learningGoal: '深刻理解倍增 DP 状态预处理 to[u][k] 与高次步数二进制对齐拆分的快速跳跃机制',
  problemHtml: ADVANCED_124_134_PROBLEMS.binaryLiftingDp.html,
  analysisHtml: ADVANCED_124_134_PROBLEMS.binaryLiftingDp.html,
  inputs: [
    {
      id: 'start',
      label: '起点节点 ID (0 ~ 5)',
      type: 'number',
      defaultValue: 0,
      min: 0,
      max: 5,
    },
    {
      id: 'steps',
      label: '转移总步数 Steps',
      type: 'number',
      defaultValue: 13,
      min: 1,
      max: 1000,
    },
  ],
  codeLanguages: BINARY_LIFTING_DP_CODES,
  generateSteps: (input) => {
    // 构造一个 6 节点的环形状态有向图: 0->1->2->3->4->5->0
    const n = 6;
    const succ = [1, 2, 3, 4, 5, 0];
    const start = Math.max(0, Math.min(n - 1, Number(input.start) || 0));
    const stepsCount = Math.max(1, Math.min(1000, Number(input.steps) || 13));
    return buildBinaryLiftingDpSteps(n, succ, start, stepsCount);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        <div style="margin-bottom: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px;">
          <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 10px;">
            🌀 环形状态图转移拓扑 (0 ➔ 1 ➔ 2 ➔ 3 ➔ 4 ➔ 5 ➔ 0)
          </div>
          <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
            ${Array.from({ length: 6 }).map((_, id) => {
              const isCur = id === step.cur;
              const isStart = id === step.start;
              return `
                <div style="width: 48px; height: 48px; border-radius: 50%; background: ${isCur ? '#6366f1' : isStart ? '#fef3c7' : '#ffffff'}; border: 2px solid ${isCur ? '#4338ca' : isStart ? '#f59e0b' : '#cbd5e1'}; color: ${isCur ? '#ffffff' : '#1e293b'}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-weight: 700; font-size: 13px;">
                  <span>#${id}</span>
                  ${isCur ? '<span style="font-size: 8px; color: #e0e7ff;">当前</span>' : ''}
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前所处节点</div>
            <div style="font-size: 18px; font-weight: 700; color: #4338ca;">#${step.cur}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">剩余待跳步数</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669;">${step.remainingSteps} / ${step.targetSteps}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">累计跳转轨迹</div>
            <div style="font-size: 14px; font-weight: 700; color: #d97706;">${step.path.map(p => `#${p}`).join(' ➔ ')}</div>
          </div>
        </div>

        ${renderFormulaCard(
          '倍增优化 DP 执行状态',
          `起点: #${step.start} | 目标步数: ${step.targetSteps} | 当前二进制位 k = ${step.k >= 0 ? step.k : '完毕'}`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
