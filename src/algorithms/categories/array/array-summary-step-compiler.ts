/**
 * 数组专题总结篇 — 步进推演编译器
 * 系统回顾数组专题所有核心技巧：双指针、二分、滑动窗口、前缀和、模拟边界等
 */

import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface ASStep {
  section:
    | 'intro'
    | 'basics'
    | 'two-pointer'
    | 'binary-search'
    | 'prefix-sum'
    | 'matrix'
    | 'patterns'
    | 'done';
  index: number;
  message: string;
  log: string;
  codeLine: HighlightTarget;
  technique: string;
  problems: string[];
  metrics?: Record<string, string>;
}

export function buildArraySummarySteps(): ASStep[] {
  const steps: ASStep[] = [];

  const lines = {
    intro: 1,
    basics: 1,
    twoPointer: [2, 3, 4],
    binarySearch: 5,
    prefixSum: [6, 7],
    matrix: 8,
    done: 1,
  };

  // 0. Intro
  steps.push({
    section: 'intro',
    index: 0,
    message: '欢迎来到数组专题总结篇！我们将系统梳理数组 6 大核心解题范式。',
    log: '📝 数组专题回顾开始',
    codeLine: lines.intro,
    technique: '全景导读',
    problems: ['数组理论基础', '移除元素', '有序数组平方', '最小子数组', '螺旋矩阵', '区间和'],
  });

  // 1. Basics
  steps.push({
    section: 'basics',
    index: 1,
    message: '基础操作：数组连续内存物理地址直接寻址使得下标访问为 O(1)，但搜索、插入和删除需要 O(n)。',
    log: '📦 基础操作：访问 O(1)，搜索/插入/删除 O(n)',
    codeLine: lines.basics,
    technique: '连续内存寻址',
    problems: ['数组理论基础'],
  });

  // 2. Two-pointer
  steps.push({
    section: 'two-pointer',
    index: 2,
    message: '双指针法分为：①快慢双指针（原地修改）；②首尾对撞双指针（有序两端归并）；③滑动窗口（连续子数组最值）。',
    log: '👆👆 双指针三剑客：快慢 / 对撞 / 滑动窗口',
    codeLine: lines.twoPointer,
    technique: '双指针三剑客',
    problems: ['LC 27 移除元素', 'LC 977 有序数组平方', 'LC 209 长度最小子数组'],
  });

  // 3. Binary search
  steps.push({
    section: 'binary-search',
    index: 3,
    message: '二分查找：有序数组的绝对检索利器，掌握左闭右闭 [left, right] 与左闭右开 [left, right) 的循环不变量。',
    log: '🎯 二分查找：区间开闭与循环不变量',
    codeLine: lines.binarySearch,
    technique: '二分查找',
    problems: ['LC 704 二分查找', 'LC 35 搜索插入位置'],
  });

  // 4. Prefix sum
  steps.push({
    section: 'prefix-sum',
    index: 4,
    message: '前缀和：以空间换时间，O(n) 预处理 prefix 数组，O(1) 瞬时响应一维区间求和与二维子矩阵求和。',
    log: '➕ 前缀和：一维差分与二维容斥原理',
    codeLine: lines.prefixSum,
    technique: '前缀和差分与容斥',
    problems: ['Kama 58 区间和', 'Kama 44 购买土地'],
  });

  // 5. Matrix
  steps.push({
    section: 'matrix',
    index: 5,
    message: '模拟行为：螺旋矩阵等几何模拟问题，核心在于牢牢守住转折点定义，四边界 (top, bottom, left, right) 顺时针收缩。',
    log: '🌀 模拟行为：四边界顺时针收缩',
    codeLine: lines.matrix,
    technique: '四边界模拟',
    problems: ['LC 59 螺旋矩阵 II', 'LC 54 螺旋矩阵'],
  });

  // 6. Done
  steps.push({
    section: 'done',
    index: 6,
    message: '🎉 恭喜！数组专题 6 大核心解题范式已全部梳理完毕，你已具备扎实的数组解题功底！',
    log: '🏆 数组专题总结完成',
    codeLine: lines.done,
    technique: '数组通关',
    problems: ['全套数组经典题目'],
  });

  return steps;
}

export const TOPIC_NAMES: Record<string, string> = {
  intro: '全景导读',
  basics: '基础理论',
  'two-pointer': '双指针三剑客',
  'binary-search': '二分查找',
  'prefix-sum': '前缀和差分',
  matrix: '螺旋模拟',
  patterns: '总结升华',
  done: '通关大吉',
};

export function withMetrics(steps: ASStep[]): ASStep[] {
  return steps.map((s) => ({
    ...s,
    metrics: {
      topic: TOPIC_NAMES[s.section] || s.section,
      trick: s.technique,
      problems: `${s.problems.length} 个经典例题`,
    },
  }));
}
