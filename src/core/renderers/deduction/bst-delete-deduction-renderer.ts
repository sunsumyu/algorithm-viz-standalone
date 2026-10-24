/**
 * 删除二叉搜索树中的节点 (Delete Node in a BST · LeetCode 450)
 * 全景推演树渲染策略 (BstDeleteDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class BstDeleteDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'bst-delete';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'bst-delete' ||
      modelId === '450' ||
      modelId === 'leetcode-450' ||
      modelId === 'delete-node-in-a-bst'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 450. 删除二叉搜索树中的节点 (Delete Node in BST) · 全景推演树',
      badge: '代码随想录 · 五大场景分类讨论 / 左树嫁接右后继 / 算法导论值替换',
      descriptionHtml: `
        二叉搜索树的删除是 BST 操作中最复杂且指针最细腻的经典难题！<br/>
        <strong>《代码随想录》五大删除场景分类图解：</strong><br/>
        ① <strong>未命中</strong>：<code class="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded">root == null</code>，未找到目标值，原样返回 <code class="font-mono text-slate-600">null</code>；<br/>
        ② <strong>叶子节点</strong>：左右子树皆空，直接销毁该节点，返回 <code class="font-mono text-slate-600">null</code>；<br/>
        ③ <strong>单右子树</strong>：左空右不空，右孩子直接顶替上位，返回 <code class="font-mono text-blue-700 font-bold">root.right</code>；<br/>
        ④ <strong>单左子树</strong>：右空左不空，左孩子直接顶替上位，返回 <code class="font-mono text-blue-700 font-bold">root.left</code>；<br/>
        ⑤ <strong>双子树齐全</strong>（核心痛点）：左右子树均非空！<br/>
        · <strong>解法一（左树直接嫁接法 · Carl 强推）</strong>：寻找右子树最左节点（中序后继），将原左子树完整嫁接到该后继的左孩子上，原右孩子升格为新根！<br/>
        · <strong>解法二（后继覆盖法 · 算法导论经典）</strong>：将右子树最小节点的值拷贝覆盖当前节点，递归在右子树中删除该后继！
      `,
      initialStateText: `删除入口：deleteNode(root, key) ➔ 递归单向检索定位目标；命中后依据五大场景执行树形重构并回溯重定父指针。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '场景 1: 未找到删除节点 (Base Null)',
        valuesStr: 'root == null ➔ 未命中目标，返回 null',
      },
      {
        prefix: '├───',
        label: '场景 2: 删除叶子节点 (Leaf Node)',
        valuesStr: 'root.left == null && root.right == null ➔ return null (直接移除)',
      },
      {
        prefix: '├───',
        label: '场景 3: 仅有右孩子 (Right Child Only)',
        valuesStr: 'root.left == null ➔ return root.right (右孩子顶替上位)',
      },
      {
        prefix: '└───',
        label: '场景 4: 仅有左孩子 (Left Child Only)',
        valuesStr: 'root.right == null ➔ return root.left (左孩子顶替上位)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 递归直接嫁接删除 (Child Grafting · LC 450 优雅指针重连)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-mono text-[9px]">Grafting Tree</span>',
      detailLines: [
        'cur = root.right; while (cur.left != null) cur = cur.left ➔ 寻找右子树最左后继节点',
        'cur.left = root.left ➔ 将待删节点的整个左子树嫁接在后继的左孩子上',
        'return root.right ➔ 原右子树直接取代被删节点，结构完整保留',
      ],
      fillLine: '直接嫁接法：无需改变任何节点内部数值，仅调整引用拓扑，保留对象的唯一性与元信息',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 递归后继节点值覆盖 (Successor Value Replacement · 算法导论经典)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-mono text-[9px]">Value Replace</span>',
      detailLines: [
        'successor = getMin(root.right) ➔ 定位右子树数值最小节点',
        'root.val = successor.val ➔ 将后继值拷贝覆盖到当前待删节点',
        'root.right = deleteNode(root.right, successor.val) ➔ 递归在右子树删除后继节点（规约为场景 2 或 3）',
      ],
      fillLine: '后继值覆盖法：保持二叉树既有树形平衡度，但涉及节点内部数值的原地覆写',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 双指针显式迭代删除 (Iterative Two-Pointers BST Deletion)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-mono text-[9px]">Iterative O(1)</span>',
      detailLines: [
        'while (cur != null && cur.val != key) { parent = cur; cur = key < cur.val ? cur.left : cur.right; } ➔ 迭代双指针锁定目标',
        'newChild = deleteOneNode(cur) ➔ 对目标节点执行五大场景嫁接重构',
        'if (parent == null) return newChild; if (parent.left == cur) parent.left = newChild; else parent.right = newChild; ➔ 父节点重连',
      ],
      fillLine: '双指针迭代法：完全摆脱系统调用栈与递归深度限制，空间开销严格 O(1)',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三级演化阶梯全景推演流 (From Grafting to Replacement to Iterative O(1))',
      subtitle: 'Programmer Carl BST Node Deletion Five Scenarios Progression',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return root; // 返回删除目标键后的合法二叉搜索树根节点',
      answerDescription: '平均时间复杂度 O(log N)，最坏退化单链 O(N)；递归空间复杂度 O(H)，迭代空间复杂度严格 O(1)。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
