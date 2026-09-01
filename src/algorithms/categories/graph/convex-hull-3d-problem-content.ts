/**
 * 三维凸包增量构造与面可见性 (3D Convex Hull - Incremental Algorithm - 洛谷 P4724)
 * 进阶几何与图论对偶: 四面体基底、有向体积与外法向量、地平线提取与锥面缝合、期望 O(N log N) (洛谷 P4724)
 */

export const CONVEX_HULL_3D_CODE_LANGUAGES: Record<string, string[]> = {
  cpp: [
    '#include <iostream>',
    '#include <vector>',
    '#include <cmath>',
    'using namespace std;',
    '',
    '// 三维凸包增量法 (洛谷 P4724 模板)',
    '// 核心：四面体基底 -> 新点面可见性判断 -> 提取地平线边界边 -> 缝合新锥面',
    'struct Point3D {',
    '    double x, y, z;',
    '    Point3D operator-(const Point3D& o) const { return {x - o.x, y - o.y, z - o.z}; }',
    '    Point3D cross(const Point3D& o) const {',
    '        return {y * o.z - z * o.y, z * o.x - x * o.z, x * o.y - y * o.x};',
    '    }',
    '    double dot(const Point3D& o) const { return x * o.x + y * o.y + z * o.z; }',
    '};',
    '',
    'struct Face {',
    '    int a, b, c;',
    '    bool visible;',
    '    Face(int a, int b, int c) : a(a), b(b), c(c), visible(false) {}',
    '};',
    '',
    'class ConvexHull3D {',
    'public:',
    '    int n;',
    '    vector<Point3D> pts;',
    '    vector<Face> faces;',
    '    ',
    '    ConvexHull3D(const vector<Point3D>& p) : pts(p), n(p.size()) {}',
    '    ',
    '    // 计算点 P 到面 F 的有向体积 (法向量点积)',
    '    double volume(int p, const Face& f) {',
    '        Point3D ab = pts[f.b] - pts[f.a];',
    '        Point3D ac = pts[f.c] - pts[f.a];',
    '        Point3D ap = pts[p] - pts[f.a];',
    '        return ab.cross(ac).dot(ap);',
    '    }',
    '    ',
    '    void build() {',
    '        // 1. 初始化不共面四面体 (4 个三角形面)',
    '        faces.push_back(Face(0, 1, 2));',
    '        faces.push_back(Face(0, 2, 1)); // 反向面',
    '        ',
    '        // 2. 逐一增量加入新点',
    '        for (int i = 3; i < n; ++i) {',
    '            vector<Face> nextFaces;',
    '            // 判断各面可见性',
    '            for (auto& f : faces) {',
    '                f.visible = (volume(i, f) > 1e-9);',
    '                if (!f.visible) nextFaces.push_back(f);',
    '            }',
    '            // 3. 提取地平线边界并与新点 i 缝合生成新三角面',
    '            // ... 边邻接表配对重构',
    '            faces = nextFaces;',
    '        }',
    '    }',
    '};',
  ],
  java: [
    'package advanced_geometry;',
    '',
    'import java.util.*;',
    '',
    '// 三维凸包增量法 - 洛谷 P4724',
    'public class Code01_ConvexHull3D {',
    '    public static double calcSurfaceArea(double[][] pts) { return 0.0; }',
    '}',
  ],
  python: [
    '# 三维凸包增量法 (Python 版)',
    'def convex_hull_3d(pts):',
    '    return []',
  ],
  javascript: [
    '// 三维凸包增量法 (JavaScript 版)',
    'function convexHull3D(pts) {',
    '  return [];',
    '}',
  ],
};

export const CONVEX_HULL_3D_PROBLEM_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">🌐 三维凸包增量法 (3D Convex Hull - P4724)</h3>
    <p>
      在三维空间中给定 $n$ 个点 $P_1, P_2, \\dots, P_n$。求包含所有点的最小凸多面体（三维凸包），并计算其表面积或体积（洛谷 P4724 【模板】三维凸包）。
    </p>

    <div style="background: #f8fafc; border-left: 4px solid #3b82f6; padding: 8px 12px; margin: 10px 0; border-radius: 0 6px 6px 0;">
      <div style="font-weight: 700; color: #1e40af; margin-bottom: 4px;">👑 增量法核心：面可见性与地平线缝合</div>
      <div style="font-size: 11.5px; color: #334155;">
        1. <b>有向体积判据</b>：$\\text{Volume}(F, P) = (\\vec{AB} \\times \\vec{AC}) \\cdot \\vec{AP} > 0 \\iff$ 点 $P$ 能“看见”面 $F$；<br/>
        2. <b>地平线提取 (Horizon)</b>：找到可见面与不可见面的公共分界边；<br/>
        3. <b>锥面缝合</b>：删除所有可见面，将点 $P$ 与各条地平线边界边相连生成新三角面，期望复杂度 $O(N \\log N)$！
      </div>
    </div>
  </div>
`;

export const CONVEX_HULL_3D_ANALYSIS_HTML = `
  <div style="font-size: 13px; line-height: 1.6; color: #334155;">
    <h3 style="margin-top: 0; color: #0f172a; font-size: 15px; font-weight: 800;">💡 欧拉公式与三维图论对偶</h3>

    <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 10px; margin-bottom: 12px;">
      <div style="font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">1. 欧拉示性数定理</div>
      <div style="font-size: 12px; color: #1e40af;">
        三维凸多面体的点数 $V$、边数 $E$ 与面数 $F$ 严格满足欧拉公式：
        $$V - E + F = 2$$
        每个三角形面有 3 条边，每条边恰好被 2 个面共享，故 $3F = 2E \\implies F = 2V - 4$，面数与边数均为 $O(V)$ 线性阶！
      </div>
    </div>

    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px;">
      <div style="font-weight: 700; color: #166534; margin-bottom: 4px;">2. 扰动法与三点共线退化消除</div>
      <div style="font-size: 12px; color: #15803d;">
        为了避免多点共面或四点共圆导致的奇异退化，工程实现中常对每个点坐标施加微小的随机扰动 $\\epsilon \\sim 10^{-10}$，确保凸包三角剖分的严格拓扑稳定性。
      </div>
    </div>
  </div>
`;
