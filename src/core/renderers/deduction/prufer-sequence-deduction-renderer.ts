/**
 * Prufer 序列与 Cayley 公式 (Prufer Sequence · 洛谷 P6086) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 组合图论: 树到 Prufer 序列的双向一一双射、O(N) 线性双指针编解码、Cayley 定理
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class PruferSequenceDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'prufer-sequence';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'prufer-sequence' ||
      modelId === 'prufer' ||
      modelId === 'cayley' ||
      modelId === 'P6086' ||
      modelId === 'class077'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: 'Prufer 序列与 Cayley 公式 (Prufer Sequence · 洛谷 P6086) · 全景推演树',
      badge: '洛谷 P6086 / 左程云 class077 · 无根树双射 · O(N) 线性双指针 · 叶节点消除 · Cayley 定理 n^(n-2)',
      descriptionHtml: `
        Prufer 序列是图论中建立带标号无根树与整数序列之间一一双射（Bijection）的强大组合工具。<br/>
        <b>三大核心推演支柱与阶段：</b><br/>
        ① <b>无根树转 Prufer 序列：</b> 每次选取树中编号最小的叶节点（度数等于 1，在有根化后度数减为 0），记录其唯一相邻节点（父节点）的编号并将其从树中删除，重复直到只剩下 2 个节点。生成的序列长度严格为 $n-2$；<br/>
        ② <b>O(N) 线性双指针优化：</b> 普通堆维护需要 $O(N \\log N)$，使用扫描指针 <code>ptr</code> 寻找最小叶节点，删去后若其父节点的度数归零且编号小于 <code>ptr</code>，可直接级联删除该父节点，保证指针单调推进，达成 $O(N)$ 极速编码；<br/>
        ③ <b>Prufer 序列逆向还原树：</b> 同样利用双指针维护度数数组 $deg[x] = \\text{count}(x) + 1$，依次将序列元素与当前度数为 0 的最小叶节点连接，最终最后两个未消除节点相连，达成 $O(N)$ 完美还原；<br/>
        ④ <b>Cayley 公式与连通图计数定理：</b> 长度为 $n-2$ 的 Prufer 序列元素可独立取值 $1 \\dots n$，序列总数为 $n^{n-2}$，直接证明了 $n$ 个顶点的有标号无根树恰好有 $n^{n-2}$ 种。
      `,
      initialStateText: '输入包含 n 个节点的无根树拓扑结构，初始化 parent 数组、deg 度数数组与长度为 n-2 的 prufer 数组。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '树拓扑规模与标号范围',
        valuesStr: '节点 1..n，连边条数 n-1，Prufer 序列目标长度严格等于 n-2',
      },
      {
        prefix: '├───',
        label: '度数数组初始基准',
        valuesStr: 'deg[u] 记录各节点连接边数，初始所有叶节点满足 deg == 0',
      },
      {
        prefix: '└───',
        label: '双指针初态配置',
        valuesStr: '扫描指针 ptr = 1, 写入指针 pIdx = 0，全局状态零污染',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】度数统计与叶节点初筛 (Degree Preprocessing & Initial Leaves)',
        subtitle: '统计各节点的儿子数目/连接度数，确立首轮可消除的叶节点集合',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '父节点出度统计',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">度数累加</span>',
            detailLines: [
              '│  ① 遍历各节点 i：deg[parent[i]]++',
              '│  ② 统计各节点作为父节点拥有的子树分支总数',
            ],
            fillLine: '└── 全节点度数统计表就绪 📊',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '叶节点识别定理',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">叶节点判定</span>',
            detailLines: [
              '│  ① 若 deg[u] == 0，说明 u 不包含任何未消除的子节点，即为当前叶节点',
              '│  ② 编号最小的叶节点将优先被选出进行消除',
            ],
            fillLine: '└── 叶节点判定准则就绪 🍃',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】线性双指针贪心消除与序列编码 (Linear Two-Pointer Encoding)',
        subtitle: '利用单调指针 ptr 寻找最小叶节点，消除叶节点并将父节点推入 Prufer 序列',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '单调指针定位最小叶子',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">定位叶子</span>',
            detailLines: [
              '│  ① while (deg[ptr] > 0) ptr++：单调右移跳过非叶节点',
              '│  ② 命中首个 deg[ptr] == 0 的节点，确认为当前全局最小叶节点',
            ],
            fillLine: '└── 当前最小编号叶节点锁定 🎯',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '父节点推入序列与度数递减',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">写入父节点</span>',
            detailLines: [
              '│  ① 取父节点 fa = parent[ptr]，推入序列：prufer[pIdx++] = fa',
              '│  ② 父节点度数递减：--deg[fa]，从树中摘除当前叶节点',
            ],
            fillLine: '└── 父节点写入 Prufer 序列 📝',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '级联更小叶节点优化',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">级联消除</span>',
            detailLines: [
              '│  ① 判定：若 --deg[fa] == 0 且 fa < ptr，说明产生了一个比 ptr 更小的全新叶子',
              '│  ② 无需重置全局指针，直接连续消除该父节点并推入其祖先，维持严格 O(N) 复杂度',
            ],
            fillLine: '└── 线性双指针极速编码达成 ⚡',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】Cayley 公式与双射性质总结 (Cayley Theorem & Bijective Summary)',
        subtitle: '建立无根树与 Prufer 序列的双向一一映射，得出完全图生成树计数公式',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '双向一一双射',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">一一双射</span>',
            detailLines: [
              '│  ① 任何 n 节点带标号树对应唯一长为 n-2 的 Prufer 序列',
              '│  ② 任何长为 n-2 取值在 1..n 的整数序列唯一还原出一棵树',
            ],
            fillLine: '└── 树与序列双向无缝转换达成 🔀',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: 'Cayley 生成树计数定理',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">Cayley 定理</span>',
            detailLines: [
              '│  ① 每个位置有 n 种取值，长度为 n-2，总种类数严格等于 n^(n-2)',
              '│  ② n 个顶点的完全图 K_n 包含的生成树总数恰好等于 n^(n-2)',
            ],
            fillLine: '└── Cayley 计数定理完美得证 🏆',
          }),
        ].join(''),
      }),
    ];

    return `
      <div class="p-4 bg-slate-950 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 shadow-xl space-y-4">
        ${header}
        ${baseCase}
        ${rounds.join('')}
      </div>
    `;
  }
}
