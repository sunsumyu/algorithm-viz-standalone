/**
 * 有依赖的背包(模版) (洛谷 P1064 金明的预算方案 / 左程云 Class 073 Code05)
 * Canvas Adapter: 主附件互斥展开方案卡片与金明预算载荷舱
 */

import { renderKnapsackDpMatrix } from '../knapsack-sandbox-stage';
import { type DependentKnapsackStep } from './dependent-knapsack-step-compiler';

export function renderDependentKnapsackBoard(
  container: HTMLElement,
  step: DependentKnapsackStep
): void {
  const combosHtml =
    step.combos.length > 0
      ? step.combos
          .map((cb) => {
            const isChosen = step.chosenCombo.includes(cb.label);
            let bg = 'rgba(241, 245, 249, 0.9)';
            let border = '#334155';
            let badge = '<span style="color:#64748b; font-size:9px;">备选组合</span>';

            if (isChosen) {
              bg = 'rgba(6, 95, 70, 0.4)';
              border = '#10b981';
              badge =
                '<span style="background:#059669; color:#fff; font-size:9px; padding:1px 5px; border-radius:3px; font-weight:bold;">✔ 本步最优</span>';
            }

            return `
              <div style="background:${bg}; border:1.5px solid ${border}; border-radius:8px; padding:8px 12px; min-width:130px; flex:1; max-width:200px; display:flex; flex-direction:column; gap:3px;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <span style="font-size:11px; font-weight:700; color:#374151;">${cb.label}</span>
                  ${badge}
                </div>
                <div style="display:flex; justify-content:space-between; font-size:10.5px; margin-top:2px;">
                  <span style="color:#64748b;">耗资: <b style="color:#38bdf8;">${cb.cost}</b></span>
                  <span style="color:#10b981;">满足度: <b>+${cb.val}</b></span>
                </div>
              </div>
            `;
          })
          .join('')
      : `<span style="color:#64748b; font-size:11px;">(当前无展开方案或已决策完毕)</span>`;

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:12px; width:100%; height:100%; justify-content:flex-start; align-items:stretch; background:#f8fafc; padding:12px; border-radius:8px; box-sizing:border-box; overflow-y:auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">
        <div style="font-size:12px; color:#64748b; font-weight:700;">🛍️ 主件及其归属附件展开方案 (至多 4 种互斥组合)</div>
        <div style="font-size:11px; color:#374151; background:#e8f0fe; padding:2px 8px; border-radius:4px; border:1px solid #e2e8f0;">
          当前考察预算: <b style="color:#38bdf8;">${step.j >= 0 ? step.j : '—'}</b> / ${step.dp.length - 1}
        </div>
      </div>

      <div style="display:flex; flex-wrap:wrap; gap:8px; justify-content:center;">
        ${combosHtml}
      </div>

      <!-- 底部实时预算载荷舱 -->
      <div style="background:#eff6ff; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:11.5px; font-weight:800; color:#374151;">🛍️ 金明预算载荷舱</span>
          <div style="display:flex; gap:16px; font-size:11px;">
            <span>当前决策组合: <b style="color:#10b981;">${step.chosenCombo}</b></span>
            <span>累计满足度: <b style="color:#f59e0b;">${step.maxVal}</b></span>
          </div>
        </div>
      </div>
    </div>
  `;
}

export function renderDependentKnapsackMetrics(
  container: HTMLElement,
  step: DependentKnapsackStep
): void {
  renderKnapsackDpMatrix(
    container,
    {
      ...step,
      items: [],
      currentGroupItems: [],
      selectedItems: [],
      groupIndex: step.groupIndex,
      itemIndex: -1,
    },
    `分组背包收益 DP 向量 dp[0..${step.dp.length - 1}]`
  );
}
