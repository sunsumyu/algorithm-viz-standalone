import { StepBase, HighlightTarget } from '../../../core/step-visualizer';

export interface Point {
  x: number;
  y: number;
}

export interface MaxPointsStep extends StepBase {
  line?: number;
  points: Point[];
  baseIdx: number;
  compareIdx: number;
  slope: string;
  slopeCount: Record<string, number>;
  localMax: number;
  globalMax: number;
  phase: 'init' | 'select-base' | 'calc-slope' | 'update-max' | 'finish';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
}

export const MAX_POINTS_CODES = {
  java: `public class Solution {
    public int maxPoints(int[][] points) {
        int n = points.length;
        if (n <= 2) return n;
        int maxAns = 2;
        for (int i = 0; i < n; i++) {
            Map<String, Integer> map = new HashMap<>();
            int curMax = 0;
            for (int j = i + 1; j < n; j++) {
                int dx = points[j][0] - points[i][0];
                int dy = points[j][1] - points[i][1];
                int g = gcd(Math.abs(dx), Math.abs(dy));
                dx /= g; dy /= g;
                // 统一斜率正负规范
                if (dx < 0 || (dx == 0 && dy < 0)) {
                    dx = -dx; dy = -dy;
                }
                String slope = dy + "/" + dx;
                map.put(slope, map.getOrDefault(slope, 0) + 1);
                curMax = Math.max(curMax, map.get(slope));
            }
            maxAns = Math.max(maxAns, curMax + 1); // 加上基准点自身
        }
        return maxAns;
    }
    private int gcd(int a, int b) { return b == 0 ? a : gcd(b, a % b); }
}`,
  cpp: `class Solution {
public:
    int maxPoints(vector<vector<int>>& points) {
        int n = points.size();
        if (n <= 2) return n;
        int maxAns = 2;
        for (int i = 0; i < n; ++i) {
            unordered_map<string, int> slopeMap;
            int curMax = 0;
            for (int j = i + 1; j < n; ++j) {
                int dx = points[j][0] - points[i][0];
                int dy = points[j][1] - points[i][1];
                int g = std::gcd(dx, dy);
                dx /= g; dy /= g;
                string slope = to_string(dy) + "/" + to_string(dx);
                slopeMap[slope]++;
                curMax = max(curMax, slopeMap[slope]);
            }
            maxAns = max(maxAns, curMax + 1);
        }
        return maxAns;
    }
};`,
  python: `class Solution:
    def maxPoints(self, points: list[list[int]]) -> int:
        n = len(points)
        if n <= 2: return n
        max_ans = 2
        for i in range(n):
            slope_map = collections.defaultdict(int)
            cur_max = 0
            for j in range(i + 1, n):
                dx = points[j][0] - points[i][0]
                dy = points[j][1] - points[i][1]
                g = math.gcd(dx, dy)
                slope = f"{dy // g}/{dx // g}"
                slope_map[slope] += 1
                cur_max = max(cur_max, slope_map[slope])
            max_ans = max(max_ans, cur_max + 1)
        return max_ans`,
  javascript: `function maxPoints(points) {
    const n = points.length;
    if (n <= 2) return n;
    let maxAns = 2;
    for (let i = 0; i < n; i++) {
        const map = new Map();
        let curMax = 0;
        for (let j = i + 1; j < n; j++) {
            let dx = points[j][0] - points[i][0];
            let dy = points[j][1] - points[i][1];
            const g = gcd(Math.abs(dx), Math.abs(dy));
            dx = Math.trunc(dx / g); dy = Math.trunc(dy / g);
            if (dx < 0 || (dx === 0 && dy < 0)) {
                dx = -dx; dy = -dy;
            }
            const slope = dy + "/" + dx;
            map.set(slope, (map.get(slope) || 0) + 1);
            curMax = Math.max(curMax, map.get(slope));
        }
        maxAns = Math.max(maxAns, curMax + 1);
    }
    return maxAns;
}`,
};

export const MAX_POINTS_CODE_LINES = {
  shortInput: { java: 4, cpp: 4, python: 3, javascript: 3 },
  init: { java: 6, cpp: 5, python: 4, javascript: 4 },
  selectBase: { java: 8, cpp: 7, python: 6, javascript: 7 },
  calcSlope: { java: 17, cpp: 14, python: 13, javascript: 18 },
  updateMax: { java: 21, cpp: 16, python: 15, javascript: 21 },
  finish: { java: 23, cpp: 18, python: 16, javascript: 23 },
};

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

export function parseMaxPointsInputs(raw?: string): Point[] {
  const defaultPoints: Point[] = [
    { x: 1, y: 1 },
    { x: 2, y: 2 },
    { x: 3, y: 3 },
    { x: 1, y: 4 },
    { x: 3, y: 2 },
    { x: 5, y: 3 },
  ];
  if (typeof raw !== 'string' || !raw.trim()) return defaultPoints;
  try {
    const pairs = raw.split(';').map((p) => p.trim());
    const parsed = pairs.map((pair) => {
      const [x, y] = pair.split(/[,，\s]+/).map(Number);
      return { x, y };
    });
    if (parsed.length >= 2 && parsed.every((p) => !isNaN(p.x) && !isNaN(p.y))) {
      return parsed;
    }
  } catch {
    // fallback
  }
  return defaultPoints;
}

export function buildMaxPointsSteps(points: Point[] = [
  { x: 1, y: 1 },
  { x: 2, y: 2 },
  { x: 3, y: 3 },
  { x: 1, y: 4 },
  { x: 3, y: 2 },
  { x: 5, y: 3 },
]): MaxPointsStep[] {
  const steps: MaxPointsStep[] = [];
  const n = points.length;

  if (n <= 2) {
    steps.push({
      line: MAX_POINTS_CODE_LINES.shortInput.javascript,
      points,
      baseIdx: 0,
      compareIdx: n - 1,
      slope: '0/0',
      slopeCount: {},
      localMax: n,
      globalMax: n,
      phase: 'finish',
      message: `点数少于等于 2，所有点必然共线！共线点数 = ${n}。`,
      log: `点数 <= 2, 直接返回 ${n}`,
      codeLine: MAX_POINTS_CODE_LINES.shortInput,
    });
    return steps;
  }

  let globalMax = 2;

  // Step 0: Init
  steps.push({
    line: MAX_POINTS_CODE_LINES.init.javascript,
    points,
    baseIdx: 0,
    compareIdx: 1,
    slope: '0/0',
    slopeCount: {},
    localMax: 0,
    globalMax,
    phase: 'init',
    message: `算法启动：平面包含 ${n} 个点。采用 GCD 斜率哈希法，枚举基准点并统计共线点。`,
    log: `初始化平面 ${n} 个点，初始共线数 >= 2`,
    codeLine: MAX_POINTS_CODE_LINES.init,
  });

  for (let i = 0; i < n; i++) {
    const slopeMap: Record<string, number> = {};
    let curMax = 0;

    steps.push({
      line: MAX_POINTS_CODE_LINES.selectBase.javascript,
      points,
      baseIdx: i,
      compareIdx: i + 1 < n ? i + 1 : i,
      slope: '基准重置',
      slopeCount: { ...slopeMap },
      localMax: 0,
      globalMax,
      phase: 'select-base',
      message: `选择基准点 P${i} (${points[i].x}, ${points[i].y})，开启新一轮斜率哈希表。`,
      log: `设定基准点 P${i}(${points[i].x},${points[i].y})`,
      codeLine: MAX_POINTS_CODE_LINES.selectBase,
    });

    for (let j = i + 1; j < n; j++) {
      let dx = points[j].x - points[i].x;
      let dy = points[j].y - points[i].y;
      const g = gcd(Math.abs(dx), Math.abs(dy));
      dx = Math.floor(dx / g);
      dy = Math.floor(dy / g);

      if (dx < 0 || (dx === 0 && dy < 0)) {
        dx = -dx;
        dy = -dy;
      }

      const slopeStr = `${dy}/${dx}`;
      slopeMap[slopeStr] = (slopeMap[slopeStr] || 0) + 1;
      curMax = Math.max(curMax, slopeMap[slopeStr]);

      steps.push({
        line: MAX_POINTS_CODE_LINES.calcSlope.javascript,
        points,
        baseIdx: i,
        compareIdx: j,
        slope: slopeStr,
        slopeCount: { ...slopeMap },
        localMax: curMax,
        globalMax,
        phase: 'calc-slope',
        message: `计算 P${i}(${points[i].x},${points[i].y}) 与 P${j}(${points[j].x},${points[j].y})：化简斜率 dy/dx = ${slopeStr}。该斜率共线点数累计 = ${slopeMap[slopeStr] + 1}。`,
        log: `P${i}->P${j} 斜率=${slopeStr}, 该直线点数=${slopeMap[slopeStr] + 1}`,
        codeLine: MAX_POINTS_CODE_LINES.calcSlope,
      });
    }

    if (curMax + 1 > globalMax) {
      globalMax = curMax + 1;
      steps.push({
        line: MAX_POINTS_CODE_LINES.updateMax.javascript,
        points,
        baseIdx: i,
        compareIdx: n - 1,
        slope: '更新全局最优',
        slopeCount: { ...slopeMap },
        localMax: curMax,
        globalMax,
        phase: 'update-max',
        message: `基准点 P${i} 检索完毕：以 P${i} 为基准的最大共线点数达 ${curMax + 1}！刷新全局最大共线点数 = ${globalMax}。`,
        log: `刷新全局最优 maxPoints = ${globalMax}`,
        codeLine: MAX_POINTS_CODE_LINES.updateMax,
      });
    }
  }

  // Finish
  steps.push({
    line: MAX_POINTS_CODE_LINES.finish.javascript,
    points,
    baseIdx: 0,
    compareIdx: n - 1,
    slope: '完毕',
    slopeCount: {},
    localMax: globalMax - 1,
    globalMax,
    phase: 'finish',
    message: `全量点枚举完毕！平面上穿过同一直线的最多点数为 ${globalMax} 个。`,
    log: `算法收敛：最多共线点数 = ${globalMax}`,
    codeLine: MAX_POINTS_CODE_LINES.finish,
  });

  return steps;
}
