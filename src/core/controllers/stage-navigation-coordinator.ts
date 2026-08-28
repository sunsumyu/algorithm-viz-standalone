import type { IYamlAlgorithmModel } from '../interfaces';

export interface StageTabOptions {
  model: IYamlAlgorithmModel;
  currentStage: string;
  onSelectStage: (stageKey: string) => void;
}

export interface DirectionTabOptions {
  model: IYamlAlgorithmModel;
  currentDirection: 'forward' | 'reverse';
  onSelectDirection: (dirKey: 'forward' | 'reverse') => void;
}

/**
 * 阶段演化导航与 Tab 状态协调深模块 (StageNavigationCoordinator)
 * 
 * 职责：
 * 1. 渲染顶部 4/5 阶段演化 Tab（包含数字标号、阶段简称、复杂度时空徽章、主题色彩）
 * 2. 渲染顺推 / 逆推方向切换器（包含自动隐藏单方向模型、图标与语义标签）
 * 3. 封装激活态类名切换与事件通知
 */
export class StageNavigationCoordinator {
  private static defaultShortNames: Record<string, string> = {
    'stage-1': '递归',
    'stage-2': '记忆化',
    'stage-3': '二维DP',
    'stage-4': '一维优化',
  };

  /**
   * 渲染阶段演化选项卡
   */
  public static renderStageTabs(
    container: HTMLElement | null,
    options: StageTabOptions
  ): void {
    if (!container || !options.model.stages) return;
    container.innerHTML = '';

    const stageEntries = Object.entries(options.model.stages);
    stageEntries.forEach(([stageKey, stageSpec], idx) => {
      const stageNum = idx + 1;
      const shortName = stageSpec.shortName || this.defaultShortNames[stageKey] || `阶段 ${stageNum}`;
      const timeBadge = stageSpec.timeBadge || '';
      const isActive = stageKey === options.currentStage;

      const btn = document.createElement('button');
      btn.dataset.stage = stageKey;
      btn.title = `${stageSpec.name || stageKey} ${timeBadge}`;

      const themeClass = stageKey === 'stage-4'
        ? (isActive ? 'active bg-amber-500 text-white shadow-sm shadow-amber-500/20 border-amber-500 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-white border-transparent font-semibold')
        : stageKey === 'stage-3'
        ? (isActive ? 'active bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 border-emerald-600 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-white border-transparent font-semibold')
        : (isActive ? 'active bg-blue-600 text-white shadow-sm shadow-blue-500/20 border-blue-600 font-bold' : 'text-slate-600 hover:text-slate-900 hover:bg-white border-transparent font-semibold');

      btn.className = `stage-tab-btn px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 border whitespace-nowrap ${themeClass}`;
      btn.innerHTML = `
        <span class="w-4 h-4 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'} text-[10px] flex items-center justify-center font-bold flex-shrink-0">${stageNum}</span>
        <span class="whitespace-nowrap font-medium text-xs">${shortName}</span>
        ${timeBadge ? `<span class="text-[9px] px-1 py-0.2 rounded ${isActive ? 'bg-white/20 text-white' : 'bg-slate-200/70 text-slate-500'} font-mono hidden 2xl:inline flex-shrink-0">${timeBadge}</span>` : ''}
      `;

      btn.addEventListener('click', () => {
        options.onSelectStage(stageKey);
      });

      container.appendChild(btn);
    });
  }

  /**
   * 渲染顺推 / 逆推方向切换选项卡
   */
  public static renderDirectionTabs(
    container: HTMLElement | null,
    options: DirectionTabOptions
  ): void {
    if (!container || !options.model.directions) return;
    const dirEntries = Object.entries(options.model.directions);
    if (dirEntries.length <= 1) {
      container.classList.add('hidden');
      return;
    }
    container.classList.remove('hidden');
    container.innerHTML = '';

    dirEntries.forEach(([dirKey, dirSpec]) => {
      const isActive = dirKey === options.currentDirection;
      const btn = document.createElement('button');
      btn.dataset.dir = dirKey;
      btn.title = dirSpec.label || dirKey;
      const iconClass = dirKey === 'forward' ? 'fa-arrow-down-right-across' : 'fa-arrow-up-left-across';
      const label = dirSpec.label ? dirSpec.label.replace(/\(.*\)/, '') : dirKey;

      btn.className = `dir-tab-btn px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-lg text-xs transition-all flex items-center gap-1 border ${
        isActive ? 'active bg-blue-600 text-white shadow-sm font-bold border-blue-600' : 'text-slate-600 hover:text-slate-900 hover:bg-white border-transparent font-semibold'
      }`;
      btn.innerHTML = `
        <i class="fa-solid ${iconClass} text-[9px]"></i>
        <span class="truncate">${label}</span>
      `;

      btn.addEventListener('click', () => {
        options.onSelectDirection(dirKey as 'forward' | 'reverse');
      });

      container.appendChild(btn);
    });
  }

  /**
   * 更新页面标题、阶段描述、复杂度徽章与卡片元数据
   */
  public static updateHeaderMeta(
    model: IYamlAlgorithmModel,
    stageConfig: any,
    currentStage: string,
    currentDirection: 'forward' | 'reverse',
    effectiveM: number,
    effectiveN: number
  ): void {
    if (typeof document === 'undefined') return;

    const mainTitleEl = document.getElementById('header-algo-main-title') || document.getElementById('main-algo-title');
    const leetcodeId = model.problem?.leetcodeId || (model.id === 'unique-paths-ii' ? 63 : model.id === 'unique-paths' ? 62 : undefined);
    const prefix = leetcodeId ? `${leetcodeId}. ` : '';

    if (mainTitleEl) {
      mainTitleEl.textContent = `${prefix}${model.name}`;
    }
    const fullPageTitleEl = typeof document.querySelector === 'function' ? document.querySelector('header h1') : null;
    if (fullPageTitleEl) {
      fullPageTitleEl.textContent = leetcodeId ? `LeetCode ${prefix}${model.name}` : model.name;
    }
    document.title = `${prefix}${model.name} - 算法演化与空间优化交互可视化`;

    const isStage32D = currentStage === 'stage-3' && effectiveM > 1;
    const is1DProblem = !isStage32D && effectiveM <= 1;

    // 针对 1D 线性动规自动隐藏 m 尺寸输入框与乘号
    const inputM = document.getElementById('input-m') as HTMLInputElement | null;
    if (inputM) {
      if (is1DProblem) {
        inputM.style.display = 'none';
        if (inputM.previousElementSibling) (inputM.previousElementSibling as HTMLElement).style.display = 'none';
        if (inputM.nextElementSibling) (inputM.nextElementSibling as HTMLElement).style.display = 'none';
      } else {
        inputM.style.display = '';
        if (inputM.previousElementSibling) (inputM.previousElementSibling as HTMLElement).style.display = '';
        if (inputM.nextElementSibling) (inputM.nextElementSibling as HTMLElement).style.display = '';
      }
    }

    const titleEl = document.getElementById('header-algo-title') || document.getElementById('stage-title-text');
    if (titleEl) {
      titleEl.textContent = stageConfig.name || '';
      titleEl.title = stageConfig.desc || '';
    }
    const descEl = document.getElementById('header-algo-desc') || document.getElementById('stage-desc-text');
    if (descEl) descEl.textContent = stageConfig.desc || '';

    const complexityBadge = document.getElementById('header-complexity-badge');
    if (complexityBadge) {
      complexityBadge.textContent = stageConfig.timeBadge || '';
      complexityBadge.className = `px-2 py-0.5 rounded-md text-[10px] font-bold font-mono ${stageConfig.badgeBg || 'bg-blue-100 text-blue-800'}`;
    }

    const isGridProblem = ['unique-paths', 'unique-paths-ii', 'min-path-sum'].includes(model.id);
    const card1El = (document.getElementById('card1-wrapper') || document.getElementById('card1-title')?.parentElement?.parentElement || document.getElementById('card1-title')?.parentElement) as HTMLElement | null;
    const btnToggle3d = document.getElementById('btn-toggle-3d');
    const card1TitleEl = document.getElementById('card1-title');
    const card2TitleEl = document.getElementById('card2-title');
    const card2DescEl = document.getElementById('card2-desc');
    const memoLenBadge = document.getElementById('badge-memo-len');

    if (card1El) card1El.style.display = '';
    if (btnToggle3d) btnToggle3d.style.display = '';

    if (card1TitleEl) {
      if (isGridProblem) {
        card1TitleEl.innerHTML = `<i class="fa-solid fa-table-cells text-slate-500"></i> 二维网格 (虚拟地图 ${effectiveM}×${effectiveN})`;
      } else if (is1DProblem) {
        card1TitleEl.innerHTML = `<i class="fa-solid fa-table-cells text-slate-500"></i> 一维状态槽位 (1×${effectiveN})`;
      } else {
        card1TitleEl.innerHTML = `<i class="fa-solid fa-table-cells text-slate-500"></i> 二维状态网格 (${effectiveM}×${effectiveN})`;
      }
    }

    if (card2TitleEl) {
      let defaultCard2Title = '一维状态数组 (int[] memo)';
      if (currentStage === 'stage-1') defaultCard2Title = '递归搜索调用树 (Recursive Call Tree)';
      else if (currentStage === 'stage-2') defaultCard2Title = '记忆化搜索剪枝树 (Memoized Tree)';
      else if (currentStage === 'stage-3') defaultCard2Title = isStage32D ? '二维 DP 状态转移表 (int[][] dp)' : '一维 DP 状态数组 (int[] dp)';
      else if (currentStage === 'stage-4') defaultCard2Title = '空间压缩滚动数组 (int[] memo)';

      const stageTitle = (stageConfig.card2Title && typeof stageConfig.card2Title === 'object')
        ? (stageConfig.card2Title[currentDirection] || stageConfig.card2Title.forward)
        : stageConfig.card2Title;

      const resolvedTitle = (currentStage === 'stage-3' && isStage32D)
        ? '二维 DP 状态转移表 (int[][] dp)'
        : (stageTitle || defaultCard2Title);

      card2TitleEl.innerHTML = `<i class="fa-solid fa-bars-staggered text-slate-500"></i> ${resolvedTitle}`;
    }
    if (card2DescEl) {
      let defaultCard2Desc = '空间优化: 只保存当前行的数据，不断滚动覆盖。';
      if (currentStage === 'stage-1') defaultCard2Desc = '自顶向下展开递归调用子问题，呈现指数级爆炸分支与重复计算。';
      else if (currentStage === 'stage-2') defaultCard2Desc = '引入备忘录剪枝，已计算子问题直接 O(1) 查表剪枝返回。';
      else if (currentStage === 'stage-3') defaultCard2Desc = isStage32D ? '自底向上顺序填表，二维状态转移方程精准递推。' : '自底向上顺序填表，状态转移方程精准递推。';
      else if (currentStage === 'stage-4') defaultCard2Desc = '空间优化：利用局部状态依赖，就地滚动更新。';

      const resolvedDesc = (stageConfig.card2Desc && typeof stageConfig.card2Desc === 'object')
        ? (stageConfig.card2Desc[currentDirection] || stageConfig.card2Desc.forward || defaultCard2Desc)
        : (stageConfig.card2Desc || defaultCard2Desc);

      card2DescEl.textContent = resolvedDesc;
    }

    if (memoLenBadge) {
      if (currentStage === 'stage-4' || is1DProblem) {
        memoLenBadge.textContent = `长度: ${effectiveN}`;
      } else {
        memoLenBadge.textContent = `${effectiveM} × ${effectiveN}`;
      }
    }

    const legendBar = document.getElementById('grid-legend-bar');
    if (legendBar && !isGridProblem) {
      legendBar.innerHTML = `
        <span class="flex items-center gap-1"><span class="inline-block w-2.5 h-2.5 rounded-sm bg-blue-100 border border-blue-500"></span> 当前计算</span>
        <span class="flex items-center gap-1"><span class="inline-block w-2.5 h-2.5 rounded-sm bg-slate-100 border border-slate-300"></span> 已求解</span>
        <span class="flex items-center gap-1"><span class="inline-block w-2.5 h-2.5 rounded-sm bg-purple-100 border border-purple-400"></span> 参考上方</span>
        <span class="flex items-center gap-1"><span class="inline-block w-2.5 h-2.5 rounded-sm bg-amber-100 border border-amber-400"></span> 参考左方</span>
      `;
    }
  }

  /**
   * 同步阶段 3 子视图切换按钮高亮状态
   */
  public static updateStage3SubViewTabs(
    currentStage: string,
    stage3SubView: 'matrix' | 'tree',
    isStage32D: boolean
  ): void {
    if (typeof document === 'undefined') return;
    const bar = document.getElementById('stage3-subview-bar');
    if (!bar) return;

    if (currentStage !== 'stage-3' || !isStage32D) {
      bar.classList.add('hidden');
      return;
    }
    bar.classList.remove('hidden');

    const btnMatrix = document.getElementById('btn-subview-matrix');
    const btnTree = document.getElementById('btn-subview-tree');

    const activeCls = 'active px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-600 text-white shadow-2xs transition flex items-center gap-1';
    const inactiveCls = 'px-2 py-0.5 rounded text-[11px] font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-200 transition flex items-center gap-1';

    if (btnMatrix) btnMatrix.className = stage3SubView === 'matrix' ? activeCls : inactiveCls;
    if (btnTree) btnTree.className = stage3SubView === 'tree' ? activeCls : inactiveCls;
  }
}

