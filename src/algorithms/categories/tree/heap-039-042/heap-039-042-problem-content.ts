/**
 * 左神算法通关课 039 ~ 042 比较器、堆结构与加强堆专题 题目与深度解析
 */

export const HEAP_039_042_PROBLEMS = {
  comparatorPriorityQueue039: {
    title: '比较器与优先级队列 (Class 039)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (左神比较器通用三法则)</h2>
        <p>在所有高级语言的排序与堆数据结构中，比较器（Comparator）定义了元素间的相对偏序关系。左神总结的比较器通用三大黄金准则：</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">比较器黄金三准则</h3>
        <ul>
          <li>1. <strong>返回负数</strong>：表示第一个参数 $O_1$ 应该排在第二个参数 $O_2$ 的前面（升序规则下 $O_1 < O_2$）。</li>
          <li>2. <strong>返回正数</strong>：表示第二个参数 $O_2$ 应该排在第一个参数 $O_1$ 的前面。</li>
          <li>3. <strong>返回 0</strong>：表示两者等价，谁前谁后皆可。</li>
        </ul>
        <p>在优先级队列（PriorityQueue）中，默认以小根堆维护队头，使用自定义比较器可实现复合优先级调度（例如按权重由大到小、若权重相同则按到达时间由先到后）。</p>
      </div>
    `,
  },

  heapSort040: {
    title: '堆结构与堆排序 (Class 040)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (完全二叉树数组连续映射 / 洛谷 P1177)</h2>
        <p>堆在逻辑上是一棵<strong>完全二叉树</strong>，在物理上连续存储于一维数组中：对于下标为 $i$ 的节点，其父节点为 $\lfloor (i - 1) / 2 \rfloor$，左孩子为 $2i + 1$，右孩子为 $2i + 2$。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">堆的核心双核操作</h3>
        <ul>
          <li>1. <strong>HeapInsert (上浮)</strong>：新元素追加至数组末尾，若其值大于父节点，则持续与父节点交换向上跃升，单次耗时 $O(\log N)$。</li>
          <li>2. <strong>Heapify (下沉)</strong>：当某节点的值变小违背大根堆性质时，从左右孩子中找出较大者，若孩子大于自身则与孩子交换并持续向下沉降，单次耗时 $O(\log N)$。</li>
          <li>3. <strong>堆排序原地求解</strong>：自底向上 $O(N)$ 建堆，随后每次将堆顶最大值与堆末尾交换 <code>swap(0, --heapSize)</code> 并重新 <code>heapify(0, heapSize)</code>，全局原地完成升序排序。</li>
        </ul>
      </div>
    `,
  },

  heapGreater041: {
    title: '手动实现加强堆 (Class 041)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (反向索引表 Index Map 与 O(log N) 动态修改/删除)</h2>
        <p>系统自带的堆结构（如 Java <code>PriorityQueue</code> 或 C++ <code>std::priority_queue</code>）只支持插入与弹出堆顶。若堆中某个已知对象的属性动态改变，系统堆必须以 $O(N)$ 遍历底层数组才能找到它，成本极为昂贵！</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">加强堆的机制：反向索引表</h3>
        <ul>
          <li>1. <strong>反向索引表</strong>：维护一个哈希表 <code>indexMap: Map<T, Integer></code>，记录每个对象在底层数组堆中的当前确切下标。</li>
          <li>2. <strong>联动交换</strong>：底层堆数组发生任何 <code>swap(i, j)</code> 时，反向索引表必须同步更新 <code>indexMap.put(obj_i, j); indexMap.put(obj_j, i)</code>。</li>
          <li>3. <strong>Resign(obj)</strong>：当对象的优先级变化时，直接从反向表中查出其下标，依次调用 <code>heapInsert(index)</code> 与 <code>heapify(index)</code>，实现严格 $O(\log N)$ 动态重排！</li>
          <li>4. <strong>Remove(obj)</strong>：将该对象与堆末尾元素交换，从索引表移除并对新换上来的元素重新调整堆，实现 $O(\log N)$ 任意删除！</li>
        </ul>
      </div>
    `,
  },

  heapMedianStream042: {
    title: '对顶堆与数据流中位数 (Class 042)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (LeetCode 295 / 数据流的中位数)</h2>
        <p>数据流源源不断输入，要求在任意时刻以 $O(1)$ 常数时间查询当前所有元素的中位数。左神经典双堆对顶技巧（对顶堆）是此题的最优解！</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">大根堆与小根堆对顶平衡</h3>
        <ul>
          <li>1. <strong>大根堆 (maxHeap)</strong>：存储较小的一半元素，堆顶为其最大值。</li>
          <li>2. <strong>小根堆 (minHeap)</strong>：存储较大的一半元素，堆顶为其最小值。</li>
          <li>3. <strong>动态平衡法则</strong>：始终保证 $| \text{size}_{\text{max}} - \text{size}_{\text{min}} | \le 1$。若总数为奇数，让大根堆多容纳 1 个元素；中位数直接取大根堆堆顶或两堆顶的平均值。</li>
        </ul>
      </div>
    `,
  },
};
