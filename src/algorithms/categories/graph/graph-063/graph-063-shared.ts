/**
 * 左程云 Class 063: 双向广搜与双向搜索（折半搜索）通用视觉呈现组件与沙盘构建器
 */

export interface Graph063StepBase {
  message: string;
  explanation?: string;
  line: number;
  highlightedIndices?: number[];
  metrics?: Record<string, string | number>;
}

/**
 * 渲染双向广搜波前集合沙盘 (Word Ladder 等双向扩散场景)
 */
export function renderBiBfsWavefront(params: {
  smallLevel: string[];
  bigLevel: string[];
  visitedCount: number;
  curWord: string;
  nextLevel: string[];
  meetWord?: string | null;
  status: 'init' | 'forward' | 'backward' | 'meet' | 'done';
}): string {
  const { smallLevel, bigLevel, visitedCount, curWord, nextLevel, meetWord, status } = params;

  const smallBadges = smallLevel.length > 0
    ? smallLevel.map((w) => `<span style="display:inline-block; padding:3px 7px; margin:2px; background:#e0f2fe; color:#0369a1; border-radius:4px; font-weight:700; font-size:11px; border:1px solid #bae6fd;">${w}</span>`).join('')
    : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">(空)</span>';

  const bigBadges = bigLevel.length > 0
    ? bigLevel.map((w) => `<span style="display:inline-block; padding:3px 7px; margin:2px; background:#fce7f3; color:#be185d; border-radius:4px; font-weight:700; font-size:11px; border:1px solid #fbcfe8;">${w}</span>`).join('')
    : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">(空)</span>';

  const nextBadges = nextLevel.length > 0
    ? nextLevel.map((w) => `<span style="display:inline-block; padding:3px 7px; margin:2px; background:#f0fdf4; color:#15803d; border-radius:4px; font-weight:700; font-size:11px; border:1px solid #bbf7d0;">${w}</span>`).join('')
    : '<span style="color:#94a3b8; font-size:11px; font-style:italic;">(待探索)</span>';

  const statusColor = status === 'meet' ? '#10b981' : status === 'done' ? '#64748b' : '#38bdf8';
  const statusText = status === 'meet' ? '🎉 双向军团成功相遇！' : status === 'init' ? '🚀 搜索初始化' : '↔️ 交替推进中';

  return `
    <div style="display:flex; flex-direction:column; gap:10px; padding:12px; background:#ffffff; border-radius:8px; border:1px solid #e2e8f0;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:700; font-size:13px; color:#1e293b;">🌐 双向波前相向状态沙盘</span>
        <span style="font-size:11px; padding:2px 8px; border-radius:12px; background:${statusColor}22; color:${statusColor}; font-weight:700;">${statusText}</span>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:8px;">
          <div style="font-size:11px; font-weight:700; color:#0284c7; margin-bottom:4px; display:flex; justify-content:space-between;">
            <span>🔵 smallLevel (主控波前, ${smallLevel.length} 个)</span>
            <span style="font-size:10px; color:#64748b;">挑选较小集合</span>
          </div>
          <div style="display:flex; flex-wrap:wrap; max-height:80px; overflow-y:auto;">${smallBadges}</div>
        </div>

        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:8px;">
          <div style="font-size:11px; font-weight:700; color:#db2777; margin-bottom:4px; display:flex; justify-content:space-between;">
            <span>🔴 bigLevel (对向目标集, ${bigLevel.length} 个)</span>
            <span style="font-size:10px; color:#64748b;">待接应军团</span>
          </div>
          <div style="display:flex; flex-wrap:wrap; max-height:80px; overflow-y:auto;">${bigBadges}</div>
        </div>
      </div>

      <div style="background:#f1f5f9; border-radius:6px; padding:8px; display:flex; flex-direction:column; gap:6px;">
        <div style="display:flex; justify-content:space-between; font-size:11px;">
          <span>🎯 当前考察单词: <strong style="color:#0f172a; font-family:monospace; font-size:12px;">${curWord || '-'}</strong></span>
          <span>已访问过滤词数: <strong style="color:#475569;">${visitedCount}</strong></span>
        </div>
        <div>
          <span style="font-size:11px; color:#15803d; font-weight:700;">🌱 下一层生成候选 nextLevel (${nextLevel.length} 个):</span>
          <div style="display:flex; flex-wrap:wrap; margin-top:2px;">${nextBadges}</div>
        </div>
        ${meetWord ? `<div style="background:#ecfdf5; border:1px solid #a7f3d0; padding:6px 10px; border-radius:4px; color:#065f46; font-size:11.5px; font-weight:700;">🤝 碰撞汇合词: <span style="font-family:monospace; font-size:13px; color:#047857;">${meetWord}</span>，成功打通双端最短路！</div>` : ''}
      </div>
    </div>
  `;
}

/**
 * 渲染折半搜索双向累加和对比沙盘 (Meet in the Middle: 左数组 lsum 与 右数组 rsum)
 */
export function renderMeetInTheMiddleArrayView(params: {
  lsum: number[];
  rsum: number[];
  activeLeftIdx?: number;
  activeRightIdx?: number;
  curLeftVal?: number;
  curRightVal?: number;
  targetOrGoal: number;
  currentAns?: number | string;
  modeTitle: string;
}): string {
  const { lsum, rsum, activeLeftIdx, activeRightIdx, curLeftVal, curRightVal, targetOrGoal, currentAns, modeTitle } = params;

  // 截取最多 12 个元素展示，避免大集合撑爆 DOM
  const renderSlots = (arr: number[], activeIdx?: number, color: string = '#0284c7') => {
    if (arr.length === 0) return '<span style="color:#94a3b8; font-size:11px; font-style:italic;">(空)</span>';
    const limit = 10;
    const items = arr.slice(0, limit).map((val, idx) => {
      const isActive = idx === activeIdx;
      return `
        <div style="
          padding: 3px 6px;
          min-width: 32px;
          text-align: center;
          border-radius: 4px;
          font-family: monospace;
          font-size: 11px;
          font-weight: 700;
          background: ${isActive ? color : '#f1f5f9'};
          color: ${isActive ? '#ffffff' : '#334155'};
          border: 1px solid ${isActive ? color : '#cbd5e1'};
          box-shadow: ${isActive ? '0 0 6px ' + color + '66' : 'none'};
        ">${val}</div>
      `;
    });
    if (arr.length > limit) {
      items.push(`<div style="padding:3px; color:#94a3b8; font-size:10px;">+${arr.length - limit}项</div>`);
    }
    return items.join('');
  };

  return `
    <div style="display:flex; flex-direction:column; gap:10px; padding:12px; background:#ffffff; border-radius:8px; border:1px solid #e2e8f0;">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <span style="font-weight:700; font-size:13px; color:#1e293b;">⚖️ ${modeTitle} (Meet in the Middle)</span>
        <span style="font-size:11px; padding:2px 8px; border-radius:4px; background:#f8fafc; border:1px solid #e2e8f0; color:#475569;">
          目标基准: <strong style="color:#0f172a;">${targetOrGoal}</strong>
        </span>
      </div>

      <div style="display:flex; flex-direction:column; gap:8px;">
        <!-- 左侧折半集合 -->
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:8px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; color:#0284c7; margin-bottom:4px;">
            <span>左半部子序列和集合 lsum (共 ${lsum.length} 种)</span>
            ${curLeftVal !== undefined ? `<span>选中: <strong style="font-family:monospace; font-size:12px;">${curLeftVal}</strong></span>` : ''}
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:4px; align-items:center;">
            ${renderSlots(lsum, activeLeftIdx, '#0284c7')}
          </div>
        </div>

        <!-- 右侧折半集合 -->
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:8px;">
          <div style="display:flex; justify-content:space-between; font-size:11px; font-weight:700; color:#7c3aed; margin-bottom:4px;">
            <span>右半部升序集合 rsum (共 ${rsum.length} 种)</span>
            ${curRightVal !== undefined ? `<span>对位: <strong style="font-family:monospace; font-size:12px;">${curRightVal}</strong></span>` : ''}
          </div>
          <div style="display:flex; flex-wrap:wrap; gap:4px; align-items:center;">
            ${renderSlots(rsum, activeRightIdx, '#7c3aed')}
          </div>
        </div>
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; background:#ecfdf5; border:1px solid #a7f3d0; padding:8px 12px; border-radius:6px;">
        <span style="font-size:11.5px; font-weight:700; color:#065f46;">🎯 当前累计全局最优答案:</span>
        <strong style="font-size:15px; font-family:monospace; color:#047857;">${currentAns ?? '-'}</strong>
      </div>
    </div>
  `;
}
