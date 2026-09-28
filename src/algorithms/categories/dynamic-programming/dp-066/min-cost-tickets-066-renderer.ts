/**
 * 左程云算法通关课 Class 066: 最低票价 (Minimum Cost For Tickets · LeetCode 983)
 * 一维动态规划逆向跳跃状态转移
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_066_PROBLEMS } from './dp-066-problem-content';
import {
  MIN_COST_TICKETS_066_CODES,
  MIN_COST_TICKETS_066_LINES,
} from './dp-066-stage-codes';
import { Dp066StepBase, renderLinearDpArray } from './dp-066-shared';
import {
  MIN_COST_TICKETS_STAGE1_CODES,
  MIN_COST_TICKETS_STAGE2_CODES,
  MIN_COST_TICKETS_STAGE4_CODES,
  buildMinCostTicketsStage1Steps,
  buildMinCostTicketsStage2Steps,
  buildMinCostTicketsStage4Steps,
  renderStage1Card1,
  renderStage2Card1,
  renderStage4Card1,
} from './min-cost-tickets-stages';

export interface MinCostTicketsStep extends Dp066StepBase {
  days: number[];
  costs: number[];
  dp: number[];
  currentI?: number;
  branch1Cost?: number;
  branch7Cost?: number;
  branch30Cost?: number;
  bestCost?: number;
  jumpIdx1?: number;
  jumpIdx7?: number;
  jumpIdx30?: number;
}

const PRESETS_DATA: Record<string, { days: number[]; costs: number[] }> = {
  standard: {
    days: [1, 4, 6, 7, 8, 20],
    costs: [2, 7, 15],
  },
  dense_days: {
    days: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 30, 31],
    costs: [2, 7, 15],
  },
  sparse_days: {
    days: [1, 10, 20, 30, 40, 50],
    costs: [3, 10, 25],
  },
};

export function buildMinCostTickets066Steps(
  inputDays?: string | number[],
  customCosts?: number[]
): MinCostTicketsStep[] {
  let days: number[];
  let costs: number[];

  if (Array.isArray(inputDays)) {
    days = [...inputDays];
    costs = customCosts && customCosts.length === 3 ? [...customCosts] : [2, 7, 15];
  } else {
    const presetKey = typeof inputDays === 'string' ? inputDays : 'standard';
    const data = PRESETS_DATA[presetKey] || PRESETS_DATA.standard;
    days = [...data.days];
    costs = customCosts && customCosts.length === 3 ? [...customCosts] : [...data.costs];
  }
  const n = days.length;
  const durations = [1, 7, 30];

  const steps: MinCostTicketsStep[] = [];
  const lines = MIN_COST_TICKETS_066_LINES;

  const dp: number[] = new Array(n + 1).fill(0);

  // Step 0: 入口纯净帧
  steps.push({
    days,
    costs,
    dp: [...dp],
    line: lines.entry.javascript,
    codeLine: lines.entry,
    message: `🚀 初始化最低票价一维动态规划：共有 ${n} 个旅行日，通行证费用分别为 [1天: $${costs[0]}, 7天: $${costs[1]}, 30天: $${costs[2]}]。`,
    explanation: '定义 dp[i] 为从第 i 个旅行日开始完成后续所有旅行的最低花费。自底向上逆向推导，基准条件 dp[n] = 0。',
    metrics: { '旅行日数': n, '当前阶段': '初始化', '基准条件': 'dp[n]=0' },
  });

  // Step 1: 分配 dp 表
  steps.push({
    days,
    costs,
    dp: [...dp],
    line: lines.initDp.javascript,
    codeLine: lines.initDp,
    message: `📊 创建长度为 ${n + 1} 的 dp 数组，初始全 0。dp[${n}] = 0 作为虚拟终点哨兵。`,
    explanation: '当已完成全部计划日（达到下标 n）时，后续花费自然为 0。',
    metrics: { '旅行日数': n, 'dp数组大小': n + 1, '当前阶段': '开辟DP表' },
  });

  // 逆向遍历每个旅行日
  for (let i = n - 1; i >= 0; i--) {
    const curDay = days[i];

    // 计算三个分支的跳跃目标和花费
    let j1 = i;
    while (j1 < n && days[j1] < curDay + durations[0]) j1++;
    const cost1 = costs[0] + dp[j1];

    let j7 = i;
    while (j7 < n && days[j7] < curDay + durations[1]) j7++;
    const cost7 = costs[1] + dp[j7];

    let j30 = i;
    while (j30 < n && days[j30] < curDay + durations[2]) j30++;
    const cost30 = costs[2] + dp[j30];

    // 步骤：考察第 i 个旅行日
    steps.push({
      days,
      costs,
      dp: [...dp],
      currentI: i,
      branch1Cost: cost1,
      branch7Cost: cost7,
      branch30Cost: cost30,
      jumpIdx1: j1,
      jumpIdx7: j7,
      jumpIdx30: j30,
      line: lines.outerLoop.javascript,
      codeLine: lines.outerLoop,
      message: `🔍 考察旅行日 #${i} (第 ${curDay} 天)：开始评估 1天/7天/30天 三种购票方案。`,
      explanation: `当前决策基点为第 ${curDay} 天，分别计算覆盖 1/7/30 天后能跳跃到的下一个有效旅行日。`,
      highlightedIndices: [i],
      metrics: { '当前旅行日': `第${curDay}天 (i=${i})`, '决策状态': '评估方案' },
    });

    // 步骤：三种方案对比
    steps.push({
      days,
      costs,
      dp: [...dp],
      currentI: i,
      branch1Cost: cost1,
      branch7Cost: cost7,
      branch30Cost: cost30,
      jumpIdx1: j1,
      jumpIdx7: j7,
      jumpIdx30: j30,
      line: lines.skipDays.javascript,
      codeLine: lines.skipDays,
      message: `💡 方案对比：1天票跳至 #${j1}(第${days[j1] ?? '末尾'}天) 需$${cost1} | 7天票跳至 #${j7}(第${days[j7] ?? '末尾'}天) 需$${cost7} | 30天票跳至 #${j30}(第${days[j30] ?? '末尾'}天) 需$${cost30}`,
      explanation: `1天票覆盖[${curDay}, ${curDay}]；7天票覆盖[${curDay}, ${curDay + 6}]；30天票覆盖[${curDay}, ${curDay + 29}]。`,
      highlightedIndices: [i, j1, j7, j30].filter((idx) => idx <= n),
      metrics: {
        '1天方案': `$${costs[0]}+dp[${j1}]=$${cost1}`,
        '7天方案': `$${costs[1]}+dp[${j7}]=$${cost7}`,
        '30天方案': `$${costs[2]}+dp[${j30}]=$${cost30}`,
      },
    });

    const best = Math.min(cost1, cost7, cost30);
    dp[i] = best;

    // 步骤：确定最优解并写表
    steps.push({
      days,
      costs,
      dp: [...dp],
      currentI: i,
      bestCost: best,
      branch1Cost: cost1,
      branch7Cost: cost7,
      branch30Cost: cost30,
      jumpIdx1: j1,
      jumpIdx7: j7,
      jumpIdx30: j30,
      line: lines.saveDp.javascript,
      codeLine: lines.saveDp,
      message: `✅ 第 ${curDay} 天决策完成：取三者最小值 min(${cost1}, ${cost7}, ${cost30}) = $${best}，写入 dp[${i}] = ${best}。`,
      explanation: `完成自第 ${curDay} 天起的子问题求解。`,
      highlightedIndices: [i],
      metrics: { '当前旅行日': `第${curDay}天`, '最优花费': `$${best}`, '已完成天数': n - i },
    });
  }

  // 终点帧：返回 dp[0]
  steps.push({
    days,
    costs,
    dp: [...dp],
    currentI: 0,
    bestCost: dp[0],
    line: lines.returnAns.javascript,
    codeLine: lines.returnAns,
    message: `🎉 逆向递推圆满结束！完成所有计划旅行日的最低总花费为 dp[0] = $${dp[0]}！`,
    explanation: '自底向上求解完毕，dp[0] 汇聚了从第一个旅行日开始覆盖全年的全局最优策略。',
    highlightedIndices: [0],
    metrics: { '全局最低总花费': `$${dp[0]}`, '总旅行日数': n, '状态': '求解完毕' },
  });

  return steps;
}

function renderTravelJumpSandbox(step: MinCostTicketsStep): string {
  const { days, costs, dp, currentI, branch1Cost, branch7Cost, branch30Cost, bestCost, jumpIdx1, jumpIdx7, jumpIdx30 } = step;
  const n = days.length;

  if (currentI === undefined) {
    return `
      <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-top: 10px;">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
          <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #1e293b; font-size: 13px;">
            <span>🗓️</span> 计划旅行日程概览 (${n} 个旅行日)
          </div>
          <span style="font-size: 11px; background: #e0e7ff; color: #3730a3; padding: 2px 8px; border-radius: 999px; font-weight: 600;">自底向上逆向跳跃</span>
        </div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px;">
          ${days.map((d, idx) => `
            <div style="display: flex; flex-direction: column; align-items: center; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 6px 10px; min-width: 58px; box-shadow: 0 1px 2px rgba(0,0,0,0.04);">
              <span style="font-size: 10px; color: #64748b; font-weight: 600;">i=${idx}</span>
              <span style="font-size: 14px; color: #0284c7; font-weight: 800;">${d}日</span>
            </div>
          `).join('')}
          <div style="display: flex; flex-direction: column; align-items: center; background: #f1f5f9; border: 1px dashed #94a3b8; border-radius: 8px; padding: 6px 10px; min-width: 58px;">
            <span style="font-size: 10px; color: #94a3b8; font-weight: 600;">i=${n}</span>
            <span style="font-size: 14px; color: #475569; font-weight: 800;">终点</span>
          </div>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
          <div style="background: #ffffff; border: 1px solid #bfdbfe; border-top: 3px solid #3b82f6; border-radius: 8px; padding: 10px;">
            <div style="font-weight: 700; color: #1d4ed8; font-size: 12px; display: flex; justify-content: space-between;">
              <span>🎫 1 天通行证</span>
              <span style="background: #dbeafe; padding: 1px 6px; border-radius: 4px;">$${costs[0]}</span>
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">单日精准覆盖 [day, day]</div>
            <div style="font-size: 11px; color: #2563eb; margin-top: 2px; font-weight: 600;">转移: $${costs[0]} + dp[i+1]</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #f5d0fe; border-top: 3px solid #a855f7; border-radius: 8px; padding: 10px;">
            <div style="font-weight: 700; color: #7e22ce; font-size: 12px; display: flex; justify-content: space-between;">
              <span>🎫 7 天通行证</span>
              <span style="background: #f3e8ff; padding: 1px 6px; border-radius: 4px;">$${costs[1]}</span>
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">覆盖连跨 7 天 [day, day+6]</div>
            <div style="font-size: 11px; color: #9333ea; margin-top: 2px; font-weight: 600;">转移: $${costs[1]} + dp[j_7]</div>
          </div>
          <div style="background: #ffffff; border: 1px solid #fed7aa; border-top: 3px solid #f97316; border-radius: 8px; padding: 10px;">
            <div style="font-weight: 700; color: #c2410c; font-size: 12px; display: flex; justify-content: space-between;">
              <span>🎫 30 天通行证</span>
              <span style="background: #ffedd5; padding: 1px 6px; border-radius: 4px;">$${costs[2]}</span>
            </div>
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">覆盖连跨 30 天 [day, day+29]</div>
            <div style="font-size: 11px; color: #ea580c; margin-top: 2px; font-weight: 600;">转移: $${costs[2]} + dp[j_30]</div>
          </div>
        </div>
      </div>
    `;
  }

  // Active step: Render SVG Jump Arcs + Timeline Track + Pass Comparison Cards
  const nodeCount = n + 1;
  const svgWidth = 620;
  const svgHeight = 150;
  const padLeft = 45;
  const padRight = 45;
  const trackY = 115;
  const usableWidth = svgWidth - padLeft - padRight;
  const stepX = usableWidth / Math.max(1, nodeCount - 1);

  const getX = (idx: number) => padLeft + Math.min(idx, n) * stepX;

  // Jump arc generator
  const drawArc = (fromIdx: number, toIdx: number, color: string, arcH: number, isBest: boolean, label: string) => {
    const x1 = getX(fromIdx);
    const x2 = getX(toIdx);
    const midX = (x1 + x2) / 2;
    const topY = trackY - arcH;
    const pathD = `M ${x1} ${trackY - 10} Q ${midX} ${topY} ${x2} ${trackY - 10}`;
    const strokeWidth = isBest ? 3.5 : 2;
    const strokeDash = isBest ? '' : 'stroke-dasharray="4 3"';

    return `
      <g>
        <path d="${pathD}" fill="none" stroke="${color}" stroke-width="${strokeWidth}" ${strokeDash} marker-end="url(#arrow-${color.replace('#', '')})" />
        <rect x="${midX - 32}" y="${topY - 10}" width="64" height="18" rx="4" fill="#ffffff" stroke="${color}" stroke-width="1.2" />
        <text x="${midX}" y="${topY + 3}" text-anchor="middle" font-size="10.5" font-weight="700" fill="${color}">
          ${label}
        </text>
      </g>
    `;
  };

  const isBest1 = bestCost !== undefined && branch1Cost === bestCost;
  const isBest7 = bestCost !== undefined && branch7Cost === bestCost;
  const isBest30 = bestCost !== undefined && branch30Cost === bestCost;

  const arc1 = jumpIdx1 !== undefined ? drawArc(currentI, jumpIdx1, '#2563eb', 35, isBest1, `1天: $${costs[0]}`) : '';
  const arc7 = jumpIdx7 !== undefined ? drawArc(currentI, jumpIdx7, '#9333ea', 68, isBest7, `7天: $${costs[1]}`) : '';
  const arc30 = jumpIdx30 !== undefined ? drawArc(currentI, jumpIdx30, '#ea580c', 98, isBest30, `30天: $${costs[2]}`) : '';

  // Nodes on timeline
  const nodesSvg = Array.from({ length: nodeCount }).map((_, idx) => {
    const cx = getX(idx);
    const isCurrent = idx === currentI;
    const isJumpTarget = idx === jumpIdx1 || idx === jumpIdx7 || idx === jumpIdx30;
    const isEnd = idx === n;
    const dayLabel = isEnd ? '终点' : `${days[idx]}日`;

    let circleFill = '#ffffff';
    let circleStroke = '#cbd5e1';
    let textColor = '#64748b';

    if (isCurrent) {
      circleFill = '#3b82f6';
      circleStroke = '#1d4ed8';
      textColor = '#1d4ed8';
    } else if (isJumpTarget) {
      circleFill = '#fef08a';
      circleStroke = '#ca8a04';
      textColor = '#854d0e';
    }

    return `
      <g>
        ${isCurrent ? `<circle cx="${cx}" cy="${trackY}" r="15" fill="none" stroke="#60a5fa" stroke-width="2" opacity="0.6"><animate attributeName="r" values="12;18;12" dur="2s" repeatCount="indefinite"/></circle>` : ''}
        <circle cx="${cx}" cy="${trackY}" r="9" fill="${circleFill}" stroke="${circleStroke}" stroke-width="2" />
        <text x="${cx}" y="${trackY + 4}" text-anchor="middle" font-size="9" font-weight="800" fill="${isCurrent ? '#ffffff' : '#334155'}">
          ${idx}
        </text>
        <text x="${cx}" y="${trackY + 22}" text-anchor="middle" font-size="10.5" font-weight="700" fill="${textColor}">
          ${dayLabel}
        </text>
      </g>
    `;
  }).join('');

  return `
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; margin-top: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 13px; font-weight: 700; color: #1e293b;">🚀 旅行日跳跃跨度与分支决策沙盘</span>
          <span style="font-size: 11px; background: #eff6ff; color: #2563eb; padding: 1px 7px; border-radius: 999px; font-weight: 600;">基点: 第 ${days[currentI]} 天 (i=${currentI})</span>
        </div>
        ${bestCost !== undefined ? `<span style="font-size: 11px; background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 6px; font-weight: 700;">🏆 最优花费: $${bestCost}</span>` : ''}
      </div>

      <!-- SVG Jump Arcs Visualizer -->
      <div style="width: 100%; overflow-x: auto; display: flex; justify-content: center;">
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" style="max-width: 100%; height: auto; min-width: 500px;">
          <defs>
            <marker id="arrow-2563eb" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#2563eb" />
            </marker>
            <marker id="arrow-9333ea" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#9333ea" />
            </marker>
            <marker id="arrow-ea580c" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#ea580c" />
            </marker>
          </defs>

          <!-- Timeline Track Line -->
          <line x1="${padLeft}" y1="${trackY}" x2="${getX(n)}" y2="${trackY}" stroke="#e2e8f0" stroke-width="4" stroke-linecap="round" />

          <!-- Jump Arcs -->
          ${arc30}
          ${arc7}
          ${arc1}

          <!-- Nodes -->
          ${nodesSvg}
        </svg>
      </div>

      <!-- Branch Comparison Cards -->
      ${branch1Cost !== undefined ? `
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px;">
          <div style="background: ${isBest1 ? '#eff6ff' : '#f8fafc'}; border: 1.5px solid ${isBest1 ? '#3b82f6' : '#e2e8f0'}; border-radius: 8px; padding: 8px 10px; font-size: 11.5px; position: relative;">
            ${isBest1 ? '<span style="position: absolute; right: 8px; top: 6px; font-size: 10px; background: #2563eb; color: #fff; padding: 1px 5px; border-radius: 4px; font-weight: 700;">最优</span>' : ''}
            <div style="font-weight: 700; color: #1d4ed8;">🎫 1 天方案</div>
            <div style="color: #475569; margin-top: 3px;">$${costs[0]} + dp[${jumpIdx1}] ($${dp[jumpIdx1 ?? 0]})</div>
            <div style="font-weight: 800; color: ${isBest1 ? '#1d4ed8' : '#334155'}; font-size: 13px; margin-top: 2px;">总额: $${branch1Cost}</div>
          </div>

          <div style="background: ${isBest7 ? '#faf5ff' : '#f8fafc'}; border: 1.5px solid ${isBest7 ? '#a855f7' : '#e2e8f0'}; border-radius: 8px; padding: 8px 10px; font-size: 11.5px; position: relative;">
            ${isBest7 ? '<span style="position: absolute; right: 8px; top: 6px; font-size: 10px; background: #7e22ce; color: #fff; padding: 1px 5px; border-radius: 4px; font-weight: 700;">最优</span>' : ''}
            <div style="font-weight: 700; color: #7e22ce;">🎫 7 天方案</div>
            <div style="color: #475569; margin-top: 3px;">$${costs[1]} + dp[${jumpIdx7}] ($${dp[jumpIdx7 ?? 0]})</div>
            <div style="font-weight: 800; color: ${isBest7 ? '#7e22ce' : '#334155'}; font-size: 13px; margin-top: 2px;">总额: $${branch7Cost}</div>
          </div>

          <div style="background: ${isBest30 ? '#fff7ed' : '#f8fafc'}; border: 1.5px solid ${isBest30 ? '#f97316' : '#e2e8f0'}; border-radius: 8px; padding: 8px 10px; font-size: 11.5px; position: relative;">
            ${isBest30 ? '<span style="position: absolute; right: 8px; top: 6px; font-size: 10px; background: #c2410c; color: #fff; padding: 1px 5px; border-radius: 4px; font-weight: 700;">最优</span>' : ''}
            <div style="font-weight: 700; color: #c2410c;">🎫 30 天方案</div>
            <div style="color: #475569; margin-top: 3px;">$${costs[2]} + dp[${jumpIdx30}] ($${dp[jumpIdx30 ?? 0]})</div>
            <div style="font-weight: 800; color: ${isBest30 ? '#c2410c' : '#334155'}; font-size: 13px; margin-top: 2px;">总额: $${branch30Cost}</div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

registerDeclarativeAlgorithm<any>({
  id: 'min-cost-tickets-066',
  name: '最低票价 (一维DP跳跃)',
  category: 'dynamic-programming',
  difficulty: '中等',
  description: '左程云 Class 066 Code02：旅行日逆向一维动态规划，1/7/30天通行证跨度跳跃自底向上递推 (LeetCode 983)',
  aliases: ['class066-code02', 'min-cost-tickets-983', 'leetcode-983', 'min-cost-tickets-class066'],
  problemHtml: DP_066_PROBLEMS['min-cost-tickets-066'].problemHtml,
  analysisHtml: DP_066_PROBLEMS['min-cost-tickets-066'].complexityHtml,
  codeLanguages: MIN_COST_TICKETS_066_CODES,
  inputs: [
    {
      id: 'days',
      label: '旅行日 (逗号分隔)',
      type: 'text',
      defaultValue: '1, 4, 6, 7, 8, 20',
    },
    {
      id: 'costs',
      label: '通行证费用 (1天, 7天, 30天)',
      type: 'text',
      defaultValue: '2, 7, 15',
    },
  ],
  presets: [
    { label: '标准用例 (6个旅行日)', values: { days: '1, 4, 6, 7, 8, 20', costs: '2, 7, 15', preset: 'standard' } },
    { label: '密集连号用例 (12个旅行日)', values: { days: '1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 30, 31', costs: '2, 7, 15', preset: 'dense_days' } },
    { label: '稀疏跨月用例 (6个跨月旅行日)', values: { days: '1, 10, 20, 30, 40, 50', costs: '3, 10, 25', preset: 'sparse_days' } },
  ],
  card1Title: '🚀 旅行日跳跃跨度与分支决策沙盘',
  card2Title: '📐 一维动态规划状态表 dp[i]',
  defaultStage: 'stage-3',
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力递归',
      shortName: '暴力递归',
      num: 1,
      timeBadge: 'O(3^N)',
      theme: 'bg-blue',
      badge: {
        mode: '最低票价 · 递归暴力搜索',
        complexity: 'O(3^N) · O(N) 栈深',
      },
      card1Title: '🌲 递归尝试决策树与运行时调用栈',
      card2Title: '📊 暴力递归开销与调用统计',
      codeLanguages: MIN_COST_TICKETS_STAGE1_CODES,
      buildSteps: (inputs: Record<string, any>) => {
        const { days, costs } = parseMinCostTicketsInputs(inputs);
        return buildMinCostTicketsStage1Steps(days, costs);
      },
      renderCanvas: (container: HTMLElement, step: any) => renderStage1Card1(container, step),
      renderCustomMetrics: (container: HTMLElement, _step: any) => {
        container.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; box-sizing: border-box; padding: 4px;">
            <div style="font-size: 12px; font-weight: 700; color: #334155;">📊 暴力递归指数级复杂度剖析</div>
            <div style="font-size: 11.5px; color: #64748b; line-height: 1.6;">
              每个旅行日面临 1天/7天/30天 三个决策分支，状态树随天数成 3^N 指数增长，大量分支重复到达相同旅行日造成算力严重浪费。
            </div>
          </div>
        `;
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 记忆化搜索',
      shortName: '记忆化',
      num: 2,
      timeBadge: 'O(N)',
      theme: 'bg-blue',
      badge: {
        mode: '最低票价 · 记忆化搜索',
        complexity: 'O(N) · O(N) 备忘录',
      },
      card1Title: '💾 备忘录剪枝探查追踪 (Cache Hit/Miss)',
      card2Title: '🎯 1D 备忘录缓存状态与剪枝统计',
      codeLanguages: MIN_COST_TICKETS_STAGE2_CODES,
      buildSteps: (inputs: Record<string, any>) => {
        const { days, costs } = parseMinCostTicketsInputs(inputs);
        return buildMinCostTicketsStage2Steps(days, costs);
      },
      renderCanvas: (container: HTMLElement, step: any) => renderStage2Card1(container, step),
      renderCustomMetrics: (container: HTMLElement, _step: any) => {
        container.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; box-sizing: border-box; padding: 4px;">
            <div style="font-size: 12px; font-weight: 700; color: #334155;">🎯 备忘录剪枝核心收益</div>
            <div style="font-size: 11.5px; color: #64748b; line-height: 1.6;">
              通过 memo[i] 缓存从第 i 天起的最优解，后续无论从哪个分支跳转至该天均直接 O(1) 查表返回，算力开销直接压缩为 O(N)。
            </div>
          </div>
        `;
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: 严格一维DP',
      shortName: '一维DP',
      num: 3,
      timeBadge: 'O(N)',
      theme: 'bg-emerald',
      badge: {
        mode: '最低票价 · 严格一维表递推',
        complexity: 'O(N) · O(N) 空间',
      },
      card1Title: '🚀 旅行日跳跃跨度与分支决策沙盘',
      card2Title: '📐 一维动态规划状态表 dp[i]',
      codeLanguages: MIN_COST_TICKETS_066_CODES,
      buildSteps: (inputs: Record<string, any>) => {
        const { days, costs } = parseMinCostTicketsInputs(inputs);
        return buildMinCostTickets066Steps(days, costs);
      },
      renderCanvas: (container: HTMLElement, step: MinCostTicketsStep) => {
        container.innerHTML = renderTravelJumpSandbox(step);
      },
      renderCustomMetrics: (container: HTMLElement, step: MinCostTicketsStep) => {
        const { days, dp, currentI } = step;
        const daysLabels = days.map((d, idx) => `i=${idx} (${d}日)`);
        daysLabels.push(`i=${days.length} (终点)`);

        container.innerHTML = renderLinearDpArray({
          dp,
          activeIdx: currentI,
          labels: daysLabels,
          title: '一维 DP 数组 dp[i] (从第 i 个旅行日起的最低花费)',
          summaryText: currentI !== undefined ? `当前正在推导: 第 ${days[currentI]} 天 (i=${currentI})` : '全局结果视图',
        });
      },
    },
    {
      id: 'stage-4',
      name: '阶段 4: 二分跳跃优化',
      shortName: '二分优化',
      num: 4,
      timeBadge: 'O(N log N)',
      theme: 'bg-amber',
      badge: {
        mode: '最低票价 · 二分跳跃加速',
        complexity: 'O(N log N) · O(N) 空间',
      },
      card1Title: '⚡ 二分查找区间游标与落点锁定沙盘',
      card2Title: '📊 二分跳跃加速与一维 DP 联动表',
      codeLanguages: MIN_COST_TICKETS_STAGE4_CODES,
      buildSteps: (inputs: Record<string, any>) => {
        const { days, costs } = parseMinCostTicketsInputs(inputs);
        return buildMinCostTicketsStage4Steps(days, costs);
      },
      renderCanvas: (container: HTMLElement, step: any) => renderStage4Card1(container, step),
      renderCustomMetrics: (container: HTMLElement, _step: any) => {
        container.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 8px; width: 100%; box-sizing: border-box; padding: 4px;">
            <div style="font-size: 12px; font-weight: 700; color: #334155;">⚡ 二分查找优化优势分析</div>
            <div style="font-size: 11.5px; color: #64748b; line-height: 1.6;">
              由于 days 严格单调递增，寻找 7天 / 30天 通行证的覆盖边界无需线性遍历，采用二分查找 (lower_bound) 即可在 O(log N) 瞬间锁定下一次购票日期。
            </div>
          </div>
        `;
      },
    },
  ],
  generateSteps: (inputs: Record<string, any>) => {
    const { days, costs } = parseMinCostTicketsInputs(inputs);
    return buildMinCostTickets066Steps(days, costs);
  },
  renderCanvas: (container: HTMLElement, step: MinCostTicketsStep) => {
    container.innerHTML = renderTravelJumpSandbox(step);
  },
  renderCustomMetrics: (container: HTMLElement, step: MinCostTicketsStep) => {
    const { days, dp, currentI } = step;
    const daysLabels = days.map((d, idx) => `i=${idx} (${d}日)`);
    daysLabels.push(`i=${days.length} (终点)`);

    container.innerHTML = renderLinearDpArray({
      dp,
      activeIdx: currentI,
      labels: daysLabels,
      title: '一维 DP 数组 dp[i] (从第 i 个旅行日起的最低花费)',
      summaryText: currentI !== undefined ? `当前正在推导: 第 ${days[currentI]} 天 (i=${currentI})` : '全局结果视图',
    });
  },
});

function parseMinCostTicketsInputs(inputs?: Record<string, any>): { days: number[]; costs: number[] } {
  let customDays: number[] | undefined;
  let customCosts: number[] | undefined;

  if (inputs?.days) {
    const parsed = String(inputs.days).split(/[\s,]+/).map(Number).filter((n) => !isNaN(n) && n > 0);
    if (parsed.length > 0) customDays = parsed;
  }
  if (inputs?.costs) {
    const parsed = String(inputs.costs).split(/[\s,]+/).map(Number).filter((n) => !isNaN(n) && n >= 0);
    if (parsed.length === 3) customCosts = parsed;
  }

  const data = (inputs?.preset && PRESETS_DATA[inputs.preset]) || PRESETS_DATA.standard;
  const days = customDays || [...data.days];
  const costs = customCosts || [...data.costs];
  return { days, costs };
}
