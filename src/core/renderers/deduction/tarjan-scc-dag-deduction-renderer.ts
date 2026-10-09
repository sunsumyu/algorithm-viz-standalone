/**
 * Tarjan 强连通分量与 DAG 缩点 (Tarjan SCC & Condensation · 洛谷 P3387) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 核心：DFS 时间戳 dfn、追溯值 low、辅助栈维护、强连通根判定、弹栈划分与 DAG 跨分量缩点重建
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class TarjanSCCDagDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'tarjan-scc-dag';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'tarjan-scc-dag' ||
      modelId === 'tarjan-scc' ||
      modelId === 'class066-code01' ||
      modelId === 'P3387'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: 'Tarjan 强连通分量与 DAG 缩点 (Tarjan SCC & Condensation) · 全景推演树',
      badge: '洛谷 P3387 / 左程云 class066 · DFS 时间戳与追溯值 · 栈维护极大强连通分量 · 缩点重建 DAG',
      descriptionHtml: `
        以 5 节点经典双环拓扑为例：顶点集 $\\{1, 2, 3, 4, 5\\}$，有向边集 $[(1,2), (2,3), (3,1), (3,4), (4,5), (5,4)]$。<br/>
        算法推演四大核心阶段：<br/>
        ① <b>深度优先遍历与时间戳盖章：</b>DFS 遍历并记录访问次序 $dfn[u]$，初始置追溯值 $low[u] = dfn[u]$，同时压入辅助栈并标记 $inStack[u] = true$；<br/>
        ② <b>返祖边识别与追溯值回传：</b>遇到尚未访问子节点深入递归，回溯时更新 $low[u] = \\min(low[u], low[v])$；遇到在栈节点判定为返祖边闭环，更新 $low[u] = \\min(low[u], dfn[v])$；<br/>
        ③ <b>强连通根锁定与连续弹栈：</b>当回溯发现 $low[u] == dfn[u]$ 时，确认 $u$ 为极大强连通分量的根，连续弹出栈顶节点直至 $u$ 自身，归纳为一个完整 SCC；<br/>
        ④ <b>缩点重构有向无环图 (DAG)：</b>扫描原图跨分量边 ($sccId[u] \\ne sccId[v]$)，建立缩点超节点间的有向边，彻底消除强连通环路，得到标准 DAG。
      `,
      initialStateText: '初始化 5 个顶点的时间戳 dfn 与追溯值 low 为 0，辅助栈为空，准备从节点 1 启动 DFS。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '原图拓扑结构',
        valuesStr: 'V = {1, 2, 3, 4, 5}, E = {(1➔2), (2➔3), (3➔1), (3➔4), (4➔5), (5➔4)}',
      },
      {
        prefix: '├───',
        label: '初始时间戳与追溯值',
        valuesStr: 'dfn = [0, 0, 0, 0, 0, 0], low = [0, 0, 0, 0, 0, 0]',
      },
      {
        prefix: '└───',
        label: '辅助栈与在栈标记',
        valuesStr: 'stack = [], inStack = [F, F, F, F, F, F], timer = 0, sccCount = 0',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】DFS 树深入遍历与时间戳分配 (Tree Edge Traversal)',
        subtitle: '按深度优先方向深入未访问节点，分配递增时间戳 dfn，并将节点按顺序压入辅助栈',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '深入节点 1',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">dfn=1</span>',
            detailLines: [
              '│  ① 盖时间戳: timer++=1, dfn[1]=low[1]=1',
              '│  ② 压入辅助栈: stack=[1], 标记 inStack[1]=true',
            ],
            fillLine: '└── 树根节点 1 进入探索态 📍',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '沿树边 (1 ➔ 2) 深入节点 2',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">dfn=2</span>',
            detailLines: [
              '│  ① 盖时间戳: timer++=2, dfn[2]=low[2]=2',
              '│  ② 压入辅助栈: stack=[1, 2], 标记 inStack[2]=true',
            ],
            fillLine: '└── 树枝节点 2 进入探索态 📍',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '沿树边 (2 ➔ 3) 深入节点 3',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">dfn=3</span>',
            detailLines: [
              '│  ① 盖时间戳: timer++=3, dfn[3]=low[3]=3',
              '│  ② 压入辅助栈: stack=[1, 2, 3], 标记 inStack[3]=true',
            ],
            fillLine: '└── 树枝节点 3 进入探索态 📍',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】返祖边环路探测与右侧分支深入 (Back Edge & Branching)',
        subtitle: '节点 3 发现出边 (3 ➔ 1) 指向在栈节点，形成强连通环路；随后沿出边 (3 ➔ 4) 深入右侧子图',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '返祖边 (3 ➔ 1) 闭环更新',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">low[3]➔1</span>',
            detailLines: [
              '│  ① 检查出边 (3 ➔ 1)，节点 1 已在栈中 (inStack[1]=T)',
              '│  ② 形成强连通环路！更新 low[3] = min(low[3], dfn[1]) = min(3, 1) = 1',
            ],
            fillLine: '└── 节点 3 追溯值成功回升至 1 ⚡',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '沿跨枝树边 (3 ➔ 4) 深入节点 4',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">dfn=4</span>',
            detailLines: [
              '│  ① dfn[4]=0，递归深入: timer++=4, dfn[4]=low[4]=4',
              '│  ② stack=[1, 2, 3, 4], inStack[4]=true',
            ],
            fillLine: '└── 进入右侧子图起点 4 📍',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '沿树边 (4 ➔ 5) 深入节点 5',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">dfn=5</span>',
            detailLines: [
              '│  ① dfn[5]=0，递归深入: timer++=5, dfn[5]=low[5]=5',
              '│  ② stack=[1, 2, 3, 4, 5], inStack[5]=true',
            ],
            fillLine: '└── 进入节点 5 📍',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '返祖边 (5 ➔ 4) 闭环更新',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">low[5]➔4</span>',
            detailLines: [
              '│  ① 检查出边 (5 ➔ 4)，节点 4 已在栈中 (inStack[4]=T)',
              '│  ② 更新 low[5] = min(low[5], dfn[4]) = min(5, 4) = 4',
            ],
            fillLine: '└── 节点 5 形成局部环路 ⚡',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】强连通分量根锁定与弹栈归集 (Root Detection & Popping)',
        subtitle: '回溯检验 low[u] == dfn[u]：右侧子图结算 SCC #1，左侧环路回溯至源点结算 SCC #2',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '节点 5 回溯至节点 4，锁定 SCC #1 根',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">SCC #1 根</span>',
            detailLines: [
              '│  ① 更新 low[4] = min(low[4], low[5]) = 4',
              '│  ② 检验 low[4] == dfn[4] (4 == 4) 成立，节点 4 为根！',
            ],
            fillLine: '└── 触发连续弹栈循环 🔄',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '弹栈结算强连通分量 SCC #1',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">SCC #1={5,4}</span>',
            detailLines: [
              '│  ① 弹出 5: inStack[5]=F, sccId[5]=1',
              '│  ② 弹出 4: inStack[4]=F, sccId[4]=1，到达根节点停止',
            ],
            fillLine: '└── 成功归集 SCC #1 = {5, 4} 🎉',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '节点 4 回溯至节点 3 与节点 2',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-800 rounded font-bold">回溯回传</span>',
            detailLines: [
              '│  ① 节点 3 出边完毕，low[3]=1 ≠ dfn[3]=3，非根不弹栈',
              '│  ② 节点 2 回溯更新 low[2]=min(low[2], low[3])=1 ≠ dfn[2]=2',
            ],
            fillLine: '└── 追溯值 low=1 沿树枝一路向上回传 🔄',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '回溯至节点 1，弹栈结算 SCC #2',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">SCC #2={3,2,1}</span>',
            detailLines: [
              '│  ① low[1] == dfn[1] (1 == 1) 成立，节点 1 为强连通根！',
              '│  ② 连续弹栈：弹出 3 (sccId=2), 弹出 2 (sccId=2), 弹出 1 (sccId=2)',
            ],
            fillLine: '└── 成功归集 SCC #2 = {3, 2, 1} 🎉',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段四】跨分量边扫描与 DAG 缩点重构 (Condensation into DAG)',
        subtitle: '遍历原图有向边，若两端顶点属于不同强连通分量，建立缩点超图之间的拓扑有向边',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '扫描分量内边',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-800 rounded font-bold">环内消解</span>',
            detailLines: [
              '│  ① (1➔2), (2➔3), (3➔1) 均属 SCC #2 内部边，缩入超节点 2',
              '│  ② (4➔5), (5➔4) 均属 SCC #1 内部边，缩入超节点 1',
            ],
            fillLine: '└── 环路全部消解为单一超节点内部结构 📦',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '提取跨分量缩点边 (3 ➔ 4)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">SCC #2 ➔ SCC #1</span>',
            detailLines: [
              '│  ① sccId[3] = 2 与 sccId[4] = 1 跨越不同强连通块',
              '│  ② 建立缩点 DAG 边: SCC #2 ➔ SCC #1',
            ],
            fillLine: '└── 形成标准有向无环边 🚀',
          }),
        ].join(''),
      }),
    ];

    return [header, baseCase, ...rounds].join('\n');
  }
}
