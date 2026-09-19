/**
 * 开发者物理语义调试 HUD 深度模块 (PhysicsDebugHUD)
 * 仅在开发环境 (import.meta.env.DEV) 下激活
 * 
 * 核心目标：
 * 一秒隔离“数据生成错误”与“视图绘制错误”，让物理实体与状态转移的调试成本降至最低。
 */

import type { UniversalStep } from '../universal-stage-engine';

export class PhysicsDebugHUD {
  private static instance: PhysicsDebugHUD | null = null;
  private container: HTMLElement | null = null;
  private isVisible: boolean = false;
  private isCollapsed: boolean = false;
  private currentStepData: UniversalStep | null = null;
  private onNextTransferHandler: (() => void) | null = null;

  private constructor() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    // 仅在 DEV 环境下挂载
    const isDev = Boolean(import.meta.env?.DEV);
    if (!isDev) return;

    this.mountDOM();
    this.bindKeyboardShortcut();
  }

  public static getInstance(): PhysicsDebugHUD {
    if (!PhysicsDebugHUD.instance) {
      PhysicsDebugHUD.instance = new PhysicsDebugHUD();
    }
    return PhysicsDebugHUD.instance;
  }

  /**
   * 挂载半透明 HUD 容器到文档顶部
   */
  private mountDOM(): void {
    if (document.getElementById('physics-debug-hud')) return;

    const hud = document.createElement('div');
    hud.id = 'physics-debug-hud';
    hud.className = 'fixed top-3 right-4 z-[9999] font-mono text-[11px] select-none transition-all duration-200 pointer-events-auto shadow-2xl';
    hud.style.fontFamily = "'Fira Code', monospace";
    hud.innerHTML = `
      <div id="physics-hud-card" class="bg-slate-900/90 backdrop-blur-md border border-amber-500/40 rounded-xl overflow-hidden text-slate-200 shadow-amber-500/10">
        <!-- 标题栏 -->
        <div id="physics-hud-header" class="px-3 py-1.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-950 transition">
          <div class="flex items-center gap-1.5 font-bold text-amber-400">
            <span class="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span>PHYSICS HUD</span>
            <span class="text-[9px] text-slate-500 font-normal">[Ctrl+Shift+D]</span>
          </div>
          <button id="physics-hud-toggle-btn" class="text-slate-400 hover:text-white text-xs px-1">
            <i class="fa-solid fa-chevron-up"></i>
          </button>
        </div>
        <!-- 详情面板 -->
        <div id="physics-hud-body" class="p-3 space-y-1.5 min-w-[280px]">
          <div class="flex justify-between items-center text-slate-400">
            <span>Step:</span>
            <span id="hud-val-step" class="font-bold text-white">-</span>
          </div>
          <div class="flex justify-between items-center text-slate-400">
            <span>Actor Slot:</span>
            <span id="hud-val-slot" class="font-bold text-emerald-400">-</span>
          </div>
          <div class="flex justify-between items-center text-slate-400">
            <span>Jump From:</span>
            <span id="hud-val-from" class="font-bold text-sky-400">-</span>
          </div>
          <div class="flex justify-between items-center text-slate-400">
            <span>Action:</span>
            <span id="hud-val-action" class="font-bold text-amber-300">-</span>
          </div>
          <div class="flex justify-between items-center text-slate-400">
            <span>Code Line:</span>
            <span id="hud-val-line" class="font-bold text-purple-300">-</span>
          </div>
          <div id="hud-val-decision-box" class="pt-1 border-t border-slate-800 text-[10px] space-y-0.5 hidden">
            <div class="text-slate-500 font-bold">Decision Balance:</div>
            <div id="hud-val-decision" class="text-amber-200/90 leading-tight"></div>
          </div>
          <!-- 快捷操作工具条 -->
          <div class="pt-2 border-t border-slate-800 flex items-center justify-between gap-1.5">
            <button id="hud-btn-next-transfer" class="px-2 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 rounded text-[10px] transition flex items-center gap-1">
              <i class="fa-solid fa-forward-step"></i> 下一转移帧
            </button>
            <button id="hud-btn-copy-json" class="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-[10px] transition flex items-center gap-1">
              <i class="fa-regular fa-copy"></i> 复制帧快照
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(hud);
    this.container = hud;
    this.isVisible = true;

    // 绑定展开/折叠
    const header = hud.querySelector('#physics-hud-header');
    header?.addEventListener('click', () => this.toggleCollapse());

    // 绑定复制快照
    const btnCopy = hud.querySelector('#hud-btn-copy-json');
    btnCopy?.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.currentStepData && typeof navigator !== 'undefined' && navigator.clipboard) {
        navigator.clipboard.writeText(JSON.stringify(this.currentStepData, null, 2));
        const originalHtml = btnCopy.innerHTML;
        btnCopy.innerHTML = '<i class="fa-solid fa-check text-emerald-400"></i> 已复制!';
        setTimeout(() => { btnCopy.innerHTML = originalHtml; }, 1500);
      }
    });

    // 绑定下一转移帧
    const btnNextTrans = hud.querySelector('#hud-btn-next-transfer');
    btnNextTrans?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.onNextTransferHandler?.();
    });
  }

  private bindKeyboardShortcut(): void {
    if (typeof window === 'undefined' || typeof window.addEventListener !== 'function') return;
    window.addEventListener('keydown', (e) => {
      if (e.ctrlKey && e.shiftKey && (e.key === 'D' || e.key === 'd')) {
        e.preventDefault();
        this.toggleVisibility();
      }
    });
  }

  public toggleVisibility(): void {
    if (!this.container) return;
    this.isVisible = !this.isVisible;
    this.container.style.display = this.isVisible ? 'block' : 'none';
  }

  public toggleCollapse(): void {
    if (!this.container) return;
    this.isCollapsed = !this.isCollapsed;
    const body = this.container.querySelector('#physics-hud-body') as HTMLElement;
    const icon = this.container.querySelector('#physics-hud-toggle-btn i') as HTMLElement;
    if (body) {
      body.style.display = this.isCollapsed ? 'none' : 'block';
    }
    if (icon) {
      icon.className = this.isCollapsed ? 'fa-solid fa-chevron-down' : 'fa-solid fa-chevron-up';
    }
  }

  public setOnNextTransfer(fn: (() => void) | null): void {
    this.onNextTransferHandler = fn;
  }

  /**
   * 实时更新当前步骤的物理拓扑数据
   */
  public updateStep(step: UniversalStep, index: number, total: number): void {
    this.currentStepData = step;
    if (!this.container || !this.isVisible) return;

    const elStep = this.container.querySelector('#hud-val-step');
    const elSlot = this.container.querySelector('#hud-val-slot');
    const elFrom = this.container.querySelector('#hud-val-from');
    const elAction = this.container.querySelector('#hud-val-action');
    const elLine = this.container.querySelector('#hud-val-line');
    const elDecisionBox = this.container.querySelector('#hud-val-decision-box') as HTMLElement;
    const elDecision = this.container.querySelector('#hud-val-decision');

    if (elStep) elStep.textContent = `${index + 1} / ${total} (${step.type || 'normal'})`;
    
    // 物理槽位
    const slot = step.actorState?.currentSlot ?? step.activeSlot ?? step.j ?? step.currentJ;
    if (elSlot) elSlot.textContent = slot !== undefined ? `Slot ${slot}` : 'N/A';

    // 起跳来源
    const jumpFrom = step.actorState?.jumpFrom ?? step.fromSlot;
    if (elFrom) elFrom.textContent = jumpFrom !== undefined ? `From Slot ${jumpFrom}` : 'none (grounded)';

    // 动作类型
    const action = step.actorState?.action ?? step.action ?? (jumpFrom !== undefined && jumpFrom !== slot ? 'jump' : 'walk/idle');
    if (elAction) elAction.textContent = action;

    // 代码行
    if (elLine) elLine.textContent = step.line ? `Line ${step.line}` : (step.codeLine ? `Line ${step.codeLine}` : '-');

    // 决策看板
    if (elDecisionBox && elDecision) {
      if (Array.isArray(step.decisions) && step.decisions.length > 0) {
        elDecisionBox.classList.remove('hidden');
        elDecision.innerHTML = step.decisions.map(d => 
          `<div class="${d.isSelected ? 'text-emerald-400 font-bold' : 'text-slate-400'}">• ${d.label || d.formula}: <strong>${d.value}</strong> ${d.isSelected ? '🏆' : ''}</div>`
        ).join('');
      } else if (step.decisionData) {
        elDecisionBox.classList.remove('hidden');
        elDecision.textContent = JSON.stringify(step.decisionData);
      } else {
        elDecisionBox.classList.add('hidden');
      }
    }
  }
}
