/**
 * Class 183: CDQ 分治 (CDQ Divide & Conquer)
 * 三维偏序 (陌上花开) + 归并排序 + 树状数组统计 / 洛谷 P3810 【模板】三维偏序
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_179_184_PROBLEMS } from './advanced-179-184-problem-content';
import { CDQ_DIVIDE_CODES, CDQ_DIVIDE_LINES } from './advanced-179-184-stage-codes';
import { Advanced179Step, CDQPointView, renderCDQDivideBoard } from './advanced-179-184-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface CDQDivideStep extends Advanced179Step {
  points: CDQPointView[];
  l: number;
  r: number;
  mid: number;
  stage: string;
}

export function buildCDQDivideSteps(): CDQDivideStep[] {
  const steps: CDQDivideStep[] = [];
  const lines = CDQ_DIVIDE_LINES;

  const points: CDQPointView[] = [
    { id: 1, a: 1, b: 2, c: 3, ans: 0 },
    { id: 2, a: 2, b: 4, c: 2, ans: 0 },
    { id: 3, a: 3, b: 1, c: 5, ans: 0 },
    { id: 4, a: 4, b: 3, c: 4, ans: 0 },
  ];

  // Step 0: 入口帧
  steps.push({
    points: points.map(p => ({ ...p })),
    l: 1,
    r: 4,
    mid: 2,
    stage: '分治开始：三维偏序初始化',
    decision: `主函数入口：开始对 4 个三维空间点进行偏序统计 (统计有多少点同时满足 a_j <= a_i, b_j <= b_i, c_j <= c_i)`,
    message: `第 1 维 a 已在全局预排序；CDQ 分治递归利用归并排序解决第 2 维 b，利用树状数组动态维护第 3 维 c`,
    log: `enter cdq divide: n=4, l=1, r=4`,
    codeLine: lines.entry,
    metrics: { '点总数': 4, '第一维有序': '已排序', '分治区间': '[1, 4]' },
  });

  // Step 1: 递归子区间 [1, 2] 与 [3, 4]
  steps.push({
    points: points.map(p => ({ ...p })),
    l: 1,
    r: 4,
    mid: 2,
    stage: '递归子区间求解内部偏序',
    decision: `递归执行 cdq(1, 2) 与 cdq(3, 4)，已分别计算完各自子区间内部的点对偏序贡献`,
    message: `当前核心任务：计算左半区 [1, 2] 的点作为被支配点，对右半区 [3, 4] 各点的偏序贡献`,
    log: `cdq recursive subproblems solved: [1, 2] and [3, 4]`,
    codeLine: lines.recurseSub,
    statusBadge: { text: '子问题递归完成', type: 'info' },
    metrics: { '左半区': '[1, 2]', '右半区': '[3, 4]', '分治中点': 2 },
  });

  // Step 2: 双指针扫描，左区点插入树状数组维护维度 c
  const pointsAfterP1 = points.map(p => ({ ...p }));
  pointsAfterP1[3].ans += 1;

  steps.push({
    points: pointsAfterP1,
    l: 1,
    r: 4,
    mid: 2,
    stage: '归并双指针：左区插入树状数组，右区查询贡献',
    decision: `归并处理到右区点 P4(4, 3, 4)：左区满足 b <= 3 的点有 P1(1, 2, 3)，其 c=3 已插入树状数组`,
    message: `P4 在树状数组中查询 query(c=4)，得到 P1 满足全部三个维度条件 (a:1<=4, b:2<=3, c:3<=4)，P4.ans 累加 1`,
    log: `merge: P4 queried BIT(c=4), ans +1 from P1`,
    codeLine: lines.queryBIT,
    statusBadge: { text: 'P4 偏序贡献 +1', type: 'success' },
    metrics: { '受贡献点': 'P4', '贡献来源': 'P1', '当前偏序值': 1 },
  });

  // Step 3: 清空树状数组
  steps.push({
    points: pointsAfterP1,
    l: 1,
    r: 4,
    mid: 2,
    stage: '清理树状数组历史修改',
    decision: `归并扫描完毕，通过 bit.add(pts[p].c, -1) 将之前插入的左区元素精确清空`,
    message: `清空复杂度严格等于插入次数，避免每次 memset 整棵树状数组导致 O(K) 恶化`,
    log: `clean bit: restored all inserted elements`,
    codeLine: lines.cleanBIT,
    statusBadge: { text: '树状数组精准清空', type: 'info' },
    metrics: { '清空操作数': 1, '空间维护代价': 'O(1)' },
  });

  // Step 4: 完成归并与输出结果
  steps.push({
    points: pointsAfterP1,
    l: 1,
    r: 4,
    mid: 2,
    stage: 'CDQ 分治完成',
    decision: `🎉 CDQ 分治全流程结束：4 个点的三维偏序贡献计算完成`,
    message: `CDQ 分治将多维偏序降维打击，时间复杂度为 O(N log^2 N)，比单纯高维树套树代码量更精炼且常数极小`,
    log: `cdq divide finished: ans=[0, 0, 0, 1]`,
    codeLine: lines.entry,
    statusBadge: { text: '偏序统计完成', type: 'success' },
    metrics: { '最高偏序值': 1, '算法复杂度': 'O(N log^2 N)', '状态': '求解完成' },
  });

  return steps;
}

export const cdqDivideVisualizer = registerDeclarativeAlgorithm<CDQDivideStep>({
  id: 'cdq-divide-183',
  name: 'CDQ 分治 (CDQ Divide & Conquer / Class 183)',
  category: 'search',
  icon: '🎯',
  difficulty: 3,
  levelOrder: 183,
  description: '左程云算法通关课 Class 183：CDQ 分治 (CDQ Divide & Conquer)。三维偏序陌上花开，第一维排序+第二维归并+第三维树状数组统计，降维解决多维空间偏序。',
  learningGoal: '掌握 CDQ 分治计算左区间对右区间贡献的思想、双指针归并排序与树状数组动态维护',
  problemHtml: ADVANCED_179_184_PROBLEMS.cdqDivide.html,
  analysisHtml: ADVANCED_179_184_PROBLEMS.cdqDivide.html,
  inputs: [
    {
      id: 'preset',
      label: '三维点集预设',
      type: 'select',
      defaultValue: 'points_4',
      options: [
        { label: '4 点三维偏序测试集', value: 'points_4' },
      ],
    },
  ],
  codeLanguages: CDQ_DIVIDE_CODES,
  generateSteps: () => buildCDQDivideSteps(),
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        ${renderCDQDivideBoard(
          step.points,
          step.l,
          step.r,
          step.mid,
          step.stage
        )}

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
            <div style="font-size: 17px; font-weight: 700; color: #7e22ce;">${step.stage}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
            <div style="font-size: 11px; color: #64748b;">偏序降维技巧</div>
            <div style="font-size: 15px; font-weight: 700; color: #059669;">第一维排序 + 归并第二维 + 树状数组第三维</div>
          </div>
        </div>

        ${renderFormulaCard(
          '三维偏序 CDQ 降维法',
          '第 1 维: 全局排序 => 第 2 维: 归并排序 => 第 3 维: 树状数组维护',
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
