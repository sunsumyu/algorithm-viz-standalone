/**
 * 树算法批量渲染器 - Batch 8
 * 包含: 最大二叉树、合并二叉树、中序+后序构造、BST LCA、BST插入、BST最小差、BST众数、BST删除、BST修剪、有序数组转BST、BST转累加树
 */

import { parseNumberList } from '../../../core/input-primitives';
import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import { cloneStateDepTree } from '../../../core/strategies/tree-clone';
import { TreeNode, buildTreeFromArr, renderTreeSVG, renderLog, BstStep } from './tree-template';

// 引入左神 Class 037 综合版（单一事实来源，别名映射 bst-lca & bst-trim）
import './tree-036-037/lowest-common-ancestor-bst-037-renderer';
import './tree-036-037/trim-bst-037-renderer';
// 引入从前序/后序与中序构造二叉树综合版（单一事实来源，别名映射 build-tree-2 & leetcode-106）
import './build-tree-renderer';
import buildTree2Template from './build-tree-2.html';
import bstLcaTemplate from './bst-lca.html';
import bstInsertTemplate from './bst-insert.html';
import bstMinDiffTemplate from './bst-min-diff.html';
import bstModesTemplate from './bst-modes.html';
import bstDeleteTemplate from './bst-delete.html';
import bstTrimTemplate from './bst-trim.html';
import sortedArrayToBstTemplate from './sorted-array-to-bst.html';
import bstToGstTemplate from './bst-to-gst.html';

// ========== Level 17: 最大二叉树 ==========
// 引入最大二叉树多阶段演进版（单一事实来源，挂载主 ID 'max-tree'，别名 leetcode-654）
import './max-tree-renderer';
export { buildMaxTreeSteps, type MaxTreeStep } from './max-tree-renderer';


// ========== Level 18: 合并二叉树 ==========
// 引入合并二叉树多阶段演进声明式版（单一事实来源，挂载主 ID 'merge-trees'，别名 leetcode-617）
import './merge-trees-renderer';
export { buildMergeTreesSteps, type MergeTreesStep } from './merge-trees-renderer';

// 由于代码量很大，我将创建一个简化的批量渲染器文件
// 包含所有剩余算法的基本实现

// ========== Level 19-27: 其他BST算法 ==========

// 通用BST渲染器基类
abstract class BSTVisualizer extends StepVisualizer<BstStep> {
  protected treeEl: HTMLElement | null = null;
  protected logEl: HTMLElement | null = null;
  protected curEl: HTMLElement | null = null;
  protected depthEl: HTMLElement | null = null;
  protected resultEl: HTMLElement | null = null;
  protected treeData: (number | null)[] = [];

  protected initDOMElements(): void {
    if (!this.root) return;
    const p = this.prefix;
    this.treeEl = this.root.querySelector(`#${p}tree`);
    this.logEl = this.root.querySelector(`#${p}log`);
    this.curEl = this.root.querySelector(`#${p}cur`);
    this.depthEl = this.root.querySelector(`#${p}depth`);
    this.resultEl = this.root.querySelector(`#${p}result`);
    this.bindPlaybackControls();
    this.bindExamples(this.getExamples());
  }

  protected abstract get prefix(): string;
  protected abstract getExamples(): Record<string, () => void>;

  protected renderStep(step: BstStep): void {
    if (this.treeEl) {
      renderTreeSVG(this.treeEl, step.tree, step.highlight || new Set(), step.color || '#cba6f7');
    }
    if (this.curEl) this.curEl.textContent = step.current != null ? String(step.current) : '-';
    if (this.depthEl) this.depthEl.textContent = String(step.depth);
    if (this.resultEl) this.resultEl.textContent = step.result != null ? String(step.result) : '?';
    if (this.logEl) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map(s => s.log);
      renderLog(this.logEl, logs, this.currentIndex);
    }
  }
}

// ========== Level 19: 中序+后序构造二叉树 ==========
class BuildTree2Visualizer extends BSTVisualizer {
  protected codeLines = [
    'public TreeNode buildTree(int[] inorder, int[] postorder) {',
    '    if (inorder.length == 0) return null;',
    '    int rootVal = postorder[postorder.length - 1];',
    '    int rootIdx = 0;',
    '    for (int i = 0; i < inorder.length; i++)',
    '        if (inorder[i] == rootVal) rootIdx = i;',
    '    TreeNode root = new TreeNode(rootVal);',
    '    root.left = buildTree(Arrays.copyOfRange(inorder, 0, rootIdx), Arrays.copyOfRange(postorder, 0, rootIdx));',
    '    root.right = buildTree(Arrays.copyOfRange(inorder, rootIdx + 1, inorder.length), Arrays.copyOfRange(postorder, rootIdx, postorder.length - 1));',
    '    return root;',
    '}',
  ];
  protected codePanelTitle = 'Java 中序+后序构造';
  protected prefix = 'bt2';
  private inorder: number[] = [9, 3, 15, 20, 7];
  private postorder: number[] = [9, 15, 7, 20, 3];

  protected getExamples() {
    return {
      '1': () => { this.inorder = [9, 3, 15, 20, 7]; this.postorder = [9, 15, 7, 20, 3]; this.start(); },
      '2': () => { this.inorder = [1, 2, 3]; this.postorder = [1, 2, 3]; this.start(); },
      '3': () => { this.inorder = [1, 2, 3, 4, 5, 6, 7]; this.postorder = [1, 3, 2, 5, 7, 6, 4]; this.start(); },
    };
  }

  protected buildSteps() {
    const steps: BstStep[] = [];
    const build = (inorder: number[], postorder: number[], depth: number): TreeNode | null => {
      if (inorder.length === 0) return null;
      const rootVal = postorder[postorder.length - 1];
      const rootIdx = inorder.indexOf(rootVal);
      steps.push({
        tree: null, current: rootVal, depth, highlight: new Set([rootVal]), color: '#8be9fd',
        log: `后序末尾 ${rootVal} 为根，中序位置 ${rootIdx}`,
      });
      const root: TreeNode = {
        val: rootVal,
        left: build(inorder.slice(0, rootIdx), postorder.slice(0, rootIdx), depth + 1),
        right: build(inorder.slice(rootIdx + 1), postorder.slice(rootIdx, -1), depth + 1),
      };
      steps.push({ tree: root, current: rootVal, depth, highlight: new Set([rootVal]), color: '#8be9fd', log: `节点 ${rootVal} 构建完成` });
      return root;
    };
    steps.push({ tree: null, current: null, depth: 0, highlight: new Set(), color: '#8be9fd', log: '开始构造' });
    const tree = build(this.inorder, this.postorder, 0);
    steps.push({ tree, current: null, depth: 0, highlight: new Set(), color: '#8be9fd', log: '完成' });
    return steps;
  }
}

// 【双版本长处整合】已整合至 build-tree-renderer.ts (Stage 2: LC 106 后序+中序分治构造)
// 唯一事实来源：build-tree (aliases: ['build-tree-2', 'leetcode-106'])，综合了多预设用例、左神讲义与四语言联动
export { BuildTree2Visualizer };

// ========== Level 20: BST 最近公共祖先 ==========
class BSTLCAVisualizer extends BSTVisualizer {
  protected codeLines = [
    'public TreeNode lowestCommonAncestor(TreeNode root, int p, int q) {',
    '    if (root == null) return null;',
    '    if (p < root.val && q < root.val) return lowestCommonAncestor(root.left, p, q);',
    '    if (p > root.val && q > root.val) return lowestCommonAncestor(root.right, p, q);',
    '    return root;',
    '}',
  ];
  protected codePanelTitle = 'Java BST最近公共祖先';
  protected prefix = 'blc';
  private p = 2;
  private q = 8;
  protected getExamples() {
    return {
      '1': () => { this.treeData = [6, 2, 8, 0, 4, 7, 9]; this.p = 2; this.q = 8; this.start(); },
      '2': () => { this.treeData = [6, 2, 8, 0, 4, 7, 9]; this.p = 2; this.q = 4; this.start(); },
      '3': () => { this.treeData = [5, 3, 6, 2, 4, null, 8]; this.p = 2; this.q = 8; this.start(); },
    };
  }

  protected buildSteps() {
    const steps: BstStep[] = [];
    const root = buildTreeFromArr(this.treeData);
    steps.push({ tree: root, current: null, depth: 0, highlight: new Set(), color: '#cba6f7', log: `找 ${this.p} 和 ${this.q} 的 LCA` });
    let node = root;
    let depth = 0;
    while (node) {
      const highlight = new Set([node.val]);
      steps.push({ tree: root, current: node.val, depth, highlight, color: '#fab387', log: `当前节点 ${node.val}` });
      if (this.p < node.val && this.q < node.val) {
        steps.push({ tree: root, current: node.val, depth, highlight, color: '#89b4fa', log: `都小于 ${node.val}，去左子树` });
        node = node.left; depth++;
      } else if (this.p > node.val && this.q > node.val) {
        steps.push({ tree: root, current: node.val, depth, highlight, color: '#89b4fa', log: `都大于 ${node.val}，去右子树` });
        node = node.right; depth++;
      } else {
        steps.push({ tree: root, current: node.val, depth, highlight: new Set([node.val, this.p, this.q]), color: '#a6e3a1', log: `找到 LCA: ${node.val}` });
        break;
      }
    }
    return steps;
  }
}

// 【双版本长处整合】已整合至 tree-036-037/lowest-common-ancestor-bst-037-renderer.ts
// 唯一事实来源：tree-037-lowest-common-ancestor-bst (aliases: ['bst-lca'])，兼具输入框/预设与左神分流讲义四语言联动
export { BSTLCAVisualizer };

// ========== Level 21: BST 插入操作 ==========
class BSTInsertVisualizer extends BSTVisualizer {
  protected codeLines = [
    'public TreeNode insertIntoBST(TreeNode root, int val) {',
    '    if (root == null) return new TreeNode(val);',
    '    if (val < root.val) root.left = insertIntoBST(root.left, val);',
    '    else root.right = insertIntoBST(root.right, val);',
    '    return root;',
    '}',
  ];
  protected codePanelTitle = 'Java BST插入';
  protected prefix = 'bi';
  private val = 5;
  protected getExamples() {
    return {
      '1': () => { this.treeData = [4, 2, 7, 1, 3]; this.val = 5; this.start(); },
      '2': () => { this.treeData = [40, 20, 60, 10, 30, 50, 70]; this.val = 25; this.start(); },
      '3': () => { this.treeData = [4, 2, 7, 1, 3]; this.val = 5; this.start(); },
    };
  }

  protected buildSteps() {
    const steps: BstStep[] = [];
    const root = buildTreeFromArr(this.treeData);
    steps.push({ tree: root, current: null, depth: 0, highlight: new Set(), color: '#a6e3a1', log: `插入值 ${this.val}` });
    const insert = (node: TreeNode | null, val: number, depth: number): TreeNode => {
      if (!node) {
        const newNode: TreeNode = { val, left: null, right: null };
        steps.push({ tree: root, current: val, depth, highlight: new Set([val]), color: '#f38ba8', log: `找到位置，插入 ${val}` });
        return newNode;
      }
      const highlight = new Set([node.val]);
      steps.push({ tree: root, current: node.val, depth, highlight, color: '#fab387', log: `访问 ${node.val}` });
      if (val < node.val) {
        steps.push({ tree: root, current: node.val, depth, highlight, color: '#89b4fa', log: `${val} < ${node.val}，去左子树` });
        node.left = insert(node.left, val, depth + 1);
      } else {
        steps.push({ tree: root, current: node.val, depth, highlight, color: '#89b4fa', log: `${val} >= ${node.val}，去右子树` });
        node.right = insert(node.right, val, depth + 1);
      }
      return node;
    };
    const result = insert(root, this.val, 0);
    steps.push({ tree: result, current: null, depth: 0, highlight: new Set(), color: '#a6e3a1', log: '插入完成' });
    return steps;
  }
}

registerAlgorithm({
  id: 'bst-insert',
  name: 'BST插入操作',
  viewId: 'algo-bst-insert-view',
  category: 'tree',
  description: '向BST中插入新节点',
  icon: '➕',
  template: bstInsertTemplate,
  Visualizer: BSTInsertVisualizer,
  difficulty: 1,
  levelOrder: 21,
  learningGoal: '掌握BST插入的递归实现',
});

// ========== Level 22: BST 最小绝对差 ==========
class BSTMinDiffVisualizer extends BSTVisualizer {
  protected codeLines = [
    'int minDiff = Integer.MAX_VALUE;',
    'int prev = -1;',
    '',
    'public int getMinimumDifference(TreeNode root) {',
    '    inorder(root);',
    '    return minDiff;',
    '}',
    '',
    'private void inorder(TreeNode node) {',
    '    if (node == null) return;',
    '    inorder(node.left);',
    '    if (prev != -1) minDiff = Math.min(minDiff, node.val - prev);',
    '    prev = node.val;',
    '    inorder(node.right);',
    '}',
  ];
  protected codePanelTitle = 'Java BST最小绝对差';
  protected prefix = 'bmd';

  protected getExamples() {
    return {
      '1': () => { this.treeData = [4, 2, 6, 1, 3]; this.start(); },
      '2': () => { this.treeData = [1, 0, 48, null, null, 12, 49]; this.start(); },
      '3': () => { this.treeData = [1, 2, 3, 4, 5]; this.start(); },
    };
  }

  protected buildSteps() {
    const steps: BstStep[] = [];
    const root = buildTreeFromArr(this.treeData);
    steps.push({ tree: root, current: null, depth: 0, highlight: new Set(), color: '#a6e3a1', log: '开始中序遍历' });
    let minDiff = Infinity, prev = -1;
    const inorder = (node: TreeNode | null, depth: number) => {
      if (!node) return;
      inorder(node.left, depth + 1);
      const highlight = new Set([node.val]);
      steps.push({ tree: root, current: node.val, depth, highlight, color: '#fab387', log: `访问 ${node.val}` });
      if (prev !== -1) {
        const diff = node.val - prev;
        minDiff = Math.min(minDiff, diff);
        steps.push({ tree: root, current: node.val, depth, highlight, color: '#89b4fa', log: `差值 ${diff}，最小 ${minDiff}` });
      }
      prev = node.val;
      inorder(node.right, depth + 1);
    };
    inorder(root, 0);
    steps.push({ tree: root, current: null, depth: 0, highlight: new Set(), color: '#a6e3a1', log: `最小差值: ${minDiff}`, result: minDiff });
    return steps;
  }
}

registerAlgorithm({
  id: 'bst-min-diff',
  name: 'BST最小绝对差',
  viewId: 'algo-bst-min-diff-view',
  category: 'tree',
  description: 'BST中任意两节点的最小差值',
  icon: '📏',
  template: bstMinDiffTemplate,
  Visualizer: BSTMinDiffVisualizer,
  difficulty: 1,
  levelOrder: 22,
  learningGoal: '利用BST中序遍历的有序性',
});

// ========== Level 23: BST 众数 ==========
class BSTModesVisualizer extends BSTVisualizer {
  protected codeLines = [
    'public List<Integer> findMode(TreeNode root) {',
    '    Map<Integer, Integer> map = new HashMap<>();',
    '    int maxCount = 0;',
    '    inorder(root, map);',
    '    List<Integer> result = new ArrayList<>();',
    '    for (Map.Entry<Integer, Integer> entry : map.entrySet()) {',
    '        if (entry.getValue() == maxCount)',
    '            result.add(entry.getKey());',
    '    }',
    '    return result;',
    '}',
  ];
  protected codePanelTitle = 'Java BST众数';
  protected prefix = 'bmo';

  protected getExamples() {
    return {
      '1': () => { this.treeData = [1, null, 2, 2]; this.start(); },
      '2': () => { this.treeData = [0]; this.start(); },
      '3': () => { this.treeData = [1, 1, 2, 2, 3]; this.start(); },
    };
  }

  protected buildSteps() {
    const steps: BstStep[] = [];
    const root = buildTreeFromArr(this.treeData);
    steps.push({ tree: root, current: null, depth: 0, highlight: new Set(), color: '#a6e3a1', log: '开始统计频率' });
    const map = new Map<number, number>();
    let maxCount = 0;
    const inorder = (node: TreeNode | null, depth: number) => {
      if (!node) return;
      inorder(node.left, depth + 1);
      const count = (map.get(node.val) || 0) + 1;
      map.set(node.val, count);
      maxCount = Math.max(maxCount, count);
      const highlight = new Set([node.val]);
      steps.push({ tree: root, current: node.val, depth, highlight, color: '#fab387', log: `${node.val} 出现 ${count} 次` });
      inorder(node.right, depth + 1);
    };
    inorder(root, 0);
    const modes = [...map].filter(([_, c]) => c === maxCount).map(([v]) => v);
    steps.push({ tree: root, current: null, depth: 0, highlight: new Set(modes), color: '#a6e3a1', log: `众数: ${modes.join(', ')}`, result: modes.join(',') });
    return steps;
  }
}

registerAlgorithm({
  id: 'bst-modes',
  name: 'BST中的众数',
  viewId: 'algo-bst-modes-view',
  category: 'tree',
  description: '找出BST中出现次数最多的节点值',
  icon: '📊',
  template: bstModesTemplate,
  Visualizer: BSTModesVisualizer,
  difficulty: 1,
  levelOrder: 23,
  learningGoal: '中序遍历统计节点频率',
});

// ========== Level 24: 删除 BST 节点 ==========
// 【双版本长处整合】已整合至 bst-delete-renderer.ts
// 唯一事实来源：bst-delete (aliases: ['leetcode-450', 'delete-node-in-a-bst'])，兼具输入框/预设用例与五大场景讲义四语言联动
import './bst-delete-renderer';
export { buildBstDeleteStage1Steps, type BSTDeleteStep } from './bst-delete-renderer';

// ========== Level 25: 修剪 BST ==========
class BSTTrimVisualizer extends BSTVisualizer {
  protected codeLines = [
    'public TreeNode trimBST(TreeNode root, int low, int high) {',
    '    if (root == null) return null;',
    '    if (root.val < low) return trimBST(root.right, low, high);',
    '    if (root.val > high) return trimBST(root.left, low, high);',
    '    root.left = trimBST(root.left, low, high);',
    '    root.right = trimBST(root.right, low, high);',
    '    return root;',
    '}',
  ];
  protected codePanelTitle = 'Java BST修剪';
  protected prefix = 'bt';
  private low = 1;
  private high = 2;

  protected getExamples() {
    return {
      '1': () => { this.treeData = [1, 0, 2]; this.low = 1; this.high = 2; this.start(); },
      '2': () => { this.treeData = [3, 0, 4, null, 2, null, null, 1]; this.low = 1; this.high = 3; this.start(); },
      '3': () => { this.treeData = [1, 0, 2]; this.low = 2; this.high = 2; this.start(); },
    };
  }

  protected buildSteps() {
    const steps: BstStep[] = [];
    const root = buildTreeFromArr(this.treeData);
    steps.push({ tree: root, current: null, depth: 0, highlight: new Set(), color: '#a6e3a1', log: `修剪范围 [${this.low}, ${this.high}]` });
    const trim = (node: TreeNode | null, low: number, high: number, depth: number): TreeNode | null => {
      if (!node) return null;
      const highlight = new Set([node.val]);
      steps.push({ tree: root, current: node.val, depth, highlight, color: '#fab387', log: `访问 ${node.val}` });
      if (node.val < low) {
        steps.push({ tree: root, current: node.val, depth, highlight, color: '#f38ba8', log: `${node.val} < ${low}，修剪左子树` });
        return trim(node.right, low, high, depth);
      }
      if (node.val > high) {
        steps.push({ tree: root, current: node.val, depth, highlight, color: '#f38ba8', log: `${node.val} > ${high}，修剪右子树` });
        return trim(node.left, low, high, depth);
      }
      steps.push({ tree: root, current: node.val, depth, highlight, color: '#a6e3a1', log: `${node.val} 在范围内，保留` });
      node.left = trim(node.left, low, high, depth + 1);
      node.right = trim(node.right, low, high, depth + 1);
      return node;
    };
    const result = trim(root, this.low, this.high, 0);
    steps.push({ tree: result, current: null, depth: 0, highlight: new Set(), color: '#a6e3a1', log: '修剪完成' });
    return steps;
  }
}

// 【双版本长处整合】已整合至 tree-036-037/trim-bst-037-renderer.ts
// 唯一事实来源：tree-037-trim-bst (aliases: ['bst-trim'])，兼具输入框/预设与左神单侧修剪讲义四语言联动
export { BSTTrimVisualizer };

// ========== Level 26: 有序数组转 BST ==========
// 【双版本长处整合】已整合至 sorted-array-to-bst-renderer.ts
// 唯一事实来源：sorted-array-to-bst (aliases: ['leetcode-108', 'convert-sorted-array-to-binary-search-tree'])，兼具输入框/预设用例与二分分治讲义四语言联动
import './sorted-array-to-bst-renderer';
export { buildSortedArrayToBstStage1Steps, type SortedArrayToBstStep } from './sorted-array-to-bst-renderer';

// BST 转累加树
class BSTToGSTVisualizer extends BSTVisualizer {
  protected codeLines = [
    'int sum = 0;',
    '',
    'public TreeNode convertBST(TreeNode root) {',
    '    reverseInorder(root);',
    '    return root;',
    '}',
    '',
    'private void reverseInorder(TreeNode node) {',
    '    if (node == null) return;',
    '    reverseInorder(node.right);',
    '    sum += node.val;',
    '    node.val = sum;',
    '    reverseInorder(node.left);',
    '}',
  ];
  protected codePanelTitle = 'Java BST转累加树';
  protected prefix = 'bg';

  protected getExamples() {
    return {
      '1': () => { this.treeData = [4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8]; this.start(); },
      '2': () => { this.treeData = [0, null, 1]; this.start(); },
      '3': () => { this.treeData = [1, 0, 2]; this.start(); },
    };
  }

  protected buildSteps() {
    const steps: BstStep[] = [];
    const root = buildTreeFromArr(this.treeData);
    steps.push({ tree: root, current: null, depth: 0, highlight: new Set(), color: '#a6e3a1', log: '开始反向中序遍历' });
    let sum = 0;
    const reverseInorder = (node: TreeNode | null, depth: number) => {
      if (!node) return;
      reverseInorder(node.right, depth + 1);
      sum += node.val;
      const oldVal = node.val;
      node.val = sum;
      const highlight = new Set([node.val]);
      steps.push({ tree: root, current: node.val, depth, highlight, color: '#fab387', log: `${oldVal} → ${node.val} (累加和=${sum})` });
      reverseInorder(node.left, depth + 1);
    };
    reverseInorder(root, 0);
    steps.push({ tree: root, current: null, depth: 0, highlight: new Set(), color: '#a6e3a1', log: '转换完成' });
    return steps;
  }
}

registerAlgorithm({
  id: 'bst-to-gst',
  name: 'BST转累加树',
  viewId: 'algo-bst-to-gst-view',
  category: 'tree',
  description: '将BST转换为累加树（右根左遍历）',
  icon: '💰',
  template: bstToGstTemplate,
  Visualizer: BSTToGSTVisualizer,
  difficulty: 2,
  levelOrder: 27,
  learningGoal: '掌握反向中序遍历（右根左）',
});

export {};
