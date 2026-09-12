/**
 * 统一暗色代码终端 — DOM 骨架构建 (DarkCodeTerminalDom)
 * 从 dark-code-terminal-presenter 拆出的构建层：
 * createSafeElement（SSR/测试环境安全元素工厂）与 ensureTerminalSkeleton（终端骨架自动注入）。
 */

import { TAB_CODE_ICON, TAB_PROBLEM_ICON, TAB_ANALYSIS_ICON } from './dark-code-terminal-types';

export function createSafeElement(tag: string, id: string = ''): any {
  const d = typeof document !== 'undefined' ? document : (globalThis as any).document;
  if (d && typeof d.createElement === 'function') {
    const el = d.createElement(tag);
    if (id) el.id = id;
    return el;
  }
  const el: any = {
    id,
    tagName: tag.toUpperCase(),
    className: '',
    textContent: '',
    _innerHTML: '',
    dataset: {},
    style: {},
    children: [],
    listeners: {},
    classList: {
      _classes: new Set<string>(),
      _sync: function () {
        if (el.className) {
          el.className.split(/\s+/).forEach((c: string) => {
            if (c) this._classes.add(c);
          });
        }
      },
      add: function (...cls: string[]) {
        this._sync();
        cls.forEach((c) => this._classes.add(c));
        el.className = Array.from(this._classes).join(' ');
      },
      remove: function (...cls: string[]) {
        this._sync();
        cls.forEach((c) => this._classes.delete(c));
        el.className = Array.from(this._classes).join(' ');
      },
      contains: function (c: string) {
        this._sync();
        return this._classes.has(c);
      },
      toggle: function (c: string, force?: boolean) {
        this._sync();
        const has = this._classes.has(c);
        const shouldAdd = force !== undefined ? force : !has;
        if (shouldAdd) this._classes.add(c);
        else this._classes.delete(c);
        el.className = Array.from(this._classes).join(' ');
        return shouldAdd;
      },
    },
    get innerHTML() {
      return this._innerHTML;
    },
    set innerHTML(val: string) {
      this._innerHTML = val;
      if (val === '') this.children = [];
    },
    appendChild: function (child: any) {
      child.parentElement = this;
      this.children.push(child);
      return child;
    },
    removeChild: function (child: any) {
      const i = this.children.indexOf(child);
      if (i !== -1) this.children.splice(i, 1);
      return child;
    },
    addEventListener: function (ev: string, fn: any) {
      if (!this.listeners[ev]) this.listeners[ev] = [];
      this.listeners[ev].push(fn);
    },
    removeEventListener: function (ev: string, fn: any) {
      if (!this.listeners[ev]) return;
      this.listeners[ev] = this.listeners[ev].filter((f: any) => f !== fn);
    },
    querySelector: function (sel: string) {
      if (sel.startsWith('#') && this.id === sel.slice(1)) return this;
      if (sel.startsWith('.')) {
        const classes = sel.split('.').filter(Boolean);
        if (classes.length > 0 && classes.every((c: string) => this.classList.contains(c))) return this;
      }
      if (sel.startsWith('[')) {
        const match = sel.match(/\[([a-zA-Z0-9_-]+)(?:=["']?([^"']*)["']?)?\]/);
        if (match) {
          const attr = match[1];
          const val = match[2];
          if (attr.startsWith('data-')) {
            const key = attr.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
            if (val === undefined && this.dataset[key] !== undefined) return this;
            if (this.dataset[key] === val) return this;
          }
        }
      }
      for (const child of this.children) {
        const found = child.querySelector ? child.querySelector(sel) : null;
        if (found) return found;
      }
      return null;
    },
    querySelectorAll: function (sel: string) {
      const res: any[] = [];
      if (sel.startsWith('#') && this.id === sel.slice(1)) res.push(this);
      if (sel.startsWith('.')) {
        const classes = sel.split('.').filter(Boolean);
        if (classes.length > 0 && classes.every((c: string) => this.classList.contains(c))) res.push(this);
      }
      if (sel.startsWith('[')) {
        const match = sel.match(/\[([a-zA-Z0-9_-]+)(?:=["']?([^"']*)["']?)?\]/);
        if (match) {
          const attr = match[1];
          const val = match[2];
          if (attr.startsWith('data-')) {
            const key = attr.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
            if (val === undefined && this.dataset[key] !== undefined) res.push(this);
            if (this.dataset[key] === val) res.push(this);
          }
        }
      }
      for (const child of this.children) {
        if (child.querySelectorAll) res.push(...child.querySelectorAll(sel));
      }
      return res;
    },
    scrollIntoView: function () {},
  };
  return el;
}

/**
 * 自动检测并注入暗色代码终端完整 DOM 骨架
 */
export function ensureTerminalSkeleton(root: HTMLElement): void {
  if (!root) return;

  // 如果已经存在代码行容器，说明已在 HTML 模板中手写预置，无需再次注入
  if (root.querySelector('#code-lines-wrapper')) {
    return;
  }

  // 查找目标挂载容器（按优先级匹配常见占位符）
  let targetContainer: any = root.querySelector(
    '#dsp-terminal-container, #code-terminal-card, .dark-code-terminal-container, [data-code-terminal], [data-code-panel], [id$="-terminal-mount"], [id*="terminal-mount"], [id*="terminal-container"]'
  );

  if (!targetContainer) {
    const rootId = root.id || '';
    if (
      rootId === 'dsp-terminal-container' ||
      rootId === 'code-terminal-card' ||
      rootId.includes('terminal-mount') ||
      rootId.includes('terminal-container') ||
      root.classList?.contains?.('dark-code-terminal-container') ||
      (typeof root.hasAttribute === 'function' &&
        (root.hasAttribute('data-code-terminal') || root.hasAttribute('data-code-panel')))
    ) {
      targetContainer = root;
    }
  }

  // 如果仍未找到，尝试在右侧布局区域开头自动创建并插入
  if (!targetContainer) {
    const rightSection = root.querySelector(
      '.mz-right-section, .fr-right-section, [class*="-right-section"], [class*="right-column"]'
    ) as any;
    if (rightSection) {
      targetContainer = createSafeElement('div', 'code-terminal-card');
      targetContainer.style.flex = '1 1 62%';
      targetContainer.style.minHeight = '0';
      targetContainer.style.display = 'flex';
      targetContainer.style.flexDirection = 'column';
      rightSection.insertBefore(targetContainer, rightSection.firstChild);
    }
  }

  // 兜底：如果 root 自身无子节点或为独立容器，直接注入 root
  if (!targetContainer) {
    targetContainer = root;
  }

  // 注入标准暗色终端 DOM (采用原生 DOM API 构建，无缝兼容真实 DOM 与轻量单元测试环境)
  const autoFrame = createSafeElement('div');
  autoFrame.className = 'dark-terminal-auto-frame';

  const header = createSafeElement('div');
  header.className = 'terminal-auto-header';

  const tabGroup = createSafeElement('div');
  tabGroup.className = 'tab-group';
  tabGroup.style.cssText =
    'display: flex; align-items: center; gap: 2px; background: #020617; padding: 2px; border-radius: 8px; border: 1px solid #1e293b; flex-shrink: 0;';

  const btnTabCode = createSafeElement('button', 'btn-tab-code');
  btnTabCode.className = 'tab-item active';
  btnTabCode.innerHTML = `${TAB_CODE_ICON}<span>代码调试</span>`;
  btnTabCode.style.cssText =
    'background: #2563eb; border: none; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 6px; cursor: pointer; transition: all 0.15s; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 1px 2px rgba(0,0,0,0.25);';

  const btnTabProblem = createSafeElement('button', 'btn-tab-problem');
  btnTabProblem.className = 'tab-item';
  btnTabProblem.innerHTML = `${TAB_PROBLEM_ICON}<span>题目描述</span>`;
  btnTabProblem.style.cssText =
    'background: transparent; border: none; color: #94a3b8; font-size: 11px; font-weight: 500; padding: 3px 9px; border-radius: 6px; cursor: pointer; transition: all 0.15s; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px;';

  const btnTabAnalysis = createSafeElement('button', 'btn-tab-analysis');
  btnTabAnalysis.className = 'tab-item';
  btnTabAnalysis.innerHTML = `${TAB_ANALYSIS_ICON}<span>递推精讲</span>`;
  btnTabAnalysis.style.cssText =
    'background: transparent; border: none; color: #94a3b8; font-size: 11px; font-weight: 500; padding: 3px 9px; border-radius: 6px; cursor: pointer; transition: all 0.15s; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px;';

  tabGroup.appendChild(btnTabCode);
  tabGroup.appendChild(btnTabProblem);
  tabGroup.appendChild(btnTabAnalysis);
  header.appendChild(tabGroup);

  const langGroup = createSafeElement('div', 'code-lang-tabs');
  langGroup.className = 'lang-group';
  const langs = [
    { id: 'java', label: 'Java' },
    { id: 'cpp', label: 'C++' },
    { id: 'python', label: 'Python' },
    { id: 'javascript', label: 'JS' },
  ];
  langs.forEach((l, idx) => {
    const btn = createSafeElement('button');
    btn.className = `lang-btn ${idx === 0 ? 'active' : ''}`;
    btn.dataset.lang = l.id;
    btn.textContent = l.label;
    langGroup.appendChild(btn);
  });
  header.appendChild(langGroup);

  const fontTools = createSafeElement('div');
  fontTools.className = 'font-tools';
  fontTools.style.display = 'flex';
  fontTools.style.alignItems = 'center';
  fontTools.style.gap = '6px';
  fontTools.style.flexShrink = '0';

  const btnCopy = createSafeElement('button', 'btn-code-copy');
  btnCopy.className = 'btn-code-copy';
  btnCopy.title = '复制当前完整代码';
  btnCopy.textContent = '复制';
  fontTools.appendChild(btnCopy);

  const fontScaler = createSafeElement('div');
  fontScaler.className = 'font-scaler';
  const btnFontDec = createSafeElement('button', 'btn-code-font-dec');
  btnFontDec.textContent = 'A-';
  const fontIndicator = createSafeElement('span', 'code-font-indicator');
  fontIndicator.className = 'font-indicator';
  fontIndicator.textContent = '12';
  const btnFontInc = createSafeElement('button', 'btn-code-font-inc');
  btnFontInc.textContent = 'A+';
  fontScaler.appendChild(btnFontDec);
  fontScaler.appendChild(fontIndicator);
  fontScaler.appendChild(btnFontInc);
  fontTools.appendChild(fontScaler);

  const macDots = createSafeElement('div');
  macDots.className = 'mac-dots';
  macDots.style.display = 'flex';
  macDots.style.alignItems = 'center';
  macDots.style.gap = '4px';
  ['#ef4444', '#eab308', '#22c55e'].forEach((col) => {
    const dot = createSafeElement('span');
    dot.style.width = '7px';
    dot.style.height = '7px';
    dot.style.borderRadius = '999px';
    dot.style.background = col;
    dot.style.display = 'inline-block';
    macDots.appendChild(dot);
  });
  fontTools.appendChild(macDots);
  header.appendChild(fontTools);

  autoFrame.appendChild(header);

  const codeView = createSafeElement('div', 'code-view-container');
  const terminalBody = createSafeElement('div');
  terminalBody.className = 'terminal-body';
  const codeLinesWrapper = createSafeElement('div', 'code-lines-wrapper');
  terminalBody.appendChild(codeLinesWrapper);
  codeView.appendChild(terminalBody);
  autoFrame.appendChild(codeView);

  const problemView = createSafeElement('div', 'problem-view-container');
  problemView.style.display = 'none';
  autoFrame.appendChild(problemView);

  const analysisView = createSafeElement('div', 'analysis-view-container');
  analysisView.style.display = 'none';
  autoFrame.appendChild(analysisView);

  const varsWatch = createSafeElement('div', 'vars-watch');
  varsWatch.style.display = 'none';
  autoFrame.appendChild(varsWatch);

  const skeletonHtml = `
    <div class="dark-terminal-auto-frame" style="background: #0f172a; border-radius: 16px; border: 1px solid #1e293b; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15); display: flex; flex-direction: column; overflow: hidden; width: 100%; height: 100%; min-height: 0; flex: 1;">
      <div class="terminal-auto-header" style="background: #1e293b; padding: 4px 8px; display: flex; align-items: center; justify-content: space-between; gap: 6px; border-bottom: 1px solid #334155; flex-shrink: 0; min-width: 0; overflow-x: auto; width: 100%; box-sizing: border-box;">
        <div class="tab-group" style="display: flex; align-items: center; gap: 2px; background: #020617; padding: 2px; border-radius: 8px; border: 1px solid #1e293b; flex-shrink: 0;">
          <button id="btn-tab-code" class="tab-item active" style="background: #2563eb; border: none; color: #ffffff; font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 6px; cursor: pointer; transition: all 0.15s; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);">${TAB_CODE_ICON}<span>代码调试</span></button>
          <button id="btn-tab-problem" class="tab-item" style="background: transparent; border: none; color: #94a3b8; font-size: 11px; font-weight: 500; padding: 3px 9px; border-radius: 6px; cursor: pointer; transition: all 0.15s; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px;">${TAB_PROBLEM_ICON}<span>题目描述</span></button>
          <button id="btn-tab-analysis" class="tab-item" style="background: transparent; border: none; color: #94a3b8; font-size: 11px; font-weight: 500; padding: 3px 9px; border-radius: 6px; cursor: pointer; transition: all 0.15s; white-space: nowrap; display: inline-flex; align-items: center; gap: 5px;">${TAB_ANALYSIS_ICON}<span>递推精讲</span></button>
        </div>
        <div class="lang-group" id="code-lang-tabs" style="display: flex; align-items: center; background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 2px; flex-shrink: 0;">
          <button class="lang-btn active" data-lang="java" style="background: #334155; border: none; color: #93c5fd; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; cursor: pointer;">Java</button>
          <button class="lang-btn" data-lang="cpp" style="background: transparent; border: none; color: #64748b; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; cursor: pointer;">C++</button>
          <button class="lang-btn" data-lang="python" style="background: transparent; border: none; color: #64748b; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; cursor: pointer;">Python</button>
          <button class="lang-btn" data-lang="javascript" style="background: transparent; border: none; color: #64748b; font-size: 10px; font-weight: 700; padding: 1px 6px; border-radius: 4px; cursor: pointer;">JS</button>
        </div>
        <div class="font-tools" style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
          <button id="btn-code-copy" title="复制当前完整代码" style="background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 2px 7px; color: #94a3b8; font-size: 10px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; transition: all 0.15s ease; white-space: nowrap; user-select: none;">
            <span class="copy-icon" style="display: inline-flex; align-items: center;">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </span>
            <span class="copy-text">复制</span>
          </button>
          <div class="font-scaler" style="display: flex; align-items: center; gap: 2px; background: #0f172a; border: 1px solid #334155; border-radius: 6px; padding: 1px 4px;">
            <button id="btn-code-font-dec" title="缩小代码字号" style="background: transparent; border: none; color: #94a3b8; font-size: 9px; font-weight: 700; cursor: pointer; padding: 1px 3px;">A-</button>
            <span id="code-font-indicator" class="font-indicator" style="font-size: 9.5px; font-family: monospace; color: #93c5fd; min-width: 14px; text-align: center;">12</span>
            <button id="btn-code-font-inc" title="放大代码字号" style="background: transparent; border: none; color: #94a3b8; font-size: 9px; font-weight: 700; cursor: pointer; padding: 1px 3px;">A+</button>
          </div>
          <div class="window-dots" style="display: flex; align-items: center; gap: 4px;">
            <span style="width: 7px; height: 7px; border-radius: 999px; background: #ef4444; display: inline-block;"></span>
            <span style="width: 7px; height: 7px; border-radius: 999px; background: #eab308; display: inline-block;"></span>
            <span style="width: 7px; height: 7px; border-radius: 999px; background: #22c55e; display: inline-block;"></span>
          </div>
        </div>
      </div>
      <div id="code-view-container" style="display: flex; flex-direction: column; overflow: hidden; width: 100%; flex: 1; min-height: 0; box-sizing: border-box;">
        <div class="terminal-body" style="flex: 1; min-height: 0; width: 100%; padding: 10px 10px 4px 10px; overflow-y: auto; overflow-x: auto; font-family: 'JetBrains Mono', Consolas, Monaco, monospace; font-size: 12px; line-height: 1.6; color: #cbd5e1; box-sizing: border-box;">
          <div id="code-lines-wrapper" style="min-width: 0; width: 100%;"></div>
        </div>
        <div id="code-vars-watch" class="code-vars-watch-container" style="display: none; border-top: 1px solid rgba(51, 65, 85, 0.5); padding: 5px 12px; background: rgba(15, 23, 42, 0.95); flex-wrap: wrap; gap: 6px; font-size: 11px; flex-shrink: 0; min-height: 28px; align-items: center;"></div>
      </div>
      <div id="problem-view-container" style="display: none; flex: 1; min-height: 0; padding: 14px; overflow-y: auto; background: #0f172a; color: #cbd5e1; font-size: 12px; line-height: 1.6;"></div>
      <div id="analysis-view-container" style="display: none; flex: 1; min-height: 0; padding: 14px; overflow-y: auto; background: #0f172a; color: #cbd5e1; font-size: 12px; line-height: 1.6;"></div>
      <div id="vars-watch" style="display: none;"></div>
    </div>
  `;
  targetContainer.innerHTML = skeletonHtml;

  if (typeof targetContainer.appendChild === 'function') {
    const testWrapper = targetContainer.querySelector ? targetContainer.querySelector('#code-lines-wrapper') : null;
    if (!testWrapper) {
      targetContainer.appendChild(autoFrame);
    }
  }

  if (!root.querySelector('#modal-problem')) {
    const modalEl = createSafeElement('div', 'modal-problem');
    modalEl.className = 'modal-backdrop hidden';
    modalEl.style.cssText =
      'position: fixed; inset: 0; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); z-index: 99999; display: none; align-items: center; justify-content: center; box-sizing: border-box; padding: 20px;';

    const modalContent = createSafeElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.cssText =
      'background: #1e293b; border: 1px solid #334155; border-radius: 12px; max-width: 800px; width: 90%; max-height: 85vh; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); overflow: hidden; color: #f8fafc;';

    const modalHeader = createSafeElement('div');
    modalHeader.className = 'modal-header';
    modalHeader.style.cssText =
      'display: flex; align-items: center; justify-content: space-between; padding: 14px 20px; border-bottom: 1px solid #334155; color: #f8fafc; font-weight: 600; font-size: 15px; flex-shrink: 0;';

    const modalTitle = createSafeElement('div');
    modalTitle.className = 'modal-title';
    modalTitle.textContent = '📋 算法原理与题目说明';

    const btnClose = createSafeElement('button', 'btn-close-problem-modal');
    btnClose.textContent = '✕';
    btnClose.style.cssText =
      'background: transparent; border: none; color: #94a3b8; font-size: 18px; cursor: pointer; padding: 4px 8px; border-radius: 4px; line-height: 1; transition: color 0.15s;';
    btnClose.onmouseenter = () => (btnClose.style.color = '#ffffff');
    btnClose.onmouseleave = () => (btnClose.style.color = '#94a3b8');

    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(btnClose);
    modalContent.appendChild(modalHeader);

    const modalBody = createSafeElement('div', 'modal-problem-body');
    modalBody.style.cssText =
      'padding: 20px; overflow-y: auto; color: #cbd5e1; font-size: 13px; line-height: 1.6; flex: 1; min-height: 0;';

    modalContent.appendChild(modalBody);
    modalEl.appendChild(modalContent);
    if (typeof root.appendChild === 'function') {
      root.appendChild(modalEl);
    }
  }
}
