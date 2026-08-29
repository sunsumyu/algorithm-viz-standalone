/**
 * 哈希表理论基础可视化器 — 4-Card 标准现代架构
 * 演示哈希函数映射、哈希碰撞与拉链法链表挂载
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  HASH_TABLE_THEORY_PROBLEM_HTML,
  HASH_TABLE_THEORY_ANALYSIS_HTML,
  HASH_TABLE_THEORY_CODE_LANGUAGES,
} from './hash-table-theory-problem-content';
import template from './hash-table-theory.html?raw';

export interface HTTStep {
  buckets: number[][];
  currentKey: number | null;
  targetSlot: number | null;
  isCollision: boolean;
  loadFactor: number;
  status: 'init' | 'hash-calc' | 'insert' | 'collision-chain' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function parseKeysList(input: string): number[] {
  const arr = input
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => Number.isFinite(n));
  return arr.length > 0 ? arr : [12, 18, 24, 7, 13];
}

export function buildTheorySteps(keys: number[], bucketSize: number = 6): HTTStep[] {
  const steps: HTTStep[] = [];
  const buckets: number[][] = Array.from({ length: bucketSize }, () => []);
  let totalInserted = 0;

  steps.push({
    buckets: buckets.map((b) => [...b]),
    currentKey: null,
    targetSlot: null,
    isCollision: false,
    loadFactor: 0,
    status: 'init',
    message: `初始化容量为 ${bucketSize} 的哈希表，哈希函数为 hash(key) = key % ${bucketSize}。准备依次插入 Key 列表: [${keys.join(', ')}]。`,
    log: `初始化哈希表 (Size=${bucketSize})`,
    codeLine: 2,
  });

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    const slot = key % bucketSize;
    const isColl = buckets[slot].length > 0;

    steps.push({
      buckets: buckets.map((b) => [...b]),
      currentKey: key,
      targetSlot: slot,
      isCollision: isColl,
      loadFactor: Number((totalInserted / bucketSize).toFixed(2)),
      status: 'hash-calc',
      message: `计算哈希值：key = ${key}，hash(${key}) = ${key} % ${bucketSize} = ${slot}。定位到桶 [${slot}]。`,
      log: `计算 hash(${key}) = ${slot}`,
      codeLine: 5,
    });

    buckets[slot].push(key);
    totalInserted++;
    const loadFactor = Number((totalInserted / bucketSize).toFixed(2));

    steps.push({
      buckets: buckets.map((b) => [...b]),
      currentKey: key,
      targetSlot: slot,
      isCollision: isColl,
      loadFactor,
      status: isColl ? 'collision-chain' : 'insert',
      message: isColl
        ? `⚠️ 发生哈希碰撞！桶 [${slot}] 中已有元素 [${buckets[slot].slice(0, -1).join(', ')}]。使用拉链法将新节点 ${key} 挂载到链表末尾。`
        : `槽位 [${slot}] 当前为空，直接将 key = ${key} 存入桶 [${slot}]。`,
      log: isColl ? `⚠️ 碰撞挂载: 桶 [${slot}] -> ${key}` : `直接插入: 桶 [${slot}] -> ${key}`,
      codeLine: isColl ? 9 : [6, 9],
    });
  }

  steps.push({
    buckets: buckets.map((b) => [...b]),
    currentKey: null,
    targetSlot: null,
    isCollision: false,
    loadFactor: Number((totalInserted / bucketSize).toFixed(2)),
    status: 'done',
    message: `🎉 所有 Key 已全部完成插入！哈希表当前元素总数 ${totalInserted}，最终装载因子 α = ${(totalInserted / bucketSize).toFixed(2)}。`,
    log: `演示完毕: 共插入 ${totalInserted} 个键`,
    codeLine: 10,
  });

  return steps;
}

export class HashTableTheoryVisualizer extends StepVisualizer<HTTStep> {
  protected codeLanguages = HASH_TABLE_THEORY_CODE_LANGUAGES;
  protected codeLines = HASH_TABLE_THEORY_CODE_LANGUAGES['java'];
  protected codePanelTitle = '哈希表实现原理 代码演示';

  private currentKeys: number[] = [12, 18, 24, 7, 13];
  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private bucketsListEl: HTMLElement | null = null;
  private metricKeyEl: HTMLElement | null = null;
  private metricSlotEl: HTMLElement | null = null;
  private metricCollisionEl: HTMLElement | null = null;
  private metricLoadEl: HTMLElement | null = null;
  private formulaCalcEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.bucketsListEl = this.root.querySelector('#htt-buckets-list');
    this.metricKeyEl = this.root.querySelector('#metric-key');
    this.metricSlotEl = this.root.querySelector('#metric-slot');
    this.metricCollisionEl = this.root.querySelector('#metric-collision');
    this.metricLoadEl = this.root.querySelector('#metric-load');
    this.formulaCalcEl = this.root.querySelector('#formula-calc');
    this.liveTextEl = this.root.querySelector('#htt-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 绑定播放控制
    this.bindPlaybackControls();

    // 运行与重置
    this.root.querySelector('#btn-generate')?.addEventListener('click', () => this.start());
    this.root.querySelector('#btn-reset')?.addEventListener('click', () => this.reset());

    // 进度条 Scrubber
    const slider = this.root.querySelector('#slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseInt((e.target as HTMLInputElement).value, 10);
        if (!isNaN(val) && val >= 0 && val < this.steps.length) {
          this.goToStep(val);
        }
      });
    }

    // 步进控制
    this.root.querySelector('#btn-step-prev')?.addEventListener('click', () => this.prevStep());
    this.root.querySelector('#btn-step-next')?.addEventListener('click', () => this.nextStep());
    this.root.querySelector('#btn-play-pause')?.addEventListener('click', () => this.togglePlay());

    // 速度选择
    const speedSelect = this.root.querySelector('#select-speed') as HTMLSelectElement | null;
    if (speedSelect) {
      speedSelect.addEventListener('change', () => {
        this.playbackSpeed = parseInt(speedSelect.value, 10) || 600;
      });
    }

    // 示例 Chips
    this.root.querySelectorAll<HTMLButtonElement>('.htt-chip').forEach((btn) => {
      btn.addEventListener('click', () => {
        if (btn.dataset.keys) {
          this.currentKeys = parseKeysList(btn.dataset.keys);
        }
        this.start();
      });
    });

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: HASH_TABLE_THEORY_PROBLEM_HTML,
      analysisHtml: HASH_TABLE_THEORY_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): HTTStep[] {
    return buildTheorySteps(this.currentKeys, 6);
  }

  protected renderStep(step: HTTStep): void {
    const { buckets, currentKey, targetSlot, isCollision, loadFactor, status, message } = step;

    // 1. 渲染哈希桶阵列与链表
    if (this.bucketsListEl) {
      this.bucketsListEl.innerHTML = buckets
        .map((chain, slotIdx) => {
          const isTarget = targetSlot === slotIdx;
          let rowClass = 'htt-bucket-row';
          if (isTarget) rowClass += ' is-target';

          const nodesHtml =
            chain.length === 0
              ? '<span style="color:#94a3b8; font-size:10px; font-style:italic;">null (空)</span>'
              : chain
                  .map((k, kIdx) => {
                    const isNew = isTarget && kIdx === chain.length - 1 && (status === 'insert' || status === 'collision-chain');
                    return `
                    <div class="htt-chain-node ${isNew ? 'is-new' : ''}">
                      <span>key: ${k}</span>
                    </div>
                    ${kIdx < chain.length - 1 ? '<span style="color:#94a3b8;">&rarr;</span>' : ''}
                  `;
                  })
                  .join('');

          return `
            <div class="${rowClass}">
              <div class="htt-slot-badge">桶 [${slotIdx}]</div>
              <div class="htt-chain-nodes">${nodesHtml}</div>
            </div>
          `;
        })
        .join('');
    }

    // 2. 更新状态监视器
    if (this.metricKeyEl) this.metricKeyEl.textContent = currentKey !== null ? String(currentKey) : '—';
    if (this.metricSlotEl) this.metricSlotEl.textContent = targetSlot !== null ? `[${targetSlot}]` : '—';
    if (this.metricCollisionEl) {
      if (status === 'collision-chain') {
        this.metricCollisionEl.textContent = '⚠️ 发生碰撞';
        this.metricCollisionEl.style.color = '#ef4444';
      } else if (status === 'insert') {
        this.metricCollisionEl.textContent = '无碰撞';
        this.metricCollisionEl.style.color = '#10b981';
      } else {
        this.metricCollisionEl.textContent = '—';
        this.metricCollisionEl.style.color = '#64748b';
      }
    }
    if (this.metricLoadEl) this.metricLoadEl.textContent = String(loadFactor);

    if (this.formulaCalcEl) {
      if (currentKey !== null && targetSlot !== null) {
        this.formulaCalcEl.textContent = `hash(${currentKey}) = ${currentKey} % 6 = ${targetSlot}`;
      } else {
        this.formulaCalcEl.textContent = 'hash(key) = key % 6';
      }
    }

    if (this.liveTextEl) this.liveTextEl.textContent = message;

    // 3. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background = isCollision ? '#fef2f2' : status === 'done' ? '#f0fdf4' : '#eff6ff';
      logEntry.style.color = isCollision ? '#b91c1c' : status === 'done' ? '#15803d' : '#1d4ed8';
      logEntry.style.border =
        '1px solid ' + (isCollision ? '#fecaca' : status === 'done' ? '#bbf7d0' : '#bfdbfe');
      logEntry.innerHTML = `<span style="color:#94a3b8;">[Step ${stepIndex + 1}]</span> ${step.log}`;

      this.logContainer.appendChild(logEntry);
      this.logContainer.scrollTop = this.logContainer.scrollHeight;

      if (this.logCountEl) {
        this.logCountEl.textContent = `${this.logContainer.children.length} 条记录`;
      }
    }

    // 4. 同步代码高亮
    if (this.terminalInstance) {
      const line = Array.isArray(step.codeLine) ? step.codeLine[0] : step.codeLine;
      this.terminalInstance.highlightLine(line);
    }

    // 5. 更新底部播放控制条
    const slider = this.root?.querySelector('#slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.max = String(this.steps.length - 1);
      slider.value = String(this.currentStepIndex);
    }
    const stepCurEl = this.root?.querySelector('#step-cur');
    const stepTotalEl = this.root?.querySelector('#step-total');
    if (stepCurEl) stepCurEl.textContent = String(this.currentStepIndex + 1);
    if (stepTotalEl) stepTotalEl.textContent = String(this.steps.length);

    const badgeCollision = this.root?.querySelector('#badge-collision');
    if (badgeCollision) {
      badgeCollision.textContent =
        status === 'done' ? '演示完成' : isCollision ? '⚠️ 发生碰撞 (Chaining)' : '无碰撞 (Direct)';
    }
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
    if (this.terminalInstance) this.terminalInstance.highlightLine(0);
  }
}

registerAlgorithm({
  id: 'hash-table-theory',
  name: '哈希表理论基础',
  viewId: 'algo-hash-table-theory-view',
  category: 'hash-table',
  description: '哈希表的核心概念、哈希函数与冲突处理',
  icon: '📖',
  difficulty: 1,
  levelOrder: 0,
  learningGoal: '理解哈希表的原理、哈希函数和冲突处理方法',
  template,
  Visualizer: HashTableTheoryVisualizer,
});
