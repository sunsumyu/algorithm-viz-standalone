/**
 * 欧拉回路与欧拉路径 (Eulerian Circuit · Hierholzer · 洛谷 P7771 / LeetCode 332) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 核心：度数平衡充要判定、字典序邻接表预处理、当前弧 O(1) 动态删边、死胡同回溯压栈与逆序回路还原
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class EulerianCircuitDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'eulerian-circuit';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'eulerian-circuit' ||
      modelId === 'eulerian-path' ||
      modelId === 'hierholzer' ||
      modelId === 'P7771' ||
      modelId === 'leetcode-332' ||
      modelId === 'class067'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '欧拉回路与欧拉路径 (Eulerian Circuit · Hierholzer) · 全景推演树',
      badge: '洛谷 P7771 / LeetCode 332 / 左程云 class067 · 一笔画充要判定 · 当前弧动态删边 · 死胡同回溯压栈 · 逆序还原回路',
      descriptionHtml: `
        欧拉回路是指穿过图中每条边且每条边恰好经过一次的闭合回路（一笔画问题）。<br/>
        <b>Hierholzer 算法三大核心支柱：</b><br/>
        ① <b>度数平衡充要定理：</b>有向图存在欧拉回路 ⟺ 基图弱连通且所有顶点的入度等于出度（$\\text{inDeg}[u] = \\text{outDeg}[u]$）；存在欧拉路径 ⟺ 恰有一点出度比入度大 1（起点），恰有一点入度比出度大 1（终点）；<br/>
        ② <b>当前弧优化 (head 数组)：</b>DFS 沿有向边前进时通过 $\\text{head}[u]++$ 递增指针实现 $O(1)$ 动态删边，避免反复扫描已访问边，保证 $O(V + E)$ 严格线性复杂度；<br/>
        ③ <b>死胡同回溯与后序反转：</b>当点 $u$ 无剩余出边（进入死胡同）时，将其压入后序栈。遍历结束后翻转序列，所有子环路天然且严丝合缝地嵌入主干回路之中。
      `,
      initialStateText: '初始化原图顶点与有向边，统计出入度平衡性，准备启动 Hierholzer 深度优先遍历。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '原图一笔画拓扑',
        valuesStr: '节点 1..n，有向边集合，要求寻找覆盖所有边的字典序最小欧拉回路',
      },
      {
        prefix: '├───',
        label: '度数平衡校验通过',
        valuesStr: '各节点出度与入度完全相等，定理确保 100% 存在欧拉回路',
      },
      {
        prefix: '└───',
        label: '状态数组初始化',
        valuesStr: 'head = [0..0]，path = []，dfsStack = []，当前弧全部归零',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】度数守恒校验与出边字典序排序 (Equilibrium & Sorting)',
        subtitle: '校验入度出度平衡，对各节点出边表按编号升序排序以保证字典序最小',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '出入度守恒判定',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">欧拉判定</span>',
            detailLines: [
              '│  ① 统计所有节点出度与入度',
              '│  ② 验证每个节点满足 inDeg[u] == outDeg[u]，充要条件达成',
            ],
            fillLine: '└── 欧拉回路存在性定理严密验证通过 ⚖️',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '出边邻接表升序排序',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">字典序最小</span>',
            detailLines: [
              '│  ① 遍历节点 1..n：Collections.sort(graph[i])',
              '│  ② 保证后续 DFS 优先贪心选择编号最小的目标节点',
            ],
            fillLine: '└── 邻接表排序完成，贪心策略就绪 🔤',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】当前弧扫描与深度优先遍历 (Current Arc DFS Exploration)',
        subtitle: '利用 head[u] 当前弧指针 O(1) 跳过已访问边，递归深入后继',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '当前弧动态推进删边',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">当前弧优化</span>',
            detailLines: [
              '│  ① 取出出边 (u ➔ v) = graph[u][head[u]]',
              '│  ② 执行 head[u]++，使该边在后续探索中彻底不可见，避免重复遍历',
            ],
            fillLine: '└── O(1) 动态删边完成，保证 O(V + E) 严密复杂度 ⚡',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '递归深入目标顶点',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">DFS 深入</span>',
            detailLines: [
              '│  ① 将当前点压入 DFS 递归调用栈 dfsStack.push(u)',
              '│  ② 递归调用 dfs(v)，沿有向边深入遍历',
            ],
            fillLine: '└── 递归深入邻居顶点，展开深度优先搜索 🌲',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】死胡同回溯压栈 (Dead-end Backtracking & Post-order Push)',
        subtitle: '当前节点所有出边耗尽时压入结果数组，子环自然闭合嵌套',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '死胡同状态识别',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">出边耗尽</span>',
            detailLines: [
              '│  ① 条件 head[u] == graph[u].size() 满足，当前点无任何可用出边',
              '│  ② 递归调用栈弹出当前点 dfsStack.pop()',
            ],
            fillLine: '└── 识别死胡同无路可走，启动后序收集 🛑',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '压入后序结果序列',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">后序入栈</span>',
            detailLines: [
              '│  ① 执行 path.add(u)，将节点压入逆序结果表',
              '│  ② 核心精髓：最后无路可走的节点最先压栈，子环嵌套自然消解',
            ],
            fillLine: '└── 节点记录至后序栈，确保环路拓扑无缝拼接 📥',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段四】序列逆序翻转与一笔画还原 (Reversal & Final Eulerian Circuit)',
        subtitle: '后序序列全量逆序翻转，输出严密闭合的合法欧拉回路',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '全量后序数组翻转',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded font-bold">逆序翻转</span>',
            detailLines: [
              '│  ① Collections.reverse(path)',
              '│  ② 将后序退栈序列反转为起点出发的正向行进序列',
            ],
            fillLine: '└── 序列翻转完成，完美还原正向走边次序 🔄',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '欧拉回路闭环终局输出',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-green-100 text-green-800 rounded font-bold">终局闭环</span>',
            detailLines: [
              '│  ① 所有有向边恰好且仅经过一次',
              '│  ② 起点与终点完美重合，达成一笔画欧拉回路闭环！',
            ],
            fillLine: '└── 欧拉回路构建圆满收官 🎉',
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
