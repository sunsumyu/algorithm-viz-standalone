/**
 * Class 019: 二叉树高频递归套路 (Tree Recursion Patterns / Tree DP)
 * 左程云算法通关课入门篇 Class 019
 * 树形 DP 与递归套路：平衡二叉树 (Balanced)、搜索二叉树 (BST)、二叉树最大节点距离
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export interface TreeNodeData {
  id: number;
  val: number;
  left?: number;
  right?: number;
}

export interface TreeRecursionStep extends StepBase {
  stepIndex?: number;
  nodes: TreeNodeData[];
  currentNodeId: number | null;
  phase: 'enter' | 'left-done' | 'right-done' | 'return';
  collectedInfo: {
    height: number;
    isBalanced: boolean;
    minVal?: number;
    maxVal?: number;
    isBST?: boolean;
    maxDistance?: number;
  };
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const TREE_RECURSION_019_CODES = {
  java: `public class TreeRecursion019 {
    // 树形 DP 递归信息结构体
    public static class Info {
        public boolean isBalanced;
        public int height;
        public Info(boolean b, int h) { isBalanced = b; height = h; }
    }

    public static Info process(TreeNode x) {
        if (x == null) {
            return new Info(true, 0); // 空树平且高度为0
        }
        Info leftInfo = process(x.left);
        Info rightInfo = process(x.right);

        int height = Math.max(leftInfo.height, rightInfo.height) + 1;
        boolean isBalanced = leftInfo.isBalanced && rightInfo.isBalanced 
            && Math.abs(leftInfo.height - rightInfo.height) <= 1;

        return new Info(isBalanced, height);
    }
}`,
  cpp: `struct Info {
    bool isBalanced;
    int height;
};

Info process(TreeNode* x) {
    if (!x) return {true, 0};
    Info leftInfo = process(x->left);
    Info rightInfo = process(x->right);

    int height = max(leftInfo.height, rightInfo.height) + 1;
    bool isBalanced = leftInfo.isBalanced && rightInfo.isBalanced &&
                      abs(leftInfo.height - rightInfo.height) <= 1;
    return {isBalanced, height};
}`,
  python: `class Info:
    def __init__(self, is_balanced: bool, height: int):
        self.is_balanced = is_balanced
        self.height = height

def process(x: TreeNode) -> Info:
    if not x:
        return Info(True, 0)
    left_info = process(x.left)
    right_info = process(x.right)
    
    height = max(left_info.height, right_info.height) + 1
    is_balanced = (left_info.is_balanced and right_info.is_balanced 
                   and abs(left_info.height - right_info.height) <= 1)
    return Info(is_balanced, height)`,
  typescript: `interface TreeInfo {
  isBalanced: boolean;
  height: number;
}

function process(node: TreeNode | null): TreeInfo {
  if (!node) return { isBalanced: true, height: 0 };
  const left = process(node.left);
  const right = process(node.right);
  const height = Math.max(left.height, right.height) + 1;
  const isBalanced = left.isBalanced && right.isBalanced 
    && Math.abs(left.height - right.height) <= 1;
  return { isBalanced, height };
}`
};

export function generateTreeRecursionSteps(treeNodes: TreeNodeData[]): TreeRecursionStep[] {
  const steps: TreeRecursionStep[] = [];
  const nodeMap = new Map<number, TreeNodeData>();
  treeNodes.forEach(n => nodeMap.set(n.id, n));

  const rootId = treeNodes.length > 0 ? treeNodes[0].id : null;
  if (!rootId) {
    steps.push({
      stepIndex: 0,
      nodes: [],
      currentNodeId: null,
      phase: 'return',
      collectedInfo: { height: 0, isBalanced: true },
      decision: '空树天然为平衡二叉树，高度为 0',
      message: '树为空',
      log: '空树处理完毕',
      codeLine: 10,
      statusBadge: { text: '空树', type: 'info' }
    });
    return steps;
  }

  let stepIdx = 0;

  function dfs(id: number | undefined): { height: number; isBalanced: boolean } {
    if (id === undefined || !nodeMap.has(id)) {
      steps.push({
        stepIndex: stepIdx++,
        nodes: treeNodes,
        currentNodeId: null,
        phase: 'return',
        collectedInfo: { height: 0, isBalanced: true },
        decision: '到达空节点 (Null)，返回 Base Case: {isBalanced: true, height: 0}',
        message: '空节点返回',
        log: 'Null -> 返回高度 0',
        codeLine: 10,
        statusBadge: { text: '空节点', type: 'info' }
      });
      return { height: 0, isBalanced: true };
    }

    const node = nodeMap.get(id)!;

    steps.push({
      stepIndex: stepIdx++,
      nodes: treeNodes,
      currentNodeId: id,
      phase: 'enter',
      collectedInfo: { height: 0, isBalanced: true },
      decision: `进入节点 [${node.val}]，准备向左子树递归收集信息`,
      message: `访问节点 ${node.val}`,
      log: `进入节点 ${node.val}`,
      codeLine: 12,
      statusBadge: { text: `进入 Node ${node.val}`, type: 'info' }
    });

    const left = dfs(node.left);

    steps.push({
      stepIndex: stepIdx++,
      nodes: treeNodes,
      currentNodeId: id,
      phase: 'left-done',
      collectedInfo: { height: left.height, isBalanced: left.isBalanced },
      decision: `节点 [${node.val}] 左子树收集完毕：高度=${left.height}，是否平衡=${left.isBalanced}。准备向右子树收集信息`,
      message: `左子树信息就绪`,
      log: `节点 ${node.val} 左树高度 ${left.height}`,
      codeLine: 13,
      statusBadge: { text: `左树完成`, type: 'warning' }
    });

    const right = dfs(node.right);

    steps.push({
      stepIndex: stepIdx++,
      nodes: treeNodes,
      currentNodeId: id,
      phase: 'right-done',
      collectedInfo: { height: Math.max(left.height, right.height) + 1, isBalanced: false },
      decision: `节点 [${node.val}] 右子树收集完毕：高度=${right.height}，是否平衡=${right.isBalanced}。整合左右信息计算自身`,
      message: `左右子树信息均就绪`,
      log: `节点 ${node.val} 右树高度 ${right.height}`,
      codeLine: 15,
      statusBadge: { text: `信息聚合`, type: 'warning' }
    });

    const myHeight = Math.max(left.height, right.height) + 1;
    const isBalanced = left.isBalanced && right.isBalanced && Math.abs(left.height - right.height) <= 1;

    steps.push({
      stepIndex: stepIdx++,
      nodes: treeNodes,
      currentNodeId: id,
      phase: 'return',
      collectedInfo: { height: myHeight, isBalanced },
      decision: `节点 [${node.val}] 整合结果：高度=${myHeight}，高度差=|${left.height} - ${right.height}|=${Math.abs(left.height - right.height)} <= 1，平衡状态=${isBalanced}`,
      message: `向上层返回结果`,
      log: `Node ${node.val} -> {h: ${myHeight}, balanced: ${isBalanced}}`,
      codeLine: 18,
      statusBadge: isBalanced ? { text: `平衡 (${myHeight})`, type: 'success' } : { text: `不平衡`, type: 'danger' }
    });

    return { height: myHeight, isBalanced };
  }

  dfs(rootId);
  return steps;
}

export function renderTreeRecursionCanvas(container: HTMLElement, step: TreeRecursionStep) {
  const { nodes, currentNodeId, phase, collectedInfo } = step;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
      <!-- 顶部当前状态面板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前递归节点</div>
          <div style="font-size: 14px; font-weight: bold; color: #38bdf8;">
            ${currentNodeId !== null ? `Node ${currentNodeId}` : 'Null (空节点)'}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">递归阶段</div>
          <div style="font-size: 14px; font-weight: bold; color: #f59e0b;">
            ${phase === 'enter' ? '向下探测 (Enter)' : phase === 'left-done' ? '左树完成 (Left Done)' : phase === 'right-done' ? '右树完成 (Right Done)' : '信息返回 (Return)'}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">计算高度 Height</div>
          <div style="font-size: 14px; font-weight: bold; color: #10b981;">
            ${collectedInfo.height}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">平衡状态 IsBalanced</div>
          <div style="font-size: 14px; font-weight: bold; color: ${collectedInfo.isBalanced ? '#10b981' : '#ef4444'};">
            ${collectedInfo.isBalanced ? 'TRUE (平衡)' : 'FALSE (失衡)'}
          </div>
        </div>
      </div>

      <!-- 二叉树节点拓扑渲染 -->
      <div style="background: rgba(15, 23, 42, 0.5); padding: 20px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); min-height: 200px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 16px;">
        <div style="display: flex; gap: 24px; flex-wrap: wrap; justify-content: center;">
          ${nodes.map(node => {
            const isCurrent = node.id === currentNodeId;
            return `
              <div style="
                width: 64px;
                height: 64px;
                border-radius: 50%;
                background: ${isCurrent ? 'rgba(56, 189, 248, 0.35)' : 'rgba(30, 41, 59, 0.8)'};
                border: 2px solid ${isCurrent ? '#38bdf8' : 'rgba(255,255,255,0.15)'};
                box-shadow: ${isCurrent ? '0 0 16px rgba(56, 189, 248, 0.5)' : 'none'};
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
              ">
                <div style="font-size: 16px; font-weight: bold; color: #f8fafc;">${node.val}</div>
                <div style="font-size: 10px; color: #94a3b8;">#${node.id}</div>
              </div>
            `;
          }).join('')}
        </div>
        <div style="font-size: 12px; color: #94a3b8;">
          当前树结构：以 #${nodes[0]?.id || 1} 为根的二叉树拓扑
        </div>
      </div>

      <!-- 核心树形 DP 套路总结卡片 -->
      ${renderFormulaCard(
        '二叉树递归套路核心三步法 (Tree DP Pattern)',
        '1. 确定返回信息结构体 Info；2. 假设左右子树均已返回 Info；3. 整合左右信息求解当前节点的 Info 并返回',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const treeRecursion019Visualizer = registerDeclarativeAlgorithm<TreeRecursionStep>({
  id: 'tree-recursion-patterns-019',
  name: 'Class 019: 二叉树高频递归套路 (Tree DP)',
  category: 'tree',
  icon: '🌲',
  difficulty: 2,
  levelOrder: 19,
  learningGoal: '彻底掌握树形 DP 递归套路，学会设计统一 Info 结构体解决平衡树、搜索二叉树与树最大距离等高频考题',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 019)</h3>
      <p>二叉树递归套路是整个二叉树大厂面试题的核心母题模型（本质上是<strong>树形动态规划</strong>）：</p>
      <ul>
        <li><strong>核心法则</strong>：可以向左子树要信息，也可以向右子树要信息。</li>
        <li><strong>统一结构体 Info</strong>：根据题目要求求取的信息全集（如高度、是否平衡、最大值、最小值、最大距离）。</li>
        <li><strong>后序整合</strong>：在左右子树返回后，合并得出当前整棵树的 Info 并向上传递。</li>
      </ul>
    </div>
  `,
  codeLanguages: TREE_RECURSION_019_CODES,
  inputs: [
    {
      id: 'treeType',
      label: '二叉树结构',
      type: 'select',
      defaultValue: 'balanced',
      options: [
        { label: '平衡二叉树', value: 'balanced' },
        { label: '倾斜单链树', value: 'unbalanced' },
      ],
    },
  ],
  generateSteps: (input) => {
    const isUnbalanced = input?.treeType === 'unbalanced';
    const nodes: TreeNodeData[] = isUnbalanced
      ? [
          { id: 1, val: 1, left: 2 },
          { id: 2, val: 2, left: 3 },
          { id: 3, val: 3, left: 4 },
          { id: 4, val: 4 }
        ]
      : [
          { id: 1, val: 1, left: 2, right: 3 },
          { id: 2, val: 2, left: 4, right: 5 },
          { id: 3, val: 3 },
          { id: 4, val: 4 },
          { id: 5, val: 5 }
        ];
    return generateTreeRecursionSteps(nodes);
  },
  renderCanvas: (container, step) => {
    renderTreeRecursionCanvas(container, step);
  },
});
