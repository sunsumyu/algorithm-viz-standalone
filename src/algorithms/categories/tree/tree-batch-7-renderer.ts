/**
 * 树算法批量渲染器 - Batch 7（声明式聚合模块）
 * 包含: 最小深度、平衡二叉树、左叶子之和、二叉树所有路径、完全二叉树节点个数、找树左下角的值
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范 (LOC < 150 行)
 */

// 引入左神 Class 036 & 037 综合版（单一事实来源，别名映射 balanced & count-nodes）
import './tree-036-037/balanced-binary-tree-037-renderer';
import './tree-036-037/count-complete-tree-nodes-036-renderer';
import {
  buildBalancedTree037Steps as buildBalancedSteps,
  type BalancedTree037Step as BalancedStep,
} from '../../../core/renderers/adapters/balanced-binary-tree-step-compiler';
import {
  buildCountNodes036Steps as buildCountNodesSteps,
  type CountNodes036Step as CountNodesStep,
} from '../../../core/renderers/adapters/count-complete-tree-nodes-step-compiler';

// 引入最小深度多阶段演进版（单一事实来源，别名映射 min-depth）
import './min-depth-renderer';
export { buildMinDepthSteps, type MinDepthStep } from './min-depth-renderer';

// 平衡二叉树
export { buildBalancedSteps };
export type { BalancedStep };

// 引入左叶子之和多阶段演进版（单一事实来源，挂载主 ID 'left-leaves'）
import './left-leaves-renderer';
export { buildLeftLeavesSteps, type LeftLeavesStep } from './left-leaves-renderer';

// 引入二叉树所有路径多阶段演进版（单一事实来源，挂载主 ID 'all-paths'）
import './all-paths-renderer';
export { buildAllPathsSteps, type AllPathsStep } from './all-paths-renderer';

// 完全二叉树节点个数
export { buildCountNodesSteps };
export type { CountNodesStep };

// 引入找树左下角的值多阶段演进版（单一事实来源，挂载主 ID 'bottom-left'）
import './bottom-left-renderer';
export { buildBottomLeftSteps, type BottomLeftStep } from './bottom-left-renderer';

export {};
