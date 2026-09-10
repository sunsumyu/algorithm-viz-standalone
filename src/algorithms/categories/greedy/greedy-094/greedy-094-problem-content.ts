/**
 * 第 94 课：左神贪心算法专题 6 - 题目描述、原题信息与板书证明解析
 */

export const GREEDY_094_PROBLEMS = {
  eliminateMonsters: {
    title: '消灭怪物的最大数量 (Eliminate Maximum Monsters)',
    leetcode: 'LeetCode 1921',
    difficulty: '中等',
    summary: '你有一把武器，每分钟只能消灭一只怪物。给你怪物的初始距离 dist 和移动速度 speed。求在输掉游戏前你最多能消灭多少只怪物。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (LeetCode 1921. 消灭怪物的最大数量)</h3>
        <p>你正在防守城市，怪兽正在向城市逼近。给定数组 <code>dist</code> 和 <code>speed</code>。武器在第 0 分钟准备好，此后每分钟充能完毕可发射一次射杀一只怪物。如果有怪物在第 $t$ 分钟到达城市且未被击杀，游戏失败。返回能够消灭的<b>最大怪物数量</b>。</p>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：到达时间升序排序</h4>
        <p>怪物 $i$ 抵达城市的时间为：</p>
        <div style="padding: 6px 12px; background: #eff6ff; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #1d4ed8;">
          t_i = \\lceil dist[i] / speed[i] \\rceil = \\lfloor (dist[i] + speed[i] - 1) / speed[i] \\rfloor
        </div>
        <p>按到达时间 $t_i$ 升序排序，武器在时间 $i = 0, 1, 2, \dots$ 开火。如果 $t_i \le i$，说明第 $i$ 只怪兽已到达城市，游戏结束，共击杀 $i$ 只；若全部击杀则返回 $n$。</p>

        <div style="padding: 8px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 4px; font-size: 12px; margin-top: 10px;">
          <b>时空复杂度：</b>时间复杂度 $O(N \log N)$（排序），空间复杂度 $O(N)$。
        </div>
      </div>
    `,
  },

  largestPalindromicNumber: {
    title: '最大回文数字 (Largest Palindromic Number)',
    leetcode: 'LeetCode 2384',
    difficulty: '中等',
    summary: '给你一个仅由数字组成的字符串 num。返回你可以使用 num 中的某些数字组成的最大回文整数，不能有前导 0。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (LeetCode 2384. 最大回文数字)</h3>
        <p>给你一个仅由数字组成的字符串 <code>num</code>。返回你可以使用 <code>num</code> 中的某些数字组成的最大回文整数（不能有前导 0，除非整个数为 "0"）。</p>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：成对大数字放两端 + 中心奇数填补</h4>
        <ul>
          <li>统计 0~9 每个数字的频次；</li>
          <li>从 9 到 0 贪心挑选成对的数字，左右两端对称放置；<b>注意：如果两端还没有非零数字，成对的 '0' 坚决不能放在外层</b>，防止产生非法前导 0；</li>
          <li>从 9 到 0 寻找剩余频次为奇数的最大数字，作为回文串的正中心单字符；</li>
          <li>若两端为空且中心也为空，说明全部由 0 组成，直接返回 "0"。</li>
        </ul>

        <div style="padding: 8px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 4px; font-size: 12px; margin-top: 10px;">
          <b>时空复杂度：</b>时间复杂度 $O(N)$，空间复杂度 $O(1)$（固定 10 个数字桶）。
        </div>
      </div>
    `,
  },

  maxAvgPassRatio: {
    title: '最大平均通过率 (Maximum Average Pass Ratio)',
    leetcode: 'LeetCode 1792',
    difficulty: '中等',
    summary: '有若干班级 classes[i] = [pass_i, total_i]。给你 extraStudents 个聪明学生，你可以将他们分配到任意班级。求所有班级通过率的最大平均值。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (LeetCode 1792. 最大平均通过率)</h3>
        <p>给定班级通过情况 <code>classes[i] = [pass_i, total_i]</code>。有 <code>extraStudents</code> 名必定通过考试的学生。求分配这些学生后，所有班级平均通过率的<b>最大可能值</b>。</p>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：大顶堆维护边际增益 $\\Delta$</h4>
        <p>将一个聪明学生放入班级 $(pass, total)$ 带来的单班通过率增加量为：</p>
        <div style="padding: 6px 12px; background: #eff6ff; border-radius: 6px; font-family: 'JetBrains Mono', monospace; font-size: 13px; color: #1d4ed8;">
          \\Delta = \\frac{pass + 1}{total + 1} - \\frac{pass}{total} = \\frac{total - pass}{total \\times (total + 1)}
        </div>
        <p>使用大顶堆维护所有班级的当前边际增益 $\\Delta$。每次贪心弹出增益最大的班级，分配 1 名学生，重新计算该班级的下一次增益并压回堆中，重复分配完所有额外学生！</p>

        <div style="padding: 8px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 4px; font-size: 12px; margin-top: 10px;">
          <b>时空复杂度：</b>时间复杂度 $O((N + K) \\log N)$，空间复杂度 $O(N)$。
        </div>
      </div>
    `,
  },

  minCostHireWorkers: {
    title: '雇佣 K 名工人的最低成本 (Minimum Cost to Hire K Workers)',
    leetcode: 'LeetCode 857',
    difficulty: '困难',
    summary: '有 n 名工人，每名工人的质量为 quality[i]，最低期望工资为 wage[i]。要求雇佣恰好 k 名工人，且每名工人的工资与质量成正比，且不低于期望。求最低总支出。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (LeetCode 857. 雇佣 K 名工人的最低成本)</h3>
        <p>有 $n$ 名工人，质量为 <code>quality</code>，期望最低工资为 <code>wage</code>。要求雇佣恰好 $k$ 名工人，按照质量比例支付报酬且满足所有人的最低期望。求所需支付给这 $k$ 名工人的<b>最低总金额</b>。</p>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：性价比排序 + 大顶堆淘汰最大质量</h4>
        <ul>
          <li>工人要求单位质量报酬为 $r_i = wage[i] / quality[i]$。为了满足团队内所有人的最低期望，团队的报酬系数必须取被雇佣者中最大的 $r_{max}$；</li>
          <li>将所有工人按 $r_i$ 升序排序；</li>
          <li>用<b>大顶堆</b>维护当前团队的工人质量 <code>quality</code>。当堆大小达到 $k$ 时，当前团队总支出为 $r_i \\times \\sum quality$；</li>
          <li>继续遍历更大的 $r_i$，若当前工人质量比堆顶工人更小，则淘汰堆顶大质量工人，换入更小质量以降低总质量之和，刷新最低支出！</li>
        </ul>

        <div style="padding: 8px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 4px; font-size: 12px; margin-top: 10px;">
          <b>时空复杂度：</b>时间复杂度 $O(N \\log N)$，空间复杂度 $O(K)$。
        </div>
      </div>
    `,
  },

  cuttingTree: {
    title: '砍树问题 (Cutting Tree / POJ 2784 贪心规划)',
    leetcode: '经典贪心 / 左神题解 Code05',
    difficulty: '困难',
    summary: '有 n 棵树，每棵树有初始重量 weight 和每日生长速度 growth。在 m 天内每天最多砍一棵树。求在 m 天内能获得的最大砍树重量收益。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (砍树问题 - 生长率排序贪心)</h3>
        <p>一共有 $n$ 棵树，第 $i$ 棵树的初始重量为 $w_i$，每天生长增重为 $g_i$。在 $m$ 天内你每天最多砍 1 棵树。若在第 $j$ 天砍下这棵树，收益为 $w_i + g_i \\times (j - 1)$。求 $m$ 天内能获得的最大总收益。</p>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：生长速度升序排序</h4>
        <p>若我们最终决定砍下某一个由 $k$ 棵树组成的子集，由排序不等式：<b>生长速度越慢的树越应当在较早的天数砍下，生长速度越快的树越应当留在最后几天砍下</b>！</p>
        <p>因此按生长速度 $g_i$ 从小到大排序，消除了天数顺序的后效性，结合动态规划/背包决策或全量天数贪心模拟即可求得全局最优！</p>

        <div style="padding: 8px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 4px; font-size: 12px; margin-top: 10px;">
          <b>时空复杂度：</b>时间复杂度 $O(N \\log N + N \\times M)$，空间复杂度 $O(M)$。
        </div>
      </div>
    `,
  },

  cookingPlan: {
    title: '做菜计划 (Cooking Plan / Reducing Dishes)',
    leetcode: 'LeetCode 1402',
    difficulty: '困难',
    summary: '每道菜制作时间为1，满意度为 satisfaction[i]。若按某种顺序烹饪k道菜，喜爱时间总得分为 sum(satisfaction[i] * time_i)。求可获得的最大总喜爱时间。',
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
        <h3 style="color: #0f172a; margin-top: 0;">📋 题目描述 (LeetCode 1402. 做菜顺序)</h3>
        <p>厨师有一组满意度 <code>satisfaction</code> 的菜肴。每道菜耗时 1 单位时间。第 $i$ 道菜在时间 $t$ 完成的得分为 <code>time * satisfaction[i]</code>。你可以按任意顺序做任意数量的菜，求最大总喜爱时间得分。</p>

        <h4 style="color: #0f172a; margin-bottom: 6px;">💡 核心贪心策略：满意度排序 + 后缀和累加</h4>
        <p>将菜肴按满意度<b>升序排序</b>。满意度越高的菜应当排在越晚的时间制作（获得越大的时间倍率乘积）。</p>
        <p>从最满意的菜逆向向前考察，维护已选菜肴的后缀和 <code>suffixSum</code>。每多往前引入一道菜，之前所有已选菜肴的时间倍率自动 $+1$，相当于总分额外增加当前的 <code>suffixSum</code>！因此只要 <code>suffixSum &gt; 0</code>，就贪心地加入并累加收益，直到 <code>suffixSum &le; 0</code> 为止！</p>

        <div style="padding: 8px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 4px; font-size: 12px; margin-top: 10px;">
          <b>时空复杂度：</b>时间复杂度 $O(N \\log N)$，空间复杂度 $O(1)$。
        </div>
      </div>
    `,
  },
};
