/**
 * 电话号码的字母组合 (Letter Combinations of a Phone Number · LeetCode 17)
 * 全景推演树渲染策略 (PhoneLettersDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class PhoneLettersDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'phone-letters';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'phone-letters' ||
      modelId === '17' ||
      modelId === 'leetcode-17' ||
      modelId === 'letter-combinations' ||
      modelId === 'letter-combinations-of-a-phone-number'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 17. 电话号码的字母组合 · 全景推演树',
      badge: '多集合分层决策树 · 数字到字母哈希映射 · 深度变量 index 推进 · O(4^N)',
      descriptionHtml: `
        核心目标：给定一个仅包含数字 $2 \sim 9$ 的字符串，返回所有它能表示的字母组合。<br/>
        <strong>《代码随想录》核心教研范式——多集合组合与分层推进：</strong><br/>
        1. <strong>多集合组合本质</strong>：<br/>
        之前的组合问题是在<strong>同一个集合</strong>中选数，需要 <code>startIndex</code> 避免逆序重复；而本题是<strong>在不同的集合（每个按键对应的字母集）之间各选一个元素组合</strong>，因此不需要 <code>startIndex</code>，每层独立遍历当前按键的所有字符；<br/>
        2. <strong>数字字母映射表（Static Mapping）</strong>：<br/>
        预置常量表 <code>letterMap = ["", "", "abc", "def", "ghi", "jkl", "mno", "pqrs", "tuv", "wxyz"]</code>；<br/>
        3. <strong>递归深度控制变量 index</strong>：<br/>
        参数 <code>index</code> 表示当前正在处理 <code>digits</code> 的第几个数字，也是当前递归树的深度。当 <code>index == digits.length()</code> 时，说明所有按键均已落子，收割结果并 <code>return</code>。
      `,
      initialStateText: `组合入口：letterCombinations(digits) ➔ backtracking(digits, 0)，path = StringBuilder，res = []。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空串输入特判 (Empty Digits Guard)',
        valuesStr: 'digits == null || digits.length() == 0 ➔ 返回空列表 []',
      },
      {
        prefix: '└───',
        label: '满额叶子收割 (Depth Met Digits Length)',
        valuesStr: 'index == digits.length() ➔ 路径拼装完毕，res.add(path.toString())，执行 return',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 映射提取当前数字对应的字母集合 (Extract Letter Set)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Map Digit</span>',
      detailLines: [
        'int digit = digits.charAt(index) - \'0\';',
        'String letters = letterMap[digit]; // 例如 2 映射为 "abc"',
        'for (int i = 0; i < letters.length(); i++) {',
        '  path.append(letters.charAt(i));',
      ],
      fillLine: '按键译码：提取当前深度对应的按键字母候选，并将其追加至当前路径末尾',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 纵深递推进入下一按键字符集 (Recurse to index + 1)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">index + 1</span>',
      detailLines: [
        '  backtracking(digits, index + 1); // 推进深度，处理下一个数字',
      ],
      fillLine: '跨集合探索：当前按键已选定一个字母，递归深入下一个按键的字符集合',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 状态回退与撤销字符选择 (Backtrack & Delete)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">path.deleteCharAt()</span>',
      detailLines: [
        '  path.deleteCharAt(path.length() - 1); // 回溯撤销',
        '}',
      ],
      fillLine: '现场还原：删除末位字符，回到调用前状态，继续尝试当前按键的下一个候选字母',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '电话号码字母组合推演流 (Map Digit ➔ Recurse Next Digit ➔ Backtrack Pop)',
      subtitle: 'LeetCode 17 Letter Combinations Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '所有合法的字母组合字符串列表',
      complexityStr: '时间复杂度: O(3^M * 4^N) M为3字母按键数，N为4字母按键数 · 空间复杂度: O(N) 递归树深度',
    });

    return header + baseCase + round + finalReturn;
  }
}
