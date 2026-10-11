/**
 * 广度优先搜索理论基础 (BFS Theory) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学
 * 队列分层驱动、水波纹扩散与无权图最短路推演
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class BFSTheoryDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'bfs-theory';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'bfs-theory' ||
      modelId === 'bfs-basic' ||
      modelId === 'breadth-first-search-theory'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '广度优先搜索理论基础 (BFS Theory) · 全景推演树',
      badge: '队列 FIFO 驱动 · 分层水波纹扩散 · 无权图全局最短路 · O(V + E) 遍历',
      descriptionHtml: `
        问题本质：系统性地按距离逐层向外探索图的所有连通分量。<br/>
        <b>BFS 推演核心机制：</b><br/>
        ① <b>FIFO 队列驱动：</b>先进先出保证按距离由近及远、严格单调递增出队；<br/>
        ② <b>入队即染标记：</b>节点一旦进入队列立即打上 <code>visited</code> 标记，杜绝重复入队；<br/>
        ③ <b>分层推进结算：</b>每层节点处理完毕，层数 <code>level++</code>，自然求得全局最短跳数。
      `,
      initialStateText: '图拓扑：6 个节点 {0, 1, 2, 3, 4, 5}，起点 0 入队，visited={0}，level=0。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '初始化访问集合',
        valuesStr: 'visited = {0}，源点染色',
      },
      {
        prefix: '├───',
        label: '初始化 FIFO 队列',
        valuesStr: 'queue = [0]，初始长度 1',
      },
      {
        prefix: '└───',
        label: '层级深度指针',
        valuesStr: 'level = 0，准备按层扫描',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】Level 0 根源点扫描',
        subtitle: '出队节点 0，扩展其所有未访问邻居 1 与 2',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出队源点 0',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-cyan-100 text-cyan-800 rounded font-bold">Level 0</span>',
            detailLines: [
              '│  ① u = queue.shift() -> 0 出队加入序列',
              '│  ② 扫描邻接表: 0 -> [1, 2]',
            ],
            fillLine: '└── traversalOrder = [0]',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '发现未访问邻居 1',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">染色入队</span>',
            detailLines: [
              '│  ① visited.add(1), queue.push(1)',
              '│  ② 当前队列: [1]',
            ],
            fillLine: '└── 节点 1 进入待扩展队列',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '发现未访问邻居 2',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">染色入队</span>',
            detailLines: [
              '│  ① visited.add(2), queue.push(2)',
              '│  ② 当前队列: [1, 2]',
            ],
            fillLine: '└── Level 0 扫描完毕，推进至 Level 1',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】Level 1 第一层环带扫描',
        subtitle: '依次出队 1 与 2，扩展下一层邻居 3, 4 与 5',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出队节点 1',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-cyan-100 text-cyan-800 rounded font-bold">Level 1</span>',
            detailLines: [
              '│  ① u = 1 出队，traversalOrder 扩展至 [0, 1]',
              '│  ② 邻接表: [0(已访), 3(新), 4(新)]',
            ],
            fillLine: '└── 准备入队邻居 3 与 4',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '节点 3 与 4 入队',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">入队</span>',
            detailLines: [
              '│  ① visited 染入 {3, 4}',
              '│  ② 当前队列: [2, 3, 4]',
            ],
            fillLine: '└── 队列长度累积为 3',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出队节点 2',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-cyan-100 text-cyan-800 rounded font-bold">Level 1</span>',
            detailLines: [
              '│  ① u = 2 出队，traversalOrder = [0, 1, 2]',
              '│  ② 扫描邻接表: [0(已访), 5(新)]',
            ],
            fillLine: '└── 准备入队邻居 5',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '节点 5 入队并进入 Level 2',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">层级递进</span>',
            detailLines: [
              '│  ① visited 染入 5，queue.push(5)',
              '│  ② 当前队列: [3, 4, 5]',
            ],
            fillLine: '└── Level 1 节点扫描完毕，推进至 Level 2',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】Level 2 终末层扫描与队列收敛',
        subtitle: '依次出队 3, 4, 5，无未访问邻居，遍历圆满结束',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出队节点 3 与 4',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">叶节点</span>',
            detailLines: [
              '│  ① 节点 3 出队，邻居 1 已访问',
              '│  ② 节点 4 出队，邻居 1 已访问',
            ],
            fillLine: '└── traversalOrder = [0, 1, 2, 3, 4]',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '出队最后节点 5 并收敛',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">队列排空</span>',
            detailLines: [
              '│  ① 节点 5 出队，邻居 2 已访问',
              '│  ② 队列 queue = []，全图 6 个节点全部覆盖',
            ],
            fillLine: '└── 最终访问顺序: [0, 1, 2, 3, 4, 5] 🌊',
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      'BFS 队列分层波纹演进轨迹'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return traversalOrder; // [0, 1, 2, 3, 4, 5]',
      answerDescription: 'BFS 保证层序递增访问，无权图天然具备全局最短路径性质，时间复杂度 O(V+E)，空间复杂度 O(V)！',
    });

    return DeductionBoardPrimitives.wrapBoard(`
      ${header}
      ${baseCase}
      ${loopSection}
      ${finalReturn}
    `);
  }
}
