# Spec: Semantic Anchor Code-Step Indexer & Unified Alignment Engine

## Problem Statement

As a learner and user of the algorithm visualizer, I experience incorrect, skipped, or misaligned code line highlights when stepping through algorithm execution (for example, stepping through unique paths in space-optimized mode where the update statement `dp[j] += dp[j - 1]` was skipped and the loop condition remained highlighted). 

From a system architecture perspective, algorithm step generators across 218 algorithms have been manually hardcoding 1-based line numbers for four programming languages (Java, Python, C++, and JavaScript) in step definitions (e.g. `{ java: 8, python: 7, cpp: 7, javascript: 5 }`). Every time code comments, whitespace, or code blocks are reformatted, these hardcoded line numbers immediately drift out of sync, causing recurring line-jumping bugs that require endless manual fixes. There is currently no single source of truth or compiler-level mechanism ensuring that step execution strictly and reliably aligns with the displayed code lines.

## Solution

Build a deep module **`CodeStepIndexer` (Semantic Anchor Code-Step Indexer)** that sits at the seam between code templates and the step execution engine:
1. **Semantic Anchor Annotations**: Algorithm code templates define semantic line anchors (such as `entry`, `init`, `loop-outer`, `loop-inner`, `update`, `return`) via unobtrusive inline tags or declarative line registries.
2. **Automated Multi-Language Line Compilation**: The `CodeStepIndexer` parses the code templates once and compiles a multi-language line index map (`Anchor -> { java: Line, python: Line, cpp: Line, javascript: Line }`).
3. **Declarative Step Authoring**: Step generation engines emit only semantic step anchors (e.g. `step.anchor = 'update'`), completely stripping hardcoded line numbers from step generators.
4. **Strict Line-by-Line Execution Invariant**: Loop constructs consistently generate distinct steps for loop condition inspection, loop body state transition, and function return.
5. **Compile-Time & Test-Time Auditor**: The test auditor statically validates that every step emitted by any algorithm maps to a valid, executable code line in all four languages, failing early if any anchor is missing or misaligned.

## User Stories

1. As a learner stepping through an algorithm in Java, I want the code highlight to step into each loop condition line and then into the inner update statement (e.g., `dp[j] += dp[j - 1]`), so that I can see the exact line of code producing each variable change.
2. As a learner switching from Java to Python during step-by-step debugging, I want the highlighted line to automatically adjust to Python's corresponding line without jumping to an unrelated line or comment, so that I can compare syntax and logic across languages seamlessly.
3. As a learner stepping through C++ or JavaScript code, I want the same step sequence to highlight the exact matching statement in C++ or JavaScript, so that I get identical pedagogical fidelity regardless of my preferred language.
4. As an algorithm author writing a new algorithm or stage, I want to attach semantic anchors (`@step:update`, `@step:loop-inner`) to my code templates rather than counting line numbers by hand, so that I cannot introduce line drift bugs.
5. As a maintainer reformatting code snippets, adding explanatory comments, or adjusting indentation, I want the line numbers to be recalculated automatically by the indexer, so that formatting changes never break stepping animations.
6. As a learner observing variables change in the variable inspector, I want the active code line highlight to strictly correspond to the statement that mutated those variables in that specific step, so that the mental model of execution is never confused.
7. As a learner navigating backward and forward with the step slider, I want each step to highlight the precise source line representing that step's computational action, so that time-travel debugging feels completely natural.
8. As a developer running unit tests, I want the fidelity auditor to automatically test all registered algorithms and verify that every generated step resolves to a valid line number in Java, Python, C++, and JavaScript, so that regressions are caught before shipping.
9. As a learner exploring edge cases (such as obstacles in grid paths, base cases in recursion, or boundary conditions in binary search), I want the base case steps to highlight the base case return statement, so that boundary logic is crystal clear.
10. As a platform user running the application on desktop or web, I want code rendering to strip internal anchor tags cleanly, so that the displayed code looks 100% clean and professional without internal compiler artifacts.

## Implementation Decisions

### 1. The Code-Step Indexer Deep Module
- A single deep module `CodeStepIndexer` is introduced behind a small, robust interface.
- It accepts multi-language code templates containing lightweight inline anchor tags (e.g. `// @step:update` or `# @step:update`) or a structured anchor mapping.
- It provides a single query interface `resolveLine(algoId, stageId, anchorName, language)` which returns the 1-based line number (and optional context lines) for any supported language.
- It provides a code sanitizer that strips anchor comments, returning clean source code to the `CodePanel` rendering component.

### 2. Semantic Anchor Vocabulary
- All algorithm code templates adopt a standard semantic anchor vocabulary:
  - `entry`: Function signature / main entry point.
  - `init`: Array or variable allocation and initial state setup.
  - `loop-outer`: Outer loop condition / row iteration.
  - `loop-inner`: Inner loop condition / column or subset iteration.
  - `condition`: Branching `if` condition check.
  - `update`: Core state transition / formula computation / recursive call.
  - `backtrack`: Recursive return / memoization write / state rollback.
  - `return`: Function final return statement.

### 3. Step Definition Interface Simplification
- Step objects (`DpTraceStep` / `DpDemoStep`) replace manual `{ java: X, python: Y, ... }` structures with a single `anchor: string` property (while maintaining backwards compatibility with raw highlights for legacy plugins).
- `CodePanel.highlight()` accepts the semantic anchor and queries `CodeStepIndexer` dynamically using its currently selected language.

### 4. Mandatory Loop Step Breakdown Invariant
- Every iterative loop across all algorithm stages must generate:
  - An inspection step at the loop header (`loop-outer` or `loop-inner`) setting up the iteration index variable.
  - One or more execution steps at the loop body (`update`) applying state mutations.
- No step is permitted to merge a loop header and a loop body update into a single step unless explicitly designated as a macro step.

### 5. Prototype Schema Shape

```typescript
export interface CodeAnchorMap {
  [anchorName: string]: {
    primary: number | number[];
    context?: number | number[];
  };
}

export interface CompiledCodeModel {
  cleanCode: Record<string, string[]>;
  anchorIndex: Record<string, CodeAnchorMap>; // language -> anchorName -> line target
}

export interface ICodeStepIndexer {
  compile(algoId: string, stageId: string, rawCode: Record<string, string[]>): CompiledCodeModel;
  resolve(algoId: string, stageId: string, anchor: string, lang: string): HighlightTarget | null;
}
```

## Testing Decisions

### 1. Test External Behavior, Not Line-Number Math
- Tests must verify that given an algorithm ID and a step sequence, the highlighted line matches the semantic intent (e.g., `'update'` highlights the line containing the mutation operator `+=` or `max(`), without hardcoding brittle magic line numbers into every test.

### 2. Automated Universal Coverage Auditor
- The `FidelityAuditor` will be extended to iterate over all registered algorithms across all categories (Dynamic Programming, Sorting, Graph, Tree, Backtracking).
- For each algorithm and each step mode (Naive, Memo, Tabulation, Space-Optimized), the auditor compiles the code model and verifies that 100% of emitted step anchors resolve to non-empty, valid lines in all four languages.

### 3. Prior Art in Codebase
- Prior art exists in `dp-code-sync.test.ts` (which verified multi-language dictionary highlights in `CodePanel`) and `fidelity-auditor.test.ts` (which audits registered visualizer metadata). The new tests will build directly on these existing patterns.

## Out of Scope

- Rewriting algorithm visualizer SVG/Canvas rendering logic (only code-step alignment and step generation seams are touched).
- Adding new programming languages beyond Java, Python, C++, and JavaScript.
- Modifying UI layouts or CSS theme palettes.

## Further Notes

- This architectural spec eliminates the largest source of recurring bugs in the visualizer. By replacing manual line counting with automated semantic anchor compilation, the codebase gains true locality: modifying code comments or formatting in one language will never again break step synchronization in any other language.
