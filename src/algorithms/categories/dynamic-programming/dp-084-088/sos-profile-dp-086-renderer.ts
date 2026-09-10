/**
 * Class 086: 高阶状压 DP 与 SOS DP / 子集和高维前缀和 (Sum Over Subsets)
 * N 维超立方体逐维前缀和与 O(N * 2^N) 复杂度飞跃 / CF165E
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_084_088_PROBLEMS } from './dp-084-088-problem-content';
import { SOS_DP_086_CODES, SOS_DP_086_LINES } from './dp-084-088-stage-codes';
import { Dp084Step, renderSosDpBoard } from './dp-084-088-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface SosDp086Step extends Dp084Step {
  dim: number;
  curBit: number;
  dp: number[];
  focusMask: number;
}

export function buildSosDp086Steps(): SosDp086Step[] {
  const steps: SosDp086Step[] = [];
  const lines = SOS_DP_086_LINES;

  const n = 2; // 2 维超立方体，4 个状态：00(0), 01(1), 10(2), 11(3)
  const a = [1, 2, 4, 8];

  // Step 0: 入口与初始化
  steps.push({
    dim: n,
    curBit: 0,
    dp: [...a],
    focusMask: 0,
    decision: '主函数入口：开始为长度为 4 的数组 [1, 2, 4, 8] 计算全部子集和。',
    message: '直接枚举子集需 O(3^N)；SOS DP 将二进制看作 N 维超立方体，通过逐维高维前缀和降至 O(N * 2^N)！',
    log: 'enter sumOverSubsets: n=2, a=[1, 2, 4, 8]',
    codeLine: lines.entry,
    metrics: { '维度 N': 2, '状态数': 4 },
  });

  // Step 1: 处理第 0 维 (bit 0)
  // mask=1 (01): 包含 bit 0，累加 dp[0] = dp[1] + dp[0] = 2 + 1 = 3
  // mask=3 (11): 包含 bit 0，累加 dp[2] = dp[3] + dp[2] = 8 + 4 = 12
  // dp 变为: [1, 3, 4, 12]
  const dpBit0 = [1, 3, 4, 12];
  steps.push({
    dim: n,
    curBit: 0,
    dp: dpBit0,
    focusMask: 3,
    decision: '完成第 0 维前缀和累加：所有第 0 位为 1 的掩码（01 和 11）累加其第 0 位为 0 的对应状态！',
    message: 'dp[1] 变成 1+2=3；dp[3] 变成 8+4=12。',
    log: 'dim 0 complete: dp=[1, 3, 4, 12]',
    codeLine: lines.addSubset,
    statusBadge: { text: '第 0 维完成', type: 'info' },
    metrics: { '处理维度': 'bit 0', '状态 11 子集和': 12 },
  });

  // Step 2: 处理第 1 维 (bit 1)
  // mask=2 (10): 包含 bit 1，累加 dp[0] = 4 + 1 = 5
  // mask=3 (11): 包含 bit 1，累加 dp[1] = 12 + 3 = 15
  // 最终 dp: [1, 3, 5, 15]
  // 验证：
  // 00 的子集: 00 -> 1
  // 01 的子集: 00, 01 -> 1 + 2 = 3
  // 10 的子集: 00, 10 -> 1 + 4 = 5
  // 11 的子集: 00, 01, 10, 11 -> 1 + 2 + 4 + 8 = 15! 完全精准！
  const dpBit1 = [1, 3, 5, 15];
  steps.push({
    dim: n,
    curBit: 1,
    dp: dpBit1,
    focusMask: 3,
    decision: '完成第 1 维前缀和累加：掩码 11（全集）成功汇聚全部 4 个子集之和 1 + 2 + 4 + 8 = 15！',
    message: '所有 2^N 个状态的子集和全部严格计算完毕。',
    log: 'dim 1 complete: final dp=[1, 3, 5, 15]',
    codeLine: lines.addSubset,
    statusBadge: { text: '全维前缀和就绪', type: 'success' },
    metrics: { '处理维度': 'bit 1', '全集 11 和': 15 },
  });

  // Step 3: 返回结果
  steps.push({
    dim: n,
    curBit: 1,
    dp: dpBit1,
    focusMask: 3,
    decision: 'SOS DP 计算圆满完成：返回全部子集和数组 [1, 3, 5, 15]。',
    message: '高维前缀和以 O(N * 2^N) 达成最优性能。',
    log: 'sumOverSubsets complete -> return [1, 3, 5, 15]',
    codeLine: lines.returnDp,
    statusBadge: { text: '计算完成', type: 'success' },
    metrics: { '最终结果': '[1, 3, 5, 15]', '复杂度': 'O(N * 2^N)' },
  });

  return steps;
}

export const sosDp086Visualizer = registerDeclarativeAlgorithm<SosDp086Step>({
  id: 'sos-profile-dp-086',
  name: '高阶状压 DP 与 SOS 高维前缀和 (Class 086)',
  category: 'dynamic-programming',
  difficulty: 'hard',
  problemContent: DP_084_088_PROBLEMS.sosDp086,
  sourceCodes: SOS_DP_086_CODES,
  generateSteps: buildSosDp086Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderSosDpBoard(
          step.dim,
          step.curBit,
          step.dp,
          step.focusMask
        )}
        ${renderFormulaCard(
          'SOS DP 高维前缀和递推方程',
          'dp[mask] \\mathrel{+}= dp[mask \\oplus 2^i] \\quad (\\text{当 } mask \\text{ 的第 } i \\text{ 位为 } 1)',
          '将掩码状态空间视作 $N$ 维布尔超立方体。外层循环枚举超立方体的每一个维度 $i \\in [0, N-1]$，内层循环对该维度做一次标准的一维前缀和，从而将全部 $2^N$ 个状态的子集和计算复杂度从 $O(3^N)$ 优化至 $O(N \\cdot 2^N)$。'
        )}
      </div>
    `;
  },
});
