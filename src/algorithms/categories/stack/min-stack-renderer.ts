import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  type MinStackStep,
  MIN_STACK_CODES,
  buildMinStackSteps
} from './min-stack-step-compiler';
import { renderMinStackCanvas } from './min-stack-canvas-adapter';

export type { MinStackStep };
export { MIN_STACK_CODES, buildMinStackSteps, renderMinStackCanvas };

registerDeclarativeAlgorithm({
  id: 'min-stack',
  name: '最小栈',
  category: 'stack',
  learningGoal: '掌握双栈同步机制，支持 push、pop、top 及常数时间 O(1) 检索最小元素',
  inputs: [
    {
      id: 'commands',
      label: '操作指令序列',
      type: 'text',
      defaultValue: 'push(-2), push(0), push(-3), getMin(), pop(), top(), getMin()',
      placeholder: '逗号分隔指令'
    }
  ],
  codeLanguages: MIN_STACK_CODES,
  generateSteps: (inputs) => {
    const raw = String(inputs.commands || 'push(-2), push(0), push(-3), getMin(), pop(), top(), getMin()');
    const cmds = raw.split(/[,，\n]+/).map(s => s.trim()).filter(Boolean);
    return buildMinStackSteps(cmds.length ? cmds : ['push(-2)', 'push(0)', 'push(-3)', 'getMin()', 'pop()', 'top()', 'getMin()']);
  },
  renderCanvas: (container, step) => {
    renderMinStackCanvas(container, step as MinStackStep);
  }
});
