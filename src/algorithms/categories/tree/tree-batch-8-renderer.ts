/**
 * 树算法批量渲染器 - Batch 8（声明式聚合模块）
 * 包含: 最大二叉树、合并二叉树、中序+后序构造、BST LCA、BST插入、BST最小差、BST众数、BST删除、BST修剪、有序数组转BST、BST转累加树
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范 (LOC < 150 行)
 */

// 引入左神 Class 037 综合版（单一事实来源，别名映射 bst-lca & bst-trim）
import './tree-036-037/lowest-common-ancestor-bst-037-renderer';
import './tree-036-037/trim-bst-037-renderer';

// 引入从前序/后序与中序构造二叉树综合版（单一事实来源，别名映射 build-tree-2 & leetcode-106）
import './build-tree-renderer';

// 引入二叉搜索树搜索与插入综合版（单一事实来源，主 ID 'bst-search'，别名映射 bst-insert & leetcode-701）
import './bst-search-renderer';

// 引入二叉搜索树最小绝对差多阶段综合版 (单一事实来源，主 ID 'bst-min-diff'，别名 leetcode-530 / leetcode-783)
import './bst-min-diff-renderer';
export {
  buildBstMinDiffStage1Steps,
  buildBstMinDiffStage2Steps,
  buildBstMinDiffStage3Steps,
  type BstMinDiffStep,
} from './bst-min-diff-renderer';

// 引入二叉搜索树众数多阶段综合版 (单一事实来源，主 ID 'bst-modes'，别名 leetcode-501 / find-mode-in-binary-search-tree)
import './bst-modes-renderer';
export {
  buildBstModesStage1Steps,
  buildBstModesStage2Steps,
  buildBstModesStage3Steps,
  type BstModesStep,
} from './bst-modes-renderer';

// 引入把二叉搜索树转换为累加树多阶段综合版 (单一事实来源，主 ID 'bst-to-gst'，别名 leetcode-538 / leetcode-1038)
import './bst-to-gst-renderer';
export {
  buildBstToGstStage1Steps,
  buildBstToGstStage2Steps,
  buildBstToGstStage3Steps,
  type BstToGstStep,
} from './bst-to-gst-renderer';

// ========== Level 17: 最大二叉树 ==========
import './max-tree-renderer';
export { buildMaxTreeSteps, type MaxTreeStep } from './max-tree-renderer';

// ========== Level 18: 合并二叉树 ==========
import './merge-trees-renderer';
export { buildMergeTreesSteps, type MergeTreesStep } from './merge-trees-renderer';

// ========== Level 24: 删除 BST 节点 ==========
import './bst-delete-renderer';
export { buildBstDeleteStage1Steps, type BSTDeleteStep } from './bst-delete-renderer';

// ========== Level 26: 有序数组转 BST ==========
import './sorted-array-to-bst-renderer';
export { buildSortedArrayToBstStage1Steps, type SortedArrayToBstStep } from './sorted-array-to-bst-renderer';

export {};
