/**
 * Class 104: 扩展 KMP (Z 算法 / Z-Algorithm)
 * 洛谷 P5410
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { STRING_100_105_PROBLEMS } from './string-100-105-problem-content';
import { Z_ALGORITHM_CODES, Z_ALGORITHM_LINES } from './string-100-105-stage-codes';
import {
  String100Step,
  renderCharSequence,
  renderAuxArrayTable,
  renderFormulaCard,
} from './string-100-105-shared';

export interface ZAlgorithmStep extends String100Step {
  s: string;
  n: number;
  curI: number;
  boxC: number;
  boxR: number;
  zArr: number[];
}

export function buildZAlgorithmSteps(s: string): ZAlgorithmStep[] {
  const steps: ZAlgorithmStep[] = [];
  const lines = Z_ALGORITHM_LINES;
  const n = s.length;
  const z = new Array(n).fill(0);

  // Step 0: 入口
  steps.push({
    s,
    n,
    curI: 0,
    boxC: 0,
    boxR: 0,
    zArr: [...z],
    decision: `主函数入口：接收待分析字符串 s="${s}" (长 ${n})`,
    message: '准备启动 Z 算法，在严格 O(N) 线性时间内求每个后缀与前缀的最长公共前缀 (z[i])',
    log: `enter zAlgorithm(s="${s}")`,
    codeLine: lines.entry,
    metrics: { '字符串长度': n, '当前状态': '准备就绪' },
  });

  if (n === 0) return steps;

  // Step 1: z[0] 初始化为 n
  z[0] = n;
  steps.push({
    s,
    n,
    curI: 0,
    boxC: 0,
    boxR: 0,
    zArr: [...z],
    decision: `基底初始化：z[0] = ${n}，整个字符串与自身的 LCP 为自身长度`,
    message: '从 i=1 开始维护匹配盒 [c, r]',
    log: `z[0] = ${n}`,
    codeLine: lines.initArr,
    metrics: { 'z[0]': n, 'Z 盒': '未激活' },
  });

  let c = 1;
  let r = 1;

  for (let i = 1; i < n; i++) {
    const inheritedLen = r > i ? Math.min(r - i, z[i - c]) : 0;
    let len = inheritedLen;

    // Z-box 加速步
    if (r > i) {
      steps.push({
        s,
        n,
        curI: i,
        boxC: c,
        boxR: r,
        zArr: [...z],
        decision: `⚡ Z 盒匹配加速：i=${i} 位于当前匹配盒 [${c}..${r}] 内部！对应盒内相对位 i-c=${i - c}，直接继承 min(r - i, z[${i - c}]) = ${len}`,
        message: '直接利用先前已匹配的子串信息，无需从头比对',
        log: `z-box inherit at i=${i}, len=${len}`,
        codeLine: lines.zBoxOpt,
        metrics: { '盒左界 c': c, '盒右界 r': r, '继承长度': len },
        statusBadge: { text: `盒内继承 ${len}`, type: 'info' },
      });
    }

    // 暴力外扩
    let expanded = false;
    while (i + len < n && s[i + len] === s[len]) {
      len++;
      expanded = true;
    }

    if (expanded) {
      steps.push({
        s,
        n,
        curI: i,
        boxC: c,
        boxR: r,
        zArr: [...z],
        decision: `向外拓展比对：后缀 s[${i}..] 与前缀 s 继续比对成功，最终 LCP 长度延展至 len=${len}`,
        message: `s[${i}..${i + len - 1}] == s[0..${len - 1}]`,
        log: `expanded at i=${i} to len=${len}`,
        codeLine: lines.expand,
        metrics: { '当前 i': i, '已匹配长': len },
        statusBadge: { text: `外扩匹配 ${len}`, type: 'warning' },
      });
    }

    // 更新 Z-box
    if (i + len > r) {
      c = i;
      r = i + len;
      steps.push({
        s,
        n,
        curI: i,
        boxC: c,
        boxR: r,
        zArr: [...z],
        decision: `🚀 更新 Z 盒区间：当前右侧到达点 i+len=${i + len} 突破原右边界，更新匹配盒为 [c=${c}..r=${r}]`,
        message: '匹配盒向右推进，右边界单调递增保证严格线性复杂度',
        log: `update z-box: [${c}, ${r}]`,
        codeLine: lines.updateBox,
        metrics: { '新盒左界 c': c, '新盒右界 r': r },
        statusBadge: { text: `盒推移至 ${r}`, type: 'info' },
      });
    }

    z[i] = len;
  }

  // Step End: 终局
  steps.push({
    s,
    n,
    curI: n - 1,
    boxC: c,
    boxR: r,
    zArr: [...z],
    decision: `🏆 算法完成：Z 数组全量生成完成：[${z.join(', ')}]！`,
    message: '各后缀与前缀的最长公共前缀已全部以 O(1) 形式提取完毕',
    log: `zAlgorithm done: [${z.join(', ')}]`,
    codeLine: lines.returnAns,
    metrics: { '最终 Z 数组': z.join(', ') },
    statusBadge: { text: '计算完成', type: 'success' },
  });

  return steps;
}

export const zAlgorithmVisualizer = registerDeclarativeAlgorithm<ZAlgorithmStep>({
  id: 'z-algorithm',
  name: '扩展 KMP / Z 算法 (Class 104)',
  category: 'string',
  icon: '📦',
  difficulty: 2,
  levelOrder: 104,
  learningGoal: '理解 Z-Box 匹配盒机制、后缀与前缀 LCP 的线性递推原理及其与 KMP、Manacher 的对偶设计思想',
  problemHtml: STRING_100_105_PROBLEMS.zAlgorithm.html,
  analysisHtml: STRING_100_105_PROBLEMS.zAlgorithm.html,
  inputs: [
    {
      id: 's',
      label: '输入字符串 (s)',
      type: 'text',
      defaultValue: 'abacaba',
      placeholder: '请输入待计算 Z 数组的字符串',
    },
  ],
  codeLanguages: Z_ALGORITHM_CODES,
  generateSteps: (input) => {
    const s = String(input.s || 'abacaba');
    return buildZAlgorithmSteps(s);
  },
  renderCanvas: (container, step) => {
    const boxIndices: number[] = [];
    if (step.boxR > step.boxC) {
      for (let k = step.boxC; k < step.boxR && k < step.n; k++) {
        boxIndices.push(k);
      }
    }

    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderCharSequence(
          '输入字符串 (String s)',
          step.s,
          step.curI,
          boxIndices,
          [],
          -1,
          '当前后缀起点'
        )}

        ${renderAuxArrayTable('Z 数组 (各个后缀与原串的最长公共前缀 LCP)', step.s, step.zArr, step.curI, 'z[i]')}

        ${renderFormulaCard(
          'Z 盒 (Z-Box) 动态状态',
          `当前位置 i=${step.curI} | Z 盒区间: [c=${step.boxC} .. r=${step.boxR}] | 继承长度: min(r - i, z[i - c]) | 最终 z[${step.curI}] = ${step.zArr[step.curI] ?? 0}`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
