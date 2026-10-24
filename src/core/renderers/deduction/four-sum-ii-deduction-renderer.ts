/**
 * 四数相加 II (4Sum II · LeetCode 454)
 * 全景推演树渲染策略 (FourSumIIDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class FourSumIIDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'four-sum-ii';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'four-sum-ii' ||
      modelId === '454' ||
      modelId === 'leetcode-454' ||
      modelId === 'four-sum-ii-hash'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 454. 四数相加 II (4Sum II) · 全景推演树',
      badge: '2+2 折半降维分治 · A+B 频次哈希存储 · -(C+D) 瞬间碰撞求和 · 严格 O(N²)',
      descriptionHtml: `
        核心目标：给定四个等长整数数组 <code>nums1, nums2, nums3, nums4</code>，计算有多少个元组 <code>(i, j, k, l)</code> 满足四数之和为 0。<br/>
        <strong>《代码随想录》核心教研范式——2+2 折半降维与哈希频次碰撞：</strong><br/>
        1. <strong>维度爆炸与折半优化（Halving Dimension Explosion）</strong>：<br/>
        四重暴力循环为 $O(N^4)$，必然超时。如果将四个数组均分为两半：前两个数组一组 $(A+B)$，后两个数组一组 $(C+D)$，将四维问题转变为两组二维哈希碰撞，时间复杂度降至 $O(N^2)$；<br/>
        2. <strong>第一阶段：统计 A + B 频次表</strong>：<br/>
        双重遍历 <code>nums1</code> 和 <code>nums2</code>，计算所有两数之和 <code>sumAB = u + v</code>，在哈希表中记录出现次数：<code>map.put(sumAB, map.getOrDefault(sumAB, 0) + 1)</code>；<br/>
        3. <strong>第二阶段：碰撞匹配 -(C + D)</strong>：<br/>
        双重遍历 <code>nums3</code> 和 <code>nums4</code>，计算期望补数 <code>target = -(x + y)</code>。<br/>
        在哈希表中查询 <code>map.get(target)</code>，只要命中就累加到全局计数器 <code>count += map.get(target)</code>！无需考虑去重，只需精准统计总出现次数。
      `,
      initialStateText: `求解入口：fourSumCount(A, B, C, D) ➔ Map<Integer, Integer> map = new HashMap<>()，int count = 0。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空数组特判 (Empty Guard)',
        valuesStr: 'nums1 == null || nums1.length == 0 ➔ 数组无元素，直接返回 0',
      },
      {
        prefix: '└───',
        label: '独立性公理 (Index Independence)',
        valuesStr: '四个数组下标各自独立，无需像 3Sum/4Sum 那样做复杂的连续数值跳跃去重',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 双层循环遍历 A 和 B 登记两数和频次 (Build A+B Frequency Map)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Map A+B</span>',
      detailLines: [
        'for (int u : nums1) {',
        '  for (int v : nums2) {',
        '    map.put(u + v, map.getOrDefault(u + v, 0) + 1);',
        '  }',
        '}',
      ],
      fillLine: '半壁江山：枚举所有可能的 A+B 组合并将每种和的出现频次完整落盘入哈希表',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 双层循环遍历 C 和 D 探测相反数碰撞 (Probe -(C+D) in Map)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">Probe Target</span>',
      detailLines: [
        'for (int x : nums3) {',
        '  for (int y : nums4) {',
        '    int target = -(x + y);',
        '    if (map.containsKey(target)) {',
        '      count += map.get(target); // 累加对应的 A+B 配对可能性',
        '    }',
        '  }',
        '}',
      ],
      fillLine: '瞬间碰撞：若哈希表中存在 -(x+y)，代表存在等于该和的 A+B 组合，将对应频次全额累加',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 统计结算交付有效四元组总数 (Return Total Count)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[9px]">Return Count</span>',
      detailLines: [
        'return count;',
      ],
      fillLine: '大获全胜：经由两次 O(N²) 的遍历，无任何回溯开销直接完成 O(N²) 总计求和',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '四数相加 II 降维碰撞推演流 (Hash A+B ➔ Probe -(C+D) ➔ Sum Frequency)',
      subtitle: 'LeetCode 454 4Sum II Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '满足条件的四元组总计数 count',
      complexityStr: '时间复杂度: O(N²) 两次独立的双重循环 · 空间复杂度: O(N²) 哈希表最多存 N² 个和',
    });

    return header + baseCase + round + finalReturn;
  }
}
