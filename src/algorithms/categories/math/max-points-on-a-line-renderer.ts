/**
 * 直线上最多的点数 (Max Points on a Line)
 * LeetCode 149 (Hard / 大厂高频数学与几何哈希)
 * 核心原语:
 *  计算二维平面中穿过同一直线的最大点数。
 *  外层枚举基准点 i，内层枚举后续点 j。
 *  用绝对精度分数（化简后的 dy/dx，经由 GCD 求最简分式）表示斜率，规避浮点数精度截断误差。
 *  用哈希表统计以点 i 为基准的每种斜率上的点数，求局部最大并更新全局最大。
 *  时间复杂度 O(N^2)，空间复杂度 O(N)。
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';

export interface Point {
  x: number;
  y: number;
}

export interface MaxPointsStep extends StepBase {
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
  codeLine: number;
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
};

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
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
      codeLine: 4,
    });
    return steps;
  }

  let globalMax = 2;

  // Step 0: Init
  steps.push({
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
    codeLine: 6,
  });

  for (let i = 0; i < n; i++) {
    const slopeMap: Record<string, number> = {};
    let curMax = 0;

    steps.push({
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
      codeLine: 7,
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
        codeLine: 18,
      });
    }

    if (curMax + 1 > globalMax) {
      globalMax = curMax + 1;
      steps.push({
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
        codeLine: 21,
      });
    }
  }

  // Finish
  steps.push({
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
    codeLine: 23,
  });

  return steps;
}

function renderMaxPointsCanvas(step: MaxPointsStep): string {
  const { points, baseIdx, compareIdx, slope, slopeCount, globalMax, phase } = step;

  // 坐标系范围
  const xs = points.map((p) => p.x);
  const ys = points.map((p) => p.y);
  const minX = Math.min(...xs, 0);
  const maxX = Math.max(...xs, 5);
  const minY = Math.min(...ys, 0);
  const maxY = Math.max(...ys, 5);

  const padding = 30;
  const svgWidth = 340;
  const svgHeight = 200;

  const scaleX = (x: number) => padding + ((x - minX) / Math.max(maxX - minX, 1)) * (svgWidth - 2 * padding);
  const scaleY = (y: number) => svgHeight - padding - ((y - minY) / Math.max(maxY - minY, 1)) * (svgHeight - 2 * padding);

  const basePt = points[baseIdx];
  const compPt = points[compareIdx];

  // 画点
  const pointSvgs = points
    .map((p, idx) => {
      const isBase = idx === baseIdx && phase !== 'finish';
      const isComp = idx === compareIdx && phase !== 'finish' && baseIdx !== compareIdx;

      let fill = '#64748b';
      let r = 5;
      let stroke = 'rgba(255,255,255,0.4)';

      if (isBase) {
        fill = '#ec4899';
        r = 8;
        stroke = '#f43f5e';
      } else if (isComp) {
        fill = '#38bdf8';
        r = 7;
        stroke = '#0ea5e9';
      }

      const cx = scaleX(p.x);
      const cy = scaleY(p.y);

      return `
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="2" />
        <text x="${cx + 8}" y="${cy - 6}" fill="#94a3b8" font-size="11" font-weight="600">P${idx}(${p.x},${p.y})</text>
      `;
    })
    .join('');

  // 如果处于比较阶段，画出连接线
  let connectionLine = '';
  if (basePt && compPt && baseIdx !== compareIdx && phase !== 'finish') {
    const bx = scaleX(basePt.x);
    const by = scaleY(basePt.y);
    const cx = scaleX(compPt.x);
    const cy = scaleY(compPt.y);
    connectionLine = `<line x1="${bx}" y1="${by}" x2="${cx}" y2="${cy}" stroke="#fbbf24" stroke-width="2" stroke-dasharray="4" />`;
  }

  // 渲染哈希表斜率统计
  const slopeRows = Object.entries(slopeCount)
    .map(([sl, cnt]) => {
      return `
      <div style="display: flex; justify-content: space-between; padding: 4px 8px; background: rgba(255,255,255,0.04); border-radius: 4px; font-size: 11px;">
        <span style="color: #38bdf8; font-weight: 600;">斜率 [${sl}]</span>
        <span style="color: #fbbf24;">+${cnt} 点 (共线 ${cnt + 1} 点)</span>
      </div>`;
    })
    .join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 14px; padding: 12px; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, monospace;">
      <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px;">
        <!-- 左侧 SVG 几何坐标系 -->
        <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 10px;">
          <div style="display: flex; justify-content: space-between; font-size: 12px; color: #94a3b8; margin-bottom: 6px;">
            <span>几何散点平面</span>
            <span style="color: #ec4899;">● 基准点 P${baseIdx}</span>
            <span style="color: #38bdf8;">● 探测点 P${compareIdx}</span>
          </div>
          <svg width="100%" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}" style="background: rgba(0,0,0,0.25); border-radius: 6px;">
            <!-- 网格线 -->
            <line x1="${padding}" y1="${svgHeight - padding}" x2="${svgWidth - padding}" y2="${svgHeight - padding}" stroke="#334155" stroke-width="1" />
            <line x1="${padding}" y1="${padding}" x2="${padding}" y2="${svgHeight - padding}" stroke="#334155" stroke-width="1" />
            ${connectionLine}
            ${pointSvgs}
          </svg>
        </div>

        <!-- 右侧 斜率哈希聚合桶 -->
        <div style="background: rgba(15, 23, 42, 0.65); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 10px; display: flex; flex-direction: column;">
          <div style="font-size: 12px; color: #94a3b8; font-weight: 600; margin-bottom: 8px;">
            基准点 P${baseIdx} 的斜率哈希桶 (dy/dx)
          </div>
          <div style="display: flex; flex-direction: column; gap: 6px; flex: 1; overflow-y: auto; max-height: 170px;">
            ${slopeRows || '<div style="color: #64748b; font-size: 11px; padding: 8px;">暂无探测斜率</div>'}
          </div>
        </div>
      </div>

      <!-- 底部指标看板 -->
      <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">当前基准点</div>
          <div style="font-size: 15px; font-weight: 700; color: #ec4899;">P${baseIdx} (${basePt?.x ?? 0}, ${basePt?.y ?? 0})</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">探测目标点</div>
          <div style="font-size: 15px; font-weight: 700; color: #38bdf8;">P${compareIdx} (${compPt?.x ?? 0}, ${compPt?.y ?? 0})</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">最简分数斜率</div>
          <div style="font-size: 15px; font-weight: 700; color: #fbbf24;">${slope}</div>
        </div>
        <div style="background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px; padding: 8px; text-align: center;">
          <div style="font-size: 11px; color: #64748b;">全局最多共线点数</div>
          <div style="font-size: 18px; font-weight: 700; color: #34d399;">${globalMax}</div>
        </div>
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'max-points-on-a-line',
  name: '直线上最多的点数',
  category: 'math',
  difficulty: 3,
  learningGoal: 'LeetCode 149: 平面直角坐标系中最多有多少个点在同一条直线上。采用 GCD 斜率约分化简，以避免浮点数精度误差。',
  codeLanguages: MAX_POINTS_CODES,
  generateSteps: (inputs) => {
    const raw = inputs?.points as string | undefined;
    let pts: Point[] = [
      { x: 1, y: 1 },
      { x: 2, y: 2 },
      { x: 3, y: 3 },
      { x: 1, y: 4 },
      { x: 3, y: 2 },
      { x: 5, y: 3 },
    ];
    if (typeof raw === 'string') {
      try {
        const pairs = raw.split(';').map((p) => p.trim());
        const parsed = pairs.map((pair) => {
          const [x, y] = pair.split(/[,，\s]+/).map(Number);
          return { x, y };
        });
        if (parsed.length >= 2 && parsed.every((p) => !isNaN(p.x) && !isNaN(p.y))) {
          pts = parsed;
        }
      } catch {
        // fallback
      }
    }
    return buildMaxPointsSteps(pts);
  },
  renderCanvas: (container: HTMLElement, step: MaxPointsStep) => {
    container.innerHTML = renderMaxPointsCanvas(step);
  },
  inputs: [
    {
      id: 'points',
      label: '点集坐标序列',
      type: 'text',
      defaultValue: '1,1; 2,2; 3,3; 1,4; 3,2; 5,3',
      placeholder: '格式如: x1,y1; x2,y2; ...',
    },
  ],
});
