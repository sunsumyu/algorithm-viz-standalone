/**
 * Class 052: 单调栈（上）通用沙盘呈现器与共享组件
 *
 * 遵循 Card 1 纯净沙盘契约：
 * 1. 严禁在 Card 1 输出 h1~h6 标题；
 * 2. 严禁上下卡片镜像重复；
 * 3. 严禁药丸面板截断；
 * 4. 100% 响应式自适应布局。
 */

export interface SettledItem {
  idx: number;
  val: number;
  left: number | string;
  right: number | string;
  detail?: string;
}

export interface MonotonicStackSharedOptions {
  type: 'less' | 'greater' | 'histogram' | 'temperatures' | 'minimums';
  titleBadge?: string;
  ruleText?: string;
}

/**
 * 渲染通用单调栈沙盘：
 * 包含：
 * 1. 序列卡片水平流（标注下标、数值、当前游标、栈内标记）
 * 2. 单调栈物理槽位（底到顶清晰分层，支持重复值列表）
 * 3. 实时结算结果看板
 */
export function renderMonotonicStackBoard(
  arr: number[],
  stack: (number | number[])[],
  settled: SettledItem[],
  curI: number,
  popped: number | number[] | null = null,
  options: MonotonicStackSharedOptions = { type: 'less' }
): string {
  const n = arr.length;
  const isDone = curI >= n;

  // 展平栈内所有下标以便序列高亮
  const stackFlatIndices = new Set<number>();
  stack.forEach((item) => {
    if (Array.isArray(item)) {
      item.forEach((idx) => stackFlatIndices.add(idx));
    } else {
      stackFlatIndices.add(item);
    }
  });

  const poppedSet = new Set<number>();
  if (popped !== null) {
    if (Array.isArray(popped)) {
      popped.forEach((idx) => poppedSet.add(idx));
    } else {
      poppedSet.add(popped);
    }
  }

  // 1. 上方：序列卡片水平流
  const cardsHtml = arr
    .map((val, idx) => {
      const isCurrent = idx === curI && !isDone;
      const inStack = stackFlatIndices.has(idx);
      const isPopped = poppedSet.has(idx);
      const isSettled = settled.some((s) => s.idx === idx);

      let bg = '#f8fafc';
      let border = '#cbd5e1';
      let text = '#334155';
      let statusBadge = '';

      if (isCurrent) {
        bg = '#ffedd5';
        border = '#f97316';
        text = '#c2410c';
        statusBadge = '<span style="font-size: 9px; color: #ea580c; font-weight: 700;">📍当前</span>';
      } else if (isPopped) {
        bg = '#dcfce7';
        border = '#22c55e';
        text = '#15803d';
        statusBadge = '<span style="font-size: 9px; color: #16a34a; font-weight: 700;">🔥弹出</span>';
      } else if (inStack) {
        bg = '#fef3c7';
        border = '#f59e0b';
        text = '#b45309';
        statusBadge = '<span style="font-size: 9px; color: #d97706; font-weight: 700;">🥞在栈</span>';
      } else if (isSettled) {
        bg = '#f1f5f9';
        border = '#94a3b8';
        text = '#64748b';
        statusBadge = '<span style="font-size: 9px; color: #059669; font-weight: 700;">✓结算</span>';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 3px; min-width: 44px; flex: 1; max-width: 68px;">
          ${statusBadge || '<div style="height: 14px;"></div>'}
          <div style="width: 100%; height: 50px; background: ${bg}; border: 2px solid ${border}; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: all 0.2s;">
            <span style="font-size: 16px; font-weight: 800; color: ${text}; font-family: 'JetBrains Mono', monospace;">${val}</span>
          </div>
          <span style="font-size: 10px; font-weight: 700; color: ${isCurrent ? '#ea580c' : '#94a3b8'}; font-family: monospace;">
            [${idx}]
          </span>
        </div>
      `;
    })
    .join('');

  // 2. 中间：单调栈物理槽位
  const stackItemsHtml = stack
    .map((item, depth) => {
      if (Array.isArray(item)) {
        // 重复值列表
        const indicesText = item.map((i) => `[${i}]`).join(' ');
        const val = arr[item[0]];
        return `
          <div style="display: flex; align-items: center; gap: 6px; padding: 4px 10px; background: #fffbeb; border: 1.5px solid #fde68a; border-radius: 6px; font-family: monospace; font-size: 11px;">
            <span style="color: #92400e; font-weight: 800;">层 ${depth}:</span>
            <span style="color: #b45309; font-weight: 700;">${indicesText}</span>
            <span style="background: #f59e0b; color: #fff; padding: 1px 5px; border-radius: 4px; font-weight: 800;">值: ${val}</span>
          </div>
        `;
      } else {
        const val = arr[item];
        const isTop = depth === stack.length - 1;
        return `
          <div style="display: flex; align-items: center; gap: 6px; padding: 4px 10px; background: ${isTop ? '#fef3c7' : '#f8fafc'}; border: 1.5px solid ${isTop ? '#f59e0b' : '#e2e8f0'}; border-radius: 6px; font-family: monospace; font-size: 11px;">
            <span style="color: ${isTop ? '#b45309' : '#64748b'}; font-weight: 800;">${isTop ? '🔝顶' : `层${depth}`}:</span>
            <span style="color: #0f172a; font-weight: 700;">[${item}]</span>
            <span style="background: ${isTop ? '#f59e0b' : '#94a3b8'}; color: #fff; padding: 1px 5px; border-radius: 4px; font-weight: 800;">值: ${val}</span>
          </div>
        `;
      }
    })
    .join('');

  const stackEmptyHtml = `
    <div style="padding: 12px; color: #94a3b8; font-size: 11px; font-style: italic; text-align: center;">
      （栈为空，随时接受新元素入栈）
    </div>
  `;

  // 3. 下方：结算明细表格
  const settledRowsHtml = settled
    .map((s) => {
      const leftDisplay = s.left === -1 ? '<span style="color:#94a3b8;">无 (-1)</span>' : `<span style="color:#0284c7;font-weight:700;">[${s.left}] (值:${arr[Number(s.left)]})</span>`;
      const rightDisplay = s.right === -1 ? '<span style="color:#94a3b8;">无 (-1)</span>' : `<span style="color:#059669;font-weight:700;">[${s.right}] (值:${arr[Number(s.right)]})</span>`;
      return `
        <tr style="border-bottom: 1px solid #f1f5f9; font-size: 11px; font-family: monospace;">
          <td style="padding: 4px 8px; font-weight: 800; color: #334155;">[${s.idx}]</td>
          <td style="padding: 4px 8px; font-weight: 800; color: #ea580c;">${s.val}</td>
          <td style="padding: 4px 8px;">${leftDisplay}</td>
          <td style="padding: 4px 8px;">${rightDisplay}</td>
          ${s.detail ? `<td style="padding: 4px 8px; color: #64748b;">${s.detail}</td>` : ''}
        </tr>
      `;
    })
    .join('');

  const ruleBadge = options.ruleText
    ? `<span style="font-size: 10px; background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 12px; font-weight: 700;">${options.ruleText}</span>`
    : `<span style="font-size: 10px; background: #fef3c7; color: #b45309; padding: 2px 8px; border-radius: 12px; font-weight: 700;">🔺 底到顶单调递增栈（遇破坏者出栈结算）</span>`;

  return `
    <div style="width: 100%; display: flex; flex-direction: column; gap: 14px; padding: 12px; box-sizing: border-box;">
      <!-- 序列视图 -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-size: 11px; font-weight: 800; color: #475569;">📊 原始输入序列状态</span>
          ${ruleBadge}
        </div>
        <div style="display: flex; gap: 6px; overflow-x: auto; padding: 6px 0; justify-content: ${n <= 8 ? 'space-around' : 'flex-start'}; align-items: center;">
          ${cardsHtml}
        </div>
      </div>

      <!-- 下半部分：单调栈物理槽位 + 结算看板 -->
      <div style="display: grid; grid-template-columns: minmax(260px, 1fr) minmax(320px, 1.4fr); gap: 12px;">
        <!-- 单调栈槽位 -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 800; color: #475569;">🥞 物理单调栈槽位</span>
            <span style="font-size: 10px; color: #64748b;">深度: <strong>${stack.length}</strong></span>
          </div>
          <div style="display: flex; flex-direction: column-reverse; gap: 6px; min-height: 110px; justify-content: flex-start; background: #f8fafc; border-radius: 8px; padding: 8px; border: 1.5px dashed #cbd5e1;">
            ${stack.length > 0 ? stackItemsHtml : stackEmptyHtml}
          </div>
          <div style="display: flex; justify-content: space-between; margin-top: 6px; font-size: 9px; color: #94a3b8; font-weight: 700;">
            <span>⬇️ 栈底 (最老未破)</span>
            <span>⬆️ 栈顶 (最新活跃)</span>
          </div>
        </div>

        <!-- 结算看板 -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; display: flex; flex-direction: column;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
            <span style="font-size: 11px; font-weight: 800; color: #475569;">📋 元素结算记录表</span>
            <span style="font-size: 10px; color: #059669; font-weight: 700;">已结算: ${settled.length} / ${n}</span>
          </div>
          <div style="max-height: 140px; overflow-y: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left;">
              <thead>
                <tr style="border-bottom: 1.5px solid #e2e8f0; font-size: 10px; color: #64748b;">
                  <th style="padding: 4px 8px;">下标</th>
                  <th style="padding: 4px 8px;">数值</th>
                  <th style="padding: 4px 8px;">左侧更近</th>
                  <th style="padding: 4px 8px;">右侧更近</th>
                  ${settled.some((s) => s.detail) ? '<th style="padding: 4px 8px;">计算备注</th>' : ''}
                </tr>
              </thead>
              <tbody>
                ${settledRowsHtml || '<tr><td colspan="5" style="text-align:center;padding:16px;color:#94a3b8;font-size:11px;">尚无元素出栈结算</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 渲染柱状图最大矩形沙盘 (针对 Code05 LC 84 与 Code06 LC 85)
 */
export function renderHistogramVisualizer(
  heights: number[],
  stack: number[],
  curI: number,
  activeRect: { left: number; right: number; height: number; area: number } | null,
  maxArea: number,
  padded: boolean = false
): string {
  const n = heights.length;
  const maxH = Math.max(...heights, 8);

  const barsHtml = heights
    .map((h, idx) => {
      const isCurrent = idx === curI;
      const inStack = stack.includes(idx);
      const isRectBar = activeRect && idx >= activeRect.left && idx <= activeRect.right;
      const heightPercent = Math.max(8, Math.min(100, Math.round((h / maxH) * 85)));

      let barBg = '#94a3b8';
      let border = 'transparent';
      let textColor = '#64748b';

      if (isRectBar) {
        barBg = '#10b981';
        border = '#059669';
        textColor = '#059669';
      } else if (isCurrent) {
        barBg = '#f97316';
        border = '#c2410c';
        textColor = '#ea580c';
      } else if (inStack) {
        barBg = '#f59e0b';
        border = '#d97706';
        textColor = '#b45309';
      }

      return `
        <div style="display: flex; flex-direction: column; align-items: center; gap: 2px; flex: 1; min-width: 24px; max-width: 52px;">
          <span style="font-size: 10px; font-weight: 800; color: ${textColor}; font-family: monospace;">${h}</span>
          <div style="width: 100%; height: 110px; display: flex; align-items: flex-end; justify-content: center; position: relative;">
            <div style="width: 80%; height: ${heightPercent}%; background: ${barBg}; border-radius: 4px 4px 0 0; border: 1.5px solid ${border}; transition: all 0.2s; display: flex; align-items: center; justify-content: center; color: #ffffff; font-size: 9px; font-weight: 800;">
              ${h > 0 ? h : ''}
            </div>
          </div>
          <span style="font-size: 9px; color: ${isCurrent ? '#ea580c' : '#94a3b8'}; font-weight: 700; font-family: monospace;">
            [${idx}]
          </span>
        </div>
      `;
    })
    .join('');

  const stackHtml = stack
    .map((idx) => {
      const h = heights[idx];
      return `
        <div style="padding: 2px 8px; border-radius: 6px; background: #fffbeb; border: 1.5px solid #fde68a; color: #b45309; font-size: 11px; font-weight: 800; font-family: monospace; display: flex; align-items: center; gap: 4px;">
          <span>[${idx}]</span>
          <span style="color: #ea580c;">H=${h}</span>
        </div>
      `;
    })
    .join('');

  const rectBadge = activeRect
    ? `
      <div style="display: flex; align-items: center; gap: 8px; background: #ecfdf5; border: 1.5px solid #a7f3d0; padding: 4px 12px; border-radius: 8px; font-family: monospace; font-size: 11px;">
        <span style="color: #059669; font-weight: 800;">🎯 考察矩形:</span>
        <span style="color: #047857;">区间 [${activeRect.left} ~ ${activeRect.right}]</span>
        <span style="color: #065f46; font-weight: 700;">宽 W=${activeRect.right - activeRect.left + 1}, 高 H=${activeRect.height}</span>
        <span style="background: #10b981; color: #ffffff; padding: 1px 6px; border-radius: 4px; font-weight: 800;">面积 = ${activeRect.area}</span>
      </div>
    `
    : `
      <div style="color: #94a3b8; font-size: 11px; font-family: monospace;">
        正在推演柱体与单调栈...
      </div>
    `;

  return `
    <div style="width: 100%; display: flex; flex-direction: column; gap: 12px; padding: 12px; box-sizing: border-box;">
      <!-- 柱状图主画布 -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 11px; font-weight: 800; color: #475569;">📊 柱体高度直方图</span>
            ${padded ? '<span style="font-size: 9px; background: #f1f5f9; color: #64748b; padding: 1px 6px; border-radius: 4px;">含首尾哨兵 0</span>' : ''}
          </div>
          <div style="font-size: 11px; font-family: monospace; background: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 10px; border-radius: 6px;">
            <span style="color: #64748b;">历史全局最大面积: </span>
            <strong style="color: #ea580c; font-size: 13px;">${maxArea}</strong>
          </div>
        </div>

        <div style="display: flex; justify-content: space-around; align-items: flex-end; padding: 10px 0; border-bottom: 1.5px solid #e2e8f0;">
          ${barsHtml}
        </div>

        <div style="margin-top: 10px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          ${rectBadge}
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 10.5px; font-weight: 700; color: #475569;">🥞 栈内柱子:</span>
            <div style="display: flex; gap: 4px; overflow-x: auto; align-items: center;">
              ${stack.length > 0 ? stackHtml : '<span style="font-size: 10px; color: #94a3b8;">空栈</span>'}
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * 渲染二维 0/1 矩阵压缩为高度柱状图沙盘 (针对 Code06 LC 85 最大矩形)
 */
export function renderMatrixToHistogramBoard(
  matrix: number[][],
  curRow: number,
  heights: number[],
  stack: number[],
  activeRect: { left: number; right: number; height: number; area: number } | null,
  maxArea: number
): string {
  const m = matrix.length;
  const n = matrix[0]?.length ?? 0;

  // 1. 上方二维 0/1 矩阵网格
  const matrixRowsHtml = matrix
    .map((row, r) => {
      const isCurrentRow = r === curRow;
      const cellsHtml = row
        .map((cell) => {
          let bg = '#ffffff';
          let color = '#94a3b8';
          let border = '#e2e8f0';

          if (cell === 1) {
            bg = isCurrentRow ? '#dbeafe' : '#f8fafc';
            color = isCurrentRow ? '#1d4ed8' : '#334155';
            border = isCurrentRow ? '#93c5fd' : '#cbd5e1';
          }

          return `
            <div style="width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; background: ${bg}; border: 1px solid ${border}; border-radius: 4px; font-size: 11px; font-weight: 800; font-family: monospace; color: ${color};">
              ${cell}
            </div>
          `;
        })
        .join('');

      return `
        <div style="display: flex; align-items: center; gap: 4px; padding: 2px 4px; background: ${isCurrentRow ? '#eff6ff' : 'transparent'}; border-radius: 6px; border: 1px solid ${isCurrentRow ? '#bfdbfe' : 'transparent'};">
          <span style="font-size: 10px; font-weight: 700; color: ${isCurrentRow ? '#1d4ed8' : '#94a3b8'}; width: 44px; font-family: monospace;">行 ${r}:</span>
          <div style="display: flex; gap: 4px;">
            ${cellsHtml}
          </div>
          ${isCurrentRow ? '<span style="font-size: 9px; color: #2563eb; font-weight: 700; margin-left: 6px;">⬅️ 当前压缩基准底行</span>' : ''}
        </div>
      `;
    })
    .join('');

  // 2. 下方调用柱状图直方图渲染
  const histogramHtml = renderHistogramVisualizer(
    heights,
    stack,
    -1,
    activeRect,
    maxArea,
    false
  );

  return `
    <div style="width: 100%; display: flex; flex-direction: column; gap: 10px; padding: 10px; box-sizing: border-box;">
      <!-- 二维矩阵压缩看板 -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <span style="font-size: 11px; font-weight: 800; color: #475569;">🔲 二维 0/1 矩阵逐行压缩为一维连续 1 高度柱状图</span>
          <span style="font-size: 10px; color: #2563eb; font-weight: 700; background: #dbeafe; padding: 1px 8px; border-radius: 10px;">当前行: ${curRow} / ${m - 1}</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 2px;">
          ${matrixRowsHtml}
        </div>
      </div>

      <!-- 动态高度直方图与矩形求解 -->
      ${histogramHtml}
    </div>
  `;
}
