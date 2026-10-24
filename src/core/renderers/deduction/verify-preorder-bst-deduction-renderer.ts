/**
 * 验证二叉搜索树的前序遍历序列 (Verify Preorder Sequence in BST · LeetCode 255)
 * 全景推演树渲染策略 (VerifyPreorderBstDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class VerifyPreorderBstDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'verify-preorder-sequence-in-bst';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'verify-preorder-sequence-in-bst' ||
      modelId === '255' ||
      modelId === 'leetcode-255' ||
      modelId === 'verify-preorder-bst'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 255. 验证二叉搜索树的前序遍历序列 · 全景推演树',
      badge: '大厂高频面试题 · 单调递减栈模拟左斜走入 / 遇拐点下界跃升 (minLimit 抬升) / 严格 O(N) 线性校验',
      descriptionHtml: `
        核心目标：给定一个整数数组，按<strong>前序遍历</strong>的顺序给出二叉搜索树（BST）的节点值。请判断该序列是否可能来自某棵合法的二叉搜索树。<br/>
        <strong>二叉搜索树左偏单调栈与右分支下界跃升公理：</strong><br/>
        1. <strong>BST 前序遍历的几何轨迹</strong>：<br/>
        • 前序遍历顺序为：<code>根 ➔ 左子树 ➔ 右子树</code>；<br/>
        • 只要一直在往左子树深入，根据 BST 性质，节点数值<strong>严格递减</strong>（形成向左扎入的左斜链）；<br/>
        • 一旦数值发生<strong>升高（拐点）</strong>，说明当前节点已经拐入了某棵祖先节点的<strong>右子树</strong>！<br/>
        2. <strong>下界跃升机制（minLimit 抬升定理）</strong>：<br/>
        • 维护一个单调递减栈 <code>stack</code> 和当前允许的<strong>最小值下界 <code>minLimit = -∞</code></strong>；<br/>
        • 任何时刻，如果遇到 <code>val &lt; minLimit</code>，说明右子树中竟然出现了比其根节点还要小的非法节点，<strong>瞬间断言非法 return false</strong>！<br/>
        • 遇到 <code>val &gt; stack.top()</code> 时，持续弹出栈顶：<code>minLimit = stack.pop();</code>。<br/>
          <strong>最后弹出的那个节点正是当前右子树的直接父节点</strong>，此后全树的所有后续节点数值<strong>必须全部严格大于这个 minLimit</strong>！<br/>
        • 将当前 <code>val</code> 压栈继续探索；遍历顺畅收尾则判定为合法 BST。
      `,
      initialStateText: `验证入口：verifyPreorder(preorder) ➔ stack = [], minLimit = -∞ 启动左斜单调栈探索。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '边界退化判定 (Length <= 2)',
        valuesStr: 'preorder.length <= 2 ➔ 必然合法，直接 return true',
      },
      {
        prefix: '└───',
        label: '终止判定条件 (Termination Condition)',
        valuesStr: '遍历完成且中途无越界 ➔ 判定为合法二叉搜索树前序遍历',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 深入左子树单调递减入栈 (Descend Left Branch)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Push Stack</span>',
      detailLines: [
        'if (val < minLimit) return false; // 破下界，非法！',
        'while (!stack.isEmpty() && val > stack.peek()) {',
        '  minLimit = stack.pop(); // 拐入右子树，抬升下界',
        '}',
        'stack.push(val);',
      ],
      fillLine: '左斜下潜：沿左子树一路向下递减，压栈保留沿途祖先节点',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 拐入右子树与祖先下界抬升 (Ascend & Lift minLimit)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">minLimit = pop()</span>',
      detailLines: [
        '// 持续出栈直至找到属于 val 的最近根节点',
        '// minLimit 跃升为该根节点的值，后续全序列必须大于 minLimit',
      ],
      fillLine: '界限锁定：进入右子树后，祖先节点的值即为全子树不可逾越的底线',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 全程合法验证闭环交付 (Final Validation Delivery)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Valid BST</span>',
      detailLines: [
        'return true; // 完整验证序列合法性',
      ],
      fillLine: '严格规约：每个元素进出栈一次，O(N) 极速完成 BST 前序合法性判定',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: 'BST 前序验证推演流 (Left Descent ➔ Invariant Stack ➔ Right Branch Lower Bound Lift)',
      subtitle: 'LeetCode 255 Monotonic Stack Lower-Bound Invariant',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '判定布尔值 (true / false)',
      complexityStr: '时间复杂度: O(N) 线性遍历 · 空间复杂度: O(N) 单调栈（可就地复用数组达 O(1)）',
    });

    return header + baseCase + round + finalReturn;
  }
}
