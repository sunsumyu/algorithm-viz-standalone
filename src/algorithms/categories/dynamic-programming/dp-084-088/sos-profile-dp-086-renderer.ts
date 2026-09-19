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

export function buildSosDp086Steps(input?: { a?: number[]; n?: number } | number[]): SosDp086Step[] {
  const steps: SosDp086Step[] = [];
  const lines = SOS_DP_086_LINES;

  let rawA = [1, 2, 4, 8];
  let n = 2;
  if (Array.isArray(input)) {
    rawA = input;
    n = Math.round(Math.log2(rawA.length)) || 2;
  } else if (input) {
    if (Array.isArray(input.a)) rawA = input.a;
    if (typeof input.n === 'number') n = input.n;
  }
  n = Math.max(1, Math.min(4, n));
  const total = 1 << n;
  const a = rawA.slice(0, total);
  while (a.length < total) a.push(0);

  const dp = [...a];

  // Step 0: 入口与初始化
  steps.push({
    dim: n,
    curBit: 0,
    dp: [...dp],
    focusMask: 0,
    decision: `主函数入口：开始为长度为 ${total} 的数组 [${a.join(', ')}] 计算全量子集和。`,
    message: '直接枚举子集需 O(3^N)；SOS DP 将二进制看作 N 维超立方体，通过逐维高维前缀和降至 O(N * 2^N)！',
    log: `enter sumOverSubsets: n=${n}, a=[${a.join(', ')}]`,
    codeLine: lines.entry,
    metrics: { '维度 N': n, '状态总数': total },
  });

  // Step 1: 拷贝初始数组
  steps.push({
    dim: n,
    curBit: 0,
    dp: [...dp],
    focusMask: 0,
    decision: `初始化 DP 数组：复制输入数组 a 到 dp，初始状态 dp[mask] = a[mask]。`,
    message: `dp[mask] 初始为仅包含自身元素的子集值。后续每经过一个维度的前缀和，dp[mask] 将汇入该维度翻转的所有子集。`,
    log: `init dp: dp=[${dp.join(', ')}]`,
    codeLine: lines.initDp,
    metrics: { '当前状态': '初始复制就绪' },
  });

  // 逐维高维前缀和
  for (let i = 0; i < n; i++) {
    steps.push({
      dim: n,
      curBit: i,
      dp: [...dp],
      focusMask: 1 << i,
      decision: `开始处理第 ${i} 维 (bit ${i})：枚举所有包含第 ${i} 位的状态，汇入第 ${i} 位为 0 的对应子集。`,
      message: `高维前缀和核心：固定前 i-1 维已求和的超平面，在第 i 维方向上执行一次标准一维前缀和。`,
      log: `start dimension loop: dim i = ${i}`,
      codeLine: lines.dimLoop,
      statusBadge: { text: `枚举第 ${i} 维`, type: 'info' },
      metrics: { '当前处理维度': `bit ${i}` },
    });

    for (let mask = 0; mask < total; mask++) {
      if ((mask & (1 << i)) !== 0) {
        const prevMask = mask ^ (1 << i);
        const addedVal = dp[prevMask]!;
        const beforeVal = dp[mask]!;

        // 位检查步骤
        steps.push({
          dim: n,
          curBit: i,
          dp: [...dp],
          focusMask: mask,
          decision: `检查状态 mask = ${mask.toString(2).padStart(n, '0')} (${mask})：包含第 ${i} 位 (值为 1)。`,
          message: `由于 mask 包含 bit ${i}，其子集中必然包含第 ${i} 位替换为 0 的对应掩码 ${prevMask.toString(2).padStart(n, '0')} (${prevMask})。`,
          log: `bitCheck: mask ${mask.toString(2).padStart(n, '0')} has bit ${i} -> prevMask ${prevMask.toString(2).padStart(n, '0')}`,
          codeLine: lines.bitCheck,
          metrics: { '当前掩码': mask, '前驱掩码': prevMask },
        });

        // 累加子集和
        dp[mask] += addedVal;

        steps.push({
          dim: n,
          curBit: i,
          dp: [...dp],
          focusMask: mask,
          decision: `高维前缀累加：dp[${mask}] (${beforeVal}) += dp[${prevMask}] (${addedVal}) -> 最新子集和为 ${dp[mask]}！`,
          message: `超立方体前缀和：将子集状态 ${prevMask} 的累积和注入状态 ${mask}，完成第 ${i} 维的投影合并。`,
          log: `addSubset: dp[${mask}] += dp[${prevMask}] (${addedVal}) = ${dp[mask]}`,
          codeLine: lines.addSubset,
          statusBadge: { text: `dp[${mask}] = ${dp[mask]}`, type: 'success' },
          metrics: { '掩码': mask, '累加后子集和': dp[mask] },
        });
      }
    }
  }

  // 终结返回
  steps.push({
    dim: n,
    curBit: n - 1,
    dp: [...dp],
    focusMask: total - 1,
    decision: `SOS DP 逐维前缀和全部完成：所有 2^N = ${total} 个掩码的全部子集和计算就绪！`,
    message: `高维前缀和以 O(N * 2^N) 时间复杂度取代传统的 O(3^N) 子集枚举，全集 mask=${(total - 1).toString(2).padStart(n, '0')} 最终和为 ${dp[total - 1]}。`,
    log: `sumOverSubsets complete -> return [${dp.join(', ')}]`,
    codeLine: lines.returnDp,
    statusBadge: { text: '全维前缀和完成', type: 'success' },
    metrics: { '全集子集和': dp[total - 1], '复杂度': `O(${n} * 2^${n})` },
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
