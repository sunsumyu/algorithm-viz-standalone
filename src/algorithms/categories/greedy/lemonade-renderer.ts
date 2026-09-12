/**
 * 柠檬水找零可视化器（贪心算法）— 声明式 4-Card 标准架构
 * LeetCode 860：每杯柠檬水 $5，收 $10 找 $5，收 $20 贪心优先找 $10+$5 其次找 3张 $5
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  LEMONADE_PROBLEM_HTML,
  LEMONADE_ANALYSIS_HTML,
  LEMONADE_CODE_LANGUAGES,
} from './lemonade-problem-content';

export interface LemonadeStep {
  bills: number[];
  currentIndex: number;
  fiveCount: number;
  tenCount: number;
  currentBill: number;
  changeGiven: number[];
  success: boolean;
  action: 'init' | 'receive_5' | 'change_10' | 'change_20_10_5' | 'change_20_5_5_5' | 'fail' | 'done';
  message: string;
  codeLine: number;
  metrics?: Record<string, string>;
}

export function buildLemonadeSteps(rawBills: number[]): LemonadeStep[] {
  const steps: LemonadeStep[] = [];
  const n = rawBills.length;

  if (n === 0) {
    steps.push({
      bills: [],
      currentIndex: -1,
      fiveCount: 0,
      tenCount: 0,
      currentBill: 0,
      changeGiven: [],
      success: true,
      action: 'done',
      message: '没有顾客，返回 true',
      codeLine: 2,
    });
    return steps;
  }

  let five = 0;
  let ten = 0;

  steps.push({
    bills: [...rawBills],
    currentIndex: -1,
    fiveCount: 0,
    tenCount: 0,
    currentBill: 0,
    changeGiven: [],
    success: true,
    action: 'init',
    message: `初始化：共 ${n} 位顾客排队，收银台初始零钱：$5 数量 = 0, $10 数量 = 0`,
    codeLine: 2,
  });

  for (let i = 0; i < n; i++) {
    const bill = rawBills[i];

    if (bill === 5) {
      five++;
      steps.push({
        bills: [...rawBills],
        currentIndex: i,
        fiveCount: five,
        tenCount: ten,
        currentBill: 5,
        changeGiven: [],
        success: true,
        action: 'receive_5',
        message: `💵 顾客 [${i}] 支付 $5，无需找零，直接存入收银台 ($5 储备增加到 ${five} 张)`,
        codeLine: 5,
      });
    } else if (bill === 10) {
      if (five <= 0) {
        steps.push({
          bills: [...rawBills],
          currentIndex: i,
          fiveCount: five,
          tenCount: ten,
          currentBill: 10,
          changeGiven: [],
          success: false,
          action: 'fail',
          message: `❌ 顾客 [${i}] 支付 $10 需要找零 $5，但收银台没有 $5 纸币！找零失败，返回 false`,
          codeLine: 7,
        });
        return steps;
      }
      five--;
      ten++;
      steps.push({
        bills: [...rawBills],
        currentIndex: i,
        fiveCount: five,
        tenCount: ten,
        currentBill: 10,
        changeGiven: [5],
        success: true,
        action: 'change_10',
        message: `💶 顾客 [${i}] 支付 $10，找零 1 张 $5 (剩余 $5: ${five} 张, $10: ${ten} 张)`,
        codeLine: 8,
      });
    } else if (bill === 20) {
      if (ten > 0 && five > 0) {
        ten--;
        five--;
        steps.push({
          bills: [...rawBills],
          currentIndex: i,
          fiveCount: five,
          tenCount: ten,
          currentBill: 20,
          changeGiven: [10, 5],
          success: true,
          action: 'change_20_10_5',
          message: `💷 顾客 [${i}] 支付 $20！【贪心优先策略】找零 1 张 $10 + 1 张 $5，保留万能 $5 (剩余 $5: ${five} 张, $10: ${ten} 张)`,
          codeLine: 12,
        });
      } else if (five >= 3) {
        five -= 3;
        steps.push({
          bills: [...rawBills],
          currentIndex: i,
          fiveCount: five,
          tenCount: ten,
          currentBill: 20,
          changeGiven: [5, 5, 5],
          success: true,
          action: 'change_20_5_5_5',
          message: `💷 顾客 [${i}] 支付 $20！【备选策略】无 $10，找零 3 张 $5 (剩余 $5: ${five} 张, $10: ${ten} 张)`,
          codeLine: 14,
        });
      } else {
        steps.push({
          bills: [...rawBills],
          currentIndex: i,
          fiveCount: five,
          tenCount: ten,
          currentBill: 20,
          changeGiven: [],
          success: false,
          action: 'fail',
          message: `❌ 顾客 [${i}] 支付 $20 需要找零 $15，但收银台既无 ($10+$5) 也无 (3张$5)！找零失败，返回 false`,
          codeLine: 16,
        });
        return steps;
      }
    }
  }

  steps.push({
    bills: [...rawBills],
    currentIndex: n - 1,
    fiveCount: five,
    tenCount: ten,
    currentBill: 0,
    changeGiven: [],
    success: true,
    action: 'done',
    message: `🎉 全部 ${n} 位顾客找零成功！最终收银台结存：$5: ${five} 张, $10: ${ten} 张，返回 true`,
    codeLine: 20,
  });

  return steps;
}

/** 为每一步附加状态监视器指标（键名与 spec.metrics 的 id 一一对应） */
function withMetrics(steps: LemonadeStep[]): LemonadeStep[] {
  return steps.map((s) => {
    const isPay5 = s.action === 'receive_5';
    const isChg10 = s.action === 'change_10';
    const isChg20Opt = s.action === 'change_20_10_5';
    const isChg20Alt = s.action === 'change_20_5_5_5';
    const isFail = s.action === 'fail';

    let action = '✓ 交易完成';
    if (isPay5) action = '💵 $5 直接收下';
    else if (isChg10) action = '💶 找零 1 张 $5';
    else if (isChg20Opt) action = '💷 贪心优先找 $10+$5';
    else if (isChg20Alt) action = '💷 备选方案找 3张 $5';
    else if (isFail) action = '❌ 零钱不足 (失败)';
    else if (s.action === 'init') action = '初始化';

    const curBill = s.currentBill;
    const changeNeed = curBill > 5 ? curBill - 5 : 0;

    return {
      ...s,
      log: s.message,
      metrics: {
        'cur-bill': curBill > 0 ? `$${curBill}` : '—',
        'change-need': curBill > 0 ? (changeNeed > 0 ? `$${changeNeed}` : '$0 (无需找零)') : '—',
        'cashier': `$5 × ${s.fiveCount} | $10 × ${s.tenCount}`,
        'change-given': s.changeGiven.length ? s.changeGiven.map((c) => `$${c}`).join(' + ') : '无',
        'verdict': s.success ? 'true (可以找零)' : 'false (找零失败)',
        action,
      },
    };
  });
}

export function renderLemonadeCanvas(container: HTMLElement, step: LemonadeStep): void {
  const bills = step.bills;
  const n = bills.length;

  if (n === 0) {
    container.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#94a3b8;font-size:12px;">没有顾客排队</div>';
    return;
  }

  const curIdx = step.currentIndex;
  const isDone = step.action === 'done';
  const isFail = step.action === 'fail';

  const customersHtml = bills
    .map((b, idx) => {
      const isCurrent = idx === curIdx && !isDone;
      const isProcessed = idx < curIdx || (idx === curIdx && isDone);

      let bg = '#ffffff';
      let borderColor = '#e2e8f0';
      let textColor = '#0f172a';

      if (isCurrent) {
        bg = isFail ? '#fef2f2' : '#fefce8';
        borderColor = isFail ? '#ef4444' : '#ca8a04';
        textColor = isFail ? '#dc2626' : '#a16207';
      } else if (isProcessed) {
        bg = '#f8fafc';
        borderColor = '#cbd5e1';
        textColor = '#64748b';
      }

      const billBadgeColor = b === 5 ? '#10b981' : b === 10 ? '#3b82f6' : '#ca8a04';

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
          <span style="font-size: 9px; color: ${isCurrent ? '#ca8a04' : '#94a3b8'}; font-weight: 700;">
            ${isCurrent ? '📍 购买' : `[${idx}]`}
          </span>
          <div style="width: 48px; height: 50px; border-radius: 12px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 14px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 4px rgba(0,0,0,0.04); gap: 1px;">
            <span style="font-size: 9.5px; color: ${billBadgeColor}; font-weight: 700;">支付</span>
            <span style="font-size: 13px; color: ${billBadgeColor}; font-weight: 800;">$${b}</span>
          </div>
          <span style="font-size: 8.5px; color: ${isProcessed ? '#059669' : '#94a3b8'}; font-weight: 700;">
            ${isProcessed ? '✓ 完成' : '等待'}
          </span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; gap: 8px; padding: 12px; box-sizing: border-box;">
      <!-- 钱箱储备条 -->
      <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
        <span>💵 收银台现钞储备: <strong style="color: #10b981;">$5 &times; ${step.fiveCount}</strong> | <strong style="color: #3b82f6;">$10 &times; ${step.tenCount}</strong></span>
        <span>找零吐钞: <strong style="color: #ca8a04; font-family: monospace;">${step.changeGiven.length ? step.changeGiven.map((c) => `$${c}`).join(' + ') : '无'}</strong></span>
      </div>

      <!-- 顾客水平流 -->
      <div style="display: flex; gap: 8px; overflow-x: auto; justify-content: center; padding: 4px 0;">
        ${customersHtml}
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'lemonade',
  name: '柠檬水找零',
  category: 'greedy',
  description: '贪心维护各面额纸币数量，找零 $20 优先消耗专用 $10 纸币，保留万能 $5',
  icon: '🍋',
  difficulty: 1,
  levelOrder: 14,
  learningGoal: '理解贪心策略中通用资源与受限资源的优先级调度思想',
  inputs: [
    {
      id: 'bills',
      label: '顾客支付账单',
      type: 'text',
      defaultValue: '5,5,5,10,20',
      placeholder: '5,5,5,10,20',
    },
  ],
  presets: [
    { label: '示例 1 (成功 true)', values: { bills: '5,5,5,10,20' } },
    { label: '示例 2 (失败 false)', values: { bills: '5,5,10,10,20' } },
    { label: '3张$5备选 (成功)', values: { bills: '5,5,5,20' } },
  ],
  metrics: [
    { id: 'cur-bill', label: '当前顾客支付', color: '#ca8a04' },
    { id: 'change-need', label: '所需找零金额', color: '#dc2626' },
    { id: 'cashier', label: '收银台储备', color: '#10b981' },
    { id: 'change-given', label: '找零吐钞', color: '#3b82f6' },
    { id: 'verdict', label: '找零可行性', color: '#059669' },
    { id: 'action', label: '找零决策', color: '#2563eb' },
  ],
  legend: [
    { label: '💵 $5 纸币', color: '#10b981' },
    { label: '💶 $10 纸币', color: '#3b82f6' },
    { label: '💷 $20 纸币', color: '#ca8a04' },
  ],
  codeLanguages: LEMONADE_CODE_LANGUAGES,
  problemHtml: LEMONADE_PROBLEM_HTML,
  analysisHtml: LEMONADE_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const rawBills = String(inputs.bills ?? '5,5,5,10,20')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    return withMetrics(buildLemonadeSteps(rawBills.length ? rawBills : [5, 5, 5, 10, 20]));
  },
  renderCanvas: (container, step) => renderLemonadeCanvas(container, step as LemonadeStep),
});
