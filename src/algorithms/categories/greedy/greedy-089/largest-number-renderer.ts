/**
 * 最大数 (LeetCode 179) - 声明式教学级沙盘渲染器
 * 核心贪心：自定义字典序拼接排序 (b + a).compareTo(a + b) 与前导 0 特判
 * 三阶段：
 *   阶段 1: 全排列暴力对比 (Brute-Force)
 *   阶段 2: 贪心拼接排序推演 (Greedy)
 *   阶段 3: 邻项交换法反证证明 (Proof)
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { GREEDY_089_PROBLEMS } from './greedy-089-problem-content';
import {
  LARGEST_NUMBER_STAGE1_CODES,
  LARGEST_NUMBER_STAGE1_LINES,
  LARGEST_NUMBER_STAGE2_CODES,
  LARGEST_NUMBER_STAGE2_LINES,
  LARGEST_NUMBER_STAGE3_CODES,
  LARGEST_NUMBER_STAGE3_LINES,
} from './greedy-089-stage-codes';
import {
  Greedy089Step,
  renderDecisionBalance,
  BalanceComparisonDef,
} from './greedy-089-shared';

export interface LargestNumberStep extends Greedy089Step {
  currentArray: string[];
  comparingPair?: [string, string];
  balance?: BalanceComparisonDef;
  finalAns?: string;
  isZeroGuard?: boolean;
}

// ==========================================
// 1. 阶段 1：暴力全排列步进生成器
// ==========================================
export function buildLargestNumberStage1Steps(nums: number[]): LargestNumberStep[] {
  const steps: LargestNumberStep[] = [];
  const lines = LARGEST_NUMBER_STAGE1_LINES;
  const strNums = nums.map(String);

  // Step 0: 入口
  steps.push({
    currentArray: [...strNums],
    decision: `主函数入口：接收输入数组 nums=[${nums.join(', ')}]，准备全排列暴搜`,
    message: `尝试枚举所有 ${nums.length}! 种排列并找出字典序最大拼接串`,
    log: `enter largestNumberBrute(nums=[${nums.join(',')}])`,
    codeLine: lines.entry,
  });

  // Step 1: 初始化
  steps.push({
    currentArray: [...strNums],
    decision: '初始化结果列表 list 与当前最大串 maxStr="0"',
    message: '准备进入全排列回溯生成器',
    log: 'init list = []',
    codeLine: lines.init,
  });

  // 全排列回溯
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

  // 收敛
  steps.push({
    currentArray: [...strNums],
    decision: `🎉 暴力枚举完成！全局最大数字符串为 "${maxStr}"`,
    message: `总共比较了 ${allPerms.length} 种排列`,
    log: `done result="${maxStr}"`,
    codeLine: lines.done,
    finalAns: maxStr,
  });

  return steps;
}

// ==========================================
// 2. 阶段 2：贪心排序推演步进生成器
// ==========================================
export function buildLargestNumberStage2Steps(nums: number[]): LargestNumberStep[] {
  const steps: LargestNumberStep[] = [];
  const lines = LARGEST_NUMBER_STAGE2_LINES;
  const strs = nums.map(String);

  // Step 0: 入口
  steps.push({
    currentArray: [...strs],
    decision: `主函数入口：接收输入数组 nums=[${nums.join(', ')}]，准备贪心拼接排序`,
    message: `贪心准则：对于任意 a 和 b，若 (b+a) > (a+b)，则 b 应排在 a 前面`,
    log: `enter largestNumber(nums=[${nums.join(',')}])`,
    codeLine: lines.entry,
  });

  // Step 1: 转为字符串数组
  steps.push({
    currentArray: [...strs],
    decision: `将数字数组转为字符串列表: [${strs.map((s) => `"${s}"`).join(', ')}]`,
    message: '为了方便拼接比较与防止整数上溢，统一以字符串形态处理',
    log: 'convert nums to string array',
    codeLine: lines.convert,
  });

  // 排序过程仿真（冒泡展示逐对决策天平）
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
        });
      }
    }
  }

  // 特判前导 0
  const isZero = arr[0] === '0';
  steps.push({
    currentArray: [...arr],
    decision: isZero ? '特判触发：排序后首位为 "0"，说明所有数均为 0，直接返回 "0"' : '首位不为 "0"，合法大数无需前导零截断',
    message: isZero ? '防止返回 "0000" 等不规范数字串' : `首位为 "${arr[0]}"`,
    log: `check leading zero: arr[0]="${arr[0]}"`,
    codeLine: lines.zeroGuard,
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
    finalAns: result,
  });

  steps.push({
    currentArray: [...arr],
    decision: `🎉 贪心排序构建完成！最终最大数字符串为 "${result}"`,
    message: `算法时间复杂度降为 O(N log N)`,
    log: `done result="${result}"`,
    codeLine: lines.done,
    finalAns: result,
  });

  return steps;
}

// ==========================================
// 3. 阶段 3：邻项交换反证证明步进生成器
// ==========================================
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
    finalAns: needSwap ? b + a : a + b,
  });

  return steps;
}

// ==========================================
// 4. 声明式可视化器配置
// ==========================================
const { template, Visualizer } = createDeclarativeVisualizer<LargestNumberStep>({
  id: 'largest-number',
  name: '最大数 (Largest Number)',
  category: 'greedy',
  icon: '🔢',
  badge: {
    mode: '拼接排序贪心',
    complexity: 'O(N log N) · O(N)',
  },
  card1Title: '🎴 数字卡片排序与当前序列沙盘',
  card2Title: '⚖️ 贪心拼接天平与反证对比',
  card2Desc: '展示 (b+a) 与 (a+b) 拼接结果的比对天平与前导 0 校验',
  legend: [
    { label: '考察元素对', color: '#3b82f6' },
    { label: '优选高位前移', color: '#10b981' },
    { label: '常规元素', color: '#64748b' },
  ],
  inputs: [
    {
      id: 'input-nums',
      label: '输入数组',
      type: 'text',
      defaultValue: '10, 2',
      width: '160px',
      placeholder: '以逗号分隔非负整数',
    },
  ],
  presets: [
    { label: '示例 1: [10, 2]', values: { 'input-nums': '10, 2' } },
    { label: '示例 2: [3, 30, 34, 5, 9]', values: { 'input-nums': '3, 30, 34, 5, 9' } },
    { label: '全零特判: [0, 0]', values: { 'input-nums': '0, 0' } },
  ],
  metrics: [
    { id: 'array-len', label: '元素个数', color: '#64748b' },
    { id: 'current-max', label: '当前最高位', color: '#3b82f6' },
    { id: 'final-ans', label: '最大数结果', color: '#10b981' },
  ],
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力穷举对比',
      shortName: '暴力穷举',
      card2Desc: '生成所有 N! 种排列串，展示阶乘级时间复杂度与排列爆炸',
      codeLanguages: LARGEST_NUMBER_STAGE1_CODES,
      buildSteps: (inputs) => {
        const raw = String(inputs?.['input-nums'] || '10, 2');
        const nums = raw.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
        return buildLargestNumberStage1Steps(nums.slice(0, 5)); // 暴力防超容限制
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 贪心拼接推演',
      shortName: '贪心排序',
      card2Desc: '按 (b+a) > (a+b) 规则排序，展示前导 0 特判与拼接成最大数过程',
      codeLanguages: LARGEST_NUMBER_STAGE2_CODES,
      buildSteps: (inputs) => {
        const raw = String(inputs?.['input-nums'] || '10, 2');
        const nums = raw.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
        return buildLargestNumberStage2Steps(nums);
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: 邻项交换法证明',
      shortName: '贪心证明',
      card2Desc: '代数证明任意相邻逆序对交换必导致数值增加，贪心解收敛至全局最优',
      codeLanguages: LARGEST_NUMBER_STAGE3_CODES,
      buildSteps: (inputs) => {
        const raw = String(inputs?.['input-nums'] || '10, 2');
        const nums = raw.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
        return buildLargestNumberStage3Steps(nums);
      },
    },
  ],
  codeLanguages: LARGEST_NUMBER_STAGE2_CODES,
  problemHtml: GREEDY_089_PROBLEMS.largestNumber.html,
  analysisHtml: `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #334155;">
      <h3 style="color: #0f172a; margin-top: 0;">🧠 贪心策略深度解析</h3>
      <p><b>为什么不能单纯按数值大小或字符串字典序排序？</b></p>
      <p>反例：考虑 <code>3</code> 和 <code>30</code>。按字典序 <code>"30" &gt; "3"</code>，若拼成 <code>"303"</code>，而实际上 <code>"330" &gt; "303"</code>！因此必须比较 <code>"3" + "30" ("330")</code> 和 <code>"30" + "3" ("303")</code>。</p>
      <p><b>全序关系验证：</b></p>
      <p>贪心比较规则不仅直观，而且在数学上严格满足：</p>
      <ol>
        <li><b>完全性</b>：任意两数均可比对；</li>
        <li><b>反对称性</b>：若 $a+b \ge b+a$ 且 $b+a \ge a+b$，则 $a+b = b+a$；</li>
        <li><b>传递性</b>：若 $a+b \ge b+a$ 且 $b+c \ge c+b$，则必有 $a+c \ge c+a$。</li>
      </ol>
      <p>因此该比较规则构成了合法的全序集，任何基于比较的排序算法（如快速排序、归并排序）均能正确收敛。</p>
    </div>
  `,
  buildSteps: (inputs) => {
    const raw = String(inputs?.['input-nums'] || '10, 2');
    const nums = raw.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
    return buildLargestNumberStage2Steps(nums);
  },
  renderCanvas: (container, step) => {
    const arr = step.currentArray || [];
    const pair = step.comparingPair;

    const cardsHtml = arr
      .map((item, idx) => {
        const isPair = pair && (pair[0] === item || pair[1] === item);
        const bg = isPair ? '#eff6ff' : '#ffffff';
        const border = isPair ? '#3b82f6' : '#cbd5e1';
        const textColor = isPair ? '#1d4ed8' : '#1e293b';

        return `
          <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
            <div style="min-width: 50px; height: 48px; padding: 0 10px; border-radius: 8px; background: ${bg}; border: 2px solid ${border}; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-weight: 800; font-size: 16px; color: ${textColor}; box-shadow: 0 2px 4px rgba(0,0,0,0.06);">
              ${item}
            </div>
            <span style="font-size: 10px; color: #94a3b8; font-family: 'JetBrains Mono', monospace;">下标[${idx}]</span>
          </div>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; gap: 14px; box-sizing: border-box; justify-content: center;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
          <span style="font-size: 12px; font-weight: 700; color: #475569;">当前数字卡片排列状态</span>
          <span style="font-size: 11px; color: #10b981; font-weight: 600;">已形成结果: ${step.finalAns || '推演中...'}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap; justify-content: center; padding: 10px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
          ${cardsHtml}
        </div>
      </div>
    `;
  },
  renderCustomMetrics: (container, step) => {
    if (step.balance) {
      renderDecisionBalance(container, step.balance, '拼接字典序比对');
    } else {
      container.innerHTML = `
        <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 12px; font-style: italic;">
          ${step.message || '等待下一步操作'}
        </div>
      `;
    }
  },
});

export const LargestNumberVisualizer = Visualizer;

registerAlgorithm({
  id: 'largest-number',
  name: '最大数 (Largest Number)',
  viewId: 'algo-largest-number-view',
  category: 'greedy',
  description: '左程云算法讲解089 Code01：LeetCode 179 最大数，自定义字符串拼接比较器贪心排序与前导0特判',
  icon: '🔢',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 891,
  learningGoal: '掌握自定义拼接比较器 (b+a).compareTo(a+b) 的全序性证明与邻项交换法反证逻辑',
});
