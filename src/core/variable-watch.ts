/**
 * 变量监视面板
 * 负责渲染算法执行过程中的核心变量值列表，自动检测变化并触发闪烁动画与标签分类
 */

import type { StepVar } from './interfaces';
import type { VariableSnapshot } from './code-presentation-model';

export class VariableWatch {
  private containerEl: HTMLElement;
  private headerEl: HTMLElement;
  private titleEl: HTMLElement;
  private countEl: HTMLElement;
  private toggleEl: HTMLElement;
  private bodyEl: HTMLElement;
  private prevVarValues: Map<string, string> = new Map();

  constructor(containerEl: HTMLElement) {
    this.containerEl = containerEl;
    this.containerEl.style.display = 'none';

    this.headerEl = document.createElement('div');
    this.headerEl.className = 'algo-code-vars-header';
    this.headerEl.title = '点击折叠/展开变量监视面板';
    this.headerEl.addEventListener('click', () => {
      const isCol = this.containerEl.classList.toggle('is-collapsed');
      if (isCol) {
        this.containerEl.style.height = '34px';
      } else {
        this.containerEl.style.height = '180px';
      }
    });

    this.titleEl = document.createElement('span');
    this.titleEl.className = 'algo-code-vars-title';
    this.titleEl.innerHTML = '<span class="algo-code-vars-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14l2 2 4-4"></path></svg></span><span>运行变量实时监视</span>';

    this.countEl = document.createElement('span');
    this.countEl.className = 'algo-code-vars-count';
    this.countEl.textContent = '0';
    this.titleEl.appendChild(this.countEl);

    this.toggleEl = document.createElement('span');
    this.toggleEl.className = 'algo-code-vars-toggle';
    this.toggleEl.textContent = '▼';

    this.headerEl.appendChild(this.titleEl);
    this.headerEl.appendChild(this.toggleEl);
    this.containerEl.appendChild(this.headerEl);

    this.bodyEl = document.createElement('div');
    this.bodyEl.className = 'algo-code-vars-body';
    this.containerEl.appendChild(this.bodyEl);
  }

  /**
   * 被动视图渲染：接收领域模型计算好的变量快照并刷新 DOM
   */
  renderSnapshots(snapshots: VariableSnapshot[]): void {
    if (!snapshots || snapshots.length === 0) {
      this.containerEl.style.display = 'none';
      return;
    }
    this.containerEl.style.display = 'flex';

    // 只要有运行变量传入，且当前处于过度收起状态（< 100px），自动展开为完整 180px 视图
    const curH = parseInt(this.containerEl.style.height || '0', 10);
    if (this.containerEl.classList.contains('is-collapsed') || curH < 100) {
      this.containerEl.classList.remove('is-collapsed');
      this.containerEl.style.height = '180px';
    }
    this.countEl.textContent = String(snapshots.length);

    const existingRows = this.bodyEl.querySelectorAll<HTMLElement>('.algo-code-var-row');
    const existingMap = new Map<string, HTMLElement>();
    existingRows.forEach((row) => {
      const name = row.dataset.varName;
      if (name) existingMap.set(name, row);
    });

    const currentNames = new Set(snapshots.map((v) => v.name));

    // 移除不再存在的行
    existingMap.forEach((row, name) => {
      if (!currentNames.has(name)) {
        row.remove();
        existingMap.delete(name);
      }
    });

    // 更新或新增行
    snapshots.forEach((v) => {
      let row = existingMap.get(v.name);
      if (!row) {
        row = document.createElement('div');
        row.className = 'algo-code-var-row';
        row.dataset.varName = v.name;

        const nameWrapper = document.createElement('div');
        nameWrapper.className = 'algo-code-var-name-box';

        const nameEl = document.createElement('span');
        nameEl.className = 'algo-code-var-name';
        nameEl.textContent = v.name;
        nameEl.title = v.name;
        nameWrapper.appendChild(nameEl);

        row.appendChild(nameWrapper);

        const valueEl = document.createElement('span');
        valueEl.className = 'algo-code-var-value';
        row.appendChild(valueEl);

        this.bodyEl.appendChild(row);
      }

      const valueEl = row.querySelector('.algo-code-var-value') as HTMLElement;
      if (valueEl) {
        valueEl.textContent = v.value;
        if (v.type) {
          valueEl.dataset.type = v.type;
        } else {
          delete valueEl.dataset.type;
        }
      }

      // 闪烁动画：重新触发 animation
      row.classList.remove('is-changed');
      if (v.isChanged) {
        void row.offsetWidth;
        row.classList.add('is-changed');
      }

      this.prevVarValues.set(v.name, v.value);
    });
  }

  /** 兼容方法：更新变量列表，自动检测变化并触发闪烁动画 */
  update(vars: StepVar[]): void {
    if (!vars || vars.length === 0) {
      this.containerEl.style.display = 'none';
      return;
    }

    const snapshots: VariableSnapshot[] = vars.map((v) => {
      const prevVal = this.prevVarValues.get(v.name);
      const isChanged = v.changed ?? (prevVal !== undefined && prevVal !== v.value);
      return {
        name: v.name,
        value: v.value,
        type: v.type,
        isChanged,
        prevValue: prevVal
      };
    });

    this.renderSnapshots(snapshots);
  }

  destroy(): void {
    this.bodyEl.innerHTML = '';
    this.prevVarValues.clear();
  }
}
