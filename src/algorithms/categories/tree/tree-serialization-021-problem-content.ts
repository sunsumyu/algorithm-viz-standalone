/**
 * 左程云算法通关课 Class 021: 二叉树序列化与反序列化 (Tree Serialization & Deserialization)
 * 核心讲义、空节点守恒推导与时空复杂度分析
 */

export const TREE_SERIALIZATION_021_PROBLEM_CONTENT = {
  title: '二叉树序列化与反序列化 (Tree Serialization) — 左神 Class 021',
  source: '左程云算法通关课 Class 021 / LeetCode 297',
  difficulty: 'Hard',
  tags: ['二叉树', '序列化', '反序列化', '先序遍历', '层序遍历', '队列'],
  summary:
    '二叉树序列化是将内存中的树形链表拓扑持久化为单行文本流的过程；反序列化则是从文本流中无损还原出原有二叉树结构。证明了单纯先序序列无法唯一确定二叉树，必须显式补全空节点标记 "#"，才能确立序列与树拓扑的单射一一对应关系。',

  description: `
    <h3>题目描述</h3>
    <p>序列化是将一个数据结构或者对象转换为连续的比特位或字符串的过程，进而可以存储在文件、内存中，或通过网络传输。反之，通过反序列化可以逆向重构该数据结构。</p>
    <p>请实现两个函数：</p>
    <ul>
      <li><code>serialize(root)</code>：将二叉树序列化为一个字符串；</li>
      <li><code>deserialize(data)</code>：将该字符串反序列化为原始二叉树结构。</li>
    </ul>
    <div style="background: rgba(30, 41, 59, 0.5); border-left: 4px solid #38bdf8; padding: 10px 14px; margin: 12px 0;">
      <strong>经典测试样板树：</strong><br/>
      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;1<br/>
      &nbsp;&nbsp;&nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;\\<br/>
      &nbsp;&nbsp;&nbsp;2&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;3<br/>
      &nbsp;&nbsp;/&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\\<br/>
      &nbsp;4&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;5<br/>
      <strong>先序序列化产物：</strong><code>"1,2,4,#,#,#,3,#,5,#,#"</code><br/>
      <strong>层序序列化产物：</strong><code>"1,2,3,4,#,#,5,#,#,#,#"</code>
    </div>
  `,

  mechanisms: `
    <h3>核心理论推导与唯一性准则</h3>
    <ol>
      <li>
        <strong>为什么普通先序序列无法唯一还原二叉树？</strong><br/>
        若只记录节点数值，序列 <code>[1, 2]</code> 可以是“1 的左孩子为 2”，也可以是“1 的右孩子为 2”。只有补全空节点标记（如 <code>#</code>），二叉树中的每个有效节点都会贡献 2 个子指针记录，总记录数严格等于 $2N + 1$。此时先序序列与二叉树拓扑之间构成了严格的<strong>单射 (Bijection)</strong>！
      </li>
      <li>
        <strong>先序反序列化递归消费时序：</strong><br/>
        将序列化字符串按逗号切分为队列 <code>Queue&lt;String&gt;</code>：
        <ul>
          <li>队首出队为 <code>#</code> 时，直接返回 <code>null</code>；</li>
          <li>队首出队为数字时，创建新节点 <code>node = new TreeNode(val)</code>；</li>
          <li>递归调用 <code>node.left = build(queue)</code> 先装配好整棵左子树；</li>
          <li>再递归调用 <code>node.right = build(queue)</code> 装配整棵右子树；</li>
          <li>天然与先序遍历时序对称吻合。</li>
        </ul>
      </li>
      <li>
        <strong>层序序列化与队列双向映射：</strong><br/>
        利用 FIFO 队列逐层入队出队：出队一个节点，将其数值或 <code>#</code> 记入序列串；若节点非空，则其左右孩子（即使为 null）也必须成对入队。反序列化时同样借助辅助队列按层消费和挂载子节点。
      </li>
    </ol>
  `,

  stages: [
    {
      id: 'stage1',
      name: 'Stage 1: 先序序列化与递归复原 (Preorder DFS)',
      desc: '中左右遍历打桩空节点 "#"，反序列化依靠先序队列单路自顶向下装配左右子树。',
    },
    {
      id: 'stage2',
      name: 'Stage 2: 层序序列化与队列复原 (Levelorder BFS)',
      desc: '借助 FIFO 队列逐层拓扑输出，反序列化依靠队列按层挂载成对子节点。',
    },
    {
      id: 'stage3',
      name: 'Stage 3: 后序序列化与逆序反序列化 (Postorder DFS)',
      desc: '左右中输出序列，反序列化自右向左消费 tokens：先构建根，再构建右子树，最后构建左子树。',
    },
  ],
};
