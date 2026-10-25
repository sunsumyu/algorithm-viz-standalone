/**
 * Class 055: Code03 你可以安排的最多任务数目 (Maximum Number of Tasks You Can Assign)
 * 二分答案 + 贪心排序匹配 + 双端队列调度 (头取最易 / 尾取最难) / LeetCode 2071
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { QUEUE_055_PROBLEMS } from './queue-055-problem-content';
import { CODE03_TASKS_ASSIGN_CODES } from './queue-055-stage-codes';
import { Step055, renderMaxTasksAssignBoard } from './queue-055-shared';
import { buildMaxTasksAssignSteps } from './max-tasks-assign-055-step-compiler';

export { buildMaxTasksAssignSteps };

export const maxTasksAssign055Renderer = registerDeclarativeAlgorithm<Step055>({
  id: 'max-tasks-assign-055',
  aliases: [
    'class055-code03',
    'max-tasks-assign',
    'max-task-assign',
    'leetcode-2071',
    '2071',
  ],
  name: '安排最多任务数目 (Class 055)',
  category: 'monotonic-queue',
  difficulty: 'hard',
  hasDeductionTree: true,
  badge: { mode: '二分+双端队列', complexity: 'O(N log N)' },
  description: '二分答案 + 贪心排序匹配 + 双端队列调度：不吃药取队头轻松过关，服药攻坚队尾最难任务 (LeetCode 2071)',
  learningGoal: '深入领会二分答案思想与双端队列在复杂贪心约束下的绝妙协同，掌握头出最易、尾出最难的双向调度哲理。',
  icon: '🛠️',

  inputs: [
    {
      id: 'tasks',
      label: '任务力量要求 (逗号隔开)',
      type: 'text',
      defaultValue: '3, 2, 1',
      placeholder: '例如: 3, 2, 1',
    },
    {
      id: 'workers',
      label: '工人自身力量 (逗号隔开)',
      type: 'text',
      defaultValue: '0, 3, 3',
      placeholder: '例如: 0, 3, 3',
    },
    {
      id: 'pills',
      label: '药丸总数',
      type: 'number',
      defaultValue: 1,
      min: 0,
      max: 20,
    },
    {
      id: 'strength',
      label: '单粒药丸力量增幅',
      type: 'number',
      defaultValue: 1,
      min: 1,
      max: 100,
    },
  ],

  presets: [
    {
      label: 'LeetCode 样例 1: tasks=[3,2,1], workers=[0,3,3], pills=1, s=1 (答案: 3)',
      values: { tasks: '3, 2, 1', workers: '0, 3, 3', pills: 1, strength: 1 },
    },
    {
      label: 'LeetCode 样例 2: tasks=[5,4], workers=[0,0,0], pills=1, s=5 (答案: 1)',
      values: { tasks: '5, 4', workers: '0, 0, 0', pills: 1, strength: 5 },
    },
    {
      label: '无需药丸全解: tasks=[2,3,4], workers=[2,3,5], pills=0, s=2 (答案: 3)',
      values: { tasks: '2, 3, 4', workers: '2, 3, 5', pills: 0, strength: 2 },
    },
  ],

  problemContent: QUEUE_055_PROBLEMS.maxTasksAssign055,
  codeLanguages: CODE03_TASKS_ASSIGN_CODES,

  generateSteps: (params?: Record<string, any>) => {
    let tasks = [3, 2, 1];
    let workers = [0, 3, 3];
    let pills = 1;
    let strength = 1;

    if (params && params.tasks) {
      const parsed = String(params.tasks)
        .split(/[,，\s]+/)
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n));
      if (parsed.length > 0) tasks = parsed;
    }

    if (params && params.workers) {
      const parsed = String(params.workers)
        .split(/[,，\s]+/)
        .map(s => parseInt(s.trim(), 10))
        .filter(n => !isNaN(n));
      if (parsed.length > 0) workers = parsed;
    }

    if (params && params.pills !== undefined) {
      const parsedPills = parseInt(params.pills, 10);
      if (!isNaN(parsedPills) && parsedPills >= 0) pills = parsedPills;
    }

    if (params && params.strength !== undefined) {
      const parsedS = parseInt(params.strength, 10);
      if (!isNaN(parsedS) && parsedS > 0) strength = parsedS;
    }

    return buildMaxTasksAssignSteps(tasks, workers, pills, strength);
  },

  renderCanvas: (container, step) => {
    container.innerHTML = renderMaxTasksAssignBoard(step);
  },
});
