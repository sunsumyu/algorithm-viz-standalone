/**
 * 动态规划四阶段全演化可视化画板 (Dynamic Programming Universal 4-Stage Visualizer)
 * 支持「不同路径」(LeetCode 62)、「不同路径 II」(LeetCode 63)、「最小路径和」(LeetCode 64)、
 * 「斐波那契数」(LeetCode 509)、「爬楼梯」(LeetCode 70)、「0-1背包」等全量四阶段演化标准画板。
 * 支持精简版 (一维 DP 极简看板) 与 完整版 (4 阶段演化精讲) 自由无缝切换。
 */

import { IVisualizer, VisualizerContext } from '../../../core/interfaces';
import { registerAlgorithm } from '../../../core/registry';
import uniquePathsLiteHtml from '../../../../unique-paths-lite.html?raw';
import uniquePathsFullHtml from '../../../../unique-paths.html?raw';

import { VisualizerStateRouter, type VisualizerState } from '../../../core/state-router';
import { shortcutController } from '../../../core/controllers/keyboard-shortcut-controller';
import { algorithmRegistry } from '../../../core/algorithm-registry';
import { AlgorithmModelRepository } from '../../../core/model-repository';

export class UniquePathsVisualizer implements IVisualizer {
  private iframe: HTMLIFrameElement | null = null;
  private currentMode: 'lite' | 'full' = 'lite';
  private modelId = 'unique-paths';

  public async init(context?: VisualizerContext): Promise<void> {
    if (!context?.algorithmId) {
      throw new Error('[UniversalStageVisualizer] 必须在 context 中提供 algorithmId！禁止默认回退。');
    }
    this.modelId = context.algorithmId;
    const container = context.root || document.getElementById(this.modelId) || document.body;
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
    iframe.style.opacity = '0';
    iframe.style.transition = 'opacity 0.12s ease-out';
    
    // 1. 获取当前算法的真实名称和题号，首屏 Pre-hydration 注入，彻底杜绝出现其他算法模板残影
    const meta = algorithmRegistry.getMetadata(this.modelId);
    let titleText = meta?.name || '算法演示';
    let lcId: string | number | undefined;
    if (AlgorithmModelRepository.hasModel(this.modelId)) {
      const model = AlgorithmModelRepository.getModel(this.modelId);
      if (model.name) titleText = model.name;
      lcId = model.problem?.leetcodeId;
    }
    if (!lcId) {
      if (this.modelId === 'unique-paths') lcId = 62;
      else if (this.modelId === 'unique-paths-ii') lcId = 63;
      else if (this.modelId === 'coin-change-ii') lcId = 518;
    }
    const fullTitle = lcId ? `${lcId}. ${titleText}` : titleText;

    // 默认展示用户指定的精简版，并注入当前算法模型 ID 与真实标题
    let baseHtml = this.currentMode === 'lite' ? uniquePathsLiteHtml : uniquePathsFullHtml;
    baseHtml = baseHtml.replace('</head>', `<script>window.__DEFAULT_MODEL_ID = ${JSON.stringify(this.modelId)};</script>\n</head>`);
    
    // 预注入真实标题，杜绝首屏闪烁
    baseHtml = baseHtml.replace(
      /(<h1 id="header-algo-main-title"[^>]*>)[^<]*(<\/h1>)/,
      `$1${fullTitle}$2`
    );
    baseHtml = baseHtml.replace(
      /(<h1 class="text-base sm:text-lg font-bold text-slate-900 truncate">)[^<]*(<\/h1>)/,
      `$1${lcId ? `LeetCode ${fullTitle}` : fullTitle}$2`
    );

    iframe.srcdoc = baseHtml;

    container.appendChild(iframe);
    this.iframe = iframe;

    // 绑定 iframe 内部按键事件穿透中继，杜绝焦点被 iframe 截获导致快捷键失效
    const bindIframeShortcuts = () => {
      try {
        const win = iframe.contentWindow;
        if (win) {
          win.removeEventListener('keydown', this.handleIframeKeyDown);
          win.addEventListener('keydown', this.handleIframeKeyDown);
        }
      } catch (err) {
        // 忽略跨域或未就绪异常
      }
    };

    const onIframeReady = () => {
      iframe.style.opacity = '1';
      bindIframeShortcuts();
    };

    iframe.addEventListener('load', onIframeReady);
    setTimeout(onIframeReady, 40);
    setTimeout(bindIframeShortcuts, 250);

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
        nextHtml = nextHtml.replace(
          /(<h1 id="header-algo-main-title"[^>]*>)[^<]*(<\/h1>)/,
          `$1${fullTitle}$2`
        );
        nextHtml = nextHtml.replace(
          /(<h1 class="text-base sm:text-lg font-bold text-slate-900 truncate">)[^<]*(<\/h1>)/,
          `$1${lcId ? `LeetCode ${fullTitle}` : fullTitle}$2`
        );
        this.iframe.srcdoc = nextHtml;
        setTimeout(bindIframeShortcuts, 50);
        setTimeout(bindIframeShortcuts, 300);
      }
    };
  }

  private handleIframeKeyDown = (e: KeyboardEvent): void => {
    shortcutController.handleKeyEvent(e);
  };

  public destroy(): void {
    if (this.iframe) {
      try {
        this.iframe.contentWindow?.removeEventListener('keydown', this.handleIframeKeyDown);
      } catch {
        // 忽略
      }
      this.iframe.srcdoc = '';
      this.iframe.remove();
      this.iframe = null;
    }
    if ((window as any).__toggleUniquePathsVersion) {
      delete (window as any).__toggleUniquePathsVersion;
    }
  }
}

export const UniversalStageVisualizer = UniquePathsVisualizer;

// 3. 不同路径 (LeetCode 62)
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
  Visualizer: UniversalStageVisualizer,
});

// 4. 不同路径 II (LeetCode 63)
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
  Visualizer: UniversalStageVisualizer,
});

