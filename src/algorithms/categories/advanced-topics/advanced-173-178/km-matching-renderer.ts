/**
 * Class 176: 二分图最大权完美匹配 KM 算法 (Kuhn-Munkres)
 * 顶标理论与相等子图 / 洛谷 P6577 【模板】二分图最大权完美匹配
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_173_178_PROBLEMS } from './advanced-173-178-problem-content';
import { KM_MATCHING_CODES, KM_MATCHING_LINES } from './advanced-173-178-stage-codes';
import { Advanced173Step, renderKMBoard } from './advanced-173-178-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface KMStep extends Advanced173Step {
  n: number;
  w: number[][];
  lx: number[];
  ly: number[];
  matchRight: number[];
  totalWeight: number;
  stage: string;
}

export function buildKMSteps(): KMStep[] {
  const steps: KMStep[] = [];
  const lines = KM_MATCHING_LINES;

  const n = 3;
  const w = [
    [3, 5, 5],
    [4, 4, 3],
    [5, 6, 4],
  ];

  let lx = [0, 0, 0];
  let ly = [0, 0, 0];
  let match = [-1, -1, -1];

  // Step 0: 入口帧
  steps.push({
    n,
    w,
    lx: [...lx],
    ly: [...ly],
    matchRight: [...match],
    totalWeight: 0,
    stage: '准备带权二分图',
    decision: `主函数入口：准备在 ${n}x${n} 带权完全二分图中寻找最大权完美匹配`,
    message: `权值矩阵：U0=[3,5,5], U1=[4,4,3], U2=[5,6,4]，基于顶标理论 Lx[i] + Ly[j] >= W[i][j] 维护相等子图`,
    log: `enter km: n=3`,
    codeLine: lines.entry,
    metrics: { '规模 N': n, '权值总条数': n * n, '算法复杂度': 'O(N^3)' },
  });

  // Step 1: 顶标初始化 Lx[i] = max W[i][j], Ly[j] = 0
  lx = [5, 4, 6];
  steps.push({
    n,
    w,
    lx: [...lx],
    ly: [...ly],
    matchRight: [...match],
    totalWeight: 0,
    stage: '顶标可行化初始化',
    decision: `顶标初始化：左部顶标取所属行最大权重 Lx=[5, 4, 6]，右部顶标 Ly=[0, 0, 0]`,
    message: `保证对所有边严格满足可行性准则 Lx[i] + Ly[j] >= W[i][j]，相等子图边满足等号`,
    log: `initLabel: lx=[5,4,6], ly=[0,0,0]`,
    codeLine: lines.initLabel,
    statusBadge: { text: '可行顶标建立', type: 'info' },
    metrics: { '左部顶标和': 15, '右部顶标和': 0 },
  });

  // Step 2: 为 U0 增广 (直连 V1)
  match[1] = 0;
  steps.push({
    n,
    w,
    lx: [...lx],
    ly: [...ly],
    matchRight: [...match],
    totalWeight: 5,
    stage: '为左部点 U0 匹配',
    decision: `U0 在相等子图中找到可行边 (U0, V1) [Lx+Ly=5+0=5=W]，成功匹配 U0 <-> V1`,
    message: `当前累计匹配权值 5`,
    log: `augLoop: u=0 -> v=1`,
    codeLine: lines.augLoop,
    statusBadge: { text: 'U0 <-> V1 (权值 5)', type: 'info' },
    metrics: { '当前权值和': 5, '当前匹配边': 1 },
  });

  // Step 3: 为 U1 增广 (直连 V0)
  match[0] = 1;
  steps.push({
    n,
    w,
    lx: [...lx],
    ly: [...ly],
    matchRight: [...match],
    totalWeight: 9,
    stage: '为左部点 U1 匹配',
    decision: `U1 在相等子图中找到可行边 (U1, V0) [Lx+Ly=4+0=4=W]，成功匹配 U1 <-> V0`,
    message: `当前累计匹配权值 5 + 4 = 9`,
    log: `augLoop: u=1 -> v=0`,
    codeLine: lines.augLoop,
    statusBadge: { text: 'U1 <-> V0 (权值 4)', type: 'info' },
    metrics: { '当前权值和': 9, '当前匹配边': 2 },
  });

  // Step 4: 为 U2 增广 (交替腾挪：U2 争 V1，U0 挪至 V2)
  match[2] = 0; // U0 挪到 V2 (W=5)
  match[1] = 2; // U2 拿到 V1 (W=6)
  steps.push({
    n,
    w,
    lx: [...lx],
    ly: [...ly],
    matchRight: [...match],
    totalWeight: 15,
    stage: '为左部点 U2 匹配 (相等子图内增广翻转)',
    decision: `U2 争夺 V1 (Lx+Ly=6+0=6=W) &rarr; U0 腾挪至另一条相等边 V2 (Lx+Ly=5+0=5=W) 成功！`,
    message: `达成完美匹配：U0-V2 (权5), U1-V0 (权4), U2-V1 (权6)，权值总和 15 恰好等于总顶标和！`,
    log: `augLoop: u=2 -> v=1, u=0 -> v=2`,
    codeLine: lines.augLoop,
    statusBadge: { text: '完美匹配达成 (权值 15)', type: 'success' },
    metrics: { '当前权值和': 15, '对偶最优性': '总权值等于顶标和' },
  });

  // Step 5: 终态返回
  steps.push({
    n,
    w,
    lx: [...lx],
    ly: [...ly],
    matchRight: [...match],
    totalWeight: 15,
    stage: 'KM 求解全部完成',
    decision: `🎉 KM 算法计算完成：二分图最大权完美匹配总权值为 15`,
    message: `根据线性规划对偶理论，最大匹配权和等于最小顶标和 sum(Lx) + sum(Ly) = 15，全局最优性成立`,
    log: `returnAns: totalWeight=15`,
    codeLine: lines.returnAns,
    statusBadge: { text: 'MaxWeight = 15', type: 'success' },
    metrics: { '最大权值和': 15, '对偶定理证明': '全局最优' },
  });

  return steps;
}

export const kmMatchingVisualizer = registerDeclarativeAlgorithm<KMStep>({
  id: 'km-matching-176',
  name: '二分图最大权完美匹配 KM 算法 (Class 176)',
  category: 'graph',
  icon: '⚖️',
  difficulty: 3,
  levelOrder: 176,
  description: '左程云算法通关课 Class 176：二分图最大权完美匹配 KM 算法 (Kuhn-Munkres)。顶标维护 Lx + Ly >= W，相等子图寻找增广轨，O(N^3) 极速求出最大权重。',
  learningGoal: '掌握顶标可行性准则与相等子图增广机制，深刻理解最小松弛量 slack 调整顶标打破僵局的对偶优化思想',
  problemHtml: ADVANCED_173_178_PROBLEMS.kmMatching.html,
  analysisHtml: ADVANCED_173_178_PROBLEMS.kmMatching.html,
  inputs: [
    {
      id: 'preset',
      label: '带权完全二分图矩阵',
      type: 'select',
      defaultValue: 'matrix_3x3',
      options: [
        { label: '3x3 带权完全二分图 (最优权值: 15)', value: 'matrix_3x3' },
      ],
    },
  ],
  codeLanguages: KM_MATCHING_CODES,
  generateSteps: () => buildKMSteps(),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderKMBoard(step.n, step.w, step.lx, step.ly, step.matchRight, step.totalWeight, step.stage)}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
            <div style="font-size: 17px; font-weight: 700; color: #be185d;">${step.stage}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">线性规划对偶</div>
            <div style="font-size: 15px; font-weight: 700; color: #059669;">&sum; W = &sum; Lx + &sum; Ly</div>
          </div>
        </div>

        ${renderFormulaCard(
          'KM 算法顶标理论与相等子图',
          `可行顶标: Lx[i] + Ly[j] &ge; W[i][j] | 相等边: Lx[i] + Ly[j] = W[i][j] | 松弛量调整: &Delta; = min(Lx + Ly - W), Lx -= &Delta;, Ly += &Delta;`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
