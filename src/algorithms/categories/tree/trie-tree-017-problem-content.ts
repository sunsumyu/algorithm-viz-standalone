/**
 * 左程云算法通关课 Class 017: 前缀树 (Trie) 基础结构设计与频次统计
 * 讲义、数学原语与动态指针/静态数组时空对比
 */

export const TRIE_TREE_017_PROBLEM_CONTENT = {
  title: '前缀树 (Trie) 基础结构设计与频次统计 — 左神 Class 017',
  source: '左程云算法通关课 Class 017 / LeetCode 208 / 洛谷 P2580',
  difficulty: 'Medium',
  tags: ['前缀树', '字典树', '字符串检索', 'pass计数', 'end计数', '静态数组优化'],
  summary:
    '前缀树（Trie，又称字典树）是一种高效检索字符串集合的高阶数据结构。通过公用公共前缀节点，以 $O(L)$ 的时间复杂度完成单词插入、精确查找和前缀频次统计（$L$ 为单词长度，与集合规模无关）。深入掌握节点 pass 与 end 原语设计，以及算法竞赛中用静态连续二维数组取代指针的卡常精髓。',

  description: `
    <h3>题目描述与核心接口</h3>
    <p>设计前缀树 Trie 结构，要求支持高效实现以下核心操作：</p>
    <ul>
      <li><code>insert(word)</code>：向词库中插入一个由小写英文字母组成的单词。</li>
      <li><code>search(word)</code>：查询单词 <code>word</code> 在此前一共被插入过几次（精确匹配词频）。</li>
      <li><code>prefixNumber(pre)</code>：查询此前插入的单词中，有多少个单词以 <code>pre</code> 作为前缀（前缀统计）。</li>
      <li><code>delete(word)</code>：从词库中删除一个单词 <code>word</code>（若存在）。</li>
    </ul>
    <div style="background: rgba(30, 41, 59, 0.5); border-left: 4px solid #38bdf8; padding: 10px 14px; margin: 12px 0;">
      <strong>经典样例：</strong><br/>
      依次插入 <code>["apple", "app", "apply", "banana"]</code><br/>
      • 查询 <code>search("app")</code> ➔ 结果为 <code>1</code>（仅有一个完整单词为 "app"）<br/>
      • 查询 <code>prefixNumber("app")</code> ➔ 结果为 <code>3</code>（"apple", "app", "apply" 均以此为前缀）<br/>
      • 查询 <code>search("orange")</code> ➔ 结果为 <code>0</code>（根节点无 'o' 分支，快速断裂剪枝）
    </div>
  `,

  mechanisms: `
    <h3>核心理论推导与关键原语</h3>
    <ol>
      <li>
        <strong>字符在“边”上，信息在“点”上：</strong><br/>
        前缀树的核心精髓在于：<strong>字符存储在父子节点之间的转移边上，而不是节点本身</strong>。
        根节点代表空前缀 <code>""</code>；从根节点走到任何一个节点，沿途边上的字符依次拼接，即构成该节点所唯一代表的前缀字符串。
      </li>
      <li>
        <strong>pass（经过数）与 end（结尾数）的数学不变式：</strong><br/>
        每个节点包含两个核心整数计数器：
        <ul>
          <li><code>pass</code>：记录有多少个单词的插入路径<strong>经过了该节点</strong>。根节点的 <code>pass</code> 等于插入的单词总数；任意节点 $u$ 的 <code>pass</code> 等于以该节点前缀开头的单词总数！</li>
          <li><code>end</code>：记录有多少个单词<strong>恰好以此节点结尾</strong>。用于精确匹配 <code>search(word)</code>。</li>
        </ul>
      </li>
      <li>
        <strong>面向对象动态指针 vs 静态二维数组（竞赛卡常）：</strong><br/>
        <ul>
          <li><strong>动态指针版（Stage 1）</strong>：<code>Node[] nexts = new Node[26]</code>。面向对象设计，符合工程规范，但高并发或海量数据下频繁 <code>new</code> 导致 GC 压力大且内存离散、CPU 缓存命中率低。</li>
          <li><strong>静态连续数组（Stage 2）</strong>：<code>int[][] tree = new int[MAXN][26]</code>，配合一维数组 <code>pass[]</code> 和 <code>end[]</code>，用整数 <code>cnt</code> 模拟指针分配。在算法竞赛（ACM/ICPC/NOIP）中能获得 3~5 倍的速度提升，彻底告别内存分配开销。</li>
        </ul>
      </li>
      <li>
        <strong>路径回溯与分支剪枝：</strong><br/>
        在执行 <code>search</code> 或 <code>prefixNumber</code> 时，若在第 $i$ 个字符处发现当前节点的 <code>nexts[c - 'a'] == null</code>，说明词库中根本不存在该字符分支，可直接以 $O(1)$ 速度<strong>提前中断并返回 0</strong>，无需遍历整个词库。
      </li>
    </ol>
  `,

  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 面向对象动态指针实现 (Object Pointer Trie)',
      desc: '基于引用对象的树形拓扑结构，动态分配节点，实时展示 pass/end 统计演化与树形分支展开。',
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 静态连续数组竞赛版 (Static Array Trie)',
      desc: '算法竞赛极致卡常利器：二维连续内存表 tree[N][26] + pass[N] + end[N]，彻底消除指针寻址开销。',
    },
    {
      id: 'stage-3',
      name: 'Stage 3: 多模态检索与前缀探测推演 (Multi-Query Probing)',
      desc: '横向对比精确查找 search、前缀统计 prefixNumber、以及分支断裂时的高速失败剪枝。',
    },
  ],
};
