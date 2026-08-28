/**
 * 跳跃游戏 II 可视化器（贪心算法）— 4-Card 标准现代架构
 * LeetCode 45：维护当前步最远边界 (curDistance) 与下一步最远边界 (nextDistance)，触碰边界即贪心跳跃
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  JUMP_GAME_PROBLEM_HTML,
  JUMP_GAME_ANALYSIS_HTML,
  JUMP_GAME_CODE_LANGUAGES,
} from './jump-game-problem-content';
import template from './jump-game.html?raw';

export interface JumpStep {
  array: number[];
  currentIndex: number;
  currentBoundary: number;
  nextBoundary: number;
  jumpCount: number;
  isJump: boolean;
  jumpFrom: number;
  jumpTo: number;
  action: 'init' | 'scan' | 'jump' | 'done';
  message: string;
  log: string;
  codeLine: number;
}

export function buildJumpGameSteps(arr: number[]): JumpStep[] {
  const steps: JumpStep[] = [];
  const n = arr.length;

  if (n <= 1) {
    steps.push({
      array: [...arr],
      currentIndex: 0,
      currentBoundary: 0,
      nextBoundary: 0,
      jumpCount: 0,
      isJump: false,
      jumpFrom: -1,
      jumpTo: -1,
      action: 'done',
      message: '数组长度 <= 1，已经在终点，无需跳跃，步数为 0',
      log: 'no jumps needed',
      codeLine: 2,
    });
    return steps;
  }

  let jumps = 0;
  let curDistance = 0;
  let nextDistance = 0;

  steps.push({
    array: [...arr],
    currentIndex: 0,
    currentBoundary: 0,
    nextBoundary: 0,
    jumpCount: 0,
    isJump: false,
    jumpFrom: -1,
    jumpTo: -1,
    action: 'init',
    message: `初始化：nums = [${arr.join(', ')}]，jumps=0, curBoundary=0, nextBoundary=0`,
    log: `init: jumps=0, boundary=0, farthest=0`,
    codeLine: 3,
  });

  for (let i = 0; i < n - 1; i++) {
    const reach = i + arr[i];
    nextDistance = Math.max(nextDistance, reach);

    steps.push({
      array: [...arr],
      currentIndex: i,
      currentBoundary: curDistance,
      nextBoundary: nextDistance,
      jumpCount: jumps,
      isJump: false,
      jumpFrom: -1,
      jumpTo: -1,
      action: 'scan',
      message: `🔍 扫描下标 [${i}]=${arr[i]}，从该点可达下标 ${reach}，更新下一步最远 nextBoundary=${nextDistance}`,
      log: `scan i=${i}: reach=${reach}, nextBoundary=${nextDistance}`,
      codeLine: 7,
    });

    if (i === curDistance) {
      jumps++;
      const prevBoundary = curDistance;
      curDistance = nextDistance;

      steps.push({
        array: [...arr],
        currentIndex: i,
        currentBoundary: curDistance,
        nextBoundary: nextDistance,
        jumpCount: jumps,
        isJump: true,
        jumpFrom: prevBoundary,
        jumpTo: curDistance,
        action: 'jump',
        message: `🦘 到达当前跳跃边界 [${i}]！必须跳跃一次，jumps=${jumps}，新边界推进至 [${curDistance}]`,
        log: `jump #${jumps}: ${prevBoundary} → ${curDistance}`,
        codeLine: 10,
      });

      if (curDistance >= n - 1) {
        break; // 已经覆盖终点
      }
    }
  }

  steps.push({
    array: [...arr],
    currentIndex: n - 1,
    currentBoundary: n - 1,
    nextBoundary: nextDistance,
    jumpCount: jumps,
    isJump: false,
    jumpFrom: -1,
    jumpTo: -1,
    action: 'done',
    message: `🎉 成功到达终点！最少跳跃次数为 ${jumps} 次`,
    log: `done: jumps=${jumps}`,
    codeLine: 14,
  });

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class JumpGameVisualizer extends StepVisualizer<JumpStep> {
  protected codeLanguages = JUMP_GAME_CODE_LANGUAGES;
  protected codeLines = JUMP_GAME_CODE_LANGUAGES['java'];
  protected codePanelTitle = '跳跃游戏 II 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private sandboxContainer: HTMLElement | null = null;
  private boundaryContainer: HTMLElement | null = null;
  private triggerMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#jg-sandbox-container');
    this.boundaryContainer = this.root.querySelector('#jg-boundary-container');
    this.triggerMonitorContainer = this.root.querySelector('#jg-trigger-monitor-container');
    this.metricsContainer = this.root.querySelector('#jg-metrics-container');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 绑定播放控制
    this.bindPlaybackControls();

    // 绑定运行与重置
    this.root.querySelector('#btn-generate')?.addEventListener('click', () => this.start());
    this.root.querySelector('#btn-reset')?.addEventListener('click', () => this.reset());

    // 绑定 Scrubber 进度条
    const slider = this.root.querySelector('#slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseInt((e.target as HTMLInputElement).value, 10);
        if (!isNaN(val) && val >= 0 && val < this.steps.length) {
          this.goToStep(val);
        }
      });
    }

    // 绑定前进后退按钮
    this.root.querySelector('#btn-step-prev')?.addEventListener('click', () => this.prevStep());
    this.root.querySelector('#btn-step-next')?.addEventListener('click', () => this.nextStep());
    this.root.querySelector('#btn-play-pause')?.addEventListener('click', () => this.togglePlay());

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.jg-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const numsEl = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
        if (numsEl && btn.dataset.nums) numsEl.value = btn.dataset.nums;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: JUMP_GAME_PROBLEM_HTML,
      analysisHtml: JUMP_GAME_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): JumpStep[] {
    const numsEl = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
    const rawNums = (numsEl?.value || '2,3,1,1,4')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    const nums = rawNums.length > 0 ? rawNums : [2, 3, 1, 1, 4];
    return buildJumpGameSteps(nums);
  }

  protected renderStep(step: JumpStep): void {
    const arr = step.array;
    const n = arr.length;

    // 1. 渲染跳跃边界推进沙盘 (Card 1)
    if (this.sandboxContainer && n > 0) {
      const curIdx = step.currentIndex;
      const curBound = step.currentBoundary;
      const nextBound = step.nextBoundary;
      const isDone = step.action === 'done';

      const cellsHtml = arr
        .map((val, idx) => {
          const isCurrent = idx === curIdx && !isDone;
          const isAtCurBound = idx === curBound;
          const isWithinCurBound = idx <= curBound;
          const isTarget = idx === n - 1;

          let bg = '#ffffff';
          let borderColor = '#e2e8f0';
          let textColor = '#0f172a';

          if (isCurrent) {
            bg = '#eff6ff';
            borderColor = '#2563eb';
            textColor = '#2563eb';
          } else if (isAtCurBound) {
            bg = '#f5f3ff';
            borderColor = '#7c3aed';
            textColor = '#7c3aed';
          } else if (isWithinCurBound) {
            bg = '#faf5ff';
            borderColor = '#ddd6fe';
            textColor = '#6b21a8';
          }

          if (isDone && isTarget) {
            bg = '#ecfdf5';
            borderColor = '#10b981';
            textColor = '#059669';
          }

          return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <span style="font-size: 9.5px; color: ${isCurrent ? '#2563eb' : isAtCurBound ? '#7c3aed' : '#94a3b8'}; font-weight: 700;">
                ${isCurrent ? '📍 当前' : isAtCurBound ? '🚪 边界' : isTarget ? '🏁 终点' : `[${idx}]`}
              </span>
              <div style="width: 48px; height: 48px; border-radius: 12px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 5px rgba(0,0,0,0.04); transition: all 0.15s;">
                <span>${val}</span>
                <span style="font-size: 8.5px; color: #94a3b8; font-weight: 600;">+${val}</span>
              </div>
              <span style="font-size: 9px; color: ${isWithinCurBound ? '#7c3aed' : '#cbd5e1'}; font-weight: 700;">
                ${isWithinCurBound ? '可达' : '未及'}
              </span>
            </div>
          `;
        })
        .join('');

      this.sandboxContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <!-- 边界双指示条 -->
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
            <span>🚪 当前步边界: 下标 <strong style="color: #7c3aed; font-family: monospace;">[${curBound}]</strong></span>
            <span>🌐 下一步最远: 下标 <strong style="color: #059669; font-family: monospace;">[${nextBound}]</strong></span>
          </div>
        </div>

        <!-- 单元格水平条 -->
        <div style="display: flex; gap: 10px; overflow-x: auto; justify-content: center; padding: 6px 0;">
          ${cellsHtml}
        </div>
      `;
    }

    // 2. 渲染当前与下一跳边界 (Card 2 Left)
    if (this.boundaryContainer) {
      this.boundaryContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>当前跳跃右边界 <code style="color:#7c3aed; font-weight:700;">curDistance</code>:</span>
            <span style="font-family: monospace; font-weight:700; color: #7c3aed;">[${step.currentBoundary}]</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>下一步最远边界 <code style="color:#059669; font-weight:700;">nextDistance</code>:</span>
            <span style="font-family: monospace; font-weight:700; color: #059669;">[${step.nextBoundary}]</span>
          </div>
        </div>
      `;
    }

    // 3. 渲染边界触发跳跃判定 (Card 2 Center)
    if (this.triggerMonitorContainer) {
      const isJump = step.isJump;
      const isDone = step.action === 'done';

      this.triggerMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>跳跃触发:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isJump ? '#f5f3ff' : isDone ? '#ecfdf5' : '#eff6ff'}; color: ${isJump ? '#7c3aed' : isDone ? '#059669' : '#2563eb'}; border: 1px solid ${isJump ? '#ddd6fe' : isDone ? '#a7f3d0' : '#bfdbfe'};">
              ${isJump ? '🦘 触碰边界 (jumps++)' : isDone ? '🏁 已达终点' : '🔍 扫描边界内节点'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 贪心准则: <code style="color:#7c3aed; font-family:monospace;">if (i == curDistance) { curDistance = nextDistance; jumps++; }</code></div>
          </div>
        </div>
      `;
    }

    // 4. 渲染最少跳跃次数看板 (Card 2 Bottom)
    if (this.metricsContainer) {
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>当前已跳跃步数: <strong style="color: #7c3aed; font-family: monospace; font-size: 13.5px;">${step.jumpCount}</strong> 步</span>
            <span style="font-size: 10.5px; font-weight: 700; color: #475569;">终点目标: 下标 [${n - 1}]</span>
          </div>
        </div>
      `;
    }

    const badgeJumps = this.root?.querySelector('#badge-jumps-count');
    if (badgeJumps) {
      badgeJumps.textContent = `跳跃步数: ${step.jumpCount} 步`;
    }

    // 5. 更新 Scrubber 进度条
    const slider = this.root?.querySelector('#slider-progress') as HTMLInputElement | null;
    const stepCur = this.root?.querySelector('#step-cur') as HTMLElement | null;
    const stepTotal = this.root?.querySelector('#step-total') as HTMLElement | null;
    const playIcon = this.root?.querySelector('#play-icon') as HTMLElement | null;

    if (slider) {
      slider.max = String(Math.max(0, this.steps.length - 1));
      slider.value = String(this.currentIndex);
    }
    if (stepCur) stepCur.textContent = String(this.currentIndex + 1);
    if (stepTotal) stepTotal.textContent = String(this.steps.length);
    if (playIcon) {
      playIcon.className = this.isPlaying ? 'fa-solid fa-pause text-[12px]' : 'fa-solid fa-play text-[12px]';
    }

    // 6. 暗色终端代码行高亮
    this.terminalInstance?.highlightLine(step.codeLine);

    // 7. 渲染执行日志流 (Card 4)
    if (this.logContainer) {
      const logs = this.steps.slice(0, this.currentIndex + 1).map((st, idx) => {
        let badgeColor = '#64748b';
        let badgeBg = '#f1f5f9';
        let badgeText = '扫描';

        if (st.isJump) {
          badgeColor = '#7c3aed';
          badgeBg = '#f5f3ff';
          badgeText = '跳跃';
        } else if (st.action === 'done') {
          badgeColor = '#059669';
          badgeBg = '#ecfdf5';
          badgeText = '完成';
        }

        return `
          <div style="display: flex; align-items: flex-start; gap: 6px; padding: 3px 0; border-bottom: 1px solid #f8fafc; font-size: 11px;">
            <span style="color: #94a3b8; font-family: monospace; font-size: 10px; min-width: 24px;">#${idx + 1}</span>
            <span style="background: ${badgeBg}; color: ${badgeColor}; padding: 1px 5px; border-radius: 4px; font-weight: 700; font-size: 10px;">${badgeText}</span>
            <span style="color: #334155; flex: 1;">${st.message}</span>
          </div>
        `;
      });

      this.logContainer.innerHTML = logs.join('');
      this.logContainer.scrollTop = this.logContainer.scrollHeight;
    }
    if (this.logCountEl) {
      this.logCountEl.textContent = `${this.currentIndex + 1} / ${this.steps.length} 记录`;
    }
  }

  public reset(): void {
    super.reset();
    if (this.sandboxContainer) this.sandboxContainer.innerHTML = '';
  }
}

registerAlgorithm({
  id: 'jump-game',
  name: '跳跃游戏 II',
  viewId: 'algo-jump-game-view',
  category: 'greedy',
  description: '求到达数组末尾的最少跳跃次数，触碰当前步覆盖边界即贪心跳跃',
  icon: '🦘',
  template,
  Visualizer: JumpGameVisualizer,
  difficulty: 2,
  levelOrder: 6,
  learningGoal: '掌握跳跃游戏 II 中双边界推进与最小步数贪心触发机制',
});
