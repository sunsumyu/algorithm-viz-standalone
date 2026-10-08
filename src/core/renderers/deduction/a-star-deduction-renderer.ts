/**
 * A* 启发式寻路 · 全景推演树渲染策略 (AStarDeductionRenderer)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class AStarDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'a-star';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'a-star' ||
      modelId === 'a-star-journey' ||
      modelId === 'a-star-jps' ||
      modelId === 'astar'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const rows = Math.max(3, Math.min(8, options.m ?? 4));
    const cols = Math.max(3, Math.min(8, options.n ?? 4));
    const targetR = rows - 1;
    const targetC = cols - 1;

    const manhattan = (r: number, c: number) => Math.abs(targetR - r) + Math.abs(targetC - c);

    const header = DeductionBoardPrimitives.renderHeader({
      title: 'A* 启发式搜索 (A* Search Algorithm) · 全景推演树',
      badge: 'f(n) = g(n) + h(n)',
      descriptionHtml: `
        网格空间 <span class="font-bold text-slate-800">${rows} × ${cols}</span>，起点为 (0, 0)，目标终点为 (${targetR}, ${targetC})。<br/>
        状态定义：<span class="font-bold text-slate-800">g(n)</span> 表示起点至节点 n 的已知累计代价；
        <span class="font-bold text-slate-800">h(n)</span> 为曼哈顿启发式估计；
        优先队列按照综合代价 <code class="font-mono bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-bold">f(n) = g(n) + h(n)</code> 贪心收缩。
      `,
      initialStateText: `起点 (0,0) 压入 Open 表 (g=0, h=${manhattan(0, 0)}, f=${manhattan(0, 0)})，Closed 访问集合置空。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '初始化起点 (0,0)：g(0,0)=0，曼哈顿估计 h=|' + targetR + '-0| + |' + targetC + '-0| = ' + manhattan(0, 0),
        valuesStr: `Open.push(node(0,0), f=${manhattan(0, 0)})`,
      },
      {
        prefix: '└───',
        label: `终点坐标锁定 (${targetR}, ${targetC})：目标启发剩余代价 h=0`,
        valuesStr: `Target = (${targetR}, ${targetC})`,
      },
    ]);

    // 模拟前几轮关键波前展开与决策支
    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【波前轮次 1】从 Open 表弹出全局最小 f 节点: (0,0) [f=' + manhattan(0, 0) + ']',
        subtitle: '已访问加入 Closed 集合',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '四向探测邻格 (0, 1) [向右]',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">有效通行</span>',
            detailLines: [
              `│  ① 代价计算：g(0,1) = 0 + 1 = 1, h(0,1) = ${manhattan(0, 1)}`,
              `│  ② 综合估价：<span class="font-bold text-indigo-700">f = g + h = 1 + ${manhattan(0, 1)} = ${1 + manhattan(0, 1)}</span>`,
            ],
            fillLine: `└── 记录来源 parent(0,1)=(0,0)，压入 Open 表 ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '四向探测邻格 (1, 0) [向下]',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">有效通行</span>',
            detailLines: [
              `│  ① 代价计算：g(1,0) = 0 + 1 = 1, h(1,0) = ${manhattan(1, 0)}`,
              `│  ② 综合估价：<span class="font-bold text-indigo-700">f = g + h = 1 + ${manhattan(1, 0)} = ${1 + manhattan(1, 0)}</span>`,
            ],
            fillLine: `└── 记录来源 parent(1,0)=(0,0)，压入 Open 表 ✅`,
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【波前推进】启发式引导波前精准贴向对角线目标',
        subtitle: 'Open 堆顶贪心弹出',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: `中间节点对角线贪心收缩至 (${Math.floor(rows / 2)}, ${Math.floor(cols / 2)})`,
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">启发剪枝</span>',
            detailLines: [
              `│  ① 排除反向背离目标的对称冗余节点 (h 代价增大被自动沉底)`,
              `│  ② 最优前沿节点 f 值恒定等于曼哈顿理论下界`,
            ],
            fillLine: `└── 持续沿梯度方向展开 ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: `终点锁定判定 (${targetR}, ${targetC})`,
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">抵达终点</span>',
            detailLines: [
              `│  ① 当从 Open 表弹出的节点为 (${targetR}, ${targetC}) 时，搜索立即终止`,
              `│  ② 曼哈顿可采纳性 (Admissible) 保证首次出队必为全局最优解`,
            ],
            fillLine: `└── 沿 parent 链逆向回溯路径 ✅`,
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(rounds.join(''), 'Open表优先队列收缩 · 曼哈顿距离引导');

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: `return reconstructPath(parent, target);`,
      answerDescription: `最优路径步数 = ${targetR + targetC} 步 ✅ (曼哈顿理论最短步数，0 冗余回溯)`,
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
