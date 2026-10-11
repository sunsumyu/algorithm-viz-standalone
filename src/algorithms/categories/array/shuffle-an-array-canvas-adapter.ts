/**
 * 打乱数组 — 画布适配器
 * 负责洗牌序列视觉卡片、随机抽样状态指示与数学均匀性提示
 */

import { ShuffleArrayStep } from './shuffle-an-array-step-compiler';

export function renderShuffleCanvas(container: HTMLElement, step: ShuffleArrayStep): void {
  const { original, current, currentIndex, randomIndex, shuffledIndices } = step;

  const itemsHtml = current.map((val, idx) => {
    const isCurrent = idx === currentIndex;
    const isRandom = idx === randomIndex;
    const isShuffled = shuffledIndices.includes(idx);

    let bg = 'rgba(30, 41, 59, 0.6)';
    let border = '1px solid rgba(255, 255, 255, 0.1)';
    let color = '#f8fafc';
    let label = `idx: ${idx}`;
    let shadow = 'none';

    if (isCurrent && isRandom) {
      bg = 'rgba(234, 179, 8, 0.25)';
      border = '2px solid #eab308';
      color = '#fde047';
      label = `i=j: ${idx}`;
      shadow = '0 0 16px rgba(234, 179, 8, 0.4)';
    } else if (isCurrent) {
      bg = 'rgba(56, 189, 248, 0.25)';
      border = '2px solid #38bdf8';
      color = '#38bdf8';
      label = `游标 i: ${idx}`;
      shadow = '0 0 16px rgba(56, 189, 248, 0.4)';
    } else if (isRandom) {
      bg = 'rgba(244, 114, 182, 0.25)';
      border = '2px dashed #f472b6';
      color = '#f472b6';
      label = `随机 j: ${idx}`;
      shadow = '0 0 16px rgba(244, 114, 182, 0.4)';
    } else if (isShuffled) {
      bg = 'rgba(52, 211, 153, 0.18)';
      border = '1px solid #34d399';
      color = '#34d399';
      label = '已置乱锁定';
    }

    return `
      <div style="display:flex; flex-direction:column; align-items:center; gap:6px;">
        <div style="
          width: 58px;
          height: 64px;
          border-radius: 10px;
          background: ${bg};
          border: ${border};
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 1.35rem;
          color: ${color};
          box-shadow: ${shadow};
          transition: all 0.2s ease;
        ">
          ${val}
        </div>
        <span style="font-size: 0.72rem; color: #94a3b8; font-family: monospace;">${label}</span>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 16px; padding: 16px; box-sizing: border-box;">
      <!-- 状态与图例 -->
      <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center; justify-content: space-between;">
        <div style="display: flex; gap: 10px; align-items: center;">
          <span style="display:inline-flex; align-items:center; gap:4px; font-size:0.8rem; color:#38bdf8;">
            <span style="width:10px; height:10px; border-radius:3px; background:#38bdf8; display:inline-block;"></span> 当前游标 i (待填入)
          </span>
          <span style="display:inline-flex; align-items:center; gap:4px; font-size:0.8rem; color:#f472b6;">
            <span style="width:10px; height:10px; border-radius:3px; background:#f472b6; display:inline-block;"></span> 随机抽中 j (从 [0, i])
          </span>
          <span style="display:inline-flex; align-items:center; gap:4px; font-size:0.8rem; color:#34d399;">
            <span style="width:10px; height:10px; border-radius:3px; background:#34d399; display:inline-block;"></span> 已置乱锁定区
          </span>
        </div>
        <div style="font-size: 0.85rem; color: #94a3b8;">
          原数组: <code style="color: #cbd5e1;">[${original.join(', ')}]</code>
        </div>
      </div>

      <!-- 核心数组视觉卡片 -->
      <div style="
        flex: 1;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 24px;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 24px;
      ">
        <div style="display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; align-items: center;">
          ${itemsHtml}
        </div>

        <!-- 随机发生器指示卡 -->
        <div style="
          padding: 12px 20px;
          background: rgba(2, 6, 23, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          display: flex;
          gap: 20px;
          align-items: center;
          font-size: 0.88rem;
        ">
          <div>🎲 <b>随机选择</b>: ${randomIndex >= 0 ? `j = <span style="color:#f472b6; font-weight:700;">${randomIndex}</span> (数值 ${current[randomIndex]})` : '<span style="color:#64748b;">等待生成</span>'}</div>
          <div style="color: rgba(255,255,255,0.2);">|</div>
          <div>🔄 <b>区间范围</b>: ${currentIndex > 0 ? `[0, ${currentIndex}]` : '全域已锁定'}</div>
        </div>

        <!-- 数学均匀性提示 -->
        <div style="
          max-width: 600px;
          padding: 10px 16px;
          background: rgba(30, 41, 59, 0.4);
          border-radius: 8px;
          border-left: 3px solid #34d399;
          font-size: 0.82rem;
          color: #94a3b8;
          line-height: 1.5;
          text-align: center;
        ">
          Fisher-Yates 算法关键：第 i 步从前 i+1 个位置中挑一个与第 i 个交换。总排列数 N! 种，每种被选概率严格相等且为 1/N!。
        </div>
      </div>
    </div>
  `;
}
