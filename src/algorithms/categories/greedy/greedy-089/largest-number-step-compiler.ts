import {
  LARGEST_NUMBER_STAGE1_LINES,
  LARGEST_NUMBER_STAGE2_LINES,
  LARGEST_NUMBER_STAGE3_LINES,
} from './greedy-089-stage-codes';
import {
  Greedy089Step,
  BalanceComparisonDef,
} from './greedy-089-shared';

export interface LargestNumberStep extends Greedy089Step {
  currentArray: string[];
  comparingPair?: [string, string];
  balance?: BalanceComparisonDef;
  finalAns?: string;
  isZeroGuard?: boolean;
}

export function buildLargestNumberStage1Steps(nums: number[]): LargestNumberStep[] {
  const steps: LargestNumberStep[] = [];
  const lines = LARGEST_NUMBER_STAGE1_LINES;
  const strNums = nums.map(String);

  steps.push({
    currentArray: [...strNums],
    decision: `主函数入口：接收输入数组 nums=[${nums.join(', ')}]，准备全排列暴搜`,
    message: `尝试枚举所有 ${nums.length}! 种排列并找出字典序最大拼接串`,
    log: `enter largestNumberBrute(nums=[${nums.join(',')}])`,
    codeLine: lines.entry,
    line: lines.entry?.java ?? 1,
  });

  steps.push({
    currentArray: [...strNums],
    decision: '初始化结果列表 list 与当前最大串 maxStr="0"',
    message: '准备进入全排列回溯生成器',
    log: 'init list = []',
    codeLine: lines.init,
    line: lines.init?.java ?? 2,
  });

  const allPerms: string[] = [];
  function permute(arr: string[], l: number) {
    if (l === arr.length) {
      allPerms.push(arr.join(''));
      return;
    }
    for (let i = l; i < arr.length; i++) {
      [arr[l], arr[i]] = [arr[i], arr[l]];
      permute(arr, l + 1);
      [arr[l], arr[i]] = [arr[i], arr[l]];
    }
  }
  permute([...strNums], 0);

  steps.push({
    currentArray: [...strNums],
    decision: `全排列穷举完成：共生成 ${allPerms.length} 种拼接形态`,
    message: `全部形态: [${allPerms.slice(0, 6).join(', ')}${allPerms.length > 6 ? '...' : ''}]`,
    log: `generated ${allPerms.length} permutations`,
    codeLine: lines.permute,
    line: lines.permute?.java ?? 3,
  });

  let maxStr = '0';
  for (let i = 0; i < allPerms.length; i++) {
    const cur = allPerms[i];
    const isNewMax = cur.localeCompare(maxStr) > 0;
    const prevMax = maxStr;
    if (isNewMax) maxStr = cur;

    steps.push({
      currentArray: [...strNums],
      decision: `比对排列 #${i + 1} "${cur}" 与当前最大值 "${prevMax}" ➔ ${isNewMax ? '刷新最大值' : '保持原值'}`,
      message: `当前最佳拼接结果: "${maxStr}"`,
      log: `compare "${cur}" with "${prevMax}" -> ${maxStr}`,
      codeLine: isNewMax ? lines.update : lines.compareLoop,
      line: (isNewMax ? lines.update?.java : lines.compareLoop?.java) ?? 4,
      finalAns: maxStr,
      balance: {
        leftTitle: '当前考察排列',
        leftVal: cur,
        rightTitle: '历史最优值',
        rightVal: prevMax,
        winner: isNewMax ? 'left' : 'right',
        reason: isNewMax ? `"${cur}" 字典序大于 "${prevMax}"` : `"${cur}" 不大于当前最大值`,
      },
    });
  }

  steps.push({
    currentArray: [...strNums],
    decision: `🎉 暴力枚举完成！全局最大数字符串为 "${maxStr}"`,
    message: `总共比较了 ${allPerms.length} 种排列`,
    log: `done result="${maxStr}"`,
    codeLine: lines.done,
    line: lines.done?.java ?? 8,
    finalAns: maxStr,
  });

  return steps;
}

export function buildLargestNumberStage2Steps(nums: number[]): LargestNumberStep[] {
  const steps: LargestNumberStep[] = [];
  const lines = LARGEST_NUMBER_STAGE2_LINES;
  const strs = nums.map(String);

  steps.push({
    currentArray: [...strs],
    decision: `主函数入口：接收输入数组 nums=[${nums.join(', ')}]，准备贪心拼接排序`,
    message: `贪心准则：对于任意 a 和 b，若 (b+a) > (a+b)，则 b 应排在 a 前面`,
    log: `enter largestNumber(nums=[${nums.join(',')}])`,
    codeLine: lines.entry,
    line: lines.entry?.java ?? 1,
  });

  steps.push({
    currentArray: [...strs],
    decision: `将数字数组转为字符串列表: [${strs.map((s) => `"${s}"`).join(', ')}]`,
    message: '为了方便拼接比较与防止整数上溢，统一以字符串形态处理',
    log: 'convert nums to string array',
    codeLine: lines.convert,
    line: lines.convert?.java ?? 2,
  });

  const arr = [...strs];
  for (let i = 0; i < arr.length - 1; i++) {
    for (let j = 0; j < arr.length - 1 - i; j++) {
      const a = arr[j];
      const b = arr[j + 1];
      const ab = a + b;
      const ba = b + a;
      const needSwap = ba.localeCompare(ab) > 0;

      steps.push({
        currentArray: [...arr],
        comparingPair: [a, b],
        decision: `考察相邻数字 "${a}" 与 "${b}"：对比拼接 ("${b}"+"${a}"="${ba}") VS ("${a}"+"${b}"="${ab}")`,
        message: needSwap ? `ba > ab，说明 "${b}" 应该排在 "${a}" 前面，执行交换！` : `ab >= ba，当前顺序合法，无需交换`,
        log: `compare "${a}" and "${b}": ba="${ba}" vs ab="${ab}" -> ${needSwap ? 'swap' : 'keep'}`,
        codeLine: lines.sort,
        line: lines.sort?.java ?? 3,
        balance: {
          leftTitle: `(b + a): "${b}" + "${a}"`,
          leftVal: ba,
          rightTitle: `(a + b): "${a}" + "${b}"`,
          rightVal: ab,
          winner: needSwap ? 'left' : 'right',
          reason: needSwap ? `拼接结果 "${ba}" > "${ab}"，必须让 "${b}" 排在前面` : `"${ab}" >= "${ba}"，保持顺序`,
        },
      });

      if (needSwap) {
        arr[j] = b;
        arr[j + 1] = a;
        steps.push({
          currentArray: [...arr],
          comparingPair: [b, a],
          decision: `完成交换：[${arr.map((s) => `"${s}"`).join(', ')}]`,
          message: `已将高位增益更大的数字前移`,
          log: `swapped -> [${arr.join(',')}]`,
          codeLine: lines.sort,
          line: lines.sort?.java ?? 3,
        });
      }
    }
  }

  const isZero = arr[0] === '0';
  steps.push({
    currentArray: [...arr],
    decision: isZero ? '特判触发：排序后首位为 "0"，说明所有数均为 0，直接返回 "0"' : '首位不为 "0"，合法大数无需前导零截断',
    message: isZero ? '防止返回 "0000" 等不规范数字串' : `首位为 "${arr[0]}"`,
    log: `check leading zero: arr[0]="${arr[0]}"`,
    codeLine: lines.zeroGuard,
    line: lines.zeroGuard?.java ?? 4,
    isZeroGuard: isZero,
    finalAns: isZero ? '0' : undefined,
  });

  if (isZero) {
    steps.push({
      currentArray: [...arr],
      decision: '🎉 结算完成！最终最大数字符串为 "0"',
      message: '特判返回单一 0',
      log: 'done return "0"',
      codeLine: lines.done,
      line: lines.done?.java ?? 5,
      finalAns: '0',
    });
    return steps;
  }

  const result = arr.join('');
  steps.push({
    currentArray: [...arr],
    decision: `拼接所有排好序的字符串: "${result}"`,
    message: `由左至右拼接高位到低位`,
    log: `join -> "${result}"`,
    codeLine: lines.join,
    line: lines.join?.java ?? 6,
    finalAns: result,
  });

  steps.push({
    currentArray: [...arr],
    decision: `🎉 贪心排序构建完成！最终最大数字符串为 "${result}"`,
    message: `算法时间复杂度降为 O(N log N)`,
    log: `done result="${result}"`,
    codeLine: lines.done,
    line: lines.done?.java ?? 7,
    finalAns: result,
  });

  return steps;
}

export function buildLargestNumberStage3Steps(nums: number[]): LargestNumberStep[] {
  const steps: LargestNumberStep[] = [];
  const lines = LARGEST_NUMBER_STAGE3_LINES;
  const strs = nums.map(String);

  steps.push({
    currentArray: [...strs],
    decision: '阶段 3：邻项交换法 (Exchange Argument) 正确性反证判定',
    message: '数学定理：若序列中存在任意相邻逆序对 (x, y) 使得 y+x > x+y，交换它们必使整体严格变大',
    log: 'enter verifyExchangeProperty',
    codeLine: lines.entry,
    line: lines.entry?.java ?? 1,
  });

  const a = strs[0] || '10';
  const b = strs[1] || '2';
  const ab = a + b;
  const ba = b + a;
  const needSwap = ba.localeCompare(ab) > 0;

  steps.push({
    currentArray: [a, b],
    decision: `取代表性相邻元素 a="${a}", b="${b}"：计算 ab="${ab}", ba="${ba}"`,
    message: '检验局部交换对整体高低位权重的代数影响',
    log: `compute ab="${ab}", ba="${ba}"`,
    codeLine: lines.compare,
    line: lines.compare?.java ?? 2,
    balance: {
      leftTitle: `ba = "${b}" + "${a}"`,
      leftVal: ba,
      rightTitle: `ab = "${a}" + "${b}"`,
      rightVal: ab,
      winner: needSwap ? 'left' : 'right',
      reason: needSwap
        ? `"${ba}" > "${ab}"：交换前整体贡献为 A·x·10^|y| + A·y；交换后为 A·y·10^|x| + A·x，净收益 > 0！`
        : `"${ab}" >= "${ba}"：已是局部最优，交换必定劣于或等于当前顺序`,
    },
  });

  steps.push({
    currentArray: needSwap ? [b, a] : [a, b],
    decision: `反证定理成立：贪心比较器满足反对称性与传递性，全序列消除所有逆序对时必然达到全局最优！`,
    message: '全排列任意非贪心排列均可通过有限次逆序对交换提升至贪心解，故贪心解必定是全局最优解！',
    log: 'proof verified',
    codeLine: lines.done,
    line: lines.done?.java ?? 3,
    finalAns: needSwap ? b + a : a + b,
  });

  return steps;
}

export function parseLargestNumberInput(inputs: Record<string, any>, stage: number): LargestNumberStep[] {
  const raw = String(inputs?.['input-nums'] || '10, 2');
  const nums = raw
    .split(/[,，\s]+/)
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => !isNaN(n));
  const validNums = nums.length > 0 ? nums : [10, 2];

  if (stage === 1) return buildLargestNumberStage1Steps(validNums.slice(0, 5));
  if (stage === 2) return buildLargestNumberStage2Steps(validNums);
  return buildLargestNumberStage3Steps(validNums);
}
