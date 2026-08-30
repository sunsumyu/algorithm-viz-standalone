/**
 * 数组多轨与双指针画板适配器 (ArrayTrackAdapter)
 * 专门承载「双指针查找/删除/移动」、「滑动窗口」、「有序数组平方」等一维/多轨数组沙盘
 * 严格遵循 Zero-Subbox 规范：直接在浅灰画布上扁平排布，绝不嵌套任何白色边框卡片
 */

export interface ArrayPointerDef {
  name: string;
  index: number;
  color?: string;
  position?: 'top' | 'bottom';
}

export interface ArrayTrackState {
  array: (number | string)[];
  pointers?: ArrayPointerDef[];
  windowRange?: { left: number; right: number; label?: string; color?: string };
  itemHighlights?: Map<number, { bg?: string; border?: string; color?: string; label?: string }>;
  secondaryArray?: (number | string)[];
  secondaryTitle?: string;
  primaryTitle?: string;
}

export class ArrayTrackAdapter {
  /**
   * 渲染数组轨道与指针游标（100% 扁平，零白底嵌套框）
   */
  public static renderTrack(container: HTMLElement, state: ArrayTrackState): void {
    const {
      array,
      pointers = [],
      windowRange,
      itemHighlights = new Map(),
      secondaryArray,
      primaryTitle,
      secondaryTitle,
    } = state;

    const topPointers = pointers.filter((p) => p.position === 'top' || !p.position);
    const bottomPointers = pointers.filter((p) => p.position === 'bottom');

    const renderSingleArray = (arr: (number | string)[], isSecondary = false) => {
      if (arr.length === 0) {
        return `<span style="color: #94a3b8; font-size: 11px; font-style: italic;">空数组</span>`;
      }

      return arr
        .map((val, idx) => {
          const inWindow =
            windowRange &&
            !isSecondary &&
            idx >= windowRange.left &&
            idx <= windowRange.right;

          const custom = itemHighlights.get(idx);

          // 顶部指针标签
          const topPtrs = !isSecondary
            ? topPointers.filter((p) => p.index === idx)
            : [];
          const topPtrsHtml =
            topPtrs.length > 0
              ? topPtrs
                  .map(
                    (p) =>
                      `<span style="font-size: 9.5px; font-weight: 800; color: ${p.color || '#2563eb'}; line-height: 1.1;">▼ ${p.name}</span>`
                  )
                  .join('')
              : `<span style="font-size: 9.5px; opacity: 0; line-height: 1.1;">▼</span>`;

          // 底部指针标签
          const btmPtrs = !isSecondary
            ? bottomPointers.filter((p) => p.index === idx)
            : [];
          const btmPtrsHtml =
            btmPtrs.length > 0
              ? btmPtrs
                  .map(
                    (p) =>
                      `<span style="font-size: 9.5px; font-weight: 800; color: ${p.color || '#0d9488'}; line-height: 1.1;">▲ ${p.name}</span>`
                  )
                  .join('')
              : `<span style="font-size: 9.5px; opacity: 0; line-height: 1.1;">▲</span>`;

          let bg = '#ffffff';
          let border = '#e2e8f0';
          let textColor = '#0f172a';

          if (custom) {
            if (custom.bg) bg = custom.bg;
            if (custom.border) border = custom.border;
            if (custom.color) textColor = custom.color;
          } else if (inWindow) {
            bg = '#eff6ff';
            border = windowRange?.color || '#3b82f6';
            textColor = '#1d4ed8';
          }

          return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 2px;">
              ${topPtrsHtml}
              <span style="font-size: 8.5px; color: #94a3b8; font-weight: 700; font-family: monospace;">[${idx}]</span>
              <div style="min-width: 32px; height: 32px; padding: 0 4px; border-radius: 6px; background: ${bg}; border: 1.5px solid ${border}; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
                ${val}
              </div>
              ${btmPtrsHtml}
            </div>
          `;
        })
        .join('');
    };

    const primaryHtml = renderSingleArray(array, false);
    const secondaryHtml = secondaryArray
      ? renderSingleArray(secondaryArray, true)
      : null;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; width: 100%; height: 100%; justify-content: space-around; gap: 8px; box-sizing: border-box;">
        
        <!-- 主数组轨道 (扁平直排) -->
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 11px; font-weight: 700; color: #334155;">${primaryTitle || '📊 主数组条带 (Array Track):'}</span>
            <span style="font-size: 10.5px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #64748b;">长度: ${array.length}</span>
          </div>
          <div style="display: flex; gap: 4px; overflow-x: auto; padding: 2px 0; align-items: center; min-height: 48px;">
            ${primaryHtml}
          </div>
        </div>

        ${
          secondaryHtml
            ? `
          <div style="border-top: 1px dashed #e2e8f0; margin: 2px 0;"></div>
          <!-- 辅数组轨道 (扁平直排) -->
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <span style="font-size: 11px; font-weight: 700; color: #0d9488;">${secondaryTitle || '📦 辅助输出条带 (Aux Track):'}</span>
              <span style="font-size: 10.5px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #0d9488;">长度: ${secondaryArray?.length ?? 0}</span>
            </div>
            <div style="display: flex; gap: 4px; overflow-x: auto; padding: 2px 0; align-items: center; min-height: 48px;">
              ${secondaryHtml}
            </div>
          </div>
        `
            : ''
        }

      </div>
    `;
  }
}
