/**
 * LeetCode 417: 太平洋大西洋水流 · 全景推演树渲染策略 (WaterFlowDeductionRenderer)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class WaterFlowDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'water-flow';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'water-flow' ||
      modelId === 'class058-code04' ||
      modelId === 'pacific-atlantic-417'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const rows = Math.max(3, Math.min(6, options.m ?? 5));
    const cols = Math.max(3, Math.min(6, options.n ?? 5));

    const header = DeductionBoardPrimitives.renderHeader({
      title: 'LeetCode 417. 太平洋大西洋水流 · 全景推演树',
      badge: '逆向思维 · 双向逆流多源搜索 · 集合交集',
      descriptionHtml: `
        网格地形 <span class="font-bold text-slate-800">${rows} × ${cols}</span>。<br/>
        <span class="font-bold text-slate-800">思维逆转 (Reverse Inundation)</span>：若从每个内格正向模拟水往低处流，时间复杂度高达 O((MN)²)。<br/>
        反向思考：从海洋边界向内陆<span class="font-bold text-indigo-700">“逆流登山”</span>——当邻格高度 <code class="font-mono bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-bold">neighborH ≥ curH</code> 时即可连通。<br/>
        分别推导太平洋可达集 <span class="text-blue-600 font-bold">P</span> 与大西洋可达集 <span class="text-rose-600 font-bold">A</span>，双洋交集 <span class="text-purple-600 font-bold">P ∩ A</span> 即为解。
      `,
      initialStateText: `太平洋边界 (上边/左边) 与大西洋边界 (下边/右边) 分别作为两组多源起点，波前访问集 PacificSet 与 AtlanticSet 置空。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: `太平洋边界初始注入 (上边 r=0, 左边 c=0)，共 ${rows + cols - 1} 个多源起点`,
        valuesStr: `PacificQueue.push(全部 (0, c) 与 (r, 0))`,
      },
      {
        prefix: '└───',
        label: `大西洋边界初始注入 (下边 r=${rows - 1}, 右边 c=${cols - 1})，共 ${rows + cols - 1} 个多源起点`,
        valuesStr: `AtlanticQueue.push(全部 (${rows - 1}, c) 与 (r, ${cols - 1}))`,
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【波前阶段 1】太平洋逆流登山多源推进 (Pacific DFS/BFS)',
        subtitle: '从北岸与西岸逆流爬坡',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '逆流爬坡判定：邻格 height ≥ 当前格 height',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">🌊 太平洋可达</span>',
            detailLines: [
              `│  ① 顺流是高处流向低处，因此从洋面出发逆流必须爬向等高或更高山峰`,
              `│  ② 标记 pacReachable[nr][nc] = true，压入太平洋波前队列`,
            ],
            fillLine: `└── 持续向内陆高地蔓延展开 ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '遇到更低地势阻断：邻格 height < 当前格 height',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-800 rounded font-bold">⛔ 逆流阻断</span>',
            detailLines: [
              `│  ① 水流无法向该低洼格倒流逆流爬坡`,
              `│  ② 该分支自然剪枝，停止延伸`,
            ],
            fillLine: `└── 剪枝不入队 ✅`,
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【波前阶段 2】大西洋逆流登山多源推进 (Atlantic DFS/BFS)',
        subtitle: '从南岸与东岸逆流爬坡',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '逆流爬坡判定：邻格 height ≥ 当前格 height',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">🌊 大西洋可达</span>',
            detailLines: [
              `│  ① 独立对大西洋海洋边沿展开逆流探测`,
              `│  ② 标记 atlReachable[nr][nc] = true，压入大西洋波前队列`,
            ],
            fillLine: `└── 持续向内陆山脉脊线蔓延展开 ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '双洋可达性集合交集归约 (Pacific ∩ Atlantic)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">🏆 双洋汇水点</span>',
            detailLines: [
              `│  ① 遍历全网所有单元格 (r, c)`,
              `│  ② 满足 <span class="font-bold text-indigo-700">pacReachable[r][c] && atlReachable[r][c]</span> 的单元格，即为最终汇水点`,
            ],
            fillLine: `└── 收集坐标并加入全局解集 ✅`,
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(rounds.join(''), '双向逆流多源波前 · O(MN) 线性时间复杂度');

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return ans;',
      answerDescription: '已完成双洋可达矩阵交集运算，输出所有可同时流向两大洋的脊梁与高地坐标集合 ✅',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
