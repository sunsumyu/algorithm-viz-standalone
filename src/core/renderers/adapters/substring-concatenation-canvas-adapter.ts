import { SubstringStep } from './substring-concatenation-step-compiler';

export function renderSubstringCanvas(container: HTMLElement, step: SubstringStep): void {
  const { s, wordLen, left, right, currentWord, windowMap, targetMap, matchedIndices, offset } = step;

  // 1. 目标词汇状态芯片条 (Target Words Ledger)
  const wordsStatusHtml = Object.entries(targetMap).map(([word, targetFreq]) => {
    const curFreq = windowMap[word] || 0;
    const isSatisfied = curFreq === targetFreq;
    const isOverflow = curFreq > targetFreq;

    let chipBg = 'background: #f8fafc; border-color: #e2e8f0; color: #64748b;';
    let badge = `<span style="background: #e2e8f0; color: #475569; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;">${curFreq}/${targetFreq}</span>`;

    if (isSatisfied) {
      chipBg = 'background: #f0fdf4; border-color: #86efac; color: #166534;';
      badge = `<span style="background: #22c55e; color: #ffffff; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 800;">✓ ${curFreq}/${targetFreq}</span>`;
    } else if (isOverflow) {
      chipBg = 'background: #fef2f2; border-color: #fca5a5; color: #991b1b;';
      badge = `<span style="background: #ef4444; color: #ffffff; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 800;">超额 ${curFreq}/${targetFreq}</span>`;
    } else if (curFreq > 0) {
      chipBg = 'background: #eff6ff; border-color: #93c5fd; color: #1e40af;';
      badge = `<span style="background: #3b82f6; color: #ffffff; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: 700;">${curFreq}/${targetFreq}</span>`;
    }

    return `
      <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 8px; border: 1px solid transparent; font-size: 12px; font-family: 'JetBrains Mono', monospace; font-weight: 600; ${chipBg}">
        <span>"${word}"</span>
        ${badge}
      </div>
    `;
  }).join('');

  // 2. 主串字符轨道 (Canvas Dominance 主角)
  const chars = s.split('');
  const charsHtml = chars.map((char, idx) => {
    const inWindow = idx >= left && idx < right;
    const isCurrentWordChunk = idx >= right - wordLen && idx < right;
    const isMatchStart = matchedIndices.includes(idx);
    const isLeftBoundary = idx === left;
    const isRightBoundary = idx === right - 1;

    let cellBg = '#f8fafc';
    let cellBorder = '1px solid #e2e8f0';
    let cellColor = '#475569';
    let shadow = 'none';

    if (isMatchStart) {
      cellBg = '#ecfdf5';
      cellBorder = '2px solid #10b981';
      cellColor = '#065f46';
      shadow = '0 2px 8px rgba(16, 185, 129, 0.15)';
    } else if (isCurrentWordChunk) {
      cellBg = '#eff6ff';
      cellBorder = '2px solid #3b82f6';
      cellColor = '#1d4ed8';
      shadow = '0 2px 8px rgba(59, 130, 246, 0.15)';
    } else if (inWindow) {
      cellBg = '#f0f9ff';
      cellBorder = '1px solid #7dd3fc';
      cellColor = '#0369a1';
    }

    return `
      <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; flex-shrink: 0;">
        <!-- 下标索引 -->
        <span style="font-size: 10px; font-family: 'JetBrains Mono', monospace; color: #94a3b8; font-weight: 600;">${idx}</span>

        <!-- 字符卡片 -->
        <div style="
          width: 38px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          background: ${cellBg};
          border: ${cellBorder};
          box-shadow: ${shadow};
          font-size: 18px;
          font-weight: 800;
          font-family: 'JetBrains Mono', monospace;
          color: ${cellColor};
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        ">
          ${char}
        </div>

        <!-- 边界与指示标记 -->
        <div style="height: 16px; display: flex; align-items: center; justify-content: center;">
          ${isLeftBoundary ? '<span style="font-size: 9px; background: #3b82f6; color: #ffffff; padding: 1px 4px; border-radius: 3px; font-weight: 800;">L</span>' : ''}
          ${isRightBoundary && !isLeftBoundary ? '<span style="font-size: 9px; background: #6366f1; color: #ffffff; padding: 1px 4px; border-radius: 3px; font-weight: 800;">R</span>' : ''}
          ${isMatchStart ? '<span style="font-size: 9px; background: #10b981; color: #ffffff; padding: 1px 4px; border-radius: 3px; font-weight: 800;">★</span>' : ''}
        </div>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 16px; width: 100%; height: 100%; justify-content: center; padding: 12px 6px; box-sizing: border-box;">
      <!-- 顶部控制上下文与词汇账本 -->
      <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; padding: 0 4px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="font-size: 12px; font-weight: 700; color: #0f172a;">🎯 目标单词频次账本:</span>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${wordsStatusHtml}
          </div>
        </div>
        <div style="display: flex; align-items: center; gap: 6px; font-size: 11px; color: #64748b; background: #f1f5f9; padding: 4px 10px; border-radius: 6px;">
          <span>当前偏移组: <strong style="color: #2563eb;">#${offset}</strong></span>
          <span>·</span>
          <span>单词步长: <strong style="color: #0f172a;">${wordLen}</strong></span>
        </div>
      </div>

      <!-- 字符轨道滚动视口 (纯粹主画布，占据主导地位) -->
      <div style="
        display: flex;
        gap: 6px;
        align-items: center;
        overflow-x: auto;
        padding: 18px 12px;
        background: #ffffff;
        border: 1px solid #f1f5f9;
        border-radius: 12px;
        box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
      ">
        ${charsHtml}
      </div>

      <!-- 底部滑动窗口跨度图示 -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 8px; font-size: 11px; color: #64748b;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="display: inline-flex; align-items: center; gap: 4px;">
            <span style="width: 10px; height: 10px; border-radius: 2px; background: #ecfdf5; border: 1.5px solid #10b981;"></span>
            已命中完全串联
          </span>
          <span style="display: inline-flex; align-items: center; gap: 4px;">
            <span style="width: 10px; height: 10px; border-radius: 2px; background: #eff6ff; border: 1.5px solid #3b82f6;"></span>
            当前截取单词
          </span>
          <span style="display: inline-flex; align-items: center; gap: 4px;">
            <span style="width: 10px; height: 10px; border-radius: 2px; background: #f0f9ff; border: 1.5px solid #7dd3fc;"></span>
            当前滑动窗口
          </span>
        </div>
        <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #94a3b8;">
          当前截取: ${currentWord ? `"${currentWord}"` : '—'}
        </span>
      </div>
    </div>
  `;
}
