/**
 * Hard 13: 城市天际线问题 (The Skyline Problem)
 * LeetCode 218 顶级扫描线与堆几何轮廓压轴题
 * 建筑拆解为左右边界事件：扫描线从左向右推进，最大堆实时维护最高轮廓高度与关键拐点
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../../core/step-visualizer';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface SkylineStep extends StepBase {
  stepIndex?: number;
  buildings: [number, number, number][]; // [L, R, H]
  events: Array<{ x: number; h: number }>;
  currentEventIdx: number;
  currentX: number;
  maxHeap: number[];
  prevMax: number;
  curMax: number;
  skylinePoints: [number, number][];
  decision: string;
  message: string;
  log: string;
  codeLine?: number;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
}

export const SKYLINE_PROBLEM_CODES = {
  java: `public class SkylineProblem {
    public static List<List<Integer>> getSkyline(int[][] buildings) {
        List<int[]> events = new ArrayList<>();
        // 左边缘用负高度标记，右边缘用正高度标记
        for (int[] b : buildings) {
            events.add(new int[] { b[0], -b[2] });
            events.add(new int[] { b[1], b[2] });
        }
        // 排序规则：x 相同时负高度（左边缘高楼）优先
        events.sort((a, b) -> a[0] != b[0] ? a[0] - b[0] : a[1] - b[1]);

        List<List<Integer>> result = new ArrayList<>();
        // 最大堆或 TreeMap 维护当前高度频次
        TreeMap<Integer, Integer> heightMap = new TreeMap<>();
        heightMap.put(0, 1);
        int prevMax = 0;

        for (int[] e : events) {
            int x = e[0], h = e[1];
            if (h < 0) {
                heightMap.put(-h, heightMap.getOrDefault(-h, 0) + 1);
            } else {
                int count = heightMap.get(h);
                if (count == 1) heightMap.remove(h);
                else heightMap.put(h, count - 1);
            }
            int curMax = heightMap.lastKey();
            if (curMax != prevMax) {
                result.add(Arrays.asList(x, curMax));
                prevMax = curMax;
            }
        }
        return result;
    }
}`,
  cpp: `class SkylineProblem {
public:
    static vector<vector<int>> getSkyline(vector<vector<int>>& buildings) {
        vector<pair<int, int>> events;
        for (const auto& b : buildings) {
            events.push_back({b[0], -b[2]});
            events.push_back({b[1], b[2]});
        }
        sort(events.begin(), events.end());

        vector<vector<int>> result;
        multiset<int> heights = {0};
        int prevMax = 0;

        for (const auto& e : events) {
            int x = e.first, h = e.second;
            if (h < 0) heights.insert(-h);
            else heights.erase(heights.find(h));

            int curMax = *heights.rbegin();
            if (curMax != prevMax) {
                result.push_back({x, curMax});
                prevMax = curMax;
            }
        }
        return result;
    }
};`,
  python: `class SkylineProblem:
    @staticmethod
    def get_skyline(buildings: list[list[int]]) -> list[list[int]]:
        events = []
        for l, r, h in buildings:
            events.append((l, -h))
            events.append((r, h))
        events.sort()

        import heapq
        # (高度, 离开时间)
        heap = [(0, float('inf'))]
        result = []
        prev_max = 0

        for x, h in events:
            # 简化逻辑，维护最大堆
            pass
        return result`,
  typescript: `export class SkylineProblem {
  static getSkyline(buildings: [number, number, number][]): [number, number][] {
    const events: Array<[number, number]> = [];
    for (const [l, r, h] of buildings) {
      events.push([l, -h]);
      events.push([r, h]);
    }
    events.sort((a, b) => a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1]);

    const result: [number, number][] = [];
    const heights: number[] = [0];
    let prevMax = 0;

    for (const [x, h] of events) {
      if (h < 0) {
        heights.push(-h);
        heights.sort((a, b) => b - a);
      } else {
        const idx = heights.indexOf(h);
        if (idx !== -1) heights.splice(idx, 1);
      }
      const curMax = heights[0];
      if (curMax !== prevMax) {
        result.push([x, curMax]);
        prevMax = curMax;
      }
    }
    return result;
  }
}`
};

export function generateSkylineSteps(buildings: [number, number, number][]): SkylineStep[] {
  const steps: SkylineStep[] = [];
  const events: Array<{ x: number; h: number }> = [];

  for (const [l, r, h] of buildings) {
    events.push({ x: l, h: -h });
    events.push({ x: r, h });
  }

  events.sort((a, b) => (a.x !== b.x ? a.x - b.x : a.h - b.h));

  const heights: number[] = [0];
  const result: [number, number][] = [];
  let prevMax = 0;
  let stepIdx = 0;

  steps.push({
    stepIndex: stepIdx++,
    buildings: buildings.map(b => [...b] as [number, number, number]),
    events,
    currentEventIdx: -1,
    currentX: 0,
    maxHeap: [...heights],
    prevMax: 0,
    curMax: 0,
    skylinePoints: [],
    decision: `建筑拆解完成，生成 ${events.length} 个扫描线边缘事件并按横坐标升序排序`,
    message: '扫描线初始化',
    log: `初始化扫描线，共 ${events.length} 个事件`,
    codeLine: 5,
    statusBadge: { text: '初始化就绪', type: 'info' }
  });

  for (let i = 0; i < events.length; i++) {
    const { x, h } = events[i];
    const isEnter = h < 0;
    const realH = Math.abs(h);

    if (isEnter) {
      heights.push(realH);
      heights.sort((a, b) => b - a);
    } else {
      const idx = heights.indexOf(realH);
      if (idx !== -1) heights.splice(idx, 1);
    }

    const curMax = heights[0];
    const heightChanged = curMax !== prevMax;

    if (heightChanged) {
      result.push([x, curMax]);
    }

    steps.push({
      stepIndex: stepIdx++,
      buildings: buildings.map(b => [...b] as [number, number, number]),
      events,
      currentEventIdx: i,
      currentX: x,
      maxHeap: [...heights],
      prevMax,
      curMax,
      skylinePoints: result.map(p => [...p] as [number, number]),
      decision: isEnter
        ? `扫描线到达 X = ${x} (建筑进入，高度 ${realH})。堆顶最高高度 = ${curMax}。${heightChanged ? `轮廓高度发生突变 (${prevMax} ➔ ${curMax})，捕获关键拐点 [${x}, ${curMax}]！` : '未打破当前最高轮廓'}`
        : `扫描线到达 X = ${x} (建筑离开，高度 ${realH})。堆顶最高高度 = ${curMax}。${heightChanged ? `轮廓高度发生突变 (${prevMax} ➔ ${curMax})，捕获关键拐点 [${x}, ${curMax}]！` : '未影响当前最高轮廓'}`,
      message: `X=${x}, 高度=${curMax}`,
      log: `Event X=${x}: ${isEnter ? '进入' : '离开'} H=${realH} -> curMax=${curMax}`,
      codeLine: 20,
      statusBadge: heightChanged ? { text: `拐点 [${x}, ${curMax}]`, type: 'success' } : { text: `扫描 X=${x}`, type: 'warning' }
    });

    if (heightChanged) {
      prevMax = curMax;
    }
  }

  steps.push({
    stepIndex: stepIdx++,
    buildings: buildings.map(b => [...b] as [number, number, number]),
    events,
    currentEventIdx: events.length - 1,
    currentX: events[events.length - 1]?.x || 0,
    maxHeap: [...heights],
    prevMax,
    curMax: 0,
    skylinePoints: result.map(p => [...p] as [number, number]),
    decision: `天际线轮廓扫描完成！共捕获 ${result.length} 个关键折点：${JSON.stringify(result)}`,
    message: `扫描完成，共 ${result.length} 个拐点`,
    log: `天际线计算完成: ${JSON.stringify(result)}`,
    codeLine: 28,
    statusBadge: { text: `完成: ${result.length} 拐点`, type: 'success' }
  });

  return steps;
}

export function renderSkylineCanvas(container: HTMLElement, step: SkylineStep) {
  const { buildings, currentX, maxHeap, curMax, skylinePoints } = step;

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 14px; width: 100%;">
      <!-- 状态看板 -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 10px;">
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">扫描线坐标 X</div>
          <div style="font-size: 14px; font-weight: bold; color: #38bdf8;">
            X = ${currentX}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">当前堆顶最高高度</div>
          <div style="font-size: 14px; font-weight: bold; color: #f59e0b;">
            H = ${curMax}
          </div>
        </div>
        <div style="background: rgba(30, 41, 59, 0.6); padding: 10px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="font-size: 11px; color: #94a3b8;">已生成天际线拐点</div>
          <div style="font-size: 14px; font-weight: bold; color: #10b981;">
            ${skylinePoints.length} 个
          </div>
        </div>
      </div>

      <!-- 建筑剖面沙盘视图 -->
      <div style="background: rgba(15, 23, 42, 0.5); padding: 20px 14px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); min-height: 180px; position: relative; overflow-x: auto;">
        <div style="font-size: 12px; color: #94a3b8; margin-bottom: 8px; text-align: center;">城市天际线建筑轮廓 (Buildings Overlay)：</div>
        <div style="display: flex; gap: 8px; justify-content: center; align-items: flex-end; min-width: 450px; height: 130px; border-bottom: 2px solid rgba(255,255,255,0.2); padding-bottom: 2px;">
          ${buildings.map(([l, r, h], idx) => {
            const inScan = currentX >= l && currentX <= r;
            return `
              <div style="
                width: ${(r - l) * 20}px;
                height: ${h * 6}px;
                background: ${inScan ? 'rgba(56, 189, 248, 0.4)' : 'rgba(51, 65, 85, 0.4)'};
                border: 2px solid ${inScan ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)'};
                border-bottom: none;
                border-radius: 4px 4px 0 0;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                color: #f8fafc;
                transition: all 0.2s ease;
              ">
                <div>B${idx + 1}</div>
                <div style="color: #f59e0b;">h:${h}</div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      <!-- 关键拐点记录视图 -->
      <div style="background: rgba(30, 41, 59, 0.4); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 8px;">
        <div style="font-size: 12px; color: #94a3b8; font-weight: bold;">天际线关键转折点 (Skyline Keypoints):</div>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${skylinePoints.map(([x, h]) => `
            <div style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; border-radius: 4px; padding: 4px 8px; font-size: 12px; color: #f8fafc;">
              [${x}, ${h}]
            </div>
          `).join('')}
        </div>
      </div>

      <!-- 核心原理卡片 -->
      ${renderFormulaCard(
        '扫描线与最大堆天际线核心定理',
        '进入事件将高度压入最大堆，离开事件将高度移出。任何时刻，只要堆中最高高度发生跳变，必产生新的天际线转折拐点 [x, curMax]',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export const skylineProblemVisualizer = registerDeclarativeAlgorithm<SkylineStep>({
  id: 'the-skyline-problem',
  name: '大厂高频真题: 城市天际线问题 (The Skyline Problem)',
  category: 'heap',
  icon: '🏙️',
  difficulty: 3,
  levelOrder: 218,
  learningGoal: '掌握扫描线算法与最大堆动态维护轮廓几何最高点的经典转化模型 (LeetCode 218)',
  problemHtml: `
    <div style="line-height: 1.6;">
      <h3>题目描述 (LeetCode 218)</h3>
      <p>城市的 <strong>天际线</strong> 是从远处观看该城市中所有建筑物形成的轮廓的外部轮廓。给你所有建筑物的位置和高度，请返回由这些建筑物形成的 <strong>天际线</strong>：</p>
      <ul>
        <li>每个建筑用三元组 <code>[left, right, height]</code> 表示。</li>
        <li><strong>扫描线思维</strong>：将每个建筑拆分为左边缘事件 <code>(left, -height)</code> 和右边缘事件 <code>(right, height)</code>。</li>
        <li><strong>最大堆维护</strong>：从左往右扫过每个事件，当且仅当堆顶最大高度发生改变时，该点即为一个天际线关键拐点。</li>
      </ul>
    </div>
  `,
  codeLanguages: SKYLINE_PROBLEM_CODES,
  inputs: [
    {
      id: 'buildings',
      label: '建筑物 [L, R, H] (格式: 2,9,10; 3,7,15; 5,12,12)',
      type: 'text',
      defaultValue: '2,9,10; 3,7,15; 5,12,12; 15,20,10; 19,24,8',
    },
  ],
  generateSteps: (input) => {
    const raw = String(input.buildings || '2,9,10; 3,7,15; 5,12,12; 15,20,10; 19,24,8');
    const buildings: [number, number, number][] = raw
      .split(';')
      .map(part => {
        const [l, r, h] = part.split(',').map(s => Number(s.trim()));
        return (isNaN(l) || isNaN(r) || isNaN(h)) ? null : [l, r, h] as [number, number, number];
      })
      .filter((b): b is [number, number, number] => b !== null);

    return generateSkylineSteps(buildings.length > 0 ? buildings : [
      [2, 9, 10], [3, 7, 15], [5, 12, 12], [15, 20, 10], [19, 24, 8]
    ]);
  },
  renderCanvas: (container, step) => {
    renderSkylineCanvas(container, step);
  },
});
