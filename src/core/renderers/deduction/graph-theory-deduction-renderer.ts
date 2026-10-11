/**
 * 图论理论基础 (Graph Theory) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学
 * 邻接矩阵与邻接表表示法对决及动态增删边推演
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class GraphTheoryDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'graph-theory';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'graph-theory' ||
      modelId === 'graph-representation' ||
      modelId === 'graph-basics'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '图论理论基础 (Graph Theory) · 全景推演树',
      badge: '邻接矩阵 vs 邻接表 · 空间与时间效率权衡 · 动态边操作',
      descriptionHtml: `
        问题本质：离散图结构在计算机内存中的最佳建模范式选择。<br/>
        <b>两大核心数据结构对决：</b><br/>
        ① <b>邻接矩阵 (Adjacency Matrix)：</b>空间复杂度 <code>O(V²)</code>，判边 <code>O(1)</code>，天然支持稠密图与矩阵乘法快速幂；<br/>
        ② <b>邻接表 (Adjacency List)：</b>空间复杂度 <code>O(V + E)</code>，遍历度数 <code>O(deg)</code>，是绝大多数稀疏图算法的首选标准；<br/>
        ③ <b>动态维护：</b>实时增删边时，矩阵通过常数写值维护，邻接表通过链表插入/删除维护。
      `,
      initialStateText: '初始图拓扑：5 个顶点 {0, 1, 2, 3, 4}，6 条无向边，空间初始状态。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '顶点集合规模',
        valuesStr: 'V = 5，标号 0 ~ 4',
      },
      {
        prefix: '├───',
        label: '边集合规模',
        valuesStr: 'E = 6，无向无权边',
      },
      {
        prefix: '└───',
        label: '内存布局对照',
        valuesStr: '矩阵需要 25 个整型槽位，邻接表需要 5 个表头加 12 个链表节点',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】邻接矩阵静态建模',
        subtitle: 'matrix[i][j] = 1 表示连通，对称矩阵',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '对角线与零元素',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-800 rounded font-bold">无自环</span>',
            detailLines: [
              '│  ① matrix[i][i] = 0 (无自环边)',
              '│  ② 无向图关于主对角线对称: matrix[i][j] == matrix[j][i]',
            ],
            fillLine: '└── 空间消耗恒为 V² = 25 个单元',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: 'O(1) 判边查询',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">常数查边</span>',
            detailLines: [
              '│  ① 检查 (1, 3) 是否相邻: matrix[1][3] == 1 -> 直接命中',
              '│  ② 检查 (0, 2) 是否相邻: matrix[0][2] == 0 -> O(1) 判定不相邻',
            ],
            fillLine: '└── 查询任意两点关系无需任何遍历',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】邻接表空间紧凑建模',
        subtitle: 'adj[u] 存储出边顶点，总空间仅 O(V + 2E)',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '邻居动态挂载',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">紧凑存储</span>',
            detailLines: [
              '│  ① 顶点 0 仅连接 [1, 4]，长度为 2',
              '│  ② 顶点 1 连接 [0, 2, 3]，长度为 3',
            ],
            fillLine: '└── 零多余内存开销，空间紧凑',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '出边遍历效率',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">极速枚举</span>',
            detailLines: [
              '│  ① 遍历顶点 u 的所有邻居只需迭代其私有链表',
              '│  ② 避免矩阵中遍历整行 V 个槽位扫描无效的 0',
            ],
            fillLine: '└── 深度优先/广度优先搜索吞吐量最优',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】动态拓扑演化 · 加边与删边',
        subtitle: '执行 addEdge(2, 4) 与 removeEdge(1, 3)',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '动态添加边 (2, 4)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">加边</span>',
            detailLines: [
              '│  ① 矩阵赋值: matrix[2][4] = matrix[4][2] = 1',
              '│  ② 邻接表追加: adj[2].add(4), adj[4].add(2)',
            ],
            fillLine: '└── 边数递增 E = 7',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '动态删除边 (1, 3)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">删边</span>',
            detailLines: [
              '│  ① 矩阵重置: matrix[1][3] = matrix[3][1] = 0',
              '│  ② 邻接表移除: adj[1].remove(3), adj[3].remove(1)',
            ],
            fillLine: '└── 边数恢复 E = 6，图拓扑同步更新 🕸️',
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      '图论数据结构推演全景'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return { matrix, adjList };',
      answerDescription: '稠密图选邻接矩阵 (O(V²))，稀疏图选邻接表 (O(V+E))，竞赛与极端性能选链式前向星！',
    });

    return DeductionBoardPrimitives.wrapBoard(`
      ${header}
      ${baseCase}
      ${loopSection}
      ${finalReturn}
    `);
  }
}
