/**
 * 树状数组 (Fenwick Tree / Binary Indexed Tree · 洛谷 P3374 / Class 108)
 * 全景推演树渲染策略 (FenwickTreeDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class FenwickTreeDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'fenwick-tree';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'fenwick-tree' ||
      modelId === 'fenwick-tree-108' ||
      modelId === 'class108-code01' ||
      modelId === 'binary-indexed-tree' ||
      modelId === 'bit' ||
      modelId === 'p3374'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '洛谷 P3374. 树状数组核心原理 (Fenwick Tree / BIT) · 全景推演树',
      badge: '左程云 Class 108 · lowbit(x) = x & (-x) 二进制位权 / 单点加与前缀和剥离 / 极致 O(N) 空间与常数极小',
      descriptionHtml: `
        核心目标：给定长度为 <code>N</code> 的序列，以极低的代码量与微小常数，支持单点数值修改 <code>add(i, v)</code> 与前缀和查询 <code>query(i)</code>。<br/>
        <strong>左程云算法体系教学核心——lowbit 二进制管辖权公理：</strong><br/>
        1. <strong>lowbit 运算核心定理</strong>：<br/>
        <code>lowbit(x) = x & (-x)</code>，在计算机补码系统中，提取出二进制数 <code>x</code> <strong>最低位的 1 以及其后所有的 0</strong>（即所代表的权值 $2^k$）。<br/>
        2. <strong>树状数组管辖区间公理</strong>：<br/>
        树状数组 <code>tree[x]</code> 负责管辖原数组以 <code>x</code> 结尾、长度为 <code>lowbit(x)</code> 的连续区间，即：<br/>
        $$\\text{tree}[x] = \\sum_{k = x - \\text{lowbit}(x) + 1}^{x} \\text{arr}[k]$$<br/>
        • 若 $x$ 为奇数：$\\text{lowbit}(x) = 1$，仅管辖自己 $\\text{arr}[x]$（叶子节点）；<br/>
        • 若 $x$ 末尾有多个 0：则统领多个连续前驱块。<br/>
        3. <strong>前缀和剥离求和 query(x) —— 顺流而下</strong>：<br/>
        求 <code>arr[1..x]</code> 的总和时，每次累加 <code>tree[x]</code>，然后执行 <code>x -= lowbit(x)</code>（剥离最低位 1），直到 <code>x == 0</code>。二进制最多 32 个 1，故耗时严格 <strong>O(log N)</strong>！<br/>
        4. <strong>单点修改向上渗透 add(x, v) —— 逆流而上</strong>：<br/>
        当 <code>arr[x]</code> 增加 <code>v</code> 时，所有管辖了 <code>x</code> 的上级祖先 <code>tree[p]</code> 都必须同步增加 <code>v</code>。<br/>
        直属上级父节点恰好为：<code>x += lowbit(x)</code>！沿着父链一路上跳直到 <code>x > N</code>，耗时同样严格 <strong>O(log N)</strong>！
      `,
      initialStateText: `树状数组初始化：tree[1..N] 建立，利用 lowbit(x) 实现无显式指针的树形跳跃。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '最低位提取运算 (Lowbit Formula)',
        valuesStr: 'lowbit(x) = x & (-x) ➔ 提取最低位 1 所代表的区间跨度',
      },
      {
        prefix: '└───',
        label: '边界截止基准 (Termination Base)',
        valuesStr: 'query 边界: x == 0 ➔ 停止剥离；add 边界: x > N ➔ 越过数组上限停止',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: lowbit 结构与管辖范围分析 (Coverage Analysis)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">Invariant</span>',
      detailLines: [
        'tree[1] (001): 长度 1, 管辖 [1..1]',
        'tree[2] (010): 长度 2, 管辖 [1..2]',
        'tree[4] (100): 长度 4, 管辖 [1..4]',
        'tree[6] (110): 长度 2, 管辖 [5..6]',
      ],
      fillLine: '完全隐式拓扑：不需要额外指针字段，根据二进制下标自导向二叉结构',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 单点增量修改 ➔ 沿父链向上累加 (Add: x += lowbit(x))',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">O(log N) Add</span>',
      detailLines: [
        'void add(int x, int v) {',
        '  while (x <= n) { tree[x] += v; x += x & -x; }',
        '}',
      ],
      fillLine: '顺藤摸瓜：不断加上 lowbit，直接命中所有包含当前位置的父区间',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 前缀和查询 ➔ 剥离最低位二进制汇总 (Query: x -= lowbit(x))',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[9px]">O(log N) Sum</span>',
      detailLines: [
        'int query(int x) {',
        '  int sum = 0;',
        '  while (x > 0) { sum += tree[x]; x -= x & -x; }',
        '  return sum;',
        '}',
      ],
      fillLine: '极速拼图：把 [1..x] 完美拼装为不多于 log N 个互不重叠的预置桶之和',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '树状数组二进制自导向推演流 (Lowbit Partition ➔ Ascending Add ➔ Descending Query)',
      subtitle: 'Luogu P3374 & Zuoshen Class 108 Fenwick Tree Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return prefixSum; // 目标前缀 [1..x] 的累加和',
      answerDescription: '时间复杂度单次 O(log N)，空间复杂度严格 O(N)，常数远小于线段树，代码仅数行。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
