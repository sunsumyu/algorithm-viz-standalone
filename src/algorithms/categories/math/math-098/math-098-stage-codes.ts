/**
 * 左神算法通关课 第 098 课 - 快速幂与矩阵快速幂代码与相对行号映射
 */

// 1. 二进制快速幂
export const QUICK_POWER_CODES: Record<string, string[]> = {
  java: [
    'public class QuickPower {',
    '    public static long power(long a, long b, long mod) {',
    '        long ans = 1;',
    '        while (b > 0) {',
    '            if ((b & 1) == 1) ans = (ans * a) % mod;',
    '            a = (a * a) % mod;',
    '            b >>= 1;',
    '        }',
    '        return ans;',
    '    }',
    '}',
  ],
  cpp: [
    'long long power(long long a, long long b, long long mod) {',
    '    long long ans = 1;',
    '    while (b > 0) {',
    '        if (b & 1) ans = (ans * a) % mod;',
    '        a = (a * a) % mod;',
    '        b >>= 1;',
    '    }',
    '    return ans;',
    '}',
  ],
  python: [
    'def quick_power(a: int, b: int, mod: int) -> int:',
    '    ans = 1',
    '    while b > 0:',
    '        if b & 1:',
    '            ans = (ans * a) % mod',
    '        a = (a * a) % mod',
    '        b >>= 1',
    '    return ans',
  ],
  javascript: [
    'function quickPower(a, b, mod) {',
    '    let ans = 1n;',
    '    let base = BigInt(a), exp = BigInt(b), m = BigInt(mod);',
    '    while (exp > 0n) {',
    '        if (exp & 1n) ans = (ans * base) % m;',
    '        base = (base * base) % m;',
    '        exp >>= 1n;',
    '    }',
    '    return Number(ans);',
    '}',
  ],
};

export const QUICK_POWER_LINES = {
  entry: { java: 2, cpp: 1, python: 1, javascript: 1 },
  initAns: { java: 3, cpp: 2, python: 2, javascript: 2 },
  whileLoop: { java: 4, cpp: 3, python: 3, javascript: 4 },
  accumulate: { java: 5, cpp: 4, python: 5, javascript: 5 },
  squareBase: { java: 6, cpp: 5, python: 6, javascript: 6 },
  shiftExp: { java: 7, cpp: 6, python: 7, javascript: 7 },
  returnAns: { java: 9, cpp: 8, python: 8, javascript: 9 },
};

// 2. 斐波那契矩阵快速幂
export const FIBONACCI_MATRIX_CODES: Record<string, string[]> = {
  java: [
    'public class FibonacciMatrix {',
    '    public static int fib(int n) {',
    '        if (n <= 0) return 0;',
    '        if (n <= 2) return 1;',
    '        int[][] base = {{1, 1}, {1, 0}};',
    '        int[][] res = matrixPower(base, n - 2);',
    '        return res[0][0] + res[1][0];',
    '    }',
    '}',
  ],
  cpp: [
    'int fib(int n) {',
    '    if (n <= 0) return 0;',
    '    if (n <= 2) return 1;',
    '    vector<vector<int>> base = {{1, 1}, {1, 0}};',
    '    auto res = matrixPower(base, n - 2);',
    '    return res[0][0] + res[1][0];',
    '}',
  ],
  python: [
    'def fib(n: int) -> int:',
    '    if n <= 0: return 0',
    '    if n <= 2: return 1',
    '    base = [[1, 1], [1, 0]]',
    '    res = matrix_power(base, n - 2)',
    '    return res[0][0] + res[1][0]',
  ],
  javascript: [
    'function fib(n) {',
    '    if (n <= 0) return 0;',
    '    if (n <= 2) return 1;',
    '    const base = [[1, 1], [1, 0]];',
    '    const res = matrixPower(base, n - 2);',
    '    return res[0][0] + res[1][0];',
    '}',
  ],
};

export const FIBONACCI_MATRIX_LINES = {
  entry: { java: 2, cpp: 1, python: 1, javascript: 1 },
  guard: { java: 4, cpp: 3, python: 3, javascript: 3 },
  initMatrix: { java: 5, cpp: 4, python: 4, javascript: 4 },
  powerCompute: { java: 6, cpp: 5, python: 5, javascript: 5 },
  returnAns: { java: 7, cpp: 6, python: 6, javascript: 6 },
};

// 3. 爬楼梯矩阵快速幂
export const CLIMBING_STAIRS_CODES: Record<string, string[]> = {
  java: [
    'public class ClimbingStairs {',
    '    public static int climbStairs(int n) {',
    '        if (n <= 2) return n;',
    '        int[][] base = {{1, 1}, {1, 0}};',
    '        int[][] res = matrixPower(base, n - 2);',
    '        return 2 * res[0][0] + res[1][0];',
    '    }',
    '}',
  ],
  cpp: [
    'int climbStairs(int n) {',
    '    if (n <= 2) return n;',
    '    vector<vector<int>> base = {{1, 1}, {1, 0}};',
    '    auto res = matrixPower(base, n - 2);',
    '    return 2 * res[0][0] + res[1][0];',
    '}',
  ],
  python: [
    'def climb_stairs(n: int) -> int:',
    '    if n <= 2: return n',
    '    base = [[1, 1], [1, 0]]',
    '    res = matrix_power(base, n - 2)',
    '    return 2 * res[0][0] + res[1][0]',
  ],
  javascript: [
    'function climbStairs(n) {',
    '    if (n <= 2) return n;',
    '    const base = [[1, 1], [1, 0]];',
    '    const res = matrixPower(base, n - 2);',
    '    return 2 * res[0][0] + res[1][0];',
    '}',
  ],
};

export const CLIMBING_STAIRS_LINES = {
  entry: { java: 2, cpp: 1, python: 1, javascript: 1 },
  guard: { java: 3, cpp: 2, python: 2, javascript: 2 },
  initMatrix: { java: 4, cpp: 3, python: 3, javascript: 3 },
  powerCompute: { java: 5, cpp: 4, python: 4, javascript: 4 },
  returnAns: { java: 6, cpp: 5, python: 5, javascript: 6 },
};

// 4. 泰波那契数矩阵快速幂
export const TRIBONACCI_MATRIX_CODES: Record<string, string[]> = {
  java: [
    'public class TribonacciMatrix {',
    '    public static int tribonacci(int n) {',
    '        if (n == 0) return 0;',
    '        if (n <= 2) return 1;',
    '        int[][] base = {{1, 1, 0}, {1, 0, 1}, {1, 0, 0}};',
    '        int[][] res = matrixPower(base, n - 2);',
    '        return res[0][0] + res[1][0];',
    '    }',
    '}',
  ],
  cpp: [
    'int tribonacci(int n) {',
    '    if (n == 0) return 0;',
    '    if (n <= 2) return 1;',
    '    vector<vector<int>> base = {{1, 1, 0}, {1, 0, 1}, {1, 0, 0}};',
    '    auto res = matrixPower(base, n - 2);',
    '    return res[0][0] + res[1][0];',
    '}',
  ],
  python: [
    'def tribonacci(n: int) -> int:',
    '    if n == 0: return 0',
    '    if n <= 2: return 1',
    '    base = [[1, 1, 0], [1, 0, 1], [1, 0, 0]]',
    '    res = matrix_power(base, n - 2)',
    '    return res[0][0] + res[1][0]',
  ],
  javascript: [
    'function tribonacci(n) {',
    '    if (n === 0) return 0;',
    '    if (n <= 2) return 1;',
    '    const base = [[1, 1, 0], {1, 0, 1}, {1, 0, 0}];',
    '    const res = matrixPower(base, n - 2);',
    '    return res[0][0] + res[1][0];',
    '}',
  ],
};

export const TRIBONACCI_MATRIX_LINES = {
  entry: { java: 2, cpp: 1, python: 1, javascript: 1 },
  guard: { java: 4, cpp: 3, python: 3, javascript: 3 },
  initMatrix: { java: 5, cpp: 4, python: 4, javascript: 4 },
  powerCompute: { java: 6, cpp: 5, python: 5, javascript: 5 },
  returnAns: { java: 7, cpp: 6, python: 6, javascript: 6 },
};

// 5. 多米诺和托米诺平铺矩阵快速幂
export const DOMINO_TROMINO_CODES: Record<string, string[]> = {
  java: [
    'public class DominoTromino {',
    '    public static int numTilings(int n) {',
    '        if (n <= 2) return n;',
    '        if (n == 3) return 5;',
    '        int[][] base = {{2, 1, 0}, {0, 0, 1}, {1, 0, 0}};',
    '        int[][] res = matrixPower(base, n - 3);',
    '        return (int)((5L * res[0][0] + 2L * res[1][0] + 1L * res[2][0]) % 1000000007);',
    '    }',
    '}',
  ],
  cpp: [
    'int numTilings(int n) {',
    '    if (n <= 2) return n;',
    '    if (n == 3) return 5;',
    '    vector<vector<int>> base = {{2, 1, 0}, {0, 0, 1}, {1, 0, 0}};',
    '    auto res = matrixPower(base, n - 3);',
    '    return (5LL * res[0][0] + 2LL * res[1][0] + 1LL * res[2][0]) % 1000000007;',
    '}',
  ],
  python: [
    'def num_tilings(n: int) -> int:',
    '    if n <= 2: return n',
    '    if n == 3: return 5',
    '    base = [[2, 1, 0], [0, 0, 1], [1, 0, 0]]',
    '    res = matrix_power(base, n - 3)',
    '    return (5 * res[0][0] + 2 * res[1][0] + 1 * res[2][0]) % 1000000007',
  ],
  javascript: [
    'function numTilings(n) {',
    '    if (n <= 2) return n;',
    '    if (n === 3) return 5;',
    '    const base = [[2, 1, 0], [0, 0, 1], [1, 0, 0]];',
    '    const res = matrixPower(base, n - 3);',
    '    return (5 * res[0][0] + 2 * res[1][0] + 1 * res[2][0]) % 1000000007;',
    '}',
  ],
};

export const DOMINO_TROMINO_LINES = {
  entry: { java: 2, cpp: 1, python: 1, javascript: 1 },
  guard: { java: 4, cpp: 3, python: 3, javascript: 3 },
  initMatrix: { java: 5, cpp: 4, python: 4, javascript: 4 },
  powerCompute: { java: 6, cpp: 5, python: 5, javascript: 5 },
  returnAns: { java: 7, cpp: 6, python: 6, javascript: 6 },
};

// 6. 元音排列矩阵快速幂
export const COUNT_VOWELS_CODES: Record<string, string[]> = {
  java: [
    'public class CountVowels {',
    '    public static int countVowelPermutation(int n) {',
    '        if (n == 1) return 5;',
    '        int[][] base = {',
    '            {0, 1, 0, 0, 0},',
    '            {1, 0, 1, 0, 0},',
    '            {1, 1, 0, 1, 1},',
    '            {0, 0, 1, 0, 1},',
    '            {1, 0, 0, 0, 0}',
    '        };',
    '        int[][] res = matrixPower(base, n - 1);',
    '        return sumMatrix(res);',
    '    }',
    '}',
  ],
  cpp: [
    'int countVowelPermutation(int n) {',
    '    if (n == 1) return 5;',
    '    vector<vector<int>> base = {',
    '        {0, 1, 0, 0, 0},',
    '        {1, 0, 1, 0, 0},',
    '        {1, 1, 0, 1, 1},',
    '        {0, 0, 1, 0, 1},',
    '        {1, 0, 0, 0, 0}',
    '    };',
    '    auto res = matrixPower(base, n - 1);',
    '    return sumMatrix(res);',
    '}',
  ],
  python: [
    'def count_vowel_permutation(n: int) -> int:',
    '    if n == 1: return 5',
    '    base = [',
    '        [0, 1, 0, 0, 0],',
    '        [1, 0, 1, 0, 0],',
    '        [1, 1, 0, 1, 1],',
    '        [0, 0, 1, 0, 1],',
    '        [1, 0, 0, 0, 0]',
    '    ]',
    '    res = matrix_power(base, n - 1)',
    '    return sum_matrix(res)',
  ],
  javascript: [
    'function countVowelPermutation(n) {',
    '    if (n === 1) return 5;',
    '    const base = [',
    '        [0, 1, 0, 0, 0],',
    '        [1, 0, 1, 0, 0],',
    '        [1, 1, 0, 1, 1],',
    '        [0, 0, 1, 0, 1],',
    '        [1, 0, 0, 0, 0]',
    '    ];',
    '    const res = matrixPower(base, n - 1);',
    '    return sumMatrix(res);',
    '}',
  ],
};

export const COUNT_VOWELS_LINES = {
  entry: { java: 2, cpp: 1, python: 1, javascript: 1 },
  guard: { java: 3, cpp: 2, python: 2, javascript: 2 },
  initMatrix: { java: 11, cpp: 10, python: 9, javascript: 10 },
  powerCompute: { java: 12, cpp: 11, python: 10, javascript: 11 },
  returnAns: { java: 13, cpp: 12, python: 11, javascript: 12 },
};

// 7. 出勤记录 II 矩阵快速幂
export const ATTENDANCE_RECORD_CODES: Record<string, string[]> = {
  java: [
    'public class AttendanceRecordII {',
    '    public static int checkRecord(int n) {',
    '        if (n == 1) return 3;',
    '        int[][] base = {',
    '            {1, 1, 0, 1, 0, 0},',
    '            {1, 0, 1, 1, 0, 0},',
    '            {1, 0, 0, 1, 0, 0},',
    '            {0, 0, 0, 1, 1, 0},',
    '            {0, 0, 0, 1, 0, 1},',
    '            {0, 0, 0, 1, 0, 0}',
    '        };',
    '        int[][] res = matrixPower(base, n);',
    '        return res[0][0];',
    '    }',
    '}',
  ],
  cpp: [
    'int checkRecord(int n) {',
    '    if (n == 1) return 3;',
    '    vector<vector<int>> base = {',
    '        {1, 1, 0, 1, 0, 0},',
    '        {1, 0, 1, 1, 0, 0},',
    '        {1, 0, 0, 1, 0, 0},',
    '        {0, 0, 0, 1, 1, 0},',
    '        {0, 0, 0, 1, 0, 1},',
    '        {0, 0, 0, 1, 0, 0}',
    '    };',
    '    auto res = matrixPower(base, n);',
    '    return res[0][0];',
    '}',
  ],
  python: [
    'def check_record(n: int) -> int:',
    '    if n == 1: return 3',
    '    base = [',
    '        [1, 1, 0, 1, 0, 0],',
    '        [1, 0, 1, 1, 0, 0],',
    '        [1, 0, 0, 1, 0, 0],',
    '        [0, 0, 0, 1, 1, 0],',
    '        [0, 0, 0, 1, 0, 1],',
    '        [0, 0, 0, 1, 0, 0]',
    '    ]',
    '    res = matrix_power(base, n)',
    '    return res[0][0]',
  ],
  javascript: [
    'function checkRecord(n) {',
    '    if (n === 1) return 3;',
    '    const base = [',
    '        [1, 1, 0, 1, 0, 0],',
    '        [1, 0, 1, 1, 0, 0],',
    '        [1, 0, 0, 1, 0, 0],',
    '        [0, 0, 0, 1, 1, 0],',
    '        [0, 0, 0, 1, 0, 1],',
    '        [0, 0, 0, 1, 0, 0]',
    '    ];',
    '    const res = matrixPower(base, n);',
    '    return res[0][0];',
    '}',
  ],
};

export const ATTENDANCE_RECORD_LINES = {
  entry: { java: 2, cpp: 1, python: 1, javascript: 1 },
  guard: { java: 3, cpp: 2, python: 2, javascript: 2 },
  initMatrix: { java: 12, cpp: 11, python: 10, javascript: 11 },
  powerCompute: { java: 13, cpp: 12, python: 11, javascript: 12 },
  returnAns: { java: 14, cpp: 13, python: 12, javascript: 13 },
};
