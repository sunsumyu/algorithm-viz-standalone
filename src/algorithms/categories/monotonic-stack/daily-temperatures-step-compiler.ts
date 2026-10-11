import { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface DailyTempStep {
  temperatures: number[];
  currentIndex: number;
  stack: number[]; // 存储下标
  result: number[];
  poppedIndex: number | null;
  action: 'init' | 'compare' | 'pop_resolve' | 'push' | 'done';
  message: string;
  codeLine: HighlightTarget;
  log?: string;
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

export function withMetrics(steps: DailyTempStep[]): DailyTempStep[] {
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
