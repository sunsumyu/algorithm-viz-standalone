/**
 * 左程云算法通关课 Class 040: 折纸问题 (Paper Folding)
 * 三大阶段四语言源码实现与 1-based 精准代码行联动字典
 */

// ==========================================
// Stage 1: 经典中序递归栈 (In-order DFS)
// ==========================================
export const PAPER_FOLDING_CODES = {
  java: `public class PaperFolding {
    public static void printAllFolds(int n) {
        // 从根节点开始中序遍历 (1层, down=true表示凹折痕)
        process(1, n, true);
    }

    // i 是当前节点的层数，n 是总层数，down == true 为凹，down == false 为凸
    private static void process(int i, int n, boolean down) {
        if (i > n) return;
        // 中序遍历：左子树全为凹 (true)
        process(i + 1, n, true);
        // 打印当前节点折痕
        System.out.println(down ? "凹" : "凸");
        // 中序遍历：右子树全为凸 (false)
        process(i + 1, n, false);
    }
}`,
  cpp: `class PaperFolding {
public:
    static void printAllFolds(int n) {
        process(1, n, true);
    }
private:
    static void process(int i, int n, bool down) {
        if (i > n) return;
        process(i + 1, n, true);
        cout << (down ? "凹" : "凸") << endl;
        process(i + 1, n, false);
    }
};`,
  python: `class PaperFolding:
    @staticmethod
    def print_all_folds(n: int) -> list[str]:
        res = []
        def process(i: int, down: bool):
            if i > n:
                return
            process(i + 1, True)
            res.append("凹" if down else "凸")
            process(i + 1, False)
        process(1, True)
        return res`,
  javascript: `class PaperFolding {
  static printAllFolds(n) {
    const res = [];
    function process(i, down) {
      if (i > n) return;
      process(i + 1, true);
      res.push(down ? "凹" : "凸");
      process(i + 1, false);
    }
    process(1, true);
    return res;
  }
}`,
};

export const PAPER_FOLDING_CODE_LINES = {
  entry: { java: 4, cpp: 4, python: 11, javascript: 10 },
  dfsLeft: { java: 11, cpp: 9, python: 8, javascript: 6 },
  print: { java: 13, cpp: 10, python: 9, javascript: 7 },
  rightDone: { java: 15, cpp: 11, python: 10, javascript: 8 },
  finish: { java: 4, cpp: 4, python: 12, javascript: 11 },
};

// ==========================================
// Stage 2: 显式调用栈模拟 (Explicit Stack Simulation)
// ==========================================
export const PAPER_FOLDING_STAGE2_CODES = {
  java: `public class PaperFoldingIterative {
    static class Frame {
        int i;
        boolean down;
        int state; // 0: 准备探左, 1: 准备打印, 2: 准备探右
        Frame(int i, boolean down) { this.i = i; this.down = down; this.state = 0; }
    }
    public static List<String> printFolds(int n) {
        List<String> res = new ArrayList<>();
        Deque<Frame> stack = new ArrayDeque<>();
        stack.push(new Frame(1, true));
        while (!stack.isEmpty()) {
            Frame cur = stack.peek();
            if (cur.i > n) { stack.pop(); continue; }
            if (cur.state == 0) {
                cur.state = 1;
                stack.push(new Frame(cur.i + 1, true));
            } else if (cur.state == 1) {
                cur.state = 2;
                res.add(cur.down ? "凹" : "凸");
                stack.push(new Frame(cur.i + 1, false));
            } else {
                stack.pop();
            }
        }
        return res;
    }
}`,
  cpp: `class PaperFoldingIterative {
    struct Frame { int i; bool down; int state; };
public:
    static vector<string> printFolds(int n) {
        vector<string> res;
        stack<Frame> st;
        st.push({1, true, 0});
        while (!st.empty()) {
            auto& cur = st.top();
            if (cur.i > n) { st.pop(); continue; }
            if (cur.state == 0) {
                cur.state = 1;
                st.push({cur.i + 1, true, 0});
            } else if (cur.state == 1) {
                cur.state = 2;
                res.push_back(cur.down ? "凹" : "凸");
                st.push({cur.i + 1, false, 0});
            } else {
                st.pop();
            }
        }
        return res;
    }
};`,
  python: `class PaperFoldingIterative:
    @staticmethod
    def print_folds(n: int) -> list[str]:
        res = []
        stack = [[1, True, 0]]
        while stack:
            cur = stack[-1]
            i, down, state = cur[0], cur[1], cur[2]
            if i > n:
                stack.pop()
                continue
            if state == 0:
                cur[2] = 1
                stack.append([i + 1, True, 0])
            elif state == 1:
                cur[2] = 2
                res.append("凹" if down else "凸")
                stack.append([i + 1, False, 0])
            else:
                stack.pop()
        return res`,
  javascript: `class PaperFoldingIterative {
  static printFolds(n) {
    const res = [];
    const stack = [[1, true, 0]];
    while (stack.length > 0) {
      const cur = stack[stack.length - 1];
      const [i, down, state] = cur;
      if (i > n) {
        stack.pop();
        continue;
      }
      if (state === 0) {
        cur[2] = 1;
        stack.push([i + 1, true, 0]);
      } else if (state === 1) {
        cur[2] = 2;
        res.push(down ? "凹" : "凸");
        stack.push([i + 1, false, 0]);
      } else {
        stack.pop();
      }
    }
    return res;
  }
}`,
};

export const PAPER_FOLDING_STAGE2_LINES = {
  entry: { java: 11, cpp: 7, python: 5, javascript: 4 },
  pushLeft: { java: 16, cpp: 13, python: 13, javascript: 13 },
  print: { java: 19, cpp: 16, python: 16, javascript: 16 },
  pushRight: { java: 20, cpp: 17, python: 17, javascript: 17 },
  pop: { java: 22, cpp: 19, python: 19, javascript: 19 },
  finish: { java: 25, cpp: 22, python: 20, javascript: 22 },
};

// ==========================================
// Stage 3: 逐层物理裂变递推 (Layered Folding Generation)
// ==========================================
export const PAPER_FOLDING_STAGE3_CODES = {
  java: `public class PaperFoldingLayered {
    public static List<String> generateFolds(int n) {
        List<String> folds = new ArrayList<>();
        if (n <= 0) return folds;
        folds.add("凹"); // 第 1 次对折
        for (int k = 2; k <= n; k++) {
            List<String> next = new ArrayList<>();
            boolean insertDown = true;
            for (String fold : folds) {
                next.add(insertDown ? "凹" : "凸");
                insertDown = !insertDown;
                next.add(fold);
            }
            next.add(insertDown ? "凹" : "凸");
            folds = next;
        }
        return folds;
    }
}`,
  cpp: `class PaperFoldingLayered {
public:
    static vector<string> generateFolds(int n) {
        vector<string> folds;
        if (n <= 0) return folds;
        folds.push_back("凹");
        for (int k = 2; k <= n; ++k) {
            vector<string> next;
            bool insertDown = true;
            for (const auto& fold : folds) {
                next.push_back(insertDown ? "凹" : "凸");
                insertDown = !insertDown;
                next.push_back(fold);
            }
            next.push_back(insertDown ? "凹" : "凸");
            folds = std::move(next);
        }
        return folds;
    }
};`,
  python: `class PaperFoldingLayered:
    @staticmethod
    def generate_folds(n: int) -> list[str]:
        if n <= 0:
            return []
        folds = ["凹"]
        for k in range(2, n + 1):
            next_folds = []
            insert_down = True
            for fold in folds:
                next_folds.append("凹" if insert_down else "凸")
                insert_down = not insert_down
                next_folds.append(fold)
            next_folds.append("凹" if insert_down else "凸")
            folds = next_folds
        return folds`,
  javascript: `class PaperFoldingLayered {
  static generateFolds(n) {
    if (n <= 0) return [];
    let folds = ["凹"];
    for (let k = 2; k <= n; k++) {
      const nextFolds = [];
      let insertDown = true;
      for (const fold of folds) {
        nextFolds.push(insertDown ? "凹" : "凸");
        insertDown = !insertDown;
        nextFolds.push(fold);
      }
      nextFolds.push(insertDown ? "凹" : "凸");
      folds = nextFolds;
    }
    return folds;
  }
}`,
};

export const PAPER_FOLDING_STAGE3_LINES = {
  entry: { java: 5, cpp: 5, python: 5, javascript: 4 },
  newLayer: { java: 6, cpp: 6, python: 6, javascript: 5 },
  insertFold: { java: 10, cpp: 10, python: 10, javascript: 9 },
  layerFinish: { java: 14, cpp: 14, python: 13, javascript: 13 },
  finish: { java: 16, cpp: 16, python: 14, javascript: 15 },
};
