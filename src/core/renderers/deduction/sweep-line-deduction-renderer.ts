/**
 * 扫描线与矩形面积并 (Sweep Line & Rectangle Area Union · 洛谷 P5490 / Class 115)
 * 全景推演树渲染策略 (SweepLineDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 IDeductionTreeRenderer 统一顶层抽象
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class SweepLineDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'sweep-line';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'sweep-line' ||
      modelId === 'sweep-line-115' ||
      modelId === 'class115-code01' ||
      modelId === 'rectangle-area-union' ||
      modelId === 'p5490'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '洛谷 P5490. 扫描线求矩形面积并 (Sweep Line) · 全景推演树',
      badge: '左程云 Class 115 · 二维面积一维切片积分 / 事件点排序 (入边 +1, 出边 -1) / 线段树维护有效覆盖长度 len',
      descriptionHtml: `
        核心目标：给定平面上 <code>N</code> 个可能发生重叠的矩形，求出它们在平面上覆盖的<strong>总面积（并集面积，重叠区域仅计一次）</strong>。<br/>
        <strong>左程云算法体系教学核心——扫描线降维与线段树覆盖长度动态维护公理：</strong><br/>
        1. <strong>微积分切片思想与几何降维</strong>：<br/>
        设想一条垂直于 X 轴的扫描线自左向右匀速推进：<br/>
        • 每个矩形拆解为两条垂直线段（事件）：<br/>
        &nbsp;&nbsp;• <strong>入边（左边界 $x_1$）</strong>：高度区间 $[y_1, y_2]$，权重标记 <strong>$k = +1$</strong>；<br/>
        &nbsp;&nbsp;• <strong>出边（右边界 $x_2$）</strong>：高度区间 $[y_1, y_2]$，权重标记 <strong>$k = -1$</strong>；<br/>
        • 将所有 $2N$ 条边按 $X$ 坐标从小到大升序排序。<br/>
        2. <strong>面积积分微分方程</strong>：<br/>
        在相邻两个事件点 $x_i$ 与 $x_{i+1}$ 之间：<br/>
        • 扫描线在 Y 方向上被矩形有效覆盖的<strong>总投影长度</strong>恒定为 <code>len</code>；<br/>
        • 这段微元区间贡献的矩形并面积严格为：$$\\Delta \\text{Area} = \\text{len} \\times (x_{i+1} - x_i)$$<br/>
        3. <strong>线段树维护 Y 轴有效长度（不带 lazy tag 的特殊 pushUp）</strong>：<br/>
        Y 轴坐标离散化为基础线段区间；线段树节点维护：<br/>
        • <code>cover[rt]</code>：当前区间被完整覆盖的<strong>嵌套重数</strong>；<br/>
        • <code>len[rt]</code>：当前区间内<strong>实际被覆盖的有效物理长度</strong>；<br/>
        • <strong>更新公理</strong>：若 <code>cover[rt] > 0</code>，则整段被覆盖，<code>len[rt] = y[r+1] - y[l]</code>；若 <code>cover[rt] == 0</code>，则 <code>len[rt] = len[lc] + len[rc]</code>！完全不需要复杂的懒惰标记下发！
      `,
      initialStateText: `扫描线初始化：Y 坐标离散化建树，2N 条竖直线段按 X 递增排序，启动水平积分。`,
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '覆盖重数全覆盖基准 (Cover Count Base)',
        valuesStr: 'cover[rt] > 0 ➔ len[rt] = rawY[r + 1] - rawY[l] (整个 Y 轴区间完全处于矩形内部)',
      },
      {
        prefix: '└───',
        label: '覆盖重数归零拼接 (Zero Cover Merging)',
        valuesStr: 'cover[rt] == 0 ➔ len[rt] = len[rt << 1] + len[rt << 1 | 1] (由子树提供有效覆盖长度)',
      },
    ]);

    const step1 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 1: 矩形边拆解与事件排序 (Event Generation & Sort)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-mono text-[9px]">O(N log N) Sort</span>',
      detailLines: [
        '每个矩形产出 2 个事件：Line(x1, y1, y2, +1) 与 Line(x2, y1, y2, -1)',
        '将所有事件按 x 从小到大排序；对所有 y1, y2 离线去重建立离散化表',
      ],
      fillLine: '时序排列：自左向右扫描，入边激活区间，出边注销区间',
    });

    const step2 = DeductionBoardPrimitives.renderInnerStep({
      connector: '├───',
      label: '阶段 2: 线段树动态更新 Y 轴覆盖长度 (Update Y-Span)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-mono text-[9px]">O(log N) Update</span>',
      detailLines: [
        'modify(ql, qr, k, l, r, rt):',
        '若区间被全包围：cover[rt] += k; pushUp(rt);',
        'pushUp: if (cover[rt] > 0) len[rt] = y[r+1] - y[l]; else len[rt] = len[lc] + len[rc];',
      ],
      fillLine: '成对注销：+1 与 -1 天然对偶抵消，cover 归零时自动退化为子节点长度和',
    });

    const step3 = DeductionBoardPrimitives.renderInnerStep({
      connector: '└───',
      label: '阶段 3: 相邻事件点切片面积累加结算 (Delta Area Sum)',
      badgeHtml: '<span class="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[9px]">O(N) Integrate</span>',
      detailLines: [
        'for (int i = 0; i < 2 * n - 1; i++) {',
        '  modify(lines[i]); // 更新线段树',
        '  totalArea += len[1] * (lines[i + 1].x - lines[i].x); // 底乘高微元累加',
        '}',
      ],
      fillLine: '面积积分：每一段微元矩阵面积即刻被吸纳，最终精确收敛于并集总面积',
    });

    const round = DeductionBoardPrimitives.renderOuterRound({
      title: '扫描线与矩形面积并推演流 (Event Generation ➔ Y-Tree Update ➔ Slice Area Integration)',
      subtitle: 'Luogu P5490 & Zuoshen Class 115 Sweep Line Paradigms',
      stepLinesHtml: step1 + step2 + step3,
    });

    const finalReturn = DeductionBoardPrimitives.renderFinalReturn({
      returnCode: 'return totalArea; // 所有重叠矩形在平面上覆盖的总有效面积',
      answerDescription: '扫描线将原本极其复杂的几何图形剪裁计算，优雅降维至 O(N log N) 的高效离线算法。',
    });

    return DeductionBoardPrimitives.wrapBoard(header + baseCase + round + finalReturn);
  }
}
