/**
 * Class 052 Code04: 子数组的最小值之和 (Sum of Subarray Minimums / LeetCode 907)
 *
 * 核心原理：
 * 1. 贡献法：计算每个元素作为子数组最小值的次数 count = (cur - left) * (right - cur)；
 * 2. 单调栈界定辐射范围：寻找左侧严格更小 L、右侧小于等于 R；
 * 3. 一边开区间一边闭区间，彻底杜绝重复元素导致的子数组重复统计！
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../../core/input-primitives';
import { STACK_052_PROBLEMS } from './stack-052-problem-content';
import {
  SUM_SUBARRAY_MINIMUMS_CODES,
  SUM_SUBARRAY_MINIMUMS_LINES,
} from './stack-052-stage-codes';
import { SettledItem } from './stack-052-shared';

export interface SubarrayMinContribution {
  idx: number;
  val: number;
  left: number;
  right: number;
  count: number;
  contribution: number;
}

export interface SumSubarrayMinimumsStep {
  arr: number[];
  stack: number[];
  curI: number;
  popped: number | null;
  contributions: SubarrayMinContribution[];
  currentCalc: SubarrayMinContribution | null;
  totalSum: number;
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  metrics: Record<string, string | number>;
}

export function buildSumSubarrayMinimums052Steps(arr: number[]): SumSubarrayMinimumsStep[] {
  const steps: SumSubarrayMinimumsStep[] = [];
  const lines = SUM_SUBARRAY_MINIMUMS_LINES;
  const n = arr.length;
  const MOD = 1000000007;

  if (n === 0) {
    steps.push({
      arr: [],
      stack: [],
      curI: 0,
      popped: null,
      contributions: [],
      currentCalc: null,
      totalSum: 0,
      decision: '数组为空，子数组最小值之和为 0。',
      message: '输入规模 N=0。',
      log: 'empty array',
      codeLine: lines.returnAns,
      metrics: { '规模 N': 0, '总和': 0 },
    });
    return steps;
  }

  const stack: number[] = [];
  const contributions: SubarrayMinContribution[] = [];
  let totalSum = 0;

  // Step 0: 入口
  steps.push({
    arr: [...arr],
    stack: [],
    curI: -1,
    popped: null,
    contributions: [],
    currentCalc: null,
    totalSum: 0,
    decision: `主函数入口：开始计算数组 [${arr.join(', ')}] 的子数组最小值之和。`,
    message: '核心策略：从枚举子数组转向【贡献法】。利用单调递增栈求解每个元素辐射的最大开闭区间。',
    log: `enter sumSubarrayMins: n=${n}`,
    codeLine: lines.entry,
    metrics: { '规模 N': n, '当前累计和': 0, '已结算贡献': 0 },
  });

  for (let i = 0; i < n; i++) {
    const curVal = arr[i];

    // 循环比对
    steps.push({
      arr: [...arr],
      stack: [...stack],
      curI: i,
      popped: null,
      contributions: [...contributions],
      currentCalc: null,
      totalSum,
      decision: `遍历到下标 [${i}] (值=${curVal})：准备与栈顶比对。`,
      message: stack.length > 0
        ? `栈顶为 [${stack[stack.length - 1]}] (值=${arr[stack[stack.length - 1]]})。遇到小于等于当前值的破坏者将触发贡献结算。`
        : '栈为空，当前元素直接入栈。',
      log: `check i=${i} val=${curVal}`,
      codeLine: lines.whileCheck,
      metrics: { '考察下标': `[${i}]`, '考察值': curVal, '当前累计和': totalSum, '已结算数': contributions.length },
    });

    // 弹出结算
    while (stack.length > 0 && arr[stack[stack.length - 1]] >= curVal) {
      const cur = stack.pop()!;
      const curPopVal = arr[cur];
      const left = stack.length > 0 ? stack[stack.length - 1] : -1;
      const right = i;

      const leftWays = cur - left;
      const rightWays = right - cur;
      const count = leftWays * rightWays;
      const contrib = (count * curPopVal) % MOD;
      totalSum = (totalSum + contrib) % MOD;

      const currentCalc: SubarrayMinContribution = {
        idx: cur,
        val: curPopVal,
        left,
        right,
        count,
        contribution: contrib,
      };
      contributions.push(currentCalc);

      steps.push({
        arr: [...arr],
        stack: [...stack],
        curI: i,
        popped: cur,
        contributions: [...contributions],
        currentCalc,
        totalSum,
        decision: `🔥 弹出 [${cur}] (值=${curPopVal}) 结算贡献！左边界 L=${left}, 右边界 R=${right}。`,
        message: `以 arr[${cur}]=${curPopVal} 为最小值的子数组共: (${cur} - ${left}) × (${right} - ${cur}) = ${leftWays} × ${rightWays} = ${count} 个！贡献 = ${count} × ${curPopVal} = ${contrib}。累加后总和 = ${totalSum}。`,
        log: `settle min idx ${cur}: ways=${count}, contrib=${contrib}, total=${totalSum}`,
        codeLine: lines.popCalc,
        metrics: { '结算基准': `[${cur}] (${curPopVal})`, '覆盖子数组数': count, '本次贡献': contrib, '当前累计总和': totalSum },
      });
    }

    // 压栈
    stack.push(i);
    steps.push({
      arr: [...arr],
      stack: [...stack],
      curI: i,
      popped: null,
      contributions: [...contributions],
      currentCalc: null,
      totalSum,
      decision: `📥 将下标 [${i}] (值=${curVal}) 压入栈顶，维持单调递增。`,
      message: `栈内下标序列: [${stack.join(', ')}]。`,
      log: `push idx ${i} to stack`,
      codeLine: lines.push,
      metrics: { '入栈下标': `[${i}]`, '栈深': stack.length, '当前累计总和': totalSum },
    });
  }

  // 清算阶段
  if (stack.length > 0) {
    steps.push({
      arr: [...arr],
      stack: [...stack],
      curI: n,
      popped: null,
      contributions: [...contributions],
      currentCalc: null,
      totalSum,
      decision: '数组遍历完毕，进入清算阶段！右侧边界统一视为数组终点 R = N。',
      message: '栈中剩余元素在其右侧一直到数组末尾都是最小值。',
      log: 'enter clear stack phase',
      codeLine: lines.clearLoop,
      metrics: { '状态': '清算阶段', '剩余栈深': stack.length, '当前累计总和': totalSum },
    });

    while (stack.length > 0) {
      const cur = stack.pop()!;
      const curPopVal = arr[cur];
      const left = stack.length > 0 ? stack[stack.length - 1] : -1;
      const right = n;

      const leftWays = cur - left;
      const rightWays = right - cur;
      const count = leftWays * rightWays;
      const contrib = (count * curPopVal) % MOD;
      totalSum = (totalSum + contrib) % MOD;

      const currentCalc: SubarrayMinContribution = {
        idx: cur,
        val: curPopVal,
        left,
        right,
        count,
        contribution: contrib,
      };
      contributions.push(currentCalc);

      steps.push({
        arr: [...arr],
        stack: [...stack],
        curI: n,
        popped: cur,
        contributions: [...contributions],
        currentCalc,
        totalSum,
        decision: `🧹 清算弹出 [${cur}] (值=${curPopVal})：左边界 L=${left}，右侧延伸至数组末端 R=${right}。`,
        message: `子数组个数 = (${cur} - ${left}) × (${right} - ${cur}) = ${leftWays} × ${rightWays} = ${count} 个！贡献 = ${count} × ${curPopVal} = ${contrib}。累计总和 = ${totalSum}。`,
        log: `clear settle min idx ${cur}: ways=${count}, contrib=${contrib}, total=${totalSum}`,
        codeLine: lines.clearCalc,
        metrics: { '清算基准': `[${cur}] (${curPopVal})`, '覆盖子数组数': count, '本次贡献': contrib, '当前累计总和': totalSum },
      });
    }
  }

  // 终结
  steps.push({
    arr: [...arr],
    stack: [],
    curI: n,
    popped: null,
    contributions: [...contributions],
    currentCalc: null,
    totalSum,
    decision: `🎉 计算完毕！所有子数组最小值之和最终为 ${totalSum} (对 10^9 + 7 取模)。`,
    message: '开闭区间规约确保所有子数组不重不漏被其唯一最小值认领，单调栈 O(N) 优雅求解！',
    log: `sumSubarrayMins complete: ans=${totalSum}`,
    codeLine: lines.returnAns,
    metrics: { '最终结果 ans': totalSum, '结算元素总数': n, '复杂度': 'O(N)' },
  });

  return steps;
}

export function renderSumSubarrayMinimumsCanvas(container: HTMLElement, step: SumSubarrayMinimumsStep): void {
  const arr = step.arr;
  const stack = step.stack;
  const curI = step.curI;
  const n = arr.length;
  const calc = step.currentCalc;

  // 上方序列卡片
  const cardsHtml = arr
    .map((val, idx) => {
      const isCurrent = idx === curI && curI < n;
      const inStack = stack.includes(idx);
      const isPopped = idx === step.popped;
      const inRange = calc && idx > calc.left && idx < calc.right;

      let bg = '#f8fafc';
      let border = '#cbd5e1';
      let text = '#334155';

      if (isPopped) {
        bg = '#dcfce7';
        border = '#16a34a';
        text = '#15803d';
      } else if (isCurrent) {
        bg = '#ffedd5';
        border = '#ea580c';
        text = '#c2410c';
      } else if (inRange) {
        bg = '#eff6ff';
        border = '#3b82f6';
        text = '#1d4ed8';
      } else if (inStack) {
        bg = '#fef3c7';
        border = '#f59e0b';
        text = '#b45309';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 44px; flex: 1; max-width: 64px;">
          <div style="width: 100%; height: 46px; background: ${bg}; border: 2px solid ${border}; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; color: ${text}; font-family: monospace; transition: all 0.2s;">
            ${val}
          </div>
          <span style="font-size: 9px; font-weight: 700; color: ${isCurrent ? '#ea580c' : '#94a3b8'}; font-family: monospace;">
            [${idx}]
          </span>
        </div>
      `;
    })
    .join('');

  // 贡献结算表格
  const tableRowsHtml = step.contributions
    .map((c) => {
      return `
        <tr style="border-bottom: 1px solid #f1f5f9; font-size: 11px; font-family: monospace;">
          <td style="padding: 4px 8px; font-weight: 800; color: #ea580c;">[${c.idx}] (${c.val})</td>
          <td style="padding: 4px 8px; color: #0284c7;">L=${c.left}</td>
          <td style="padding: 4px 8px; color: #059669;">R=${c.right}</td>
          <td style="padding: 4px 8px; font-weight: 700;">${c.idx - c.left} × ${c.right - c.idx} = ${c.count} 个</td>
          <td style="padding: 4px 8px; font-weight: 800; color: #16a34a;">+${c.contribution}</td>
        </tr>
      `;
    })
    .join('');

  const calcBanner = calc
    ? `
      <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 6px 12px; display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-family: monospace;">
        <span style="color: #1d4ed8; font-weight: 800;">🎯 贡献公式:</span>
        <span style="color: #1e40af;">(${calc.idx} - ${calc.left}) × (${calc.right} - ${calc.idx}) × ${calc.val} = ${calc.count} × ${calc.val} = <strong>${calc.contribution}</strong></span>
        <span style="background: #2563eb; color: #fff; padding: 2px 8px; border-radius: 4px; font-weight: 800;">当前总和: ${step.totalSum}</span>
      </div>
    `
    : `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; font-size: 11px; color: #64748b; font-family: monospace; display: flex; justify-content: space-between;">
        <span>单调递增栈正在界定左右辐射边界...</span>
        <span>当前累计总和: <strong style="color: #ea580c;">${step.totalSum}</strong></span>
      </div>
    `;

  container.innerHTML = `
    <div style="width: 100%; display: flex; flex-direction: column; gap: 12px; padding: 12px; box-sizing: border-box;">
      <!-- 序列沙盘 -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 800; color: #475569;">📊 数组序列与辐射开闭区间</span>
          <span style="font-size: 10px; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 12px; font-weight: 700;">🌟 贡献法: (i - L) × (R - i) × arr[i]</span>
        </div>
        <div style="display: flex; gap: 6px; overflow-x: auto; padding: 6px 0; justify-content: space-around; align-items: center;">
          ${cardsHtml}
        </div>
        <div style="margin-top: 8px;">
          ${calcBanner}
        </div>
      </div>

      <!-- 贡献记录明细 -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; display: flex; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 800; color: #475569;">📋 各位置元素贡献明细表</span>
          <span style="font-size: 10px; color: #059669; font-weight: 700;">已结算项: ${step.contributions.length} / ${n}</span>
        </div>
        <div style="max-height: 140px; overflow-y: auto;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="border-bottom: 1.5px solid #e2e8f0; font-size: 10px; color: #64748b;">
                <th style="padding: 4px 8px;">最小值位置</th>
                <th style="padding: 4px 8px;">左边界 L</th>
                <th style="padding: 4px 8px;">右边界 R</th>
                <th style="padding: 4px 8px;">辐射子数组数量</th>
                <th style="padding: 4px 8px;">所作贡献值</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml || '<tr><td colspan="5" style="text-align:center;padding:16px;color:#94a3b8;font-size:11px;">尚无元素完成贡献结算</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}

export const sumSubarrayMinimums052Visualizer = registerDeclarativeAlgorithm<SumSubarrayMinimumsStep>({
  id: 'sum-subarray-minimums-052',
  name: '子数组的最小值之和 (Class 052 Code04)',
  category: 'monotonic-stack',
  aliases: ['sum-subarray-minimums', 'leetcode-907', 'class052-code04'],
  difficulty: 'hard',
  learningGoal: '领悟贡献法的逆向思维，掌握单调栈界定辐射范围以及开闭区间规避重复统计的精妙技巧。',
  problemContent: STACK_052_PROBLEMS.sumSubarrayMinimums052,
  codeLanguages: SUM_SUBARRAY_MINIMUMS_CODES,
  inputs: [
    {
      id: 'arr',
      label: '输入数组',
      type: 'text',
      defaultValue: '3, 1, 2, 4',
      placeholder: '逗号分隔的整数',
    },
  ],
  presets: [
    { label: '示例 1: 官方例题 [3,1,2,4]', values: { arr: '3, 1, 2, 4' } },
    { label: '示例 2: 包含重复值 [11,81,94,43,3]', values: { arr: '11, 81, 94, 43, 3' } },
    { label: '示例 3: 相同元素 [2,2,2]', values: { arr: '2, 2, 2' } },
  ],
  generateSteps: (inputs) => {
    const raw = parseNumberList(inputs.arr, '3, 1, 2, 4');
    return buildSumSubarrayMinimums052Steps(raw.length ? raw : [3, 1, 2, 4]);
  },
  renderCanvas: (container, step) => renderSumSubarrayMinimumsCanvas(container, step),
});
