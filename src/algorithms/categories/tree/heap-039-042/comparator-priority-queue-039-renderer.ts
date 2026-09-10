/**
 * Class 039: 比较器与优先级队列 (Comparator & Priority Queue)
 * 自定义多字段复合排序规则与优先队列调度
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { HEAP_039_042_PROBLEMS } from './heap-039-042-problem-content';
import { COMPARATOR_PRIORITY_QUEUE_039_CODES, COMPARATOR_PRIORITY_QUEUE_039_LINES } from './heap-039-042-stage-codes';
import { Heap039Step, renderComparatorBoard } from './heap-039-042-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface Comparator039Step extends Heap039Step {
  tasks: { id: number; priority: number; desc: string }[];
  activeTask: number | null;
  ruleDesc: string;
}

export function buildComparator039Steps(): Comparator039Step[] {
  const steps: Comparator039Step[] = [];
  const lines = COMPARATOR_PRIORITY_QUEUE_039_LINES;

  const initialTasks = [
    { id: 101, priority: 3, desc: '普通任务' },
    { id: 102, priority: 5, desc: '紧急任务' },
    { id: 103, priority: 5, desc: '紧急任务 (先到达)' },
  ];

  // Step 0: 入口帧
  steps.push({
    tasks: initialTasks,
    activeTask: null,
    ruleDesc: '待排序任务集合已输入，准备运行自定义比较器',
    decision: `主函数入口：开始定义并演示自定义比较器 (Comparator) 的排序逻辑`,
    message: `目标规则：优先级 priority 高的排在前面；若优先级相同，则 ID 较小的排在前面`,
    log: `enter taskComparator: 3 tasks loaded`,
    codeLine: lines.entry,
    metrics: { '任务数': 3, '排序维度': 2 },
  });

  // Step 1: 比较 Task 101 与 Task 102
  steps.push({
    tasks: initialTasks,
    activeTask: 102,
    ruleDesc: '比对 Task 101(p=3) 与 Task 102(p=5)：102 优先级更高，返回正数，102 应当排在 101 前面',
    decision: `compare(101, 102)：priority 不同，执行 o2.priority - o1.priority = 5 - 3 = 2 > 0`,
    message: `根据左神第一准则，Task 102 成功胜出并置于前位`,
    log: `comparison 101 vs 102: 102 priority is higher`,
    codeLine: lines.checkPriority,
    statusBadge: { text: '优先级主次确定', type: 'info' },
    metrics: { '胜出者': 'Task 102', '比较差值': 2 },
  });

  // Step 2: 比较 Task 102 与 Task 103 (平局破除)
  steps.push({
    tasks: [
      { id: 102, priority: 5, desc: '紧急任务' },
      { id: 103, priority: 5, desc: '紧急任务 (先到达)' },
      { id: 101, priority: 3, desc: '普通任务' },
    ],
    activeTask: 102,
    ruleDesc: '比对 Task 102(p=5) 与 Task 103(p=5)：优先级相同，比对 ID：102 < 103，返回负数，102 居前',
    decision: `compare(102, 103)：priority 相同，触发第二维比对 o1.id - o2.id = 102 - 103 = -1 < 0`,
    message: `返回负数代表第一个参数 102 排在前面，顺序确定`,
    log: `comparison 102 vs 103: tie on priority, broken by id`,
    codeLine: lines.checkId,
    statusBadge: { text: 'ID 次级判定', type: 'warning' },
    metrics: { '排序首位': 'Task 102', '排序次位': 'Task 103' },
  });

  // Step 3: 最终有序队列形成
  steps.push({
    tasks: [
      { id: 102, priority: 5, desc: '紧急任务' },
      { id: 103, priority: 5, desc: '紧急任务 (先到达)' },
      { id: 101, priority: 3, desc: '普通任务' },
    ],
    activeTask: 102,
    ruleDesc: '全队列严格有序：[Task 102 (p=5), Task 103 (p=5), Task 101 (p=3)]',
    decision: `比较器调度完毕：优先级队列以此顺序组织底层二叉堆，队头出队始终为最高优先级任务`,
    message: `熟练掌握比较器，可轻松定制任意高维复合偏序！`,
    log: `queue finalized: [102, 103, 101]`,
    codeLine: lines.compareMethod,
    statusBadge: { text: '有序队列就绪', type: 'success' },
    metrics: { '队头元素': 'Task 102', '全队列状态': '合法' },
  });

  return steps;
}

export const comparatorPriorityQueue039Visualizer = registerDeclarativeAlgorithm<Comparator039Step>({
  id: 'comparator-priority-queue-039',
  name: '比较器与优先级队列 (Class 039)',
  category: 'tree',
  difficulty: 'easy',
  problemContent: HEAP_039_042_PROBLEMS.comparatorPriorityQueue039,
  sourceCodes: COMPARATOR_PRIORITY_QUEUE_039_CODES,
  generateSteps: buildComparator039Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderComparatorBoard(
          step.tasks,
          step.activeTask,
          step.ruleDesc
        )}
        ${renderFormulaCard(
          '左神比较器黄金三大准则',
          '\\text{compare}(o_1, o_2) \\begin{cases} < 0 & \\implies o_1 \\text{ 排在 } o_2 \\text{ 前面} \\\\ > 0 & \\implies o_2 \\text{ 排在 } o_1 \\text{ 前面} \\\\ = 0 & \\implies \\text{两者等价} \\end{cases}',
          '任何比较器在设计时，只要严格按照“谁想排在前面，谁就作为负数返回”的思考心法，多字段级联比较永不混乱。'
        )}
      </div>
    `;
  },
});
