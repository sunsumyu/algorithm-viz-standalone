/**
 * 回文对 (Palindrome Pairs)
 * Canvas Adapter
 */

import { PalindromePairsStep } from './palindrome-pairs-step-compiler';

export function renderPalindromePairsCanvas(container: HTMLElement, step: PalindromePairsStep): void {
  const { words, currentWordIndex, splitPos, leftSub, rightSub, isLeftPalin, isRightPalin, foundPairs, currentCandidate } = step;

  const wordsHtml = words.map((w, idx) => {
    const isCurrent = idx === currentWordIndex;
    return `
      <div style="
        padding: 8px 14px;
        background: ${isCurrent ? 'rgba(56, 189, 248, 0.18)' : 'rgba(30, 41, 59, 0.5)'};
        border: 1px solid ${isCurrent ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'};
        border-radius: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: ${isCurrent ? '0 0 12px rgba(56, 189, 248, 0.3)' : 'none'};
      ">
        <span style="font-size: 0.72rem; color: #94a3b8; font-family: monospace;">[${idx}]</span>
        <span style="font-weight: 700; color: ${isCurrent ? '#38bdf8' : '#f8fafc'}; font-size: 1.05rem;">"${w}"</span>
      </div>
    `;
  }).join('');

  const pairsHtml = foundPairs.map(([a, b]) => {
    const isLatest = currentCandidate && currentCandidate[0] === a && currentCandidate[1] === b;
    return `
      <div style="
        padding: 8px 12px;
        background: ${isLatest ? 'rgba(52, 211, 153, 0.25)' : 'rgba(16, 185, 129, 0.12)'};
        border: 1px solid ${isLatest ? '#34d399' : 'rgba(16, 185, 129, 0.3)'};
        border-radius: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-family: monospace;
      ">
        <span style="color: #34d399; font-weight: 700;">[${a}, ${b}]</span>
        <span style="color: #cbd5e1; font-size: 0.85rem;">"${words[a] + words[b]}"</span>
      </div>
    `;
  }).join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 16px; padding: 16px; box-sizing: border-box;">
      <!-- 上半区：单词集看板 -->
      <div style="
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      ">
        <span style="font-size: 0.95rem; font-weight: 600; color: #f1f5f9;">📚 待检索单词集 (Word Set)</span>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          ${wordsHtml}
        </div>
      </div>

      <!-- 中间区：前后缀拆解与回文检测卡片 -->
      <div style="
        flex: 1;
        background: rgba(15, 23, 42, 0.6);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        padding: 20px;
        display: flex;
        gap: 20px;
      ">
        <!-- 左侧：前后缀拆解模拟 -->
        <div style="flex: 3; display: flex; flex-direction: column; gap: 14px;">
          <div style="font-size: 0.95rem; font-weight: 600; color: #f1f5f9; display: flex; justify-content: space-between;">
            <span>✂️ 单词前后缀切分探针</span>
            ${currentWordIndex >= 0 ? `<span style="font-size: 0.82rem; color: #38bdf8;">当前: "${words[currentWordIndex]}" (位置 j = ${splitPos})</span>` : ''}
          </div>

          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 16px;
            padding: 24px;
            background: rgba(2, 6, 23, 0.5);
            border-radius: 10px;
          ">
            <div style="
              padding: 12px 20px;
              background: ${isLeftPalin ? 'rgba(52, 211, 153, 0.2)' : 'rgba(56, 189, 248, 0.15)'};
              border: 1px solid ${isLeftPalin ? '#34d399' : '#38bdf8'};
              border-radius: 8px;
              text-align: center;
            ">
              <div style="font-size: 0.75rem; color: #94a3b8;">左前缀 (left)</div>
              <div style="font-size: 1.35rem; font-weight: 800; color: ${isLeftPalin ? '#34d399' : '#38bdf8'};">"${leftSub}"</div>
              <div style="font-size: 0.72rem; color: ${isLeftPalin ? '#34d399' : '#64748b'}; margin-top: 4px;">${isLeftPalin ? '✓ 自身回文' : '非回文'}</div>
            </div>

            <div style="font-size: 1.5rem; color: #64748b;">+</div>

            <div style="
              padding: 12px 20px;
              background: ${isRightPalin ? 'rgba(52, 211, 153, 0.2)' : 'rgba(244, 114, 182, 0.15)'};
              border: 1px solid ${isRightPalin ? '#34d399' : '#f472b6'};
              border-radius: 8px;
              text-align: center;
            ">
              <div style="font-size: 0.75rem; color: #94a3b8;">右后缀 (right)</div>
              <div style="font-size: 1.35rem; font-weight: 800; color: ${isRightPalin ? '#34d399' : '#f472b6'};">"${rightSub}"</div>
              <div style="font-size: 0.72rem; color: ${isRightPalin ? '#34d399' : '#64748b'}; margin-top: 4px;">${isRightPalin ? '✓ 自身回文' : '非回文'}</div>
            </div>
          </div>

          <div style="
            padding: 10px 14px;
            background: rgba(30, 41, 59, 0.4);
            border-left: 3px solid #f472b6;
            border-radius: 0 6px 6px 0;
            font-size: 0.82rem;
            color: #94a3b8;
            line-height: 1.5;
          ">
            💡 <b>回文对核心定理</b>：若单词拆为 $left + right$，$left$ 是回文，则寻找 $reverse(right) + left + right$；若 $right$ 是回文，则寻找 $left + right + reverse(left)$。
          </div>
        </div>

        <!-- 右侧：已收集回文对池 -->
        <div style="flex: 2; display: flex; flex-direction: column; gap: 10px;">
          <div style="font-size: 0.95rem; font-weight: 600; color: #f1f5f9; display: flex; justify-content: space-between;">
            <span>🎯 成功匹配回文对</span>
            <span style="font-size: 0.82rem; color: #34d399;">共 ${foundPairs.length} 组</span>
          </div>

          <div style="
            flex: 1;
            background: rgba(2, 6, 23, 0.4);
            border-radius: 8px;
            padding: 10px;
            display: flex;
            flex-direction: column;
            gap: 6px;
            overflow-y: auto;
            max-height: 180px;
          ">
            ${pairsHtml.length ? pairsHtml : '<div style="color:#64748b; font-size:0.82rem; margin:auto;">暂未匹配到回文对</div>'}
          </div>
        </div>
      </div>
    </div>
  `;
}
