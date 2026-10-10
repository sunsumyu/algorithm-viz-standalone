/**
 * 状态压缩 BFS (State Compression BFS - LeetCode 847 / 864) — 领域适配器
 * 遵循 Matt Pocock 深模块哲学：
 * 步进推演委托至 StateCompressionBfsStepCompiler
 * 视口沙盘与指标舱委托至 StateCompressionBfsCanvasAdapter
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  STATE_COMPRESSION_BFS_CODE_LANGUAGES,
  STATE_COMPRESSION_BFS_PROBLEM_HTML,
  STATE_COMPRESSION_BFS_ANALYSIS_HTML,
} from './state-compression-bfs-problem-content';
import {
  buildStateBFSSteps,
  type StateBFSItem,
} from './state-compression-bfs-step-compiler';
import {
  renderStateCompressionBfsCanvas,
  renderStateCompressionBfsCustomMetrics,
} from '../../../core/renderers/adapters/state-compression-bfs-canvas-adapter';

const { Visualizer } = registerDeclarativeAlgorithm({
  id: 'state-compression-bfs',
  name: '状态压缩 BFS (State Compression BFS)',
  category: 'graph',
  description: '状态空间扩维经典：位掩码 1<<k 记录收集状态、三维判重 visited[r][c][mask]、首次搜达目标必定为全局最优 (LeetCode 864)',
  icon: '🔑',
  difficulty: 3,
  levelOrder: 28,
  learningGoal: '掌握状态压缩 BFS 扩维思路、位运算判重与拾取机制及分层搜索最短性',
  aliases: ['847', '864', 'state-bfs', 'shortestPathLength'],
  presets: [
    { label: '经典 3x3 钥匙收集迷宫', values: { preset: 'classic_3x3' } },
    { label: '线性网格走廊 (快速演示)', values: { preset: 'simple_line' } },
  ],
  codeLanguages: STATE_COMPRESSION_BFS_CODE_LANGUAGES,
  problemHtml: STATE_COMPRESSION_BFS_PROBLEM_HTML,
  analysisHtml: STATE_COMPRESSION_BFS_ANALYSIS_HTML,
  generateSteps: (inputs) => buildStateBFSSteps((inputs?.preset as string) || 'classic_3x3'),
  renderCanvas: (container, step) => renderStateCompressionBfsCanvas(container, step as StateBFSItem),
  renderCustomMetrics: (container, step) => renderStateCompressionBfsCustomMetrics(container, step as StateBFSItem),
});

export { Visualizer as StateCompressionBfsVisualizer, buildStateBFSSteps, type StateBFSItem };
