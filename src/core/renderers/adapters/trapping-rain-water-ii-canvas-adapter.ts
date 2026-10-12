import { RainWater3DStep } from './trapping-rain-water-ii-step-compiler';

export function renderRainWaterCanvas(container: HTMLElement, step: RainWater3DStep): void {
  const { grid, waterGrid, curR, curC, curH, totalWater } = step;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%; height: 100%; justify-content: center; padding: 12px 6px; box-sizing: border-box;">
      <!-- 顶部辅助状态栏 -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; padding: 0 4px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 12px; font-weight: 700; color: #0f172a;">🌊 3D 积水等高地形网格:</span>
          <span style="font-size: 11px; color: #64748b;">(外围短板注水算法)</span>
        </div>
        <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 3px 10px; border-radius: 6px;">
          <span style="color: #166534; font-weight: 700;">累计注水量: <strong style="color: #15803d; font-size: 13px;">${totalWater}</strong> 单位</span>
        </div>
      </div>

      <!-- 地形与积水网格主体 (Canvas Dominance 主体) -->
      <div style="
        background: #ffffff;
        border: 1px solid #f1f5f9;
        border-radius: 12px;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        padding: 24px 16px;
        min-height: 200px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        overflow-x: auto;
      ">
        <div style="display: flex; flex-direction: column; gap: 10px; align-items: center;">
          ${grid.map((row, r) => `
            <div style="display: flex; gap: 10px;">
              ${row.map((val, c) => {
                const water = waterGrid[r][c];
                const isActive = r === curR && c === curC;
                const isBoundary = r === 0 || r === grid.length - 1 || c === 0 || c === row.length - 1;

                let bg = '#f8fafc';
                let border = '1.5px solid #e2e8f0';
                let waterColor = '#94a3b8';
                let shadow = 'none';

                if (water > 0) {
                  bg = '#e0f2fe';
                  border = '2px solid #38bdf8';
                  waterColor = '#0284c7';
                  shadow = '0 2px 8px rgba(56, 189, 248, 0.2)';
                } else if (isBoundary) {
                  bg = '#f1f5f9';
                  border = '1.5px dashed #cbd5e1';
                }

                if (isActive) {
                  border = '2px solid #f59e0b';
                  shadow = '0 0 12px rgba(245, 158, 11, 0.35)';
                }

                return `
                  <div style="
                    width: 68px;
                    height: 56px;
                    background: ${bg};
                    border: ${border};
                    border-radius: 10px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    box-shadow: ${shadow};
                    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                    font-family: 'JetBrains Mono', monospace;
                  ">
                    <div style="font-size: 13px; font-weight: 800; color: #1e293b;">
                      H: ${val}
                    </div>
                    <div style="font-size: 11px; font-weight: 700; color: ${waterColor}; margin-top: 1px;">
                      ${water > 0 ? `水:+${water}` : '—'}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 底部图例说明 -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 6px; font-size: 11px; color: #64748b;">
        <div style="display: flex; align-items: center; gap: 14px;">
          <span style="display: inline-flex; align-items: center; gap: 4px;">
            <span style="width: 10px; height: 10px; border-radius: 2px; background: #e0f2fe; border: 1.5px solid #38bdf8;"></span>
            成功蓄水区域
          </span>
          <span style="display: inline-flex; align-items: center; gap: 4px;">
            <span style="width: 10px; height: 10px; border-radius: 2px; background: #ffffff; border: 2px solid #f59e0b;"></span>
            当前扩散探测点
          </span>
          <span style="display: inline-flex; align-items: center; gap: 4px;">
            <span style="width: 10px; height: 10px; border-radius: 2px; background: #f1f5f9; border: 1.5px dashed #cbd5e1;"></span>
            外围边界木桶
          </span>
        </div>
        <span style="font-size: 11px; color: #94a3b8;">
          短板基准: <strong style="color: #0284c7; font-family: monospace;">${curH > 0 ? curH : '—'}</strong>
        </span>
      </div>
    </div>
  `;
}
