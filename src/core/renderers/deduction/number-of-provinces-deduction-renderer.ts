/**
 * 省份数量 (Number of Provinces · LeetCode 547) · 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 并查集初始化、上三角邻接矩阵扫描、路径压缩集合归并与独立省份计数
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class NumberOfProvincesDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'number-of-provinces';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'number-of-provinces' ||
      modelId === 'leetcode-547' ||
      modelId === 'lc-547' ||
      modelId === 'friend-circles' ||
      modelId === 'class056-code02'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '省份数量 (Number of Provinces · LC 547) · 并查集推演树',
      badge: '并查集 (Union-Find) · 路径压缩 · 连通分量计数 · O(N² · α(N))',
      descriptionHtml: `
        包含 <code class="font-bold text-slate-800">N = 3</code> 个城市：<br/>
        城市连通矩阵：<code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">isConnected = [[1, 1, 0], [1, 1, 0], [0, 0, 1]]</code>。<br/>
        核心算法架构：<br/>
        ① <b>初始化阶段：</b> 每个城市自成独立代表元，<code class="font-bold text-slate-800">parent[i] = i</code>，初始省份计数 <code class="font-bold text-emerald-700">provinces = N</code>；<br/>
        ② <b>上三角扫描与集合合并：</b> 遍历满足 <code class="font-bold text-slate-800">i &lt; j</code> 的城市对，若 <code class="font-bold text-slate-800">isConnected[i][j] == 1</code>，调用 <code class="font-bold text-indigo-700">find</code> 查找各自根节点：<br/>
        &nbsp;&nbsp;• 若根节点不同（属于不同集合），执行 <code class="font-bold text-amber-700">parent[rootI] = rootJ</code> 并将独立省份数递减（<code class="font-mono bg-amber-50 text-amber-800 px-1 py-0.5 rounded font-bold">provinces--</code>）；<br/>
        ③ <b>终态收敛：</b> 扫描完毕，返回当前的独立省份计数（连通分量数）。
      `,
      initialStateText: '全图 3 个城市，初始化 3 个独立集合，parent=[0, 1, 2]，准备扫描邻接矩阵。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '城市规模与初始集合计数',
        valuesStr: 'N = 3, provincesCount = 3',
      },
      {
        prefix: '├───',
        label: '并查集父指针数组初始化',
        valuesStr: 'parent = [0: 0, 1: 1, 2: 2]',
      },
      {
        prefix: '└───',
        label: '连通性邻接矩阵',
        valuesStr: 'isConnected = [[1,1,0],[1,1,0],[0,0,1]]',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】考察城市对 (0, 1)',
        subtitle: '矩阵值 isConnected[0][1] = 1 ➔ 存在直连道路',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '查找集合根节点',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">find(0) & find(1)</span>',
            detailLines: [
              '│  ① root0 = find(0) ➔ 0',
              '│  ② root1 = find(1) ➔ 1',
              '│  ③ root0 != root1 ➔ 两城市当前属于不同省份',
            ],
            fillLine: '└── 判定：属于不同连通分量，触发合并 🔗',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '执行 union(0, 1)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">合并成功</span>',
            detailLines: [
              '│  ① 赋值：parent[root0] = root1 ➔ parent[0] = 1',
              '│  ② 当前父指针数组：parent = [1, 1, 2]',
              '│  ③ 省份计数递减：provinces = 3 - 1 = 2',
            ],
            fillLine: '└── 独立省份总数更新为：2 🌐',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】考察城市对 (0, 2) 与 (1, 2)',
        subtitle: '矩阵值 isConnected[0][2] = 0, isConnected[1][2] = 0 ➔ 无道路直连',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '检查城市对 (0, 2)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded font-bold">无边跳过</span>',
            detailLines: [
              '│  ① isConnected[0][2] == 0',
              '│  ② 两城市无直连道路，无需 union',
            ],
            fillLine: '└── 集合状态与省份计数保持不变',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '检查城市对 (1, 2)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded font-bold">无边跳过</span>',
            detailLines: [
              '│  ① isConnected[1][2] == 0',
              '│  ② 两城市无直连道路，无需 union',
            ],
            fillLine: '└── 最终独立省份总数维持：2',
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      '上三角矩阵扫描 ➔ 查找根节点 ➔ 路径压缩集合合并 ➔ 维护省份总数'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return provinces = 2;',
      answerDescription:
        '🏆 最终返回：矩阵上三角所有城市对扫描完毕，并查集成功收敛，最终独立省份总数 = 2！',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
