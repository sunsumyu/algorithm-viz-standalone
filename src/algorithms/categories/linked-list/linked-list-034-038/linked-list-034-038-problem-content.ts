/**
 * 左神算法通关课 034 ~ 038 经典链表高频与递归专题 题目与深度解析
 */

export const LINKED_LIST_034_038_PROBLEMS = {
  reverseLinkedList034: {
    title: '单双链表反转 (Class 034)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (LeetCode 206 / 牛客 单双链表反转)</h2>
        <p>链表反转是所有链表算法与面试的基石。在单链表中，每个节点只有 <code>next</code> 指针；在双向链表中，每个节点拥有 <code>prev</code> 和 <code>next</code> 两个指针。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">核心步骤与指针调转</h3>
        <ul>
          <li>1. <strong>暂存后继</strong>：<code>next = head.next</code>，防止修改指向后链表断裂丢失。</li>
          <li>2. <strong>反转指向</strong>：单链表执行 <code>head.next = pre</code>；双向链表同时执行 <code>head.prev = next</code> 与 <code>head.next = pre</code>。</li>
          <li>3. <strong>前驱递进</strong>：<code>pre = head; head = next</code>，滑动双指针直到整个链表遍历完毕。</li>
        </ul>
      </div>
    `,
  },

  copyRandomList035: {
    title: '复制带随机指针的链表 (Class 035)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (LeetCode 138 / 复杂链表的复制)</h2>
        <p>每个节点除了 <code>next</code> 指针外，还包含一个可能指向链表中任意节点或 <code>null</code> 的 <code>random</code> 指针。哈希表法空间为 $O(N)$，而左神强烈推荐的<strong>原地插入法</strong>可实现极致的 $O(1)$ 额外空间复杂度！</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">原地插桩三步法</h3>
        <ul>
          <li>1. <strong>克隆节点插入原节点身后</strong>：<code>1 -> 1' -> 2 -> 2' -> 3 -> 3'</code>。</li>
          <li>2. <strong>一对一配对随机指针</strong>：<code>cur.next.random = cur.random ? cur.random.next : null</code>。</li>
          <li>3. <strong>拆分还原两链表</strong>：剥离并拆出新克隆链表，同时复原原始链表的 <code>next</code> 指针。</li>
        </ul>
      </div>
    `,
  },

  intersectionLinkedList036: {
    title: '相交链表与有环无环终极判定 (Class 036)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (LeetCode 142 & 160 / 链表相交分类大讨论)</h2>
        <p>判定单链表相交是链表问题的集大成者，必须严格分为三种宏观拓扑结构：</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">三大拓扑分支</h3>
        <ul>
          <li>1. <strong>快慢指针找入环节点</strong>：快指针每次走两步、慢指针每次走一步；相遇后快指针归零重置为每次走一步，再次相遇点即为第一入环节点 <code>loop1, loop2</code>。</li>
          <li>2. <strong>两链表皆无环</strong>：计算长度差 $\Delta$，长链表先走 $\Delta$ 步，随后同步前行，首个相同地址即为相交点。</li>
          <li>3. <strong>两链表皆有环</strong>：若 <code>loop1 == loop2</code>，相交在入环前，退化为无环相交模型；若 <code>loop1 != loop2</code>，让指针从 <code>loop1</code> 绕环一周，若途经 <code>loop2</code> 则两环在环内不同点相交，返回 <code>loop1</code> 或 <code>loop2</code>；否则不相交。</li>
        </ul>
      </div>
    `,
  },

  reverseKGroup037: {
    title: 'K 个一组翻转链表 (Class 037)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (LeetCode 25 / 组内局部逆序)</h2>
        <p>每 $K$ 个节点进行一组内部逆序，若最后一组节点数不足 $K$ 个，则保持原有顺序不变。要求严格空间复杂度为 $O(1)$。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">组内指针接力机制</h3>
        <ul>
          <li>1. <strong>探测完整区间</strong>：从当前组头开始步进 $K-1$ 步寻找组尾 <code>end</code>，若中途遇 <code>null</code> 则长度不足直接返回。</li>
          <li>2. <strong>断链与组内反转</strong>：暂存下一组头 <code>nextGroup = end.next</code>，将当前组与下一组断开，反转当前区间 <code>[start, end]</code>。</li>
          <li>3. <strong>跨组首尾桥接</strong>：将上一组的尾巴 <code>lastTail.next</code> 接到新组头 <code>end</code>，新组尾 <code>start.next</code> 接到 <code>nextGroup</code>。</li>
        </ul>
      </div>
    `,
  },

  mergeSortedLists038: {
    title: '有序链表合并与链表相加 (Class 038)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (LeetCode 21 & LeetCode 2)</h2>
        <p>合并两个升序单链表以及反向大数相加，是利用虚拟头节点（Dummy Head）与双指针滑动的经典示范。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">哨兵节点与双指针贪心</h3>
        <ul>
          <li>1. <strong>虚拟头节点 (Dummy)</strong>：设立哨兵节点简化头节点特殊判断，<code>tail</code> 指针始终指向合并后链表的末尾。</li>
          <li>2. <strong>两两比对贪心接入</strong>：比较 <code>l1.val</code> 与 <code>l2.val</code>，将较小者接在 <code>tail.next</code>，并推进相应指针。</li>
          <li>3. <strong>剩余链条直接嫁接</strong>：当某条链表耗尽时，直接将另一条链表的剩余部分 <code>tail.next = l1 ? l1 : l2</code> 一次性拼接完成。</li>
        </ul>
      </div>
    `,
  },
};
