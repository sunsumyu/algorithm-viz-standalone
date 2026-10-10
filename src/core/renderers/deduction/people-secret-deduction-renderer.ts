/**
 * 找出知晓秘密的所有专家 (Find All People With Secret · LeetCode 2092) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 进阶图论与并查集: 会议按时刻排序分批、同批会议瞬时级联合并、未连通 0 号即时撤销重置
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class PeopleSecretDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'people-secret';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'people-secret' ||
      modelId === 'find-all-people-with-secret' ||
      modelId === 'find-all-people-with-secret-2092' ||
      modelId === 'people-secret-2092' ||
      modelId === '2092' ||
      modelId === 'class057-code03'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '找出知晓秘密的所有专家 (Find All People With Secret · LeetCode 2092) · 全景推演树',
      badge: 'LeetCode 2092 / 左程云 class057 · 会议按时刻排序分批 · 并查集瞬时级联合并 · 未连通 0 号即时撤销重置 · 因果时序律',
      descriptionHtml: `
        系统中包含 $N$ 名专家，0 号专家在时刻 0 初始知晓秘密并告知 $\\text{firstPerson}$。<br/>
        给定三元组会议列表 $(x, y, \\text{time})$：专家 $x$ 与 $y$ 在时刻 $\\text{time}$ 开会，秘密可在开会者之间瞬时扩散。<br/>
        <b>时序因果律与并查集时间切片分批核心机制：</b><br/>
        ① <b>时间不可倒流原则：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;秘密只能从过去流向未来，绝对无法向过去倒流；因此所有会议必须按时刻 $\\text{time}$ 从小到大排序；<br/>
        ② <b>同一时刻瞬时多跳级联：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;在同一时刻 $\\text{time}$ 发生的若干场会议可产生链式多跳传递（例如 A 与 B 开会、B 与 C 开会，A 的秘密可在同一时刻直接经 B 传至 C）；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;因此同一时间步的所有会议需在并查集中集中执行 $\\text{union}(u, v)$；<br/>
        ③ <b>连通有效性检验与即时因果撤销（Rollback）：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;开完同一时刻的全部会议后，必须遍历核验本轮涉及的所有专家：<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;• 若 $\\text{find}(u) == \\text{find}(0)$：说明 $u$ 成功与 0 号源头处于同一连通块，秘密成功传导，保留连通；<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;• 若 $\\text{find}(u) \\ne \\text{find}(0)$：说明这些专家虽然在此时刻彼此开会接触，但连通块内<b>没有任何人</b>知晓秘密！该接触对秘密传播完全无效，必须立即执行 $\\text{father}[u] = u$ 撤销断开，防止对未来的会议造成虚假连通干扰！
      `,
      initialStateText: '载入专家规模 N = 6，0 号与 1 号初始共享秘密，分配 father 数组，准备排序会议。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '专家规模与会议列表',
        valuesStr: 'N = 6 (E0..E5), firstPerson = 1, 会议: (4,5,t=2), (1,2,t=5), (2,3,t=5), (4,5,t=5)',
      },
      {
        prefix: '├───',
        label: '初始已知秘密集合',
        valuesStr: '0 号初始掌握，union(0, 1) ➔ 已知密专家: {E0, E1}',
      },
      {
        prefix: '└───',
        label: '并查集初始状态',
        valuesStr: 'father[0] = 1, father[1] = 1, father[i] = i (i >= 2)',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】会议时刻排序与时间窗口划分 (Time Slicing)',
        subtitle: '会议按时间戳升序排序，严格维护事件时序因果链',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '按时刻升序排序',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">时间排序</span>',
            detailLines: [
              '│  ① 会议 #0: E4 与 E5 (时刻 t = 2)',
              '│  ② 会议 #1..#3: E1-E2, E2-E3, E4-E5 (时刻 t = 5)',
            ],
            fillLine: '└── 时间线明确：先处理 t=2，再处理 t=5 ⏱️',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '时间分批切片确立',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">双指针窗口</span>',
            detailLines: [
              '│  ① 批次 1: t = 2，涉及专家 {E4, E5}',
              '│  ② 批次 2: t = 5，涉及专家 {E1, E2, E3, E4, E5}',
            ],
            fillLine: '└── 窗口划分就绪，避免未来信息向过去泄露 🛡️',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】时刻 t = 2 处理：无效会议接触与因果撤销 (Rollback)',
        subtitle: 'E4 与 E5 在此时刻开会，但两人均未知密，触发并查集重置回滚',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '临时合并 union(4, 5)',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">临时合并</span>',
            detailLines: [
              '│  ① 执行 union(4, 5)：E4 与 E5 产生临时连通',
              '│  ② 集合代表元: find(4) = find(5) = 5',
            ],
            fillLine: '└── E4 与 E5 建立临时接触 🤝',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '密源连通检验与因果撤销',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded font-bold">即时回滚</span>',
            detailLines: [
              '│  ① 核验 find(4)==find(0) ➔ 5 != 1 (false，未连通 0 号！)',
              '│  ② 无效接触回滚：重置 father[4] = 4, father[5] = 5',
            ],
            fillLine: '└── 撤销完成，防止虚假连通延续至未来时刻 ⏪',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】时刻 t = 5 处理：同批瞬时级联与秘密扩散 (Cascade Spread)',
        subtitle: 'E1 将秘密传给 E2，E2 同步瞬时传给 E3，E4-E5 再次接触但依然孤立',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '同批多场会议集中 union',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">瞬时级联</span>',
            detailLines: [
              '│  ① union(1, 2)：E1 知密，E2 连通入知密集合 {0, 1, 2}',
              '│  ② union(2, 3)：同一时刻瞬时传导，E3 连通入知密集合 {0, 1, 2, 3}',
              '│  ③ union(4, 5)：E4 与 E5 再次开会互通',
            ],
            fillLine: '└── 秘密沿连通链瞬时多跳传导 ⚡',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '各连通块核验与分流',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-indigo-100 text-indigo-800 rounded font-bold">保留与撤销</span>',
            detailLines: [
              '│  ① E1, E2, E3 与 0 连通，确认知密状态锁定！',
              '│  ② E4, E5 仍未与 0 连通，再次撤销重置 father[4]=4, father[5]=5',
            ],
            fillLine: '└── 时刻 t=5 扩散结算完毕 💎',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段四】终态结算与全员知密清单输出 (Final Answer)',
        subtitle: '遍历全员 0..N-1 筛选出与 0 号代表元相等的最终专家集合',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '全员 find(i) == find(0) 检验',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">最终知密</span>',
            detailLines: [
              '│  知密专家: E0, E1, E2, E3 (共 4 人)',
              '│  未知密专家: E4, E5 (接触但无源头流注)',
            ],
            fillLine: '└── ans = [0, 1, 2, 3] 🎉',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '时空复杂度与定理保证',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">O(M log M)</span>',
            detailLines: [
              '│  ① 瓶颈仅在会议时间排序 O(M log M)',
              '│  ② 撤销操作仅涉及当批开会节点，总并查集操作 O((N + M) α(N))',
            ],
            fillLine: '└── LeetCode 2092 优雅解决 🏆',
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
