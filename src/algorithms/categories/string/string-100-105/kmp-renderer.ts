/**
 * Class 100: KMP 算法核心原理与 next 数组动态递推
 * 洛谷 P3375 / LeetCode 28
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { STRING_100_105_PROBLEMS } from './string-100-105-problem-content';
import { KMP_CODES, KMP_LINES } from './string-100-105-stage-codes';
import {
  String100Step,
  renderCharSequence,
  renderAuxArrayTable,
  renderFormulaCard,
} from './string-100-105-shared';

export interface KmpStep extends String100Step {
  s1: string;
  s2: string;
  i1: number;
  i2: number;
  nextArr: number[];
  foundIndex: number;
}

export function computeNextArray(s: string): number[] {
  if (s.length === 0) return [];
  if (s.length === 1) return [-1];
  const next = new Array(s.length).fill(0);
  next[0] = -1;
  next[1] = 0;
  let i = 2;
  let cn = 0;
  while (i < s.length) {
    if (s[i - 1] === s[cn]) {
      next[i++] = ++cn;
    } else if (cn > 0) {
      cn = next[cn];
    } else {
      next[i++] = 0;
    }
  }
  return next;
}

export function buildKmpSteps(s1: string, s2: string): KmpStep[] {
  const steps: KmpStep[] = [];
  const lines = KMP_LINES;

  const nextArr = computeNextArray(s2);

  // Step 0: 入口
  steps.push({
    s1,
    s2,
    i1: 0,
    i2: 0,
    nextArr,
    foundIndex: -1,
    decision: `主函数入口：接收主文本串 s1="${s1}" (长 ${s1.length}) 与模式串 s2="${s2}" (长 ${s2.length})`,
    message: '准备启动 KMP 线性比对，i1 指向主串，i2 指向模式串',
    log: `enter kmp(s1="${s1}", s2="${s2}")`,
    codeLine: lines.entry,
    metrics: { '主串长 n': s1.length, '模式串长 m': s2.length, '当前比对': '准备就绪' },
  });

  // Step 1: 边界合法性
  if (!s1 || !s2 || s1.length < s2.length) {
    steps.push({
      s1,
      s2,
      i1: 0,
      i2: 0,
      nextArr,
      foundIndex: -1,
      decision: `边界特判：模式串为空或主串长度 (${s1.length}) 小于模式串长度 (${s2.length})，直接返回 -1`,
      message: '不可能包含，返回 -1',
      log: 'guard check failed, return -1',
      codeLine: lines.guard,
      metrics: { '比对状态': '非法参数 / 无解' },
    });
    return steps;
  }

  // Step 2: 展示预处理完成的 next 数组
  steps.push({
    s1,
    s2,
    i1: 0,
    i2: 0,
    nextArr,
    foundIndex: -1,
    decision: `预处理完成：已生成模式串 s2 的 next 数组 [${nextArr.join(', ')}]`,
    message: 'next[j] 记录 s2[0..j-1] 的最长相等前后缀长度，失配时指导 i2 回跳',
    log: `computed next array: [${nextArr.join(', ')}]`,
    codeLine: lines.initNext,
    metrics: { 'next 数组规模': nextArr.length, '当前比对': '即将从下标 0 开始' },
  });

  let i1 = 0;
  let i2 = 0;

  // 限制最大步数防止极端超大输入挂死
  let safetyLoop = 0;
  while (i1 < s1.length && i2 < s2.length && safetyLoop < 120) {
    safetyLoop++;

    if (s1[i1] === s2[i2]) {
      // 字符匹配
      const curI1 = i1;
      const curI2 = i2;
      i1++;
      i2++;
      const isComplete = i2 === s2.length;

      steps.push({
        s1,
        s2,
        i1: curI1,
        i2: curI2,
        nextArr,
        foundIndex: isComplete ? curI1 - curI2 : -1,
        matchIndices: [curI1],
        decision: `字符匹配：s1[${curI1}]('${s1[curI1]}') == s2[${curI2}]('${s2[curI2]}') ➔ 双指针同时前进 i1++ (${i1}), i2++ (${i2})`,
        message: isComplete ? `🎉 模式串全部字符成功匹配完成！` : `当前已连续匹配 ${i2} 个字符`,
        log: `match s1[${curI1}] == s2[${curI2}], i1=${i1}, i2=${i2}`,
        codeLine: lines.matchChar,
        metrics: { 'i1 指针': curI1, 'i2 指针': curI2, '当前比对': '字符相同 ✓' },
        statusBadge: isComplete ? { text: '匹配成功', type: 'success' } : undefined,
      });

      if (isComplete) break;
    } else if (nextArr[i2] === -1) {
      // 模式串已经退无可退 (i2 == 0)
      const curI1 = i1;
      i1++;
      steps.push({
        s1,
        s2,
        i1: curI1,
        i2,
        nextArr,
        foundIndex: -1,
        mismatchIndex: curI1,
        decision: `首字符即失配：s1[${curI1}]('${s1[curI1]}') != s2[0]('${s2[0]}') 且 next[${i2}] == -1 ➔ 推进主串指针 i1++ (${i1})`,
        message: '主串当前字符无法作为模式串起点，考察下一个主串位置',
        log: `mismatch at root, advance i1 to ${i1}`,
        codeLine: lines.shiftI1,
        metrics: { 'i1 指针': curI1, 'i2 指针': i2, '当前比对': '首字符不匹配 ✗' },
        statusBadge: { text: '向右平移', type: 'warning' },
      });
    } else {
      // 核心加速：利用 next[i2] 回跳
      const oldI2 = i2;
      const targetI2 = nextArr[i2];
      i2 = targetI2;

      steps.push({
        s1,
        s2,
        i1,
        i2: oldI2,
        nextArr,
        foundIndex: -1,
        mismatchIndex: i1,
        decision: `⚡ 核心回跳：s1[${i1}]('${s1[i1]}') != s2[${oldI2}]('${s2[oldI2]}')！利用 next[${oldI2}]=${targetI2}，模式串指针回跳至 i2=${targetI2}`,
        message: `保持主串指针 i1=${i1} 不动！直接利用前缀匹配段跳过重复检验，时间复杂度从 O(NM) 降至 O(N+M)`,
        log: `mismatch, next jump: i2 from ${oldI2} to ${targetI2}`,
        codeLine: lines.nextJump,
        metrics: { 'i1 指针(不变)': i1, 'i2 回跳': `${oldI2} ➔ ${targetI2}`, '当前比对': 'next 回跳加速' },
        statusBadge: { text: `回跳至 ${targetI2}`, type: 'info' },
      });
    }
  }

  // 终局判定
  const foundIndex = i2 === s2.length ? i1 - i2 : -1;
  steps.push({
    s1,
    s2,
    i1,
    i2,
    nextArr,
    foundIndex,
    decision: foundIndex !== -1
      ? `🏆 匹配成功：首次出现起始下标为 i1 - i2 = ${i1} - ${i2} = ${foundIndex}！返回 ${foundIndex}`
      : `❌ 匹配失败：主串扫描结束，未找到与 s2 完全匹配的子串，返回 -1`,
    message: foundIndex !== -1 ? 'KMP 算法成功完成查找！' : '主串中无此模式串',
    log: `return ${foundIndex}`,
    codeLine: lines.returnAns,
    metrics: { '最终结果': foundIndex !== -1 ? `起始下标 ${foundIndex}` : '未找到 (-1)' },
    statusBadge: foundIndex !== -1 ? { text: `匹配于 [${foundIndex}]`, type: 'success' } : { text: '无解 (-1)', type: 'danger' },
  });

  return steps;
}

export const kmpVisualizer = registerDeclarativeAlgorithm<KmpStep>({
  id: 'kmp-algo',
  name: 'KMP 算法核心原理 (Class 100)',
  category: 'string',
  icon: '⚡',
  difficulty: 2,
  levelOrder: 100,
  learningGoal: '彻底掌握 KMP 线性字符串匹配原理、next 数组最长公共前后缀推导与指针不回退加速机制',
  problemHtml: STRING_100_105_PROBLEMS.kmp.html,
  analysisHtml: STRING_100_105_PROBLEMS.kmp.html,
  inputs: [
    {
      id: 's1',
      label: '主文本串 (s1)',
      type: 'text',
      defaultValue: 'ABABABCABA',
      placeholder: '请输入主文本串',
    },
    {
      id: 's2',
      label: '模式串 (s2)',
      type: 'text',
      defaultValue: 'ABABC',
      placeholder: '请输入模式串',
    },
  ],
  codeLanguages: KMP_CODES,
  generateSteps: (input) => {
    const s1 = String(input.s1 || 'ABABABCABA');
    const s2 = String(input.s2 || 'ABABC');
    return buildKmpSteps(s1, s2);
  },
  renderCanvas: (container, step) => {
    const matchStart = step.foundIndex >= 0 ? step.foundIndex : -1;
    const matchEnd = matchStart >= 0 ? matchStart + step.s2.length - 1 : -1;
    const fullMatches: number[] = [];
    if (matchStart >= 0) {
      for (let k = matchStart; k <= matchEnd; k++) fullMatches.push(k);
    }

    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderCharSequence(
          '主文本串 (Text s1)',
          step.s1,
          step.i1,
          fullMatches,
          step.matchIndices || [],
          step.mismatchIndex !== undefined ? step.mismatchIndex : -1,
          'i1'
        )}

        ${renderCharSequence(
          '模式串 (Pattern s2)',
          step.s2,
          step.i2,
          [],
          step.matchIndices && step.matchIndices.length > 0 ? [step.i2] : [],
          step.mismatchIndex !== undefined && step.mismatchIndex === step.i1 ? step.i2 : -1,
          'i2'
        )}

        ${renderAuxArrayTable('模式串 Next 数组 (最长相等真前后缀长度)', step.s2, step.nextArr, step.i2, 'next[i]')}

        ${renderFormulaCard(
          'KMP 核心加速状态',
          `s1[i1=${step.i1}] ${step.i1 < step.s1.length && step.i2 < step.s2.length ? (step.s1[step.i1] === step.s2[step.i2] ? '==' : '!=') : '⏹️'} s2[i2=${step.i2}] | next[${step.i2}] = ${step.nextArr[step.i2] ?? 'N/A'}`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
