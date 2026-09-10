/**
 * 左神算法通关课 108 ~ 116 高阶区间数据结构专题题目描述与原理解析
 */

export const TREE_108_116_PROBLEMS = {
  fenwickTree: {
    title: '树状数组核心原理 (Class 108)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (洛谷 P3374 【模板】树状数组 1)</h2>
        <p>已知一个数列，要求实现两种操作：</p>
        <ol>
          <li>将某一个数加上 <code>x</code>（单点修改）。</li>
          <li>求出某区间 <code>[l, r]</code> 内所有数的和（区间查询）。</li>
        </ol>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">树状数组二进制索引设计</h3>
        <p>1. <strong>lowbit(x) = x & (-x)</strong>：提取 <code>x</code> 的二进制最低位的 1，决定了 <code>Tree[i]</code> 所管辖的区间长度。</p>
        <p>2. <strong>单点增加 add(i, v)</strong>：不断执行 <code>i += lowbit(i)</code>，顺着二叉父链向右上方传播，仅需 <code>O(log N)</code> 次更新。</p>
        <p>3. <strong>前缀和查询 query(i)</strong>：不断执行 <code>i -= lowbit(i)</code>，剥离最低位 1 向左下跳转累加，<code>O(log N)</code> 完成前缀和。</p>
      </div>
    `,
  },

  fenwickInversion: {
    title: '树状数组求逆序对数 (Class 109)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (洛谷 P1908 逆序对)</h2>
        <p>猫猫 TOM 和小老鼠 JERRY 在玩一个游戏：给定一个长度为 <code>n</code> 的数列，求其中满足 <code>i < j</code> 且 <code>a[i] > a[j]</code> 的逆序对总数。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">离散化 + 倒序统计</h3>
        <p>1. <strong>离散化处理</strong>：值域很大时，将原始数值按大小映射到 <code>1 ~ n</code> 的离散排名 (Rank)。</p>
        <p>2. <strong>倒序扫描</strong>：从右往左遍历每一个元素 <code>r</code>，在树状数组中查询比 <code>r</code> 小的已入库元素数量 <code>query(r - 1)</code>，然后将当前数入库 <code>add(r, 1)</code>，总时间复杂度严格为 <code>O(N log N)</code>。</p>
      </div>
    `,
  },

  segmentTree: {
    title: '经典线段树与懒惰标记 (Class 110)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (洛谷 P3372 【模板】线段树 1)</h2>
        <p>如题，已知一个数列，要求支持两种操作：</p>
        <ol>
          <li>将某区间 <code>[l, r]</code> 内所有数加上 <code>k</code>（区间修改）。</li>
          <li>求出某区间 <code>[l, r]</code> 内所有数的和（区间求和）。</li>
        </ol>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">懒惰标记 (Lazy Tag) 核心优化</h3>
        <p>如果直接更新到每个叶子节点，单次区间修改将退化为 <code>O(N)</code>。通过在完全包含的目标区间打上 <code>lazy</code> 标记并立即返回，推迟下传操作，仅在后续访问子节点时才通过 <code>pushDown</code> 下传一层，保证每次区间操作都在 <code>O(log N)</code> 内完成。</p>
      </div>
    `,
  },

  dynamicSegmentTree: {
    title: '动态开点线段树 (Class 111)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (LeetCode 715 / 洛谷 P2781)</h2>
        <p>当坐标轴值域极大（如 <code>1 ~ 10^9</code>），但实际操作次数较少（如 <code>Q = 10^5</code>）时，静态分配 <code>4*N</code> 大小的数组会导致内存溢出（MLE）。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">按需创建指针节点</h3>
        <p>每个节点维护指向左子节点和右子节点的指针（或动态索引），初始只有根节点。当递归遍历到未创建的子树分支时，按需动态分配新节点，空间复杂度由 <code>O(N)</code> 锐减至 <code>O(Q log V)</code>。</p>
      </div>
    `,
  },

  intervalMerge: {
    title: '区间合并线段树 (Class 113)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (洛谷 P4513 小白逛公园 / GSS1)</h2>
        <p>给定一个序列，支持单点修改，并高频查询区间 <code>[l, r]</code> 内的<strong>最大连续子段和</strong>。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">四元组合并定理 (pushUp)</h3>
        <p>线段树节点必须维护 4 个信息：</p>
        <ul>
          <li><code>sum</code>：区间总和 = <code>left.sum + right.sum</code></li>
          <li><code>lmax</code>：紧贴左端点的最大前缀和 = <code>max(left.lmax, left.sum + right.lmax)</code></li>
          <li><code>rmax</code>：紧贴右端点的最大后缀和 = <code>max(right.rmax, right.sum + left.rmax)</code></li>
          <li><code>maxSum</code>：区间内最大子段和 = <code>max(left.maxSum, right.maxSum, left.rmax + right.lmax)</code>（跨越中点合并）</li>
        </ul>
      </div>
    `,
  },

  sweepLine: {
    title: '扫描线与矩形面积并 (Class 115)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">题目概述 (洛谷 P5490 【模板】扫描线)</h2>
        <p>求 <code>n</code> 个在平面直角坐标系中的矩形所覆盖的<strong>面积总和</strong>（重叠部分只计一次）。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">线段树 + 事件点扫描</h3>
        <p>1. <strong>竖直扫描线</strong>：将每个矩形的左右垂直边看作事件点（左入边 +1，右出边 -1），沿 x 轴从左往右推进。</p>
        <p>2. <strong>Y 轴线段树离散化</strong>：用线段树维护当前扫描线切片上有效覆盖的纵向长度 <code>len</code>。</p>
        <p>3. <strong>积分求和</strong>：每跨越两个相邻事件点 <code>(x[i+1] - x[i])</code>，累加面积 <code>len * Δx</code>，在 <code>O(N log N)</code> 内求出多矩形融合面积并。</p>
      </div>
    `,
  },
};
