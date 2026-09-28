/**
 * Class 056: 并查集·上 体系化名师讲义与深度解析
 * 涵盖：
 * Code01/02: 并查集模版与路径压缩 (洛谷 P3367 / 牛客)
 * Code03: 情侣牵手与置换环定理 (LeetCode 765)
 * Code04: 相似字符串组 (LeetCode 839)
 * Code05: 岛屿数量并查集二维合并 (LeetCode 200)
 */

export const UNION_FIND_056_PROBLEMS = {
  unionFindTemplate056: {
    title: '并查集核心模版与路径压缩 (Class 056 / 洛谷 P3367 / 牛客)',
    difficulty: 'Medium',
    tag: '并查集模版 · 路径压缩 · 小挂大',
    badge: '【必备】并查集-上 Code01/02',
    description: `
      <div style="font-size: 13.5px; line-height: 1.7; color: #334155;">
        <p style="margin-bottom: 8px;">
          如题，现在有一个包含 $N$ 个元素的集合，初始时每个元素各成一个独立集合。接着进行 $M$ 次操作：
          <br>1. 将两个元素所在的集合合并（<code>union(x, y)</code>）；
          <br>2. 询问两个元素是否属于同一集合（<code>isSameSet(x, y)</code>）。
        </p>

        <div style="margin: 10px 0; padding: 10px 12px; background: #f8fafc; border-left: 3px solid #3b82f6; border-radius: 4px;">
          <strong style="color: #1e40af;">名师核心洞见：</strong>
          <ul style="margin: 4px 0 0 16px; padding: 0;">
            <li><strong>树形代表元模型：</strong>每个集合由一棵多叉树表达，树根代表该集合。<code>father[i]</code> 存储父节点，树根满足 <code>father[root] == root</code>。</li>
            <li><strong>路径压缩（Path Compression）：</strong>每次调用 <code>find(i)</code> 向上攀爬找到树根后，在递归返回或栈展开时，<strong>将沿途所有节点直接挂在树根下方</strong>（<code>father[i] = root</code>），使得树的高度瞬间压平至 1，后续查询平摊耗时近乎 $O(1)$！</li>
            <li><strong>小挂大（Union by Rank/Size）：</strong>合并两棵树时，将节点数较少的树根挂到节点数较多的树根下方，防止树形退化为长链。</li>
            <li><strong>反阿克曼函数 $\alpha(N)$：</strong>路径压缩与小挂大同时使用时，单次操作时间复杂度为 $O(\alpha(N))$，实际运行中几乎就是 $O(1)$ 常数时间！</li>
          </ul>
        </div>
      </div>
    `,
  },

  couplesHoldingHands056: {
    title: '情侣牵手与置换环定理 (Class 056 / LeetCode 765)',
    difficulty: 'Hard',
    tag: '置换环分解 · 贪心并查集 · N - Sets',
    badge: '【必备】并查集-上 Code03',
    description: `
      <div style="font-size: 13.5px; line-height: 1.7; color: #334155;">
        <p style="margin-bottom: 8px;">
          $N$ 对情侣坐在连续的 $2N$ 个座位上，第 $i$ 对情侣的编号是 $(2i, 2i+1)$。相邻的两个座位 $(2k, 2k+1)$ 为一张双人沙发。
          你可以交换任意两个人的座位。请返回<strong>最少交换次数</strong>，使得每对情侣都能坐在同一张沙发上。
        </p>

        <div style="margin: 10px 0; padding: 10px 12px; background: #f8fafc; border-left: 3px solid #8b5cf6; border-radius: 4px;">
          <strong style="color: #6b21a8;">名师核心洞见：</strong>
          <ul style="margin: 4px 0 0 16px; padding: 0;">
            <li><strong>情侣对缩点建模：</strong>将每一对情侣视作一个点（共 $N$ 个点）。每个双人沙发上坐了两个人，若他们来自情侣对 $A$ 和情侣对 $B$，则在点 $A$ 和点 $B$ 之间连一条无向边！</li>
            <li><strong>置换环的数学定理：</strong>
              若 $k$ 对情侣发生错位纠缠连成了一个闭合环（连通块），通过精巧的交换，<strong>只需 $k - 1$ 次交换即可拆解该环让全部 $k$ 对情侣归位</strong>！
            </li>
            <li><strong>最少交换次数公式：</strong>
              全图总交换次数 $= \sum (k_i - 1) = \sum k_i - \sum 1 = \mathbf{N - Sets}$！<br>
              其中 $N$ 是情侣总对数，$Sets$ 是并查集最终的独立连通分量总数。
            </li>
          </ul>
        </div>
      </div>
    `,
  },

  similarStringGroups056: {
    title: '相似字符串组 (Class 056 / LeetCode 839)',
    difficulty: 'Hard',
    tag: '字符串图论建模 · 两两相似连通性 · 并查集计数',
    badge: '【必备】并查集-上 Code04',
    description: `
      <div style="font-size: 13.5px; line-height: 1.7; color: #334155;">
        <p style="margin-bottom: 8px;">
          如果交换字符串 $X$ 中的两个不同位置的字母可以得到 $Y$，那么称 $X$ 和 $Y$ 是一对<strong>相似字符串</strong>；若两字符串完全相等也算相似。
          给你一个字母异位词列表 <code>strs</code>，求这组字符串中<strong>相似字符串组（连通块）的总数量</strong>。
        </p>

        <div style="margin: 10px 0; padding: 10px 12px; background: #f8fafc; border-left: 3px solid #ec4899; border-radius: 4px;">
          <strong style="color: #be185d;">名师核心洞见：</strong>
          <ul style="margin: 4px 0 0 16px; padding: 0;">
            <li><strong>相似的充要条件：</strong>长度相等的两单词，对应位置不同字符的个数<strong>正好等于 0（完全相等）或等于 2（恰好一次交换对调）</strong>！若不同位置数 $\ge 3$，则绝对无法通过一次对调变换得到。</li>
            <li><strong>图的连通块合并：</strong>将每一个字符串作为一个节点，初始时有 $N$ 个独立集合。$O(N^2 \cdot L)$ 枚举所有点对 $(i, j)$，只要满足相似判定，立即调用 <code>union(i, j)</code>。</li>
            <li><strong>最终结果：</strong>并查集剩余的独立集合数，即为相似字符串组的总数量。</li>
          </ul>
        </div>
      </div>
    `,
  },

  numberOfIslands056: {
    title: '岛屿数量并查集二维扁平化 (Class 056 / LeetCode 200)',
    difficulty: 'Medium',
    tag: '二维坐标展平 · 动态行优先加边 · 连通分量收敛',
    badge: '【必备】并查集-上 Code05',
    description: `
      <div style="font-size: 13.5px; line-height: 1.7; color: #334155;">
        <p style="margin-bottom: 8px;">
          给你一个由 <code>'1'</code>（陆地）和 <code>'0'</code>（水）组成的的二维网格，请你计算网格中相连岛屿的数量。
        </p>

        <div style="margin: 10px 0; padding: 10px 12px; background: #f8fafc; border-left: 3px solid #10b981; border-radius: 4px;">
          <strong style="color: #065f46;">名师核心洞见：</strong>
          <ul style="margin: 4px 0 0 16px; padding: 0;">
            <li><strong>二维网格扁平化：</strong>网格大小为 $R \times C$，每个格子 $(r, c)$ 对应一维唯一 ID：$r \times C + c$。</li>
            <li><strong>并查集动态加边法：</strong>
              统计全图中陆地 <code>'1'</code> 的总数作为初始集合数 <code>sets</code>。<br>
              从左到右、从上到下扫描每一个陆地格子 $(r, c)$，只需<strong>向左看 $(r, c-1)$</strong> 与 <strong>向上看 $(r-1, c)$</strong>！如果相邻也是 <code>'1'</code>，调用 <code>union</code> 合并，每成功合并一次 <code>sets--</code>。
            </li>
            <li><strong>为什么只需看左和上？</strong>
              行优先扫描保证了每个相邻关系只会被考虑一次，绝不重复加边，扫描结束后 <code>sets</code> 恰好等于全图孤立岛屿数量。
            </li>
          </ul>
        </div>
      </div>
    `,
  },
};
