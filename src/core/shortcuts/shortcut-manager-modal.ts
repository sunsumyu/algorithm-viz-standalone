/**
 * 快捷键速查与自定义配置可视化面板 (ShortcutManagerModal)
 * 职责：
 * 1. 呈现优雅深色玻璃拟态弹窗，提供 18+ 核心热键的可视化速查
 * 2. 支持按分类、按关键词即时搜索过滤
 * 3. 支持可视化改键录制 (Key Recording) 与冲突检测
 * 4. 支持单项重置、全量恢复默认与配置导出/导入
 */

import {
  shortcutConfigRepo,
  ShortcutConfigRepository,
  ActionWithEffectiveConfig
} from './shortcut-config-repository';
import {
  SHORTCUT_CATEGORIES,
  ShortcutCategory,
  ShortcutActionDefinition
} from './shortcut-schema';
import {
  formatKeyComboDisplay,
  eventToKeyCombo,
  normalizeKeyCombo
} from './key-combo-matcher';
import { shortcutDispatcher } from './shortcut-action-dispatcher';

export class ShortcutManagerModal {
  private static instance: ShortcutManagerModal | null = null;
  private backdropEl: HTMLElement | null = null;
  private isOpen: boolean = false;
  private selectedCategory: ShortcutCategory | 'all' = 'all';
  private searchQuery: string = '';
  private recordingActionId: string | null = null;
  private conflictInfo: { actionId: string; newCombo: string; conflictName: string } | null = null;
  private recordKeydownListener: ((e: KeyboardEvent) => void) | null = null;

  private constructor() {
    this.initHooks();
    shortcutConfigRepo.subscribe(() => {
      if (this.isOpen) {
        this.renderBody();
      }
    });
  }

  public static getInstance(): ShortcutManagerModal {
    if (!ShortcutManagerModal.instance) {
      ShortcutManagerModal.instance = new ShortcutManagerModal();
    }
    return ShortcutManagerModal.instance;
  }

  private initHooks(): void {
    shortcutDispatcher.registerModalHooks(
      () => this.open(),
      () => {
        if (this.isOpen) {
          this.close();
          return true;
        }
        return false;
      }
    );
  }

  public getIsOpen(): boolean {
    return this.isOpen;
  }

  public open(): void {
    this.ensureDOM();
    this.isOpen = true;
    this.recordingActionId = null;
    this.conflictInfo = null;

    if (this.backdropEl) {
      this.backdropEl.classList.add('is-open');
    }

    this.renderHeader();
    this.renderFilterBar();
    this.renderBody();
  }

  public close(): void {
    this.isOpen = false;
    this.stopRecording();
    this.conflictInfo = null;

    if (this.backdropEl) {
      this.backdropEl.classList.remove('is-open');
    }
  }

  public toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  private ensureDOM(): void {
    if (typeof document === 'undefined') return;
    if (this.backdropEl && document.getElementById('shortcut-manager-modal-backdrop')) {
      return;
    }

    let backdrop = document.getElementById('shortcut-manager-modal-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'shortcut-manager-modal-backdrop';
      backdrop.className = 'shortcut-modal-backdrop';

      backdrop.innerHTML = `
        <div class="shortcut-modal-dialog" role="dialog" aria-modal="true" aria-labelledby="shortcut-modal-title">
          <div class="shortcut-modal-header" id="shortcut-modal-header"></div>
          <div class="shortcut-filter-bar" id="shortcut-filter-bar"></div>
          <div class="shortcut-modal-body" id="shortcut-modal-body"></div>
          <div class="shortcut-modal-footer" id="shortcut-modal-footer"></div>
        </div>
      `;

      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          this.close();
        }
      });

      document.body.appendChild(backdrop);
    }

    this.backdropEl = backdrop;
    this.renderFooter();
  }

  private renderHeader(): void {
    const header = this.backdropEl?.querySelector('#shortcut-modal-header');
    if (!header) return;

    header.innerHTML = `
      <div class="shortcut-header-left">
        <span class="shortcut-header-icon">⌨️</span>
        <div>
          <h2 class="shortcut-header-title" id="shortcut-modal-title">快捷键速查与自定义配置</h2>
          <p class="shortcut-header-sub">全局支持单键、组合键演练、关卡切换与代码终端热键操作</p>
        </div>
      </div>
      <div class="shortcut-header-tools">
        <button class="shortcut-modal-close-btn" id="btn-close-shortcut-modal" title="关闭面板 (Esc)">✕</button>
      </div>
    `;

    header.querySelector('#btn-close-shortcut-modal')?.addEventListener('click', () => this.close());
  }

  private renderFilterBar(): void {
    const bar = this.backdropEl?.querySelector('#shortcut-filter-bar');
    if (!bar) return;

    bar.innerHTML = `
      <div class="shortcut-search-box">
        <span class="shortcut-search-icon">🔍</span>
        <input 
          type="text" 
          id="shortcut-search-input" 
          class="shortcut-search-input" 
          placeholder="搜索动作名称、说明或按键 (如 Space, 下一题, 终端)..."
          value="${this.searchQuery}"
        />
      </div>
      <div class="shortcut-category-tabs">
        <button class="shortcut-cat-btn ${this.selectedCategory === 'all' ? 'active' : ''}" data-cat="all">
          全部
        </button>
        <button class="shortcut-cat-btn ${this.selectedCategory === 'playback' ? 'active' : ''}" data-cat="playback">
          ⏯️ 播放
        </button>
        <button class="shortcut-cat-btn ${this.selectedCategory === 'navigation' ? 'active' : ''}" data-cat="navigation">
          🧭 导航
        </button>
        <button class="shortcut-cat-btn ${this.selectedCategory === 'terminal' ? 'active' : ''}" data-cat="terminal">
          💻 终端
        </button>
        <button class="shortcut-cat-btn ${this.selectedCategory === 'general' ? 'active' : ''}" data-cat="general">
          ⚙️ 全局
        </button>
      </div>
    `;

    // 绑定搜索输入
    const input = bar.querySelector('#shortcut-search-input') as HTMLInputElement | null;
    input?.addEventListener('input', (e) => {
      this.searchQuery = (e.target as HTMLInputElement).value.trim();
      this.renderBody();
    });

    // 绑定分类切换
    bar.querySelectorAll('.shortcut-cat-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        this.selectedCategory = btn.getAttribute('data-cat') as ShortcutCategory | 'all';
        this.renderFilterBar();
        this.renderBody();
      });
    });
  }

  private renderBody(): void {
    const body = this.backdropEl?.querySelector('#shortcut-modal-body');
    if (!body) return;

    const allActions = shortcutConfigRepo.getAllActionsWithEffectiveConfig();
    const query = this.searchQuery.toLowerCase();

    // 过滤动作
    const filtered = allActions.filter((item) => {
      if (this.selectedCategory !== 'all' && item.category !== this.selectedCategory) {
        return false;
      }
      if (!query) return true;

      const nameMatch = item.name.toLowerCase().includes(query);
      const descMatch = item.description.toLowerCase().includes(query);
      const comboMatch = item.effectiveCombo.toLowerCase().includes(query);
      const aliasMatch = item.aliases?.some((a) => a.toLowerCase().includes(query));
      return nameMatch || descMatch || comboMatch || aliasMatch;
    });

    let html = '';

    // 如果有冲突警告，先渲染冲突提示框
    if (this.conflictInfo) {
      html += `
        <div class="shortcut-conflict-alert">
          <div>
            ⚠️ 快捷键 <strong>${this.conflictInfo.newCombo}</strong> 已被「${this.conflictInfo.conflictName}」占用。
          </div>
          <div style="display:flex; gap:8px;">
            <button class="shortcut-footer-btn primary" id="btn-force-rebind" style="padding:4px 8px; font-size:11px;">强制覆盖</button>
            <button class="shortcut-footer-btn" id="btn-cancel-conflict" style="padding:4px 8px; font-size:11px;">取消</button>
          </div>
        </div>
      `;
    }

    if (filtered.length === 0) {
      html += `
        <div style="text-align: center; padding: 40px 0; color: #64748b;">
          <div style="font-size: 32px; margin-bottom: 8px;">🔍</div>
          <div>未找到匹配的快捷键动作</div>
        </div>
      `;
      body.innerHTML = html;
      return;
    }

    // 按分类分组渲染
    const categoriesToRender: ShortcutCategory[] =
      this.selectedCategory === 'all'
        ? ['playback', 'navigation', 'terminal', 'general']
        : [this.selectedCategory];

    categoriesToRender.forEach((cat) => {
      const itemsInCat = filtered.filter((i) => i.category === cat);
      if (itemsInCat.length === 0) return;

      const catInfo = SHORTCUT_CATEGORIES[cat];
      html += `
        <div class="shortcut-group-block">
          <div class="shortcut-group-header">
            <span>${catInfo.icon}</span>
            <span>${catInfo.name}</span>
          </div>
          <div class="shortcut-action-grid">
      `;

      itemsInCat.forEach((action) => {
        const isRecording = this.recordingActionId === action.id;
        const badges = formatKeyComboDisplay(action.effectiveCombo);
        const badgesHtml = badges
          .map((b) => `<kbd class="shortcut-kbd ${action.isCustom ? 'is-custom' : ''}">${b}</kbd>`)
          .join('');

        html += `
          <div class="shortcut-action-card ${isRecording ? 'is-recording' : ''}" data-action-id="${action.id}">
            <div class="shortcut-action-info">
              <span class="shortcut-action-icon">${action.icon || '⚡'}</span>
              <div class="shortcut-action-texts">
                <div class="shortcut-action-name">${action.name}</div>
                <div class="shortcut-action-desc">${action.description}</div>
              </div>
            </div>

            <div class="shortcut-action-controls">
              <div class="shortcut-key-badges">
                ${badgesHtml}
              </div>

              <button 
                class="shortcut-edit-btn ${isRecording ? 'recording' : ''}" 
                data-rebind-id="${action.id}"
                title="${isRecording ? '按 Esc 取消录制' : '修改此动作快捷键'}"
              >
                ${isRecording ? '请按新键...' : '修改'}
              </button>

              ${
                action.isCustom
                  ? `<button class="shortcut-reset-btn" data-reset-id="${action.id}" title="恢复默认按键">↩</button>`
                  : ''
              }
            </div>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    });

    body.innerHTML = html;

    // 绑定改键与重置按钮
    body.querySelectorAll('[data-rebind-id]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const actionId = btn.getAttribute('data-rebind-id')!;
        if (this.recordingActionId === actionId) {
          this.stopRecording();
        } else {
          this.startRecording(actionId);
        }
      });
    });

    body.querySelectorAll('[data-reset-id]').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const actionId = btn.getAttribute('data-reset-id')!;
        shortcutConfigRepo.resetAction(actionId);
      });
    });

    // 绑定冲突覆盖
    body.querySelector('#btn-force-rebind')?.addEventListener('click', () => {
      if (this.conflictInfo) {
        shortcutConfigRepo.setCustomCombo(this.conflictInfo.actionId, this.conflictInfo.newCombo, true);
        this.conflictInfo = null;
        this.renderBody();
      }
    });

    body.querySelector('#btn-cancel-conflict')?.addEventListener('click', () => {
      this.conflictInfo = null;
      this.renderBody();
    });
  }

  private renderFooter(): void {
    const footer = this.backdropEl?.querySelector('#shortcut-modal-footer');
    if (!footer) return;

    footer.innerHTML = `
      <div class="shortcut-footer-left">
        <button class="shortcut-footer-btn" id="btn-shortcut-reset-all" title="重置全部快捷键为系统出厂设置">
          🔄 恢复全部默认
        </button>
        <button class="shortcut-footer-btn" id="btn-shortcut-export" title="导出当前快捷键配置为 JSON">
          📤 导出配置
        </button>
        <button class="shortcut-footer-btn" id="btn-shortcut-import" title="从 JSON 导入快捷键配置">
          📥 导入配置
        </button>
      </div>

      <button class="shortcut-footer-btn primary" id="btn-shortcut-done">
        完成
      </button>
    `;

    footer.querySelector('#btn-shortcut-reset-all')?.addEventListener('click', () => {
      if (confirm('确定要恢复所有快捷键为系统默认配置吗？')) {
        shortcutConfigRepo.resetAll();
      }
    });

    footer.querySelector('#btn-shortcut-export')?.addEventListener('click', () => {
      const json = shortcutConfigRepo.exportConfig();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `algorithm-viz-shortcuts-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    footer.querySelector('#btn-shortcut-import')?.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (re) => {
            const content = re.target?.result as string;
            if (content && shortcutConfigRepo.importConfig(content)) {
              alert('快捷键配置导入成功！');
            } else {
              alert('导入失败，请检查 JSON 文件格式');
            }
          };
          reader.readAsText(file);
        }
      };
      input.click();
    });

    footer.querySelector('#btn-shortcut-done')?.addEventListener('click', () => this.close());
  }

  private startRecording(actionId: string): void {
    this.stopRecording();
    this.recordingActionId = actionId;
    this.conflictInfo = null;
    this.renderBody();

    this.recordKeydownListener = (e: KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (e.key === 'Escape') {
        this.stopRecording();
        return;
      }

      // 忽略单独的修饰键按下
      if (['Control', 'Alt', 'Shift', 'Meta'].includes(e.key)) {
        return;
      }

      const combo = eventToKeyCombo(e);
      if (!combo) return;

      const result = shortcutConfigRepo.setCustomCombo(actionId, combo);
      if (!result.success && result.conflictAction) {
        this.conflictInfo = {
          actionId,
          newCombo: combo,
          conflictName: result.conflictAction.name
        };
        this.stopRecording(false);
      } else {
        this.stopRecording();
      }
    };

    window.addEventListener('keydown', this.recordKeydownListener, { capture: true });
  }

  private stopRecording(shouldRerender: boolean = true): void {
    if (this.recordKeydownListener) {
      window.removeEventListener('keydown', this.recordKeydownListener, { capture: true });
      this.recordKeydownListener = null;
    }
    this.recordingActionId = null;
    if (shouldRerender) {
      this.renderBody();
    }
  }
}

export const shortcutManagerModal = ShortcutManagerModal.getInstance();
