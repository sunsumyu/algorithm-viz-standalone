/**
 * Class 029: 经典暴力递归入门 (汉诺塔问题 - Tower of Hanoi)
 * 经典算法入门第一课
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  Hanoi029Step,
  HANOI_029_CODES,
  buildHanoi029Steps,
} from './hanoi-recursion-029-step-compiler';
import { renderHanoiRecursion029Canvas } from './hanoi-recursion-029-canvas-adapter';

// 向后兼容导出
export type { Hanoi029Step };
export {
  HANOI_029_CODES,
  buildHanoi029Steps,
};

export const hanoiRecursion029Visualizer = registerDeclarativeAlgorithm<Hanoi029Step>({
  id: 'hanoi-recursion-029',
  name: '经典暴力递归入门 (汉诺塔) (Class 029)',
  category: 'backtracking',
  icon: '🗼',
  difficulty: 1,
  levelOrder: 29,
  learningGoal: '深刻体悟暴力递归的宏观调度三部曲，不纠缠递归内部细节，建立对子过程语义的强大信任感',
  problemHtml: `
    <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
      <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">题目描述</h3>
      <p>有三根柱子 A、B、C。A 柱上有 <code>N</code> 个大小各不相同的圆盘，大的在下小的在上。每次只能移动一个圆盘，且大盘绝不能压在小盘上方。求将全部圆盘从 A 移到 C 的最少步数及具体操作序列。</p>
      <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0;">
        <strong>定理：</strong>N 个圆盘的最优移动步数严格为 <code>2ᴺ - 1</code>。
      </div>
    </div>
  `,
  inputs: [
    {
      id: 'disks',
      label: '圆盘个数 (N)',
      type: 'number',
      defaultValue: 3,
      min: 1,
      max: 5,
    },
  ],
  codeLanguages: HANOI_029_CODES,
  generateSteps: (inputs) => {
    const n = Math.max(1, Math.min(5, parseInt(String(inputs.disks || 3), 10)));
    return buildHanoi029Steps(n);
  },
  renderCanvas: (container, step) => renderHanoiRecursion029Canvas(container, step),
});
