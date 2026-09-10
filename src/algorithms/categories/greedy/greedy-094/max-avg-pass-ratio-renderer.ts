/**
 * 最大平均通过率 (LeetCode 1792) - 声明式教学级沙盘渲染器
 * 核心贪心：边际增量大根堆与聪明学生分配
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
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

export const maxAvgPassRatioVisualizer = registerDeclarativeAlgorithm<MaxAvgPassRatioStep>({
  id: 'max-avg-pass-ratio',
  name: '最大平均通过率 (Maximum Average Pass Ratio)',
  category: 'greedy',
  icon: '🎓',
  difficulty: 2,
  levelOrder: 943,
  learningGoal: '理解大根堆维护边际增益递减特征的贪心选择策略',
  problemHtml: GREEDY_094_PROBLEMS.maxAvgPassRatio.html,
  analysisHtml: GREEDY_094_PROBLEMS.maxAvgPassRatio.html,
  inputs: [
    {
      id: 'input-classes',
      label: '班级情况 (pass,total 分号隔开)',
      type: 'text',
      defaultValue: '1,2; 3,5; 2,2',
      placeholder: '1,2; 3,5; 2,2',
    },
    {
      id: 'input-extra',
      label: '额外学生数',
      type: 'text',
      defaultValue: '2',
      placeholder: '2',
    },
  ],
  codeLanguages: MAX_AVG_PASS_RATIO_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const rawClasses = String(inputs?.['input-classes'] || '1,2; 3,5; 2,2');
    const extra = Math.max(0, parseInt(String(inputs?.['input-extra'] || '2'), 10) || 0);
    const classes = rawClasses.split(';').map((pair) => {
      const parts = pair.trim().split(',').map((s) => parseInt(s.trim(), 10));
      return [parts[0] || 0, parts[1] || 1] as [number, number];
    }).filter(([p, t]) => t > 0);
    return buildMaxAvgPassRatioSteps(classes, extra);
  },
  renderCanvas: (stageContainer: HTMLElement, step: MaxAvgPassRatioStep) => {
    stageContainer.innerHTML = '';

    const mainCard = document.createElement('div');
    mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 顶部状态条
    mainCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="display: flex; gap: 8px; align-items: center;">
          <span style="font-weight: 700; font-size: 13px; color: #1e293b;">剩余聪明学生:</span>
          <span style="font-size: 12px; padding: 2px 6px; border-radius: 4px; background: #eff6ff; color: #1d4ed8; font-family: 'JetBrains Mono', monospace; font-weight: 800;">${step.remainingExtra} 人</span>
        </div>
        <div style="display: flex; gap: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; align-items: center;">
          <span style="color: #64748b;">当前全校平均通过率:</span>
          <span style="color: #059669; font-weight: 800; font-size: 16px;">${(step.avgRatio * 100).toFixed(3)}%</span>
        </div>
      </div>
    `;

    // 班级卡片网格
    const classBox = document.createElement('div');
    classBox.style.cssText = 'flex: 1; display: flex; flex-direction: column; gap: 8px; padding: 12px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow-y: auto;';

    const title = document.createElement('div');
    title.style.cssText = 'font-size: 12px; font-weight: 700; color: #475569;';
    title.textContent = '🏫 各班级边际增益看板 (按边际增益从高到低排序，堆顶居首)';
    classBox.appendChild(title);

    const listContainer = document.createElement('div');
    listContainer.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 10px;';

    step.classes.forEach((c) => {
      const isAssigned = step.assignedClassId === c.id;
      const border = isAssigned ? '#10b981' : '#e2e8f0';
      const bg = isAssigned ? '#ecfdf5' : '#f8fafc';

      const card = document.createElement('div');
      card.style.cssText = `padding: 10px; border-radius: 6px; border: 1.5px solid ${border}; background: ${bg}; display: flex; flex-direction: column; gap: 4px; font-family: 'JetBrains Mono', monospace; font-size: 11px;`;

      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span style="font-weight: 700; color: #1e293b;">班级 #${c.id}</span>
          ${isAssigned ? '<span style="background: #10b981; color: #fff; padding: 1px 5px; border-radius: 3px; font-size: 9px; font-weight: 700;">+1 增派</span>' : ''}
        </div>
        <div style="display: flex; justify-content: space-between; color: #64748b; margin-top: 2px;">
          <span>人数: ${c.pass} / ${c.total}</span>
          <span style="font-weight: 700; color: #2563eb;">${(c.ratio * 100).toFixed(1)}%</span>
        </div>
        <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px 6px; margin-top: 4px;">
          <div style="font-size: 10px; color: #64748b;">下个学生增益 gain:</div>
          <div style="font-weight: 800; color: #d97706; font-size: 12px;">+${(c.gain * 100).toFixed(3)}%</div>
        </div>
      `;
      listContainer.appendChild(card);
    });
    classBox.appendChild(listContainer);
    mainCard.appendChild(classBox);

    // 决策天平
    const balanceBox = document.createElement('div');
    renderDecisionBalance(balanceBox, {
      leftTitle: '贪心选择最大边际收益班级',
      leftVal: 'max Δ = (p+1)/(t+1) - p/t',
      rightTitle: '选择当前通过率最低班级',
      rightVal: '可能分母极大导致增益微乎其微',
      winner: 'left',
      reason: '边际增益而非绝对比率决定了总和的提升速率，边际贪心必达到全局最优',
    });
    mainCard.appendChild(balanceBox);

    stageContainer.appendChild(mainCard);
  },
});
