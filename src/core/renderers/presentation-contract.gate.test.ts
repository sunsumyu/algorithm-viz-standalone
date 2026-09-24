/**
 * 🏆 表现层真实渲染契约与全景红灯陷阱死门禁 (Presentation Contract & Regression Gate Tests)
 * 严禁任何形式的假绿灯！在真实的 JSDOM 环境中对全库已锁定算法全阶段进行表现层 DOM 渲染，
 * 只要命中任何历史顽疾与恶性 BUG，立即精准亮起红灯并阻断交付！
 */

// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from 'vitest';
import { JSDOM } from 'jsdom';
import { AlgorithmModelRepository } from '../model-repository';
import { UniversalStageEngine } from '../universal-stage-engine';
import { StateSpacePresenter } from './state-space-presenter';
import { StageNavigationCoordinator } from '../controllers/stage-navigation-coordinator';
import { ProblemDimensionResolver } from '../resolvers/problem-dimension-resolver';

import { LOCKED_TOP_LEVEL_ALGORITHMS } from '../top-level-abstraction-compliance.test';
export { LOCKED_TOP_LEVEL_ALGORITHMS };

const MOCK_STAGE_HTML = `
  <div id="algo-main-container" class="view-container active">
    <header>
      <h1 id="header-algo-main-title">算法标题</h1>
      <span id="stage-title-text">阶段标题</span>
      <span id="stage-desc-text">阶段描述</span>
      <span id="header-complexity-badge">O(N)</span>
    </header>

    <div id="card1-wrapper">
      <div id="card1-title">一维状态槽位 (1×6)</div>
      <div id="grid-container" class="w-full h-full"></div>
      <div id="grid-legend-bar"></div>
    </div>

    <div id="card2-wrapper">
      <div id="card2-header">
        <span id="card2-title">状态记录数组 (State Array)</span>
        <span id="badge-memo-len">1 × 6</span>
      </div>
      <div id="card2-desc">卡片2描述</div>
      <div id="memo-array-container" class="w-full h-full"></div>
    </div>

    <div id="code-terminal">
      <pre><code id="code-display"></code></pre>
    </div>

    <div id="log-wrapper">
      <span id="log-count">0 / 0 记录</span>
      <div id="log-container"></div>
    </div>
  </div>
`;

let sharedDoc: Document;

function getFreshStageDOM(): Document {
  if (!sharedDoc) {
    const dom = new JSDOM(`<!DOCTYPE html><html><body>${MOCK_STAGE_HTML}</body></html>`);
    sharedDoc = dom.window.document;
    (globalThis as any).document = sharedDoc;
    (globalThis as any).window = dom.window;
  } else {
    sharedDoc.body.innerHTML = MOCK_STAGE_HTML;
  }
  return sharedDoc;
}

describe('🏆 表现层真实渲染契约与红灯陷阱死门禁 (Presentation Contract Gates)', { timeout: 120000 }, () => {
  // ==========================================================================
  // 红灯 1 & 2: 卡片双重镜像重复 & 一维槽位受二维表格污染陷阱
  // ==========================================================================
  describe('🚨 红灯陷阱 1 & 2: 卡片双重镜像重复与一维槽位受污染', () => {
    it('非 2D 地图算法在所有阶段中，Card 1 严禁与 Card 2 渲染相同二维表格，且一维槽位严禁塞入多行矩阵', () => {
      const violations: string[] = [];

      for (const id of LOCKED_TOP_LEVEL_ALGORITHMS) {
        if (!AlgorithmModelRepository.hasModel(id)) continue;
        const model = AlgorithmModelRepository.getModel(id);
        const resolved = ProblemDimensionResolver.resolve(id, model.defaultParams);

        if (resolved.category === '2d-grid') continue;

        for (const stageKey of ['stage-1', 'stage-2', 'stage-3', 'stage-4']) {
          const stageNum = parseInt(stageKey.replace('stage-', ''), 10);
          const steps = UniversalStageEngine.generateSteps(model, {
            stage: stageNum,
            m: resolved.m,
            n: resolved.n,
            direction: 'forward',
          });

          if (!steps || steps.length === 0) continue;
          const step = steps[0];

          const doc = getFreshStageDOM();
          const stageConfig = model.stages?.[stageKey] || {};
          StageNavigationCoordinator.updateHeaderMeta(
            model,
            stageConfig,
            stageKey,
            'forward',
            resolved.m,
            resolved.n
          );

          StateSpacePresenter.renderLiteVisuals(
            {
              currentStage: stageKey,
              step,
              m: resolved.m,
              n: resolved.n,
              modelId: id,
              isReverse: false,
              isGridProblem: false,
            },
            steps,
            0,
            doc.getElementById('algo-main-container')
          );

          const card1El = doc.getElementById('grid-container');
          const card2El = doc.getElementById('memo-array-container');
          const card1Title = doc.getElementById('card1-title')?.textContent || '';

          const card1Html = card1El?.innerHTML || '';
          const card2Html = card2El?.innerHTML || '';

          // 陷阱 1 触发判定：非 2D 问题且 Card 2 已渲染了二维决策表，Card 1 内部绝对不允许也渲染相同的二维决策表
          const card2HasTable = card2Html.includes('<table') || card2Html.includes('grid-cell') || card2Html.includes('dp-table');
          const card1HasTable = card1Html.includes('<table') || (card1Html.includes('grid-cell') && (step.grid && step.grid.length > 1));

          if (card2HasTable && card1HasTable && step.grid && step.grid.length > 1) {
            violations.push(
              `🚨 [DOUBLE_RENDER_TRAP] ${id} (${stageKey}): Card 1 与 Card 2 严重重复！同时渲染了 ${step.grid.length}×${step.grid[0].length} 的二维矩阵！`
            );
          }

          // 陷阱 2 触发判定：若 Card 1 标为一维状态槽位，其内部绝对不允许塞入多行矩阵
          if (card1Title.includes('一维状态槽位') && step.grid && step.grid.length > 1) {
            if (card1Html.includes('初始距离') || card1Html.includes('到达用时') || (card1El?.querySelectorAll('tr')?.length || 0) > 1) {
              violations.push(
                `🚨 [1D_SLOT_CONTAMINATION_TRAP] ${id} (${stageKey}): Card 1 标题声明为一维槽位，但内部塞入了 ${step.grid.length} 行表格，列标题发生挤压！`
              );
            }
          }
        }
      }

      expect(
        violations,
        `❌ 以下算法击中了卡片双重镜像重复或一维槽位污染红灯:\n${violations.join('\n')}`
      ).toEqual([]);
    });
  });

  // ==========================================================================
  // 红灯 3 & 4: 标题与真实内容脑裂 & 规格徽章撒谎陷阱
  // ==========================================================================
  describe('🚨 红灯陷阱 3 & 4: 标题内容脑裂与规格徽章撒谎', () => {
    it('Card 2 的标题、描述和右上角规格徽章必须与实际渲染内容 100% 严密对齐，严禁出现“标题是树内容是表”或尺寸撒谎', () => {
      const violations: string[] = [];

      for (const id of LOCKED_TOP_LEVEL_ALGORITHMS) {
        if (!AlgorithmModelRepository.hasModel(id)) continue;
        const model = AlgorithmModelRepository.getModel(id);
        const resolved = ProblemDimensionResolver.resolve(id, model.defaultParams);

        for (const stageKey of ['stage-1', 'stage-2', 'stage-3', 'stage-4']) {
          const stageNum = parseInt(stageKey.replace('stage-', ''), 10);
          const steps = UniversalStageEngine.generateSteps(model, {
            stage: stageNum,
            m: resolved.m,
            n: resolved.n,
            direction: 'forward',
          });

          if (!steps || steps.length === 0) continue;
          const step = steps[0];

          const doc = getFreshStageDOM();
          const stageConfig = model.stages?.[stageKey] || {};
          StageNavigationCoordinator.updateHeaderMeta(
            model,
            stageConfig,
            stageKey,
            'forward',
            resolved.m,
            resolved.n
          );

          StateSpacePresenter.renderLiteVisuals(
            {
              currentStage: stageKey,
              step,
              m: resolved.m,
              n: resolved.n,
              modelId: id,
              isReverse: false,
              isGridProblem: false,
            },
            steps,
            0,
            doc.getElementById('algo-main-container')
          );

          const card2TitleEl = doc.getElementById('card2-title');
          const badgeEl = doc.getElementById('badge-memo-len');
          const card2ContentEl = doc.getElementById('memo-array-container');

          const card2Title = card2TitleEl?.textContent || '';
          const badgeText = badgeEl?.textContent || '';
          const card2Html = card2ContentEl?.innerHTML || '';

          // 陷阱 3 判定：内容是二维决策表，标题却叫“树 / Tree / 拓扑树”
          const hasTable = card2Html.includes('<table') || card2Html.includes('dp-table') || (card2Html.includes('grid-cell') && step.grid);
          const hasTreeSvg = card2Html.includes('<svg') && card2Html.includes('tree');

          if (hasTable && !hasTreeSvg) {
            if (card2Title.includes('树') || card2Title.toLowerCase().includes('tree')) {
              violations.push(
                `🚨 [SPLIT_BRAIN_TRAP] ${id} (${stageKey}): Card 2 实际渲染了二维状态表，但标题却赫然写着 "${card2Title}"！形成严重脑裂！`
              );
            }
          }

          // 陷阱 4 判定：当 Card 2 渲染了特定尺寸矩阵（如 3×5），徽章却显示默认的 1×6
          if (step.grid && step.grid.length > 1 && step.grid[0] && step.grid[0].length > 0) {
            const actualRows = step.grid.length;
            const actualCols = step.grid[0].length;
            const expectedBadge = `${actualRows} × ${actualCols}`;

            if (badgeText.includes('×') && badgeText !== expectedBadge && !hasTreeSvg) {
              violations.push(
                `🚨 [BADGE_GEOMETRY_LIE_TRAP] ${id} (${stageKey}): Card 2 矩阵实际规模为 ${actualRows}×${actualCols}，但右上角徽章却撒谎显示 "${badgeText}"！`
              );
            }
          }
        }
      }

      expect(
        violations,
        `❌ 以下算法击中了标题内容脑裂或规格徽章撒谎红灯:\n${violations.join('\n')}`
      ).toEqual([]);
    });
  });

  // ==========================================================================
  // 红灯 5 & 6: 贪心类目伪造 DP 术语 & DOM 泄露 [object Object] 陷阱
  // ==========================================================================
  describe('🚨 红灯陷阱 5 & 6: 贪心类目 DP 污染与 [object Object] 泄露', () => {
    it('贪心算法绝对禁止硬编码暴露动态规划伪术语，且所有卡片 HTML 绝对禁止打印 [object Object]', () => {
      const violations: string[] = [];

      for (const id of LOCKED_TOP_LEVEL_ALGORITHMS) {
        if (!AlgorithmModelRepository.hasModel(id)) continue;
        const model = AlgorithmModelRepository.getModel(id);
        const resolved = ProblemDimensionResolver.resolve(id, model.defaultParams);

        for (const stageKey of ['stage-1', 'stage-2', 'stage-3', 'stage-4']) {
          const stageNum = parseInt(stageKey.replace('stage-', ''), 10);
          const steps = UniversalStageEngine.generateSteps(model, {
            stage: stageNum,
            m: resolved.m,
            n: resolved.n,
            direction: 'forward',
          });

          if (!steps || steps.length === 0) continue;
          const step = steps[0];

          const doc = getFreshStageDOM();
          const stageConfig = model.stages?.[stageKey] || {};
          StageNavigationCoordinator.updateHeaderMeta(
            model,
            stageConfig,
            stageKey,
            'forward',
            resolved.m,
            resolved.n
          );

          StateSpacePresenter.renderLiteVisuals(
            {
              currentStage: stageKey,
              step,
              m: resolved.m,
              n: resolved.n,
              modelId: id,
              isReverse: false,
              isGridProblem: false,
            },
            steps,
            0,
            doc.getElementById('algo-main-container')
          );

          const fullHtml = doc.body.innerHTML;

          // 陷阱 6 判定：全页面严禁出现 [object Object]
          if (fullHtml.includes('[object Object]')) {
            violations.push(
              `🚨 [OBJECT_LEAK_TRAP] ${id} (${stageKey}): 页面渲染中泄露了 "[object Object]" 原始对象字符串！`
            );
          }

          // 陷阱 5 判定：纯贪心推进阶段严禁暴露“动态规划状态转移方程 dp[i][j]”等硬编码伪术语
          if (model.category === 'greedy' && ((stageConfig as any)?.type === 'greedy' || (stageConfig as any)?.type === 'state-compression')) {
            const card2Title = doc.getElementById('card2-title')?.textContent || '';
            const card2Desc = doc.getElementById('card2-desc')?.textContent || '';
            if (card2Title.includes('动态规划') || card2Title.includes('int[] memo') || card2Desc.includes('dp[i][j]')) {
              violations.push(
                `🚨 [GREEDY_DP_POLLUTION_TRAP] ${id} (${stageKey}): 贪心算法中硬编码了动态规划伪术语: "${card2Title}" / "${card2Desc}"`
              );
            }
          }
        }
      }

      expect(
        violations,
        `❌ 以下算法击中了 DP 术语污染或 [object Object] 泄露红灯:\n${violations.join('\n')}`
      ).toEqual([]);
    });
  });

  // ==========================================================================
  // 红灯 7 & 8: 阶段 2 假决策树/空树挂载 & 代码行号断流越界陷阱
  // ==========================================================================
  describe('🚨 红灯陷阱 7 & 8: 阶段 2 空树与代码行号断流越界', () => {
    it('Stage 2 声明为树结构时严禁空树挂载，且所有步骤必须具备合法范围内的代码行号', () => {
      const violations: string[] = [];

      for (const id of LOCKED_TOP_LEVEL_ALGORITHMS) {
        if (!AlgorithmModelRepository.hasModel(id)) continue;
        const model = AlgorithmModelRepository.getModel(id);
        const resolved = ProblemDimensionResolver.resolve(id, model.defaultParams);

        for (const stageKey of ['stage-1', 'stage-2', 'stage-3', 'stage-4']) {
          const stageNum = parseInt(stageKey.replace('stage-', ''), 10);
          const steps = UniversalStageEngine.generateSteps(model, {
            stage: stageNum,
            m: resolved.m,
            n: resolved.n,
            direction: 'forward',
          });

          if (!steps || steps.length === 0) {
            violations.push(`🚨 [STEP_STARVATION_TRAP] ${id} (${stageKey}): 未生成任何有效步骤！`);
            continue;
          }

          // 陷阱 7 判定：Stage 2 若声明为决策树，step 必须携带有效 treeRoot
          const stageConfig = model.stages?.[stageKey];
          const nameStr = typeof stageConfig?.name === 'string' ? stageConfig.name : '';
          const card2Str = typeof stageConfig?.card2Title === 'string' ? stageConfig.card2Title : '';
          const descStr = typeof stageConfig?.desc === 'string' ? stageConfig.desc : '';

          const isTreeDeclared =
            stageKey === 'stage-2' &&
            (nameStr.includes('树') ||
             card2Str.includes('树') ||
             descStr.includes('树') ||
             descStr.includes('分支'));

          if (isTreeDeclared) {
            const hasValidTree = steps.some((s) => s.treeRoot && s.treeRoot.children && s.treeRoot.children.length > 0);
            if (!hasValidTree) {
              violations.push(
                `🚨 [EMPTY_TREE_TRAP] ${id} (${stageKey}): 声明为树形决策展开，但所有步骤均未挂载有效的 step.treeRoot 或子节点为空！导致界面显示“暂无递归调用树”！`
              );
            }
          }

          // 陷阱 8 判定：代码行号必须为有效数字且不能越界
          const stageCode = (stageConfig?.code?.forward as any)?.source || (stageConfig?.code?.forward as any)?.content || '';
          const totalCodeLines = stageCode ? stageCode.split('\n').length : 50;

          for (let idx = 0; idx < steps.length; idx++) {
            const s = steps[idx];
            const line = s.line ?? s.codeLine;
            if (typeof line !== 'number' || isNaN(line) || line < 1) {
              violations.push(
                `🚨 [CODE_LINE_TRAP] ${id} (${stageKey}, 步骤 ${idx + 1}): line 未定义或无效 (line=${line})！导致代码终端黑屏！`
              );
              break;
            }
            if (line > totalCodeLines + 5) {
              violations.push(
                `🚨 [CODE_LINE_OVERFLOW_TRAP] ${id} (${stageKey}, 步骤 ${idx + 1}): 行号越界 (line=${line} > 总行数 ${totalCodeLines})！`
              );
              break;
            }
          }
        }
      }

      expect(
        violations,
        `❌ 以下算法击中了假决策树或代码联动行号断流越界红灯:\n${violations.join('\n')}`
      ).toEqual([]);
    });
  });

  // ==========================================================================
  // 红灯 9 & 10: Card 1 缺失沙盘/黑屏 & 内联样式注入 undefined/NaN 陷阱
  // ==========================================================================
  describe('🚨 红灯陷阱 9 & 10: Card 1 黑屏无沙盘与内联样式污染', () => {
    it('Card 1 容器严禁内容为空或隐藏，且渲染出的 DOM 绝对禁止含有 undefined 或 NaN 的 style', () => {
      const violations: string[] = [];

      for (const id of LOCKED_TOP_LEVEL_ALGORITHMS) {
        if (!AlgorithmModelRepository.hasModel(id)) continue;
        const model = AlgorithmModelRepository.getModel(id);
        const resolved = ProblemDimensionResolver.resolve(id, model.defaultParams);

        for (const stageKey of ['stage-1', 'stage-2', 'stage-3', 'stage-4']) {
          const stageNum = parseInt(stageKey.replace('stage-', ''), 10);
          const steps = UniversalStageEngine.generateSteps(model, {
            stage: stageNum,
            m: resolved.m,
            n: resolved.n,
            direction: 'forward',
          });

          if (!steps || steps.length === 0) continue;
          const step = steps[0];

          const doc = getFreshStageDOM();
          const stageConfig = model.stages?.[stageKey] || {};
          StageNavigationCoordinator.updateHeaderMeta(
            model,
            stageConfig,
            stageKey,
            'forward',
            resolved.m,
            resolved.n
          );

          StateSpacePresenter.renderLiteVisuals(
            {
              currentStage: stageKey,
              step,
              m: resolved.m,
              n: resolved.n,
              modelId: id,
              isReverse: false,
              isGridProblem: false,
            },
            steps,
            0,
            doc.getElementById('algo-main-container')
          );

          const card1El = doc.getElementById('grid-container');
          const card1Wrapper = doc.getElementById('card1-wrapper');

          // 陷阱 9 判定：Card 1 容器内容为空或被隐藏
          if (card1Wrapper?.style.display === 'none' || (card1El && card1El.innerHTML.trim() === '')) {
            violations.push(
              `🚨 [MISSING_INPUT_SANDBOX_TRAP] ${id} (${stageKey}): Card 1 实体沙盘缺失或被隐藏！用户画面呈现黑屏白屏空白留白！`
            );
          }

          // 陷阱 10 判定：内联样式注入 NaN 或 undefined
          const html = doc.body.innerHTML;
          if (html.includes('NaNpx') || html.includes('undefinedpx') || html.includes('style="width: NaN') || html.includes('style="height: NaN')) {
            violations.push(
              `🚨 [INLINE_STYLE_INJECTION_TRAP] ${id} (${stageKey}): DOM 内联样式中注入了 NaN 或 undefined！`
            );
          }
        }
      }

      expect(
        violations,
        `❌ 以下算法击中了 Card 1 黑屏无沙盘或内联样式污染红灯:\n${violations.join('\n')}`
      ).toEqual([]);
    });
  });

  // ==========================================================================
  // 红灯 11 & 12: 单元格数值 NaN 崩溃 & 步骤日志流未产生陷阱
  // ==========================================================================
  describe('🚨 红灯陷阱 11 & 12: 单元格数值 NaN 崩溃与日志流枯竭', () => {
    it('表格和槽位中严禁出现 NaN/undefined 单元格文本，且步骤日志必须充实具备中文解说', () => {
      const violations: string[] = [];

      for (const id of LOCKED_TOP_LEVEL_ALGORITHMS) {
        if (!AlgorithmModelRepository.hasModel(id)) continue;
        const model = AlgorithmModelRepository.getModel(id);
        const resolved = ProblemDimensionResolver.resolve(id, model.defaultParams);

        for (const stageKey of ['stage-1', 'stage-2', 'stage-3', 'stage-4']) {
          const stageNum = parseInt(stageKey.replace('stage-', ''), 10);
          const steps = UniversalStageEngine.generateSteps(model, {
            stage: stageNum,
            m: resolved.m,
            n: resolved.n,
            direction: 'forward',
          });

          if (!steps || steps.length === 0) continue;

          for (let sIdx = 0; sIdx < Math.min(3, steps.length); sIdx++) {
            const step = steps[sIdx];
            const doc = getFreshStageDOM();
            const stageConfig = model.stages?.[stageKey] || {};
            StageNavigationCoordinator.updateHeaderMeta(
              model,
              stageConfig,
              stageKey,
              'forward',
              resolved.m,
              resolved.n
            );

            StateSpacePresenter.renderLiteVisuals(
              {
                currentStage: stageKey,
                step,
                m: resolved.m,
                n: resolved.n,
                modelId: id,
                isReverse: false,
                isGridProblem: false,
              },
              steps,
              sIdx,
              doc.getElementById('algo-main-container')
            );

            const card2El = doc.getElementById('memo-array-container');
            const card2Text = card2El?.textContent || '';

            // 陷阱 11 判定：单元格显示 NaN 或 undefined
            if (card2Text.includes('NaN') || card2Text.includes('undefined')) {
              violations.push(
                `🚨 [CELL_VALUE_NAN_TRAP] ${id} (${stageKey}, 步骤 ${sIdx + 1}): Card 2 单元格文本包含 NaN 或 undefined！数据计算崩溃！`
              );
              break;
            }

            // 陷阱 12 判定：日志内容为空或未生成
            const logMsg = step.decision || step.message || step.msg || step.log || step.tag;
            if (!logMsg || typeof logMsg !== 'string' || logMsg.trim().length === 0) {
              violations.push(
                `🚨 [LOG_STREAM_OVERFLOW_TRAP] ${id} (${stageKey}, 步骤 ${sIdx + 1}): 步骤日志 msg/log/tag/decision 为空！用户无法理解动作意图！`
              );
              break;
            }
          }
        }
      }

      expect(
        violations,
        `❌ 以下算法击中了单元格数值崩溃或日志流枯竭红灯:\n${violations.join('\n')}`
      ).toEqual([]);
    });
  });

  // ==========================================================================
  // 红灯 13 & 14: 双向推导语义倒挂与假对偶偷懒克隆陷阱
  // ==========================================================================
  describe('🚨 红灯陷阱 13 & 14: 双向推导语义倒挂与假对偶偷懒克隆', () => {
    it('当模型声明支持 reverse 逆向推导时，必须生成充分有效步骤且严禁 100% 克隆正向步骤', () => {
      const violations: string[] = [];

      for (const id of LOCKED_TOP_LEVEL_ALGORITHMS) {
        if (!AlgorithmModelRepository.hasModel(id)) continue;
        const model = AlgorithmModelRepository.getModel(id);
        if (!model.directions?.reverse) continue;

        const resolved = ProblemDimensionResolver.resolve(id, model.defaultParams);

        for (const stageKey of ['stage-1', 'stage-3']) {
          const stageNum = parseInt(stageKey.replace('stage-', ''), 10);
          const fSteps = UniversalStageEngine.generateSteps(model, {
            stage: stageNum,
            m: resolved.m,
            n: resolved.n,
            direction: 'forward',
          });

          const rSteps = UniversalStageEngine.generateSteps(model, {
            stage: stageNum,
            m: resolved.m,
            n: resolved.n,
            direction: 'reverse',
          });

          // 陷阱 13 判定：声明了 reverse，但 reverse 步骤数为空或过少 (< 3)
          if (!rSteps || rSteps.length < 3) {
            violations.push(
              `🚨 [REVERSE_DIRECTION_STARVATION_TRAP] ${id} (${stageKey}): 声明了 reverse 逆向模式，但生成的逆向步骤数仅为 ${rSteps?.length || 0}！`
            );
            continue;
          }

          // 陷阱 14 判定：假对偶克隆（若正向步数 > 3，逆向步数与正向完全相同且所有步骤文本 100% 毫无差异）
          if (fSteps.length > 3 && rSteps.length === fSteps.length) {
            const getStepText = (s?: any) => (s ? (s.decision || s.msg || s.log || s.tag || '') : '');
            let isIdenticalClone = true;
            for (let i = 0; i < fSteps.length; i++) {
              if (getStepText(fSteps[i]) !== getStepText(rSteps[i]) || fSteps[i].line !== rSteps[i].line) {
                isIdenticalClone = false;
                break;
              }
            }
            if (isIdenticalClone) {
              violations.push(
                `🚨 [FAKE_REVERSE_CLONE_TRAP] ${id} (${stageKey}): 逆向步骤与正向步骤文本 100% 镜像完全相同，属于未真正实现的假对偶模式！`
              );
            }
          }
        }
      }

      expect(
        violations,
        `❌ 以下算法击中了双向推导倒挂或假逆向克隆红灯:\n${violations.join('\n')}`
      ).toEqual([]);
    });
  });

  // ==========================================================================
  // 红灯 15 & 16: 激活单元格越界与吉祥物指示符悬空陷阱
  // ==========================================================================
  describe('🚨 红灯陷阱 15 & 16: 激活单元格越界与吉祥物指示符悬空', () => {
    it('二维表格当前操作坐标 (step.i, step.j) 与探查器必须在合法网格边界内，严禁越界悬空', () => {
      const violations: string[] = [];

      for (const id of LOCKED_TOP_LEVEL_ALGORITHMS) {
        if (!AlgorithmModelRepository.hasModel(id)) continue;
        const model = AlgorithmModelRepository.getModel(id);
        const resolved = ProblemDimensionResolver.resolve(id, model.defaultParams);

        // 检验阶段 3 状态表格
        const steps = UniversalStageEngine.generateSteps(model, {
          stage: 3,
          m: resolved.m,
          n: resolved.n,
          direction: 'forward',
        });

        if (!steps || steps.length === 0) continue;

        for (let idx = 0; idx < steps.length; idx++) {
          const step = steps[idx];
          if (!step.grid || !Array.isArray(step.grid) || step.grid.length === 0) continue;

          const numRows = step.grid.length;
          const numCols = Array.isArray(step.grid[0]) ? step.grid[0].length : 0;
          if (numCols === 0) continue;

          // 陷阱 15 判定：step.i 越界
          if (typeof step.i === 'number' && !isNaN(step.i)) {
            if (step.i < 0 || step.i >= numRows) {
              violations.push(
                `🚨 [CELL_ROW_OUT_OF_BOUNDS_TRAP] ${id} (stage-3, 步骤 ${idx + 1}): 当前行索引 i=${step.i} 超出表格行界 [0..${numRows - 1}]！`
              );
              break;
            }
          }

          // 陷阱 16 判定：step.j 越界
          if (typeof step.j === 'number' && !isNaN(step.j)) {
            if (step.j < 0 || step.j >= numCols) {
              violations.push(
                `🚨 [CELL_COL_OUT_OF_BOUNDS_TRAP] ${id} (stage-3, 步骤 ${idx + 1}): 当前列索引 j=${step.j} 超出表格列界 [0..${numCols - 1}]！`
              );
              break;
            }
          }
        }
      }

      expect(
        violations,
        `❌ 以下算法击中了激活单元格越界或指示符悬空红灯:\n${violations.join('\n')}`
      ).toEqual([]);
    });
  });

  // ==========================================================================
  // 红灯 17 & 18: 表头列数错位与槽位数据污染陷阱
  // ==========================================================================
  describe('🚨 红灯陷阱 17 & 18: 表头列数错位与槽位数据污染', () => {
    it('表格 colLabels 列数必须与数据列完全对齐，且 slots 数组严禁包含 undefined/null/NaN/[object Object]', () => {
      const violations: string[] = [];

      for (const id of LOCKED_TOP_LEVEL_ALGORITHMS) {
        if (!AlgorithmModelRepository.hasModel(id)) continue;
        const model = AlgorithmModelRepository.getModel(id);
        const resolved = ProblemDimensionResolver.resolve(id, model.defaultParams);

        for (const stageKey of ['stage-1', 'stage-2', 'stage-3', 'stage-4']) {
          const stageNum = parseInt(stageKey.replace('stage-', ''), 10);
          const steps = UniversalStageEngine.generateSteps(model, {
            stage: stageNum,
            m: resolved.m,
            n: resolved.n,
            direction: 'forward',
          });

          if (!steps || steps.length === 0) continue;

          for (let sIdx = 0; sIdx < Math.min(5, steps.length); sIdx++) {
            const step = steps[sIdx];

            // 陷阱 18 判定：slots 数组污染
            if (step.slots && Array.isArray(step.slots)) {
              for (let i = 0; i < step.slots.length; i++) {
                const item = String(step.slots[i]);
                if (item === 'undefined' || item === 'null' || item === 'NaN' || item.includes('[object Object]')) {
                  violations.push(
                    `🚨 [SLOTS_DATA_CORRUPTION_TRAP] ${id} (${stageKey}, 步骤 ${sIdx + 1}): slots[${i}] 含有污染数据 "${item}"！`
                  );
                  break;
                }
              }
            }

            // 陷阱 17 判定：纯网格 colLabels 与 grid 列数严重错位（差异 > 1）
            if (step.grid && Array.isArray(step.grid) && step.grid[0] && Array.isArray(step.grid[0]) && step.colLabels) {
              const gridCols = step.grid[0].length;
              const labelCols = step.colLabels.length;
              // 允许 labelCols == gridCols 或 labelCols == gridCols + 1 (带有首列表头)
              if (Math.abs(gridCols - labelCols) > 1 && labelCols > 0) {
                violations.push(
                  `🚨 [COL_HEADER_MISALIGNMENT_TRAP] ${id} (${stageKey}, 步骤 ${sIdx + 1}): colLabels 列数 (${labelCols}) 与实际网格列数 (${gridCols}) 严重错位！`
                );
                break;
              }
            }
          }
        }
      }

      expect(
        violations,
        `❌ 以下算法击中了表头列数错位或槽位数据污染红灯:\n${violations.join('\n')}`
      ).toEqual([]);
    });
  });

  // ==========================================================================
  // 红灯 19 & 20: 步骤密度枯竭假实现与死循环停滞陷阱
  // ==========================================================================
  describe('🚨 红灯陷阱 19 & 20: 步骤密度枯竭假实现与死循环停滞', () => {
    it('所有已锁定算法的全部阶段必须产生充分步骤 (>= 4 步)，且连续步骤严禁行号与变量死锁停滞', () => {
      const violations: string[] = [];

      for (const id of LOCKED_TOP_LEVEL_ALGORITHMS) {
        if (!AlgorithmModelRepository.hasModel(id)) continue;
        const model = AlgorithmModelRepository.getModel(id);
        const resolved = ProblemDimensionResolver.resolve(id, model.defaultParams);

        for (const stageKey of ['stage-1', 'stage-2', 'stage-3', 'stage-4']) {
          const stageNum = parseInt(stageKey.replace('stage-', ''), 10);
          const steps = UniversalStageEngine.generateSteps(model, {
            stage: stageNum,
            m: resolved.m,
            n: resolved.n,
            direction: 'forward',
          });

          // 陷阱 19 判定：步骤总数过少（极简单常数 DP 如 fibonacci 除外）
          if (id !== 'fibonacci' && id !== 'climb-stairs') {
            if (!steps || steps.length < 4) {
              violations.push(
                `🚨 [STEP_DENSITY_STARVATION_TRAP] ${id} (${stageKey}): 步骤数量严重枯竭 (仅产生 ${steps?.length || 0} 步)！属于偷懒假实现！`
              );
              continue;
            }
          }

          // 陷阱 20 判定：连续 5 步以上完全死锁停滞（line 与 msg 完全不动）
          let stagnantCount = 1;
          for (let i = 1; i < steps.length; i++) {
            const prev = steps[i - 1];
            const curr = steps[i];
            const prevMsg = prev.decision || prev.msg || '';
            const currMsg = curr.decision || curr.msg || '';
            if (prev.line === curr.line && prevMsg === currMsg && prevMsg.length > 0) {
              stagnantCount++;
              if (stagnantCount >= 6) {
                violations.push(
                  `🚨 [DEAD_LOOP_STAGNATION_TRAP] ${id} (${stageKey}, 步骤 ${i + 1}): 连续 ${stagnantCount} 步停留在行号 ${curr.line} 且描述完全相同！属于死循环停滞！`
                );
                break;
              }
            } else {
              stagnantCount = 1;
            }
          }
        }
      }

      expect(
        violations,
        `❌ 以下算法击中了步骤密度枯竭或死锁停滞红灯:\n${violations.join('\n')}`
      ).toEqual([]);
    });
  });
});
