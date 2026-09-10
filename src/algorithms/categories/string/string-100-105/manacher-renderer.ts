/**
 * Class 103: Manacher 最长回文子串线性算法
 * 洛谷 P3805 / LeetCode 5
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { STRING_100_105_PROBLEMS } from './string-100-105-problem-content';
import { MANACHER_CODES, MANACHER_LINES } from './string-100-105-stage-codes';
import {
  String100Step,
  renderCharSequence,
  renderAuxArrayTable,
  renderFormulaCard,
} from './string-100-105-shared';

export interface ManacherStep extends String100Step {
  originalStr: string;
  manacherStr: string;
  curI: number;
  centerC: number;
  rightR: number;
  mirrorI: number;
  radiusArr: number[];
  maxLen: number;
  longestPalindrome: string;
}

export function buildManacherString(s: string): string {
  let res = '#';
  for (const ch of s) {
    res += ch + '#';
  }
  return res;
}

export function buildManacherSteps(s: string): ManacherStep[] {
  const steps: ManacherStep[] = [];
  const lines = MANACHER_LINES;

  const t = buildManacherString(s);
  const n = t.length;
  const p = new Array(n).fill(0);

  // Step 0: 入口
  steps.push({
    originalStr: s,
    manacherStr: t,
    curI: 0,
    centerC: -1,
    rightR: -1,
    mirrorI: -1,
    radiusArr: [...p],
    maxLen: 0,
    longestPalindrome: '',
    decision: `主函数入口：接收原始字符串 s="${s}" (长度 ${s.length})`,
    message: '准备启动 Manacher 算法，在 O(N) 线性时间内计算最长回文子串',
    log: `enter manacher(s="${s}")`,
    codeLine: lines.entry,
    metrics: { '原始长': s.length, '最大回文长': 0 },
  });

  // Step 1: 字符预处理
  steps.push({
    originalStr: s,
    manacherStr: t,
    curI: 0,
    centerC: -1,
    rightR: -1,
    mirrorI: -1,
    radiusArr: [...p],
    maxLen: 0,
    longestPalindrome: '',
    decision: `特殊字符预处理：在字符两端及间隔插入 '#'，得到统一奇数长度串 t="${t}" (长度 ${n})`,
    message: '通过占位符将偶数回文与奇数回文统一为以中心向两端对称扩展的模型',
    log: `transformed to "${t}"`,
    codeLine: lines.initStr,
    metrics: { '处理后长': n, '占位符': '#' },
  });

  let C = -1;
  let R = -1;
  let maxRadius = 0;
  let bestCenter = 0;

  for (let i = 0; i < n; i++) {
    const mirrorI = 2 * C - i;
    const initialRadius = R > i ? Math.min(p[mirrorI], R - i) : 1;
    p[i] = initialRadius;

    // 镜像加速步
    if (R > i) {
      steps.push({
        originalStr: s,
        manacherStr: t,
        curI: i,
        centerC: C,
        rightR: R,
        mirrorI,
        radiusArr: [...p],
        maxLen: Math.max(0, maxRadius - 1),
        longestPalindrome: '',
        decision: `⚡ 镜像加速：当前 i=${i} < R(${R})，中心 C=${C}，对应对称点 i'=2*C-i=${mirrorI}。利用已知 p[${mirrorI}]=${p[mirrorI]}，直接继承半径 min(p[i'], R-i) = ${initialRadius}`,
        message: '无需从 1 重新比对，直接获得已知对称区间，避免重复计算',
        log: `mirror inherit at i=${i}, radius=${initialRadius}`,
        codeLine: lines.mirrorOpt,
        metrics: { '中心 C': C, '右界 R': R, '当前 i': i, '镜像 i\'': mirrorI },
        statusBadge: { text: `镜像继承 ${initialRadius}`, type: 'info' },
      });
    }

    // 暴力外扩
    let expanded = false;
    while (i + p[i] < n && i - p[i] >= 0 && t[i + p[i]] === t[i - p[i]]) {
      p[i]++;
      expanded = true;
    }

    if (expanded) {
      steps.push({
        originalStr: s,
        manacherStr: t,
        curI: i,
        centerC: C,
        rightR: R,
        mirrorI,
        radiusArr: [...p],
        maxLen: Math.max(0, maxRadius - 1),
        longestPalindrome: '',
        decision: `暴力外扩：以 i=${i} ('${t[i]}') 为中心向外比对成功，最终回文半径定格为 p[${i}]=${p[i]}`,
        message: `在处理后串中覆盖区间 [${i - p[i] + 1}..${i + p[i] - 1}]`,
        log: `expanded p[${i}]=${p[i]}`,
        codeLine: lines.expand,
        metrics: { '当前 i': i, '最终半径 p[i]': p[i] },
        statusBadge: { text: `半径 ${p[i]}`, type: 'warning' },
      });
    }

    // 更新 C 和 R
    if (i + p[i] > R) {
      C = i;
      R = i + p[i];
      steps.push({
        originalStr: s,
        manacherStr: t,
        curI: i,
        centerC: C,
        rightR: R,
        mirrorI,
        radiusArr: [...p],
        maxLen: Math.max(0, maxRadius - 1),
        longestPalindrome: '',
        decision: `🚀 更新回文边界：i + p[i] = ${i + p[i]} 超过了原右边界 R，更新对称中心 C=${C}，最右边界 R=${R}`,
        message: '右边界不断向右推移，且每个字符作为 R 仅推进一次，保证严密的 O(N) 线性时间',
        log: `update C=${C}, R=${R}`,
        codeLine: lines.updateCR,
        metrics: { '新中心 C': C, '新右界 R': R },
        statusBadge: { text: `推移边界 R=${R}`, type: 'info' },
      });
    }

    if (p[i] > maxRadius) {
      maxRadius = p[i];
      bestCenter = i;
    }
  }

  // 终局提取最长回文子串
  const maxLen = maxRadius - 1;
  const startInT = bestCenter - maxRadius + 1;
  const endInT = bestCenter + maxRadius - 1;
  const subInT = t.slice(startInT, endInT + 1);
  const longestPalindrome = subInT.replace(/#/g, '');

  steps.push({
    originalStr: s,
    manacherStr: t,
    curI: bestCenter,
    centerC: C,
    rightR: R,
    mirrorI: -1,
    radiusArr: [...p],
    maxLen,
    longestPalindrome,
    decision: `🏆 算法完成：最大回文半径为 max(p)=${maxRadius}，对应原串最长回文长度为 max(p)-1 = ${maxLen}！最长回文子串为 "${longestPalindrome}"`,
    message: `返回最长长度 ${maxLen}`,
    log: `return maxLen=${maxLen}, sub="${longestPalindrome}"`,
    codeLine: lines.returnAns,
    metrics: { '最长回文长度': maxLen, '最长回文子串': longestPalindrome },
    statusBadge: { text: `最长回文: "${longestPalindrome}"`, type: 'success' },
  });

  return steps;
}

export const manacherVisualizer = registerDeclarativeAlgorithm<ManacherStep>({
  id: 'manacher-algo',
  name: 'Manacher 最长回文子串算法 (Class 103)',
  category: 'string',
  icon: '🪞',
  difficulty: 2,
  levelOrder: 103,
  learningGoal: '掌握特殊占位符转化、对称中心 C 与右边界 R 维护、以及利用镜像点 i\' 的 O(1) 继承与 O(N) 线性时间证明',
  problemHtml: STRING_100_105_PROBLEMS.manacher.html,
  analysisHtml: STRING_100_105_PROBLEMS.manacher.html,
  inputs: [
    {
      id: 's',
      label: '输入字符串 (s)',
      type: 'text',
      defaultValue: 'babad',
      placeholder: '请输入测试字符串，如 babad 或 abacaba',
    },
  ],
  codeLanguages: MANACHER_CODES,
  generateSteps: (input) => {
    const s = String(input.s || 'babad');
    return buildManacherSteps(s);
  },
  renderCanvas: (container, step) => {
    const activeIndices: number[] = [];
    if (step.curI >= 0 && step.radiusArr[step.curI] > 0) {
      const rad = step.radiusArr[step.curI];
      for (let k = step.curI - rad + 1; k <= step.curI + rad - 1; k++) {
        if (k >= 0 && k < step.manacherStr.length) activeIndices.push(k);
      }
    }

    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderCharSequence(
          '预处理串 (含 # 占位符)',
          step.manacherStr,
          step.curI,
          activeIndices,
          step.mirrorI >= 0 ? [step.mirrorI] : [],
          -1,
          'i'
        )}

        ${renderAuxArrayTable('回文半径数组 (p 数组)', step.manacherStr, step.radiusArr, step.curI, 'p[i]')}

        ${renderFormulaCard(
          'Manacher 几何镜面对称状态',
          `当前位置 i=${step.curI} | 回文中心 C=${step.centerC} | 右边界 R=${step.rightR} | 对称点 i'=${step.mirrorI >= 0 ? step.mirrorI : '无'} | 原串最长回文: "${step.longestPalindrome || '求解中'}"`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
