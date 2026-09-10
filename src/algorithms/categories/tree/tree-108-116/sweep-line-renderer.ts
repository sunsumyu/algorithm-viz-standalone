/**
 * Class 115: 扫描线求矩形面积并 (Sweep Line)
 * 洛谷 P5490 【模板】扫描线
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { TREE_108_116_PROBLEMS } from './tree-108-116-problem-content';
import { SWEEP_LINE_CODES, SWEEP_LINE_LINES } from './tree-108-116-stage-codes';
import { Tree108Step } from './tree-108-116-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface SweepEvent {
  x: number;
  y1: number;
  y2: number;
  type: 1 | -1; // 1: 矩形左入边, -1: 矩形右出边
}

export interface Rectangle {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export interface SweepLineStep extends Tree108Step {
  rectangles: Rectangle[];
  events: SweepEvent[];
  curEventIdx: number;
  curX: number;
  nextX: number;
  activeCoverLen: number;
  stepArea: number;
  totalArea: number;
}

export function buildSweepLineSteps(rectangles: Rectangle[]): SweepLineStep[] {
  const steps: SweepLineStep[] = [];
  const lines = SWEEP_LINE_LINES;

  const events: SweepEvent[] = [];
  for (const r of rectangles) {
    events.push({ x: r.x1, y1: r.y1, y2: r.y2, type: 1 });
    events.push({ x: r.x2, y1: r.y1, y2: r.y2, type: -1 });
  }
  events.sort((a, b) => a.x - b.x);

  // Step 0: 入口
  steps.push({
    rectangles: [...rectangles],
    events: [...events],
    curEventIdx: 0,
    curX: events[0]?.x ?? 0,
    nextX: events[1]?.x ?? 0,
    activeCoverLen: 0,
    stepArea: 0,
    totalArea: 0,
    decision: `主函数入口：接收 ${rectangles.length} 个矩形，生成 ${events.length} 条竖直扫描事件线`,
    message: '准备沿 X 轴从左往右推进竖直扫描线，利用线段树维护 Y 轴有效覆盖长度',
    log: `enter sweepArea(rectangles=${rectangles.length})`,
    codeLine: lines.entry,
    metrics: { '矩形总数': rectangles.length, '事件线数': events.length, '累计面积': 0 },
  });

  // 离散化 Y 轴
  const yVals = Array.from(new Set(events.flatMap(e => [e.y1, e.y2]))).sort((a, b) => a - b);

  // 简化的 Y 轴区间覆盖统计
  const coverCount = new Array(yVals.length).fill(0);

  function getActiveYLen(): number {
    let len = 0;
    for (let i = 0; i < yVals.length - 1; i++) {
      if (coverCount[i] > 0) {
        len += yVals[i + 1] - yVals[i];
      }
    }
    return len;
  }

  function applyY(y1: number, y2: number, type: number) {
    for (let i = 0; i < yVals.length - 1; i++) {
      if (yVals[i] >= y1 && yVals[i + 1] <= y2) {
        coverCount[i] += type;
      }
    }
  }

  let totalArea = 0;

  for (let i = 0; i < events.length - 1; i++) {
    const e = events[i];
    const nextE = events[i + 1];

    applyY(e.y1, e.y2, e.type);
    const coverLen = getActiveYLen();
    const dx = nextE.x - e.x;
    const stepArea = coverLen * dx;
    totalArea += stepArea;

    steps.push({
      rectangles: [...rectangles],
      events: [...events],
      curEventIdx: i,
      curX: e.x,
      nextX: nextE.x,
      activeCoverLen: coverLen,
      stepArea,
      totalArea,
      decision: `📐 扫描线推进：从 x=${e.x} 推进至 x=${nextE.x} (Δx = ${dx})。当前纵向有效覆盖高 H=${coverLen}，本切片面积 = ${coverLen} × ${dx} = ${stepArea}`,
      message: `事件类型: ${e.type === 1 ? '入边(+1)' : '出边(-1)'} [y: ${e.y1}..${e.y2}]，累计总覆盖面积增至 ${totalArea}`,
      log: `sweep x from ${e.x} to ${nextE.x}, H=${coverLen}, area += ${stepArea}, total=${totalArea}`,
      codeLine: lines.calcDelta,
      metrics: { '当前 X': e.x, '纵向高度 H': coverLen, '本步面积': stepArea, '累计面积': totalArea },
      statusBadge: { text: `+${stepArea} 面积`, type: 'info' },
    });
  }

  // Step End: 终局
  steps.push({
    rectangles: [...rectangles],
    events: [...events],
    curEventIdx: events.length - 1,
    curX: events[events.length - 1]?.x ?? 0,
    nextX: events[events.length - 1]?.x ?? 0,
    activeCoverLen: 0,
    stepArea: 0,
    totalArea,
    decision: `🏆 扫描线全部扫描完成：所有矩形重叠融合后的并集总面积为 ${totalArea}！返回 ${totalArea}`,
    message: '全流程在 O(N log N) 时间内完成',
    log: `return totalArea=${totalArea}`,
    codeLine: lines.returnAns,
    metrics: { '最终并集总面积': totalArea },
    statusBadge: { text: `总面积: ${totalArea}`, type: 'success' },
  });

  return steps;
}

export const sweepLineVisualizer = registerDeclarativeAlgorithm<SweepLineStep>({
  id: 'sweep-line-115',
  name: '扫描线与矩形面积并 (Class 115)',
  category: 'tree',
  icon: '📐',
  difficulty: 3,
  levelOrder: 115,
  learningGoal: '掌握经典几何扫描线 (Sweep Line) 思想，将二维面积积分转化为一维切片线段树覆盖长度的动态维护',
  problemHtml: TREE_108_116_PROBLEMS.sweepLine.html,
  analysisHtml: TREE_108_116_PROBLEMS.sweepLine.html,
  inputs: [
    {
      id: 'rects',
      label: '矩形集合 (x1,y1,x2,y2 竖线分隔)',
      type: 'text',
      defaultValue: '10,10,30,40 | 20,20,50,50 | 40,10,60,30',
      placeholder: '格式如 10,10,30,40 | 20,20,50,50',
    },
  ],
  codeLanguages: SWEEP_LINE_CODES,
  generateSteps: (input) => {
    const raw = String(input.rects || '10,10,30,40 | 20,20,50,50 | 40,10,60,30');
    const rects: Rectangle[] = raw.split('|').map(s => {
      const [x1, y1, x2, y2] = s.split(',').map(Number);
      return { x1: x1 || 0, y1: y1 || 0, x2: x2 || 10, y2: y2 || 10 };
    });
    return buildSweepLineSteps(rects);
  },
  renderCanvas: (container, step) => {
    const scale = 5;
    const offsetX = 5;
    const offsetY = 5;

    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        <div style="font-size: 13px; font-weight: 700; color: #334155; margin-bottom: 8px;">
          🗺️ 二维平面矩形投影与扫描线位置 (当前 X = ${step.curX})
        </div>
        <div style="position: relative; width: 100%; height: 320px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; overflow: hidden;">
          <!-- 矩形集合 -->
          ${step.rectangles.map((r, idx) => `
            <div style="position: absolute; left: ${(r.x1 - offsetX) * scale}px; top: ${(r.y1 - offsetY) * scale}px; width: ${(r.x2 - r.x1) * scale}px; height: ${(r.y2 - r.y1) * scale}px; background: rgba(99, 102, 241, 0.15); border: 2px solid #6366f1; border-radius: 4px;">
              <span style="font-size: 10px; color: #4338ca; padding: 2px 4px; font-weight: 700;">R${idx + 1}</span>
            </div>
          `).join('')}

          <!-- 扫描线游标 -->
          ${step.curX > 0 ? `
            <div style="position: absolute; left: ${(step.curX - offsetX) * scale}px; top: 0; bottom: 0; width: 3px; background: #ef4444; box-shadow: 0 0 12px rgba(239, 68, 68, 0.8); z-index: 10;">
              <div style="position: absolute; top: 6px; left: 6px; background: #fee2e2; color: #b91c1c; border: 1px solid #ef4444; border-radius: 4px; font-size: 10px; font-weight: 700; padding: 2px 6px; white-space: nowrap;">
                X = ${step.curX}
              </div>
            </div>
          ` : ''}
        </div>

        ${renderFormulaCard(
          '扫描线切片积分计算',
          `切片范围: [${step.curX} .. ${step.nextX}] (Δx = ${step.nextX - step.curX}) | 纵向覆盖高 H = ${step.activeCoverLen} | 本步增量面积: ${step.stepArea} | 累计并集总面积: ${step.totalArea}`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
