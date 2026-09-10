/**
 * 左神算法通关课 第 030 ~ 033 课 - 位运算神技与位图题目背景与理论
 */

export const BIT_PROBLEMS = {
  bitTricks: {
    title: '位运算核心神技 (Brian Kernighan & Bit Tricks)',
    source: '左神算法第30课 / 经典位运算精粹',
    timeComplexity: 'O(1)',
    spaceComplexity: 'O(1)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【四大核心技巧】</h4>
        <ol>
          <li><strong>提取最右侧的 1 (Brian Kernighan)</strong>：<code>x & (-x)</code>。由于 <code>-x = ~x + 1</code>，二者取与恰好只保留最低有效位 1；</li>
          <li><strong>抹除最右侧的 1</strong>：<code>x & (x - 1)</code>。常用于 <code>O(k)</code> 统计二进制中 1 的个数（汉明重量）；</li>
          <li><strong>2 的幂次判定</strong>：<code>x > 0 && (x & (x - 1)) == 0</code>；</li>
          <li><strong>无辅助变量异或交换</strong>：<code>a ^= b; b ^= a; a ^= b;</code>。</li>
        </ol>
      </div>
    `,
  },
  singleNumberII: {
    title: '只出现一次的数字 II (Single Number II)',
    source: 'LeetCode 137 / 模3状态机',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【模 3 状态机】</h4>
        <p>数组中除一个元素只出现 1 次外，其余元素均出现 3 次。找出那个只出现 1 次的元素。</p>
        <p><strong>32 位统计</strong>：统计数组中每个二进制位上 1 的总频次，若某一位总数模 3 余 1，则说明目标答案在该位必为 1；</p>
        <p><strong>状态机优化</strong>：用两个整数 <code>ones</code> 和 <code>twos</code> 模拟三进制计数器：</p>
        <pre style="background: #f1f5f9; padding: 8px; border-radius: 6px; font-family: monospace;">
ones = (ones ^ num) & ~twos;
twos = (twos ^ num) & ~ones;</pre>
      </div>
    `,
  },
  singleNumberIII: {
    title: '只出现一次的数字 III (Single Number III)',
    source: 'LeetCode 260 / 异或分组',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【异或分组核心思想】</h4>
        <p>数组中恰好有两个元素只出现 1 次，其余元素均出现 2 次。</p>
        <ol>
          <li>先将全数组所有元素异或：<code>xor = a ^ b</code>（因为出现两次的数异或为 0）；</li>
          <li>因为 <code>a != b</code>，<code>xor</code> 中必存在至少一个二进制位为 1，提取其最低位 1：<code>diff = xor & (-xor)</code>；</li>
          <li>利用 <code>diff</code> 将整个数组划分为两组（该位为 1 组与该位为 0 组），<code>a</code> 和 <code>b</code> 必定分别落入不同组！分别组内异或即可瞬间解出 <code>a</code> 与 <code>b</code>！</li>
        </ol>
      </div>
    `,
  },
  bitsetArray: {
    title: '位图结构设计与实现 (Bitset Array)',
    source: '左神算法第33课 / 高性能海量数据去重',
    timeComplexity: '增删查均为 O(1)',
    spaceComplexity: 'O(N / 32) 极低内存',
    html: `
      <div style="font-size: 13px; line-height: 1.6; color: #334155;">
        <h4 style="margin: 0 0 8px 0; color: #0f172a; font-size: 15px;">【位图原理】</h4>
        <p>用一个 <code>int</code> 数组（每个 int 32 位）表示 <code>0 ~ N</code> 连续数字的集合归属：</p>
        <ul>
          <li><strong>定位定位</strong>：<code>bucket = num >> 5</code>（即 <code>num / 32</code>），<code>bit = num & 31</code>（即 <code>num % 32</code>）；</li>
          <li><strong>添加 add</strong>：<code>bits[bucket] |= (1 << bit)</code>；</li>
          <li><strong>删除 remove</strong>：<code>bits[bucket] &= ~(1 << bit)</code>；</li>
          <li><strong>查找 contains</strong>：<code>(bits[bucket] & (1 << bit)) != 0</code>。</li>
        </ul>
      </div>
    `,
  },
};
