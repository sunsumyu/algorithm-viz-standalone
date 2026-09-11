import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';

export interface TreeNodeData {
  id: number;
  val: number;
  leftId: number | null;
  rightId: number | null;
  x: number;
  y: number;
}

export interface PathRecord {
  pathStr: string;
  value: number;
}

export interface SumNumbersStep extends StepBase {
  nodes: TreeNodeData[];
  currentNodeId: number | null;
  callStack: { nodeId: number; prevSum: number; currentSum: number; action: string }[];
  activePathNodeIds: number[];
  completedPaths: PathRecord[];
  totalSum: number;
  decision: string;
  metrics?: Record<string, string>;
  message: string;
  log: string;
  codeLine: Record<string, number>;
}

export const SUM_ROOT_TO_LEAF_NUMBERS_CODES = {
  java: `public class Solution {
    public int sumNumbers(TreeNode root) {
        return dfs(root, 0);
    }
    private int dfs(TreeNode root, int prevSum) {
        if (root == null) return 0;
        int sum = prevSum * 10 + root.val;
        if (root.left == null && root.right == null) {
            return sum;
        }
        return dfs(root.left, sum) + dfs(root.right, sum);
    }
}`,
  cpp: `class Solution {
public:
    int sumNumbers(TreeNode* root) {
        return dfs(root, 0);
    }
    int dfs(TreeNode* root, int prevSum) {
        if (!root) return 0;
        int sum = prevSum * 10 + root->val;
        if (!root->left && !root->right) {
            return sum;
        }
        return dfs(root->left, sum) + dfs(root->right, sum);
    }
};`,
  python: `class Solution:
    def sumNumbers(self, root: Optional[TreeNode]) -> int:
        def dfs(node, prev_sum):
            if not node:
                return 0
            curr_sum = prev_sum * 10 + node.val
            if not node.left and not node.right:
                return curr_sum
            return dfs(node.left, curr_sum) + dfs(node.right, curr_sum)
        return dfs(root, 0)`,
  javascript: `function sumNumbers(root) {
    function dfs(node, prevSum) {
        if (!node) return 0;
        const sum = prevSum * 10 + node.val;
        if (!node.left && !node.right) {
            return sum;
        }
        return dfs(node.left, sum) + dfs(node.right, sum);
    }
    return dfs(root, 0);
}`
};

const lines = {
  entry: { java: 2, cpp: 3, python: 2, javascript: 1 },
  callDfsRoot: { java: 3, cpp: 4, python: 10, javascript: 10 },
  dfsEntry: { java: 5, cpp: 6, python: 3, javascript: 2 },
  dfsNullCheck: { java: 6, cpp: 7, python: 4, javascript: 3 },
  calcSum: { java: 7, cpp: 8, python: 6, javascript: 4 },
  leafCheck: { java: 8, cpp: 9, python: 7, javascript: 5 },
  leafReturn: { java: 9, cpp: 10, python: 8, javascript: 6 },
  recurseChildren: { java: 11, cpp: 12, python: 9, javascript: 8 },
  done: { java: 3, cpp: 4, python: 10, javascript: 10 }
};

export function buildDefaultTree(): TreeNodeData[] {
  // 树结构：
  //         1 (x: 200, y: 40)
  //       /   \
  //    2 (110, 110)   3 (290, 110)
  //                  /   \
  //            4 (240, 180)  5 (340, 180)
  return [
    { id: 1, val: 1, leftId: 2, rightId: 3, x: 200, y: 40 },
    { id: 2, val: 2, leftId: null, rightId: null, x: 110, y: 110 },
    { id: 3, val: 3, leftId: 4, rightId: 5, x: 290, y: 110 },
    { id: 4, val: 4, leftId: null, rightId: null, x: 240, y: 180 },
    { id: 5, val: 5, leftId: null, rightId: null, x: 340, y: 180 }
  ];
}

export function generateSumNumbersSteps(nodesInput?: TreeNodeData[]): SumNumbersStep[] {
  const nodes = nodesInput ?? buildDefaultTree();
  const nodeMap = new Map<number, TreeNodeData>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  const steps: SumNumbersStep[] = [];
  const completedPaths: PathRecord[] = [];
  const activePath: number[] = [];
  const callStack: { nodeId: number; prevSum: number; currentSum: number; action: string }[] = [];
  let totalSum = 0;

  // Step 0: 入口
  steps.push({
    nodes,
    currentNodeId: null,
    callStack: [],
    activePathNodeIds: [],
    completedPaths: [],
    totalSum: 0,
    decision: '开始求根到叶节点数字之和，准备启动 DFS 递归',
    metrics: { '当前节点': '无', '当前路径值': '0', '已累加和': '0', '递归深度': '0' },
    message: '初始化函数，传入根节点 root，初始上层累加和 prevSum = 0',
    log: '初始化：root = Node(1), prevSum = 0',
    codeLine: lines.entry
  });

  // Step 1: 调用 dfs(root, 0)
  steps.push({
    nodes,
    currentNodeId: 1,
    callStack: [{ nodeId: 1, prevSum: 0, currentSum: 0, action: 'dfs(root, 0)' }],
    activePathNodeIds: [1],
    completedPaths: [],
    totalSum: 0,
    decision: '调用 dfs(root, 0) 进入根节点计算',
    metrics: { '当前节点': 'Node(1)', '当前路径值': '0', '已累加和': '0', '递归深度': '1' },
    message: '调用 dfs(root, 0)，从根节点 Node(1) 开始自顶向下累加数字',
    log: '调用 dfs(root, 0)',
    codeLine: lines.callDfsRoot
  });

  function dfs(nodeId: number | null, prevSum: number): number {
    if (nodeId === null) {
      steps.push({
        nodes,
        currentNodeId: null,
        callStack: [...callStack],
        activePathNodeIds: [...activePath],
        completedPaths: [...completedPaths],
        totalSum,
        decision: '当前节点为 null，直接返回 0',
        metrics: { '当前节点': 'null', '当前路径值': String(prevSum), '已累加和': String(totalSum), '递归深度': String(callStack.length) },
        message: '递归基底：遇到空节点 null，对总和贡献为 0，返回 0',
        log: `dfs(null, ${prevSum}) -> return 0`,
        codeLine: lines.dfsNullCheck
      });
      return 0;
    }

    const node = nodeMap.get(nodeId)!;
    activePath.push(nodeId);
    callStack.push({ nodeId, prevSum, currentSum: 0, action: `进入 Node(${node.val})` });

    // dfs 头部入口
    steps.push({
      nodes,
      currentNodeId: nodeId,
      callStack: [...callStack],
      activePathNodeIds: [...activePath],
      completedPaths: [...completedPaths],
      totalSum,
      decision: `进入节点 Node(${node.val})，上级传递的数值为 ${prevSum}`,
      metrics: { '当前节点': `Node(${node.val})`, '当前路径值': String(prevSum), '已累加和': String(totalSum), '递归深度': String(callStack.length) },
      message: `dfs 进入 Node(${node.val})，检查节点有效性`,
      log: `进入 dfs(node=${node.val}, prevSum=${prevSum})`,
      codeLine: lines.dfsEntry
    });

    // 计算当前前缀数字
    const currSum = prevSum * 10 + node.val;
    callStack[callStack.length - 1].currentSum = currSum;

    steps.push({
      nodes,
      currentNodeId: nodeId,
      callStack: [...callStack],
      activePathNodeIds: [...activePath],
      completedPaths: [...completedPaths],
      totalSum,
      decision: `计算当前路径数值：${prevSum} × 10 + ${node.val} = ${currSum}`,
      metrics: { '当前节点': `Node(${node.val})`, '当前路径值': String(currSum), '已累加和': String(totalSum), '递归深度': String(callStack.length) },
      message: `公式推导：sum = prevSum * 10 + node.val = ${prevSum} * 10 + ${node.val} = ${currSum}`,
      log: `Node(${node.val}) 累计数值更新为 ${currSum}`,
      codeLine: lines.calcSum
    });

    // 检查是否为叶子节点
    const isLeaf = node.leftId === null && node.rightId === null;
    steps.push({
      nodes,
      currentNodeId: nodeId,
      callStack: [...callStack],
      activePathNodeIds: [...activePath],
      completedPaths: [...completedPaths],
      totalSum,
      decision: isLeaf ? `Node(${node.val}) 是叶子节点！形成一条完整根到叶路径` : `Node(${node.val}) 不是叶子节点，继续向下分治`,
      metrics: { '当前节点': `Node(${node.val})`, '当前路径值': String(currSum), '已累加和': String(totalSum), '递归深度': String(callStack.length) },
      message: isLeaf ? `叶子节点判定成功：左右孩子均为空，此分支形成完整数字 ${currSum}` : `叶子判定：非叶子节点，准备递归其子节点`,
      log: `检查叶子节点：Node(${node.val}) -> left=${node.leftId}, right=${node.rightId} (isLeaf=${isLeaf})`,
      codeLine: lines.leafCheck
    });

    if (isLeaf) {
      totalSum += currSum;
      const pathStr = activePath.map(id => nodeMap.get(id)!.val).join(' -> ');
      completedPaths.push({ pathStr, value: currSum });

      steps.push({
        nodes,
        currentNodeId: nodeId,
        callStack: [...callStack],
        activePathNodeIds: [...activePath],
        completedPaths: [...completedPaths],
        totalSum,
        decision: `到达叶子节点，返回该路径值 ${currSum}，总和累计达 ${totalSum}`,
        metrics: { '当前节点': `Node(${node.val})`, '当前路径值': String(currSum), '已累加和': String(totalSum), '递归深度': String(callStack.length) },
        message: `叶子收网：路径 [${pathStr}] 对应整数为 ${currSum}，将其计入结果集`,
        log: `叶子节点返回：${currSum}，已累计和：${totalSum}`,
        codeLine: lines.leafReturn
      });

      activePath.pop();
      callStack.pop();
      return currSum;
    }

    // 递归左子树与右子树
    steps.push({
      nodes,
      currentNodeId: nodeId,
      callStack: [...callStack],
      activePathNodeIds: [...activePath],
      completedPaths: [...completedPaths],
      totalSum,
      decision: `分别向下递归左右子树 dfs(left, ${currSum}) 与 dfs(right, ${currSum})`,
      metrics: { '当前节点': `Node(${node.val})`, '当前路径值': String(currSum), '已累加和': String(totalSum), '递归深度': String(callStack.length) },
      message: `向下探索：先访问左子树 left=${node.leftId ?? 'null'}，再访问右子树 right=${node.rightId ?? 'null'}`,
      log: `Node(${node.val}) 分支递归调用`,
      codeLine: lines.recurseChildren
    });

    const leftVal = dfs(node.leftId, currSum);
    const rightVal = dfs(node.rightId, currSum);
    const subtotal = leftVal + rightVal;

    steps.push({
      nodes,
      currentNodeId: nodeId,
      callStack: [...callStack],
      activePathNodeIds: [...activePath],
      completedPaths: [...completedPaths],
      totalSum,
      decision: `Node(${node.val}) 左右子树合并：${leftVal} + ${rightVal} = ${subtotal}`,
      metrics: { '当前节点': `Node(${node.val})`, '当前路径值': String(currSum), '已累加和': String(totalSum), '递归深度': String(callStack.length) },
      message: `子树合并完成：Node(${node.val}) 的左右子节点路径和为 ${subtotal}，回溯向上返回`,
      log: `Node(${node.val}) 回溯：返回 ${subtotal}`,
      codeLine: lines.recurseChildren
    });

    activePath.pop();
    callStack.pop();
    return subtotal;
  }

  const result = dfs(1, 0);

  // Step Done
  steps.push({
    nodes,
    currentNodeId: null,
    callStack: [],
    activePathNodeIds: [],
    completedPaths: [...completedPaths],
    totalSum: result,
    decision: `全树 DFS 遍历完成！所有根到叶节点路径数字之和为 ${result}`,
    metrics: { '当前节点': '完成', '当前路径值': '-', '已累加和': String(result), '递归深度': '0' },
    message: `计算收官：全树共 ${completedPaths.length} 条有效路径，总和为 ${result}`,
    log: `算法执行完毕，返回结果：${result}`,
    codeLine: lines.done
  });

  return steps;
}

export function renderSumNumbersCanvas(container: HTMLElement, step: SumNumbersStep): void {
  const { nodes, currentNodeId, activePathNodeIds, completedPaths, totalSum } = step;

  // 渲染二叉树 SVG 连线与节点
  const linesSvg: string[] = [];
  const nodesSvg: string[] = [];

  const nodeMap = new Map<number, TreeNodeData>();
  nodes.forEach(n => nodeMap.set(n.id, n));

  for (const node of nodes) {
    if (node.leftId !== null) {
      const left = nodeMap.get(node.leftId);
      if (left) {
        const isPathActive = activePathNodeIds.includes(node.id) && activePathNodeIds.includes(left.id);
        linesSvg.push(
          `<line x1="${node.x}" y1="${node.y}" x2="${left.x}" y2="${left.y}" ` +
          `stroke="${isPathActive ? '#38bdf8' : 'rgba(148, 163, 184, 0.3)'}" ` +
          `stroke-width="${isPathActive ? 3.5 : 1.8}" stroke-linecap="round" />`
        );
      }
    }
    if (node.rightId !== null) {
      const right = nodeMap.get(node.rightId);
      if (right) {
        const isPathActive = activePathNodeIds.includes(node.id) && activePathNodeIds.includes(right.id);
        linesSvg.push(
          `<line x1="${node.x}" y1="${node.y}" x2="${right.x}" y2="${right.y}" ` +
          `stroke="${isPathActive ? '#38bdf8' : 'rgba(148, 163, 184, 0.3)'}" ` +
          `stroke-width="${isPathActive ? 3.5 : 1.8}" stroke-linecap="round" />`
        );
      }
    }
  }

  for (const node of nodes) {
    const isCurrent = node.id === currentNodeId;
    const inActivePath = activePathNodeIds.includes(node.id);
    const isLeaf = node.leftId === null && node.rightId === null;

    let fillColor = 'rgba(30, 41, 59, 0.85)';
    let strokeColor = 'rgba(148, 163, 184, 0.4)';
    let strokeWidth = 1.5;

    if (isCurrent) {
      fillColor = 'rgba(245, 158, 11, 0.3)';
      strokeColor = '#f59e0b';
      strokeWidth = 3;
    } else if (inActivePath) {
      fillColor = 'rgba(56, 189, 248, 0.25)';
      strokeColor = '#38bdf8';
      strokeWidth = 2.5;
    } else if (isLeaf) {
      fillColor = 'rgba(16, 185, 129, 0.15)';
      strokeColor = 'rgba(52, 211, 153, 0.5)';
    }

    nodesSvg.push(`
      <g transform="translate(${node.x}, ${node.y})">
        <circle r="18" fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" />
        <text y="5" text-anchor="middle" fill="#f8fafc" font-size="13" font-weight="700" font-family="monospace">${node.val}</text>
        ${isLeaf ? `<text y="28" text-anchor="middle" fill="#34d399" font-size="9" font-family="sans-serif">Leaf</text>` : ''}
      </g>
    `);
  }

  const pathsHtml = completedPaths.length === 0
    ? `<div style="color: #64748b; font-size: 11px; padding: 6px 0; font-style: italic;">暂无已完成的叶子路径</div>`
    : completedPaths.map(p => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; margin-bottom: 4px; border-radius: 6px; background: rgba(52, 211, 153, 0.1); border: 1px solid rgba(52, 211, 153, 0.25);">
          <span style="font-family: monospace; font-size: 11px; color: #cbd5e1;">${p.pathStr}</span>
          <span style="font-family: monospace; font-size: 12px; font-weight: 700; color: #34d399;">+${p.value}</span>
        </div>
      `).join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; padding: 12px; box-sizing: border-box; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 顶部信息栏 -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(148, 163, 184, 0.15); border-radius: 8px;">
        <div style="font-size: 12px; color: #94a3b8;">
          当前搜索路径: <span style="font-family: monospace; font-weight: 700; color: #38bdf8;">${activePathNodeIds.map(id => nodeMap.get(id)?.val).join(' → ') || '空'}</span>
        </div>
        <div style="display: flex; gap: 12px; align-items: center;">
          <span style="font-size: 12px; color: #94a3b8;">已收集总和:</span>
          <span style="font-family: monospace; font-size: 16px; font-weight: 800; color: #f59e0b; background: rgba(245, 158, 11, 0.15); padding: 2px 8px; border-radius: 6px; border: 1px solid rgba(245, 158, 11, 0.3);">
            ${totalSum}
          </span>
        </div>
      </div>

      <!-- 中部主展示区：左侧树形态，右侧路径累计与递归栈 -->
      <div style="display: flex; gap: 12px; flex: 1; min-height: 240px;">
        <!-- 左侧 SVG 二树 -->
        <div style="flex: 1.3; background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(148, 163, 184, 0.15); border-radius: 8px; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center;">
          <svg width="400" height="230" viewBox="40 10 360 210" style="max-width: 100%; height: auto;">
            ${linesSvg.join('\n')}
            ${nodesSvg.join('\n')}
          </svg>
        </div>

        <!-- 右侧：叶子路径列表与递归调用栈 -->
        <div style="flex: 1; display: flex; flex-direction: column; gap: 8px;">
          <!-- 叶子路径汇总 -->
          <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(148, 163, 184, 0.15); border-radius: 8px; padding: 8px 10px; flex: 1; overflow-y: auto;">
            <div style="font-size: 11px; font-weight: 700; color: #34d399; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
              已达成的叶子路径 (${completedPaths.length})
            </div>
            ${pathsHtml}
          </div>

          <!-- 递归栈深度 -->
          <div style="background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(148, 163, 184, 0.15); border-radius: 8px; padding: 8px 10px; max-height: 100px; overflow-y: auto;">
            <div style="font-size: 11px; font-weight: 700; color: #38bdf8; margin-bottom: 4px;">
              当前递归调用栈 (${step.callStack.length})
            </div>
            <div style="display: flex; flex-direction: column; gap: 2px;">
              ${step.callStack.slice(-3).map(cs => `
                <div style="font-size: 10px; font-family: monospace; color: #cbd5e1; background: rgba(56, 189, 248, 0.08); padding: 2px 6px; border-radius: 4px;">
                  ${cs.action} [currSum=${cs.currentSum}]
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'sum-root-to-leaf-numbers',
  name: '求根节点到叶节点数字之和',
  category: 'tree',
  learningGoal: '掌握二叉树自顶向下递归路径数值累加，理解叶子判定与分支汇总机制',
  difficulty: 'medium',
  timeComplexity: 'O(N)',
  spaceComplexity: 'O(H)',
  codeLanguages: SUM_ROOT_TO_LEAF_NUMBERS_CODES,
  generateSteps: () => generateSumNumbersSteps(),
  renderCanvas: (container, step) => renderSumNumbersCanvas(container, step as SumNumbersStep)
});

