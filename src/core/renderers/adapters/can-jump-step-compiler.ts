import { StepBase } from '../../step-visualizer';
import type { HighlightTarget } from '../../step-visualizer';

export const CAN_JUMP_CODE_LINES: Record<string, HighlightTarget> = {
  entry: { java: 1, cpp: 3, python: 2, javascript: 1 },
  guardSingle: {
    java: 2,
    cpp: 5,
    python: { primary: 5, context: [4] },
    javascript: 2,
  },
  init: { java: 3, cpp: 4, python: 3, javascript: 3 },
  scan: { java: 4, cpp: 6, python: 7, javascript: 4 },
  extend: { java: 5, cpp: 7, python: 8, javascript: 5 },
  success: {
    java: 6,
    cpp: 8,
    python: { primary: 10, context: [9] },
    javascript: 6,
  },
  blocked: { java: 8, cpp: 10, python: 12, javascript: 8 },
};

export interface CanJumpStep extends StepBase {
  array: number[];
  currentIndex: number;
  maxReach: number;
  prevMaxReach: number;
  canJump: boolean;
  action: 'init' | 'scan' | 'extend' | 'blocked' | 'success' | 'done';
  decision?: string;
  message: string;
  log?: string;
  codeLine: HighlightTarget;
  line?: number;
  metrics?: Record<string, string>;
}

function getLine(target: HighlightTarget): number {
  if (typeof target === 'number') return target;
  if (typeof target === 'object' && target !== null && 'java' in target) {
    const j = (target as any).java;
    if (typeof j === 'number') return j;
    if (j && typeof j.primary === 'number') return j.primary;
  }
  return 1;
}

function withMetrics(steps: CanJumpStep[]): CanJumpStep[] {
  return steps.map((s) => {
    const n = s.array.length;
    const curVal = s.currentIndex < n ? s.array[s.currentIndex] : 0;
    const reach = s.currentIndex + curVal;
    const isReach = s.maxReach >= n - 1;

    let action = s.action === 'extend' ? '🌐 覆盖范围扩大' : '🔍 正常推进';
    if (s.action === 'success') action = '🎉 覆盖终点 (返回 true)';
    else if (s.action === 'blocked') action = '❌ 覆盖受阻 (返回 false)';
    else if (s.action === 'init') action = '初始化';

    return {
      ...s,
      decision: s.decision ?? action,
      log: s.log ?? s.message,
      line: s.line ?? getLine(s.codeLine),
      metrics: {
        'cur-pos': `[${s.currentIndex}] (跳力: ${curVal})`,
        reach: `i + nums[i] = ${reach}`,
        cover: `0 ~ ${s.maxReach}`,
        'reach-goal': isReach ? '✓ 可达' : '⏳ 未达',
        action,
      },
    };
  });
}

export function canJumpSteps(arr: number[]): CanJumpStep[] {
  const steps: CanJumpStep[] = [];
  const n = arr.length;
  const lines = CAN_JUMP_CODE_LINES;

  if (n === 0) return steps;
  if (n === 1) {
    steps.push({
      array: [...arr],
      currentIndex: 0,
      maxReach: 0,
      prevMaxReach: 0,
      canJump: true,
      action: 'success',
      message: '数组长度为 1，起始即在终点，直接返回 true',
      decision: '单元素直接可达',
      codeLine: lines.success,
      line: getLine(lines.success),
    });
    return withMetrics(steps);
  }

  let cover = 0;
  let canReach = false;

  steps.push({
    array: [...arr],
    currentIndex: 0,
    maxReach: 0,
    prevMaxReach: 0,
    canJump: true,
    action: 'init',
    message: `初始化：nums = [${arr.join(', ')}]，初始最大覆盖范围 cover = 0`,
    decision: '初始化覆盖范围',
    codeLine: lines.init,
    line: getLine(lines.init),
  });

  for (let i = 0; i <= cover; i++) {
    const reach = i + arr[i];
    const oldCover = cover;

    steps.push({
      array: [...arr],
      currentIndex: i,
      maxReach: cover,
      prevMaxReach: oldCover,
      canJump: true,
      action: 'scan',
      message: `🔍 位于下标 [${i}]=${arr[i]}，从该点最远可跳至下标 ${reach}`,
      decision: `考察下标 [${i}] 最远跳力`,
      codeLine: lines.scan,
      line: getLine(lines.scan),
    });

    if (reach > cover) {
      cover = reach;
      steps.push({
        array: [...arr],
        currentIndex: i,
        maxReach: cover,
        prevMaxReach: oldCover,
        canJump: true,
        action: 'extend',
        message: `🌐 扩展覆盖范围：cover 从 ${oldCover} 推进至 ${cover}！`,
        decision: `覆盖范围推进至 ${cover}`,
        codeLine: lines.extend,
        line: getLine(lines.extend),
      });
    }

    if (cover >= n - 1) {
      canReach = true;
      steps.push({
        array: [...arr],
        currentIndex: i,
        maxReach: cover,
        prevMaxReach: oldCover,
        canJump: true,
        action: 'success',
        message: `🎉 成功覆盖终点！最大覆盖范围 cover=${cover} >= 终点下标 ${n - 1}，必定可达！`,
        decision: '成功覆盖终点',
        codeLine: lines.success,
        line: getLine(lines.success),
      });
      break;
    }
  }

  if (!canReach) {
    steps.push({
      array: [...arr],
      currentIndex: cover,
      maxReach: cover,
      prevMaxReach: cover,
      canJump: false,
      action: 'blocked',
      message: `❌ 无法前进：最大覆盖范围停留在下标 ${cover}，无法到达终点 ${n - 1}`,
      decision: '覆盖受阻无法到达终点',
      codeLine: lines.blocked,
      line: getLine(lines.blocked),
    });
  }

  return withMetrics(steps);
}
