/**
 * 右旋转字符串可视化器 — 声明式 4-Card 标准架构
 * KamaCoder 55：三次反转法
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  RIGHT_ROTATE_STRING_PROBLEM_HTML,
  RIGHT_ROTATE_STRING_ANALYSIS_HTML,
  RIGHT_ROTATE_STRING_CODE_LANGUAGES,
} from './right-rotate-string-problem-content';

export interface RightRotateStep {
  chars: string[];
  stage: 1 | 2 | 3;
  windowStart: number;
  windowEnd: number;
  left: number;
  right: number;
  k: number;
  swapping: boolean;
  phase: 'init' | 'stage1' | 'stage2' | 'stage3' | 'done';
  status: 'init' | 'stage1' | 'stage2' | 'stage3' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export function buildRightRotateSteps(inputStr: string, kInput: number): RightRotateStep[] {
  const steps: RightRotateStep[] = [];
  const chars = inputStr.split('');
  const n = chars.length;
  const k = kInput % n;

  steps.push({
    chars: [...chars],
    stage: 1,
    windowStart: 0,
    windowEnd: n - 1,
    left: -1,
    right: -1,
    k,
    swapping: false,
    phase: 'init',
    status: 'init',
    message: `初始化右旋转：字符串 "${inputStr}" (长度 n=${n})，向右旋转 k=${k} 位。采用三次反转法。`,
    log: `开始右旋转 (n=${n}, k=${k})`,
    codeLine: 2,
  });

  const runReverse = (
    wStart: number,
    wEnd: number,
    stageNum: 1 | 2 | 3,
    phaseKey: 'stage1' | 'stage2' | 'stage3',
    stageName: string,
    codeLine: number | number[]
  ) => {
    let l = wStart;
    let r = wEnd;

    steps.push({
      chars: [...chars],
      stage: stageNum,
      windowStart: wStart,
      windowEnd: wEnd,
      left: l,
      right: r,
      k,
      swapping: false,
      phase: phaseKey,
      status: phaseKey,
      message: `Stage ${stageNum}：${stageName}，区间 [${wStart}, ${wEnd}]。`,
      log: `Stage ${stageNum}: 准备反转 [${wStart}, ${wEnd}]`,
      codeLine,
    });

    while (l < r) {
      const temp = chars[l];
      chars[l] = chars[r];
      chars[r] = temp;

      steps.push({
        chars: [...chars],
        stage: stageNum,
        windowStart: wStart,
        windowEnd: wEnd,
        left: l,
        right: r,
        k,
        swapping: true,
        phase: phaseKey,
        status: phaseKey,
        message: `${stageName}：交换 chars[${l}] <-> chars[${r}] ('${temp}' <-> '${chars[l]}')。`,
        log: `交换 [${l}] <-> [${r}]`,
        codeLine,
      });

      l++;
      r--;
    }
  };

  // 1. 反转全部
  runReverse(0, n - 1, 1, 'stage1', '反转整个字符串 [0, n-1]', 5);

  // 2. 反转前 k 个
  if (k > 1) {
    runReverse(0, k - 1, 2, 'stage2', `反转前 k 个字符 [0, ${k - 1}]`, 7);
  }

  // 3. 反转剩余 n - k 个
  if (n - k > 1) {
    runReverse(k, n - 1, 3, 'stage3', `反转后 n - k 个字符 [${k}, ${n - 1}]`, 9);
  }

  steps.push({
    chars: [...chars],
    stage: 3,
    windowStart: -1,
    windowEnd: -1,
    left: -1,
    right: -1,
    k,
    swapping: false,
    phase: 'done',
    status: 'done',
    message: `🎉 三次反转全部完成！右旋转 ${k} 位后的最终字符串为 "${chars.join('')}"。`,
    log: `✓ 求解完成: "${chars.join('')}"`,
    codeLine: 10,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: RightRotateStep[]): RightRotateStep[] {
  const statusMap: Record<string, string> = {
    init: '初始化',
    stage1: '反转整体',
    stage2: '反转前部',
    stage3: '反转后部',
    done: '旋转完成',
  };
  return steps.map((s) => {
    let action = '三次反转全部完成';
    if (s.phase === 'stage1') action = `reverse(0, ${s.chars.length - 1})`;
    else if (s.phase === 'stage2') action = `reverse(0, ${s.k - 1})`;
    else if (s.phase === 'stage3') action = `reverse(${s.k}, ${s.chars.length - 1})`;

    return {
      ...s,
      metrics: {
        stage: `Stage ${s.stage}`,
        window:
          s.windowStart >= 0 && s.windowEnd >= 0 && s.phase !== 'done'
            ? `[${s.windowStart}, ${s.windowEnd}]`
            : '—',
        k: `${s.k}`,
        status: statusMap[s.phase] || s.phase,
        action,
      },
    };
  });
}

/** 主视觉：字符数组三次分段反转轨迹（区间高亮 + 指针徽章） */
export function renderRightRotateStringCanvas(container: HTMLElement, step: RightRotateStep): void {
  const { chars, windowStart, windowEnd, left, right, swapping, phase } = step;

  const cellsHtml = chars
    .map((ch, idx) => {
      const inSubWindow =
        windowStart >= 0 && windowEnd >= 0 && idx >= windowStart && idx <= windowEnd && phase !== 'done';
      const isLeft = idx === left && phase !== 'done';
      const isRight = idx === right && phase !== 'done';
      const isSwapping = swapping && (idx === left || idx === right);

      let style =
        'width: 38px; height: 44px; border-radius: 8px; background: #ffffff; border: 2px solid #cbd5e1; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);';
      if (inSubWindow) style += ' border-color: #818cf8; background: #eef2ff;';
      if (isSwapping) {
        style +=
          ' border-color: #10b981; background: #ecfdf5; transform: translateY(-3px) scale(1.05); box-shadow: 0 4px 10px rgba(16, 185, 129, 0.2);';
      } else if (isLeft) {
        style += ' border-color: #2563eb; background: #eff6ff;';
      } else if (isRight) {
        style += ' border-color: #f59e0b; background: #fffbeb;';
      }

      let ptrTags = '';
      if (isLeft && isRight) {
        ptrTags =
          '<span style="font-size: 9.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; padding: 1px 5px; border-radius: 4px; color: #ffffff; background: #2563eb; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">L</span>' +
          '<span style="font-size: 9.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; padding: 1px 5px; border-radius: 4px; color: #ffffff; background: #f59e0b; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">R</span>';
      } else if (isLeft) {
        ptrTags =
          '<span style="font-size: 9.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; padding: 1px 5px; border-radius: 4px; color: #ffffff; background: #2563eb; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">left</span>';
      } else if (isRight) {
        ptrTags =
          '<span style="font-size: 9.5px; font-weight: 800; font-family: \'JetBrains Mono\', monospace; padding: 1px 5px; border-radius: 4px; color: #ffffff; background: #f59e0b; box-shadow: 0 1px 2px rgba(0,0,0,0.1);">right</span>';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <div style="min-height: 18px; display: flex; align-items: center; gap: 3px;">${ptrTags}</div>
          <div style="${style}">
            <span style="font-size: 15px; font-weight: 800; color: #0f172a; font-family: 'JetBrains Mono', monospace;">${ch}</span>
            <span style="font-size: 9px; font-weight: 700; color: #94a3b8; position: absolute; bottom: 2px;">${idx}</span>
          </div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display: flex; align-items: flex-end; gap: 6px; flex-wrap: wrap; justify-content: center; width: 100%; height: 100%; padding: 12px; box-sizing: border-box; overflow: auto;">
      ${cellsHtml}
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'right-rotate-string',
  name: '右旋转字符串（三次反转）',
  viewId: 'algo-right-rotate-view',
  category: 'string',
  description: '通过三次反转实现字符串右旋转 k 位',
  icon: '🔄',
  difficulty: 1,
  levelOrder: 5,
  learningGoal: '掌握通过分段反转实现字符串旋转的技巧',
  inputs: [
    {
      id: 's',
      label: '输入字符串',
      type: 'text',
      defaultValue: 'abcdefg',
      placeholder: '字符串',
    },
    {
      id: 'k',
      label: '旋转位数 k',
      type: 'number',
      defaultValue: 2,
      min: 1,
      max: 10,
    },
  ],
  presets: [
    { label: '示例 1: ("abcdefg", k=2)', values: { s: 'abcdefg', k: 2 } },
    { label: '示例 2: ("lrloseumgh", k=6)', values: { s: 'lrloseumgh', k: 6 } },
    { label: '对半旋转: ("helloworld", k=5)', values: { s: 'helloworld', k: 5 } },
    { label: '短字符串: ("abc", k=1)', values: { s: 'abc', k: 1 } },
  ],
  metrics: [
    { id: 'stage', label: '当前阶段', color: '#2563eb' },
    { id: 'window', label: '反转区间 [L, R]', color: '#9333ea' },
    { id: 'k', label: '旋转量 k', color: '#f59e0b' },
    { id: 'status', label: '执行状态', color: '#0f172a' },
    { id: 'action', label: '当前操作', color: '#2563eb' },
  ],
  legend: [
    { label: '反转区间', color: '#818cf8' },
    { label: 'left 指针', color: '#2563eb' },
    { label: 'right 指针', color: '#f59e0b' },
    { label: '交换中', color: '#10b981' },
  ],
  codeLanguages: RIGHT_ROTATE_STRING_CODE_LANGUAGES,
  problemHtml: RIGHT_ROTATE_STRING_PROBLEM_HTML,
  analysisHtml: RIGHT_ROTATE_STRING_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const k = parseInt(String(inputs.k ?? '2'), 10);
    return withMetrics(
      buildRightRotateSteps(String(inputs.s ?? 'abcdefg'), isNaN(k) || k <= 0 ? 2 : k)
    );
  },
  renderCanvas: (container, step) =>
    renderRightRotateStringCanvas(container, step as RightRotateStep),
});
