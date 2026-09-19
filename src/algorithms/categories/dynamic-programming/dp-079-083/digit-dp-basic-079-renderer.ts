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

export function buildDigitDp079Steps(input?: { n?: number } | number): DigitDp079Step[] {
  const steps: DigitDp079Step[] = [];
  const lines = DIGIT_DP_079_LINES;

  let n = 13;
  if (typeof input === 'number') {
    n = input;
  } else if (input && typeof input.n === 'number') {
    n = input.n;
  }
  const s = String(Math.max(1, n));
  const digits = s.split('').map(Number);
  const len = digits.length;

  // memo[idx][cnt]
  const memo: number[][] = Array.from({ length: len }, () => new Array(len + 1).fill(-1));

  // Step 0: 入口帧
  steps.push({
    digits,
    curIdx: -1,
    curDigit: -1,
    isLimit: true,
    cnt1: 0,
    memoSummary: '初始化 memo 记忆化数组为 -1',
    decision: `主函数入口：开始统计 1 到 ${n} 中数字 1 出现的总次数。`,
    message: `将 N=${n} 拆分为 ${len} 个数位 [${digits.join(', ')}]，从最高位 idx=0 开始记忆化深度优先搜索。`,
    log: `enter countDigitOne: N=${n}, digits=[${digits.join(', ')}]`,
    codeLine: lines.entry,
    metrics: { '上界 N': n, '数位长度': len },
  });

  // Step 1: 初始化 memo
  steps.push({
    digits,
    curIdx: -1,
    curDigit: -1,
    isLimit: true,
    cnt1: 0,
    memoSummary: `初始化 memo[${len}][${len + 1}] 缓存表`,
    decision: `为数位深度 ${len} 准备记忆化数组，避免重复遍历重叠子状态。`,
    message: '只有在解除上界限制 (isLimit=false) 时，子问题的解才具有普适性，可安全缓存。',
    log: 'memo array initialized with -1',
    codeLine: lines.initMemo,
    metrics: { '上界 N': n, '缓存维度': `${len}x${len + 1}` },
  });

  function f(idx: number, cnt: number, isLimit: boolean): number {
    if (idx === len) {
      steps.push({
        digits,
        curIdx: idx - 1,
        curDigit: -1,
        isLimit,
        cnt1: cnt,
        memoSummary: `递归触底：当前有效前缀产生 ${cnt} 个数字 1`,
        decision: `数位构造完成：到达末尾 idx=${idx}，当前路径累计包含 ${cnt} 个数字 1。`,
        message: '触底返回，将该路径的计数值回溯累加至父调用栈。',
        log: `base case reached: idx=${idx}, cnt=${cnt}`,
        codeLine: lines.baseCase,
        statusBadge: { text: `触底返回 cnt=${cnt}`, type: 'info' },
        metrics: { '当前位置': idx, '累计贡献': cnt },
      });
      return cnt;
    }

    if (!isLimit && memo[idx]![cnt] !== -1) {
      const cached = memo[idx]![cnt]!;
      steps.push({
        digits,
        curIdx: idx,
        curDigit: -1,
        isLimit,
        cnt1: cnt,
        memoSummary: `记忆化命中：memo[${idx}][${cnt}] = ${cached}`,
        decision: `状态复用：当前自由态 (idx=${idx}, cnt=${cnt}) 已在 memo 中缓存，结果为 ${cached}。`,
        message: '剪枝成功：跳过后续所有重复子分支，实现对数级时间复杂度！',
        log: `memo hit: memo[${idx}][${cnt}]=${cached}`,
        codeLine: lines.memoHit,
        statusBadge: { text: `缓存命中: ${cached}`, type: 'success' },
        metrics: { '当前位置': idx, '缓存命中值': cached },
      });
      return cached;
    }

    const up = isLimit ? digits[idx]! : 9;
    steps.push({
      digits,
      curIdx: idx,
      curDigit: -1,
      isLimit,
      cnt1: cnt,
      memoSummary: `决策第 ${idx} 位：${isLimit ? `受限上界 0..${up}` : '自由填充 0..9'}`,
      decision: `考察第 ${idx} 位：当前 isLimit=${isLimit}，可选数位范围为 [0 .. ${up}]。`,
      message: isLimit ? `贴紧输入上界数位 ${up}，若填入 ${up} 则下一位继续受限。` : '已脱离上界，当前位可任意填入 0 到 9。',
      log: `idx=${idx}, isLimit=${isLimit}, up=${up}`,
      codeLine: lines.calcUpBound,
      statusBadge: { text: `第 ${idx} 位可选 0..${up}`, type: 'info' },
      metrics: { '当前位': idx, '可选上界': up },
    });

    let ans = 0;
    for (let d = 0; d <= up; d++) {
      const nextLimit = isLimit && d === up;
      const nextCnt = cnt + (d === 1 ? 1 : 0);
      steps.push({
        digits,
        curIdx: idx,
        curDigit: d,
        isLimit: nextLimit,
        cnt1: nextCnt,
        memoSummary: `第 ${idx} 位填入 ${d}，深入下一位`,
        decision: `在第 ${idx} 位尝试填入数字 ${d}：${d === 1 ? '🎉 命中数字 1，计数 +1' : '未命中数字 1'}。`,
        message: `下一位限制状态转移为 isLimit = ${nextLimit}，递归深入 idx=${idx + 1}。`,
        log: `idx=${idx}, choose d=${d}, nextLimit=${nextLimit}`,
        codeLine: lines.recurseLoop,
        statusBadge: { text: `填入 ${d}`, type: d === 1 ? 'success' : 'info' },
        metrics: { '当前位': idx, '选择数位': d, '是否受限': nextLimit ? '是' : '否' },
      });

      ans += f(idx + 1, nextCnt, nextLimit);
    }

    if (!isLimit) {
      memo[idx]![cnt] = ans;
      steps.push({
        digits,
        curIdx: idx,
        curDigit: -1,
        isLimit,
        cnt1: cnt,
        memoSummary: `写入缓存 memo[${idx}][${cnt}] = ${ans}`,
        decision: `将自由子状态 (idx=${idx}, cnt=${cnt}) 的汇总答案 ${ans} 写入 memo 缓存。`,
        message: '该状态下的子树方案数已完全求出，后续遇到同状态将直接 O(1) 返回。',
        log: `memo save: memo[${idx}][${cnt}]=${ans}`,
        codeLine: lines.memoSave,
        statusBadge: { text: `缓存写入: ${ans}`, type: 'info' },
        metrics: { '写入位置': `[${idx}][${cnt}]`, '缓存值': ans },
      });
    }

    return ans;
  }

  const totalAns = f(0, 0, true);

  // 终结汇总帧
  steps.push({
    digits,
    curIdx: len - 1,
    curDigit: -1,
    isLimit: false,
    cnt1: totalAns,
    memoSummary: `搜索完成，全范围 1 到 ${n} 中数字 1 总出现次数: ${totalAns}`,
    decision: `全量数位搜索终结：在 1 到 ${n} 的所有整数中，数字 1 总共出现了 ${totalAns} 次！`,
    message: '数位 DP 借助对数级数位深度与状态记忆化，将指数级枚举完全转化为多项式级高效递推。',
    log: `countDigitOne complete -> return ${totalAns}`,
    codeLine: lines.baseCase,
    statusBadge: { text: `最终答案: ${totalAns}`, type: 'success' },
    metrics: { '最终答案': totalAns, '时间复杂度': 'O(log10 N)' },
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
