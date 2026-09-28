/**
 * Class 055: 单调队列·下 体系化名师讲义与深度解析
 * 涵盖：
 * Code01: 和至少为 K 的最短子数组 (LeetCode 862)
 * Code02: 满足不等式的最大值 (LeetCode 1499)
 * Code03: 你可以安排的最多任务数目 (LeetCode 2071)
 */

export const QUEUE_055_PROBLEMS = {
  shortestSubarraySumK055: {
    title: '和至少为 K 的最短子数组 (Class 055 / LeetCode 862)',
    difficulty: 'Hard',
    tag: '前缀和 + 单调队列头尾双向操作',
    badge: '【必备】单调队列-下 Code01',
    description: `
      <div style="font-size: 13.5px; line-height: 1.7; color: #334155;">
        <p style="margin-bottom: 8px;">
          给你一个整数数组 <code>nums</code> 和一个整数 <code>k</code>，找出 <code>nums</code> 中和至少为 <code>k</code> 的 <strong>最短非空子数组</strong> 的长度。如果不存在这样的子数组，返回 -1。
        </p>

        <div style="margin: 10px 0; padding: 10px 12px; background: #f8fafc; border-left: 3px solid #3b82f6; border-radius: 4px;">
          <strong style="color: #1e40af;">名师核心洞见：</strong>
          <ul style="margin: 4px 0 0 16px; padding: 0;">
            <li><strong>为什么普通双指针滑动窗口失效？</strong>因为数组中包含<strong>负数</strong>！累加和不再单调，右指针右移和可能变小，左指针右移和可能变大，破坏了贪心单调性。</li>
            <li><strong>前缀和转化：</strong>子数组和为 $sum[i] - sum[j] \ge k$（其中 $j < i$），求 $i - j$ 的最小值。</li>
            <li><strong>队头弹出（答案结算）：</strong>若当前 $sum[i] - sum[deque[h]] \ge k$，说明 $j=deque[h]$ 已经找到一个可行解！后续的 $i'$ 比当前 $i$ 还要大，以 $j$ 为起点的子数组长度必然更长，因此 $j$ 绝无可能再产生更短答案，果断从队头出队（<code>h++</code>）。</li>
            <li><strong>队尾弹出（单调性维护）：</strong>若待入队的 $sum[i] \le sum[deque[t-1]]$，因为 $i$ 下标更大（离未来更近、长度更短）且前缀和更小（更容易让 $sum[x] - sum[i] \ge k$），之前的队尾被 $i$ <strong>完全降维打击淘汰</strong>！果断从队尾弹出（<code>t--</code>），队列单调递增！</li>
          </ul>
        </div>
      </div>
    `,
  },

  maxValueOfEquation055: {
    title: '满足不等式的最大值 (Class 055 / LeetCode 1499)',
    difficulty: 'Hard',
    tag: '数学公式拆分 + 单调递减队列',
    badge: '【必备】单调队列-下 Code02',
    description: `
      <div style="font-size: 13.5px; line-height: 1.7; color: #334155;">
        <p style="margin-bottom: 8px;">
          给你一个按横坐标 $x$ 严格升序排列的点集 <code>points</code> 和一个整数 <code>k</code>。
          请找出 $y_i + y_j + |x_i - x_j|$ 的最大值，满足 $|x_i - x_j| \le k$ 且 $1 \le i < j \le points.length$。
        </p>

        <div style="margin: 10px 0; padding: 10px 12px; background: #f8fafc; border-left: 3px solid #ec4899; border-radius: 4px;">
          <strong style="color: #be185d;">名师核心洞见：</strong>
          <ul style="margin: 4px 0 0 16px; padding: 0;">
            <li><strong>第一步：展开绝对值消除多变量耦合：</strong>
              因为 $i < j$ 且已按 $x$ 升序排列，所以 $x_j > x_i$，$|x_i - x_j| = x_j - x_i$。<br>
              原式 $= y_i + y_j + x_j - x_i = (x_j + y_j) + (y_i - x_i)$。
            </li>
            <li><strong>变量分离：</strong>对于当前遍历到的点 $j$，其 $(x_j + y_j)$ 为定值。要使整体最大，只需在满足 $x_j - x_i \le k$ 的历史点集 $i$ 中，寻找 <strong>$y_i - x_i$ 的最大值</strong>！</li>
            <li><strong>单调队列 O(1) 锁定最强候选：</strong>
              队列内存储历史点的权值 $y - x$，保持从大到小单调递减；<br>
              1. 队头超出距离 $x_j - x_{deque[h]} > k$ 立即过期出队；<br>
              2. 队头权值最大，直接与当前点计算最大值；<br>
              3. 当前点作为未来的前点入队，淘汰队尾权值较小的劣质点。
            </li>
          </ul>
        </div>
      </div>
    `,
  },

  maxTasksAssign055: {
    title: '你可以安排的最多任务数目 (Class 055 / LeetCode 2071)',
    difficulty: 'Hard',
    tag: '二分答案 + 贪心匹配 + 双端队列',
    badge: '【必备】单调队列-下 Code03',
    description: `
      <div style="font-size: 13.5px; line-height: 1.7; color: #334155;">
        <p style="margin-bottom: 8px;">
          给你 $N$ 个任务与 $M$ 名工人，任务需 $tasks[i]$ 力量，工人力量 $workers[j]$。
          你有 $pills$ 粒神奇药丸，每粒可使一名工人的力量增加 $strength$，每人最多吃 1 粒。
          求最多能安排完成多少个任务。
        </p>

        <div style="margin: 10px 0; padding: 10px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 4px;">
          <strong style="color: #065f46;">名师核心洞见：</strong>
          <ul style="margin: 4px 0 0 16px; padding: 0;">
            <li><strong>单调性与二分答案：</strong>若能完成 $m$ 个任务，则必能完成任意 $m' < m$ 个任务。答案满足二分单调性，二分查找最多完成数 $m \in [0, \min(N, M)]$。</li>
            <li><strong>检验函数 f(m) 的黄金贪心法则：</strong>
              要完成 $m$ 个任务，必须选<strong>力量要求最小的 $m$ 个任务</strong>与<strong>力量最大的 $m$ 个工人</strong>！
            </li>
            <li><strong>双端队列调度策略：</strong>
              将工人从小到大遍历：<br>
              1. 工人先不吃药，将所有无需吃药即可胜任的任务放入双端队列尾部；<br>
              2. 若队头任务无需吃药即可被该工人完成，贪心法则：<strong>把最轻松的任务交给最弱但胜任的工人</strong>（队头出队 <code>h++</code>）；<br>
              3. 若不吃药连最轻松任务都完成不了，则必须吃药（消耗 1 粒药），此时解锁吃药后可胜任的任务进队尾，然后<strong>既然吃了药，就要完成当前能拿下的最难任务</strong>（队尾出队 <code>t--</code>），把简单的任务留给后面更弱的工人！
            </li>
          </ul>
        </div>
      </div>
    `,
  },
};
