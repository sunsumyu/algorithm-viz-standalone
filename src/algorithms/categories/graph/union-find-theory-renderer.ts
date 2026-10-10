/**
 * 并查集理论基础 (Union-Find Theory) — 领域适配器
 * 遵循 Matt Pocock 深模块哲学：
 * 步进推演委托至 UnionFindTheoryStepCompiler
 * 森林沙盘与指标舱委托至 UnionFindTheoryCanvasAdapter
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  UNION_FIND_THEORY_CODE_LANGUAGES,
  UNION_FIND_THEORY_PROBLEM_HTML,
  UNION_FIND_THEORY_ANALYSIS_HTML,
} from './union-find-theory-problem-content';
import {
  buildUnionFindTheorySteps,
  type UFStep,
} from './union-find-theory-step-compiler';
import {
  renderUnionFindTheoryCanvas,
  renderUnionFindTheoryCustomMetrics,
} from '../../../core/renderers/adapters/union-find-theory-canvas-adapter';

const { Visualizer } = registerDeclarativeAlgorithm({
  id: 'union-find-theory',
  name: '并查集理论基础 (Union-Find Theory)',
  category: 'graph',
  description: '并查集核心原理解析：树形表示、find 寻根、路径压缩与按秩合并 O(α(n))',
  icon: '🔗',
  difficulty: 1,
  levelOrder: 14,
  learningGoal: '掌握并查集树形指针结构，深刻理解路径压缩与按秩合并双重优化精髓',
  aliases: ['disjoint-set-theory', 'union-find-basic'],
  metrics: [
    { id: 'metric-uf-op', label: '当前操作', color: '#38bdf8' },
    { id: 'metric-uf-sets', label: '独立集合数', color: '#34d399' },
    { id: 'metric-uf-merges', label: '累计合并', color: '#f59e0b' },
  ],
  codeLanguages: UNION_FIND_THEORY_CODE_LANGUAGES,
  problemHtml: UNION_FIND_THEORY_PROBLEM_HTML,
  analysisHtml: UNION_FIND_THEORY_ANALYSIS_HTML,
  generateSteps: () => buildUnionFindTheorySteps(),
  renderCanvas: (container, step) => renderUnionFindTheoryCanvas(container, step as UFStep),
  renderCustomMetrics: (container, step) => renderUnionFindTheoryCustomMetrics(container, step as UFStep),
});

export { Visualizer as UnionFindTheoryVisualizer, buildUnionFindTheorySteps, type UFStep };
