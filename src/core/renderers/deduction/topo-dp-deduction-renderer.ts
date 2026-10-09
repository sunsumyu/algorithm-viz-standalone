/**
 * 拓扑排序与动态规划 (Topological DP · CPM 关键路径 · LC 2050 · Class 060) · 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * DAG 无后效性拓扑遍历、dp[v] = max(dp[v], dp[u] + w) 动态规划转移与工程关键路径回溯
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class TopoDPDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'topo-dp';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'topo-dp' ||
      modelId === 'parallel-courses-iii' ||
      modelId === 'leetcode-2050' ||
      modelId === 'class060-code03' ||
      modelId === 'topo-dp-cpm'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '拓扑排序与动态规划 (Topological DP · 关键路径 CPM) · 全景推演树',
      badge: 'DAG 无后效性 · 拓扑序线性递推 · 关键路径回溯 · O(V + E)',
      descriptionHtml: `
        包含 <code class="font-bold text-slate-800">N = 5</code> 个工程工序节点 (1..5) 与 5 条有向依赖关系：<br/>
        <code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">(1➔2, w:3), (1➔3, w:2), (2➔4, w:4), (3➔4, w:1), (4➔5, w:2)</code>。<br/>
        核心算法架构：<br/>
        ① <b>DAG 拓扑序列消除后效性：</b> 顶点依照无回路的依赖就绪次序出队，保证计算 <code class="font-bold text-slate-800">dp[v]</code> 时其所有前置工序的最长耗时均已确定；<br/>
        ② <b>动态规划状态转移方程：</b><br/>
        &nbsp;&nbsp;• <b>状态定义：</b> <code class="font-mono bg-indigo-50 text-indigo-800 px-1 py-0.5 rounded font-bold">dp[i]</code> 表示从源头到达工序 <code class="font-bold text-slate-800">i</code> 的最长工程耗时；<br/>
        &nbsp;&nbsp;• <b>状态转移：</b> 遍历出边 <code class="font-mono bg-purple-50 text-purple-800 px-1 py-0.5 rounded font-bold">u ➔ v (耗时 w)</code>，执行 <code class="font-mono bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded font-bold">dp[v] = max(dp[v], dp[u] + w)</code>；<br/>
        &nbsp;&nbsp;• <b>入度削减：</b> <code class="font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-bold">--inDegree[v] == 0</code> 时将 <code class="font-bold text-slate-800">v</code> 推入就绪队列；<br/>
        ③ <b>关键路径 (Critical Path Method · CPM)：</b> 记录各节点最优前驱指针，回溯得到决定全项目总工期的瓶颈路径！
      `,
      initialStateText: '全图 5 个工序节点，入度表 inDegree 统计完成，源节点 1 (入度为0) 入队，queue = [1]。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '顶点初始入度依赖统计：inDegree[1..5]',
        valuesStr: 'inDegree = [1:0, 2:1, 3:1, 4:2, 5:1]',
      },
      {
        prefix: '├───',
        label: '工序最长耗时初始数组：dp[1..5]',
        valuesStr: 'dp = [1:0, 2:0, 3:0, 4:0, 5:0]',
      },
      {
        prefix: '└───',
        label: '初始零入度就绪队列 (无任何前置约束)',
        valuesStr: 'queue = [1]',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 1 轮】出队节点 1 (dp[1]=0)',
        subtitle: '弹出源节点 · 松弛边 1➔2(w=3) 与 1➔3(w=2)',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出队推进',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">poll(1)</span>',
            detailLines: [
              '│  ① 弹出源节点 1，当前 dp[1] = 0',
              '│  ② 刷新 totalMax = max(0, dp[1]) = 0',
            ],
            fillLine: '└── 考察出边集合：{1➔2, 1➔3} 🚀',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '动态规划松弛与依赖削减',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">节点 2, 3 入队</span>',
            detailLines: [
              '│  ① dp[2] = max(0, dp[1]+3) = 3, --inDegree[2]=0 -> queue.offer(2)',
              '│  ② dp[3] = max(0, dp[1]+2) = 2, --inDegree[3]=0 -> queue.offer(3)',
            ],
            fillLine: '└── queue = [2, 3], dp = [1:0, 2:3, 3:2, 4:0, 5:0] 🌱',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 2 轮】出队节点 2 (dp[2]=3)',
        subtitle: '弹出节点 2 · 松弛边 2➔4(w=4)',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出队推进',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">poll(2)</span>',
            detailLines: [
              '│  ① 弹出节点 2，当前 dp[2] = 3',
              '│  ② 刷新 totalMax = max(0, 3) = 3',
            ],
            fillLine: '└── 考察出边：{2➔4} 🚀',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '动态规划松弛与依赖削减',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">dp[4] 更新</span>',
            detailLines: [
              '│  ① dp[4] = max(0, dp[2]+4) = 7, pre[4] = 2',
              '│  ② --inDegree[4] 降为 1 (仍需等待工序 3 完成)',
            ],
            fillLine: '└── queue = [3], dp[4] = 7 ⚡',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 3 轮】出队节点 3 (dp[3]=2)',
        subtitle: '弹出节点 3 · 松弛边 3➔4(w=1) · 节点 4 解锁入队',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出队推进',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">poll(3)</span>',
            detailLines: [
              '│  ① 弹出节点 3，当前 dp[3] = 2',
              '│  ② totalMax 保持 3',
            ],
            fillLine: '└── 考察出边：{3➔4} 🚀',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '动态规划松弛与依赖削减',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">节点 4 入队</span>',
            detailLines: [
              '│  ① dp[3]+1 = 3 < dp[4](7) -> dp[4] 维持最优值 7 (pre[4]=2)',
              '│  ② --inDegree[4] 降为 0 -> queue.offer(4)！',
            ],
            fillLine: '└── queue = [4], dp[4] = 7 (前驱为 2) 🌱',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 4 轮】出队节点 4 (dp[4]=7)',
        subtitle: '弹出节点 4 · 松弛边 4➔5(w=2) · 终点 5 解锁入队',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出队推进',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">poll(4)</span>',
            detailLines: [
              '│  ① 弹出节点 4，当前 dp[4] = 7',
              '│  ② 刷新 totalMax = max(3, 7) = 7',
            ],
            fillLine: '└── 考察出边：{4➔5} 🚀',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '动态规划松弛与依赖削减',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">节点 5 入队</span>',
            detailLines: [
              '│  ① dp[5] = max(0, dp[4]+2) = 9, pre[5] = 4',
              '│  ② --inDegree[5] 降为 0 -> queue.offer(5)！',
            ],
            fillLine: '└── queue = [5], dp[5] = 9 🌱',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第 5 轮】出队节点 5 (dp[5]=9 · 终态确立)',
        subtitle: '弹出终点 · 队列清空 · 确立全局最长路径与回溯',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '终态出队结算',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">poll(5)</span>',
            detailLines: [
              '│  ① 弹出终点 5，dp[5] = 9',
              '│  ② 刷新全局最大耗时 totalMax = max(7, 9) = 9',
              '│  ③ 队列清空，所有节点完成拓扑推演！',
            ],
            fillLine: '└── 全图最长耗时确立：totalMax = 9 🏁',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '关键路径回溯 (CPM)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">CPM 回溯</span>',
            detailLines: [
              '│  ① 从节点 5 出发回溯前驱指针 pre[]：5 ➔ 4 ➔ 2 ➔ 1',
              '│  ② 关键路径：1 ➔ 2 ➔ 4 ➔ 5，累计耗时 3 + 4 + 2 = 9',
            ],
            fillLine: '└── 关键路径：[1 ➔ 2 ➔ 4 ➔ 5] 🏆',
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      '拓扑序队列出队推进，无后效性动态规划转移，最长关键路径动态松弛'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return totalMax = 9;',
      answerDescription:
        '🏆 最终返回：DAG 拓扑递推全部收敛，求得工程最长关键路径 CPM 为 1 ➔ 2 ➔ 4 ➔ 5，全项目总工期 = 9！',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
