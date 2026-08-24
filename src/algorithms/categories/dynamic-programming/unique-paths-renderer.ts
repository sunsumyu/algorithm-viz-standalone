/**
 * 网格 DP 系列 现代交互式可视化演示 (Grid DP Standalone Visualizer)
 * 支持「不同路径」(LeetCode 62) 与「不同路径 II」(LeetCode 63) 全量四阶段演化骨架。
 * 支持精简版 (一维 DP 极简看板) 与 完整版 (4 阶段演化精讲) 自由无缝切换。
 */

import { IVisualizer, VisualizerContext } from '../../../core/interfaces';
import { registerAlgorithm } from '../../../core/registry';
import uniquePathsLiteHtml from '../../../../unique-paths-lite.html?raw';
import uniquePathsFullHtml from '../../../../unique-paths.html?raw';

import { VisualizerStateRouter, type VisualizerState } from '../../../core/state-router';

export class UniquePathsVisualizer implements IVisualizer {
  private iframe: HTMLIFrameElement | null = null;
  private currentMode: 'lite' | 'full' = 'lite';
  private modelId = 'unique-paths';

  public async init(context?: VisualizerContext): Promise<void> {
    this.modelId = context?.algorithmId || 'unique-paths';
    const container = context?.root || document.getElementById(this.modelId) || document.getElementById('unique-paths') || document.body;
    container.innerHTML = '';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.overflow = 'hidden';
    container.style.padding = '0';
    container.style.margin = '0';
    container.style.background = '#f1f5f9';

    const iframe = document.createElement('iframe');
    iframe.style.width = '100%';
    iframe.style.height = '100%';
    iframe.style.border = 'none';
    iframe.style.display = 'block';
    iframe.style.overflow = 'auto';
    
    // 默认展示用户指定的精简版，并注入当前算法模型 ID
    let baseHtml = this.currentMode === 'lite' ? uniquePathsLiteHtml : uniquePathsFullHtml;
    baseHtml = baseHtml.replace('</head>', `<script>window.__DEFAULT_MODEL_ID = ${JSON.stringify(this.modelId)};</script>\n</head>`);
    iframe.srcdoc = baseHtml;

    container.appendChild(iframe);
    this.iframe = iframe;

    // 挂载全局切换钩子，方便 iframe 内部一键切换并无损携带状态
    (window as any).__toggleUniquePathsVersion = (targetMode: 'lite' | 'full', state?: VisualizerState) => {
      this.currentMode = targetMode;
      if (this.iframe) {
        let nextHtml = targetMode === 'lite' ? uniquePathsLiteHtml : uniquePathsFullHtml;
        let scriptTags = `<script>window.__DEFAULT_MODEL_ID = ${JSON.stringify(this.modelId)};</script>\n`;
        if (state) {
          const hash = VisualizerStateRouter.serialize(state);
          scriptTags += `<script>window.location.hash = ${JSON.stringify(hash)};</script>\n`;
        }
        nextHtml = nextHtml.replace('</head>', `${scriptTags}</head>`);
        this.iframe.srcdoc = nextHtml;
      }
    };
  }

  public destroy(): void {
    if (this.iframe) {
      this.iframe.srcdoc = '';
      this.iframe.remove();
      this.iframe = null;
    }
    if ((window as any).__toggleUniquePathsVersion) {
      delete (window as any).__toggleUniquePathsVersion;
    }
  }
}

registerAlgorithm({
  id: 'unique-paths',
  name: '不同路径',
  viewId: 'unique-paths',
  category: 'dynamic-programming',
  description: '网格路径数（LeetCode 62）：从左上角到右下角，只能向下或向右移动，空间复杂度优化至一维 O(n)。',
  icon: '🧭',
  difficulty: 2,
  levelOrder: 5,
  learningGoal: '掌握二维网格路径模型与一维空间压缩优化技巧',
  template: '<div id="unique-paths" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniquePathsVisualizer,
});

registerAlgorithm({
  id: 'unique-paths-ii',
  name: '不同路径 II',
  viewId: 'unique-paths-ii',
  category: 'dynamic-programming',
  description: '带障碍网格路径数（LeetCode 63）：网格中存在障碍物（值为 1），遇到障碍物时路径数为 0，空间复杂度优化至一维 O(n)。',
  icon: '🚧',
  difficulty: 2,
  levelOrder: 6,
  learningGoal: '掌握带障碍物的网格路径动态规划与状态阻断边界处理技巧',
  template: '<div id="unique-paths-ii" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniquePathsVisualizer,
});
