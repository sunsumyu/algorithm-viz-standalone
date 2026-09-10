/**
 * 左神算法通关课 149 ~ 154 有序表全家桶 (SB树、红黑树、跳表、Splay树、替罪羊树、FHQ-Treap) 题目与解析
 */

export const ADVANCED_149_154_PROBLEMS = {
  sbTree: {
    title: 'Size Balanced Tree / SB 树 (Class 149)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (中国学者陈启峰发明 / 洛谷 P3369 【模板】普通平衡树)</h2>
        <p><strong>Size Balanced Tree (SB 树)</strong> 是一种利用子树节点数量（size）维持平衡的自平衡二叉搜索树。相比 AVL 树和红黑树，SB 树删除时<strong>完全不需要旋转调整</strong>，仅在插入时维护平衡，常数极小，且自带名次树（Rank / Select）功能。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">核心平衡性质 (Size-Balance Property)</h3>
        <p>每棵子树的大小不小于其兄弟子树的任何子树的大小，即对任意节点 <code>t</code> 满足：</p>
        <ul>
          <li><code>size(t.left) >= max(size(t.right.left), size(t.right.right))</code></li>
          <li><code>size(t.right) >= max(size(t.left.left), size(t.left.right))</code></li>
        </ul>
        <p><strong>Maintain 修复</strong>：当违背上述性质时，分别对应 LL, LR, RR, RL 四种失衡情况，进行相应旋转并递归调用 maintain，最坏均摊时间复杂度为稳定 <code>O(log N)</code>。</p>
      </div>
    `,
  },

  redBlackTree: {
    title: '红黑树 / Red-Black Tree (Class 150)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (工业界标准有序表 / Java TreeMap, C++ std::map 底层)</h2>
        <p>红黑树是计算机科学中最著名的自平衡二叉搜索树之一。通过给节点着色（红/黑）并在插入和删除后进行局部的变色与旋转，确保没有一条路径会比其他路径长出两倍，近似平衡。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">红黑树五大公理</h3>
        <ol>
          <li>每个节点要么是红色，要么是黑色。</li>
          <li>根节点必须是黑色。</li>
          <li>所有叶子节点 (NIL) 都是黑色。</li>
          <li>若一个节点是红色，则它的两个子节点必须都是黑色（不能有两个连续红色节点）。</li>
          <li>对每个节点，从该节点到其所有后代叶节点的简单路径上，均包含相同数目的黑色节点（黑高平衡）。</li>
        </ol>
      </div>
    `,
  },

  skiplist: {
    title: '跳表 / SkipList (Class 151)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (William Pugh 发明 / Redis Sorted Set 底层存储引擎)</h2>
        <p>跳表是一种基于概率平衡的有序数据结构，用多层稀疏索引链表替代了复杂的树形平衡旋转。相比红黑树，跳表的并发实现简单且无全局写自锁瓶颈，区间范围查找效率极高。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">概率升层与检索机制</h3>
        <p>1. <strong>随机层高</strong>：每个新节点以 1/2（或 1/4）的概率决定是否向上一层晋升。平均每个节点指针数为 <code>1 / (1 - p)</code>。</p>
        <p>2. <strong>高层向低层跳跃</strong>：查找时从最高层头节点出发，若右侧节点值小于目标值则向右前进，否则向下一层下降。查找、插入、删除期望时间复杂度均为 <code>O(log N)</code>。</p>
      </div>
    `,
  },

  splayTree: {
    title: '伸展树与区间翻转 / Splay Tree (Class 152)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (Tarjan 发明 / 洛谷 P3391 【模板】文艺平衡树)</h2>
        <p>伸展树通过独特的 <strong>Splay 操作</strong>（双旋策略：Zig-Zig 同向双旋与 Zig-Zag 异向双旋），将刚访问的节点旋转至根节点。它不仅具有均摊 <code>O(log N)</code> 的卓越访问效率，还天然支持区间分裂与合并，是解决“区间翻转”、“动态序列维护”等高阶区间问题的终极利器。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">Splay 伸展操作核心分类</h3>
        <ul>
          <li><strong>单旋 (Zig)</strong>：待旋转节点的父节点即为根节点，单次左旋或右旋。</li>
          <li><strong>一字形同向双旋 (Zig-Zig)</strong>：节点与父节点同在祖父节点的同侧，必须<strong>先旋父节点、再旋当前节点</strong>，以保证均摊势能下降，防止树退化成链。</li>
          <li><strong>之字形异向双旋 (Zig-Zag)</strong>：节点与父节点异侧，先旋当前节点到父节点位置，再旋当前节点到祖父节点位置。</li>
        </ul>
      </div>
    `,
  },

  scapegoatTree: {
    title: '替罪羊树 / Scapegoat Tree (Class 153)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (不旋转的暴力重构美学 / 洛谷 P3369 【模板】普通平衡树)</h2>
        <p>替罪羊树是一种极其暴力而优雅的自平衡二叉搜索树，它<strong>完全不进行左旋或右旋</strong>！而是通过监控子树大小，一旦发现某子树倾斜度超过平衡阈值 <code>alpha</code>（通常取 0.7~0.75），就直接将该失衡子树（“替罪羊”）全部拍扁成线性数组，重新建立为绝对平衡的二叉树。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">不平衡判定与重构准则</h3>
        <p>1. <strong>失衡阈值</strong>：若 <code>max(size(left), size(right)) > alpha * size(cur)</code>，则该节点为失衡节点。</p>
        <p>2. <strong>惰性删除</strong>：删除节点时仅标记 <code>deleted = true</code>，当全树未被删除的实际节点数小于总节点数的 <code>alpha</code> 倍时，触发全树暴力重构，均摊时间复杂度为 <code>O(log N)</code>。</p>
      </div>
    `,
  },

  treapFhq: {
    title: '非旋 Treap / FHQ-Treap (Class 154)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (范浩强发明的无旋平衡树 / 洛谷 P3369 & P3391)</h2>
        <p><strong>FHQ-Treap</strong> 是中国竞赛选手范浩强在传统 Treap 基础上发明的无旋转分裂与合并平衡树。仅凭 <code>split(按值或按排名分裂)</code> 与 <code>merge(堆序合并)</code> 两个极简函数，即可实现所有平衡树操作，代码极短且可持久化能力极强。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">两个核心操作</h3>
        <ul>
          <li><strong>Split (分裂)</strong>：将一棵 Treap 按照键值 <code>val <= key</code> 分裂为左树 L 和右树 R。</li>
          <li><strong>Merge (合并)</strong>：将左树 L（全部键值均小于右树）与右树 R 合并，根据随机优先级 <code>priority</code> 决定谁作根节点，保持堆序性质。</li>
        </ul>
      </div>
    `,
  },
};
