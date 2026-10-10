/**
 * 好路径的数目 (Number of Good Paths · LeetCode 2421) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 进阶图论与并查集: 边两端最大点权升序排序、并查集动态维护最大点计数、乘法原理组合 count[u] * count[v]
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class GoodPathsDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'good-paths';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'good-paths' ||
      modelId === 'number-of-good-paths' ||
      modelId === 'number-of-good-paths-2421' ||
      modelId === 'good-paths-2421' ||
      modelId === '2421' ||
      modelId === 'class057-code04'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '好路径的数目 (Number of Good Paths · LeetCode 2421) · 全景推演树',
      badge: 'LeetCode 2421 / 左程云 class057 · 点权升序加边 · 并查集最大权维护 · 乘法原理组合 count[u] * count[v] · 逆向 Kruskal 思想',
      descriptionHtml: `
        一棵包含 $N$ 个节点的树中，若一条路径起点与终点的点权相同，且路径上所有中间节点的点权都不大于端点点权，则称该路径为<b>好路径</b>。<br/>
        每个单节点自身天然构成一条长度为 0 的好路径（基数 $N$ 条）。<br/>
        <b>并查集 + 点权升序贪心加边核心定理：</b><br/>
        ① <b>边权定义与升序排序：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;将树中每条无向边 $e = (u, v)$ 的权值定义为两端点权的最大值：$\\text{weight}(e) = \\max(\\text{vals}[u], \\text{vals}[v])$；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;所有边按 $\\text{weight}(e)$ 从小到大升序排序，依次加入图（类似 Kruskal 生成树思想）；<br/>
        ② <b>路径中间节点点权有界性保证：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;当一条边被加入时，当前连通块中所有已经存在的节点和边，其点权必定全部 $\\le \\text{weight}(e)$，天然满足好路径的“中间节点不大于端点”要求！<br/>
        ③ <b>代表元动态维护最大点权计数：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;并查集根节点维护当前连通块的最大点权 $\\text{vals}[\\text{root}]$ 以及该最大点权的出现频次 $\\text{count}[\\text{root}]$；<br/>
        ④ <b>乘法原理跨集合组合：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;若两端代表元点权相等（$\\text{vals}[root_u] == \\text{vals}[root_v]$），则跨越两集合的同最大权节点两两配对，新增 $\\text{count}[root_u] \\times \\text{count}[root_v]$ 条好路径！随后合并集合并累加频次；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;若点权不等，则将权值较小的根并入权值较大的根，小者点权不影响新连通块最大值，不产生新好路径。
      `,
      initialStateText: '载入树节点点权 vals[] 与树边集合，每个节点自成好路径 (总数 = N)，初始化 parent[] 与 count[] 为 1。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '节点点权与边集',
        valuesStr: 'N = 4, vals = [1, 3, 2, 3], edges = [(0,1), (0,2), (2,3)] [4 节点经典树]',
      },
      {
        prefix: '├───',
        label: '单点基数好路径',
        valuesStr: '每个单节点天然是一条合法好路径，初始 totalGoodPaths = 4',
      },
      {
        prefix: '└───',
        label: '并查集初始状态',
        valuesStr: 'parent = [0, 1, 2, 3], count = [1, 1, 1, 1] (每个集合自身最大点权频次为 1)',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】边权最大值计算与升序排序 (Edge Max-Weight Sorting)',
        subtitle: '计算每条边端点最大点权，按照从小到大排序以保证路径中间节点有界性',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '边端点最大权值求取',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">边权映射</span>',
            detailLines: [
              '│  ① 边 (0,2): max(vals[0]=1, vals[2]=2) = 2',
              '│  ② 边 (0,1): max(vals[0]=1, vals[1]=3) = 3',
              '│  ③ 边 (2,3): max(vals[2]=2, vals[3]=3) = 3',
            ],
            fillLine: '└── 各边权值定义完毕 📐',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '升序加边序列确立',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">排序序列</span>',
            detailLines: [
              '│  ① 优先加边: (0,2) [权值 2]',
              '│  ② 后续加边: (0,1) [权值 3], (2,3) [权值 3]',
            ],
            fillLine: '└── 排序完成，准备驱动并查集逐步连通 ⚡',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】逐条接入边与乘法原理组合 (Incremental Merging & Multiplicative Principle)',
        subtitle: '依次合并两端所在集合，若最大点权相等则通过乘法原理产生全新好路径',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '接入边 (0,2) [最大权 2]',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">小权合并</span>',
            detailLines: [
              '│  ① rootU=find(0)=0 (vals[0]=1), rootV=find(2)=2 (vals[2]=2)',
              '│  ② vals[2] > vals[0]，大权者 2 成为新根：parent[0] = 2',
              '│  ③ 点权不相等，不产生新好路径，好路径仍为 4 条',
            ],
            fillLine: '└── 集合 {0,2} 最大权为 2，count[2] = 1 🛡️',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '接入边 (0,1) [最大权 3]',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">大权并入</span>',
            detailLines: [
              '│  ① rootU=find(0)=2 (vals[2]=2), rootV=find(1)=1 (vals[1]=3)',
              '│  ② vals[1] > vals[2]，大权者 1 成为新根：parent[2] = 1',
              '│  ③ 点权不相等，不产生新好路径，好路径仍为 4 条',
            ],
            fillLine: '└── 集合 {0,1,2} 最大权为 3，count[1] = 1 🛡️',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '接入边 (2,3) [最大权 3] 触发好路径配对！',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">乘法配对</span>',
            detailLines: [
              '│  ① rootU=find(2)=1 (vals[1]=3, count=1), rootV=find(3)=3 (vals[3]=3, count=1)',
              '│  ② 两端连通块最大权相等 (均为 3)！',
              '│  ③ 乘法原理: count[1] × count[3] = 1 × 1 = +1 条好路径 (路径 1-0-2-3)',
              '│  ④ 合并集合: parent[3] = 1，count[1] += count[3] = 2',
            ],
            fillLine: '└── totalGoodPaths 累加至 5 条！✨',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】终态验证与复杂度分析 (Final Verification & Complexity)',
        subtitle: '全树完全连通，验证无遗漏好路径并确认时空复杂度上界',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '最终好路径清单',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">最终解</span>',
            detailLines: [
              '│  单点好路径 (4条): (0), (1), (2), (3)',
              '│  跨集合好路径 (1条): (1 ➔ 0 ➔ 2 ➔ 3) [两端均为 3，中间 0(1) 和 2(2) 均 ≤ 3]',
              '│  好路径总计: 5 条',
            ],
            fillLine: '└── 答案严格正确 💎',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '算法复杂度定理保证',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">O(N log N)</span>',
            detailLines: [
              '│  ① 边排序耗时 O(N log N)',
              '│  ② 并查集按秩合并/路径压缩操作 O(N α(N))',
              '│  ③ 相比暴力 O(N²) 或树剖，时空复杂度达到理论极致！',
            ],
            fillLine: '└── LeetCode 2421 优雅解决 🏆',
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
