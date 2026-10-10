/**
 * 情侣牵手 (Couples Holding Hands · LeetCode 765) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 并查集置换环分解与最少交换定理 N - Sets
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class CouplesHoldingHandsDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'couples-holding-hands';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'couples-holding-hands' ||
      modelId === 'couples-holding-hands-765' ||
      modelId === '765' ||
      modelId === 'couples-holding-hands-056' ||
      modelId === 'class056-code03'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '情侣牵手 (Couples Holding Hands · LeetCode 765) · 全景推演树',
      badge: 'LeetCode 765 / 左程云 class056 · 并查集置换环分解 · 贪心连通图缩点 · 最少交换次数定理 N - Sets',
      descriptionHtml: `
        系统中包含 $N$ 对情侣（共 $2N$ 人），坐入 $N$ 张双人沙发中。情侣编号 $C_0, \\dots, C_{N-1}$，人员 $2i$ 与 $2i+1$ 互为配偶。<br/>
        <b>并查集置换环分解核心原理：</b><br/>
        ① <b>沙发建图与连通图缩点：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;将每对情侣抽象为一个并查集节点 $C_0, \\dots, C_{N-1}$；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;第 $k$ 张沙发就坐两人 $(p_1, p_2)$，分别属于情侣 $C_{\\lfloor p_1/2 \\rfloor}$ 与 $C_{\\lfloor p_2/2 \\rfloor}$；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;若 $c_1 == c_2$，说明已正确牵手（形成自环）；若 $c_1 \\ne c_2$，则在 $C_{c1}$ 与 $C_{c2}$ 之间连接无向边，表明错位牵连；<br/>
        ② <b>置换环最少交换定理：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;全图必然分解为若干个互不相交的连通分量（独立置换环）；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;若某个置换环包含 $k$ 对情侣，交换一次任意两人最多只能从该环中解开 1 对情侣，因此大小为 $k$ 的置换环最少需要 $k-1$ 次交换彻底复原；<br/>
        ③ <b>全局最少交换次数结算公式：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;全图共有 $S$ 个独立连通块（置换环），各环规模为 $k_i$，且 $\\sum k_i = N$；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;总最少交换次数 $= \\sum (k_i - 1) = \\sum k_i - \\sum 1 = N - S$（情侣总对数 $N$ 减去并查集连通分量数 $S$）！
      `,
      initialStateText: '载入情侣规模 N = 4 对 (8 人)，建立并查集代表元 parent = [0, 1, 2, 3]，初始连通块 sets = 4。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '情侣规模与座位数',
        valuesStr: 'N = 4 对情侣 (C0..C3), 2N = 8 人, 沙发数 = 4',
      },
      {
        prefix: '├───',
        label: '初始排布用例',
        valuesStr: 'row = [0, 2, 1, 3, 4, 6, 5, 7] (错位坐于 4 张沙发)',
      },
      {
        prefix: '└───',
        label: '并查集初始状态',
        valuesStr: 'parent[i] = i (i in 0..3), 初始独立连通块 sets = 4',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】情侣对映射与并查集代表元初始化',
        subtitle: '人员编号归并为情侣对编码：c = floor(p / 2)，各情侣对自成连通块',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '人员与情侣对映射',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">映射编码</span>',
            detailLines: [
              '│  ① 人员 0, 1 ➔ 情侣 C0；人员 2, 3 ➔ 情侣 C1',
              '│  ② 人员 4, 5 ➔ 情侣 C2；人员 6, 7 ➔ 情侣 C3',
            ],
            fillLine: '└── 规约降维：8 人排列转化为 4 个情侣节点的图论置换问题 👥',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '并查集初始化 build(4)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">并查集初始</span>',
            detailLines: [
              '│  ① parent = [0, 1, 2, 3]',
              '│  ② 当前独立置换环集合数 sets = 4',
            ],
            fillLine: '└── 初始化完成，每个情侣对初始视作孤立置换环 🔗',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】逐张沙发巡查与缩环合并 (Union-Find)',
        subtitle: '考察每张沙发上坐的两人，合并两对情侣所在的集合',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '沙发 0: [0, 2] ➔ C0 与 C1',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">沙发 #0</span>',
            detailLines: [
              '│  ① 人员 0 属于 C0，人员 2 属于 C1',
              '│  ② find(0) = 0, find(1) = 1 ➔ union(0, 1)',
              '│  ③ parent[0] = 1，连通块减少至 sets = 3',
            ],
            fillLine: '└── C0 与 C1 连通，并入同一置换环 (环大小 k=2) 🛋️',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '沙发 1: [1, 3] ➔ C0 与 C1',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">沙发 #1</span>',
            detailLines: [
              '│  ① 人员 1 属于 C0，人员 3 属于 C1',
              '│  ② find(0) = 1, find(1) = 1 ➔ 两者已连通！',
              '│  ③ 形成闭合环，无需合并，sets 维持 3',
            ],
            fillLine: '└── 第一个置换环闭合: {C0, C1}，环规模 k=2 🔄',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '沙发 2: [4, 6] ➔ C2 与 C3',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">沙发 #2</span>',
            detailLines: [
              '│  ① 人员 4 属于 C2，人员 6 属于 C3',
              '│  ② find(2) = 2, find(3) = 3 ➔ union(2, 3)',
              '│  ③ parent[2] = 3，连通块减少至 sets = 2',
            ],
            fillLine: '└── C2 与 C3 连通，并入第二置换环 🛋️',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '沙发 3: [5, 7] ➔ C2 与 C3',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">沙发 #3</span>',
            detailLines: [
              '│  ① 人员 5 属于 C2，人员 7 属于 C3',
              '│  ② find(2) = 3, find(3) = 3 ➔ 两者已连通！',
              '│  ③ 第二个置换环闭合: {C2, C3}，环规模 k=2',
            ],
            fillLine: '└── 全图巡查完毕，最终 sets = 2 🎯',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】置换环分解统计与最少交换次数定理结算',
        subtitle: '全图独立置换环分析与公式求解：minSwaps = N - Sets',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '置换环结构统计',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">环分解</span>',
            detailLines: [
              '│  ① 环 1: {C0, C1}，规模 k1 = 2，所需交换 = 2 - 1 = 1 次',
              '│  ② 环 2: {C2, C3}，规模 k2 = 2，所需交换 = 2 - 1 = 1 次',
            ],
            fillLine: '└── 两个独立置换环各需 1 次交换完美归位 🔄',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '全局最少交换次数',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">终态定理</span>',
            detailLines: [
              '│  ① 总情侣对数 N = 4',
              '│  ② 连通分量数 Sets = 2',
              '│  ③ minSwaps = N - Sets = 4 - 2 = 2 次',
            ],
            fillLine: '└── 定理严格成立：最少只需 2 次交换即可让所有人牵手完毕 🎉',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '复杂度与置换群定理',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">O(N·α(N))</span>',
            detailLines: [
              '│  ① 时间复杂度: O(N · α(N))，反阿克曼函数近乎常数级',
              '│  ② 空间复杂度: O(N)，仅需 parent 数组维护情侣代表元',
              '│  ③ 核心定理: 大小为 k 的连通环恰好需 k-1 次交换，全图交换数严格为 N - Sets',
            ],
            fillLine: '└── LeetCode 765 置换环分解定理完美闭环 🏆',
          }),
        ].join(''),
      }),
    ];

    return `
      <div class="deduction-board" style="padding: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${header}
        ${baseCase}
        ${rounds.join('\n')}
      </div>
    `;
  }
}
