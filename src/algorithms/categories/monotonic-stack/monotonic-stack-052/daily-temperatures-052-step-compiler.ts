import {
  DAILY_TEMPERATURES_LINES,
} from './stack-052-stage-codes';

export interface DailyTemp052Step {
  temperatures: number[];
  currentIndex: number;
  stack: number[];
  result: number[];
  poppedIndex: number | null;
  action: 'init' | 'compare' | 'pop_resolve' | 'push' | 'done';
  decision: string;
  message: string;
  log: string;
  codeLine: Record<string, number>;
  metrics: Record<string, string | number>;
}

export function buildDailyTemperatures052Steps(rawTemps: number[]): DailyTemp052Step[] {
  const steps: DailyTemp052Step[] = [];
  const lines = DAILY_TEMPERATURES_LINES;
  const n = rawTemps.length;

  if (n === 0) {
    steps.push({
      temperatures: [],
      currentIndex: -1,
      stack: [],
      result: [],
      poppedIndex: null,
      action: 'done',
      decision: '温度数组为空，返回空结果。',
      message: '无数据处理。',
      log: 'empty temperatures',
      codeLine: lines.returnAns,
      metrics: { '天数 N': 0, '已结算': 0 },
    });
    return steps;
  }

  const result = new Array(n).fill(0);
  const stack: number[] = [];

  // Step 0: 入口
  steps.push({
    temperatures: [...rawTemps],
    currentIndex: -1,
    stack: [],
    result: [...result],
    poppedIndex: null,
    action: 'init',
    decision: `主函数入口：开始求解 ${n} 天每日温度的升温等待天数。`,
    message: '初始化单调递减栈（存天数下标），等待数组初始化为全 0。',
    log: `enter dailyTemperatures: n=${n}`,
    codeLine: lines.entry,
    metrics: { '天数 N': n, '当前状态': '初始化', '栈深': 0, '已结算天数': 0 },
  });

  for (let i = 0; i < n; i++) {
    const curTemp = rawTemps[i];

    // 比对
    steps.push({
      temperatures: [...rawTemps],
      currentIndex: i,
      stack: [...stack],
      result: [...result],
      poppedIndex: null,
      action: 'compare',
      decision: `📅 考察第 [${i}] 天 (温度 ${curTemp}°C)：准备与栈顶比对。`,
      message: stack.length > 0
        ? `栈顶为第 [${stack[stack.length - 1]}] 天 (${rawTemps[stack[stack.length - 1]]}°C)。若当前温度更高则触发升温结算。`
        : '栈为空，当前天直接入栈。',
      log: `compare day ${i} (${curTemp}C) with stack top`,
      codeLine: lines.whileCheck,
      metrics: { '考察日': `第 [${i}] 天`, '考察气温': `${curTemp}°C`, '栈顶气温': stack.length > 0 ? `${rawTemps[stack[stack.length - 1]]}°C` : '空', '已结算': result.filter((x) => x > 0).length },
    });

    // 升温触发结算
    while (stack.length > 0 && curTemp > rawTemps[stack[stack.length - 1]]) {
      const prev = stack.pop()!;
      const waitDays = i - prev;
      result[prev] = waitDays;

      steps.push({
        temperatures: [...rawTemps],
        currentIndex: i,
        stack: [...stack],
        result: [...result],
        poppedIndex: prev,
        action: 'pop_resolve',
        decision: `🔥 升温触发结算！第 [${i}] 天 (${curTemp}°C) > 栈顶第 [${prev}] 天 (${rawTemps[prev]}°C)。`,
        message: `第 [${prev}] 天找到下一个更高温！等待跨度 = ${i} - ${prev} = ${waitDays} 天！弹出栈顶！`,
        log: `pop day ${prev}: higher day is ${i}, wait ${waitDays} days`,
        codeLine: lines.popResolve,
        metrics: { '结算日': `第 [${prev}] 天`, '更高温日': `第 [${i}] 天`, '等待跨度': `${waitDays} 天`, '已结算': result.filter((x) => x > 0).length },
      });
    }

    // 压栈
    stack.push(i);
    steps.push({
      temperatures: [...rawTemps],
      currentIndex: i,
      stack: [...stack],
      result: [...result],
      poppedIndex: null,
      action: 'push',
      decision: `📥 将第 [${i}] 天 (${curTemp}°C) 压入栈顶，维持单调递减。`,
      message: `栈内天数下标: [${stack.join(', ')}]，对应气温严格递减。`,
      log: `push day ${i} (${curTemp}C) to stack`,
      codeLine: lines.push,
      metrics: { '入栈日': `第 [${i}] 天`, '栈深': stack.length, '已结算': result.filter((x) => x > 0).length },
    });
  }

  // 终结
  steps.push({
    temperatures: [...rawTemps],
    currentIndex: n,
    stack: [...stack],
    result: [...result],
    poppedIndex: null,
    action: 'done',
    decision: '🎉 全量遍历结算完成！单调栈内剩余未被打破的天数保持 0 天。',
    message: `最终升温等待数组: [${result.join(', ')}]。线性扫描一次完成，耗时 O(N)。`,
    log: 'dailyTemperatures finished',
    codeLine: lines.returnAns,
    metrics: { '总天数': n, '成功升温天数': result.filter((x) => x > 0).length, '最终未升温': stack.length },
  });

  return steps;
}
