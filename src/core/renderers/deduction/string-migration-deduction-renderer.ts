/**
 * 旋转字符串 (Rotate String · LeetCode 796) 全景推演树渲染策略
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 双倍拼接定理 (s + s) 与滑动窗口单步匹配
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';

export class StringMigrationDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'string-migration';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'string-migration' ||
      modelId === 'rotate-string' ||
      modelId === '796' ||
      modelId === 'rotate-string-796'
    );
  }

  public render(_options: StaticDeductionRenderOptions): string {
    const header = DeductionBoardPrimitives.renderHeader({
      title: '旋转字符串 (Rotate String · LeetCode 796) · 全景推演树',
      badge: 'LeetCode 796 · 字符串循环移位 · 双倍拼接定理 s+s · 滑动窗口 / KMP 子串判定',
      descriptionHtml: `
        给定两个字符串 $s$ 与 $goal$，判定是否可通过若干次循环左旋操作将 $s$ 变成 $goal$。<br/>
        <b>双倍拼接与旋转等价定理核心机制：</b><br/>
        ① <b>长度相等前提：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;旋转操作仅改变字符排列次序，绝不改变字符串总长度；若 $|s| \\ne |goal|$，直接返回 false；<br/>
        ② <b>双倍拼接定理 $(s + s)$：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;将 $s$ 自拼接得到长为 $2N$ 的字符串 $concat = s + s$。<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;对于任意位移偏移量 $k \\in [0, N-1]$，$s$ 左旋 $k$ 次后的结果恰好等于子串 $concat[k \\dots k+N-1]$！<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;因此，<b>$goal$ 可由 $s$ 旋转得到 $\\iff |s| == |goal|$ 且 $goal$ 是 $s + s$ 的子串</b>！<br/>
        ③ <b>滑动窗口与 KMP 快速验证：</b><br/>
        &nbsp;&nbsp;&nbsp;&nbsp;通过滑动窗口以步长 1 推进匹配，或使用 KMP 算法在 $O(N)$ 线性时间内定位匹配起始偏移量 $shift$。
      `,
      initialStateText: '载入源串 s="abcde"，目标串 goal="cdeab"，初始化双倍拼接串 concat="abcdeabcde"。',
    });

    const baseCase = DeductionBoardPrimitives.renderBaseCases([
      {
        prefix: '├───',
        label: '源串与目标串',
        valuesStr: 's = "abcde" (长 5), goal = "cdeab" (长 5)',
      },
      {
        prefix: '├───',
        label: '双倍拼接串',
        valuesStr: 'concat = s + s = "abcdeabcde" (长 10)',
      },
      {
        prefix: '└───',
        label: '搜索目标',
        valuesStr: '在 concat 中查找与 goal 完全一致的长度为 5 的连续子串',
      },
    ]);

    const rounds = [
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段一】长度前提核验与双倍拼接串构造',
        subtitle: '验证长度守恒律，构造容纳所有循环左旋状态的双倍自拼接串',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '长度等价性检查',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">长度相等</span>',
            detailLines: [
              '│  ① s.length = 5, goal.length = 5',
              '│  ② 满足旋转必要前提条件，继续推演',
            ],
            fillLine: '└── 长度一致，排除直接失败分支 📏',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '构建双倍串 concat = s + s',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-sky-100 text-sky-800 rounded font-bold">双倍拼接</span>',
            detailLines: [
              '│  ① concat = "abcde" + "abcde" = "abcdeabcde"',
              '│  ② 所有循环状态：shift=0("abcde"), shift=1("bcdea"), shift=2("cdeab")...',
            ],
            fillLine: '└── 构造完成，将循环移位问题等价转换为子串查找问题 🔁',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段二】滑动窗口逐位扫描与字符比对 (Window Sliding)',
        subtitle: '窗口长度固定为 N=5，沿拼接串逐位右移检验与 goal 是否相等',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'shift = 0: 窗口 [0..4] ➔ "abcde"',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">偏移 0</span>',
            detailLines: [
              '│  ① windowStr = "abcde"',
              '│  ② 与 goal="cdeab" 比对: 首字符 \'a\' ≠ \'c\'，失配！',
            ],
            fillLine: '└── shift=0 匹配失败，窗口继续滑动 ➡️',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: 'shift = 1: 窗口 [1..5] ➔ "bcdea"',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-bold">偏移 1</span>',
            detailLines: [
              '│  ① windowStr = "bcdea"',
              '│  ② 与 goal="cdeab" 比对: 首字符 \'b\' ≠ \'c\'，失配！',
            ],
            fillLine: '└── shift=1 匹配失败，窗口继续滑动 ➡️',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: 'shift = 2: 窗口 [2..6] ➔ "cdeab"',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">偏移 2 命中</span>',
            detailLines: [
              '│  ① windowStr = "cdeab"',
              '│  ② 与 goal="cdeab" 逐字符严格一致，完全匹配！',
            ],
            fillLine: '└── 成功命中！锁定偏移量 shift = 2 🎯',
          }),
        ].join(''),
      }),
      DeductionBoardPrimitives.renderOuterRound({
        title: '【阶段三】终态判定与旋转偏移量锁定 (Conclusion)',
        subtitle: '判定成功，输出旋转可达性结论与时空复杂度',
        stepLinesHtml: [
          DeductionBoardPrimitives.renderInnerStep({
            connector: '├───',
            label: '旋转等价性判定',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-bold">True</span>',
            detailLines: [
              '│  ① 匹配起始下标: matchPos = 2',
              '│  ② 物理意义: "abcde" 循环左移 2 位即得到 "cdeab"',
            ],
            fillLine: '└── 判定有效：返回 true 🎉',
          }),
          DeductionBoardPrimitives.renderInnerStep({
            connector: '└───',
            label: '复杂度与双倍拼接定理',
            badgeHtml: '<span class="text-[9px] px-1.5 py-0.2 bg-purple-100 text-purple-800 rounded font-bold">O(N) 线性</span>',
            detailLines: [
              '│  ① 时间复杂度: O(N)（使用 KMP 或内置子串算法）',
              '│  ② 空间复杂度: O(N)，存放长为 2N 的拼接字符串',
              '│  ③ 核心定理: s 循环旋转生成的所有串集合严格等价于 (s + s) 的所有长度为 N 的子串集合',
            ],
            fillLine: '└── LeetCode 796 旋转字符串算法推演圆满完成 🏆',
          }),
        ].join(''),
      }),
    ];

    return `
      <div class="deduction-board" style="padding: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        ${header}
        ${baseCase}
        ${rounds.join('\n')}
      </div>
    `;
  }
}
