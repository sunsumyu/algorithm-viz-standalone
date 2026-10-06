/**
 * 寻找重复的子树画布与卡片适配器 (Duplicate Subtrees Canvas Adapter)
 * 职责：纯粹的 Card 1 SVG 树沙盘与 Card 2 序列签名/UID频次表渲染
 */

import { DuplicateSubtreeStep } from './duplicate-subtrees-step-compiler';

/**
 * Card 1: 纯净 SVG 树画布渲染 (零标题、零指标镜像、零套娃)
 */
export function renderDuplicateSubtreesCanvas(container: HTMLElement, step: DuplicateSubtreeStep): void {
  const { nodes, currentNodeId, subtreeSerialMap, duplicateRoots } = step;

  // 连接线 SVG
  const linesHtml = nodes
    .map((node) => {
      const leftChild = node.leftId ? nodes.find((n) => n.id === node.leftId) : null;
      const rightChild = node.rightId ? nodes.find((n) => n.id === node.rightId) : null;

      let res = '';
      if (leftChild) {
        res += `<line x1="${node.x}" y1="${node.y}" x2="${leftChild.x}" y2="${leftChild.y}" stroke="rgba(255,255,255,0.22)" stroke-width="2" stroke-linecap="round" />`;
      }
      if (rightChild) {
        res += `<line x1="${node.x}" y1="${node.y}" x2="${rightChild.x}" y2="${rightChild.y}" stroke="rgba(255,255,255,0.22)" stroke-width="2" stroke-linecap="round" />`;
      }
      return res;
    })
    .join('');

  // 节点渲染
  const nodesHtml = nodes
    .map((node) => {
      const isCurrent = node.id === currentNodeId;
      const isDuplicate = duplicateRoots.includes(node.id);
      const serial = subtreeSerialMap[node.id];

      let fill = 'rgba(30, 41, 59, 0.92)';
      let stroke = 'rgba(255, 255, 255, 0.28)';
      let textColor = '#f8fafc';
      let filter = 'none';

      if (isDuplicate) {
        fill = 'rgba(16, 185, 129, 0.35)';
        stroke = '#10b981';
        textColor = '#34d399';
        filter = 'drop-shadow(0 0 8px rgba(16,185,129,0.5))';
      }
      if (isCurrent) {
        fill = 'rgba(56, 189, 248, 0.45)';
        stroke = '#38bdf8';
        textColor = '#38bdf8';
        filter = 'drop-shadow(0 0 10px rgba(56,189,248,0.7))';
      }

      return `
      <g style="filter: ${filter};">
        <circle cx="${node.x}" cy="${node.y}" r="22" fill="${fill}" stroke="${stroke}" stroke-width="${isCurrent || isDuplicate ? 3 : 1.5}" />
        <text x="${node.x}" y="${node.y + 5}" font-size="14" font-weight="700" fill="${textColor}" text-anchor="middle" font-family="system-ui, sans-serif">${node.val}</text>
        ${
          serial
            ? `<text x="${node.x}" y="${node.y + 36}" font-size="9.5" fill="#94a3b8" text-anchor="middle" font-family="monospace">${
                serial.length > 14 ? serial.substring(0, 13) + '..' : serial
              }</text>`
            : ''
        }
        ${
          isDuplicate
            ? `<text x="${node.x}" y="${node.y - 28}" font-size="10" fill="#34d399" font-weight="700" text-anchor="middle">★ 重复根</text>`
            : ''
        }
      </g>
    `;
    })
    .join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative;">
      <div style="position: absolute; top: 12px; right: 16px; display: flex; gap: 14px; font-size: 0.8rem; background: rgba(15,23,42,0.6); padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.06);">
        <span style="color: #38bdf8; display: flex; align-items: center; gap: 4px;">● 当前遍历点</span>
        <span style="color: #34d399; display: flex; align-items: center; gap: 4px;">★ 重复子树根</span>
      </div>
      <svg viewBox="0 0 500 320" style="width: 100%; max-height: 340px; overflow: visible;">
        ${linesHtml}
        ${nodesHtml}
      </svg>
    </div>
  `;
}

/**
 * Card 2: 序列签名频次表 / UID 编码表 (与标题和徽章绝对对齐)
 */
export function renderDuplicateSubtreesCard2(container: HTMLElement, step: DuplicateSubtreeStep): void {
  const { stageId, serialCountMap, duplicateRoots, nodes, tripletMap, uidCountMap, nodeUidMap, stackFrames } = step;

  if (stageId === 'stage2') {
    // Stage 2: 三元组 UID 编码表
    const entries = Object.entries(tripletMap || {}).map(([triplet, uid]) => {
      const count = uidCountMap?.[uid] || 0;
      const isDupe = count >= 2;
      return `
        <div style="
          padding: 6px 10px;
          background: ${isDupe ? 'rgba(16, 185, 129, 0.15)' : 'rgba(2, 6, 23, 0.4)'};
          border: 1px solid ${isDupe ? '#10b981' : 'rgba(255, 255, 255, 0.08)'};
          border-radius: 6px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-family: monospace;
          font-size: 0.8rem;
        ">
          <span style="color: #cbd5e1;">(${triplet}) &rarr; <strong style="color: #38bdf8;">UID #${uid}</strong></span>
          <span style="font-weight: 700; color: ${isDupe ? '#34d399' : '#94a3b8'};">频次: ${count} ${isDupe ? '🎯' : ''}</span>
        </div>
      `;
    });

    container.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 10px; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.88rem; font-weight: 600; color: #f1f5f9;">
          <span>📋 三元组 (val, leftUID, rightUID) 编码表</span>
          <span style="font-size: 0.76rem; color: #94a3b8;">共 ${Object.keys(tripletMap || {}).length} 种形态</span>
        </div>
        <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; padding: 6px; background: rgba(2, 6, 23, 0.5); border-radius: 8px;">
          ${entries.length ? entries.join('') : '<div style="color:#64748b; font-size:0.8rem; text-align:center; padding:12px;">暂无记录</div>'}
        </div>
        <div style="padding: 8px 12px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; font-size: 0.82rem;">
          <div style="font-weight: 600; color: #34d399; margin-bottom: 2px;">🎯 已捕获重复子树根节点:</div>
          <div style="color: #f1f5f9; font-weight: 700;">
            ${duplicateRoots.length ? duplicateRoots.map((id) => `[节点 ${nodes.find((n) => n.id === id)?.val} (UID:#${nodeUidMap?.[id]})]`).join('、') : '<span style="color:#94a3b8; font-weight:normal;">尚未检测到重复</span>'}
          </div>
        </div>
      </div>
    `;
    return;
  }

  if (stageId === 'stage3') {
    // Stage 3: 显式后序栈与频次表
    const stackItems = (stackFrames || []).map((id) => {
      const node = nodes.find((n) => n.id === id);
      return `<span style="background: rgba(56, 189, 248, 0.2); border: 1px solid #38bdf8; color: #38bdf8; padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; font-weight: 600;">${node?.val ?? id}</span>`;
    });

    container.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 10px; box-sizing: border-box;">
        <div style="padding: 10px; background: rgba(2, 6, 23, 0.5); border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 0.85rem; font-weight: 600; color: #f1f5f9; margin-bottom: 6px;">🥞 显式迭代栈帧 (Explicit Stack):</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${stackItems.length ? stackItems.join('') : '<span style="color:#64748b; font-size:0.8rem;">(空栈)</span>'}
          </div>
        </div>
        <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; padding: 6px; background: rgba(2, 6, 23, 0.5); border-radius: 8px;">
          <div style="font-size: 0.82rem; font-weight: 600; color: #cbd5e1; margin-bottom: 4px;">📋 序列签名频次统计:</div>
          ${Object.entries(serialCountMap).map(([serial, count]) => `
            <div style="padding: 5px 8px; background: ${count >= 2 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(15, 23, 42, 0.4)'}; border: 1px solid ${count >= 2 ? '#10b981' : 'rgba(255,255,255,0.06)'}; border-radius: 6px; font-size: 0.78rem; display: flex; justify-content: space-between; font-family: monospace;">
              <span style="color: #cbd5e1; max-width: 180px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">"${serial}"</span>
              <span style="color: ${count >= 2 ? '#34d399' : '#94a3b8'}; font-weight: 700;">频次: ${count} ${count >= 2 ? '🎯' : ''}</span>
            </div>
          `).join('') || '<div style="color:#64748b; font-size:0.8rem; text-align:center; padding:10px;">暂无记录</div>'}
        </div>
        <div style="padding: 8px 12px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; font-size: 0.82rem;">
          <div style="font-weight: 600; color: #34d399; margin-bottom: 2px;">🎯 已捕获重复子树根节点:</div>
          <div style="color: #f1f5f9; font-weight: 700;">
            ${duplicateRoots.length ? duplicateRoots.map((id) => `[节点 ${nodes.find((n) => n.id === id)?.val}]`).join('、') : '<span style="color:#94a3b8; font-weight:normal;">尚未检测到重复</span>'}
          </div>
        </div>
      </div>
    `;
    return;
  }

  // 默认 Stage 1: 序列签名频次表
  const hashMapEntries = Object.entries(serialCountMap).map(([serial, count]) => {
    const isDupe = count >= 2;
    return `
      <div style="
        padding: 6px 10px;
        background: ${isDupe ? 'rgba(16, 185, 129, 0.15)' : 'rgba(2, 6, 23, 0.4)'};
        border: 1px solid ${isDupe ? '#10b981' : 'rgba(255, 255, 255, 0.08)'};
        border-radius: 6px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-family: monospace;
        font-size: 0.8rem;
      ">
        <span style="color: #cbd5e1; max-width: 170px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">"${serial}"</span>
        <span style="font-weight: 700; color: ${isDupe ? '#34d399' : '#94a3b8'};">频次: ${count} ${isDupe ? '🎯' : ''}</span>
      </div>
    `;
  });

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 10px; box-sizing: border-box;">
      <div style="display: flex; justify-content: space-between; align-items: center; font-size: 0.88rem; font-weight: 600; color: #f1f5f9;">
        <span>📋 序列签名频次表 (Hash Table)</span>
        <span style="font-size: 0.76rem; color: #94a3b8;">共 ${Object.keys(serialCountMap).length} 种形态</span>
      </div>
      <div style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px; padding: 6px; background: rgba(2, 6, 23, 0.5); border-radius: 8px;">
        ${hashMapEntries.length ? hashMapEntries.join('') : '<div style="color:#64748b; font-size:0.8rem; text-align:center; padding:12px;">暂无序列记录</div>'}
      </div>
      <div style="padding: 8px 12px; background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 8px; font-size: 0.82rem;">
        <div style="font-weight: 600; color: #34d399; margin-bottom: 2px;">🎯 已捕获重复子树根节点:</div>
        <div style="color: #f1f5f9; font-weight: 700;">
          ${duplicateRoots.length ? duplicateRoots.map((id) => `[节点 ${nodes.find((n) => n.id === id)?.val} (ID:${id})]`).join('、') : '<span style="color:#94a3b8; font-weight:normal;">尚未检测到重复</span>'}
        </div>
      </div>
    </div>
  `;
}
