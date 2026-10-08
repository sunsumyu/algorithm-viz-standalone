import { StepBase } from '../../step-visualizer';
import type { HighlightTarget } from '../../step-visualizer';

export interface JumpStep extends StepBase {
  array: number[];
  currentIndex: number;
  currentBoundary: number;
  nextBoundary: number;
  jumpCount: number;
  isJump: boolean;
  jumpFrom: number;
  jumpTo: number;
  action: 'init' | 'scan' | 'jump' | 'done';
  message: string;
  log: string;
  decision?: string;
  codeLine: HighlightTarget;
  line?: number;
  vars?: Array<{ name: string; value: string | number; type?: string }>;
  metrics?: Record<string, string>;
}

export const JUMP_GAME_CODE_LINES: Record<string, HighlightTarget> = {
  guard: { java: 2, cpp: 2, python: 2, javascript: 2 },
  init: { java: 3, cpp: 3, python: 3, javascript: 3 },
  scan: { java: 5, cpp: 5, python: 5, javascript: 5 },
  check: { java: 6, cpp: 6, python: 6, javascript: 6 },
  jump: { java: 7, cpp: 7, python: 7, javascript: 7 },
  done: { java: 11, cpp: 11, python: 9, javascript: 11 },
};

function getLine(target: HighlightTarget): number {
  if (typeof target === 'number') return target;
  if (typeof target === 'object' && target !== null && 'java' in target) {
    const j = (target as any).java;
    if (typeof j === 'number') return j;
    if (j && typeof j.primary === 'number') return j.primary;
  }
  return 1;
}

function withMetrics(steps: JumpStep[]): JumpStep[] {
  return steps.map((s) => {
    let action = s.isJump ? '🦘 触碰边界 (steps++)' : '🔍 扫描边界内节点';
    if (s.action === 'done') action = '🏁 已达终点';
    else if (s.action === 'init') action = '初始化';

    return {
      ...s,
      decision: s.decision ?? action,
      line: s.line ?? getLine(s.codeLine),
      metrics: {
        'cur-pos': `[${s.currentIndex}]`,
        'cur-boundary': `[${s.currentBoundary}]`,
        'next-boundary': `[${s.nextBoundary}]`,
        jumps: `${s.jumpCount} 步`,
        action,
      },
    };
  });
}

export function buildJumpGameSteps(arr: number[]): JumpStep[] {
  const steps: JumpStep[] = [];
  const n = arr.length;
  const lines = JUMP_GAME_CODE_LINES;

  if (n <= 1) {
    steps.push({
      array: [...arr],
      currentIndex: 0,
      currentBoundary: 0,
      nextBoundary: 0,
      jumpCount: 0,
      isJump: false,
      jumpFrom: -1,
      jumpTo: -1,
      action: 'done',
      message: '数组长度 <= 1，已经在终点，无需跳跃，步数为 0',
      log: 'no jumps needed',
      decision: '已达终点',
      codeLine: lines.guard,
      line: getLine(lines.guard),
      vars: [{ name: 'nums.length', value: n }, { name: 'steps', value: 0 }],
    });
    return withMetrics(steps);
  }

  let jumps = 0;
  let curDistance = 0;
  let nextDistance = 0;

  steps.push({
    array: [...arr],
    currentIndex: 0,
    currentBoundary: 0,
    nextBoundary: 0,
    jumpCount: 0,
    isJump: false,
    jumpFrom: -1,
    jumpTo: -1,
    action: 'init',
    message: `初始化状态：nums = [${arr.join(', ')}]，curEnd=0, nextReach=0, steps=0`,
    log: `init: jumps=0, boundary=0, farthest=0`,
    decision: '初始化状态',
    codeLine: lines.init,
    line: getLine(lines.init),
    vars: [
      { name: 'curEnd', value: 0 },
      { name: 'nextReach', value: 0 },
      { name: 'steps', value: 0 },
    ],
  });

  for (let i = 0; i < n - 1; i++) {
    const reach = i + arr[i];
    nextDistance = Math.max(nextDistance, reach);

    steps.push({
      array: [...arr],
      currentIndex: i,
      currentBoundary: curDistance,
      nextBoundary: nextDistance,
      jumpCount: jumps,
      isJump: false,
      jumpFrom: -1,
      jumpTo: -1,
      action: 'scan',
      message: `🔍 扫描下标 [${i}]=${arr[i]}，从该点可达下标 ${reach}，更新下一步最远 nextReach=${nextDistance}`,
      log: `scan i=${i}: reach=${reach}, nextReach=${nextDistance}`,
      decision: '扫描边界内节点',
      codeLine: lines.scan,
      line: getLine(lines.scan),
      vars: [
        { name: 'i', value: i },
        { name: 'reach', value: reach },
        { name: 'nextReach', value: nextDistance },
        { name: 'curEnd', value: curDistance },
        { name: 'steps', value: jumps },
      ],
    });

    if (i === curDistance) {
      jumps++;
      const prevBoundary = curDistance;
      curDistance = nextDistance;

      steps.push({
        array: [...arr],
        currentIndex: i,
        currentBoundary: curDistance,
        nextBoundary: nextDistance,
        jumpCount: jumps,
        isJump: true,
        jumpFrom: prevBoundary,
        jumpTo: curDistance,
        action: 'jump',
        message: `🦘 到达当前跳跃边界 [${i}]！必须跳跃一次，steps=${jumps}，新边界推进至 [${curDistance}]`,
        log: `jump #${jumps}: ${prevBoundary} → ${curDistance}`,
        decision: '触碰边界跳跃',
        codeLine: lines.jump,
        line: getLine(lines.jump),
        vars: [
          { name: 'i', value: i },
          { name: 'curEnd', value: curDistance },
          { name: 'steps', value: jumps },
        ],
      });

      if (curDistance >= n - 1) {
        break; // 已经覆盖终点
      }
    }
  }

  steps.push({
    array: [...arr],
    currentIndex: n - 1,
    currentBoundary: n - 1,
    nextBoundary: nextDistance,
    jumpCount: jumps,
    isJump: false,
    jumpFrom: -1,
    jumpTo: -1,
    action: 'done',
    message: `🎉 成功到达终点！最少跳跃次数为 ${jumps} 次`,
    log: `done: jumps=${jumps}`,
    decision: '成功到达终点',
    codeLine: lines.done,
    line: getLine(lines.done),
    vars: [
      { name: 'return steps', value: jumps },
    ],
  });

  return withMetrics(steps);
}
