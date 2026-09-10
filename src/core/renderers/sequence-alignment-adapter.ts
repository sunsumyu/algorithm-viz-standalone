/**
 * 通用序列比对与双指针跟踪呈现器适配器 (SequenceAlignmentPresenter)
 * 遵循《algo-viz-authoring》第 4.5 节标准：
 * 1. 四态视觉连续性（待访、已访、当前焦点、路径锁定匹配）
 * 2. 常驻 EOF / Ø 边界哨兵格子，指针越界绝不蒸发
 * 3. 严格边界防御，彻底杜绝任何 'undefined' 脏字符渲染
 */

export type SequenceItemVisualState =
  | 'pending'     // 待考察：白底中性色
  | 'visited'     // 已考察历史：淡灰弱化
  | 'active'      // 当前活跃焦点：高亮亮蓝脉冲
  | 'active-match'// 当前刚匹配成功：翡翠绿脉冲
  | 'matched'     // 历史/当前路径已锁定匹配：常驻翠绿色
  | 'eof-active'  // 越界哨兵激活：指针停在末尾
  | 'eof-normal'; // 越界哨兵默认：弱化静默

export interface SequenceAlignmentOptions {
  s1: string;
  s2: string;
  curI: number;
  curJ: number;
  label1?: string;
  label2?: string;
  matchedIndices1?: number[] | Set<number>;
  matchedIndices2?: number[] | Set<number>;
  customBadgeHtml?: string;
  showEofSentinel?: boolean;
}

export class SequenceAlignmentPresenter {
  /**
   * 渲染完整的双序列对齐看板
   */
  public static render(container: HTMLElement, options: SequenceAlignmentOptions): void {
    if (!container) return;

    const {
      s1,
      s2,
      curI,
      curJ,
      label1 = '字符串 1 (行维度 text1)',
      label2 = '字符串 2 (列维度 text2)',
      matchedIndices1 = [],
      matchedIndices2 = [],
      customBadgeHtml,
      showEofSentinel = true,
    } = options;

    const matchedSet1 = matchedIndices1 instanceof Set ? matchedIndices1 : new Set(matchedIndices1);
    const matchedSet2 = matchedIndices2 instanceof Set ? matchedIndices2 : new Set(matchedIndices2);

    // 严格安全取字符
    const safeChar1 = curI >= 0 && curI < s1.length ? s1[curI] : null;
    const safeChar2 = curJ >= 0 && curJ < s2.length ? s2[curJ] : null;
    const isBothInBounds = safeChar1 !== null && safeChar2 !== null;
    const isCurrentMatch = isBothInBounds && safeChar1 === safeChar2;

    const s1RowHtml = this.renderSequenceRow({
      str: s1,
      curIdx: curI,
      matchedSet: matchedSet1,
      isCurrentMatch,
      showEof: showEofSentinel,
    });

    const s2RowHtml = this.renderSequenceRow({
      str: s2,
      curIdx: curJ,
      matchedSet: matchedSet2,
      isCurrentMatch,
      showEof: showEofSentinel,
    });

    // 状态决策 Badge
    let badgeHtml = customBadgeHtml;
    if (!badgeHtml) {
      if (curI < 0 || curJ < 0) {
        badgeHtml = `<span style="font-size: 11px; font-weight: 700; color: #64748b; background: #f8fafc; border: 1px solid #e2e8f0; padding: 3px 10px; border-radius: 6px;">⏱️ 尚未开始比对 (索引未就绪)</span>`;
      } else if (curI >= s1.length || curJ >= s2.length) {
        const outInfo = curI >= s1.length && curJ >= s2.length
          ? '双串均已到达末尾空串'
          : curI >= s1.length
          ? `text1 遍历完毕 (索引 ${curI} >= ${s1.length})`
          : `text2 遍历完毕 (索引 ${curJ} >= ${s2.length})`;
        badgeHtml = `<span style="font-size: 11px; font-weight: 700; color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; padding: 3px 10px; border-radius: 6px;">🛡️ 边界基底：${outInfo}，return 0</span>`;
      } else if (isCurrentMatch) {
        badgeHtml = `<span style="font-size: 11px; font-weight: 700; color: #15803d; background: #dcfce7; border: 1px solid #86efac; padding: 3px 10px; border-radius: 6px; box-shadow: 0 1px 3px rgba(22, 163, 74, 0.15);">✨ 字符匹配成功：s1[${curI}] == s2[${curJ}] ('${safeChar1}') 纳入公共子序列 (+1)</span>`;
      } else {
        badgeHtml = `<span style="font-size: 11px; font-weight: 700; color: #475569; background: #f1f5f9; border: 1px solid #cbd5e1; padding: 3px 10px; border-radius: 6px;">🔍 字符比对：s1[${curI}]('${safeChar1}') != s2[${curJ}]('${safeChar2}')，双向分支择大</span>`;
      }
    }

    container.innerHTML = `
      <div class="seq-align-presenter-root" style="
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 10px 14px;
        box-sizing: border-box;
        justify-content: center;
        align-items: center;
      ">
        <!-- 字符串 1 容器 -->
        <div style="display: flex; flex-direction: column; gap: 5px; width: 100%; max-width: 480px; background: #f8fafc; padding: 9px 12px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
          <div style="font-size: 11.5px; font-weight: 700; color: #334155; display: flex; justify-content: space-between;">
            <span>${label1}</span>
            <span style="color: #64748b; font-family: monospace;">长度 ${s1.length} | 当前索引: ${this.formatIndexText(curI, s1.length)}</span>
          </div>
          <div style="display: flex; gap: 6px; overflow-x: auto; padding: 2px; align-items: center;">
            ${s1RowHtml}
          </div>
        </div>

        <!-- 字符串 2 容器 -->
        <div style="display: flex; flex-direction: column; gap: 5px; width: 100%; max-width: 480px; background: #f8fafc; padding: 9px 12px; border-radius: 10px; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
          <div style="font-size: 11.5px; font-weight: 700; color: #334155; display: flex; justify-content: space-between;">
            <span>${label2}</span>
            <span style="color: #64748b; font-family: monospace;">长度 ${s2.length} | 当前索引: ${this.formatIndexText(curJ, s2.length)}</span>
          </div>
          <div style="display: flex; gap: 6px; overflow-x: auto; padding: 2px; align-items: center;">
            ${s2RowHtml}
          </div>
        </div>

        <!-- 底部推导决策与状态提示徽章 -->
        <div style="display: flex; align-items: center; justify-content: center; margin-top: 2px;">
          ${badgeHtml}
        </div>
      </div>
    `;
  }

  private static formatIndexText(idx: number, length: number): string {
    if (idx < 0) return '未就绪';
    if (idx >= length) return `${idx} (越界空串/EOF)`;
    return `${idx}`;
  }

  private static renderSequenceRow(params: {
    str: string;
    curIdx: number;
    matchedSet: Set<number>;
    isCurrentMatch: boolean;
    showEof: boolean;
  }): string {
    const { str, curIdx, matchedSet, isCurrentMatch, showEof } = params;
    const chars = str.split('');
    const cellsHtml = chars.map((char, idx) => {
      const isCur = idx === curIdx;
      const isMatched = matchedSet.has(idx);

      let visualState: SequenceItemVisualState = 'pending';
      if (isCur && isCurrentMatch) {
        visualState = 'active-match';
      } else if (isMatched) {
        visualState = 'matched';
      } else if (isCur) {
        visualState = 'active';
      } else if (curIdx >= 0 && idx < curIdx) {
        visualState = 'visited';
      }

      return this.renderCell(char, idx, visualState);
    });

    if (showEof) {
      const isEofActive = curIdx >= str.length;
      cellsHtml.push(this.renderEofCell(isEofActive));
    }

    return cellsHtml.join('');
  }

  private static renderCell(char: string, idx: number, state: SequenceItemVisualState): string {
    let bg = '#ffffff';
    let color = '#334155';
    let border = '1px solid #e2e8f0';
    let shadow = 'none';
    let extraBadge = '';

    switch (state) {
      case 'active-match':
        bg = '#dcfce7';
        color = '#15803d';
        border = '2px solid #16a34a';
        shadow = '0 2px 8px rgba(22, 163, 74, 0.3)';
        extraBadge = '<span style="position: absolute; top: -6px; right: -6px; font-size: 9px; background: #16a34a; color: #fff; border-radius: 50%; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center;">✓</span>';
        break;
      case 'matched':
        bg = '#f0fdf4';
        color = '#16a34a';
        border = '1.5px solid #86efac';
        shadow = '0 1px 4px rgba(22, 163, 74, 0.15)';
        extraBadge = '<span style="position: absolute; top: -5px; right: -5px; font-size: 8px; color: #16a34a;">★</span>';
        break;
      case 'active':
        bg = '#e0f2fe';
        color = '#0284c7';
        border = '2px solid #0284c7';
        shadow = '0 2px 8px rgba(2, 132, 199, 0.25)';
        break;
      case 'visited':
        bg = '#f1f5f9';
        color = '#94a3b8';
        border = '1px solid #e2e8f0';
        break;
      case 'pending':
      default:
        bg = '#ffffff';
        color = '#475569';
        border = '1px solid #e2e8f0';
        break;
    }

    return `
      <div style="
        position: relative;
        padding: 7px 11px;
        font-family: monospace;
        font-size: 14.5px;
        font-weight: 700;
        background: ${bg};
        color: ${color};
        border: ${border};
        border-radius: 8px;
        box-shadow: ${shadow};
        text-align: center;
        min-width: 30px;
        transition: all 0.2s ease;
      " title="索引 [${idx}]: '${char}'">
        ${char}
        ${extraBadge}
      </div>
    `;
  }

  private static renderEofCell(isActive: boolean): string {
    const bg = isActive ? '#fee2e2' : '#f8fafc';
    const color = isActive ? '#dc2626' : '#94a3b8';
    const border = isActive ? '2px solid #ef4444' : '1px dashed #cbd5e1';
    const shadow = isActive ? '0 2px 8px rgba(239, 68, 68, 0.25)' : 'none';

    return `
      <div style="
        position: relative;
        padding: 7px 9px;
        font-family: monospace;
        font-size: 11px;
        font-weight: 700;
        background: ${bg};
        color: ${color};
        border: ${border};
        border-radius: 8px;
        box-shadow: ${shadow};
        text-align: center;
        min-width: 32px;
        transition: all 0.2s ease;
      " title="末尾空串基底 (EOF / Ø)">
        Ø
        ${isActive ? '<span style="position: absolute; top: -6px; right: -6px; font-size: 9px; background: #ef4444; color: #fff; border-radius: 50%; width: 14px; height: 14px; display: flex; align-items: center; justify-content: center;">!</span>' : ''}
      </div>
    `;
  }
}
