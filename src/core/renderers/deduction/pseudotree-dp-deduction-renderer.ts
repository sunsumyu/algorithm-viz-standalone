/**
 * 基环树 DP (Pseudotree DP · 洛谷 P1453 / P2607 骑士) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 进阶树论: 拓扑找环、子树树形 DP 浓缩至环、断环为链 / 两次 DP 破环求解
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class PseudotreeDPDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'pseudotree-dp';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'pseudotree-dp' ||
      modelId === 'pseudotree' ||
      modelId === 'cycle-with-trees' ||
      modelId === 'P1453' ||
      modelId === 'P2607' ||
      modelId === 'knight-pseudotree'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '基环树与环套树 DP (Pseudotree DP · 洛谷 P1453 / P2607 骑士) · 全景推演树',
      badge: '洛谷 P1453 / P2607 骑士 · 进阶树论 + 动态规划 · 拓扑找环 · 断环为链两次树形 DP · 状态转移时空复杂度 O(N)',
      descriptionHtml: `
        基环树（Pseudotree）即包含 $N$ 个节点与 $N$ 条边的连通无向图，拓扑结构由一个唯一的简单基环及环上各节点外挂的若干子树组成。<br/>
        <b>三大核心处理原则与破环规约：</b><br/>
        ① <b>DFS / 拓扑排序锁定基环与断边：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;通过 DFS 返祖边或拓扑排序消除度数为 1 的节点，快速识别唯一基环并定位一条关键环边 $(u, v)$；<br/>
        ② <b>断环为链（退化为普通树）：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;将边 $(u, v)$ 逻辑断开后，原基环树即退化为一棵以无向树为骨架的生成树，消除了拓扑环依赖；<br/>
        ③ <b>两次树形 DP 消除相邻互斥约束：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;根据最大权独立集约束（相邻两点不可同时选取），节点 $u$ 与 $v$ 至多只能选一个：<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;• <b>方案 1：</b>强制不选节点 $u$，以 $u$ 为根跑树形 DP，得到最大收益 $ans_1 = dp[u][0]$；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;• <b>方案 2：</b>强制不选节点 $v$，以 $v$ 为根跑树形 DP，得到最大收益 $ans_2 = dp[v][0]$；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;• <b>全图最优解：</b>$\\max(ans_1, ans_2)$，时间复杂度保持严格线性 $O(N)$。
      `,
      initialStateText: '输入基环树邻接表与点权数组 weight，初始化状态数组 dp[u][0..1] 与 DFS 访问标记 vis。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '基环树顶点与边规模',
        valuesStr: '节点 1..n，无向边数 n，存在唯一基环与若干外挂子树',
      },
      {
        prefix: '├───',
        label: '树形状态定义',
        valuesStr: 'dp[u][0] = 不选 u 的最大独立权值，dp[u][1] = 选 u 的最大独立权值',
      },
      {
        prefix: '└───',
        label: '互斥破坏断边',
        valuesStr: 'brokenEdge = (u, v)，将环边切断转化为标准无环生成树',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】DFS 寻环与断边锁定 (DFS Cycle Detection & Edge Cut)',
        subtitle: 'DFS 遍历无向图检测返祖边，定位唯一基环并挑选关键断边 (u, v)',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '返祖边与基环定位',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">返祖边检测</span>',
            detailLines: [
              '│  ① DFS 深度探查：当发现边 (u, v) 指向已访问节点时检测到环',
              '│  ② 提取基环节点集合 cycleNodes = { c_1, c_2, ... }',
            ],
            fillLine: '└── 基环结构精准识别 ⭕',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '破环断边确立',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">断环为链</span>',
            detailLines: [
              '│  ① 选定断边 brokenEdge = (u, v)，标记该边在后续 DP 中禁止通行',
              '│  ② 基环树拓扑成功退化为标准生成树结构',
            ],
            fillLine: '└── 环拓扑解耦转化为普通树 ✂️',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】外挂子树自底向上 DP 汇聚 (Subtree DP Aggregation)',
        subtitle: '自底向上对各外挂子树执行没有上司的舞会模型状态转移',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '叶节点基底状态装载',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">叶子基底</span>',
            detailLines: [
              '│  ① 不选叶子：dp[leaf][0] = 0',
              '│  ② 选择叶子：dp[leaf][1] = weight[leaf]',
            ],
            fillLine: '└── 叶子节点初始权值装载完毕 📍',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '父子状态自底向上聚合',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">状态转移</span>',
            detailLines: [
              '│  ① 不选父节点：dp[p][0] += max(dp[son][0], dp[son][1])',
              '│  ② 选取父节点：dp[p][1] += dp[son][0]（子节点绝对不可选）',
            ],
            fillLine: '└── 外挂子树贡献完美汇聚至环上各根节点 🌲',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】两次树形 DP 处理互斥边界 (Two-Pass Tree DP)',
        subtitle: '断边两端 u 与 v 不可同时选，分别强制不选 u 和不选 v 跑两次 DP',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '方案一：强制不选断边端点 u',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">方案 1</span>',
            detailLines: [
              '│  ① 设定约束：禁止选取 u',
              '│  ② 以 u 为根运行树形 DP：得到最大收益 ans_1 = dp[u][0]',
            ],
            fillLine: '└── 方案一最大独立权值结算 💡',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '方案二：强制不选断边端点 v',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">方案 2</span>',
            detailLines: [
              '│  ① 设定约束：禁止选取 v',
              '│  ② 以 v 为根重新运行树形 DP：得到最大收益 ans_2 = dp[v][0]',
            ],
            fillLine: '└── 方案二最大独立权值结算 💡',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段四】两方案取最优与全局答案输出 (Global Optimal Decision & Output)',
        subtitle: '综合两次 DP 的互斥覆盖，取全局最大值即为基环树最大权独立集',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '全局最优解决策',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded font-bold">全局答案</span>',
            detailLines: [
              '│  ① 比较两方案独立集权值：ans = max(ans_1, ans_2)',
              '│  ② 完美兼顾原图基环上的所有相邻互斥约束',
            ],
            fillLine: '└── 基环树最大权独立集求解圆满闭环 🏆',
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
