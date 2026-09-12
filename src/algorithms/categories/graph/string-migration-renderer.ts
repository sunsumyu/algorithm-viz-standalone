/**
 * 旋转字符串 / 字符串迁移 (LC 796)
 * 4-Card 标准现代架构可视化器
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import {
  STRING_MIGRATION_PROBLEM_HTML,
  STRING_MIGRATION_ANALYSIS_HTML,
  STRING_MIGRATION_CODE_LANGUAGES,
} from './string-migration-problem-content';

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
    codeLine: 1,
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
      codeLine: 2,
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
    codeLine: 3,
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
      codeLine: 4,
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
    codeLine: 5,
  });

  return steps;
}


/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: SCStep[]): SCStep[] {
  return steps.map((s) => ({
    ...s,
    metrics: {
      shift: String(s.shift),
      'window-str': s.phase === 'init' || s.phase === 'length-check' ? '—' : `"${s.concat.substring(s.windowStart, s.windowEnd)}"`,
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

const CHAR_BOX = 'width: 36px; height: 40px; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; border: 1.5px solid; transition: all 0.2s; box-sizing: border-box;';

/** 主视觉：goal 字符条 + 双倍拼接滑动窗口字符条 */
export function renderStringMigrationCanvas(container: HTMLElement, step: SCStep): void {
  const { str2, concat, windowStart, windowEnd, matched, phase } = step;

  const goalHtml = str2
    .split('')
    .map(
      (ch) => `<div style="${CHAR_BOX} background: #ffffff; border-color: #cbd5e1; color: #0f172a;"><span style="font-size: 14px; font-weight: 700;">${ch}</span></div>`
    )
    .join('');

  const concatHtml = concat
    .split('')
    .map((ch, i) => {
      const inWindow = i >= windowStart && i < windowEnd;
      let bg = '#ffffff';
      let border = '#cbd5e1';
      let color = '#0f172a';
      let transform = 'none';
      let boxShadow = 'none';
      if (inWindow && matched) {
        bg = '#f0fdf4';
        border = '#22c55e';
        color = '#15803d';
        transform = 'translateY(-4px)';
        boxShadow = '0 4px 8px rgba(34, 197, 94, 0.25)';
      } else if (inWindow) {
        bg = '#eff6ff';
        border = '#3b82f6';
        color = '#1d4ed8';
        transform = 'translateY(-2px)';
      }
      return `<div style="${CHAR_BOX} background: ${bg}; border-color: ${border}; color: ${color}; transform: ${transform}; box-shadow: ${boxShadow};">
        <span style="font-size: 10px; color: #94a3b8; margin-bottom: -2px;">${i}</span>
        <span style="font-size: 14px; font-weight: 700;">${ch}</span>
      </div>`;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 18px; padding: 14px; box-sizing: border-box;">
      <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
        <div style="font-size: 10.5px; font-weight: 700; color: #64748b;">goal 字符串:</div>
        <div style="display: flex; gap: 4px; flex-wrap: wrap; justify-content: center;">${goalHtml}</div>
      </div>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 6px;">
        <div style="font-size: 10.5px; font-weight: 700; color: #64748b;">双倍拼接 s + s（滑动窗口比对）:</div>
        <div style="display: flex; gap: 4px; flex-wrap: wrap; justify-content: center;">${concatHtml}</div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'string-migration',
  name: '旋转字符串 (LC 796)',
  category: 'graph',
  description: '双倍拼接与滑动窗口子串匹配：验证 goal 是否为源字符串 s 的循环旋转移位',
  icon: '🔤',
  difficulty: 1,
  levelOrder: 24,
  learningGoal: '掌握经典字符串循环旋转的双倍拼接 (s + s) 判定定理与滑动窗口单步匹配',
  inputs: [
    { id: 's', label: '源字符串 s', type: 'text', defaultValue: 'abcde' },
    { id: 'goal', label: '目标字符串 goal', type: 'text', defaultValue: 'cdeab' },
  ],
  presets: [
    { label: '示例 1 (可旋转)', values: { s: 'abcde', goal: 'cdeab' } },
    { label: '示例 2 (不可旋转)', values: { s: 'abcde', goal: 'abced' } },
    { label: '相同字符串', values: { s: 'aaa', goal: 'aaa' } },
  ],
  metrics: [
    { id: 'shift', label: '旋转移位', color: '#2563eb' },
    { id: 'window-str', label: '当前窗口子串', color: '#3b82f6' },
    { id: 'match-pos', label: '匹配位置', color: '#a855f7' },
    { id: 'result', label: '判定结果', color: '#16a34a' },
  ],
  legend: [
    { label: '窗口扫描中', color: '#3b82f6' },
    { label: '匹配成功', color: '#22c55e' },
  ],
  codeLanguages: STRING_MIGRATION_CODE_LANGUAGES,
  problemHtml: STRING_MIGRATION_PROBLEM_HTML,
  analysisHtml: STRING_MIGRATION_ANALYSIS_HTML,
  generateSteps: (inputs) =>
    withMetrics(
      buildStringMigrationSteps(
        String(inputs.s ?? 'abcde'),
        String(inputs.goal ?? 'cdeab')
      )
    ),
  renderCanvas: (container, step) => renderStringMigrationCanvas(container, step as SCStep),
});
