import { LFUStep } from './lfu-cache-step-compiler';

export function renderLFUSandbox(step: LFUStep): string {
  const bucketsHtml = step.freqBuckets.length === 0
    ? '<div style="color: #94a3b8; font-style: italic; padding: 10px;">频次桶当前为空</div>'
    : step.freqBuckets.map(b => {
        const isMin = b.freq === step.minFreq;
        const nodePills = b.nodes.map((n, i) => {
          const isHead = i === 0;
          return `
            <div style="display: inline-flex; align-items: center; background: #ffffff; border: 1.5px solid ${isMin && isHead ? '#ef4444' : '#38bdf8'}; border-radius: 6px; padding: 4px 8px; margin: 2px 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
              <span style="font-weight: 800; color: #0284c7; margin-right: 4px;">K:${n.key}</span>
              <span style="color: #64748b; margin-right: 4px;">V:${n.val}</span>
              ${isHead && isMin ? '<span style="font-size: 10px; background: #ef4444; color: #fff; padding: 1px 4px; border-radius: 3px; font-weight: 700;">淘汰候选</span>' : ''}
            </div>
          `;
        }).join('<span style="color: #94a3b8; font-size: 12px; margin: 0 2px;">⇄</span>');

        return `
          <div style="margin-bottom: 8px; background: ${isMin ? 'rgba(239, 68, 68, 0.05)' : '#f8fafc'}; border: 1px solid ${isMin ? '#ef4444' : '#e2e8f0'}; border-radius: 8px; padding: 8px 12px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
              <span style="font-weight: 700; color: ${isMin ? '#dc2626' : '#334155'}; font-size: 12px;">
                频次桶 Freq = ${b.freq} ${isMin ? '🔥 (minFreq 保护/淘汰区)' : ''}
              </span>
              <span style="font-size: 11px; color: #64748b;">共 ${b.nodes.length} 个节点</span>
            </div>
            <div style="display: flex; align-items: center; flex-wrap: wrap;">
              <span style="font-size: 10px; color: #94a3b8; margin-right: 6px;">[最旧]</span>
              ${nodePills}
              <span style="font-size: 10px; color: #94a3b8; margin-left: 6px;">[最新]</span>
            </div>
          </div>
        `;
      }).join('');

  const keyMapHtml = step.keyMap.length === 0
    ? '<div style="color: #94a3b8; font-style: italic; padding: 10px;">哈希表为空</div>'
    : `<div style="display: flex; flex-wrap: wrap; gap: 8px;">
        ${step.keyMap.map(n => `
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px 12px; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.03);">
            <span style="font-size: 11px; color: #64748b;">Key: <strong style="color: #0284c7;">${n.key}</strong></span>
            <span style="font-size: 13px; font-weight: 800; color: #0f172a;">${n.val}</span>
            <span style="font-size: 10px; background: #f3e8ff; color: #7c3aed; padding: 1px 5px; border-radius: 4px; font-weight: 700;">f:${n.freq}</span>
          </div>
        `).join('')}
      </div>`;

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%; height: 100%; justify-content: center; padding: 12px 6px; box-sizing: border-box;">
      <!-- 频次桶与双向链表拓扑 (主画布优先) -->
      <div style="background: #ffffff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 14px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          <span style="font-weight: 700; font-size: 12px; color: #0f172a;">
            📊 频次双向链表拓扑 (Freq -> DoublyLinkedList)
          </span>
          <span style="font-size: 11px; color: #64748b;">同频按 LRU 从左至右淘汰</span>
        </div>
        ${bucketsHtml}
      </div>

      <!-- Key-Value 哈希快速检索表 -->
      <div style="background: #ffffff; border: 1px solid #f1f5f9; border-radius: 12px; padding: 12px 14px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
        <div style="font-weight: 700; font-size: 12px; color: #0f172a; margin-bottom: 8px;">
          🗂️ keyMap 哈希表快照 (Key -> Node Reference)
        </div>
        ${keyMapHtml}
      </div>

      <!-- 底部说明 -->
      <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 4px; font-size: 11px; color: #64748b;">
        <span>O(1) 定位: 哈希表查节点，双向链表快速摘取并插入高频桶</span>
        <span>当前 minFreq: <strong style="color: #d97706;">${step.minFreq}</strong></span>
      </div>
    </div>
  `;
}
