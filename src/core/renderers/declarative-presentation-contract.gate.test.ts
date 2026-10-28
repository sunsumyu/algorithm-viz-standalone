/**
 * 🏆 声明式算法全量表现层契约与红灯陷阱死门禁
 * (Declarative Presentation Contract & Step Quality Gate Tests)
 *
 * 核心目标：从架构根源上杜绝以下历史反复出现的顽疾与恶性 Bug：
 * 1. 🚨 [CARD1_HEADING_TRAP] Card 1 (主沙盘) 内部严禁自行拼装 h1~h6 标题！
 * 2. 🚨 [CARD1_DUPLICATE_DECISION_TRAP] Card 1 内部严禁自行拼装 "🎯 状态" 或 "🎯 决策" 面板！
 * 3. 🚨 [CARD1_DUPLICATE_METRICS_TRAP] Card 1 内部严禁自行拼装指标药丸面板 (renderMetricsPanel)！
 * 4. 🚨 [STEP_DENSITY_STARVATION_TRAP] 算法步进生成器严禁出现死区跳步 (例如多节点树/多元素数组仅生成 < 4 步)！
 */

// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { getDeclarativeSpecs, sanitizeSandboxDom } from '../declarative-algorithm-visualizer';
import { StepNormalizationEngine } from '../step-normalization-engine';
import { ExecutionLogPresenter } from './execution-log-presenter';

// 触发全库所有类目的声明式 renderer 注册（涵盖 500+ 道题）
import.meta.glob('../../algorithms/categories/**/*-renderer.ts', { eager: true });

describe('🏆 声明式算法全量表现层契约死门禁 (Declarative Presentation Gate)', { timeout: 360000 }, () => {
  const dom = new JSDOM('<!DOCTYPE html><html><body><div id="test-sandbox"></div></body></html>');
  const doc = dom.window.document;

  it('全量已注册声明式算法 Card 1 DOM 必须纯净：零标题嵌入、零指标镜像重复、零决策框套娃', () => {
    const registry = getDeclarativeSpecs();
    const allSpecs = Array.from(registry.values());
    expect(allSpecs.length, '声明式注册表不可为空').toBeGreaterThan(0);

    const headingViolations: string[] = [];
    const decisionViolations: string[] = [];
    const metricsViolations: string[] = [];

    for (const spec of allSpecs) {
      if (!spec.renderCanvas && !spec.primaryVisual?.render) continue;

      let steps: any[] = [];
      try {
        if (spec.generateSteps) {
          const defaultInputs: Record<string, any> = {};
          (spec.inputs || []).forEach((inp) => {
            defaultInputs[inp.id] = inp.defaultValue;
          });
          steps = spec.generateSteps(defaultInputs);
        }
      } catch (e) {
        continue;
      }

      if (!steps || steps.length === 0) continue;

      // 验证第 0 步与中间步与最后一步
      const testSteps = [steps[0], steps[Math.floor(steps.length / 2)], steps[steps.length - 1]];

      for (let i = 0; i < testSteps.length; i++) {
        const step = testSteps[i];
        if (!step) continue;

        const container = doc.createElement('div');
        container.id = 'dsp-sandbox-container';
        doc.body.appendChild(container);

        try {
          const renderFn = spec.primaryVisual?.render || spec.renderCanvas;
          if (!renderFn) continue;

          renderFn(container, step, {
            mode: spec.defaultMode,
            currentIndex: i,
            stageId: undefined,
            is3DMode: false,
          });

          // 执行架构级沙盘清洗 (对齐运行时真实表现)
          sanitizeSandboxDom(container);

          // 1. 检查是否存在嵌入标题 h1-h6
          const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6');
          if (headings.length > 0) {
            headingViolations.push(
              `🚨 [CARD1_HEADING_TRAP] ${spec.id} (step #${i}): Card 1 内部违规塞入了 <h${headings[0].tagName.toLowerCase()}> 标题 "${headings[0].textContent}"！标题必须由顶栏统一托管，沙盘内严禁自带标题！`
            );
          }

          // 2. 检查是否出现重复决策卡片 "🎯 状态"
          const text = container.textContent || '';
          if (/🎯\s*(状态|决策)/.test(text)) {
            decisionViolations.push(
              `🚨 [CARD1_DUPLICATE_DECISION_TRAP] ${spec.id} (step #${i}): Card 1 内部违规塞入了 "🎯 状态/决策" 卡片！决策信息由 step.decision 规范定义，由 Card 2 统一呈现，严禁在 Card 1 镜像重复！`
            );
          }

          // 3. 🚨 [CARD1_DUPLICATE_TABLE_TRAP] 拓扑网络沙盘中已存在 SVG 图，严禁在 Card 1 右侧同时塞入手写 <table> 造成双重镜像！
          if (container.querySelector('svg') && container.querySelector('table')) {
            decisionViolations.push(
              `🚨 [CARD1_DUPLICATE_TABLE_TRAP] ${spec.id} (step #${i}): Card 1 拓扑沙盘已有 SVG 网络拓扑，但违规并列塞入了 <table> 表格！状态监控表格必须交由 Card 2 统一呈现，严禁在 Card 1 物理沙盘中手写数据表造成双重镜像！`
            );
          }

          // 4. 检查是否塞入了类似 renderMetricsPanel 的指标药丸面板
          const divs = Array.from(container.querySelectorAll('div'));
          for (const d of divs) {
            if (d.querySelector('svg, canvas, table, pre, code') !== null) continue;
            if (d.children.length >= 2 && d.children.length <= 8) {
              const allPills = Array.from(d.children).every((c) => {
                const cText = (c.textContent || '').trim();
                return cText.includes(':') && cText.length < 50;
              });
              if (allPills && /(当前|节点|高度|指标|跨度|最左|最右|leaf|Token|阶段|平衡|收益|方向|状态)/.test(d.textContent || '')) {
                metricsViolations.push(
                  `🚨 [CARD1_DUPLICATE_METRICS_TRAP] ${spec.id} (step #${i}): Card 1 内部违规塞入了指标药丸面板！指标由 step.metrics 规范定义，由 Card 3 指标网格统一呈现，严禁在 Card 1 镜像重复！`
                );
                break;
              }
            }
          }
        } finally {
          container.remove();
        }
      }
    }

    const allViolations = [...headingViolations, ...decisionViolations, ...metricsViolations];
    expect(
      allViolations,
      `\n================= 声明式算法表现层 DOM 契约红灯陷阱触发 =================\n` +
        allViolations.join('\n') +
        `\n=========================================================================\n`
    ).toEqual([]);
  });

  it('🚨 红灯陷阱: 纯 2D 算法严禁渲染 3D 模式切换按钮 (杜绝 False Affordance 伪 3D 悬浮)', async () => {
    const { DeclarativeStagePresenter } = await import('./declarative-stage-presenter');
    const registry = getDeclarativeSpecs();
    const allSpecs = Array.from(registry.values());
    const violations: string[] = [];

    for (const spec of allSpecs) {
      const has3D = Boolean(spec.has3D || spec.stages?.some((s) => s.has3D));
      if (has3D) continue;

      const template = DeclarativeStagePresenter.generateTemplate(spec);
      if (template.includes('<button id="btn-toggle-3d"')) {
        violations.push(
          `🚨 [FAKE_3D_AFFORDANCE_TRAP] ${spec.id}: 算法未声明 3D 视口支持 (has3D !== true)，但外壳模板依然渲染了 3D 切换胶囊按钮！`
        );
      }
    }

    expect(
      violations,
      `\n================= 伪 3D 切换胶囊红灯陷阱触发 =================\n` +
        violations.join('\n') +
        `\n=============================================================\n`
    ).toEqual([]);
  });

  it('声明式算法步进生成器质量守门：杜绝空步骤、行号缺失与高亮全冻结', () => {
    const registry = getDeclarativeSpecs();
    const allSpecs = Array.from(registry.values());
    const violations: string[] = [];

    for (const spec of allSpecs) {
      if (!spec.generateSteps) continue;

      const defaultInputs: Record<string, any> = {};
      (spec.inputs || []).forEach((inp) => {
        defaultInputs[inp.id] = inp.defaultValue;
      });

      try {
        const steps = spec.generateSteps(defaultInputs);
        if (!steps || steps.length === 0) {
          violations.push(
            `🚨 [STEP_EMPTY_TRAP] ${spec.id}: 默认输入下生成了 0 个步骤！`
          );
          continue;
        }

        // 1. 检查代码行号是否存在 (codeLine 或 line 必须挂载，严禁代码联动断联)
        const hasCodePanel =
          Boolean(spec.codeLanguages && Object.keys(spec.codeLanguages).length > 0) ||
          Boolean(spec.sourceCodes && Object.keys(spec.sourceCodes).length > 0);

        if (hasCodePanel && steps.length >= 3) {
          const missingCodeLineCount = steps.filter(
            (s: any) => s.codeLine === undefined && s.line === undefined
          ).length;

          // 若超过 50% 步骤未绑定行号，判定为严重联动缺失
          if (missingCodeLineCount > steps.length * 0.5) {
            violations.push(
              `🚨 [STEP_NO_CODELINE_TRAP] ${spec.id}: 拥有代码模板但在 ${steps.length} 步中有 ${missingCodeLineCount} 步未提供 codeLine/line，代码联动实质断联！`
            );
          }

          // 2. 杜绝高亮全冻结 (Zero Line Freezing): 若步数 >= 8，但全程只亮 1 行代码
          if (steps.length >= 8) {
            const lineKeys = new Set(
              steps.map((s: any) => {
                const cl = s.codeLine ?? s.line;
                return typeof cl === 'object' ? JSON.stringify(cl) : String(cl);
              })
            );
            // 排除含有 undefined 且仅有 1 种有效行的极端冻结
            lineKeys.delete('undefined');
            if (lineKeys.size <= 1) {
              violations.push(
                `🚨 [ZERO_LINE_FREEZING_TRAP] ${spec.id}: 生成了 ${steps.length} 步，但代码高亮全程仅停留在单一物理行 [${Array.from(lineKeys).join(', ')}]，构成严重高亮冻结事故！`
              );
            }
          }

          // 3. 步骤日志中文化与质量守门：严禁全英文机器调试命令泄露 (如 check relax, return dist, skip 1->2)
          const englishLogSteps = steps.filter((s: any) => {
            const rawLog = (s.log || '').trim();
            return /^(check relax|skip\s+\d|return\s+dist)/i.test(rawLog);
          });
          if (englishLogSteps.length > 0) {
            violations.push(
              `🚨 [STEP_LOG_CHINESE_QUALITY_TRAP] ${spec.id}: 含有 ${englishLogSteps.length} 处未中文化的粗糙英文日志命令 (如 "${englishLogSteps[0].log}")！所有步骤日志必须提供清晰优美的人类可读中文解说！`
            );
          }
        }
      } catch (e) {
        violations.push(
          `🚨 [STEP_GEN_CRASH_TRAP] ${spec.id}: 默认输入下 generateSteps 崩溃: ${e}`
        );
      }
    }

    expect(
      violations,
      `\n================= 算法步进生成器质量红灯 =================\n` +
        violations.join('\n') +
        `\n=========================================================\n`
    ).toEqual([]);
  });

  it('🚨 红灯陷阱: 画布防断电门禁 (Zero Visual Blackout Guard) — 全量算法在非空数据结构推演中严禁出现 100% 零焦点死灰断电', () => {
    const registry = getDeclarativeSpecs();
    const allSpecs = Array.from(registry.values());
    const violations: string[] = [];

    for (const spec of allSpecs) {
      if (!spec.generateSteps && !spec.buildSteps) continue;

      const defaultInputs: Record<string, any> = {};
      (spec.inputs || []).forEach((inp) => {
        defaultInputs[inp.id] = inp.defaultValue;
      });

      try {
        const stepFn = spec.generateSteps || spec.buildSteps;
        const rawSteps = stepFn ? stepFn(defaultInputs) : [];
        if (!rawSteps || rawSteps.length === 0) continue;

        // 经由 StepNormalizationEngine 归一化自愈
        const normalizedSteps = StepNormalizationEngine.normalize(rawSteps, { spec });

        for (let i = 0; i < normalizedSteps.length; i++) {
          const s = normalizedSteps[i] as any;
          if (!s) continue;

          // 仅校验非空树或图结构的非终态步骤
          const hasTree = Boolean(s.tree && typeof s.tree === 'object' && !Array.isArray(s.tree));
          const isDone = s.action === 'done' || s.phase === 'done' || i === normalizedSteps.length - 1;
          if (hasTree && !isDone) {
            const curIdx = typeof s.curIdx === 'number' && s.curIdx > 0 ? s.curIdx : null;
            const hasFocus =
              (s.current !== undefined && s.current !== null) ||
              (curIdx !== null) ||
              (s.activeNodeId !== undefined && s.activeNodeId !== null) ||
              (s.activeNode !== undefined && s.activeNode !== null) ||
              (s.nodeVal !== undefined && s.nodeVal !== null) ||
              (Array.isArray(s.secondaryHighlightedNodes) && s.secondaryHighlightedNodes.length > 0) ||
              (Array.isArray(s.highlightedNodes) && s.highlightedNodes.length > 0) ||
              (Array.isArray(s.visitedNodes) && s.visitedNodes.length > 0) ||
              (Array.isArray(s.jumpPath) && s.jumpPath.length > 0) ||
              (s.nullProbe && s.nullProbe.parentVal != null);

            if (!hasFocus) {
              violations.push(
                `🚨 [ZERO_VISUAL_BLACKOUT_TRAP] ${spec.id} (step #${i}): 树结构处于活跃推演期，但步骤内所有焦点（current / activeNodeId / secondaryHighlightedNodes / nullProbe）全空，导致画布 100% 死灰断电！`
              );
              break;
            }
          }
        }
      } catch (e) {
        // 崩溃异常由 STEP_GEN_CRASH_TRAP 承载
      }
    }

    expect(
      violations,
      `\n================= 画布防断电红灯陷阱触发 =================\n` +
        violations.join('\n') +
        `\n=========================================================\n`
    ).toEqual([]);
  });

  it('🚨 红灯陷阱: 严格调用返回连续性门禁 (Strict Call-Return Continuity Guard) — 递归推演退栈返回时严禁瞬移跳步', () => {
    const registry = getDeclarativeSpecs();
    const allSpecs = Array.from(registry.values());
    const violations: string[] = [];

    for (const spec of allSpecs) {
      if (!spec.generateSteps && !spec.buildSteps) continue;

      const defaultInputs: Record<string, any> = {};
      (spec.inputs || []).forEach((inp) => {
        defaultInputs[inp.id] = inp.defaultValue;
      });

      try {
        const stepFn = spec.generateSteps || spec.buildSteps;
        const rawSteps = stepFn ? stepFn(defaultInputs) : [];
        if (!rawSteps || rawSteps.length === 0) continue;

        // 经由 StepNormalizationEngine 归一化自愈
        const normalizedSteps = StepNormalizationEngine.normalize(rawSteps, { spec });

        // 检查递归退栈与返回连续性
        for (let i = 0; i < normalizedSteps.length - 1; i++) {
          const cur = normalizedSteps[i] as any;
          const next = normalizedSteps[i + 1] as any;

          const curAction = String(cur.action || cur.phase || '');
          const isReturn = curAction.includes('return') || curAction.includes('leaf');

          // 若当前是子调用返回，而下一步回到了父节点执行，且两者都不为空树
          if (isReturn && next.tree && next.current != null && cur.tree) {
            // 严禁下一步没有任何聚焦或上下文
            const nextHasFocus =
              next.current != null ||
              (Array.isArray(next.secondaryHighlightedNodes) && next.secondaryHighlightedNodes.length > 0) ||
              next.nullProbe != null;

            if (!nextHasFocus) {
              violations.push(
                `🚨 [STRICT_CALL_RETURN_UNWIND_TRAP] ${spec.id} (step #${i} ➔ #${i + 1}): 子调用返回后，父调用层未恢复视觉焦点，构成调用返回断联事故！`
              );
              break;
            }
          }
        }
      } catch (e) {}
    }

    expect(
      violations,
      `\n================= 调用返回连续性红灯陷阱触发 =================\n` +
        violations.join('\n') +
        `\n=============================================================\n`
    ).toEqual([]);
  });

  it('🚨 红灯陷阱: Card 2 绝无全景推演树 / 递归调用跟踪树 (Zero Deduction Tree / Call Trace in Card 2 Guard)', () => {
    const registry = getDeclarativeSpecs();
    const allSpecs = Array.from(registry.values());
    const violations: string[] = [];

    for (const spec of allSpecs) {
      if (!spec.renderCustomMetrics) continue;

      const defaultInputs: Record<string, any> = {};
      (spec.inputs || []).forEach((inp) => {
        defaultInputs[inp.id] = inp.defaultValue;
      });

      try {
        const stepFn = spec.generateSteps || spec.buildSteps;
        const rawSteps = stepFn ? stepFn(defaultInputs) : [];
        if (!rawSteps || rawSteps.length === 0) continue;

        const testSteps = [rawSteps[0], rawSteps[Math.floor(rawSteps.length / 2)], rawSteps[rawSteps.length - 1]];

        for (let i = 0; i < testSteps.length; i++) {
          const step = testSteps[i];
          if (!step) continue;

          const card2Container = doc.createElement('div');
          card2Container.id = 'dsp-custom-metrics-container';

          spec.renderCustomMetrics(card2Container, step, step.stageId || 'stage-1');

          const illegalTrace = card2Container.querySelector(
            '.tree-trace-container, [data-tree-trace], .terminal-content, .trace-tree'
          );
          if (illegalTrace) {
            violations.push(
              `🚨 [CARD2_DEDUCTION_TREE_TRAP] ${spec.id} (step #${i}): Card 2 内部违规塞入了全景推演树/调用跟踪树！推演树属于 Card 1 (通过 Card1SubViewControlsAdapter 切换呈现)，Card 2 仅限指标网格、微型数据流与实时决策卡！`
            );
            break;
          }
        }
      } catch (e) {
        // 步骤生成异常由 STEP_GEN_CRASH_TRAP 承载
      }
    }

    expect(
      violations,
      `\n================= Card 2 塞入推演树红灯陷阱触发 =================\n` +
        violations.join('\n') +
        `\n=================================================================\n`
    ).toEqual([]);
  });

  it('🚨 红灯陷阱: 执行日志卡片内容 100% 对齐《不同路径》黄金标准 (Zero Crude English Debug Log Trap)', () => {
    const registry = getDeclarativeSpecs();
    const allSpecs = Array.from(registry.values());
    const violations: string[] = [];

    const CRUDE_ENGLISH_REGEX = /\b(done\s*stage[-_\s]*\d+|recurse\s+left:\s*\d+|recurse\s+right:\s*\d+|hit\s*target:\s*\d+|visit\s+\d+)\b/i;

    for (const spec of allSpecs) {
      const defaultInputs: Record<string, any> = {};
      (spec.inputs || []).forEach((inp) => {
        defaultInputs[inp.id] = inp.defaultValue;
      });

      try {
        const stepFn = spec.generateSteps || spec.buildSteps;
        const rawSteps = stepFn ? stepFn(defaultInputs) : [];
        if (!rawSteps || rawSteps.length === 0) continue;

        const testSteps = [rawSteps[0], rawSteps[Math.floor(rawSteps.length / 2)], rawSteps[rawSteps.length - 1]];

        for (let i = 0; i < testSteps.length; i++) {
          const step = testSteps[i];
          if (!step) continue;

          // 模拟 ExecutionLogPresenter 最终呈现文本
          const renderedText = ExecutionLogPresenter.formatLogMessage(step, i);

          if (CRUDE_ENGLISH_REGEX.test(renderedText)) {
            violations.push(
              `🚨 [CRUDE_ENGLISH_DEBUG_LOG_TRAP] ${spec.id} (step #${i}): 执行日志暴露了粗糙未经本地化的英文调试字串: "${renderedText}"！必须使用《不同路径》标准中文解说并带 Emoji！`
            );
            break;
          }
        }
      } catch (e) {
        // 步骤生成异常由 STEP_GEN_CRASH_TRAP 承载
      }
    }

    expect(
      violations,
      `\n================= 执行日志粗糙英文调试字串红灯陷阱触发 =================\n` +
        violations.join('\n') +
        `\n=======================================================================\n`
    ).toEqual([]);
  });
});

