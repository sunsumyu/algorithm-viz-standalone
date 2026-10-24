/**
 * ST 表 (Sparse Table) 与区间最值查询 (RMQ · 洛谷 P3865 / Class 117)
 * 全景推演树渲染策略 (SparseTableDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class SparseTableDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'sparse-table';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'sparse-table' ||
      modelId === 'sparse-table-117' ||
      modelId === 'class117-code01' ||
      modelId === 'st-table' ||
      modelId === 'rmq' ||
      modelId === 'p3865'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '洛谷 P3865. ST 表 (Sparse Table) 与 RMQ · 全景推演树',
      badge: '左程云 Class 117 · 倍增 DP 预处理 O(N log N) / 可重复贡献性 (Idempotent) / 瞬时 O(1) 极值查询',
      descriptionHtml: `
        核心目标：给定长度为 <code>N</code> 的静态序列，在没有动态单点修改的前提下，以 <strong>严格 O(1) 常数时间</strong> 回应任意区间 <code>[L, R]</code> 的最大值（RMQ）查询。<br/>
        <strong>左程云算法体系教学核心——倍增区间划分与可重复贡献定理：</strong><br/>
        1. <strong>倍增状态设计（ST 表二维矩阵）</strong>：<br/>
        定义 <code>st[i][j]</code>：表示<strong>以下标 i 为起点、长度为 2^j 的连续区间</strong>内的最大值，即覆盖区间 $[i, \\; i + 2^j - 1]$；<br/>
        • 基础初值（j = 0）：区间长度 $2^0 = 1$，<code>st[i][0] = arr[i]</code>；<br/>
        • 状态转移方程（拼装两个半长区间）：<br/>
        $$\\text{st}[i][j] = \\max(\\text{st}[i][j - 1], \\; \\text{st}[i + 2^{j-1}][j - 1])$$<br/>
        预处理时间复杂度严格为 $O(N \\log N)$，空间复杂度为 $O(N \\log N)$。<br/>
        2. <strong>可重复贡献性公理（Idempotent Property）</strong>：<br/>
        对于最大值/最小值/GCD 运算：$\\max(A, A) = A$！区间发生重叠对最终结果完全不产生负面影响！<br/>
        3. <strong>O(1) 瞬时查询精髓（两块覆盖）</strong>：<br/>
        查询区间 $[L, R]$，其长度为 $\\text{len} = R - L + 1$；<br/>
        令 $k = \\lfloor \\log_2(\\text{len}) \\rfloor$（最大的使 $2^k \\le \\text{len}$ 的幂次）：<br/>
        • 从左端点出发覆盖一块：$\\text{st}[L][k]$（覆盖 $[L, \\; L + 2^k - 1]$）；<br/>
        • 从右端点倒退覆盖一块：$\\text{st}[R - 2^k + 1][k]$（覆盖 $[R - 2^k + 1, \\; R]$）；<br/>
        • 两块结合恰好完备覆盖整个 $[L, R]$（中途重叠部分因幂等性无碍），瞬时返回：<br/>
        $$\\text{RMQ}(L, R) = \\max(\\text{st}[L][k], \\; \\text{st}[R - 2^k + 1][k])$$
      `,
      initialStateText: `ST 表初始化：st[N][21] 就绪，计算 log2 查找表，启动倍增区间自左向右递推。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '基础单点基准 (Base j = 0)',
        valuesStr: 'st[i][0] = arr[i] ➔ 长度为 2^0 = 1 的区间极值就是其自身',
      },
      {
        prefix: '└───',
        label: '覆盖最大幂次求值 (Max Log Base)',
        valuesStr: 'k = log2Table[R - L + 1] ➔ 2^k <= len < 2^(k+1)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 倍增递推构建 ST 状态表 (DP Preprocessing)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">O(N log N) Pre</span>',
      detailLines: [
        'for (int j = 1; (1 << j) <= n; j++)',
        '  for (int i = 1; i + (1 << j) - 1 <= n; i++)',
        '    st[i][j] = Math.max(st[i][j - 1], st[i + (1 << (j - 1))][j - 1]);',
      ],
      fillLine: '倍增分裂：长度为 2^j 的区间拆分为前后两段无缝拼接的 2^(j-1) 区间',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 预处理对数查找表 (Fast Log2 Table)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">O(1) Math</span>',
      detailLines: [
        'log2[1] = 0; for (int i = 2; i <= n; i++) log2[i] = log2[i >> 1] + 1;',
        '完全消除运行时 Math.log() 浮点运算开销，位运算整型查找',
      ],
      fillLine: '极致常数：预先计算所有长度的最大对数幂次，查询时零额外运算',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 双重覆盖瞬时求值 (Idempotent Range Query)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">O(1) Instant</span>',
      detailLines: [
        'int k = log2[R - L + 1];',
        'return Math.max(st[L][k], st[R - (1 << k) + 1][k]);',
      ],
      fillLine: '两方块夹逼：哪怕中间有重叠，求最大值也绝对保真，常数极度轻盈',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: 'ST 表预处理与瞬时 RMQ 查询推演流 (Binary Lifting ➔ Log Table ➔ Two-Block RMQ)',
      subtitle: 'Luogu P3865 & Zuoshen Class 117 Sparse Table Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return maxVal; // 目标区间 [L, R] 内的最大元素',
      answerDescription: '预处理 O(N log N)，单次查询严格 O(1)，对于静态区间最值查询是最快的王者算法。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
