/**
 * 左程云算法通关课 Class 066: 丑数 II (Ugly Number II · LeetCode 264)
 * 三指针动态规划模拟多路有序链表归并
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_066_PROBLEMS } from './dp-066-problem-content';
import {
  UGLY_NUMBER_II_066_CODES,
  UGLY_NUMBER_II_066_LINES,
} from './dp-066-stage-codes';
import { Dp066StepBase, renderThreePointerUglyBar } from './dp-066-shared';

export interface UglyNumberIIStep extends Dp066StepBase {
  n: number;
  dp: number[];
  i2: number;
  i3: number;
  i5: number;
  candA?: number;
  candB?: number;
  candC?: number;
  currentUgly?: number;
  targetStepI?: number;
}

const PRESETS_DATA: Record<string, number> = {
  n_10: 10,
  n_15: 15,
  n_20: 20,
  n_1: 1,
};

export function buildUglyNumberII066Steps(presetKey: string = 'n_10'): UglyNumberIIStep[] {
  const n = PRESETS_DATA[presetKey] || 10;
  const steps: UglyNumberIIStep[] = [];
  const lines = UGLY_NUMBER_II_066_LINES;

  const dp: number[] = new Array(n + 1).fill(0);
  dp[1] = 1;
  let i2 = 1;
  let i3 = 1;
  let i5 = 1;

  // Step 0: 入口纯净帧
  steps.push({
    n,
    dp: [0, 1],
    i2,
    i3,
    i5,
    currentUgly: 1,
    line: lines.entry.javascript,
    codeLine: lines.entry,
    message: `🚀 初始化丑数 II：求第 ${n} 个只包含质因数 2、3、5 的正整数。`,
    explanation: '左神点拨：每一个丑数都是由前置某个丑数乘以 2、3 或 5 得到。相当于三个有序链表的动态归并过程。',
    metrics: { '目标序号 n': n, '当前阶段': '初始化', '第一个丑数': 1 },
  });

  // 特殊情况处理 n = 1
  if (n === 1) {
    steps.push({
      n,
      dp: [0, 1],
      i2,
      i3,
      i5,
      currentUgly: 1,
      line: lines.returnAns.javascript,
      codeLine: lines.returnAns,
      message: `🎉 第 1 个丑数直接返回 1！`,
      explanation: '基准情况，第 1 个丑数按定义恒为 1。',
      metrics: { '最终第 n 个丑数': 1, '状态': '求解完毕' },
    });
    return steps;
  }

  // Step 1: 初始化三个指针
  steps.push({
    n,
    dp: [0, 1],
    i2,
    i3,
    i5,
    currentUgly: 1,
    line: lines.initPointers.javascript,
    codeLine: lines.initPointers,
    message: `📊 设定基准：dp[1] = 1。三路队列指针 i2 = 1, i3 = 1, i5 = 1，均从第一个丑数开始候乘。`,
    explanation: 'i2 指向下一个需要乘以 2 的丑数下标，i3 指向需要乘以 3 的下标，i5 指向乘以 5 的下标。',
    metrics: { 'i2 指针': 1, 'i3 指针': 1, 'i5 指针': 1, '已生成丑数': 1 },
  });

  // 主循环归并计算第 2 ~ n 个丑数
  for (let i = 2; i <= n; i++) {
    const candA = dp[i2] * 2;
    const candB = dp[i3] * 3;
    const candC = dp[i5] * 5;

    // 步骤：计算三个候选值
    steps.push({
      n,
      dp: dp.slice(0, i),
      i2,
      i3,
      i5,
      candA,
      candB,
      candC,
      currentUgly: dp[i - 1],
      targetStepI: i,
      line: lines.computeMultiples.javascript,
      codeLine: lines.computeMultiples,
      message: `🔢 考察第 #${i} 个丑数：三路候选值为 2×dp[${i2}]=${candA}，3×dp[${i3}]=${candB}，5×dp[${i5}]=${candC}。`,
      explanation: '取三路候选值中的最小值作为下一个丑数，确保全局严格升序。',
      metrics: {
        '2路候选': `dp[${i2}]*2=${candA}`,
        '3路候选': `dp[${i3}]*3=${candB}`,
        '5路候选': `dp[${i5}]*5=${candC}`,
      },
    });

    const cur = Math.min(candA, candB, candC);
    dp[i] = cur;

    const matchedPointers: string[] = [];
    if (cur === candA) {
      i2++;
      matchedPointers.push(`i2 前移至 ${i2}`);
    }
    if (cur === candB) {
      i3++;
      matchedPointers.push(`i3 前移至 ${i3}`);
    }
    if (cur === candC) {
      i5++;
      matchedPointers.push(`i5 前移至 ${i5}`);
    }

    // 步骤：确定最小值并前移指针去重
    steps.push({
      n,
      dp: dp.slice(0, i + 1),
      i2,
      i3,
      i5,
      candA,
      candB,
      candC,
      currentUgly: cur,
      targetStepI: i,
      line: lines.saveDp.javascript,
      codeLine: lines.saveDp,
      message: `✅ 第 #${i} 个丑数确定为 ${cur} (min(${candA}, ${candB}, ${candC}))！${matchedPointers.join('，')} 消除重复项。`,
      explanation: '若多个质因数相乘得到同一数字（如 6 = 2×3 = 3×2），相关指针同时后移一位，天然去重。',
      metrics: {
        '最新丑数': cur,
        '当前序号': `#${i}`,
        '指针状态': `i2=${i2}, i3=${i3}, i5=${i5}`,
      },
    });
  }

  // 终点帧：返回 dp[n]
  steps.push({
    n,
    dp: [...dp],
    i2,
    i3,
    i5,
    currentUgly: dp[n],
    targetStepI: n,
    line: lines.returnAns.javascript,
    codeLine: lines.returnAns,
    message: `🎉 三指针归并完成！第 ${n} 个丑数即为 dp[${n}] = ${dp[n]}！`,
    explanation: '全过程时间复杂度 O(N)，仅维护 3 个整数指针与 1 个长度为 N 的有序数组。',
    metrics: { '最终第 n 个丑数': dp[n], '目标序号 n': n, '状态': '求解完毕' },
  });

  return steps;
}

registerDeclarativeAlgorithm({
  id: 'ugly-number-ii-066',
  name: '丑数 II (三指针归并DP)',
  category: 'dynamic-programming',
  difficulty: '中等',
  description: '左程云 Class 066 Code05：三指针一维动态规划模拟多路有序链表合并，质因数2/3/5同步递增去重 (LeetCode 264)',
  aliases: ['class066-code05', 'ugly-number-264', 'leetcode-264', 'ugly-number-ii-class066'],
  problemHtml: DP_066_PROBLEMS['ugly-number-ii-066'].problemHtml,
  analysisHtml: DP_066_PROBLEMS['ugly-number-ii-066'].complexityHtml,
  codeLanguages: UGLY_NUMBER_II_066_CODES,
  inputs: [
    {
      id: 'preset',
      label: '用例选择',
      type: 'select',
      defaultValue: 'n_10',
      options: [
        { label: '第 10 个丑数 (值: 12)', value: 'n_10' },
        { label: '第 15 个丑数 (值: 24)', value: 'n_15' },
        { label: '第 20 个丑数 (值: 36)', value: 'n_20' },
        { label: '第 1 个丑数 (边界: 1)', value: 'n_1' },
      ],
    },
  ],
  presets: [
    { label: '第 10 个丑数 (值: 12)', values: { preset: 'n_10' } },
    { label: '第 15 个丑数 (值: 24)', values: { preset: 'n_15' } },
    { label: '第 20 个丑数 (值: 36)', values: { preset: 'n_20' } },
    { label: '第 1 个丑数 (边界: 1)', values: { preset: 'n_1' } },
  ],
  generateSteps: (inputs: Record<string, any>) => buildUglyNumberII066Steps(inputs?.preset),
  renderCanvas: (container: HTMLElement, step: UglyNumberIIStep) => {
    const { dp, i2, i3, i5, candA = 0, candB = 0, candC = 0, currentUgly = 1 } = step;

    container.innerHTML = renderThreePointerUglyBar({
      dp,
      i2,
      i3,
      i5,
      candA,
      candB,
      candC,
      currentUgly,
    });
  },
});
