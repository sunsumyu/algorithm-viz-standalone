/**
 * 课程表 IV (Course Schedule IV · LeetCode 1462) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 拓扑排序带动状态传递闭包 (Transitive Closure) 与 O(1) 可达性查询
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class CourseScheduleIVDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'course-schedule-iv';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'course-schedule-iv' ||
      modelId === 'course-schedule-iv-1462' ||
      modelId === '1462' ||
      modelId === 'check-if-prerequisite'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '课程表 IV (Course Schedule IV · LeetCode 1462) · 全景推演树',
      badge: 'LeetCode 1462 · 有向无环图 DAG · 拓扑排序传播 · 全源传递闭包 Transitive Closure · O(1) 瞬时查询',
      descriptionHtml: `
        系统中包含 $N$ 门课程，给定直接先修依赖列表 $(u, v)$，以及若干对可达性查询 $(q_u, q_v)$。<br/>
        <b>拓扑排序与传递闭包 (Transitive Closure) 核心机制：</b><br/>
        ① <b>先修依赖图与入度建模：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;将课程建模为有向图节点，边 $u \\to v$ 表示 $u$ 是 $v$ 的直接先修；维护入度数组 $inDegree$ 与邻接表；<br/>
        ② <b>拓扑有序状态推进：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;将入度为 0 的课程入队，确保在处理课程 $cur$ 时，所有能到达 $cur$ 的前驱状态均已收敛；<br/>
        ③ <b>全源闭包状态扩散：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;当考察边 $cur \\to nxt$ 时，不仅 $cur$ 可到达 $nxt$，而且所有能到达 $cur$ 的节点 $i$ 也必能间接到达 $nxt$；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;执行位集合并：若 $isPre[i][cur] == true$，则更新 $isPre[i][nxt] = true$；<br/>
        ④ <b>多路查询 O(1) 响应：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;拓扑传播完成后得到完整的全源传递闭包矩阵，后续任意可达性查询直接查表 $isPre[u][v]$ 即可 $O(1)$ 输出答案。
      `,
      initialStateText: '载入课程规模 N = 4，依赖 [0->1, 1->2, 2->3]，初始化闭包矩阵 isPre 为 false。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '课程总数与先修依赖',
        valuesStr: 'N = 4 (C0..C3), 依赖: [0->1, 1->2, 2->3]',
      },
      {
        prefix: '├───',
        label: '待验证查询集',
        valuesStr: 'queries: [0->2], [1->3], [3->0], [0->3]',
      },
      {
        prefix: '└───',
        label: '初始入度与队列',
        valuesStr: 'inDegree = [0, 1, 1, 1], 初始队列 Q = [C0]',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】构建直接先修依赖与拓扑源点扫描',
        subtitle: '初始化直接先修布尔矩阵，将入度为 0 的顶层课程推入拓扑处理队列',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '直接先修标记 isPre[u][v] = true',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">直接标记</span>',
            detailLines: [
              '│  ① isPre[0][1] = true, inDegree[1] = 1',
              '│  ② isPre[1][2] = true, inDegree[2] = 1',
              '│  ③ isPre[2][3] = true, inDegree[3] = 1',
            ],
            fillLine: '└── 初始直接先修边注入闭包矩阵，入度统计完毕 📌',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '入度为 0 课程入队',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">源点入队</span>',
            detailLines: [
              '│  ① inDegree[0] == 0 ➔ queue.push(0)',
              '│  ② 当前队列状态: Q = [C0]',
            ],
            fillLine: '└── 拓扑遍历入口就绪，准备开启依赖链状态扩散 🚀',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】拓扑推进与传递闭包状态扩散 (Propagation)',
        subtitle: '沿拓扑序出队节点，将所有已知前驱的可达性状态向后传递至下游课程',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出队 C0 ➔ 考察边 0 -> 1',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">拓扑步 #1</span>',
            detailLines: [
              '│  ① 遍历前驱 i：仅 isPre[0][0] 为自身可达基底',
              '│  ② inDegree[1]-- 减至 0 ➔ queue.push(1)',
            ],
            fillLine: '└── C0 扩散完毕，Q 扩展为 [C1] 🛋️',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出队 C1 ➔ 考察边 1 -> 2',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">拓扑步 #2</span>',
            detailLines: [
              '│  ① 发现 isPre[0][1] == true ➔ 传递更新 isPre[0][2] = true！',
              '│  ② 传递原理: C0 先于 C1，C1 先于 C2 ➔ C0 必先于 C2',
              '│  ③ inDegree[2]-- 减至 0 ➔ queue.push(2)',
            ],
            fillLine: '└── 跨节点传递：成功推导出间接先修关系 [C0 ➔ C2] 🔗',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '出队 C2 ➔ 考察边 2 -> 3',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">拓扑步 #3</span>',
            detailLines: [
              '│  ① 发现 isPre[0][2] == true ➔ 更新 isPre[0][3] = true！',
              '│  ② 发现 isPre[1][2] == true ➔ 更新 isPre[1][3] = true！',
              '│  ③ inDegree[3]-- 减至 0 ➔ queue.push(3)',
            ],
            fillLine: '└── 全源传递闭包矩阵全部收敛完备 🎯',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】全源传递闭包收敛与多路查询验证 (Queries)',
        subtitle: '矩阵建立完毕，任意点对 (u, v) 可达性仅需 O(1) 直接读取 isPre[u][v]',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '查询集响应',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">O(1) 查询</span>',
            detailLines: [
              '│  ① 查询 [0 -> 2]: isPre[0][2] == true ➔ ✓ 是先修',
              '│  ② 查询 [1 -> 3]: isPre[1][3] == true ➔ ✓ 是先修',
              '│  ③ 查询 [3 -> 0]: isPre[3][0] == false ➔ ✗ 否 (逆向不可达)',
              '│  ④ 查询 [0 -> 3]: isPre[0][3] == true ➔ ✓ 是先修 (3 级传递)',
            ],
            fillLine: '└── 最终查询结果集: [true, true, false, true] 🎉',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '复杂度与拓扑闭包定理',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">O(V(V+E))</span>',
            detailLines: [
              '│  ① 预处理时间: O(V · (V + E))，结合 BitSet 优化可提速 64 倍',
              '│  ② 单次查询时间: O(1)，直接数组下标访问',
              '│  ③ 空间复杂度: O(V²)，二维传递闭包布尔矩阵',
            ],
            fillLine: '└── LeetCode 1462 课程表 IV 拓扑传递闭包算法完美收敛 🏆',
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
