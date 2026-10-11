/**
 * 深度优先搜索理论基础 (DFS Theory) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学
 * 递归入栈深入、图遍历染色与回溯展开推演
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class DFSTheoryDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'dfs-theory';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'dfs-theory' ||
      modelId === 'dfs-basic' ||
      modelId === 'depth-first-search-theory'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '深度优先搜索理论基础 (DFS Theory) · 全景推演树',
      badge: '递归纵深探索 · 状态标记防止成环 · 回溯机制 · O(V + E) 遍历',
      descriptionHtml: `
        问题本质：系统性遍历图的所有连通分量，优先向深度方向延伸。<br/>
        <b>DFS 推演核心机制：</b><br/>
        ① <b>顶点染色标记：</b>维护 <code>visited</code> 集合，记录已访问顶点，杜绝死循环；<br/>
        ② <b>递归栈深入：</b>发现未访问邻居立即发起递归调用 <code>DFS(v)</code>，调用栈逐层累积；<br/>
        ③ <b>后序回溯恢复：</b>当顶点所有邻接边探索穷尽后，执行弹栈返回调用者，继续下一分支探索。
      `,
      initialStateText: '图拓扑：6 个节点 {0, 1, 2, 3, 4, 5}，5 条无向边，起点 node = 0。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '初始化已访问集合',
        valuesStr: 'visited = {}，空集状态',
      },
      {
        prefix: '├───',
        label: '初始化递归调用栈',
        valuesStr: 'stack = []，深度 = 0',
      },
      {
        prefix: '└───',
        label: '遍历输出序列',
        valuesStr: 'traversalOrder = []',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】从起点 0 深入左子分支',
        subtitle: '递归路径：0 -> 1 -> 3，遇到叶子节点触发首次回溯',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'DFS(0) 启动',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">根起点</span>',
            detailLines: [
              '│  ① 标记 visited[0] = true',
              '│  ② stack 压入 0，当前栈: [0]',
            ],
            fillLine: '└── 深入首个邻居 1',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'DFS(1) 入栈深入',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">深度累加</span>',
            detailLines: [
              '│  ① 标记 visited[1] = true',
              '│  ② stack 压入 1，当前栈: [0, 1]，深度 2',
            ],
            fillLine: '└── 发现未探索邻居 3，继续纵深推进',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'DFS(3) 触达叶子',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">无路可走</span>',
            detailLines: [
              '│  ① 标记 visited[3] = true，当前栈: [0, 1, 3]',
              '│  ② 邻居 1 已访问，所有边探索完毕',
            ],
            fillLine: '└── 准备触发回溯弹栈',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: 'DFS(3) 回溯弹栈',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">退栈恢复</span>',
            detailLines: [
              '│  ① stack.pop() -> 当前栈退回 [0, 1]',
              '│  ② 光标返回调用方顶点 1',
            ],
            fillLine: '└── 回溯完成，继续探索节点 1 的其他邻居 4',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】探测左分支姊妹节点 4 并回溯至起点',
        subtitle: '递归路径：1 -> 4，处理完毕后左子树全部分支闭合',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'DFS(4) 入栈探索',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">分支探测</span>',
            detailLines: [
              '│  ① 标记 visited[4] = true，当前栈: [0, 1, 4]',
              '│  ② 节点 4 无其余未访问邻居',
            ],
            fillLine: '└── 当前节点探索穷尽',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'DFS(4) 弹栈回溯',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">退栈</span>',
            detailLines: [
              '│  ① stack.pop() -> 当前栈退回 [0, 1]',
              '│  ② 返回节点 1',
            ],
            fillLine: '└── 节点 1 所有邻居全部处理完毕',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: 'DFS(1) 终结退栈',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">左子树收尾</span>',
            detailLines: [
              '│  ① stack.pop() -> 当前栈退回 [0]',
              '│  ② 光标退回根节点 0',
            ],
            fillLine: '└── 起点 0 准备探索右侧分支 2',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】深入右子分支并完成全图收尾',
        subtitle: '递归路径：0 -> 2 -> 5，图的所有连通分量遍历闭环',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'DFS(2) 入栈',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">右分支</span>',
            detailLines: [
              '│  ① 标记 visited[2] = true，当前栈: [0, 2]',
              '│  ② 深入邻居 5',
            ],
            fillLine: '└── 推进至顶点 5',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'DFS(5) 深入并收尾',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">最后顶点</span>',
            detailLines: [
              '│  ① 标记 visited[5] = true，当前栈: [0, 2, 5]',
              '│  ② 节点 5 无未访邻居，开始逐层弹栈',
            ],
            fillLine: '└── 节点 5 弹栈，节点 2 弹栈，节点 0 弹栈',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '全图遍历结束',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">遍历完成</span>',
            detailLines: [
              '│  ① 所有栈帧清空，stack = []',
              '│  ② visited 包含全部 6 个节点',
            ],
            fillLine: '└── 访问顺序序列: [0, 1, 3, 4, 2, 5] 🏆',
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      'DFS 递归调用轨迹'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return traversalOrder; // [0, 1, 3, 4, 2, 5]',
      answerDescription: 'DFS 纵深优先探测，状态标记防止回路，后序弹栈回溯恢复现场，时间复杂度 O(V+E)，空间复杂度 O(V)！',
    });

    return DeductionBoardPrimitives.wrapBoard(`
      ${header}
      ${baseCase}
      ${loopSection}
      ${finalReturn}
    `);
  }
}
