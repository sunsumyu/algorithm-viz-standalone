/**
 * 数组专题总结 (Array Summary)
 * 领域知识与技巧全景速查配置声明
 */

export const ARRAY_SUMMARY_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">Summary</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(168,85,247,0.2); color: #c084fc; font-weight: 700; border: 1px solid rgba(168,85,247,0.3);">Roadmap</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">数组专题知识框架 (Array Patterns Roadmap)</h2>
    </div>
    <p style="margin: 0;">数组是算法学习的基石。掌握数组核心解题范式能为后续的字符串、双指针、动态规划等奠定坚实基础。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-size: 11.5px;">
      <div style="color: #60a5fa; font-weight: 700;">数组 6 大核心解题范式：</div>
      <div>1. <strong>二分查找：</strong> 有序数组检索利器，牢记「循环不变量」与区间开闭原则（左闭右闭 vs 左闭右开）。</div>
      <div>2. <strong>快慢双指针：</strong> 原地修改数组，一个 for 循环完成元素筛选与覆盖（O(1) 空间）。</div>
      <div>3. <strong>首尾对撞双指针：</strong> 利用原数组有序性，从两端向中间归并处理极端值（如平方求最值）。</div>
      <div>4. <strong>滑动窗口：</strong> 连续子数组极值问题，右扩左缩，每个元素仅入窗出窗各一次（O(n) 时间）。</div>
      <div>5. <strong>螺旋与模拟：</strong> 矩阵模拟，严格定义转折边界（top, bottom, left, right）与循环不变量。</div>
      <div>6. <strong>一维/二维前缀和：</strong> 静态高频区间/子矩阵求和，O(n) 预处理换取 O(1) 瞬时查询。</div>
    </div>
  </div>
`;

export const ARRAY_SUMMARY_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 经典高频题型分类与核心考点速查
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 双指针三剑客</div>
        <p style="margin: 0; color: #94a3b8;">
        • <strong>LeetCode 27 移除元素：</strong> 快慢指针，快指针找新元素，慢指针记录写入位置。<br/>
        • <strong>LeetCode 977 有序数组的平方：</strong> 对撞双指针，从两端向中间比对最大平方值倒序写入。<br/>
        • <strong>LeetCode 209 长度最小子数组：</strong> 滑动窗口，sum ≥ target 时持续收缩左边界更新 minLen。
        </p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 模拟与前缀和</div>
        <p style="margin: 0; color: #94a3b8;">
        • <strong>LeetCode 59 螺旋矩阵 II：</strong> 四边界收缩（top++, right--, bottom--, left++）。<br/>
        • <strong>KamaCoder 58 区间和：</strong> prefix[R+1] - prefix[L] 差分瞬时求和。<br/>
        • <strong>KamaCoder 44 开发商购买土地：</strong> 二维容斥原理 prefix[r2+1][c2+1] - 上 - 左 + 左上。
        </p>
      </div>
    </div>
  </div>
`;

export const ARRAY_SUMMARY_CODE_LANGUAGES: Record<string, string[]> = {
  java: [
    '// 数组解题范式速览 (Java)',
    '1. 快慢双指针: int slow = 0; for (int fast = 0; ...) if (cond) nums[slow++] = nums[fast];',
    '2. 对撞双指针: int l = 0, r = n - 1; while (l <= r) { ... }',
    '3. 滑动窗口: for (int r = 0; r < n; r++) { sum += nums[r]; while (sum >= target) { ... sum -= nums[l++]; } }',
    '4. 一维前缀和: prefix[i + 1] = prefix[i] + arr[i]; // sum[L..R] = prefix[R+1] - prefix[L]',
    '5. 二维前缀和: prefix[i+1][j+1] = grid[i][j] + prefix[i][j+1] + prefix[i+1][j] - prefix[i][j];',
  ],
  cpp: [
    '// 数组解题范式速览 (C++)',
    '1. 快慢双指针: int slow = 0; for (int fast = 0; fast < n; fast++) if (cond) nums[slow++] = nums[fast];',
    '2. 对撞双指针: int l = 0, r = n - 1; while (l <= r) { ... }',
    '3. 滑动窗口: for (int r = 0; r < n; r++) { sum += nums[r]; while (sum >= target) { ... sum -= nums[l++]; } }',
    '4. 一维前缀和: prefix[i + 1] = prefix[i] + arr[i]; // sum[L..R] = prefix[R+1] - prefix[L]',
    '5. 二维前缀和: prefix[i+1][j+1] = grid[i][j] + prefix[i][j+1] + prefix[i+1][j] - prefix[i][j];',
  ],
  python: [
    '# 数组解题范式速览 (Python)',
    '# 1. 快慢双指针: slow = 0; for fast in range(n): if cond: nums[slow] = nums[fast]; slow += 1',
    '# 2. 对撞双指针: l, r = 0, n - 1; while l <= r: ...',
    '# 3. 滑动窗口: for r in range(n): sum_val += nums[r]; while sum_val >= target: ... sum_val -= nums[l]; l += 1',
    '# 4. 一维前缀和: prefix[i + 1] = prefix[i] + arr[i]',
    '# 5. 二维前缀和: prefix[i+1][j+1] = grid[i][j] + prefix[i][j+1] + prefix[i+1][j] - prefix[i][j]',
  ],
  javascript: [
    '// 数组解题范式速览 (JavaScript)',
    '// 1. 快慢双指针: let slow = 0; for (let fast = 0; fast < n; fast++) if (cond) nums[slow++] = nums[fast];',
    '// 2. 对撞双指针: let l = 0, r = n - 1; while (l <= r) { ... }',
    '// 3. 滑动窗口: for (let r = 0; r < n; r++) { sum += nums[r]; while (sum >= target) { ... sum -= nums[l++]; } }',
    '// 4. 一维前缀和: prefix[i + 1] = prefix[i] + arr[i];',
    '// 5. 二维前缀和: prefix[i+1][j+1] = grid[i][j] + prefix[i][j+1] + prefix[i+1][j] - prefix[i][j];',
  ],
};
