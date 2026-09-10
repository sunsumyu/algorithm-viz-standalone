/**
 * Class 079: 数位 DP 基础模型 (Digit DP)
 * 数位拆分与记忆化递归树 / LeetCode 233
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_079_083_PROBLEMS } from './dp-079-083-problem-content';
import { DIGIT_DP_079_CODES, DIGIT_DP_079_LINES } from './dp-079-083-stage-codes';
import { Dp079Step, renderDigitDpBoard } from './dp-079-083-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface DigitDp079Step extends Dp079Step {
  digits: number[];
  curIdx: number;
  curDigit: number;
  isLimit: boolean;
  cnt1: number;
  memoSummary: string;
}

export function buildDigitDp079Steps(): DigitDp079Step[] {
  const steps: DigitDp079Step[] = [];
  const lines = DIGIT_DP_079_LINES;

  const digits = [1, 3]; // N = 13
  // 1 ~ 13: 包含数字 1 的有 1, 10, 11(2个), 12, 13 -> 1 共出现 6 次

  // Step 0: 入口帧
  steps.push({
    digits,
    curIdx: -1,
    curDigit: -1,
    isLimit: true,
    cnt1: 0,
    memoSummary: '初始化 memo 记忆化数组为 -1',
    decision: '主函数入口：开始统计 1 到 13 中数字 1 出现的总次数。',
    message: '将 N=13 拆分为数位 [1, 3]，从最高位 idx=0 开始记忆化深度优先搜索。',
    log: 'enter countDigitOne: N=13, digits=[1, 3]',
    codeLine: lines.entry,
    metrics: { '上界 N': 13, '数位长度': 2 },
  });

  // Step 1: 考察最高位 (idx=0)
  steps.push({
    digits,
    curIdx: 0,
    curDigit: 0,
    isLimit: true,
    cnt1: 0,
    memoSummary: '当前贴着上界 (isLimit=true)，当前位可选 [0, 1]',
    decision: '决策第 0 位（最高位）：由于 isLimit=true，只能填 0 或 1。',
    message: '分支 1：最高位填 0，下一位不受上界限制；分支 2：最高位填 1，下一位仍受上界限制。',
    log: 'idx=0, up=1: explore d=0 and d=1',
    codeLine: lines.calcUpBound,
    statusBadge: { text: '决策最高位', type: 'info' },
    metrics: { '当前位': 0, '可选范围': '0..1' },
  });

  // Step 2: 递归分支 d=0 -> 考察第 1 位 (自由态)
  steps.push({
    digits,
    curIdx: 1,
    curDigit: 1,
    isLimit: false,
    cnt1: 1,
    memoSummary: '探索最高位为 0 时：第 1 位自由填 0..9，命中 d=1 时贡献 1 次',
    decision: '最高位为 0，次位填 1（产生数字 1）：贡献 1 次！',
    message: '数字 1 的出现次数 cnt1 累加为 1。',
    log: 'idx=1, isLimit=false: number 1 generated',
    codeLine: lines.recurseLoop,
    statusBadge: { text: '命中数字 1', type: 'success' },
    metrics: { '当前位': 1, '产生数字': 1, '累计 1': 1 },
  });

  // Step 3: 递归分支 d=1 -> 考察第 1 位 (贴紧上界 3)
  // 10, 11(两个1), 12, 13
  steps.push({
    digits,
    curIdx: 1,
    curDigit: 1,
    isLimit: true,
    cnt1: 5,
    memoSummary: '最高位填 1（贡献 1 次基础权重），次位可选 0..3：共贡献 5 次！',
    decision: '最高位填 1：产生 10(1次), 11(2次), 12(1次), 13(1次)，此分支累计贡献 5 次数字 1！',
    message: '各分支独立计数，状态空间由指数级急剧收敛为 O(Len * States)。',
    log: 'idx=1, isLimit=true, d in 0..3: branch sum=5',
    codeLine: lines.recurseLoop,
    statusBadge: { text: '分支累计 5', type: 'info' },
    metrics: { '当前分支贡献': 5, '累计': 6 },
  });

  // Step 4: 记忆化与全局汇总
  steps.push({
    digits,
    curIdx: 1,
    curDigit: -1,
    isLimit: false,
    cnt1: 6,
    memoSummary: '记忆化写入完成，全局答案 6 次',
    decision: '全量数位搜索终结：1 到 13 中数字 1 总共出现了 6 次！',
    message: '数位 DP 借助对数级的数位深度，将枚举复杂度由 O(N) 压缩至 O(log10 N)。',
    log: 'countDigitOne complete -> return 6',
    codeLine: lines.baseCase,
    statusBadge: { text: '计算完成: 6', type: 'success' },
    metrics: { '最终答案': 6, '复杂度': 'O(log N)' },
  });

  return steps;
}

export const digitDp079Visualizer = registerDeclarativeAlgorithm<DigitDp079Step>({
  id: 'digit-dp-basic-079',
  name: '数位 DP 基础模型 (Class 079)',
  category: 'dynamic-programming',
  difficulty: 'hard',
  problemContent: DP_079_083_PROBLEMS.digitDp079,
  sourceCodes: DIGIT_DP_079_CODES,
  generateSteps: buildDigitDp079Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderDigitDpBoard(
          step.digits,
          step.curIdx,
          step.curDigit,
          step.isLimit,
          step.cnt1,
          step.memoSummary
        )}
        ${renderFormulaCard(
          '数位 DP 状态转移与记忆化定理',
          'f(\\text{idx}, \\text{cnt}, \\text{isLimit}) = \\sum_{d=0}^{\\text{up}} f(\\text{idx}+1, \\text{cnt} + [d = 1], \\text{isLimit} \\land [d = \\text{up}])',
          '仅当 $\\text{isLimit} = \\text{false}$ 且无前导零约束时，子问题的解与上界无关，可安全写入 $\\text{memo}[\\text{idx}][\\text{cnt}]$ 避免指数级重复搜索。'
        )}
      </div>
    `;
  },
});
