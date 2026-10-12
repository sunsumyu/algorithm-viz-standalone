import {
  renderTwoSatBoard,
  renderTwoSatAdvancedBoard,
} from '../../../algorithms/categories/advanced-topics/advanced-191-195/advanced-191-195-shared';
import { composeUnifiedCanvas } from './unified-canvas-composer';
import {
  TwoSatStep,
  TwoSatAdvancedStep,
} from './two-sat-family-compiler';

export function renderTwoSatCanvas(container: HTMLElement, step: TwoSatStep): void {
  composeUnifiedCanvas(container, {
    metrics: [
      { label: '当前算法阶段', value: step.stage, color: '#047857' },
      { label: '取值准则', value: 'sccId[X] < sccId[~X] 取 TRUE', color: '#059669' },
    ],
    mainBoardHtml: renderTwoSatBoard(
      step.vars,
      step.clauses,
      step.sccId,
      step.assignment,
      step.isSatisfiable,
      step.stage
    ),
    formula: {
      title: '2-SAT 蕴含与矛盾充要定理',
      equation: '(A \\lor B) \\iff (\\neg A \\to B) \\land (\\neg B \\to A); \\quad \\text{无解 } \\iff \\exists i, \\text{scc}[2i] = \\text{scc}[2i+1]',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}

export function renderTwoSatAdvancedCanvas(container: HTMLElement, step: TwoSatAdvancedStep): void {
  composeUnifiedCanvas(container, {
    metrics: [
      { label: '当前算法阶段', value: step.stage, color: '#7c3aed' },
      { label: '排他建模优化', value: '两两排他 O(K^2) => 前缀链 O(K)', color: '#059669' },
    ],
    mainBoardHtml: renderTwoSatAdvancedBoard(
      step.vars,
      step.atMostOneSet,
      step.assignment,
      step.stage
    ),
    formula: {
      title: '前缀优化“至多选一个”核心逻辑',
      equation: 'X_i \\to \\text{pre}_i; \\quad \\text{pre}_{i-1} \\to \\text{pre}_i; \\quad X_i \\to \\neg \\text{pre}_{i-1} \\quad (O(K) \\text{ 边})',
      explanation: step.decision,
      statusBadge: step.statusBadge,
    },
  });
}
