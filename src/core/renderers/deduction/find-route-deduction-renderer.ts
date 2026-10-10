/**
 * 寻找图中有效路径 (LC 1971 / 面试题 04.01) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * BFS 连通性探测 + 前驱映射最短跳步路径回溯
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class FindRouteDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'find-route';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'find-route' ||
      modelId === '1971' ||
      modelId === 'valid-path' ||
      modelId === 'validPath' ||
      modelId === 'find-path'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '寻找图中有效路径 (LC 1971) · 全景推演树',
      badge: '无向图连通性 · BFS 广度优先搜索 · 前驱父节点回溯 · O(V+E) 线性最优',
      descriptionHtml: `
        问题本质：给定无向图 $G = (V, E)$ 及两个顶点 $source$ 与 $destination$，判定两点是否位于同一连通分量。<br/>
        <b>BFS 广度优先遍历与路径回溯双核机制：</b><br/>
        ① <b>队列层级波前推进：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;将起点 $source$ 压入队列并加入 $visited$ 集合；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;按出队顺序依次探索当前顶点的所有邻接边，将未访问的邻居入队并标记；<br/>
        ② <b>前驱映射记录 (Parent Map)：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;在邻居节点 $v$ 入队时，记录 $parent[v] = u$；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;一旦队首出队节点或探索节点等于 $destination$，立即终止搜索；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;从 $destination$ 出发沿 $parent$ 链逆向回溯，即可重构出跳步最少的最优有效路径；<br/>
        ③ <b>连通分量与可达性定理：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;若队列完全耗尽且仍未访问到 $destination$，则由无向图连通分支定理，两点分属不同连通分量，必然不可达（返回 false）。
      `,
      initialStateText: '载入 6 节点无向图，指定 source = 0, destination = 5，准备启动 BFS 队列波前搜索。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '顶点与边集',
        valuesStr: 'V = [0,1,2,3,4,5], E = [[0,1],[1,2],[0,3],[3,4],[2,5],[4,5]]',
      },
      {
        prefix: '├───',
        label: '目标端点',
        valuesStr: 'source = 0, destination = 5',
      },
      {
        prefix: '└───',
        label: '判定目标',
        valuesStr: '验证 0 到 5 是否连通，并回溯重构路径',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】起点入队与初始波前建立',
        subtitle: '初始化访问集合 visited 与探索队列 queue，起点 0 作为根节点入队',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '起点 0 入队标记',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">根节点入队</span>',
            detailLines: [
              '│  ① visited = {0}, queue = [0]',
              '│  ② 验证 source !== destination，进入主循环遍历',
            ],
            fillLine: '└── 波前启动就绪 🚀',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '出队展开第 0 层邻居',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">1跳邻域</span>',
            detailLines: [
              '│  ① 节点 0 出队，发现未访问邻居 1 与 3',
              '│  ② 记录 parent[1] = 0, parent[3] = 0',
              '│  ③ queue = [1, 3], visited = {0, 1, 3}',
            ],
            fillLine: '└── 第 1 跳辐射完成',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】层次波前推进与邻居扩展',
        subtitle: '依次弹出队列中顶点，沿无向边扩展次级未访问节点',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '节点 1 出队扩展',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">2跳辐射</span>',
            detailLines: [
              '│  ① 节点 1 邻居为 0(已访问) 与 2(未访问)',
              '│  ② 记录 parent[2] = 1，将 2 入队',
              '│  ③ queue = [3, 2], visited = {0, 1, 3, 2}',
            ],
            fillLine: '└── 节点 2 加入波前',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '节点 3 出队扩展',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">2跳辐射</span>',
            detailLines: [
              '│  ① 节点 3 邻居为 0(已访问) 与 4(未访问)',
              '│  ② 记录 parent[4] = 3，将 4 入队',
              '│  ③ queue = [2, 4], visited = {0, 1, 3, 2, 4}',
            ],
            fillLine: '└── 节点 4 加入波前',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】目标命中与前驱路径重构',
        subtitle: '从节点 2 探测到终点 5，触达目标节点，沿 parent 链回溯有效路径',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '终点 5 触达与入队',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">终点命中</span>',
            detailLines: [
              '│  ① 节点 2 出队，探测未访问邻居 5',
              '│  ② 记录 parent[5] = 2，检测到 5 === destination',
              '│  ③ 连通性成立，立即终止进一步宽搜！',
            ],
            fillLine: '└── 连通判定成功: 存在路径 🎯',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '前驱链反向回溯重构',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">路径重构</span>',
            detailLines: [
              '│  ① 回溯链路: 5 ➔ parent[5]=2 ➔ parent[2]=1 ➔ parent[1]=0',
              '│  ② 反转得到正向最优路径: [0 ➔ 1 ➔ 2 ➔ 5]',
              '│  ③ 时间复杂度: O(V + E)，空间复杂度: O(V + E)',
            ],
            fillLine: '└── 返回判定结果: true (重构路径长度 3 步) 🎉',
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
