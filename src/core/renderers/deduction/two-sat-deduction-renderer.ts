/**
 * 2-SAT 问题与强连通缩点 (2-Satisfiability Problem · 洛谷 P4782) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 核心：逻辑子句转蕴涵边、Tarjan SCC 缩点判定与拓扑反序赋值
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class TwoSATDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'two-sat-problem';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'two-sat-problem' ||
      modelId === 'two-sat' ||
      modelId === 'two-sat-algorithm-194' ||
      modelId === 'class194-code01' ||
      modelId === 'P4782'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '2-SAT 问题与强连通缩点 (2-Satisfiability Problem) · 全景推演树',
      badge: '洛谷 P4782 · 逻辑蕴涵建图 · Tarjan SCC 缩点 · 拓扑反序赋值',
      descriptionHtml: `
        以包含 2 个布尔变量 $x_1, x_2$ 的可满足子句集为例：<br/>
        <code class="font-mono bg-blue-50 text-blue-800 px-1 py-0.5 rounded font-bold">(x1 ∨ x2) ∧ (¬x1 ∨ x2) ∧ (¬x1 ∨ ¬x2)</code>。<br/>
        算法推演三大关键步骤：<br/>
        ① <b>逻辑子句转蕴涵边：</b>利用恒等式 $(u \lor v) \iff (\neg u \implies v) \land (\neg v \implies u)$ 构建有向蕴涵网络；<br/>
        ② <b>Tarjan 强连通缩点：</b>运行 Tarjan 算法划分所有强连通分量 (SCC)。若存在变量 $x_i$ 满足 $x_i$ 与 $\neg x_i$ 属于同一 SCC，则互为充要条件导致逻辑矛盾 (UNSAT)；<br/>
        ③ <b>拓扑反序解构造：</b>Tarjan 生成的 SCC 编号具有逆拓扑序性质（编号越小拓扑序越靠后）。若 $\\text{scc}[x_i] < \\text{scc}[\\neg x_i]$ 则赋值 $x_i = 1$，否则赋值 $x_i = 0$。
      `,
      initialStateText: '初始化 4 个文字节点 x1, ¬x1, x2, ¬x2，准备载入逻辑子句添加蕴涵边。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '布尔变量与字面量节点编码',
        valuesStr: 'x1 (1), ¬x1 (2), x2 (3), ¬x2 (4) [2*i-1 为正, 2*i 为负]',
      },
      {
        prefix: '├───',
        label: '逻辑约束子句集合',
        valuesStr: 'Clause 1: (x1 ∨ x2), Clause 2: (¬x1 ∨ x2), Clause 3: (¬x1 ∨ ¬x2)',
      },
      {
        prefix: '└───',
        label: 'Tarjan 状态数组初始化',
        valuesStr: 'dfn[] = [0,0,0,0,0], low[] = [0,0,0,0,0], scc[] = [0,0,0,0,0], inStack[] = [F,F,F,F,F]',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】逻辑子句转化为有向蕴涵边 (Implication Graph Construction)',
        subtitle: '根据逆否命题等价性，每个 2-CNF 子句 (a ∨ b) 展开为 2 条有向边',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '载入子句 (x1 ∨ x2)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">Clause 1</span>',
            detailLines: [
              '│  ① 若 x1 为假 (¬x1) 则 x2 必为真 ➔ 边: ¬x1 ➔ x2',
              '│  ② 若 x2 为假 (¬x2) 则 x1 必为真 ➔ 边: ¬x2 ➔ x1',
            ],
            fillLine: '└── 蕴涵图存入边: (¬x1 ➔ x2), (¬x2 ➔ x1) 🔗',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '载入子句 (¬x1 ∨ x2)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">Clause 2</span>',
            detailLines: [
              '│  ① 若 ¬x1 为假 (x1) 则 x2 必为真 ➔ 边: x1 ➔ x2',
              '│  ② 若 x2 为假 (¬x2) 则 ¬x1 必为真 ➔ 边: ¬x2 ➔ ¬x1',
            ],
            fillLine: '└── 蕴涵图存入边: (x1 ➔ x2), (¬x2 ➔ ¬x1) 🔗',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '载入子句 (¬x1 ∨ ¬x2)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">Clause 3</span>',
            detailLines: [
              '│  ① 若 ¬x1 为假 (x1) 则 ¬x2 必为真 ➔ 边: x1 ➔ ¬x2',
              '│  ② 若 ¬x2 为假 (x2) 则 ¬x1 必为真 ➔ 边: x2 ➔ ¬x1',
            ],
            fillLine: '└── 蕴涵图存入边: (x1 ➔ ¬x2), (x2 ➔ ¬x1) 🔗',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】执行 Tarjan 算法求强连通分量 (Tarjan SCC Shrink)',
        subtitle: '深搜递归打时间戳与返祖边回溯，缩点合并形成有向无环图 (DAG)',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'Tarjan DFS 遍历节点与回溯',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">DFS & Stack</span>',
            detailLines: [
              '│  ① 按索引 1~4 依次触发 tarjan(u)，打访问序号 dfn[u] 与 low[u]',
              '│  ② 节点进栈维护祖先关系，沿出边检测返祖边更新 low 最小值',
            ],
            fillLine: '└── 识别强连通根: dfn[u] == low[u] 触发弹栈缩点 ⚡',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '弹栈并赋予 SCC 分量编号',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded font-bold">SCC 形成</span>',
            detailLines: [
              '│  ① 节点弹栈: scc[¬x1]=1, scc[x2]=2, scc[x1]=3, scc[¬x2]=4',
              '│  ② 所有 4 个字面量分别独立或归属不同连通分量',
            ],
            fillLine: '└── 强连通缩点完毕，共获得 4 个 SCC 分量 🏷️',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】矛盾检测与拓扑序反向赋值 (Conflict Check & Assignment)',
        subtitle: '核验各变量真假状态是否在同一 SCC，按逆拓扑序赋予真值',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '检验变量 x1',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">评估 x1</span>',
            detailLines: [
              '│  ① scc[x1]=3 ≠ scc[¬x1]=1 ➔ 无强连通环路冲突',
              '│  ② 比较 SCC 编号: scc[x1](3) > scc[¬x1](1) ➔ ¬x1 拓扑序靠后',
              '│  ③ 赋予逆拓扑较优解: x1 = 0 (False)',
            ],
            fillLine: '└── 决策确定: x1 = False (0) ✅',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '检验变量 x2',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">评估 x2</span>',
            detailLines: [
              '│  ① scc[x2]=2 ≠ scc[¬x2]=4 ➔ 无强连通环路冲突',
              '│  ② 比较 SCC 编号: scc[x2](2) < scc[¬x2](4) ➔ x2 拓扑序靠后',
              '│  ③ 赋予逆拓扑较优解: x2 = 1 (True)',
            ],
            fillLine: '└── return assignment = [x1=0, x2=1]; // 成功求得满足解向量 🏆',
          }),
        ].join(''),
      }),
    ];

    return [header, baseCase, ...rounds].join('\n');
  }
}
