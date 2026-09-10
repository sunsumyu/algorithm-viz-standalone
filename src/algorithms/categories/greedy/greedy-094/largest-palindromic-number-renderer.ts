/**
 * 最大回文数字 (LeetCode 2384) - 声明式教学级沙盘渲染器
 * 核心贪心：高位贪心成对填充与最高单数中心放置
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { GREEDY_094_PROBLEMS } from './greedy-094-problem-content';
import {
  LARGEST_PALINDROMIC_NUMBER_CODES,
  LARGEST_PALINDROMIC_NUMBER_LINES,
} from './greedy-094-stage-codes';
import {
  Greedy094Step,
  renderDecisionBalance,
} from './greedy-094-shared';

export interface LargestPalindromicStep extends Greedy094Step {
  numStr: string;
  counts: number[];
  leftPart: string;
  midPart: string;
  currentDigit?: number;
  result?: string;
}

export function buildLargestPalindromicSteps(num: string): LargestPalindromicStep[] {
  const steps: LargestPalindromicStep[] = [];
  const lines = LARGEST_PALINDROMIC_NUMBER_LINES;

  // Step 0: 入口
  steps.push({
    numStr: num,
    counts: new Array(10).fill(0),
    leftPart: '',
    midPart: '',
    decision: `主函数入口：输入字符串 num = "${num}"，准备统计 0-9 出现频次`,
    message: '核心思路：从数字 9 到 1 贪心成对构建回文两侧；前导零不可作为首位；选剩余最大数作为回文中心',
    log: `enter largestPalindromic(num="${num}")`,
    codeLine: lines.entry,
  });

  // Step 1: 统计词频
  const counts = new Array(10).fill(0);
  for (const ch of num) {
    const d = parseInt(ch, 10);
    if (!isNaN(d) && d >= 0 && d <= 9) {
      counts[d]++;
    }
  }

  steps.push({
    numStr: num,
    counts: [...counts],
    leftPart: '',
    midPart: '',
    decision: `字符词频统计完成：${counts.map((c, i) => `${i}:${c}`).filter((_, i) => counts[i] > 0).join(', ')}`,
    message: '统计 0-9 每个数字的可用张数',
    log: `digit counts: ${JSON.stringify(counts)}`,
    codeLine: lines.countDigits,
  });

  // Step 2: 从 9 到 0 成对填充
  let left = '';
  for (let d = 9; d >= 0; d--) {
    if (d === 0 && left.length === 0) {
      steps.push({
        numStr: num,
        counts: [...counts],
        leftPart: left,
        midPart: '',
        currentDigit: d,
        decision: `⚠️ 检测到数字 0 且当前回文左侧为空：前导零不能放在最高位，跳过 0 的成对拼接`,
        message: '避免前导零生成无效数字',
        log: `skip leading zeros for left part`,
        codeLine: lines.placePairs,
      });
      break;
    }

    const pairs = Math.floor(counts[d] / 2);
    if (pairs > 0) {
      const added = String(d).repeat(pairs);
      left += added;
      counts[d] -= pairs * 2;

      steps.push({
        numStr: num,
        counts: [...counts],
        leftPart: left,
        midPart: '',
        currentDigit: d,
        decision: `贪心放置数字 ${d}：可用 ${pairs * 2} 张，两侧各放 ${pairs} 张 ➔ 当前左半部 left = "${left}"`,
        message: `大数字 ${d} 尽量放在高位以让数值最大化`,
        log: `placed ${pairs} pairs of digit ${d}`,
        codeLine: lines.placePairs,
      });
    }
  }

  // Step 3: 选最大的单一数字作为中间位
  let mid = '';
  for (let d = 9; d >= 0; d--) {
    if (counts[d] > 0) {
      mid = String(d);
      steps.push({
        numStr: num,
        counts: [...counts],
        leftPart: left,
        midPart: mid,
        currentDigit: d,
        decision: `选择最大的剩余数字 ${d} 放置在回文中心 mid = "${mid}"`,
        message: '回文中心只需 1 位，取余下未成对的最大数字',
        log: `selected mid=${mid}`,
        codeLine: lines.pickMid,
      });
      break;
    }
  }

  // Step 4: 结果拼接与特判
  let finalAns = '';
  if (left.length === 0 && mid.length === 0) {
    finalAns = '0';
  } else {
    const right = left.split('').reverse().join('');
    finalAns = left + mid + right;
  }

  steps.push({
    numStr: num,
    counts: [...counts],
    leftPart: left,
    midPart: mid,
    result: finalAns,
    decision: `🎉 最终回文结果构建完成：${finalAns}（左半部分="${left}", 中心="${mid}", 右半部分="${left.split('').reverse().join('')}"）`,
    message: '对称贪心保证了所拼成回文数字的绝对最大值',
    log: `final result: ${finalAns}`,
    codeLine: lines.done,
  });

  return steps;
}

export const largestPalindromicVisualizer = registerDeclarativeAlgorithm<LargestPalindromicStep>({
  id: 'largest-palindromic-number',
  name: '最大回文数字 (Largest Palindromic Number)',
  category: 'greedy',
  icon: '🔢',
  difficulty: 2,
  levelOrder: 942,
  learningGoal: '掌握高位贪心成对填充与前导0特判逻辑',
  problemHtml: GREEDY_094_PROBLEMS.largestPalindromicNumber.html,
  analysisHtml: GREEDY_094_PROBLEMS.largestPalindromicNumber.html,
  inputs: [
    {
      id: 'input-num',
      label: '数字字符串 num',
      type: 'text',
      defaultValue: '444947137',
      placeholder: '444947137',
    },
  ],
  codeLanguages: LARGEST_PALINDROMIC_NUMBER_CODES,
  buildSteps: (inputs: Record<string, any>) => {
    const num = String(inputs?.['input-num'] || '444947137').trim();
    return buildLargestPalindromicSteps(num);
  },
  renderCanvas: (stageContainer: HTMLElement, step: LargestPalindromicStep) => {
    stageContainer.innerHTML = '';

    const mainCard = document.createElement('div');
    mainCard.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 顶部状态与回文展示
    const rightPart = step.leftPart.split('').reverse().join('');
    mainCard.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
        <div style="font-weight: 700; font-size: 13px; color: #1e293b;">回文组装槽位:</div>
        <div style="display: flex; gap: 4px; font-family: 'JetBrains Mono', monospace; font-size: 16px; font-weight: 800; align-items: center;">
          <span style="background: #eff6ff; color: #2563eb; padding: 3px 8px; border-radius: 4px; border: 1px dashed #93c5fd;">[左] ${step.leftPart || '空'}</span>
          <span style="color: #94a3b8;">+</span>
          <span style="background: #fef2f2; color: #dc2626; padding: 3px 8px; border-radius: 4px; border: 1px dashed #fca5a5;">[中] ${step.midPart || '空'}</span>
          <span style="color: #94a3b8;">+</span>
          <span style="background: #eff6ff; color: #2563eb; padding: 3px 8px; border-radius: 4px; border: 1px dashed #93c5fd;">[右] ${rightPart || '空'}</span>
        </div>
      </div>
    `;

    // 数字频次看板 (9 down to 0)
    const freqBox = document.createElement('div');
    freqBox.style.cssText = 'flex: 1; display: flex; flex-direction: column; gap: 8px; padding: 12px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0;';

    const title = document.createElement('div');
    title.style.cssText = 'font-size: 12px; font-weight: 700; color: #475569;';
    title.textContent = '📊 0-9 数字剩余可用频次 (贪心由 9 至 0 扫描)';
    freqBox.appendChild(title);

    const digitGrid = document.createElement('div');
    digitGrid.style.cssText = 'display: grid; grid-template-columns: repeat(10, 1fr); gap: 6px;';

    for (let d = 9; d >= 0; d--) {
      const count = step.counts[d];
      const isCur = step.currentDigit === d;

      let border = '#e2e8f0';
      let bg = count > 0 ? '#f0fdf4' : '#f8fafc';
      let textColor = count > 0 ? '#15803d' : '#94a3b8';

      if (isCur) {
        border = '#3b82f6';
        bg = '#eff6ff';
        textColor = '#1d4ed8';
      }

      const cell = document.createElement('div');
      cell.style.cssText = `display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 8px 4px; border-radius: 6px; border: 1.5px solid ${border}; background: ${bg}; font-family: 'JetBrains Mono', monospace; font-size: 13px; font-weight: 700;`;
      cell.innerHTML = `
        <span style="font-size: 15px; color: ${textColor};">${d}</span>
        <span style="font-size: 10px; color: #64748b; margin-top: 2px;">剩 ${count}</span>
      `;
      digitGrid.appendChild(cell);
    }
    freqBox.appendChild(digitGrid);
    mainCard.appendChild(freqBox);

    // 决策天平 (大数在前 vs 小数在前)
    const balanceBox = document.createElement('div');
    renderDecisionBalance(balanceBox, {
      leftTitle: '高位优先放置大数字 (9..0)',
      leftVal: '最高位贡献数值权重指数级放大',
      rightTitle: '随意放置数字',
      rightVal: '导致更高位被较小数字占据',
      winner: 'left',
      reason: '贪心法则：回文两翼是数值权值最高位，从 9 向 0 配对是唯一使回文最大化的途径',
    });
    mainCard.appendChild(balanceBox);

    stageContainer.appendChild(mainCard);
  },
});
