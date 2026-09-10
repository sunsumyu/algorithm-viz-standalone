/**
 * 桶排序 (Bucket Sort)
 * 领域知识与题解精讲配置声明
 */

export const BUCKET_SORT_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">Sort</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">桶排序 (Bucket Sort / 区间映射与桶内排序)</h2>
    </div>
    <p style="margin: 0;"><strong>桶排序（Bucket Sort）</strong> 是计数排序的升级版。它利用函数的映射关系，将待排序元素分发到有限数量的桶里，每个桶再个别排序（可以使用别的排序算法或是以递归方式继续使用桶排序进行排序），最后依次将各个桶中的元素列出。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例:</div>
      <div>输入: nums = [29, 25, 3, 49, 9, 37, 21, 43] (5 个桶)</div>
      <div>输出: [3, 9, 21, 25, 29, 37, 43, 49]</div>
      <div style="color: #94a3b8;">解释: 根据数值范围线性映射到 5 个桶中，桶内排序后按桶顺序拼接。</div>
    </div>
  </div>
`;

export const BUCKET_SORT_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 映射分流（Scatter）、桶内独立排序（Sort）与顺序归拢（Gather）
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 核心三阶段流程</div>
        <p style="margin: 0; color: #94a3b8;">
        1. <strong>Scatter (分桶)：</strong> 计算数值区间 <code style="color: #38bdf8; font-family: monospace;">[min, max]</code>，通过映射公式 <code style="color: #fde047; font-family: monospace;">bucketIdx = (val - min) * (k - 1) / (max - min)</code> 将各元素推入对应桶内；<br/>
        2. <strong>Sort (桶内排序)：</strong> 遍历每个非空桶，采用插入排序或快速排序对桶内数据单独排序；<br/>
        3. <strong>Gather (归拢拼接)：</strong> 依次遍历各个桶，将排好序的元素按桶序号回填至最终输出数组中。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度与适用场景</div>
        <p style="margin: 0; color: #94a3b8;">
        • 平均时间复杂度：当输入数据<strong>均匀分布</strong>在各个桶中时，时间复杂度接近线性 <code style="color: #34d399; font-family: monospace;">O(n + k)</code>。<br/>
        • 最坏时间复杂度：当所有元素全部映射到同一个桶中时，退化为桶内排序的复杂度 <code style="color: #f87171; font-family: monospace;">O(n²)</code> 或 <code style="color: #f87171; font-family: monospace;">O(n log n)</code>。<br/>
        • 空间复杂度：<code style="color: #60a5fa; font-family: monospace;">O(n + k)</code>。<br/>
        • 稳定性：取决于桶内排序算法，若采用稳定排序则整体<strong>稳定</strong>。
        </p>
      </div>
    </div>
  </div>
`;

export const BUCKET_SORT_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public void bucketSort(int[] arr, int bucketCount) {',
    '    if (arr.length <= 1) return;',
    '    int min = arr[0], max = arr[0];',
    '    for (int x : arr) { if (x < min) min = x; if (x > max) max = x; }',
    '    if (min == max) return;',
    '    List<List<Integer>> buckets = new ArrayList<>(bucketCount);',
    '    for (int i = 0; i < bucketCount; i++) buckets.add(new ArrayList<>());',
    '    // 1. 分桶映射',
    '    for (int x : arr) {',
    '        int bIdx = (int)((long)(x - min) * (bucketCount - 1) / (max - min));',
    '        buckets.get(bIdx).add(x);',
    '    }',
    '    // 2. 桶内排序并归拢拼接',
    '    int idx = 0;',
    '    for (List<Integer> bucket : buckets) {',
    '        Collections.sort(bucket);',
    '        for (int x : bucket) arr[idx++] = x;',
    '    }',
    '}',
  ],
  cpp: [
    'void bucketSort(vector<int>& arr, int bucketCount = 5) {',
    '    if (arr.size() <= 1) return;',
    '    int minVal = *min_element(arr.begin(), arr.end());',
    '    int maxVal = *max_element(arr.begin(), arr.end());',
    '    if (minVal == maxVal) return;',
    '    vector<vector<int>> buckets(bucketCount);',
    '    for (int x : arr) {',
    '        int bIdx = (long long)(x - minVal) * (bucketCount - 1) / (maxVal - minVal);',
    '        buckets[bIdx].push_back(x);',
    '    }',
    '    int idx = 0;',
    '    for (auto& bucket : buckets) {',
    '        sort(bucket.begin(), bucket.end());',
    '        for (int x : bucket) arr[idx++] = x;',
    '    }',
    '}',
  ],
  python: [
    'def bucket_sort(arr: list[int], bucket_count: int = 5) -> None:',
    '    if len(arr) <= 1: return',
    '    min_v, max_v = min(arr), max(arr)',
    '    if min_v == max_v: return',
    '    buckets = [[] for _ in range(bucket_count)]',
    '    for x in arr:',
    '        b_idx = (x - min_v) * (bucket_count - 1) // (max_v - min_v)',
    '        buckets[b_idx].append(x)',
    '    idx = 0',
    '    for bucket in buckets:',
    '        bucket.sort()',
    '        for x in bucket:',
    '            arr[idx] = x',
    '            idx += 1',
  ],
  javascript: [
    'function bucketSort(arr, bucketCount = 5) {',
    '    if (arr.length <= 1) return;',
    '    const min = Math.min(...arr), max = Math.max(...arr);',
    '    if (min === max) return;',
    '    const buckets = Array.from({ length: bucketCount }, () => []);',
    '    for (const x of arr) {',
    '        const bIdx = Math.floor((x - min) * (bucketCount - 1) / (max - min));',
    '        buckets[bIdx].push(x);',
    '    }',
    '    let idx = 0;',
    '    for (const bucket of buckets) {',
    '        bucket.sort((a, b) => a - b);',
    '        for (const x of bucket) arr[idx++] = x;',
    '    }',
    '}',
  ],
};
