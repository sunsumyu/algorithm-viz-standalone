/**
 * 跳跃游戏 I 可视化器（贪心算法）— 4-Card 标准现代架构
 * LeetCode 55：维护最大覆盖范围 (cover)，贪心推进直至覆盖终点
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  CAN_JUMP_PROBLEM_HTML,
  CAN_JUMP_ANALYSIS_HTML,
  CAN_JUMP_CODE_LANGUAGES,
} from './can-jump-problem-content';
import template from './can-jump.html?raw';

export interface CanJumpStep {
  array: number[];
  currentIndex: number;
  maxReach: number;
  prevMaxReach: number;
  canJump: boolean;
  action: 'init' | 'scan' | 'extend' | 'blocked' | 'success' | 'done';
  message: string;
  codeLine: number;
}

export function canJumpSteps(arr: number[]): CanJumpStep[] {
  const steps: CanJumpStep[] = [];
  const n = arr.length;

  if (n === 0) return steps;
  if (n === 1) {
    steps.push({
      array: [...arr],
      currentIndex: 0,
      maxReach: 0,
      prevMaxReach: 0,
      canJump: true,
      action: 'success',
      message: '数组长度为 1，起始即在终点，直接返回 true',
      codeLine: 2,
    });
    return steps;
  }

  let cover = 0;
  let canReach = false;

  steps.push({
    array: [...arr],
    currentIndex: 0,
    maxReach: 0,
    prevMaxReach: 0,
    canJump: true,
    action: 'init',
    message: `初始化：nums = [${arr.join(', ')}]，初始最大覆盖范围 cover = 0`,
    codeLine: 3,
  });

  for (let i = 0; i <= cover; i++) {
    const reach = i + arr[i];
    const oldCover = cover;

    steps.push({
      array: [...arr],
      currentIndex: i,
      maxReach: cover,
      prevMaxReach: oldCover,
      canJump: true,
      action: 'scan',
      message: `🔍 位于下标 [${i}]=${arr[i]}，从该点最远可跳至下标 ${reach}`,
      codeLine: 5,
    });

    if (reach > cover) {
      cover = reach;
      steps.push({
        array: [...arr],
        currentIndex: i,
        maxReach: cover,
        prevMaxReach: oldCover,
        canJump: true,
        action: 'extend',
        message: `🌐 扩展覆盖范围：cover 从 ${oldCover} 推进至 ${cover}！`,
        codeLine: 5,
      });
    }

    if (cover >= n - 1) {
      canReach = true;
      steps.push({
        array: [...arr],
        currentIndex: i,
        maxReach: cover,
        prevMaxReach: oldCover,
        canJump: true,
        action: 'success',
        message: `🎉 成功覆盖终点！最大覆盖范围 cover=${cover} &ge; 终点下标 ${n - 1}，必定可达！`,
        codeLine: 6,
      });
      break;
    }
  }

  if (!canReach) {
    steps.push({
      array: [...arr],
      currentIndex: cover,
      maxReach: cover,
      prevMaxReach: cover,
      canJump: false,
      action: 'blocked',
      message: `❌ 无法前进：最大覆盖范围停留在下标 ${cover}，无法到达终点 ${n - 1}`,
      codeLine: 8,
    });
  }

  return steps;
}

/* ── Visualizer class ─────────────────────────────────────── */
export class CanJumpVisualizer extends StepVisualizer<CanJumpStep> {
  protected codeLanguages = CAN_JUMP_CODE_LANGUAGES;
  protected codeLines = CAN_JUMP_CODE_LANGUAGES['java'];
  protected codePanelTitle = '跳跃游戏 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private sandboxContainer: HTMLElement | null = null;
  private pointerContainer: HTMLElement | null = null;
  private coverMonitorContainer: HTMLElement | null = null;
  private metricsContainer: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.sandboxContainer = this.root.querySelector('#cj-sandbox-container');
    this.pointerContainer = this.root.querySelector('#cj-pointer-container');
    this.coverMonitorContainer = this.root.querySelector('#cj-cover-monitor-container');
    this.metricsContainer = this.root.querySelector('#cj-metrics-container');
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
    this.root.querySelectorAll<HTMLButtonElement>('.cj-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        const numsEl = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
        if (numsEl && btn.dataset.nums) numsEl.value = btn.dataset.nums;
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: CAN_JUMP_PROBLEM_HTML,
      analysisHtml: CAN_JUMP_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): CanJumpStep[] {
    const numsEl = this.root?.querySelector('#input-nums') as HTMLInputElement | null;
    const rawNums = (numsEl?.value || '2,3,1,1,4')
      .split(/[,，\s]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));

    const nums = rawNums.length > 0 ? rawNums : [2, 3, 1, 1, 4];
    return canJumpSteps(nums);
  }

  protected renderStep(step: CanJumpStep): void {
    const arr = step.array;
    const n = arr.length;

    // 1. 渲染跳跃覆盖沙盘 (Card 1)
    if (this.sandboxContainer && n > 0) {
      const curIdx = step.currentIndex;
      const maxReach = step.maxReach;
      const isSuccess = step.action === 'success';
      const isBlocked = step.action === 'blocked';

      const cellsHtml = arr
        .map((val, idx) => {
          const isCurrent = idx === curIdx && !isSuccess && !isBlocked;
          const isCovered = idx <= maxReach;
          const isTarget = idx === n - 1;

          let bg = '#ffffff';
          let borderColor = '#e2e8f0';
          let textColor = '#0f172a';

          if (isCurrent) {
            bg = '#eff6ff';
            borderColor = '#2563eb';
            textColor = '#2563eb';
          } else if (isCovered) {
            bg = isSuccess && isTarget ? '#ecfdf5' : '#f5f3ff';
            borderColor = isSuccess && isTarget ? '#10b981' : '#c084fc';
            textColor = isSuccess && isTarget ? '#059669' : '#7e22ce';
          }

          return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
              <span style="font-size: 9.5px; color: ${isCurrent ? '#2563eb' : '#94a3b8'}; font-weight: 700;">
                ${isCurrent ? '📍 当前' : isTarget ? '🏁 终点' : `[${idx}]`}
              </span>
              <div style="width: 48px; height: 48px; border-radius: 12px; background: ${bg}; border: 2px solid ${borderColor}; display: flex; flex-direction: column; align-items: center; justify-content: center; font-size: 16px; font-weight: 800; color: ${textColor}; font-family: 'JetBrains Mono', monospace; box-shadow: 0 2px 5px rgba(0,0,0,0.04); transition: all 0.15s;">
                <span>${val}</span>
                <span style="font-size: 8.5px; color: #94a3b8; font-weight: 600;">+${val}</span>
              </div>
              <span style="font-size: 9px; color: ${isCovered ? '#7e22ce' : '#cbd5e1'}; font-weight: 700;">
                ${isCovered ? '✓ 覆盖' : '未达'}
              </span>
            </div>
          `;
        })
        .join('');

      const coverPercent = Math.min(100, ((maxReach + 1) / n) * 100);

      this.sandboxContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <!-- 覆盖范围标尺带 -->
          <div style="display: flex; align-items: center; justify-content: space-between; font-size: 11px; font-weight: 700; color: #475569;">
            <span>🌐 当前最远覆盖范围: 下标 0 ~ <strong style="color: #7e22ce; font-family: monospace;">${maxReach}</strong></span>
            <span style="color: ${isSuccess ? '#059669' : isBlocked ? '#dc2626' : '#2563eb'};">${coverPercent.toFixed(0)}% 进度</span>
          </div>
          <div style="background: #f1f5f9; border-radius: 999px; height: 8px; overflow: hidden; border: 1px solid #e2e8f0;">
            <div style="background: linear-gradient(90deg, #3b82f6, #a855f7); width: ${coverPercent}%; height: 100%; transition: width 0.2s;"></div>
          </div>
        </div>

        <!-- 单元格水平条 -->
        <div style="display: flex; gap: 10px; overflow-x: auto; justify-content: center; padding: 6px 0;">
          ${cellsHtml}
        </div>
      `;
    }

    // 2. 渲染当前位置与跳力 (Card 2 Left)
    if (this.pointerContainer) {
      const curVal = step.currentIndex < arr.length ? arr[step.currentIndex] : 0;
      const reach = step.currentIndex + curVal;

      this.pointerContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between;">
            <span>当前扫描位置 <code style="color:#2563eb; font-weight:700;">i</code>:</span>
            <span style="font-family: monospace; font-weight:700;">[${step.currentIndex}] (跳力: ${curVal})</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>从该点可达:</span>
            <span style="font-family: monospace; font-weight:700; color: #7e22ce;">i + nums[i] = ${reach}</span>
          </div>
        </div>
      `;
    }

    // 3. 渲染贪心判定监视器 (Card 2 Center)
    if (this.coverMonitorContainer) {
      const isExtend = step.action === 'extend';
      const isSuccess = step.action === 'success';
      const isBlocked = step.action === 'blocked';

      this.coverMonitorContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>覆盖状态:</span>
            <span style="padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10.5px; background: ${isSuccess ? '#ecfdf5' : isBlocked ? '#fef2f2' : '#eff6ff'}; color: ${isSuccess ? '#059669' : isBlocked ? '#dc2626' : '#2563eb'}; border: 1px solid ${isSuccess ? '#a7f3d0' : isBlocked ? '#fecaca' : '#bfdbfe'};">
              ${isSuccess ? '🎉 覆盖终点 (返回 true)' : isBlocked ? '❌ 覆盖受阻 (返回 false)' : isExtend ? '🌐 覆盖范围扩大' : '🔍 正常推进'}
            </span>
          </div>
          <div style="font-size: 10.5px; color: #64748b; line-height: 1.4; border-top: 1px dashed #e2e8f0; padding-top: 4px;">
            <div>• 贪心策略: 只要 cover &ge; nums.length - 1 即判定可达</div>
          </div>
        </div>
      `;
    }

    // 4. 渲染终点可达性判定看板 (Card 2 Bottom)
    if (this.metricsContainer) {
      const isReach = step.maxReach >= n - 1;
      this.metricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #334155;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>终点下标: <strong style="color: #0f172a; font-family: monospace;">[${n - 1}]</strong></span>
            <span style="font-size: 11px; font-weight: 700; color: ${isReach ? '#059669' : '#dc2626'};">
              ${isReach ? '✓ 覆盖 &ge; 终点 (可以到达)' : '⏳ 当前覆盖未达终点'}
            </span>
          </div>
        </div>
      `;
    }

    const badgeCover = this.root?.querySelector('#badge-cover-reach');
    if (badgeCover) {
      badgeCover.textContent = `覆盖最远: [${step.maxReach}]`;
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

        if (st.action === 'extend') {
          badgeColor = '#7e22ce';
          badgeBg = '#f5f3ff';
          badgeText = '扩展';
        } else if (st.action === 'success') {
          badgeColor = '#059669';
          badgeBg = '#ecfdf5';
          badgeText = '成功';
        } else if (st.action === 'blocked') {
          badgeColor = '#dc2626';
          badgeBg = '#fef2f2';
          badgeText = '受阻';
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
  id: 'can-jump',
  name: '跳跃游戏 I',
  viewId: 'algo-can-jump-view',
  category: 'greedy',
  description: '维护最大跳跃覆盖范围，贪心判断能否到达数组末尾',
  icon: '🦘',
  template,
  Visualizer: CanJumpVisualizer,
  difficulty: 2,
  levelOrder: 5,
  learningGoal: '理解贪心算法中覆盖范围（Cover Range）思想，避免陷入局部单步推导陷阱',
});
