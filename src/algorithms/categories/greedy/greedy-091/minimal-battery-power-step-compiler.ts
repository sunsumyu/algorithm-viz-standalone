import { MINIMAL_BATTERY_POWER_LINES } from './greedy-091-stage-codes';
import { Greedy091Step } from './greedy-091-shared';

export interface TaskItem {
  actual: number;
  minimum: number;
  diff: number; // minimum - actual
  taskIdx: number;
}

export interface MinimalBatteryPowerStep extends Greedy091Step {
  line?: number;
  tasks: TaskItem[];
  curTaskIdx: number;
  ans: number;
  stepFormula?: string;
}

export function buildMinimalBatteryPowerSteps(rawTasks: [number, number][]): MinimalBatteryPowerStep[] {
  const steps: MinimalBatteryPowerStep[] = [];
  const lines = MINIMAL_BATTERY_POWER_LINES;
  const n = rawTasks.length;

  const tasks: TaskItem[] = rawTasks.map(([actual, minimum], idx) => ({
    actual,
    minimum,
    diff: minimum - actual,
    taskIdx: idx,
  }));

  // Step 0: 入口
  steps.push({
    line: (lines.entry as any).java ?? 1,
    tasks: tasks.map(t => ({ ...t })),
    curTaskIdx: -1,
    ans: 0,
    decision: `主函数入口：接收 ${n} 个任务参数，准备进行贪心策略排序`,
    message: '每个任务 [消耗 actual, 门槛 minimum]，冗余能量 diff = minimum - actual',
    log: `enter minimumEffort(n=${n})`,
    codeLine: lines.entry,
  });

  // Step 1: 排序 (diff 降序)
  const sortedTasks = [...tasks].sort((a, b) => b.diff - a.diff);
  steps.push({
    line: (lines.sortTasks as any).java ?? 2,
    tasks: sortedTasks.map(t => ({ ...t })),
    curTaskIdx: -1,
    ans: 0,
    decision: '贪心排序：按冗余差值 (minimum - actual) 从大到小降序排列',
    message: '冗余越大的任务越先执行，其释放的剩余能量更容易满足后续任务的启动门槛',
    log: 'sorted tasks by diff descending',
    codeLine: lines.sortTasks,
  });

  // Step 2: 逐个贪心计算初始能量
  let ans = 0;
  for (let i = 0; i < n; i++) {
    const task = sortedTasks[i];
    const prevAns = ans;
    ans = Math.max(ans + task.actual, task.minimum);
    const formula = `ans = max(${prevAns} + ${task.actual}, ${task.minimum}) = max(${prevAns + task.actual}, ${task.minimum}) = ${ans}`;

    steps.push({
      line: (lines.process as any).java ?? 5,
      tasks: sortedTasks.map(t => ({ ...t })),
      curTaskIdx: i,
      ans,
      stepFormula: formula,
      decision: `执行任务 #${task.taskIdx} [消耗 ${task.actual}, 门槛 ${task.minimum}, 冗余 ${task.diff}] ➔ ${formula}`,
      message: `当前所需的保底初始能量提升至 ${ans}`,
      log: `task #${task.taskIdx} -> ans=${ans}`,
      codeLine: lines.process,
    });
  }

  // Step 3: 收敛
  steps.push({
    line: (lines.done as any).java ?? 7,
    tasks: sortedTasks.map(t => ({ ...t })),
    curTaskIdx: -1,
    ans,
    decision: `🎉 计算完毕！完成所有任务所需的最少初始能量为 ${ans}`,
    message: '贪心排序与模拟收敛至全局最优解',
    log: `done ans=${ans}`,
    codeLine: lines.done,
  });

  return steps;
}
