/**
 * Class 053: 单调栈（下）体系化名师讲义与原题解析
 *
 * 题目覆盖：
 * 1. Code01: 统计全 1 子矩形数量 (LeetCode 1504)
 * 2. Code02: 大鱼吃小鱼问题 (牛客经典大题 / 消除轮数)
 * 3. Code03: 移掉 K 位数字 (LeetCode 402)
 * 4. Code04: 去除重复字母 (LeetCode 316 / 1081)
 * 5. Code05: 表现良好的最长时间段 (LeetCode 1124)
 * 6. Code06: 子数组最小乘积的最大值 (LeetCode 1856)
 */

export interface Stack053ProblemContent {
  title: string;
  source: string;
  description: string;
  problemHtml: string;
  analysisHtml: string;
}

export const STACK_053_PROBLEMS: Record<string, Stack053ProblemContent> = {
  // Code01: 统计全 1 子矩形数量 (LeetCode 1504)
  countSubmatrices053: {
    title: '统计全 1 子矩形数量 (Count Submatrices With All Ones)',
    source: 'LeetCode 1504 / 算法通关课 Class 053 Code01',
    description: '给你一个 m x n 的二进制矩阵 mat，请你返回有多少个子矩形全部由 1 组成。',
    problemHtml: `
      <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述</h3>
        <p>给你一个 <code>m × n</code> 的二进制矩阵 <code>mat</code>，请你返回有多少个子矩形全部由 <code>1</code> 组成。</p>
        <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0; border-radius: 0 6px 6px 0;">
          <strong>示例：</strong><br>
          输入: <code>mat = [[1,0,1],[1,1,0],[1,1,0]]</code><br>
          输出: <code>13</code>
        </div>
      </div>
    `,
    analysisHtml: `
      <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">💡 核心原理与阶梯累加算法</h3>
        <p><strong>1. 矩阵逐行压缩为连续 1 高度直方图：</strong> 与 LeetCode 85 相同，先维护以每行为底的 <code>heights</code> 数组。</p>
        <p><strong>2. 阶梯容斥计数定理：</strong> 对于以某个柱子 <code>cur</code> 为瓶颈高度的矩形，其两侧首个更矮的柱子分别为 <code>left</code> 和 <code>right</code>：</p>
        <ul>
          <li>宽度 $W = right - left - 1$；</li>
          <li>柱高 $H = heights[cur]$；两侧最高更矮高度为 $max(heights[left], heights[right])$；</li>
          <li>以当前底边且高在 $[max(left, right) + 1, H]$ 范围内的子矩形数量为：
            $$\text{count} = \frac{W \times (W + 1)}{2} \times (H - \max(heights[left], heights[right]))$$
          </li>
        </ul>
        <p>每个阶梯不重不漏地结算，整体时间复杂度为严格的 $O(M \times N)$！</p>
      </div>
    `,
  },

  // Code02: 大鱼吃小鱼问题
  bigFishEatSmallFish053: {
    title: '大鱼吃小鱼问题 (Big Fish Eat Small Fish)',
    source: '牛客网经典大题 / 算法通关课 Class 053 Code02',
    description: '有 n 条鱼排成一行，每条鱼有一个体重。每一轮所有鱼同时行动：如果一条鱼右边相邻的鱼体重比它小，它就会把右边的小鱼吃掉。问经过多少轮后不再发生吃鱼？',
    problemHtml: `
      <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述</h3>
        <p>有 <code>N</code> 条鱼排成一排，每条鱼的体重互不相同。每一轮吃鱼同时发生：<strong>左侧大鱼会吃掉其右边与其相邻且比它小的鱼</strong>。被吃掉的鱼从序列中移除，剩余鱼重新相邻。问经过多少轮之后，鱼群数量稳定不再减少？</p>
        <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0; border-radius: 0 6px 6px 0;">
          <strong>示例：</strong><br>
          输入: <code>[6, 5, 4, 3, 2, 1]</code><br>
          第 1 轮：6吃5, 5吃4, 4吃3... 一轮全死，只剩 6，返回 1 轮。<br>
          输入: <code>[3, 6, 2, 8, 4, 5]</code> ➔ 分析各鱼存活消除轮数。
        </div>
      </div>
    `,
    analysisHtml: `
      <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">💡 核心原理与单调栈轮数递推</h3>
        <p><strong>1. 单调递减栈维护左侧大鱼：</strong></p>
        <p>对于当前鱼 <code>i</code>：</p>
        <ul>
          <li>如果左侧没有比它大的鱼，它永远不会被吃掉，存活轮数为 <code>0</code>；</li>
          <li>如果左侧有比它大的鱼，它被吃掉所需要的轮数取决于它前面比它小的鱼被吃掉的轮数！</li>
        </ul>
        <p><strong>2. 轮数动态转移：</strong> 当遍历到鱼 <code>cur</code>，持续从栈顶弹出小于等于当前鱼的鱼 <code>popFish</code>：</p>
        <ul>
          <li>当前鱼必须等前面比它小的鱼全部死掉后，才可能暴露给左侧真正能吃它的大鱼！</li>
          <li>因此：<code>curTurns = Math.max(curTurns + 1, popFish.turns)</code>；</li>
        </ul>
        <p>单调栈弹出结算后，若栈不为空，则栈顶大鱼在 <code>curTurns + 1</code> 轮吃掉当前鱼！全局最大轮数即为答案。耗时 $O(N)$！</p>
      </div>
    `,
  },

  // Code03: 移掉 K 位数字 (LeetCode 402)
  removeKDigits053: {
    title: '移掉 K 位数字 (Remove K Digits)',
    source: 'LeetCode 402 / 算法通关课 Class 053 Code03',
    description: '给你一个以字符串表示的非负整数 num 和一个整数 k ，移除这个数中的 k 位数字，使得剩下的数字最小。',
    problemHtml: `
      <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述</h3>
        <p>给你一个以字符串表示的非负整数 <code>num</code> 和一个整数 <code>k</code>，移除这个数中的 <code>k</code> 位数字，使得剩下的数字最小。请以字符串形式返回这个最小的数字（去除前导零，若为空返回 "0"）。</p>
        <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0; border-radius: 0 6px 6px 0;">
          <strong>示例：</strong><br>
          输入: <code>num = "1432219", k = 3</code><br>
          输出: <code>"1219"</code> (移除 4, 3, 2 后得到 12219 ➔ 1219)
        </div>
      </div>
    `,
    analysisHtml: `
      <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">💡 核心原理与贪心单调栈</h3>
        <p><strong>1. 高位越小，数值越小：</strong> 两个相同长度的数字，从高位向低位看，第一对不同的数位直接决定了大小关系。</p>
        <p><strong>2. 单调递增栈剔除逆序对：</strong></p>
        <ul>
          <li>遍历字符 <code>c</code>，只要 <code>k &gt; 0</code> 且当前字符 <code>c &lt; stack.top()</code>，说明栈顶的高位数字是“逆序山峰”，必须果断弹出剔除，同时 <code>k--</code>！</li>
          <li>若 <code>k</code> 还有剩余，从栈顶（低位）继续截掉剩余的 <code>k</code> 个数字；</li>
          <li>去除前导零，空串返回 <code>"0"</code>。</li>
        </ul>
      </div>
    `,
  },

  // Code04: 去除重复字母 (LeetCode 316 / 1081)
  removeDuplicateLetters053: {
    title: '去除重复字母 (Remove Duplicate Letters)',
    source: 'LeetCode 316 & 1081 / 算法通关课 Class 053 Code04',
    description: '给你一个字符串 s ，请你去除字符串中重复的字母，使得每个字母只出现一次。需保证返回结果的字典序最小（不能打乱其他字符的相对位置）。',
    problemHtml: `
      <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述</h3>
        <p>给你一个字符串 <code>s</code>，请你去除字符串中重复的字母，使得每个字母只出现一次。需保证<strong>返回结果的字典序最小</strong>（要求不能打乱其他字符的相对位置）。</p>
        <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0; border-radius: 0 6px 6px 0;">
          <strong>示例：</strong><br>
          输入: <code>s = "cbacdcbc"</code><br>
          输出: <code>"acdb"</code>
        </div>
      </div>
    `,
    analysisHtml: `
      <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">💡 核心原理与贪心单调栈</h3>
        <p><strong>1. 三大核心法宝：</strong></p>
        <ul>
          <li><strong>词频表 <code>count</code></strong>：统计每个字符在后续序列中还会出现几次；</li>
          <li><strong>在栈哈希表 <code>enter</code></strong>：记录字符当前是否已经在单调栈中（已在栈中则直接跳过，保证唯一性）；</li>
          <li><strong>单调递增栈</strong>：维护字典序最小的前缀。</li>
        </ul>
        <p><strong>2. 出栈生死裁决：</strong> 当前字符 <code>c</code> 比栈顶 <code>top</code> 小，且 <code>count[top] &gt; 0</code>（说明 <code>top</code> 后面还会出现），此时必须让 <code>top</code> 出栈给更小的 <code>c</code> 让位！若后续不会再出现，则绝不能出栈！</p>
      </div>
    `,
  },

  // Code05: 表现良好的最长时间段 (LeetCode 1124)
  longestWellPerforming053: {
    title: '表现良好的最长时间段 (Longest Well-Performing Interval)',
    source: 'LeetCode 1124 / 算法通关课 Class 053 Code05',
    description: '工作日工作大于 8 小时为劳累天，否则为平淡天。求劳累天数严格大于平淡天数的最长连续工作时间段。',
    problemHtml: `
      <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述</h3>
        <p>给你一份工作时间表 <code>hours</code>。如果一天工作超过 <code>8</code> 小时，就是“劳累的一天”。如果一个连续时间段内，劳累的天数<strong>严格大于</strong>不劳累的天数，那么称其为“表现良好的时间段”。求最长时间段的长度。</p>
        <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0; border-radius: 0 6px 6px 0;">
          <strong>示例：</strong><br>
          输入: <code>hours = [9, 9, 6, 0, 6, 6, 9]</code><br>
          输出: <code>3</code> (区间 [9, 9, 6])
        </div>
      </div>
    `,
    analysisHtml: `
      <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">💡 核心原理与前缀和单调栈</h3>
        <p><strong>1. 数值归一化与前缀和：</strong> 大于 8 小时记为 <code>+1</code>，小于等于 8 小时记为 <code>-1</code>。问题转化为：在数组 <code>arr</code> 中寻找最长子数组 <code>[i, j]</code>，使得前缀和 $prefix[j + 1] - prefix[i] > 0$。</p>
        <p><strong>2. 严格递减栈预处理左端点：</strong> 从左向右扫描前缀和，只把更小的前缀和下标压入单调递减栈（只有前缀和更小，才更有希望作为左端点且跨度更大）。</p>
        <p><strong>3. 倒序贪心扫描右端点：</strong> 从 $j = n$ 倒序向前扫描，只要 $prefix[j] > prefix[stack.top()]$，说明找到了一个合法跨度 $j - stack.top()$，弹出栈顶并更新最大长度！由于倒序扫描保证了右端点尽可能大，每个栈元素只会被弹出一次，时间复杂度严格为 $O(N)$！</p>
      </div>
    `,
  },

  // Code06: 子数组最小乘积的最大值 (LeetCode 1856)
  maximumSubarrayMinProduct053: {
    title: '子数组最小乘积的最大值 (Maximum Subarray Min-Product)',
    source: 'LeetCode 1856 / 算法通关课 Class 053 Code06',
    description: '一个数组的最小乘积定义为这个数组中最小值乘以数组的和。给你一个正整数数组 nums ，返回 nums 的任意非空子数组的最小乘积的最大值对 10^9 + 7 取模。',
    problemHtml: `
      <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述</h3>
        <p>一个数组的<strong>最小乘积</strong>定义为这个数组中<strong>最小值乘以数组元素之和</strong>。给你一个正整数数组 <code>nums</code>，请你返回 <code>nums</code> 的任意非空子数组的最小乘积的<strong>最大值</strong>。由于答案可能很大，请对 <code>10^9 + 7</code> 取模。</p>
        <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0; border-radius: 0 6px 6px 0;">
          <strong>示例：</strong><br>
          输入: <code>nums = [1, 2, 3, 2]</code><br>
          子数组 [2, 3, 2] 最小值为 2，和为 7，最小乘积为 2 × 7 = 14。<br>
          输出: <code>14</code>
        </div>
      </div>
    `,
    analysisHtml: `
      <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">💡 核心原理：单调栈 + 前缀和</h3>
        <p><strong>1. 以每个元素作为最小值瓶颈：</strong></p>
        <p>若固定 <code>nums[i]</code> 作为子数组的最小值，要使乘积最大，子数组向左、向右必须<strong>尽可能扩展延伸</strong>，直到遇到严格小于 <code>nums[i]</code> 的元素为止！</p>
        <p><strong>2. 单调递增栈界定最大辐射区间：</strong></p>
        <ul>
          <li>利用单调递增栈求解 <code>nums[cur]</code> 左侧首个小于它的位置 <code>left</code>，以及右侧首个小于它的位置 <code>right</code>；</li>
          <li>最大扩展区间为 <code>[left + 1, right - 1]</code>；</li>
          <li>区间累加和通过前缀和数组 $O(1)$ 获取：$sum = prefix[right] - prefix[left + 1]$；</li>
          <li>最小乘积为 $nums[cur] \times sum$；</li>
        </ul>
        <p>全局维护最大乘积，最后对 $10^9+7$ 取模。整体时间复杂度为严格的 $O(N)$！</p>
      </div>
    `,
  },
};

export const COUNT_SUBMATRICES_PROBLEM_HTML = STACK_053_PROBLEMS.countSubmatrices053.problemHtml;
export const COUNT_SUBMATRICES_EXPLANATION = STACK_053_PROBLEMS.countSubmatrices053.analysisHtml;
export const BIG_FISH_EAT_PROBLEM_HTML = STACK_053_PROBLEMS.bigFishEatSmallFish053.problemHtml;
export const BIG_FISH_EAT_EXPLANATION = STACK_053_PROBLEMS.bigFishEatSmallFish053.analysisHtml;
export const REMOVE_K_DIGITS_PROBLEM_HTML = STACK_053_PROBLEMS.removeKDigits053.problemHtml;
export const REMOVE_K_DIGITS_EXPLANATION = STACK_053_PROBLEMS.removeKDigits053.analysisHtml;
export const REMOVE_DUP_LETTERS_PROBLEM_HTML = STACK_053_PROBLEMS.removeDuplicateLetters053.problemHtml;
export const REMOVE_DUP_LETTERS_EXPLANATION = STACK_053_PROBLEMS.removeDuplicateLetters053.analysisHtml;
export const LONGEST_WPI_PROBLEM_HTML = STACK_053_PROBLEMS.longestWellPerforming053.problemHtml;
export const LONGEST_WPI_EXPLANATION = STACK_053_PROBLEMS.longestWellPerforming053.analysisHtml;
export const MAX_SUBARRAY_MIN_PROD_PROBLEM_HTML = STACK_053_PROBLEMS.maximumSubarrayMinProduct053.problemHtml;
export const MAX_SUBARRAY_MIN_PROD_EXPLANATION = STACK_053_PROBLEMS.maximumSubarrayMinProduct053.analysisHtml;


