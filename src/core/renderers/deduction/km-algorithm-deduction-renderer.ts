/**
 * 二分图最大权完美匹配与 KM 算法 (Kuhn-Munkres Algorithm · 洛谷 P6577) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 核心：可行顶标理论、相等子图探索、松弛变量 slack[] 维护、最小调整量 d 顶标微调与 O(N³) 最佳匹配达成
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class KMAlgorithmDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'km-algorithm';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'km-algorithm' ||
      modelId === 'km' ||
      modelId === 'kuhn-munkres' ||
      modelId === 'class073' ||
      modelId === 'P6577'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '二分图最大权完美匹配与 KM 算法 (Kuhn-Munkres Algorithm) · 全景推演树',
      badge: '洛谷 P6577 / 左程云 class073 · 顶标理论 · 相等子图 · 松弛变量 slack[] 维护 · O(N³) 严格最佳匹配',
      descriptionHtml: `
        二分图最大权完备匹配的目标是在左右两部节点数相同的带权二分图中，寻找一组完备匹配使得总边权和最大。<br/>
        <b>KM 算法核心理论四部曲：</b><br/>
        ① <b>可行顶标条件：</b>为左部点分配顶标 $lx[u]$、右部点分配顶标 $ly[v]$，全程严格维持 $lx[u] + ly[v] \\ge w(u, v)$；<br/>
        ② <b>相等子图判定：</b>仅由满足 $lx[u] + ly[v] = w(u, v)$ 的边构成的子图称为相等子图。若相等子图存在完备匹配，该匹配即为原图的最大权完备匹配！<br/>
        ③ <b>松弛变量与最小调整量 $d$：</b>当相等子图找不到增广路时，计算交错树中未访问右部点的最小缺口 $slack[v] = \\min(lx[u] + ly[v] - w(u, v))$，取 $d = \\min_{v \\notin visY} slack[v]$；<br/>
        ④ <b>顶标微调与相等子图扩充：</b>将交错树中已访问左部顶标减少 $d$ ($lx[u] \\gets lx[u] - d$)，已访问右部顶标增加 $d$ ($ly[v] \\gets ly[v] + d$)。此时原匹配边等式保持不变，同时必有至少一条新边引入相等子图！重复直到完备匹配达成。
      `,
      initialStateText: '初始化二分图带权矩阵，分配顶标数组与松弛数组，准备运行可行顶标初始化。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '标准 3x3 权值矩阵',
        valuesStr: 'W = [[4, 2, 3], [3, 5, 2], [2, 1, 3]]，左部点 L1..L3，右部点 R1..R3',
      },
      {
        prefix: '├───',
        label: '可行顶标初值',
        valuesStr: 'lx[1]=4, lx[2]=5, lx[3]=3, ly[*] = 0 (满足 lx[u] + ly[v] >= w)',
      },
      {
        prefix: '└───',
        label: '匹配与松弛数组',
        valuesStr: 'match[*] = 0, slack[*] = ∞, visX[*] = false, visY[*] = false',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】可行顶标初始化与首轮相等子图探索 (Feasible Labels Init)',
        subtitle: '初始化左顶标为最大出边权，右顶标置 0，初试相等子图匹配',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '初始化各左部节点可行顶标',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">可行顶标</span>',
            detailLines: [
              '│  ① lx[1] = max(4, 2, 3) = 4, ly[1..3] = 0',
              '│  ② lx[2] = max(3, 5, 2) = 5, lx[3] = max(2, 1, 3) = 3',
              '│  ③ 验证所有边: lx[u] + ly[v] >= w(u, v) 恒成立',
            ],
            fillLine: '└── 可行顶标下界锁定，相等子图建立 🏷️',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '节点 L1 匹配探索',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">配对成功</span>',
            detailLines: [
              '│  ① 检查出边 (L1, R1): delta = 4 + 0 - 4 = 0 属于相等子图',
              '│  ② 右部点 R1 未配对，直接配对: match[R1] = L1',
            ],
            fillLine: '└── 节点 L1 增广成功，完成首对配对 🔗',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】节点 L2 冲突协商与顶标微调 (Label Adjustment & Slack)',
        subtitle: '在相等子图中遇到冲突或死胡同，利用 slack 提取最小差值 d',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '节点 L2 探查相等子图',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">相等子图探查</span>',
            detailLines: [
              '│  ① 检查出边 (L2, R2): delta = 5 + 0 - 5 = 0 属于相等子图',
              '│  ② 右部点 R2 未被配对，直接成功配对: match[R2] = L2',
            ],
            fillLine: '└── 节点 L2 顺利增广，匹配增至 2 对 💘',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '节点 L3 匹配受阻与松弛更新',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">受阻与松弛</span>',
            detailLines: [
              '│  ① 检查出边 (L3, R3): delta = 3 + 0 - 3 = 0 属于相等子图',
              '│  ② 右部点 R3 未配对，增广成功: match[R3] = L3',
              '│  ③ 全图 3 对节点全部成功达成完备匹配！',
            ],
            fillLine: '└── 全局完备增广链打通，完美匹配达成 ✅',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】KM 算法最佳完备匹配终局核算 (Optimality Verification)',
        subtitle: '相等子图完备匹配权重和严格等于左顶标和与右顶标和，达到理论最优',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '完备匹配边集核算',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded font-bold">边权汇总</span>',
            detailLines: [
              '│  ① 匹配边 1: (L1, R1)，边权 w = 4',
              '│  ② 匹配边 2: (L2, R2)，边权 w = 5',
              '│  ③ 匹配边 3: (L3, R3)，边权 w = 3',
              '│  ④ 总匹配权值 = 4 + 5 + 3 = 12',
            ],
            fillLine: '└── 达成 3 对完备匹配，权重和最大化 🌟',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '对偶定理最优化验证',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">对偶极值</span>',
            detailLines: [
              '│  ① 顶标总和: ∑lx + ∑ly = (4 + 5 + 3) + 0 = 12',
              '│  ② 匹配总权: ∑w(u, match[u]) = 12',
              '│  ③ 理论证明: 任何匹配权值 ≤ ∑lx + ∑ly，取等号时必为最大权完备匹配！',
            ],
            fillLine: '└── 对偶极值闭环，KM 算法圆满求解完成 🏆',
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
