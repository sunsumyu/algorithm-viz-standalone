# Unified Algorithm Execution Fidelity Engine & Comprehensive Audit Specification

## Problem Statement

Across the algorithm visualizer platform (covering dynamic programming, backtracking, trees, graphs, sorting, searching, etc.), single-step execution traces frequently diverge from the literal semantics of the displayed multi-language source code. 

Specifically, step generators often contain "silent pre-filters", implicit boundary clamps, or shortcuts (such as `if (r + 1 < m)` before making a recursive call), which prune branches before invocation instead of executing the code literally as written (e.g., executing the recursive call into invalid states, checking out-of-bounds guard clauses, evaluating condition checks that result in `false`, or triggering Base Case returns). This creates confusing discrepancies in the UI where code lines appear skipped, guard clauses are never highlighted when reached, or steps fail to accurately reflect what real program execution does.

With hundreds of algorithms across 14+ categories, manual piecemeal fixes are error-prone and unsustainable. The platform requires a unified, high-fidelity execution audit framework and standard execution engine contracts to guarantee that every generated step corresponds 1:1 with genuine code control flow and state changes.

## Solution

Build a **Unified Algorithm Execution Fidelity Framework** that establishes:
1. **Zero-Shortcutting Pure-Fidelity Execution Protocol**: Standard rules requiring all algorithm step generators to simulate literal runtime execution without heuristic pre-checks. Out-of-bounds calls, failed conditions, loop evaluations, and base case returns must all emit distinct semantic trace events before returning.
2. **Automated Static & Dynamic Fidelity Auditor (Linter & Simulator)**: A comprehensive test suite and automated scanner that audits all algorithm specifications across all categories (DP, Backtracking, Graphs, Trees, Sort, Search, etc.) to detect:
   - Untriggered guard clauses / unreachable line mappings.
   - Code lines missing trace step coverage.
   - Pre-condition guards in TypeScript generators that do not exist in the displayed reference Java/Python/C++/JS code.
   - Mismatched line indices between multi-language code files and `SemanticLineMap`.
3. **Unified Standard Step Engine Abstraction**: Extending `DpStepEngine` / `AlgorithmStepEngine` into universal category drivers (Recursive Tree Explorer, Loop/Grid Tabulator, Graph State Machine, Backtracking State Recorder) with built-in AST/line-level step tracking.

---

## User Stories

1. As a student learning algorithms, I want every step in the debugger to highlight the exact line of code currently being executed, so that I can understand line-by-line control flow without confusion.
2. As a visualizer user, I want out-of-bounds recursive calls to be explicitly visualized (entering the function, hitting the guard clause, and returning 0/null), so that I understand why boundary checks exist and what they do.
3. As a student debugging tree traversals, I want `null` node invocations to step onto the `if (root == null) return;` line, so that I can see the base case terminating invalid branches.
4. As a learner studying backtracking algorithms, I want invalid candidate decisions to visibly enter the recursion and trigger pruning conditions, so that I learn how backtracking pruning operates in actual code.
5. As a user switching between Java, Python, C++, and JavaScript, I want the active code highlight to always land on the exact equivalent line in every language without off-by-one errors.
6. As a visualizer developer, I want an automated test suite that inspects all registered algorithms across all categories, so that any new algorithm with skipped lines or broken line mappings is caught in CI.
7. As a student watching dynamic programming evolution, I want the naive recursive mode, memoized mode, tabulation mode, and space-optimized mode to all reflect their exact respective code implementations.
8. As a visualizer user, I want the variable inspection panel (`vars`) to update in sync with every code line step, so that I see local variable mutations at the exact moment statements execute.
9. As an educator using the platform in classroom demos, I want conditional statements whose conditions evaluate to `false` to be clearly distinguished from statements whose conditions evaluate to `true`, so that students don't think lines were skipped by accident.
10. As a maintainer adding a new algorithm, I want a standard `AlgorithmSpec` contract and standard generator utilities, so that I don't write ad-hoc generators with subtle shortcut bugs.
11. As a learner examining graph search algorithms (BFS/DFS), I want already-visited node checks to step onto `if (visited[node]) return;`, so that cycle prevention logic is clearly seen in action.
12. As a student watching sorting algorithms, I want partition and comparison operations to step onto the exact `if (arr[j] < pivot)` lines, so that the comparison count matches the algorithm's actual time complexity.
13. As a visualizer user, I want return statements to step directly onto the `return` line and display the computed return value before popping the call stack, so that call frame lifecycles are intuitive.

---

## Implementation Decisions

### 1. Global Algorithm Catalog & Registry Audit Seam
- Maintain a single registry entrypoint that enumerates all algorithm specifications across all categories (`src/algorithms/categories/**`).
- Provide an `AlgorithmRegistry` interface that can be queried by category, ID, and evolution stage.

### 2. Universal Execution Trace Contract (`TraceStep`)
- All category step generators must output a standardized `TraceStep` adhering to the domain model:
  - `codeLine`: Multi-language mapping object `{ java: number, python: number, cpp: number, javascript: number }`.
  - `action`: Semantic action tag (e.g. `enter_function`, `eval_condition`, `base_case_hit`, `prune_branch`, `state_transition`, `return_value`).
  - `vars`: Array of current variable states with `changed` flags.
  - `conditionResult`: Optional boolean (`true` | `false`) indicating the outcome of `if` or `for` condition checks.

### 3. High-Fidelity Execution Protocol
- **No External Pre-Guards**: Generators simulating recursive functions must not place boundary guards (e.g. `if (next_r < m)`) outside the simulated function if the displayed code calls `helper(next_r)` directly.
- **Explicit Base Case Steps**: Every base case or guard clause branch (e.g. `if (i >= m || j >= n) return 0;`) must emit at least one step when reached.
- **Consistent Call Frame Push/Pop**: Function entry must emit a step on the function signature line; function exit must emit a step on the return line.

### 4. Automated Universal Fidelity Scanner (Static & Dynamic Audit)
- A unified test fixture will iterate over every registered algorithm in the workspace:
  - **Static Line Check**: Verifies that every line number in `lineExplanations` and `codeLine` mappings falls within the valid range `[1, lines.length]` for all 4 languages.
  - **Dynamic Step Coverage Check**: Simulates default inputs for each evolution mode and verifies that all non-comment, non-trivial code lines receive step coverage during execution.
  - **Dead Code / Unreachable Guard Detection**: Flags any algorithm where guard clauses or Base Case steps are never emitted during execution.

### 5. Category-Specific Step Engine Standardizations
- Refactor legacy ad-hoc step builders in:
  - **Grid DP & Linear DP**: `dp-universal-evolution.ts`, `fib-evolution-steps.ts`, `decode-ways-steps.ts`
  - **Backtracking**: N-Queens, Subsets, Permutations, Combinations
  - **Tree Algorithms**: Inorder, Preorder, Postorder, Max Depth, BST Search
  - **Graph Algorithms**: Dijkstra, BFS, DFS, Topological Sort
  - **Sorting & Searching**: QuickSort, MergeSort, BinarySearch

---

## Testing Decisions

- **Seam Selection**: Test at the highest possible domain seam — the output of `generateSteps(algorithmId, inputParams, stage)` against the static code lines of `getAlgorithmCode(algorithmId, stage)`.
- **Behavior-Only Verification**:
  - Assert that all executable code lines have at least one corresponding step in the generated trace.
  - Assert that for every out-of-bounds / terminating scenario, the generated trace contains the matching `base_case_hit` / `out_of_bounds` step with the expected code line mapping.
  - Assert that multi-language line mapping counts match between Java, Python, C++, and JS.
- **Prior Art**: Builds on the existing test suites in `dp-universal-evolution.test.ts`, `dp-code-sync.test.ts`, and `specs/**/*.test.ts`.

---

## Out of Scope

- Modifying the visual CSS rendering layout or theme colors.
- Adding new algorithm problems outside the existing catalog.
- WebAssembly-based real-time runtime compilation (visualizer continues to use high-fidelity deterministic TypeScript simulation engines).

---

## Further Notes

- This specification serves as the architectural contract for auditing and standardizing all algorithm visualizer modules across the codebase.
