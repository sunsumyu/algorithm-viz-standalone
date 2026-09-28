/**
 * Class 052 Code03: 每日温度 (Daily Temperatures / LeetCode 739)
 *
 * 核心原理：
 * 维护底到顶单调递减栈。遇到更高温度时打破递减性，
 * 栈顶历史天数找到其右侧首个更高温日，弹出并结算等待天数跨度 ans[prev] = i - prev。
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { parseNumberList } from '../../../../core/input-primitives';
import { STACK_052_PROBLEMS } from './stack-052-problem-content';
import {
  DAILY_TEMPERATURES_CODES,
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

export function renderDailyTemperatures052Canvas(container: HTMLElement, step: DailyTemp052Step): void {
  const temps = step.temperatures;
  const stack = step.stack;
  const result = step.result;
  const n = temps.length;

  if (n === 0) {
    container.innerHTML = '<div style="padding: 16px; color: #94a3b8; font-size: 12px; text-align: center;">输入为空</div>';
    return;
  }

  const curIdx = step.currentIndex;
  const maxT = Math.max(...temps, 100);
  const minT = Math.min(...temps, 30);
  const range = Math.max(1, maxT - minT);

  // 上方柱状图
  const barsHtml = temps
    .map((t, idx) => {
      const isCurrent = idx === curIdx && curIdx < n;
      const inStack = stack.includes(idx);
      const isPopped = idx === step.poppedIndex;
      const waitDays = result[idx];
      const heightPercent = Math.max(16, Math.min(100, Math.round(((t - minT) / range) * 72 + 20)));

      let barBg = '#e2e8f0';
      let textColor = '#64748b';
      let border = 'transparent';

      if (isCurrent) {
        barBg = '#ea580c';
        textColor = '#ea580c';
        border = '#ea580c';
      } else if (isPopped) {
        barBg = '#10b981';
        textColor = '#059669';
        border = '#10b981';
      } else if (inStack) {
        barBg = '#fbbf24';
        textColor = '#d97706';
        border = '#f59e0b';
      } else if (waitDays > 0) {
        barBg = '#d1fae5';
        textColor = '#059669';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; min-width: 32px; max-width: 54px;">
          <span style="font-size: 10px; font-weight: 800; color: ${textColor}; font-family: monospace;">${t}°C</span>
          <div style="width: 100%; height: 90px; display: flex; align-items: flex-end; justify-content: center;">
            <div style="width: 26px; height: ${heightPercent}%; background: ${barBg}; border-radius: 6px 6px 2px 2px; border: 1.5px solid ${border}; transition: all 0.2s; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 9px; font-weight: 800;">
              ${waitDays > 0 ? `+${waitDays}天` : ''}
            </div>
          </div>
          <span style="font-size: 9px; color: ${isCurrent ? '#ea580c' : '#94a3b8'}; font-weight: 700; font-family: monospace;">
            [${idx}]
          </span>
        </div>
      `;
    })
    .join('');

  // 下方单调栈
  const stackItemsHtml = stack
    .map((idx) => {
      return `
        <div style="padding: 2px 8px; border-radius: 6px; background: #fffbeb; border: 1.5px solid #fde68a; color: #b45309; font-size: 11px; font-weight: 800; font-family: monospace; display: flex; align-items: center; gap: 4px;">
          <span>[${idx}]</span>
          <span style="color: #ea580c;">${temps[idx]}°C</span>
        </div>
      `;
    })
    .join('');

  // 等待结果数组视图
  const resultCardsHtml = result
    .map((days, idx) => {
      const isSettled = days > 0;
      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 30px;">
          <div style="width: 26px; height: 26px; border-radius: 4px; background: ${isSettled ? '#ecfdf5' : '#f8fafc'}; border: 1px solid ${isSettled ? '#a7f3d0' : '#e2e8f0'}; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: ${isSettled ? '#059669' : '#94a3b8'}; font-family: monospace;">
            ${days}
          </div>
          <span style="font-size: 8.5px; color: #94a3b8;">[${idx}]</span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; display: flex; flex-direction: column; gap: 12px; padding: 12px; box-sizing: border-box;">
      <!-- 气温柱状图 -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 800; color: #475569;">🌡️ 每日气温直方柱</span>
          <span style="font-size: 10px; background: #ffedd5; color: #c2410c; padding: 2px 8px; border-radius: 12px; font-weight: 700;">🔻 底到顶递减栈（遇升温出栈结算等待天数）</span>
        </div>
        <div style="display: flex; justify-content: space-around; align-items: flex-end; padding: 6px 0; border-bottom: 1.5px solid #e2e8f0;">
          ${barsHtml}
        </div>
      </div>

      <!-- 栈与结果数组 -->
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
        <!-- 单调栈 -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; display: flex; flex-direction: column;">
          <span style="font-size: 11px; font-weight: 800; color: #475569; margin-bottom: 8px;">🥞 单调递减栈 (栈底 &rarr; 栈顶)</span>
          <div style="display: flex; gap: 6px; overflow-x: auto; flex: 1; align-items: center; min-height: 36px; background: #f8fafc; padding: 6px; border-radius: 8px; border: 1.5px dashed #cbd5e1;">
            ${stack.length > 0 ? stackItemsHtml : '<span style="font-size: 11px; color: #94a3b8; font-style: italic;">（栈空）</span>'}
          </div>
        </div>

        <!-- 结果等待数组 -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 800; color: #475569;">📋 等待天数结果数组 answer</span>
            <span style="font-size: 10px; color: #059669; font-weight: 700;">已结算: ${result.filter((x) => x > 0).length} / ${n}</span>
          </div>
          <div style="display: flex; gap: 4px; overflow-x: auto; align-items: center; min-height: 36px; padding: 4px;">
            ${resultCardsHtml}
          </div>
        </div>
      </div>
    </div>
  `;
}

export const dailyTemperatures052Visualizer = registerDeclarativeAlgorithm<DailyTemp052Step>({
  id: 'daily-temperatures-052',
  name: '每日温度 (Class 052 Code03)',
  category: 'monotonic-stack',
  aliases: ['daily-temperatures-052', 'class052-code03'],
  difficulty: 'medium',
  learningGoal: '掌握单调递减栈维护下一个更大元素的经典技巧，理解破坏递减时弹出天数并计算下标跨度。',
  problemContent: STACK_052_PROBLEMS.dailyTemperatures052,
  codeLanguages: DAILY_TEMPERATURES_CODES,
  inputs: [
    {
      id: 'temperatures',
      label: '每日温度',
      type: 'text',
      defaultValue: '73, 74, 75, 71, 69, 72, 76, 73',
      placeholder: '逗号分隔的温度数值',
    },
  ],
  presets: [
    { label: '示例 1 (8天经典)', values: { temperatures: '73, 74, 75, 71, 69, 72, 76, 73' } },
    { label: '示例 2 (单调递增)', values: { temperatures: '30, 40, 50, 60' } },
    { label: '示例 3 (波谷大幅反弹)', values: { temperatures: '89, 62, 70, 58, 47, 76, 100' } },
  ],
  generateSteps: (inputs) => {
    const raw = parseNumberList(inputs.temperatures, '73, 74, 75, 71, 69, 72, 76, 73');
    return buildDailyTemperatures052Steps(raw.length ? raw : [73, 74, 75, 71, 69, 72, 76, 73]);
  },
  renderCanvas: (container, step) => renderDailyTemperatures052Canvas(container, step),
});
