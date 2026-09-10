/**
 * 完成所有任务的最少初始能量 (LeetCode 1665) - 声明式教学级沙盘渲染器
 * 核心贪心：按 (minimum - actual) 差值降序排序，依次贪心累加能量门槛
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_091_PROBLEMS } from './greedy-091-problem-content';
import {
  MINIMAL_BATTERY_POWER_CODES,
  MINIMAL_BATTERY_POWER_LINES,
} from './greedy-091-stage-codes';
import {
  Greedy091Step,
  renderDecisionBalance,
} from './greedy-091-shared';

export interface TaskItem {
  actual: number;
  minimum: number;
  diff: number; // minimum - actual
  taskIdx: number;
}

export interface MinimalBatteryPowerStep extends Greedy091Step {
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

export const minimalBatteryPowerVisualizer = registerDeclarativeAlgorithm<MinimalBatteryPowerStep>({
  id: 'minimum-initial-energy-to-finish-tasks',
  name: '最少初始能量 (Minimum Initial Energy)',
  category: 'greedy',
  icon: '🔋',
  difficulty: 3,
  levelOrder: 915,
  learningGoal: '掌握按 minimum - actual 差值贪心降序排序的能量消耗与逆推模拟原理',
  problemHtml: GREEDY_091_PROBLEMS.minimalBatteryPower.html,
  analysisHtml: GREEDY_091_PROBLEMS.minimalBatteryPower.html,
  inputs: [
    {
      id: 'input-tasks',
      label: '任务列表 (actual,minimum 分号隔开)',
      type: 'text',
      defaultValue: '1,2; 2,4; 4,8',
      placeholder: '1,2; 2,4; 4,8',
    },
  ],
  codeLanguages: MINIMAL_BATTERY_POWER_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const raw = String(inputs?.['input-tasks'] || '1,2; 2,4; 4,8');
    const tasks = raw.split(';').map(t => {
      const parts = t.trim().split(/[,，\s]+/).map(s => parseInt(s.trim(), 10));
      return [parts[0] || 0, parts[1] || 0] as [number, number];
    }).filter(([a, m]) => a > 0 || m > 0);
    return buildMinimalBatteryPowerSteps(tasks);
  },
  renderCanvas: (stageContainer: HTMLElement, step: MinimalBatteryPowerStep) => {
    stageContainer.innerHTML = '';

    const mainCard = document.createElement('div');
    mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 顶部状态栏
    mainCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-weight: 700; font-size: 13px; color: #1e293b;">任务总数: <b>${step.tasks.length}</b></span>
          <span style="font-size: 11px; padding: 2px 8px; border-radius: 4px; background: #eff6ff; color: #1d4ed8; font-weight: 600;">当前进度: ${step.curTaskIdx >= 0 ? step.curTaskIdx + 1 : (step.ans > 0 ? step.tasks.length : 0)} / ${step.tasks.length}</span>
        </div>
        <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
          <span style="color: #64748b;">最少初始能量:</span>
          <span style="color: #2563eb; font-weight: 800; font-size: 16px;">${step.ans}</span>
        </div>
      </div>
    `;

    // 中部任务卡片列表
    const tasksBox = document.createElement('div');
    tasksBox.style.cssText = 'flex: 1; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; padding: 10px; overflow-y: auto;';

    step.tasks.forEach((t, idx) => {
      const isCurrent = step.curTaskIdx === idx;
      const isFinished = step.curTaskIdx > idx || (step.curTaskIdx === -1 && step.ans > 0);

      let bg = '#f8fafc';
      let border = '#cbd5e1';
      if (isCurrent) {
        bg = '#eff6ff';
        border = '#3b82f6';
      } else if (isFinished) {
        bg = '#ecfdf5';
        border = '#10b981';
      }

      const card = document.createElement('div');
      card.style.cssText = `display: flex; flex-direction: column; gap: 6px; background: ${bg}; border: 1.5px solid ${border}; border-radius: 8px; padding: 10px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);`;

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px;">
          <span style="font-weight: 700; font-size: 12px; color: #1e293b;">任务 #${t.taskIdx} ${isCurrent ? '⚡ 执行中' : (isFinished ? '✓ 已完成' : '')}</span>
          <span style="font-size: 10px; font-weight: 700; color: #2563eb; background: #eff6ff; padding: 1px 6px; border-radius: 4px;">冗余差值: +${t.diff}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px;">
          <span style="color: #64748b;">消耗 actual:</span>
          <span style="font-weight: 700; color: #ef4444; font-family: 'JetBrains Mono', monospace;">${t.actual}</span>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 11px;">
          <span style="color: #64748b;">门槛 minimum:</span>
          <span style="font-weight: 700; color: #f59e0b; font-family: 'JetBrains Mono', monospace;">${t.minimum}</span>
        </div>
      `;
      tasksBox.appendChild(card);
    });
    mainCard.appendChild(tasksBox);

    // 底部算式展示
    if (step.stepFormula) {
      const formulaBox = document.createElement('div');
      formulaBox.style.cssText = 'padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; font-family: "JetBrains Mono", monospace; font-size: 12px; color: #1e293b; font-weight: 600; text-align: center;';
      formulaBox.textContent = `📐 递推算式: ${step.stepFormula}`;
      mainCard.appendChild(formulaBox);
    }

    stageContainer.appendChild(mainCard);
  },
});
