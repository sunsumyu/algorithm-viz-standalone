/**
 * Class 130: 单调队列优化 DP (Monotonic Queue DP)
 * 洛谷 P1725 琪露诺 / P3957 跳房子
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_124_134_PROBLEMS } from './advanced-124-134-problem-content';
import { MONOTONIC_QUEUE_DP_CODES, MONOTONIC_QUEUE_DP_LINES } from './advanced-124-134-stage-codes';
import { AdvancedStep, renderMonotonicQueueVisual } from './advanced-124-134-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface MonotonicQueueDpStep extends AdvancedStep {
  val: number[];
  dp: number[];
  curI: number;
  q: number[];
  L: number;
  R: number;
  bestAns?: number;
}

export function buildMonotonicQueueDpSteps(
  val: number[],
  L: number,
  R: number
): MonotonicQueueDpStep[] {
  const steps: MonotonicQueueDpStep[] = [];
  const lines = MONOTONIC_QUEUE_DP_LINES;

  const n = val.length;
  const dp: number[] = new Array(n).fill(0);
  dp[0] = val[0];
  const q: number[] = [];

  // Step 0: 入口
  steps.push({
    val: [...val],
    dp: [...dp],
    curI: 0,
    q: [],
    L,
    R,
    decision: `主函数入口：开始使用单调队列优化求解长度为 ${n} 的跳跃最大收益 DP`,
    message: `合法跳跃跨度区间: [${L}, ${R}]。利用单调递减双端队列维护前驱最优转移候选，转移时间优化至 O(1)`,
    log: `enter maxCostDP(L=${L}, R=${R})`,
    codeLine: lines.entry,
    metrics: { '初始收益 dp[0]': dp[0], '跳跃区间': `[${L}, ${R}]` },
  });

  for (let i = 1; i < n; i++) {
    const newJ = i - L;

    // 1. 新决策入队维护单调性
    if (newJ >= 0) {
      const popList: number[] = [];
      while (q.length > 0 && dp[q[q.length - 1]] <= dp[newJ]) {
        popList.push(q.pop()!);
      }
      q.push(newJ);

      steps.push({
        val: [...val],
        dp: [...dp],
        curI: i,
        q: [...q],
        L,
        R,
        decision: `新决策点 j=${newJ} (收益 dp[${newJ}]=${dp[newJ]}) 进入窗口候选池：${popList.length > 0 ? `淘汰队尾劣质解 [${popList.map(p => `j=${p}(dp=${dp[p]})`).join(', ')}]` : '直接入队'}`,
        message: `队列始终严格保持 dp 值单调递减，保证队头为历史最大值`,
        log: `pushQueue: newJ=${newJ}, dp=${dp[newJ]}, popped: ${popList.length}`,
        codeLine: lines.pushQueue,
        metrics: { '新入候选': `j=${newJ}`, '队尾淘汰数': popList.length, '当前队列长': q.length },
      });
    }

    // 2. 淘汰过期决策
    const expiredList: number[] = [];
    while (q.length > 0 && q[0] < i - R) {
      expiredList.push(q.shift()!);
    }

    if (expiredList.length > 0) {
      steps.push({
        val: [...val],
        dp: [...dp],
        curI: i,
        q: [...q],
        L,
        R,
        decision: `🚪 窗口右移淘汰过期决策：决策点 [${expiredList.map(e => `j=${e}`).join(', ')}] 距离当前 i=${i} 已超过最大跳跃跨度 R=${R}，移出队头`,
        message: `剩余队头决策依然为当前滑动窗口 [${i - R}, ${i - L}] 内的全局最大值`,
        log: `popExpire: expired=[${expiredList.join(', ')}]`,
        codeLine: lines.popExpire,
        metrics: { '淘汰过期点': expiredList.join(', '), '新队头': q[0] !== undefined ? `j=${q[0]}` : '空' },
      });
    }

    // 3. 计算当前 dp[i]
    const bestPre = q.length > 0 ? dp[q[0]] : 0;
    dp[i] = bestPre + val[i];

    steps.push({
      val: [...val],
      dp: [...dp],
      curI: i,
      q: [...q],
      L,
      R,
      decision: `🎯 O(1) 瞬时状态转移：dp[${i}] = max dp[${q[0] !== undefined ? q[0] : 0}] (${bestPre}) + val[${i}] (${val[i]}) = ${dp[i]}！`,
      message: `单次状态转移完全摆脱了对窗口长度 (R - L + 1) 的线性枚举依赖，耗时严格 O(1)`,
      log: `calcDp: dp[${i}] = ${dp[i]}`,
      codeLine: lines.calcDp,
      metrics: { '当前位置 i': i, '格点权值': val[i], '最优前驱收益': bestPre, '计算结果': dp[i] },
      statusBadge: { text: `dp[${i}] = ${dp[i]}`, type: 'success' },
    });
  }

  const bestAns = dp[n - 1];

  // 终态
  steps.push({
    val: [...val],
    dp: [...dp],
    curI: n - 1,
    q: [...q],
    L,
    R,
    bestAns,
    decision: `✅ 单调队列优化 DP 执行完毕！到达终点位置的最大收益为: ${bestAns}`,
    message: `全流程总共执行 N 次入队与至多 N 次出队，总时间复杂度严格 O(N)，完美提速！`,
    log: `monotonic queue dp finished, final dp = ${bestAns}`,
    codeLine: lines.returnAns,
    metrics: { '终点最大累计收益': bestAns, '总时间复杂度': 'O(N)', '空间复杂度': 'O(N)' },
    statusBadge: { text: `最终最大收益: ${bestAns}`, type: 'success' },
  });

  return steps;
}

export const monotonicQueueDpVisualizer = registerDeclarativeAlgorithm<MonotonicQueueDpStep>({
  id: 'monotonic-queue-dp-130',
  name: '单调队列优化 DP (Class 130)',
  category: 'dynamic-programming',
  icon: '🎢',
  difficulty: 3,
  levelOrder: 130,
  learningGoal: '深刻理解双端队列维护单调性与滑动窗口极值、在 O(1) 内完成状态转移优化 O(N x K) 为 O(N) 的核心思想',
  problemHtml: ADVANCED_124_134_PROBLEMS.monotonicQueueDp.html,
  analysisHtml: ADVANCED_124_134_PROBLEMS.monotonicQueueDp.html,
  inputs: [
    {
      id: 'valList',
      label: '格点收益数组 (逗号分隔)',
      type: 'text',
      defaultValue: '0,2,-3,5,1,4,-2,6',
      placeholder: '请输入各点收益数值',
    },
    {
      id: 'L',
      label: '最小跳跃跨度 L',
      type: 'number',
      defaultValue: 1,
      min: 1,
      max: 5,
    },
    {
      id: 'R',
      label: '最大跳跃跨度 R',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 6,
    },
  ],
  codeLanguages: MONOTONIC_QUEUE_DP_CODES,
  generateSteps: (input) => {
    const raw = String(input.valList || '0,2,-3,5,1,4,-2,6');
    const val = raw.split(',').map(Number);
    const L = Math.max(1, Number(input.L) || 1);
    const R = Math.max(L, Number(input.R) || 3);
    return buildMonotonicQueueDpSteps(val, L, R);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderMonotonicQueueVisual(step.val, step.dp, step.curI, step.q, step.L, step.R)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前推进到位置</div>
            <div style="font-size: 18px; font-weight: 700; color: #4338ca;">i = ${step.curI}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前队头最优决策</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669;">${step.q.length > 0 ? `j=${step.q[0]} (dp=${step.dp[step.q[0]]})` : '暂无'}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">终点最大收益</div>
            <div style="font-size: 18px; font-weight: 700; color: #d97706;">${step.bestAns !== undefined ? step.bestAns : step.dp[step.curI]}</div>
          </div>
        </div>

        ${renderFormulaCard(
          '单调队列决策排除状态',
          `当前队列: [${step.q.join(', ')}] | 窗口 [i-${step.R}, i-${step.L}]`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
