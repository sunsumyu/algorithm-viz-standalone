/**
 * Class 052: 单调栈（上）体系化名师讲义与原题解析
 *
 * 题目覆盖：
 * 1. Code01: 单调栈无重复值标准模板 (洛谷 P5788 / 牛客)
 * 2. Code02: 单调栈有重复值进阶模板 (链表压入与清算修正)
 * 3. Code03: 每日温度 (LeetCode 739)
 * 4. Code04: 子数组的最小值之和 (LeetCode 907)
 * 5. Code05: 柱状图中最大的矩形 (LeetCode 84)
 * 6. Code06: 最大矩形 (LeetCode 85)
 */

export interface Stack052ProblemContent {
  title: string;
  source: string;
  description: string;
  problemHtml: string;
  analysisHtml: string;
}

export const STACK_052_PROBLEMS: Record<string, Stack052ProblemContent> = {
  // Code01: 无重复值单调栈标准模板
  monotonicStackNoRepeat052: {
    title: '单调栈无重复值标准模板 (求左右最近较小值)',
    source: '洛谷 P5788 / 牛客网 / 算法通关课 Class 052 Code01',
    description: '给定一个无重复元素的数组 arr，对于每一个下标 i，求其左边离它最近且比它小的位置，以及右边离它最近且比它小的位置。若不存在则记为 -1。',
    problemHtml: `
      <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述</h3>
        <p>给定一个没有重复元素的数组 <code>arr</code>，长度为 <code>N</code>。请返回一个二维数组 <code>ans</code>，大小为 <code>N × 2</code>：</p>
        <ul>
          <li><code>ans[i][0]</code> 表示位置 <code>i</code> 左侧离它最近且比 <code>arr[i]</code> 小的位置下标，若不存在则为 <code>-1</code>；</li>
          <li><code>ans[i][1]</code> 表示位置 <code>i</code> 右侧离它最近且比 <code>arr[i]</code> 小的位置下标，若不存在则为 <code>-1</code>。</li>
        </ul>
        <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0; border-radius: 0 6px 6px 0;">
          <strong>要求：</strong> 时间复杂度严格为 <code>O(N)</code>，额外空间复杂度 <code>O(N)</code>。
        </div>
      </div>
    `,
    analysisHtml: `
      <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">💡 核心原理与算法剖析</h3>
        <p><strong>1. 单调栈哲学：利用新元素的“破坏性”迫使老元素出栈结算！</strong></p>
        <p>维护一个<strong>底到顶单调递增</strong>的栈（存下标）。当遍历到下标 <code>i</code> 时：</p>
        <ul>
          <li>若 <code>arr[i] &gt; arr[stack.top()]</code>：满足单调递增，直接压栈；</li>
          <li>若 <code>arr[i] &lt; arr[stack.top()]</code>：单调性被破坏！说明当前 <code>i</code> 是栈顶元素<strong>右边离它最近的更小者</strong>；而栈顶元素在栈中正下方的元素，就是其<strong>左边离它最近的更小者</strong>！弹出栈顶并结算！</li>
        </ul>
        <p><strong>2. 清算阶段 (Clear Stack Phase)</strong></p>
        <p>数组遍历完后，栈中剩余元素依然单调递增。逐一出栈：右侧无更小者（记为 <code>-1</code>），左侧更小者依然是其栈中正下方的元素。</p>
        <p><strong>3. 时间复杂度证明：</strong> 每个下标仅进栈一次、出栈一次，整体耗时为严格的 <code>O(N)</code>！</p>
      </div>
    `,
  },

  // Code02: 有重复值单调栈进阶模板
  monotonicStackWithRepeat052: {
    title: '单调栈有重复值进阶模板 (链表压栈与清算修正)',
    source: '牛客网 单调栈结构(进阶) / 算法通关课 Class 052 Code02',
    description: '给定一个可能包含重复元素的数组 arr，求每个位置左右两边最近且比它小的位置。值相同的元素具有相同的左右较小值。',
    problemHtml: `
      <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述</h3>
        <p>给定一个<strong>可能含有重复元素</strong>的数组 <code>arr</code>，长度为 <code>N</code>。请返回每个位置左右离它最近且比它小的下标（若不存在记为 <code>-1</code>）。</p>
        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 10px 14px; margin: 12px 0; border-radius: 0 6px 6px 0;">
          <strong>重复值难点：</strong> 当遇到相同数值时，如果单独压栈，会导致出栈时左侧或右侧较小值判定错误（误把相同值当作较小值）。
        </div>
      </div>
    `,
    analysisHtml: `
      <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">💡 核心原理与算法剖析</h3>
        <p><strong>方法：栈中每个槽位存储相同值下标的列表（List）</strong></p>
        <ul>
          <li><strong>遇到更大值</strong>：新建一个单元素 List 压入栈顶；</li>
          <li><strong>遇到相同值</strong>：直接挂在当前栈顶 List 的末尾，共同进退！</li>
          <li><strong>遇到更小值</strong>：弹出栈顶整个 List，整个 List 中的所有下标<strong>批量结算</strong>：
            <ul>
              <li>右侧较小值：即为迫使它们出栈的当前元素 <code>i</code>；</li>
              <li>左侧较小值：栈中下方 List 的<strong>最后一个元素（末尾下标）</strong>！</li>
            </ul>
          </li>
          <li><strong>清算阶段</strong>：逐一弹出剩余 List，右侧全为 <code>-1</code>，左侧依然为下层 List 的末尾下标。</li>
        </ul>
        <p>时间复杂度仍为严格的 <code>O(N)</code>，完美规避了重复元素干扰。</p>
      </div>
    `,
  },

  // Code03: 每日温度 (LeetCode 739)
  dailyTemperatures052: {
    title: '每日温度 (Daily Temperatures)',
    source: 'LeetCode 739 / 算法通关课 Class 052 Code03',
    description: '根据每日气温列表，重新生成一个列表。对应位置的输入是需要等待多少天才能等到下一个更高温度的气温。如果之后都不会升高，用 0 替代。',
    problemHtml: `
      <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述</h3>
        <p>给定一个整数数组 <code>temperatures</code>，表示每天的温度。返回一个数组 <code>answer</code>，其中 <code>answer[i]</code> 是指对于第 <code>i</code> 天，下一个更高温度出现在几天后。如果气温在这之后都不会升高，请在该位置用 <code>0</code> 来代替。</p>
        <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0; border-radius: 0 6px 6px 0;">
          <strong>示例：</strong><br>
          输入: <code>temperatures = [73,74,75,71,69,72,76,73]</code><br>
          输出: <code>[1,1,4,2,1,1,0,0]</code>
        </div>
      </div>
    `,
    analysisHtml: `
      <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">💡 核心原理与算法剖析</h3>
        <p><strong>1. 单调递减栈维护下一个更大值：</strong></p>
        <p>本题需要寻找右侧首个比当前温度<strong>更高</strong>的天数。维护一个<strong>底到顶单调递减</strong>的栈（存下标）：</p>
        <ul>
          <li>遍历第 <code>i</code> 天温度 <code>T[i]</code>；</li>
          <li>若 <code>T[i] &gt; T[stack.top()]</code>：升温打破了单调递减！栈顶天数找到了它的下一个更高温日，弹出栈顶 <code>prev</code>，等待天数为 <code>ans[prev] = i - prev</code>；</li>
          <li>持续出栈直到栈空或 <code>T[i] &le; T[stack.top()]</code>，然后将 <code>i</code> 压入栈。</li>
        </ul>
        <p><strong>2. 剩余元素：</strong> 遍历结束仍留在栈中的下标，说明未来再也没有更高温日，默认保持 <code>0</code>。</p>
      </div>
    `,
  },

  // Code04: 子数组的最小值之和 (LeetCode 907)
  sumSubarrayMinimums052: {
    title: '子数组的最小值之和 (Sum of Subarray Minimums)',
    source: 'LeetCode 907 / 算法通关课 Class 052 Code04',
    description: '给定一个整数数组 arr，找到 min(b) 的总和，其中 b 的范围为 arr 的每个（连续）子数组。结果对 10^9 + 7 取模。',
    problemHtml: `
      <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述</h3>
        <p>给定一个整数数组 <code>arr</code>，找到 <code>min(b)</code> 的总和，其中 <code>b</code> 的范围为 <code>arr</code> 的每个（连续）子数组。由于答案可能很大，请对 <code>10^9 + 7</code> 取模。</p>
        <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0; border-radius: 0 6px 6px 0;">
          <strong>示例：</strong><br>
          输入: <code>arr = [3,1,2,4]</code><br>
          连续子数组为 [3],[1],[2],[4],[3,1],[1,2],[2,4],[3,1,2],[1,2,4],[3,1,2,4]<br>
          最小值分别为 3, 1, 2, 4, 1, 1, 2, 1, 1, 1，总和为 17。
        </div>
      </div>
    `,
    analysisHtml: `
      <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">💡 核心原理与贡献法剖析</h3>
        <p><strong>1. 思想转变：从“枚举子数组”转为“计算每个元素的贡献”！</strong></p>
        <p>暴力枚举所有子数组是 <code>O(N^2)</code>。逆向思考：对于每个元素 <code>arr[i]</code>，究竟有多少个子数组以它作为<strong>最小值</strong>？</p>
        <p><strong>2. 单调栈界定有效辐射范围：</strong></p>
        <p>寻找 <code>arr[i]</code> 左边第一个比它小的位置 <code>L</code>，以及右边第一个比它小的位置 <code>R</code>：</p>
        <ul>
          <li>子数组左端点可选范围：<code>[L + 1, i]</code>，共 <code>i - L</code> 种选法；</li>
          <li>子数组右端点可选范围：<code>[i, R - 1]</code>，共 <code>R - i</code> 种选法；</li>
          <li>乘法原理：以 <code>arr[i]</code> 为最小值的子数组总数为 <code>(i - L) × (R - i)</code>；</li>
          <li>贡献累加：<code>ans += (long) arr[i] × (i - L) × (R - i)</code>。</li>
        </ul>
        <p><strong>3. 防重死穴（开闭区间技巧）：</strong></p>
        <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 10px 14px; margin: 8px 0; border-radius: 0 6px 6px 0;">
          若数组有重复值（如 <code>[2, 2]</code>），若两边都找严格小于，两个 2 算出来的子数组会有重叠！<br>
          <strong>解决法则：一边严格小于（如左侧），一边小于等于（如右侧）！</strong> 确保每个子数组由其<strong>最靠左（或最靠右）</strong>的最小值唯一定位！
        </div>
      </div>
    `,
  },

  // Code05: 柱状图中最大的矩形 (LeetCode 84)
  largestRectangleHistogram052: {
    title: '柱状图中最大的矩形 (Largest Rectangle in Histogram)',
    source: 'LeetCode 84 / 算法通关课 Class 052 Code05',
    description: '给定 n 个非负整数，用来表示柱状图中各个柱子的高度。每个柱子彼此相邻，且宽度为 1。求在该柱状图中，能够勾勒出来的矩形的最大面积。',
    problemHtml: `
      <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述</h3>
        <p>给定 <code>n</code> 个非负整数，用来表示柱状图中各个柱子的高度。每个柱子彼此相邻，且宽度为 <code>1</code>。求在该柱状图中，能够勾勒出来的矩形的最大面积。</p>
        <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0; border-radius: 0 6px 6px 0;">
          <strong>示例：</strong><br>
          输入: <code>heights = [2,1,5,6,2,3]</code><br>
          输出: <code>10</code> (柱 5 和 6 形成宽为 2、高为 5 的矩形，面积为 10)
        </div>
      </div>
    `,
    analysisHtml: `
      <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">💡 核心原理与算法剖析</h3>
        <p><strong>1. 以每个柱子作为瓶颈高度：</strong></p>
        <p>任何一个最大矩形的高，必然是某根柱子的完整高度。因此我们考察每根柱子 <code>i</code>：以 <code>heights[i]</code> 作为矩形高，向左、向右最多能扩展多远？</p>
        <p><strong>2. 单调递增栈快速求解左右边界：</strong></p>
        <ul>
          <li>维护一个底到顶单调递增的栈；</li>
          <li>当遇到比栈顶矮的柱子 <code>cur</code> 时，说明栈顶柱子 <code>mid</code> 的右边界确定为 <code>cur</code>；</li>
          <li>弹出 <code>mid</code>，此时栈内新的栈顶即为其左边界 <code>left</code>；</li>
          <li>矩形宽度 <code>W = cur - left - 1</code>，面积 <code>Area = heights[mid] × W</code>；</li>
        </ul>
        <p><strong>3. 优雅哨兵技巧：</strong> 在原数组首尾各添加一个高度为 <code>0</code> 的哨兵柱子，保证所有柱子都能出栈结算且无需特判空栈！</p>
      </div>
    `,
  },

  // Code06: 最大矩形 (LeetCode 85)
  maximalRectangle052: {
    title: '最大矩形 (Maximal Rectangle)',
    source: 'LeetCode 85 / 算法通关课 Class 052 Code06',
    description: '给定一个仅包含 0 和 1 的二维二进制矩阵，找出只包含 1 的最大矩形，并返回其面积。',
    problemHtml: `
      <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述</h3>
        <p>给定一个仅包含 <code>0</code> 和 <code>1</code>、大小为 <code>rows × cols</code> 的二维二进制矩阵，找出只包含 <code>1</code> 的最大矩形，并返回其面积。</p>
        <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 10px 14px; margin: 12px 0; border-radius: 0 6px 6px 0;">
          <strong>示例：</strong><br>
          输入: <code>matrix = [["1","0","1","0","0"],["1","0","1","1","1"],["1","1","1","1","1"],["1","0","0","1","0"]]</code><br>
          输出: <code>6</code>
        </div>
      </div>
    `,
    analysisHtml: `
      <div style="font-family: system-ui, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">💡 核心原理与降维压缩剖析</h3>
        <p><strong>1. 二维压缩为一维柱状图 (LeetCode 85 ➔ LeetCode 84)：</strong></p>
        <p>将二维矩阵逐行扫描。设当前扫描到第 <code>r</code> 行，维护数组 <code>heights[j]</code> 表示以第 <code>r</code> 行为底，第 <code>j</code> 列向上连续 <code>1</code> 的高度：</p>
        <ul>
          <li>若 <code>matrix[r][j] == 1</code>，则 <code>heights[j] += 1</code>；</li>
          <li>若 <code>matrix[r][j] == 0</code>，连续性被打断，<code>heights[j] = 0</code>！</li>
        </ul>
        <p><strong>2. 每一行调用一次直方图最大矩形算法：</strong></p>
        <p>将压缩得到的 <code>heights</code> 数组传入 LeetCode 84 单调栈求解最大矩形，并在遍历所有行的过程中持续刷新全局最大面积！</p>
        <p><strong>3. 复杂度：</strong> 矩阵共 <code>M</code> 行 <code>N</code> 列，每行处理耗时 <code>O(N)</code>，总时间复杂度为严格的 <code>O(M × N)</code>！</p>
      </div>
    `,
  },
};
