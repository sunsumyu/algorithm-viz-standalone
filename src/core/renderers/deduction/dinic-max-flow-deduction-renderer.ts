/**
 * Dinic 网络最大流 (Dinic Max Flow · 洛谷 P3376) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 核心：BFS 分层图构建、当前弧优化 cur[u]、DFS 多路阻塞流增广与成对反向弧退流
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class DinicMaxFlowDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'dinic-max-flow';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'dinic-max-flow' ||
      modelId === 'dinic' ||
      modelId === 'dinic-max-flow-173' ||
      modelId === 'class173-code01' ||
      modelId === 'P3376'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: 'Dinic 网络最大流 (Dinic Max Flow Algorithm) · 全景推演树',
      badge: '洛谷 P3376 · BFS 分层网络 · 当前弧优化 · 多路增广阻塞流',
      descriptionHtml: `
        以 4 节点经典菱形容量网络为例：源点 <code class="font-bold text-slate-800">S</code>，汇点 <code class="font-bold text-slate-800">T</code>，中间节点 <code class="font-bold text-slate-800">A, B</code>。<br/>
        初始容量边：<code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">(S➔A: 10), (S➔B: 10), (A➔T: 10), (B➔T: 10)</code>。<br/>
        算法推演三大关键步骤：<br/>
        ① <b>BFS 构造分层图：</b>从源点 $S$ 出发沿残量正边搜索，为每个节点标记最早可达层级 $\\text{depth}[u]$，当且仅当 $\\text{depth}[T] > 0$ 时继续增广；<br/>
        ② <b>当前弧优化与多路 DFS 增广：</b>深搜仅沿 $\\text{depth}[v] = \\text{depth}[u] + 1$ 层次递增边前进，利用 $\\text{cur}[u]$ 记录各点尝试进度，单次 DFS 同时推送多路阻塞流；<br/>
        ③ <b>成对残量边更新与收敛：</b>正向边扣除流量，反向边增加等额残量支持回退退流，直至 BFS 无法到达汇点，获得全网最大流 $20$。
      `,
      initialStateText: '初始化分层数组 depth[] 与当前弧指针 cur[]，网络所有边初始流量为 0。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '流网络顶点集与初始容量',
        valuesStr: 'V = {S, A, B, T}, E = {(S➔A: 10), (S➔B: 10), (A➔T: 10), (B➔T: 10)}',
      },
      {
        prefix: '├───',
        label: '节点分层深度数组初始化',
        valuesStr: 'depth[S..T] = [0, 0, 0, 0] (未分层)',
      },
      {
        prefix: '└───',
        label: '当前弧优化指针与最大流',
        valuesStr: 'cur[S..T] = [0, 0, 0, 0], maxFlow = 0',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】BFS 搜索构造分层网络 (Layered Network via BFS)',
        subtitle: '从源点 S 出发沿残量大于 0 的边遍历，为各节点分配层次 depth',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '源点初始化与入队',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">源点入队</span>',
            detailLines: [
              '│  ① depth[S] = 1, queue.add(S)',
              '│  ② 源点 S 确立为网络第 1 层',
            ],
            fillLine: '└── 分层网络起点已就绪 🚀',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出队 S 扩展下一层节点 A 与 B',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">第 2 层扩展</span>',
            detailLines: [
              '│  ① 边 (S➔A): 残量 10 > 0 ➔ depth[A] = depth[S] + 1 = 2, 入队 A',
              '│  ② 边 (S➔B): 残量 10 > 0 ➔ depth[B] = depth[S] + 1 = 2, 入队 B',
            ],
            fillLine: '└── 节点 A, B 顺利加入第 2 层 🔗',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '出队 A 与 B 触达汇点 T',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">汇点可达</span>',
            detailLines: [
              '│  ① 边 (A➔T): 残量 10 > 0 ➔ depth[T] = depth[A] + 1 = 3',
              '│  ② 汇点成功分层: depth[T] = 3 > 0, return true',
            ],
            fillLine: '└── 汇点 T 在第 3 层可达，准备进入 DFS 阻塞流增广 🌊',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】DFS 多路增广与当前弧优化 (Multi-Way DFS Augmentation)',
        subtitle: '仅沿 depth[v] == depth[u] + 1 深入，当前弧指针 cur[u] 避免重复无效探索',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '增广路径 1: S ➔ A ➔ T (推流 10)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">阻塞流 1</span>',
            detailLines: [
              '│  ① cur[S]=0, 沿边 (S➔A, cap=10) ➔ (A➔T, cap=10) 推进',
              '│  ② 瓶颈容量 = min(1e9, 10, 10) = 10',
              '│  ③ 更新流量: (S➔A): 10/10 (饱和), (A➔T): 10/10 (饱和)',
            ],
            fillLine: '└── 第一路增广完成: 累计流量达 10 单位 ⚡',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '增广路径 2: S ➔ B ➔ T (当前弧跳过饱和边)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">阻塞流 2</span>',
            detailLines: [
              '│  ① 当前弧优化: cur[S] 自增为 1，直接跳过已饱和出边 (S➔A)',
              '│  ② 沿边 (S➔B, cap=10) ➔ (B➔T, cap=10) 推进瓶颈容量 10',
              '│  ③ 更新流量: (S➔B): 10/10 (饱和), (B➔T): 10/10 (饱和)',
            ],
            fillLine: '└── 第二路增广完成: 累计流量增至 20 单位 ⚡',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】残量网络收敛与最大流判定 (Residual Network Convergence)',
        subtitle: '重新运行 BFS 探测汇点可达性，判定算法终止条件',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '新一轮 BFS 判定汇点不可达',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">算法终止</span>',
            detailLines: [
              '│  ① 所有出边 (S➔A, S➔B) 残量均为 0，无法扩展下一层',
              '│  ② 汇点 depth[T] 保持为 0 ➔ while(bfs()) 条件为假破出循环',
            ],
            fillLine: '└── return maxFlow = 20; // 成功求得网络最大流 🏆',
          }),
        ].join(''),
      }),
    ];

    return [header, baseCase, ...rounds].join('\n');
  }
}
