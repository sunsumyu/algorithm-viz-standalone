/**
 * Class 154: 非旋 Treap / FHQ-Treap
 * 范浩强发明的无旋分裂合并平衡树 / 洛谷 P3369 & P3391
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_149_154_PROBLEMS } from './advanced-149-154-problem-content';
import { FHQ_TREAP_CODES } from './advanced-149-154-stage-codes';
import { FHQStep, buildFHQSteps } from '../../../../core/renderers/adapters/treap-fhq-step-compiler';
import { renderFHQTreapCanvas } from '../../../../core/renderers/adapters/treap-fhq-canvas-adapter';

export type { FHQStep };
export { buildFHQSteps };

export const fhqTreapVisualizer = registerDeclarativeAlgorithm<FHQStep>({
  id: 'treap-fhq-154',
  name: '非旋 Treap / FHQ-Treap (Class 154)',
  aliases: ['class154-code01', 'treap-fhq', 'treap-fhq-154', 'fhq-treap'],
  category: 'tree',
  icon: '🎋',
  difficulty: 3,
  levelOrder: 154,
  description: '左程云算法通关课 Class 154：有序表专题 7 - 非旋 Treap (FHQ-Treap)。范浩强发明，split(按值或排名分裂) 与 merge(堆序合并) 极简无旋平衡树。',
  learningGoal: '深刻理解 FHQ-Treap 的 split 按值分裂与 merge 堆序合并双核心函数，掌握无旋平衡树与区间操作原理',
  problemHtml: ADVANCED_149_154_PROBLEMS.treapFhq.html,
  analysisHtml: ADVANCED_149_154_PROBLEMS.treapFhq.html,
  inputs: [
    {
      id: 'splitKey',
      label: '分裂阈值 Split Key',
      type: 'select',
      defaultValue: '25',
      options: [
        { label: '按 Key = 25 分裂 (左: 10,20 / 右: 30,40,50)', value: '25' },
        { label: '按 Key = 35 分裂 (左: 10,20,30 / 右: 40,50)', value: '35' },
      ],
    },
  ],
  codeLanguages: FHQ_TREAP_CODES,
  generateSteps: (input) => {
    const k = Number(input.splitKey ?? 25);
    const defaultItems = [
      { val: 10, pri: 42 },
      { val: 20, pri: 17 },
      { val: 30, pri: 85 },
      { val: 40, pri: 23 },
      { val: 50, pri: 64 },
    ];
    return buildFHQSteps(defaultItems, k);
  },
  renderCanvas: renderFHQTreapCanvas,
});
