/**
 * 左程云算法通关课 Class 040: 折纸问题 (Paper Folding)
 * 满二叉树中序遍历同构、显式调用栈模拟与逐层物理裂变推演
 * 4-Card 声明式标准化架构 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { PAPER_FOLDING_040_PROBLEM_CONTENT } from './paper-folding-040-problem-content';
import {
  PAPER_FOLDING_CODES,
  PAPER_FOLDING_CODE_LINES,
  PAPER_FOLDING_STAGE2_CODES,
  PAPER_FOLDING_STAGE2_LINES,
  PAPER_FOLDING_STAGE3_CODES,
  PAPER_FOLDING_STAGE3_LINES,
} from './paper-folding-040-stage-codes';
import {
  CreaseItem,
  TreeNodeLayout,
  PaperFoldStep,
  buildTreeLayout,
  buildPaperFoldingSteps,
  buildPaperFoldingStage2Steps,
  buildPaperFoldingStage3Steps,
} from '../../../core/renderers/adapters/paper-folding-040-step-compiler';
import {
  renderPaperFoldingCanvas,
  renderPaperFoldingCard2,
} from '../../../core/renderers/adapters/paper-folding-040-canvas-adapter';

export type { CreaseItem, TreeNodeLayout, PaperFoldStep };
export {
  PAPER_FOLDING_CODES,
  PAPER_FOLDING_CODE_LINES,
  PAPER_FOLDING_STAGE2_CODES,
  PAPER_FOLDING_STAGE2_LINES,
  PAPER_FOLDING_STAGE3_CODES,
  PAPER_FOLDING_STAGE3_LINES,
  buildTreeLayout,
  buildPaperFoldingSteps,
  buildPaperFoldingStage2Steps,
  buildPaperFoldingStage3Steps,
  renderPaperFoldingCanvas,
  renderPaperFoldingCard2,
};

// ============================================================
// 顶层声明式注册 (Register Declarative Algorithm)
// ============================================================
export const paperFolding040Visualizer = registerDeclarativeAlgorithm<PaperFoldStep>({
  id: 'paper-folding-040',
  name: '折纸问题 (Class 040)',
  category: 'tree',
  icon: '📄',
  difficulty: 2,
  levelOrder: 40,
  learningGoal: '理解折纸物理展开与满二叉树中序遍历的数学同构关系，掌握不建树利用递归栈完成 O(N) 空间求解的技巧',
  aliases: ['paper-folding', 'zuo-class-040', 'fold-paper-creases'],
  stages: [
    {
      id: 'stage1',
      name: 'Stage 1: 经典中序递归栈 (In-order DFS)',
      shortName: '中序递归',
      card2Title: '折纸几何探针与中序同构面板',
      card2Desc: '二叉树中序遍历左凹右凸，不物理建树空间复杂度 O(N)',
      codeLanguages: PAPER_FOLDING_CODES,
      generateSteps: (inputs) => {
        const n = parseInt(inputs?.folds || '3', 10);
        return buildPaperFoldingSteps(n);
      },
    },
    {
      id: 'stage2',
      name: 'Stage 2: 显式调用栈模拟 (Explicit Stack)',
      shortName: '栈迭代',
      card2Title: '显式中序遍历栈帧分析',
      card2Desc: '模拟系统栈压栈展开与出栈回溯过程',
      codeLanguages: PAPER_FOLDING_STAGE2_CODES,
      generateSteps: (inputs) => {
        const n = parseInt(inputs?.folds || '3', 10);
        return buildPaperFoldingStage2Steps(n);
      },
    },
    {
      id: 'stage3',
      name: 'Stage 3: 逐层物理裂变递推 (Layered Folding)',
      shortName: '物理裂变',
      card2Title: '物理纸条逐层裂变面板',
      card2Desc: '直观展示每一次对折在旧折痕裂变生成凹凸的过程',
      codeLanguages: PAPER_FOLDING_STAGE3_CODES,
      generateSteps: (inputs) => {
        const n = parseInt(inputs?.folds || '3', 10);
        return buildPaperFoldingStage3Steps(n);
      },
    },
  ],
  codeLanguages: PAPER_FOLDING_CODES,
  inputs: [
    {
      id: 'folds',
      label: '对折次数 (N)',
      type: 'select',
      defaultValue: '3',
      options: [
        { label: '对折 2 次 (3 条折痕)', value: '2' },
        { label: '对折 3 次 (7 条折痕)', value: '3' },
        { label: '对折 4 次 (15 条折痕)', value: '4' },
      ],
    },
  ],
  card2Title: '折纸几何探针与中序同构面板',
  card2Desc: '二叉树中序遍历左凹右凸，不物理建树空间复杂度 O(N)',
  problemHtml: PAPER_FOLDING_040_PROBLEM_CONTENT.description + PAPER_FOLDING_040_PROBLEM_CONTENT.mathematicalAnalysis,
  renderCanvas: (container, step) => {
    renderPaperFoldingCanvas(container, step);
  },
  renderCustomMetrics: (container, step) => {
    renderPaperFoldingCard2(container, step);
  },
});
