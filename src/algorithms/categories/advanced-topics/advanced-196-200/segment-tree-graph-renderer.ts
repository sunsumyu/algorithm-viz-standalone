/**
 * Class 196: 线段树优化建图 (Segment Tree Graph Optimization)
 * 出树 (Out-Tree) 与入树 (In-Tree) 双树架构 / CF 786B Legacy
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_196_200_PROBLEMS } from './advanced-196-200-problem-content';
import { SEGMENT_TREE_GRAPH_CODES } from './advanced-196-200-stage-codes';
import {
  SegmentTreeGraphStep,
  buildSegmentTreeGraphSteps,
} from '../../../../core/renderers/adapters/advanced-graph-opt-family-compiler';
import { renderSegmentTreeGraphCanvas } from '../../../../core/renderers/adapters/advanced-graph-opt-family-canvas-adapter';

export type { SegmentTreeGraphStep };
export { buildSegmentTreeGraphSteps };

export const segmentTreeGraphVisualizer = registerDeclarativeAlgorithm<SegmentTreeGraphStep>({
  id: 'segment-tree-graph-196',
  name: '线段树优化建图 (Class 196)',
  category: 'graph',
  difficulty: 'hard',
  problemContent: ADVANCED_196_200_PROBLEMS.segmentTreeGraph,
  sourceCodes: SEGMENT_TREE_GRAPH_CODES,
  generateSteps: buildSegmentTreeGraphSteps,
  renderCanvas: renderSegmentTreeGraphCanvas,
});
