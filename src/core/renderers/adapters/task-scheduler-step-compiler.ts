import { StepBase } from '../../step-visualizer';

export interface TaskSchedulerStep extends StepBase {
  taskCounts: Record<string, number>;
  maxFreq: number;
  maxFreqTasks: string[];
  slots: string[];
  currentSlotIndex: number;
  idleCount: number;
  totalTime: number;
  decision: string;
  metrics?: Record<string, string>;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  line?: number;
}

export const TASK_SCHEDULER_CODES = {
  java: `public class Solution {
    public int leastInterval(char[] tasks, int n) {
        int[] counts = new int[26];
        for (char c : tasks) counts[c - 'A']++;
        int maxFreq = 0;
        for (int c : counts) maxFreq = Math.max(maxFreq, c);
        int maxCount = 0;
        for (int c : counts) if (c == maxFreq) maxCount++;
        int ans = (maxFreq - 1) * (n + 1) + maxCount;
        return Math.max(tasks.length, ans);
    }
}`,
  cpp: `class Solution {
public:
    int leastInterval(vector<char>& tasks, int n) {
        vector<int> counts(26, 0);
        for (char c : tasks) counts[c - 'A']++;
        int maxFreq = 0;
        for (int c : counts) maxFreq = max(maxFreq, c);
        int maxCount = 0;
        for (int c : counts) if (c == maxFreq) maxCount++;
        int ans = (maxFreq - 1) * (n + 1) + maxCount;
        return max((int)tasks.size(), ans);
    }
};`,
  python: `class Solution:
    def leastInterval(self, tasks: List[str], n: int) -> int:
        counts = collections.Counter(tasks)
        max_freq = max(counts.values())
        max_count = sum(1 for c in counts.values() if c == max_freq)
        ans = (max_freq - 1) * (n + 1) + max_count
        return max(len(tasks), ans)`,
  javascript: `function leastInterval(tasks, n) {
    const counts = {};
    for (const t of tasks) counts[t] = (counts[t] || 0) + 1;
    const maxFreq = Math.max(...Object.values(counts));
    let maxCount = 0;
    for (const c of Object.values(counts)) if (c === maxFreq) maxCount++;
    const ans = (maxFreq - 1) * (n + 1) + maxCount;
    return Math.max(tasks.length, ans);
}`
};

export const TASK_SCHEDULER_CODE_LINES = {
  entry: { java: 2, cpp: 4, python: 2, javascript: 1 },
  count: { java: 4, cpp: 6, python: 3, javascript: 3 },
  maxFreq: { java: 6, cpp: 8, python: 4, javascript: 4 },
  maxCount: { java: 8, cpp: 10, python: 5, javascript: 6 },
  calcAns: { java: 9, cpp: 11, python: 6, javascript: 7 },
  returnAns: { java: 10, cpp: 12, python: 7, javascript: 8 }
};

export function buildTaskSchedulerSteps(taskStr: string, n: number): TaskSchedulerStep[] {
  const tasks = taskStr.toUpperCase().replace(/[^A-Z]/g, '').split('');
  const steps: TaskSchedulerStep[] = [];
  const lines = TASK_SCHEDULER_CODE_LINES;

  // Step 0: 入口
  steps.push({
    taskCounts: {},
    maxFreq: 0,
    maxFreqTasks: [],
    slots: [],
    currentSlotIndex: -1,
    idleCount: 0,
    totalTime: 0,
    decision: `主函数入口：任务队列 [${tasks.join(', ')}]，冷却间隔 n = ${n}`,
    message: `准备按桶思想与贪心策略调度任务，每两个同类任务之间至少间隔 ${n} 个时间片`,
    log: `enter leastInterval(tasks=${tasks.join('')}, n=${n})`,
    codeLine: lines.entry,
    line: lines.entry.java,
    metrics: { '任务总数': `${tasks.length}`, '冷却间隔 n': `${n}`, '当前状态': '准备统计' }
  });

  // Step 1: 词频统计
  const counts: Record<string, number> = {};
  for (const t of tasks) {
    counts[t] = (counts[t] || 0) + 1;
  }
  const countDesc = Object.entries(counts).map(([k, v]) => `${k}:${v}`).join(', ');

  steps.push({
    taskCounts: { ...counts },
    maxFreq: 0,
    maxFreqTasks: [],
    slots: [],
    currentSlotIndex: -1,
    idleCount: 0,
    totalTime: 0,
    decision: `完成词频统计：${countDesc}`,
    message: `最高频任务是决定调度周期的瓶颈瓶身，需找出出现频次最高的任务`,
    log: `counted frequencies: ${countDesc}`,
    codeLine: lines.count,
    line: lines.count.java,
    metrics: { '词频统计': countDesc, '当前状态': '统计完成' }
  });

  // Step 2: 找到最高频次
  let maxFreq = 0;
  for (const c of Object.values(counts)) {
    if (c > maxFreq) maxFreq = c;
  }

  steps.push({
    taskCounts: { ...counts },
    maxFreq,
    maxFreqTasks: [],
    slots: [],
    currentSlotIndex: -1,
    idleCount: 0,
    totalTime: 0,
    decision: `确定最高频次 maxFreq = ${maxFreq}`,
    message: `最高频任务需要 ${maxFreq} 个执行轮次，前 ${maxFreq - 1} 轮每轮必须间隔至少 n = ${n} 个时间片`,
    log: `maxFreq determined = ${maxFreq}`,
    codeLine: lines.maxFreq,
    line: lines.maxFreq.java,
    metrics: { '最高频次 maxFreq': `${maxFreq}`, '当前状态': '确定桶深' }
  });

  // Step 3: 并列拥有最高频次任务数
  const maxFreqTasks: string[] = [];
  for (const [task, c] of Object.entries(counts)) {
    if (c === maxFreq) maxFreqTasks.push(task);
  }
  const maxCount = maxFreqTasks.length;

  steps.push({
    taskCounts: { ...counts },
    maxFreq,
    maxFreqTasks: [...maxFreqTasks],
    slots: [],
    currentSlotIndex: -1,
    idleCount: 0,
    totalTime: 0,
    decision: `拥有最高频次的任务有 ${maxCount} 个：[${maxFreqTasks.join(', ')}]`,
    message: `最后一轮只需要为这 ${maxCount} 个高频任务分配槽位`,
    log: `maxCount = ${maxCount}, tasks = ${maxFreqTasks.join(',')}`,
    codeLine: lines.maxCount,
    line: lines.maxCount.java,
    metrics: { '并列最高频任务数': `${maxCount}`, '最高频任务': maxFreqTasks.join(', ') }
  });

  // Step 4: 桶排布模拟与计算
  const formulaAns = (maxFreq - 1) * (n + 1) + maxCount;
  const totalSlots = Math.max(tasks.length, formulaAns);
  const slots: string[] = new Array(totalSlots).fill('IDLE');

  const sortedTasks = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  let slotPointer = 0;
  for (const [task, cnt] of sortedTasks) {
    let remaining = cnt;
    let curr = slotPointer;
    while (remaining > 0 && curr < totalSlots) {
      if (slots[curr] === 'IDLE') {
        slots[curr] = task;
        remaining--;
        curr += (n + 1);
        if (curr >= totalSlots && remaining > 0) {
          for (let k = 0; k < totalSlots; k++) {
            if (slots[k] === 'IDLE') {
              curr = k;
              break;
            }
          }
        }
      } else {
        curr++;
      }
    }
    while (slotPointer < totalSlots && slots[slotPointer] !== 'IDLE') {
      slotPointer++;
    }
  }

  const idleCount = slots.filter(s => s === 'IDLE').length;

  steps.push({
    taskCounts: { ...counts },
    maxFreq,
    maxFreqTasks: [...maxFreqTasks],
    slots: [...slots],
    currentSlotIndex: totalSlots - 1,
    idleCount,
    totalTime: totalSlots,
    decision: `公式计算：(maxFreq - 1) * (n + 1) + maxCount = (${maxFreq}-1)*(${n}+1) + ${maxCount} = ${formulaAns}，实际占用 ${totalSlots} 槽位`,
    message: `若任务种类极其丰富，空闲插槽将被其他任务完全填满，耗时即为任务总长度 ${tasks.length}`,
    log: `calc formulaAns=${formulaAns}, totalSlots=${totalSlots}, idles=${idleCount}`,
    codeLine: lines.calcAns,
    line: lines.calcAns.java,
    metrics: { '公式计算值': `${formulaAns}`, '任务总数': `${tasks.length}`, '空闲时间片': `${idleCount}` }
  });

  // Step 5: 收敛返回最终答案
  steps.push({
    taskCounts: { ...counts },
    maxFreq,
    maxFreqTasks: [...maxFreqTasks],
    slots: [...slots],
    currentSlotIndex: totalSlots - 1,
    idleCount,
    totalTime: totalSlots,
    decision: `🎉 计算完毕！完成所有任务的最短时间 = ${totalSlots} 个时间片`,
    message: `调度计划排布完成，包含 ${tasks.length} 个执行任务与 ${idleCount} 个空闲 CPU 周期`,
    log: `leastInterval finished, result=${totalSlots}`,
    codeLine: lines.returnAns,
    line: lines.returnAns.java,
    metrics: { '最终结果': `${totalSlots}`, '任务总数': `${tasks.length}`, '空闲槽数': `${idleCount}` }
  });

  return steps;
}
