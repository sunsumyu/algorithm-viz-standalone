/**
 * 左程云 Class 071 & 072 讲义与四语言标准代码 (Java / C++ / Python / JavaScript)
 * 1. 最长递增子序列的个数 (LeetCode 673 · Class 071 Code02)
 * 2. 堆叠长方体的最大高度 (LeetCode 1691 · Class 072 Code01)
 * 3. 使数组 K 递增的最少操作次数 (LeetCode 2111 · Class 072 Code02)
 */

export type CodeLanguageDict = Record<string, string>;

// ==========================================
// 1. 最长递增子序列的个数 (LeetCode 673)
// ==========================================
export const NUMBER_OF_LIS_071_LINES = {
  entry: { java: 4, cpp: 4, python: 3, javascript: 3 },
  initDp: { java: 6, cpp: 6, python: 4, javascript: 5 },
  outerLoop: { java: 9, cpp: 9, python: 6, javascript: 8 },
  innerLoop: { java: 10, cpp: 10, python: 7, javascript: 9 },
  longerFound: { java: 12, cpp: 12, python: 9, javascript: 11 },
  equalLength: { java: 15, cpp: 15, python: 12, javascript: 14 },
  updateMax: { java: 19, cpp: 19, python: 14, javascript: 18 },
  sumResult: { java: 22, cpp: 22, python: 16, javascript: 21 },
};

export const NUMBER_OF_LIS_071_CODES: CodeLanguageDict = {
  java: [
    'class Solution {',
    '    public int findNumberOfLIS(int[] nums) {',
    '        int n = nums.length;',
    '        if (n <= 1) return n;',
    '        int[] len = new int[n];',
    '        int[] cnt = new int[n];',
    '        Arrays.fill(len, 1);',
    '        Arrays.fill(cnt, 1);',
    '        int maxLen = 1;',
    '        for (int i = 0; i < n; i++) {',
    '            for (int j = 0; j < i; j++) {',
    '                if (nums[j] < nums[i]) {',
    '                    if (len[j] + 1 > len[i]) {',
    '                        len[i] = len[j] + 1;',
    '                        cnt[i] = cnt[j];',
    '                    } else if (len[j] + 1 == len[i]) {',
    '                        cnt[i] += cnt[j];',
    '                    }',
    '                }',
    '            }',
    '            maxLen = Math.max(maxLen, len[i]);',
    '        }',
    '        int ans = 0;',
    '        for (int i = 0; i < n; i++) {',
    '            if (len[i] == maxLen) ans += cnt[i];',
    '        }',
    '        return ans;',
    '    }',
    '}',
  ].join('\n'),
  cpp: [
    'class Solution {',
    'public:',
    '    int findNumberOfLIS(vector<int>& nums) {',
    '        int n = nums.size();',
    '        if (n <= 1) return n;',
    '        vector<int> len(n, 1), cnt(n, 1);',
    '        int maxLen = 1;',
    '        for (int i = 0; i < n; i++) {',
    '            for (int j = 0; j < i; j++) {',
    '                if (nums[j] < nums[i]) {',
    '                    if (len[j] + 1 > len[i]) {',
    '                        len[i] = len[j] + 1;',
    '                        cnt[i] = cnt[j];',
    '                    } else if (len[j] + 1 == len[i]) {',
    '                        cnt[i] += cnt[j];',
    '                    }',
    '                }',
    '            }',
    '            maxLen = max(maxLen, len[i]);',
    '        }',
    '        int ans = 0;',
    '        for (int i = 0; i < n; i++) {',
    '            if (len[i] == maxLen) ans += cnt[i];',
    '        }',
    '        return ans;',
    '    }',
    '};',
  ].join('\n'),
  python: [
    'class Solution:',
    '    def findNumberOfLIS(self, nums: List[int]) -> int:',
    '        n = len(nums)',
    '        if n <= 1: return n',
    '        length = [1] * n',
    '        count = [1] * n',
    '        for i in range(n):',
    '            for j in range(i):',
    '                if nums[j] < nums[i]:',
    '                    if length[j] + 1 > length[i]:',
    '                        length[i] = length[j] + 1',
    '                        count[i] = count[j]',
    '                    elif length[j] + 1 == length[i]:',
    '                        count[i] += count[j]',
    '        max_len = max(length)',
    '        return sum(c for l, c in zip(length, count) if l == max_len)',
  ].join('\n'),
  javascript: [
    'function findNumberOfLIS(nums) {',
    '    const n = nums.length;',
    '    if (n <= 1) return n;',
    '    const len = new Array(n).fill(1);',
    '    const cnt = new Array(n).fill(1);',
    '    let maxLen = 1;',
    '    for (let i = 0; i < n; i++) {',
    '        for (let j = 0; j < i; j++) {',
    '            if (nums[j] < nums[i]) {',
    '                if (len[j] + 1 > len[i]) {',
    '                    len[i] = len[j] + 1;',
    '                    cnt[i] = cnt[j];',
    '                } else if (len[j] + 1 === len[i]) {',
    '                    cnt[i] += cnt[j];',
    '                }',
    '            }',
    '        }',
    '        maxLen = Math.max(maxLen, len[i]);',
    '    }',
    '    let ans = 0;',
    '    for (let i = 0; i < n; i++) {',
    '        if (len[i] === maxLen) ans += cnt[i];',
    '    }',
    '    return ans;',
    '}',
  ].join('\n'),
};

export const NUMBER_OF_LIS_071_HTML = `
  <div style="line-height: 1.6; color: #cbd5e1;">
    <h3 style="color: #38bdf8; margin-bottom: 8px;">题目描述 (LeetCode 673 / 左程云 Class 071 Code02)</h3>
    <p>给定一个未排序的整数数组 <code>nums</code>，返回<strong>最长递增子序列的个数</strong>。</p>
    <div style="background: rgba(15, 23, 42, 0.6); padding: 10px 14px; border-left: 3px solid #38bdf8; margin: 10px 0; border-radius: 4px;">
      <strong style="color: #f1f5f9;">名师思维剖析：</strong><br/>
      1. <strong>状态设计</strong>：不仅要记录以 <code>nums[i]</code> 结尾的最长长度 <code>len[i]</code>，还必须记录达到该长度的路径种数 <code>cnt[i]</code>。<br/>
      2. <strong>状态转移分支</strong>：
         <ul>
           <li>发现更长序列 (<code>len[j] + 1 > len[i]</code>)：更新 <code>len[i] = len[j] + 1</code>，重置方案数 <code>cnt[i] = cnt[j]</code>；</li>
           <li>发现等长序列 (<code>len[j] + 1 == len[i]</code>)：累计方案数 <code>cnt[i] += cnt[j]</code>。</li>
         </ul>
      3. <strong>全局汇总</strong>：统计所有等于全局最大长度 <code>maxLen</code> 的位置的 <code>cnt[i]</code> 之和。
    </div>
  </div>
`;

// ==========================================
// 2. 堆叠长方体的最大高度 (LeetCode 1691)
// ==========================================
export const STACKING_CUBOIDS_072_LINES = {
  entry: { java: 4, cpp: 4, python: 3, javascript: 3 },
  sortInternal: { java: 6, cpp: 6, python: 4, javascript: 4 },
  sortCuboids: { java: 9, cpp: 9, python: 5, javascript: 5 },
  initDp: { java: 12, cpp: 12, python: 6, javascript: 7 },
  outerLoop: { java: 14, cpp: 14, python: 7, javascript: 8 },
  innerLoop: { java: 15, cpp: 15, python: 8, javascript: 9 },
  checkCondition: { java: 16, cpp: 16, python: 9, javascript: 10 },
  updateMax: { java: 19, cpp: 19, python: 11, javascript: 13 },
  returnAns: { java: 22, cpp: 22, python: 12, javascript: 16 },
};

export const STACKING_CUBOIDS_072_CODES: CodeLanguageDict = {
  java: [
    'class Solution {',
    '    public int maxHeight(int[][] cuboids) {',
    '        int n = cuboids.length;',
    '        for (int[] c : cuboids) {',
    '            Arrays.sort(c); // 每个长方体长宽高内部升序，保证最大值在最后一维(高度)',
    '        }',
    '        // 整体按长、宽、高三维升序排序',
    '        Arrays.sort(cuboids, (a, b) -> a[0] != b[0] ? a[0] - b[0] : (a[1] != b[1] ? a[1] - b[1] : a[2] - b[2]));',
    '        int[] dp = new int[n];',
    '        int ans = 0;',
    '        for (int i = 0; i < n; i++) {',
    '            dp[i] = cuboids[i][2]; // 初始高度为自身最高高度',
    '            for (int j = 0; j < i; j++) {',
    '                // 若长方体 j 的长宽高均不大于长方体 i，则 j 可以放在 i 的上方/下方',
    '                if (cuboids[j][0] <= cuboids[i][0] && cuboids[j][1] <= cuboids[i][1] && cuboids[j][2] <= cuboids[i][2]) {',
    '                    dp[i] = Math.max(dp[i], dp[j] + cuboids[i][2]);',
    '                }',
    '            }',
    '            ans = Math.max(ans, dp[i]);',
    '        }',
    '        return ans;',
    '    }',
    '}',
  ].join('\n'),
  cpp: [
    'class Solution {',
    'public:',
    '    int maxHeight(vector<vector<int>>& cuboids) {',
    '        for (auto& c : cuboids) sort(c.begin(), c.end());',
    '        sort(cuboids.begin(), cuboids.end());',
    '        int n = cuboids.size();',
    '        vector<int> dp(n);',
    '        int ans = 0;',
    '        for (int i = 0; i < n; i++) {',
    '            dp[i] = cuboids[i][2];',
    '            for (int j = 0; j < i; j++) {',
    '                if (cuboids[j][0] <= cuboids[i][0] && cuboids[j][1] <= cuboids[i][1] && cuboids[j][2] <= cuboids[i][2]) {',
    '                    dp[i] = max(dp[i], dp[j] + cuboids[i][2]);',
    '                }',
    '            }',
    '            ans = max(ans, dp[i]);',
    '        }',
    '        return ans;',
    '    }',
    '};',
  ].join('\n'),
  python: [
    'class Solution:',
    '    def maxHeight(self, cuboids: List[List[int]]) -> int:',
    '        for c in cuboids: c.sort()',
    '        cuboids.sort()',
    '        n = len(cuboids)',
    '        dp = [c[2] for c in cuboids]',
    '        for i in range(n):',
    '            for j in range(i):',
    '                if cuboids[j][0] <= cuboids[i][0] and cuboids[j][1] <= cuboids[i][1] and cuboids[j][2] <= cuboids[i][2]:',
    '                    dp[i] = max(dp[i], dp[j] + cuboids[i][2])',
    '        return max(dp)',
  ].join('\n'),
  javascript: [
    'function maxHeight(cuboids) {',
    '    for (const c of cuboids) c.sort((a, b) => a - b);',
    '    cuboids.sort((a, b) => a[0] !== b[0] ? a[0] - b[0] : (a[1] !== b[1] ? a[1] - b[1] : a[2] - b[2]));',
    '    const n = cuboids.length;',
    '    const dp = cuboids.map(c => c[2]);',
    '    let ans = 0;',
    '    for (let i = 0; i < n; i++) {',
    '        for (let j = 0; j < i; j++) {',
    '            if (cuboids[j][0] <= cuboids[i][0] && cuboids[j][1] <= cuboids[i][1] && cuboids[j][2] <= cuboids[i][2]) {',
    '                dp[i] = Math.max(dp[i], dp[j] + cuboids[i][2]);',
    '            }',
    '        }',
    '        ans = Math.max(ans, dp[i]);',
    '    }',
    '    return ans;',
    '}',
  ].join('\n'),
};

export const STACKING_CUBOIDS_072_HTML = `
  <div style="line-height: 1.6; color: #cbd5e1;">
    <h3 style="color: #38bdf8; margin-bottom: 8px;">题目描述 (LeetCode 1691 / 左程云 Class 072 Code01)</h3>
    <p>给你 <code>n</code> 个长方体 <code>cuboids</code>，其中每个长方体的三维尺寸为 <code>[width, length, height]</code>。你可以任意旋转长方体。如果长方体 <code>j</code> 放置在长方体 <code>i</code> 上面，必须满足 <code>w_j <= w_i && l_j <= l_i && h_j <= h_i</code>。求可以堆叠出的<strong>最大总高度</strong>。</p>
    <div style="background: rgba(15, 23, 42, 0.6); padding: 10px 14px; border-left: 3px solid #38bdf8; margin: 10px 0; border-radius: 4px;">
      <strong style="color: #f1f5f9;">名师贪心与 DP 降维破局：</strong><br/>
      1. <strong>贪心最优性</strong>：如果长方体 A 能够叠在 B 上，那么将 A 和 B 均把<strong>最长边立起来作为高</strong>，其余两边按小到大作为宽和长，依然绝对满足底面包含关系！并且高度收益最大！<br/>
      2. <strong>长方体内部归一化</strong>：先对每个长方体内部升序排序，使 <code>c[0] <= c[1] <= c[2]</code>。<br/>
      3. <strong>整体排序与 LIS 转换</strong>：将长方体整体按字典序升序排序，问题完美转化为三维偏序的<strong>带权最长递增子序列 (LIS)</strong>，<code>dp[i] = max(dp[j]) + cuboids[i][2]</code>。
    </div>
  </div>
`;

// ==========================================
// 3. 使数组 K 递增的最少操作次数 (LeetCode 2111)
// ==========================================
export const K_INCREASING_ARRAY_072_LINES = {
  entry: { java: 4, cpp: 4, python: 3, javascript: 3 },
  outerGroupLoop: { java: 6, cpp: 6, python: 5, javascript: 5 },
  collectSubseq: { java: 8, cpp: 8, python: 6, javascript: 7 },
  calcLis: { java: 12, cpp: 12, python: 8, javascript: 11 },
  binarySearchUpper: { java: 18, cpp: 18, python: 13, javascript: 17 },
  accumulateAns: { java: 25, cpp: 25, python: 17, javascript: 24 },
  returnTotal: { java: 28, cpp: 28, python: 19, javascript: 27 },
};

export const K_INCREASING_ARRAY_072_CODES: CodeLanguageDict = {
  java: [
    'class Solution {',
    '    public int kIncreasing(int[] arr, int k) {',
    '        int n = arr.length;',
    '        int ans = 0;',
    '        for (int i = 0; i < k; i++) {',
    '            List<Integer> sub = new ArrayList<>();',
    '            for (int j = i; j < n; j += k) {',
    '                sub.add(arr[j]);',
    '            }',
    '            ans += sub.size() - lengthOfNonDecreasing(sub);',
    '        }',
    '        return ans;',
    '    }',
    '    private int lengthOfNonDecreasing(List<Integer> nums) {',
    '        int[] ends = new int[nums.size()];',
    '        int len = 0;',
    '        for (int x : nums) {',
    '            int l = 0, r = len - 1, pos = len;',
    '            while (l <= r) {',
    '                int m = (l + r) / 2;',
    '                if (ends[m] > x) { // 寻找首个大于 x 的位置(upper_bound)',
    '                    pos = m;',
    '                    r = m - 1;',
    '                } else {',
    '                    l = m + 1;',
    '                }',
    '            }',
    '            ends[pos] = x;',
    '            if (pos == len) len++;',
    '        }',
    '        return len;',
    '    }',
    '}',
  ].join('\n'),
  cpp: [
    'class Solution {',
    'public:',
    '    int kIncreasing(vector<int>& arr, int k) {',
    '        int n = arr.size(), ans = 0;',
    '        for (int i = 0; i < k; i++) {',
    '            vector<int> sub;',
    '            for (int j = i; j < n; j += k) sub.push_back(arr[j]);',
    '            ans += sub.size() - lengthOfNonDecreasing(sub);',
    '        }',
    '        return ans;',
    '    }',
    '    int lengthOfNonDecreasing(const vector<int>& nums) {',
    '        vector<int> ends;',
    '        for (int x : nums) {',
    '            auto it = upper_bound(ends.begin(), ends.end(), x);',
    '            if (it == ends.end()) ends.push_back(x);',
    '            else *it = x;',
    '        }',
    '        return ends.size();',
    '    }',
    '};',
  ].join('\n'),
  python: [
    'class Solution:',
    '    def kIncreasing(self, arr: List[int], k: int) -> int:',
    '        import bisect',
    '        ans = 0',
    '        for i in range(k):',
    '            sub = arr[i::k]',
    '            ends = []',
    '            for x in sub:',
    '                idx = bisect.bisect_right(ends, x) # upper_bound',
    '                if idx == len(ends): ends.append(x)',
    '                else: ends[idx] = x',
    '            ans += len(sub) - len(ends)',
    '        return ans',
  ].join('\n'),
  javascript: [
    'function kIncreasing(arr, k) {',
    '    const n = arr.length;',
    '    let ans = 0;',
    '    for (let i = 0; i < k; i++) {',
    '        const sub = [];',
    '        for (let j = i; j < n; j += k) sub.push(arr[j]);',
    '        ans += sub.length - lengthOfNonDecreasing(sub);',
    '    }',
    '    return ans;',
    '}',
    'function lengthOfNonDecreasing(nums) {',
    '    const ends = [];',
    '    for (const x of nums) {',
    '        let l = 0, r = ends.length - 1, pos = ends.length;',
    '        while (l <= r) {',
    '            const m = (l + r) >> 1;',
    '            if (ends[m] > x) {',
    '                pos = m;',
    '                r = m - 1;',
    '            } else {',
    '                l = m + 1;',
    '            }',
    '        }',
    '        ends[pos] = x;',
    '    }',
    '    return ends.length;',
    '}',
  ].join('\n'),
};

export const K_INCREASING_ARRAY_072_HTML = `
  <div style="line-height: 1.6; color: #cbd5e1;">
    <h3 style="color: #38bdf8; margin-bottom: 8px;">题目描述 (LeetCode 2111 / 左程云 Class 072 Code02)</h3>
    <p>给你一个下标从 <code>0</code> 开始包含 <code>n</code> 个正整数的数组 <code>arr</code> ，和一个正整数 <code>k</code>。如果对于每个 <code>i (k <= i <= n-1)</code> 都有 <code>arr[i-k] <= arr[i]</code>，那么数组是 <strong>K 递增</strong> 的。你可以将任意元素修改为任意正整数，返回使数组成为 K 递增的<strong>最少操作次数</strong>。</p>
    <div style="background: rgba(15, 23, 42, 0.6); padding: 10px 14px; border-left: 3px solid #38bdf8; margin: 10px 0; border-radius: 4px;">
      <strong style="color: #f1f5f9;">名师分组与非严格递增 LIS 洞察：</strong><br/>
      1. <strong>模 k 分组解耦</strong>：下标 <code>i, i+k, i+2k...</code> 之间的约束彼此独立。我们可以将全数组划分为 <code>k</code> 组独立的子序列。<br/>
      2. <strong>最少修改 = 总长度 - 最长不下降子序列长度</strong>：保留尽可能多的元素不变，剩下的必须修改！<br/>
      3. <strong>非严格递增 ends 数组维护</strong>：注意允许 <code>arr[i-k] == arr[i]</code>！因此在 <code>ends</code> 数组中寻找替换位置时，必须使用 <strong>upper_bound（寻找首个严格大于 x 的元素）</strong>，而不是 lower_bound！
    </div>
  </div>
`;
