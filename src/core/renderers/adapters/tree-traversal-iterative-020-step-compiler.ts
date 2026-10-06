/**
 * Iterative Tree Traversals (Class 020) Step Compiler
 * 二叉树非递归与双栈遍历步骤生成器
 * 深模块核心编译器 (Deep Module)
 */

import { StepBase, HighlightTarget } from '../../step-visualizer';
import {
  TREE_TRAVERSAL_020_CODE_LINES,
} from '../../../algorithms/categories/tree/tree-traversal-iterative-020-stage-codes';

// ============================================================
// 步骤接口定义 (保持既有测试契约不变)
// ============================================================
export interface TraversalNode {
  val: number;
  left?: number;
  right?: number;
}

export interface Traversal020Step extends StepBase {
  treeStructure: TraversalNode[];
  traversalType: 'preorder' | 'inorder' | 'postorder';
  mainStack: number[];
  collectStack?: number[];
  visitedResult: number[];
  activeNode: number;
  decision: string;
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  stageId?: 'stage1' | 'stage2' | 'stage3';
}

interface SimNode {
  val: number;
  left?: SimNode;
  right?: SimNode;
}

// ============================================================
// 样板树静态布局坐标 (经典 6 节点二叉树)
//          1
//        /   \
//       2     3
//      / \   /
//     4   5 6
// ============================================================
export interface TreeLayoutItem {
  val: number;
  x: number;
  y: number;
  left?: number;
  right?: number;
}

export const SAMPLE_TREE_LAYOUT: Record<number, TreeLayoutItem> = {
  1: { val: 1, x: 380, y: 40, left: 2, right: 3 },
  2: { val: 2, x: 230, y: 110, left: 4, right: 5 },
  3: { val: 3, x: 530, y: 110, left: 6 },
  4: { val: 4, x: 150, y: 180 },
  5: { val: 5, x: 310, y: 180 },
  6: { val: 6, x: 450, y: 180 },
};

// ============================================================
// 步骤生成核心 (满足不可篡改测试契约)
// ============================================================
export function buildTraversal020Steps(
  type: 'preorder' | 'inorder' | 'postorder' = 'preorder'
): Traversal020Step[] {
  const steps: Traversal020Step[] = [];

  const n4: SimNode = { val: 4 };
  const n5: SimNode = { val: 5 };
  const n6: SimNode = { val: 6 };
  const n2: SimNode = { val: 2, left: n4, right: n5 };
  const n3: SimNode = { val: 3, left: n6 };
  const root: SimNode = { val: 1, left: n2, right: n3 };

  const treeSnapshot: TraversalNode[] = [
    { val: 1, left: 2, right: 3 },
    { val: 2, left: 4, right: 5 },
    { val: 3, left: 6 },
    { val: 4 },
    { val: 5 },
    { val: 6 },
  ];

  const stageIdMap: Record<'preorder' | 'inorder' | 'postorder', 'stage1' | 'stage2' | 'stage3'> = {
    preorder: 'stage1',
    inorder: 'stage2',
    postorder: 'stage3',
  };
  const stageId = stageIdMap[type];

  // Entry step
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
    codeLine: TREE_TRAVERSAL_020_CODE_LINES[type].entry,
    statusBadge: { text: '准备遍历', type: 'info' },
    stageId,
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
        codeLine: TREE_TRAVERSAL_020_CODE_LINES.preorder.popVisit,
        statusBadge: { text: `访问节点 ${cur.val}`, type: 'success' },
        stageId,
      });

      if (cur.right) {
        stack.push(cur.right);
        steps.push({
          treeStructure: treeSnapshot,
          traversalType: type,
          mainStack: stack.map((n) => n.val),
          visitedResult: [...visited],
          activeNode: cur.right.val,
          decision: `右孩子 [${cur.right.val}] 存在，压入工作栈！栈顶现为: [${cur.right.val}]`,
          message: '栈后进先出，因此先压右子树以保证右子树在左子树之后被处理',
          log: `push right ${cur.right.val}`,
          codeLine: TREE_TRAVERSAL_020_CODE_LINES.preorder.pushRight,
          statusBadge: { text: `压右 ${cur.right.val}`, type: 'warning' },
          stageId,
        });
      }

      if (cur.left) {
        stack.push(cur.left);
        steps.push({
          treeStructure: treeSnapshot,
          traversalType: type,
          mainStack: stack.map((n) => n.val),
          visitedResult: [...visited],
          activeNode: cur.left.val,
          decision: `左孩子 [${cur.left.val}] 存在，后压入工作栈！栈顶现更新为: [${cur.left.val}]`,
          message: '后压左子树，使得下一轮循环首选弹出左孩子，完美实现“中左右”时序',
          log: `push left ${cur.left.val}`,
          codeLine: TREE_TRAVERSAL_020_CODE_LINES.preorder.pushLeft,
          statusBadge: { text: `压左 ${cur.left.val}`, type: 'info' },
          stageId,
        });
      }
    }
  } else if (type === 'inorder') {
    const stack: SimNode[] = [];
    const visited: number[] = [];
    let cur: SimNode | undefined = root;

    while (stack.length > 0 || cur !== undefined) {
      if (cur !== undefined) {
        stack.push(cur);
        steps.push({
          treeStructure: treeSnapshot,
          traversalType: type,
          mainStack: stack.map((n) => n.val),
          visitedResult: [...visited],
          activeNode: cur.val,
          decision: `当前指针指向节点 [${cur.val}]：左边界下潜，压入栈中并继续探测 cur.left`,
          message: '中序遍历核心：整条左边界全部依次进栈，直到走到尽头',
          log: `inorder push left boundary ${cur.val}`,
          codeLine: TREE_TRAVERSAL_020_CODE_LINES.inorder.pushLeft,
          statusBadge: { text: `下潜 ${cur.val}`, type: 'info' },
          stageId,
        });
        cur = cur.left;
      } else {
        const top = stack.pop()!;
        visited.push(top.val);
        cur = top.right;

        steps.push({
          treeStructure: treeSnapshot,
          traversalType: type,
          mainStack: stack.map((n) => n.val),
          visitedResult: [...visited],
          activeNode: top.val,
          decision: `左路已到尽头，弹出栈顶节点 [${top.val}] 打印记录！指针转向其右子树: ${cur ? `[${cur.val}]` : '空(Null)'}`,
          message: '左子树处理完毕，访问中序父节点，随后进入右子树重复左边界进栈过程',
          log: `inorder pop & visit ${top.val}`,
          codeLine: TREE_TRAVERSAL_020_CODE_LINES.inorder.popVisitRight,
          statusBadge: { text: `访问 ${top.val}`, type: 'success' },
          stageId,
        });
      }
    }
  } else {
    // Postorder (双栈法)
    const s1: SimNode[] = [root];
    const s2: SimNode[] = [];
    const visited: number[] = [];

    while (s1.length > 0) {
      const cur = s1.pop()!;
      s2.push(cur);

      steps.push({
        treeStructure: treeSnapshot,
        traversalType: type,
        mainStack: s1.map((n) => n.val),
        collectStack: s2.map((n) => n.val),
        visitedResult: [...visited],
        activeNode: cur.val,
        decision: `主栈 s1 弹出 [${cur.val}] 并压入收集栈 s2！时序由“中右左”收集驱动`,
        message: '双栈法巧妙之处：先按 中 ➔ 右 ➔ 左 压入收集栈，从收集栈倒序弹出即为 左右中！',
        log: `postorder s1 pop ${cur.val} -> push s2`,
        codeLine: TREE_TRAVERSAL_020_CODE_LINES.postorder.s1PopS2Push,
        statusBadge: { text: `收集 ${cur.val}`, type: 'warning' },
        stageId,
      });

      if (cur.left) s1.push(cur.left);
      if (cur.right) s1.push(cur.right);
    }

    while (s2.length > 0) {
      const cur = s2.pop()!;
      visited.push(cur.val);

      steps.push({
        treeStructure: treeSnapshot,
        traversalType: type,
        mainStack: [],
        collectStack: s2.map((n) => n.val),
        visitedResult: [...visited],
        activeNode: cur.val,
        decision: `收集栈 s2 依次弹出 [${cur.val}] 输出至结果序列！当前已输出: [${visited.join(', ')}]`,
        message: '逆序弹出收集栈，最终产出合法的后序遍历序列 (左右中)',
        log: `postorder s2 pop -> ans ${cur.val}`,
        codeLine: TREE_TRAVERSAL_020_CODE_LINES.postorder.s2PopAns,
        statusBadge: { text: `后序输出 ${cur.val}`, type: 'success' },
        stageId,
      });
    }
  }

  // Final Step
  const lastStep = steps[steps.length - 1];
  steps.push({
    ...lastStep,
    activeNode: -1,
    decision: `🎉 遍历圆满完成！最终访问序列为: [${lastStep.visitedResult.join(', ')}]。显式栈模拟递归时序正确收敛！`,
    message: '全部节点均已按正确时序完成弹出与输出',
    log: `traversal complete: [${lastStep.visitedResult.join(',')}]`,
    statusBadge: { text: '遍历收敛', type: 'success' },
    stageId,
  });

  return steps;
}
