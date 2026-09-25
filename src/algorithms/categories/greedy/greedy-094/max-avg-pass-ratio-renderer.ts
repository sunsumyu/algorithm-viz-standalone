/**
 * 最大平均通过率 (LeetCode 1792) - 声明式教学级沙盘渲染器
 * 核心贪心：边际增量大根堆与聪明学生分配
 */

import { UniversalStageVisualizer } from '../../dynamic-programming/unique-paths-renderer';
import { registerAlgorithm } from '../../../../core/registry';
import { GREEDY_094_PROBLEMS } from './greedy-094-problem-content';
import {
  MAX_AVG_PASS_RATIO_CODES,
  MAX_AVG_PASS_RATIO_LINES,
} from './greedy-094-stage-codes';
import {
  Greedy094Step,
  renderDecisionBalance,
} from './greedy-094-shared';

export interface ClassItem {
  id: number;
  pass: number;
  total: number;
  gain: number;
  ratio: number;
}

export interface MaxAvgPassRatioStep extends Greedy094Step {
  classes: ClassItem[];
  remainingExtra: number;
  assignedClassId?: number;
  avgRatio: number;
}

function calcGain(p: number, t: number): number {
  return (p + 1) / (t + 1) - p / t;
}

export function buildMaxAvgPassRatioSteps(
  classesData: [number, number][],
  extraStudents: number
): MaxAvgPassRatioStep[] {
  const steps: MaxAvgPassRatioStep[] = [];
  const lines = MAX_AVG_PASS_RATIO_LINES;
  const n = classesData.length;

  // Step 0: 入口
  const classList: ClassItem[] = classesData.map(([p, t], i) => ({
    id: i,
    pass: p,
    total: t,
    gain: calcGain(p, t),
    ratio: p / t,
  }));

  const initialAvg = classList.reduce((acc, c) => acc + c.ratio, 0) / n;

  steps.push({
    classes: classList.map(c => ({ ...c })),
    remainingExtra: extraStudents,
    avgRatio: initialAvg,
    decision: `主函数入口：共 ${n} 个班级，有 extraStudents = ${extraStudents} 名聪明学生待分配`,
    message: '核心目标：使得所有班级的平均通过率最大。每个学生带来的增益是 (pass+1)/(total+1) - pass/total',
    log: `enter maxAverageRatio(classes=${JSON.stringify(classesData)}, extraStudents=${extraStudents})`,
    codeLine: lines.entry,
  });

  // Step 1: 初始化大根堆
  steps.push({
    classes: classList.map(c => ({ ...c })),
    remainingExtra: extraStudents,
    avgRatio: initialAvg,
    decision: `建堆完成：按每个班级的边际增益 gain 组织大根堆`,
    message: '增量大的班级优先分配，单位学生贡献率最高',
    log: `heap initialized with ${n} classes`,
    codeLine: lines.initHeap,
  });

  // Step 2: 逐个分配聪明学生
  let remaining = extraStudents;
  const currentList = classList.map(c => ({ ...c }));

  while (remaining > 0) {
    // 选增益最大的班级
    currentList.sort((a, b) => b.gain - a.gain);
    const topClass = currentList[0];
    const prevGain = topClass.gain;

    topClass.pass++;
    topClass.total++;
    topClass.gain = calcGain(topClass.pass, topClass.total);
    topClass.ratio = topClass.pass / topClass.total;

    remaining--;
    const curAvg = currentList.reduce((acc, c) => acc + c.ratio, 0) / n;

    steps.push({
      classes: currentList.map(c => ({ ...c })),
      remainingExtra: remaining,
      assignedClassId: topClass.id,
      avgRatio: curAvg,
      decision: `分配 1 名学生给班级 #${topClass.id}（获得最大边际增益 +${(prevGain * 100).toFixed(3)}%）➔ 新通过情况 ${topClass.pass}/${topClass.total}，剩余学生 ${remaining}`,
      message: `当前总体平均通过率攀升至 ${(curAvg * 100).toFixed(4)}%`,
      log: `assigned to class #${topClass.id}, gain=${prevGain.toFixed(5)}, remaining=${remaining}`,
      codeLine: lines.addStudent,
    });
  }

  // Step 3: 结算收敛
  const finalAvg = currentList.reduce((acc, c) => acc + c.ratio, 0) / n;
  steps.push({
    classes: currentList.map(c => ({ ...c })),
    remainingExtra: 0,
    avgRatio: finalAvg,
    decision: `🎉 所有聪明学生分配完毕！最终最大平均通过率达成：${finalAvg.toFixed(5)}（或 ${(finalAvg * 100).toFixed(3)}%）`,
    message: '大根堆边际增益贪心确保了每一次分配对全局平均值的拉动最大',
    log: `final avg ratio: ${finalAvg}`,
    codeLine: lines.done,
  });

  return steps;
}

const template = `<div id="algo-max-avg-pass-ratio-view" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>`;

export const maxAvgPassRatioRenderer = UniversalStageVisualizer;
export const maxAvgPassRatioVisualizer = UniversalStageVisualizer;

registerAlgorithm({
  id: 'max-avg-pass-ratio',
  name: '最大平均通过率 (Maximum Average Pass Ratio)',
  viewId: 'algo-max-avg-pass-ratio-view',
  category: 'greedy',
  description: 'LeetCode 1792：基于边际增益递减原理与大根堆动态调度的贪心算法',
  icon: '🎓',
  template,
  Visualizer: UniversalStageVisualizer,
  difficulty: 2,
  levelOrder: 943,
  learningGoal: '理解大根堆维护边际增益递减特征的贪心选择策略',
});

export function registerMaxAvgPassRatio(): void {
  // 保持向前兼容导出
}

