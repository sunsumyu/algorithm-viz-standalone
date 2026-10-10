/**
 * 弦图判定与 MCS 最大势算法 (Chordal Graph · 洛谷 P3199) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 进阶图论: MCS 逆序生成完美消除序列 PEO、弦图充要条件检验
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class ChordalGraphDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'chordal-graph';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'chordal-graph' ||
      modelId === 'mcs' ||
      modelId === 'peo' ||
      modelId === 'P3199' ||
      modelId === 'chordal'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '弦图判定与 MCS 最大势算法 (Chordal Graph & MCS · 洛谷 P3199) · 全景推演树',
      badge: '洛谷 P3199 · 进阶图论 · 最大势搜索 MCS · 完美消除序列 PEO · 充要条件成团检验 · 时间复杂度严格 O(V + E)',
      descriptionHtml: `
        弦图（Chordal Graph）指任意长度大于等于 4 的简单环均至少包含一条弦（连接环上不相邻两点的边）的无向图。<br/>
        <b>三大核心理论与数学判定定理：</b><br/>
        ① <b>完美消除序列（PEO）充要定理：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;无向图 $G$ 是弦图，当且仅当 $G$ 存在完美消除序列 $v_1, v_2, \\dots, v_n$。在该序列中，对任意顶点 $v_i$，其所有排位在其后的邻居构成的导出子图是一个完全子图（团 Clique）；<br/>
        ② <b>最大势搜索（MCS）算法逆序构造：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;维护每个未入序顶点的“势” $label[u]$（即已被选入 PEO 的邻居数目）；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;从位次 $i = n$ 递减到 $1$，每轮选取当前未访问节点中 $label$ 最大的顶点作为 $peo[i]$，并将其所有未入序邻居的 $label$ 自增 1；<br/>
        ③ <b>线性充要性验证定理（规约降维）：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;检验 $PEO$ 时无需暴力两两核验团。对于每个 $u = peo[i]$，记其所有后继邻居中位次最靠前者为 $firstNext$；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;<b>充要条件：</b>只需检验除 $firstNext$ 外的所有后继邻居 $v$ 是否均与 $firstNext$ 存在连边 $(firstNext, v) \\in E$ 即可。若全部满足则该图为弦图，整体复杂度严格为 $O(V + E)$。
      `,
      initialStateText: '输入无向图邻接表与边集，初始化势权重数组 label[1..n] = 0、访问标记 vis 与序列数组 peo。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '顶点与边集规模',
        valuesStr: '节点 1..n，初始势权重 label[1..n] = 0，访问标记 vis[1..n] = false',
      },
      {
        prefix: '├───',
        label: '完美消除序列槽位',
        valuesStr: 'peo[1..n] = [_, ..., _]，逆序从第 n 位向前填充',
      },
      {
        prefix: '└───',
        label: '排名逆映射数组',
        valuesStr: 'rankOrder[u] 表示顶点 u 在 PEO 序列中的索引位次 1..n',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】MCS 最大势逆序选点 (MCS Maximum Cardinality Search)',
        subtitle: '从 i=n 递减到 1，每轮从未入序节点中选取当前势最大者作为 peo[i]',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '最大势节点扫描锁定',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">势最大者</span>',
            detailLines: [
              '│  ① 遍历所有 vis[u]=false 的节点：查找 label[u] 最大值',
              '│  ② 选定最大势顶点 c 作为 PEO 序列第 i 项：peo[i] = c',
            ],
            fillLine: '└── 当前最高势节点成功入选 PEO 🎯',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '邻居势权值增量扩散',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">势自增</span>',
            detailLines: [
              '│  ① 标记已访问：vis[c] = true，并记录排名 rankOrder[c] = i',
              '│  ② 遍历 c 的所有未入序邻居 v：label[v]++',
            ],
            fillLine: '└── 邻接节点势权值动态更新完毕 📈',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】候选序列 PEO 闭环与矩阵初始化 (PEO Assembly & Adjacency Matrix)',
        subtitle: '全部 n 个节点完成逆序排序，构建 O(1) 连边快速判断矩阵 hasEdge',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '完美消除候选序列就绪',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">序列就绪</span>',
            detailLines: [
              '│  ① 获得完整 PEO 序列：peo[1..n]',
              '│  ② 确立全局节点排名表 rankOrder[1..n]',
            ],
            fillLine: '└── 候选消除序列装配完成 📜',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '邻接矩阵布尔表构建',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">hasEdge 构建</span>',
            detailLines: [
              '│  ① 分配 hasEdge[n+1][n+1] 邻接关系矩阵',
              '│  ② 录入所有边 (u, v)，支持 O(1) 查询后继邻居间是否存在对角弦',
            ],
            fillLine: '└── 高速连边查询表就绪 📋',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】后继邻居团性质充要检验 (Clique Property Verification for Successors)',
        subtitle: '按 PEO 顺序检验每个节点 u：其首后继 firstNext 必须与其余所有后继邻居直接连边',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '首后继邻居定位',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-blue-100 text-blue-800 rounded font-bold">首后继</span>',
            detailLines: [
              '│  ① 收集 rankOrder[v] > rankOrder[u] 的所有后继邻居 higherNeighbors',
              '│  ② 提取 rankOrder 最小的首后继节点 firstNext',
            ],
            fillLine: '└── 首后继基准节点锁定 📍',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '后继邻居成团闭合检验',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">成团闭合</span>',
            detailLines: [
              '│  ① 对除 firstNext 外的每个后继邻居 v：检验 hasEdge[firstNext][v]',
              '│  ② 若存在某邻居与 firstNext 无边：诱导无弦环，立即判定非弦图！',
            ],
            fillLine: '└── 充要成团闭合条件校验 🔬',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段四】弦图判定结论与无弦环排查 (Chordal Decision & Conclusion)',
        subtitle: '全节点后继团验证通过则为弦图；出现断边则输出非弦图并定位无弦环',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '最终判定结论输出',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-teal-100 text-teal-800 rounded font-bold">判定结论</span>',
            detailLines: [
              '│  ① 验证通过：该图为弦图 (Chordal Graph)，成功输出完美消除序列 PEO',
              '│  ② 验证失败：存在无弦四元环或高阶环，非弦图',
            ],
            fillLine: '└── 弦图充要条件检验流程圆满闭环 ✅',
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
