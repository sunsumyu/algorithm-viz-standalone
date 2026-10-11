/**
 * Class 060: Code05 戳印序列 Canvas Adapter
 */

export function renderStampingBoard(
  stamp: string,
  targetChars: string[],
  inDegree: number[],
  curStart: number | null,
  path: number[],
  queue: number[]
): string {
  const m = stamp.length;

  const targetCells = targetChars.map((ch, idx) => {
    const isStamped = ch === '?';
    const isInCurWindow = curStart !== null && idx >= curStart && idx < curStart + m;

    const bg = isInCurWindow ? '#fef3c7' : isStamped ? '#ede9fe' : '#ffffff';
    const border = isInCurWindow ? '2px solid #f59e0b' : isStamped ? '1.5px solid #8b5cf6' : '1px solid #cbd5e1';
    const textCol = isInCurWindow ? '#b45309' : isStamped ? '#7c3aed' : '#0f172a';

    return `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 38px; height: 46px; background: ${bg}; border: ${border}; border-radius: 6px; box-sizing: border-box;">
        <span style="font-size: 14px; font-weight: 800; font-family: monospace; color: ${textCol};">${ch}</span>
        <span style="font-size: 8px; color: #94a3b8; font-family: monospace;">[${idx}]</span>
      </div>
    `;
  }).join('');

  const windowCards = inDegree.map((deg, startIdx) => {
    const isCur = curStart === startIdx;
    const isDone = deg === 0 && !queue.includes(startIdx) && path.includes(startIdx);
    const inQ = queue.includes(startIdx);

    const bg = isCur ? '#fef3c7' : isDone ? '#ecfdf5' : inQ ? '#ede9fe' : '#ffffff';
    const border = isCur ? '2px solid #f59e0b' : isDone ? '1px solid #10b981' : inQ ? '1.5px solid #8b5cf6' : '1px solid #cbd5e1';
    const textCol = isCur ? '#b45309' : isDone ? '#047857' : inQ ? '#6d28d9' : '#1e293b';

    return `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 72px; padding: 4px 6px; background: ${bg}; border: ${border}; border-radius: 6px; box-sizing: border-box;">
        <span style="font-size: 10px; font-weight: 700; color: ${textCol};">窗口 [${startIdx}..${startIdx + m - 1}]</span>
        <span style="font-size: 11px; font-weight: 800; color: #6366f1; font-family: monospace;">差异度: ${deg}</span>
        <span style="font-size: 8px; color: ${isDone ? '#10b981' : inQ ? '#8b5cf6' : '#94a3b8'};">${isDone ? '已盖印' : inQ ? '就绪' : '等待通配'}</span>
      </div>
    `;
  }).join('');

  const forwardPath = [...path].reverse();

  return `
    <div style="display: flex; flex-direction: column; align-items: center; gap: 12px; width: 100%; max-width: 520px;">
      <div style="display: flex; gap: 16px; align-items: center; font-size: 11px; color: #475569; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 14px; border-radius: 6px; width: 100%; justify-content: space-between; box-sizing: border-box;">
        <span>印章模板 stamp: <strong style="color: #6366f1; font-family: monospace; font-size: 13px;">"${stamp}"</strong> (长 ${m})</span>
        <span>已撤销盖印步骤: <strong style="color: #10b981;">${path.length} / ${inDegree.length}</strong></span>
      </div>

      <div style="display: flex; flex-direction: column; gap: 4px; align-items: center; width: 100%;">
        <span style="font-size: 11px; font-weight: 700; color: #475569;">目标字符串 Target 实时通配符状态 ('?' 表示已被成功擦除/覆盖):</span>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;">${targetCells}</div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 4px; width: 100%;">
        <span style="font-size: 11px; font-weight: 700; color: #475569;">滑动窗口差异入度表 inDegree[] (差异度为 0 即可逆向揭盖):</span>
        <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;">${windowCards}</div>
      </div>

      <div style="display: flex; gap: 8px; align-items: center; background: #ede9fe; padding: 6px 12px; border-radius: 6px; width: 100%; box-sizing: border-box;">
        <span style="font-size: 11px; font-weight: 700; color: #6d28d9;">正向盖印顺序 [Start Indices]:</span>
        <strong style="font-family: monospace; font-size: 12px; color: #4c1d95;">[ ${forwardPath.join(', ') || '推导中...'} ]</strong>
      </div>
    </div>
  `;
}
