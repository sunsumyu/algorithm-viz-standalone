/**
 * 通用背包交互沙盘与载荷舱渲染器深模块 (KnapsackSandboxStage)
 * 深度设计原则：小接口 + 丰富内部视觉 (Small Interface, Deep Visual)
 * 
 * 职责：
 * 1. 统一渲染分组/单品货架池与多维度动态决策状态徽章
 * 2. 统一渲染 ⚖️ 实时互斥/转移决策对比擂台 (Live Decision Arena，消除死黑虚空)
 * 3. 统一渲染 🎒 实时背包载荷舱 (高对比度文字、容量占用进度条、已选装商品标签流)
 * 4. 统一渲染 📊 滚动状态向量 dp[0..M] 实时监控矩阵与来源追踪 (j 与 j-cost 双高亮)
 */

import { KnapsackExecutionStep, KnapsackItem } from '../knapsack-execution-engine';

export interface KnapsackSandboxConfig {
  title?: string;
  groupLabelPrefix?: string;
  itemUnitLabel?: string;
  isPartitioned?: boolean;
}

/**
 * 渲染上层货架陈列、决策擂台与背包载荷舱
 */
export function renderKnapsackSandbox(
  container: HTMLElement,
  step: KnapsackExecutionStep,
  config: KnapsackSandboxConfig = {}
): void {
  const isPartitioned = config.isPartitioned ?? ((step.groupIndex ?? -1) >= 0);
  const selected = step.selectedItems || [];
  const usedCap = selected.reduce((sum, it) => sum + it.cost, 0);
  const totalVal = selected.reduce((sum, it) => sum + it.val, 0);
  const capMax = step.dp.length > 0 ? step.dp.length - 1 : 45;
  const ratio = Math.min(100, Math.round((usedCap / (capMax || 1)) * 100));

  let shelvesHtml = '';

  if (isPartitioned) {
    // 渲染互斥分组货架
    const groupMap: Record<number, KnapsackItem[]> = {};
    step.items.forEach((it) => {
      const g = it.group ?? 1;
      if (!groupMap[g]) groupMap[g] = [];
      groupMap[g].push(it);
    });

    shelvesHtml = Object.entries(groupMap)
      .map(([gIdStr, list]) => {
        const gId = parseInt(gIdStr, 10);
        const isCurGroup = step.groupIndex === gId;
        const bg = isCurGroup ? '#eef2ff' : '#f8fafc';
        const border = isCurGroup ? '#6366f1' : '#e2e8f0';

        const itemsBadges = list
          .map((it, idx) => renderItemCard(it, idx, step, selected))
          .join('');

        return `
          <div style="background:${bg}; border:2px solid ${border}; border-radius:8px; padding:10px 12px; min-width:175px; flex:1; max-width:280px; box-sizing:border-box;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <span style="font-size:12px; font-weight:800; color:#334155;">第 ${gId} 组 (互斥)</span>
              ${isCurGroup ? '<span style="background:#f59e0b; color:#ffffff; font-size:9.5px; font-weight:800; padding:1.5px 6px; border-radius:10px;">正在决策</span>' : '<span style="color:#94a3b8; font-size:9.5px;">互斥至多选1</span>'}
            </div>
            <div style="display:flex; flex-direction:column; gap:6px;">
              ${itemsBadges}
            </div>
          </div>
        `;
      })
      .join('');
  } else {
    // 渲染平铺物品货架 (01 背包 / 完全背包)
    const itemsBadges = step.items
      .map((it, idx) => renderItemCard(it, idx, step, selected))
      .join('');

    shelvesHtml = `
      <div style="display:flex; flex-wrap:wrap; gap:10px; justify-content:center; width:100%;">
        ${itemsBadges}
      </div>
    `;
  }

  // ⚖️ 构建动态决策对比擂台 (Live Decision Arena)
  let decisionArenaHtml = '';
  if (step.evalInfo && step.j >= 0) {
    const { fits, improved, candidateVal, prevVal, item } = step.evalInfo;
    const curCost = item?.cost ?? 0;
    const curVal = item?.val ?? 0;
    const diff = fits && candidateVal !== undefined && prevVal !== undefined ? candidateVal - prevVal : 0;

    let decisionBadge = '';
    if (!fits) {
      decisionBadge = `<span style="background:#fef2f2; color:#dc2626; border:1px solid #fca5a5; font-size:10px; font-weight:800; padding:2px 8px; border-radius:4px;">❌ 容量不足超重</span>`;
    } else if (improved) {
      decisionBadge = `<span style="background:#f0fdf4; color:#15803d; border:1px solid #86efac; font-size:10px; font-weight:800; padding:2px 8px; border-radius:4px;">✨ 收益提升 (+${diff})</span>`;
    } else {
      decisionBadge = `<span style="background:#fefce8; color:#ca8a04; border:1px solid #fde047; font-size:10px; font-weight:800; padding:2px 8px; border-radius:4px;">⏸ 收益未提升，保持原案</span>`;
    }

    decisionArenaHtml = `
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:8px; box-shadow:0 1px 3px rgba(0,0,0,0.05);">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:12px; font-weight:800; color:#1e293b; display:flex; align-items:center; gap:6px;">
            <span>⚖️</span> 决策对比擂台 (当前容量 j = <b style="color:#0284c7;">${step.j}</b>)
          </span>
          ${decisionBadge}
        </div>

        <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
          <!-- 方案 A: 保持历史原最优 -->
          <div style="background:#f8fafc; border:1px solid ${!improved && fits ? '#10b981' : '#e2e8f0'}; border-radius:6px; padding:8px 10px;">
            <div style="font-size:11px; color:#64748b; font-weight:600; margin-bottom:4px;">方案 A: 保持历史收益状态</div>
            <div style="display:flex; justify-content:space-between; align-items:baseline;">
              <span style="font-size:10.5px; color:#475569; font-family:monospace;">原 dp[${step.j}]</span>
              <span style="font-size:15px; font-weight:800; color:#0284c7; font-family:monospace;">${prevVal ?? 0}</span>
            </div>
            <div style="font-size:10px; color:#94a3b8; margin-top:2px;">不选用当前物品或既有更优解</div>
          </div>

          <!-- 方案 B: 选装当前物品 -->
          <div style="background:#f8fafc; border:1px solid ${improved ? '#10b981' : '#e2e8f0'}; border-radius:6px; padding:8px 10px;">
            <div style="font-size:11px; color:#64748b; font-weight:600; margin-bottom:4px;">方案 B: 尝试选装当前物品 (需空间 ${curCost})</div>
            <div style="display:flex; justify-content:space-between; align-items:baseline;">
              <span style="font-size:10.5px; color:#475569; font-family:monospace;">dp[${step.j} - ${curCost}] + ${curVal}</span>
              <span style="font-size:15px; font-weight:800; color:${fits ? (improved ? '#16a34a' : '#d97706') : '#dc2626'}; font-family:monospace;">
                ${fits ? (candidateVal ?? '—') : '超重放弃'}
              </span>
            </div>
            <div style="font-size:10px; color:${fits ? '#15803d' : '#dc2626'}; margin-top:2px;">
              ${fits ? `剩余空间 ${step.j - curCost}，新贡献价值 +${curVal}` : `容量不足: 当前 j=${step.j} < 所需 ${curCost} (缺 ${curCost - step.j})`}
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    // 待命状态 / 规则指引舱
    decisionArenaHtml = `
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:6px;">
        <div style="font-size:12px; font-weight:800; color:#1e293b; display:flex; align-items:center; gap:6px;">
          <span>🧭</span> ${isPartitioned ? '分组背包核心互斥决策准则' : '背包动态规划决策准则'}
        </div>
        <div style="font-size:11px; color:#475569; line-height:1.6;">
          ${
            isPartitioned
              ? '每组至多选 1 件。外层倒序枚举容量 <code style="color:#0284c7; background:#e0f2fe; padding:1px 4px; border-radius:3px;">j = M..0</code>，内层遍历组内各备选商品，通过“容量倒序优先于组内遍历”在逻辑上天然防止同一组商品在同一容量下被重复多选。'
              : '一维滚动数组空间压缩：利用外层枚举与内层容量转移，实时比对“不选（继承原值）”与“装入（前置状态+价值）”的最大收益。'
          }
        </div>
      </div>
    `;
  }

  // 背包已装入物品列表
  const selectedListHtml = selected.length > 0
    ? selected.map((it, idx) => `
        <div style="background:#dcfce7; border:1px solid #86efac; border-radius:4px; padding:3px 8px; font-size:10.5px; display:inline-flex; align-items:center; gap:6px;">
          <span style="color:#166534; font-weight:700;">${it.group != null ? `第${it.group}组` : `#${idx + 1}`}</span>
          <span style="color:#475569;">消耗:${it.cost}</span>
          <span style="color:#15803d; font-weight:800;">收益:+${it.val}</span>
        </div>
      `).join('')
    : `<span style="color:#94a3b8; font-size:11px;">(背包当前容量待装入，等待更优商品决策装入...)</span>`;

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:10px; width:100%; min-height:100%; justify-content:flex-start; align-items:stretch; background:transparent; box-sizing:border-box; overflow-y:auto;">
      <!-- 顶部标题与当前决策容量提示 -->
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:8px;">
        <div style="font-size:12px; color:#1e293b; font-weight:700;">${config.title || '🗂️ 物品陈列与动态选择沙盘'}</div>
        <div style="font-size:11px; color:#0284c7; background:#e0f2fe; padding:2px 8px; border-radius:9999px; border:1px solid #bae6fd; font-weight:600;">
          当前考察容量: <b>${step.j >= 0 ? step.j : '—'}</b> / <span>${capMax}</span>
        </div>
      </div>

      <!-- 货架陈列 -->
      <div style="display:flex; flex-wrap:wrap; gap:12px; justify-content:center; align-items:flex-start;">
        ${shelvesHtml}
      </div>

      <!-- ⚖️ 实时互斥决策试算擂台 (消除空白死黑虚空) -->
      ${decisionArenaHtml}

      <!-- 底部实时背包货舱装载监视器 -->
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:10px 14px; display:flex; flex-direction:column; gap:8px;">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span style="font-size:11.5px; font-weight:800; color:#1e293b;">🎒 实时背包载荷舱</span>
          <div style="display:flex; gap:16px; font-size:11px;">
            <span style="color:#475569;">总占用容量: <b style="color:#0284c7;">${usedCap}</b> / <span style="color:#94a3b8;">${capMax}</span></span>
            <span style="color:#475569;">背包累计收益: <b style="color:#16a34a;">${totalVal}</b></span>
          </div>
        </div>

        <!-- 容量进度条 -->
        <div style="width:100%; height:8px; background:#e2e8f0; border-radius:4px; overflow:hidden;">
          <div style="width:${ratio}%; height:100%; background:linear-gradient(90deg, #3b82f6, #10b981); transition:width 0.25s ease;"></div>
        </div>

        <!-- 已选装物品标签流 -->
        <div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center;">
          <span style="color:#64748b; font-size:10.5px; min-width:60px;">已装入物品:</span>
          ${selectedListHtml}
        </div>
      </div>
    </div>
  `;
}

function renderItemCard(
  it: KnapsackItem,
  idx: number,
  step: KnapsackExecutionStep,
  selected: KnapsackItem[]
): string {
  const isSelected = selected.some(
    (s) => s.group === it.group && s.cost === it.cost && s.val === it.val
  );
  const isCurItem =
    step.itemIndex !== undefined &&
    step.itemIndex >= 0 &&
    step.items[step.itemIndex]?.group === it.group &&
    step.items[step.itemIndex]?.cost === it.cost &&
    step.items[step.itemIndex]?.val === it.val;

  let badgeHtml = '';
  let cardBg = '#ffffff';
  let cardBorder = '#e2e8f0';

  if (isSelected) {
    cardBg = '#f0fdf4';
    cardBorder = '#16a34a';
    badgeHtml = `<span style="background:#16a34a; color:#ffffff; font-size:9.5px; padding:1px 5px; border-radius:3px; font-weight:bold;">✔ 已入选</span>`;
  } else if (isCurItem) {
    cardBg = '#eff6ff';
    cardBorder = '#3b82f6';
    if (step.evalInfo) {
      if (!step.evalInfo.fits) {
        badgeHtml = `<span style="background:#dc2626; color:#ffffff; font-size:9.5px; padding:1px 5px; border-radius:3px; font-weight:bold;">❌ 超重无法装入</span>`;
      } else if (step.evalInfo.improved) {
        badgeHtml = `<span style="background:#16a34a; color:#ffffff; font-size:9.5px; padding:1px 5px; border-radius:3px; font-weight:bold;">✨ 收益更优 (+${it.val})</span>`;
      } else {
        badgeHtml = `<span style="background:#ca8a04; color:#ffffff; font-size:9.5px; padding:1px 5px; border-radius:3px; font-weight:bold;">⏸ 试算无提升</span>`;
      }
    } else {
      badgeHtml = `<span style="background:#2563eb; color:#ffffff; font-size:9.5px; padding:1px 5px; border-radius:3px; font-weight:bold;">🔍 考察中</span>`;
    }
  } else {
    badgeHtml = `<span style="color:#94a3b8; font-size:9.5px;">⚪ 候选待选</span>`;
  }

  return `
    <div style="background:${cardBg}; border:1.5px solid ${cardBorder}; border-radius:6px; padding:6px 10px; font-size:11px; display:flex; flex-direction:column; gap:3px; transition:all 0.2s ease;">
      <div style="display:flex; justify-content:space-between; align-items:center; gap:8px;">
        <span style="color:#475569; font-weight:700;">#${idx + 1}</span>
        ${badgeHtml}
      </div>
      <div style="display:flex; justify-content:space-between; gap:10px; margin-top:2px;">
        <span style="color:#64748b;">消耗: <b style="color:#0284c7;">${it.cost}</b></span>
        <span style="color:#64748b;">价值: <b style="color:#16a34a;">${it.val}</b></span>
        <span style="color:#94a3b8; font-size:9.5px;">v/c: ${(it.val / Math.max(1, it.cost)).toFixed(1)}</span>
      </div>
    </div>
  `;
}

/**
 * 渲染下层滚动收益向量 dp[0..M] 及其转移追踪
 */
export function renderKnapsackDpMatrix(
  container: HTMLElement,
  step: KnapsackExecutionStep,
  title: string = '滚动状态向量 dp[0..M]'
): void {
  const len = step.dp.length;
  const cost = step.evalInfo?.item?.cost ?? -1;
  const targetPrevJ = step.j >= 0 && cost >= 0 && step.j >= cost ? step.j - cost : -1;

  const cells = step.dp.map((val, idx) => {
    const isCur = step.j === idx;
    const isSourcePrev = targetPrevJ === idx;

    let bg = '#ffffff';
    let border = '#e2e8f0';
    let shadow = '0 1px 2px rgba(0,0,0,0.03)';
    let labelExtra = '';
    let valColor = val > 0 ? '#059669' : '#94a3b8';
    let labelColor = '#64748b';

    if (isCur) {
      bg = '#dbeafe';
      border = '#2563eb';
      shadow = '0 2px 6px rgba(37, 99, 235, 0.25)';
      labelExtra = ' 📍j';
      labelColor = '#1e40af';
      valColor = '#1e40af';
    } else if (isSourcePrev) {
      bg = '#fef3c7';
      border = '#f59e0b';
      shadow = '0 2px 6px rgba(245, 158, 11, 0.25)';
      labelExtra = ' ⬅j-c';
      labelColor = '#92400e';
      valColor = '#b45309';
    }

    return `
      <div id="knapsack-dp-cell-${idx}" style="display:inline-flex; flex-direction:column; align-items:center; min-width:36px; padding:4px 6px; margin:2px; background:${bg}; border:1.5px solid ${border}; border-radius:6px; box-shadow:${shadow}; transition:all 0.15s ease;">
        <span style="font-size:8.5px; color:${labelColor}; font-weight:700;">${idx}${labelExtra}</span>
        <span style="font-size:12px; font-weight:800; color:${valColor}; font-family:monospace;">${val}</span>
      </div>
    `;
  });

  const curJ = step.j;
  const isEvaluating = curJ !== undefined && curJ >= 0;

  // 状态转移决策推导与实时数值代入
  let evalHtml = '';
  if (isEvaluating) {
    const curVal = step.dp ? step.dp[curJ] : 0;
    const prevVal = (step.evalInfo && step.evalInfo.prevVal !== undefined) ? step.evalInfo.prevVal : curVal;
    const candVal = (step.evalInfo && step.evalInfo.candidateVal !== undefined) ? step.evalInfo.candidateVal : undefined;
    const improved = step.evalInfo ? step.evalInfo.improved : false;

    evalHtml = `
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:10px 12px; margin-top:6px; display:flex; flex-direction:column; gap:8px; flex:1; min-height:0; box-sizing:border-box; overflow-y:auto;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:6px; flex-shrink:0;">
          <span style="font-size:11.5px; font-weight:800; color:#0f172a;">⚡ 状态转移方程与实时数值代入</span>
          <span style="font-size:10px; color:#64748b; font-family:monospace; background:#ffffff; border:1px solid #e2e8f0; padding:1px 6px; border-radius:4px;">dp[j] = Math.max(dp[j], dp[j - w] + v)</span>
        </div>
        <div style="display:flex; align-items:center; gap:8px; font-size:11.5px; font-family:monospace; background:#ffffff; border:1px solid #e2e8f0; padding:6px 10px; border-radius:6px; flex-shrink:0; box-shadow:0 1px 2px rgba(0,0,0,0.02);">
          <span style="color:#64748b;">考察容量 <b style="color:#0284c7;">j=${curJ}</b>:</span>
          ${candVal !== undefined ? `
            <span style="color:#475569;">保持不选=${prevVal}</span>
            <span style="color:#94a3b8;">vs</span>
            <span style="color:${improved ? '#059669' : '#d97706'}; font-weight:700;">装入试算=${candVal}</span>
            <span style="color:#94a3b8;">➔</span>
            <span style="color:#0284c7; font-weight:800;">决策结果=${curVal}</span>
          ` : `
            <span style="color:#475569;">当前收益 dp[${curJ}] = <b style="color:#059669;">${curVal}</b></span>
          `}
        </div>
        <div style="font-size:11px; color:#334155; line-height:1.5; background:#ffffff; padding:8px 10px; border-radius:6px; border:1px solid #e2e8f0; border-left:3px solid ${improved ? '#10b981' : '#3b82f6'}; flex:1; min-height:0; overflow-y:auto;">
          <div style="font-weight:700; color:${improved ? '#059669' : '#0284c7'}; margin-bottom:4px;">
            ${improved ? '✨ 状态转移成功（发现更优解）' : 'ℹ️ 容量决策分析'}
          </div>
          <div>${step.message || '正在依容量逆序枚举试算收益转移...'}</div>
        </div>
      </div>
    `;
  } else {
    evalHtml = `
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:10px 12px; margin-top:6px; display:flex; flex-direction:column; gap:8px; flex:1; min-height:0; box-sizing:border-box; overflow-y:auto;">
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:6px; flex-shrink:0;">
          <span style="font-size:11.5px; font-weight:800; color:#0f172a;">📐 状态转移机制说明</span>
          <span style="font-size:10px; color:#64748b; font-family:monospace; background:#ffffff; border:1px solid #e2e8f0; padding:1px 6px; border-radius:4px;">dp[j] = Math.max(dp[j], dp[j - w] + v)</span>
        </div>
        <div style="font-size:11px; color:#334155; line-height:1.5; background:#ffffff; padding:8px 10px; border-radius:6px; border:1px solid #e2e8f0; flex:1; min-height:0; overflow-y:auto;">
          ${step.message || '背包初始化就绪：基础边界值已设为 0，等待单步启动。'}
        </div>
        <div style="display:flex; gap:12px; font-size:10.5px; color:#64748b; border-top:1px solid #e2e8f0; padding-top:6px; flex-shrink:0;">
          <span>• 状态维度: <b style="color:#0f172a;">一维收益向量</b></span>
          <span>• 枚举方向: <b style="color:#d97706;">容量逆序倒推 (t ➔ w)</b></span>
          <span>• 核心策略: <b style="color:#059669;">空间压缩无后效性</b></span>
        </div>
      </div>
    `;
  }

  container.innerHTML = `
    <div style="width:100%; height:100%; display:flex; flex-direction:column; padding:2px 0; box-sizing:border-box; flex:1; min-height:0; overflow:hidden;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:5px; flex-shrink:0;">
        <div style="font-size:11.5px; color:#0f172a; font-weight:800;">${title} (${len} 状态)</div>
        <div style="font-size:10px; color:#64748b; display:flex; gap:8px;">
          <span style="display:inline-flex; align-items:center; gap:3px;"><span style="width:7px; height:7px; background:#2563eb; border-radius:2px;"></span>当前决策 j</span>
          <span style="display:inline-flex; align-items:center; gap:3px;"><span style="width:7px; height:7px; background:#f59e0b; border-radius:2px;"></span>转移来源 j-c</span>
          <span style="display:inline-flex; align-items:center; gap:3px;"><span style="width:7px; height:7px; background:#10b981; border-radius:2px;"></span>收益 > 0</span>
        </div>
      </div>
      <div class="knapsack-dp-cells-scroll" style="display:flex; flex-wrap:wrap; align-content:flex-start; gap:3px; background:#f8fafc; padding:6px; border-radius:10px; border:1px solid #e2e8f0; max-height:105px; overflow-y:auto; flex-shrink:0;">
        ${cells.join('')}
      </div>
      <div style="flex:1; min-height:0; display:flex; flex-direction:column;">
        ${evalHtml}
      </div>
    </div>
  `;

  // 确保当前正在决策的格子始终在可视区域内，自适应且不被遮挡
  if (step.j >= 0) {
    const activeCell = container.querySelector(`#knapsack-dp-cell-${step.j}`) as HTMLElement | null;
    if (activeCell && typeof activeCell.scrollIntoView === 'function') {
      activeCell.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'smooth' });
    }
  }
}
