/**
 * 数字串翻译方案数（解码方法，LeetCode 91）双模式可视化器
 * 模式一：递归树（SVG 增量展开 + 回填 + 重复子问题高亮 + 缩放/聚焦/重置）
 * 模式二：DP 迭代（一维 dp 从右往左填表 + 依赖箭头 + 决策拆解卡片）
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  buildRecursiveSteps,
  buildDpSteps,
  REC_JAVA_CODE,
  DP_JAVA_CODE,
  type DecodeRecStep,
  type DecodeDpStep,
  type DecodeTreeNode,
} from './decode-ways-steps';
import template from './decode-ways.html?raw';

type DwStep = DecodeRecStep | DecodeDpStep;
type Mode = 'rec' | 'dp';

const SVG_NS = 'http://www.w3.org/2000/svg';
const NODE_R = 22;
/** 与 decode-ways-steps.ts 的 LEVEL_HEIGHT 保持一致（悬挂死边的落点） */
const LEVEL_GAP = 92;

export class DecodeWaysVisualizer extends StepVisualizer<DwStep> {
  protected codeLines = REC_JAVA_CODE;
  protected codeLanguage = 'java';
  protected codePanelTitle = '解码方法 Java 源码';

  /* ── 模式状态：两种模式各持独立步骤数组与游标 ── */
  private mode: Mode = 'rec';
  private recSteps: DecodeRecStep[] = [];
  private dpSteps: DecodeDpStep[] = [];
  private recCursor = 0;
  private dpCursor = 0;
  private recNodes = new Map<number, DecodeTreeNode>();
  private lastInput = '';

  /* ── DOM ── */
  private inputEl: HTMLInputElement | null = null;
  private errorEl: HTMLElement | null = null;
  private tabRec: HTMLElement | null = null;
  private tabDp: HTMLElement | null = null;
  private treeWrap: HTMLElement | null = null;
  private dpWrap: HTMLElement | null = null;
  private statCalls: HTMLElement | null = null;
  private statRepeats: HTMLElement | null = null;
  private statTwo: HTMLElement | null = null;
  private statFilled: HTMLElement | null = null;
  private answerEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;

  /* ── 递归树渲染状态（增量绘制） ── */
  private treeSvg: SVGSVGElement | null = null;
  private treeRoot: SVGGElement | null = null;
  private nodeEls = new Map<number, SVGGElement>();
  private treeWidth = 800;
  private treeHeight = 400;
  private lastTreeIndex = -1;
  /** 视图变换：缩放 + 平移 */
  private viewScale = 1;
  private viewX = 0;
  private viewY = 0;

  /* ── DP 渲染状态 ── */
  private dpCharsEl: HTMLElement | null = null;
  private dpCellsEl: HTMLElement | null = null;
  private dpArrowsEl: HTMLElement | null = null;
  private dpFormulaEl: HTMLElement | null = null;
  private breakdownEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputEl = this.root.querySelector('#dw-input');
    this.errorEl = this.root.querySelector('#dw-error');
    this.tabRec = this.root.querySelector('#dw-tab-rec');
    this.tabDp = this.root.querySelector('#dw-tab-dp');
    this.treeWrap = this.root.querySelector('#dw-tree-wrap');
    this.dpWrap = this.root.querySelector('#dw-dp-wrap');
    this.statCalls = this.root.querySelector('#dw-stat-calls');
    this.statRepeats = this.root.querySelector('#dw-stat-repeats');
    this.statTwo = this.root.querySelector('#dw-stat-two');
    this.statFilled = this.root.querySelector('#dw-stat-filled');
    this.answerEl = this.root.querySelector('#dw-answer');
    this.logEl = this.root.querySelector('#dw-log');
    this.dpCharsEl = this.root.querySelector('#dw-dp-chars');
    this.dpCellsEl = this.root.querySelector('#dw-dp-cells');
    this.dpArrowsEl = this.root.querySelector('#dw-dp-arrows');
    this.dpFormulaEl = this.root.querySelector('#dw-dp-formula');
    this.breakdownEl = this.root.querySelector('#dw-dp-breakdown');

    this.bindPlaybackControls({
      reset: 'step-reset', prev: 'step-prev', play: 'step-play', next: 'step-next',
      speed: 'dw-speed', speedLabel: 'dw-speed-label',
      counter: 'step-counter', message: 'step-message',
    });

    this.root.querySelector('#dw-start')?.addEventListener('click', () => this.start());
    this.root.querySelectorAll<HTMLButtonElement>('.dw-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.inputEl) this.inputEl.value = btn.dataset.s || '226';
        this.start();
      });
    });
    this.tabRec?.addEventListener('click', () => this.switchMode('rec'));
    this.tabDp?.addEventListener('click', () => this.switchMode('dp'));
    this.root.querySelector('#dw-zoom-in')?.addEventListener('click', () => this.zoomBy(1.25));
    this.root.querySelector('#dw-zoom-out')?.addEventListener('click', () => this.zoomBy(0.8));
    this.root.querySelector('#dw-view-reset')?.addEventListener('click', () => this.resetView());
    this.root.querySelector('#dw-view-focus')?.addEventListener('click', () => this.focusCurrent());

    this.initTreeCanvas();
    this.initPan();
  }

  /* ═══════════════════ 输入与步骤构建 ═══════════════════ */

  protected buildSteps(): DwStep[] {
    const raw = (this.inputEl?.value || '').trim();
    const ok = /^[0-9]{1,10}$/.test(raw);
    if (this.errorEl) {
      this.errorEl.textContent = ok
        ? ''
        : raw.length === 0
          ? '请输入数字串'
          : /^[0-9]*$/.test(raw)
            ? `长度需 1~10 位（当前 ${raw.length} 位）`
            : '仅允许数字字符 0-9';
    }
    if (!ok) {
      this.recSteps = [];
      this.dpSteps = [];
      this.recNodes.clear();
      return [];
    }
    this.lastInput = raw;

    const rec = buildRecursiveSteps(raw);
    const dp = buildDpSteps(raw);
    this.recSteps = rec.steps;
    this.dpSteps = dp.steps;
    this.recNodes = new Map(rec.nodes.map((nd) => [nd.id, nd]));
    this.recCursor = 0;
    this.dpCursor = 0;

    // 共享最终答案徽章：两种模式答案一致
    if (this.answerEl) this.answerEl.textContent = String(rec.answer);

    // 树画布重置 + 依据整棵树尺寸设定 viewBox
    this.resetTreeCanvas();

    return this.mode === 'rec' ? this.recSteps : this.dpSteps;
  }

  /* ═══════════════════ 模式切换 ═══════════════════ */

  private switchMode(mode: Mode): void {
    if (mode === this.mode) return;
    this.pause();
    if (this.mode === 'rec') this.recCursor = this.currentIndex;
    else this.dpCursor = this.currentIndex;
    this.mode = mode;

    this.steps = mode === 'rec' ? this.recSteps : this.dpSteps;
    this.currentIndex = mode === 'rec' ? this.recCursor : this.dpCursor;

    this.codePanel?.updateLines(mode === 'rec' ? REC_JAVA_CODE : DP_JAVA_CODE, 'java');
    this.updateModeVisibility();
    this.updateStatsVisibility();

    this.render();
    this.updateButtons();
  }

  private updateModeVisibility(): void {
    this.tabRec?.classList.toggle('is-active', this.mode === 'rec');
    this.tabDp?.classList.toggle('is-active', this.mode === 'dp');
    this.treeWrap?.classList.toggle('is-hidden', this.mode !== 'rec');
    this.dpWrap?.classList.toggle('is-hidden', this.mode !== 'dp');
  }

  private updateStatsVisibility(): void {
    const recRow = this.root?.querySelector('#dw-stats-rec');
    const dpRow = this.root?.querySelector('#dw-stats-dp');
    recRow?.classList.toggle('is-hidden', this.mode !== 'rec');
    dpRow?.classList.toggle('is-hidden', this.mode !== 'dp');
  }

  /* ═══════════════════ 步骤渲染分发 ═══════════════════ */

  protected renderStep(step: DwStep): void {
    if (this.mode === 'rec') {
      this.renderRecStep(step as DecodeRecStep);
    } else {
      this.renderDpStep(step as DecodeDpStep);
    }
    this.updateLog(this.logEl);
  }

  /* ═══════════════════ 递归树渲染（增量） ═══════════════════ */

  private initTreeCanvas(): void {
    if (!this.treeWrap) return;
    this.treeSvg = document.createElementNS(SVG_NS, 'svg');
    this.treeSvg.setAttribute('class', 'dw-tree-svg');
    this.treeRoot = document.createElementNS(SVG_NS, 'g');
    this.treeRoot.setAttribute('class', 'dw-tree-root');
    this.treeSvg.appendChild(this.treeRoot);
    this.treeWrap.appendChild(this.treeSvg);
  }

  private resetTreeCanvas(): void {
    if (!this.treeRoot) return;
    this.treeRoot.innerHTML = '';
    this.nodeEls.clear();
    this.lastTreeIndex = -1;
    const maxX = Math.max(...[...this.recNodes.values()].map((nd) => nd.x), 200);
    const maxY = Math.max(...[...this.recNodes.values()].map((nd) => nd.y), 200);
    this.treeWidth = maxX + 80;
    this.treeHeight = maxY + 80;
    this.treeSvg?.setAttribute('viewBox', `0 0 ${this.treeWidth} ${this.treeHeight}`);
    this.resetView();
  }

  private renderRecStep(step: DecodeRecStep): void {
    // 统计徽章与答案
    if (this.statCalls) this.statCalls.textContent = String(step.stats.calls);
    if (this.statRepeats) this.statRepeats.textContent = String(step.stats.repeats);
    if (this.statTwo) this.statTwo.textContent = String(step.stats.twoDigitHits);
    if (step.answer != null && this.answerEl) this.answerEl.textContent = String(step.answer);

    if (!this.treeRoot) return;

    if (this.currentIndex === this.lastTreeIndex + 1) {
      this.applyTreeDelta(step);
    } else {
      // 回退 / 跳步：全量重建到当前步
      this.treeRoot.innerHTML = '';
      this.nodeEls.clear();
      for (let k = 0; k <= this.currentIndex; k++) {
        this.applyTreeDelta(this.recSteps[k]);
      }
    }
    this.lastTreeIndex = this.currentIndex;

    this.highlightActiveNode(step.nodeId);
    this.autoFollow(step.nodeId);
  }

  /** 应用单个步骤的增量：新增节点 / 边 / 回填值 / 悬挂死边 */
  private applyTreeDelta(step: DecodeRecStep): void {
    if (!this.treeRoot) return;

    if (step.type === 'init') {
      const rootNode = this.recNodes.get(0);
      if (rootNode && !this.nodeEls.has(0)) {
        const g = this.makeNode(rootNode);
        this.treeRoot.appendChild(g);
        this.nodeEls.set(0, g);
      }
      return;
    }

    if (step.type === 'call' && step.newNode) {
      const nd = step.newNode;
      // 边（先画边再画节点，边在节点下层）
      if (step.edge && step.edge.fromId !== null) {
        const parent = this.recNodes.get(step.edge.fromId);
        if (parent) {
          this.treeRoot.appendChild(
            this.makeEdge(parent, nd, step.edge.label, step.edge.dead)
          );
        }
      } else if (step.edge && step.edge.dead) {
        // 悬挂死边（>26 / 越界）：从父节点向右下画虚线短边
        const from = this.recNodes.get(step.nodeId);
        if (from) {
          this.treeRoot.appendChild(this.makeDanglingEdge(from, step.edge.label));
        }
      }
      if (!this.nodeEls.has(nd.id)) {
        const g = this.makeNode(nd);
        this.treeRoot.appendChild(g);
        this.nodeEls.set(nd.id, g);
      }
      return;
    }

    if (step.type === 'branch-2' && step.edge?.dead) {
      const from = this.recNodes.get(step.nodeId);
      if (from) this.treeRoot.appendChild(this.makeDanglingEdge(from, step.edge.label));
      return;
    }

    if (
      (step.type === 'base-case' || step.type === 'dead-zero' || step.type === 'return') &&
      step.returnValue !== undefined
    ) {
      this.backfillNode(step.nodeId, step.returnValue, step.type);
    }
  }

  private makeNode(nd: DecodeTreeNode): SVGGElement {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'dw-node' + (nd.isRepeated ? ' is-repeated' : ''));
    g.dataset.nodeId = String(nd.id);
    g.setAttribute('transform', `translate(${nd.x}, ${nd.y})`);

    const circle = document.createElementNS(SVG_NS, 'circle');
    circle.setAttribute('r', String(NODE_R));
    g.appendChild(circle);

    const label = document.createElementNS(SVG_NS, 'text');
    label.setAttribute('class', 'dw-node-label');
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('dy', '5');
    label.textContent = `f(${nd.i})`;
    g.appendChild(label);

    const value = document.createElementNS(SVG_NS, 'text');
    value.setAttribute('class', 'dw-node-value');
    value.setAttribute('text-anchor', 'middle');
    value.setAttribute('y', String(-NODE_R - 8));
    g.appendChild(value);

    return g;
  }

  private makeEdge(
    from: DecodeTreeNode,
    to: DecodeTreeNode,
    label: string,
    dead: boolean
  ): SVGGElement {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'dw-edge' + (dead ? ' is-dead' : ''));

    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const dist = Math.hypot(dx, dy) || 1;
    const x1 = from.x + (dx / dist) * (NODE_R + 2);
    const y1 = from.y + (dy / dist) * (NODE_R + 2);
    const x2 = to.x - (dx / dist) * (NODE_R + 4);
    const y2 = to.y - (dy / dist) * (NODE_R + 4);

    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', String(x1));
    line.setAttribute('y1', String(y1));
    line.setAttribute('x2', String(x2));
    line.setAttribute('y2', String(y2));
    g.appendChild(line);

    if (label) {
      const text = document.createElementNS(SVG_NS, 'text');
      text.setAttribute('class', 'dw-edge-label');
      text.setAttribute('x', String((x1 + x2) / 2));
      text.setAttribute('y', String((y1 + y2) / 2 - 6));
      text.setAttribute('text-anchor', 'middle');
      text.textContent = label;
      g.appendChild(text);
    }
    return g;
  }

  private makeDanglingEdge(from: DecodeTreeNode, label: string): SVGGElement {
    const g = document.createElementNS(SVG_NS, 'g');
    g.setAttribute('class', 'dw-edge is-dead is-dangling');
    const x2 = from.x + 46;
    const y2 = from.y + LEVEL_GAP / 2;
    const line = document.createElementNS(SVG_NS, 'line');
    line.setAttribute('x1', String(from.x + NODE_R + 2));
    line.setAttribute('y1', String(from.y + 10));
    line.setAttribute('x2', String(x2));
    line.setAttribute('y2', String(y2));
    g.appendChild(line);
    const text = document.createElementNS(SVG_NS, 'text');
    text.setAttribute('class', 'dw-edge-label');
    text.setAttribute('x', String(x2 + 4));
    text.setAttribute('y', String(y2 - 4));
    text.textContent = label;
    g.appendChild(text);
    return g;
  }

  private backfillNode(nodeId: number, value: number, kind: 'base-case' | 'dead-zero' | 'return'): void {
    const g = this.nodeEls.get(nodeId);
    if (!g) return;
    g.classList.remove('is-base', 'is-dead', 'is-returned');
    if (kind === 'base-case') g.classList.add('is-base');
    else if (kind === 'dead-zero') g.classList.add('is-dead');
    else g.classList.add('is-returned');
    const valueText = g.querySelector('.dw-node-value');
    if (valueText) valueText.textContent = String(value);
  }

  private highlightActiveNode(nodeId: number): void {
    this.nodeEls.forEach((g) => g.classList.remove('is-active'));
    if (nodeId >= 0) this.nodeEls.get(nodeId)?.classList.add('is-active');
  }

  /* ═══════════════════ 视图控制：缩放 / 平移 / 聚焦 ═══════════════════
   * 视图变换在世界坐标上：viewBox 坐标 = world * viewScale + (viewX, viewY)
   * 元素像素 = viewBox 坐标 × k，k = rect.width / treeWidth
   */

  private applyView(): void {
    this.treeRoot?.setAttribute(
      'transform',
      `translate(${this.viewX}, ${this.viewY}) scale(${this.viewScale})`
    );
  }

  /** 以画布中心为锚缩放 */
  private zoomBy(factor: number): void {
    const next = Math.min(3, Math.max(0.3, this.viewScale * factor));
    const cx = this.treeWidth / 2;
    const cy = this.treeHeight / 2;
    const worldX = (cx - this.viewX) / this.viewScale;
    const worldY = (cy - this.viewY) / this.viewScale;
    this.viewScale = next;
    this.viewX = cx - worldX * next;
    this.viewY = cy - worldY * next;
    this.applyView();
  }

  /** viewBox 像素换算基准：viewBox 单位 → 元素像素 */
  private treeScaleBase(): number {
    const rect = this.treeSvg?.getBoundingClientRect();
    if (!rect || !this.treeWidth) return 1;
    return rect.width / this.treeWidth;
  }

  private resetView(): void {
    this.viewScale = 1;
    this.viewX = 0;
    this.viewY = 0;
    this.applyView();
  }

  /** 聚焦当前活跃节点：居中并轻度放大 */
  private focusCurrent(): void {
    const step = this.recSteps[this.currentIndex];
    const nd = step ? this.recNodes.get(step.nodeId) : undefined;
    if (!nd) return;
    this.viewScale = 1.15;
    this.viewX = this.treeWidth / 2 - nd.x * this.viewScale;
    this.viewY = this.treeHeight / 2 - nd.y * this.viewScale;
    this.applyView();
  }

  /** 播放时若当前节点跑出画布中心区，自动平移跟随（不改缩放） */
  private autoFollow(nodeId: number): void {
    const nd = this.recNodes.get(nodeId);
    if (!nd) return;
    const vx = nd.x * this.viewScale + this.viewX;
    const vy = nd.y * this.viewScale + this.viewY;
    const margin = 90;
    if (vx < margin || vx > this.treeWidth - margin || vy < margin || vy > this.treeHeight - margin) {
      this.viewX = this.treeWidth / 2 - nd.x * this.viewScale;
      this.viewY = this.treeHeight / 2 - nd.y * this.viewScale;
      this.applyView();
    }
  }

  private initPan(): void {
    const svg = this.treeSvg;
    if (!svg) return;
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    svg.addEventListener('pointerdown', (e) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      svg.setPointerCapture(e.pointerId);
    });
    svg.addEventListener('pointermove', (e) => {
      if (!dragging) return;
      const k = this.treeScaleBase();
      this.viewX += (e.clientX - lastX) / Math.max(k, 1e-6);
      this.viewY += (e.clientY - lastY) / Math.max(k, 1e-6);
      lastX = e.clientX;
      lastY = e.clientY;
      this.applyView();
    });
    const stop = (): void => {
      dragging = false;
    };
    svg.addEventListener('pointerup', stop);
    svg.addEventListener('pointercancel', stop);
    svg.addEventListener(
      'wheel',
      (e) => {
        e.preventDefault();
        this.zoomBy(e.deltaY < 0 ? 1.1 : 0.9);
      },
      { passive: false }
    );
  }

  /* ═══════════════════ DP 表渲染 ═══════════════════ */

  private renderDpStep(step: DecodeDpStep): void {
    if (this.statFilled) this.statFilled.textContent = `${step.filledCount}/${this.lastInput.length + 1}`;
    if (this.dpFormulaEl) {
      this.dpFormulaEl.textContent = step.formulaSubstituted || step.formula || '';
    }
    if (step.answer != null && this.answerEl) this.answerEl.textContent = String(step.answer);
    this.renderDpTable(step);
    this.renderDpBreakdown(step);
  }

  private renderDpTable(step: DecodeDpStep): void {
    if (!this.dpCharsEl || !this.dpCellsEl) return;
    const n = this.lastInput.length;

    // 字符格（与 dp 格纵向对齐；dp[i] 对 s[i]，dp[n] 为边界空位）
    if (this.dpCharsEl.children.length !== n + 1) {
      this.dpCharsEl.innerHTML = '';
      for (let i = 0; i <= n; i++) {
        const cell = document.createElement('div');
        cell.className = 'dw-char-cell';
        cell.dataset.idx = String(i);
        this.dpCharsEl.appendChild(cell);
      }
      this.dpCellsEl.innerHTML = '';
      for (let i = 0; i <= n; i++) {
        const cell = document.createElement('div');
        cell.className = 'dw-dp-cell';
        cell.dataset.idx = String(i);
        cell.innerHTML = `<span class="dw-dp-idx">dp[${i}]</span><span class="dw-dp-val"></span>`;
        this.dpCellsEl.appendChild(cell);
      }
    }
    for (let i = 0; i <= n; i++) {
      const charCell = this.dpCharsEl.children[i] as HTMLElement;
      const isBoundary = i === n;
      charCell.textContent = isBoundary ? '␃' : this.lastInput[i];
      charCell.classList.toggle('is-zero', !isBoundary && this.lastInput[i] === '0');
      charCell.classList.toggle('is-boundary', isBoundary);
      charCell.classList.toggle('is-current', !isBoundary && i === step.i && step.type !== 'init' && step.type !== 'done');

      const dpCell = this.dpCellsEl.children[i] as HTMLElement;
      // 已填判定：filledCount > n - i（init 时仅 dp[n]，之后每步多填一格）
      const filled = step.filledCount > n - i;
      const valEl = dpCell.querySelector('.dw-dp-val') as HTMLElement;
      valEl.textContent = filled ? String(step.dp[i]) : '';
      dpCell.classList.toggle('is-zero', filled && step.dp[i] === 0 && i !== n);
      dpCell.classList.toggle('is-current', i === step.i && step.type !== 'done');
      dpCell.classList.toggle('is-dep', step.deps?.includes(i) ?? false);
      dpCell.classList.toggle('is-answer', step.type === 'done' && i === 0);
    }

    this.drawDpArrows(step);
  }

  /** 依赖格 -> 当前格 的弧线箭头覆盖层 */
  private drawDpArrows(step: DecodeDpStep): void {
    if (!this.dpArrowsEl || !this.dpCellsEl) return;
    const host = this.dpCellsEl;
    this.dpArrowsEl.innerHTML = '';
    if (step.type !== 'compute' && step.type !== 'zero') return;
    const hostRect = host.getBoundingClientRect();
    const target = host.children[step.i] as HTMLElement | undefined;
    if (!target) return;
    const targetRect = target.getBoundingClientRect();
    const toX = targetRect.left - hostRect.left + targetRect.width / 2;
    const toY = targetRect.top - hostRect.top + targetRect.height / 2;

    (step.deps ?? []).forEach((depIdx, order) => {
      const src = host.children[depIdx] as HTMLElement | undefined;
      if (!src) return;
      const srcRect = src.getBoundingClientRect();
      const fromX = srcRect.left - hostRect.left + srcRect.width / 2;
      const fromY = srcRect.top - hostRect.top + srcRect.height / 2;
      const path = document.createElementNS(SVG_NS, 'path');
      // 上弧：从依赖格上方绕到当前格上方
      const lift = 34;
      const d = `M ${fromX} ${fromY - 18} Q ${fromX} ${fromY - lift} ${(fromX + toX) / 2} ${fromY - lift} T ${toX} ${toY - 18}`;
      path.setAttribute('d', d);
      path.setAttribute('class', 'dw-dp-arrow' + (order === 1 ? ' is-two' : ''));
      this.dpArrowsEl!.appendChild(path);
    });
  }

  private renderDpBreakdown(step: DecodeDpStep): void {
    if (!this.breakdownEl) return;
    if (!step.branch1 || !step.branch2) {
      this.breakdownEl.innerHTML = step.formulaSubstituted
        ? `<div class="dw-bd-conclusion">${step.formulaSubstituted}</div>`
        : '';
      return;
    }
    const branch = (b: NonNullable<DecodeDpStep['branch1']>): string => `
      <div class="dw-bd-branch${b.ok ? '' : ' is-grey'}">
        <div class="dw-bd-title">${b.title}</div>
        ${b.ok ? `<div class="dw-bd-formula">${b.formula}</div>` : `<div class="dw-bd-reason">✗ ${b.reason}</div>`}
      </div>`;
    this.breakdownEl.innerHTML = `
      ${branch(step.branch1)}
      ${branch(step.branch2)}
      <div class="dw-bd-conclusion">dp[${step.i}] = <strong>${step.dp[step.i]}</strong></div>
    `;
  }

  public destroy(): void {
    this.nodeEls.clear();
    this.recNodes.clear();
    super.destroy();
  }
}

registerAlgorithm({
  id: 'decode-ways',
  name: '数字串翻译方案数（解码方法）',
  viewId: 'algo-decode-ways-view',
  category: 'dynamic-programming',
  description: 'LeetCode 91 双模式演示：递归树展开 vs 一维 DP 从右往左填表',
  icon: '🔓',
  template,
  Visualizer: DecodeWaysVisualizer,
  difficulty: 2,
  levelOrder: 3,
  learningGoal: '掌握 s[i]==0 与两位 ≤26 的分支取舍，理解暴力递归到 DP 的演化',
});
