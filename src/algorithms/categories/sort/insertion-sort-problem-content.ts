/**
 * 插入排序 (Insertion Sort)
 * 领域知识与题解精讲配置声明
 */

export const INSERTION_SORT_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">Sort</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(16,185,129,0.2); color: #34d399; font-weight: 700; border: 1px solid rgba(16,185,129,0.3);">Elementary</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">插入排序 (Insertion Sort)</h2>
    </div>
    <p style="margin: 0;"><strong>插入排序（Insertion Sort）</strong> 的工作方式像许多人玩扑克牌时整理手中的牌一样。每次从无序区取出第一个元素 <code style="color: #fde047; font-family: monospace;">key</code>，在有序区中从后向前扫描，找到相应位置并插入。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例:</div>
      <div>输入: nums = [12, 11, 13, 5, 6]</div>
      <div>输出: [5, 6, 11, 12, 13]</div>
      <div style="color: #94a3b8;">解释: 将 11 插入到 [12] 前面变为 [11, 12]；将 13 插入末尾变为 [11, 12, 13]；将 5 插入最前...</div>
    </div>
  </div>
`;

export const INSERTION_SORT_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 抓牌模型与元素后移腾位（Shift & Insert）
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 核心算法流程</div>
        <p style="margin: 0; color: #94a3b8;">
        1. 从第 1 个元素开始（下标 <code style="color: #38bdf8; font-family: monospace;">i = 1..n-1</code>），提取待插入值 <code style="color: #fde047; font-family: monospace;">key = arr[i]</code>；<br/>
        2. 指针 <code style="color: #fbbf24; font-family: monospace;">j = i - 1</code> 从有序区末尾向前扫描；<br/>
        3. 只要 <code style="color: #f87171; font-family: monospace;">j >= 0 && arr[j] > key</code>，将元素向右搬移一位 <code style="color: #38bdf8; font-family: monospace;">arr[j + 1] = arr[j]</code>，腾出空位，<code style="color: #fbbf24; font-family: monospace;">j--</code>；<br/>
        4. 扫描结束后，将 <code style="color: #34d399; font-family: monospace;">key</code> 放入腾出的空位 <code style="color: #34d399; font-family: monospace;">arr[j + 1] = key</code>。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 复杂度与优势</div>
        <p style="margin: 0; color: #94a3b8;">
        • 最好时间复杂度：<code style="color: #34d399; font-family: monospace;">O(n)</code>（数组基本有序时，只需比较 1 次即插入）。<br/>
        • 最坏与平均时间复杂度：<code style="color: #f87171; font-family: monospace;">O(n²)</code>。<br/>
        • 空间复杂度：<code style="color: #34d399; font-family: monospace;">O(1)</code>。<br/>
        • 稳定性：<strong>稳定</strong>。<br/>
        • <strong>实战特性：</strong> 对于<strong>小规模数组（n &le; 16）或基本有序数组</strong>，插入排序常数极小，性能超越快速排序（工业级排序如 TimSort / DualPivotQuicksort 均以内嵌插入排序作为底仓）。
        </p>
      </div>
    </div>
  </div>
`;

export const INSERTION_SORT_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    'public void insertionSort(int[] arr) {',
    '    int n = arr.length;',
    '    for (int i = 1; i < n; i++) {',
    '        int key = arr[i];',
    '        int j = i - 1;',
    '        // 有序区中比 key 大的元素后移腾位',
    '        while (j >= 0 && arr[j] > key) {',
    '            arr[j + 1] = arr[j];',
    '            j--;',
    '        }',
    '        arr[j + 1] = key; // 插入到目标位置',
    '    }',
    '}',
  ],
  cpp: [
    'void insertionSort(vector<int>& arr) {',
    '    int n = arr.size();',
    '    for (int i = 1; i < n; i++) {',
    '        int key = arr[i];',
    '        int j = i - 1;',
    '        while (j >= 0 && arr[j] > key) {',
    '            arr[j + 1] = arr[j];',
    '            j--;',
    '        }',
    '        arr[j + 1] = key;',
    '    }',
    '}',
  ],
  python: [
    'def insertion_sort(arr: list[int]) -> None:',
    '    n = len(arr)',
    '    for i in range(1, n):',
    '        key = arr[i]',
    '        j = i - 1',
    '        while j >= 0 and arr[j] > key:',
    '            arr[j + 1] = arr[j]',
    '            j -= 1',
    '        arr[j + 1] = key',
  ],
  javascript: [
    'function insertionSort(arr) {',
    '    const n = arr.length;',
    '    for (let i = 1; i < n; i++) {',
    '        const key = arr[i];',
    '        let j = i - 1;',
    '        while (j >= 0 && arr[j] > key) {',
    '            arr[j + 1] = arr[j];',
    '            j--;',
    '        }',
    '        arr[j + 1] = key;',
    '    }',
    '}',
  ],
};
