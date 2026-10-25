/**
 * 二分三板斧：精确查找 / >= target 最左位置 / 局部最小值 (Class 004 · Class 005)
 * 全景推演树渲染策略 (BinarySearchTriadDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class BinarySearchTriadDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'binary-search-005';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'binary-search-005' ||
      modelId === 'binary-search-logarithmic-004' ||
      modelId === 'class004-code02' ||
      modelId === 'class005-code01' ||
      modelId === 'binary-search-verifier' ||
      modelId === 'logarithmic-verifier'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '体系课 004 / 005. 二分搜索三板斧 · 全景推演树',
      badge: '精确命中 · >= target 最左边界 · 无序数组局部最小值 · 对数器验证 · O(log N)',
      descriptionHtml: `
        核心认知：<strong>二分的本质不是“有序”，而是“能根据 mid 处的信息确定性地丢掉一半”</strong>。<br/>
        1. <strong>精确命中</strong>：有序数组中 <code>arr[mid]</code> 与 <code>target</code> 三分支比较，命中即返回；<br/>
        2. <strong>&gt;= target 最左位置</strong>：<code>arr[mid] &gt;= target</code> 时<strong>先记录 ans = mid 再向左压缩</strong> <code>r = mid - 1</code>，否则 <code>l = mid + 1</code>；循环结束 ans 即最左合法位置；<br/>
        3. <strong>局部最小值</strong>：相邻元素互不相等。若 <code>arr[0] &lt; arr[1]</code> 或 <code>arr[n-1] &lt; arr[n-2]</code> 直接返回端点；否则两端呈“下坡→…→上坡”，中间必有谷底。根据 <code>arr[mid]</code> 与左右邻居的大小关系，<strong>始终朝下坡方向收缩</strong>；<br/>
        4. <strong>对数器</strong>：用暴力解在大量随机样本上与二分结果逐一比对，验证边界处理正确。
      `,
      initialStateText: `三板斧入口：exist(arr, t) / nearLeft(arr, t) / localMin(arr) ➔ l = 0, r = n - 1。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '空数组 (Empty)',
        valuesStr: 'arr == null || arr.length == 0 ➔ 精确/最左返回 -1，局部最小不存在',
      },
      {
        prefix: '└───',
        label: '局部最小端点特判 (Endpoint Minimum)',
        valuesStr: 'n == 1 或 arr[0] < arr[1] ➔ return 0；arr[n-1] < arr[n-2] ➔ return n-1',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '板斧 1: 有序数组精确命中 (Exact Match)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">exist</span>',
      detailLines: [
        'while (l <= r) {',
        '  int m = l + ((r - l) >> 1);',
        '  if (arr[m] == t) return true;',
        '  else if (arr[m] > t) r = m - 1; else l = m + 1;',
        '}',
      ],
      fillLine: '三分支比较：命中即止，否则丢弃不可能包含 t 的一半',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '板斧 2: >= target 的最左位置 (Leftmost Boundary)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">nearLeft</span>',
      detailLines: [
        'int ans = -1;',
        'while (l <= r) {',
        '  int m = l + ((r - l) >> 1);',
        '  if (arr[m] >= t) { ans = m; r = m - 1; } // 记录后继续向左找更左的',
        '  else l = m + 1;',
        '}',
        'return ans;',
      ],
      fillLine: '记录再压缩：满足条件不立即返回，而是暂存答案并继续逼近左边界',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '板斧 3: 无序数组局部最小值 (Local Minimum)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">localMin</span>',
      detailLines: [
        'int l = 1, r = n - 2;',
        'while (l <= r) {',
        '  int m = l + ((r - l) >> 1);',
        '  if (arr[m - 1] < arr[m]) r = m - 1;      // 左侧是下坡，谷底在左',
        '  else if (arr[m] > arr[m + 1]) l = m + 1; // 右侧是下坡，谷底在右',
        '  else return m;                           // 两侧都比 m 大',
        '}',
      ],
      fillLine: '朝下坡走：两端已知向内下降，沿下降方向收缩必然撞到谷底',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '二分三板斧推演流 (Exact ➔ Leftmost Boundary ➔ Local Minimum)',
      subtitle: 'Class 004 / 005 Binary Search Masterclass',
      innerStepsHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      resultStr: '命中布尔值 / 最左下标 ans / 局部最小下标 m',
      complexityStr: '时间复杂度: O(log N) · 空间复杂度: O(1)',
    });

    return header + baseCase + round + finalReturn;
  }
}
