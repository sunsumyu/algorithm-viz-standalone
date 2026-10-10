/**
 * 并查集理论基础 (Union-Find Theory) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学
 * 集合代表元维护、路径压缩与按秩合并演进树展开
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class UnionFindTheoryDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'union-find-theory';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'union-find-theory' ||
      modelId === 'disjoint-set-theory' ||
      modelId === 'union-find-basic'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '并查集理论基础 (Union-Find) · 全景推演树',
      badge: '不相交集合 · 路径压缩扁平化 · 按秩合并控高 · O(α(n)) 均摊常数',
      descriptionHtml: `
        问题本质：动态维护 N 个元素的连通等价类，支持查询所属集合与合并两个集合。<br/>
        <b>双重优化推演核心：</b><br/>
        ① <b>自底向上树形表示：</b>每个元素持有一个父指针 <code>parent[i]</code>，根节点满足 <code>parent[root] == root</code>；<br/>
        ② <b>路径压缩 (Path Compression)：</b>在 <code>find(x)</code> 寻根过程中，将从 x 到根沿途的所有节点直接重新指向根，将多层长链直接拍平成单层菊花图；<br/>
        ③ <b>按秩合并 (Union by Rank)：</b>维护 <code>rank[i]</code> 作为树高上界，合并时始终将 rank 较小的小树挂在大树下，只有两树等高时大树 rank 加 1。
      `,
      initialStateText: '初始化 7 个单元素集合，每个节点 parent[i] = i, rank[i] = 0。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '初始化父指针',
        valuesStr: 'parent = [0, 1, 2, 3, 4, 5, 6]，各节点自成代表元',
      },
      {
        prefix: '├───',
        label: '初始化树秩高度',
        valuesStr: 'rank = [0, 0, 0, 0, 0, 0, 0]，单节点树高为 0',
      },
      {
        prefix: '└───',
        label: '集合总数',
        valuesStr: 'count = 7，准备接收合并指令',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】按秩合并建立小树',
        subtitle: '执行 union(0,1), union(2,3), union(1,3)，构建深度为 2 的森林',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'union(0, 1) 合并',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">等秩合并</span>',
            detailLines: [
              '│  ① find(0) = 0, find(1) = 1，两树 rank 均为 0',
              '│  ② 将 0 挂在 1 下：parent[0] = 1, rank[1] = 1',
            ],
            fillLine: '└── 集合数 count = 6',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'union(2, 3) 合并',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">等秩合并</span>',
            detailLines: [
              '│  ① find(2) = 2, find(3) = 3，两树 rank 均为 0',
              '│  ② 将 2 挂在 3 下：parent[2] = 3, rank[3] = 1',
            ],
            fillLine: '└── 集合数 count = 5',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: 'union(1, 3) 跨集合合并',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">树高增长</span>',
            detailLines: [
              '│  ① rootX = 1 (rank 1), rootY = 3 (rank 1)',
              '│  ② 两树等高，将 1 挂在 3 下，更新 parent[1] = 3, rank[3] = 2',
              '│  ③ 形成链状树：0 -> 1 -> 3',
            ],
            fillLine: '└── 节点 {0,1,2,3} 归并为同一集合，count = 4',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】路径压缩生效 · 深度扁平化',
        subtitle: '调用 find(0)，沿途节点直接改指根节点 3',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'find(0) 递归追溯',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">寻根探索</span>',
            detailLines: [
              '│  ① parent[0] = 1 !== 0, 向上调用 find(1)',
              '│  ② parent[1] = 3 !== 1, 向上调用 find(3)',
              '│  ③ parent[3] == 3，命中根节点 3',
            ],
            fillLine: '└── 确认代表元 root = 3',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '路径压缩指针回写',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">O(1) 拍平</span>',
            detailLines: [
              '│  ① 回溯赋值：parent[0] = 3',
              '│  ② 节点 0 直接与根节点 3 相连，树高从 2 降低为 1',
            ],
            fillLine: '└── 拍平完成，下次 find(0) 直接直达根节点 🚀',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】全图连通汇聚与终态',
        subtitle: '合并剩余孤立节点，形成单一大连通集合',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'union(4,5) 与 union(3,5)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">大树收容</span>',
            detailLines: [
              '│  ① 4 与 5 合并为子集 5 (rank 1)',
              '│  ② 集合 5 挂载到大树 3 (rank 2) 下：parent[5] = 3',
            ],
            fillLine: '└── 节点 0-5 汇入集合 3',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: 'union(6, 0) 最终收敛',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">全员连通</span>',
            detailLines: [
              '│  ① find(6) = 6, find(0) = 3',
              '│  ② parent[6] = 3，孤立点 6 入列',
            ],
            fillLine: '└── 最终集合数 count = 1，全图大一统 👑',
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      '并查集动态演进轨迹'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return count == 1;',
      answerDescription: '路径压缩使树高维持极低常数，按秩合并杜绝单链退化，反阿克曼复杂度 α(n) ≤ 4 保证极致性能！',
    });

    return DeductionBoardPrimitives.wrapBoard(`
      ${header}
      ${baseCase}
      ${loopSection}
      ${finalReturn}
    `);
  }
}
