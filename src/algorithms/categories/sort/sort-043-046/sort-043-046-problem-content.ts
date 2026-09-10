/**
 * 左神算法通关课 043 ~ 046 经典归并与快速排序专题 题目与深度解析
 */

export const SORT_043_046_PROBLEMS = {
  mergeSort043: {
    title: '归并排序原理与双指针合并 (Class 043)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (分治经典 / 洛谷 P1177)</h2>
        <p>归并排序是分治思想（Divide and Conquer）的巅峰之作。将待排序数组对半切分，先让左半区和右半区各自递归有序，再利用双指针与辅助数组在 $O(N)$ 时间内合并为一个整体有序数组。</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">核心步骤与 Master 定理</h3>
        <ul>
          <li>1. <strong>二分递归</strong>：$T(N) = 2T(N/2) + O(N)$，由 Master 公式可知时间复杂度恒为严格的 $O(N \\log N)$。</li>
          <li>2. <strong>双指针外排</strong>：左右指针比对，较小者优先填入辅助数组 <code>help</code>，指针同步推进。</li>
          <li>3. <strong>辅助数组回写</strong>：合并完毕后将 <code>help</code> 数组中的有序结果写回原数组的对应区间 <code>[l, r]</code>。</li>
        </ul>
      </div>
    `,
  },

  smallSumMerge044: {
    title: '小和问题与翻转对 (Class 044)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (左神经典小和问题 / 牛客 算法面试经典题)</h2>
        <p>在一个数组中，每一个数左边比当前数小的数累加起来，叫做这个数组的小和。暴力计算时间为 $O(N^2)$，左神借助<strong>归并排序的局部有序性</strong>，将其优化为奇迹般的 $O(N \\log N)$！</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">思维逆转：算每个数对右边的贡献</h3>
        <ul>
          <li>1. <strong>视角切换</strong>：“数出每个数左边有多少比它小” $\\iff$ “数出每个数右边有多少比它大”。</li>
          <li>2. <strong>跨组批量乘积</strong>：在 merge 阶段，由于左右半区各自升序，当左区 <code>arr[p1] < arr[p2]</code> 时，说明右半区从 <code>p2</code> 到 <code>r</code> 的所有数都比 <code>arr[p1]</code> 大！</li>
          <li>3. <strong>贡献累加公式</strong>：无需逐一比对，直接一次性累加小和贡献：<code>(r - p2 + 1) * arr[p1]</code>！</li>
        </ul>
      </div>
    `,
  },

  quickSortDutchFlag045: {
    title: '快速排序与荷兰国旗三路划分 (Class 045)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (荷兰国旗三向切分 / LeetCode 75 & 912)</h2>
        <p>传统单指针或双指针快速排序在面对大量重复元素时容易退化为 $O(N^2)$。左神推崇的<strong>荷兰国旗三向划分（Dutch National Flag Partition）</strong>将数组严密划分为小于区、等于区、大于区三部分，等于区所有元素一次性归位！</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">三路划分与随机基准</h3>
        <ul>
          <li>1. <strong>随机化防最差情况</strong>：区间内随机挑选一个元素作为基准值 <code>pivot</code>，消除最差恶劣输入。</li>
          <li>2. <strong>三区指针维护</strong>：维护小于区右边界 <code>less</code>、大于区左边界 <code>more</code>、当前探测指针 <code>i</code>：
            <ul>
              <li><code>arr[i] < pivot</code>：<code>swap(++less, i++)</code>，小于区向右扩充。</li>
              <li><code>arr[i] == pivot</code>：<code>i++</code>，等于区自然扩容。</li>
              <li><code>arr[i] > pivot</code>：<code>swap(--more, i)</code>，大于区向左扩充，换上来的新元素需再次检查。</li>
            </ul>
          </li>
          <li>3. <strong>递归避开等于区</strong>：返回等于区的左右边界 <code>[less + 1, more - 1]</code>，递归只需处理小于区与大于区。</li>
        </ul>
      </div>
    `,
  },

  quickSelect046: {
    title: '快速选择算法求解第 K 大/小元素 (Class 046)',
    html: `
      <div style="font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; color: #334155;">
        <h2 style="color: #1e293b; font-size: 18px; margin-bottom: 12px;">算法概述 (QuickSelect / LeetCode 215)</h2>
        <p>寻找无序数组中第 $K$ 大或第 $K$ 小的元素。若全量排序需 $O(N \\log N)$，大根堆需 $O(N \\log K)$，而基于荷兰国旗三路划分的<strong>快速选择算法（QuickSelect）</strong>期望时间复杂度为令人惊叹的严格线性 $O(N)$！</p>
        
        <h3 style="color: #1e293b; font-size: 15px; margin-top: 16px; margin-bottom: 8px;">剪枝单侧深入机制</h3>
        <ul>
          <li>1. <strong>三路划分定位</strong>：随机选择基准值划分得到等于区区间 <code>[L, R]</code>。</li>
          <li>2. <strong>命中即返回</strong>：若目标索引 $index$ 落在 <code>[L, R]</code> 之间，说明目标元素恰好就在等于区内，直接 $O(1)$ 返回答案！</li>
          <li>3. <strong>只深入一侧分支</strong>：若 $index < L$ 仅递归左侧，若 $index > R$ 仅递归右侧；平均递归规模为 $N + N/2 + N/4 + \\dots = O(2N) = O(N)$！</li>
        </ul>
      </div>
    `,
  },
};
