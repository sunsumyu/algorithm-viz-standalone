/**
 * 树上有依赖背包 (Tree Knapsack DP · 洛谷 P2014 选课) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 进阶树论 + DP: 泛化物品树上合并、子树大小上下界优化 O(N * V)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class TreeKnapsackDPDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'tree-knapsack-dp';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'tree-knapsack-dp' ||
      modelId === 'tree-knapsack' ||
      modelId === 'P2014' ||
      modelId === 'tree-dependent-knapsack' ||
      modelId === 'dependent-knapsack-tree'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '树上有依赖背包 (Tree Knapsack DP · 洛谷 P2014 选课) · 全景推演树',
      badge: '洛谷 P2014 选课 · 树形 DP + 背包融合 · 泛化物品树上合并 · 子树大小上下界优化 · 时间复杂度严格 O(N · V)',
      descriptionHtml: `
        树上有依赖背包问题是树形动态规划与背包理论的经典高阶结合。每个节点（课程）代表一个物品，修读该课程的前提是必须修读其所有先修前置课程。<br/>
        <b>三大核心机制与数学规约：</b><br/>
        ① <b>虚拟超级根 S0 统合森林：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;将所有无前置先修要求的根课程连接到虚拟源点 $S0$。$S0$ 的体积 $weight[0]=0$、价值 $value[0]=0$，将森林统一规约为单棵树结构；<br/>
        ② <b>泛化物品树上合并转移方程：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;子节点 $v$ 遍历完成后，$dp[v]$ 构成一个独立的泛化物品。父节点 $u$ 与子节点 $v$ 合并时进行分组背包转移：<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;$$dp[u][j] = \\max(dp[u][j], dp[u][j - k] + dp[v][k])$$<br/>
        ③ <b>子树大小上下界常数优化（复杂度降维核心）：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;外层倒序枚举已合并容量上限：$j = \\min(V, sz[u] + sz[v]) \\dots weight[u]$；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;内层枚举分配给子树 $v$ 的体积：$k = 1 \\dots \\min(sz[v], j - weight[u])$；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;<b>数学定理：</b>两两子树合并的二重循环次数等于两棵子树节点对数，全树遍历累加后总循环次数不超过 $\\sum sz[u] \\cdot sz[v] \\le N \\cdot V$，时间复杂度严格由朴素 $O(N \\cdot V^2)$ 降维至 $O(N \\cdot V)$。
      `,
      initialStateText: '输入先修依赖森林与课程学分，构建包含虚拟根 S0 的树形邻接表，初始化背包状态数组 dp[u][j] 与子树规模 sz[u]。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '虚拟超级根 S0',
        valuesStr: 'weight[0] = 0, value[0] = 0, sz[0] = 0, dp[0][0..V] = 0',
      },
      {
        prefix: '├───',
        label: '课程节点 1..n 属性',
        valuesStr: 'weight[u] = 1, value[u] = scores[u], sz[u] = 1, dp[u][1] = value[u]',
      },
      {
        prefix: '└───',
        label: '状态定义规约',
        valuesStr: 'dp[u][j] 表示在以 u 为根的子树中选择 j 门课程（必含 u）可获得的最大累计学分',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】虚拟超级源点与树拓扑构建 (Virtual Super Root S0 & Tree Setup)',
        subtitle: '引入 S0 连接所有无前置约束课程，将森林规约为以 S0 为根的标准树形有向图',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '森林统一规约',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">虚拟根 S0</span>',
            detailLines: [
              '│  ① 若课程 u 无先修课：加边 S0 -> u',
              '│  ② S0 体积设为 0、价值设为 0，不额外消耗背包容量',
            ],
            fillLine: '└── 依赖森林成功降维为统一先修拓扑树 🌲',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '状态数组与容量分配',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">空间分配</span>',
            detailLines: [
              '│  ① 分配 dp[0..N][0..V] 空间，全量初始化为 0',
              '│  ② 初始化每棵子树规模记录表 sz[0..N] = 0',
            ],
            fillLine: '└── 状态存储沙盘就绪 📦',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】后序递归遍历与节点必修装载 (Post-Order DFS & Node Base Item)',
        subtitle: '自顶向下递归深入子节点，回溯前先装载本节点必选基础代价与学分',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '自身必修状态基底',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">必修初始化</span>',
            detailLines: [
              '│  ① 初始化自身子树大小：sz[u] = weight[u]',
              '│  ② 必须先修读 u 自身：dp[u][weight[u]] = value[u]',
            ],
            fillLine: '└── 节点基底状态装载完成 📍',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '深入子树分支探测',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">深入子节点</span>',
            detailLines: [
              '│  ① 遍历 u 的所有依赖子节点 v：dfs(v)',
              '│  ② 待子节点 v 的泛化背包向量完全就绪后再执行合并',
            ],
            fillLine: '└── 分支子树递归就绪 🍃',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】泛化物品背包卷积与上下界优化 (Knapsack Convolution & Bound Pruning)',
        subtitle: '基于当前子树实际规模精确界定循环上下界，将时间复杂度严格限制在 O(N · V)',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '容量上限紧致约束',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">上下界剪枝</span>',
            detailLines: [
              '│  ① 当前可能达到的最大容量：limit = min(V, sz[u] + sz[v])',
              '│  ② 倒序枚举容量 j 从 limit 下降到 weight[u]，防止单物品多重计入',
            ],
            fillLine: '└── 容量枚举上界紧致截断 📐',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '子树分配决策转移',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">卷积转移</span>',
            detailLines: [
              '│  ① 内层枚举子树分配容量 k 从 1 到 min(sz[v], j - weight[u])',
              '│  ② 状态转移：dp[u][j] = max(dp[u][j], dp[u][j - k] + dp[v][k])',
            ],
            fillLine: '└── 子树泛化物品完成最优配比融合 ➕',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '子树规模增量累加',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">累加规模</span>',
            detailLines: [
              '│  ① 累加子树总规模：sz[u] += sz[v]',
              '│  ② 扩大父节点下一轮合并的容量预算基底',
            ],
            fillLine: '└── 子树完全合并归约完毕 🏆',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段四】超级源点全局汇总与最优解输出 (Global Root Aggregation & Answer)',
        subtitle: '各独立子树在虚拟根 S0 处完成最终组合，返回全局最大累计学分',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '全局答案返回',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded font-bold">答案锁定</span>',
            detailLines: [
              '│  ① 虚拟根 S0 不占用选课名额，dp[0][V] 即为最优总学分',
              '│  ② 严格满足所有先修课拓扑前置约束',
            ],
            fillLine: '└── 选修总学分最大化方案达成 ✅',
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
