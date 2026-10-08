/**
 * 监控二叉树 (Binary Tree Cameras · LeetCode 968) - 声明式教学级沙盘渲染器 (Thin Domain Adapter)
 */

import { registerAlgorithm } from '../../../core/registry';
import { UniversalStageVisualizer } from '../dynamic-programming/unique-paths-renderer';
import {
  TreeNode,
  CameraNodeState,
  CameraStep,
  TREE_CAMERAS_CODE_LINES,
  parseTreeFromArray,
  buildTreeCameraSteps,
} from '../../../core/renderers/adapters/tree-cameras-step-compiler';
import {
  renderTreeCamerasCanvas,
} from '../../../core/renderers/adapters/tree-cameras-canvas-adapter';

export type {
  TreeNode,
  CameraNodeState,
  CameraStep,
};
export {
  TREE_CAMERAS_CODE_LINES,
  parseTreeFromArray,
  buildTreeCameraSteps,
  renderTreeCamerasCanvas,
};

registerAlgorithm({
  id: 'tree-cameras',
  name: '监控二叉树',
  viewId: 'tree-cameras',
  category: 'greedy',
  icon: '📷',
  difficulty: 3,
  levelOrder: 17,
  learningGoal: '掌握二叉树后序遍历与状态机的贪心结合，理解自底向上局部最优推导全局最少的解题范式',
  description: '后序自底向上贪心遍历，0=无覆盖/1=装摄像头/2=已覆盖，叶子父节点安装摄像头覆盖率最高',
  template: `<div id="tree-cameras" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
  Visualizer: UniversalStageVisualizer,
});

export function registerTreeCameras(): void {
  // 保持向前兼容导出
}
