/**
 * 翻转字符串里的单词 (Reverse Words in a String · LeetCode 151)
 * 全景推演树渲染策略 (ReverseWordsDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class ReverseWordsDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'reverse-words';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'reverse-words' ||
      modelId === '151' ||
      modelId === 'leetcode-151' ||
      modelId === 'reverse-words-in-a-string'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 151. 翻转字符串里的单词 (Reverse Words in a String) · 全景推演树',
      badge: '快慢双指针去多余空格 · 全局整体反转 + 单词局部反转 · 零额外切片 · O(1) 空间',
      descriptionHtml: `
        核心目标：给你一个字符串 <code>s</code>，反转字符串中单词的顺序，且单词之间仅保留单个空格，去除首尾全部多余空格。<br/>
        <strong>《代码随想录》核心教研范式——三步反转法：</strong><br/>
        1. <strong>第一步：快慢指针原地移除多余空格（Remove Extra Spaces）</strong>：<br/>
        利用快慢双指针剔除所有首部、尾部多余空格，以及单词之间的连续多余空格（在单词之间手动补一个空格 <code>s[slow++] = ' '</code>）；<br/>
        2. <strong>第二步：全局整体反转（Reverse Entire String）</strong>：<br/>
        将有效区间 <code>[0, slow - 1]</code> 进行全局整体反转。此时<strong>单词的排列顺序已完全反转</strong>，但每个单词内部的字母也变成了倒序；<br/>
        3. <strong>第三步：单词局部反转（Reverse Each Word Individually）</strong>：<br/>
        双指针寻找每个单词的起止边界 <code>[start, end]</code>，对每个单词内部再次执行局部反转，负负得正，单词内部字母恢复正常顺序！
      `,
      initialStateText: `反转入口：reverseWords(s) ➔ 快慢指针原地清洗空格 ➔ 全局反转 ➔ 单词局部反转。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空格清洗不变量 (Space Cleaning)',
        valuesStr: '清洗后单词间恰有 1 个空格隔开，且首尾绝对无空格，有效长度收缩为 slow',
      },
      {
        prefix: '└───',
        label: '双重反转等价公理 (Double Reverse Invariant)',
        valuesStr: '全局反转(颠倒单词顺序) + 局部反转(复原单词内部字母) = 完美单词倒序',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 快慢指针清洗首尾与冗余空格 (Clean Spaces)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Slow & Fast</span>',
      detailLines: [
        'int slow = 0;',
        'for (int fast = 0; fast < s.length; fast++) {',
        '  if (s[fast] != \' \') {',
        '    if (slow != 0) s[slow++] = \' \'; // 单词之间补单个空格',
        '    while (fast < s.length && s[fast] != \' \') s[slow++] = s[fast++];',
        '  }',
        '}',
      ],
      fillLine: '去粗取精：剔除首尾空隙与多重冗余空格，紧凑压实为标准单空格分隔阵列',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 全局整体反转颠倒单词宏观顺序 (Reverse Entire String)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Reverse All</span>',
      detailLines: [
        'reverse(s, 0, slow - 1); // 颠倒整个有效区间的字符',
      ],
      fillLine: '宏观倒置：末尾单词成功跃迁至头部，首部单词沉底至尾部，单词宏观拓扑完成逆序',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 扫描每个单词并局部反转复原 (Reverse Individual Words)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Reverse Word</span>',
      detailLines: [
        'for (int start = 0; start < slow; start++) {',
        '  int end = start;',
        '  while (end < slow && s[end] != \' \') end++;',
        '  reverse(s, start, end - 1); // 单词内部负负得正',
        '  start = end;',
        '}',
      ],
      fillLine: '微观拨正：单词内部再次对撞反转，使颠倒的英文字母瞬间复原为正序阅读形态',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '单词翻转三步推演流 (Clean Spaces ➔ Reverse All ➔ Reverse Each Word)',
      subtitle: 'LeetCode 151 Reverse Words Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '单词倒序排列的字符串',
      complexityStr: '时间复杂度: O(N) 三次单趟扫描处理 · 空间复杂度: O(1) 原地字符数组修改',
    });

    return header + baseCase + round + finalReturn;
  }
}
