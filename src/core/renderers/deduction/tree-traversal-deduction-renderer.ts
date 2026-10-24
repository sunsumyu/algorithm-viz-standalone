/**
 * 二叉树的前序/中序/后序遍历 (Binary Tree Traversal · LeetCode 144/94/145 / Class 018)
 * 全景推演树渲染策略 (TreeTraversalDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class TreeTraversalDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'tree-traversal';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'tree-traversal' ||
      modelId === '144' ||
      modelId === '94' ||
      modelId === '145' ||
      modelId === 'class018-code01' ||
      modelId === 'binary-tree-traversal' ||
      modelId === 'preorder-inorder-postorder'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '二叉树前序 / 中序 / 后序遍历 (Binary Tree Traversal · LC 144/94/145) · 全景推演树',
      badge: '代码随想录 & 左程云 Class 018 · 递归序三访节点 / 显式栈遍历 / 统一空指针标记法',
      descriptionHtml: `
        目标：完备掌握二叉树的三种深度优先遍历序列：<strong>前序（根-左-右）、中序（左-根-右）、后序（左-右-根）</strong>。<br/>
        <strong>左程云 Class 018 与《代码随想录》教学破局点——递归序的三次到达与访问时机：</strong><br/>
        在递归遍历过程中，每个节点都会被<strong>物理访问且仅访问三次</strong>（即递归序）：<br/>
        1. <strong>第 1 次到达该节点</strong>：前序遍历打印时机（根 ➔ 左 ➔ 右）；<br/>
        2. <strong>第 2 次从左子树返回时</strong>：中序遍历打印时机（左 ➔ 根 ➔ 右）；<br/>
        3. <strong>第 3 次从右子树返回时</strong>：后序遍历打印时机（左 ➔ 右 ➔ 根）；<br/>
        <strong>迭代法的本质</strong>：利用显式栈模拟系统函数调用栈，掌握一路向左扎底、单栈先右后左与统一空标记法四大范式。
      `,
      initialStateText: `遍历入口：traversal(root) ➔ 递归栈/迭代栈自顶向下展开全树深度优先推演。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '递归判空基底 (Base Null)',
        valuesStr: 'cur == null ➔ return (空子树到达尽头，向上弹栈回溯)',
      },
      {
        prefix: '└───',
        label: '迭代栈终止准则 (Stack Empty Condition)',
        valuesStr: 'stack.isEmpty() && cur == null ➔ 遍历完成，全节点有序输出完毕',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 递归序的三次触碰与前中后序本质 (The Essence of Recursive Order)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Recursive Order</span>',
      detailLines: [
        '第 1 次到达 cur: 【前序位置】 res.add(cur.val) ➔ 优先记录根节点',
        'traversal(cur.left) ➔ 递归探入左子树；归来时为第 2 次到达: 【中序位置】 res.add(cur.val)',
        'traversal(cur.right) ➔ 递归探入右子树；归来时为第 3 次到达: 【后序位置】 res.add(cur.val)',
      ],
      fillLine: '时空对称性：时间复杂度严格 O(N)，空间复杂度 O(H)，理解递归序即掌握树形算法地基',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 显式单栈模拟系统调用栈 (Explicit Stack Traversal)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Explicit Stack</span>',
      detailLines: [
        '前序遍历迭代：根入栈；出栈访问 cur；先压右孩子后压左孩子（确保左路先出栈）',
        '中序遍历迭代：一路向左下扎并将路径全节点入栈，直到 cur == null 时弹栈输出并转向右分支',
        '后序遍历迭代：前序（根-右-左）收集后，整体逆序翻转即得（左-右-根），数学几何对偶优雅绝伦',
      ],
      fillLine: '显式栈控流：彻底消除系统递归爆栈隐患，工业级状态机推演',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 代码随想录统一迭代法 (Unified Null Marker Iteration)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Null-Marker Queue</span>',
      detailLines: [
        '解决传统迭代法前中后序写法风格不统一痛点：将待访问节点压栈后，紧随压入 null 空标记指针',
        '当弹出 null 时，说明下一个栈顶元素为真正待输出节点，立即弹出并收录到结果集',
        '一套模板仅需微调节点与 null 的压栈先后顺序，即可 100% 统一前序、中序、后序三大迭代代码结构',
      ],
      fillLine: '极致优雅的统一模板：利用 null 指针做时序标记，破解初学者迭代法割裂记忆难题',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '三级演化阶梯全景推演流 (Recursive Order ➔ Explicit Stack ➔ Null Marker Unified)',
      subtitle: 'Programmer Carl & Zuoshen Class 018 Tree Traversal Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return res; // 严格按前序/中序/后序排布的节点序列',
      answerDescription: '时间复杂度严格 O(N)，全树每个节点进出栈一次；空间复杂度 O(H)（树的高度）。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
