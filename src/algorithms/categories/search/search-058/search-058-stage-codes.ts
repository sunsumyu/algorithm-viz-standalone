/**
 * 左神算法通关课 Class 058 洪水填充高频扩展 多语言源码与 1-based 行号映射
 */

export interface CodeMapping {
  java: number;
  cpp: number;
  python: number;
  javascript: number;
}

export const MAKING_LARGE_ISLAND_058_CODES: Record<string, string[]> = {
  java: [
    'public int largestIsland(int[][] grid) {', // 1
    '    int n = grid.length, islandId = 2, maxArea = 0;', // 2
    '    Map<Integer, Integer> areaMap = new HashMap<>();', // 3
    '    for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) {', // 4
    '        if (grid[r][c] == 1) { // 1. DFS 染色并记录岛屿面积', // 5
    '            int size = dfs(grid, r, c, islandId);', // 6
    '            areaMap.put(islandId, size);', // 7
    '            maxArea = Math.max(maxArea, size); islandId++;', // 8
    '        }', // 9
    '    }', // 10
    '    for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) {', // 11
    '        if (grid[r][c] == 0) { // 2. 枚举 0 作为桥梁连接邻居', // 12
    '            Set<Integer> seen = new HashSet<>(); int cur = 1;', // 13
    '            for (int id : getNeighborIds(grid, r, c)) {', // 14
    '                if (id > 1 && seen.add(id)) cur += areaMap.get(id); // 防重累加', // 15
    '            }', // 16
    '            maxArea = Math.max(maxArea, cur);', // 17
    '        }', // 18
    '    }', // 19
    '    return maxArea == 0 ? n * n : maxArea;', // 20
    '}', // 21
  ],
  cpp: [
    'int largestIsland(vector<vector<int>>& grid) {', // 1
    '    int n = grid.size(), islandId = 2, maxArea = 0;', // 2
    '    unordered_map<int, int> areaMap;', // 3
    '    for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) {', // 4
    '        if (grid[r][c] == 1) {', // 5
    '            int size = dfs(grid, r, c, islandId);', // 6
    '            areaMap[islandId] = size;', // 7
    '            maxArea = max(maxArea, size); islandId++;', // 8
    '        }', // 9
    '    }', // 10
    '    for (int r = 0; r < n; r++) for (int c = 0; c < n; c++) {', // 11
    '        if (grid[r][c] == 0) {', // 12
    '            unordered_set<int> seen; int cur = 1;', // 13
    '            for (int id : getNeighborIds(grid, r, c)) {', // 14
    '                if (id > 1 && seen.insert(id).second) cur += areaMap[id];', // 15
    '            }', // 16
    '            maxArea = max(maxArea, cur);', // 17
    '        }', // 18
    '    }', // 19
    '    return maxArea == 0 ? n * n : maxArea;', // 20
    '}', // 21
  ],
  python: [
    'def largest_island(self, grid: list) -> int:', // 1
    '    n = len(grid); island_id = 2; area_map = {}; max_area = 0', // 2
    '    for r in range(n):', // 3
    '        for c in range(n):', // 4
    '            if grid[r][c] == 1: # 染色', // 5
    '                size = self.dfs(grid, r, c, island_id)', // 6
    '                area_map[island_id] = size', // 7
    '                max_area = max(max_area, size); island_id += 1', // 8
    '    for r in range(n):', // 9
    '        for c in range(n):', // 10
    '            if grid[r][c] == 0: # 桥接', // 11
    '                seen = set(); cur = 1', // 12
    '                for nid in self.get_neighbors(grid, r, c):', // 13
    '                    if nid > 1 and nid not in seen: seen.add(nid); cur += area_map[nid]', // 14
    '                max_area = max(max_area, cur)', // 15
    '    return n * n if max_area == 0 else max_area', // 16
  ],
  javascript: [
    'function largestIsland(grid) {', // 1
    '    const n = grid.length; let islandId = 2, maxArea = 0;', // 2
    '    const areaMap = new Map();', // 3
    '    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {', // 4
    '        if (grid[r][c] === 1) {', // 5
    '            const size = dfs(grid, r, c, islandId);', // 6
    '            areaMap.set(islandId, size);', // 7
    '            maxArea = Math.max(maxArea, size); islandId++;', // 8
    '        }', // 9
    '    }', // 10
    '    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {', // 11
    '        if (grid[r][c] === 0) {', // 12
    '            const seen = new Set(); let cur = 1;', // 13
    '            for (const id of getNeighborIds(grid, r, c)) {', // 14
    '                if (id > 1 && !seen.has(id)) { seen.add(id); cur += areaMap.get(id); }', // 15
    '            }', // 16
    '            maxArea = Math.max(maxArea, cur);', // 17
    '        }', // 18
    '    }', // 19
    '    return maxArea === 0 ? n * n : maxArea;', // 20
    '}', // 21
  ],
};

export const MAKING_LARGE_ISLAND_058_LINES: Record<string, CodeMapping> = {
  entry:       { java: 1, cpp: 1, python: 1, javascript: 1 },
  startDfsColor:{ java: 6, cpp: 6, python: 6, javascript: 6 },
  saveArea:    { java: 7, cpp: 7, python: 7, javascript: 7 },
  checkZero:   { java: 12, cpp: 12, python: 11, javascript: 12 },
  combineAreas:{ java: 15, cpp: 15, python: 14, javascript: 15 },
  returnAns:   { java: 20, cpp: 20, python: 16, javascript: 20 },
};

// -------------------------------------------------------------
// Code01: 图像渲染 (Flood Fill / LeetCode 733)
// -------------------------------------------------------------
export const FLOOD_FILL_058_CODES: Record<string, string[]> = {
  java: [
    'public int[][] floodFill(int[][] image, int sr, int sc, int color) {', // 1
    '    if (image[sr][sc] == color) return image; // 避免同色死循环', // 2
    '    int orig = image[sr][sc];', // 3
    '    dfs(image, sr, sc, orig, color);', // 4
    '    return image;', // 5
    '}', // 6
    'private void dfs(int[][] img, int r, int c, int orig, int color) {', // 7
    '    if (r < 0 || r >= img.length || c < 0 || c >= img[0].length || img[r][c] != orig) return;', // 8
    '    img[r][c] = color;', // 9
    '    dfs(img, r - 1, c, orig, color); // 上', // 10
    '    dfs(img, r + 1, c, orig, color); // 下', // 11
    '    dfs(img, r, c - 1, orig, color); // 左', // 12
    '    dfs(img, r, c + 1, orig, color); // 右', // 13
    '}', // 14
  ],
  cpp: [
    'vector<vector<int>> floodFill(vector<vector<int>>& image, int sr, int sc, int color) {', // 1
    '    if (image[sr][sc] == color) return image;', // 2
    '    int orig = image[sr][sc];', // 3
    '    dfs(image, sr, sc, orig, color);', // 4
    '    return image;', // 5
    '}', // 6
    'void dfs(vector<vector<int>>& img, int r, int c, int orig, int color) {', // 7
    '    if (r < 0 || r >= img.size() || c < 0 || c >= img[0].size() || img[r][c] != orig) return;', // 8
    '    img[r][c] = color;', // 9
    '    dfs(img, r - 1, c, orig, color);', // 10
    '    dfs(img, r + 1, c, orig, color);', // 11
    '    dfs(img, r, c - 1, orig, color);', // 12
    '    dfs(img, r, c + 1, orig, color);', // 13
    '}', // 14
  ],
  python: [
    'def flood_fill(image: list[list[int]], sr: int, sc: int, color: int) -> list[list[int]]:', // 1
    '    if image[sr][sc] == color:', // 2
    '        return image', // 3
    '    orig = image[sr][sc]', // 4
    '    def dfs(r: int, c: int):', // 5
    '        if not (0 <= r < len(image) and 0 <= c < len(image[0])) or image[r][c] != orig:', // 6
    '            return', // 7
    '        image[r][c] = color', // 8
    '        dfs(r - 1, c)', // 9
    '        dfs(r + 1, c)', // 10
    '        dfs(r, c - 1)', // 11
    '        dfs(r, c + 1)', // 12
    '    dfs(sr, sc)', // 13
    '    return image', // 14
  ],
  javascript: [
    'function floodFill(image, sr, sc, color) {', // 1
    '    if (image[sr][sc] === color) return image;', // 2
    '    const orig = image[sr][sc];', // 3
    '    function dfs(r, c) {', // 4
    '        if (r < 0 || r >= image.length || c < 0 || c >= image[0].length || image[r][c] !== orig) return;', // 5
    '        image[r][c] = color;', // 6
    '        dfs(r - 1, c);', // 7
    '        dfs(r + 1, c);', // 8
    '        dfs(r, c - 1);', // 9
    '        dfs(r, c + 1);', // 10
    '    }', // 11
    '    dfs(sr, sc);', // 12
    '    return image;', // 13
    '}', // 14
  ],
};

export const FLOOD_FILL_058_LINES: Record<string, CodeMapping> = {
  entry:      { java: 1, cpp: 1, python: 1, javascript: 1 },
  checkSame:  { java: 2, cpp: 2, python: 2, javascript: 2 },
  startDfs:   { java: 4, cpp: 4, python: 13, javascript: 12 },
  checkBound: { java: 8, cpp: 8, python: 6, javascript: 5 },
  dyeCell:    { java: 9, cpp: 9, python: 8, javascript: 6 },
  spread:     { java: 10, cpp: 10, python: 9, javascript: 7 },
  returnAns:  { java: 5, cpp: 5, python: 14, javascript: 13 },
};

