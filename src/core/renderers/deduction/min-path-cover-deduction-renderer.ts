/**
 * DAG 最小路径覆盖 (DAG Minimum Path Cover · 洛谷 P2764) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 核心：拆点二分图建模、匈牙利算法增广链、最小路径数 = n - 最大匹配与路径链还原闭环
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class MinPathCoverDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'min-path-cover';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'min-path-cover' ||
      modelId === 'dag-path-cover' ||
      modelId === 'minimum-path-cover' ||
      modelId === 'class071' ||
      modelId === 'P2764'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: 'DAG 最小路径覆盖 (DAG Minimum Path Cover) · 全景推演树',
      badge: '洛谷 P2764 / 左程云 class071 · 拆点二分图 · 匈牙利最大匹配 · 路径数 = n - maxMatch · 路径链还原',
      descriptionHtml: `
        在有向无环图 (DAG) 中，寻找最少数量的不相交简单路径，使得图中每个节点恰好出现在一条路径上。<br/>
        <b>核心拆点建模与对偶推导三部曲：</b><br/>
        ① <b>拆点建图：</b>将图中的每个节点 $u$ 拆分为出点 $u_{out}$ 与入点 $u_{in}$。原图中每条有向边 $u \\to v$ 对应二分边 $(u_{out}, v_{in})$；<br/>
        ② <b>匹配即合并：</b>初始每个节点各自构成一条长度为 1 的路径（共 $n$ 条）。二分图中每多一条匹配边 $(u_{out}, v_{in})$，在原图中就代表节点 $u$ 与节点 $v$ 串接在同一条路径链中，路径总数减少 1；<br/>
        ③ <b>极小定理与路径重建：</b>当求得二分图最大匹配数 $M$ 时，最小不可相交路径数必等于 $n - M$。从所有未作为入点匹配的节点出发，沿匹配边链式追踪即可完整还原所有路径！
      `,
      initialStateText: '初始化 4 节点 DAG，拆分为 4 个出点与 4 个入点，初始各点独立构成一条路径，总路径数为 4。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: 'DAG 拓扑节点与边集',
        valuesStr: '节点 V = {1, 2, 3, 4}，边集 E: (1➔2), (2➔3), (3➔4), (1➔3)',
      },
      {
        prefix: '├───',
        label: '拆点二分图定义',
        valuesStr: '出点集合 U_out = {1_out..4_out}，入点集合 V_in = {1_in..4_in}',
      },
      {
        prefix: '└───',
        label: '初始匹配与独立路径',
        valuesStr: 'match[*] = 0，初始独立路径集: {[1], [2], [3], [4]}，路径数 = 4',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】出点 1_out 与 2_out 增广匹配 (First Stage Augmentation)',
        subtitle: '逐个出点尝试增广，建立二分边匹配并合并路径链',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出点 1_out 增广配对',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">匹配成功</span>',
            detailLines: [
              '│  ① 考察边 (1_out, 2_in): 入点 2_in 未被占用 (match[2] == 0)',
              '│  ② 建立匹配: match[2_in] = 1_out',
              '│  ③ 路径链 [1] 与 [2] 合并为 [1 ➔ 2]，路径数减少至 4 - 1 = 3',
            ],
            fillLine: '└── 首条匹配边确立，路径数成功减 1 🔗',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '出点 2_out 增广配对',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">匹配成功</span>',
            detailLines: [
              '│  ① 考察边 (2_out, 3_in): 入点 3_in 未被占用 (match[3] == 0)',
              '│  ② 建立匹配: match[3_in] = 2_out',
              '│  ③ 路径链合并扩展为 [1 ➔ 2 ➔ 3]，全图剩余路径数 = 4 - 2 = 2',
            ],
            fillLine: '└── 增广链延长，形成 3 节点连续通路 ⚡',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】出点 3_out 增广与最大匹配锁定 (Maximum Matching Reached)',
        subtitle: '增广出点 3_out，达到理论最大匹配数 3',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出点 3_out 增广入点 4_in',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">全图连通</span>',
            detailLines: [
              '│  ① 考察边 (3_out, 4_in): match[4_in] == 0，匹配成功',
              '│  ② 建立匹配: match[4_in] = 3_out',
              '│  ③ 全图路径贯通为一条：[1 ➔ 2 ➔ 3 ➔ 4]，剩余路径数 = 4 - 3 = 1',
            ],
            fillLine: '└── 达成最大匹配数 3，路径数降至极小值 1 🏆',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '出点 4_out 终止判定',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-800 rounded font-bold">汇点终止</span>',
            detailLines: [
              '│  ① 节点 4 为 DAG 终点，无任何出边 (adj[4] 为空)',
              '│  ② dfs(4) 直接返回 false，匹配流程结束',
            ],
            fillLine: '└── 遍历完整覆盖，匈牙利循环圆满结束 🎯',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】定理计算与不相交路径链还原 (Path Recovery & Finalization)',
        subtitle: '应用公式 MinPaths = n - MaxMatch 并重建覆盖路径',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '定理公式极值核算',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded font-bold">公式核算</span>',
            detailLines: [
              '│  ① 节点总数 n = 4, 最大匹配数 M = 3',
              '│  ② 最小路径覆盖数 = n - M = 4 - 3 = 1',
            ],
            fillLine: '└── 理论极小路径数严格成立 📊',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '路径链还原追踪',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">路径重建</span>',
            detailLines: [
              '│  ① 寻找无入匹配点: 仅节点 1 的入点 1_in 未被占用，作为路径头',
              '│  ② 顺着匹配边追踪: 1 ➔ matchNxt[1]=2 ➔ matchNxt[2]=3 ➔ matchNxt[3]=4',
              '│  ③ 最终输出单条覆盖路径: [1 ➔ 2 ➔ 3 ➔ 4]，100% 覆盖图中所有 4 个节点！',
            ],
            fillLine: '└── 不相交路径链完美重建，推导全闭环 ✅',
          }),
        ].join(''),
      }),
    ];

    return `
      <div class="p-4 space-y-4 font-mono text-xs text-slate-200">
        ${header}
        ${baseCase}
        ${rounds.join('')}
      </div>
    `;
  }
}
