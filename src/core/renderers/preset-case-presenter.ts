/**
 * Shared 预设案例下拉选框呈现器 (PresetCasePresenter)
 * 遵循 LSP 与 OCP 原则：
 * 统一作为全局预设用例下拉选框的渲染与交互接缝，
 * 算法无需手写重复 DOM 或事件绑定，仅需在各自配置文件中声明 presets 数据即可获得标准化下拉支持。
 */

export interface PresetCaseDef {
  label: string;
  values: Record<string, any>;
  description?: string;
}

export interface PresetSelectRenderOptions {
  selectId?: string;
  groupId?: string;
  labelText?: string;
  placeholder?: string;
  maxWidth?: string;
  fontSize?: string;
}

export class PresetCasePresenter {
  public static readonly DEFAULT_SELECT_ID = 'dsp-preset-select';
  public static readonly DEFAULT_LABEL_TEXT = '案例:';
  public static readonly DEFAULT_PLACEHOLDER = '选择案例...';

  /**
   * 纯函数：根据预设案例配置列表编译生成标准下拉选框 HTML 骨架
   */
  public static renderSelectHtml(
    presets?: PresetCaseDef[],
    options?: PresetSelectRenderOptions
  ): string {
    if (!presets || presets.length === 0) {
      return '';
    }

    const selectId = options?.selectId || this.DEFAULT_SELECT_ID;
    const labelText = options?.labelText || this.DEFAULT_LABEL_TEXT;
    const placeholder = options?.placeholder || this.DEFAULT_PLACEHOLDER;
    const maxWidth = options?.maxWidth || '95px';
    const fontSize = options?.fontSize || '11px';

    const optionsHtml = presets
      .map((p, idx) => {
        // 清理括号中的冗余说明，保证在下拉框中显示紧凑精炼
        const cleanLabel = (p.label || `案例 ${idx + 1}`)
          .replace(/\(.*\)/, '')
          .replace(/（.*）/, '')
          .trim();
        const descAttr = p.description ? ` title="${escapeAttr(p.description)}"` : '';
        return `<option value="${idx}"${descAttr}>${escapeHtml(cleanLabel)}</option>`;
      })
      .join('');

    return `
      <div class="dsp-input-group dsp-preset-select-group">
        <label for="${selectId}" style="color:#64748b;">${escapeHtml(labelText)}</label>
        <select id="${selectId}" class="dsp-select dsp-preset-select" title="快速填入典型测试案例" style="max-width: ${maxWidth}; font-size: ${fontSize};">
          <option value="" disabled selected>${escapeHtml(placeholder)}</option>
          ${optionsHtml}
        </select>
      </div>
    `;
  }

  /**
   * 统一绑定预设案例下拉选框的交互事件
   * 用户选择案例后，自动将对应键值填入页面中的 input / select，并触发 onApply 回调
   */
  public static bindSelect(
    root: HTMLElement | null,
    presets: PresetCaseDef[] | undefined,
    onApply: (values: Record<string, any>, selectedPreset: PresetCaseDef) => void,
    selectId: string = this.DEFAULT_SELECT_ID
  ): HTMLSelectElement | null {
    if (!root || !presets || presets.length === 0) {
      return null;
    }

    const selectEl = root.querySelector(`#${selectId}`) as HTMLSelectElement | null;
    if (!selectEl) {
      return null;
    }

    selectEl.addEventListener('change', () => {
      const idx = parseInt(selectEl.value, 10);
      if (isNaN(idx) || !presets[idx]) {
        return;
      }

      const preset = presets[idx];
      const values = preset.values || {};

      // 批量将预设值注入到对应的 DOM 输入控件中
      Object.keys(values).forEach((key) => {
        const input = root.querySelector(`#${key}`) as HTMLInputElement | HTMLSelectElement | null;
        if (input) {
          input.value = String(values[key]);
          // 触发 input 事件以支持防抖监听器或关联联动
          if (typeof Event !== 'undefined') {
            try {
              input.dispatchEvent(new Event('change', { bubbles: true }));
            } catch {}
          }
        }
      });

      // 触发回调以重新执行算法
      onApply(values, preset);
    });

    return selectEl;
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(str: string): string {
  return str.replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
