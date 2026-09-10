/**
 * LeetCode 77 组合问题标准题目描述与精讲配置 (Configuration-driven Content)
 */

export const COMBINATION_PROBLEM_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(59,130,246,0.2); color: #60a5fa; font-weight: 700; border: 1px solid rgba(59,130,246,0.3);">LeetCode 77</span>
      <span style="padding: 2px 6px; border-radius: 4px; background: rgba(245,158,11,0.2); color: #fbbf24; font-weight: 700; border: 1px solid rgba(245,158,11,0.3);">Medium</span>
      <h2 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0;">组合 (Combinations)</h2>
    </div>
    <p style="margin: 0;">给定两个整数 <code style="color: #fde047; font-family: monospace;">n</code> 和 <code style="color: #fde047; font-family: monospace;">k</code>，返回范围 <code style="color: #7dd3fc; font-family: monospace;">[1, n]</code> 中所有可能的 <code style="color: #fde047; font-family: monospace;">k</code> 个数的组合。</p>
    <p style="margin: 0;">你可以按 <strong>任何顺序</strong> 返回答案。</p>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 1:</div>
      <div>输入: n = 4, k = 2</div>
      <div>输出: [[1,2],[1,3],[1,4],[2,3],[2,4],[3,4]]</div>
    </div>
    <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b; display: flex; flex-direction: column; gap: 6px; font-family: monospace; font-size: 11px;">
      <div style="color: #34d399; font-weight: 700;">示例 2:</div>
      <div>输入: n = 1, k = 1</div>
      <div>输出: [[1]]</div>
    </div>
    <div style="display: flex; flex-direction: column; gap: 4px; color: #94a3b8; font-size: 11.5px;">
      <div style="font-weight: 700; color: #cbd5e1;">提示：</div>
      <div>• 1 &le; n &le; 20</div>
      <div>• 1 &le; k &le; n</div>
    </div>
  </div>
`;

export const COMBINATION_ANALYSIS_HTML = `
  <div style="display: flex; flex-direction: column; gap: 12px; color: #cbd5e1; font-size: 12px; line-height: 1.6;">
    <h3 style="font-size: 14px; font-weight: 700; color: #ffffff; margin: 0; display: flex; align-items: center; gap: 6px;">
      <span>💡</span> 回溯五部曲与剪枝核心
    </h3>
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #60a5fa; margin-bottom: 4px;">① 递归函数签名与参数</div>
        <p style="margin: 0; color: #94a3b8;">定义 <code style="color: #7dd3fc; font-family: monospace;">backtrack(start, path, res, n, k)</code>，其中 <code style="color: #fde047; font-family: monospace;">start</code> 控制横向循环遍历的起始位置，避免出现重复组合。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #34d399; margin-bottom: 4px;">② 递归终止条件</div>
        <p style="margin: 0; color: #94a3b8;">当 <code style="color: #7dd3fc; font-family: monospace;">path.size() == k</code> 时，说明找到一个长度为 k 的合法组合，拷贝快照加入结果集并 <code style="color: #fde047; font-family: monospace;">return</code>。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #818cf8; margin-bottom: 4px;">③ 单层搜索逻辑</div>
        <p style="margin: 0; color: #94a3b8;">通过 <code style="color: #7dd3fc; font-family: monospace;">for</code> 循环横向枚举当前可选数字，纵向深入递归探索子树。</p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #fbbf24; margin-bottom: 4px;">④ 剪枝优化不等式推导</div>
        <p style="margin: 0; color: #94a3b8;">还需 <code style="color: #fde047; font-family: monospace;">k - path.size()</code> 个元素，列表中至多剩余 <code style="color: #fde047; font-family: monospace;">n - i + 1</code> 个元素。<br>必须满足 <code style="color: #34d399; font-family: monospace;">n - i + 1 &ge; k - path.size()</code>，移项得循环上界：<br><strong style="color: #ffffff; font-family: monospace; background: rgba(30,58,138,0.4); padding: 2px 6px; border-radius: 4px; border: 1px solid rgba(29,78,216,0.5); display: inline-block; margin-top: 4px;">i &le; n - (k - path.size()) + 1</strong></p>
      </div>
      <div style="padding: 10px; border-radius: 10px; background: #020617; border: 1px solid #1e293b;">
        <div style="font-weight: 700; color: #fb7185; margin-bottom: 4px;">⑤ 回溯撤销现场</div>
        <p style="margin: 0; color: #94a3b8;"><code style="color: #7dd3fc; font-family: monospace;">path.add(i)</code> 与 <code style="color: #fb7185; font-family: monospace;">path.remove()</code> 成对出现，确保返回上一层时状态完全恢复。</p>
      </div>
    </div>
  </div>
`;
