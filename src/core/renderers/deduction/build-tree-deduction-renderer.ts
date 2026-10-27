/**
 * 从前序/后序与中序构造二叉树 (Construct Binary Tree · LeetCode 105 & 106 / Zuoshen Class 036 Code07)
 * 全景推演树渲染策略 (BuildTreeDeductionRenderer)
 * 遵循 Matt Pocock 深模块设计模式与 Zero-Subbox 表现层契约：
 *   - 彻底消灭粗暴的 ASCII 字符画 (├─── 等)
 *   - 扁平化流式卡片，消灭多层白底套娃框
 *   - 真实动态展开的递归分治调用树作为核心主角呈现
 */

import { IDeductionTreeRenderer, StaticDeductionRenderOptions } from './types';
import { DeductionBoardPrimitives } from './deduction-board-primitives';
import { parseNumberList } from '../../input-primitives';
import {
  buildTreeSteps,
  buildTreeStage2PostorderSteps,
} from '../adapters/build-tree-step-compiler';
import { RecursiveCallTraceAdapter } from '../adapters/recursive-call-trace-adapter';

export class BuildTreeDeductionRenderer implements IDeductionTreeRenderer {
  public readonly id = 'build-tree';

  public canHandle(modelId: string): boolean {
    return (
      modelId === 'build-tree' ||
      modelId === 'build-tree-2' ||
      modelId === '105' ||
      modelId === '106' ||
      modelId === 'leetcode-105' ||
      modelId === 'leetcode-106' ||
      modelId === 'tree-036-build-tree-preorder-inorder' ||
      modelId === 'build-tree-from-preorder-inorder' ||
      modelId === 'construct-binary-tree-from-inorder-and-postorder'
    );
  }

  public render(options: StaticDeductionRenderOptions): string {
    const pre = parseNumberList(
      options.inputs?.['input-preorder'] || options.inputs?.['preorder'] || '3, 9, 20, 15, 7',
      [3, 9, 20, 15, 7]
    );
    const inArr = parseNumberList(
      options.inputs?.['input-inorder'] || options.inputs?.['inorder'] || '9, 3, 15, 20, 7',
      [9, 3, 15, 20, 7]
    );
    const post = parseNumberList(
      options.inputs?.['input-postorder'] || options.inputs?.['postorder'] || '9, 15, 7, 20, 3',
      [9, 15, 7, 20, 3]
    );

    const isStage2 =
      (options.step?.postorder !== undefined && options.step?.postorder.length > 0) ||
      options.modelId === 'leetcode-106' ||
      options.modelId === '106';

    const steps = isStage2
      ? buildTreeStage2PostorderSteps(inArr, post)
      : buildTreeSteps(pre, inArr);
    const fullSnapshot = steps[steps.length - 1]?.callTrace || null;

    const seqInfo = isStage2
      ? `inorder = [${inArr.join(', ')}], postorder = [${post.join(', ')}]`
      : `preorder = [${pre.join(', ')}], inorder = [${inArr.join(', ')}]`;

    // 1. 顶栏：契约与参数概览
    const headerHtml = `
      <div style="background: linear-gradient(135deg, #eff6ff 0%, #f5f3ff 100%); border: 1px solid #bfdbfe; border-radius: 12px; padding: 12px 14px; box-sizing: border-box;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <div style="font-size: 13px; font-weight: 800; color: #1e3a8a; display: flex; align-items: center; gap: 6px;">
            <span>🌲 力扣 105 / 106. 从前序/后序与中序遍历构造二叉树 · 全景推演展板</span>
          </div>
          <span style="font-size: 10px; font-family: ui-monospace, monospace; font-weight: 700; background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 9999px;">
            ${isStage2 ? '后序 + 中序分治对齐' : '前序 + 中序分治对齐'}
          </span>
        </div>
        <div style="font-size: 11px; color: #475569; line-height: 1.5; margin-bottom: 6px;">
          二叉树重构经典分治命题：利用<strong>前序/后序锁定子树根</strong>，利用<strong>中序划定左右边界</strong>。左右子树节点总数守恒是双序列区间精准对齐的数学基石。
        </div>
        <div style="font-family: ui-monospace, monospace; font-size: 10.5px; background: #0f172a; color: #e2e8f0; border-radius: 6px; padding: 6px 10px; display: flex; justify-content: space-between; align-items: center;">
          <span>当前算例序列: <span style="color: #38bdf8; font-weight: 700;">${seqInfo}</span></span>
          <span style="color: #34d399; font-weight: 700;">共 ${steps.length} 步推演</span>
        </div>
      </div>
    `;

    // 2. 六步切分法流向展板 (去除 ASCII 字符画，采用高质感数字阶梯药丸)
    const stepsData = [
      { num: '1', title: '基底判空', desc: 'pL > pR 或 iL > iR 判定区间无效，返回 null 终止递归', color: '#64748b', bg: '#f1f5f9' },
      { num: '2', title: '锁定根节点', desc: isStage2 ? '取 postorder[pR] 末位为当前子树根' : '取 preorder[pL] 首位为当前子树根', color: '#d97706', bg: '#fef3c7' },
      { num: '3', title: '中序定位切点', desc: '通过 inMap.get(rootVal) 瞬时定位根在中序中的索引 inRoot', color: '#0d9488', bg: '#ccfbf1' },
      { num: '4', title: '计算节点跨度', desc: 'leftLen = inRoot - iL，左子树在中序与前/后序中节点数绝对守恒', color: '#2563eb', bg: '#dbeafe' },
      { num: '5', title: '双序联动切分', desc: isStage2 ? '左后序 [postL..postL+len-1]，右后序 [postL+len..postR-1]' : '左前序 [pL+1..pL+len]，右前序 [pL+len+1..pR]', color: '#7c3aed', bg: '#ede9fe' },
      { num: '6', title: '递归组装返回', desc: '挂载 root.left 与 root.right，并向父层返回当前子树根节点', color: '#059669', bg: '#d1fae5' },
    ];

    const sixStepsHtml = `
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; box-sizing: border-box;">
        <div style="font-size: 12px; font-weight: 800; color: #1e293b; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          <span>📐 《代码随想录》核心教学洞见 · 六步分治切分法规约</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
          ${stepsData
            .map(
              (s) => `
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px; display: flex; flex-direction: column; gap: 3px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <span style="display: inline-flex; align-items: center; justify-content: center; width: 18px; height: 18px; border-radius: 50%; background: ${s.bg}; color: ${s.color}; font-weight: 800; font-size: 10.5px; font-family: ui-monospace, monospace;">${s.num}</span>
                <span style="font-size: 11px; font-weight: 700; color: #1e293b;">${s.title}</span>
              </div>
              <div style="font-size: 10px; color: #64748b; line-height: 1.4; padding-left: 24px;">${s.desc}</div>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;

    // 3. 核心主角：递归调用全景展开树 (Interactive Call Trace Tree)
    const traceHtml = fullSnapshot
      ? RecursiveCallTraceAdapter.renderHtml(fullSnapshot, {
          title: `🌳 递归分治全景推演调用树 (全程 ${steps.length} 步 · 深度展开)`,
          theme: 'light',
          maxHeight: '440px',
        })
      : '<div style="color: #94a3b8; font-style: italic; padding: 12px;">暂无调用推演快照</div>';

    // 4. 四阶段演化阶梯卡片 (纯净展示，杜绝 ASCII 字符)
    const stagesInfo = [
      { stage: 'Stage 1', name: '前序+中序分治 (LC 105)', tag: 'preorder[pL] ➔ Root', desc: '首位定根，中序切分左长 leftLen，右子树跳过根与左段递归', color: '#1d4ed8', bg: '#eff6ff' },
      { stage: 'Stage 2', name: '后序+中序分治 (LC 106)', tag: 'postorder[pR] ➔ Root', desc: '末位定根，左后序截取 leftLen，右后序排除末尾根对称递归', color: '#b45309', bg: '#fef3c7' },
      { stage: 'Stage 3', name: '前序显式单调栈 ($O(N)$ 零哈希)', tag: 'Stack<TreeNode>', desc: '显式栈沿前序压左链，命中中序弹栈追溯拐点，右孩子重新入栈', color: '#6d28d9', bg: '#f5f3ff' },
      { stage: 'Stage 4', name: '后序显式单调栈 ($O(N)$ 镜像)', tag: 'Reverse Mirror', desc: '后序逆序扫描压右链，命中中序逆序弹栈挂载左孩子，极致空间', color: '#047857', bg: '#ecfdf5' },
    ];

    const evolutionHtml = `
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 14px; box-sizing: border-box;">
        <div style="font-size: 12px; font-weight: 800; color: #1e293b; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          <span>🚀 构造二叉树从分治到迭代的四阶演化矩阵</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px;">
          ${stagesInfo
            .map(
              (st) => `
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 8px 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3px;">
                <span style="font-weight: 700; font-size: 11px; color: ${st.color};">${st.stage}: ${st.name}</span>
                <span style="font-size: 9.5px; font-family: ui-monospace, monospace; background: ${st.bg}; color: ${st.color}; padding: 1px 5px; border-radius: 4px; font-weight: 700;">${st.tag}</span>
              </div>
              <div style="font-size: 10px; color: #64748b; line-height: 1.4;">${st.desc}</div>
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
          <span style="color: #38bdf8; font-weight: 700;">return root;</span> // 重构完成，返回二叉树物理根节点
        </span>
        <span style="color: #94a3b8; font-size: 10.5px;">
          时间复杂度: <strong style="color: #34d399;">O(N)</strong> · 空间复杂度: <strong style="color: #34d399;">O(N)</strong>
        </span>
      </div>
    `;

    return `
      <div style="display: flex; flex-direction: column; gap: 10px; width: 100%; box-sizing: border-box; padding: 4px 2px;">
        ${headerHtml}
        ${sixStepsHtml}
        ${traceHtml}
        ${evolutionHtml}
        ${footerHtml}
      </div>
    `;
  }
}
