/**
 * Class 107: 01-Trie 与异或最大值 (01-Trie Max XOR)
 * 经典高频权威：LeetCode 421 / 洛谷 P4551 / LeetCode 1707
 * 架构规范：纯领域适配器 (Thin Domain Adapter, LOC < 120)
 * 核心推演委托给 BinaryTrieStepCompiler，视觉呈现委托给 TrieCanvasAdapter
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  TrieCanvasAdapter,
} from '../../../core/renderers/adapters/trie-canvas-adapter';
import {
  BinaryTrieStepCompiler,
  BinaryTrieStep,
} from '../../../core/renderers/adapters/trie-step-compiler';
import { TRIE_XOR_107_PROBLEM_HTML } from './trie-xor-max-107-problem-content';
import {
  TRIE_XOR_STAGE1_CODES,
  TRIE_XOR_STAGE2_CODES,
  TRIE_XOR_STAGE3_CODES,
} from './trie-xor-max-107-stage-codes';

// 兼容既有门禁与外部引用的导出接口
export type Trie107Step = BinaryTrieStep;
export const buildTrieXorMaxSteps = BinaryTrieStepCompiler.compileTwoNumbersMaxXorSteps;
export const buildStage2StaticSteps = BinaryTrieStepCompiler.compileStaticArraySteps;
export const buildStage3SubarrayXorSteps = BinaryTrieStepCompiler.compileSubarrayMaxXorSteps;

export const TRIE_XOR_CODES: Record<string, string> = {
  java: TRIE_XOR_STAGE1_CODES.java.join('\n'),
  cpp: TRIE_XOR_STAGE1_CODES.cpp.join('\n'),
  python: TRIE_XOR_STAGE1_CODES.python.join('\n'),
  javascript: TRIE_XOR_STAGE1_CODES.javascript.join('\n'),
  typescript: TRIE_XOR_STAGE1_CODES.javascript.join('\n'),
};

export const TRIE_STAGE2_STATIC_CODES: Record<string, string> = {
  java: TRIE_XOR_STAGE2_CODES.java.join('\n'),
  cpp: TRIE_XOR_STAGE2_CODES.cpp.join('\n'),
  python: TRIE_XOR_STAGE2_CODES.python.join('\n'),
  javascript: TRIE_XOR_STAGE2_CODES.javascript.join('\n'),
  typescript: TRIE_XOR_STAGE2_CODES.javascript.join('\n'),
};

export const TRIE_STAGE3_SUBARRAY_CODES: Record<string, string> = {
  java: TRIE_XOR_STAGE3_CODES.java.join('\n'),
  cpp: TRIE_XOR_STAGE3_CODES.cpp.join('\n'),
  python: TRIE_XOR_STAGE3_CODES.python.join('\n'),
  javascript: TRIE_XOR_STAGE3_CODES.javascript.join('\n'),
  typescript: TRIE_XOR_STAGE3_CODES.javascript.join('\n'),
};

export const trieXorMaxVisualizer = registerDeclarativeAlgorithm<BinaryTrieStep>({
  id: 'trie-xor-max-107',
  name: '01-Trie 与异或最大值 (Class 107)',
  aliases: ['class107-code01', 'trie-xor-max', 'trie-xor-max-107', 'maximum-xor', 'leetcode-421', 'luogu-p4551'],
  category: 'tree',
  icon: '🌲',
  difficulty: 3,
  levelOrder: 107,
  learningGoal: '掌握 01-Trie 字典树对二进制数逐位构建、高位贪心走对偶分支达到 O(N * 32) 极速求最大异或和',
  problemHtml: TRIE_XOR_107_PROBLEM_HTML,
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 两数最大异或 (LeetCode 421)',
      shortName: '动态两数异或',
      card2Title: '01-Trie 拓扑构建与对偶分支决策',
      card2Desc: '经典动态 01-Trie 逐位构建与贪心探索对偶分支，达成 O(31N) 极速两数最大异或值',
      codeLanguages: TRIE_XOR_CODES,
      generateSteps: (inputs) => {
        const raw = String(inputs?.nums || '3, 10, 5, 25, 2, 8');
        const nums = raw.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
        return BinaryTrieStepCompiler.compileTwoNumbersMaxXorSteps(nums.length > 0 ? nums : [3, 10, 5, 25, 2, 8], 5);
      },
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 竞赛静态连续数组 (tree[N][2])',
      shortName: '静态连续数组',
      card2Title: '静态内存映射表与连续索引推演',
      card2Desc: '零 GC 扁平化连续静态数组排布，指针下标寻址，展示内存紧凑分配与常数级压榨',
      codeLanguages: TRIE_STAGE2_STATIC_CODES,
      generateSteps: (inputs) => {
        const raw = String(inputs?.nums || '3, 10, 5, 25, 2, 8');
        const nums = raw.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
        return BinaryTrieStepCompiler.compileStaticArraySteps(nums.length > 0 ? nums : [3, 10, 5, 25, 2, 8], 5);
      },
    },
    {
      id: 'stage-3',
      name: 'Stage 3: 子数组最大异或和 (前缀异或转化)',
      shortName: '前缀异或转化',
      card2Title: '前缀异或自反性与子数组区间求解',
      card2Desc: '利用异或自反性 eor[j..i] = eor[i] ^ eor[j-1]，动态维护前缀异或集合并贪心查询',
      codeLanguages: TRIE_STAGE3_SUBARRAY_CODES,
      generateSteps: (inputs) => {
        const raw = String(inputs?.nums || '3, 1, 4, 2, 5');
        const nums = raw.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
        return BinaryTrieStepCompiler.compileSubarrayMaxXorSteps(nums.length > 0 ? nums : [3, 1, 4, 2, 5], 5);
      },
    },
  ],
  presets: [
    { label: '经典双数：5 XOR 25 = 28 (LC 421 样例)', values: { nums: '3, 10, 5, 25, 2, 8' } },
    { label: '紧凑全互斥集：两两对偶异或', values: { nums: '1, 2, 4, 8, 16, 31' } },
    { label: '高位集中进位测试', values: { nums: '14, 70, 53, 83, 49, 91' } },
    { label: '连续子数组异或经典用例', values: { nums: '3, 1, 4, 2, 5' } },
  ],
  inputs: [
    {
      id: 'nums',
      label: '正整数序列 (逗号分隔)',
      type: 'text',
      defaultValue: '3, 10, 5, 25, 2, 8',
      placeholder: '请输入正整数列表',
    },
  ],
  codeLanguages: TRIE_XOR_CODES,
  generateSteps: (inputs, stageId) => {
    const raw = String(inputs?.nums || '3, 10, 5, 25, 2, 8');
    const nums = raw.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    const validNums = nums.length > 0 ? nums : [3, 10, 5, 25, 2, 8];

    if (stageId === 'stage-2') {
      return BinaryTrieStepCompiler.compileStaticArraySteps(validNums, 5);
    } else if (stageId === 'stage-3') {
      return BinaryTrieStepCompiler.compileSubarrayMaxXorSteps(validNums, 5);
    }
    return BinaryTrieStepCompiler.compileTwoNumbersMaxXorSteps(validNums, 5);
  },
  renderCanvas: (container, step) => {
    TrieCanvasAdapter.renderTrieCanvas(container, step);
  },
  renderCustomMetrics: (container, step) => {
    TrieCanvasAdapter.renderTrieCard2(container, step);
  },
});
