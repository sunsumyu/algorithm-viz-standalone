import { type SumSubarrayMinimumsStep } from './sum-subarray-minimums-052-step-compiler';

export function renderSumSubarrayMinimumsCanvas(container: HTMLElement, step: SumSubarrayMinimumsStep): void {
  const arr = step.arr;
  const n = arr.length;
  const curI = step.curI;
  const calc = step.currentCalc;

  if (n === 0) {
    container.innerHTML = '<div style="padding: 16px; color: #94a3b8; font-size: 12px; text-align: center;">输入为空</div>';
    return;
  }

  const cardsHtml = arr
    .map((val, idx) => {
      const isCur = idx === curI;
      const isSettledTarget = calc?.idx === idx;
      const inRange = calc && idx > calc.left && idx < calc.right;
      const isLeftBound = calc && idx === calc.left;
      const isRightBound = calc && idx === calc.right;

      let cardBg = '#f8fafc';
      let border = '1px solid #e2e8f0';
      let textColor = '#334155';
      let badge = '';

      if (isSettledTarget) {
        cardBg = '#fef3c7';
        border = '2px solid #f59e0b';
        textColor = '#b45309';
        badge = '⭐ 最小值';
      } else if (isCur) {
        cardBg = '#ffedd5';
        border = '2px solid #ea580c';
        textColor = '#c2410c';
        badge = '🔍 考察中';
      } else if (isLeftBound) {
        cardBg = '#f1f5f9';
        border = '1.5px dashed #64748b';
        textColor = '#64748b';
        badge = 'L 开界';
      } else if (isRightBound) {
        cardBg = '#f1f5f9';
        border = '1.5px dashed #64748b';
        textColor = '#64748b';
        badge = 'R 闭界';
      } else if (inRange) {
        cardBg = '#ecfdf5';
        border = '1.5px solid #a7f3d0';
        textColor = '#047857';
      }

      return `
        <div style="flex: 1; min-width: 44px; max-width: 68px; display: flex; flex-direction: column; align-items: center; gap: 2px;">
          <div style="width: 100%; height: 56px; border-radius: 8px; background: ${cardBg}; border: ${border}; display: flex; flex-direction: column; align-items: center; justify-content: center; transition: all 0.2s;">
            <span style="font-size: 14px; font-weight: 800; color: ${textColor}; font-family: monospace;">${val}</span>
            ${badge ? `<span style="font-size: 8px; font-weight: 800; color: ${textColor};">${badge}</span>` : ''}
          </div>
          <span style="font-size: 9px; color: #94a3b8; font-family: monospace;">[${idx}]</span>
        </div>
      `;
    })
    .join('');

  const tableRowsHtml = step.contributions
    .map((c) => {
      return `
        <tr style="border-bottom: 1px solid #f1f5f9; font-size: 11px; font-family: monospace;">
          <td style="padding: 4px 8px; color: #0284c7; font-weight: 800;">arr[${c.idx}] = ${c.val}</td>
          <td style="padding: 4px 8px; color: #64748b;">${c.left === -1 ? '-1 (边界)' : `arr[${c.left}]`}</td>
          <td style="padding: 4px 8px; color: #64748b;">${c.right === n ? `${n} (边界)` : `arr[${c.right}]`}</td>
          <td style="padding: 4px 8px; color: #059669; font-weight: 700;">${c.count} 种</td>
          <td style="padding: 4px 8px; color: #ea580c; font-weight: 800;">+${c.contribution}</td>
        </tr>
      `;
    })
    .join('');

  const calcBanner = calc
    ? `
      <div style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 8px; padding: 6px 12px; display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-family: monospace;">
        <span style="color: #1d4ed8; font-weight: 800;">🎯 贡献公式:</span>
        <span style="color: #1e40af;">(${calc.idx} - ${calc.left}) × (${calc.right} - ${calc.idx}) × ${calc.val} = ${calc.count} × ${calc.val} = <strong>${calc.contribution}</strong></span>
        <span style="background: #2563eb; color: #fff; padding: 2px 8px; border-radius: 4px; font-weight: 800;">当前总和: ${step.totalSum}</span>
      </div>
    `
    : `
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; font-size: 11px; color: #64748b; font-family: monospace; display: flex; justify-content: space-between;">
        <span>单调递增栈正在界定左右辐射边界...</span>
        <span>当前累计总和: <strong style="color: #ea580c;">${step.totalSum}</strong></span>
      </div>
    `;

  container.innerHTML = `
    <div style="width: 100%; display: flex; flex-direction: column; gap: 12px; padding: 12px; box-sizing: border-box;">
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 800; color: #475569;">📊 数组序列与辐射开闭区间</span>
          <span style="font-size: 10px; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 12px; font-weight: 700;">🌟 贡献法: (i - L) × (R - i) × arr[i]</span>
        </div>
        <div style="display: gap: 6px; overflow-x: auto; padding: 6px 0; justify-content: space-around; align-items: center;">
          ${cardsHtml}
        </div>
        <div style="margin-top: 8px;">
          ${calcBanner}
        </div>
      </div>

      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; display: flex; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 800; color: #475569;">📋 各位置元素贡献明细表</span>
          <span style="font-size: 10px; color: #059669; font-weight: 700;">已结算项: ${step.contributions.length} / ${n}</span>
        </div>
        <div style="max-height: 140px; overflow-y: auto;">
          <table style="width: 100%; border-collapse: collapse; text-align: left;">
            <thead>
              <tr style="border-bottom: 1.5px solid #e2e8f0; font-size: 10px; color: #64748b;">
                <th style="padding: 4px 8px;">最小值位置</th>
                <th style="padding: 4px 8px;">左边界 L</th>
                <th style="padding: 4px 8px;">右边界 R</th>
                <th style="padding: 4px 8px;">辐射子数组数量</th>
                <th style="padding: 4px 8px;">所作贡献值</th>
              </tr>
            </thead>
            <tbody>
              ${tableRowsHtml || '<tr><td colspan="5" style="text-align:center;padding:16px;color:#94a3b8;font-size:11px;">尚无元素完成贡献结算</td></tr>'}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
