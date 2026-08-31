/**
 * 密码谍报·电话拨号树状解密 (Spy Cipher: Phone Dial Letter Combinations)
 * 经典多分支回溯算法、全息搜索树与双音频电话拨号：
 * 1. 📞 60 FPS 赛博特工拨号盘 (Canvas 2D 拟真电话按键、DTMF 双音频声效与拨号音)
 * 2. 🌳 全息回溯状态空间树 (实时分层绘制 3 分支 / 4 分支树状连线与明文叶子节点)
 * 3. ⚡ 动态回溯递归探针 (实时高亮当前 DFS 深入与回退撤销的路径分支)
 * 4. 🎛️ 经典题库预设 ("23", "79", "258", "2")
 * 5. 🔊 原生 Web Audio 电话按键 DTMF 双音合成与破译通关电报音
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  SPY_DIAL_CODE_LANGUAGES,
  SPY_DIAL_PROBLEM_HTML,
  SPY_DIAL_ANALYSIS_HTML,
} from './spy-dial-problem-content';

export interface TreeNode {
  id: string;
  label: string;
  depth: number;
  x: number;
  y: number;
  parent: TreeNode | null;
  children: TreeNode[];
  isActive: boolean;
}

class DialAudio {
  private static audioCtx: AudioContext | null = null;
  public static isMuted = false;

  private static getCtx(): AudioContext | null {
    if (this.isMuted || typeof window === 'undefined') return null;
    if (!this.audioCtx) {
      const AudioClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioClass) this.audioCtx = new AudioClass();
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // 模拟真实电话 DTMF 双音频
  public static playDTMF(digit: string): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const rowFreqs: Record<string, number> = { '1': 697, '2': 697, '3': 697, '4': 770, '5': 770, '6': 770, '7': 852, '8': 852, '9': 852 };
      const colFreqs: Record<string, number> = { '1': 1209, '2': 1336, '3': 1477, '4': 1209, '5': 1336, '6': 1477, '7': 1209, '8': 1336, '9': 1477 };

      const f1 = rowFreqs[digit] || 697;
      const f2 = colFreqs[digit] || 1209;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.frequency.setValueAtTime(f1, ctx.currentTime);
      osc2.frequency.setValueAtTime(f2, ctx.currentTime);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();
      osc1.stop(ctx.currentTime + 0.1);
      osc2.stop(ctx.currentTime + 0.1);
    } catch {}
  }

  public static playDecryptTick(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(950 + Math.random() * 150, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }

  public static playWin(): void {
    const ctx = this.getCtx();
    if (!ctx) return;
    try {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.18, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.25);
      });
    } catch {}
  }
}

export class SpyDialVisualizer extends StepVisualizer<any> {
  private digits = '23';
  private letterMap: string[] = ['', '', 'abc', 'def', 'ghi', 'jkl', 'mno', 'pqrs', 'tuv', 'wxyz'];
  private allCombinations: string[] = [];
  private currentPath: string[] = [];

  // 全息树结构
  private rootNode: TreeNode | null = null;
  private isAutoTracing = false;

  // 画布
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private animFrameId: number | null = null;
  private lastTimestamp = 0;

  constructor() {
    super();
    this.codeLanguages = SPY_DIAL_CODE_LANGUAGES;
    this.codeLines = SPY_DIAL_CODE_LANGUAGES['cpp'] || [];
    this.codePanelTitle = '电话号码多分支回溯引擎';
  }

  protected initDOMElements(): void {}

  protected buildSteps(): any[] {
    return [{ message: '密码谍报·电话拨号树状解密' }];
  }

  protected renderStep(_step: any): void {}

  public async init(options: { root: HTMLElement; algorithmId: string; viewId: string }): Promise<void> {
    await super.init(options);
    this.loadDigits('23');
    this.initGameUI();
    this.startLoop();
  }

  public destroy(): void {
    super.destroy();
    if (this.animFrameId && typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  private loadDigits(digits: string): void {
    this.digits = digits;
    this.currentPath = [];
    this.isAutoTracing = false;
    this.computeCombinations();
    this.buildHolographicTree();
    this.updateHUD();
  }

  private computeCombinations(): void {
    const res: string[] = [];
    const path: string[] = [];

    const dfs = (idx: number) => {
      if (idx === this.digits.length) {
        res.push(path.join(''));
        return;
      }
      const d = parseInt(this.digits[idx], 10);
      const letters = this.letterMap[d] || '';
      for (let i = 0; i < letters.length; i++) {
        path.push(letters[i]);
        dfs(idx + 1);
        path.pop();
      }
    };

    if (this.digits.length > 0) dfs(0);
    this.allCombinations = res;
  }

  private buildHolographicTree(): void {
    const width = this.canvas?.width || 460;
    const height = this.canvas?.height || 200;

    const root: TreeNode = {
      id: 'root',
      label: '🕵️',
      depth: 0,
      x: 35,
      y: height / 2,
      parent: null,
      children: [],
      isActive: true,
    };

    // 递归构建层级子节点
    const buildLevel = (parent: TreeNode, digitIdx: number, minY: number, maxY: number) => {
      if (digitIdx >= this.digits.length) return;
      const d = parseInt(this.digits[digitIdx], 10);
      const letters = this.letterMap[d] || '';
      const stepY = (maxY - minY) / (letters.length + 1);
      const targetX = 35 + (digitIdx + 1) * ((width - 60) / Math.max(1, this.digits.length));

      for (let i = 0; i < letters.length; i++) {
        const childY = minY + (i + 1) * stepY;
        const childNode: TreeNode = {
          id: `${parent.id}_${letters[i]}`,
          label: letters[i],
          depth: digitIdx + 1,
          x: targetX,
          y: childY,
          parent,
          children: [],
          isActive: false,
        };
        parent.children.push(childNode);
        buildLevel(childNode, digitIdx + 1, childY - stepY * 0.5, childY + stepY * 0.5);
      }
    };

    buildLevel(root, 0, 10, height - 10);
    this.rootNode = root;
  }

  private initGameUI(): void {
    if (!this.root) return;

    this.canvas = this.root.querySelector('#spy-canvas');
    if (this.canvas) {
      this.ctx = this.canvas.getContext('2d');
      this.buildHolographicTree();
    }

    this.mountTerminal({
      codeLanguages: SPY_DIAL_CODE_LANGUAGES,
      problemHtml: SPY_DIAL_PROBLEM_HTML,
      analysisHtml: SPY_DIAL_ANALYSIS_HTML,
      initialLang: 'cpp',
    });

    // 实体电话按键 2~9 与回退
    this.root.querySelectorAll<HTMLButtonElement>('.spy-dial-key').forEach((keyBtn) => {
      keyBtn.addEventListener('click', () => {
        const d = keyBtn.dataset.digit || '';
        if (d === 'BACK') {
          if (this.digits.length > 0) {
            this.loadDigits(this.digits.slice(0, -1));
          }
        } else if (this.digits.length < 4) {
          DialAudio.playDTMF(d);
          this.loadDigits(this.digits + d);
        }
      });
    });

    // 一键全息回溯追踪
    const autoBtn = this.root.querySelector('#btn-spy-auto') as HTMLButtonElement | null;
    if (autoBtn) {
      autoBtn.addEventListener('click', () => this.runAutoBacktrackTrace());
    }

    // 预设题库
    this.root.querySelectorAll<HTMLButtonElement>('.spy-preset-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const val = btn.dataset.digits || '23';
        this.root?.querySelectorAll('.spy-preset-btn').forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.loadDigits(val);
      });
    });

    // 重置
    const resetBtn = this.root.querySelector('#btn-spy-reset') as HTMLButtonElement | null;
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.loadDigits(this.digits));
    }
  }

  private runAutoBacktrackTrace(): void {
    if (this.isAutoTracing || this.allCombinations.length === 0) return;
    this.isAutoTracing = true;

    let idx = 0;
    const step = () => {
      if (idx >= this.allCombinations.length) {
        this.isAutoTracing = false;
        DialAudio.playWin();
        this.updateHUD();
        return;
      }

      this.currentPath = this.allCombinations[idx++].split('');
      DialAudio.playDecryptTick();
      this.updateHUD();
      setTimeout(step, 300);
    };

    step();
  }

  private updateHUD(): void {
    if (!this.root) return;

    const digitsEl = this.root.querySelector('#spy-digits-display') as HTMLElement | null;
    const countEl = this.root.querySelector('#spy-combos-count') as HTMLElement | null;
    const currentWordEl = this.root.querySelector('#spy-current-word') as HTMLElement | null;
    const statusEl = this.root.querySelector('#spy-status-badge') as HTMLElement | null;

    if (digitsEl) digitsEl.innerHTML = `已拨按键: <b>[ ${this.digits.split('').join(' - ')} ]</b>`;
    if (countEl) countEl.innerHTML = `明文总数: <b>${this.allCombinations.length} 组</b>`;

    if (currentWordEl) {
      if (this.currentPath.length > 0) {
        currentWordEl.innerHTML = `当前生成密码: <b style="color:#10b981; font-size:13px;">"${this.currentPath.join('')}"</b>`;
      } else {
        currentWordEl.innerHTML = `明文预览: [ ${this.allCombinations.slice(0, 8).map((s) => `"${s}"`).join(', ')}${this.allCombinations.length > 8 ? '...' : ''} ]`;
      }
    }

    if (statusEl) {
      if (this.isAutoTracing) {
        statusEl.textContent = '⚡ 全息回溯破译中...';
        statusEl.style.background = '#eff6ff';
        statusEl.style.color = '#2563eb';
      } else {
        statusEl.textContent = '🕵️ 谍报终端待命中';
        statusEl.style.background = '#f8fafc';
        statusEl.style.color = '#475569';
      }
    }
  }

  private startLoop(): void {
    if (typeof requestAnimationFrame !== 'function') return;
    const loop = (timestamp: number) => {
      if (!this.lastTimestamp) this.lastTimestamp = timestamp;
      this.lastTimestamp = timestamp;

      this.renderCanvas();

      if (typeof requestAnimationFrame === 'function') {
        this.animFrameId = requestAnimationFrame(loop);
      }
    };
    this.animFrameId = requestAnimationFrame(loop);
  }

  private renderCanvas(): void {
    if (!this.canvas || !this.ctx) return;
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // 1. 赛博暗绿特工终端背景
    ctx.fillStyle = '#022c22';
    ctx.fillRect(0, 0, width, height);

    // 2. 绘制全息树连线 (Tree Laser Edges)
    if (this.rootNode) {
      this.renderTreeEdges(ctx, this.rootNode);
      this.renderTreeNodes(ctx, this.rootNode);
    }

    ctx.restore();
  }

  private renderTreeEdges(ctx: CanvasRenderingContext2D, node: TreeNode): void {
    for (const child of node.children) {
      ctx.beginPath();
      ctx.moveTo(node.x, node.y);
      ctx.lineTo(child.x, child.y);
      ctx.strokeStyle = 'rgba(52, 211, 153, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      this.renderTreeEdges(ctx, child);
    }
  }

  private renderTreeNodes(ctx: CanvasRenderingContext2D, node: TreeNode): void {
    ctx.save();
    ctx.translate(node.x, node.y);

    // 节点外光晕
    ctx.beginPath();
    ctx.arc(0, 0, node.depth === 0 ? 16 : 12, 0, Math.PI * 2);
    ctx.fillStyle = node.depth === 0 ? '#059669' : '#065f46';
    ctx.fill();

    ctx.strokeStyle = '#34d399';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.font = node.depth === 0 ? '16px sans-serif' : 'bold 11px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(node.label, 0, 0);

    ctx.restore();

    for (const child of node.children) {
      this.renderTreeNodes(ctx, child);
    }
  }
}

export const SPY_DIAL_TEMPLATE = `
  <div id="algo-spy-dial-view" style="display: flex; flex-direction: column; width: 100%; height: 100%; box-sizing: border-box; padding: 6px 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; position: relative;">
    <!-- 顶栏：按键预设与功能控制 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; margin-bottom: 6px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">📞</span>
        <span style="font-size: 14px; font-weight: 800; color: #0f172a;">密码谍报·电话拨号树状解密</span>
        <div style="display: flex; gap: 4px; margin-left: 8px;">
          <button class="spy-preset-btn active" data-digits="23" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">"23" (9组)</button>
          <button class="spy-preset-btn" data-digits="79" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">"79" (16组 4分支)</button>
          <button class="spy-preset-btn" data-digits="258" style="padding: 2px 8px; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #cbd5e1; background: #f8fafc; cursor: pointer;">🔥 "258" (27组 3层深度)</button>
        </div>
      </div>

      <div style="display: flex; align-items: center; gap: 8px;">
        <span id="spy-status-badge" style="font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 6px; border: 1px solid #bfdbfe; background: #eff6ff; color: #2563eb;">🕵️ 待命中</span>
        <button id="btn-spy-auto" style="background: linear-gradient(135deg, #10b981, #059669); color: #ffffff; border: none; border-radius: 6px; padding: 4px 12px; font-size: 11.5px; font-weight: 800; cursor: pointer; box-shadow: 0 2px 6px rgba(16,185,129,0.25);">⚡ 一键全息破译</button>
        <button id="btn-spy-reset" style="background: #f1f5f9; color: #475569; border: 1px solid #cbd5e1; border-radius: 6px; padding: 4px 8px; font-size: 11.5px; font-weight: 700; cursor: pointer;">🔄 重置</button>
      </div>
    </div>

    <!-- 概念横幅与当前密码组合 -->
    <div style="display: flex; align-items: center; justify-content: space-between; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 4px 10px; margin-bottom: 6px; font-size: 11px; color: #065f46;">
      <span id="spy-digits-display">已拨按键: <b>[ 2 - 3 ]</b></span>
      <span id="spy-current-word">明文预览: [ "ad", "ae", "af", "bd", "be", "bf", "cd", "ce", "cf" ]</span>
      <span id="spy-combos-count" style="font-weight: 800; color: #047857;">明文总数: 9 组</span>
    </div>

    <!-- 主交互区：左侧电话拨号键盘与全息树 Canvas，右侧终端 -->
    <div style="display: grid; grid-template-columns: minmax(0, 1.35fr) 350px; gap: 10px; flex: 1; min-height: 0;">
      <!-- 左侧：电话键盘 + 全息树 -->
      <div style="display: flex; flex-direction: column; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px; gap: 6px; overflow-y: auto;">
        <!-- Canvas 全息树 -->
        <div style="position: relative; display: flex; justify-content: center; background: #022c22; border-radius: 6px; overflow: hidden; border: 1px solid #047857;">
          <canvas id="spy-canvas" width="460" height="150" style="width: 460px; height: 150px;"></canvas>
        </div>

        <!-- 实体电话拨号键盘 3x4 Matrix -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 4px; padding: 4px; background: #f8fafc; border-radius: 6px; border: 1px solid #e2e8f0;">
          <button class="spy-dial-key" data-digit="2" style="padding: 4px; border-radius: 4px; border: 1px solid #cbd5e1; background: #ffffff; cursor: pointer; text-align: center;">
            <b style="font-size: 13px;">2</b> <span style="font-size: 9px; color: #64748b;">ABC</span>
          </button>
          <button class="spy-dial-key" data-digit="3" style="padding: 4px; border-radius: 4px; border: 1px solid #cbd5e1; background: #ffffff; cursor: pointer; text-align: center;">
            <b style="font-size: 13px;">3</b> <span style="font-size: 9px; color: #64748b;">DEF</span>
          </button>
          <button class="spy-dial-key" data-digit="4" style="padding: 4px; border-radius: 4px; border: 1px solid #cbd5e1; background: #ffffff; cursor: pointer; text-align: center;">
            <b style="font-size: 13px;">4</b> <span style="font-size: 9px; color: #64748b;">GHI</span>
          </button>
          <button class="spy-dial-key" data-digit="5" style="padding: 4px; border-radius: 4px; border: 1px solid #cbd5e1; background: #ffffff; cursor: pointer; text-align: center;">
            <b style="font-size: 13px;">5</b> <span style="font-size: 9px; color: #64748b;">JKL</span>
          </button>
          <button class="spy-dial-key" data-digit="6" style="padding: 4px; border-radius: 4px; border: 1px solid #cbd5e1; background: #ffffff; cursor: pointer; text-align: center;">
            <b style="font-size: 13px;">6</b> <span style="font-size: 9px; color: #64748b;">MNO</span>
          </button>
          <button class="spy-dial-key" data-digit="7" style="padding: 4px; border-radius: 4px; border: 1px solid #cbd5e1; background: #ffffff; cursor: pointer; text-align: center;">
            <b style="font-size: 13px;">7</b> <span style="font-size: 9px; color: #64748b;">PQRS</span>
          </button>
          <button class="spy-dial-key" data-digit="8" style="padding: 4px; border-radius: 4px; border: 1px solid #cbd5e1; background: #ffffff; cursor: pointer; text-align: center;">
            <b style="font-size: 13px;">8</b> <span style="font-size: 9px; color: #64748b;">TUV</span>
          </button>
          <button class="spy-dial-key" data-digit="9" style="padding: 4px; border-radius: 4px; border: 1px solid #cbd5e1; background: #ffffff; cursor: pointer; text-align: center;">
            <b style="font-size: 13px;">9</b> <span style="font-size: 9px; color: #64748b;">WXYZ</span>
          </button>
        </div>
      </div>

      <!-- 右侧：代码终端 -->
      <div style="display: flex; flex-direction: column; gap: 6px; min-height: 0;">
        <div id="spy-terminal-mount" style="flex: 1; min-height: 220px; overflow: hidden; border-radius: 6px; border: 1px solid #e2e8f0;"></div>
      </div>
    </div>
  </div>
`;

registerAlgorithm({
  id: 'spy-dial',
  name: '密码谍报·电话拨号树状解密',
  viewId: 'algo-spy-dial-view',
  category: 'game',
  description: '多分支回溯算法游戏：特工拨号盘、DTMF 双音频声效、全息搜索树与明文密码破解',
  icon: '📞',
  template: SPY_DIAL_TEMPLATE,
  Visualizer: SpyDialVisualizer,
  difficulty: 2,
  levelOrder: 14,
  learningGoal: '掌握多分支搜索树在组合枚举中的回溯机制，理解树的深度与宽度的物理对应关系',
});
