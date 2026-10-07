/**
 * 双堆巴什博弈与 SG 矩阵 (Two Stones Bash Game) Canvas Adapter
 */

import { TwoStonesBashStep } from './two-stones-bash-096-step-compiler';
import { renderPlayerBanner } from '../../../algorithms/categories/game/game-096/game-096-shared';

export class TwoStonesBash096CanvasAdapter {
  render(stageContainer: HTMLElement, step: TwoStonesBashStep): void {
    stageContainer.innerHTML = '';

    const root = document.createElement('div');
    root.style.cssText = 'display: flex; flex-direction: column; gap: 12px; width: 100%; height: 100%; box-sizing: border-box;';

    // 1. 胜负判定 Banner
    const statusText = step.isFirstWin === undefined
      ? '推演中...'
      : step.isFirstWin
      ? `SG(总) = ${step.xorSum} != 0 ➔ 先手必胜`
      : 'SG(总) = 0 ➔ 局势对称 (先手必败)';
    const formulaText = `SG = (${step.n1} % ${step.m + 1}) ^ (${step.n2} % ${step.m + 1}) = ${step.sg1} ^ ${step.sg2} = ${step.xorSum}`;
    renderPlayerBanner(root, step.isFirstWin ?? false, statusText, formulaText);

    // 2. 二维 SG 矩阵热力图展示
    const matrixCard = document.createElement('div');
    matrixCard.style.cssText = 'padding: 12px 16px; background: #ffffff; border-radius: 8px; border: 1px solid #e2e8f0; overflow: auto;';

    const maxR = Math.min(10, Math.max(step.n1, step.n2, 6));
    let rowsHtml = '';

    // 矩阵头
    let headerCells = '<th style="padding: 4px 6px; font-size: 10px; color: #64748b; font-family: monospace;">n1\\n2</th>';
    for (let c = 0; c <= maxR; c++) {
      headerCells += `<th style="padding: 4px 6px; font-size: 10px; color: ${c === step.n2 ? '#2563eb' : '#64748b'}; font-family: monospace; font-weight: 700;">${c}</th>`;
    }
    rowsHtml += `<tr>${headerCells}</tr>`;

    for (let r = 0; r <= maxR; r++) {
      let cells = `<td style="padding: 4px 6px; font-size: 10px; color: ${r === step.n1 ? '#2563eb' : '#64748b'}; font-family: monospace; font-weight: 700;">${r}</td>`;
      for (let c = 0; c <= maxR; c++) {
        const val = (r % (step.m + 1)) ^ (c % (step.m + 1));
        const isTarget = r === step.n1 && c === step.n2;
        const isZero = val === 0;

        let bg = isZero ? '#fef2f2' : '#f0fdf4';
        let border = isZero ? '#fca5a5' : '#bbf7d0';
        let color = isZero ? '#b91c1c' : '#15803d';

        if (isTarget) {
          bg = '#3b82f6';
          border = '#1d4ed8';
          color = '#ffffff';
        }

        cells += `
          <td style="padding: 3px 6px; text-align: center; background: ${bg}; border: 1px solid ${border}; font-family: monospace; font-size: 11px; font-weight: 700; color: ${color};">
            ${val}
          </td>
        `;
      }
      rowsHtml += `<tr>${cells}</tr>`;
    }

    matrixCard.innerHTML = `
      <div style="font-weight: 700; color: #0f172a; margin-bottom: 6px; font-size: 12px; display: flex; justify-content: space-between;">
        <span>🌐 双堆 SG 二维状态热力矩阵 [SG(r, c) = (r % ${step.m + 1}) ^ (c % ${step.m + 1})]</span>
        <span style="font-size: 11px; color: #64748b;">红色=0 (必败) | 绿色>0 (必胜) | 蓝色=当前坐标</span>
      </div>
      <table style="border-collapse: collapse; margin: 0 auto;">${rowsHtml}</table>
      <div style="margin-top: 8px; font-size: 12px; color: #475569; background: #f8fafc; padding: 6px 12px; border-radius: 6px; border-left: 3px solid #3b82f6;">
        ${step.decision}
      </div>
    `;
    root.appendChild(matrixCard);

    stageContainer.appendChild(root);
  }
}

export const twoStonesBash096CanvasAdapter = new TwoStonesBash096CanvasAdapter();
