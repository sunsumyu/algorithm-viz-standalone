/**
 * 旋转字符串 / 字符串迁移 (Rotate String · LeetCode 796) 步进编译器
 * 纯逻辑与状态步进推演，零 DOM 依赖与零视觉内联
 * 核心考点：字符串循环移位、双倍拼接 (s + s) 定理与滑动窗口比对
 */

import { StepBase } from '../../../core/step-visualizer';

/** 代码面板高亮行号锚点（1-based，与源码逐行对应） */
const lines: Record<string, number | number[]> = {
  init: 1,
  lengthcheck: 2,
  concat: 3,
  windowCheck: 4,
  done: 5,
};

export interface SCStep extends StepBase {
  str1: string;
  str2: string;
  concat: string;
  windowStart: number;
  windowEnd: number;
  shift: number;
  matched: boolean;
  matchPos: number | null;
  phase: 'init' | 'length-check' | 'concat' | 'slide' | 'found' | 'done';
  statusText: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export function buildStringMigrationSteps(str1 = 'abcde', str2 = 'cdeab'): SCStep[] {
  const steps: SCStep[] = [];
  const n = str1.length;
  const concat = str1 + str1;

  steps.push({
    str1,
    str2,
    concat,
    windowStart: 0,
    windowEnd: 0,
    shift: 0,
    matched: false,
    matchPos: null,
    phase: 'init',
    statusText: `初始化：源串 s="${str1}"（长度 ${n}），目标串 goal="${str2}"（长度 ${str2.length}）。`,
    log: `初始化: s="${str1}", goal="${str2}"`,
    codeLine: lines.init,
  });

  if (n !== str2.length) {
    steps.push({
      str1,
      str2,
      concat,
      windowStart: 0,
      windowEnd: 0,
      shift: 0,
      matched: false,
      matchPos: null,
      phase: 'length-check',
      statusText: `❌ 两字符串长度不等（${n} ≠ ${str2.length}），goal 绝不可能通过 s 旋转得到，直接返回 false。`,
      log: `长度不等: ${n} ≠ ${str2.length} -> false`,
      codeLine: lines.lengthcheck,
    });
    return steps;
  }

  steps.push({
    str1,
    str2,
    concat,
    windowStart: 0,
    windowEnd: n,
    shift: 0,
    matched: false,
    matchPos: null,
    phase: 'concat',
    statusText: `构建双倍拼接串 concat = s + s = "${concat}"。只要 goal 是其子串，则满足旋转等价性。`,
    log: `双倍拼接: "${concat}"`,
    codeLine: lines.concat,
  });

  let foundMatch = false;
  let finalShift = -1;

  for (let i = 0; i <= n; i++) {
    const windowStr = concat.substring(i, i + n);
    const isMatch = windowStr === str2;

    steps.push({
      str1,
      str2,
      concat,
      windowStart: i,
      windowEnd: i + n,
      shift: i,
      matched: isMatch,
      matchPos: isMatch ? i : null,
      phase: isMatch ? 'found' : 'slide',
      statusText: `滑动窗口 [${i}, ${i + n}): "${windowStr}" ${
        isMatch ? '=== goal！匹配成功！' : `≠ "${str2}"`
      }。当前左旋偏移量 shift=${i}。`,
      log: `位移 shift=${i}: "${windowStr}" ${isMatch ? '✓ 匹配' : '✗ 不匹配'}`,
      codeLine: lines.windowCheck,
    });

    if (isMatch) {
      foundMatch = true;
      finalShift = i;
      break;
    }
  }

  steps.push({
    str1,
    str2,
    concat,
    windowStart: finalShift >= 0 ? finalShift : 0,
    windowEnd: finalShift >= 0 ? finalShift + n : n,
    shift: finalShift >= 0 ? finalShift : 0,
    matched: foundMatch,
    matchPos: finalShift >= 0 ? finalShift : null,
    phase: 'done',
    statusText: foundMatch
      ? `🎉 判定成功！goal 是 s 经过左旋 ${finalShift} 步后的旋转字符串（返回 true）。`
      : `❌ 遍历完毕未找到匹配，goal 不是 s 的旋转字符串（返回 false）。`,
    log: `✓ 判定完成: 结果 = ${foundMatch}${foundMatch ? ` (偏移量=${finalShift})` : ''}`,
    codeLine: lines.done,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
export function withMetrics(steps: SCStep[]): SCStep[] {
  return steps.map((s) => ({
    ...s,
    metrics: {
      shift: String(s.shift),
      'window-str':
        s.phase === 'init' || s.phase === 'length-check'
          ? '—'
          : `"${s.concat.substring(s.windowStart, s.windowEnd)}"`,
      'match-pos': s.matchPos !== null ? String(s.matchPos) : '—',
      result:
        s.phase === 'done'
          ? s.matched
            ? 'True (有效)'
            : 'False (无效)'
          : '匹配中...',
    },
  }));
}
