/**
 * 拓扑排序 (Topological Sort · Kahn 算法 · LC 210) · 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 入度统计、零入度队列进出、出边依赖削减与 DAG 环路检测
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class TopologicalSortDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'topological-sort';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'topological-sort' ||
      modelId === 'topo-sort-kahn' ||
      modelId === 'course-schedule-ii-210' ||
      modelId === 'leetcode-210' ||
      modelId === 'class059-code02' ||
      modelId === 'class026-code01'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '力扣 210. 课程表 II (Topological Sort · Kahn 拓扑排序) · 全景推演树',
      badge: '有向无环图 · 入度削减 · 零入度 BFS 队列 · 线性时空 O(V+E)',
      descriptionHtml: `
        包含 <code class="font-bold text-slate-800">N = 6</code> 个课程节点 (0..5) 与 6 条前置依赖关系：<br/>
        <code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">5 ➔ 2, 5 ➔ 0, 4 ➔ 0, 4 ➔ 1, 2 ➔ 3, 3 ➔ 1</code>。<br/>
        核心算法架构：<br/>
        ① <b>DAG 拓扑排序核心定义：</b> 将顶点排列为线性序列，确保每条有向边 <code class="font-mono bg-indigo-50 text-indigo-800 px-1 py-0.5 rounded font-bold">u ➔ v</code> 中起点 <code class="font-bold text-slate-800">u</code> 必先于终点 <code class="font-bold text-slate-800">v</code> 执行；<br/>
        ② <b>Kahn 算法零入度 BFS 推进：</b><br/>
        &nbsp;&nbsp;• <b>初始化：</b> 统计所有顶点入度 <code class="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-bold">inDegree[i]</code>，将无前置依赖（入度为 0）的节点推入就绪队列；<br/>
        &nbsp;&nbsp;• <b>出队拓扑写入：</b> 弹出队首 <code class="font-mono bg-amber-50 text-amber-800 px-1 py-0.5 rounded font-bold">u</code> 写入拓扑结果序列；<br/>
        &nbsp;&nbsp;• <b>出边依赖削减：</b> 遍历邻居 <code class="font-mono bg-purple-50 text-purple-800 px-1 py-0.5 rounded font-bold">u ➔ v</code>，执行 <code class="font-mono bg-purple-50 text-purple-800 px-1 py-0.5 rounded font-bold">--inDegree[v]</code>；若入度减为 0，说明其前置依赖全部就绪，立即推入队列！<br/>
        ③ <b>环路拓扑判定：</b> 若最终拓扑序列长度等于 <code class="font-mono bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded font-bold">N</code>，则全图为合法 DAG；否则图中必含有向环，课程无法全部完成。
      `,
      initialStateText: '全图 6 个节点，inDegree 统计完毕，初始 0 入度队列 queue = [5, 4]。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '顶点初始入度统计：inDegree[0..5]',
        valuesStr: 'inDegree = [0:2, 1:2, 2:1, 3:1, 4:0, 5:0]',
      },
      {
        prefix: '├───',
        label: '有向依赖边集合 (Prerequisites)',
        valuesStr: 'edges = [5➔2, 5➔0, 4➔0, 4➔1, 2➔3, 3➔1]',
      },
      {
        prefix: '└───',
        label: '初始零入度就绪队列 (无任何前置依赖)',
        valuesStr: 'queue = [5, 4]',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 1 轮】出队节点 5 (消减出边 5➔2, 5➔0)',
        subtitle: '弹出队首 · 写入拓扑序列 · 削减后继入度',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出队写入',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">poll(5)</span>',
            detailLines: [
              '│  ① 弹出节点 5 写入拓扑序列',
              '│  ② 当前 order = [5]',
            ],
            fillLine: '└── 拓扑序列：[5] 📝',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '削减邻居依赖',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">新入度为0</span>',
            detailLines: [
              '│  ① --inDegree[2] 从 1 降为 0 -> 触发 queue.offer(2)！',
              '│  ② --inDegree[0] 从 2 降为 1 (仍需等待边 4➔0)',
            ],
            fillLine: '└── queue = [4, 2] 🌱',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 2 轮】出队节点 4 (消减出边 4➔0, 4➔1)',
        subtitle: '弹出队首 · 写入拓扑序列 · 削减后继入度',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出队写入',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">poll(4)</span>',
            detailLines: [
              '│  ① 弹出节点 4 写入拓扑序列',
              '│  ② 当前 order = [5, 4]',
            ],
            fillLine: '└── 拓扑序列：[5, 4] 📝',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '削减邻居依赖',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">新入度为0</span>',
            detailLines: [
              '│  ① --inDegree[0] 从 1 降为 0 -> 触发 queue.offer(0)！',
              '│  ② --inDegree[1] 从 2 降为 1 (仍需等待边 3➔1)',
            ],
            fillLine: '└── queue = [2, 0] 🌱',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 3 轮】出队节点 2 (消减出边 2➔3)',
        subtitle: '弹出队首 · 写入拓扑序列 · 削减后继入度',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出队写入',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">poll(2)</span>',
            detailLines: [
              '│  ① 弹出节点 2 写入拓扑序列',
              '│  ② 当前 order = [5, 4, 2]',
            ],
            fillLine: '└── 拓扑序列：[5, 4, 2] 📝',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '削减邻居依赖',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">新入度为0</span>',
            detailLines: [
              '│  ① --inDegree[3] 从 1 降为 0 -> 触发 queue.offer(3)！',
            ],
            fillLine: '└── queue = [0, 3] 🌱',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 4 轮】出队节点 0 (无出边)',
        subtitle: '弹出队首 · 写入拓扑序列',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '出队写入',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">poll(0)</span>',
            detailLines: [
              '│  ① 节点 0 无出边，不产生入度削减',
              '│  ② 当前 order = [5, 4, 2, 0]',
            ],
            fillLine: '└── queue = [3] 📝',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 5 轮】出队节点 3 (消减出边 3➔1)',
        subtitle: '弹出队首 · 写入拓扑序列 · 削减后继入度',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出队写入',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">poll(3)</span>',
            detailLines: [
              '│  ① 弹出节点 3 写入拓扑序列',
              '│  ② 当前 order = [5, 4, 2, 0, 3]',
            ],
            fillLine: '└── 拓扑序列：[5, 4, 2, 0, 3] 📝',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '削减邻居依赖',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">新入度为0</span>',
            detailLines: [
              '│  ① --inDegree[1] 从 1 降为 0 -> 触发 queue.offer(1)！',
            ],
            fillLine: '└── queue = [1] 🌱',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 6 轮】出队节点 1 (终态结算)',
        subtitle: '弹出最后节点 · 拓扑队列清空 · 检验完整性',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '终态结算',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">排序完毕</span>',
            detailLines: [
              '│  ① 弹出节点 1，order.length 达到 6 (等于全图总节点数 N)',
              '│  ② 全图无环，所有课程依赖全部满足！',
            ],
            fillLine: '└── order = [5, 4, 2, 0, 3, 1] 🏁',
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      'Kahn 队列 BFS 逐轮出队与入度消减推演'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return order = [5, 4, 2, 0, 3, 1];',
      answerDescription: '全图 6 个课程节点全部成功输出到线性序列中，无环路死锁，成功找到一条满足所有前序依赖的合法学习次序！',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
