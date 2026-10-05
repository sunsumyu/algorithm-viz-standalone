/**
 * 左程云算法通关课 Class 020: 二叉树非递归与双栈遍历 (Iterative Tree Traversals)
 * 核心讲义、非递归栈时序推导与时空复杂度分析
 */

export const TREE_TRAVERSAL_020_PROBLEM_CONTENT = {
  title: '二叉树迭代遍历 (Iterative Tree Traversals) — 左神 Class 020',
  source: '左程云算法通关课 Class 020 / LeetCode 144, 94, 145',
  difficulty: 'Medium',
  tags: ['二叉树', '迭代遍历', '显式栈', '双栈后序', '单栈时序'],
  summary:
    '二叉树的递归遍历本质上是由系统方法调用栈维护了访问时序。本课彻底剥离系统递归，使用显式堆栈（Stack）手工实现先序、中序与后序遍历。深入掌握先序“弹一访一、先右后左”、中序“左边界全压、无法下潜出栈转右”、后序“双栈收集反转”的核心工程套路。',

  description: `
    <h3>题目描述</h3>
    <p>给你一棵二叉树的根节点 <code>root</code>，要求<strong>不使用递归</strong>，仅借助显式堆栈结构完成以下遍历：</p>
    <ul>
      <li><strong>先序遍历 (Preorder)</strong>：访问顺序为【中 ➔ 左 ➔ 右】(LeetCode 144)；</li>
      <li><strong>中序遍历 (Inorder)</strong>：访问顺序为【左 ➔ 中 ➔ 右】(LeetCode 94)；</li>
      <li><strong>后序遍历 (Postorder)</strong>：访问顺序为【左 ➔ 右 ➔ 中】(LeetCode 145)。</li>
    </ul>
    <div style="background: rgba(30, 41, 59, 0.5); border-left: 4px solid #38bdf8; padding: 10px 14px; margin: 12px 0;">
      <strong>经典测试样板树：</strong><br/>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1<br/>
      &nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;\\<br/>
      &nbsp;&nbsp;&nbsp;2&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3<br/>
      &nbsp;&nbsp;/&nbsp;\\&nbsp;&nbsp;&nbsp;/<br/>
      &nbsp;4&nbsp;&nbsp;&nbsp;5&nbsp;6<br/>
      <strong>先序遍历：</strong>[1, 2, 4, 5, 3, 6]<br/>
      <strong>中序遍历：</strong>[4, 2, 5, 1, 6, 3]<br/>
      <strong>后序遍历：</strong>[4, 5, 2, 6, 3, 1]
    </div>
  `,

  mechanisms: `
    <h3>非递归三大遍历核心机制推导</h3>
    <ol>
      <li>
        <strong>先序遍历 (Preorder) —— 弹一个访一个，先右后左</strong>：
        <ul>
          <li>初始时将 <code>root</code> 压入主栈；</li>
          <li>循环弹出栈顶 <code>cur</code> 并打印访问；</li>
          <li>如果 <code>cur.right != null</code>，先压入右孩子；</li>
          <li>如果 <code>cur.left != null</code>，再压入左孩子；</li>
          <li><em>原因</em>：堆栈后进先出 (LIFO)，先压右则左后压先出，保证了“中 ➔ 左 ➔ 右”的时序！</li>
        </ul>
      </li>
      <li>
        <strong>中序遍历 (Inorder) —— 整条左边界全压入，无法下潜出栈转右</strong>：
        <ul>
          <li>任何子树都可以拆解为“整条左边界”；</li>
          <li>指针 <code>cur</code> 不为空时，将 <code>cur</code> 压入栈，<code>cur = cur.left</code> 持续向左下潜；</li>
          <li><code>cur</code> 为空说明左边界到底，弹出栈顶 <code>top</code> 访问打印，并将 <code>cur = top.right</code> 转向右子树；</li>
          <li>周而复始，直到栈为空且 <code>cur == null</code>。</li>
        </ul>
      </li>
      <li>
        <strong>后序遍历 (Postorder) —— 双栈法（先序逆向收集）</strong>：
        <ul>
          <li>若按照“中 ➔ 右 ➔ 左”的顺序访问二叉树并放入另一个收集栈 <code>s2</code> 中；</li>
          <li>那么从 <code>s2</code> 弹出时，顺序恰好反转为【左 ➔ 右 ➔ 中】！</li>
          <li><code>s1</code> 弹出 <code>cur</code> 压入 <code>s2</code>；随后先压 <code>cur.left</code>，再压 <code>cur.right</code> 到 <code>s1</code> 中；</li>
          <li>最后将 <code>s2</code> 依次弹出即为完美的后序遍历结果。</li>
        </ul>
      </li>
    </ol>
  `,

  stages: [
    {
      id: 'stage1',
      name: 'Stage 1: 先序非递归迭代 (Preorder: 根左右)',
      desc: '单栈维护访问时序，弹出一个打印一个，先压右孩子后压左孩子。',
    },
    {
      id: 'stage2',
      name: 'Stage 2: 中序非递归迭代 (Inorder: 左根右)',
      desc: '指针整条左边界下潜压栈，无法深入时出栈访问并转向右子树。',
    },
    {
      id: 'stage3',
      name: 'Stage 3: 双栈后序非递归 (Postorder: 左右根)',
      desc: '中右左推导压入收集栈，二次弹出自动反转为左右根。',
    },
  ],
};
