/**
 * 匈牙利算法二分图最大匹配 (Hungarian Algorithm · 洛谷 P3386) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 核心：增广路交错探索、visited 标记防环、原配递归让位腾位与匹配边反转
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class HungarianMatchingDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'hungarian-matching';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'hungarian-matching' ||
      modelId === 'hungarian-algorithm' ||
      modelId === 'bipartite-matching' ||
      modelId === 'class069-code01' ||
      modelId === 'P3386'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '匈牙利算法二分图最大匹配 (Hungarian Maximum Matching) · 全景推演树',
      badge: '洛谷 P3386 / 左程云 class069 · 增广路定理 · DFS 递归让位腾位 · 匹配对动态反转',
      descriptionHtml: `
        以 4 节点经典二分图为例：左部集合 $L = \\{0, 1, 2, 3\\}$，右部集合 $R = \\{0, 1, 2, 3\\}$，二分图边集 $[(0,1), (0,2), (1,3), (2,3)]$。<br/>
        算法推演四大核心阶段：<br/>
        ① <b>初始状态重置：</b>右部所有顶点配对指针初始置为未配对 $\\text{match}[v] = -1$，匹配计数 $\\text{count} = 0$；<br/>
        ② <b>无冲突直接配对：</b>从未匹配左部节点出发，沿意向边探测右部节点。若目标处于空闲状态，直接建立匹配；<br/>
        ③ <b>交错路探索与原配让位腾位：</b>若目标已被占用，递归唤醒其原配 $\\text{match}[v]$ 为其寻找替代伴侣。若原配腾位成功，反转增广路径，新匹配建立；<br/>
        ④ <b>增广路翻转基数收敛：</b>不断重复增广过程，直至所有左部节点均无法找到新的增广路径，匹配数达到二分图理论最大值。
      `,
      initialStateText: '初始化右部 4 个节点均处于单身状态 match=[-1, -1, -1, -1]，准备为 L0 启动首轮增广探索。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '二分图集合划分',
        valuesStr: 'Left = {L0, L1, L2, L3}, Right = {R0, R1, R2, R3}',
      },
      {
        prefix: '├───',
        label: '二分图意向边集',
        valuesStr: 'E = {(L0-R1), (L0-R2), (L1-R3), (L2-R3)}',
      },
      {
        prefix: '└───',
        label: '初始配对数组与计数',
        valuesStr: 'match = [-1, -1, -1, -1], count = 0',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】左部节点 L0 发起增广探索 (L0 Direct Matching)',
        subtitle: 'L0 考察首个未配对意向节点 R1，直接闭合增广路',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '重置访问标记并考察边 (L0 ➔ R1)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">边 (L0, R1)</span>',
            detailLines: [
              '│  ① 标记 visited[1] = true',
              '│  ② 检查 match[1] == -1，右部节点 R1 当前单身空闲',
            ],
            fillLine: '└── 增广路径命中单身节点 R1 🎯',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '建立首对匹配 (L0 💖 R1)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">match[1]=0</span>',
            detailLines: [
              '│  ① 更新 match[1] = 0',
              '│  ② 增广成功，count 增至 1 对',
            ],
            fillLine: '└── 匹配对: {L0 💖 R1} 🎉',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】左部节点 L1 发起增广探索 (L1 Direct Matching)',
        subtitle: 'L1 考察首个未配对意向节点 R3，直接建立第二对匹配',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '重置访问标记并考察边 (L1 ➔ R3)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">边 (L1, R3)</span>',
            detailLines: [
              '│  ① 标记 visited[3] = true',
              '│  ② 检查 match[3] == -1，右部节点 R3 当前单身空闲',
            ],
            fillLine: '└── 增广路径命中单身节点 R3 🎯',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '建立第二对匹配 (L1 💖 R3)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">match[3]=1</span>',
            detailLines: [
              '│  ① 更新 match[3] = 1',
              '│  ② 增广成功，count 增至 2 对',
            ],
            fillLine: '└── 当前匹配对: {L0 💖 R1, L1 💖 R3} 🎉',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】左部节点 L2 发起增广探索与原配让位协商 (L2 Mediation)',
        subtitle: 'L2 意向节点 R3 已与 L1 配对，触发交错路递归腾位',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '考察意向边 (L2 ➔ R3)，发现名额已被占',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">冲突 R3</span>',
            detailLines: [
              '│  ① match[3] = 1 (原配为 L1)',
              '│  ② 触发协商腾位: 递归调用 dfs(1) 为原配 L1 另寻新欢',
            ],
            fillLine: '└── 启动交错路腾位递归 ⚡',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '原配 L1 寻找备选伴侣',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-800 rounded font-bold">备选探测</span>',
            detailLines: [
              '│  ① L1 仅有出边指向 R3，无其他可选右部节点',
              '│  ② dfs(1) 腾位失败返回 false',
            ],
            fillLine: '└── L1 无法腾位，L2 协商失败 ❌',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: 'L2 结束寻路，保持当前最优配对',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-800 rounded font-bold">无新增广</span>',
            detailLines: [
              '│  ① L2 无其他出边，本次增广未能增加匹配数',
            ],
            fillLine: '└── 匹配对数维持当前最优 📍',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段四】全图最大匹配收敛与匹配基数确认 (Convergence)',
        subtitle: '所有左部节点遍历完毕，增广路定理保证此时达到最大二分匹配',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '增广路定理检验 (Berge\'s Lemma)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">充要条件</span>',
            detailLines: [
              '│  ① 图中已不存在任何未饱和的交错增广路径',
              '│  ② 当前匹配已是二分图最大基数匹配',
            ],
            fillLine: '└── 理论最大匹配成立 🏆',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '输出最大匹配数',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">return count</span>',
            detailLines: [
              '│  ① 锁定配对列表: match[1]=0, match[3]=1',
              '│  ② return count = 4 (或对应拓扑上限)',
            ],
            fillLine: '└── 匈牙利算法执行完成 🎯',
          }),
        ].join(''),
      }),
    ];

    return [header, baseCase, ...rounds].join('\n');
  }
}
