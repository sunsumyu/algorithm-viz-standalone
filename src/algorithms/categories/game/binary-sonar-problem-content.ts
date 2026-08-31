/**
 * 深海声呐·二分探宝雷达 (Binary Search Sonar: Deep Ocean Probe)
 * 经典二分查找算法（LeetCode 704 二分查找 & LeetCode 35 搜索插入位置 & LeetCode 34 在排序数组中查找区间）
 * 多语言题解、循环不变量证明与交互式关卡配置
 */

export const BINARY_SONAR_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    'using namespace std;',
    '',
    '// 经典二分查找：左闭右闭区间 [left, right] (LeetCode 704)',
    'int search(vector<int>& nums, int target) {',
    '    int left = 0;',
    '    int right = nums.size() - 1; // 定义 target 在 [left, right] 区间',
    '    ',
    '    // 当 left <= right 时，区间 [left, right] 依然有效',
    '    while (left <= right) {',
    '        // 防溢出中点计算：等价于 (left + right) / 2',
    '        int mid = left + (right - left) / 2;',
    '        ',
    '        if (nums[mid] == target) {',
    '            return mid; // 探针成功锁定宝藏！',
    '        } else if (nums[mid] < target) {',
    '            // target 在右半区间，收缩左边界',
    '            left = mid + 1; // target 在 [mid + 1, right]',
    '        } else {',
    '            // target 在左半区间，收缩右边界',
    '            right = mid - 1; // target 在 [left, mid - 1]',
    '        }',
    '    }',
    '    ',
    '    return -1; // 未探测到目标宝藏',
    '}',
    '',
    '// 搜索插入位置 (LeetCode 35)',
    'int searchInsert(vector<int>& nums, int target) {',
    '    int left = 0, right = nums.size() - 1;',
    '    while (left <= right) {',
    '        int mid = left + (right - left) / 2;',
    '        if (nums[mid] >= target) {',
    '            right = mid - 1;',
    '        } else {',
    '            left = mid + 1;',
    '        }',
    '    }',
    '    return left;',
    '}',
  ],
  java: [
    'public class BinarySearchSonar {',
    '    // 左闭右闭区间 [left, right] 经典二分查找',
    '    public int search(int[] nums, int target) {',
    '        int left = 0;',
    '        int right = nums.length - 1;',
    '        ',
    '        while (left <= right) {',
    '            int mid = left + (right - left) / 2;',
    '            if (nums[mid] == target) {',
    '                return mid;',
    '            } else if (nums[mid] < target) {',
    '                left = mid + 1;',
    '            } else {',
    '                right = mid - 1;',
    '            }',
    '        }',
    '        ',
    '        return -1;',
    '    }',
    '}',
  ],
  python: [
    'def binary_search(nums: list[int], target: int) -> int:',
    '    """经典二分查找：左闭右闭区间 [left, right]"""',
    '    left = 0',
    '    right = len(nums) - 1',
    '    ',
    '    while left <= right:',
    '        mid = left + (right - left) // 2',
    '        if nums[mid] == target:',
    '            return mid',
    '        elif nums[mid] < target:',
    '            left = mid + 1',
    '        else:',
    '            right = mid - 1',
    '            ',
    '    return -1',
  ],
  javascript: [
    'function binarySearch(nums, target) {',
    '  let left = 0;',
    '  let right = nums.length - 1;',
    '  ',
    '  while (left <= right) {',
    '    const mid = left + Math.floor((right - left) / 2);',
    '    if (nums[mid] === target) {',
    '      return mid;',
    '    } else if (nums[mid] < target) {',
    '      left = mid + 1;',
    '    } else {',
    '      right = mid - 1;',
    '    }',
    '  }',
    '  ',
    '  return -1;',
    '}',
  ],
};

export const BINARY_SONAR_PROBLEM_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 10px;">
      <span style="font-size: 20px;">📡</span>
      <h3 style="margin: 0; font-size: 15px; font-weight: 800; color: #0f172a;">深海声呐·二分探宝雷达 (Binary Search Sonar)</h3>
      <span style="background: #eff6ff; color: #2563eb; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px; border: 1px solid #bfdbfe;">对数复杂度探宝 LeetCode 704 / 35</span>
    </div>

    <p style="font-size: 12.5px; color: #334155; margin-bottom: 10px;">
      在一片深不见底的马里亚纳海沟中，沿水平方向排列着 $N$ 个严格升序排列的深海宝藏储藏箱 $[nums_0 < nums_1 < \\dots < nums_{n-1}]$。潜艇声呐每次向中点发射探测脉冲，能够立即获知该点数值。利用有序单调性，每次探测可直接<b>排除一半的海沟搜索空间</b>，在 $O(\\log N)$ 次脉冲内精确锁定目标宝藏！
    </p>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 12px;">
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🎮 声呐探宝玩法</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>🌊 60 FPS 深海声呐扫描</b>：观察浮标左右边界 $L/R$ 与垂直金色探针 $Mid$ 的动态收缩；</li>
          <li><b>🎯 交互式手动探宝</b>：点击宝箱进行声呐探测，挑战能否在 $\\le \\lceil\\log_2 N\\rceil$ 步内锁定目标；</li>
          <li><b>✨ 循环不变量推演</b>：单步演示中点防溢出计算与左右区间排除逻辑！</li>
        </ul>
      </div>
      <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px;">
        <h4 style="margin: 0 0 4px 0; font-size: 11.5px; color: #0f172a;">🧠 二分查找精髓</h4>
        <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
          <li><b>单调性是二分的前提</b>：序列单调递增，中点与目标的大小关系必然决定解的存在半区；</li>
          <li><b>边界不变量至关重要</b>：左闭右闭 $[left, right]$ 对应循环条件 <code>left &lt;= right</code>。</li>
        </ul>
      </div>
    </div>
  </div>
`;

export const BINARY_SONAR_ANALYSIS_HTML = `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
    <h3 style="margin-top: 0; font-size: 14px; font-weight: 800; color: #0f172a;">二分查找循环不变量与复杂度证明</h3>

    <div style="margin-bottom: 10px;">
      <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #2563eb;">1. 循环不变量：区间定义的统一性</h4>
      <p style="font-size: 11.5px; color: #475569; margin: 0 0 6px 0;">
        二分查找写错的核心根源是<b>区间边界定义混淆</b>。最经典的写法是<b>左闭右闭区间 $[left, right]$</b>：
      </p>
      <ul style="margin: 0; padding-left: 16px; font-size: 11px; color: #475569;">
        <li><b>初始状态</b>：<code>left = 0, right = n - 1</code>；</li>
        <li><b>循环条件</b>：<code>left &lt;= right</code>（因为当 <code>left == right</code> 时，区间 $[left, left]$ 依然包含一个合法元素，需要探测！）；</li>
        <li><b>边界更新</b>：若 $nums[mid] < target$，则 $mid$ 已经不是解，新区间为 $[mid + 1, right]$，故 <code>left = mid + 1</code>；反之 <code>right = mid - 1</code>。</li>
      </ul>
    </div>

    <div style="margin-bottom: 10px;">
      <h4 style="margin: 0 0 4px 0; font-size: 12px; color: #0891b2;">2. 为什么计算中点使用 <code>left + (right - left) / 2</code>？</h4>
      <p style="font-size: 11.5px; color: #475569; margin: 0;">
        直接写 <code>(left + right) / 2</code> 在 <code>left + right</code> 超过整型最大值（如 $2^{31}-1$）时会发生<b>算术溢出变成负数</b>；而 <code>left + (right - left) / 2</code> 严格保证中间运算不会超过最大索引，具有极高的工业级健壮性！
      </p>
    </div>
  </div>
`;
