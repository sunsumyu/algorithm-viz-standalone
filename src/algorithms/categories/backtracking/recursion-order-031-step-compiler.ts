/**
 * Class 031: 经典递归过程与递归序深度解构步骤编译器
 * 负责推演二叉树三次到达递归序步骤
 */

import { StepBase } from '../../../core/step-visualizer';

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
