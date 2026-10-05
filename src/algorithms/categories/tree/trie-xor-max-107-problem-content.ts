/**
 * 左程云《算法通关课》Class 107: 01-Trie 字典树与异或最大值
 * 体系化深度讲义与阶段推演解析
 *
 * 对应经典权威原题:
 *  - LeetCode 421. 数组中两个数的最大异或值 (Medium/Hard)
 *  - 洛谷 P4551. 最长异或路径 / 子数组最大异或和
 *  - LeetCode 1707. 与车规级/竞赛级静态数组优化
 */

export const TRIE_XOR_107_PROBLEM_HTML = `
<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #1e293b; padding: 4px;">
  <!-- 核心原理与数学定理 -->
  <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-left: 5px solid #0284c7; border-radius: 8px; padding: 14px 18px; margin-bottom: 16px;">
    <h3 style="margin: 0 0 8px 0; color: #0369a1; font-size: 16px; font-weight: 800; display: flex; align-items: center; gap: 8px;">
      <span>🌲 01-Trie 贪心求异或最大值的核心数学原理</span>
    </h3>
    <p style="margin: 0; font-size: 13.5px; color: #334155;">
      在二进制位权体系中，最高位具有<strong>绝对压倒性权重</strong>：
      对于任意第 <code>i</code> 位，其权值为 <code>2<sup>i</sup></code>，而所有比它更低各位的和满足：
      <code style="background: #ffffff; padding: 2px 6px; border-radius: 4px; border: 1px solid #bae6fd; font-weight: 700; color: #0284c7;">
        &Sigma;<sub>k=0</sub><sup>i-1</sup> 2<sup>k</sup> = 2<sup>i</sup> - 1 &lt; 2<sup>i</sup>
      </code>。
      因此，异或求最大值的贪心策略具备<strong>绝对无后效性</strong>：只要第 <code>i</code> 位能够取到 <code>1</code>（即走向相反分支 <code>b ^ 1</code>），
      就必须毫不犹豫地走相反分支，无论后续低位如何牺牲，最终结果都必定大于任何第 <code>i</code> 位为 <code>0</code> 的组合！
    </p>
  </div>

  <!-- 阶段演进架构图 -->
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 16px;">
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <div style="font-size: 11px; font-weight: 800; color: #0284c7; text-transform: uppercase; margin-bottom: 4px;">Stage 1: 经典动态 01-Trie</div>
      <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">两数最大异或值 (LC 421)</div>
      <p style="font-size: 12px; color: #64748b; margin: 0;">将每个数的高位至低位逐位插入二叉字典树，查询时每一步贪心探索对偶分支 <code>want = b ^ 1</code>，将时间复杂度从 O(N<sup>2</sup>) 降低至 O(31N)。</p>
    </div>
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <div style="font-size: 11px; font-weight: 800; color: #16a34a; text-transform: uppercase; margin-bottom: 4px;">Stage 2: 竞赛连续静态数组</div>
      <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">零 GC 扁平内存映射 (tree[N][2])</div>
      <p style="font-size: 12px; color: #64748b; margin: 0;">彻底摒弃面向对象与指针引用的 GC 负担，采用预分配二维静态数组 <code>tree[cnt][2]</code>，通过 <code>++cnt</code> 动态分配行索引，实现极致常数级压榨。</p>
    </div>
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
      <div style="font-size: 11px; font-weight: 800; color: #8b5cf6; text-transform: uppercase; margin-bottom: 4px;">Stage 3: 子数组最大异或和</div>
      <div style="font-size: 13px; font-weight: 700; color: #0f172a; margin-bottom: 4px;">前缀异或自反性 (洛谷 P4551)</div>
      <p style="font-size: 12px; color: #64748b; margin: 0;">利用异或可逆自反性 <code>nums[j..i] = eor[i] ^ eor[j-1]</code>，将连续子数组异或问题等价归约为前缀异或集合的两数最大异或查询，动态维护前缀树。</p>
    </div>
  </div>

  <!-- 复杂度与对比 -->
  <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px;">
    <h4 style="margin: 0 0 6px 0; font-size: 13px; font-weight: 700; color: #334155;">⚡ 复杂度与工业级规范</h4>
    <div style="display: flex; gap: 24px; font-size: 12.5px; color: #475569;">
      <div><strong>时间复杂度：</strong>O(N &times; W) &asymp; 32N &mdash; 严格线性，对于 N=10<sup>5</sup> 仅需 ~3&times;10<sup>6</sup> 次位运算</div>
      <div><strong>空间复杂度：</strong>O(N &times; W) &mdash; 最坏情况下开辟 32N 个节点，静态数组开辟 <code>N * 32</code> 空间</div>
      <div><strong>核心位运算技巧：</strong><code>b = (num >> i) & 1</code> 提取位，<code>ans |= (1 << i)</code> 置位</div>
    </div>
  </div>
</div>
`;
