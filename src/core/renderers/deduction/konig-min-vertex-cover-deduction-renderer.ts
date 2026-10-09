/**
 * 二分图最小点覆盖与 König 定理 (König's Theorem · 洛谷 P6062) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 核心：匈牙利最大匹配基准、未匹配左部点交错路 DFS 染色、!visL ∪ visR 最小点覆盖提取及互补最大独立集
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class KonigMinVertexCoverDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'konig-min-vertex-cover';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'konig-min-vertex-cover' ||
      modelId === 'konig-theorem' ||
      modelId === 'min-vertex-cover' ||
      modelId === 'class069' ||
      modelId === 'P6062'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '二分图最小点覆盖与 König 定理 (König\'s Theorem) · 全景推演树',
      badge: '洛谷 P6062 / 左程云 class069 · 匈牙利最大匹配 · 未匹配点交错路 DFS 染色 · 对偶覆盖构造 · 最大独立集',
      descriptionHtml: `
        二分图最小点覆盖是指选出最少数量的节点，使得图中每条边至少有一个端点被选中。<br/>
        <b>König 定理对偶三步推导法：</b><br/>
        ① <b>基准最大匹配：</b>运行匈牙利算法求得二分图的最大匹配 $M$；<br/>
        ② <b>交错路 DFS 染色：</b>从所有<b>未匹配的左部节点</b>出发，沿非匹配边走向右部、沿匹配边反向走回左部，标记所有可达节点（$vis_L, vis_R$）；<br/>
        ③ <b>构造最小点覆盖：</b>取<b>未被访问的左部点</b>与<b>已被访问的右部点</b>组成覆盖集 $C = (L \\setminus vis_L) \\cup vis_R$。大小必满足 $|C| = |M|$；<br/>
        ④ <b>互补最大独立集：</b>全集补集 $I = V \\setminus C = vis_L \\cup (R \\setminus vis_R)$ 即为二分图的最大独立集。
      `,
      initialStateText: '初始化二分图拓扑结构与状态数组，准备运行匈牙利算法求解基准最大匹配。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '拓扑点集与二分边',
        valuesStr: '左部集合 L = {L1, L2, L3, L4}, 右部集合 R = {R1, R2, R3}',
      },
      {
        prefix: '├───',
        label: '二分边连接关系',
        valuesStr: '边集 E: (L1, R1), (L2, R1), (L2, R2), (L3, R2), (L4, R3)',
      },
      {
        prefix: '└───',
        label: '状态数组与阶段',
        valuesStr: 'matchL[], matchR[], visL[], visR[] 初始全清空',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】匈牙利算法求解基准最大匹配 (Maximum Matching)',
        subtitle: '逐节点发起增广路探索，建立最大匹配基准',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '节点 L1 与 L2 匹配探索',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">增广成功</span>',
            detailLines: [
              '│  ① L1 匹配至 R1 (matchL[1]=1, matchR[1]=1)',
              '│  ② L2 尝试 R1 冲突，促使 L1 调整或 L2 选 R2，成功配对 (L2, R2)',
            ],
            fillLine: '└── 增广链成功扩展，形成初步匹配 🔗',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '节点 L3 与 L4 匹配探索及基准确定',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">最大匹配: 2</span>',
            detailLines: [
              '│  ① L3 无法争夺 R2，增广失败；L4 匹配至 R3',
              '│  ② 最终匹配边: (L1, R1), (L2, R2) 或等价最大匹配，|M| = 2',
            ],
            fillLine: '└── 基准最大匹配达成，锁定下界下限 🎯',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】从未匹配左部点发起交错路 DFS 染色 (Alternating DFS)',
        subtitle: '沿非匹配边到右部、沿匹配边到左部遍历交错树',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '未匹配左部节点触发遍历',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">起点定位</span>',
            detailLines: [
              '│  ① 扫描发现未匹配节点 L3 (matchL[3] == 0)',
              '│  ② 从 L3 发起 alternatingDfs(3)，标记 visL[3] = true',
            ],
            fillLine: '└── 交错树根节点锁定 🔍',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '沿交错路双向推进',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">交错推进</span>',
            detailLines: [
              '│  ① 沿非匹配边到达 R2: 标记 visR[2] = true',
              '│  ② 沿匹配边 (L2, R2) 反向追溯: 递归推进至 L2，标记 visL[2] = true',
              '│  ③ 从 L2 尝试非匹配边 (L2, R1): 标记 visR[1] = true，再反推至 L1 (visL[1] = true)',
            ],
            fillLine: '└── 交错树扩展完毕，标记划分完全清晰 🏷️',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】提取最小点覆盖集合 (Min Vertex Cover Extraction)',
        subtitle: '根据 König 定理，最小点覆盖集 = 未访问左部点 ∪ 已访问右部点',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '提取未访问左部点 (!visL)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-red-100 text-red-800 rounded font-bold">左部覆盖</span>',
            detailLines: [
              '│  ① 检查左部各点: L4 未被交错路标记 (!visL[4])',
              '│  ② 节点 L4 纳入最小点覆盖集 C',
            ],
            fillLine: '└── 覆盖所有与 L4 相连的未匹配边 🛡️',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '提取已访问右部点 (visR)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-red-100 text-red-800 rounded font-bold">右部覆盖</span>',
            detailLines: [
              '│  ① 检查右部各点: R1, R2 均被交错路标记 (visR[1], visR[2])',
              '│  ② 节点 R1, R2 纳入最小点覆盖集 C',
              '│  ③ 最终覆盖集 C = { L4, R1, R2 }，|C| 恰好等于最大匹配数 |M|',
            ],
            fillLine: '└── 每条边至少有一个端点在 C 中，最小点覆盖成立 ✅',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段四】互补最大独立集与对偶终局核算 (Max Independent Set)',
        subtitle: '最大独立集 = 全集 \\ 最小点覆盖 = visL ∪ !visR',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '最大独立集对偶提取与验证',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded font-bold">对偶核算</span>',
            detailLines: [
              '│  ① 最大独立集 I = V \\ C = { L1, L2, L3, R3 }',
              '│  ② 验证任意两点间无边直接相连，满足独立集定义',
              '│  ③ König 定理恒等式: |C| + |I| = |V| 严格成立',
            ],
            fillLine: '└── 对偶性完美闭环，推导全部完成 🏆',
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
