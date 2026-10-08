/**
 * 任务调度器 (Task Scheduler · LeetCode 621) - 声明式教学级沙盘渲染器 (Thin Domain Adapter)
 */

import { registerAlgorithm } from '../../../core/registry';
import { UniversalStageVisualizer } from '../dynamic-programming/unique-paths-renderer';
import {
  TaskSchedulerStep,
  TASK_SCHEDULER_CODES,
  buildTaskSchedulerSteps,
} from '../../../core/renderers/adapters/task-scheduler-step-compiler';
import {
  renderTaskSchedulerCanvas,
} from '../../../core/renderers/adapters/task-scheduler-canvas-adapter';

export type { TaskSchedulerStep };
export {
  TASK_SCHEDULER_CODES,
  buildTaskSchedulerSteps,
  renderTaskSchedulerCanvas,
};

registerAlgorithm({
  id: 'task-scheduler',
  name: '任务调度器',
  viewId: 'task-scheduler',
  category: 'greedy',
  icon: '⏱️',
  difficulty: 2,
  levelOrder: 99,
  learningGoal: '掌握贪心策略与桶思想在 CPU 任务调度冷却间隔中的应用，理解最短调度耗时数学边界与四阶段演进',
  description: 'LeetCode 621：桶思想贪心调度 CPU 冷却间隔，耗时 = max(任务总数, (maxFreq-1)*(n+1)+maxCount)',
  template: `<div id="task-scheduler" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`,
  Visualizer: UniversalStageVisualizer,
});

export function registerTaskScheduler(): void {
  // 保持向前兼容导出
}
