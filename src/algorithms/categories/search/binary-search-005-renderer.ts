/**
 * Class 005: 二分搜索与局部最小值检测 (Binary Search & Local Minimum)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export interface BinarySearch005Step extends StepBase {
  nums: number[];
  mode: 'find' | 'findLeft' | 'localMin';
  l: number;
  r: number;
  mid: number;
  target?: number;
  foundIndex: number;
  decision: string;
  message: string;
  log: string;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const BINARY_SEARCH_005_CODES = {
  java: `public class BinarySearch {
    // 1. 查找某个数是否存在
    public static int find(int[] arr, int target) {
        int l = 0, r = arr.length - 1;
        while (l <= r) {
            int mid = l + ((r - l) >> 1);
            if (arr[mid] == target) return mid;
            else if (arr[mid] < target) l = mid + 1;
            else r = mid - 1;
        }
        return -1;
    }
    // 2. >= target 的最左位置
    public static int findLeft(int[] arr, int target) {
        int l = 0, r = arr.length - 1, ans = -1;
        while (l <= r) {
            int mid = l + ((r - l) >> 1);
            if (arr[mid] >= target) { ans = mid; r = mid - 1; }
            else l = mid + 1;
        }
        return ans;
    }
    // 3. 局部最小值 (无序但相邻不等)
    public static int localMin(int[] arr) {
        int n = arr.length;
        if (n == 1 || arr[0] < arr[1]) return 0;
        if (arr[n - 1] < arr[n - 2]) return n - 1;
        int l = 1, r = n - 2;
        while (l <= r) {
            int mid = l + ((r - l) >> 1);
            if (arr[mid] > arr[mid - 1]) r = mid - 1;
            else if (arr[mid] > arr[mid + 1]) l = mid + 1;
            else return mid;
        }
        return l;
    }
}`,
  cpp: `int find(const vector<int>& arr, int target) {
    int l = 0, r = arr.size() - 1;
    while (l <= r) {
        int mid = l + (r - l) / 2;
        if (arr[mid] == target) return mid;
        else if (arr[mid] < target) l = mid + 1;
        else r = mid - 1;
    }
    return -1;
}
int findLeft(const vector<int>& arr, int target) {
    int l = 0, r = arr.size() - 1, ans = -1;
    while (l <= r) {
        int mid = l + (r - l) / 2;
        if (arr[mid] >= target) { ans = mid; r = mid - 1; }
        else l = mid + 1;
    }
    return ans;
}
int localMin(const vector<int>& arr) {
    int n = arr.size();
    if (n == 1 || arr[0] < arr[1]) return 0;
    if (arr[n - 1] < arr[n - 2]) return n - 1;
    int l = 1, r = n - 2;
    while (l <= r) {
        int mid = l + (r - l) / 2;
        if (arr[mid] > arr[mid - 1]) r = mid - 1;
        else if (arr[mid] > arr[mid + 1]) l = mid + 1;
        else return mid;
    }
    return l;
}`,
  python: `def find(arr, target):
    l, r = 0, len(arr) - 1
    while l <= r:
        mid = l + (r - l) // 2
        if arr[mid] == target: return mid
        elif arr[mid] < target: l = mid + 1
        else: r = mid - 1
    return -1

def find_left(arr, target):
    l, r, ans = 0, len(arr) - 1, -1
    while l <= r:
        mid = l + (r - l) // 2
        if arr[mid] >= target: ans, r = mid, mid - 1
        else: l = mid + 1
    return ans

def local_min(arr):
    n = len(arr)
    if n == 1 or arr[0] < arr[1]: return 0
    if arr[n - 1] < arr[n - 2]: return n - 1
    l, r = 1, n - 2
    while l <= r:
        mid = l + (r - l) // 2
        if arr[mid] > arr[mid - 1]: r = mid - 1
        elif arr[mid] > arr[mid + 1]: l = mid + 1
        else: return mid
    return l`,
  typescript: `export function find(arr: number[], target: number): number {
    let l = 0, r = arr.length - 1;
    while (l <= r) {
        const mid = l + Math.floor((r - l) / 2);
        if (arr[mid] === target) return mid;
        else if (arr[mid] < target) l = mid + 1;
        else r = mid - 1;
    }
    return -1;
}
export function findLeft(arr: number[], target: number): number {
    let l = 0, r = arr.length - 1, ans = -1;
    while (l <= r) {
        const mid = l + Math.floor((r - l) / 2);
        if (arr[mid] >= target) { ans = mid; r = mid - 1; }
        else l = mid + 1;
    }
    return ans;
}
export function localMin(arr: number[]): number {
    const n = arr.length;
    if (n === 1 || arr[0] < arr[1]) return 0;
    if (arr[n - 1] < arr[n - 2]) return n - 1;
    let l = 1, r = n - 2;
    while (l <= r) {
        const mid = l + Math.floor((r - l) / 2);
        if (arr[mid] > arr[mid - 1]) r = mid - 1;
        else if (arr[mid] > arr[mid + 1]) l = mid + 1;
        else return mid;
    }
    return l;
}`
};

export function buildBinarySearch005Steps(
  nums: number[],
  mode: 'find' | 'findLeft' | 'localMin',
  target: number = 5
): BinarySearch005Step[] {
  const steps: BinarySearch005Step[] = [];
  const n = nums.length;

  steps.push({
    nums,
    mode,
    l: 0,
    r: n - 1,
    mid: -1,
    target,
    foundIndex: -1,
    decision: `主函数入口：模式【${mode === 'find' ? '精确二分查找' : mode === 'findLeft' ? '>=目标最左位置' : '局部极小值检测'}】`,
    message: '二分的本质不在于是否有序，而在于能否根据中点判定单侧丢弃一半解空间',
    log: `enter binarySearch(mode=${mode})`,
    codeLine: 1,
    statusBadge: { text: '初始化范围', type: 'info' },
  });

  if (mode === 'find') {
    let l = 0, r = n - 1;
    while (l <= r) {
      const mid = l + Math.floor((r - l) / 2);
      const val = nums[mid];
      steps.push({
        nums,
        mode,
        l,
        r,
        mid,
        target,
        foundIndex: -1,
        decision: `考察中点 mid = ${mid} (值 ${val})，搜索区间 [${l} .. ${r}]，目标 target = ${target}`,
        message: val === target ? `🎉 命中目标！返回下标 ${mid}` : val < target ? `当前值小于目标，左半区间全丢弃，收缩至 [${mid + 1} .. ${r}]` : `当前值大于目标，右半区间全丢弃，收缩至 [${l} .. ${mid - 1}]`,
        log: `mid=${mid}, val=${val}`,
        codeLine: 6,
        statusBadge: val === target ? { text: '命中目标', type: 'success' } : { text: '区间折半', type: 'warning' },
      });
      if (val === target) {
        steps.push({
          nums,
          mode,
          l,
          r,
          mid,
          target,
          foundIndex: mid,
          decision: `最终返回目标在数组中的下标: ${mid}`,
          message: '二分查找成功结束',
          log: `return ${mid}`,
          codeLine: 7,
          statusBadge: { text: `找到下标 [${mid}]`, type: 'success' },
        });
        return steps;
      } else if (val < target) {
        l = mid + 1;
      } else {
        r = mid - 1;
      }
    }
    steps.push({
      nums,
      mode,
      l,
      r,
      mid: -1,
      target,
      foundIndex: -1,
      decision: `区间折半收敛为空 (l > r)，数组中不存在值为 ${target} 的元素，返回 -1`,
      message: '目标不存在',
      log: 'return -1',
      codeLine: 11,
      statusBadge: { text: '未找到 (-1)', type: 'danger' },
    });
  } else if (mode === 'findLeft') {
    let l = 0, r = n - 1, ans = -1;
    while (l <= r) {
      const mid = l + Math.floor((r - l) / 2);
      const val = nums[mid];
      const isGe = val >= target;
      if (isGe) ans = mid;
      steps.push({
        nums,
        mode,
        l,
        r,
        mid,
        target,
        foundIndex: ans,
        decision: `考察中点 mid = ${mid} (值 ${val})：${val} >= ${target} 判定为 ${isGe}`,
        message: isGe ? `暂存潜在答案 ans=${mid}，尝试向左继续寻找更左边界，r 收缩为 ${mid - 1}` : `中点值小于目标，左侧不可能满足条件，l 调整为 ${mid + 1}`,
        log: `mid=${mid}, ans=${ans}`,
        codeLine: 17,
        statusBadge: isGe ? { text: `更新最左 ans=${mid}`, type: 'success' } : { text: '向右探测', type: 'info' },
      });
      if (isGe) r = mid - 1;
      else l = mid + 1;
    }
    steps.push({
      nums,
      mode,
      l,
      r,
      mid: ans,
      target,
      foundIndex: ans,
      decision: `搜索完毕！>= ${target} 的最左位置为下标 [${ans}] (值 ${ans >= 0 ? nums[ans] : '无'})`,
      message: '找到最优边界',
      log: `return leftBound=${ans}`,
      codeLine: 21,
      statusBadge: { text: `最左位置 [${ans}]`, type: 'success' },
    });
  } else {
    // 局部最小值
    if (n === 1 || nums[0] < nums[1]) {
      steps.push({
        nums,
        mode,
        l: 0,
        r: 0,
        mid: 0,
        foundIndex: 0,
        decision: `边界判断：0 号位置 ${nums[0]} 小于右侧 ${nums[1] || '边界'}，0 自身即为局部最小点！`,
        message: '左边界命中极小值',
        log: 'return 0',
        codeLine: 26,
        statusBadge: { text: '边界命中 [0]', type: 'success' },
      });
      return steps;
    }
    if (nums[n - 1] < nums[n - 2]) {
      steps.push({
        nums,
        mode,
        l: n - 1,
        r: n - 1,
        mid: n - 1,
        foundIndex: n - 1,
        decision: `边界判断：末尾位置 ${nums[n - 1]} 小于左侧 ${nums[n - 2]}，末尾自身即为局部最小点！`,
        message: '右边界命中极小值',
        log: `return ${n - 1}`,
        codeLine: 27,
        statusBadge: { text: `边界命中 [${n - 1}]`, type: 'success' },
      });
      return steps;
    }
    let l = 1, r = n - 2;
    while (l <= r) {
      const mid = l + Math.floor((r - l) / 2);
      const isLeftDown = nums[mid] > nums[mid - 1];
      const isRightDown = nums[mid] > nums[mid + 1];
      steps.push({
        nums,
        mode,
        l,
        r,
        mid,
        foundIndex: -1,
        decision: `考察中点 mid=${mid} (值 ${nums[mid]})，邻近左侧=${nums[mid - 1]}，右侧=${nums[mid + 1]}`,
        message: isLeftDown ? `左侧更低，根据斜率判断，[l .. mid-1] 内必定存在极小点！` : isRightDown ? `右侧更低，根据斜率判断，[mid+1 .. r] 内必定存在极小点！` : `左右皆高于自身，当前 mid=${mid} 即为局部极小谷底！`,
        log: `localMin mid=${mid}`,
        codeLine: 31,
        statusBadge: (!isLeftDown && !isRightDown) ? { text: `命中谷底 [${mid}]`, type: 'success' } : { text: '斜率收缩', type: 'warning' },
      });
      if (isLeftDown) {
        r = mid - 1;
      } else if (isRightDown) {
        l = mid + 1;
      } else {
        steps.push({
          nums,
          mode,
          l,
          r,
          mid,
          foundIndex: mid,
          decision: `🎉 成功捕获局部最小值！下标 [${mid}] 对应数值为 ${nums[mid]}`,
          message: '局部极小值二分检测完成',
          log: `return localMin=${mid}`,
          codeLine: 34,
          statusBadge: { text: `谷底点 [${mid}]`, type: 'success' },
        });
        return steps;
      }
    }
  }

  return steps;
}

export const binarySearch005Visualizer = registerDeclarativeAlgorithm<BinarySearch005Step>({
  id: 'binary-search-005',
  name: '二分搜索与局部最小值检测 (Class 005)',
  category: 'search',
  icon: '🔍',
  difficulty: 1,
  levelOrder: 5,
  learningGoal: '掌握二分查找在精确命中、求 >= 目标最左/最右以及无序数组局部极值检测中的精妙折半应用',
  problemHtml: `
    <div style="font-family: inherit; line-height: 1.6; color: #1e293b;">
      <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 8px;">二分思想三板斧</h3>
      <ol>
        <li><strong>有序数组精准二分：</strong>根据 <code>arr[mid]</code> 与 <code>target</code> 比对，单次折半缩小一半区间。</li>
        <li><strong>边界二分 (>= target 最左)：</strong>满足条件时暂存答案并向左压缩，不满足时向右推进。</li>
        <li><strong>极值二分 (局部最小值)：</strong>数组相邻元素不相等，首尾呈下降/上升趋势时，根据中点局部导数趋势必然可以在单侧锁定谷底极小点。</li>
      </ol>
    </div>
  `,
  inputs: [
    {
      id: 'nums',
      label: '输入序列 (逗号分隔)',
      type: 'text',
      defaultValue: '1, 2, 4, 4, 4, 5, 8, 9',
      placeholder: '请输入正整数列表',
    },
    {
      id: 'mode',
      label: '二分模式',
      type: 'select',
      defaultValue: 'findLeft',
      options: [
        { label: '寻找等于目标某数 (find)', value: 'find' },
        { label: '寻找 >= 目标的最左位置 (findLeft)', value: 'findLeft' },
        { label: '无序相邻不等局部极小值 (localMin)', value: 'localMin' },
      ],
    },
    {
      id: 'target',
      label: '目标值 (target)',
      type: 'number',
      defaultValue: 4,
    },
  ],
  codeLanguages: BINARY_SEARCH_005_CODES,
  generateSteps: (inputs) => {
    const raw = String(inputs.nums || '1, 2, 4, 4, 4, 5, 8, 9');
    const nums = raw.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    const mode = (inputs.mode || 'findLeft') as 'find' | 'findLeft' | 'localMin';
    const target = parseInt(String(inputs.target || 4), 10);
    return buildBinarySearch005Steps(nums.length > 0 ? nums : [1, 2, 4, 4, 4, 5, 8, 9], mode, target);
  },
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
        <!-- 顶部指标卡 -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 16px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">左指针 L</div>
            <div style="font-size: 18px; font-weight: 700; color: #0284c7; margin-top: 4px;">[${step.l}]</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">中点指针 MID</div>
            <div style="font-size: 18px; font-weight: 700; color: #8b5cf6; margin-top: 4px;">${step.mid >= 0 ? `[${step.mid}]` : '-'}</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #64748b;">右指针 R</div>
            <div style="font-size: 18px; font-weight: 700; color: #059669; margin-top: 4px;">[${step.r}]</div>
          </div>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 10px; text-align: center;">
            <div style="font-size: 11px; color: #166534;">当前确定答案</div>
            <div style="font-size: 20px; font-weight: 800; color: #15803d; margin-top: 4px;">${step.foundIndex >= 0 ? `下标 [${step.foundIndex}]` : '探测中...'}</div>
          </div>
        </div>

        <!-- 数组索引区间展板 -->
        <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 10px; padding: 16px; margin-bottom: 16px;">
          <div style="font-size: 12px; font-weight: 700; color: #334155; margin-bottom: 10px;">🔍 搜索序列与当前考量窗口</div>
          <div style="display: flex; gap: 8px; justify-content: center; flex-wrap: wrap;">
            ${step.nums.map((val, idx) => {
              const inRange = idx >= step.l && idx <= step.r;
              const isMid = idx === step.mid;
              const isAns = idx === step.foundIndex;
              let border = '#cbd5e1';
              let bg = inRange ? '#eff6ff' : '#f1f5f9';
              let textCol = inRange ? '#1e293b' : '#94a3b8';
              if (isMid) { bg = '#fef3c7'; border = '#f59e0b'; }
              if (isAns) { bg = '#dcfce7'; border = '#22c55e'; textCol = '#15803d'; }

              return `
                <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; min-width: 44px;">
                  <span style="font-size: 10px; font-family: monospace; color: ${isMid ? '#f59e0b' : idx === step.l ? '#0284c7' : idx === step.r ? '#059669' : '#94a3b8'}; font-weight: 700;">
                    ${isMid ? 'MID' : idx === step.l ? 'L' : idx === step.r ? 'R' : ''}
                  </span>
                  <div style="width: 44px; height: 38px; display: flex; align-items: center; justify-content: center; background: ${bg}; border: 2px solid ${border}; border-radius: 6px; font-weight: 700; color: ${textCol}; font-size: 15px;">
                    ${val}
                  </div>
                  <span style="font-size: 10px; color: #94a3b8; font-family: monospace;">[${idx}]</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 决策卡片 -->
        ${renderFormulaCard(
          '二分状态转移推导',
          `当前探测窗口 [${step.l} .. ${step.r}] | mid = ${step.mid >= 0 ? step.mid : 'N/A'} (值 ${step.mid >= 0 ? step.nums[step.mid] : 'N/A'})`,
          step.decision,
          step.statusBadge
        )}
      </div>
    `;
  },
});
