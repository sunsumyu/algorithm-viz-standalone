/**
 * 背包族通用阶段演化渲染卡片 (SpecialStageCards)
 *
 * 从 knapsack-special-stage-evolution.ts 拆分出的纯渲染组件层：
 * 步骤生成（stage-evolution）与渲染卡片（本模块）职责分离。
 * 全部函数采用命名选项对象 (opts) 签名。
 */

import { GridVisualAdapter, type GridRenderOptions } from './grid-visual-adapter';

// ==========================================
// 1. 递归阶段 Card 1: 运行时调用栈
// ==========================================

export interface SpecialRecursionCard1Options {
  title: string;
  callStack: Array<{ label: string }>;
  customInfoHtml: string;
}

export function renderSpecialRecursionCard1(
  container: HTMLElement,
  opts: SpecialRecursionCard1Options
): void {
  const { title, callStack, customInfoHtml } = opts;
  const stackHtml = callStack
    .map((frame, idx) => {
      const isTop = idx === callStack.length - 1;
      return `
        <div style="background:${isTop ? '#eff6ff' : '#f8fafc'}; border:1px solid ${isTop ? '#93c5fd' : '#e2e8f0'}; border-radius:8px; padding:6px 12px; display:flex; justify-content:space-between; align-items:center; transition:all 0.15s ease;">
          <span style="font-family:'JetBrains Mono', monospace; font-size:11.5px; color:${isTop ? '#1d4ed8' : '#334155'}; font-weight:${isTop ? '800' : '600'};">
            #${idx} ${frame.label}
          </span>
          <span style="font-size:10.5px; font-weight:600; color:${isTop ? '#2563eb' : '#94a3b8'}; background:${isTop ? '#dbeafe' : 'transparent'}; padding:${isTop ? '2px 6px' : '0'}; border-radius:4px;">
            ${isTop ? '⚡ 当前执行帧' : '等待返回'}
          </span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:8px; height:100%; width:100%; box-sizing:border-box;">
      ${customInfoHtml}
      <div style="flex:1; min-height:0; display:flex; flex-direction:column; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:10px 12px; box-shadow:0 1px 2px rgba(0,0,0,0.03); overflow:hidden;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; flex-shrink:0;">
          <span style="font-size:12px; font-weight:700; color:#0f172a;">📚 运行时调用栈 (${title})</span>
          <span style="font-size:11px; font-weight:600; color:#64748b; background:#f1f5f9; padding:2px 8px; border-radius:9999px;">深度: ${callStack.length} 层</span>
        </div>
        <div style="flex:1; min-height:0; overflow-y:auto; display:flex; flex-direction:column-reverse; gap:5px; padding-right:4px;">
          ${stackHtml || '<div style="color:#94a3b8; font-size:11px; text-align:center; padding:20px 0;">栈为空</div>'}
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// 2. 记忆化阶段 Card 1: 缓存状态与决策说明
// ==========================================

export interface SpecialMemoCard1Options {
  stateStr: string;
  cacheHit: boolean;
  decision?: string;
  message?: string;
  hitCount?: number;
  missCount?: number;
}

export function renderSpecialMemoCard1(
  container: HTMLElement,
  opts: SpecialMemoCard1Options
): void {
  const { stateStr, cacheHit } = opts;
  const decision = opts.decision ?? '';
  const message = opts.message ?? '';
  const hitCount = opts.hitCount ?? 0;
  const missCount = opts.missCount ?? 0;

  const totalChecks = hitCount + missCount;
  const hitRate = totalChecks > 0 ? ((hitCount / totalChecks) * 100).toFixed(0) : '0';

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:8px; height:100%; width:100%; box-sizing:border-box;">
      <div style="background:#ffffff; border:1px solid ${
        cacheHit ? '#86efac' : '#e2e8f0'
      }; border-radius:12px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
        <div>
          <div style="font-size:11px; color:#64748b; font-weight:600; margin-bottom:2px;">当前探查状态</div>
          <div style="font-family:'JetBrains Mono', monospace; font-size:15px; font-weight:800; color:#0f172a;">
            ${stateStr}
          </div>
        </div>
        <div style="padding:5px 12px; border-radius:8px; font-size:12px; font-weight:700; ${
          cacheHit
            ? 'background:#f0fdf4; color:#16a34a; border:1px solid #bbf7d0;'
            : 'background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe;'
        }">
          ${cacheHit ? '⚡ CACHE HIT (直接剪枝)' : '💨 CACHE MISS (递归求解)'}
        </div>
      </div>

      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:4px; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
        <div style="font-size:11px; color:#64748b; font-weight:700;">决策说明</div>
        <div style="font-size:13px; font-weight:700; color:#0f172a;">${decision}</div>
        <div style="font-size:11.5px; color:#475569; line-height:1.5;">${message}</div>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-top:auto;">
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:10px; text-align:center;">
          <div style="font-size:11px; color:#64748b; font-weight:600;">缓存命中</div>
          <div style="font-size:18px; font-weight:800; color:#16a34a; margin-top:2px;">${hitCount}</div>
        </div>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:10px; text-align:center;">
          <div style="font-size:11px; color:#64748b; font-weight:600;">实际求解</div>
          <div style="font-size:18px; font-weight:800; color:#2563eb; margin-top:2px;">${missCount}</div>
        </div>
        <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:10px; padding:10px; text-align:center;">
          <div style="font-size:11px; color:#64748b; font-weight:600;">剪枝率</div>
          <div style="font-size:18px; font-weight:800; color:#d97706; margin-top:2px;">
            ${hitRate}%
          </div>
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// 3. 记忆化阶段 Card 2: 备忘录缓存热力表
// ==========================================

export interface SpecialMemoCard2Options {
  title: string;
  memo: number[][];
  curI: number;
  curJ: number;
  isHit?: boolean;
}

export function renderSpecialMemoCard2(
  container: HTMLElement,
  opts: SpecialMemoCard2Options
): void {
  const { title, memo, curI, curJ } = opts;
  const rows = memo?.length || 0;
  const cols = memo?.[0]?.length || 0;

  const rowLabels = memo?.map((_, i) => `#${i + 1}`) || [];
  const colLabels = Array.from({ length: cols }, (_, j) => `${j}`);

  const stepData = {
    i: curI,
    j: curJ,
    grid: memo?.map((row) => row.map((v) => (v === -1 ? null : v))) || [],
    type: opts.isHit ? '缓存命中' : '未命中试算',
    msg: `${title} [${curI}, ${curJ}]`,
  };

  const renderOpts: GridRenderOptions = {
    m: rows,
    n: cols,
    isReverse: false,
    isGridProblem: false,
    modelId: 'knapsack-special-memo',
    rowLabels,
    colLabels,
  };

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; height:100%; width:100%; box-sizing:border-box;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; flex-shrink:0;">
        <span style="font-size:12px; font-weight:700; color:#0f172a;">🎯 ${title}</span>
        <span style="font-size:11px; color:#64748b;">· = 未探查, 数值 = 缓存结果</span>
      </div>
      <div class="special-memo-grid-wrapper" style="flex:1; min-height:0; overflow:auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:6px; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
      </div>
    </div>
  `;

  const wrapper = container.querySelector('.special-memo-grid-wrapper') as HTMLElement | null;
  if (wrapper) {
    GridVisualAdapter.renderGrid(wrapper, stepData, renderOpts);
  }
}

// ==========================================
// 4. 二维 DP 阶段 Card 1: 当前递推单元格与依赖来源
// ==========================================

export interface Special2DCard1Options {
  cellName: string;
  cellValStr: string;
  depCells: Array<{ label: string; val: number }>;
  decision: string;
  message: string;
}

export function renderSpecial2DCard1(
  container: HTMLElement,
  opts: Special2DCard1Options
): void {
  const { cellName, cellValStr, depCells, decision, message } = opts;
  const depsHtml =
    depCells.length === 0
      ? '<div style="color:#94a3b8; font-size:11px;">无前驱依赖（基底直接赋值）</div>'
      : depCells
          .map(
            (dep) => `
        <div style="display:inline-flex; align-items:center; gap:6px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:6px; padding:4px 8px; font-family:'JetBrains Mono', monospace; font-size:11px;">
          <span style="color:#64748b;">${dep.label}:</span>
          <span style="color:#16a34a; font-weight:700;">${dep.val >= 1_000_000_000 ? 'INF' : dep.val}</span>
        </div>
      `
          )
          .join(' ');

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; gap:8px; height:100%; width:100%; box-sizing:border-box;">
      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:12px 14px; display:flex; justify-content:space-between; align-items:center; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
        <div>
          <div style="font-size:11px; color:#64748b; font-weight:600;">当前递推单元格</div>
          <div style="font-family:'JetBrains Mono', monospace; font-size:17px; font-weight:800; color:#2563eb;">
            ${cellName}
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11px; color:#64748b; font-weight:600;">单元格赋值结果</div>
          <div style="font-size:18px; font-weight:800; color:#16a34a;">
            ${cellValStr}
          </div>
        </div>
      </div>

      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:6px; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
        <div style="font-size:11px; color:#64748b; font-weight:700;">🔗 转移依赖来源</div>
        <div style="display:flex; flex-wrap:wrap; gap:6px;">
          ${depsHtml}
        </div>
      </div>

      <div style="background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:12px; display:flex; flex-direction:column; gap:4px; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
        <div style="font-size:11px; color:#64748b; font-weight:700;">递推说明</div>
        <div style="font-size:13px; font-weight:700; color:#0f172a;">${decision}</div>
        <div style="font-size:11.5px; color:#475569; line-height:1.5;">${message}</div>
      </div>
    </div>
  `;
}

// ==========================================
// 5. 二维 DP 阶段 Card 2: DP 表格（当前格/依赖格高亮）
// ==========================================

export interface Special2DCard2Options {
  title: string;
  dp: number[][];
  curI: number;
  curJ: number;
  depCells: Array<{ r: number; c: number }>;
}

export function renderSpecial2DCard2(
  container: HTMLElement,
  opts: Special2DCard2Options
): void {
  const { title, dp, curI, curJ, depCells } = opts;
  const rows = dp?.length || 0;
  const cols = dp?.[0]?.length || 0;

  const rowLabels = dp?.map((_, i) => `#${i}`) || [];
  const colLabels = Array.from({ length: cols }, (_, j) => `${j}`);

  const deps = (depCells || []).map((d) => {
    let type: 'top' | 'left' | 'diag' | undefined;
    if (d.r === curI - 1 && d.c === curJ) type = 'top';
    else if (d.r === curI && d.c < curJ) type = 'left';
    else if (d.r < curI && d.c < curJ) type = 'diag';
    return { r: d.r, c: d.c, type };
  });

  const stepData = {
    i: curI,
    j: curJ,
    grid: dp || [],
    msg: `${title} [${curI}, ${curJ}]`,
  };

  const renderOpts: GridRenderOptions = {
    m: rows,
    n: cols,
    isReverse: false,
    isGridProblem: false,
    modelId: 'knapsack-special-2d',
    rowLabels,
    colLabels,
    deps,
  };

  container.innerHTML = `
    <div style="display:flex; flex-direction:column; height:100%; width:100%; box-sizing:border-box;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px; flex-shrink:0;">
        <span style="font-size:12px; font-weight:700; color:#0f172a;">📊 ${title}</span>
        <div style="display:flex; gap:8px; font-size:11px;">
          <span style="color:#2563eb;">■ 当前格</span>
          <span style="color:#d97706;">■ 依赖格</span>
        </div>
      </div>
      <div class="special-2d-grid-wrapper" style="flex:1; min-height:0; overflow:auto; background:#ffffff; border:1px solid #e2e8f0; border-radius:12px; padding:6px; box-shadow:0 1px 2px rgba(0,0,0,0.03);">
      </div>
    </div>
  `;

  const wrapper = container.querySelector('.special-2d-grid-wrapper') as HTMLElement | null;
  if (wrapper) {
    GridVisualAdapter.renderGrid(wrapper, stepData, renderOpts);
  }
}
