/**
 * Hard 24: 二叉树中的最大路径和 (Binary Tree Maximum Path Sum)
 * LeetCode 124 (Hard) / 树形 DP 与二叉树递归套路经典巅峰
 * 核心原语：单边向上收益贡献 max(0, dfs) + 跨根拱形全路径和汇合更新，严格 O(N) 遍历
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export interface PathSumStep extends StepBase {
  stepIndex?: number;
  currentNode: number | null;
  leftGain: number;
  rightGain: number;
  currentArchSum: number;
  maxGlobalSum: number;
  bestArchPath: number[];
  callStack: number[];
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const MAX_PATH_SUM_CODES = {
  java: `public class MaxPathSum {
    private int maxSum = Integer.MIN_VALUE;

    public int maxPathSum(TreeNode root) {
        maxGain(root);
        return maxSum;
    }

    // 返回以此节点为端点向下延伸的单边最大收益
    private int maxGain(TreeNode node) {
        if (node == null) return 0;

        // 递归计算左右子树收益，若为负数则舍弃 (贡献记为 0)
        int leftGain = Math.max(0, maxGain(node.left));
        int rightGain = Math.max(0, maxGain(node.right));

        // 以当前节点为最高拱形转折点的全路径和
        int currentArch = node.val + leftGain + rightGain;
        maxSum = Math.max(maxSum, currentArch);

        // 向父节点返回单边最大贡献
        return node.val + Math.max(leftGain, rightGain);
    }
}`,
  cpp: `class Solution {
    int maxSum = INT_MIN;
    int maxGain(TreeNode* node) {
        if (!node) return 0;
        int leftGain = max(0, maxGain(node->left));
        int rightGain = max(0, maxGain(node->right));
        maxSum = max(maxSum, node->val + leftGain + rightGain);
        return node->val + max(leftGain, rightGain);
    }
public:
    int maxPathSum(TreeNode* root) {
        maxGain(root);
        return maxSum;
    }
};`,
  python: `class Solution:
    def maxPathSum(self, root: Optional[TreeNode]) -> int:
        self.max_sum = float('-inf')

        def max_gain(node):
            if not node:
                return 0
            left_gain = max(0, max_gain(node.left))
            right_gain = max(0, max_gain(node.right))
            self.max_sum = max(self.max_sum, node.val + left_gain + right_gain)
            return node.val + max(left_gain, right_gain)

        max_gain(root)
        return self.max_sum`,
  typescript: `function maxPathSum(root: TreeNode | null): number {
    let maxSum = -Infinity;
    function maxGain(node: TreeNode | null): number {
        if (!node) return 0;
        const left = Math.max(0, maxGain(node.left));
        const right = Math.max(0, maxGain(node.right));
        maxSum = Math.max(maxSum, node.val + left + right);
        return node.val + Math.max(left, right);
    }
    maxGain(root);
    return maxSum;
}`
};

interface SimpleTreeNode {
  val: number;
  left?: SimpleTreeNode;
  right?: SimpleTreeNode;
}

export function generateMaxPathSumSteps(): PathSumStep[] {
  const steps: PathSumStep[] = [];
  // 经典树：-10(L: 9, R: 20(L: 15, R: 7))
  // 全局最大路径为 15 -> 20 -> 7，和为 42
  const tree: SimpleTreeNode = {
    val: -10,
    left: { val: 9 },
    right: {
      val: 20,
      left: { val: 15 },
      right: { val: 7 },
    },
  };

  const lines = {
    entry: 4,
    dfsEntry: 10,
    baseNull: 11,
    calcLeft: 14,
    calcRight: 15,
    calcArch: 18,
    updateMax: 19,
    returnSingle: 22,
  };

  let globalMax = -Infinity;
  let bestPath: number[] = [];
  const callStack: number[] = [];

  // Step 0: 入口
  steps.push({
    currentNode: -10,
    leftGain: 0,
    rightGain: 0,
    currentArchSum: 0,
    maxGlobalSum: globalMax === -Infinity ? 0 : globalMax,
    bestArchPath: [],
    callStack: [],
    decision: '启动二叉树最大路径和求解：root = -10',
    message: '核心思想：单边最大收益向上传递，跨根拱形全路径和就地更新全局最优',
    log: 'Init maxPathSum on root -10',
    codeLine: lines.entry,
    statusBadge: { text: '算法启动', type: 'info' },
  });

  function dfs(node?: SimpleTreeNode): number {
    if (!node) {
      return 0;
    }

    callStack.push(node.val);

    steps.push({
      currentNode: node.val,
      leftGain: 0,
      rightGain: 0,
      currentArchSum: 0,
      maxGlobalSum: globalMax === -Infinity ? 0 : globalMax,
      bestArchPath: [...bestPath],
      callStack: [...callStack],
      decision: `进入节点 [${node.val}]：发起左子树收益探查`,
      message: `调用 maxGain(${node.left ? node.left.val : 'null'})`,
      log: `Node ${node.val} explore left`,
      codeLine: lines.calcLeft,
      statusBadge: { text: `节点 ${node.val}`, type: 'info' },
    });

    const l = Math.max(0, dfs(node.left));

    steps.push({
      currentNode: node.val,
      leftGain: l,
      rightGain: 0,
      currentArchSum: 0,
      maxGlobalSum: globalMax === -Infinity ? 0 : globalMax,
      bestArchPath: [...bestPath],
      callStack: [...callStack],
      decision: `节点 [${node.val}] 左子树有效收益计算完毕 = ${l}，发起右子树探查`,
      message: `调用 maxGain(${node.right ? node.right.val : 'null'})`,
      log: `Node ${node.val} explore right, leftGain=${l}`,
      codeLine: lines.calcRight,
      statusBadge: { text: `左收益 ${l}`, type: 'info' },
    });

    const r = Math.max(0, dfs(node.right));

    const arch = node.val + l + r;
    const isNewBest = arch > globalMax;
    if (isNewBest) {
      globalMax = arch;
      if (node.val === 20) bestPath = [15, 20, 7];
      else if (node.val === 9) bestPath = [9];
      else if (node.val === 15) bestPath = [15];
      else if (node.val === 7) bestPath = [7];
    }

    steps.push({
      currentNode: node.val,
      leftGain: l,
      rightGain: r,
      currentArchSum: arch,
      maxGlobalSum: globalMax,
      bestArchPath: [...bestPath],
      callStack: [...callStack],
      decision: `节点 [${node.val}] 汇合两侧计算拱形路径和：${node.val} + ${l} + ${r} = ${arch} ➔ ${
        isNewBest ? `🎉 刷新全局最大路径和至 ${globalMax}！` : `未超越当前最大值 ${globalMax}`
      }`,
      message: `向父节点传递单边最大贡献：${node.val} + max(${l}, ${r}) = ${node.val + Math.max(l, r)}`,
      log: `Node ${node.val} arch=${arch}, globalMax=${globalMax}`,
      codeLine: lines.calcArch,
      statusBadge: { text: isNewBest ? `新纪录 ${arch}` : `局部和 ${arch}`, type: isNewBest ? 'success' : 'warning' },
    });

    callStack.pop();
    return node.val + Math.max(l, r);
  }

  dfs(tree);

  steps.push({
    currentNode: null,
    leftGain: 0,
    rightGain: 0,
    currentArchSum: globalMax,
    maxGlobalSum: globalMax,
    bestArchPath: [15, 20, 7],
    callStack: [],
    decision: `🎉 全树推演完毕！全局最大路径和 = ${globalMax} (最优路径: 15 ➔ 20 ➔ 7)`,
    message: '单次后序遍历 O(N) 完美闭环，无需任何暴搜回溯',
    log: `Max path sum complete. Result=${globalMax}`,
    codeLine: lines.entry,
    statusBadge: { text: `最终最大和: ${globalMax}`, type: 'success' },
  });

  return steps;
}

export function renderMaxPathSumCanvas(container: HTMLElement, step: PathSumStep): void {
  container.innerHTML = `
    <div style="padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 核心指标看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">全局最大路径和 (Max Path Sum)</div>
          <div style="font-size: 26px; font-weight: bold; color: #34d399; margin-top: 4px;">
            ${step.maxGlobalSum}
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">当前汇合拱形路径和 (Arch Sum)</div>
          <div style="font-size: 20px; font-weight: bold; color: #38bdf8; margin-top: 4px;">
            ${step.currentArchSum > 0 ? step.currentArchSum : '计算中...'}
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">左右子树单边有效收益贡献</div>
          <div style="font-size: 14px; font-family: monospace; color: #fbbf24; margin-top: 6px;">
            左贡献: ${step.leftGain} · 右贡献: ${step.rightGain}
          </div>
        </div>
      </div>

      <!-- 二叉树拓扑展示沙盘 -->
      <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px; margin-bottom: 16px; text-align: center;">
        <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 10px;">
          二叉树拓扑沙盘 (绿色高亮为当前锁定最优路径 15 ➔ 20 ➔ 7)
        </div>

        <svg viewBox="0 0 320 180" style="max-width: 100%; height: 160px;">
          <!-- 边连线 -->
          <line x1="160" y1="35" x2="80" y2="95" stroke="#475569" stroke-width="2" />
          <line x1="160" y1="35" x2="240" y2="95" stroke="#475569" stroke-width="2" />
          <line x1="240" y1="95" x2="200" y2="155" stroke="${step.bestArchPath.length > 0 ? '#34d399' : '#475569'}" stroke-width="${step.bestArchPath.length > 0 ? '3' : '2'}" />
          <line x1="240" y1="95" x2="280" y2="155" stroke="${step.bestArchPath.length > 0 ? '#34d399' : '#475569'}" stroke-width="${step.bestArchPath.length > 0 ? '3' : '2'}" />

          <!-- 节点 -10 -->
          <circle cx="160" cy="35" r="18" fill="${step.currentNode === -10 ? '#0284c7' : '#1e293b'}" stroke="${step.currentNode === -10 ? '#38bdf8' : '#64748b'}" stroke-width="2" />
          <text x="160" y="40" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">-10</text>

          <!-- 节点 9 -->
          <circle cx="80" cy="95" r="18" fill="${step.currentNode === 9 ? '#0284c7' : '#1e293b'}" stroke="${step.currentNode === 9 ? '#38bdf8' : '#64748b'}" stroke-width="2" />
          <text x="80" y="100" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">9</text>

          <!-- 节点 20 -->
          <circle cx="240" cy="95" r="18" fill="${step.bestArchPath.includes(20) ? '#065f46' : step.currentNode === 20 ? '#0284c7' : '#1e293b'}" stroke="${step.bestArchPath.includes(20) ? '#34d399' : '#64748b'}" stroke-width="2" />
          <text x="240" y="100" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">20</text>

          <!-- 节点 15 -->
          <circle cx="200" cy="155" r="16" fill="${step.bestArchPath.includes(15) ? '#065f46' : step.currentNode === 15 ? '#0284c7' : '#1e293b'}" stroke="${step.bestArchPath.includes(15) ? '#34d399' : '#64748b'}" stroke-width="2" />
          <text x="200" y="160" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">15</text>

          <!-- 节点 7 -->
          <circle cx="280" cy="155" r="16" fill="${step.bestArchPath.includes(7) ? '#065f46' : step.currentNode === 7 ? '#0284c7' : '#1e293b'}" stroke="${step.bestArchPath.includes(7) ? '#34d399' : '#64748b'}" stroke-width="2" />
          <text x="280" y="160" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">7</text>
        </svg>
      </div>

      <!-- 原理卡片 -->
      ${renderFormulaCard(
        '树形 DP 拱形汇合定理',
        '向父节点汇报时只能选择一条分支（单边贡献为 node.val + max(left, right)），因为一旦同时选择两条分支就无法向上继续连通！但在以当前节点为最高转折点时，可以同时采纳左右两边的正收益，形成拱形完整路径 node.val + leftGain + rightGain 挑战全局最大值！',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const binaryTreeMaximumPathSumVisualizer = registerDeclarativeAlgorithm<PathSumStep>({
  id: 'binary-tree-maximum-path-sum',
  name: 'Hard 24: 二叉树中的最大路径和 (Maximum Path Sum)',
  category: 'tree',
  icon: '🏔️',
  difficulty: 3,
  levelOrder: 124,
  learningGoal: '透彻掌握树形 DP 经典模型：单边向上贡献收益与跨根拱形全路径和分离计算的精妙架构',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 124 - Hard)</h3>
      <p>二叉树中的 <strong>路径</strong> 被定义为一条节点序列，序列中每对相邻节点之间都存在一条边。同一个节点在一条路径序列中 <strong>至多出现一次</strong> 。该路径 <strong>至少包含一个</strong> 节点，且不一定经过根节点。</p>
      <p><strong>路径和</strong> 是路径中各节点值的总和。给你一个二叉树的根节点 <code>root</code> ，返回其 <strong>最大路径和</strong>。</p>
      <ul>
        <li><strong>核心解法</strong>：树形 DP。
          <br/>1. <code>left = max(0, dfs(node.left))</code> 与 <code>right = max(0, dfs(node.right))</code> 收集正向收益。
          <br/>2. 全局最大值尝试用拱形路径 <code>node.val + left + right</code> 刷新。
          <br/>3. 单向返回 <code>node.val + max(left, right)</code> 给父节点继续拼接。</li>
      </ul>
    </div>
  `,
  codeLanguages: MAX_PATH_SUM_CODES,
  inputs: [],
  generateSteps: () => {
    return generateMaxPathSumSteps();
  },
  renderCanvas: (container, step) => {
    renderMaxPathSumCanvas(container, step);
  },
});
