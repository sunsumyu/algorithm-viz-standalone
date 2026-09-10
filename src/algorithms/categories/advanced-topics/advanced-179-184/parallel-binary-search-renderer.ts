/**
 * Class 184: 整体二分 (Parallel Binary Search)
 * 批量询问分流 + 值域二分 + 树状数组区间修改 / POJ 2104 / 洛谷 P3527 [POI2011] MET-Meteors
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_179_184_PROBLEMS } from './advanced-179-184-problem-content';
import { PARALLEL_BINARY_SEARCH_CODES, PARALLEL_BINARY_SEARCH_LINES } from './advanced-179-184-stage-codes';
import { Advanced179Step, ParallelQueryView, renderParallelBSBoard } from './advanced-179-184-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface ParallelBSStep extends Advanced179Step {
  l: number;
  r: number;
  mid: number;
  queries: ParallelQueryView[];
  stage: string;
}

export function buildParallelBSSteps(): ParallelBSStep[] {
  const steps: ParallelBSStep[] = [];
  const lines = PARALLEL_BINARY_SEARCH_LINES;

  const queries: ParallelQueryView[] = [
    { id: 1, target: 10, currSum: 0, status: 'pending' },
    { id: 2, target: 25, currSum: 0, status: 'pending' },
  ];

  // Step 0: 入口帧
  steps.push({
    l: 1,
    r: 3,
    mid: 2,
    queries: queries.map(q => ({ ...q })),
    stage: '整体二分开始：初始化询问队列',
    decision: `主函数入口：开始对 2 个询问在操作值域 [1, 3] 内进行整体二分`,
    message: `单次二分需要 O(Q log M) 甚至独立跑数据结构；整体二分将所有询问捆绑在同一值域树上分流，单轮遍历批处理`,
    log: `enter parallel binary search: l=1, r=3, queries=2`,
    codeLine: lines.entry,
    metrics: { '询问总数': 2, '值域下界': 1, '值域上界': 3 },
  });

  // Step 1: 在 mid = 2 处施加操作 1 与 2
  steps.push({
    l: 1,
    r: 3,
    mid: 2,
    queries: queries.map(q => ({ ...q })),
    stage: '批量施加 [l, mid] 区间修改操作',
    decision: `二分中点 mid=2：批量执行操作 1 与操作 2，在树状数组上施加陨石雨降落修改`,
    message: `此时前 2 场流星雨在国家 1 的轨道累积贡献 15，在国家 2 的轨道累积贡献 15`,
    log: `applyOperation: ops [1, 2] applied to BIT`,
    codeLine: lines.applyOps,
    statusBadge: { text: '前 2 场操作生效', type: 'info' },
    metrics: { '当前中点 mid': 2, '施加操作数': 2 },
  });

  // Step 2: 批量检查询问并分流
  const queriesAfterCheck: ParallelQueryView[] = [
    { id: 1, target: 10, currSum: 15, status: 'left' },
    { id: 2, target: 25, currSum: 15, status: 'right' },
  ];
  steps.push({
    l: 1,
    r: 3,
    mid: 2,
    queries: queriesAfterCheck,
    stage: '批量判定各询问是否满足阈值并分流',
    decision: `判定分流：询问 1 累积 15 >= 目标 10，归入左半区 leftList；询问 2 累积 15 < 目标 25，扣除 15 后归入右半区 rightList`,
    message: `询问 1 证明在 mid=2 甚至更早前就已达标；询问 2 则必须依赖后续操作`,
    log: `splitQueries: q1 -> left, q2 -> right`,
    codeLine: lines.splitQueries,
    statusBadge: { text: 'Q1进左区，Q2进右区', type: 'warning' },
    metrics: { '左区询问数': 1, '右区询问数': 1 },
  });

  // Step 3: 撤销树状数组操作，恢复现场
  steps.push({
    l: 1,
    r: 3,
    mid: 2,
    queries: queriesAfterCheck,
    stage: '撤销 [l, mid] 的树状数组修改',
    decision: `调用 applyOperation(i, -1) 将操作 1 与 2 撤销，将数据结构无损复原`,
    message: `整体二分严格保证数据结构零脏数据传递给递归分支`,
    log: `rollbackAndRecurse: ops cleared`,
    codeLine: lines.rollbackAndRecurse,
    statusBadge: { text: '修改已完全撤销', type: 'info' },
    metrics: { '现场恢复': '干净', '分治递归': '准备分流' },
  });

  // Step 4: 分流递归到达叶子判定
  const queriesFinal: ParallelQueryView[] = [
    { id: 1, target: 10, currSum: 10, status: 'done' },
    { id: 2, target: 25, currSum: 25, status: 'done' },
  ];
  steps.push({
    l: 1,
    r: 3,
    mid: 2,
    queries: queriesFinal,
    stage: '递归叶子区间确认最终答案',
    decision: `递归执行 solve(1, 2, [q1]) 与 solve(3, 3, [q2])：最终确定 q1 在第 2 场流星雨达标，q2 在第 3 场流星雨达标`,
    message: `全部询问的答案被精准锁定：ans[1] = 2, ans[2] = 3`,
    log: `leaves resolved: ans[1]=2, ans[2]=3`,
    codeLine: lines.answerHit,
    statusBadge: { text: '答案全锁定: ans=[2, 3]', type: 'success' },
    metrics: { 'Q1 达成时刻': 2, 'Q2 达成时刻': 3 },
  });

  // Step 5: 返回终态
  steps.push({
    l: 1,
    r: 3,
    mid: 2,
    queries: queriesFinal,
    stage: '整体二分求解完成',
    decision: `🎉 整体二分完成：全部询问均以 O((N + Q) log V log N) 时间复杂度求出最优判定时间`,
    message: `整体二分用分治代替了 Q 次独立二分，将离线动态判定问题统一并流处理，是国家集训队级核心分治利器`,
    log: `parallel binary search finished: ans=[2, 3]`,
    codeLine: lines.answerHit,
    statusBadge: { text: '整体二分完成', type: 'success' },
    metrics: { '最终结果': 'ans=[2, 3]', '复杂度': 'O((N+Q) log V)', '状态': '求解完成' },
  });

  return steps;
}

export const parallelBinarySearchVisualizer = registerDeclarativeAlgorithm<ParallelBSStep>({
  id: 'parallel-binary-search-184',
  name: '整体二分 (Parallel Binary Search / Class 184)',
  category: 'search',
  icon: '⚖️',
  difficulty: 3,
  levelOrder: 184,
  description: '左程云算法通关课 Class 184：整体二分 (Parallel Binary Search)。多询问值域二分分流，区间批量修改+树状数组撤销，O((N+Q) log V) 解决离线批量阈值查询。',
  learningGoal: '掌握批量询问值域分流、操作批量生效与精准撤销、单次分治解决整体询问的精髓',
  problemHtml: ADVANCED_179_184_PROBLEMS.parallelBinarySearch.html,
  analysisHtml: ADVANCED_179_184_PROBLEMS.parallelBinarySearch.html,
  inputs: [
    {
      id: 'preset',
      label: '流星雨与国家需求',
      type: 'select',
      defaultValue: 'queries_2',
      options: [
        { label: '2 国家陨石雨阈值判定', value: 'queries_2' },
      ],
    },
  ],
  codeLanguages: PARALLEL_BINARY_SEARCH_CODES,
  generateSteps: () => buildParallelBSSteps(),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderParallelBSBoard(
          step.l,
          step.r,
          step.mid,
          step.queries,
          step.stage
        )}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
            <div style="font-size: 17px; font-weight: 700; color: #b91c1c;">${step.stage}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">整体分流机制</div>
            <div style="font-size: 15px; font-weight: 700; color: #059669;">单次中点判断批量拆分 Q_left 与 Q_right</div>
          </div>
        </div>

        ${renderFormulaCard(
          '整体二分核心机制',
          '二分值域 [l, r] => 批量执行 [l, mid] => 询问集合划分为 Q_left 与 Q_right',
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
