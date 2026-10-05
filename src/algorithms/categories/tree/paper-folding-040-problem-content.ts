/**
 * 左程云算法通关课 Class 040: 折纸凹凸折痕问题 (Paper Folding)
 * 题目讲义、数学推导与二叉树同构论证
 */

export const PAPER_FOLDING_040_PROBLEM_CONTENT = {
  title: '折纸问题 (Paper Folding) — 满二叉树中序遍历同构',
  source: '左程云算法通关课 Class 040 / 微软经典面试题',
  difficulty: 'Medium',
  tags: ['二叉树', '中序遍历', '分治递归', '几何同构', '空间优化'],
  summary:
    '将一段纸条竖直放置在桌面上，面朝自己向上对折 N 次。展开后从上到下观察所有折痕的凹凸朝向。证明折痕结构等价于一棵以“凹”为根、左子树全为“凹”、右子树全为“凸”的满二叉树，其从上到下的折痕顺序恰为该二叉树的【中序遍历】(In-order Traversal)。',
  
  description: `
    <h3>题目描述</h3>
    <p>请把一段纸条竖着放在桌子上，然后从纸条的下边向上对折 1 次，压出折痕后展开：</p>
    <ul>
      <li>此时只有 1 道折痕，折痕凹下去（朝纸面凹陷），称之为<strong>“凹折痕” (Down Crease)</strong>。</li>
    </ul>
    <p>如果连续从下向上对折 2 次后展开，从上到下共有 3 道折痕：</p>
    <ul>
      <li>依次为：<strong>凹、凹、凸</strong>。</li>
    </ul>
    <p>如果连续从下向上对折 3 次后展开，从上到下共有 7 道折痕：</p>
    <ul>
      <li>依次为：<strong>凹、凹、凸、凹、凹、凸、凸</strong>。</li>
    </ul>
    <p>给定一个正整数 <code>N</code> 代表对折次数，请从上到下打印所有折痕的凹凸方向。</p>
  `,

  mathematicalAnalysis: `
    <h3>物理折叠与二叉树几何同构推导</h3>
    <ol>
      <li>
        <strong>折痕裂变原理</strong>：
        当纸条已经对折了 <code>k - 1</code> 次，再次进行第 <code>k</code> 次对折时，每一个在纸条内部已经存在的折痕，都会被双层纸重新压出两条新的折痕：
        <ul>
          <li>在原来每个折痕的<strong>上方</strong>会新压出一个<strong>凹折痕</strong>；</li>
          <li>在原来每个折痕的<strong>下方</strong>会新压出一个<strong>凸折痕</strong>。</li>
        </ul>
      </li>
      <li>
        <strong>满二叉树同构映射</strong>：
        如果我们把第一次对折产生的折痕视为整棵树的<strong>根节点</strong>（凹）：
        <ul>
          <li>它的左上方产生的新折痕，就是它的<strong>左子节点</strong>（凹）；</li>
          <li>它的右下方产生的新折痕，就是它的<strong>右子节点</strong>（凸）；</li>
          <li>以此类推，对折 <code>N</code> 次展开后，所有折痕形成一棵深度为 <code>N</code>、总节点数为 <code>2^N - 1</code> 的<strong>满二叉树</strong>！</li>
          <li><strong>核心性质</strong>：这棵树的<strong>根节点是“凹”</strong>；此后<strong>每一个节点的左孩子都是“凹”，右孩子都是“凸”</strong>。</li>
        </ul>
      </li>
      <li>
        <strong>为什么是中序遍历 (In-order)？</strong>：
        纸条是从上到下展开的。在二叉树投影中：
        <ul>
          <li>左上方区域位于纸条的<strong>上方</strong>（优先访问左子树）；</li>
          <li>当前折痕位于<strong>中间</strong>（访问当前节点）；</li>
          <li>右下方区域位于纸条的<strong>下方</strong>（最后访问右子树）。</li>
        </ul>
        因此，“自上而下输出折痕”在数学上<strong>严格等价于对该满二叉树进行中序遍历 (Left ➔ Root ➔ Right)</strong>！
      </li>
      <li>
        <strong>空间复杂度 $O(N)$ 极致优化</strong>：
        完全不需要在内存中建立包含 $2^N - 1$ 个节点的二叉树指针结构！
        直接利用深度优先递归，递归树深度为 $N$，栈空间仅为 $O(N)$，时间复杂度为 $O(2^N)$，每个折痕仅访问一次并直接打印输出。
      </li>
    </ol>
  `,

  stages: [
    {
      id: 'stage1',
      name: 'Stage 1: 经典中序递归栈 (Mathematical In-order DFS)',
      desc: '借助二叉树中序遍历同构，不物理建树，深度优先递归直接打印输出。左凹右凸，空间复杂度 O(N)。',
    },
    {
      id: 'stage2',
      name: 'Stage 2: 显式调用栈模拟 (Explicit Call Stack Simulation)',
      desc: '使用显式辅助栈追踪函数调用帧，模拟系统栈的压栈、展开与回溯，透视递归底层的物理执行轨迹。',
    },
    {
      id: 'stage3',
      name: 'Stage 3: 逐层物理裂变递推 (Layered Folding Generation)',
      desc: '从 N=1 纸条折叠出发，直观演示每一次对折如何在相邻折痕缝隙中交替衍生“凹”与“凸”，呈现折痕几何裂变过程。',
    },
  ],
};
