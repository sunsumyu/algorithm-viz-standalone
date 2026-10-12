import {
  renderEBCCConstructionBoard,
  renderVirtualNodesBoard,
} from '../../../algorithms/categories/advanced-topics/advanced-191-195/advanced-191-195-shared';
import { renderFormulaCard } from '../../../algorithms/categories/string/string-100-105/string-100-105-shared';
import {
  EBCCConstructionStep,
  VirtualNodesStep,
} from './graph-construction-optimization-compiler';

export function renderEBCCConstructionCanvas(container: HTMLElement, step: EBCCConstructionStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderEBCCConstructionBoard(
        step.bccs,
        step.bccDegrees,
        step.leafBCCs,
        step.addedEdges,
        step.minAdded,
        step.stage
      )}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #1d4ed8;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">最优添边定理</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">一加两消：ceil(L / 2)</div>
        </div>
      </div>

      ${renderFormulaCard(
        '边双连通改造核心定理',
        '\\text{最少添加边数} = \\lceil \\frac{L}{2} \\rceil = \\lfloor \\frac{L + 1}{2} \\rfloor',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}

export function renderVirtualNodesCanvas(container: HTMLElement, step: VirtualNodesStep): void {
  container.innerHTML = `
    <div style="padding: 16px; background: #ffffff; border-radius: 12px;">
      ${renderVirtualNodesBoard(
        step.setA,
        step.setB,
        step.vMid,
        step.edgeCountOld,
        step.edgeCountNew,
        step.stage
      )}

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 12px; margin-bottom: 16px;">
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">当前算法阶段</div>
          <div style="font-size: 17px; font-weight: 700; color: #be185d;">${step.stage}</div>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px;">
          <div style="font-size: 11px; color: #64748b;">复杂度降维</div>
          <div style="font-size: 15px; font-weight: 700; color: #059669;">O(|A| * |B|) => O(|A| + |B|)</div>
        </div>
      </div>

      ${renderFormulaCard(
        '虚点建图降维核心准则',
        'E_{naive} = |A| \\times |B| \\implies E_{virtual} = |A| + |B|, \\quad \\text{节省 } (|A|-1)(|B|-1) \\text{ 条边}',
        step.decision,
        step.statusBadge
      )}
    </div>
  `;
}
