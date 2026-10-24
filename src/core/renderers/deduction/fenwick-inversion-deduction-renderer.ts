/**
 * 树状数组求逆序对数 (Inversion Count · 洛谷 P1908 / 剑指 Offer 51 / Class 109)
 * 全景推演树渲染策略 (FenwickInversionDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class FenwickInversionDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'fenwick-inversion';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'fenwick-inversion' ||
      modelId === 'fenwick-inversion-109' ||
      modelId === 'class109-code01' ||
      modelId === 'inversion-pairs-bit' ||
      modelId === 'p1908'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '洛谷 P1908 / 剑指 Offer 51. 树状数组求逆序对数 (Inversion Count) · 全景推演树',
      badge: '左程云 Class 109 · 离线排序离散化 (Discretization) / 倒序扫描 + 树状数组前缀和 / 严格 O(N log N)',
      descriptionHtml: `
        核心目标：给定长度为 <code>N</code> 的数组，计算数组中逆序对的总数（即满足 $i < j$ 且 $\\text{arr}[i] > \\text{arr}[j]$ 的二元组对数）。<br/>
        <strong>左程云算法体系教学核心——离散化与树状数组动态前缀和统计：</strong><br/>
        1. <strong>离散化映射公理（Discretization）</strong>：<br/>
        当原数组中的数值范围很大（如 $[-10^9, 10^9]$）或包含重复值时，不能直接作为树状数组下标；<br/>
        将原数组去重排序后，将每个元素映射为其排名 <code>rank</code>（取值范围压缩至闭区间 $[1, M]$，其中 $M \\le N$）；排名的大小关系与原始数值完全保序。<br/>
        2. <strong>倒序扫描 + 树状数组统计定理</strong>：<br/>
        <strong>从右向左倒序扫描数组元素</strong>：<br/>
        对于当前元素 $x$（其排名为 $\\text{rank}$）：<br/>
        • 此时已经插入树状数组中的所有元素，在原数组中的<strong>下标必定都在 $x$ 的右侧（满足 $i < j$）</strong>！<br/>
        • 若右侧某个元素比 $x$ 小，则其排名必落在区间 $[1, \\; \\text{rank} - 1]$ 之间！<br/>
        • 因此，比当前 $x$ 小的右侧元素个数，<strong>恰好等于树状数组前缀和 <code>query(rank - 1)</code></strong>！<br/>
        • 统计完成后，将当前元素的排名插入树状数组：<code>add(rank, 1)</code>。<br/>
        3. <strong>时空复杂度飞跃</strong>：<br/>
        离散化耗时 $O(N \\log N)$；倒序扫描单次查询与插入均耗时 $O(\\log N)$，总耗时严格为 <strong>O(N log N)</strong>，相比暴力 $O(N^2)$ 实现降维打击！
      `,
      initialStateText: `逆序对统计初始化：离散化原数组，tree 数组清零，从最右侧末尾元素启动倒序扫描。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '离散化保序映射 (Rank Mapping Base)',
        valuesStr: 'rank(x) = lower_bound(sorted, x) ➔ 将大值域压缩为 [1 .. M] 稠密整数',
      },
      {
        prefix: '└───',
        label: '逆序对贡献定义 (Inversion Contribution)',
        valuesStr: 'pairs += query(rank - 1) ➔ 右侧已遍历且排名严格小于自身的元素个数',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 离线排序去重与离散化映射 (Discretize Array)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">O(N log N) Sort</span>',
      detailLines: [
        'int[] clone = arr.clone(); Arrays.sort(clone);',
        'int m = unique(clone); // 去重保留独立名次',
        'for (int i = 0; i < n; i++) ranks[i] = binarySearch(clone, arr[i]) + 1;',
      ],
      fillLine: '值域收缩：将浮点/任意大整数转化为 [1..N] 紧凑下标，空间锁定为 O(N)',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 从右向左倒序扫描与前缀和查询 (Backward Scan & Query)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">O(log N) Query</span>',
      detailLines: [
        'for (int i = n - 1; i >= 0; i--) {',
        '  int r = ranks[i];',
        '  ans += query(r - 1); // 累加树状数组中严格小于 r 的元素频次',
        '  add(r, 1);           // 将当前元素登记入树状数组',
        '}',
      ],
      fillLine: '时序与空间对偶：倒序保证在右侧，query 保证数值较小，两者交集即为逆序对',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 树状数组动态单点加与前缀和支撑 (BIT Primitive)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">BIT Lowbit</span>',
      detailLines: [
        'add(r, 1): while(r <= m) { tree[r]++; r += r & -r; }',
        'query(r): int s = 0; while(r > 0) { s += tree[r]; r -= r & -r; } return s;',
      ],
      fillLine: '快速流转：每次增查仅数次位运算，执行速度超越普通归并排序',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '树状数组逆序对推演流 (Discretization ➔ Backward Scan ➔ BIT Accumulation)',
      subtitle: 'Luogu P1908 & Zuoshen Class 109 Inversion Count Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return totalInversions; // 数组内所有逆序对总数量',
      answerDescription: '时间复杂度严格为 O(N log N)，空间复杂度为 O(N)，常数极小，是竞赛中统计逆序对的标准武器。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
