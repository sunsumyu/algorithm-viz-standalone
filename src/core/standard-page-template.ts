/**
 * 标准算法可视化页面模板 (Standard Visualizer Page Template)
 * 
 * 从 unique-paths.html 中提取的公共 UI 骨架，所有算法（DP/贪心/其他）共用
 * 
 * 公共组件：
 * - 顶栏（返回、导航、标题、难度）
 * - 阶段标签容器
 * - 顺逆推切换容器
 * - 参数输入区
 * - 播放控制区
 * - 双栏布局（Card 1 + Card 2）
 * - 代码面板骨架
 */

export interface StandardPageMeta {
  algoId: string;
  title: string;
  subtitle?: string;
  leetcodeId?: number;
  difficulty?: number;
  icon?: string;
  category?: string;
}

export function generateStandardPageTemplate(meta: StandardPageMeta): string {
  const difficultyLabels = ['', 'Easy', 'Medium', 'Hard'];
  const difficultyColors = ['', '#22c55e', '#f59e0b', '#ef4444'];
  const diffLabel = meta.difficulty ? difficultyLabels[meta.difficulty] || '' : '';
  const diffColor = meta.difficulty ? difficultyColors[meta.difficulty] || '#64748b' : '#64748b';
  const lcPrefix = meta.leetcodeId ? `${meta.leetcodeId}. ` : '';

  return `
    <!-- ================= 顶部导航栏 ================= -->
    <header class="bg-white border-b border-slate-200/80 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-white/95">
      <div class="w-full px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        <!-- 左侧：返回 + 导航 + 标题 -->
        <div class="flex items-center gap-3 min-w-0 flex-1">
          <button id="btn-back" class="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1.5 flex-shrink-0">
            <i class="fa-solid fa-arrow-left text-[11px]"></i>
            <span>返回</span>
          </button>
          
          <div class="flex items-center gap-1 flex-shrink-0">
            <button id="btn-prev-algo" class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition" title="上一题">
              <i class="fa-solid fa-chevron-left text-xs"></i>
            </button>
            <button id="btn-next-algo" class="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition" title="下一题">
              <i class="fa-solid fa-chevron-right text-xs"></i>
            </button>
          </div>

          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white text-sm flex-shrink-0">
                <i class="fa-solid ${meta.icon || 'fa-code'} text-xs"></i>
              </div>
              <h1 id="header-algo-main-title" class="text-sm sm:text-base font-bold text-slate-900 truncate">${lcPrefix}${meta.title}</h1>
              ${diffLabel ? `<span class="px-1.5 py-0.5 text-[10px] font-semibold rounded-full border flex-shrink-0" style="background: ${diffColor}15; color: ${diffColor}; border-color: ${diffColor}40;">${diffLabel}</span>` : ''}
              ${meta.category ? `<span class="px-1.5 py-0.5 text-[10px] font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex-shrink-0">${meta.category}</span>` : ''}
            </div>
            ${meta.subtitle ? `<p class="text-[11px] text-slate-500 truncate hidden sm:block">${meta.subtitle}</p>` : ''}
          </div>
        </div>

        <!-- 右侧：设置 + 快捷键 -->
        <div class="flex items-center gap-2 flex-shrink-0">
          <button id="btn-settings" class="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1.5">
            <i class="fa-solid fa-gear text-[11px]"></i>
            <span>设置</span>
          </button>
          <button id="btn-shortcuts" class="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition flex items-center gap-1.5">
            <i class="fa-regular fa-keyboard text-[11px]"></i>
            <span>快捷键</span>
          </button>
        </div>
      </div>
    </header>

    <!-- ================= 主内容区 ================= -->
    <main class="w-full px-4 sm:px-6 lg:px-8 py-4 flex-1 flex flex-col gap-4">

      <!-- 阶段标签 + 顺逆推切换 -->
      <section class="bg-white rounded-xl p-2 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-2">
        <div class="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1.5 self-start md:self-center">
          <i class="fa-solid fa-layer-group text-slate-400"></i>
          <span>演化阶段</span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-1 w-full md:w-auto" id="stage-tabs-container"></div>
        <div class="flex items-center gap-1 p-1 bg-slate-100/90 rounded-lg border border-slate-200" id="dir-tabs-container"></div>
      </section>

      <!-- 参数控制栏 -->
      <section class="bg-white rounded-xl p-3 border border-slate-200/80 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div class="flex flex-wrap items-center gap-2" id="params-container">
          <!-- 动态插入参数输入 -->
        </div>
        <div class="flex items-center gap-2 justify-end">
          <button id="btn-apply" class="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition shadow-sm flex items-center gap-1">
            <i class="fa-solid fa-check text-[10px]"></i>
            <span>应用</span>
          </button>
          <button id="btn-reset" class="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-1">
            <i class="fa-solid fa-rotate-left text-[10px]"></i>
            <span>重置</span>
          </button>
        </div>
      </section>

      <!-- 双栏布局 -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0">
        
        <!-- 左侧：Card 1 主视觉 -->
        <div class="lg:col-span-7 flex flex-col gap-3">
          <div class="bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col flex-1 overflow-hidden">
            <div class="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
              <h2 class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <i class="fa-solid fa-map-location-dot text-slate-400"></i>
                <span id="card1-title">算法执行沙盘</span>
              </h2>
              <div class="flex items-center gap-1 text-[11px]" id="card1-legend">
                <!-- 动态插入图例 -->
              </div>
            </div>
            <div id="dsp-sandbox-container" class="flex-1 p-4 overflow-auto"></div>
          </div>

          <!-- Card 2 副视觉（可选） -->
          <div class="bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden" id="card2-container">
            <div class="px-4 py-2.5 border-b border-slate-100">
              <h2 class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <i class="fa-solid fa-circle-info text-slate-400"></i>
                <span id="card2-title">状态说明</span>
              </h2>
            </div>
            <div id="dsp-custom-metrics-container" class="p-3 flex flex-col gap-2"></div>
          </div>
        </div>

        <!-- 右侧：代码面板 + 执行日志 -->
        <div class="lg:col-span-5 flex flex-col gap-3">
          <!-- 代码面板容器 -->
          <div id="code-terminal-card" class="bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden flex-1 min-h-[300px]">
            <!-- DarkCodeTerminalPresenter 会自动注入骨架 -->
          </div>

          <!-- 执行日志 -->
          <div class="bg-white rounded-xl border border-slate-200/80 shadow-sm flex flex-col overflow-hidden" style="max-height: 200px;">
            <div class="px-4 py-2 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <h2 class="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <i class="fa-solid fa-list-ul text-slate-400"></i>
                <span>执行日志</span>
              </h2>
              <span id="log-count" class="text-[10px] text-slate-400">0 记录</span>
            </div>
            <div id="log-container" class="flex-1 p-3 overflow-y-auto text-[11px] font-mono text-slate-600 space-y-1"></div>
          </div>
        </div>
      </div>

      <!-- 底部播放控制 -->
      <div class="bg-white rounded-xl p-3 border border-slate-200/80 shadow-sm flex items-center justify-center gap-3">
        <button id="btn-step-first" class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition" title="跳到开头">
          <i class="fa-solid fa-backward-step text-sm"></i>
        </button>
        <button id="btn-step-prev" class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition" title="上一步">
          <i class="fa-solid fa-chevron-left text-sm"></i>
        </button>
        <button id="btn-play-pause" class="px-4 h-8 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-sm">
          <i class="fa-solid fa-play text-[10px]" id="icon-play-state"></i>
          <span id="text-play-state">自动播放</span>
        </button>
        <button id="btn-step-next" class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition" title="下一步">
          <i class="fa-solid fa-chevron-right text-sm"></i>
        </button>
        <button id="btn-step-last" class="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition" title="跳到末尾">
          <i class="fa-solid fa-forward-step text-sm"></i>
        </button>
        
        <div class="px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600 font-semibold flex items-center gap-1">
          <span id="current-step-num">1</span>
          <span class="text-slate-400">/</span>
          <span id="total-steps-num">1</span>
        </div>

        <div class="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-lg border border-slate-200 text-xs">
          <i class="fa-solid fa-gauge-high text-slate-400 text-[10px]"></i>
          <select id="select-speed" class="bg-transparent font-medium text-slate-700 focus:outline-none cursor-pointer">
            <option value="1500">0.5x</option>
            <option value="900" selected>1.0x</option>
            <option value="500">1.5x</option>
            <option value="250">2.0x</option>
          </select>
        </div>
      </div>

    </main>
  `;
}
