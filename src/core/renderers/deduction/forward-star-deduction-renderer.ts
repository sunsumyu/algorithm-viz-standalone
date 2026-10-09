/**
 * 链式前向星 (Chained Forward Star · 左程云 Class 059) · 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 静态链表数组模拟指针、头插法 O(1) 连边、head[u] 表头引导出边链式遍历
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class ForwardStarDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'forward-star';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'forward-star' ||
      modelId === 'chained-forward-star' ||
      modelId === 'class059-code01'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '链式前向星 (Chained Forward Star) · 全景推演树',
      badge: '静态链表 · 头插法 O(1) 加边 · head[u] 出边遍历 · 空间 O(V + E)',
      descriptionHtml: `
        演示图结构包含顶点 <code class="font-bold text-slate-800">1, 2, 3, 4</code> 与带权有向边：<br/>
        <code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">(1➔2: 5), (1➔3: 2), (2➔4: 1)</code>。<br/>
        核心算法架构：<br/>
        ① <b>核心数据结构：</b><br/>
        &nbsp;&nbsp;• <code class="font-bold text-blue-700">head[u]</code>：记录顶点 $u$ 的最后一条出边编号（初始为 -1 表示无边）；<br/>
        &nbsp;&nbsp;• <code class="font-bold text-emerald-700">edge[cnt]</code>：结构体数组 <code class="font-mono bg-slate-100 text-slate-800 px-1 rounded">{ to, next, weight }</code>；<br/>
        ② <b>头插法 O(1) 加边机制 (addEdge)：</b><br/>
        &nbsp;&nbsp;• 将新边的前驱指针链接到原表头：<code class="font-mono bg-amber-50 text-amber-800 px-1 py-0.5 rounded font-bold">edge[cnt].next = head[u]</code>；<br/>
        &nbsp;&nbsp;• 更新顶点 $u$ 的表头为新边：<code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">head[u] = cnt++</code>；<br/>
        ③ <b>出边遍历机制 (traverse)：</b><br/>
        &nbsp;&nbsp;• 从 <code class="font-bold text-slate-800">e = head[u]</code> 出发，顺着 <code class="font-mono bg-emerald-50 text-emerald-800 px-1 py-0.5 rounded font-bold">e = edge[e].next</code> 逐条跳跃访问，直至 -1 (NULL)。
      `,
      initialStateText: '表头数组初始化为 -1，边计数器 cnt = 0，准备以头插法存入有向边。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '顶点首条出边索引数组初始化',
        valuesStr: 'head[1..4] = [-1, -1, -1, -1]',
      },
      {
        prefix: '├───',
        label: '全局已录入边编号计数器',
        valuesStr: 'cnt = 0 (边编号 0-indexed)',
      },
      {
        prefix: '└───',
        label: '静态链表结构体内存池',
        valuesStr: 'edge[] = [] (空内存池)',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】头插法依次存入边 (1➔2, w=5) 与 (1➔3, w=2)',
        subtitle: '演示同一起点顶点 1 的链表反向链接 (后插入的边排在链表首部)',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '加入边 #0: (1 ➔ 2, w=5)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">addEdge(1, 2, 5)</span>',
            detailLines: [
              '│  ① edge[0].to = 2, edge[0].weight = 5',
              '│  ② edge[0].next = head[1] (-1) ➔ 指向 NULL',
              '│  ③ 更新 head[1] = 0, cnt 自增至 1',
            ],
            fillLine: '└── 此时顶点 1 出边链: head[1] ➔ #0 ➔ NULL 🚀',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '加入边 #1: (1 ➔ 3, w=2)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">头插法链接</span>',
            detailLines: [
              '│  ① edge[1].to = 3, edge[1].weight = 2',
              '│  ② edge[1].next = head[1] (0) ➔ 链接至前一条边 #0',
              '│  ③ 更新 head[1] = 1, cnt 自增至 2',
            ],
            fillLine: '└── 顶点 1 最新出边链: head[1] ➔ #1 ➔ #0 ➔ NULL 🔗',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】加入边 #2: (2 ➔ 4, w=1)',
        subtitle: '新顶点 2 开启独立链表',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '加入边 #2: (2 ➔ 4, w=1)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">head[2] 赋值</span>',
            detailLines: [
              '│  ① edge[2].to = 4, edge[2].weight = 1',
              '│  ② edge[2].next = head[2] (-1)',
              '│  ③ 更新 head[2] = 2, cnt 自增至 3',
            ],
            fillLine: '└── 顶点 2 出边链: head[2] ➔ #2 ➔ NULL ✨',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】遍历顶点 1 的所有出边 (traverse(1))',
        subtitle: '从 head[1] 顺着 next 指针静态跳跃',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '取首边 e = head[1] = 1',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">访问 #1</span>',
            detailLines: [
              '│  ① 访问边 #1：1 ➔ 3，权重 2',
              '│  ② 跳转：e = edge[1].next = 0',
            ],
            fillLine: '└── 访问到首条出边 (1 ➔ 3)',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '访问下一条边 e = 0',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">访问 #0</span>',
            detailLines: [
              '│  ① 访问边 #0：1 ➔ 2，权重 5',
              '│  ② 跳转：e = edge[0].next = -1 ➔ 遍历终止',
            ],
            fillLine: '└── 访问顺序为逆序加边顺序: [#1, #0] 🏁',
          }),
        ].join(''),
      }),
    ];

    const loopSection = DeductionBoardPrimitives.renderLoopSection(
      rounds.join(''),
      'edge[cnt].next = head[u] ➔ head[u] = cnt++ ➔ for (e = head[u]; e != -1; e = edge[e].next)'
    );

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return traversed = [1, 0];',
      answerDescription:
        '🏆 最终返回：链式前向星以绝对的 O(1) 渐进常数完成图结构连续紧凑存储，空间占用仅为 O(V + E)！',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + loopSection + finalReturn);
  }
}
