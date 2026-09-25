/**
 * 左程云算法通关课 Class 065: A* 算法与经典面试题
 * 包含题目描述、名师讲义、解题思路与时空复杂度分析
 */

export interface Graph065ProblemInfo {
  title: string;
  source: string;
  difficulty: '简单' | '中等' | '困难';
  summary: string;
  problemHtml: string;
  complexityHtml: string;
}

export const GRAPH_065_PROBLEMS: Record<string, Graph065ProblemInfo> = {
  'sliding-puzzle-065': {
    title: '滑动谜题 (Sliding Puzzle)',
    source: 'LeetCode 773 / 左程云 Class 065 Code02',
    difficulty: '困难',
    summary: '2x3 网格滑动谜题，空位 0 与相邻数字交换，求到达目标状态 [[1,2,3],[4,5,0]] 的最小步数。采用曼哈顿距离启发式 A* 搜索。',
    problemHtml: `
      <div style="font-family: inherit; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">📜 题目描述 (LeetCode 773)</h4>
        <p>在一个 <code>2 x 3</code> 的板上（<code>board</code>）有 5 块砖瓦，用数字 <code>1~5</code> 来表示，以及一块空位用 <code>0</code> 来表示。一次 <b>移动</b> 定义为 <code>0</code> 与其相邻 4 个方向之一的数字交换位置。</p>
        <p>当板平铺为 <code>[[1,2,3],[4,5,0]]</code> 时，谜板被解开。若能解开，返回解开板所需的<b>最少移动次数</b>；若无法解开，返回 <code>-1</code>。</p>

        <h4 style="margin: 12px 0 6px 0; color: #0f172a; font-size: 15px;">💡 左神核心点拨：A* 启发式定向搜索</h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
          <li><b>状态表示与图建模</b>：将 2x3 棋盘序列化为长度 6 的字符串，总状态数最多 $6! = 720$ 种，属于离散状态空间寻路。</li>
          <li><b>估价函数 $f = g + h$</b>：
            <ul>
              <li>$g$：从初始状态到当前状态实际移动的累积步数；</li>
              <li>$h$：<b>曼哈顿距离启发函数</b>，每个数字 $v \in [1, 5]$ 当前位置与其目标位置的行距加列距之和 $\sum |r_v - r_{target}| + |c_v - c_{target}|$；</li>
              <li><b>可采纳性 (Admissibility)</b>：每次移动数字至多使其与目标的曼哈顿距离减 1，故 $h$ 绝不超过实际最小步数（$h \le h^*$），保证 A* 首次弹出目标状态时必为全局最优解！</li>
            </ul>
          </li>
          <li><b>小根堆优先探索</b>：以 $f = g + h$ 升序排列，曼哈顿距离最小、离目标最近的分支优先展开。</li>
        </ul>
      </div>
    `,
    complexityHtml: `
      <div style="font-size: 12.5px; color: #475569; line-height: 1.5;">
        <div><b>时间复杂度：</b>最坏 $O(V \log V)$，其中状态上限 $V \le 6! = 720$。A* 启发函数大幅削减搜索树分支，通常数毫秒内即达目标。</div>
        <div><b>空间复杂度：</b>$O(V)$，优先队列与访问哈希表至多存放 720 个状态。</div>
      </div>
    `,
  },

  'eight-puzzle-065': {
    title: '八数码难题 (Eight Puzzle)',
    source: '洛谷 P1379 / 左程云 Class 065 Code03',
    difficulty: '困难',
    summary: '经典 3x3 棋盘滑动，9 个方格中含 8 个数字与 1 个空格 0。基于逆序对奇偶剪枝与曼哈顿距离估价函数的 A* 启发式寻路。',
    problemHtml: `
      <div style="font-family: inherit; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">📜 题目描述 (洛谷 P1379)</h4>
        <p>在 <code>3 x 3</code> 的棋盘上摆放着 8 个数字板（<code>1~8</code>）和一个空格（<code>0</code>）。空格可以与上下左右相邻的滑块对调。求从给定初始棋盘变换到目标棋盘 <code>123804765</code> 所需的<b>最少移动步数</b>。</p>

        <h4 style="margin: 12px 0 6px 0; color: #0f172a; font-size: 15px;">💡 左神核心点拨：可解性剪枝与曼哈顿启发</h4>
        <ul style="margin: 0; padding-left: 20px; font-size: 13px;">
          <li><b>可解性判定（逆序对奇偶性）</b>：
            <ul>
              <li>排除空格 0 后，将其余 8 个数字拉平为一维序列计算<b>逆序对总数</b>；</li>
              <li>在 3x3 棋盘中，空格左右移动不改变逆序对；空格上下移动相当于跨越两个数字，逆序对增减必定为 0 或 $\pm 2$（奇偶性不变！）；</li>
              <li><b>定理</b>：初始状态与目标状态可达的充要条件是两者的逆序对数同奇偶！若不同奇偶，可直接判定无解，瞬间剪枝！</li>
            </ul>
          </li>
          <li><b>曼哈顿启发式 A* 搜索</b>：
            <ul>
              <li>$9! = 362,880$ 种排列，连通分量包含约 18 万种状态；朴素 BFS 极其耗时；</li>
              <li>A* 结合曼哈顿距离 $h(state)$，搜索范围由全向球形扩散收束为朝向目标的紧凑椭圆光束，极大加速求解！</li>
            </ul>
          </li>
        </ul>
      </div>
    `,
    complexityHtml: `
      <div style="font-size: 12.5px; color: #475569; line-height: 1.5;">
        <div><b>时间复杂度：</b>$O(K \log K)$，其中 $K$ 为启发式访问的有效状态数，远小于全量 181,440 种状态。</div>
        <div><b>空间复杂度：</b>$O(K)$，使用优先队列维护当前波前，哈希表记录各状态最优 $g$ 值。</div>
      </div>
    `,
  },
};
