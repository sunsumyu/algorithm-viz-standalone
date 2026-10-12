import { StepBase, HighlightTarget } from '../../step-visualizer';

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
  codeLine?: number | HighlightTarget;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
  ans?: string;
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

export const SKYLINE_CODE_LINES = {
  init: { java: 5, cpp: 5, python: 5, typescript: 5 },
  sweep: { java: 20, cpp: 17, python: 16, typescript: 17 },
  finish: { java: 33, cpp: 26, python: 19, typescript: 28 },
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
    codeLine: SKYLINE_CODE_LINES.init,
    statusBadge: { text: '初始化就绪', type: 'info' },
    metrics: {
      currentX: 'X = 0',
      curMax: 'H = 0',
      pointCount: '0 个',
      heapTop: '0',
    },
    ans: '[]',
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
      codeLine: SKYLINE_CODE_LINES.sweep,
      statusBadge: heightChanged ? { text: `拐点 [${x}, ${curMax}]`, type: 'success' } : { text: `扫描 X=${x}`, type: 'warning' },
      metrics: {
        currentX: `X = ${x}`,
        curMax: `H = ${curMax}`,
        pointCount: `${result.length} 个`,
        heapTop: `${heights[0] || 0}`,
      },
      ans: `[${result.map(p => `[${p[0]},${p[1]}]`).join(', ')}]`,
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
    codeLine: SKYLINE_CODE_LINES.finish,
    statusBadge: { text: `完成: ${result.length} 拐点`, type: 'success' },
    metrics: {
      currentX: `完成`,
      curMax: `H = 0`,
      pointCount: `${result.length} 个`,
      heapTop: `0`,
    },
    ans: `[${result.map(p => `[${p[0]},${p[1]}]`).join(', ')}]`,
  });

  return steps;
}
