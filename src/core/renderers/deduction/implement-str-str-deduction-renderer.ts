/**
 * 找出字符串中第一个匹配项的下标 (KMP 算法 · LeetCode 28)
 * 全景推演树渲染策略 (ImplementStrStrDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class ImplementStrStrDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'str-str';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'str-str' ||
      modelId === 'implement-str-str' ||
      modelId === '28' ||
      modelId === 'leetcode-28' ||
      modelId === 'kmp-algorithm'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 28. 找出字符串中第一个匹配项的下标 (KMP 算法) · 全景推演树',
      badge: '前缀表 next 数组构建 · 最长相等前后缀追溯 · 主串指针不回退 · 严格 O(M+N)',
      descriptionHtml: `
        核心目标：在主串 <code>haystack</code> 中找出模式串 <code>needle</code> 的第一个匹配项下标，失配返回 -1。<br/>
        <strong>《代码随想录》核心教研范式——KMP 前缀表与状态回退公理：</strong><br/>
        1. <strong>告别暴力回溯，主串指针 i 绝不回头</strong>：<br/>
        暴力匹配在失配时将主串指针回退至 $i - j + 1$，产生 $O(M \\times N)$ 惨烈开销。KMP 通过<strong>前缀表（Next 数组）记录模式串的最长相等前后缀长度</strong>，失配时主串指针 <code>i</code> 稳步前进，仅让模式串指针 <code>j</code> 跳转回退至 <code>next[j - 1]</code>！<br/>
        2. <strong>Next 数组构建四步曲</strong>：<br/>
        • <strong>初始化</strong>：<code>next[0] = 0; int j = 0;</code>（<code>j</code> 代表前缀末尾，也是最长相等前后缀长度）；<br/>
        • <strong>前后缀失配回退</strong>：<code>while (j > 0 && s[i] != s[j]) j = next[j - 1];</code> 递归回退直至字符匹配或退至 0；<br/>
        • <strong>前后缀吻合推进</strong>：<code>if (s[i] == s[j]) j++;</code> 匹配成功则前缀长度延伸 1 格；<br/>
        • <strong>落盘登记</strong>：<code>next[i] = j;</code> 将当前子串的最长公共前后缀长度写入数组；<br/>
        3. <strong>主串极速滑窗匹配</strong>：<br/>
        主串逐位扫描。字符相同时双指针同步前推 <code>i++, j++</code>；字符不同时，<code>j</code> 依循 <code>next[j - 1]</code> 瞬时跳到前缀后方，零冗余重叠比对。
      `,
      initialStateText: `匹配入口：strStr(haystack, needle) ➔ 预编译 getNext(next, needle) ➔ 遍历 i 匹配主串。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空模式串特判 (Empty Needle Guard)',
        valuesStr: 'needle.length() == 0 ➔ 题意定义空串命中首位，直接 return 0',
      },
      {
        prefix: '└───',
        label: '主串尺寸短于模式串 (Length Guard)',
        valuesStr: 'haystack.length() < needle.length() ➔ 空间不足以容纳模式串，直接 return -1',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 预处理模式串生成前缀表 (Build Next Array)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">getNext()</span>',
      detailLines: [
        'int[] next = new int[needle.length()];',
        'for (int i = 1, j = 0; i < needle.length(); i++) {',
        '  while (j > 0 && needle.charAt(i) != needle.charAt(j)) j = next[j - 1];',
        '  if (needle.charAt(i) == needle.charAt(j)) j++;',
        '  next[i] = j;',
        '}',
      ],
      fillLine: '未雨绸缪：提取模式串自重叠几何特征，将最长相等前后缀长度固化在 next 数组',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 主串驱动单向滑窗与前缀表快速回退 (Stream Match & Fallback)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">Probe & Fallback</span>',
      detailLines: [
        'for (int i = 0, j = 0; i < haystack.length(); i++) {',
        '  while (j > 0 && haystack.charAt(i) != needle.charAt(j)) j = next[j - 1];',
        '  if (haystack.charAt(i) == needle.charAt(j)) j++;',
      ],
      fillLine: '无回退主轴：主串 i 步步高升，失配时仅让 j 沿 next 递归回撤，保留已匹配信息',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 模式串完整抵达成全匹配 (Harvest Match Index)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Match Harvest</span>',
      detailLines: [
        '  if (j == needle.length()) {',
        '    return i - needle.length() + 1; // 捕获首个全量吻合下标！',
        '  }',
        '}',
        'return -1;',
      ],
      fillLine: '一举中的：当 j 推进至模式串尾部，即刻计算并交付主串中匹配起点的物理下标',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: 'KMP 字符串模式匹配推演流 (Build Next ➔ Single-Pass Match ➔ Harvest Index)',
      subtitle: 'LeetCode 28 Implement strStr() Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '首个匹配起始下标 (或 -1)',
      complexityStr: '时间复杂度: O(M + N) 主串与模式串各单趟 · 空间复杂度: O(M) next 数组空间',
    });

    return header + baseCase + round + finalReturn;
  }
}
