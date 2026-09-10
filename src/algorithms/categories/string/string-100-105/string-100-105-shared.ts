/**
 * 左神算法通关课 100 ~ 105 高阶字符串专题共享沙盘组件
 * 提供字符网格、双指针高亮、Next/Z/回文半径表格渲染与状态卡片
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface String100Step extends StepBase {
  decision: string;
  message: string;
  log: string;
  metrics?: Record<string, string | number>;
  activePointers?: { name: string; index: number; color?: string }[];
  matchIndices?: number[];
  mismatchIndex?: number;
  highlightIndices?: number[];
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

/**
 * 渲染带指针指示器的字符序列块
 */
export function renderCharSequence(
  label: string,
  str: string,
  activeIdx: number = -1,
  highlightIndices: number[] = [],
  matchIndices: number[] = [],
  mismatchIdx: number = -1,
  pointerName: string = ''
): string {
  const chars = str.split('');
  return `
    <div style="margin-bottom: 16px;">
      <div style="font-size: 12px; font-weight: 700; color: #475569; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
        <span>${label} <span style="color: #94a3b8; font-weight: normal;">(长度: ${str.length})</span></span>
        ${pointerName && activeIdx >= 0 ? `<span style="background: #e0e7ff; color: #4338ca; font-size: 11px; padding: 2px 8px; border-radius: 999px;">${pointerName} @ ${activeIdx}</span>` : ''}
      </div>
      <div style="display: flex; gap: 4px; overflow-x: auto; padding-bottom: 8px; scrollbar-width: thin;">
        ${chars.map((ch, idx) => {
          let bg = '#ffffff';
          let border = '#e2e8f0';
          let color = '#1e293b';
          let transform = 'scale(1)';
          let boxShadow = 'none';

          if (idx === mismatchIdx) {
            bg = '#fee2e2';
            border = '#ef4444';
            color = '#b91c1c';
            boxShadow = '0 0 10px rgba(239, 68, 68, 0.4)';
          } else if (matchIndices.includes(idx)) {
            bg = '#dcfce7';
            border = '#22c55e';
            color = '#15803d';
            boxShadow = '0 0 8px rgba(34, 197, 94, 0.3)';
          } else if (idx === activeIdx) {
            bg = '#e0e7ff';
            border = '#6366f1';
            color = '#3730a3';
            transform = 'scale(1.06)';
            boxShadow = '0 4px 12px rgba(99, 102, 241, 0.35)';
          } else if (highlightIndices.includes(idx)) {
            bg = '#fef3c7';
            border = '#f59e0b';
            color = '#92400e';
          }

          return `
            <div style="display: flex; flex-direction: column; align-items: center; min-width: 34px;">
              <span style="font-size: 10px; color: #94a3b8; margin-bottom: 2px; font-family: monospace;">${idx}</span>
              <div style="width: 34px; height: 38px; display: flex; align-items: center; justify-content: center; font-size: 16px; font-weight: 700; background: ${bg}; border: 2px solid ${border}; color: ${color}; border-radius: 8px; box-shadow: ${boxShadow}; transform: ${transform}; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); font-family: 'JetBrains Mono', Consolas, monospace;">
                ${ch}
              </div>
              ${idx === activeIdx && pointerName ? `
                <div style="margin-top: 4px; display: flex; flex-direction: column; align-items: center;">
                  <span style="font-size: 10px; color: #6366f1; line-height: 1;">▲</span>
                  <span style="font-size: 10px; font-weight: 700; color: #6366f1;">${pointerName}</span>
                </div>
              ` : '<div style="height: 16px;"></div>'}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/**
 * 渲染辅助整数表格 (如 Next 数组、Z 数组、P 半径数组、Hash 数组)
 */
export function renderAuxArrayTable(
  title: string,
  str: string,
  arr: number[],
  activeCol: number = -1,
  valLabel: string = '值'
): string {
  const chars = str.split('');
  return `
    <div style="margin-top: 14px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px;">
      <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 8px; display: flex; align-items: center; justify-content: space-between;">
        <span>📊 ${title}</span>
        <span style="font-size: 11px; color: #64748b;">共 ${arr.length} 项</span>
      </div>
      <div style="overflow-x: auto; scrollbar-width: thin;">
        <table style="border-collapse: collapse; width: 100%; text-align: center; font-family: monospace; font-size: 12px;">
          <tbody>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 4px 8px; font-weight: 700; color: #64748b; background: #f1f5f9; text-align: right; min-width: 50px;">下标 i</td>
              ${arr.map((_, idx) => `
                <td style="padding: 4px 6px; color: ${idx === activeCol ? '#6366f1' : '#94a3b8'}; font-weight: ${idx === activeCol ? '700' : 'normal'}; min-width: 30px;">
                  ${idx}
                </td>
              `).join('')}
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 4px 8px; font-weight: 700; color: #64748b; background: #f1f5f9; text-align: right;">字符 s[i]</td>
              ${chars.slice(0, arr.length).map((ch, idx) => `
                <td style="padding: 4px 6px; font-weight: 700; color: ${idx === activeCol ? '#4338ca' : '#1e293b'}; background: ${idx === activeCol ? '#e0e7ff' : 'transparent'};">
                  ${ch}
                </td>
              `).join('')}
            </tr>
            <tr>
              <td style="padding: 4px 8px; font-weight: 700; color: #64748b; background: #f1f5f9; text-align: right;">${valLabel}</td>
              ${arr.map((val, idx) => `
                <td style="padding: 6px; font-weight: 700; color: ${idx === activeCol ? '#ffffff' : '#0f172a'}; background: ${idx === activeCol ? '#6366f1' : val > 0 ? '#eff6ff' : 'transparent'}; border-radius: ${idx === activeCol ? '6px' : '0'};">
                  ${val}
                </td>
              `).join('')}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * 渲染状态说明面板与数学公式卡片
 */
export function renderFormulaCard(
  title: string,
  formula: string,
  explanation: string,
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' }
): string {
  const badgeColors = {
    success: { bg: '#dcfce7', text: '#15803d', border: '#bbf7d0' },
    warning: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
    danger: { bg: '#fee2e2', text: '#b91c1c', border: '#fecaca' },
    info: { bg: '#e0e7ff', text: '#4338ca', border: '#c7d2fe' },
  };

  const badge = statusBadge ? badgeColors[statusBadge.type] : badgeColors.info;

  return `
    <div style="background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid #cbd5e1; border-radius: 12px; padding: 12px 16px; margin-top: 14px;">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
        <span style="font-size: 13px; font-weight: 700; color: #1e293b;">💡 ${title}</span>
        ${statusBadge ? `
          <span style="background: ${badge.bg}; color: ${badge.text}; border: 1px solid ${badge.border}; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px;">
            ${statusBadge.text}
          </span>
        ` : ''}
      </div>
      <div style="font-family: 'JetBrains Mono', Consolas, monospace; background: #ffffff; padding: 8px 12px; border-radius: 8px; border: 1px solid #e2e8f0; font-size: 13px; color: #2563eb; font-weight: 600; margin-bottom: 6px;">
        ${formula}
      </div>
      <div style="font-size: 12px; color: #475569; line-height: 1.5;">
        ${explanation}
      </div>
    </div>
  `;
}
