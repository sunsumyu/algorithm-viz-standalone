/**
 * 每日温度可视化器（单调栈）— 声明式 4-Card 标准架构
 * LeetCode 739：单调递增栈（栈头到栈底），遇到更高温度持续出栈并计算跨度 i - st.top()
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../core/input-primitives';
import {
  HighlightTarget,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  DAILY_TEMPERATURES_PROBLEM_HTML,
  DAILY_TEMPERATURES_ANALYSIS_HTML,
  DAILY_TEMPERATURES_CODE_LANGUAGES,
} from './daily-temperatures-problem-content';

export interface DailyTempStep {
  temperatures: number[];
  currentIndex: number;
  stack: number[]; // 存储下标
  result: number[];
  poppedIndex: number | null;
  action: 'init' | 'compare' | 'pop_resolve' | 'push' | 'done';
  message: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export function buildDailyTemperaturesSteps(rawTemps: number[]): DailyTempStep[] {
  const steps: DailyTempStep[] = [];
  const n = rawTemps.length;

  const lines = {
    init: { java: [3, 4], cpp: [4, 5], python: [3, 4], javascript: [3, 4] },
    compare: { java: [5, 7], cpp: [6, 7], python: [5, 6], javascript: [5, 6] },
    popResolve: { java: [8, 9], cpp: [8, 9], python: [7, 8], javascript: [7, 8] },
    push: { java: 11, cpp: 11, python: 9, javascript: 10 },
    done: { java: 13, cpp: 13, python: 10, javascript: 12 },
  };

  if (n === 0) {
    steps.push({
      temperatures: [],
      currentIndex: -1,
      stack: [],
      result: [],
      poppedIndex: null,
      action: 'done',
      message: '输入为空，返回空数组',
      codeLine: lines.done,
    });
    return steps;
  }

  const result = new Array(n).fill(0);
  const stack: number[] = [];

  steps.push({
    temperatures: [...rawTemps],
    currentIndex: -1,
    stack: [],
    result: [...result],
    poppedIndex: null,
    action: 'init',
    message: `初始化：共 ${n} 天温度数据，结果数组初始化为全 0，单调栈为空`,
    codeLine: lines.init,
  });

  for (let i = 0; i < n; i++) {
    const curTemp = rawTemps[i];

    steps.push({
      temperatures: [...rawTemps],
      currentIndex: i,
      stack: [...stack],
      result: [...result],
      poppedIndex: null,
      action: 'compare',
      message: `📅 第 [${i}] 天 (温度 ${curTemp}°C)：与单调栈顶 ${stack.length > 0 ? `第 [${stack[stack.length - 1]}] 天 (${rawTemps[stack[stack.length - 1]]}°C)` : '（栈空）'} 进行比对`,
      codeLine: lines.compare,
    });

    while (stack.length > 0 && curTemp > rawTemps[stack[stack.length - 1]]) {
      const prevIdx = stack.pop()!;
      result[prevIdx] = i - prevIdx;

      steps.push({
        temperatures: [...rawTemps],
        currentIndex: i,
        stack: [...stack],
        result: [...result],
        poppedIndex: prevIdx,
        action: 'pop_resolve',
        message: `🔥 升温触发结算！第 [${i}] 天 (${curTemp}°C) > 栈顶第 [${prevIdx}] 天 (${rawTemps[prevIdx]}°C)！等待跨度 = ${i} - ${prevIdx} = ${result[prevIdx]} 天，出栈！`,
        codeLine: lines.popResolve,
      });
    }

    stack.push(i);

    steps.push({
      temperatures: [...rawTemps],
      currentIndex: i,
      stack: [...stack],
      result: [...result],
      poppedIndex: null,
      action: 'push',
      message: `📥 将第 [${i}] 天 (${curTemp}°C) 入栈，维护栈底到栈顶单调递减性质`,
      codeLine: lines.push,
    });
  }

  steps.push({
    temperatures: [...rawTemps],
    currentIndex: n - 1,
    stack: [...stack],
    result: [...result],
    poppedIndex: null,
    action: 'done',
    message: `🎉 全遍历结算完成！单调栈内剩余未被打破的天数保持 0 天，最终等待数组：[${result.join(', ')}]`,
    codeLine: lines.done,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: DailyTempStep[]): DailyTempStep[] {
  return steps.map((s) => {
    const n = s.temperatures.length;
    const topIdx = s.stack.length > 0 ? s.stack[s.stack.length - 1] : null;
    const resolvedCount = s.result.filter((r) => r > 0).length;

    let action = '🔍 比对栈顶温度';
    if (s.action === 'pop_resolve') action = `🔥 结算出栈 (等待跨度 ${s.result[s.poppedIndex ?? 0]} 天)`;
    else if (s.action === 'push') action = '📥 压入栈顶 (维持递增)';
    else if (s.action === 'done') action = '🎉 完成';
    else if (s.action === 'init') action = '初始化';

    return {
      ...s,
      log: s.message,
      metrics: {
        'cur-day': s.currentIndex >= 0 ? `第 [${s.currentIndex}] 天 (${s.temperatures[s.currentIndex]}°C)` : '—',
        'stack-top': topIdx !== null ? `第 [${topIdx}] 天 (${s.temperatures[topIdx]}°C)` : '（栈空）',
        resolved: `${resolvedCount} / ${n} 天`,
        result: `[${s.result.join(', ')}]`,
        action,
      },
    };
  });
}

export function renderDailyTemperaturesCanvas(container: HTMLElement, step: DailyTempStep): void {
  const temps = step.temperatures;
  const stack = step.stack;
  const result = step.result;
  const n = temps.length;

  if (n === 0) {
    container.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">输入为空</div>';
    return;
  }

  const curIdx = step.currentIndex;
  const isDone = step.action === 'done';

  const maxT = Math.max(...temps, 100);
  const minT = Math.min(...temps, 30);
  const range = Math.max(1, maxT - minT);

  // 上方：温度柱状图
  const barsHtml = temps
    .map((t, idx) => {
      const isCurrent = idx === curIdx && !isDone;
      const inStack = stack.includes(idx);
      const isPopped = idx === step.poppedIndex;
      const waitDays = result[idx];

      const heightPercent = Math.max(18, Math.min(100, Math.round(((t - minT) / range) * 70 + 20)));

      let barBg = '#e2e8f0';
      let textColor = '#64748b';
      let borderColor = 'transparent';

      if (isCurrent) {
        barBg = '#ea580c';
        textColor = '#ea580c';
        borderColor = '#ea580c';
      } else if (isPopped) {
        barBg = '#10b981';
        textColor = '#059669';
        borderColor = '#10b981';
      } else if (inStack) {
        barBg = '#fbbf24';
        textColor = '#d97706';
        borderColor = '#f59e0b';
      } else if (waitDays > 0) {
        barBg = '#d1fae5';
        textColor = '#059669';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; min-width: 28px; max-width: 48px;">
          <span style="font-size: 9px; font-weight: 700; color: ${textColor}; font-family: monospace;">${t}°</span>
          <div style="width: 100%; height: 75px; display: flex; align-items: flex-end; justify-content: center;">
            <div style="width: 22px; height: ${heightPercent}%; background: ${barBg}; border-radius: 6px 6px 2px 2px; border: 1.5px solid ${borderColor}; transition: all 0.2s; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 8.5px; font-weight: 800;">
              ${waitDays > 0 ? waitDays : ''}
            </div>
          </div>
          <span style="font-size: 8.5px; color: ${isCurrent ? '#ea580c' : '#94a3b8'}; font-weight: 700;">
            [${idx}]
          </span>
        </div>
      `;
    })
    .join('');

  // 下方：单调栈视觉展示
  const stackItemsHtml = stack
    .map((idx) => {
      return `
        <div style="padding: 2px 8px; border-radius: 6px; background: #fffbeb; border: 1.5px solid #fde68a; color: #b45309; font-size: 11px; font-weight: 800; font-family: 'JetBrains Mono', monospace; display: flex; align-items: center; gap: 4px;">
          <span>[${idx}]</span>
          <span style="color: #ea580c;">${temps[idx]}°C</span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box;">
      <!-- 柱状图水平流 -->
      <div style="display: flex; justify-content: space-around; align-items: flex-end; padding: 2px 0; border-bottom: 1px solid #e2e8f0;">
        ${barsHtml}
      </div>

      <!-- 单调栈容器 -->
      <div style="display: flex; align-items: center; gap: 8px; padding-top: 2px;">
        <span style="font-size: 10.5px; font-weight: 700; color: #475569; white-space: nowrap;">🥞 单调栈 (栈底 &rarr; 栈顶):</span>
        <div style="display: flex; gap: 4px; overflow-x: auto; flex: 1; align-items: center; min-height: 28px;">
          ${stack.length > 0 ? stackItemsHtml : '<span style="font-size: 10.5px; color: #94a3b8;">栈空</span>'}
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'daily-temperatures',
  name: '每日温度',
  category: 'monotonic-stack',
  description: '单调递增栈（栈头到栈底），遇到更高温度持续出栈计算右侧首个更大元素的跨度',
  icon: '🌡️',
  difficulty: 2,
  levelOrder: 1,
  learningGoal: '掌握单调栈核心原理，理解栈内维护下标以及遇大元素循环出栈结算天数差的经典模式',
  inputs: [
    {
      id: 'temperatures',
      label: '每日温度',
      type: 'text',
      defaultValue: '73,74,75,71,69,72,76,73',
      placeholder: '逗号分隔温度值',
    },
  ],
  presets: [
    { label: '示例 1 (8天)', values: { temperatures: '73,74,75,71,69,72,76,73' } },
    { label: '单调递增', values: { temperatures: '30,40,50,60' } },
    { label: '波谷反弹', values: { temperatures: '89,62,70,58,47,76,100' } },
  ],
  metrics: [
    { id: 'cur-day', label: '当前考察日', color: '#ea580c' },
    { id: 'stack-top', label: '栈顶日', color: '#d97706' },
    { id: 'resolved', label: '已结算天数', color: '#10b981' },
    { id: 'result', label: '等待数组', color: '#059669' },
    { id: 'action', label: '操作决策', color: '#2563eb' },
  ],
  legend: [
    { label: '📍 当前考察日', color: '#ea580c' },
    { label: '🥞 栈内待破纪录', color: '#fbbf24' },
    { label: '✓ 已结算等待天数', color: '#10b981' },
  ],
  codeLanguages: DAILY_TEMPERATURES_CODE_LANGUAGES,
  problemHtml: DAILY_TEMPERATURES_PROBLEM_HTML,
  analysisHtml: DAILY_TEMPERATURES_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const rawTemps = parseNumberList(inputs.temperatures, '73,74,75,71,69,72,76,73');
    return withMetrics(buildDailyTemperaturesSteps(rawTemps.length ? rawTemps : [73, 74, 75, 71, 69, 72, 76, 73]));
  },
  renderCanvas: (container, step) => renderDailyTemperaturesCanvas(container, step as DailyTempStep),
});
