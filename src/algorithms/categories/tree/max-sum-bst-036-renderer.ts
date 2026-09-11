/**
 * 左程云算法通关课 Class 036 Code01: 二叉搜索子树的最大键值和 (Max Sum BST Subtree)
 * LeetCode 1373 / 333 (二叉树树形 DP / 递归信息结构体搜集套路经典神题)
 * 核心机制:
 *  后序遍历自底向上搜集子树信息 Info (isBST, min, max, sum)
 *  父节点校验左右子树是否全为 BST 且 min/max 满足严格单调递增
 *  满足则聚合累加键值和，动态刷新全局 maxSumBST；不满足则标记非 BST 并向下传递历史最大值
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export interface BstTreeNode {
  id: number;
  val: number;
  left?: number;
  right?: number;
}

export interface BstSubtreeInfo {
  isBST: boolean;
  min: number;
  max: number;
  sum: number;
}

export interface MaxSumBstStep extends StepBase {
  nodes: BstTreeNode[];
  currentNodeId: number | null;
  phase: 'enter' | 'left_done' | 'right_done' | 'merge_info' | 'finish';
  leftInfo: BstSubtreeInfo | null;
  rightInfo: BstSubtreeInfo | null;
  currentInfo: BstSubtreeInfo | null;
  maxSumGlobal: number;
  bestBstRootId: number | null;
  isCurrentBst: boolean;
  message: string;
  log: string;
  codeLine: number;
}

export const MAX_SUM_BST_CODES = {
  java: `public class Solution {
    static class Info {
        boolean isBst;
        int min, max, sum;
        Info(boolean b, int mi, int ma, int s) {
            isBst = b; min = mi; max = ma; sum = s;
        }
    }
    private int maxSum = 0;
    public int maxSumBST(TreeNode root) {
        dfs(root);
        return Math.max(0, maxSum);
    }
    private Info dfs(TreeNode node) {
        if (node == null) {
            return new Info(true, Integer.MAX_VALUE, Integer.MIN_VALUE, 0);
        }
        Info l = dfs(node.left);
        Info r = dfs(node.right);
        if (l.isBst && r.isBst && l.max < node.val && node.val < r.min) {
            int curSum = l.sum + r.sum + node.val;
            maxSum = Math.max(maxSum, curSum);
            return new Info(true, Math.min(l.min, node.val), Math.max(r.max, node.val), curSum);
        }
        return new Info(false, 0, 0, 0);
    }
}`,
  cpp: `class Solution {
    struct Info {
        bool isBst;
        int minVal, maxVal, sum;
    };
    int maxSum = 0;
public:
    int maxSumBST(TreeNode* root) {
        dfs(root);
        return max(0, maxSum);
    }
    Info dfs(TreeNode* node) {
        if (!node) return {true, INT_MAX, INT_MIN, 0};
        Info l = dfs(node->left);
        Info r = dfs(node->right);
        if (l.isBst && r.isBst && l.maxVal < node->val && node->val < r.minVal) {
            int curSum = l.sum + r.sum + node->val;
            maxSum = max(maxSum, curSum);
            return {true, min(l.minVal, node->val), max(r.maxVal, node->val), curSum};
        }
        return {false, 0, 0, 0};
    }
};`,
  python: `class Solution:
    def maxSumBST(self, root: Optional[TreeNode]) -> int:
        self.max_sum = 0
        def dfs(node):
            if not node:
                return (True, float('inf'), float('-inf'), 0)
            l_bst, l_min, l_max, l_sum = dfs(node.left)
            r_bst, r_min, r_max, r_sum = dfs(node.right)
            if l_bst and r_bst and l_max < node.val < r_min:
                cur_sum = l_sum + r_sum + node.val
                self.max_sum = max(self.max_sum, cur_sum)
                return (True, min(l_min, node.val), max(r_max, node.val), cur_sum)
            return (False, 0, 0, 0)
        dfs(root)
        return max(0, self.max_sum)`,
};

export function buildMaxSumBstSteps(preset: 'classic_lc1373' | 'full_bst' | 'broken_bst' = 'classic_lc1373'): MaxSumBstStep[] {
  const steps: MaxSumBstStep[] = [];

  // Tree definitions
  let nodes: BstTreeNode[];
  let rootId: number;

  if (preset === 'classic_lc1373') {
    // [1, 4, 3, 2, 4, 2, 5, null, null, null, null, null, null, 4, 6]
    nodes = [
      { id: 1, val: 1, left: 2, right: 3 },
      { id: 2, val: 4, left: 4, right: 5 },
      { id: 3, val: 3, left: 6, right: 7 },
      { id: 4, val: 2 },
      { id: 5, val: 4 },
      { id: 6, val: 2 },
      { id: 7, val: 5, left: 8, right: 9 },
      { id: 8, val: 4 },
      { id: 9, val: 6 },
    ];
    rootId = 1;
  } else if (preset === 'full_bst') {
    nodes = [
      { id: 1, val: 10, left: 2, right: 3 },
      { id: 2, val: 5, left: 4, right: 5 },
      { id: 3, val: 15, left: 6, right: 7 },
      { id: 4, val: 2 },
      { id: 5, val: 7 },
      { id: 6, val: 12 },
      { id: 7, val: 20 },
    ];
    rootId = 1;
  } else {
    // broken
    nodes = [
      { id: 1, val: 4, left: 2, right: 3 },
      { id: 2, val: 8, left: 4, right: 5 },
      { id: 3, val: 2 },
      { id: 4, val: 1 },
      { id: 5, val: 3 },
    ];
    rootId = 1;
  }

  const nodeMap = new Map<number, BstTreeNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  let globalMaxSum = 0;
  let bestRoot: number | null = null;

  // Step 0: Entry
  steps.push({
    nodes,
    currentNodeId: rootId,
    phase: 'enter',
    leftInfo: null,
    rightInfo: null,
    currentInfo: null,
    maxSumGlobal: 0,
    bestBstRootId: null,
    isCurrentBst: false,
    message: `算法启动：准备后序遍历二叉树，自底向上搜集子树 Info(isBST, min, max, sum)，动态搜寻最大键值和。`,
    log: `初始化后序搜寻：Root Node ID = ${rootId}, Val = ${nodeMap.get(rootId)?.val}`,
    codeLine: 11,
  });

  function postOrder(u: number | undefined): BstSubtreeInfo {
    if (u === undefined || !nodeMap.has(u)) {
      return { isBST: true, min: Infinity, max: -Infinity, sum: 0 };
    }
    const node = nodeMap.get(u)!;

    // Enter node
    steps.push({
      nodes,
      currentNodeId: u,
      phase: 'enter',
      leftInfo: null,
      rightInfo: null,
      currentInfo: null,
      maxSumGlobal: globalMaxSum,
      bestBstRootId: bestRoot,
      isCurrentBst: false,
      message: `访问节点 [ID:${u}, 键值:${node.val}]：递归探查左子树...`,
      log: `Postorder 深入: 节点 ${node.val} (ID:${u}) 递归探查左子树`,
      codeLine: 18,
    });

    const left = postOrder(node.left);

    // Left done
    steps.push({
      nodes,
      currentNodeId: u,
      phase: 'left_done',
      leftInfo: left,
      rightInfo: null,
      currentInfo: null,
      maxSumGlobal: globalMaxSum,
      bestBstRootId: bestRoot,
      isCurrentBst: false,
      message: `节点 [ID:${u}, 键值:${node.val}]：左子树汇报完毕 (isBST=${left.isBST}, min=${left.min === Infinity ? 'INF' : left.min}, max=${left.max === -Infinity ? '-INF' : left.max}, sum=${left.sum})。准备探查右子树...`,
      log: `节点 ${node.val} 获得左子树信息: sum=${left.sum}`,
      codeLine: 19,
    });

    const right = postOrder(node.right);

    // Right done
    steps.push({
      nodes,
      currentNodeId: u,
      phase: 'right_done',
      leftInfo: left,
      rightInfo: right,
      currentInfo: null,
      maxSumGlobal: globalMaxSum,
      bestBstRootId: bestRoot,
      isCurrentBst: false,
      message: `节点 [ID:${u}, 键值:${node.val}]：右子树汇报完毕 (isBST=${right.isBST}, min=${right.min === Infinity ? 'INF' : right.min}, max=${right.max === -Infinity ? '-INF' : right.max}, sum=${right.sum})。开始判定 BST 成立性...`,
      log: `节点 ${node.val} 获得右子树信息: sum=${right.sum}`,
      codeLine: 20,
    });

    // Check BST condition: left.isBST && right.isBST && left.max < val && val < right.min
    const isBstCondition = left.isBST && right.isBST && left.max < node.val && node.val < right.min;

    let curInfo: BstSubtreeInfo;
    if (isBstCondition) {
      const curSum = left.sum + right.sum + node.val;
      const curMin = Math.min(left.min, node.val);
      const curMax = Math.max(right.max, node.val);
      curInfo = { isBST: true, min: curMin, max: curMax, sum: curSum };

      if (curSum > globalMaxSum) {
        globalMaxSum = curSum;
        bestRoot = u;
      }

      steps.push({
        nodes,
        currentNodeId: u,
        phase: 'merge_info',
        leftInfo: left,
        rightInfo: right,
        currentInfo: curInfo,
        maxSumGlobal: globalMaxSum,
        bestBstRootId: bestRoot,
        isCurrentBst: true,
        message: `✅ 校验成功！以节点 [ID:${u}, 键值:${node.val}] 为根的子树是合法二叉搜索树！当前 BST 键值和 = ${left.sum} + ${right.sum} + ${node.val} = ${curSum}。全局最高键值和刷新为 ${globalMaxSum}！`,
        log: `节点 ${node.val} 判定为 BST, 键值和=${curSum}, 全局最大=${globalMaxSum}`,
        codeLine: 21,
      });
    } else {
      curInfo = { isBST: false, min: 0, max: 0, sum: 0 };
      steps.push({
        nodes,
        currentNodeId: u,
        phase: 'merge_info',
        leftInfo: left,
        rightInfo: right,
        currentInfo: curInfo,
        maxSumGlobal: globalMaxSum,
        bestBstRootId: bestRoot,
        isCurrentBst: false,
        message: `❌ 校验未通过：以节点 [ID:${u}, 键值:${node.val}] 为根的子树破坏了 BST 单调性或子树非 BST。标记 isBST=false 并向上返回。`,
        log: `节点 ${node.val} 破坏 BST 属性 (左max=${left.max}, 当前=${node.val}, 右min=${right.min})`,
        codeLine: 25,
      });
    }

    return curInfo;
  }

  postOrder(rootId);

  // Final step
  steps.push({
    nodes,
    currentNodeId: null,
    phase: 'finish',
    leftInfo: null,
    rightInfo: null,
    currentInfo: null,
    maxSumGlobal: Math.max(0, globalMaxSum),
    bestBstRootId: bestRoot,
    isCurrentBst: true,
    message: `🎉 全树后序搜寻完毕！二叉搜索子树的最大键值和为 ${Math.max(0, globalMaxSum)} (最优 BST 根节点 ID: ${bestRoot ?? '空'})。`,
    log: `算法终结: 最大 BST 键值和 = ${Math.max(0, globalMaxSum)}`,
    codeLine: 12,
  });

  return steps;
}

export function renderMaxSumBstCanvas(container: HTMLElement, step: MaxSumBstStep) {
  const nodeMap = new Map<number, BstTreeNode>();
  step.nodes.forEach((n) => nodeMap.set(n.id, n));

  const treeCardsHtml = step.nodes
    .map((n) => {
      const isCurrent = step.currentNodeId === n.id;
      const isBestRoot = step.bestBstRootId === n.id;
      let border = 'border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(30, 41, 59, 0.7);';
      let badge = `<span style="font-size: 11px; color: #94a3b8;">Node #${n.id}</span>`;

      if (isCurrent) {
        border = 'border: 2px solid #fbbf24; background: rgba(120, 53, 15, 0.5); box-shadow: 0 0 12px rgba(251, 191, 36, 0.4);';
        badge = `<span style="font-size: 11px; color: #fde047; font-weight: bold;">🔍 当前节点</span>`;
      } else if (isBestRoot) {
        border = 'border: 2px solid #34d399; background: rgba(6, 78, 59, 0.5); box-shadow: 0 0 12px rgba(52, 211, 153, 0.4);';
        badge = `<span style="font-size: 11px; color: #6ee7b7; font-weight: bold;">⭐ 最优BST根</span>`;
      }

      return `
      <div style="
        position: relative;
        padding: 10px;
        border-radius: 8px;
        ${border}
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: space-between;
        min-width: 90px;
        transition: all 0.2s;
      ">
        <div style="width: 100%; display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px;">
          ${badge}
          <span style="color: #64748b; font-family: monospace;">L:${n.left ?? '-'} R:${n.right ?? '-'}</span>
        </div>
        <div style="font-size: 20px; font-weight: bold; color: #f8fafc; margin: 4px 0;">${n.val}</div>
        <div style="font-size: 10px; color: #94a3b8;">键值: ${n.val}</div>
      </div>
    `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 12px; padding: 16px; background: rgba(15, 23, 42, 0.6); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08);">
      <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255, 255, 255, 0.1); padding-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 14px; font-weight: bold; color: #e2e8f0;">二叉树节点拓扑与状态沙盘</span>
          <span style="padding: 2px 6px; font-size: 11px; border-radius: 4px; background: #1e293b; color: #94a3b8; font-family: monospace;">Nodes: ${step.nodes.length}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="font-size: 12px; color: #94a3b8;">
            全局最大 BST 键值和:
            <span style="margin-left: 4px; padding: 2px 8px; border-radius: 4px; font-family: monospace; font-weight: bold; background: rgba(16, 185, 129, 0.2); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3);">
              ${step.maxSumGlobal}
            </span>
          </div>
        </div>
      </div>

      <!-- 节点点阵 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(95px, 1fr)); gap: 8px; max-height: 160px; overflow-y: auto; padding: 8px; background: rgba(2, 6, 23, 0.4); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05);">
        ${treeCardsHtml}
      </div>

      <!-- 树形 DP Info 结构体探针实时面板 -->
      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-top: auto;">
        <!-- Left Info -->
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(2, 6, 23, 0.6);">
          <div style="font-size: 12px; font-weight: 600; color: #38bdf8; margin-bottom: 4px; display: flex; justify-content: space-between;">
            <span>左子树 Info</span>
            <span style="font-size: 10px; color: #64748b;">Postorder L</span>
          </div>
          ${
            step.leftInfo
              ? `
            <div style="font-size: 11px; line-height: 1.4; color: #cbd5e1; font-family: monospace;">
              <div>isBST: <span style="color: ${step.leftInfo.isBST ? '#34d399' : '#f87171'}; font-weight: bold;">${step.leftInfo.isBST}</span></div>
              <div>min/max: [${step.leftInfo.min === Infinity ? 'INF' : step.leftInfo.min}, ${step.leftInfo.max === -Infinity ? '-INF' : step.leftInfo.max}]</div>
              <div>Sum: <span style="color: #fde047; font-weight: bold;">${step.leftInfo.sum}</span></div>
            </div>
          `
              : `<div style="font-size: 11px; color: #64748b; font-style: italic; margin-top: 6px;">尚未探查或空节点</div>`
          }
        </div>

        <!-- Current Check -->
        <div style="padding: 10px; border-radius: 8px; border: 1px solid ${step.isCurrentBst ? 'rgba(52, 211, 153, 0.4)' : 'rgba(255, 255, 255, 0.1)'}; background: ${step.isCurrentBst ? 'rgba(6, 78, 59, 0.3)' : 'rgba(2, 6, 23, 0.6)'};">
          <div style="font-size: 12px; font-weight: 600; color: #fde047; margin-bottom: 4px; display: flex; justify-content: space-between;">
            <span>当前节点决策</span>
            <span style="font-size: 10px; font-weight: bold; color: ${step.isCurrentBst ? '#34d399' : '#94a3b8'};">
              ${step.currentInfo ? (step.isCurrentBst ? 'BST 成立' : '非 BST') : '评估中'}
            </span>
          </div>
          ${
            step.currentInfo
              ? `
            <div style="font-size: 11px; line-height: 1.4; color: #cbd5e1; font-family: monospace;">
              <div>isBST: <span style="color: ${step.currentInfo.isBST ? '#34d399' : '#f87171'}; font-weight: bold;">${step.currentInfo.isBST}</span></div>
              <div>min/max: [${step.currentInfo.min}, ${step.currentInfo.max}]</div>
              <div>Sum: <span style="color: #34d399; font-weight: bold;">${step.currentInfo.sum}</span></div>
            </div>
          `
              : `<div style="font-size: 11px; color: #64748b; font-style: italic; margin-top: 6px;">左右子树搜集中...</div>`
          }
        </div>

        <!-- Right Info -->
        <div style="padding: 10px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); background: rgba(2, 6, 23, 0.6);">
          <div style="font-size: 12px; font-weight: 600; color: #818cf8; margin-bottom: 4px; display: flex; justify-content: space-between;">
            <span>右子树 Info</span>
            <span style="font-size: 10px; color: #64748b;">Postorder R</span>
          </div>
          ${
            step.rightInfo
              ? `
            <div style="font-size: 11px; line-height: 1.4; color: #cbd5e1; font-family: monospace;">
              <div>isBST: <span style="color: ${step.rightInfo.isBST ? '#34d399' : '#f87171'}; font-weight: bold;">${step.rightInfo.isBST}</span></div>
              <div>min/max: [${step.rightInfo.min === Infinity ? 'INF' : step.rightInfo.min}, ${step.rightInfo.max === -Infinity ? '-INF' : step.rightInfo.max}]</div>
              <div>Sum: <span style="color: #fde047; font-weight: bold;">${step.rightInfo.sum}</span></div>
            </div>
          `
              : `<div style="font-size: 11px; color: #64748b; font-style: italic; margin-top: 6px;">尚未探查或空节点</div>`
          }
        </div>
      </div>
    </div>
  `;
}

export const maxSumBst036Visualizer = registerDeclarativeAlgorithm<MaxSumBstStep>({
  id: 'max-sum-bst-036',
  name: '二叉搜索子树最大键值和 (Class 036)',
  category: 'tree',
  icon: '🌲',
  difficulty: 2,
  levelOrder: 36,
  learningGoal: '掌握树形 DP 递归套路与 Info 结构体设计，自底向上搜集子树信息判定二叉搜索树并动态刷新最大键值和',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 036 / LeetCode 1373 & 333)</h3>
      <p>二叉搜索子树的最大键值和是<strong>树形 DP / 二叉树递归套路</strong>的经典考题：</p>
      <ul>
        <li><strong>搜集信息 Info 结构体</strong>：
          <br/>1. <code>isBST</code>：以当前节点为根的子树是否为合法二叉搜索树；
          <br/>2. <code>min / max</code>：子树中的极小值与极大值（用于父节点单调性校验）；
          <br/>3. <code>sum</code>：当前子树的键值和。
        </li>
        <li><strong>后序判定与转移</strong>：
          <br/>左树是 BST 且右树是 BST，并且 <code>left.max &lt; cur.val &lt; right.min</code>，则整棵子树也是 BST！
          <br/>此时更新 <code>maxSum = max(maxSum, left.sum + right.sum + cur.val)</code>。
        </li>
      </ul>
    </div>
  `,
  codeLanguages: MAX_SUM_BST_CODES,
  inputs: [
    {
      id: 'preset',
      label: '树形测试用例',
      type: 'select',
      defaultValue: 'classic_lc1373',
      options: [
        { label: 'LC 1373 官方多层破损树', value: 'classic_lc1373' },
        { label: '全树均为严格 BST 用例', value: 'full_bst' },
        { label: '根节点倒错非 BST 用例', value: 'broken_bst' },
      ],
    },
  ],
  generateSteps: (input) => {
    const preset = (input?.preset || 'classic_lc1373') as any;
    return buildMaxSumBstSteps(preset);
  },
  renderCanvas: (container, step) => {
    renderMaxSumBstCanvas(container, step);
  },
});

