/**
 * 用最少数量的箭引爆气球可视化器（贪心算法）
 * LeetCode 452
 * 重做：玻璃感 + 坐标轴气球 + 箭飞入 + burst 爆裂
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './min-arrows.html?raw';

type MAPhase = 'init' | 'sort' | 'consider' | 'shoot' | 'skip' | 'done';

interface MAStep {
  /** 排序后的气球列表 */
  balloons: [number, number][];
  /** 当前考虑的气球下标；-1 表示无 */
  currentIndex: number;
  /** 已被射爆的气球下标集合 */
  hitBalloons: number[];
  /** 已被当前箭覆盖（重叠）的气球下标集合 */
  skippedBalloons: number[];
  /** 已射出箭数 */
  arrowCount: number;
  /** 当前箭的位置（气球终点）；-1 / Infinity 表示无 */
  currentEnd: number;
  /** 本步是否触发新箭射出（用于动画） */
  justShot: boolean;
  /** 本步阶段 */
  phase: MAPhase;
  message: string;
  log: string;
  codeLine: number | number[];
}

function buildSteps(balloons: [number, number][]): MAStep[] {
  const steps: MAStep[] = [];
  if (balloons.length === 0) {
    steps.push({
      balloons: [], currentIndex: -1, hitBalloons: [], skippedBalloons: [],
      arrowCount: 0, currentEnd: -1, justShot: false, phase: 'done',
      message: '输入为空，返回 0', log: 'init: empty', codeLine: 1,
    });
    return steps;
  }

  const sorted = [...balloons].sort((a, b) => a[1] - b[1]);
  let arrowCount = 0;
  let currentEnd: number = Infinity;
  const hitBalloons: number[] = [];
  const skippedBalloons: number[] = [];

  steps.push({
    balloons: sorted, currentIndex: -1, hitBalloons: [], skippedBalloons: [],
    arrowCount: 0, currentEnd: -1, justShot: false, phase: 'sort',
    message: `按气球终点升序排序：${sorted.map(b => `[${b[0]},${b[1]}]`).join(', ')}`,
    log: `sort by end: ${sorted.map(b => `[${b[0]},${b[1]}]`).join(',')}`,
    codeLine: [3, 4],
  });

  for (let i = 0; i < sorted.length; i++) {
    const balloon = sorted[i];

    // consider 子步骤
    steps.push({
      balloons: sorted, currentIndex: i,
      hitBalloons: [...hitBalloons], skippedBalloons: [...skippedBalloons],
      arrowCount, currentEnd: currentEnd === Infinity ? -1 : currentEnd,
      justShot: false, phase: 'consider',
      message: `考察气球 ${i}：[${balloon[0]}, ${balloon[1]}]`,
      log: `consider #${i}: [${balloon[0]},${balloon[1]}]`,
      codeLine: 7,
    });

    const endSoFar = currentEnd === Infinity ? -1 : currentEnd;
    if (balloon[0] > endSoFar) {
      // 需要新箭
      arrowCount++;
      currentEnd = balloon[1];
      hitBalloons.push(i);
      steps.push({
        balloons: sorted, currentIndex: i,
        hitBalloons: [...hitBalloons], skippedBalloons: [...skippedBalloons],
        arrowCount, currentEnd, justShot: true, phase: 'shoot',
        message: `🎯 起点 ${balloon[0]} > 箭位 ${endSoFar === -1 ? '∅' : endSoFar}，射第 ${arrowCount} 支箭在 x=${currentEnd}`,
        log: `shoot arrow #${arrowCount} @ x=${currentEnd}, burst #${i}`,
        codeLine: [9, 10],
      });
    } else {
      // 当前气球与已射出的箭重叠，可被一起射爆
      skippedBalloons.push(i);
      steps.push({
        balloons: sorted, currentIndex: i,
        hitBalloons: [...hitBalloons], skippedBalloons: [...skippedBalloons],
        arrowCount, currentEnd, justShot: false, phase: 'skip',
        message: `✓ 起点 ${balloon[0]} ≤ 箭位 ${currentEnd}，被当前箭一起射爆`,
        log: `skip #${i}: covered by arrow @ ${currentEnd}`,
        codeLine: 13,
      });
    }
  }

  steps.push({
    balloons: sorted, currentIndex: sorted.length,
    hitBalloons: [...hitBalloons], skippedBalloons: [...skippedBalloons],
    arrowCount, currentEnd, justShot: false, phase: 'done',
    message: `✅ 完成！最少需要 ${arrowCount} 支箭`,
    log: `done: arrows=${arrowCount}`,
    codeLine: 16,
  });

  return steps;
}

export class MinArrowsVisualizer extends StepVisualizer<MAStep> {
  protected codeLines = [
    "public int findMinArrowShots(int[][] points) {",
    "    if (points.length == 0) return 0;",
    "    // 按终点升序排序",
    "    Arrays.sort(points, (a, b) -> Integer.compare(a[1], b[1]));",
    "    int arrows = 0, end = Integer.MIN_VALUE;",
    "    for (int i = 0; i < points.length; i++) {",
    "        int start = points[i][0], balloonEnd = points[i][1];",
    "        // 当前气球在已有箭的右侧 → 需要新箭",
    "        if (start > end) {",
    "            arrows++;",
    "            end = balloonEnd;",
    "        }",
    "        // 否则被当前箭覆盖",
    "    }",
    "    return arrows;",
    "}",
  ];
  protected codePanelTitle = '贪心 · 引爆气球 (Java)';

  private inputEl: HTMLInputElement | null = null;
  private axisEl: HTMLElement | null = null;
  private countEl: HTMLElement | null = null;
  private endEl: HTMLElement | null = null;
  private hitCountEl: HTMLElement | null = null;
  private progressEl: HTMLElement | null = null;
  private statusEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private clearLogBtn: HTMLButtonElement | null = null;
  private exampleBtns: NodeListOf<HTMLButtonElement> | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputEl = this.root.querySelector('#arrow-input');
    this.axisEl = this.root.querySelector('#ma-axis');
    this.countEl = this.root.querySelector('#arrow-count');
    this.endEl = this.root.querySelector('#current-end');
    this.hitCountEl = this.root.querySelector('#hit-count');
    this.progressEl = this.root.querySelector('#progress');
    this.statusEl = this.root.querySelector('#ma-status');
    this.resultEl = this.root.querySelector('#ma-result');
    this.logEl = this.root.querySelector('#ma-log');
    this.clearLogBtn = this.root.querySelector('#ma-log-clear');
    this.exampleBtns = this.root.querySelectorAll('.ma-chip');

    this.bindPlaybackControls({ message: 'step-message' });

    const startBtn = this.root.querySelector('#arrow-start');
    if (startBtn) startBtn.addEventListener('click', () => this.start());

    this.exampleBtns?.forEach((btn) => {
      btn.addEventListener('click', () => {
        if (this.inputEl) this.inputEl.value = btn.dataset.val || '';
        this.start();
      });
    });

    if (this.clearLogBtn) {
      this.clearLogBtn.addEventListener('click', () => {
        if (this.logEl) this.logEl.innerHTML = '';
      });
    }
  }

  protected buildSteps(): MAStep[] {
    const defaultBalloons: [number, number][] = [[10, 16], [2, 8], [1, 6], [7, 12]];
    let balloons = defaultBalloons;
    if (this.inputEl) {
      const input = this.inputEl.value.trim();
      if (input) {
        try {
          const parsed = JSON.parse(input);
          if (Array.isArray(parsed) && parsed.length > 0) {
            balloons = parsed.map((b: number[]) => [b[0], b[1]] as [number, number]);
          }
        } catch {
          const nums = input.split(/[,，\s]+/).map((n) => parseInt(n.trim())).filter(Number.isFinite);
          if (nums.length > 0 && nums.length % 2 === 0) {
            balloons = [];
            for (let i = 0; i < nums.length; i += 2) balloons.push([nums[i], nums[i + 1]]);
          }
        }
      }
    }
    return buildSteps(balloons);
  }

  protected renderStep(step: MAStep): void {
    this.renderStats(step);
    this.renderAxis(step);
    this.renderResultBanner(step);
    this.renderLogPanel();
  }

  private renderStats(step: MAStep): void {
    if (this.countEl) this.countEl.textContent = String(step.arrowCount);
    if (this.endEl) this.endEl.textContent = step.currentEnd === -1 ? '-' : String(step.currentEnd);
    if (this.hitCountEl) this.hitCountEl.textContent = String(step.hitBalloons.length);
    if (this.progressEl) {
      const cur = step.currentIndex < 0 ? 0 : Math.min(step.currentIndex + 1, step.balloons.length);
      this.progressEl.textContent = `${cur}/${step.balloons.length}`;
    }
    if (this.statusEl) {
      const names: Record<MAPhase, string> = {
        'init': '准备', 'sort': '排序', 'consider': '考察', 'shoot': '射箭', 'skip': '覆盖', 'done': '完成',
      };
      this.statusEl.textContent = names[step.phase];
    }
  }

  private renderAxis(step: MAStep): void {
    const axisEl = this.axisEl;
    if (!axisEl) return;
    axisEl.innerHTML = '';

    const n = step.balloons.length;
    if (n === 0) {
      axisEl.innerHTML = '<div style="color:#64748b;padding:24px;text-align:center;">无气球</div>';
      return;
    }

    const minStart = Math.min(...step.balloons.map((b) => b[0]));
    const maxEnd = Math.max(...step.balloons.map((b) => b[1]));
    const span = Math.max(1, maxEnd - minStart);

    // 计算坐标范围：留出一点边距
    const axisWidth = Math.max(600, axisEl.clientWidth || 600);
    const padLeft = 20, padRight = 20;
    const usable = axisWidth - padLeft - padRight;
    const xAt = (x: number) => padLeft + ((x - minStart) / span) * usable;

    // 端点 marker（当前箭位置）
    if (step.currentEnd !== -1 && step.currentEnd !== Infinity && step.phase !== 'done') {
      const marker = document.createElement('div');
      marker.className = 'ma-end-marker';
      marker.style.left = `${xAt(step.currentEnd)}px`;
      axisEl.appendChild(marker);
    }

    // 气球：按终点排序后，下标即垂直堆叠顺序
    step.balloons.forEach((balloon, idx) => {
      const el = document.createElement('div');
      el.className = 'ma-balloon';
      const startX = xAt(balloon[0]);
      const endX = xAt(balloon[1]);
      const width = Math.max(24, endX - startX);
      el.style.left = `${startX}px`;
      el.style.width = `${width}px`;
      // 垂直堆叠：每个气球单独一层
      el.style.bottom = `${42 + (idx % 4) * 42}px`;
      el.textContent = `[${balloon[0]},${balloon[1]}]`;

      const isHit = step.hitBalloons.includes(idx);
      const isSkipped = step.skippedBalloons.includes(idx);
      const isCurrent = idx === step.currentIndex;

      if (isCurrent && step.phase === 'consider') {
        el.classList.add('ma-balloon--current');
      } else if (isSkipped) {
        el.classList.add('ma-balloon--skipped');
      }

      // shoot 阶段：当前气球 + 此前被覆盖的 skip 气球一起 burst
      if (step.phase === 'shoot' && step.justShot) {
        if (isCurrent || (isSkipped && !isHit)) {
          // 此步触发新箭，但被覆盖的 skip 气球也会被这箭射爆
          // 注意：skip 集合会在后续步骤中保留，这里仅当前气球 burst
        }
        if (isCurrent) {
          el.classList.add('ma-balloon--hit');
        }
      }
      // done 阶段：所有气球都被射爆
      if (step.phase === 'done') {
        // 不再 burst，仅显示绿色完成态
        el.classList.add('ma-balloon--skipped');
      }

      axisEl.appendChild(el);
    });

    // 箭飞入：shoot 阶段，从 currentEnd 位置上方飞入
    if (step.phase === 'shoot' && step.justShot && step.currentEnd !== -1) {
      const arrow = document.createElement('div');
      arrow.className = 'ma-arrow';
      arrow.textContent = '🏹';
      arrow.style.left = `${xAt(step.currentEnd) - 10}px`;
      // 找到这一步射爆的气球的 bottom（最大的那个）
      arrow.style.bottom = `${42 + (step.currentIndex % 4) * 42 + 36}px`;
      axisEl.appendChild(arrow);
    }

    // x 轴刻度（min/max/end）
    [minStart, Math.floor((minStart + maxEnd) / 2), maxEnd].forEach((x) => {
      const lbl = document.createElement('div');
      lbl.className = 'ma-axis-label';
      lbl.textContent = String(x);
      lbl.style.left = `${xAt(x)}px`;
      axisEl.appendChild(lbl);
    });
  }

  private renderResultBanner(step: MAStep): void {
    const resultEl = this.resultEl;
    if (!resultEl) return;
    resultEl.classList.toggle('ma-result--done', step.phase === 'done');
    const emoji = resultEl.querySelector('.ma-emoji') as HTMLElement | null;
    if (emoji) {
      if (step.phase === 'done') emoji.textContent = '✅';
      else if (step.phase === 'shoot') emoji.textContent = '🏹';
      else if (step.phase === 'skip') emoji.textContent = '✓';
      else if (step.phase === 'consider') emoji.textContent = '🔍';
      else if (step.phase === 'sort') emoji.textContent = '↕️';
      else emoji.textContent = '🎯';
    }
  }

  private renderLogPanel(): void {
    const logEl = this.logEl;
    if (!logEl) return;
    logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const line = document.createElement('div');
      line.className = 'ma-log-line' + (i === this.currentIndex ? ' ma-log-active' : '');
      line.innerHTML = `<span class="ma-log-num">${String(i + 1).padStart(2, '0')}</span><span>${s.log}</span>`;
      logEl.appendChild(line);
    });
    logEl.scrollTop = logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'min-arrows',
  name: '用最少数量的箭引爆气球',
  viewId: 'algo-min-arrows-view',
  category: 'greedy',
  description: 'LeetCode 452：贪心算法，用最少数量的箭引爆所有气球',
  icon: '🎯',
  template,
  Visualizer: MinArrowsVisualizer,
  difficulty: 2,
  levelOrder: 13,
  learningGoal: '掌握区间交集贪心求最少箭数',
});
