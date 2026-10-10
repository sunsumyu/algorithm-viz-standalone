/**
 * 稳定婚姻匹配 (Stable Marriage - Gale-Shapley 延迟接受算法 · 洛谷 P4867 / P10299) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 进阶博弈论与匹配理论: 男士主动求婚、女士择优暂留、证明必定收敛且全场无不稳定阻碍对 (Blocking Pair)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class StableMarriageDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'stable-marriage';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'stable-marriage' ||
      modelId === 'gale-shapley' ||
      modelId === 'P4867' ||
      modelId === 'P10299' ||
      modelId === 'stable-matching'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '稳定婚姻匹配 (Stable Marriage - Gale-Shapley) · 全景推演树',
      badge: '洛谷 P4867 / P10299 · 诺贝尔经济学奖 · 男士主动求婚 · 女士择优暂留 · 延迟接受机制 · 无不稳定阻碍对定理',
      descriptionHtml: `
        稳定婚姻问题（Stable Marriage Problem）是博弈论与匹配理论中的经典课题：<br/>
        给定 $N$ 位男士与 $N$ 位女士，每个人对所有异性均有严格的全序偏好列表。<br/>
        <b>不稳定阻碍对（Blocking Pair）定义：</b><br/>
        若存在男士 $m$ 与女士 $w$，他们未匹配，但相比各自当前的配偶，男士 $m$ 更喜欢 $w$，女士 $w$ 也更喜欢 $m$。<br/>
        则 $(m, w)$ 构成不稳定阻碍对，可能导致婚约破裂！<br/>
        <b>Gale-Shapley 延迟接受算法核心流程：</b><br/>
        ① <b>单身男士队列驱动：</b>初始所有男士单身入队，所有女士无婚约；<br/>
        ② <b>主动求婚与顺位推移：</b>队首男士 $m$ 向其偏好列表中尚未求过婚的最高顺位女士 $w$ 发起求婚；<br/>
        ③ <b>女士择优暂留：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;• 若 $w$ 当前单身，则直接接受 $m$，两人达成临时婚约；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;• 若 $w$ 已有未婚夫 $m'$，女士借助预处理好的 $O(1)$ 偏好查表 $\\text{womenRank}[w]$ 对比两人：<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- 若 $\\text{womenRank}[w][m] < \\text{womenRank}[w][m']$（更喜欢新求婚者），则移情换约：$w$ 接受 $m$，$m'$ 被抛弃重返单身队列；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;- 否则（更喜欢现任），$w$ 婉拒 $m$，$m$ 保持单身重返单身队列；<br/>
        ④ <b>收敛性与男士最优定理：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;男士求婚顺位单调递减，最多发生 $N^2$ 次求婚必终止；产出的结果严格稳定，且对男士而言达到所有可能稳定匹配中的最优配对！
      `,
      initialStateText: '载入男女偏好矩阵，预处理 womenRank 查表，所有男士入单身队列，初始化 husband[], wife[] 为 0。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '群体规模与偏好矩阵',
        valuesStr: 'N = 3 (M1..M3, W1..W3)，偏好列表为严格全序排列',
      },
      {
        prefix: '├───',
        label: 'O(1) 偏好排名表预处理',
        valuesStr: 'womenRank[w][m] = rank，值越小表示女士 w 越喜欢男士 m',
      },
      {
        prefix: '└───',
        label: '初始婚约状态',
        valuesStr: 'freeMen = [M1, M2, M3], husband = [0, 0, 0], wife = [0, 0, 0], nextPropose = [0, 0, 0]',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】男士主动求婚与初始暂留 (First Round Proposals)',
        subtitle: '单身男士依次向各自第一顺位女士求婚，女士单身直接订婚',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'M1 出队求婚 W1',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">直接订婚</span>',
            detailLines: [
              '│  ① M1 第 1 顺位为 W1，向 W1 发起求婚',
              '│  ② W1 当前单身无婚约，欣然接受求婚',
            ],
            fillLine: '└── husband[W1] = M1, wife[M1] = W1 💍',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'M2 出队求婚 W1 (引发竞争)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">择优对比</span>',
            detailLines: [
              '│  ① M2 第 1 顺位亦为 W1，向已订婚的 W1 求婚',
              '│  ② W1 查表对比：rank(M2)=0 vs rank(M1)=1，W1 更喜欢 M2！',
            ],
            fillLine: '└── 触发移情别恋机制 💔',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: 'W1 移情换约 M2，M1 被甩重获单身',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">换约成功</span>',
            detailLines: [
              '│  ① husband[W1] 更新为 M2，wife[M2] = W1',
              '│  ② 旧配偶 M1 重获单身：wife[M1] = 0，重新推入 freeMen 队列',
            ],
            fillLine: '└── W1 暂留 M2，M1 进入待求婚队列 👥',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】次佳求婚协商与全局匹配收敛 (Secondary Proposals & Stabilization)',
        subtitle: '重获单身的男士转向次优选择求婚，直至全体脱单无冲突',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'M3 出队求婚 W1 遭拒',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">女士婉拒</span>',
            detailLines: [
              '│  ① M3 第 1 顺位为 W1，向 W1 发起求婚',
              '│  ② W1 查表对比：rank(M3)=2 > rank(M2)=0，现任 M2 更优！',
            ],
            fillLine: '└── W1 拒绝 M3，M3 保持单身重入队列 🙅',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'M1 出队求婚次优对象 W2',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">次优订婚</span>',
            detailLines: [
              '│  ① M1 下一顺位目标为 W2，向 W2 发起求婚',
              '│  ② W2 当前单身，欣然接受 M1',
            ],
            fillLine: '└── husband[W2] = M1, wife[M1] = W2 💍',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: 'M3 转向 W3 求婚达成匹配',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">全员脱单</span>',
            detailLines: [
              '│  ① M3 被 W1、W2 拒绝后，向 W3 发起求婚',
              '│  ② W3 单身欣然接受：husband[W3] = M3, wife[M3] = W3',
            ],
            fillLine: '└── freeMen 队列变空，算法主循环终止 🎉',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】终态验证与无不稳定阻碍对定理 (Stability Verification)',
        subtitle: '所有男女缔结婚约，验证不存在任何能够私奔破坏的阻碍对',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '最终完备匹配结果',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">稳定匹配</span>',
            detailLines: [
              '│  💍 W1 ➔ M2, 💍 W2 ➔ M1, 💍 W3 ➔ M3',
              '│  匹配总对数达到 3 / 3 完全匹配',
            ],
            fillLine: '└── 婚姻状态全面收敛 💎',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '无不稳定阻碍对 (No Blocking Pair Invariant)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">定理保证</span>',
            detailLines: [
              '│  若男士 m 喜欢未匹配的 w 超过其当前妻子，则 m 必然在被拒历史中向 w 求过婚',
              '│  而 w 拒绝 m 意味着 w 当前的丈夫排名高于 m，产生矛盾！故必定强稳定',
            ],
            fillLine: '└── 诺贝尔经济学奖 Gale-Shapley 机制验证通过 🏆',
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
