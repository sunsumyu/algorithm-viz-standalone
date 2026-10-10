/**
 * 树上启发式合并 (DSU on Tree · CF600E) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 核心：重儿子子树保留计数桶 (keep=true)、轻儿子统计后清空 (keep=false)、轻边跳跃不超过 O(log n) 次
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class DSUOnTreeDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'dsu-on-tree';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'dsu-on-tree' ||
      modelId === 'dsu-tree' ||
      modelId === 'sack' ||
      modelId === 'CF600E' ||
      modelId === 'U41492' ||
      modelId === 'class075'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '树上启发式合并 (DSU on Tree · CF600E) · 全景推演树',
      badge: '洛谷 U41492 / CF600E · 重儿子信息保留 (keep=true) · 轻儿子子树清空 (keep=false) · 轻边跳跃上限 O(log N) · 总复杂度 O(N log N)',
      descriptionHtml: `
        树上启发式合并（又称 Sack 或 DSU on Tree）是一种优雅高效的静态子树信息统计离线算法。<br/>
        <b>三大核心推演支柱与复杂度保证：</b><br/>
        ① <b>第一次 DFS：</b>预处理子树大小 $sz[u]$ 与重儿子 $son[u]$（子树规模最大的子节点）；<br/>
        ② <b>第二次 DFS：</b>先递归统计所有轻儿子并在回溯时清空计数桶（<code>keep=false</code>），随后递归统计重儿子且完整保留其计数桶（<code>keep=true</code>）；<br/>
        ③ <b>暴力合并与清空判定：</b>暴力遍历所有轻子树节点将其贡献累加至全局桶中，结算当前节点答案；若当前节点自身为轻儿子，向父节点回溯前清空自身子树全部数据；<br/>
        ④ <b>复杂度定理：</b>每个节点只在向上跨越轻边时被重复统计，而树上任意节点到根的路径上至多经过 $O(\\log N)$ 条轻边，故总体时间复杂度严格为 $O(N \\log N)$。
      `,
      initialStateText: '输入树拓扑结构与各节点颜色属性，初始化 sz, son, cnt, ans 数组，准备启动双阶段推演。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '节点拓扑与颜色属性',
        valuesStr: '节点 1..n 颜色数组 col[1..n]，出边邻接表就绪',
      },
      {
        prefix: '├───',
        label: '全局频次桶与种类初态',
        valuesStr: 'cnt[c] = 0, distinctCount = 0，全局状态零污染',
      },
      {
        prefix: '└───',
        label: '轻边跳跃复杂度定理',
        valuesStr: '任意节点到根路径轻边数严格 <= log2(N)，总操作次数 O(N log N)',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】第一次 DFS 预处理与重儿子划分 (Pre-DFS & Heavy Child Identification)',
        subtitle: '后序遍历计算子树大小 sz 与重儿子 son，划分重轻边',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '子树大小统计',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">DFS1 统计</span>',
            detailLines: [
              '│  ① 初始 sz[u] = 1，递归遍历各子节点 v',
              '│  ② 回溯累加子树规模：sz[u] += sz[v]',
            ],
            fillLine: '└── 子树节点总数规约就绪 📐',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '重儿子判定与重边划分',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">重儿子确立</span>',
            detailLines: [
              '│  ① 比较各子节点大小：if (sz[v] > sz[son[u]]) son[u] = v',
              '│  ② 确立唯一重儿子，形成长重链，其余子节点均为轻儿子',
            ],
            fillLine: '└── 重儿子索引与重边划分就绪 👑',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】第二次 DFS 启发式合并与保留消除 (Recursive Merging & Keep Decision)',
        subtitle: '轻儿子先算后清空、重儿子算后全量保留、合并轻子树贡献与结算答案',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '递归轻儿子并清空数据',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded font-bold">轻儿子递归</span>',
            detailLines: [
              '│  ① 遍历 u 的所有轻儿子 v (v != son[u])：dfsSolve(v, u, keep=false)',
              '│  ② 轻子树统计完毕后彻底清空频次桶，保证对兄弟分支零污染',
            ],
            fillLine: '└── 轻儿子子树计算完成并清空 🧹',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '递归重儿子并全量保留',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">重儿子保留</span>',
            detailLines: [
              '│  ① 递归重儿子：dfsSolve(son[u], u, keep=true)',
              '│  ② 重儿子包含子树绝大部分节点，其统计数据直接保留在桶中，无需重新计算',
            ],
            fillLine: '└── 重儿子统计数据完整继承在桶中 📦',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '暴力合并轻子树贡献与答案结算',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">暴力合并</span>',
            detailLines: [
              '│  ① 暴力遍历各轻子树节点及 u 自身：updateSubtree(..., val=+1, skipSon=son[u])',
              '│  ② 记录当前节点答案：ans[u] = distinctCount',
            ],
            fillLine: '└── 节点子树答案写入 ans[u] 📝',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '回溯保留判定与轻节点清空',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">回溯判定</span>',
            detailLines: [
              '│  ① 检查 keep 标识：若 keep == false，说明 u 自身为轻儿子',
              '│  ② 回溯撤销：updateSubtree(u, fa, val=-1, skipSon=0)，清空整棵子树',
            ],
            fillLine: '└── 回溯状态归位完毕 ⚖️',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】树上启发式合并结果输出 (DSU on Tree Results Summary)',
        subtitle: 'ans[1..n] 记录整棵树各节点子树的颜色种类数，全局总耗时 O(N log N)',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '树上启发式合并结果输出',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">最终答案</span>',
            detailLines: [
              '│  ① 利用重轻链不对称性，重子树免去重复统计，轻子树至多被访问 O(log N) 次',
              '│  ② 各节点子树颜色数精确汇总至 ans 数组，算法圆满闭环 🏆',
            ],
            fillLine: '└── 达成近乎线性的超高执行效率 O(N log N) 🏆',
          }),
        ].join(''),
      }),
    ];

    return `
      <div class="p-4 bg-slate-950 text-slate-100 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed border border-slate-800 shadow-xl space-y-4">
        ${header}
        ${baseCase}
        ${rounds.join('')}
      </div>
    `;
  }
}
