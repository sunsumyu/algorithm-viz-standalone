/**
 * 验证二叉搜索树 (Validate BST · LeetCode 98 / Class 037 Code05)
 * 全景推演树渲染策略 (ValidBstDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 Zero-Subbox 表现层契约：
 *   - 彻底消灭粗暴的 ASCII 字符画 (├─── 等)
 *   - 扁平化流式卡片，消灭多层白底套娃框
 *   - 真实动态展开的递归中序调用树作为核心主角呈现
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { parseTreeArray } from '../../input-primitives';
import { buildTreeFromArr } from '../../../algorithms/categories/tree/tree-template';
import { buildVBSteps } from '../adapters/valid-bst-step-compiler';
import { RecursiveCallTraceAdapter } from '../adapters/recursive-call-trace-adapter';

export class ValidBstDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'valid-bst';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'valid-bst' ||
      modelId === '98' ||
      modelId === 'leetcode-98' ||
      modelId === 'tree-037-validate-bst' ||
      modelId === 'class037-code05' ||
      modelId === 'class023-code01'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const rawTreeStr =
      options.inputs?.['input-tree'] ||
      options.inputs?.['tree'] ||
      '5, 1, 4, null, null, 3, 6';
    const treeArr = parseTreeArray(rawTreeStr, [5, 1, 4, null, null, 3, 6]);
    const rootNode = buildTreeFromArr(treeArr);
    const steps = buildVBSteps(rootNode);
    const lastStep = steps[steps.length - 1];
    const fullSnapshot = lastStep?.callTrace || null;
    const isTreeValid = lastStep ? lastStep.valid : true;

    // 1. 顶栏：契约与参数概览 (Gradient Header Card)
    const headerHtml = `
      <div style="background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%); border: 1px solid #bfdbfe; border-radius: 12px; padding: 12px 14px; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <div style="font-size: 13px; font-weight: 800; color: #1e3a8a; display: flex; align-items: center; gap: 6px;">
            <span>🛡️ 力扣 98. 验证二叉搜索树 (Validate BST) · 全景推演展板</span>
          </div>
          <span style="font-size: 10px; font-family: ui-monospace, monospace; font-weight: 700; background: ${isTreeValid ? '#dcfce7' : '#ffe4e6'}; color: ${isTreeValid ? '#15803d' : '#be123c'}; padding: 2px 8px; border-radius: 9999px;">
            ${isTreeValid ? '当前算例：合法 BST' : '当前算例：非法违规树'}
          </span>
        </div>
        <div style="font-size: 11px; color: #475569; line-height: 1.5; margin-bottom: 6px;">
          二叉搜索树经典定理：<strong>左子树所有节点值 &lt; 根节点值 &lt; 右子树所有节点值</strong>，且左右子树亦分别为 BST。数学等价结论：<strong>中序遍历序列严格单调递增</strong>。
        </div>
        <div style="font-family: ui-monospace, monospace; font-size: 10.5px; background: #0f172a; color: #e2e8f0; border-radius: 6px; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center;">
          <span>当前输入树: <span style="color: #38bdf8; font-weight: 700;">[${treeArr.map((v) => (v === null ? 'null' : v)).join(', ')}]</span></span>
          <span style="color: #34d399; font-weight: 700;">全程推演 ${steps.length} 步</span>
        </div>
      </div>
    `;

    // 2. 避坑警示卡片：局部合法 vs 全局违规 (Counterexample Visual Card)
    const pitfallHtml = `
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; box-sizing: border-box;">
        <div style="font-size: 12px; font-weight: 800; color: #1e293b; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          <span>⚠️ 《代码随想录》核心避坑警示 · 警惕“局部合法但全局违规”陷阱</span>
        </div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
          <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 8px 10px; display: flex; flex-direction: column; gap: 4px;">
            <div style="font-size: 11px; font-weight: 800; color: #be123c; display: flex; align-items: center; gap: 4px;">
              <span>❌ 致命错误模式：单纯比较父子节点</span>
            </div>
            <div style="font-size: 10.5px; color: #9f1239; line-height: 1.4;">
              若仅写 <code>root.val &gt; root.left.val &amp;&amp; root.val &lt; root.right.val</code>，对于反例 <code>[10, 5, 15, null, null, 6, 20]</code>：节点 6 虽小于父 15，但跨层小于了根 10！局部均合法，整树却违规！
            </div>
          </div>
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 8px 10px; display: flex; flex-direction: column; gap: 4px;">
            <div style="font-size: 11px; font-weight: 800; color: #15803d; display: flex; align-items: center; gap: 4px;">
              <span>✅ 标准规约解法：严格单调递增律</span>
            </div>
            <div style="font-size: 10.5px; color: #166534; line-height: 1.4;">
              维护全局前驱指针 <code>prev</code>，在中序遍历“左 ➔ 根 ➔ 右”的展平流动中，强要求当前节点值 <code>cur.val &gt; prev.val</code>；或自顶向下传递开区间 <code>(min, max)</code> 实时剪枝。
            </div>
          </div>
        </div>
      </div>
    `;

    // 3. 核心主角：当前树的中序递归调用全景推演树 (Dynamic Call Trace Tree)
    const traceHtml = fullSnapshot
      ? RecursiveCallTraceAdapter.renderHtml(fullSnapshot, {
          title: `🌳 中序递归校验全景推演调用树 (全程 ${steps.length} 步 · 深度展开)`,
          theme: 'light',
          maxHeight: '420px',
        })
      : '<div style="color: #94a3b8; font-style: italic; padding: 12px;">暂无调用推演快照</div>';

    // 4. 三大解法演进对比展板 (Three Evolution Paradigms)
    const paradigms = [
      {
        num: '1',
        title: '阶段 1: 中序递归单调性校验',
        badge: 'Inorder Prev Pointer',
        badgeColor: '#1d4ed8',
        badgeBg: '#eff6ff',
        points: [
          '中序遍历“左 ➔ 根 ➔ 右”天然将二维拓扑投影为一维序列',
          '维护全局前驱指针 prev，当前节点必须严格满足 root.val > prev.val',
          '空间复杂度 O(H)，代码极度轻巧优雅',
        ],
      },
      {
        num: '2',
        title: '阶段 2: 上下界先序开区间定界',
        badge: '(min, max) Range Pruning',
        badgeColor: '#059669',
        badgeBg: '#ecfdf5',
        points: [
          '自顶向下递归传递开区间 (min, max)，初始为 (-∞, +∞)',
          '左子树上界收紧为 root.val，右子树下界收紧为 root.val',
          '任何节点一旦越界立即剪枝提前熔断，彻底阻断跨层违规',
        ],
      },
      {
        num: '3',
        title: '阶段 3: 迭代显式栈模拟中序遍历',
        badge: 'Explicit Stack',
        badgeColor: '#7c3aed',
        badgeBg: '#f5f3ff',
        points: [
          '沿左侧链一路压栈 (cur = cur.left)，模拟系统递归栈',
          '弹栈访问节点并与前驱 prev 比较单调性，随后指针转向右孩子',
          '彻底摆脱语言隐式递归栈深度限制，防极端单链退化树爆栈',
        ],
      },
    ];

    const paradigmsHtml = `
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; box-sizing: border-box;">
        <div style="font-size: 12px; font-weight: 800; color: #1e293b; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          <span>🚀 验证二叉搜索树三大演化解法对比矩阵</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
          ${paradigms
            .map(
              (p) => `
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px; display: flex; flex-direction: column; gap: 4px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px;">
                <span style="font-weight: 800; font-size: 11px; color: #1e293b;">${p.title}</span>
                <span style="font-size: 9.5px; font-family: ui-monospace, monospace; background: ${p.badgeBg}; color: ${p.badgeColor}; padding: 1px 5px; border-radius: 4px; font-weight: 700;">${p.badge}</span>
              </div>
              <ul style="margin: 0; padding-left: 14px; font-size: 10px; color: #64748b; line-height: 1.4;">
                ${p.points.map((pt) => `<li style="margin-bottom: 2px;">${pt}</li>`).join('')}
              </ul>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    // 5. 底部复杂度与结论条
    const footerHtml = `
      <div style="background: #0f172a; border-radius: 10px; padding: 10px 14px; color: #f8fafc; font-size: 11px; display: flex; justify-content: space-between; align-items: center; box-sizing: border-box;">
        <span style="font-family: ui-monospace, monospace;">
          <span style="color: ${isTreeValid ? '#38bdf8' : '#fb7185'}; font-weight: 700;">return ${isTreeValid ? 'true' : 'false'};</span> // ${
      isTreeValid ? '整棵二叉树通过严格单调性或开区间约束检验' : '检测到单调性破坏或区间越界节点'
    }
        </span>
        <span style="color: #94a3b8; font-size: 10.5px;">
          时间复杂度: <strong style="color: #34d399;">O(N)</strong> (每个节点仅访问一次) · 空间复杂度: <strong style="color: #34d399;">O(H)</strong> (树高递归深度)
        </span>
      </div>
    `;

    return `
      <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; box-sizing: border-box; padding: 4px 2px;">
        ${headerHtml}
        ${pitfallHtml}
        ${traceHtml}
        ${paradigmsHtml}
        ${footerHtml}
      </div>
    `;
  }
}
