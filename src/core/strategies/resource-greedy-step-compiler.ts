/**
 * 有限状态资源与货币池调度通用贪心编译器 (ResourceGreedyStepCompiler)
 * 核心深模块 (Deep Module) —— 统领全库单向有限状态资源流动、货币池找零与配额贪心调度族群：
 * - LeetCode 860: 柠檬水找零 (Lemonade Change)
 * - 衍生状态机与有限资源调度问题
 * 
 * 核心架构与设计模式：
 * 1. 建造者模式 (Builder Pattern): 使用 UniversalStepBuilder 强类型链式构造每一阶段推导步骤，
 *    物理保证代码行号 (line >= 1)、决策说明语义 (decision)、阶段标定 (stage) 零缺失；
 * 2. 状态机模式 (State Machine): 跟踪资源池 (five, ten 等) 状态迁移与分支转移；
 * 3. 顶层抽象四阶段演进规范：
 *    - Stage 1: 贪心单调流动模拟 (Forward: 优先消耗受限货币；Reverse: 备选方案或逆向推演)
 *    - Stage 2: 找零分支决策依赖树 (UniversalTreeNode 树形展开对比)
 *    - Stage 3: 有限状态转移矩阵 (2D 状态表格直观追踪)
 *    - Stage 4: 空间压缩状态机 (O(1) 寄存器高速推演)
 */

import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep, UniversalTreeNode } from '../universal-stage-engine';
import { UniversalStepBuilder } from '../builders/universal-step-builder';
import { YamlModelLoader } from '../yaml-model-loader';

export interface ResourceGreedyCompileOptions {
  bills?: number[];
  direction?: 'forward' | 'reverse';
  anchorMap?: Record<string, number>;
}

export class ResourceGreedyStepCompiler {
  public static compile(
    model: IYamlAlgorithmModel,
    options: ResourceGreedyCompileOptions,
    stage: number = 1
  ): UniversalStep[] {
    switch (stage) {
      case 2:
        return this.compileStage2(model, options);
      case 3:
        return this.compileStage3(model, options);
      case 4:
        return this.compileStage4(model, options);
      case 1:
      default:
        return this.compileStage1(model, options);
    }
  }

  private static extractAnchors(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse' = 'forward',
    anchorMap?: Record<string, number>
  ): Record<string, number> {
    if (anchorMap) return anchorMap;
    const stageKey = `stage-${stage}`;
    const codeSnippet =
      model.stages?.[stageKey]?.code?.[direction]?.source ||
      model.stages?.[stageKey]?.code?.forward?.source ||
      model.stages?.['stage-1']?.code?.forward?.source;
    if (codeSnippet) {
      try {
        return YamlModelLoader.compileSource(codeSnippet, 'java').anchorMap || {};
      } catch {
        return {};
      }
    }
    return {};
  }

  // ==========================================================================
  // Stage 1: 贪心货币池调度 (优先消耗受限专用货币)
  // ==========================================================================
  private static compileStage1(
    model: IYamlAlgorithmModel,
    options: ResourceGreedyCompileOptions
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const bills = options.bills && options.bills.length > 0 ? options.bills : [5, 5, 5, 10, 20];
    const anchors = this.extractAnchors(model, 1, options.direction || 'forward', options.anchorMap);

    let five = 0;
    let ten = 0;

    // 初始步
    steps.push(
      UniversalStepBuilder.create(0)
        .stage(1)
        .line(anchors.init || 2)
        .slot(0)
        .decision('收银台初始化：5元和10元钞票数量均为 0')
        .message('柠檬水摊开始营业，初始现金储备为空：$5: 0张, $10: 0张。')
        .variables({ five: 0, ten: 0, totalCustomers: bills.length })
        .metrics({
          'cur-bill': '—',
          'change-need': '—',
          'cashier': '$5 × 0 | $10 × 0',
          'verdict': '就绪',
        })
        .build()
    );

    for (let i = 0; i < bills.length; i++) {
      const bill = bills[i];
      const slot = i;

      if (bill === 5) {
        five++;
        steps.push(
          UniversalStepBuilder.create(steps.length)
            .stage(1)
            .line(anchors.recv5 || 5)
            .slot(slot)
            .highlightSlots([slot])
            .decision(`顾客 [${i}] 支付 $5，无需找零，直接收下`)
            .message(`💵 收到 $5 现钞，直接放入钱箱。当前储备：$5 × ${five}, $10 × ${ten}。`)
            .variables({ customer: i, bill: 5, five, ten, change: 0 })
            .metrics({
              'cur-bill': '$5',
              'change-need': '$0 (无需找零)',
              'cashier': `$5 × ${five} | $10 × ${ten}`,
              'verdict': '找零成功 (进行中)',
            })
            .build()
        );
      } else if (bill === 10) {
        if (five === 0) {
          steps.push(
            UniversalStepBuilder.create(steps.length)
              .stage(1)
              .line(anchors.fail10 || 7)
              .slot(slot)
              .highlightSlots([slot])
              .decision(`顾客 [${i}] 支付 $10 需要找零 $5，但手头没有 $5 纸币！找零失败`)
              .message(`❌ 零钱匮乏：手头没有 5 元纸币无法找零，交易中断，返回 false。`)
              .variables({ customer: i, bill: 10, five, ten, failed: true })
              .metrics({
                'cur-bill': '$10',
                'change-need': '$5',
                'cashier': `$5 × ${five} | $10 × ${ten}`,
                'verdict': 'false (找零失败)',
              })
              .build()
          );
          return steps;
        }

        five--;
        ten++;
        steps.push(
          UniversalStepBuilder.create(steps.length)
            .stage(1)
            .line(anchors.change10 || 8)
            .slot(slot)
            .highlightSlots([slot])
            .decision(`顾客 [${i}] 支付 $10，找零 1 张 $5，收入 1 张 $10`)
            .message(`💶 找零 1 张 $5 并存入 1 张 $10。当前储备：$5 × ${five}, $10 × ${ten}。`)
            .variables({ customer: i, bill: 10, five, ten, change: 5 })
            .metrics({
              'cur-bill': '$10',
              'change-need': '$5',
              'cashier': `$5 × ${five} | $10 × ${ten}`,
              'verdict': '找零成功 (进行中)',
            })
            .build()
        );
      } else {
        // bill === 20: 贪心优先找 $10+$5
        if (five > 0 && ten > 0) {
          five--;
          ten--;
          steps.push(
            UniversalStepBuilder.create(steps.length)
              .stage(1)
              .line(anchors.change20_opt || 11)
              .slot(slot)
              .highlightSlots([slot])
              .decision(`顾客 [${i}] 支付 $20，贪心优先找零 ($10 + $5)，保留宝贵的万能 $5`)
              .message(`💷 贪心优先消耗受限的 $10 纸币，吐出 1 张 $10 和 1 张 $5。当前储备：$5 × ${five}, $10 × ${ten}。`)
              .variables({ customer: i, bill: 20, five, ten, change: 15, plan: '10+5' })
              .metrics({
                'cur-bill': '$20',
                'change-need': '$15 ($10+$5)',
                'cashier': `$5 × ${five} | $10 × ${ten}`,
                'verdict': '找零成功 (进行中)',
              })
              .build()
          );
        } else if (five >= 3) {
          five -= 3;
          steps.push(
            UniversalStepBuilder.create(steps.length)
              .stage(1)
              .line(anchors.change20_alt || 13)
              .slot(slot)
              .highlightSlots([slot])
              .decision(`顾客 [${i}] 支付 $20，手头无 $10，启动备选方案找零 3 张 $5`)
              .message(`💷 备选方案：消耗 3 张 $5 完成找零。当前储备：$5 × ${five}, $10 × ${ten}。`)
              .variables({ customer: i, bill: 20, five, ten, change: 15, plan: '5+5+5' })
              .metrics({
                'cur-bill': '$20',
                'change-need': '$15 (3张$5)',
                'cashier': `$5 × ${five} | $10 × ${ten}`,
                'verdict': '找零成功 (进行中)',
              })
              .build()
          );
        } else {
          steps.push(
            UniversalStepBuilder.create(steps.length)
              .stage(1)
              .line(anchors.fail20 || 15)
              .slot(slot)
              .highlightSlots([slot])
              .decision(`顾客 [${i}] 支付 $20 需要找零 $15，但手头零钱不足！找零失败`)
              .message(`❌ 零钱匮乏：手头既没有 ($10+$5) 也没有 (3张$5)，无法找零，返回 false。`)
              .variables({ customer: i, bill: 20, five, ten, failed: true })
              .metrics({
                'cur-bill': '$20',
                'change-need': '$15',
                'cashier': `$5 × ${five} | $10 × ${ten}`,
                'verdict': 'false (找零失败)',
              })
              .build()
          );
          return steps;
        }
      }
    }

    // 全部找零成功
    steps.push(
      UniversalStepBuilder.create(steps.length)
        .stage(1)
        .line(anchors.done || 18)
        .slot(bills.length - 1)
        .highlightSlots([bills.length - 1])
        .decision(`🎉 全部 ${bills.length} 位顾客顺利找零，返回 true`)
        .message(`🎉 所有账单流转处理完毕！最终收银台储备：$5 × ${five}, $10 × ${ten}，找零成功！`)
        .variables({ five, ten, success: true })
        .metrics({
          'cur-bill': '—',
          'change-need': '—',
          'cashier': `$5 × ${five} | $10 × ${ten}`,
          'verdict': 'true (全部成功)',
        })
        .build()
    );

    return steps;
  }

  // ==========================================================================
  // Stage 2: 决策依赖树 (UniversalTreeNode 树形展开与分支对比)
  // ==========================================================================
  private static compileStage2(
    model: IYamlAlgorithmModel,
    options: ResourceGreedyCompileOptions
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const bills = options.bills && options.bills.length > 0 ? options.bills : [5, 5, 5, 10, 20];
    const anchors = this.extractAnchors(model, 2, options.direction || 'forward', options.anchorMap);

    const rootNode: UniversalTreeNode = {
      id: 'node-root',
      r: 0,
      c: 0,
      val: 'Start(0,0)',
      status: 'current',
      children: [],
    };

    steps.push(
      UniversalStepBuilder.create(0)
        .stage(2)
        .line(anchors.base || 2)
        .slot(0)
        .decision('自顶向下找零决策依赖树展开根节点')
        .message('根状态：index=0, five=0, ten=0。开始探索各账单分支流动。')
        .variables({ index: 0, five: 0, ten: 0 })
        .tree(rootNode)
        .build()
    );

    let five = 0;
    let ten = 0;
    let parentNode = rootNode;

    for (let i = 0; i < bills.length; i++) {
      const bill = bills[i];
      const slot = i;

      // 微步 1: 递归探查账单 (@step:entry)
      steps.push(
        UniversalStepBuilder.create(steps.length)
          .stage(2)
          .line(anchors.entry || 3)
          .slot(slot)
          .highlightSlots([slot])
          .decision(`递归探查：dfs(index=${i}, five=${five}, ten=${ten}) 考察顾客 [${i}] 支付 $${bill}`)
          .message(`进入递归深度调用，当前收银台状态 ($5: ${five}张, $10: ${ten}张)，准备评估分支条件。`)
          .variables({ index: i, bill, five, ten })
          .tree(rootNode)
          .activeNode(parentNode.id)
          .build()
      );

      // 微步 2: 分支展开与决策转移
      if (bill === 5) {
        five++;
        const child: UniversalTreeNode = {
          id: `node-${i}`,
          r: i + 1,
          c: 0,
          val: `[${i}] $5 -> ($5:${five},$10:${ten})`,
          status: 'visited',
          tag: '收入$5',
          children: [],
        };
        parentNode.children = [child];
        parentNode = child;

        steps.push(
          UniversalStepBuilder.create(steps.length)
            .stage(2)
            .line(anchors.branch5 || 5)
            .slot(slot)
            .highlightSlots([slot])
            .decision(`探索分支：顾客 [${i}] 支付 $5，直接转移至状态 ($5:${five}, $10:${ten})`)
            .message(`递归调用 dfs(${i + 1}, five=${five}, ten=${ten})。`)
            .variables({ index: i + 1, five, ten, bill: 5 })
            .tree(rootNode)
            .activeNode(child.id)
            .build()
        );
      } else if (bill === 10) {
        if (five === 0) {
          const failChild: UniversalTreeNode = {
            id: `node-${i}-fail`,
            r: i + 1,
            c: 0,
            val: `[${i}] $10 剪枝失败`,
            status: 'pruned',
            tag: '零钱不足',
            children: [],
          };
          parentNode.children = [failChild];
          steps.push(
            UniversalStepBuilder.create(steps.length)
              .stage(2)
              .line(anchors.prune10 || 7)
              .slot(slot)
              .highlightSlots([slot])
              .decision(`分支剪枝：顾客 [${i}] 支付 $10，手头无 $5，剪枝返回 false`)
              .message(`剪枝失效：five == 0，短路终止。`)
              .variables({ index: i, five, ten, fail: true })
              .tree(rootNode)
              .activeNode(failChild.id)
              .build()
          );
          return steps;
        }

        five--;
        ten++;
        const child: UniversalTreeNode = {
          id: `node-${i}`,
          r: i + 1,
          c: 0,
          val: `[${i}] $10 -> ($5:${five},$10:${ten})`,
          status: 'visited',
          tag: '找$5收$10',
          children: [],
        };
        parentNode.children = [child];
        parentNode = child;

        steps.push(
          UniversalStepBuilder.create(steps.length)
            .stage(2)
            .line(anchors.branch10 || 8)
            .slot(slot)
            .highlightSlots([slot])
            .decision(`探索分支：顾客 [${i}] 支付 $10，找零 $5 存入 $10，转移至 ($5:${five}, $10:${ten})`)
            .message(`递归深入 dfs(${i + 1}, five=${five}, ten=${ten})。`)
            .variables({ index: i + 1, five, ten, bill: 10 })
            .tree(rootNode)
            .activeNode(child.id)
            .build()
        );
      } else {
        if (five > 0 && ten > 0) {
          five--;
          ten--;
          const child: UniversalTreeNode = {
            id: `node-${i}`,
            r: i + 1,
            c: 0,
            val: `[${i}] $20 贪心优先 -> ($5:${five},$10:${ten})`,
            status: 'visited',
            tag: '优先10+5',
            children: [],
          };
          parentNode.children = [child];
          parentNode = child;

          steps.push(
            UniversalStepBuilder.create(steps.length)
              .stage(2)
              .line(anchors.branch20_opt || 11)
              .slot(slot)
              .highlightSlots([slot])
              .decision(`探索分支：顾客 [${i}] 支付 $20，贪心选择 $10+$5，转移至 ($5:${five}, $10:${ten})`)
              .message(`贪心剪除劣质分支，直接进入最优子状态 dfs(${i + 1}, five=${five}, ten=${ten})。`)
              .variables({ index: i + 1, five, ten, bill: 20 })
              .tree(rootNode)
              .activeNode(child.id)
              .build()
          );
        } else if (five >= 3) {
          five -= 3;
          const child: UniversalTreeNode = {
            id: `node-${i}`,
            r: i + 1,
            c: 0,
            val: `[${i}] $20 备选 -> ($5:${five},$10:${ten})`,
            status: 'visited',
            tag: '消耗3张$5',
            children: [],
          };
          parentNode.children = [child];
          parentNode = child;

          steps.push(
            UniversalStepBuilder.create(steps.length)
              .stage(2)
              .line(anchors.branch20_alt || 14)
              .slot(slot)
              .highlightSlots([slot])
              .decision(`探索分支：顾客 [${i}] 支付 $20，无 $10，消耗 3张 $5，转移至 ($5:${five}, $10:${ten})`)
              .message(`备选分支深入 dfs(${i + 1}, five=${five}, ten=${ten})。`)
              .variables({ index: i + 1, five, ten, bill: 20 })
              .tree(rootNode)
              .activeNode(child.id)
              .build()
          );
        } else {
          const failChild: UniversalTreeNode = {
            id: `node-${i}-fail`,
            r: i + 1,
            c: 0,
            val: `[${i}] $20 剪枝失败`,
            status: 'pruned',
            tag: '零钱不足',
            children: [],
          };
          parentNode.children = [failChild];
          steps.push(
            UniversalStepBuilder.create(steps.length)
              .stage(2)
              .line(anchors.prune20 || 17)
              .slot(slot)
              .highlightSlots([slot])
              .decision(`分支剪枝：顾客 [${i}] 支付 $20，零钱不足，剪枝返回 false`)
              .message(`两路分支均不可行，短路返回 false。`)
              .variables({ index: i, five, ten, fail: true })
              .tree(rootNode)
              .activeNode(failChild.id)
              .build()
          );
          return steps;
        }
      }
    }

    steps.push(
      UniversalStepBuilder.create(steps.length)
        .stage(2)
        .line(anchors.base || 2)
        .slot(bills.length - 1)
        .highlightSlots([bills.length - 1])
        .decision(`决策树完全展开成功，叶子节点到达 index == bills.length，返回 true`)
        .message(`🎯 递归基底命中：遍历完毕所有账单，返回 true。`)
        .variables({ success: true, five, ten })
        .tree(rootNode)
        .build()
    );

    return steps;
  }

  // ==========================================================================
  // Stage 3: 有限状态转移矩阵 (2D 表格追踪各顾客交易后的货币向量)
  // ==========================================================================
  private static compileStage3(
    model: IYamlAlgorithmModel,
    options: ResourceGreedyCompileOptions
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const bills = options.bills && options.bills.length > 0 ? options.bills : [5, 5, 5, 10, 20];
    const n = bills.length;
    const anchors = this.extractAnchors(model, 3, options.direction || 'forward', options.anchorMap);

    // grid: (n + 1) 行, 2 列 (col 0: five, col 1: ten)
    const grid: number[][] = Array.from({ length: n + 1 }, () => [0, 0]);

    steps.push(
      UniversalStepBuilder.create(0)
        .stage(3)
        .line(anchors.table_init || 3)
        .slot(0)
        .grid(grid)
        .cell(0, 0)
        .decision('状态矩阵初始化：state[0] = [0, 0] (初始储备)')
        .message('构建 (n+1) × 2 状态矩阵，第 0 行表示营业前收银台零钱数量。')
        .variables({ row: 0, five: 0, ten: 0 })
        .metrics({
          'cur-bill': '—',
          'state[0]': '[five=0, ten=0]',
          'verdict': '就绪',
        })
        .build()
    );

    for (let i = 0; i < n; i++) {
      const bill = bills[i];
      const prevFive = grid[i][0];
      const prevTen = grid[i][1];

      // 微步 1: 读取前序状态与账单探查 (@step:fetch)
      steps.push(
        UniversalStepBuilder.create(steps.length)
          .stage(3)
          .line(anchors.fetch || 5)
          .slot(i)
          .highlightSlots([i])
          .grid(grid)
          .cell(i, 0)
          .decision(`状态探查：读取 state[${i}] = [${prevFive}, ${prevTen}]，考察顾客 [${i}] 支付 $${bill}`)
          .message(`准备依据当前零钱储备 ([5]: ${prevFive}张, [10]: ${prevTen}张) 推导下一行状态向量。`)
          .variables({ step: i, bill, prevFive, prevTen })
          .metrics({
            'cur-bill': `$${bill}`,
            [`state[${i}]`]: `[${prevFive}, ${prevTen}]`,
            'verdict': '计算转移条件',
          })
          .build()
      );

      // 微步 2: 状态转移计算与落盘
      if (bill === 5) {
        grid[i + 1][0] = prevFive + 1;
        grid[i + 1][1] = prevTen;

        steps.push(
          UniversalStepBuilder.create(steps.length)
            .stage(3)
            .line(anchors.trans5 || 7)
            .slot(i)
            .highlightSlots([i])
            .grid(grid)
            .cell(i + 1, 0)
            .decision(`状态转移：顾客 [${i}] 支付 $5，state[${i + 1}] = [${grid[i + 1][0]}, ${grid[i + 1][1]}]`)
            .message(`状态更新：$5 数量自增 1，当前状态向量为 [${grid[i + 1][0]}, ${grid[i + 1][1]}]。`)
            .variables({ step: i + 1, bill: 5, state: grid[i + 1] })
            .metrics({
              'cur-bill': '$5',
              [`state[${i + 1}]`]: `[${grid[i + 1][0]}, ${grid[i + 1][1]}]`,
              'verdict': '推进中',
            })
            .build()
        );
      } else if (bill === 10) {
        if (prevFive < 1) {
          steps.push(
            UniversalStepBuilder.create(steps.length)
              .stage(3)
              .line(anchors.check10 || 9)
              .slot(i)
              .highlightSlots([i])
              .grid(grid)
              .cell(i, 0)
              .decision(`状态转移断言失败：顾客 [${i}] 支付 $10 但 state[${i}][0] < 1`)
              .message(`❌ 前序状态无 5 元可用，无法转移至有效下一状态，终止返回 false。`)
              .variables({ step: i + 1, bill: 10, error: 'no five' })
              .metrics({
                'cur-bill': '$10',
                [`state[${i}]`]: `[${prevFive}, ${prevTen}]`,
                'verdict': 'false',
              })
              .build()
          );
          return steps;
        }

        grid[i + 1][0] = prevFive - 1;
        grid[i + 1][1] = prevTen + 1;

        steps.push(
          UniversalStepBuilder.create(steps.length)
            .stage(3)
            .line(anchors.trans10 || 10)
            .slot(i)
            .highlightSlots([i])
            .grid(grid)
            .cell(i + 1, 1)
            .decision(`状态转移：顾客 [${i}] 支付 $10，扣除 1张$5 存入 1张$10`)
            .message(`状态更新：向量转移为 [${grid[i + 1][0]}, ${grid[i + 1][1]}]。`)
            .variables({ step: i + 1, bill: 10, state: grid[i + 1] })
            .metrics({
              'cur-bill': '$10',
              [`state[${i + 1}]`]: `[${grid[i + 1][0]}, ${grid[i + 1][1]}]`,
              'verdict': '推进中',
            })
            .build()
        );
      } else {
        if (prevFive >= 1 && prevTen >= 1) {
          grid[i + 1][0] = prevFive - 1;
          grid[i + 1][1] = prevTen - 1;

          steps.push(
            UniversalStepBuilder.create(steps.length)
              .stage(3)
              .line(anchors.trans20_opt || 14)
              .slot(i)
              .highlightSlots([i])
              .grid(grid)
              .cell(i + 1, 0)
              .decision(`状态转移 (贪心优先)：顾客 [${i}] 支付 $20，消耗 1张$10 和 1张$5`)
              .message(`状态更新：向量转移为 [${grid[i + 1][0]}, ${grid[i + 1][1]}]。`)
              .variables({ step: i + 1, bill: 20, state: grid[i + 1] })
              .metrics({
                'cur-bill': '$20',
                [`state[${i + 1}]`]: `[${grid[i + 1][0]}, ${grid[i + 1][1]}]`,
                'verdict': '推进中',
              })
              .build()
          );
        } else if (prevFive >= 3) {
          grid[i + 1][0] = prevFive - 3;
          grid[i + 1][1] = prevTen;

          steps.push(
            UniversalStepBuilder.create(steps.length)
              .stage(3)
              .line(anchors.trans20_alt || 17)
              .slot(i)
              .highlightSlots([i])
              .grid(grid)
              .cell(i + 1, 0)
              .decision(`状态转移 (备选方案)：顾客 [${i}] 支付 $20，消耗 3张$5`)
              .message(`状态更新：向量转移为 [${grid[i + 1][0]}, ${grid[i + 1][1]}]。`)
              .variables({ step: i + 1, bill: 20, state: grid[i + 1] })
              .metrics({
                'cur-bill': '$20',
                [`state[${i + 1}]`]: `[${grid[i + 1][0]}, ${grid[i + 1][1]}]`,
                'verdict': '推进中',
              })
              .build()
          );
        } else {
          steps.push(
            UniversalStepBuilder.create(steps.length)
              .stage(3)
              .line(anchors.fail20 || 20)
              .slot(i)
              .highlightSlots([i])
              .grid(grid)
              .cell(i, 0)
              .decision(`状态转移断言失败：顾客 [${i}] 支付 $20 但零钱不足`)
              .message(`❌ 前序状态无足够零钱提供找零，转移断言失败，终止返回 false。`)
              .variables({ step: i + 1, bill: 20, error: 'insufficient' })
              .metrics({
                'cur-bill': '$20',
                [`state[${i}]`]: `[${prevFive}, ${prevTen}]`,
                'verdict': 'false',
              })
              .build()
          );
          return steps;
        }
      }
    }

    steps.push(
      UniversalStepBuilder.create(steps.length)
        .stage(3)
        .line(anchors.done || 24)
        .slot(n - 1)
        .highlightSlots([n - 1])
        .grid(grid)
        .cell(n, 0)
        .decision(`状态矩阵成功填毕，所有前序转移均有效，返回 true`)
        .message(`🏁 状态转移完成！最终状态向量 state[${n}] = [${grid[n][0]}, ${grid[n][1]}]。`)
        .variables({ success: true, finalState: grid[n] })
        .metrics({
          'cur-bill': '—',
          [`state[${n}]`]: `[${grid[n][0]}, ${grid[n][1]}]`,
          'verdict': 'true',
        })
        .build()
    );

    return steps;
  }

  // ==========================================================================
  // Stage 4: 空间压缩状态机 (O(1) 双寄存器高速线性推演)
  // ==========================================================================
  private static compileStage4(
    model: IYamlAlgorithmModel,
    options: ResourceGreedyCompileOptions
  ): UniversalStep[] {
    const steps: UniversalStep[] = [];
    const bills = options.bills && options.bills.length > 0 ? options.bills : [5, 5, 5, 10, 20];
    const anchors = this.extractAnchors(model, 4, options.direction || 'forward', options.anchorMap);

    let five = 0;
    let ten = 0;

    steps.push(
      UniversalStepBuilder.create(0)
        .stage(4)
        .line(anchors.init || 2)
        .slot(0)
        .decision('空间压缩：仅分配 2 个整型寄存器 five 与 ten，空间复杂度 O(1)')
        .message('寄存器就绪：five=0, ten=0。极速推演启动。')
        .variables({ five: 0, ten: 0 })
        .metrics({ 'five-reg': 0, 'ten-reg': 0, 'status': '极速扫描中' })
        .build()
    );

    for (let i = 0; i < bills.length; i++) {
      const bill = bills[i];
      const slot = i;

      if (bill === 5) {
        five++;
        steps.push(
          UniversalStepBuilder.create(steps.length)
            .stage(4)
            .line(anchors.recv5 || 4)
            .slot(slot)
            .highlightSlots([slot])
            .decision(`[${i}] bill=5 -> five++ -> five=${five}`)
            .message(`寄存器 five 累加至 ${five}。`)
            .variables({ i, bill: 5, five, ten })
            .metrics({ 'five-reg': five, 'ten-reg': ten, 'status': 'OK' })
            .build()
        );
      } else if (bill === 10) {
        if (five === 0) {
          steps.push(
            UniversalStepBuilder.create(steps.length)
              .stage(4)
              .line(anchors.fail10 || 6)
              .slot(slot)
              .highlightSlots([slot])
              .decision(`[${i}] bill=10 -> five == 0 -> 短路返回 false`)
              .message(`❌ 寄存器 five 为 0，无法找零，短路退出。`)
              .variables({ i, bill: 10, five, ten, fail: true })
              .metrics({ 'five-reg': five, 'ten-reg': ten, 'status': 'FAIL' })
              .build()
          );
          return steps;
        }
        five--;
        ten++;
        steps.push(
          UniversalStepBuilder.create(steps.length)
            .stage(4)
            .line(anchors.change10 || 7)
            .slot(slot)
            .highlightSlots([slot])
            .decision(`[${i}] bill=10 -> five--, ten++ -> (five=${five}, ten=${ten})`)
            .message(`寄存器更新：five 减 1，ten 加 1。`)
            .variables({ i, bill: 10, five, ten })
            .metrics({ 'five-reg': five, 'ten-reg': ten, 'status': 'OK' })
            .build()
        );
      } else {
        if (five > 0 && ten > 0) {
          five--;
          ten--;
          steps.push(
            UniversalStepBuilder.create(steps.length)
              .stage(4)
              .line(anchors.opt20 || 9)
              .slot(slot)
              .highlightSlots([slot])
              .decision(`[${i}] bill=20 -> 优先消耗 10+5 -> (five=${five}, ten=${ten})`)
              .message(`寄存器更新：five 减 1，ten 减 1。`)
              .variables({ i, bill: 20, five, ten, plan: '10+5' })
              .metrics({ 'five-reg': five, 'ten-reg': ten, 'status': 'OK' })
              .build()
          );
        } else if (five >= 3) {
          five -= 3;
          steps.push(
            UniversalStepBuilder.create(steps.length)
              .stage(4)
              .line(anchors.alt20 || 10)
              .slot(slot)
              .highlightSlots([slot])
              .decision(`[${i}] bill=20 -> 备选消耗 3张5 -> (five=${five}, ten=${ten})`)
              .message(`寄存器更新：five 减 3。`)
              .variables({ i, bill: 20, five, ten, plan: '3*5' })
              .metrics({ 'five-reg': five, 'ten-reg': ten, 'status': 'OK' })
              .build()
          );
        } else {
          steps.push(
            UniversalStepBuilder.create(steps.length)
              .stage(4)
              .line(anchors.fail20 || 11)
              .slot(slot)
              .highlightSlots([slot])
              .decision(`[${i}] bill=20 -> 零钱不足 -> 短路返回 false`)
              .message(`❌ 寄存器零钱不足，短路退出。`)
              .variables({ i, bill: 20, five, ten, fail: true })
              .metrics({ 'five-reg': five, 'ten-reg': ten, 'status': 'FAIL' })
              .build()
          );
          return steps;
        }
      }
    }

    steps.push(
      UniversalStepBuilder.create(steps.length)
        .stage(4)
        .line(anchors.done || 14)
        .slot(bills.length - 1)
        .highlightSlots([bills.length - 1])
        .decision(`O(1) 极速扫描完成，返回 true`)
        .message(`🏆 极速扫描验证完毕，返回 true。`)
        .variables({ five, ten, success: true })
        .metrics({ 'five-reg': five, 'ten-reg': ten, 'status': 'TRUE' })
        .build()
    );

    return steps;
  }
}
