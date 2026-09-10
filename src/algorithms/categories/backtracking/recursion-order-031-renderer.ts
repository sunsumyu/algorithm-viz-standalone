/**
 * Class 031: 经典递归过程与递归序深度解构 (Recursion Order)
 * 左程云算法通关课入门篇 Class 031
 * 核心真理：二叉树递归遍历中，任何节点都会被访问三次（先序/中序/后序的本质源头）
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export interface RecursionOrderStep extends StepBase {
  stepIndex?: number;
  currentNode: number | null;
  pass: 1 | 2 | 3 | 0; // 1: 第一次到达 (先序), 2: 第二次到达 (中序), 3: 第三次到达 (后序), 0: null 基底
  callStack: number[];
  preorder: number[];
  inorder: number[];
  postorder: number[];
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const RECURSION_ORDER_031_CODES = {
  java: `public class RecursionOrder {
    public static class Node {
        int val;
        Node left, right;
        Node(int v) { val = v; }
    }

    public static void recursiveOrder(Node head) {
        if (head == null) return; // 基底出口
        // 1. 第一次到达该节点 (先序 Preorder 打印时机)
        System.out.println("1st: " + head.val);
        recursiveOrder(head.left);
        // 2. 第二次到达该节点 (中序 Inorder 打印时机)
        System.out.println("2nd: " + head.val);
        recursiveOrder(head.right);
        // 3. 第三次到达该节点 (后序 Postorder 打印时机)
        System.out.println("3rd: " + head.val);
    }
}`,
  cpp: `struct Node {
    int val;
    Node *left, *right;
    Node(int v) : val(v), left(nullptr), right(nullptr) {}
};

void recursiveOrder(Node* head) {
    if (!head) return; // 基底出口
    // 1. 第一次到达 (先序)
    cout << "1st: " << head->val << endl;
    recursiveOrder(head->left);
    // 2. 第二次到达 (中序)
    cout << "2nd: " << head->val << endl;
    recursiveOrder(head->right);
    // 3. 第三次到达 (后序)
    cout << "3rd: " << head->val << endl;
}`,
  python: `class Node:
    def __init__(self, val, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def recursive_order(head):
    if not head:
        return
    # 1. 第一次到达 (先序)
    print(f"1st: {head.val}")
    recursive_order(head.left)
    # 2. 第二次到达 (中序)
    print(f"2nd: {head.val}")
    recursive_order(head.right)
    # 3. 第三次到达 (后序)
    print(f"3rd: {head.val}")`,
  typescript: `class TreeNode {
    val: number;
    left: TreeNode | null = null;
    right: TreeNode | null = null;
    constructor(val: number) { this.val = val; }
}

function recursiveOrder(head: TreeNode | null): void {
    if (!head) return;
    // 1. 第一次到达该节点 (先序 Preorder)
    console.log("1st: ", head.val);
    recursiveOrder(head.left);
    // 2. 第二次到达该节点 (中序 Inorder)
    console.log("2nd: ", head.val);
    recursiveOrder(head.right);
    // 3. 第三次到达该节点 (后序 Postorder)
    console.log("3rd: ", head.val);
}`
};

interface SimpleNode {
  id: number;
  val: number;
  left?: SimpleNode;
  right?: SimpleNode;
}

export function generateRecursionOrderSteps(treeDepth: number = 2): RecursionOrderStep[] {
  const steps: RecursionOrderStep[] = [];
  
  // 构造标准测试二叉树: 根 1，左 2 (左 4, 右 5)，右 3
  const root: SimpleNode = {
    id: 1, val: 1,
    left: {
      id: 2, val: 2,
      left: treeDepth >= 3 ? { id: 4, val: 4 } : undefined,
      right: treeDepth >= 3 ? { id: 5, val: 5 } : undefined,
    },
    right: {
      id: 3, val: 3,
    }
  };

  const lines = {
    entry: 9,
    base: 10,
    firstPass: 12,
    callLeft: 13,
    secondPass: 15,
    callRight: 16,
    thirdPass: 18,
  };

  const callStack: number[] = [];
  const preorder: number[] = [];
  const inorder: number[] = [];
  const postorder: number[] = [];

  // Step 0: 入口帧
  steps.push({
    currentNode: root.val,
    pass: 1,
    callStack: [],
    preorder: [],
    inorder: [],
    postorder: [],
    decision: '递归总入口：启动 recursiveOrder(head=1)',
    message: '二叉树遍历的底层原语：递归序。每个节点均会被访问到达三次！',
    log: 'start recursiveOrder(head=1)',
    codeLine: lines.entry,
    statusBadge: { text: '递归入口', type: 'info' },
  });

  function traverse(node?: SimpleNode) {
    if (!node) {
      steps.push({
        currentNode: null,
        pass: 0,
        callStack: [...callStack],
        preorder: [...preorder],
        inorder: [...inorder],
        postorder: [...postorder],
        decision: '空节点特判：head == null，立即返回',
        message: '到达递归叶子下方的空引用出口，不进行任何打印，直接触发弹栈',
        log: 'head == null -> return',
        codeLine: lines.base,
        statusBadge: { text: '基底返回', type: 'warning' },
      });
      return;
    }

    callStack.push(node.val);

    // 1st pass
    preorder.push(node.val);
    steps.push({
      currentNode: node.val,
      pass: 1,
      callStack: [...callStack],
      preorder: [...preorder],
      inorder: [...inorder],
      postorder: [...postorder],
      decision: `第 1 次到达节点 [${node.val}] ➔ 先序收集`,
      message: `刚压入栈，第一次来到节点 ${node.val}。若此时收集结果，即形成【先序遍历】`,
      log: `Node ${node.val} - 1st pass -> Preorder append: ${node.val}`,
      codeLine: lines.firstPass,
      statusBadge: { text: '1st 访问 (先序)', type: 'success' },
    });

    // 深入左子树
    steps.push({
      currentNode: node.val,
      pass: 1,
      callStack: [...callStack],
      preorder: [...preorder],
      inorder: [...inorder],
      postorder: [...postorder],
      decision: `递归深入左子树：recursiveOrder(${node.left ? node.left.val : 'null'})`,
      message: `发起左子树调用，当前帧保留在栈中`,
      log: `Call left: node ${node.val} -> ${node.left ? node.left.val : 'null'}`,
      codeLine: lines.callLeft,
      statusBadge: { text: '深入左子树', type: 'info' },
    });
    traverse(node.left);

    // 2nd pass
    inorder.push(node.val);
    steps.push({
      currentNode: node.val,
      pass: 2,
      callStack: [...callStack],
      preorder: [...preorder],
      inorder: [...inorder],
      postorder: [...postorder],
      decision: `第 2 次到达节点 [${node.val}] ➔ 中序收集`,
      message: `左子树递归完全返回，再次回到节点 ${node.val}。若此时收集结果，即形成【中序遍历】`,
      log: `Node ${node.val} - 2nd pass -> Inorder append: ${node.val}`,
      codeLine: lines.secondPass,
      statusBadge: { text: '2nd 访问 (中序)', type: 'warning' },
    });

    // 深入右子树
    steps.push({
      currentNode: node.val,
      pass: 2,
      callStack: [...callStack],
      preorder: [...preorder],
      inorder: [...inorder],
      postorder: [...postorder],
      decision: `递归深入右子树：recursiveOrder(${node.right ? node.right.val : 'null'})`,
      message: `发起右子树调用，当前帧依旧保存在栈中`,
      log: `Call right: node ${node.val} -> ${node.right ? node.right.val : 'null'}`,
      codeLine: lines.callRight,
      statusBadge: { text: '深入右子树', type: 'info' },
    });
    traverse(node.right);

    // 3rd pass
    postorder.push(node.val);
    steps.push({
      currentNode: node.val,
      pass: 3,
      callStack: [...callStack],
      preorder: [...preorder],
      inorder: [...inorder],
      postorder: [...postorder],
      decision: `第 3 次到达节点 [${node.val}] ➔ 后序收集`,
      message: `左右子树递归均已完结，第三次回到节点 ${node.val}。若此时收集结果，即形成【后序遍历】`,
      log: `Node ${node.val} - 3rd pass -> Postorder append: ${node.val}`,
      codeLine: lines.thirdPass,
      statusBadge: { text: '3rd 访问 (后序)', type: 'danger' },
    });

    callStack.pop();
  }

  traverse(root);

  // 收尾步
  steps.push({
    currentNode: null,
    pass: 0,
    callStack: [],
    preorder: [...preorder],
    inorder: [...inorder],
    postorder: [...postorder],
    decision: '递归序遍历全流程完毕！',
    message: `先序: [${preorder.join(', ')}] | 中序: [${inorder.join(', ')}] | 后序: [${postorder.join(', ')}]`,
    log: 'Recursive order complete. All 3 passes demonstrated.',
    codeLine: lines.thirdPass,
    statusBadge: { text: '解构完成', type: 'success' },
  });

  return steps;
}

export function renderRecursionOrderCanvas(container: HTMLElement, step: RecursionOrderStep): void {
  container.innerHTML = `
    <div style="padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <!-- 顶部核心指示看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">当前活跃节点 & 访问轮次</div>
          <div style="font-size: 20px; font-weight: bold; color: ${
            step.pass === 1 ? '#34d399' : step.pass === 2 ? '#f59e0b' : step.pass === 3 ? '#ec4899' : '#94a3b8'
          }; margin-top: 4px;">
            ${step.currentNode !== null ? `节点 [ ${step.currentNode} ] · 第 ${step.pass} 次到达` : 'null (空指针基底)'}
          </div>
        </div>

        <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 12px;">
          <div style="font-size: 11px; color: #94a3b8;">递归调用栈深度 (Call Stack)</div>
          <div style="font-size: 20px; font-weight: bold; color: #38bdf8; margin-top: 4px;">
            深度 ${step.callStack.length} : [${step.callStack.join(' ➔ ') || '栈空'}]
          </div>
        </div>
      </div>

      <!-- 主视图：左侧二叉树拓扑与调用，右侧调用栈容器与三序序列 -->
      <div style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 16px; margin-bottom: 16px;">
        <!-- 树结构图画板 -->
        <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 16px; text-align: center;">
          <div style="font-size: 13px; font-weight: 600; color: #cbd5e1; margin-bottom: 12px;">二叉树拓扑沙盘 (节点访问状态点亮)</div>
          <svg viewBox="0 0 320 180" style="max-width: 100%; height: 160px;">
            <!-- 树连线 -->
            <line x1="160" y1="35" x2="80" y2="95" stroke="#475569" stroke-width="2" />
            <line x1="160" y1="35" x2="240" y2="95" stroke="#475569" stroke-width="2" />
            <line x1="80" y1="95" x2="40" y2="155" stroke="#475569" stroke-width="2" />
            <line x1="80" y1="95" x2="120" y2="155" stroke="#475569" stroke-width="2" />

            <!-- 节点 1 (Root) -->
            <circle cx="160" cy="35" r="18" fill="${step.currentNode === 1 ? (step.pass === 1 ? '#059669' : step.pass === 2 ? '#d97706' : '#db2777') : '#1e293b'}" stroke="${step.currentNode === 1 ? '#fff' : '#64748b'}" stroke-width="2" />
            <text x="160" y="41" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold">1</text>

            <!-- 节点 2 (Left) -->
            <circle cx="80" cy="95" r="18" fill="${step.currentNode === 2 ? (step.pass === 1 ? '#059669' : step.pass === 2 ? '#d97706' : '#db2777') : '#1e293b'}" stroke="${step.currentNode === 2 ? '#fff' : '#64748b'}" stroke-width="2" />
            <text x="80" y="101" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold">2</text>

            <!-- 节点 3 (Right) -->
            <circle cx="240" cy="95" r="18" fill="${step.currentNode === 3 ? (step.pass === 1 ? '#059669' : step.pass === 2 ? '#d97706' : '#db2777') : '#1e293b'}" stroke="${step.currentNode === 3 ? '#fff' : '#64748b'}" stroke-width="2" />
            <text x="240" y="101" text-anchor="middle" fill="#fff" font-size="14" font-weight="bold">3</text>

            <!-- 节点 4 (2.Left) -->
            <circle cx="40" cy="155" r="14" fill="${step.currentNode === 4 ? (step.pass === 1 ? '#059669' : step.pass === 2 ? '#d97706' : '#db2777') : '#1e293b'}" stroke="${step.currentNode === 4 ? '#fff' : '#64748b'}" stroke-width="2" />
            <text x="40" y="160" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">4</text>

            <!-- 节点 5 (2.Right) -->
            <circle cx="120" cy="155" r="14" fill="${step.currentNode === 5 ? (step.pass === 1 ? '#059669' : step.pass === 2 ? '#d97706' : '#db2777') : '#1e293b'}" stroke="${step.currentNode === 5 ? '#fff' : '#64748b'}" stroke-width="2" />
            <text x="120" y="160" text-anchor="middle" fill="#fff" font-size="12" font-weight="bold">5</text>
          </svg>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 6px;">
            绿色: 1st 到达(先序) · 橙色: 2nd 到达(中序) · 粉色: 3rd 到达(后序)
          </div>
        </div>

        <!-- 递归调用栈与三序收集箱 -->
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <!-- 栈槽 -->
          <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 10px;">
            <div style="font-size: 12px; font-weight: 600; color: #38bdf8; margin-bottom: 6px;">系统执行栈 (Call Stack)</div>
            <div style="display: flex; gap: 6px; align-items: center; min-height: 36px; background: rgba(0,0,0,0.2); padding: 4px 8px; border-radius: 4px;">
              ${step.callStack.length === 0 ? '<span style="color: #64748b; font-size: 11px;">栈空</span>' : ''}
              ${step.callStack.map(val => `
                <div style="padding: 4px 10px; background: #0284c7; color: white; border-radius: 4px; font-size: 12px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                  f(${val})
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 先中后序三清单 -->
          <div style="background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 8px; padding: 10px; display: flex; flex-direction: column; gap: 6px;">
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
              <span style="color: #34d399; font-weight: 600;">先序 (1st pass):</span>
              <span style="font-family: monospace; color: #f1f5f9; background: rgba(52, 211, 153, 0.1); padding: 2px 6px; border-radius: 4px;">
                ${step.preorder.join(', ') || 'Ø'}
              </span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
              <span style="color: #fbbf24; font-weight: 600;">中序 (2nd pass):</span>
              <span style="font-family: monospace; color: #f1f5f9; background: rgba(251, 191, 36, 0.1); padding: 2px 6px; border-radius: 4px;">
                ${step.inorder.join(', ') || 'Ø'}
              </span>
            </div>
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 12px;">
              <span style="color: #f472b6; font-weight: 600;">后序 (3rd pass):</span>
              <span style="font-family: monospace; color: #f1f5f9; background: rgba(244, 114, 182, 0.1); padding: 2px 6px; border-radius: 4px;">
                ${step.postorder.join(', ') || 'Ø'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- 公式原理卡片 -->
      ${renderFormulaCard(
        '递归序第一性原理',
        '任何二叉树递归遍历本质都是先压入栈、探索完左子树回到本节点、探索完右子树再次回到本节点并弹栈。三顾茅庐是递归不变规律，先/中/后序遍历只是在此过程中选择不同时间点打印！',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const recursionOrder031Visualizer = registerDeclarativeAlgorithm<RecursionOrderStep>({
  id: 'recursion-order-031',
  name: 'Class 031: 递归序与经典递归过程解构 (Recursion Order)',
  category: 'backtracking',
  icon: '🌳',
  difficulty: 2,
  levelOrder: 31,
  learningGoal: '深刻理解二叉树每个节点到达三次的递归序第一性原理，掌握先序、中序、后序遍历的统一底层本质',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 031)</h3>
      <p>理解经典递归过程，必须彻底理解递归序：</p>
      <ul>
        <li><strong>三次到达定理</strong>：对于任意节点 $X$，递归会首先进入 $X$（第 1 次）；遍历完左子树返回 $X$（第 2 次）；遍历完右子树再次返回 $X$ 并弹栈（第 3 次）。</li>
        <li><strong>先序遍历</strong>：在第 1 次到达 $X$ 时收集并打印结果。</li>
        <li><strong>中序遍历</strong>：在第 2 次到达 $X$ 时收集并打印结果。</li>
        <li><strong>后序遍历</strong>：在第 3 次到达 $X$ 时收集并打印结果。</li>
        <li><strong>教学价值</strong>：将抽象递归调用具象化为系统栈帧的压栈与弹栈，消除对递归的黑盒恐惧。</li>
      </ul>
    </div>
  `,
  codeLanguages: RECURSION_ORDER_031_CODES,
  inputs: [
    {
      id: 'depth',
      label: '树节点规模 (深度)',
      type: 'select',
      defaultValue: '3',
      options: [
        { label: '基础 3 节点 (根与左右孩子)', value: '2' },
        { label: '完整 5 节点 (深度为 3 的二叉树)', value: '3' },
      ],
    },
  ],
  generateSteps: (input) => {
    const depth = Number(input.depth) || 3;
    return generateRecursionOrderSteps(depth);
  },
  renderCanvas: (container, step) => {
    renderRecursionOrderCanvas(container, step);
  },
});
