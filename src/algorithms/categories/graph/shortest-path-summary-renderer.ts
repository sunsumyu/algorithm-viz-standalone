/**
 * 最短路问题总结篇可视化器
 * 对比五大最短路算法 (Dijkstra, Bellman-Ford, SPFA, Floyd, A*)
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './shortest-path-summary.html?raw';
import {
  type SPSStep,
  SPS_ALGOS,
  buildSPSSteps,
} from './shortest-path-summary-step-compiler';

export type { SPSStep };
export { SPS_ALGOS, buildSPSSteps };

export class ShortestPathSummaryVisualizer extends StepVisualizer<SPSStep> {
  protected codeLines = [
    '// Shortest Path Algorithm Selection Guide (Java)',
    '// Non-negative weights -> PriorityQueue<Integer[]> Dijkstra',
    '// Negative weights -> int[] dist + edge relaxation (Bellman-Ford)',
    '// SPFA -> Queue<Integer> + inQueue boolean[]',
    '// All-pairs -> int[][] dist matrix (Floyd-Warshall)',
    '// Heuristic search -> PriorityQueue with f(n)=g(n)+h(n) (A*)',
    '// Limited edges -> backup clone + k rounds (Bellman-Ford)',
  ];
  protected codePanelTitle = '最短路算法选型 (Java)';

  private cardsEl: HTMLElement | null = null;
  private detailEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.cardsEl = this.root.querySelector('#sps-cards');
    this.detailEl = this.root.querySelector('#sps-detail');
    this.logEl = this.root.querySelector('#sps-log');
    this.btnStart = this.root.querySelector('#sps-start');
    this.bindPlaybackControls({
      speed: 'sps-speed',
      speedLabel: 'sps-speed-label',
      message: 'step-message',
    });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
  }

  protected buildSteps(): SPSStep[] {
    return buildSPSSteps();
  }

  protected renderStep(step: SPSStep): void {
    this.renderCards(step);
    this.renderDetail(step);
    this.renderLogLine(step);
  }

  private renderCards(step: SPSStep): void {
    if (!this.cardsEl) return;
    this.cardsEl.innerHTML = '';
    step.cards.forEach((card) => {
      const el = document.createElement('div');
      el.className = 'sps-algo-card';
      if (step.activeAlgo === card.id) el.classList.add('active');

      el.innerHTML = `
        <div class="sps-algo-card-icon">${card.icon}</div>
        <div class="sps-algo-card-name">${card.name}</div>
        <div class="sps-algo-card-desc">${card.desc}</div>
        <div class="sps-algo-card-meta">
          ${card.tags.map((t) => `<span class="sps-tag ${t.color}">${t.text}</span>`).join('')}
        </div>
      `;

      el.addEventListener('click', () => {
        const idx = SPS_ALGOS.findIndex((a) => a.id === card.id);
        if (idx >= 0 && idx + 1 < this.steps.length) {
          this.pause();
          this.currentIndex = idx + 1;
          this.render();
          this.updateButtons();
        }
      });

      this.cardsEl?.appendChild(el);
    });
  }

  private renderDetail(step: SPSStep): void {
    if (!this.detailEl) return;
    if (step.detail) {
      (this.detailEl as HTMLElement).style.display = '';
      this.detailEl.innerHTML = `<div class="sps-detail-content">${step.detail}</div>`;
    } else {
      (this.detailEl as HTMLElement).style.display = 'none';
    }
  }

  private renderLogLine(step: SPSStep): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const line = document.createElement('div');
      if (i === this.currentIndex) line.className = 'active';
      line.textContent = `${String(i + 1).padStart(2, '0')}. ${s.log}`;
      this.logEl?.appendChild(line);
    });
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'shortest-path-summary',
  name: '最短路问题总结篇',
  viewId: 'algo-shortest-path-summary-view',
  category: 'graph',
  description: '对比 Dijkstra、Bellman-Ford、SPFA、Floyd、A* 五大最短路算法',
  icon: '📊',
  template,
  Visualizer: ShortestPathSummaryVisualizer,
  difficulty: 1,
  levelOrder: 29,
  learningGoal: '理解五大最短路算法的适用场景和复杂度差异',
});
