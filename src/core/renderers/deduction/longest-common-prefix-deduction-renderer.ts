/**
 * 最长公共前缀 (Longest Common Prefix · LeetCode 14)
 * 全景推演树渲染策略 (LongestCommonPrefixDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class LongestCommonPrefixDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'longest-common-prefix';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'longest-common-prefix' ||
      modelId === '14' ||
      modelId === 'leetcode-14' ||
      modelId === 'longest-common-prefix-vertical'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 14. 最长公共前缀 (Longest Common Prefix) · 全景推演树',
      badge: '纵向扫描逐列字符对齐 · 基准首串试探 · 即时失配截断返回 · 严格 O(S)',
      descriptionHtml: `
        核心目标：查找字符串数组中的最长公共前缀。如果不存在公共前缀，返回空字符串 <code>""</code>。<br/>
        <strong>经典纵向扫描（Vertical Scanning）核心教研范式：</strong><br/>
        1. <strong>纵向对齐比对机制（Vertical Column Alignment）</strong>：<br/>
        相比于横向两两求前缀可能造成不必要的长字符串比较，纵向扫描以 <code>strs[0]</code> 作为基准模板串，逐列（第 0 列、第 1 列...）向下巡检所有字符串在同一列位置上的字符；<br/>
        2. <strong>两大失配即时截断红线</strong>：<br/>
        遍历到基准字符串的第 <code>i</code> 个字符 <code>c = strs[0].charAt(i)</code> 时，检查其它字符串 <code>strs[j]</code>：<br/>
        • <strong>红线 ①（长度越界）</strong>：<code>i == strs[j].length()</code>，说明该字符串已到尽头，不可能拥有更长公共前缀；<br/>
        • <strong>红线 ②（字符失配）</strong>：<code>strs[j].charAt(i) != c</code>，说明在此列发生分歧；<br/>
        一旦命中任一红线，立即直接截断返回 <code>strs[0].substring(0, i)</code>！<br/>
        3. <strong>全员通过天然成冠</strong>：<br/>
        若完整比对完基准字符串的所有列且从未触发红线，说明整个基准串 <code>strs[0]</code> 就是所有串的最长公共前缀。
      `,
      initialStateText: `检索入口：longestCommonPrefix(strs) ➔ 以 strs[0] 每一列字符 c 为基准，纵向巡视其他各行。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空数组特判 (Empty Guard)',
        valuesStr: 'strs == null || strs.length == 0 ➔ 数组无元素，返回空字符串 ""',
      },
      {
        prefix: '└───',
        label: '单串数组特判 (Single String)',
        valuesStr: 'strs.length == 1 ➔ 唯一字符串自身即为最长公共前缀，直接返回 strs[0]',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 逐列推进并提取基准字符 (Column Step & Extract Char)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Col i Loop</span>',
      detailLines: [
        'for (int i = 0; i < strs[0].length(); i++) {',
        '  char c = strs[0].charAt(i);',
      ],
      fillLine: '树立标尺：以基准串第 i 列字符 c 作为该垂直列全员必须通过的考核标准',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 纵向遍历各行并实施双红线核验 (Vertical Column Scan)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Row j Probe</span>',
      detailLines: [
        '  for (int j = 1; j < strs.length; j++) {',
        '    if (i == strs[j].length() || strs[j].charAt(i) != c) {',
        '      return strs[0].substring(0, i); // 立即截断交付！',
        '    }',
        '  }',
        '}',
      ],
      fillLine: '即时刹车：任何一行长度耗尽或字符失配，当前列即为分水岭，立即截断并返回前缀',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 首串全量贯通交付为冠 (Full Match Fallback)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Return strs[0]</span>',
      detailLines: [
        'return strs[0]; // 基准串全数通过考验证明其全长皆为公共前缀',
      ],
      fillLine: '全员一致：所有字符列均完美契合，首串整体就是无可挑剔的最长公共前缀',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '最长公共前缀纵向推演流 (Pick Baseline ➔ Vertical Scan ➔ Immediate Truncate)',
      subtitle: 'LeetCode 14 Longest Common Prefix Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '最长公共前缀字符串 String',
      complexityStr: '时间复杂度: O(S) S 为所有字符总数，最坏情况下遍历全部字符 · 空间复杂度: O(1)',
    });

    return header + baseCase + round + finalReturn;
  }
}
