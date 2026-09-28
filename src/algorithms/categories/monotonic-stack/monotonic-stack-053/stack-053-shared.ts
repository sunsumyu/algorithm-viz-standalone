/**
 * Class 053: 单调栈（下）通用表现层与沙盘呈现器
 *
 * 遵循 Card 1 纯净沙盘契约：
 * 1. 零 h1~h6 标题；
 * 2. 零镜像重复与零药丸截断；
 * 3. 100% 弹性响应式排布。
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface Step053 extends StepBase {
  stage: string;
  title: string;
  narrative: string;
  codeLine: Record<string, number>;
  sandboxes: Array<{ id: string; type: string; title: string; customHtml: string }>;
  variables?: Record<string, string | number>;
}

export interface FishNode {
  idx: number;
  val: number;
  turns: number;
  status: 'alive' | 'eaten' | 'active';
}

/**
 * 1. 大鱼吃小鱼沙盘渲染器 (Code02)
 */
export function renderFishEatBoard(
  fishes: FishNode[],
  stack: number[],
  curI: number,
  maxTurns: number
): string {
  const n = fishes.length;
  const isDone = curI >= n;

  const fishCards = fishes
    .map((fish, idx) => {
      const isCur = idx === curI && !isDone;
      const inStack = stack.includes(idx);
      const isEaten = fish.status === 'eaten';

      let bg = '#f8fafc';
      let border = '#cbd5e1';
      let text = '#334155';
      let badge = '';

      if (isCur) {
        bg = '#ffedd5';
        border = '#ea580c';
        text = '#c2410c';
        badge = '<span style="font-size: 8.5px; color: #ea580c; font-weight: 700;">📍当前考察</span>';
      } else if (isEaten) {
        bg = '#fee2e2';
        border = '#fca5a5';
        text = '#991b1b';
        badge = `<span style="font-size: 8.5px; color: #dc2626; font-weight: 700;">💀第${fish.turns}轮被吃</span>`;
      } else if (inStack) {
        bg = '#fef3c7';
        border = '#f59e0b';
        text = '#b45309';
        badge = '<span style="font-size: 8.5px; color: #d97706; font-weight: 700;">🥞在单调栈</span>';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 3px; min-width: 48px; flex: 1; max-width: 70px;">
          ${badge || '<div style="height: 14px;"></div>'}
          <div style="width: 100%; height: 56px; background: ${bg}; border: 2px solid ${border}; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: all 0.2s;">
            <span style="font-size: 15px; font-weight: 800; color: ${text}; font-family: monospace;">🐟 ${fish.val}</span>
            <span style="font-size: 9px; color: #64748b; margin-top: 2px;">轮数: ${fish.turns}</span>
          </div>
          <span style="font-size: 9.5px; font-weight: 700; color: ${isCur ? '#ea580c' : '#94a3b8'}; font-family: monospace;">
            [${idx}]
          </span>
        </div>
      `;
    })
    .join('');

  const stackItems = stack
    .map((idx) => {
      const f = fishes[idx];
      return `
        <div style="padding: 3px 8px; border-radius: 6px; background: #fffbeb; border: 1.5px solid #fde68a; color: #b45309; font-size: 11px; font-weight: 800; font-family: monospace; display: flex; align-items: center; gap: 4px;">
          <span>[${idx}]</span>
          <span>🐟 ${f.val}</span>
          <span style="color: #ea580c;">(需${f.turns}轮)</span>
        </div>
      `;
    })
    .join('');

  return `
    <div style="width: 100%; display: flex; flex-direction: column; gap: 12px; padding: 12px; box-sizing: border-box;">
      <!-- 鱼群状态水平流 -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 800; color: #475569;">🌊 鱼群序列与吃鱼存活状态 (每轮右大鱼吃左小鱼)</span>
          <span style="font-size: 10.5px; background: #fef2f2; color: #b91c1c; padding: 2px 10px; border-radius: 10px; font-weight: 800; font-family: monospace;">最多淘汰轮数: ${maxTurns}</span>
        </div>
        <div style="display: flex; gap: 6px; overflow-x: auto; padding: 6px 0; justify-content: ${n <= 8 ? 'space-around' : 'flex-start'}; align-items: center;">
          ${fishCards}
        </div>
      </div>

      <!-- 单调栈槽位 -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; display: flex; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 800; color: #475569;">🥞 底到顶单调递减栈 (留存大鱼与被吃轮数)</span>
          <span style="font-size: 10px; color: #64748b;">栈深度: <strong>${stack.length}</strong></span>
        </div>
        <div style="display: flex; gap: 6px; overflow-x: auto; align-items: center; min-height: 40px; background: #f8fafc; padding: 6px; border-radius: 8px; border: 1.5px dashed #cbd5e1;">
          ${stack.length > 0 ? stackItems : '<span style="font-size: 11px; color: #94a3b8; font-style: italic;">（栈空）</span>'}
        </div>
      </div>
    </div>
  `;
}

/**
 * 2. 字符串单调栈沙盘渲染器 (Code03 移掉K位数字 & Code04 去除重复字母)
 */
export function renderStringStackBoard(
  chars: string[],
  stack: string[],
  curI: number,
  removedCount: number,
  targetK: number | null,
  countsMap: Record<string, number> | null = null,
  inStackSet: Set<string> | null = null
): string {
  const n = chars.length;
  const isDone = curI >= n;

  const charCards = chars
    .map((ch, idx) => {
      const isCur = idx === curI && !isDone;
      const inSt = inStackSet ? inStackSet.has(ch) : false;

      let bg = '#f8fafc';
      let border = '#cbd5e1';
      let text = '#334155';

      if (isCur) {
        bg = '#ffedd5';
        border = '#f97316';
        text = '#c2410c';
      } else if (inSt) {
        bg = '#ecfdf5';
        border = '#10b981';
        text = '#059669';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 32px; flex: 1; max-width: 44px;">
          <div style="width: 100%; height: 38px; background: ${bg}; border: 1.5px solid ${border}; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800; color: ${text}; font-family: monospace;">
            ${ch}
          </div>
          <span style="font-size: 8.5px; color: ${isCur ? '#ea580c' : '#94a3b8'}; font-weight: 700;">[${idx}]</span>
        </div>
      `;
    })
    .join('');

  const stackItems = stack
    .map((ch, idx) => {
      return `
        <div style="width: 32px; height: 32px; background: #eff6ff; border: 1.5px solid #3b82f6; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 800; color: #1d4ed8; font-family: monospace;">
          ${ch}
        </div>
      `;
    })
    .join('');

  return `
    <div style="width: 100%; display: flex; flex-direction: column; gap: 12px; padding: 12px; box-sizing: border-box;">
      <!-- 原始字符流 -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 800; color: #475569;">🔤 输入字符序列扫描</span>
          ${targetK !== null ? `<span style="font-size: 10px; background: #fee2e2; color: #991b1b; padding: 2px 8px; border-radius: 10px; font-weight: 700;">已移掉: ${removedCount} / ${targetK} 位</span>` : ''}
        </div>
        <div style="display: flex; gap: 4px; overflow-x: auto; padding: 4px 0; align-items: center;">
          ${charCards}
        </div>
      </div>

      <!-- 单调字符栈 -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; display: flex; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 800; color: #475569;">🥞 贪心单调栈当前字符串 (栈底 &rarr; 栈顶)</span>
          <span style="font-size: 11px; font-family: monospace; color: #2563eb; font-weight: 800;">当前拼装: "${stack.join('')}"</span>
        </div>
        <div style="display: flex; gap: 6px; overflow-x: auto; align-items: center; min-height: 42px; background: #f8fafc; padding: 6px; border-radius: 8px; border: 1.5px dashed #cbd5e1;">
          ${stack.length > 0 ? stackItems : '<span style="font-size: 11px; color: #94a3b8; font-style: italic;">（栈空）</span>'}
        </div>
      </div>
    </div>
  `;
}

/**
 * 3. 前缀和与区间最长跨度沙盘 (Code05 表现良好的最长时间段)
 */
export function renderPrefixSpanBoard(
  hours: number[],
  prefix: number[],
  stack: number[],
  curR: number,
  bestL: number | null,
  maxLen: number
): string {
  const n = hours.length;

  const cardsHtml = hours
    .map((h, idx) => {
      const isGood = h > 8;
      const inStack = stack.includes(idx);
      const isCurR = idx === curR;
      const isBestL = idx === bestL;

      let border = isGood ? '#86efac' : '#fca5a5';
      let bg = isGood ? '#f0fdf4' : '#fef2f2';
      let tag = isGood ? '劳累(+1)' : '平淡(-1)';

      if (isCurR) {
        border = '#3b82f6';
        bg = '#eff6ff';
      } else if (isBestL) {
        border = '#f59e0b';
        bg = '#fffbeb';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 44px; flex: 1; max-width: 64px;">
          <div style="width: 100%; height: 50px; background: ${bg}; border: 2px solid ${border}; border-radius: 6px; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: monospace;">
            <span style="font-size: 13px; font-weight: 800;">${h}h</span>
            <span style="font-size: 8px; color: #64748b;">前缀:${prefix[idx + 1]}</span>
          </div>
          <span style="font-size: 8.5px; color: #94a3b8;">[${idx}]</span>
        </div>
      `;
    })
    .join('');

  return `
    <div style="width: 100%; display: flex; flex-direction: column; gap: 12px; padding: 12px; box-sizing: border-box;">
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 800; color: #475569;">⏰ 每日工作时长与前缀和映射 (大于8小时记+1，否则记-1)</span>
          <span style="font-size: 10.5px; background: #ecfdf5; color: #047857; padding: 2px 10px; border-radius: 10px; font-weight: 800; font-family: monospace;">当前最长跨度: ${maxLen} 天</span>
        </div>
        <div style="display: flex; gap: 4px; overflow-x: auto; padding: 4px 0; align-items: center;">
          ${cardsHtml}
        </div>
      </div>

      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; display: flex; flex-direction: column;">
        <span style="font-size: 11px; font-weight: 800; color: #475569; margin-bottom: 8px;">🥞 严格递减前缀单调栈 (维护潜在左端点候选)</span>
        <div style="display: flex; gap: 6px; overflow-x: auto; align-items: center; min-height: 38px; background: #f8fafc; padding: 6px; border-radius: 8px; border: 1.5px dashed #cbd5e1; font-family: monospace; font-size: 11px;">
          ${stack.map((i) => `<span style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 4px; font-weight: 700;">前缀[${i}]=${prefix[i]}</span>`).join('') || '<span style="color:#94a3b8;">空栈</span>'}
        </div>
      </div>
    </div>
  `;
}

/**
 * 4. 子数组最小乘积的最大值沙盘 (Code06)
 */
export function renderMinProductBoard(
  nums: number[],
  stack: number[],
  curI: number,
  curPopped: number | null,
  leftBound: number | null,
  rightBound: number | null,
  curProd: string | number,
  maxProd: string | number
): string {
  const n = nums.length;
  const maxVal = Math.max(...nums, 1);

  const barsHtml = nums
    .map((val, idx) => {
      const isCur = idx === curI && curI < n;
      const isPopped = idx === curPopped;
      const inRange =
        leftBound !== null && rightBound !== null && idx >= leftBound && idx <= rightBound;
      const inStack = stack.includes(idx);

      let barColor = '#94a3b8';
      let border = '1px solid #cbd5e1';
      let bg = '#f8fafc';

      if (isPopped) {
        barColor = '#ef4444';
        border = '2px solid #b91c1c';
        bg = '#fee2e2';
      } else if (inRange) {
        barColor = '#3b82f6';
        border = '1.5px solid #2563eb';
        bg = '#dbeafe';
      } else if (isCur) {
        barColor = '#f59e0b';
        border = '2px solid #d97706';
        bg = '#fef3c7';
      } else if (inStack) {
        barColor = '#10b981';
        border = '1px solid #059669';
        bg = '#d1fae5';
      }

      const hPct = Math.max(16, Math.round((val / maxVal) * 90));

      return `
        <div style="flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 120px; min-width: 32px; max-width: 60px;">
          <span style="font-size: 11px; font-weight: 800; font-family: monospace; color: #1e293b; margin-bottom: 2px;">${val}</span>
          <div style="width: 80%; height: ${hPct}%; background: ${barColor}; border-radius: 4px 4px 0 0; opacity: 0.9; transition: all 0.2s;"></div>
          <div style="width: 100%; border-top: 2px solid #64748b; text-align: center; padding-top: 2px;">
            <span style="font-size: 9px; font-weight: 700; color: ${isCur || isPopped ? '#dc2626' : '#64748b'}; font-family: monospace;">[${idx}]</span>
          </div>
        </div>
      `;
    })
    .join('');

  return `
    <div style="width: 100%; display: flex; flex-direction: column; gap: 12px; padding: 12px; box-sizing: border-box;">
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 800; color: #475569;">📊 数组柱状辐射分布 (蓝色为当前最小值辐射区间，红色为基准最小值)</span>
          <span style="font-size: 10.5px; background: #ecfdf5; color: #047857; padding: 2px 10px; border-radius: 10px; font-weight: 800; font-family: monospace;">全局最大乘积: ${maxProd}</span>
        </div>
        <div style="display: flex; gap: 4px; align-items: flex-end; justify-content: center; height: 130px; background: #fafafa; border: 1px dashed #e2e8f0; border-radius: 8px; padding: 6px;">
          ${barsHtml}
        </div>
        ${
          curPopped !== null && leftBound !== null && rightBound !== null
            ? `<div style="margin-top: 8px; font-size: 11px; color: #1e293b; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 6px 10px; border-radius: 6px; display: flex; justify-content: space-between; align-items: center;">
                 <span>🎯 以 <strong>nums[${curPopped}]=${nums[curPopped]}</strong> 为最小值：区间 [${leftBound}..${rightBound}]</span>
                 <span style="font-weight: 800; color: #15803d; font-family: monospace;">当前乘积: ${curProd}</span>
               </div>`
            : ''
        }
      </div>

      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; display: flex; flex-direction: column;">
        <span style="font-size: 11px; font-weight: 800; color: #475569; margin-bottom: 8px;">🥞 底到顶单调递增栈 (维护下标)</span>
        <div style="display: flex; gap: 6px; overflow-x: auto; align-items: center; min-height: 38px; background: #f8fafc; padding: 6px; border-radius: 8px; border: 1.5px dashed #cbd5e1; font-family: monospace; font-size: 11px;">
          ${stack.map((i) => `<span style="background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; padding: 2px 8px; border-radius: 4px; font-weight: 700;">[${i}] (值:${nums[i]})</span>`).join('') || '<span style="color:#94a3b8;">空栈</span>'}
        </div>
      </div>
    </div>
  `;
}

