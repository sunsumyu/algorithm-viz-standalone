/**
 * Class 182: 可撤销并查集 (Rollback DSU)
 * 按秩合并 + 历史栈精确回滚 / 洛谷 P5490 衍生与各类分治底层
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_179_184_PROBLEMS } from './advanced-179-184-problem-content';
import { ROLLBACK_DSU_CODES } from './advanced-179-184-stage-codes';
import {
  buildRollbackDSUSteps,
  RollbackDSUStep,
} from '../../../../core/renderers/adapters/rollback-dsu-182-step-compiler';
import { renderRollbackDSUCanvas } from '../../../../core/renderers/adapters/rollback-dsu-182-canvas-adapter';

export { buildRollbackDSUSteps, type RollbackDSUStep };

export const rollbackDSUVisualizer = registerDeclarativeAlgorithm<RollbackDSUStep>({
  id: 'rollback-dsu-182',
  name: '可撤销并查集 (Rollback DSU / Class 182)',
  aliases: ['class182-code01', 'rollback-dsu-182', 'undoable-dsu'],
  category: 'tree',
  icon: '⏪',
  difficulty: 3,
  levelOrder: 182,
  description: '左程云算法通关课 Class 182：可撤销并查集 (Rollback DSU)。严格按秩合并维持树高 O(log N)，历史操作栈记录变更，O(1) 精确回滚任意层级状态。',
  learningGoal: '掌握可撤销并查集按秩合并原理、禁用路径压缩的深层原因以及 O(1) 历史栈精准回退',
  problemHtml: ADVANCED_179_184_PROBLEMS.rollbackDSU.html,
  analysisHtml: ADVANCED_179_184_PROBLEMS.rollbackDSU.html,
  presets: [
    { label: '连续合并 3 次 -> 回退 1 次', values: { preset: 'union3_rollback1' } },
  ],
  codeLanguages: ROLLBACK_DSU_CODES,
  generateSteps: () => buildRollbackDSUSteps(),
  renderCanvas: (container, step) => renderRollbackDSUCanvas(container, step),
});
