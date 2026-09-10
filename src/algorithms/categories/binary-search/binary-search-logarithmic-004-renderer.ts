/**
 * Class 004: 二分搜索与对数器 (Binary Search & Logarithmic Verifier)
 * 左程云算法通关课入门篇 Class 004
 * 深入解析二分搜索三种核心模型（存在性、最左边界、最右边界、无序数组局部最小值）与对数器验证机制
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { renderFormulaCard } from '../string/string-100-105/string-100-105-shared';

export interface BinarySearchStep extends StepBase {
  stepIndex?: number;
  nums: number[];
  target: number;
  left: number;
  right: number;
  mid: number;
  ansIndex: number;
  mode: 'find-leftmost' | 'find-rightmost' | 'local-minimum';
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const BINARY_SEARCH_004_CODES = {
  java: `public class BinarySearch004 {
    // 1. 查找 >= target 的最左位置
    public static int findLeftmost(int[] arr, int target) {
        int l = 0, r = arr.length - 1, ans = -1;
        while (l <= r) {
            int mid = l + ((r - l) >> 1);
            if (arr[mid] >= target) {
                ans = mid;
                r = mid - 1; // 继续向左收拢
            } else {
                l = mid + 1;
            }
        }
        return ans;
    }

    // 2. 无序数组寻找局部最小值（峰谷二分）
    public static int findLocalMin(int[] arr) {
        int n = arr.length;
        if (n == 1 || arr[0] < arr[1]) return 0;
        if (arr[n - 1] < arr[n - 2]) return n - 1;
        int l = 1, r = n - 2, ans = -1;
        while (l <= r) {
            int mid = l + ((r - l) >> 1);
            if (arr[mid] > arr[mid - 1]) {
                r = mid - 1; // 左侧必有拐点
            } else if (arr[mid] > arr[mid + 1]) {
                l = mid + 1; // 右侧必有拐点
            } else {
                return mid; // 既小于左又小于右
            }
        }
        return ans;
    }
}`,
  cpp: `class BinarySearch004 {
public:
    // 查找 >= target 的最左位置
    static int findLeftmost(const vector<int>& arr, int target) {
        int l = 0, r = arr.size() - 1, ans = -1;
        while (l <= r) {
            int mid = l + ((r - l) >> 1);
            if (arr[mid] >= target) {
                ans = mid;
                r = mid - 1;
            } else {
                l = mid + 1;
            }
        }
        return ans;
    }

    // 局部最小值
    static int findLocalMin(const vector<int>& arr) {
        int n = arr.size();
        if (n == 1 || arr[0] < arr[1]) return 0;
        if (arr[n - 1] < arr[n - 2]) return n - 1;
        int l = 1, r = n - 2;
        while (l <= r) {
            int mid = l + ((r - l) >> 1);
            if (arr[mid] > arr[mid - 1]) r = mid - 1;
            else if (arr[mid] > arr[mid + 1]) l = mid + 1;
            else return mid;
        }
        return -1;
    }
};`,
  python: `class BinarySearch004:
    @staticmethod
    def find_leftmost(arr: list[int], target: int) -> int:
        l, r, ans = 0, len(arr) - 1, -1
        while l <= r:
            mid = l + ((r - l) >> 1)
            if arr[mid] >= target:
                ans = mid
                r = mid - 1
            else:
                l = mid + 1
        return ans

    @staticmethod
    def find_local_min(arr: list[int]) -> int:
        n = len(arr)
        if n == 1 or arr[0] < arr[1]: return 0
        if arr[n - 1] < arr[n - 2]: return n - 1
        l, r = 1, n - 2
        while l <= r:
            mid = l + ((r - l) >> 1)
            if arr[mid] > arr[mid - 1]:
                r = mid - 1
            elif arr[mid] > arr[mid + 1]:
                l = mid + 1
            else:
                return mid
        return -1`,
  typescript: `export class BinarySearch004 {
  static findLeftmost(arr: number[], target: number): number {
    let l = 0, r = arr.length - 1, ans = -1;
    while (l <= r) {
      const mid = l + ((r - l) >> 1);
      if (arr[mid] >= target) {
        ans = mid;
        r = mid - 1;
      } else {
        l = mid + 1;
      }
    }
    return ans;
  }

  static findLocalMin(arr: number[]): number {
    const n = arr.length;
    if (n === 1 || arr[0] < arr[1]) return 0;
    if (arr[n - 1] < arr[n - 2]) return n - 1;
    let l = 1, r = n - 2;
    while (l <= r) {
      const mid = l + ((r - l) >> 1);
      if (arr[mid] > arr[mid - 1]) r = mid - 1;
      else if (arr[mid] > arr[mid + 1]) l = mid + 1;
      else return mid;
    }
    return -1;
  }
}`
};

export function generateBinarySearchSteps(
  nums: number[],
  target: number,
  mode: 'find-leftmost' | 'find-rightmost' | 'local-minimum' = 'find-leftmost'
): BinarySearchStep[] {
  const steps: BinarySearchStep[] = [];
  const n = nums.length;

  if (n === 0) {
    steps.push({
      stepIndex: 0,
      nums: [],
      target,
      left: -1,
      right: -1,
      mid: -1,
      ansIndex: -1,
      mode,
      decision: '数组为空，直接返回 -1',
      message: '数组长度为 0',
      log: '空数组查找结束',
      codeLine: 4,
      statusBadge: { text: '空输入', type: 'danger' }
    });
    return steps;
  }

  if (mode === 'local-minimum') {
    // 局部最小值模式
    steps.push({
      stepIndex: 0,
      nums: [...nums],
      target: 0,
      left: 0,
      right: n - 1,
      mid: -1,
      ansIndex: -1,
      mode,
      decision: '开始无序数组局部最小值二分查找',
      message: `数组首尾检查：arr[0]=${nums[0]}, arr[n-1]=${nums[n - 1]}`,
      log: '算法初始化',
      codeLine: 18,
      statusBadge: { text: '启动搜索', type: 'info' }
    });

    if (n === 1 || nums[0] < nums[1]) {
      steps.push({
        stepIndex: 1,
        nums: [...nums],
        target: 0,
        left: 0,
        right: n - 1,
        mid: 0,
        ansIndex: 0,
        mode,
        decision: `arr[0]=${nums[0]} 小于右侧元素，0号位即为局部最小值！`,
        message: '首项命中局部最小值',
        log: '命中边界局部极小值',
        codeLine: 19,
        statusBadge: { text: '命中目标', type: 'success' }
      });
      return steps;
    }

    if (nums[n - 1] < nums[n - 2]) {
      steps.push({
        stepIndex: 1,
        nums: [...nums],
        target: 0,
        left: 0,
        right: n - 1,
        mid: n - 1,
        ansIndex: n - 1,
        mode,
        decision: `arr[${n - 1}]=${nums[n - 1]} 小于左侧元素，末项即为局部最小值！`,
        message: '末项命中局部最小值',
        log: '命中边界局部极小值',
        codeLine: 20,
        statusBadge: { text: '命中目标', type: 'success' }
      });
      return steps;
    }

    let l = 1;
    let r = n - 2;
    let stepCount = steps.length;

    while (l <= r) {
      const mid = l + ((r - l) >> 1);
      const isGreaterLeft = nums[mid] > nums[mid - 1];
      const isGreaterRight = nums[mid] > nums[mid + 1];

      if (isGreaterLeft) {
        steps.push({
          stepIndex: stepCount++,
          nums: [...nums],
          target: 0,
          left: l,
          right: r,
          mid,
          ansIndex: -1,
          mode,
          decision: `mid=${mid}(值=${nums[mid]}) > 左邻(${nums[mid - 1]})，左侧必定存在谷底，收缩右界到 ${mid - 1}`,
          message: `arr[${mid}] > arr[${mid - 1}] 向左收拢`,
          log: `[${l}, ${r}] -> 转向左半区`,
          codeLine: 24,
          statusBadge: { text: '向左收缩', type: 'warning' }
        });
        r = mid - 1;
      } else if (isGreaterRight) {
        steps.push({
          stepIndex: stepCount++,
          nums: [...nums],
          target: 0,
          left: l,
          right: r,
          mid,
          ansIndex: -1,
          mode,
          decision: `mid=${mid}(值=${nums[mid]}) > 右邻(${nums[mid + 1]})，右侧必定存在谷底，提升左界到 ${mid + 1}`,
          message: `arr[${mid}] > arr[${mid + 1}] 向右收拢`,
          log: `[${l}, ${r}] -> 转向右半区`,
          codeLine: 26,
          statusBadge: { text: '向右收缩', type: 'warning' }
        });
        l = mid + 1;
      } else {
        steps.push({
          stepIndex: stepCount++,
          nums: [...nums],
          target: 0,
          left: l,
          right: r,
          mid,
          ansIndex: mid,
          mode,
          decision: `mid=${mid}(值=${nums[mid]}) 同时小于左邻与右邻，成功捕获局部最小值！`,
          message: `局部最小值位于下标 ${mid}`,
          log: `成功找到局部最小值下标 ${mid}`,
          codeLine: 28,
          statusBadge: { text: '成功找到', type: 'success' }
        });
        return steps;
      }
    }
  } else {
    // 最左 >= target 模式
    let l = 0;
    let r = n - 1;
    let ans = -1;
    let stepCount = 0;

    steps.push({
      stepIndex: stepCount++,
      nums: [...nums],
      target,
      left: l,
      right: r,
      mid: -1,
      ansIndex: -1,
      mode,
      decision: `初始化二分查找，在已排序数组中搜索 >= ${target} 的最左位置`,
      message: `区间 [${l}, ${r}]`,
      log: '初始化二分搜索',
      codeLine: 4,
      statusBadge: { text: '搜索就绪', type: 'info' }
    });

    while (l <= r) {
      const mid = l + ((r - l) >> 1);
      const val = nums[mid];

      if (val >= target) {
        ans = mid;
        steps.push({
          stepIndex: stepCount++,
          nums: [...nums],
          target,
          left: l,
          right: r,
          mid,
          ansIndex: ans,
          mode,
          decision: `arr[${mid}]=${val} >= ${target}，记录候选下标 ${mid}，继续向左尝试 [${l}, ${mid - 1}]`,
          message: `更新候选 ans = ${ans}`,
          log: `命中达标点 mid=${mid}，向左压缩`,
          codeLine: 8,
          statusBadge: { text: '记录候选', type: 'warning' }
        });
        r = mid - 1;
      } else {
        steps.push({
          stepIndex: stepCount++,
          nums: [...nums],
          target,
          left: l,
          right: r,
          mid,
          ansIndex: ans,
          mode,
          decision: `arr[${mid}]=${val} < ${target}，目标在右半区，左界提升至 ${mid + 1}`,
          message: `左界前移至 ${mid + 1}`,
          log: `排除左半区 [${l}, ${mid}]`,
          codeLine: 10,
          statusBadge: { text: '向右收缩', type: 'info' }
        });
        l = mid + 1;
      }
    }

    steps.push({
      stepIndex: stepCount++,
      nums: [...nums],
      target,
      left: l,
      right: r,
      mid: -1,
      ansIndex: ans,
      mode,
      decision: ans !== -1
        ? `二分收敛结束，>= ${target} 的最左元素为 arr[${ans}]=${nums[ans]}`
        : `二分收敛结束，未找到任何 >= ${target} 的元素`,
      message: `最终结果：ans = ${ans}`,
      log: `二分查找完成，返回 ${ans}`,
      codeLine: 13,
      statusBadge: ans !== -1 ? { text: '搜索成功', type: 'success' } : { text: '未找到', type: 'danger' }
    });
  }

  return steps;
}

export function renderBinarySearchCanvas(container: HTMLElement, step: BinarySearchStep) {
  const { nums, target, left, right, mid, ansIndex, mode } = step;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
      <!-- 顶部控制状态看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">查找模式</div>
          <div style="font-size: 14px; font-weight: bold; color: #38bdf8;">
            ${mode === 'local-minimum' ? '局部最小值 (峰谷二分)' : '最左 >= target'}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">目标 Target</div>
          <div style="font-size: 14px; font-weight: bold; color: #f59e0b;">
            ${mode === 'local-minimum' ? 'N/A (峰谷相对值)' : target}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前区间 [L, R]</div>
          <div style="font-size: 14px; font-weight: bold; color: #a78bfa;">
            [${left}, ${right}]
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前中点 Mid</div>
          <div style="font-size: 14px; font-weight: bold; color: #10b981;">
            ${mid >= 0 ? `${mid} (值:${nums[mid]})` : '无'}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">最佳候选 Ans</div>
          <div style="font-size: 14px; font-weight: bold; color: #ec4899;">
            ${ansIndex >= 0 ? `${ansIndex} (值:${nums[ansIndex]})` : '未命中'}
          </div>
        </div>
      </div>

      <!-- 数组可视化条带 -->
      <div style="background: rgba(15, 23, 42, 0.5); padding: 20px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); overflow-x: auto;">
        <div style="display: flex; gap: 8px; justify-content: center; align-items: flex-end; min-width: 450px;">
          ${nums.map((val, idx) => {
            const isL = idx === left;
            const isR = idx === right;
            const isM = idx === mid;
            const isAns = idx === ansIndex;
            const inRange = idx >= left && idx <= right;

            let bgColor = 'rgba(51, 65, 85, 0.4)';
            let borderColor = 'rgba(255, 255, 255, 0.1)';

            if (isAns) {
              bgColor = 'rgba(236, 72, 153, 0.35)';
              borderColor = '#ec4899';
            } else if (isM) {
              bgColor = 'rgba(16, 185, 129, 0.35)';
              borderColor = '#10b981';
            } else if (inRange) {
              bgColor = 'rgba(56, 189, 248, 0.15)';
              borderColor = 'rgba(56, 189, 248, 0.5)';
            }

            return `
              <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                <div style="font-size: 10px; height: 14px; color: ${isAns ? '#ec4899' : isM ? '#10b981' : isL ? '#38bdf8' : isR ? '#a78bfa' : '#64748b'}; font-weight: bold;">
                  ${isM ? 'MID' : isL && isR ? 'L=R' : isL ? 'L' : isR ? 'R' : ''}
                </div>
                <div style="
                  width: 44px;
                  height: 48px;
                  background: ${bgColor};
                  border: 2px solid ${borderColor};
                  border-radius: 6px;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  font-size: 16px;
                  font-weight: bold;
                  color: #f8fafc;
                  box-shadow: ${isM ? '0 0 12px rgba(16, 185, 129, 0.4)' : isAns ? '0 0 12px rgba(236, 72, 153, 0.4)' : 'none'};
                  transition: all 0.2s ease;
                ">
                  ${val}
                </div>
                <div style="font-size: 10px; color: #64748b;">
                  [${idx}]
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 对数器与二分原理核心卡片 -->
      ${renderFormulaCard(
        '二分精髓与对数器 (Logarithmic Verifier) 原理',
        mode === 'local-minimum'
          ? 'arr[mid] > arr[mid-1] => 左侧必有拐点；arr[mid] > arr[mid+1] => 右侧必有拐点 (无序数组二分极值)'
          : '中点计算防溢出：mid = L + ((R - L) >> 1)；若 arr[mid] >= target，记下 ans 并向左 R = mid - 1 继续收缩',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const binarySearch004Visualizer = registerDeclarativeAlgorithm<BinarySearchStep>({
  id: 'binary-search-logarithmic-004',
  name: 'Class 004: 二分搜索与对数器 (Binary Search)',
  category: 'binary-search',
  icon: '🎯',
  difficulty: 1,
  levelOrder: 4,
  learningGoal: '掌握有序数组二分边界查找、无序数组局部最小值二分，以及对数器大样本随机对比验证思想',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>课程核心内容 (Class 004)</h3>
      <p>二分法不仅仅局限于有序数组的 <code>target</code> 查找，只要能构建<strong>二分排他性逻辑</strong>（一半必有解/无解），即可使用二分：</p>
      <ul>
        <li><strong>有序数组找 >= target 最左位置</strong>：贪心记录当前下标，不断向左压缩右界。</li>
        <li><strong>无序数组找局部极小值</strong>：通过相邻斜率变化（导数拐点思维），在无序数组中达成 $O(\\log N)$ 复杂度。</li>
        <li><strong>对数器验证理念</strong>：编写暴力但绝对正确的参照方法，生成海量随机数据自动比对测试。</li>
      </ul>
    </div>
  `,
  codeLanguages: BINARY_SEARCH_004_CODES,
  inputs: [
    {
      id: 'target',
      label: '目标值 (Target)',
      type: 'number',
      defaultValue: 4,
    },
  ],
  generateSteps: (input) => {
    const nums = [1, 2, 2, 4, 4, 4, 7, 8, 9];
    const target = Number(input.target) || 4;
    return generateBinarySearchSteps(nums, target, 'find-leftmost');
  },
  renderCanvas: (container, step) => {
    renderBinarySearchCanvas(container, step);
  },
});
