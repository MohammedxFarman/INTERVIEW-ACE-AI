/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import Editor from "@monaco-editor/react";
import { 
  Play, 
  Send, 
  CheckCircle2, 
  XOctagon, 
  Cpu, 
  History, 
  Clock, 
  ArrowLeft, 
  Check, 
  RotateCcw,
  Sparkles,
  Info,
  Users,
  Terminal,
  Trophy,
  AlertTriangle
} from "lucide-react";

interface ChallengeArenaProps {
  setCurrentPage: (page: string) => void;
  challengeId: string;
}

interface Competitor {
  id: string;
  name: string;
  avatar: string;
  role: string;
  progress: number; // percentage 0 - 100
  status: "Coding" | "Debugging" | "Submitted" | "Idle";
  solveTime?: string;
  score?: number;
  lang: string;
}

// Fixed core challenge problems
const CORE_CHALLENGES = {
  "rb-tree-validator": {
    id: "rb-tree-validator",
    title: "Space-Time RB-Tree Validator",
    category: "Trees & Graphs",
    difficulty: "Medium",
    points: 150,
    timeLimit: 45, // minutes
    description: "In the interstellar communication routing matrix, messages are logged into a **Red-Black Tree** structure to optimize index queries. To prevent signal routing anomalies, database nodes require a strict validator that monitors compliance with the following classic specifications:\n\n1. Every node is colored either **Red** or **Black**.\n2. The root of the tree is always **Black**.\n3. Every leaf node (`NULL` or empty sentinel node) is **Black**.\n4. If a node is **Red**, then both of its children must be **Black** (No double red anomalies!).\n5. Every simple path from a node to any of its descendant leaf nodes must contain the exact same number of **Black** node steps.\n\nInput formats: Write an algorithm that takes a nested object representing the tree nodes `{ val: number, color: 'R'|'B', left: Node|null, right: Node|null }` and validates if it preserves RB-Tree balance properties.",
    examples: [
      {
        input: 'tree = { val: 10, color: "B", left: { val: 5, color: "R", left: null, right: null }, right: null }',
        output: "true",
        explanation: "Color rules are respected and each paths to null descendants has exactly 1 solid Black step."
      },
      {
        input: 'tree = { val: 10, color: "R", left: null, right: null }',
        output: "false",
        explanation: "Invalid because the root node must always be Black."
      }
    ],
    constraints: [
      "The number of tree nodes is in range [1, 1000].",
      "Colors must strictly correspond to character keys 'R' or 'B'.",
      "Memory footprint must operate within standard stack allocation limits."
    ],
    boilerplate: {
      javascript: `// Space-Time RB-Tree Validator in JS\nfunction isValidRBTree(root) {\n    if (!root) return true;\n    \n    // 1. Root must be Black\n    if (root.color !== 'B') return false;\n    \n    // Helper to verify no consecutive red nodes and compute black height\n    function checkTree(sub) {\n        if (!sub) return { valid: true, blackHeight: 1 }; // leaf sentinel counts as black\n        \n        // Double red check\n        if (sub.color === 'R') {\n            if ((sub.left && sub.left.color === 'R') || (sub.right && sub.right.color === 'R')) {\n                return { valid: false, blackHeight: 0 };\n            }\n        }\n        \n        const leftResult = checkTree(sub.left);\n        const rightResult = checkTree(sub.right);\n        \n        if (!leftResult.valid || !rightResult.valid) {\n            return { valid: false, blackHeight: 0 };\n        }\n        \n        // Path black height consistency check\n        if (leftResult.blackHeight !== rightResult.blackHeight) {\n            return { valid: false, blackHeight: 0 };\n        }\n        \n        const currentHeight = leftResult.blackHeight + (sub.color === 'B' ? 1 : 0);\n        return { valid: true, blackHeight: currentHeight };\n    }\n    \n    const outcome = checkTree(root);\n    console.log("Validation finalized. Calculated Black Height: " + outcome.blackHeight);\n    return outcome.valid;\n}`,
      python: `def is_valid_rb_tree(root):\n    # Space-Time RB-Tree Validator in Python 3\n    if not root:\n        return True\n        \n    # 1. Root must be Black\n    if root.get('color') != 'B':\n        return False\n        \n    def check_tree(node):\n        if not node:\n            return True, 1\n            \n        if node.get('color') == 'R':\n            left = node.get('left')\n            right = node.get('right')\n            if (left and left.get('color') == 'R') or (right and right.get('color') == 'R'):\n                return False, 0\n                \n        left_ok, left_h = check_tree(node.get('left'))\n        right_ok, right_h = check_tree(node.get('right'))\n        \n        if not left_ok or not right_ok:\n            return False, 0\n            \n        if left_h != right_h:\n            return False, 0\n            \n        h = left_h + (1 if node.get('color') == 'B' else 0)\n        return True, h\n        \n    ok, height = check_tree(root)\n    print(f"Algorithm simulation: valid={ok}, black_height={height}")\n    return ok`,
      cpp: `#include <iostream>\n#include <algorithm>\n\nstruct Node {\n    int val;\n    char color; // 'R' or 'B'\n    Node* left;\n    Node* right;\n};\n\nclass RBTreeValidator {\npublic:\n    bool isValidRBTree(Node* root) {\n        if (!root) return true;\n        if (root->color != 'B') return false;\n        \n        std::pair<bool, int> result = check(root);\n        std::cout << "Validator diagnostics: " << (result.first ? "PASS" : "FAIL") << " height=" << result.second << std::endl;\n        return result.first;\n    }\n    \nprivate:\n    std::pair<bool, int> check(Node* sub) {\n        if (!sub) return {true, 1};\n        \n        if (sub->color == 'R') {\n            if ((sub->left && sub->left->color == 'R') || (sub->right && sub->right->color == 'R')) {\n                return {false, 0};\n            }\n        }\n        \n        auto leftResult = check(sub->left);\n        auto rightResult = check(sub->right);\n        \n        if (!leftResult.first || !rightResult.first) return {false, 0};\n        if (leftResult.second != rightResult.second) return {false, 0};\n        \n        int currentHeight = leftResult.second + (sub->color == 'B' ? 1 : 0);\n        return {true, currentHeight};\n    }\n};`
    }
  },
  "lru-optimizer": {
    id: "lru-optimizer",
    title: "Cosmic LRU Cache Optimizer",
    category: "Caching & Design",
    difficulty: "Hard",
    points: 250,
    timeLimit: 30, // minutes
    description: "Design and implement a customized highly efficient **Least Recently Used (LRU) Cache** simulator tracking hyper-speed data updates.\n\nImplement the cache structure supporting two main queries:\n- `get(key: number)`: Returns the value of the key if the key exists in the cache, otherwise returns `-1`.\n- `put(key: number, value: number)`: Inserts or updates the value if the key is not already present. When the cache reaches its capacity limit, it must invalidate and evict the least recently used block before inserting the new items.\n\nYou **must** design both queries to consistently execute in **O(1) average time complexity** without linear scans of key lists.",
    examples: [
      {
        input: 'capacity = 2; put(1, 1); put(2, 2); get(1); put(3, 3); get(2);',
        output: 'get(1) -> 1, get(2) -> -1 (evicted due to capacity)',
        explanation: "When capacity was 2, put(3, 3) evicted key 2 because it was least recently used compared to key 1."
      }
    ],
    constraints: [
      "1 <= capacity <= 3000",
      "0 <= key <= 10^5",
      "0 <= value <= 10^5",
      "At most 2*10^5 calls will be executed in a single evaluation run."
    ],
    boilerplate: {
      javascript: `// Cosmic LRU Cache Optimizer in JS\nclass LRUCache {\n    constructor(capacity) {\n        this.capacity = capacity;\n        this.cache = new Map();\n    }\n    \n    get(key) {\n        if (!this.cache.has(key)) return -1;\n        const value = this.cache.get(key);\n        // Refresh state order by deleting and re-inserting\n        this.cache.delete(key);\n        this.cache.set(key, value);\n        return value;\n    }\n    \n    put(key, value) {\n        if (this.cache.has(key)) {\n            this.cache.delete(key);\n        } else if (this.cache.size >= this.capacity) {\n            // Evict least recently accessed (first key in insertion order)\n            const lruKey = this.cache.keys().next().value;\n            console.log("Evicted Key: " + lruKey);\n            this.cache.delete(lruKey);\n        }\n        this.cache.set(key, value);\n    }\n}`,
      python: `class LRUCache:\n    # Cosmic LRU Cache Optimizer in Python 3\n    def __init__(self, capacity: int):\n        self.capacity = capacity\n        self.cache = {}\n        # Track order using standard lists or dict order\n        \n    def get(self, key: int) -> int:\n        if key not in self.cache:\n            return -1\n        val = self.cache.pop(key)\n        self.cache[key] = val # insertion order refreshed\n        return val\n        \n    def put(self, key: int, value: int) -> None:\n        if key in self.cache:\n            self.cache.pop(key)\n        elif len(self.cache) >= self.capacity:\n            # Pop first item (LRU item in Python dict order)\n            lru_key = next(iter(self.cache))\n            print(f"Simulation evicting: {lru_key}")\n            self.cache.pop(lru_key)\n        self.cache[key] = value`,
      cpp: `#include <unordered_map>\n#include <list>\n#include <iostream>\n\nclass LRUCache {\nprivate:\n    int cap;\n    std::list<std::pair<int, int>> dll; // doubly linked list storing keys and values\n    std::unordered_map<int, std::list<std::pair<int, int>>::iterator> map;\n    \npublic:\n    LRUCache(int capacity) : cap(capacity) {}\n    \n    int get(int key) {\n        if (map.find(key) == map.end()) return -1;\n        // Move node to front of doubly linked list\n        auto node = *map[key];\n        dll.erase(map[key]);\n        dll.push_front(node);\n        map[key] = dll.begin();\n        return node.second;\n    }\n    \n    void put(int key, int value) {\n        if (map.find(key) != map.end()) {\n            dll.erase(map[key]);\n        } else if (dll.size() >= cap) {\n            int lruKey = dll.back().first;\n            std::cout << "Evicting key " << lruKey << std::endl;\n            map.erase(lruKey);\n            dll.pop_back();\n        }\n        dll.push_front({key, value});\n        map[key] = dll.begin();\n    }\n};`
    }
  },
  "fastest-matrix-path": {
    id: "fastest-matrix-path",
    title: "Weighted Matrix Hyperspace Pathfinder",
    category: "Dynamic Programming & Matrix",
    difficulty: "Medium",
    points: 180,
    timeLimit: 60, // minutes
    description: "Your exploration rocket needs to navigate a coordinate grid of space clouds containing intense gravitational pull values. Specifically, you are given an `m x n` grid filled with non-negative integers representing gravitational coefficients.\n\nYou start at coordinates `(0, 0)` and must descend to the bottom-right coordinate `(m-1, n-1)`. On any coordinate step, you are **only** permitted to step downwards or to the right.\n\nWrite an analytical algorithm returning the **minimum path sum** that reduces total gravitational drag to the absolute lowest achievable value.",
    examples: [
      {
        input: "grid = [[1,3,1],[1,5,1],[4,2,1]]",
        output: "7",
        explanation: "Minimal path is 1 -> 3 -> 1 -> 1 -> 1, which sums to 7."
      }
    ],
    constraints: [
      "m == grid.length",
      "n == grid[i].length",
      "1 <= m, n <= 200",
      "0 <= grid[i][j] <= 100"
    ],
    boilerplate: {
      javascript: `// Weighted Matrix pathfinder in JS\nfunction minPathSum(grid) {\n    const m = grid.length;\n    const n = grid[0].length;\n    const dp = Array(m).fill().map(() => Array(n).fill(0));\n    \n    dp[0][0] = grid[0][0];\n    for (let i = 1; i < m; i++) dp[i][0] = dp[i-1][0] + grid[i][0];\n    for (let j = 1; j < n; j++) dp[0][j] = dp[0][j-1] + grid[0][j];\n    \n    for (let i = 1; i < m; i++) {\n        for (let j = 1; j < n; j++) {\n            dp[i][j] = grid[i][j] + Math.min(dp[i-1][j], dp[i][j-1]);\n        }\n    }\n    \n    console.log("Optimal matrix path summed to: " + dp[m-1][n-1]);\n    return dp[m-1][n-1];\n}`,
      python: `def min_path_sum(grid):\n    # Weighted Matrix pathfinder in Python 3\n    m, n = len(grid), len(grid[0])\n    dp = [[0] * n for _ in range(m)]\n    \n    dp[0][0] = grid[0][0]\n    for i in range(1, m):\n        dp[i][0] = dp[i-1][0] + grid[i][0]\n    for j in range(1, n):\n        dp[0][j] = dp[0][j-1] + grid[0][j]\n        \n    for i in range(1, m):\n        for j in range(1, n):\n            dp[i][j] = grid[i][j] + min(dp[i-1][j], dp[i][j-1])\n            \n    return dp[m-1][n-1]`,
      cpp: `#include <vector>\n#include <algorithm>\n#include <iostream>\n\nclass MinimumPath {\npublic:\n    int minPathSum(std::vector<std::vector<int>>& grid) {\n        int m = grid.size();\n        int n = grid[0].size();\n        std::vector<std::vector<int>> dp(m, std::vector<int>(n, 0));\n        \n        dp[0][0] = grid[0][0];\n        for (int i = 1; i < m; ++i) dp[i][0] = dp[i-1][0] + grid[i][0];\n        for (int j = 1; j < n; ++j) dp[0][j] = dp[0][j-1] + grid[0][j];\n        \n        for (int i = 1; i < m; ++i) {\n            for (int j = 1; j < n; ++j) {\n                dp[i][j] = grid[i][j] + std::min(dp[i-1][j], dp[i][j-1]);\n            }\n        }\n        return dp[m-1][n-1];\n    }\n};`
    }
  },
  "daily-water-container": {
    id: "daily-water-container",
    title: "Maximum Cloud Volume Optimiser",
    category: "Arrays & Sliding Window",
    difficulty: "Medium",
    points: 200,
    timeLimit: 30,
    description: "In telemetry mapping, space cloud density profiles are simulated as vertical heights. You are given an array of non-negative integers `height` of length `n`, where each index represents a vertical vector cloud bulkhead at coordinate `i`. Find two bulkheads that together with the x-axis forms a container, such that the container contains the maximum orbital cloud volume. Return the maximum possible volume capacity storage of the cloud.\n\nYou should identify an algorithm that completes this computation in O(N) linear time complexity with two-pointer offsets, without exhausting nested nested loops.",
    examples: [
      {
        input: "height = [1,8,6,2,5,4,8,3,7]",
        output: "49",
        explanation: "The container formed by bulkheads height[1]=8 and height[8]=7 has vertical height 7 and horizontal spacing 7, giving 7 * 7 = 49."
      }
    ],
    constraints: [
      "n == height.length",
      "2 <= n <= 10^5",
      "0 <= height[i] <= 10^4"
    ],
    boilerplate: {
      javascript: `// Maximum Cloud Volume Optimiser in JS\nfunction maxArea(height) {\n    let left = 0;\n    let right = height.length - 1;\n    let maxVal = 0;\n    \n    while (left < right) {\n        const currentHeight = Math.min(height[left], height[right]);\n        const currentWidth = right - left;\n        maxVal = Math.max(maxVal, currentHeight * currentWidth);\n        \n        if (height[left] < height[right]) {\n            left++;\n        } else {\n            right--;\n        }\n    }\n    \n    console.log("Max volume calculated: " + maxVal);\n    return maxVal;\n}`,
      python: `def max_area(height):\n    # Maximum Cloud Volume Optimiser in Python 3\n    left, right = 0, len(height) - 1\n    max_val = 0\n    \n    while left < right:\n        current_h = min(height[left], height[right])\n        max_val = max(max_val, current_h * (right - left))\n        if height[left] < height[right]:\n            left += 1\n        else:\n            right -= 1\n            \n    return max_val`,
      cpp: `#include <vector>\n#include <algorithm>\n\nclass CloudVolumeOptimiser {\npublic:\n    int maxArea(std::vector<int>& height) {\n        int left = 0, right = height.size() - 1;\n        int maxVal = 0;\n        while (left < right) {\n            maxVal = std::max(maxVal, std::min(height[left], height[right]) * (right - left));\n            if (height[left] < height[right]) {\n                left++;\n            } else {\n                right--;\n            }\n        }\n        return maxVal;\n    }\n};`
    }
  },
  "daily-two-sum": {
    id: "daily-two-sum",
    title: "Bi-Directional Telemetry Vector Aligner",
    category: "Arrays & Sliding Window",
    difficulty: "Easy",
    points: 100,
    timeLimit: 20,
    description: "Given an array of integer coordinate indices `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]"
      }
    ],
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9"
    ],
    boilerplate: {
      javascript: `// Bi-Directional Telemetry Vector Aligner in JS\nfunction twoSum(nums, target) {\n    const map = new Map();\n    for (let i = 0; i < nums.length; i++) {\n        const complement = target - nums[i];\n        if (map.has(complement)) {\n            return [map.get(complement), i];\n        }\n        map.set(nums[i], i);\n    }\n    return [];\n}`,
      python: `def two_sum(nums, target):\n    # Bi-Directional Telemetry Vector Aligner in Python 3\n    seen = {}\n    for i, num in enumerate(nums):\n        comp = target - num\n        if comp in seen:\n            return [seen[comp], i]\n        seen[num] = i\n    return []`,
      cpp: `#include <vector>\n#include <unordered_map>\n\nclass VectorAligner {\npublic:\n    std::vector<int> twoSum(std::vector<int>& nums, int target) {\n        std::unordered_map<int, int> seen;\n        for (int i = 0; i < nums.size(); ++i) {\n            int comp = target - nums[i];\n            if (seen.count(comp)) {\n                return {seen[comp], i};\n            }\n            seen[nums[i]] = i;\n        }\n        return {};\n    }\n};`
    }
  },
  "daily-clone-graph": {
    id: "daily-clone-graph",
    title: "Quantum Node Network Replicator",
    category: "Graphs & Networks",
    difficulty: "Hard",
    points: 300,
    timeLimit: 40,
    description: "Given a reference of a node in a connected undirected network graph, return a deep copy (clone) of the graph. Each node in the graph contains a value (`int`) and a list (`List[Node]`) of its neighbors.\n\nYour cloning system must correctly replicate node coordinates and cyclic links without generating stack overflow conditions, and return the true cloned starting node pointer.",
    examples: [
      {
        input: "adjList = [[2,4],[1,3],[2,4],[1,3]]",
        output: "[[2,4],[1,3],[2,4],[1,3]]"
      }
    ],
    constraints: [
      "The number of nodes in the graph is in the range [0, 100].",
      "1 <= Node.val <= 100",
      "There are no repeated edges and no self-loops in the graph."
    ],
    boilerplate: {
      javascript: `// Quantum Node Network Replicator in JS\nfunction cloneGraph(node) {\n    if (!node) return null;\n    const visited = new Map();\n    \n    function dfs(curr) {\n        if (visited.has(curr.val)) return visited.get(curr.val);\n        \n        const clone = { val: curr.val, neighbors: [] };\n        visited.set(curr.val, clone);\n        \n        for (const neighbor of curr.neighbors || []) {\n            clone.neighbors.push(dfs(neighbor));\n        }\n        return clone;\n    }\n    \n    return dfs(node);\n}`,
      python: `def clone_graph(node):\n    # Quantum Node Network Replicator in Python 3\n    if not node:\n        return None\n    visited = {}\n    \n    def dfs(curr):\n        if curr['val'] in visited:\n            return visited[curr['val']]\n        clone = {'val': curr['val'], 'neighbors': []}\n        visited[curr['val']] = clone\n        for neighbor in curr.get('neighbors', []):\n            clone['neighbors'].append(dfs(neighbor))\n        return clone\n        \n    return dfs(node)`,
      cpp: `#include <vector>\n#include <unordered_map>\n\nstruct Node {\n    int val;\n    std::vector<Node*> neighbors;\n};\n\nclass NetworkReplicator {\nprivate:\n    std::unordered_map<int, Node*> visited;\npublic:\n    Node* cloneGraph(Node* node) {\n        if (!node) return nullptr;\n        if (visited.count(node->val)) return visited[node->val];\n        \n        Node* clone = new Node{node->val, {}};\n        visited[node->val] = clone;\n        for (Node* neighbor : node->neighbors) {\n            clone->neighbors.push_back(cloneGraph(neighbor));\n        }\n        return clone;\n    }\n};`
    }
  },
  "daily-subsets": {
    id: "daily-subsets",
    title: "State Matrix Formulation Combinator",
    category: "Recursion & Backtracking",
    difficulty: "Medium",
    points: 180,
    timeLimit: 25,
    description: "Given an integer array `nums` of unique elements, return all possible subsets (the power set). The solution set must not contain duplicate subsets.\n\nYou should implement a backtracking or bitmask approach to traverse all 2^N state solutions optimally.",
    examples: [
      {
        input: "nums = [1,2,3]",
        output: "[[],[1],[2],[1,2],[3],[1,3],[2,3],[1,2,3]]"
      }
    ],
    constraints: [
      "1 <= nums.length <= 10",
      "-10 <= nums[i] <= 10",
      "All the numbers of nums are unique."
    ],
    boilerplate: {
      javascript: `// State Matrix Formulation Combinator in JS\nfunction subsets(nums) {\n    const result = [];\n    \n    function backtrack(start, currentPath) {\n        result.push([...currentPath]);\n        for (let i = start; i < nums.length; i++) {\n            currentPath.push(nums[i]);\n            backtrack(i + 1, currentPath);\n            currentPath.pop();\n        }\n    }\n    \n    backtrack(0, []);\n    return result;\n}`,
      python: `def subsets(nums):\n    # State Matrix Formulation Combinator in Python 3\n    result = []\n    \n    def backtrack(start, path):\n        result.append(list(path))\n        for i in range(start, len(nums)):\n            path.append(nums[i])\n            backtrack(i + 1, path)\n            path.pop()\n            \n    backtrack(0, [])\n    return result`,
      cpp: `#include <vector>\n\nclass MatrixCombinator {\npublic:\n    std::vector<std::vector<int>> subsets(std::vector<int>& nums) {\n        std::vector<std::vector<int>> result;\n        std::vector<int> path;\n        backtrack(nums, 0, path, result);\n        return result;\n    }\nprivate:\n    void backtrack(const std::vector<int>& nums, int start, std::vector<int>& path, std::vector<std::vector<int>>& result) {\n        result.push_back(path);\n        for (int i = start; i < nums.size(); ++i) {\n            path.push_back(nums[i]);\n            backtrack(nums, i + 1, path, result);\n            path.pop_back();\n        }\n    }\n};`
    }
  },
  "daily-valid-anagram": {
    id: "daily-valid-anagram",
    title: "Hyper-Dimensional Signal Decryptor",
    category: "HashMaps & Strings",
    difficulty: "Easy",
    points: 90,
    timeLimit: 15,
    description: "Given two telemetry character streams `s` and `t`, return `true` if `t` is a valid decryption anagram of `s`, and `false` otherwise.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.",
    examples: [
      {
        input: 's = "anagram", t = "nagaram"',
        output: "true"
      }
    ],
    constraints: [
      "1 <= s.length, t.length <= 5 * 10^4",
      "s and t consist of lowercase English letters."
    ],
    boilerplate: {
      javascript: `// Hyper-Dimensional Signal Decryptor in JS\nfunction isAnagram(s, t) {\n    if (s.length !== t.length) return false;\n    const counts = {};\n    \n    for (let i = 0; i < s.length; i++) {\n        counts[s[i]] = (counts[s[i]] || 0) + 1;\n        counts[t[i]] = (counts[t[i]] || 0) - 1;\n    }\n    \n    for (const char in counts) {\n        if (counts[char] !== 0) return false;\n    }\n    return true;\n}`,
      python: `def is_anagram(s, t):\n    # Hyper-Dimensional Signal Decryptor in Python 3\n    if len(s) != len(t):\n        return False\n    counts = {}\n    for char in s:\n        counts[char] = counts.get(char, 0) + 1\n    for char in t:\n        counts[char] = counts.get(char, 0) - 1\n        if counts[char] < 0:\n            return False\n    return True`,
      cpp: `#include <string>\n#include <vector>\n\nclass SignalDecryptor {\npublic:\n    bool isAnagram(std::string s, std::string t) {\n        if (s.length() != t.length()) return false;\n        std::vector<int> counts(26, 0);\n        for (int i = 0; i < s.length(); ++i) {\n            counts[s[i] - 'a']++;\n            counts[t[i] - 'a']--;\n        }\n        for (int count : counts) {\n            if (count != 0) return false;\n        }\n        return true;\n    }\n};`
    }
  }
};

const RANDOM_LOGS = [
  "Coder_Derrick run-testing local nodes...",
  "Sarah_Dev submitted code. Status: WRONG ANSWER (failed test Case #4).",
  "ByteKnight is optimizing cache hits...",
  "Coder_Derrick has updated code buffer, waiting to compile...",
  "Priya_Tree submitted. Result: MATCH ACCEPTED! (28ms) Rank upgraded.",
  "AlgoGamer joined space matrix pathfinder arena.",
  "StackOverlord is debugging stackoverflow anomaly...",
  "BinaryBoss submitted. Result: MATCH ACCEPTED! (42ms) Rank upgraded.",
  "Sarah_Dev has successfully solved Challenge! (Total elapsed: 24 mins).",
  "NeroDSA submitted. Status: TIME LIMIT EXCEEDED on large node grid."
];

export const ChallengeArena: React.FC<ChallengeArenaProps> = ({ setCurrentPage, challengeId }) => {
  const activeChallenge = (CORE_CHALLENGES as any)[challengeId] || CORE_CHALLENGES["rb-tree-validator"];
  
  const [lang, setLang] = useState<string>("javascript");
  const [code, setCode] = useState<string>("");
  const [personalTimer, setPersonalTimer] = useState<number>(activeChallenge.timeLimit * 60); // in seconds
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [liveLogs, setLiveLogs] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [successModal, setSuccessModal] = useState<boolean>(false);
  const [outcomes, setOutcomes] = useState<{
    status: string;
    runtime: string;
    memory: string;
    passed: string;
    details: string;
  } | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Initialize competitors & start counting down
  useEffect(() => {
    // Generate competitors
    const initialCompetitors: Competitor[] = [
      { id: "1", name: "Priya_Tree", avatar: "PT", role: "Elite Coder", progress: 85, status: "Debugging", lang: "C++" },
      { id: "2", name: "Sarah_Dev", avatar: "SD", role: "Staff Architect", progress: 60, status: "Coding", lang: "Python" },
      { id: "3", name: "ByteKnight", avatar: "BK", role: "DSA Champion", progress: 95, status: "Coding", lang: "JavaScript" },
      { id: "4", name: "Coder_Derrick", avatar: "CD", role: "Competitive Wizard", progress: 30, status: "Coding", lang: "Go" },
      { id: "5", name: "AlgorithmicWiz", avatar: "AW", role: "Code Grandmaster", progress: 100, status: "Submitted", solveTime: "18m 10s", score: 98, lang: "C++" },
    ];
    setCompetitors(initialCompetitors);

    // Initial logs
    setLiveLogs([
      "⚖️ Challenge arena loaded successfully.",
      "🚀 Active competitors synched in server stack...",
      "⏱️ Multi-user timer started now! Max time: " + activeChallenge.timeLimit + " minutes."
    ]);

    // Set initial boiler plate code
    setCode(activeChallenge.boilerplate[lang] || activeChallenge.boilerplate["javascript"] || "");
  }, [challengeId]);

  // Keep code synced on language toggle
  useEffect(() => {
    setCode(activeChallenge.boilerplate[lang] || activeChallenge.boilerplate["javascript"] || "");
  }, [lang]);

  // Timer intervals
  useEffect(() => {
    const timer = setInterval(() => {
      setPersonalTimer(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Live simulator interval: updates competitors progress and drops live ticker chat-feed!
  useEffect(() => {
    const actionInterval = setInterval(() => {
      // 1. Update competitor progress
      setCompetitors(prev => 
        prev.map(c => {
          if (c.status === "Submitted") return c;
          
          const addProgress = Math.floor(Math.random() * 8) + 1;
          const nextProgress = Math.min(c.progress + addProgress, 100);
          
          let nextStatus = c.status;
          let solveTime = c.solveTime;
          let score = c.score;

          if (nextProgress === 100) {
            nextStatus = "Submitted";
            solveTime = `${Math.floor(Math.random() * 15) + 18}m ${Math.floor(Math.random() * 60)}s`;
            score = Math.floor(Math.random() * 15) + 85; // 85-100 score
          } else if (nextProgress > 80 && Math.random() > 0.6) {
            nextStatus = "Debugging";
          } else {
            nextStatus = "Coding";
          }

          return {
            ...c,
            progress: nextProgress,
            status: nextStatus,
            solveTime,
            score
          };
        })
      );

      // 2. Append simulated chat text
      const randomText = RANDOM_LOGS[Math.floor(Math.random() * RANDOM_LOGS.length)];
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setLiveLogs(prev => [...prev.slice(-49), `[${timeStr}] ${randomText}`]);

    }, 14000); // Trigger every 14 seconds to feel fast and engaging!

    return () => clearInterval(actionInterval);
  }, []);

  // Scroll live logs
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [liveLogs]);

  // Format time (seconds to MM:SS)
  const formatTimer = (totSeconds: number) => {
    const hr = Math.floor(totSeconds / 3600);
    const min = Math.floor((totSeconds % 3600) / 60);
    const sec = totSeconds % 60;
    
    if (hr > 0) {
      return `${hr.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
    }
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const handleRunCode = () => {
    setIsSubmitting(true);
    setOutcomes(null);

    const logNow = `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}] Run tests initiated by user...`;
    setLiveLogs(prev => [...prev, logNow]);

    setTimeout(() => {
      setIsSubmitting(false);
      setOutcomes({
        status: "Accepted",
        runtime: "42ms",
        memory: "12.2 MB",
        passed: "3/3 standard tests passed!",
        details: "✔️ Test Case #1 success: color integrity checked\n✔️ Test Case #2 success: child consistency height evaluation accepted\n✔️ Test Case #3 success: heavy random tree validation passed with matching stack limits."
      });
      setLiveLogs(prev => [...prev, `✔️ User runs: standard tests completed successfully! Ready for global submission.`]);
    }, 1800);
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setOutcomes(null);

    const logNow = `[${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}] Global submission processed by user...`;
    setLiveLogs(prev => [...prev, logNow]);

    const isDaily = activeChallenge.id.startsWith("daily-");

    setTimeout(() => {
      setIsSubmitting(false);
      setSuccessModal(true);
      setOutcomes({
        status: isDaily ? "🌟 DAILY DOUBLE COMPLETION ACCEPTED 🌟" : "COMPLETION ACCEPTED 🎉",
        runtime: "34ms (Faster than 92.4% of users)",
        memory: "11.8 MB (More optimal than 88.5% of competitors)",
        passed: isDaily ? "10/10 heavy Daily Challenge test cases resolved perfectly!" : "15/15 heavy core test cases resolved perfectly!",
        details: isDaily 
          ? "🎯 FANTASTIC! You have conquered today's Daily Coding Challenge!\n🚀 2x Arena points (" + (activeChallenge.points * 2) + " pts) and double milestone badges have been applied to your profile." 
          : "🎈 EXCELLENT WORK! Your solution was verified on the backend.\n🏆 Ranking added to the challenge leaderboard.\n⚡ Placement Readiness scorecard and coding badges updated!"
      });

      setLiveLogs(prev => [...prev, isDaily 
        ? `🏅 DOUBLE ACCLAIM! User successfully resolved the Special Daily Challenge and unlocked double point milestones.`
        : `🥇 CONGRATULATIONS! User successfully resolved the challenge and completed all 15 hidden tree test cases.`
      ]);

      // Add user to the competitor list at #1 or #2!
      setCompetitors(prev => [
        {
          id: "curr-user",
          name: "You (Solved)",
          avatar: "ME",
          role: "Candidate",
          progress: 100,
          status: "Submitted",
          solveTime: `${activeChallenge.timeLimit - Math.floor(personalTimer / 60)}m ${60 - (personalTimer % 60)}s`,
          score: 100,
          lang: lang.toUpperCase()
        },
        ...prev.filter(c => c.id !== "curr-user")
      ]);

      // Save complete status into localStorage to unlock badges in dashboard!
      localStorage.setItem(`dsa-challenge-${activeChallenge.id}`, "Completed");
    }, 2200);
  };

  return (
    <div className="bg-slate-950 text-slate-100 min-h-[calc(100vh-65px)] px-4 py-6 md:px-6 relative flex flex-col" id="challenge-arena">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between mb-5 gap-3 border-b border-slate-900 pb-4">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setCurrentPage("dashboard")} 
            className="p-2 ml-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-800/80 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4.5 w-4.5" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] bg-red-950 text-red-400 font-mono font-bold uppercase py-0.5 px-2 rounded-full border border-red-900/30 tracking-wider">🔥 Elite Live Arena</span>
              <span className="text-xs text-slate-500 font-mono">Arena ID: {activeChallenge.id}</span>
            </div>
            <h1 className="text-xl font-black text-white leading-tight mt-0.5">{activeChallenge.title}</h1>
          </div>
        </div>

        {/* Global Live Statistics ticker */}
        <div className="flex items-center space-x-4 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2 mt-2 md:mt-0 shadow-lg relative overflow-hidden">
          {/* Active green pulsing dot */}
          <div className="absolute right-0 top-0 h-1.5 w-1.5 bg-red-500 rounded-full animate-ping mt-1 mr-1" />
          
          <div className="flex items-center space-x-2">
            <Clock className={`h-5 w-5 ${personalTimer < 300 ? "text-red-500 animate-pulse" : "text-indigo-400"}`} />
            <div>
              <span className="text-[9.5px] uppercase font-mono text-slate-500">Solve Time Left</span>
              <span className={`text-base font-black font-mono block leading-none ${personalTimer < 300 ? "text-red-500" : "text-white"}`}>
                {formatTimer(personalTimer)}
              </span>
            </div>
          </div>

          <div className="h-8 border-r border-slate-800" />

          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-indigo-400" />
            <div>
              <span className="text-[9.5px] uppercase font-mono text-slate-500">Live Competitors</span>
              <span className="text-base font-black text-indigo-300 block leading-none">
                {competitors.length} Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Splits Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-stretch">
        
        {/* Left column: Instructions & Details (4 cols) */}
        <div className="lg:col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between max-h-[80vh] overflow-y-auto space-y-6 shadow-md shadow-slate-950/50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
               <span className="text-xs font-bold text-indigo-400 bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-900/30">{activeChallenge.category}</span>
               <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                 activeChallenge.difficulty === "Easy" ? "bg-emerald-950 text-emerald-400" :
                 activeChallenge.difficulty === "Medium" ? "bg-amber-950 text-amber-400" :
                 "bg-red-950 text-red-400"
               }`}>
                 {activeChallenge.difficulty} — {activeChallenge.id.startsWith("daily-") ? activeChallenge.points * 2 : activeChallenge.points} pts
                 {activeChallenge.id.startsWith("daily-") && " (2X BOOST)"}
               </span>
            </div>

            {activeChallenge.id.startsWith("daily-") && (
              <div className="bg-gradient-to-r from-amber-600/20 via-rose-600/20 to-indigo-600/20 border border-amber-500/30 rounded-xl p-3 text-[11px] text-amber-300 font-medium relative overflow-hidden animate-pulse">
                <span className="font-extrabold uppercase text-xs block mb-1">⚡ SPECIAL DAILY EVENT ACTIVE</span>
                This challenge is today's randomly selected Daily Problem! Solve it to claim <strong>double rewards (2x Points)</strong> and unlock executive milestone badges.
              </div>
            )}

            <div className="prose prose-invert max-w-none text-slate-300 text-xs leading-relaxed">
              <h3 className="text-sm font-extrabold text-white mb-2">Instructions</h3>
              <p className="whitespace-pre-line">{activeChallenge.description}</p>
            </div>

            {/* Examples Container */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black uppercase text-slate-400 font-mono">Standard Test Examples</h4>
              {activeChallenge.examples.map((ex: any, idx: number) => (
                <div key={idx} className="bg-slate-950/80 border border-slate-855 rounded-xl p-3 text-xs leading-relaxed space-y-1">
                  <div>
                    <span className="text-indigo-400 font-bold font-mono">Example {idx + 1} Input:</span>
                    <pre className="text-[10px] text-slate-300 font-mono mt-0.5 overflow-x-auto select-all">{ex.input}</pre>
                  </div>
                  <div className="mt-1.5">
                    <span className="text-emerald-400 font-bold font-mono">Example {idx + 1} Output:</span>
                    <pre className="text-[10px] text-slate-300 font-mono mt-0.5 select-all">{ex.output}</pre>
                  </div>
                  {ex.explanation && (
                    <p className="text-[10.5px] text-slate-500 mt-1 leading-snug italic">Note: {ex.explanation}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Constraints block */}
            <div className="pt-2">
              <span className="text-xs font-black uppercase text-slate-400 font-mono">Execution Constraints</span>
              <ul className="list-disc list-inside text-[11px] text-slate-400 mt-1 space-y-1 pl-1">
                {activeChallenge.constraints.map((c: string, idx: number) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-850 flex items-start space-x-2.5 mt-5">
            <Info className="h-4.5 w-4.5 text-indigo-400 mt-0.5 shrink-0" />
            <p className="text-[10px] text-slate-400 leading-normal">
              Remember to maintain optimum time limits. Competitors scores degrade dynamically the longer they take to resolve standard validation rules.
            </p>
          </div>
        </div>

        {/* Center/Right Core editor (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden flex flex-col flex-1 shadow-md shadow-slate-950/50">
            {/* Control Editor Bar */}
            <div className="bg-slate-950 border-b border-slate-850 px-4 py-2.5 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-white">Algorithm Workplace</span>
                <span className="text-[9.5px] bg-emerald-950 text-emerald-400 border border-emerald-900/30 px-1.5 py-0.5 rounded font-bold font-mono">Live Sync</span>
              </div>

              {/* Language Picker */}
              <div className="flex items-center space-x-1.5">
                <label className="text-[10px] text-slate-400 font-mono">Environment:</label>
                <select 
                  value={lang} 
                  onChange={(e) => setLang(e.target.value)}
                  className="bg-slate-900 text-slate-200 text-xs font-bold font-mono py-1 px-2.5 rounded-lg border border-slate-800 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python 3</option>
                  {activeChallenge.boilerplate.cpp && <option value="cpp">C++ (GCC 11)</option>}
                </select>
              </div>
            </div>

            {/* Monaco Container */}
            <div className="flex-1 min-h-[350px] relative">
              <Editor
                height="100%"
                language={lang === "cpp" ? "cpp" : lang}
                theme="vs-dark"
                value={code}
                onChange={(v) => setCode(v || "")}
                options={{
                  fontSize: 12,
                  fontFamily: "JetBrains Mono, monospace",
                  minimap: { enabled: false },
                  scrollbar: { vertical: "visible", horizontal: "auto" },
                  automaticLayout: true,
                  padding: { top: 12, bottom: 12 }
                }}
              />
            </div>

            {/* Run controls footer */}
            <div className="bg-slate-950 border-t border-slate-850 p-3.5 flex items-center justify-between">
              <button 
                onClick={() => setCode(activeChallenge.boilerplate[lang] || "")}
                className="bg-slate-900 hover:bg-slate-800 text-slate-350 hover:text-white px-3 py-1.5 rounded-xl border border-slate-800 font-semibold text-xs flex items-center space-x-1.5 cursor-pointer transition-all duration-150"
                title="Reset code window"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset Block</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRunCode}
                  disabled={isSubmitting || personalTimer === 0}
                  className="bg-slate-900 hover:bg-slate-800 text-indigo-400 hover:text-indigo-300 font-bold text-xs py-2 px-4 rounded-xl border border-indigo-900/30 flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-150"
                >
                  <Play className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Run Standard Tests</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting || personalTimer === 0}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs py-2 px-5 rounded-xl flex items-center space-x-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-950/25 transition-all duration-150"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Submit Solution</span>
                </button>
              </div>
            </div>
          </div>

          {/* Test Outcomes box below Code editor */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 min-h-[140px] flex flex-col justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-500 font-mono tracking-wider block mb-2">Test Console Diagnostics</span>
              
              {!outcomes && !isSubmitting && (
                <div className="flex flex-col items-center justify-center py-6 text-slate-500 space-y-1">
                  <Terminal className="h-7 w-7 text-slate-600 mb-1" />
                  <span className="text-xs">No compiled evaluation run yet.</span>
                  <span className="text-[10px] text-slate-600">Run or Submit to view diagnostic outputs.</span>
                </div>
              )}

              {isSubmitting && (
                <div className="flex flex-col items-center justify-center py-6 text-slate-400 space-y-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-500 mb-1"></div>
                  <span className="text-xs uppercase font-mono animate-pulse font-bold tracking-wider text-indigo-400">Compiling on sandboxed clusters...</span>
                </div>
              )}

              {outcomes && !isSubmitting && (
                <div className="space-y-2 font-mono">
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-black px-2 py-0.5 rounded ${
                      outcomes.status.includes("Accepted") || outcomes.status.includes("COMPLETION") ? "bg-emerald-950 text-emerald-400 border border-emerald-900/30" : "bg-red-950 text-red-400"
                    }`}>
                      STATUS: {outcomes.status}
                    </span>
                    <div className="flex items-center space-x-2.5 text-[10px] text-slate-400 mt-1">
                      <span className="flex items-center text-slate-500"><Cpu className="h-3.5 w-3.5 mr-0.5 text-slate-650" /> {outcomes.runtime}</span>
                      <span className="flex items-center text-slate-500"><History className="h-3.5 w-3.5 mr-0.5 text-slate-650" /> {outcomes.memory}</span>
                    </div>
                  </div>
                  <div className="bg-slate-950 border border-slate-850 p-2 text-[10px] text-emerald-400 rounded-lg whitespace-pre-wrap select-all leading-relaxed max-h-[110px] overflow-y-auto">
                    {outcomes.passed ? <p className="font-bold border-b border-emerald-950/80 pb-1 mb-1">{outcomes.passed}</p> : null}
                    {outcomes.details}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Multi-user Competitors and Arena Activity logs (3 cols) */}
        <div className="lg:col-span-3 flex flex-col space-y-5">
          
          {/* Competitors List */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4.5 flex flex-col flex-1 min-h-[220px]">
            <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
              <div className="flex items-center space-x-1.5">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-extrabold text-white">Live Leaderboard</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">{competitors.length} users</span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[220px] flex-1 pr-1">
              {competitors.map((comp, idx) => (
                <div key={comp.id} className="bg-slate-950 border border-slate-850/80 rounded-xl p-2.5 flex items-center justify-between hover:border-slate-800 transition-all">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="h-7 w-7 rounded-lg bg-indigo-950/80 border border-indigo-900/30 text-indigo-400 text-xs font-black flex items-center justify-center select-none shrink-0">
                      {comp.avatar}
                    </div>
                    <div className="min-w-0">
                      <span className="text-[11.5px] font-bold text-white block leading-snug truncate">{comp.name}</span>
                      <span className="text-[9.5px] text-slate-500 font-mono block leading-none mt-0.5">{comp.role} • {comp.lang}</span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {comp.status === "Submitted" ? (
                      <div>
                        <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-900/30 py-0.5 px-1.5 rounded font-bold">Solved</span>
                        <p className="text-[8px] text-slate-500 mt-0.5 leading-none">{comp.solveTime} ({comp.score}%)</p>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <span className="text-[9.5px] text-slate-400 font-semibold">{comp.status}</span>
                        {/* Static mini progress bar */}
                        <div className="w-14 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                          <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${comp.progress}%` }} />
                        </div>
                        <p className="text-[8px] text-slate-500 font-mono leading-none">{comp.progress}%</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Arena Ticker Activity Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col h-[230px]">
            <div className="flex items-center space-x-1.5 mb-2.5 shrink-0 border-b border-slate-800 pb-1.5">
              <Terminal className="h-4 w-4 text-emerald-400 scroll-smooth" />
              <span className="text-xs font-extrabold text-slate-200">Arena Live Ticker Ticks</span>
            </div>

            <div className="overflow-y-auto flex-1 bg-slate-950/80 border border-slate-850/80 p-2.5 rounded-xl font-mono text-[9px] text-slate-400 leading-normal space-y-1.5 max-h-[160px]">
              {liveLogs.map((log, lIdx) => (
                <div key={lIdx} className="break-all border-b border-slate-900/30 pb-0.5">
                  {log.includes("✔️") || log.includes("Accepted") || log.includes("CONGRATULATIONS") ? (
                    <span className="text-emerald-400">{log}</span>
                  ) : log.includes("WRONG") || log.includes("Anomalies") || log.includes("TIME LIMIT") ? (
                    <span className="text-red-400">{log}</span>
                  ) : (
                    log
                  )}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>

        </div>

      </div>

      {/* SUCCESS POPUP MODAL CELEBRATION */}
      {successModal && (
        <div className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" id="success-celebration-popup">
          <div className="bg-gradient-to-tr from-slate-900 to-indigo-950 border border-indigo-500/30 rounded-3xl p-8 max-w-md w-full text-center relative overflow-hidden shadow-2xl">
            
            <span className="text-5xl mt-2 select-none animate-bounce block">🏆</span>
            <h2 className="text-2xl font-black text-white mt-4">Simulation Solved!</h2>
            <p className="text-xs text-indigo-300 font-mono mt-1 uppercase tracking-widest">Global Challenge Status: Verified</p>

            <p className="text-xs text-slate-300 mt-4 leading-relaxed">
              Your algorithm was evaluated perfectly against all standard compile queries and memory load parameters in <span className="text-emerald-400 font-bold font-mono">34ms</span>.
            </p>

            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-855/65 my-6 text-left space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Placement Readiness bonus:</span>
                <span className="text-emerald-400 font-bold font-mono font-black">+12% Gain Score</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Unlocked Achievement Badge:</span>
                <span className="text-amber-400 font-bold font-bold">🥇 Tree Master</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Rank Segment position:</span>
                <span className="text-indigo-400 font-bold font-mono">Top #2 on Leaderboard</span>
              </div>
            </div>

            <button
              onClick={() => {
                setSuccessModal(false);
                setCurrentPage("dashboard");
              }}
              className="w-full bg-indigo-600 hover:bg-indigo-505 text-white font-black py-3 rounded-xl cursor-pointer shadow-lg shadow-indigo-950/25 transition-all text-sm"
            >
              Back to Candidate Dashboard
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
