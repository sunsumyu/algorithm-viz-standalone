/**
 * Class 020: 二叉树非递归与双栈遍历 (Iterative Tree Traversals)
 * LeetCode 144 / 94 / 145
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export interface Traversal020Step extends StepBase {
  treeStructure: { val: number; left?: number; right?: number }[];
  traversalType: 'preorder' | 'inorder' | 'postorder';
  mainStack: number[];
  collectStack?: number[];
  visitedResult: number[];
  activeNode: number;
  decision: string;
  message: string;
  log: string;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const TREE_TRAVERSAL_020_CODES = {
  java: `public class IterativeTraversals {
    // 先序遍历 (中左右)：弹出一个打印一个，先压右再压左
    public static List<Integer> preorder(TreeNode root) {
        List<Integer> ans = new ArrayList<>();
        if (root == null) return ans;
        Stack<TreeNode> stack = new Stack<>();
        stack.push(root);
        while (!stack.isEmpty()) {
            TreeNode cur = stack.pop();
            ans.add(cur.val);
            if (cur.right != null) stack.push(cur.right);
            if (cur.left != null) stack.push(cur.left);
        }
        return ans;
    }
    // 中序遍历 (左中右)：整条左边界全进栈，无法下潜时弹出并转向右子树
    public static List<Integer> inorder(TreeNode root) {
        List<Integer> ans = new ArrayList<>();
        Stack<TreeNode> stack = new Stack<>();
        TreeNode cur = root;
        while (!stack.isEmpty() || cur != null) {
            if (cur != null) {
                stack.push(cur);
                cur = cur.left;
            } else {
                cur = stack.pop();
                ans.add(cur.val);
                cur = cur.right;
            }
        }
        return ans;
    }
    // 后序遍历 (左右中)：双栈法，先按 中右左 压入收集栈，再弹出即为 左右中
    public static List<Integer> postorder(TreeNode root) {
        List<Integer> ans = new ArrayList<>();
        if (root == null) return ans;
        Stack<TreeNode> s1 = new Stack<>(), s2 = new Stack<>();
        s1.push(root);
        while (!s1.isEmpty()) {
            TreeNode cur = s1.pop();
            s2.push(cur);
            if (cur.left != null) s1.push(cur.left);
            if (cur.right != null) s1.push(cur.right);
        }
        while (!s2.isEmpty()) ans.add(s2.pop().val);
        return ans;
    }
}`,
  cpp: `vector<int> preorder(TreeNode* root) {
    vector<int> ans; if (!root) return ans;
    stack<TreeNode*> st; st.push(root);
    while (!st.empty()) {
        TreeNode* cur = st.top(); st.pop(); ans.push_back(cur->val);
        if (cur->right) st.push(cur->right);
        if (cur->left) st.push(cur->left);
    }
    return ans;
}
vector<int> inorder(TreeNode* root) {
    vector<int> ans; stack<TreeNode*> st; TreeNode* cur = root;
    while (!st.empty() || cur) {
        if (cur) { st.push(cur); cur = cur->left; }
        else { cur = st.top(); st.pop(); ans.push_back(cur->val); cur = cur->right; }
    }
    return ans;
}
vector<int> postorder(TreeNode* root) {
    vector<int> ans; if (!root) return ans;
    stack<TreeNode*> s1, s2; s1.push(root);
    while (!s1.empty()) {
        TreeNode* cur = s1.top(); s1.pop(); s2.push(cur);
        if (cur->left) s1.push(cur->left);
        if (cur->right) s1.push(cur->right);
    }
    while (!s2.empty()) { ans.push_back(s2.top()->val); s2.pop(); }
    return ans;
}`,
  python: `def preorder(root):
    if not root: return []
    ans, stack = [], [root]
    while stack:
        cur = stack.pop()
        ans.append(cur.val)
        if cur.right: stack.append(cur.right)
        if cur.left: stack.append(cur.left)
    return ans

def inorder(root):
    ans, stack, cur = [], [], root
    while stack or cur:
        if cur:
            stack.append(cur)
            cur = cur.left
        else:
            cur = stack.pop()
            ans.append(cur.val)
            cur = cur.right
    return ans

def postorder(root):
    if not root: return []
    s1, s2 = [root], []
    while s1:
        cur = s1.pop()
        s2.append(cur.val)
        if cur.left: s1.append(cur.left)
        if cur.right: s1.append(cur.right)
    return s2[::-1]`,
  typescript: `export function preorder(root: any): number[] {
    const ans: number[] = [];
    if (!root) return ans;
    const stack = [root];
    while (stack.length > 0) {
        const cur = stack.pop();
        ans.push(cur.val);
        if (cur.right) stack.push(cur.right);
        if (cur.left) stack.push(cur.left);
    }
    return ans;
}
export function inorder(root: any): number[] {
    const ans: number[] = [], stack: any[] = [];
    let cur = root;
    while (stack.length > 0 || cur) {
        if (cur) { stack.push(cur); cur = cur.left; }
        else { cur = stack.pop(); ans.push(cur.val); cur = cur.right; }
    }
    return ans;
}
export function postorder(root: any): number[] {
    if (!root) return [];
    const s1 = [root], s2: number[] = [];
    while (s1.length > 0) {
        const cur = s1.pop();
        s2.push(cur.val);
        if (cur.left) s1.push(cur.left);
        if (cur.right) s1.push(cur.right);
    }
    return s2.reverse();
}`
};

interface SimNode {
  val: number;
  left?: SimNode;
  right?: SimNode;
}

export function buildTraversal020Steps(
  type: 'preorder' | 'inorder' | 'postorder' = 'preorder'
): Traversal020Step[] {
  const steps: Traversal020Step[] = [];

  // 标准样板树:
  //         1
  //       /   \
  //      2     3
  //     / \   /
  //    4   5 6
  const n4: SimNode = { val: 4 };
  const n5: SimNode = { val: 5 };
  const n6: SimNode = { val: 6 };
  const n2: SimNode = { val: 2, left: n4, right: n5 };
  const n3: SimNode = { val: 3, left: n6 };
  const root: SimNode = { val: 1, left: n2, right: n3 };

  const treeSnapshot = [
    { val: 1, left: 2, right: 3 },
    { val: 2, left: 4, right: 5 },
    { val: 3, left: 6 },
    { val: 4 },
    { val: 5 },
    { val: 6 },
  ];

  steps.push({
    treeStructure: treeSnapshot,
    traversalType: type,
    mainStack: [],
    collectStack: type === 'postorder' ? [] : undefined,
    visitedResult: [],
    activeNode: -1,
    decision: `主函数入口：开始进行二叉树显式栈非递归【${type === 'preorder' ? '先序遍历' : type === 'inorder' ? '中序遍历' : '双栈后序遍历'}】`,
    message: '非递归遍历彻底剥离系统递归调用栈，使用显式堆栈控制访问时序',
    log: `enter ${type}Traversal`,
    codeLine: 1,
    statusBadge: { text: '准备遍历', type: 'info' },
  });

  if (type === 'preorder') {
    const stack: SimNode[] = [root];
    const visited: number[] = [];

    while (stack.length > 0) {
      const cur = stack.pop()!;
      visited.push(cur.val);

      steps.push({
        treeStructure: treeSnapshot,
        traversalType: type,
        mainStack: stack.map((n) => n.val),
        visitedResult: [...visited],
        activeNode: cur.val,
        decision: `弹出栈顶节点 [${cur.val}] 并打印记录！当前访问序列更新为: [${visited.join(', ')}]`,
        message: '先序遍历准则：弹出一个打印一个，随后若有右子树先压右，再若有左子树后压左',
        log: `pop & visit ${cur.val}`,
        codeLine: 8,
        statusBadge: { text: `访问节点 ${cur.val}`, type: 'success' },
      });

      if (cur.right) {
        stack.push(cur.right);
        steps.push({
          treeStructure: treeSnapshot,
          traversalType: type,
          mainStack: stack.map((n) => n.val),
          visitedResult: [...visited],
          activeNode: cur.val,
          decision: `右孩子 [${cur.right.val}] 压入工作栈`,
          message: '栈是后进先出，后压右孩子确保其在左孩子处理完之后弹出',
          log: `push right ${cur.right.val}`,
          codeLine: 10,
          statusBadge: { text: `压右 ${cur.right.val}`, type: 'info' },
        });
      }

      if (cur.left) {
        stack.push(cur.left);
        steps.push({
          treeStructure: treeSnapshot,
          traversalType: type,
          mainStack: stack.map((n) => n.val),
          visitedResult: [...visited],
          activeNode: cur.val,
          decision: `左孩子 [${cur.left.val}] 压入工作栈（栈顶就绪）`,
          message: '下一轮循环将优先弹出左孩子并打印',
          log: `push left ${cur.left.val}`,
          codeLine: 11,
          statusBadge: { text: `压左 ${cur.left.val}`, type: 'warning' },
        });
      }
    }
  } else if (type === 'inorder') {
    const stack: SimNode[] = [];
    const visited: number[] = [];
    let cur: SimNode | undefined = root;

    while (stack.length > 0 || cur) {
      if (cur) {
        stack.push(cur);
        steps.push({
          treeStructure: treeSnapshot,
          traversalType: type,
          mainStack: stack.map((n) => n.val),
          visitedResult: [...visited],
          activeNode: cur.val,
          decision: `整条左边界进栈：节点 [${cur.val}] 压入栈中，指针继续向左子树下潜`,
          message: '中序必须先穷尽左子树全部节点',
          log: `push left boundary ${cur.val}`,
          codeLine: 21,
          statusBadge: { text: `压入 ${cur.val}`, type: 'info' },
        });
        cur = cur.left;
      } else {
        cur = stack.pop()!;
        visited.push(cur.val);
        steps.push({
          treeStructure: treeSnapshot,
          traversalType: type,
          mainStack: stack.map((n) => n.val),
          visitedResult: [...visited],
          activeNode: cur.val,
          decision: `左子树见底！弹出栈顶节点 [${cur.val}] 打印记录，随后指针转向其右子树`,
          message: `当前访问序列为: [${visited.join(', ')}]`,
          log: `pop & visit ${cur.val}`,
          codeLine: 24,
          statusBadge: { text: `访问 ${cur.val}`, type: 'success' },
        });
        cur = cur.right;
      }
    }
  } else {
    // postorder (双栈法)
    const s1: SimNode[] = [root];
    const s2: number[] = [];
    const visited: number[] = [];

    while (s1.length > 0) {
      const cur = s1.pop()!;
      s2.push(cur.val);

      steps.push({
        treeStructure: treeSnapshot,
        traversalType: type,
        mainStack: s1.map((n) => n.val),
        collectStack: [...s2],
        visitedResult: [],
        activeNode: cur.val,
        decision: `s1 弹出节点 [${cur.val}] 并压入收集栈 s2！s1 依次压入左孩子与右孩子`,
        message: '双栈法利用 s1 产生 中-右-左 的顺序压入 s2，s2 逆序弹出即为 左-右-中！',
        log: `s1 pop ${cur.val} -> s2 push`,
        codeLine: 36,
        statusBadge: { text: `s2 收集 ${cur.val}`, type: 'warning' },
      });

      if (cur.left) s1.push(cur.left);
      if (cur.right) s1.push(cur.right);
    }

    while (s2.length > 0) {
      const v = s2.pop()!;
      visited.push(v);
      steps.push({
        treeStructure: treeSnapshot,
        traversalType: type,
        mainStack: [],
        collectStack: [...s2],
        visitedResult: [...visited],
        activeNode: v,
        decision: `收集栈 s2 倒序弹出 [${v}] 并写入最终后序结果！`,
        message: `当前序列: [${visited.join(', ')}]`,
        log: `s2 pop ${v}`,
        codeLine: 41,
        statusBadge: { text: `后序输出 ${v}`, type: 'success' },
      });
    }
  }

  return steps;
}

export const treeTraversal020Visualizer = registerDeclarativeAlgorithm<Traversal020Step>({
  id: 'tree-traversal-iterative-020',
  name: '二叉树非递归与双栈遍历 (Class 020)',
  category: 'tree',
  icon: '🥞',
  difficulty: 2,
  levelOrder: 20,
  learningGoal: '掌握使用显式单栈/双栈模拟递归调用过程，深入理解先序、中序、后序在栈内的时序转换',
  problemHtml: `
    <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
      <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">题目描述</h3>
      <p>不使用递归，使用显式栈结构实现二叉树的先序（前序）、中序与后序遍历。</p>
      <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0;">
        <strong>样板树结构：</strong><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;1<br/>
        &nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;\<br/>
        &nbsp;&nbsp;2&nbsp;&nbsp;&nbsp;&nbsp;3<br/>
        &nbsp;/&nbsp;\&nbsp;&nbsp;/<br/>
        4&nbsp;&nbsp;&nbsp;5&nbsp;6<br/>
        <strong>先序：</strong>[1, 2, 4, 5, 3, 6]<br/>
        <strong>中序：</strong>[4, 2, 5, 1, 6, 3]<br/>
        <strong>后序：</strong>[4, 5, 2, 6, 3, 1]
      </div>
    </div>
  `,
  inputs: [
    {
      id: 'type',
      label: '遍历类型',
      type: 'select',
      defaultValue: 'preorder',
      options: [
        { label: '先序遍历 (Preorder: 中左右)', value: 'preorder' },
        { label: '中序遍历 (Inorder: 左中右)', value: 'inorder' },
        { label: '双栈后序遍历 (Postorder: 左右中)', value: 'postorder' },
      ],
    },
  ],
  codeLanguages: TREE_TRAVERSAL_020_CODES,
  generateSteps: (inputs) => {
    const type = (inputs.type || 'preorder') as 'preorder' | 'inorder' | 'postorder';
    return buildTraversal020Steps(type);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        <!-- 顶部指标卡 -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">遍历模式</div>
            <div style="font-size: 15px; font-weight: 700; color: #0284c7; margin-top: 4px;">
              ${step.traversalType === 'preorder' ? '先序遍历' : step.traversalType === 'inorder' ? '中序遍历' : '后序遍历'}
            </div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">主栈深度</div>
            <div style="font-size: 18px; font-weight: 700; color: #8b5cf6; margin-top: 4px;">${step.mainStack.length} 项</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">当前聚焦节点</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669; margin-top: 4px;">${step.activeNode >= 0 ? `节点 [${step.activeNode}]` : '-'}</div>
          </div>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #166534;">已输出节点数</div>
            <div style="font-size: 20px; font-weight: 800; color: #15803d; margin-top: 4px;">${step.visitedResult.length} / 6</div>
          </div>
        </div>

        <!-- 显式堆栈展板 -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 14px;">
            <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 8px;">🥞 工作栈 mainStack (底 -> 顶)</div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap; min-height: 40px; align-items: center;">
              ${step.mainStack.length === 0 ? '<span style="font-size: 11px; color: #94a3b8;">栈为空</span>' : step.mainStack.map((v, i) => `
                <div style="padding: 6px 12px; background: #ffffff; border: 2px solid ${i === step.mainStack.length - 1 ? '#8b5cf6' : '#cbd5e1'}; border-radius: 6px; font-weight: 700; color: #1e293b;">
                  ${v} ${i === step.mainStack.length - 1 ? '<span style="font-size: 9px; color: #8b5cf6;">(顶)</span>' : ''}
                </div>
              `).join(' ')}
            </div>
          </div>

          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 10px; padding: 14px;">
            <div style="font-size: 12px; font-weight: 700; color: #166534; margin-bottom: 8px;">📜 最终访问序列 (Result)</div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap; min-height: 40px; align-items: center;">
              ${step.visitedResult.length === 0 ? '<span style="font-size: 11px; color: #86efac;">等待访问输出...</span>' : step.visitedResult.map((v) => `
                <div style="padding: 6px 12px; background: #ffffff; border: 1px solid #86efac; border-radius: 6px; font-weight: 700; color: #15803d;">
                  ${v}
                </div>
              `).join(' ➜ ')}
            </div>
          </div>
        </div>

        <!-- 决策卡片 -->
        ${renderFormulaCard(
          '栈遍历核心操作',
          `当前序列: [${step.visitedResult.join(', ')}] | 遍历模式: ${step.traversalType}`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
