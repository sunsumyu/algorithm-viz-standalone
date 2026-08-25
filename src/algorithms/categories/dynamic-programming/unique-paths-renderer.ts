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

export const UniversalStageVisualizer = UniquePathsVisualizer;

// 1. 斐波那契数 (LeetCode 509)
registerAlgorithm({
  id: 'fibonacci',
  name: '斐波那契数',
  viewId: 'fibonacci',
  category: 'dynamic-programming',
  description: '斐波那契数列（LeetCode 509）：F(0)=0, F(1)=1, F(n)=F(n-1)+F(n-2)。展示递归重叠子问题、剪枝备忘录与空间优化。',
  icon: '🔢',
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '动态规划极简第一课：从朴素二叉递归爆炸到 O(1) 滚动双变量',
  template: '<div id="fibonacci" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
});

// 2. 爬楼梯 (LeetCode 70)
registerAlgorithm({
  id: 'climb-stairs',
  name: '爬楼梯',
  viewId: 'climb-stairs',
  category: 'dynamic-programming',
  description: '爬楼梯问题（LeetCode 70）：每次只能爬 1 阶或 2 阶，到达第 n 阶的方法数为到达第 n-1 阶与第 n-2 阶方法数之和。',
  icon: '🪜',
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '理解组合状态转移与物理意义映射：每次跨 1 步或 2 步的路径方案数',
  template: '<div id="climb-stairs" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
});

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

// 5. 最小路径和 (LeetCode 64)
registerAlgorithm({
  id: 'min-path-sum',
  name: '最小路径和',
  viewId: 'min-path-sum',
  category: 'dynamic-programming',
  description: '网格权值路径（LeetCode 64）：从左上角到右下角，路径上的数字总和最小，状态转移方程 dp[i][j] = min(上, 左) + grid[i][j]。',
  icon: '📉',
  difficulty: 2,
  levelOrder: 7,
  learningGoal: '掌握网格权值最小化动态规划模型与一维空间滚动压缩',
  template: '<div id="min-path-sum" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
});

// 6. 不同的子序列 (LeetCode 115)
registerAlgorithm({
  id: 'distinct-subsequences',
  name: '不同的子序列',
  viewId: 'distinct-subsequences',
  category: 'dynamic-programming',
  description: '子序列方案数（LeetCode 115）：计算在字符串 s 的子序列中 t 出现的个数，状态转移 dp[i][j] = dp[i-1][j-1] + dp[i-1][j] 与一维倒序压缩。',
  icon: '🧮',
  difficulty: 3,
  levelOrder: 8,
  learningGoal: '掌握双序列匹配决策分支、空串 Base Case 初始化与一维倒序空间压缩核心技巧',
  template: '<div id="distinct-subsequences" class="view-container active" style="width: 100%; height: 100%; padding: 0;"></div>',
  Visualizer: UniversalStageVisualizer,
});
