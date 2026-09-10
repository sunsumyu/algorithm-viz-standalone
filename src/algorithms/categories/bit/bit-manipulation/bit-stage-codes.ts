/**
 * 左神算法通关课 第 030 ~ 033 课 - 位运算神技代码与相对行号映射
 */

// 1. 位运算核心神技
export const BIT_TRICKS_CODES: Record<string, string[]> = {
  java: [
    'public class BitTricks {',
    '    public static int extractRightOne(int x) {',
    '        return x & (-x);',
    '    }',
    '    public static int clearRightOne(int x) {',
    '        return x & (x - 1);',
    '    }',
    '    public static boolean isPowerOfTwo(int x) {',
    '        return x > 0 && (x & (x - 1)) == 0;',
    '    }',
    '}',
  ],
  cpp: [
    'int extractRightOne(int x) {',
    '    return x & (-x);',
    '}',
    'int clearRightOne(int x) {',
    '    return x & (x - 1);',
    '}',
    'bool isPowerOfTwo(int x) {',
    '    return x > 0 && (x & (x - 1)) == 0;',
    '}',
  ],
  python: [
    'def extract_right_one(x: int) -> int:',
    '    return x & (-x)',
    'def clear_right_one(x: int) -> int:',
    '    return x & (x - 1)',
    'def is_power_of_two(x: int) -> bool:',
    '    return x > 0 and (x & (x - 1)) == 0',
  ],
  javascript: [
    'function extractRightOne(x) {',
    '    return x & (-x);',
    '}',
    'function clearRightOne(x) {',
    '    return x & (x - 1);',
    '}',
    'function isPowerOfTwo(x) {',
    '    return x > 0 && (x & (x - 1)) === 0;',
    '}',
  ],
};

export const BIT_TRICKS_LINES = {
  entry: { java: 2, cpp: 1, python: 1, javascript: 1 },
  extract: { java: 3, cpp: 2, python: 2, javascript: 2 },
  clear: { java: 6, cpp: 5, python: 4, javascript: 5 },
  power2: { java: 9, cpp: 8, python: 6, javascript: 8 },
};

// 2. 只出现一次的数字 II
export const SINGLE_NUMBER_II_CODES: Record<string, string[]> = {
  java: [
    'public class SingleNumberII {',
    '    public static int singleNumber(int[] nums) {',
    '        int ones = 0, twos = 0;',
    '        for (int num : nums) {',
    '            ones = (ones ^ num) & ~twos;',
    '            twos = (twos ^ num) & ~ones;',
    '        }',
    '        return ones;',
    '    }',
    '}',
  ],
  cpp: [
    'int singleNumber(vector<int>& nums) {',
    '    int ones = 0, twos = 0;',
    '    for (int num : nums) {',
    '        ones = (ones ^ num) & ~twos;',
    '        twos = (twos ^ num) & ~ones;',
    '    }',
    '    return ones;',
    '}',
  ],
  python: [
    'def single_number(nums: list[int]) -> int:',
    '    ones, twos = 0, 0',
    '    for num in nums:',
    '        ones = (ones ^ num) & ~twos',
    '        twos = (twos ^ num) & ~ones',
    '    return ones',
  ],
  javascript: [
    'function singleNumber(nums) {',
    '    let ones = 0, twos = 0;',
    '    for (const num of nums) {',
    '        ones = (ones ^ num) & ~twos;',
    '        twos = (twos ^ num) & ~ones;',
    '    }',
    '    return ones;',
    '}',
  ],
};

export const SINGLE_NUMBER_II_LINES = {
  entry: { java: 2, cpp: 1, python: 1, javascript: 1 },
  initVars: { java: 3, cpp: 2, python: 2, javascript: 2 },
  loopHeader: { java: 4, cpp: 3, python: 3, javascript: 3 },
  updateState: { java: 5, cpp: 4, python: 4, javascript: 4 },
  returnAns: { java: 8, cpp: 7, python: 6, javascript: 7 },
};

// 3. 只出现一次的数字 III
export const SINGLE_NUMBER_III_CODES: Record<string, string[]> = {
  java: [
    'public class SingleNumberIII {',
    '    public static int[] singleNumber(int[] nums) {',
    '        int xor = 0;',
    '        for (int num : nums) xor ^= num;',
    '        int diff = xor & (-xor);',
    '        int a = 0, b = 0;',
    '        for (int num : nums) {',
    '            if ((num & diff) != 0) a ^= num;',
    '            else b ^= num;',
    '        }',
    '        return new int[]{a, b};',
    '    }',
    '}',
  ],
  cpp: [
    'vector<int> singleNumber(vector<int>& nums) {',
    '    int xorVal = 0;',
    '    for (int num : nums) xorVal ^= num;',
    '    long long diff = (long long)xorVal & (-(long long)xorVal);',
    '    int a = 0, b = 0;',
    '    for (int num : nums) {',
    '        if (num & diff) a ^= num;',
    '        else b ^= num;',
    '    }',
    '    return {a, b};',
    '}',
  ],
  python: [
    'def single_number_iii(nums: list[int]) -> list[int]:',
    '    xor_val = 0',
    '    for num in nums: xor_val ^= num',
    '    diff = xor_val & (-xor_val)',
    '    a, b = 0, 0',
    '    for num in nums:',
    '        if num & diff: a ^= num',
    '        else: b ^= num',
    '    return [a, b]',
  ],
  javascript: [
    'function singleNumberIII(nums) {',
    '    let xor = 0;',
    '    for (const num of nums) xor ^= num;',
    '    const diff = xor & (-xor);',
    '    let a = 0, b = 0;',
    '    for (const num of nums) {',
    '        if ((num & diff) !== 0) a ^= num;',
    '        else b ^= num;',
    '    }',
    '    return [a, b];',
    '}',
  ],
};

export const SINGLE_NUMBER_III_LINES = {
  entry: { java: 2, cpp: 1, python: 1, javascript: 1 },
  totalXor: { java: 4, cpp: 3, python: 3, javascript: 3 },
  findDiff: { java: 5, cpp: 4, python: 4, javascript: 4 },
  groupSplit: { java: 8, cpp: 7, python: 7, javascript: 7 },
  returnAns: { java: 11, cpp: 10, python: 9, javascript: 10 },
};

// 4. 位图结构设计与实现
export const BITSET_ARRAY_CODES: Record<string, string[]> = {
  java: [
    'public class BitsetArray {',
    '    public static boolean contains(int[] bits, int num) {',
    '        int bucket = num >> 5;',
    '        int bit = num & 31;',
    '        return (bits[bucket] & (1 << bit)) != 0;',
    '    }',
    '    public static void add(int[] bits, int num) {',
    '        bits[num >> 5] |= (1 << (num & 31));',
    '    }',
    '}',
  ],
  cpp: [
    'bool contains(vector<int>& bits, int num) {',
    '    int bucket = num >> 5;',
    '    int bit = num & 31;',
    '    return (bits[bucket] & (1 << bit)) != 0;',
    '}',
    'void add(vector<int>& bits, int num) {',
    '    bits[num >> 5] |= (1 << (num & 31));',
    '}',
  ],
  python: [
    'def contains(bits: list[int], num: int) -> bool:',
    '    bucket = num >> 5',
    '    bit = num & 31',
    '    return (bits[bucket] & (1 << bit)) != 0',
    'def add(bits: list[int], num: int) -> None:',
    '    bits[num >> 5] |= (1 << (num & 31))',
  ],
  javascript: [
    'function contains(bits, num) {',
    '    const bucket = num >> 5;',
    '    const bit = num & 31;',
    '    return (bits[bucket] & (1 << bit)) !== 0;',
    '}',
    'function add(bits, num) {',
    '    bits[num >> 5] |= (1 << (num & 31));',
    '}',
  ],
};

export const BITSET_ARRAY_LINES = {
  entry: { java: 2, cpp: 1, python: 1, javascript: 1 },
  calcLoc: { java: 4, cpp: 3, python: 3, javascript: 3 },
  checkBit: { java: 5, cpp: 4, python: 4, javascript: 4 },
  addBit: { java: 8, cpp: 7, python: 6, javascript: 7 },
};
