/**
 * 前缀优化建图 (Prefix Optimization Graph Canvas Adapter)
 * 遵循 Matt Pocock 深模块哲学与设计规范
 * 职责：渲染原点与前缀虚点拓扑、级联透传连边、外部查询与边数压缩监视卡片
 */

import type { PrefixOptStep } from '../../../algorithms/categories/graph/prefix-opt-graph-step-compiler';

export function renderPrefixOptGraphCanvas(container: HTMLElement, step: PrefixOptStep): void {
  const isPrefix = step.mode === 'prefix';
  const activeNode = step.activeNode;
  const activeEdge = step.activeEdge;
  const isS1Active = activeNode === 'S1';
  const isS2Active = activeNode === 'S2';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 230px; background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 12px; padding: 8px; box-sizing: border-box;">
      <svg style="width: 100%; height: 210px; max-width: 440px;" viewBox="0 0 350 200" preserveAspectRatio="xMidYMid meet">
        <defs>
          <marker id="arrow-blue" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
          </marker>
          <marker id="arrow-green" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981" />
          </marker>
          <marker id="arrow-pink" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ec4899" />
          </marker>
          <marker id="arrow-amber" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#f59e0b" />
          </marker>
        </defs>

        ${
          isPrefix
            ? `
          <!-- 上方前缀虚点链 P1..P5 (级联边 P_i -> P_{i-1}) -->
          <line x1="280" y1="60" x2="220" y2="60" stroke="${activeEdge && activeEdge[0] === 'P5' && activeEdge[1] === 'P4' ? '#f59e0b' : '#10b981'}" stroke-width="${activeEdge && activeEdge[0] === 'P5' && activeEdge[1] === 'P4' ? '3' : '2'}" marker-end="url(#arrow-green)" />
          <line x1="220" y1="60" x2="160" y2="60" stroke="${activeEdge && activeEdge[0] === 'P4' && activeEdge[1] === 'P3' ? '#f59e0b' : '#10b981'}" stroke-width="${activeEdge && activeEdge[0] === 'P4' && activeEdge[1] === 'P3' ? '3' : '2'}" marker-end="url(#arrow-green)" />
          <line x1="160" y1="60" x2="100" y2="60" stroke="${activeEdge && activeEdge[0] === 'P3' && activeEdge[1] === 'P2' ? '#f59e0b' : '#10b981'}" stroke-width="${activeEdge && activeEdge[0] === 'P3' && activeEdge[1] === 'P2' ? '3' : '2'}" marker-end="url(#arrow-green)" />
          <line x1="100" y1="60" x2="40" y2="60" stroke="${activeEdge && activeEdge[0] === 'P2' && activeEdge[1] === 'P1' ? '#f59e0b' : '#10b981'}" stroke-width="${activeEdge && activeEdge[0] === 'P2' && activeEdge[1] === 'P1' ? '3' : '2'}" marker-end="url(#arrow-green)" />

          <!-- P_i -> u_i 下垂透传边 -->
          <line x1="40" y1="60" x2="40" y2="150" stroke="${activeEdge && activeEdge[0] === 'P1' && activeEdge[1] === '1' ? '#f59e0b' : '#38bdf8'}" stroke-width="${activeEdge && activeEdge[0] === 'P1' && activeEdge[1] === '1' ? '2.5' : '1.5'}" marker-end="url(#arrow-blue)" />
          <line x1="100" y1="60" x2="100" y2="150" stroke="${activeEdge && activeEdge[0] === 'P2' && activeEdge[1] === '2' ? '#f59e0b' : '#38bdf8'}" stroke-width="${activeEdge && activeEdge[0] === 'P2' && activeEdge[1] === '2' ? '2.5' : '1.5'}" marker-end="url(#arrow-blue)" />
          <line x1="160" y1="60" x2="160" y2="150" stroke="${activeEdge && activeEdge[0] === 'P3' && activeEdge[1] === '3' ? '#f59e0b' : '#38bdf8'}" stroke-width="${activeEdge && activeEdge[0] === 'P3' && activeEdge[1] === '3' ? '2.5' : '1.5'}" marker-end="url(#arrow-blue)" />
          <line x1="220" y1="60" x2="220" y2="150" stroke="${activeEdge && activeEdge[0] === 'P4' && activeEdge[1] === '4' ? '#f59e0b' : '#38bdf8'}" stroke-width="${activeEdge && activeEdge[0] === 'P4' && activeEdge[1] === '4' ? '2.5' : '1.5'}" marker-end="url(#arrow-blue)" />
          <line x1="280" y1="60" x2="280" y2="150" stroke="${activeEdge && activeEdge[0] === 'P5' && activeEdge[1] === '5' ? '#f59e0b' : '#38bdf8'}" stroke-width="${activeEdge && activeEdge[0] === 'P5' && activeEdge[1] === '5' ? '2.5' : '1.5'}" marker-end="url(#arrow-blue)" />

          <!-- 外部查询节点与 O(1) 连边 -->
          ${
            isS1Active || (step.numEdges >= 10 && isPrefix)
              ? `
            <line x1="220" y1="12" x2="220" y2="60" stroke="#ec4899" stroke-width="2.5" marker-end="url(#arrow-pink)" />
            <g><circle cx="220" cy="12" r="10" fill="#db2777" /><text x="220" y="15.5" fill="#fff" font-size="8" font-weight="bold" text-anchor="middle">S1</text></g>
          `
              : ''
          }
          ${
            isS2Active || (step.numEdges >= 11 && isPrefix)
              ? `
            <line x1="100" y1="12" x2="100" y2="60" stroke="#ec4899" stroke-width="2.5" marker-end="url(#arrow-pink)" />
            <g><circle cx="100" cy="12" r="10" fill="#db2777" /><text x="100" y="15.5" fill="#fff" font-size="8" font-weight="bold" text-anchor="middle">S2</text></g>
          `
              : ''
          }

          <!-- 前缀虚点 P1..P5 -->
          <g><circle cx="40" cy="60" r="12" fill="${activeNode === 'P1' ? '#ef4444' : '#f59e0b'}" stroke="#fbbf24" stroke-width="1.5" /><text x="40" y="63.5" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">P1</text></g>
          <g><circle cx="100" cy="60" r="12" fill="${activeNode === 'P2' ? '#ef4444' : '#f59e0b'}" stroke="#fbbf24" stroke-width="1.5" /><text x="100" y="63.5" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">P2</text></g>
          <g><circle cx="160" cy="60" r="12" fill="${activeNode === 'P3' ? '#ef4444' : '#f59e0b'}" stroke="#fbbf24" stroke-width="1.5" /><text x="160" y="63.5" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">P3</text></g>
          <g><circle cx="220" cy="60" r="12" fill="${activeNode === 'P4' ? '#ef4444' : '#f59e0b'}" stroke="#fbbf24" stroke-width="1.5" /><text x="220" y="63.5" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">P4</text></g>
          <g><circle cx="280" cy="60" r="12" fill="${activeNode === 'P5' ? '#ef4444' : '#f59e0b'}" stroke="#fbbf24" stroke-width="1.5" /><text x="280" y="63.5" fill="#ffffff" font-size="9" font-weight="800" text-anchor="middle">P5</text></g>
        `
            : `
          <!-- 朴素两两全连接连线 -->
          <line x1="100" y1="150" x2="40" y2="150" stroke="#ef4444" stroke-width="1.5" marker-end="url(#arrow-blue)" />
          <line x1="160" y1="150" x2="40" y2="150" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,3" />
          <line x1="160" y1="150" x2="100" y2="150" stroke="#ef4444" stroke-width="1.5" marker-end="url(#arrow-blue)" />
          <line x1="220" y1="150" x2="40" y2="150" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,3" />
          <line x1="220" y1="150" x2="100" y2="150" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,3" />
          <line x1="220" y1="150" x2="160" y2="150" stroke="#ef4444" stroke-width="1.5" marker-end="url(#arrow-blue)" />
          <line x1="280" y1="150" x2="40" y2="150" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,3" />
          <line x1="280" y1="150" x2="100" y2="150" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,3" />
          <line x1="280" y1="150" x2="160" y2="150" stroke="#ef4444" stroke-width="1" stroke-dasharray="3,3" />
          <line x1="280" y1="150" x2="220" y2="150" stroke="#ef4444" stroke-width="1.5" marker-end="url(#arrow-blue)" />

          <!-- 外部直连查询 S1/S2 -->
          ${
            step.numEdges >= 11
              ? `
            <line x1="160" y1="20" x2="40" y2="150" stroke="#db2777" stroke-width="1.5" />
            <line x1="160" y1="20" x2="100" y2="150" stroke="#db2777" stroke-width="1.5" />
            <line x1="160" y1="20" x2="160" y2="150" stroke="#db2777" stroke-width="1.5" />
            <line x1="160" y1="20" x2="220" y2="150" stroke="#db2777" stroke-width="1.5" />
            <g><circle cx="160" cy="20" r="11" fill="#db2777" /><text x="160" y="24" fill="#fff" font-size="9" font-weight="bold" text-anchor="middle">S1</text></g>
          `
              : ''
          }
        `
        }

        <!-- 下方实体节点 1..5 -->
        <g><circle cx="40" cy="150" r="13" fill="${activeNode === 1 || activeNode === '1' ? '#38bdf8' : '#0284c7'}" stroke="#38bdf8" stroke-width="1.5" /><text x="40" y="154" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">1</text></g>
        <g><circle cx="100" cy="150" r="13" fill="${activeNode === 2 || activeNode === '2' ? '#38bdf8' : '#0284c7'}" stroke="#38bdf8" stroke-width="1.5" /><text x="100" y="154" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">2</text></g>
        <g><circle cx="160" cy="150" r="13" fill="${activeNode === 3 || activeNode === '3' ? '#38bdf8' : '#0284c7'}" stroke="#38bdf8" stroke-width="1.5" /><text x="160" y="154" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">3</text></g>
        <g><circle cx="220" cy="150" r="13" fill="${activeNode === 4 || activeNode === '4' ? '#38bdf8' : '#0284c7'}" stroke="#38bdf8" stroke-width="1.5" /><text x="220" y="154" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">4</text></g>
        <g><circle cx="280" cy="150" r="13" fill="${activeNode === 5 || activeNode === '5' ? '#38bdf8' : '#0284c7'}" stroke="#38bdf8" stroke-width="1.5" /><text x="280" y="154" fill="#ffffff" font-size="10" font-weight="800" text-anchor="middle">5</text></g>
      </svg>
      <div style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 4px;">
        ${
          isPrefix
            ? '⭐ 前缀虚点链 <span style="color:#f59e0b;font-weight:600;">P_i ➔ P_{i-1}</span> 级联传递，连向 P_r 等价于连向 [1, r] 内所有实体节点 (O(1) 连边)'
            : '❌ 朴素两两连边：每向区间 [1..r] 连边就新增 r 条边，边数呈 O(N^2) 剧增，极易触发 MLE/TLE'
        }
      </div>
    </div>
  `;

  // 动态同步 Card 2 监视器与顶部指标
  const root =
    container.closest('#algo-prefix-opt-graph-view') ||
    container.closest('.algorithm-layout-container') ||
    container.parentElement;

  if (root) {
    const modeEl = root.querySelector('#metric-opt-mode');
    const edgeEl = root.querySelector('#metric-edge-count');
    const opEl = root.querySelector('#metric-cur-op');
    const compEl = root.querySelector('#metric-compression-ratio');

    if (modeEl) modeEl.textContent = step.metrics?.['metric-opt-mode']?.toString() || (isPrefix ? '前缀优化建图' : '朴素稠密建图');
    if (edgeEl) edgeEl.textContent = step.metrics?.['metric-edge-count']?.toString() || `${step.numEdges} 条边`;
    if (opEl) opEl.textContent = step.metrics?.['metric-cur-op']?.toString() || (step.activeNode ? `处理节点 ${step.activeNode}` : '—');
    if (compEl) compEl.textContent = step.metrics?.['metric-compression-ratio']?.toString() || (isPrefix ? 'O(N) 线性压缩' : 'O(N^2) 稠密无压缩');

    const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
    if (customMetricsContainer) {
      const nodeIndices = [1, 2, 3, 4, 5];
      const pSlots = nodeIndices
        .map((i) => {
          const pId = isPrefix ? `P${i}` : `—`;
          const isActive = step.activeNode === `P${i}` || step.activeNode === i;
          const bg = isActive ? 'rgba(245, 158, 11, 0.25)' : 'rgba(30, 41, 59, 0.7)';
          const textCol = isActive ? '#fbbf24' : '#cbd5e1';
          const border = isActive ? '2px solid #f59e0b' : '1px solid rgba(255, 255, 255, 0.1)';

          return `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 32px; height: 30px; background: ${bg}; border: ${border}; border-radius: 6px; color: ${textCol}; font-family: monospace; font-size: 10px; font-weight: 700;">
            <span style="font-size: 8px; color: #64748b; line-height: 1;">u[${i}]</span>
            <span style="line-height: 1.1;">${pId}</span>
          </div>`;
        })
        .join('');

      customMetricsContainer.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px; font-size: 11px; padding: 4px 0;">
          <div style="display: flex; flex-direction: column; gap: 6px; background: rgba(30, 41, 59, 0.7); padding: 8px 10px; border-radius: 8px; border: 1px solid rgba(59, 130, 246, 0.2);">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-family: monospace; font-size: 11px; font-weight: 700; width: 105px; color: #38bdf8;">前缀虚点链 P:</span>
              <div style="display: flex; gap: 6px;">${pSlots}</div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px; border-top: 1px dashed rgba(255, 255, 255, 0.1); padding-top: 6px;">
              <span style="color: #94a3b8; font-size: 10px; font-weight: 600;">建图模式 / 边总数:</span>
              <strong style="color: #facc15; font-family: monospace; font-size: 11px;">${isPrefix ? `前缀优化: ${step.numEdges} 条边 (O(N) 线性)` : `朴素直连: ${step.numEdges} 条边 (O(N²) 爆炸)`}</strong>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 6px; padding: 6px 10px;">
            <span style="color: #64748b; font-size: 10.5px;">执行语句:</span>
            <strong style="color: #38bdf8; font-family: monospace; font-size: 11px;">行 ${Array.isArray(step.codeLine) ? step.codeLine.join('-') : step.codeLine}: ${step.log}</strong>
          </div>
        </div>
      `;
    }
  }
}
