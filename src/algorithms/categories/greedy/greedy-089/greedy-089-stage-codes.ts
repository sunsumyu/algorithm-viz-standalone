/**
 * 第 89 课：左神贪心算法专题 1 - 四语言（Java / C++ / Python / JavaScript）代码片段与 1-based 相对行号映射字典
 * 涵盖 6 道题目的三阶段：阶段1 暴力对比、阶段2 贪心高效推演、阶段3 贪心证明/反证
 */

// ==========================================
// 1. 最大数 (Largest Number) 代码与行号
// ==========================================

export const LARGEST_NUMBER_STAGE1_CODES: Record<string, string[]> = {
  java: [
    'public String largestNumberBrute(int[] nums) {',
    '    // 阶段1：暴力穷举全排列并比较',
    '    List<String> list = new ArrayList<>();',
    '    permute(nums, 0, list);',
    '    String maxStr = "0";',
    '    for (String s : list) {',
    '        if (s.compareTo(maxStr) > 0) {',
    '            maxStr = s;',
    '        }',
    '    }',
    '    return maxStr;',
    '}',
  ],
  cpp: [
    'string largestNumberBrute(vector<int>& nums) {',
    '    // 阶段1：暴力穷举全排列并比较',
    '    vector<string> list;',
    '    permute(nums, 0, list);',
    '    string maxStr = "0";',
    '    for (auto& s : list) {',
    '        if (s > maxStr) {',
    '            maxStr = s;',
    '        }',
    '    }',
    '    return maxStr;',
    '}',
  ],
  python: [
    'def largest_number_brute(nums: List[int]) -> str:',
    '    # 阶段1：暴力穷举全排列并比较',
    '    from itertools import permutations',
    '    all_strs = ["".join(map(str, p)) for p in permutations(nums)]',
    '    max_str = "0"',
    '    for s in all_strs:',
    '        if s > max_str:',
    '            max_str = s',
    '    return max_str',
  ],
  javascript: [
    'function largestNumberBrute(nums) {',
    '    // 阶段1：暴力穷举全排列并比较',
    '    const list = [];',
    '    permute(nums, 0, list);',
    '    let maxStr = "0";',
    '    for (const s of list) {',
    '        if (s > maxStr) {',
    '            maxStr = s;',
    '        }',
    '    }',
    '    return maxStr;',
    '}',
  ],
};

export const LARGEST_NUMBER_STAGE1_LINES = {
  entry: { java: 1, cpp: 1, python: 1, javascript: 1 },
  init: { java: 3, cpp: 3, python: 3, javascript: 3 },
  permute: { java: 4, cpp: 4, python: 4, javascript: 4 },
  compareLoop: { java: 6, cpp: 6, python: 6, javascript: 6 },
  update: { java: 8, cpp: 8, python: 8, javascript: 8 },
  done: { java: 11, cpp: 11, python: 9, javascript: 11 },
};

export const LARGEST_NUMBER_STAGE2_CODES: Record<string, string[]> = {
  java: [
    'public String largestNumber(int[] nums) {',
    '    int n = nums.length;',
    '    String[] strs = new String[n];',
    '    for (int i = 0; i < n; i++) strs[i] = String.valueOf(nums[i]);',
    '    Arrays.sort(strs, (a, b) -> (b + a).compareTo(a + b));',
    '    if (strs[0].equals("0")) return "0";',
    '    StringBuilder sb = new StringBuilder();',
    '    for (String s : strs) sb.append(s);',
    '    return sb.toString();',
    '}',
  ],
  cpp: [
    'string largestNumber(vector<int>& nums) {',
    '    int n = nums.size();',
    '    vector<string> strs(n);',
    '    for (int i = 0; i < n; i++) strs[i] = to_string(nums[i]);',
    '    sort(strs.begin(), strs.end(), [](const string& a, const string& b) { return a + b > b + a; });',
    '    if (strs[0] == "0") return "0";',
    '    string res = "";',
    '    for (auto& s : strs) res += s;',
    '    return res;',
    '}',
  ],
  python: [
    'def largestNumber(nums: List[int]) -> str:',
    '    strs = [str(x) for x in nums]',
    '    from functools import cmp_to_key',
    '    strs.sort(key=cmp_to_key(lambda a, b: 1 if a + b < b + a else -1))',
    '    if strs[0] == "0":',
    '        return "0"',
    '    return "".join(strs)',
  ],
  javascript: [
    'function largestNumber(nums) {',
    '    const n = nums.length;',
    '    const strs = nums.map(String);',
    '    strs.sort((a, b) => (b + a).localeCompare(a + b));',
    '    if (strs[0] === "0") return "0";',
    '    return strs.join("");',
    '}',
  ],
};

export const LARGEST_NUMBER_STAGE2_LINES = {
  entry: { java: 1, cpp: 1, python: 1, javascript: 1 },
  convert: { java: 4, cpp: 4, python: 2, javascript: 3 },
  sort: { java: 5, cpp: 5, python: 4, javascript: 4 },
  zeroGuard: { java: 6, cpp: 6, python: 5, javascript: 5 },
  join: { java: 8, cpp: 8, python: 7, javascript: 6 },
  done: { java: 9, cpp: 9, python: 7, javascript: 6 },
};

export const LARGEST_NUMBER_STAGE3_CODES: Record<string, string[]> = {
  java: [
    '// 阶段3：邻项交换法 (Exchange Argument) 反证证明',
    'public boolean verifyExchangeProperty(String a, String b) {',
    '    // 如果 (b + a) > (a + b)，交换 a 与 b 之后数值严格增加',
    '    String ab = a + b;',
    '    String ba = b + a;',
    '    boolean needSwap = ba.compareTo(ab) > 0;',
    '    return needSwap;',
    '}',
  ],
  cpp: [
    '// 阶段3：邻项交换法 (Exchange Argument) 反证证明',
    'bool verifyExchangeProperty(string a, string b) {',
    '    // 如果 (b + a) > (a + b)，交换 a 与 b 之后数值严格增加',
    '    string ab = a + b;',
    '    string ba = b + a;',
    '    bool needSwap = ba > ab;',
    '    return needSwap;',
    '}',
  ],
  python: [
    '# 阶段3：邻项交换法 (Exchange Argument) 反证证明',
    'def verify_exchange_property(a: str, b: str) -> bool:',
    '    # 如果 (b + a) > (a + b)，交换 a 与 b 之后数值严格增加',
    '    ab = a + b',
    '    ba = b + a',
    '    need_swap = ba > ab',
    '    return need_swap',
  ],
  javascript: [
    '// 阶段3：邻项交换法 (Exchange Argument) 反证证明',
    'function verifyExchangeProperty(a, b) {',
    '    // 如果 (b + a) > (a + b)，交换 a 与 b 之后数值严格增加',
    '    const ab = a + b;',
    '    const ba = b + a;',
    '    const needSwap = ba > ab;',
    '    return needSwap;',
    '}',
  ],
};

export const LARGEST_NUMBER_STAGE3_LINES = {
  entry: { java: 2, cpp: 2, python: 2, javascript: 2 },
  compare: { java: 4, cpp: 4, python: 4, javascript: 4 },
  decision: { java: 6, cpp: 6, python: 6, javascript: 6 },
  done: { java: 7, cpp: 7, python: 7, javascript: 7 },
};

// ==========================================
// 2. 两地调度 (Two City Scheduling) 代码与行号
// ==========================================

export const TWO_CITY_STAGE1_CODES: Record<string, string[]> = {
  java: [
    'public int twoCitySchedCostBrute(int[][] costs) {',
    '    int n = costs.length / 2;',
    '    return dfs(costs, 0, n, n);',
    '}',
    'private int dfs(int[][] costs, int i, int aLeft, int bLeft) {',
    '    if (i == costs.length) return 0;',
    '    int ans = Integer.MAX_VALUE;',
    '    if (aLeft > 0) ans = Math.min(ans, costs[i][0] + dfs(costs, i + 1, aLeft - 1, bLeft));',
    '    if (bLeft > 0) ans = Math.min(ans, costs[i][1] + dfs(costs, i + 1, aLeft, bLeft - 1));',
    '    return ans;',
    '}',
  ],
  cpp: [
    'int twoCitySchedCostBrute(vector<vector<int>>& costs) {',
    '    int n = costs.size() / 2;',
    '    return dfs(costs, 0, n, n);',
    '}',
    'int dfs(vector<vector<int>>& costs, int i, int aLeft, int bLeft) {',
    '    if (i == costs.size()) return 0;',
    '    int ans = INT_MAX;',
    '    if (aLeft > 0) ans = min(ans, costs[i][0] + dfs(costs, i + 1, aLeft - 1, bLeft));',
    '    if (bLeft > 0) ans = min(ans, costs[i][1] + dfs(costs, i + 1, aLeft, bLeft - 1));',
    '    return ans;',
    '}',
  ],
  python: [
    'def two_city_brute(costs: List[List[int]]) -> int:',
    '    n = len(costs) // 2',
    '    def dfs(i, a_left, b_left):',
    '        if i == len(costs): return 0',
    '        ans = float("inf")',
    '        if a_left > 0: ans = min(ans, costs[i][0] + dfs(i + 1, a_left - 1, b_left))',
    '        if b_left > 0: ans = min(ans, costs[i][1] + dfs(i + 1, a_left, b_left - 1))',
    '        return ans',
    '    return dfs(0, n, n)',
  ],
  javascript: [
    'function twoCitySchedCostBrute(costs) {',
    '    const n = costs.length / 2;',
    '    function dfs(i, aLeft, bLeft) {',
    '        if (i === costs.length) return 0;',
    '        let ans = Infinity;',
    '        if (aLeft > 0) ans = Math.min(ans, costs[i][0] + dfs(i + 1, aLeft - 1, bLeft));',
    '        if (bLeft > 0) ans = Math.min(ans, costs[i][1] + dfs(i + 1, aLeft, bLeft - 1));',
    '        return ans;',
    '    }',
    '    return dfs(0, n, n);',
    '}',
  ],
};

export const TWO_CITY_STAGE1_LINES = {
  entry: { java: 1, cpp: 1, python: 1, javascript: 1 },
  callDfs: { java: 3, cpp: 3, python: 9, javascript: 10 },
  dfsBase: { java: 6, cpp: 6, python: 4, javascript: 4 },
  chooseA: { java: 8, cpp: 8, python: 6, javascript: 6 },
  chooseB: { java: 9, cpp: 9, python: 7, javascript: 7 },
  done: { java: 10, cpp: 10, python: 8, javascript: 8 },
};

export const TWO_CITY_STAGE2_CODES: Record<string, string[]> = {
  java: [
    'public int twoCitySchedCost(int[][] costs) {',
    '    int n = costs.length / 2;',
    '    // 按去B市与去A市的差价 (costB - costA) 升序排序',
    '    Arrays.sort(costs, (a, b) -> (a[1] - a[0]) - (b[1] - b[0]));',
    '    int totalCost = 0;',
    '    for (int i = 0; i < n; i++) {',
    '        totalCost += costs[i][1]; // 前 N 个人去 B',
    '    }',
    '    for (int i = n; i < 2 * n; i++) {',
    '        totalCost += costs[i][0]; // 后 N 个人去 A',
    '    }',
    '    return totalCost;',
    '}',
  ],
  cpp: [
    'int twoCitySchedCost(vector<vector<int>>& costs) {',
    '    int n = costs.size() / 2;',
    '    // 按去B市与去A市的差价 (costB - costA) 升序排序',
    '    sort(costs.begin(), costs.end(), [](const auto& a, const auto& b) {',
    '        return (a[1] - a[0]) < (b[1] - b[0]);',
    '    });',
    '    int totalCost = 0;',
    '    for (int i = 0; i < n; i++) totalCost += costs[i][1];',
    '    for (int i = n; i < 2 * n; i++) totalCost += costs[i][0];',
    '    return totalCost;',
    '}',
  ],
  python: [
    'def twoCitySchedCost(costs: List[List[int]]) -> int:',
    '    n = len(costs) // 2',
    '    # 按去B市与去A市的差价升序排序',
    '    costs.sort(key=lambda x: x[1] - x[0])',
    '    total_cost = 0',
    '    for i in range(n):',
    '        total_cost += costs[i][1]  # 前 N 个人去 B',
    '    for i in range(n, 2 * n):',
    '        total_cost += costs[i][0]  # 后 N 个人去 A',
    '    return total_cost',
  ],
  javascript: [
    'function twoCitySchedCost(costs) {',
    '    const n = costs.length / 2;',
    '    // 按去B市与去A市的差价升序排序',
    '    costs.sort((a, b) => (a[1] - a[0]) - (b[1] - b[0]));',
    '    let totalCost = 0;',
    '    for (let i = 0; i < n; i++) totalCost += costs[i][1];',
    '    for (let i = n; i < 2 * n; i++) totalCost += costs[i][0];',
    '    return totalCost;',
    '}',
  ],
};

export const TWO_CITY_STAGE2_LINES = {
  entry: { java: 1, cpp: 1, python: 1, javascript: 1 },
  sort: { java: 4, cpp: 4, python: 4, javascript: 4 },
  chooseB: { java: 7, cpp: 8, python: 7, javascript: 6 },
  chooseA: { java: 10, cpp: 9, python: 9, javascript: 7 },
  done: { java: 12, cpp: 10, python: 10, javascript: 8 },
};

export const TWO_CITY_STAGE3_CODES: Record<string, string[]> = {
  java: [
    '// 阶段3：费用置换反证证明',
    'public int verifyOptimalExchange(int[][] costs, int pickA, int pickB) {',
    '    // 如果交换让一个本该去B的人改去A，让一个去A的人改去B',
    '    int delta = (costs[pickB][0] - costs[pickB][1]) + (costs[pickA][1] - costs[pickA][0]);',
    '    return delta; // delta >= 0 说明交换绝不比贪心排序更优',
    '}',
  ],
  cpp: [
    '// 阶段3：费用置换反证证明',
    'int verifyOptimalExchange(vector<vector<int>>& costs, int pickA, int pickB) {',
    '    // 如果交换让一个本该去B的人改去A，让一个去A的人改去B',
    '    int delta = (costs[pickB][0] - costs[pickB][1]) + (costs[pickA][1] - costs[pickA][0]);',
    '    return delta; // delta >= 0 说明交换绝不比贪心排序更优',
    '}',
  ],
  python: [
    '# 阶段3：费用置换反证证明',
    'def verify_optimal_exchange(costs, pick_a, pick_b):',
    '    # 如果交换让一个本该去B的人改去A，让一个去A的人改去B',
    '    delta = (costs[pick_b][0] - costs[pick_b][1]) + (costs[pick_a][1] - costs[pick_a][0])',
    '    return delta  # delta >= 0 说明交换绝不比贪心排序更优',
  ],
  javascript: [
    '// 阶段3：费用置换反证证明',
    'function verifyOptimalExchange(costs, pickA, pickB) {',
    '    // 如果交换让一个本该去B的人改去A，让一个去A的人改去B',
    '    const delta = (costs[pickB][0] - costs[pickB][1]) + (costs[pickA][1] - costs[pickA][0]);',
    '    return delta; // delta >= 0 说明交换绝不比贪心排序更优',
    '}',
  ],
};

export const TWO_CITY_STAGE3_LINES = {
  entry: { java: 2, cpp: 2, python: 2, javascript: 2 },
  computeDelta: { java: 4, cpp: 4, python: 4, javascript: 4 },
  done: { java: 5, cpp: 5, python: 5, javascript: 5 },
};

// ==========================================
// 3. 吃掉 N 个橘子的最少天数 代码与行号
// ==========================================

export const EAT_ORANGES_STAGE1_CODES: Record<string, string[]> = {
  java: [
    'public int minDaysBrute(int n) {',
    '    if (n <= 1) return n;',
    '    int ans = 1 + minDaysBrute(n - 1);',
    '    if (n % 2 == 0) ans = Math.min(ans, 1 + minDaysBrute(n / 2));',
    '    if (n % 3 == 0) ans = Math.min(ans, 1 + minDaysBrute(n / 3));',
    '    return ans;',
    '}',
  ],
  cpp: [
    'int minDaysBrute(int n) {',
    '    if (n <= 1) return n;',
    '    int ans = 1 + minDaysBrute(n - 1);',
    '    if (n % 2 == 0) ans = min(ans, 1 + minDaysBrute(n / 2));',
    '    if (n % 3 == 0) ans = min(ans, 1 + minDaysBrute(n / 3));',
    '    return ans;',
    '}',
  ],
  python: [
    'def minDaysBrute(n: int) -> int:',
    '    if n <= 1: return n',
    '    ans = 1 + minDaysBrute(n - 1)',
    '    if n % 2 == 0: ans = min(ans, 1 + minDaysBrute(n // 2))',
    '    if n % 3 == 0: ans = min(ans, 1 + minDaysBrute(n // 3))',
    '    return ans',
  ],
  javascript: [
    'function minDaysBrute(n) {',
    '    if (n <= 1) return n;',
    '    let ans = 1 + minDaysBrute(n - 1);',
    '    if (n % 2 === 0) ans = Math.min(ans, 1 + minDaysBrute(n / 2));',
    '    if (n % 3 === 0) ans = Math.min(ans, 1 + minDaysBrute(n / 3));',
    '    return ans;',
    '}',
  ],
};

export const EAT_ORANGES_STAGE1_LINES = {
  entry: { java: 1, cpp: 1, python: 1, javascript: 1 },
  guard: { java: 2, cpp: 2, python: 2, javascript: 2 },
  subOne: { java: 3, cpp: 3, python: 3, javascript: 3 },
  divTwo: { java: 4, cpp: 4, python: 4, javascript: 4 },
  divThree: { java: 5, cpp: 5, python: 5, javascript: 5 },
  done: { java: 6, cpp: 6, python: 6, javascript: 6 },
};

export const EAT_ORANGES_STAGE2_CODES: Record<string, string[]> = {
  java: [
    'public Map<Integer, Integer> memo = new HashMap<>();',
    'public int minDays(int n) {',
    '    if (n <= 1) return n;',
    '    if (memo.containsKey(n)) return memo.get(n);',
    '    // 贪心跨步：只为了凑倍数吃个别1，然后直接整除飞跃',
    '    int ans = 1 + Math.min(n % 2 + minDays(n / 2), n % 3 + minDays(n / 3));',
    '    memo.put(n, ans);',
    '    return ans;',
    '}',
  ],
  cpp: [
    'unordered_map<int, int> memo;',
    'int minDays(int n) {',
    '    if (n <= 1) return n;',
    '    if (memo.count(n)) return memo[n];',
    '    // 贪心跨步：只为了凑倍数吃个别1，然后直接整除飞跃',
    '    int ans = 1 + min(n % 2 + minDays(n / 2), n % 3 + minDays(n / 3));',
    '    memo[n] = ans;',
    '    return ans;',
    '}',
  ],
  python: [
    'memo = {}',
    'def minDays(n: int) -> int:',
    '    if n <= 1: return n',
    '    if n in memo: return memo[n]',
    '    # 贪心跨步：只为了凑倍数吃个别1，然后直接整除飞跃',
    '    ans = 1 + min(n % 2 + minDays(n // 2), n % 3 + minDays(n // 3))',
    '    memo[n] = ans',
    '    return ans',
  ],
  javascript: [
    'const memo = new Map();',
    'function minDays(n) {',
    '    if (n <= 1) return n;',
    '    if (memo.has(n)) return memo.get(n);',
    '    // 贪心跨步：只为了凑倍数吃个别1，然后直接整除飞跃',
    '    const ans = 1 + Math.min((n % 2) + minDays(Math.floor(n / 2)), (n % 3) + minDays(Math.floor(n / 3)));',
    '    memo.set(n, ans);',
    '    return ans;',
    '}',
  ],
};

export const EAT_ORANGES_STAGE2_LINES = {
  entry: { java: 2, cpp: 2, python: 2, javascript: 2 },
  guard: { java: 3, cpp: 3, python: 3, javascript: 3 },
  memoCheck: { java: 4, cpp: 4, python: 4, javascript: 4 },
  greedyDiv: { java: 6, cpp: 6, python: 6, javascript: 6 },
  memoSave: { java: 7, cpp: 7, python: 7, javascript: 7 },
  done: { java: 8, cpp: 8, python: 8, javascript: 8 },
};

export const EAT_ORANGES_STAGE3_CODES: Record<string, string[]> = {
  java: [
    '// 阶段3：贪心跨步除法优于连续吃1的反证判定',
    'public String analyzeGreedyJump(int n) {',
    '    int costDiv2 = (n % 2) + 1; // 凑偶数吃个别1并除以2的花费',
    '    int costDiv3 = (n % 3) + 1; // 凑3倍数吃个别1并除以3的花费',
    '    return "n=" + n + " 最优跳跃分支: " + (costDiv2 < costDiv3 ? "除以2" : "除以3");',
    '}',
  ],
  cpp: [
    '// 阶段3：贪心跨步除法优于连续吃1的反证判定',
    'string analyzeGreedyJump(int n) {',
    '    int costDiv2 = (n % 2) + 1;',
    '    int costDiv3 = (n % 3) + 1;',
    '    return "n=" + to_string(n) + " 最优跳跃分支";',
    '}',
  ],
  python: [
    '# 阶段3：贪心跨步除法优于连续吃1的反证判定',
    'def analyze_greedy_jump(n: int) -> str:',
    '    cost_div2 = (n % 2) + 1',
    '    cost_div3 = (n % 3) + 1',
    '    return f"n={n} 最优跳跃分支"',
  ],
  javascript: [
    '// 阶段3：贪心跨步除法优于连续吃1的反证判定',
    'function analyzeGreedyJump(n) {',
    '    const costDiv2 = (n % 2) + 1;',
    '    const costDiv3 = (n % 3) + 1;',
    '    return `n=${n} 最优跳跃分支`;',
    '}',
  ],
};

export const EAT_ORANGES_STAGE3_LINES = {
  entry: { java: 2, cpp: 2, python: 2, javascript: 2 },
  costCompute: { java: 3, cpp: 3, python: 3, javascript: 3 },
  done: { java: 5, cpp: 5, python: 5, javascript: 5 },
};

// ==========================================
// 4. 会议室 II (Meeting Rooms II) 代码与行号
// ==========================================

export const MEETING_ROOMS_STAGE1_CODES: Record<string, string[]> = {
  java: [
    'public int minMeetingRoomsBrute(int[][] intervals) {',
    '    // 暴力算法：枚举每个时间戳，统计最大重叠数',
    '    int maxRooms = 0;',
    '    for (int[] cur : intervals) {',
    '        int count = 0;',
    '        for (int[] other : intervals) {',
    '            if (other[0] <= cur[0] && other[1] > cur[0]) count++;',
    '        }',
    '        maxRooms = Math.max(maxRooms, count);',
    '    }',
    '    return maxRooms;',
    '}',
  ],
  cpp: [
    'int minMeetingRoomsBrute(vector<vector<int>>& intervals) {',
    '    int maxRooms = 0;',
    '    for (auto& cur : intervals) {',
    '        int count = 0;',
    '        for (auto& other : intervals) {',
    '            if (other[0] <= cur[0] && other[1] > cur[0]) count++;',
    '        }',
    '        maxRooms = max(maxRooms, count);',
    '    }',
    '    return maxRooms;',
    '}',
  ],
  python: [
    'def minMeetingRoomsBrute(intervals: List[List[int]]) -> int:',
    '    max_rooms = 0',
    '    for cur in intervals:',
    '        count = 0',
    '        for other in intervals:',
    '            if other[0] <= cur[0] < other[1]:',
    '                count += 1',
    '        max_rooms = max(max_rooms, count)',
    '    return max_rooms',
  ],
  javascript: [
    'function minMeetingRoomsBrute(intervals) {',
    '    let maxRooms = 0;',
    '    for (const cur of intervals) {',
    '        let count = 0;',
    '        for (const other of intervals) {',
    '            if (other[0] <= cur[0] && other[1] > cur[0]) count++;',
    '        }',
    '        maxRooms = Math.max(maxRooms, count);',
    '    }',
    '    return maxRooms;',
    '}',
  ],
};

export const MEETING_ROOMS_STAGE1_LINES = {
  entry: { java: 1, cpp: 1, python: 1, javascript: 1 },
  init: { java: 3, cpp: 2, python: 2, javascript: 2 },
  outerLoop: { java: 4, cpp: 3, python: 3, javascript: 3 },
  innerCheck: { java: 7, cpp: 6, python: 6, javascript: 6 },
  updateMax: { java: 9, cpp: 8, python: 8, javascript: 8 },
  done: { java: 11, cpp: 10, python: 9, javascript: 10 },
};

export const MEETING_ROOMS_STAGE2_CODES: Record<string, string[]> = {
  java: [
    'public int minMeetingRooms(int[][] intervals) {',
    '    if (intervals.length == 0) return 0;',
    '    // 1. 按会议开始时间升序排序',
    '    Arrays.sort(intervals, (a, b) -> a[0] - b[0]);',
    '    // 2. 小根堆维护已分配会议室的结束时间',
    '    PriorityQueue<Integer> heap = new PriorityQueue<>();',
    '    for (int[] meeting : intervals) {',
    '        if (!heap.isEmpty() && meeting[0] >= heap.peek()) {',
    '            heap.poll(); // 复用最早结束的会议室',
    '        }',
    '        heap.add(meeting[1]); // 压入当前会议结束时间',
    '    }',
    '    return heap.size();',
    '}',
  ],
  cpp: [
    'int minMeetingRooms(vector<vector<int>>& intervals) {',
    '    if (intervals.empty()) return 0;',
    '    sort(intervals.begin(), intervals.end(), [](auto& a, auto& b) { return a[0] < b[0]; });',
    '    priority_queue<int, vector<int>, greater<int>> heap;',
    '    for (auto& meeting : intervals) {',
    '        if (!heap.empty() && meeting[0] >= heap.top()) {',
    '            heap.pop();',
    '        }',
    '        heap.push(meeting[1]);',
    '    }',
    '    return heap.size();',
    '}',
  ],
  python: [
    'def minMeetingRooms(intervals: List[List[int]]) -> int:',
    '    if not intervals: return 0',
    '    intervals.sort(key=lambda x: x[0])',
    '    import heapq',
    '    heap = []',
    '    for meeting in intervals:',
    '        if heap and meeting[0] >= heap[0]:',
    '            heapq.heappop(heap)  # 复用最早结束的会议室',
    '        heapq.heappush(heap, meeting[1])',
    '    return len(heap)',
  ],
  javascript: [
    'function minMeetingRooms(intervals) {',
    '    if (intervals.length === 0) return 0;',
    '    intervals.sort((a, b) => a[0] - b[0]);',
    '    const heap = []; // 小顶堆模拟',
    '    for (const meeting of intervals) {',
    '        if (heap.length > 0 && meeting[0] >= heap[0]) {',
    '            heap.shift(); // 堆顶已腾出，复用',
    '        }',
    '        heap.push(meeting[1]);',
    '        heap.sort((a, b) => a - b);',
    '    }',
    '    return heap.length;',
    '}',
  ],
};

export const MEETING_ROOMS_STAGE2_LINES = {
  entry: { java: 1, cpp: 1, python: 1, javascript: 1 },
  guard: { java: 2, cpp: 2, python: 2, javascript: 2 },
  sort: { java: 4, cpp: 3, python: 3, javascript: 3 },
  initHeap: { java: 6, cpp: 4, python: 5, javascript: 4 },
  loopMeeting: { java: 7, cpp: 5, python: 6, javascript: 5 },
  reuseRoom: { java: 9, cpp: 7, python: 8, javascript: 7 },
  pushMeeting: { java: 11, cpp: 9, python: 9, javascript: 9 },
  done: { java: 13, cpp: 11, python: 10, javascript: 12 },
};

export const MEETING_ROOMS_STAGE3_CODES: Record<string, string[]> = {
  java: [
    '// 阶段3：最大重叠峰值反证证明',
    'public boolean verifyPeakInvariant(int heapSize, int maxOverlapCount) {',
    '    // 堆的最终大小恒等于全局最大瞬时并发会议数量',
    '    return heapSize == maxOverlapCount;',
    '}',
  ],
  cpp: [
    '// 阶段3：最大重叠峰值反证证明',
    'bool verifyPeakInvariant(int heapSize, int maxOverlapCount) {',
    '    return heapSize == maxOverlapCount;',
    '}',
  ],
  python: [
    '# 阶段3：最大重叠峰值反证证明',
    'def verify_peak_invariant(heap_size: int, max_overlap: int) -> bool:',
    '    return heap_size == max_overlap',
  ],
  javascript: [
    '// 阶段3：最大重叠峰值反证证明',
    'function verifyPeakInvariant(heapSize, maxOverlapCount) {',
    '    return heapSize === maxOverlapCount;',
    '}',
  ],
};

export const MEETING_ROOMS_STAGE3_LINES = {
  entry: { java: 2, cpp: 2, python: 2, javascript: 2 },
  assertInvariant: { java: 4, cpp: 3, python: 3, javascript: 3 },
};

// ==========================================
// 5. 课程表 III (Course Schedule III) 代码与行号
// ==========================================

export const COURSE_SCHEDULE_STAGE1_CODES: Record<string, string[]> = {
  java: [
    'public int scheduleCourseBrute(int[][] courses) {',
    '    // 暴力搜索：尝试所有子集并校验合法性',
    '    return dfs(courses, 0, 0, 0);',
    '}',
    'private int dfs(int[][] courses, int idx, int time, int count) {',
    '    if (idx == courses.length) return count;',
    '    int notTake = dfs(courses, idx + 1, time, count);',
    '    int take = 0;',
    '    if (time + courses[idx][0] <= courses[idx][1]) {',
    '        take = dfs(courses, idx + 1, time + courses[idx][0], count + 1);',
    '    }',
    '    return Math.max(notTake, take);',
    '}',
  ],
  cpp: [
    'int scheduleCourseBrute(vector<vector<int>>& courses) {',
    '    return dfs(courses, 0, 0, 0);',
    '}',
    'int dfs(vector<vector<int>>& courses, int idx, int time, int count) {',
    '    if (idx == courses.size()) return count;',
    '    int notTake = dfs(courses, idx + 1, time, count);',
    '    int take = 0;',
    '    if (time + courses[idx][0] <= courses[idx][1]) {',
    '        take = dfs(courses, idx + 1, time + courses[idx][0], count + 1);',
    '    }',
    '    return max(notTake, take);',
    '}',
  ],
  python: [
    'def scheduleCourseBrute(courses: List[List[int]]) -> int:',
    '    def dfs(idx, time, count):',
    '        if idx == len(courses): return count',
    '        not_take = dfs(idx + 1, time, count)',
    '        take = 0',
    '        if time + courses[idx][0] <= courses[idx][1]:',
    '            take = dfs(idx + 1, time + courses[idx][0], count + 1)',
    '        return max(not_take, take)',
    '    return dfs(0, 0, 0)',
  ],
  javascript: [
    'function scheduleCourseBrute(courses) {',
    '    function dfs(idx, time, count) {',
    '        if (idx === courses.length) return count;',
    '        const notTake = dfs(idx + 1, time, count);',
    '        let take = 0;',
    '        if (time + courses[idx][0] <= courses[idx][1]) {',
    '            take = dfs(idx + 1, time + courses[idx][0], count + 1);',
    '        }',
    '        return Math.max(notTake, take);',
    '    }',
    '    return dfs(0, 0, 0);',
    '}',
  ],
};

export const COURSE_SCHEDULE_STAGE1_LINES = {
  entry: { java: 1, cpp: 1, python: 1, javascript: 1 },
  callDfs: { java: 3, cpp: 2, python: 9, javascript: 11 },
  dfsBase: { java: 6, cpp: 5, python: 3, javascript: 3 },
  branchNotTake: { java: 7, cpp: 6, python: 4, javascript: 4 },
  branchTake: { java: 9, cpp: 8, python: 6, javascript: 6 },
  done: { java: 11, cpp: 10, python: 8, javascript: 9 },
};

export const COURSE_SCHEDULE_STAGE2_CODES: Record<string, string[]> = {
  java: [
    'public int scheduleCourse(int[][] courses) {',
    '    // 1. 优先按截止时间 lastDay 升序排序',
    '    Arrays.sort(courses, (a, b) -> a[1] - b[1]);',
    '    // 2. 大根堆维护已选修课程的时长 duration',
    '    PriorityQueue<Integer> heap = new PriorityQueue<>((a, b) -> b - a);',
    '    int time = 0;',
    '    for (int[] c : courses) {',
    '        if (time + c[0] <= c[1]) {',
    '            time += c[0];',
    '            heap.add(c[0]);',
    '        } else if (!heap.isEmpty() && heap.peek() > c[0]) {',
    '            // 反悔替换：剔除耗时最长的课，换入当前耗时更短的课',
    '            time += c[0] - heap.poll();',
    '            heap.add(c[0]);',
    '        }',
    '    }',
    '    return heap.size();',
    '}',
  ],
  cpp: [
    'int scheduleCourse(vector<vector<int>>& courses) {',
    '    sort(courses.begin(), courses.end(), [](auto& a, auto& b) { return a[1] < b[1]; });',
    '    priority_queue<int> heap;',
    '    int time = 0;',
    '    for (auto& c : courses) {',
    '        if (time + c[0] <= c[1]) {',
    '            time += c[0];',
    '            heap.push(c[0]);',
    '        } else if (!heap.empty() && heap.top() > c[0]) {',
    '            time += c[0] - heap.top();',
    '            heap.pop();',
    '            heap.push(c[0]);',
    '        }',
    '    }',
    '    return heap.size();',
    '}',
  ],
  python: [
    'def scheduleCourse(courses: List[List[int]]) -> int:',
    '    courses.sort(key=lambda x: x[1])',
    '    import heapq',
    '    heap = []  # 最大堆存放负时长',
    '    time = 0',
    '    for duration, last_day in courses:',
    '        if time + duration <= last_day:',
    '            time += duration',
    '            heapq.heappush(heap, -duration)',
    '        elif heap and -heap[0] > duration:',
    '            # 反悔替换',
    '            time += duration - (-heapq.heappop(heap))',
    '            heapq.heappush(heap, -duration)',
    '    return len(heap)',
  ],
  javascript: [
    'function scheduleCourse(courses) {',
    '    courses.sort((a, b) => a[1] - b[1]);',
    '    const heap = []; // 大根堆模拟',
    '    let time = 0;',
    '    for (const [duration, lastDay] of courses) {',
    '        if (time + duration <= lastDay) {',
    '            time += duration;',
    '            heap.push(duration);',
    '            heap.sort((a, b) => b - a);',
    '        } else if (heap.length > 0 && heap[0] > duration) {',
    '            time += duration - heap.shift();',
    '            heap.push(duration);',
    '            heap.sort((a, b) => b - a);',
    '        }',
    '    }',
    '    return heap.length;',
    '}',
  ],
};

export const COURSE_SCHEDULE_STAGE2_LINES = {
  entry: { java: 1, cpp: 1, python: 1, javascript: 1 },
  sort: { java: 3, cpp: 2, python: 2, javascript: 2 },
  initHeap: { java: 5, cpp: 3, python: 4, javascript: 3 },
  loopCourse: { java: 7, cpp: 5, python: 6, javascript: 5 },
  takeDirect: { java: 9, cpp: 7, python: 8, javascript: 7 },
  regretSwap: { java: 12, cpp: 10, python: 12, javascript: 12 },
  done: { java: 16, cpp: 16, python: 14, javascript: 17 },
};

export const COURSE_SCHEDULE_STAGE3_CODES: Record<string, string[]> = {
  java: [
    '// 阶段3：反悔替换不劣性反证证明',
    'public boolean verifyRegretReplacement(int oldDuration, int newDuration, int timeGain) {',
    '    // 用短课替换长课，已修门数不变，但累计时间赢得增益 timeGain = old - new > 0',
    '    return timeGain > 0;',
    '}',
  ],
  cpp: [
    '// 阶段3：反悔替换不劣性反证证明',
    'bool verifyRegretReplacement(int oldDuration, int newDuration, int timeGain) {',
    '    return timeGain > 0;',
    '}',
  ],
  python: [
    '# 阶段3：反悔替换不劣性反证证明',
    'def verify_regret_replacement(old_duration, new_duration, time_gain):',
    '    return time_gain > 0',
  ],
  javascript: [
    '// 阶段3：反悔替换不劣性反证证明',
    'function verifyRegretReplacement(oldDuration, newDuration, timeGain) {',
    '    return timeGain > 0;',
    '}',
  ],
};

export const COURSE_SCHEDULE_STAGE3_LINES = {
  entry: { java: 2, cpp: 2, python: 2, javascript: 2 },
  assertGain: { java: 4, cpp: 3, python: 3, javascript: 3 },
};

// ==========================================
// 6. 连接棒材的最低费用 (Minimum Cost to Connect Sticks)
// ==========================================

export const CONNECT_STICKS_STAGE1_CODES: Record<string, string[]> = {
  java: [
    'public int connectSticksBrute(int[] sticks) {',
    '    // 暴力穷举所有二叉合并顺序',
    '    List<Integer> list = new ArrayList<>();',
    '    for (int x : sticks) list.add(x);',
    '    return dfs(list);',
    '}',
    'private int dfs(List<Integer> list) {',
    '    if (list.size() <= 1) return 0;',
    '    int minCost = Integer.MAX_VALUE;',
    '    for (int i = 0; i < list.size(); i++) {',
    '        for (int j = i + 1; j < list.size(); j++) {',
    '            int cost = list.get(i) + list.get(j);',
    '            // 生成下一轮子集继续递归...',
    '        }',
    '    }',
    '    return minCost;',
    '}',
  ],
  cpp: [
    'int connectSticksBrute(vector<int>& sticks) {',
    '    return dfs(sticks);',
    '}',
    'int dfs(vector<int>& list) {',
    '    if (list.size() <= 1) return 0;',
    '    int minCost = INT_MAX;',
    '    for (int i = 0; i < list.size(); i++) {',
    '        for (int j = i + 1; j < list.size(); j++) {',
    '            int cost = list[i] + list[j];',
    '        }',
    '    }',
    '    return minCost;',
    '}',
  ],
  python: [
    'def connectSticksBrute(sticks: List[int]) -> int:',
    '    def dfs(arr):',
    '        if len(arr) <= 1: return 0',
    '        min_cost = float("inf")',
    '        for i in range(len(arr)):',
    '            for j in range(i + 1, len(arr)):',
    '                cost = arr[i] + arr[j]',
    '        return min_cost',
    '    return dfs(sticks)',
  ],
  javascript: [
    'function connectSticksBrute(sticks) {',
    '    function dfs(arr) {',
    '        if (arr.length <= 1) return 0;',
    '        let minCost = Infinity;',
    '        for (let i = 0; i < arr.length; i++) {',
    '            for (let j = i + 1; j < arr.length; j++) {',
    '                const cost = arr[i] + arr[j];',
    '            }',
    '        }',
    '        return minCost;',
    '    }',
    '    return dfs(sticks);',
    '}',
  ],
};

export const CONNECT_STICKS_STAGE1_LINES = {
  entry: { java: 1, cpp: 1, python: 1, javascript: 1 },
  callDfs: { java: 5, cpp: 2, python: 9, javascript: 11 },
  dfsBase: { java: 7, cpp: 5, python: 3, javascript: 3 },
  pairLoop: { java: 9, cpp: 7, python: 5, javascript: 5 },
  done: { java: 15, cpp: 12, python: 8, javascript: 10 },
};

export const CONNECT_STICKS_STAGE2_CODES: Record<string, string[]> = {
  java: [
    'public int connectSticks(int[] sticks) {',
    '    if (sticks.length <= 1) return 0;',
    '    // 小根堆贪心弹出最小两个数合并',
    '    PriorityQueue<Integer> heap = new PriorityQueue<>();',
    '    for (int x : sticks) heap.add(x);',
    '    int totalCost = 0;',
    '    while (heap.size() > 1) {',
    '        int a = heap.poll();',
    '        int b = heap.poll();',
    '        int cost = a + b;',
    '        totalCost += cost;',
    '        heap.add(cost); // 合并后的新棒放回堆中',
    '    }',
    '    return totalCost;',
    '}',
  ],
  cpp: [
    'int connectSticks(vector<int>& sticks) {',
    '    if (sticks.size() <= 1) return 0;',
    '    priority_queue<int, vector<int>, greater<int>> heap;',
    '    for (int x : sticks) heap.push(x);',
    '    int totalCost = 0;',
    '    while (heap.size() > 1) {',
    '        int a = heap.top(); heap.pop();',
    '        int b = heap.top(); heap.pop();',
    '        int cost = a + b;',
    '        totalCost += cost;',
    '        heap.push(cost);',
    '    }',
    '    return totalCost;',
    '}',
  ],
  python: [
    'def connectSticks(sticks: List[int]) -> int:',
    '    if len(sticks) <= 1: return 0',
    '    import heapq',
    '    heapq.heapify(sticks)',
    '    total_cost = 0',
    '    while len(sticks) > 1:',
    '        a = heapq.heappop(sticks)',
    '        b = heapq.heappop(sticks)',
    '        cost = a + b',
    '        total_cost += cost',
    '        heapq.heappush(sticks, cost)',
    '    return total_cost',
  ],
  javascript: [
    'function connectSticks(sticks) {',
    '    if (sticks.length <= 1) return 0;',
    '    const heap = [...sticks].sort((a, b) => a - b);',
    '    let totalCost = 0;',
    '    while (heap.length > 1) {',
    '        const a = heap.shift();',
    '        const b = heap.shift();',
    '        const cost = a + b;',
    '        totalCost += cost;',
    '        heap.push(cost);',
    '        heap.sort((a, b) => a - b);',
    '    }',
    '    return totalCost;',
    '}',
  ],
};

export const CONNECT_STICKS_STAGE2_LINES = {
  entry: { java: 1, cpp: 1, python: 1, javascript: 1 },
  guard: { java: 2, cpp: 2, python: 2, javascript: 2 },
  initHeap: { java: 5, cpp: 4, python: 4, javascript: 3 },
  loopMerge: { java: 7, cpp: 6, python: 6, javascript: 5 },
  popTwo: { java: 8, cpp: 7, python: 7, javascript: 6 },
  mergeCost: { java: 10, cpp: 9, python: 9, javascript: 8 },
  pushBack: { java: 12, cpp: 11, python: 11, javascript: 10 },
  done: { java: 14, cpp: 13, python: 12, javascript: 13 },
};

export const CONNECT_STICKS_STAGE3_CODES: Record<string, string[]> = {
  java: [
    '// 阶段3：哈夫曼深度加权反证证明',
    'public boolean verifyHuffmanDepthInvariant(int deepVal, int shallowVal, int deepLevel, int shallowLevel) {',
    '    // 反证法：若 deepVal > shallowVal，交换两节点深度后，总费用差额 delta < 0，必非最优',
    '    int delta = (deepVal - shallowVal) * (shallowLevel - deepLevel);',
    '    return delta >= 0;',
    '}',
  ],
  cpp: [
    '// 阶段3：哈夫曼深度加权反证证明',
    'bool verifyHuffmanDepthInvariant(int deepVal, int shallowVal, int deepLevel, int shallowLevel) {',
    '    int delta = (deepVal - shallowVal) * (shallowLevel - deepLevel);',
    '    return delta >= 0;',
    '}',
  ],
  python: [
    '# 阶段3：哈夫曼深度加权反证证明',
    'def verify_huffman_depth(deep_val, shallow_val, deep_level, shallow_level):',
    '    delta = (deep_val - shallow_val) * (shallow_level - deep_level)',
    '    return delta >= 0',
  ],
  javascript: [
    '// 阶段3：哈夫曼深度加权反证证明',
    'function verifyHuffmanDepthInvariant(deepVal, shallowVal, deepLevel, shallowLevel) {',
    '    const delta = (deepVal - shallowVal) * (shallowLevel - deepLevel);',
    '    return delta >= 0;',
    '}',
  ],
};

export const CONNECT_STICKS_STAGE3_LINES = {
  entry: { java: 2, cpp: 2, python: 2, javascript: 2 },
  computeDelta: { java: 4, cpp: 3, python: 3, javascript: 3 },
  done: { java: 5, cpp: 4, python: 4, javascript: 4 },
};
