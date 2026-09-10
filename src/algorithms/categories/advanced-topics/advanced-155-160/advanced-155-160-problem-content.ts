/**
 * 左神算法通关课 155 ~ 160 动态树、可持久化数据结构、树上启发式合并、莫队与 FFT 题目与解析
 */

export const ADVANCED_155_160_PROBLEMS = {
  lct: {
    title: '动态树 Link-Cut Tree (Class 155)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (Tarjan 发明 / 洛谷 P3690 【模板】动态树 LCT)</h2>
        <p><strong>Link-Cut Tree (LCT)</strong> 是一种维护动态森林联通性与树上路径信息的终极数据结构。它支持动态加边 <code>link(x, y)</code>、动态删边 <code>cut(x, y)</code>、修改点权与路径信息聚合，均摊时间复杂度为稳定 <code>O(log N)</code>。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">实链剖分与辅助树 (Auxiliary Splay Tree)</h3>
        <p>1. <strong>实链剖分 (Preferred Path)</strong>：每个节点至多与一个儿子连成实边，其余为虚边。整棵树被剖分为若干条互不相交的实链。</p>
        <p>2. <strong>辅助树结构</strong>：每条实链用一棵 Splay 树维护，中序遍历严格对应链上深度单调递增的节点序列；虚边由 Splay 的根节点指向原树的父节点，但父节点的子指针不指向该根节点（“认父不认子”）。</p>
        <p>3. <strong>核心操作</strong>：</p>
        <ul>
          <li><code>access(x)</code>：将根节点到 <code>x</code> 的路径彻底打通为一条实链，其余旁支变为虚边。</li>
          <li><code>makeroot(x)</code>：利用 <code>access(x) + splay(x)</code> 并打上翻转标记，将 <code>x</code> 提升为整棵原树的根。</li>
          <li><code>link(x, y)</code>：使 <code>makeroot(x)</code>，连虚边 <code>fa[x] = y</code>。</li>
          <li><code>cut(x, y)</code>：提取路径断开父子指针。</li>
        </ul>
      </div>
    `,
  },

  persistentSegmentTree: {
    title: '可持久化线段树 / 主席树 (Class 156)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (中国学者黄嘉泰发明 / 洛谷 P3834 【模板】可持久化线段树 2)</h2>
        <p><strong>主席树 (Persistent Segment Tree)</strong> 能够在每次单点修改或版本演进时，仅新建 <code>O(log N)</code> 个被修改路径上的节点，而未修改的子树完全与历史版本共享指针，支持在 <code>O(log N)</code> 内查询历史任意版本状态以及区间静态第 K 大/小元素。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">前缀和差分求区间第 K 小</h3>
        <p>1. <strong>权值线段树版本链</strong>：对序列每个前缀 <code>1..i</code> 建立一棵权值线段树版本 <code>root[i]</code>，维护各个值域桶的出现频次计数。</p>
        <p>2. <strong>前缀线段树差分</strong>：区间 <code>[L, R]</code> 的频次等价于版本 <code>root[R]</code> 减去版本 <code>root[L - 1]</code>。若左子树节点数差值 <code>count_left >= K</code>，则答案在左子树递归查询；否则递归右子树查询第 <code>K - count_left</code> 小。</p>
      </div>
    `,
  },

  persistentTreap: {
    title: '可持久化平衡树 (Class 157)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (洛谷 P3835 【模板】可持久化平衡树)</h2>
        <p>传统自平衡二叉树因为旋转调整具有全局副作用，极难进行可持久化。而 <strong>FHQ-Treap (非旋 Treap)</strong> 仅通过 <code>split</code> 与 <code>merge</code> 实现，在递归路径上复制节点（Copy-on-Write），使得每次操作仅增加 <code>O(log N)</code> 个新节点，完美支持全量历史版本回溯与分支分叉。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">写时复制 (COW) 机制</h3>
        <p>1. <strong>克隆节点</strong>：在向下分裂 <code>split</code> 或向上合并 <code>merge</code> 途经任一节点时，先克隆一份新副本 <code>clone(u)</code>，所有指针修改均作用于副本之上。</p>
        <p>2. <strong>历史安全性</strong>：旧版本树根及其所有子节点拓扑指针严格不受任何干扰，实现均摊 <code>O(log N)</code> 且零破坏的历史快照。</p>
      </div>
    `,
  },

  dsuOnTree: {
    title: '树上启发式合并 DSU on Tree (Class 158)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (CF600E Lomsat gelh / 树上优雅离线统计)</h2>
        <p><strong>DSU on Tree (树上启发式合并)</strong> 是一种利用重链剖分性质，在 <code>O(N log N)</code> 时间内高效解决树上子树各深度/颜色无修改离线询问的强大算法技巧。它免去了复杂的莫队分块或可持久化线段树合并，代码极短、常数极小。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">轻重儿子差别对待调度</h3>
        <p>1. <strong>轻儿子递归并清空</strong>：先递归遍历所有轻儿子子树，计算答案后将桶计数数组彻底清空（避免污染兄弟）。</p>
        <p>2. <strong>重儿子递归并保留</strong>：最后递归遍历重儿子子树，计算答案后<strong>保留全局桶计数</strong>！</p>
        <p>3. <strong>轻儿子暴力并入</strong>：再次遍历所有轻儿子节点并入全局桶，回答当前节点的询问。由于每个节点向根跳轻边至多 <code>log N</code> 次，全局复杂度严格 <code>O(N log N)</code>。</p>
      </div>
    `,
  },

  moAlgorithm: {
    title: '莫队算法与离线分块 (Class 159)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (莫涛发明 / 洛谷 P1494 [国家集训队] 小 Z 的袜子)</h2>
        <p><strong>莫队算法</strong> 是一种通过离线分块双关键字排序，使得双指针 <code>[L, R]</code> 在各询问区间之间高效挪动的根号算法。它能将无修改区间统计的暴力 <code>O(N * Q)</code> 优雅压缩至严格的 <code>O(N sqrt(Q))</code>。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">块长划分与奇偶块优化</h3>
        <p>1. <strong>分块大小</strong>：通常取块长 <code>B = N / sqrt(Q)</code>，将询问按左端点所属块 <code>pos[L]</code> 分组。</p>
        <p>2. <strong>奇偶排序优化</strong>：若 <code>pos[L]</code> 为奇数则 <code>R</code> 升序；若为偶数则 <code>R</code> 降序。这样当左端点从上一块移入下一块时，右端点无需折返，移动次数减半！</p>
        <p>3. <strong>增删转移</strong>：维护指针 <code>while(curL > q.l) add(--curL)</code>, <code>while(curR < q.r) add(++curR)</code> 等四向单步更新。</p>
      </div>
    `,
  },

  fftPolynomial: {
    title: '快速傅里叶变换 FFT (Class 160)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (Cooley-Tukey 算法 / 洛谷 P3803 【模板】多项式乘法)</h2>
        <p><strong>快速傅里叶变换 (FFT)</strong> 能够在 <code>O(N log N)</code> 时间内完成多项式<strong>系数表示法</strong>与<strong>点值表示法</strong>的双向转换（DFT 与 IDFT），使高阶多项式卷积或超大整数乘法从暴力的 <code>O(N^2)</code> 跃升为拟线性复杂度。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">单位复数根与蝶形运算</h3>
        <p>1. <strong>单位复数根性质</strong>：利用 $n$ 次单位根 $\omega_n^k = \cos(2\pi k / n) + i \sin(2\pi k / n)$ 的折半引理 $\omega_n^{2k} = \omega_{n/2}^k$ 与消去引理，将偶数次项与奇数次项分治求解。</p>
        <p>2. <strong>位逆序置换 (Bit-Reversal)</strong>：利用二进制反转置换（Rader 算法）实现自底向上非递归迭代迭代，彻底消除递归调用栈开销。</p>
        <p>3. <strong>蝶形运算 (Butterfly Operation)</strong>：合并两半点值只需一次复数乘法与加减法，常数极小。</p>
      </div>
    `,
  },
};
