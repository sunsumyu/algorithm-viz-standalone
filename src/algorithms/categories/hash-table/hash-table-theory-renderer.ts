/**
 * 哈希表理论基础可视化器 — 4-Card 标准现代架构
 * 演示哈希函数映射、哈希碰撞与拉链法链表挂载
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  HASH_TABLE_THEORY_PROBLEM_HTML,
  HASH_TABLE_THEORY_ANALYSIS_HTML,
  HASH_TABLE_THEORY_CODE_LANGUAGES,
} from './hash-table-theory-problem-content';
import {
  HTTStep,
  HASH_TABLE_THEORY_CODE_LINES,
  parseKeysList,
  buildTheorySteps,
} from './hash-table-theory-step-compiler';
import {
  HTTDomElements,
  renderHashTableTheoryStep,
} from './hash-table-theory-canvas-adapter';
import template from './hash-table-theory.html?raw';

export type { HTTStep };
export {
  HASH_TABLE_THEORY_CODE_LINES,
  parseKeysList,
  buildTheorySteps,
  renderHashTableTheoryStep,
};

export class HashTableTheoryVisualizer extends StepVisualizer<HTTStep> {
  protected codeLanguages = HASH_TABLE_THEORY_CODE_LANGUAGES;
  protected codeLines = HASH_TABLE_THEORY_CODE_LANGUAGES['java'];
  protected codePanelTitle = '哈希表实现原理 代码演示';

  private currentKeys: number[] = [12, 18, 24, 7, 13];
  private domElements: HTTDomElements = {
    root: null,
    bucketsListEl: null,
    metricKeyEl: null,
    metricSlotEl: null,
    metricCollisionEl: null,
    metricLoadEl: null,
    formulaCalcEl: null,
    logContainer: null,
    logCountEl: null,
  };

  protected initDOMElements(): void {
    if (!this.root) return;

    this.domElements = {
      root: this.root,
      bucketsListEl: this.root.querySelector('#htt-buckets-list'),
      metricKeyEl: this.root.querySelector('#metric-key'),
      metricSlotEl: this.root.querySelector('#metric-slot'),
      metricCollisionEl: this.root.querySelector('#metric-collision'),
      metricLoadEl: this.root.querySelector('#metric-load'),
      formulaCalcEl: this.root.querySelector('#formula-calc'),
      logContainer: this.root.querySelector('#log-container'),
      logCountEl: this.root.querySelector('#log-count'),
    };

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

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
    this.mountTerminal({
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
    renderHashTableTheoryStep(this.domElements, step, this.currentStepIndex);
  }

  public reset(): void {
    super.reset();
    if (this.domElements.logContainer) this.domElements.logContainer.innerHTML = '';
    if (this.domElements.logCountEl) this.domElements.logCountEl.textContent = '0 条记录';
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
