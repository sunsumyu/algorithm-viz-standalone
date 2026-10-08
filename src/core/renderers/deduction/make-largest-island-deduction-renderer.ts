/**
 * LeetCode 827: 最大人工岛 / 填海造陆 · 全景推演树渲染策略 (MakeLargestIslandDeductionRenderer)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class MakeLargestIslandDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'make-largest-island';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'make-largest-island' ||
      modelId === 'making-a-large-island' ||
      modelId === 'build-largest-island' ||
      modelId === '827' ||
      modelId === 'leetcode-827'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const rows = Math.max(3, Math.min(5, options.m ?? 3));
    const cols = Math.max(3, Math.min(5, options.n ?? 3));

    const header = DeductionBoardPrimitives.renderHeader({
      title: 'LeetCode 827. 最大人工岛 (Making A Large Island) · 全景推演树',
      badge: '两遍扫描法 · 独立编号染色与去重邻接填海桥接',
      descriptionHtml: `
        网格地形大小为 <span class="font-bold text-slate-800">${rows} × ${cols}</span>，允许最多将<span class="font-bold text-rose-700">一个 0 改为 1（填海）</span>，求可能连通的最大岛屿面积。<br/>
        <span class="font-bold text-slate-800">第一遍扫描 (染色建索引)</span>：将各个独立岛屿染上不同 ID (2, 3, ...)，并用哈希表记录各 ID 的真实面积 <code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded">areaMap[id]</code>。<br/>
        <span class="font-bold text-slate-800">第二遍扫描 (水域桥接)</span>：遍历每个水域格 (r, c)，提取四向相邻格所属的岛屿 ID 并存入 <span class="font-bold text-indigo-700">去重集合 Set</span>。<br/>
        桥接面积：<code class="font-mono bg-indigo-50 text-indigo-800 px-1.5 py-0.5 rounded font-bold">newArea = 1 + ∑ areaMap[id] (id ∈ Set)</code>。
      `,
      initialStateText: `初始全局最大面积 maxArea 设为各单岛最大值，islandId 从 2 开始递增。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '第一遍扫描：DFS 岛屿染色与面积统计',
        valuesStr: 'for each land: dfs() 染色分配 ID，存入 areaMap[id] = area',
      },
      {
        prefix: '└───',
        label: '全陆地特判：若网格中原本无水域',
        valuesStr: '0 个水域格 ➔ 直接返回全域总面积 rows × cols',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第一阶段完成】独立岛屿 ID 索引表构建就绪',
        subtitle: '各连通分量面积已被 O(1) 缓存',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '岛屿 A (ID=2) 染色收尾',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">ID: 2</span>',
            detailLines: [
              `│  ① 连通面积计算完毕，存入字典：areaMap[2] = sizeA`,
            ],
            fillLine: `└── 记录 areaMap[2] ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '岛屿 B (ID=3) 染色收尾',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">ID: 3</span>',
            detailLines: [
              `│  ① 连通面积计算完毕，存入字典：areaMap[3] = sizeB`,
            ],
            fillLine: `└── 记录 areaMap[3] ✅`,
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【第二阶段推演】水域格 (r, c) 填海尝试与四向去重桥接',
        subtitle: 'Set 去重防环化重算',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '探查上下左右四个邻格的 islandId',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">桥接判定</span>',
            detailLines: [
              `│  ① 上方邻格 ID 压入 Set`,
              `│  ② 下方/左方/右方邻格 ID 压入 Set（若同一岛屿多向环绕，Set 自动去重）`,
            ],
            fillLine: `└── 获取唯一相邻岛屿集合 Set={id1, id2} ✅`,
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '累加填海新面积并更新全局极值',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">极值松弛</span>',
            detailLines: [
              `│  ① 填海贡献自身面积 1：<span class="font-bold text-indigo-700">tryArea = 1 + areaMap[id1] + areaMap[id2]</span>`,
              `│  ② 全局松弛：<span class="font-bold text-emerald-700">maxArea = max(maxArea, tryArea)</span>`,
            ],
            fillLine: `└── 最大合并面积完成动态更新 ✅`,
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      '两遍扫描 · O(M × N) 线性时间复杂度',
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return maxArea;',
      answerDescription: '所有水域桥接点枚举完毕，返回允许一次填海能够获得的最大岛屿面积 ✅',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
