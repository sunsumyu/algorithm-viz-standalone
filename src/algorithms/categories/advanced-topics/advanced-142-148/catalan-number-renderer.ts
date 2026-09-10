/**
 * Class 147: 卡特兰数与格路计数 (Catalan Number & Lattice Path)
 * 洛谷 P1044 [NOIP2003 普及组] 栈 / 洛谷 P1976 鸡蛋饼
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_142_148_PROBLEMS } from './advanced-142-148-problem-content';
import { CATALAN_NUMBER_CODES, CATALAN_NUMBER_LINES } from './advanced-142-148-stage-codes';
import { Advanced142Step, renderCatalanBoard } from './advanced-142-148-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface CatalanStep extends Advanced142Step {
  n: number;
  curI: number;
  catalanList: number[];
}

export function buildCatalanSteps(n: number): CatalanStep[] {
  const steps: CatalanStep[] = [];
  const lines = CATALAN_NUMBER_LINES;

  const c = new Array(n + 1).fill(0);
  const cloneC = () => [...c];

  // Step 0: 入口
  steps.push({
    n,
    curI: -1,
    catalanList: cloneC(),
    decision: `主函数入口：开始计算第 ${n} 项卡特兰数 C(${n})`,
    message: `卡特兰数是组合数学中极其重要的数列，广泛出现于进出栈序列、二叉树形态、凸多边形三角剖分与不穿过对角线的格路走法中`,
    log: `enter getCatalan(n=${n})`,
    codeLine: lines.entry,
    metrics: { '目标项数 N': n, '递推公式': 'C(n) = C(n-1) * (4n - 2) / (n + 1)' },
  });

  // Step 1: 初始化基底
  c[0] = 1;
  steps.push({
    n,
    curI: 0,
    catalanList: cloneC(),
    decision: `初始化基底项：C(0) = 1 (空树或空路径定义为 1 种有效状态)`,
    message: `为后续基于递推式的分数整除累乘打下基础`,
    log: `initZero: c[0]=1`,
    codeLine: lines.initZero,
    metrics: { 'C(0)': 1, '当前递推项': 0 },
  });

  // Step 2: 线性递推计算
  for (let i = 1; i <= n; i++) {
    const factor = (4 * i - 2);
    const divisor = (i + 1);
    c[i] = Math.floor((c[i - 1] * factor) / divisor);

    steps.push({
      n,
      curI: i,
      catalanList: cloneC(),
      decision: `递推计算第 ${i} 项：C(${i}) = C(${i - 1}) &times; (4&times;${i} - 2) / (${i} + 1) = ${c[i - 1]} &times; ${factor} / ${divisor} = ${c[i]}`,
      message: `由通项公式 C(n) = (1 / (n + 1)) * C(2n, n) 提取公因式推导出的 O(1) 单步转移，整除性恒成立`,
      log: `stepRecur: i=${i}, factor=${factor}, divisor=${divisor}, c[${i}]=${c[i]}`,
      codeLine: lines.stepRecur,
      metrics: { '当前项 i': i, '乘数因子': factor, '除数因子': divisor, '新计算卡特兰数': c[i] },
    });
  }

  // Step 3: 终态返回
  steps.push({
    n,
    curI: n,
    catalanList: cloneC(),
    decision: `🎉 计算完成：第 ${n} 项卡特兰数 C(${n}) = ${c[n]}`,
    message: `格路计数对应从 (0, 0) 走到 (n, n) 且不越过对角线 y = x 的非降路径条数，折线反射法 C(2n, n) - C(2n, n-1) = ${c[n]}`,
    log: `returnAns: c[${n}]=${c[n]}`,
    codeLine: lines.returnAns,
    statusBadge: { text: `C(${n}) = ${c[n]}`, type: 'success' },
    metrics: { '最终结果': c[n], '出栈序列种数': c[n], '合法括号序列数': c[n] },
  });

  return steps;
}

export const catalanNumberVisualizer = registerDeclarativeAlgorithm<CatalanStep>({
  id: 'catalan-number-147',
  name: '卡特兰数与格路计数 (Class 147)',
  category: 'math',
  icon: '📈',
  difficulty: 2,
  levelOrder: 147,
  description: '左程云算法通关课 Class 147：卡特兰数题型详解与折线法。解析栈混洗、括号匹配、二叉树计数与 Dyck 格路模型，演示 O(N) 线性递推计算。',
  learningGoal: '理解卡特兰数通项与折线反射映射法，掌握格路非降路径计数模型与 O(N) 线性递推',
  problemHtml: ADVANCED_142_148_PROBLEMS.catalanNumber.html,
  analysisHtml: ADVANCED_142_148_PROBLEMS.catalanNumber.html,
  inputs: [
    {
      id: 'n',
      label: '卡特兰数规模 N (1 ~ 12)',
      type: 'number',
      defaultValue: 5,
    },
  ],
  codeLanguages: CATALAN_NUMBER_CODES,
  generateSteps: (input) => {
    const n = Math.max(1, Math.min(12, Number(input.n ?? 5)));
    return buildCatalanSteps(n);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderCatalanBoard(step.n, step.catalanList, step.curI)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前求解项数</div>
            <div style="font-size: 18px; font-weight: 700; color: #4338ca;">C(${step.curI >= 0 ? step.curI : 0})</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">对应卡特兰数值</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669;">
              ${step.curI >= 0 ? step.catalanList[step.curI] : 1}
            </div>
          </div>
        </div>

        ${renderFormulaCard(
          '卡特兰数与格路反射引擎',
          `通项公式: C(n) = C(2n, n) / (n + 1) | 折线法非法路径映射: C(2n, n - 1)`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
