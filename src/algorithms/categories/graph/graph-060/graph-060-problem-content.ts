/**
 * 左程云算法通关课 Class 060: 拓扑排序扩展专题
 * 包含 6 道重难点算法的完整讲义、状态转移方程与复杂度分析
 */

export interface Graph060ProblemContent {
  title: string;
  source: string;
  difficulty: string;
  timeComplexity: string;
  spaceComplexity: string;
  html: string;
}

export const GRAPH_060_PROBLEMS: Record<string, Graph060ProblemContent> = {
  foodChain060: {
    title: '最大食物链计数 (洛谷 P4017)',
    source: '洛谷 P4017 / 左程云 Class 060 Code01',
    difficulty: '普及/提高-',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)',
    html: `
      <div style="line-height: 1.6; font-size: 13px; color: #334155;">
        <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">一、题目描述</h3>
        <p>给你一个食物网，包含 $n$ 种生物和 $m$ 条捕食关系。如果一种生物没有任何捕食者（入度为 0），它就是顶级生产者；如果没有任何猎物去吃它（出度为 0），它就是最高级消费者。求食物网中从任意生产者到任意消费者的完整食物链总数，答案对 80112002 取模。</p>

        <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 12px 0 6px;">二、核心模型：DAG 路径累加动态规划</h3>
        <ul style="padding-left: 20px; margin: 0;">
          <li><strong>初始状态</strong>：所有入度为 0 的生产者，初始链数 lines[u] = 1，并加入拓扑队列。</li>
          <li><strong>状态转移</strong>：当生物 $u$ 被捕食者 $v$ 吃时（边 $u \to v$），$lines[v] = (lines[v] + lines[u]) \bmod 80112002$。</li>
          <li><strong>统计答案</strong>：所有出度为 0 的顶级消费者 lines[v] 累加和即为全局食物链总数。</li>
        </ul>
      </div>
    `,
  },

  loudAndRich060: {
    title: '喧闹和富有 (LeetCode 851)',
    source: 'LeetCode 851 / 左程云 Class 060 Code02',
    difficulty: '中等',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)',
    html: `
      <div style="line-height: 1.6; font-size: 13px; color: #334155;">
        <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">一、题目描述</h3>
        <p>有一群人，其中有些人比其他人更富有。现有 richer 数组表示富裕关系，quiet[i] 表示第 i 个人在聚会上的安静值。返回一个数组 answer，其中 answer[x] = y 表示在所有拥有不小于 x 财富的人中，最安静的人（即 quiet[y] 最小）。</p>

        <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 12px 0 6px;">二、拓扑排序与最值传递</h3>
        <ul style="padding-left: 20px; margin: 0;">
          <li><strong>反向建图</strong>：若 $a$ 比 $b$ 富有，则连有向边 $a \to b$（财富从更富有流向较贫穷）。</li>
          <li><strong>递推维护</strong>：初始每个人拥有不小于自己财富的最安静者是他自己 answer[i] = i。</li>
          <li><strong>拓扑传播</strong>：当 $a$ 出队松弛邻边 $a \to b$ 时，如果 quiet[answer[a]] < quiet[answer[b]]，更新 answer[b] = answer[a]。</li>
        </ul>
      </div>
    `,
  },

  parallelCourses060: {
    title: '并行课程 III (LeetCode 2050)',
    source: 'LeetCode 2050 / 左程云 Class 060 Code03',
    difficulty: '困难',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V + E)',
    html: `
      <div style="line-height: 1.6; font-size: 13px; color: #334155;">
        <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">一、题目描述</h3>
        <p>给你一个整数 n 表示课程数目，编号 1 到 n。relations[i] = [prevCourse_i, nextCourse_i] 表示先修关系，time[i] 表示上完第 i 门课程所需时间。在无先修限制时任意课程可同时并行学习，求修完全部课程所需的最少月份数。</p>

        <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 12px 0 6px;">二、DAG 关键路径 (Critical Path Method · CPM)</h3>
        <ul style="padding-left: 20px; margin: 0;">
          <li><strong>瓶颈前驱</strong>：一门课程必须等待其所有先修课程全部完成后才能开课，因此完成该课程的最早时间取决于所有前驱的最晚完成时间：cost[v] = max(cost[v], cost[u] + time[v])。</li>
          <li><strong>拓扑驱动</strong>：入度为 0 的课程可立即开课（cost[u] = time[u]），随拓扑序递推，全局最长路径即为答案。</li>
        </ul>
      </div>
    `,
  },

  maxEmployees060: {
    title: '参加会议的最多员工数 (LeetCode 2127)',
    source: 'LeetCode 2127 / 左程云 Class 060 Code04',
    difficulty: '困难',
    timeComplexity: 'O(V)',
    spaceComplexity: 'O(V)',
    html: `
      <div style="line-height: 1.6; font-size: 13px; color: #334155;">
        <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">一、题目描述</h3>
        <p>一个公司准备组织一场会议，邀请名单上有 n 位员工。每位员工都有一个喜欢坐在一起的人 favorite[i]。圆桌会议上，每个人必须紧挨着他喜欢的人入座。求最多可以邀请多少位员工参加会议。</p>

        <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 12px 0 6px;">二、内向基环树拓扑剥离分解</h3>
        <ul style="padding-left: 20px; margin: 0;">
          <li><strong>图的拓扑形态</strong>：每个节点出度严格为 1，图由若干个互不相交的“内向基环树（环上挂树）”组成。</li>
          <li><strong>拓扑剥离外围树枝</strong>：用拓扑排序不断剥离入度为 0 的节点，统计挂在环节点上的最长链深 maxDepth[u]。</li>
          <li><strong>环大小分类讨论</strong>：
            <br>1. <strong>大小 $\ge 3$ 的大环</strong>：无法挂外围员工，只能整环入座，取所有大环长度的最大值；
            <br>2. <strong>大小 $= 2$ 的互偶环</strong>：两个人互为喜爱，两边可各自接入最长延伸外向链，所有长度为 2 的小环加链长可以全部拼在一起！</li>
        </ul>
      </div>
    `,
  },

  stampingSequence060: {
    title: '戳印序列 (LeetCode 936)',
    source: 'LeetCode 936 / 左程云 Class 060 Code05',
    difficulty: '困难',
    timeComplexity: 'O(N · (N - M))',
    spaceComplexity: 'O(N · (N - M))',
    html: `
      <div style="line-height: 1.6; font-size: 13px; color: #334155;">
        <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">一、题目描述</h3>
        <p>你想要用小写字母组成的长为 n 的目标字符串 target。你有一枚印章 stamp，每次盖印都会将 target 中连续长为 m 的子串完全覆盖。你可以盖印至多 10 * n 次，求盖印的逆向拓扑还原顺序。</p>

        <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 12px 0 6px;">二、时光倒流：逆向拓扑排序</h3>
        <ul style="padding-left: 20px; margin: 0;">
          <li><strong>逆向视角</strong>：最后一次盖印的区间必须与 stamp 完全一致（差异度入度 inDegree = 0）。</li>
          <li><strong>通配符扩散</strong>：将匹配成功的区间“扣下”，全部变为通配符 '?'，同时降低与之重叠的其他窗口的差异度。</li>
          <li><strong>入度削减拓扑驱动</strong>：重叠窗口中差异度降为 0 时入队，继续拓扑逆推，最终反转得到正向盖印步骤。</li>
        </ul>
      </div>
    `,
  },

  largestColorValue060: {
    title: '有向图中的最长颜色路径 (LeetCode 1857)',
    source: 'LeetCode 1857 / 左程云 Class 060 Code06',
    difficulty: '困难',
    timeComplexity: 'O(26 · (V + E))',
    spaceComplexity: 'O(26 · V + E)',
    html: `
      <div style="line-height: 1.6; font-size: 13px; color: #334155;">
        <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">一、题目描述</h3>
        <p>给你一个有向图，每个节点被分配 26 种英文字母之一的颜色 colors[i]。一条路径的颜色值是路径上出现频次最高的颜色的出现次数。若图中存在有向环则返回 -1；否则返回全局所有路径中的最大颜色值。</p>

        <h3 style="font-size: 15px; font-weight: 700; color: #0f172a; margin: 12px 0 6px;">二、拓扑排序判环 + 26 维动态规划</h3>
        <ul style="padding-left: 20px; margin: 0;">
          <li><strong>环路拦截</strong>：若拓扑排序出队节点数小于顶点总数 n，判定存在有向环，直接返回 -1。</li>
          <li><strong>26 颜色维度状态转移</strong>：dp[v][c] 表示以节点 v 为终点的所有路径中，颜色 c 的最大频次。</li>
          <li><strong>松弛转移</strong>：对于边 $u \to v$，$\forall c \in [0..25], dp[v][c] = \max(dp[v][c], dp[u][c])$，并在出队时自身颜色累加 1。</li>
        </ul>
      </div>
    `,
  },
};
