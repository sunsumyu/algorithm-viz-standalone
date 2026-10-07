import { MaxPointsStep } from './max-points-on-a-line-step-compiler';

export function renderMaxPointsCanvas(step: MaxPointsStep): string {
  const { points, baseIdx, compareIdx, slope, slopeCount, globalMax, phase } = step;

  // 坐标系范围
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs, 0);
  const maxX = Math.max(...xs, 5);
  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, 5);

  const padding = 30;
  const svgWidth = 340;
  const svgHeight = 200;

  const scaleX = (x: number) => padding + ((x - minX) / Math.max(maxX - minX, 1)) * (svgWidth - 2 * padding);
  const scaleY = (y: number) => svgHeight - padding - ((y - minY) / Math.max(maxY - minY, 1)) * (svgHeight - 2 * padding);

  const basePt = points[baseIdx];
  const compPt = points[compareIdx];

  // 画点
  const pointSvgs = points
    .map((p, idx) => {
      const isBase = idx === baseIdx && phase !== 'finish';
      const isComp = idx === compareIdx && phase !== 'finish' && baseIdx !== compareIdx;

      let fill = '#64748b';
      let r = 5;
      let stroke = 'rgba(255,255,255,0.4)';

      if (isBase) {
        fill = '#ec4899';
        r = 8;
        stroke = '#f43f5e';
      } else if (isComp) {
        fill = '#38bdf8';
        r = 7;
        stroke = '#0ea5e9';
      }

      const cx = scaleX(p.x);
      const cy = scaleY(p.y);

      return `
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2" />
        <text x="${cx + 8}" y="${cy - 6}" fill="#94a3b8" font-size="11" font-weight="600">P${idx}(${p.x},${p.y})</text>
      `;
    })
    .join('');

  // 如果处于比较阶段，画出连接线
  let connectionLine = '';
  if (basePt && compPt && baseIdx !== compareIdx && phase !== 'finish') {
    const bx = scaleX(basePt.x);
    const by = scaleY(basePt.y);
    const cx = scaleX(compPt.x);
    const cy = scaleY(compPt.y);
    connectionLine = `<line x1="${bx}" y1="${by}" x2="${cx}" y2="${cy}" stroke="#fbbf24" stroke-width="2" stroke-dasharray="4" />`;
  }

  // 渲染哈希表斜率统计
  const slopeRows = Object.entries(slopeCount)
    .map(([sl, cnt]) => {
      return `
      <div style="display: flex; justify-content: space-between; padding: 4px 8px; background: rgba(255,255,255,0.04); border-radius: 4px; font-size: 11px;">
        <span style="color: #38bdf8; font-weight: 600;">斜率 [${sl}]</span>
        <span style="color: #fbbf24;">+${cnt} 点 (共线 ${cnt + 1} 点)</span>
      </div>`;
    })
    .join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
      <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px;">
        <!-- 左侧 SVG 几何坐标系 -->
        <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 10px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; margin-bottom: 6px;">
            <span>几何散点平面</span>
            <span style="color: #ec4899;">● 基准点 P${baseIdx}</span>
            <span style="color: #38bdf8;">● 探测点 P${compareIdx}</span>
          </div>
          <svg width="100%" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" style="background: rgba(0,0,0,0.25); border-radius: 6px;">
            <!-- 网格线 -->
            <line x1="${padding}" y1="${svgHeight - padding}" x2="${svgWidth - padding}" y2="${svgHeight - padding}" stroke="#334155" stroke-width="1" />
            <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${svgHeight - padding}" stroke="#334155" stroke-width="1" />
            ${connectionLine}
            ${pointSvgs}
          </svg>
        </div>

        <!-- 右侧 斜率哈希聚合桶 -->
        <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 10px; display: flex; flex-direction: column;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600; margin-bottom: 8px;">
            基准点 P${baseIdx} 的斜率哈希桶 (dy/dx)
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px; flex: 1; overflow-y: auto; max-height: 170px;">
            ${slopeRows || '<div style="color: #64748b; font-size: 11px; padding: 8px;">暂无探测斜率</div>'}
          </div>
        </div>
      </div>

      <!-- 底部指标看板 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前基准点</div>
          <div style="font-size: 15px; font-weight: 700; color: #ec4899;">P${baseIdx} (${basePt?.x ?? 0}, ${basePt?.y ?? 0})</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">探测目标点</div>
          <div style="font-size: 15px; font-weight: 700; color: #38bdf8;">P${compareIdx} (${compPt?.x ?? 0}, ${compPt?.y ?? 0})</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">最简分数斜率</div>
          <div style="font-size: 15px; font-weight: 700; color: #fbbf24;">${slope}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">全局最多共线点数</div>
          <div style="font-size: 18px; font-weight: 700; color: #34d399;">${globalMax}</div>
        </div>
      </div>
    </div>
  `;
}
