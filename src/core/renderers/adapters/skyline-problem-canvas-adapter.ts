import { SkylineStep } from './skyline-problem-step-compiler';

export function renderSkylineCanvas(container: HTMLElement, step: SkylineStep): void {
  const { buildings, currentX, curMax, skylinePoints, maxHeap } = step;

  // 关键拐点标签芯片
  const pointsChipsHtml = skylinePoints.length === 0
    ? '<span style="font-size: 11px; color: #94a3b8;">暂未产生拐点</span>'
    : skylinePoints.map(([x, h]) => `
      <div style="display: inline-flex; align-items: center; gap: 4px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 2px 8px; font-size: 11px; font-family: 'JetBrains Mono', monospace; font-weight: 700; color: #065f46;">
        <span>[${x}, ${h}]</span>
      </div>
    `).join('');

  // 堆内元素芯片
  const heapChipsHtml = maxHeap.slice(0, 6).map((h, i) => `
    <span style="display: inline-flex; align-items: center; padding: 1px 6px; border-radius: 4px; font-size: 11px; font-family: monospace; ${i === 0 ? 'background: #fef3c7; color: #b45309; font-weight: 800; border: 1px solid #fde68a;' : 'background: #f1f5f9; color: #64748b;'}">
      ${h}
    </span>
  `).join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%; height: 100%; justify-content: center; padding: 12px 6px; box-sizing: border-box;">
      <!-- 顶部辅助状态概览 -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; padding: 0 4px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 12px; font-weight: 700; color: #0f172a;">📍 已捕获天际线拐点:</span>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${pointsChipsHtml}
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 3px 8px; border-radius: 6px;">
          <span style="color: #64748b;">最大堆高度池:</span>
          <div style="display: flex; gap: 4px;">
            ${heapChipsHtml}
          </div>
        </div>
      </div>

      <!-- 城市天际线几何沙盘 (Canvas Dominance 主体) -->
      <div style="
        background: #ffffff;
        border: 1px solid #f1f5f9;
        border-radius: 12px;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        padding: 24px 16px 12px;
        min-height: 200px;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        position: relative;
        overflow-x: auto;
      ">
        <div style="
          display: flex;
          gap: 8px;
          justify-content: center;
          align-items: flex-end;
          min-width: 500px;
          height: 150px;
          border-bottom: 2px solid #cbd5e1;
          padding-bottom: 2px;
          position: relative;
        ">
          ${buildings.map(([l, r, h], idx) => {
            const inScan = currentX >= l && currentX <= r;
            const widthPx = Math.max(36, (r - l) * 16);
            const heightPx = Math.min(130, h * 7);

            let bg = '#f1f5f9';
            let border = '1.5px solid #cbd5e1';
            let textColor = '#64748b';
            let shadow = 'none';

            if (inScan) {
              bg = '#e0f2fe';
              border = '2px solid #38bdf8';
              textColor = '#0369a1';
              shadow = '0 4px 12px rgba(56, 189, 248, 0.2)';
            }

            return `
              <div style="
                width: ${widthPx}px;
                height: ${heightPx}px;
                background: ${bg};
                border: ${border};
                border-bottom: none;
                border-radius: 6px 6px 0 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-size: 11px;
                font-family: 'JetBrains Mono', monospace;
                color: ${textColor};
                box-shadow: ${shadow};
                transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                flex-shrink: 0;
              ">
                <div style="font-weight: 800;">B${idx + 1}</div>
                <div style="font-size: 10px; color: ${inScan ? '#0284c7' : '#94a3b8'};">H:${h}</div>
                <div style="font-size: 9px; color: #94a3b8; margin-top: 2px;">[${l}..${r}]</div>
              </div>
            `;
          }).join('')}
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 6px; font-size: 10px; font-family: monospace; color: #94a3b8;">
          <span>地平线基准 (Height = 0)</span>
          <span>当前扫描线坐标: <strong style="color: #2563eb;">X = ${currentX}</strong></span>
        </div>
      </div>

      <!-- 底部图例说明 -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 6px; font-size: 11px; color: #64748b;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <span style="display: inline-flex; align-items: center; gap: 4px;">
            <span style="width: 10px; height: 10px; border-radius: 2px; background: #e0f2fe; border: 1.5px solid #38bdf8;"></span>
            处于扫描线跨度内的建筑
          </span>
          <span style="display: inline-flex; align-items: center; gap: 4px;">
            <span style="width: 10px; height: 10px; border-radius: 2px; background: #ecfdf5; border: 1.5px solid #10b981;"></span>
            天际线关键转折点 (拐点)
          </span>
        </div>
        <span style="font-size: 11px; color: #94a3b8;">
          当前最高高度: <strong style="color: #f59e0b; font-family: monospace;">${curMax}</strong>
        </span>
      </div>
    </div>
  `;
}
