/**
 * 右旋转字符串 — 步进推演编译器
 * KamaCoder 55：三次反转法
 */

import { HighlightTarget } from '../../../core/code-panel';

export const RIGHT_ROTATE_STRING_CODE_LINES: Record<string, Record<string, number | number[]>> = {
  init: { java: [2, 3], cpp: [5, 6, 7], python: [2, 3], javascript: [2, 3, 4] },
  stage1: { java: 6, cpp: 9, python: 4, javascript: 12 },
  stage2: { java: 8, cpp: 11, python: 4, javascript: 13 },
  stage3: { java: 10, cpp: 13, python: 4, javascript: 14 },
  done: { java: 11, cpp: 14, python: 4, javascript: 15 },
};

const lines = RIGHT_ROTATE_STRING_CODE_LINES;

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
  codeLine: HighlightTarget;
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
    codeLine: lines.init,
  });

  const runReverse = (
    wStart: number,
    wEnd: number,
    stageNum: 1 | 2 | 3,
    phaseKey: 'stage1' | 'stage2' | 'stage3',
    stageName: string,
    codeLineTarget: HighlightTarget
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
      codeLine: codeLineTarget,
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
        codeLine: codeLineTarget,
      });

      l++;
      r--;
    }
  };

  // 1. 反转全部
  runReverse(0, n - 1, 1, 'stage1', '反转整个字符串 [0, n-1]', lines.stage1);

  // 2. 反转前 k 个
  if (k > 1) {
    runReverse(0, k - 1, 2, 'stage2', `反转前 k 个字符 [0, ${k - 1}]`, lines.stage2);
  }

  // 3. 反转剩余 n - k 个
  if (n - k > 1) {
    runReverse(k, n - 1, 3, 'stage3', `反转后 n - k 个字符 [${k}, ${n - 1}]`, lines.stage3);
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
    codeLine: lines.done,
  });

  return steps;
}

export function withMetrics(steps: RightRotateStep[]): RightRotateStep[] {
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
