/**
 * Class 115: 扫描线求矩形面积并 (Sweep Line) 步骤编译器
 * 洛谷 P5490 【模板】扫描线
 * 深模块核心编译器 (Deep Module)
 */

import { SWEEP_LINE_CODES, SWEEP_LINE_LINES } from '../../../algorithms/categories/tree/tree-108-116/tree-108-116-stage-codes';
import { Tree108Step } from '../../../algorithms/categories/tree/tree-108-116/tree-108-116-shared';

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

export { SWEEP_LINE_CODES, SWEEP_LINE_LINES };

export function buildSweepLineSteps(rectangles: Rectangle[]): SweepLineStep[] {
  const steps: SweepLineStep[] = [];
  const lines = SWEEP_LINE_LINES;

  const currentRects = rectangles.map(r => ({ ...r }));
  const events: SweepEvent[] = [];
  for (const r of currentRects) {
    events.push({ x: r.x1, y1: r.y1, y2: r.y2, type: 1 });
    events.push({ x: r.x2, y1: r.y1, y2: r.y2, type: -1 });
  }
  events.sort((a, b) => a.x - b.x);

  // Step 0: 入口
  steps.push({
    rectangles: currentRects.map(r => ({ ...r })),
    events: events.map(e => ({ ...e })),
    curEventIdx: 0,
    curX: events[0]?.x ?? 0,
    nextX: events[1]?.x ?? 0,
    activeCoverLen: 0,
    stepArea: 0,
    totalArea: 0,
    decision: `主函数入口：接收 ${currentRects.length} 个矩形，生成 ${events.length} 条竖直扫描事件线`,
    message: '准备沿 X 轴从左往右推进竖直扫描线，利用线段树维护 Y 轴有效覆盖长度',
    log: `enter sweepArea(rectangles=${currentRects.length})`,
    codeLine: lines.entry,
    metrics: { '矩形总数': currentRects.length, '事件线数': events.length, '累计面积': 0 },
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
      rectangles: currentRects.map(r => ({ ...r })),
      events: events.map(ev => ({ ...ev })),
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
    rectangles: currentRects.map(r => ({ ...r })),
    events: events.map(ev => ({ ...ev })),
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
