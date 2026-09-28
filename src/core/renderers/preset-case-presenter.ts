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
   * 顶层抽象规约：解析并自愈算法的预设案例列表。
   * 1. 显式优先：若 Spec 中声明了非空 presets，直接采用。
   * 2. 自动自愈规约：若存在 inputs 但未显式提供 presets，自动由 inputs 的 defaultValue 规约出基准案例，
   *    确保全库所有具备输入控件的算法 100% 自动接入「案例: 选择案例... ⌵」顶层下拉交互。
   */
  public static resolvePresets(
    presets?: PresetCaseDef[],
    inputs?: Array<{ id: string; defaultValue: any; type?: string; options?: { label: string; value: any }[] }>
  ): PresetCaseDef[] {
    if (presets && presets.length > 0) {
      return presets;
    }
    if (!inputs || inputs.length === 0) {
      return [];
    }

    const defaultValues: Record<string, any> = {};
    inputs.forEach((input) => {
      defaultValues[input.id] = input.defaultValue ?? '';
    });

    const inferred: PresetCaseDef[] = [
      {
        label: '标准基准用例 (默认)',
        values: { ...defaultValues },
        description: '系统基于标准参数自动规约的基准推导案例',
      },
    ];

    const altValues: Record<string, any> = { ...defaultValues };
    let hasAlt = false;
    for (const input of inputs) {
      if (input.type === 'select' && input.options && input.options.length > 1) {
        altValues[input.id] = input.options[1].value;
        hasAlt = true;
      }
    }

    if (hasAlt) {
      inferred.push({
        label: '备选变体用例',
        values: altValues,
        description: '切换不同分支选项的变体案例',
      });
    }

    return inferred;
  }

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

  /**
   * 将字符串如 `nums = [1, 5, 11, 5]` 或 `m = 3, n = 7` 解析为键值对字典
   */
  public static parseInputString(inputStr?: string): Record<string, any> {
    if (!inputStr || typeof inputStr !== 'string') return {};
    const res: Record<string, any> = {};
    const regex = /([a-zA-Z0-9_]+)\s*=\s*(\[[^\]]*\]|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[^,\n\r;]+)/g;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(inputStr)) !== null) {
      const key = match[1].trim();
      let rawVal = match[2].trim();
      if (rawVal.startsWith('[') && rawVal.endsWith(']')) {
        try {
          res[key] = JSON.parse(rawVal.replace(/'/g, '"'));
        } catch {
          res[key] = rawVal.slice(1, -1).split(',').map((s) => {
            const trimmed = s.trim();
            const num = Number(trimmed);
            return isNaN(num) ? trimmed : num;
          });
        }
      } else if ((rawVal.startsWith('"') && rawVal.endsWith('"')) || (rawVal.startsWith("'") && rawVal.endsWith("'"))) {
        res[key] = rawVal.slice(1, -1);
      } else if (rawVal === 'true') {
        res[key] = true;
      } else if (rawVal === 'false') {
        res[key] = false;
      } else if (!isNaN(Number(rawVal)) && rawVal !== '') {
        res[key] = Number(rawVal);
      } else {
        res[key] = rawVal;
      }
    }
    return res;
  }

  /**
   * 从 YAML 模型中解析预设案例列表 (从 problem.examples 及 defaultParams 自动自愈规约)
   */
  public static resolveFromModel(model: any): PresetCaseDef[] {
    if (!model) return [];
    if (model.presets && Array.isArray(model.presets) && model.presets.length > 0) {
      return model.presets;
    }
    const presets: PresetCaseDef[] = [];
    const defaultParams = model.defaultParams || {};
    const examples = model.problem?.examples || [];

    for (let idx = 0; idx < examples.length; idx++) {
      const ex = examples[idx];
      const parsedValues = this.parseInputString(ex.input);
      const label = ex.input ? ex.input.trim() : `示例 ${idx + 1}`;
      presets.push({
        label,
        values: Object.keys(parsedValues).length > 0 ? parsedValues : { ...defaultParams },
        description: ex.explanation || `示例 ${idx + 1}`
      });
    }

    if (presets.length === 0 && Object.keys(defaultParams).length > 0) {
      const labelParts: string[] = [];
      for (const [k, v] of Object.entries(defaultParams)) {
        const valStr = Array.isArray(v) ? `[${v.join(', ')}]` : (typeof v === 'string' ? `"${v}"` : String(v));
        labelParts.push(`${k} = ${valStr}`);
      }
      presets.push({
        label: labelParts.join(', ') || '默认参数',
        values: { ...defaultParams },
        description: '算法默认基准用例'
      });
    }

    return presets;
  }

  /**
   * 自动探测与当前参数最匹配的预设案例索引
   */
  public static findMatchingPresetIndex(presets: PresetCaseDef[], currentParams?: Record<string, any>): number {
    if (!presets || presets.length === 0 || !currentParams) return 0;
    const matchIdx = presets.findIndex((p) => {
      if (!p.values) return false;
      const keys = Object.keys(p.values);
      if (keys.length === 0) return false;
      return keys.every((k) => {
        const v1 = p.values[k];
        const v2 = currentParams[k];
        if (Array.isArray(v1) && Array.isArray(v2)) {
          return v1.length === v2.length && v1.every((val, i) => val === v2[i]);
        }
        return String(v1) === String(v2);
      });
    });
    return matchIdx >= 0 ? matchIdx : 0;
  }

  /**
   * 纯函数：根据预设案例配置列表编译生成全屏自适应/Tailwind 风格的标准下拉选框 HTML 骨架
   */
  public static renderTailwindSelectHtml(
    presets?: PresetCaseDef[],
    selectedIndex: number = 0,
    options?: { selectId?: string; labelText?: string; maxWidth?: string }
  ): string {
    if (!presets || presets.length === 0) {
      return '';
    }

    const selectId = options?.selectId || 'stage-preset-select';
    const labelText = options?.labelText || this.DEFAULT_LABEL_TEXT;
    const maxWidth = options?.maxWidth || '240px';

    const optionsHtml = presets
      .map((p, idx) => {
        const isSelected = idx === selectedIndex;
        const cleanLabel = (p.label || `案例 ${idx + 1}`)
          .replace(/\(.*\)/, '')
          .replace(/（.*）/, '')
          .trim();
        const descAttr = p.description ? ` title="${escapeAttr(p.description)}"` : '';
        return `<option value="${idx}"${isSelected ? ' selected' : ''}${descAttr}>${escapeHtml(cleanLabel)}</option>`;
      })
      .join('');

    return `
      <div class="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-xl border border-slate-200 text-xs shadow-2xs flex-shrink-0" id="preset-select-wrapper">
        <span class="text-slate-500 font-semibold text-[11px] flex-shrink-0">${escapeHtml(labelText)}</span>
        <select id="${selectId}" class="bg-white border border-slate-300 rounded px-1.5 py-0.5 text-slate-800 font-semibold text-xs focus:outline-none focus:border-blue-500 shadow-2xs truncate cursor-pointer" style="max-width: ${maxWidth};" title="选择测试案例">
          ${optionsHtml}
        </select>
      </div>
    `;
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
