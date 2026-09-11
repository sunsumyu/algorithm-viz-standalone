import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';

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

const CODE_LINES = {
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
    codeLine: CODE_LINES.entry,
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
    codeLine: CODE_LINES.count,
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
    codeLine: CODE_LINES.maxFreq,
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
    codeLine: CODE_LINES.maxCount,
    metrics: { '并列最高频任务数': `${maxCount}`, '最高频任务': maxFreqTasks.join(', ') }
  });

  // Step 4: 桶排布模拟与计算
  // 桶大小 = (maxFreq - 1) * (n + 1) + maxCount
  const formulaAns = (maxFreq - 1) * (n + 1) + maxCount;
  const totalSlots = Math.max(tasks.length, formulaAns);
  const slots: string[] = new Array(totalSlots).fill('IDLE');

  // 模拟填充槽位：先排高频任务，再排其他任务
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
          // 环绕回填到下一个起始槽位
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
    // 找到下一个空位作为新的起始起点
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
    codeLine: CODE_LINES.calcAns,
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
    codeLine: CODE_LINES.returnAns,
    metrics: { '最终结果': `${totalSlots}`, '任务总数': `${tasks.length}`, '空闲槽数': `${idleCount}` }
  });

  return steps;
}

export function renderTaskSchedulerCanvas(container: HTMLElement, step: TaskSchedulerStep): void {
  const { slots, taskCounts, maxFreq, maxFreqTasks, idleCount, totalTime } = step;

  const taskPalette: Record<string, string> = {
    A: '#38bdf8',
    B: '#818cf8',
    C: '#34d399',
    D: '#fbbf24',
    E: '#f472b6',
    F: '#a78bfa',
    IDLE: '#64748b'
  };

  const slotHtml = slots.map((s, idx) => {
    const isIdle = s === 'IDLE';
    const color = taskPalette[s] || '#c084fc';
    const bg = isIdle ? 'rgba(100, 116, 139, 0.15)' : `${color}22`;
    const border = isIdle ? '1px dashed rgba(148, 163, 184, 0.3)' : `1px solid ${color}88`;

    return `
      <div style="display:flex; flex-direction:column; align-items:center; gap:4px;">
        <div style="
          width: 44px;
          height: 48px;
          border-radius: 8px;
          background: ${bg};
          border: ${border};
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.1rem;
          color: ${isIdle ? '#94a3b8' : color};
          box-shadow: ${isIdle ? 'none' : `0 4px 12px ${color}33`};
          transition: all 0.2s ease;
        ">
          ${isIdle ? '💤' : s}
        </div>
        <span style="font-size: 0.72rem; color: #64748b; font-family: monospace;">T${idx + 1}</span>
      </div>
    `;
  }).join('');

  const freqCards = Object.entries(taskCounts).map(([task, cnt]) => {
    const isMax = cnt === maxFreq;
    const color = taskPalette[task] || '#c084fc';
    return `
      <div style="
        padding: 8px 14px;
        background: ${isMax ? 'rgba(56, 189, 248, 0.12)' : 'rgba(30, 41, 59, 0.5)'};
        border: 1px solid ${isMax ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)'};
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
      ">
        <span style="font-weight: 700; color: ${color}; font-size: 1.1rem;">${task}</span>
        <span style="color: #94a3b8; font-size: 0.85rem;">频次:</span>
        <span style="font-weight: 700; color: #f8fafc;">${cnt}</span>
        ${isMax ? '<span style="font-size:0.7rem; background:#38bdf822; color:#38bdf8; padding:2px 6px; border-radius:4px;">最高频</span>' : ''}
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 16px; padding: 16px; box-sizing: border-box;">
      <!-- 统计指标与卡片 -->
      <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center;">
        <span style="font-size: 0.85rem; font-weight: 600; color: #94a3b8;">任务频次统计:</span>
        ${freqCards.length ? freqCards : '<span style="color:#64748b; font-size:0.85rem;">未统计</span>'}
      </div>

      <!-- 时间轴调度插槽看板 -->
      <div style="
        flex: 1;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 20px;
        display: flex;
        flex-direction: column;
        gap: 16px;
      ">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="font-size: 0.95rem; font-weight: 600; color: #f1f5f9; display: flex; align-items: center; gap: 8px;">
            <span>⏱️ CPU 调度时间轴槽位排布 (Timeline Slots)</span>
            ${totalTime > 0 ? `<span style="font-size: 0.8rem; background: #38bdf822; color: #38bdf8; padding: 2px 8px; border-radius: 6px;">总耗时: ${totalTime} 个时间片</span>` : ''}
          </div>
          <div style="font-size: 0.85rem; color: #94a3b8;">
            空闲槽 (IDLE): <b style="color: ${idleCount > 0 ? '#fbbf24' : '#34d399'};">${idleCount}</b>
          </div>
        </div>

        <div style="
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          padding: 16px;
          background: rgba(2, 6, 23, 0.4);
          border-radius: 10px;
          min-height: 90px;
          align-items: center;
        ">
          ${slotHtml.length ? slotHtml : '<div style="color: #64748b; font-size: 0.88rem; width: 100%; text-align: center;">点击单步或播放查看时间轴插槽调度</div>'}
        </div>

        <!-- 桶思想公式说明 -->
        <div style="
          padding: 12px 16px;
          background: rgba(30, 41, 59, 0.5);
          border-left: 4px solid #38bdf8;
          border-radius: 0 8px 8px 0;
          font-size: 0.85rem;
          color: #cbd5e1;
          line-height: 1.6;
        ">
          <div>💡 <b>桶思想贪心解析</b>：以最高频任务建立 (maxFreq - 1) 个大小为 (n + 1) 的桶。</div>
          <div>若任务种类少，桶内空闲需填补 IDLE，耗时为 <code>(maxFreq - 1) * (n + 1) + maxCount</code>；若任务丰富填满桶，耗时为 <code>tasks.length</code>。</div>
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'task-scheduler',
  name: '任务调度器',
  category: 'greedy',
  learningGoal: '掌握贪心策略与桶思想在 CPU 任务调度冷却间隔中的应用，理解最短调度耗时数学边界',
  inputs: [
    {
      id: 'tasks',
      label: '任务序列',
      type: 'text',
      defaultValue: 'AAABBB',
      placeholder: '如 AAABBB 或 AAABBBCC'
    },
    {
      id: 'n',
      label: '冷却时间 n',
      type: 'number',
      defaultValue: 2,
      min: 0,
      max: 10
    }
  ],
  codeLanguages: TASK_SCHEDULER_CODES,
  generateSteps: (inputs) => {
    const taskStr = String(inputs.tasks || 'AAABBB');
    const n = Number(inputs.n ?? 2);
    return buildTaskSchedulerSteps(taskStr, n);
  },
  renderCanvas: (container, step) => {
    renderTaskSchedulerCanvas(container, step as TaskSchedulerStep);
  }
});
