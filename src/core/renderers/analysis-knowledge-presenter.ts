import type { IYamlAlgorithmModel } from '../interfaces';

export interface FiveStepItem {
  title: string;
  content: string;
}

export interface FaqItem {
  q: string;
  a: string;
}

export interface AnalysisPresentOptions {
  currentStage?: string;
  m?: number;
  n?: number;
}

/**
 * 解法题解与五步法知识流呈现深模块 (AnalysisKnowledgePresenter)
 * 
 * 职责：
 * 1. 结构化渲染 LeetCode 原题描述、难度徽章、示例用例与约束条件
 * 2. 结构化渲染动态规划标准 5 步递推分析（五步法）与核心易错 FAQs
 * 3. 针对未配置独立 analysis/faqs 的算法模型，智能生成符合题型领域特征的五步推导规则与答疑
 */
export class AnalysisKnowledgePresenter {
  /**
   * 渲染题目描述面板或弹窗
   */
  public static renderProblemView(
    container: HTMLElement | null,
    model: IYamlAlgorithmModel
  ): void {
    if (!container || !model) return;
    const problem = model.problem;

    const difficultyMap: Record<string, { label: string; class: string }> = {
      easy: { label: '简单', class: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' },
      '简单': { label: '简单', class: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' },
      medium: { label: '中等', class: 'bg-amber-500/20 text-amber-400 border border-amber-500/40' },
      '中等': { label: '中等', class: 'bg-amber-500/20 text-amber-400 border border-amber-500/40' },
      hard: { label: '困难', class: 'bg-rose-500/20 text-rose-400 border border-rose-500/40' },
      '困难': { label: '困难', class: 'bg-rose-500/20 text-rose-400 border border-rose-500/40' },
    };

    const diffInfo = difficultyMap[String(problem?.difficulty || model.difficulty)] || {
      label: '中等',
      class: 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
    };

    const title = problem?.title || model.name;
    const lcId = problem?.leetcodeId ? `LeetCode ${problem.leetcodeId}. ` : '';
    const desc = problem?.description || model.description || '暂无详细描述。';
    const tags = problem?.tags || [model.category, '动态规划'];
    const leetcodeUrl = problem?.leetcodeUrl;

    let examplesHtml = '';
    if (problem?.examples && problem.examples.length > 0) {
      examplesHtml = `
        <div class="mt-4 space-y-3">
          <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-solid fa-vial text-blue-400"></i> 示例用例 (Examples)
          </h4>
          ${problem.examples.map((ex, idx) => `
            <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs font-mono-code space-y-1.5">
              <div class="font-bold text-slate-300 font-sans flex items-center justify-between">
                <span>示例 ${idx + 1}</span>
              </div>
              <div class="text-slate-300"><span class="text-slate-500 font-sans">输入：</span><code class="text-blue-300">${ex.input}</code></div>
              <div class="text-slate-300"><span class="text-slate-500 font-sans">输出：</span><code class="text-emerald-400 font-bold">${ex.output}</code></div>
              ${ex.explanation ? `<div class="text-slate-400 font-sans text-[11px] leading-relaxed pt-1 border-t border-slate-800/60"><span class="text-slate-500">解释：</span>${ex.explanation}</div>` : ''}
            </div>
          `).join('')}
        </div>
      `;
    }

    let constraintsHtml = '';
    if (problem?.constraints && problem.constraints.length > 0) {
      constraintsHtml = `
        <div class="mt-4 space-y-2">
          <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-solid fa-triangle-exclamation text-amber-400"></i> 提示与数据约束 (Constraints)
          </h4>
          <ul class="list-disc list-inside space-y-1 text-xs text-slate-400 font-mono-code bg-slate-950/40 p-3 rounded-xl border border-slate-800/80">
            ${problem.constraints.map(c => `<li><span class="text-slate-300">${c}</span></li>`).join('')}
          </ul>
        </div>
      `;
    }

    const contentHtml = `
      <div class="space-y-4">
        <!-- 题目标题与徽章 -->
        <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2 flex-wrap">
            <h3 class="text-sm font-bold text-white">${lcId}${title}</h3>
            <span class="px-2 py-0.5 text-[10px] font-bold rounded-md ${diffInfo.class}">${diffInfo.label}</span>
            ${tags.map(t => `<span class="px-2 py-0.5 text-[10px] rounded-md bg-slate-800 text-slate-300 border border-slate-700">${t}</span>`).join('')}
          </div>
          ${leetcodeUrl ? `
            <a href="${leetcodeUrl}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1 text-[11px] font-semibold text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 rounded-lg transition flex items-center gap-1">
              <span>力扣原题</span>
              <i class="fa-solid fa-arrow-up-right-from-square text-[10px]"></i>
            </a>
          ` : ''}
        </div>

        <!-- 题目正文描述 -->
        <div class="text-xs leading-relaxed text-slate-300 space-y-2">
          ${desc}
        </div>

        <!-- 示例 -->
        ${examplesHtml}

        <!-- 约束条件 -->
        ${constraintsHtml}
      </div>
    `;

    container.innerHTML = contentHtml;
  }

  /**
   * 渲染动态规划标准 5 步递推分析法与 FAQs
   */
  public static renderAnalysisView(
    container: HTMLElement | null,
    model: IYamlAlgorithmModel,
    options: AnalysisPresentOptions = {}
  ): void {
    if (!container || !model) return;

    const fiveSteps = this.getFiveStepAnalysis(model, options.currentStage);
    const faqs = this.getFaqs(model, options.currentStage);

    let analysisHtml = '';
    if (fiveSteps.length > 0) {
      analysisHtml = `
        <div class="space-y-3">
          <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800">
            <i class="fa-solid fa-stairs text-emerald-400"></i> 动态规划标准 5 步递推分析
          </h4>
          <div class="space-y-2.5">
            ${fiveSteps.map((item, idx) => `
              <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1">
                <div class="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                  <span class="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-[10px]">${idx + 1}</span>
                  <span>${item.title || `步骤 ${idx + 1}`}</span>
                </div>
                <p class="text-xs text-slate-300 leading-relaxed pl-5">${item.content || ''}</p>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    let faqsHtml = '';
    if (faqs.length > 0) {
      faqsHtml = `
        <div class="mt-4 space-y-3">
          <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-800">
            <i class="fa-solid fa-circle-question text-blue-400"></i> 常见易错疑问与核心要点 (FAQs)
          </h4>
          <div class="space-y-2">
            ${faqs.map(faq => `
              <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800 space-y-1.5">
                <div class="text-xs font-bold text-slate-200 flex items-start gap-1.5">
                  <span class="text-amber-400 font-mono">Q:</span>
                  <span>${faq.q}</span>
                </div>
                <div class="text-xs text-slate-400 leading-relaxed flex items-start gap-1.5 pl-3 border-l-2 border-slate-800">
                  <span class="text-blue-400 font-mono">A:</span>
                  <span>${faq.a}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="space-y-4">
        ${analysisHtml}
        ${faqsHtml}
      </div>
    `;
  }

  /**
   * 提取或智能生成 5 步递推分析法
   */
  public static getFiveStepAnalysis(model: IYamlAlgorithmModel, currentStage?: string): FiveStepItem[] {
    if (model.analysis && Object.keys(model.analysis).length > 0) {
      return Object.values(model.analysis).map((item: any, idx) => ({
        title: item.title || `步骤 ${idx + 1}`,
        content: item.content || ''
      }));
    }

    const id = model.id;
    const isKnapsack = id.includes('knapsack') || id.includes('target-sum') || id.includes('subset') || id.includes('stone') || id.includes('coin');
    const isSequence = id.includes('sequence') || id.includes('string') || id.includes('distance') || id.includes('subsequence');
    const isStock = id.includes('stock');

    if (isKnapsack) {
      return [
        {
          title: '1. 确定 dp 数组及下标含义',
          content: '二维 dp[i][j] 表示前 i 个物品任取装入容量为 j 的背包中的最优值或方案数；一维压缩 memo[j] 表示容量为 j 的背包的最优结果。'
        },
        {
          title: '2. 确定递推公式',
          content: '不放物品 i：dp[i][j] = dp[i-1][j]；放物品 i（j ≥ weight[i]）：dp[i][j] = opt(dp[i-1][j], dp[i-1][j-weight[i]] + value[i])。'
        },
        {
          title: '3. dp 数组如何初始化',
          content: 'dp[0][0] 及容量为 0 处根据题目性质设为 0 或 1，第一件物品行根据容量是否足够进行初始赋值。'
        },
        {
          title: '4. 确定遍历顺序',
          content: '二维 DP 行列顺序均可；一维滚动数组压缩时，0-1 背包必须【倒序遍历容量】，完全背包必须【正序遍历容量】。'
        },
        {
          title: '5. 举例推导 dp 数组',
          content: '借助上方 2D 沙盘与下方 DP 矩阵单步推导，核对每一步取优状态与最优解回溯。'
        }
      ];
    }

    if (isSequence) {
      return [
        {
          title: '1. 确定 dp 数组及下标含义',
          content: 'dp[i][j] 通常表示以 text1 前 i 个字符和 text2 前 j 个字符的最优匹配长度或最小编辑距离。'
        },
        {
          title: '2. 确定递推公式',
          content: '若 text1[i-1] == text2[j-1]，继承对角线 dp[i-1][j-1] + 1；若不相等，从左/上子问题转移决策。'
        },
        {
          title: '3. dp 数组如何初始化',
          content: 'dp[0][j] 与 dp[i][0] 表示与空串匹配的基准距离或公共长度 0。'
        },
        {
          title: '4. 确定遍历顺序',
          content: '从左到右、从上到下顺序遍历整个 (m+1) × (n+1) 矩阵。'
        },
        {
          title: '5. 举例推导 dp 数组',
          content: '在可视化矩阵中跟随高亮光标，观察字符相等与不等时状态如何在表格中扩散。'
        }
      ];
    }

    if (isStock) {
      return [
        {
          title: '1. 确定 dp 数组及下标含义',
          content: 'dp[i][0] 表示第 i 天持有股票的最大现金，dp[i][1] 表示第 i 天不持有股票的最大现金。'
        },
        {
          title: '2. 确定递推公式',
          content: '持有态：dp[i][0] = max(dp[i-1][0], 前序状态 - prices[i])；未持有态：dp[i][1] = max(dp[i-1][1], dp[i-1][0] + prices[i])。'
        },
        {
          title: '3. dp 数组如何初始化',
          content: '第 0 天买入 dp[0][0] = -prices[0]，不买入 dp[0][1] = 0。'
        },
        {
          title: '4. 确定遍历顺序',
          content: '从第 1 天向后顺序推导至第 n-1 天。'
        },
        {
          title: '5. 举例推导 dp 数组',
          content: '对照价格走势，校验买入点与卖出点的现金差值。'
        }
      ];
    }

    // 默认线性动规 5 步法
    return [
      {
        title: '1. 确定 dp 数组及下标含义',
        content: `dp[i] 表示规模为 i 的子问题的最优解或方案数。`
      },
      {
        title: '2. 确定递推公式',
        content: `dp[i] = f(dp[i-1], dp[i-2], ...)，由前序若干历史子状态合并转移得到。`
      },
      {
        title: '3. dp 数组如何初始化',
        content: `确立 Base Case 初始边界 dp[0]、dp[1]，为后续递推提供起始值。`
      },
      {
        title: '4. 确定遍历顺序',
        content: `从前向后自底向上线性填表。`
      },
      {
        title: '5. 举例推导 dp 数组',
        content: `打印/观察 dp 数组的变化轨迹，与预期结果做比对验证。`
      }
    ];
  }

  /**
   * 提取或智能生成常见 FAQs
   */
  public static getFaqs(model: IYamlAlgorithmModel, currentStage?: string): FaqItem[] {
    if (model.faqs && model.faqs.length > 0) {
      return model.faqs;
    }

    const id = model.id;
    if (id.includes('knapsack') || id.includes('target-sum') || id.includes('subset') || id.includes('stone') || id.includes('coin')) {
      return [
        {
          q: '为什么 0-1 背包一维滚动数组压缩时，容量必须从大到小（倒序）遍历？',
          a: '倒序遍历保证每个物品只被添加一次！如果正序遍历，计算 dp[j] 时用到的 dp[j - weight[i]] 已经是当前物品放入后的新值，会导致同一个物品被多次重复放入（变成完全背包）。'
        },
        {
          q: '0-1 背包与完全背包的最核心区别是什么？',
          a: '0-1 背包每种物品只有一件（正序压缩会重复），完全背包每种物品有无限件（递推依赖本行新值，故一维数组必须从前往后正序遍历）。'
        }
      ];
    }

    if (id.includes('sequence') || id.includes('distance') || id.includes('subsequence')) {
      return [
        {
          q: '子序列 (Subsequence) 与 子数组/子串 (Subarray/Substring) 的区别？',
          a: '子序列不要求字符连续，只需保持相对前后顺序即可；子数组/子串要求元素在原序列中必须严格连续相邻。'
        },
        {
          q: '为什么 (m+1) × (n+1) 状态矩阵比 m × n 更方便？',
          a: '引入下标 0 代表空字符串 Base Case，省去了复杂的边界越界判断，使状态转移方程在全矩阵内形式完全统一。'
        }
      ];
    }

    return [
      {
        q: '动态规划与暴力递归/记忆化搜索的关系是什么？',
        a: '动态规划是自底向上的递推计算，直接避免递归调用栈开销；记忆化搜索是自顶向下的递归+查表剪枝，两者本质上计算了相同的状态空间，时空渐进复杂度一致。'
      }
    ];
  }
}
