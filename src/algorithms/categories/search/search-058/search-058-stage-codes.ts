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
