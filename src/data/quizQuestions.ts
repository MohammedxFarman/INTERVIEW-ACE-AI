export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export const QUIZ_QUESTIONS: Record<
  "stack" | "queue" | "array" | "bst" | "hash_map" | "sliding_window",
  QuizQuestion[]
> = {
  stack: [
    {
      id: "st_1",
      question: "Which of the following principles describes how elements are added to and removed from a Stack?",
      options: [
        "FIFO (First In, First Out) - elements are processed sequentially",
        "LIFO (Last In, First Out) - the most recent entry leaves first",
        "LILO (Last In, Last Out) - oldest elements are removed first",
        "Random Access - any element can be removed instantly"
      ],
      correctIndex: 1,
      explanation: "Stacks operate on the Last In, First Out (LIFO) principle. Think of a stack of plates: you place new plates on top, and you must remove the top plate first."
    },
    {
      id: "st_2",
      question: "What is the true execution time complexity of a standard Peek or Pop operation on a stack containing N elements?",
      options: [
        "O(N) - since you have to shift the remainder of items",
        "O(log N) - since the stack splits its elements dynamically",
        "O(1) - because the top element's position is tracked in constant time",
        "O(N²) - due to structural memory re-organization overhead"
      ],
      correctIndex: 2,
      explanation: "Pop and Peek operations only look at or remove the element at the top index (using a top pointer). No array indexing traversals are needed, so it takes O(1) constant time."
    },
    {
      id: "st_3",
      question: "What exceptional condition occurs if a developer attempts to pop/delete an item from an empty stack?",
      options: [
        "Stack Overflow - memory allocations exceed limits",
        "Stack Underflow - operation requested on an empty dataset boundary",
        "Null Pointer Exception - system reference points to garbage memory",
        "Static Leakage - stack variables leak into static heaps"
      ],
      correctIndex: 1,
      explanation: "Attempting to retrieve or delete elements from an empty stack results in a 'Stack Underflow'. Conversely, pushing items onto a stack that has exceeded its physical memory storage results in a 'Stack Overflow'."
    },
    {
      id: "st_4",
      question: "Which of the following applications primarily relies on a stack data structure for its basic operations?",
      options: [
        "Printer queue scheduling jobs concurrently",
        "Undo/Redo history (Ctrl+Z) and function call stacks during recursion",
        "Sorting elements in alphabetical order",
        "Broadcasting live network packets to routers"
      ],
      correctIndex: 1,
      explanation: "Since undo operations require reverting the absolute latest action first, and recursive function calls require resolving local scopes in reverse chronological order, both are perfect stack (LIFO) applications."
    },
    {
      id: "st_5",
      question: "Suppose you push values [15, 42, 8] onto an empty stack in sequential order. What is the output of three consecutive pop operations?",
      options: [
        "15, 42, 8 (maintains FIFO insert order)",
        "8, 42, 15 (strict LIFO reversal order)",
        "42, 15, 8 (sorted binary extraction)",
        "15, 8, 42 (random memory retrieval sequence)"
      ],
      correctIndex: 1,
      explanation: "The values are pushed on top of each other: first 15 (bottom), then 42, then 8 (top). Popping removes from top-to-bottom, yielding 8 first, then 42, then 15."
    }
  ],
  queue: [
    {
      id: "q_1",
      question: "Which ordering paradigm represents the scheduling model of a Queue?",
      options: [
        "LIFO (Last In, First Out) - reverse chronological stack handling",
        "FIFO (First In, First Out) - elements are processed in order of arrival",
        "Priority Casework - elements are handled based on absolute sizing weight",
        "Random Access - items are processed via hash indices"
      ],
      correctIndex: 1,
      explanation: "Queues operate on First In, First Out (FIFO). The first element to join the queue (the front) is the first to be served, like customers waiting in a check-out line."
    },
    {
      id: "q_2",
      question: "In a naive standard array queue, what is the worst-case complexity of a Dequeue operation if elements are shifted leftwards?",
      options: [
        "O(N) - since N-1 remaining values have to slide down one indices",
        "O(1) - due to instant head-pointer index referencing",
        "O(log N) - since empty slots are binary-searched",
        "O(N²) - due to cyclic iterations during pointer reset"
      ],
      correctIndex: 0,
      explanation: "If you implement a queue with a standard array and shift every single remaining element left to fill the vacant index 0 on dequeue, it takes O(N) linear time. To make Dequeue O(1), circular arrays or head/tail pointer systems must be deployed."
    },
    {
      id: "q_3",
      question: "Which of the following describes a 'Double-Ended Queue' (Deque)?",
      options: [
        "A queue where insertions happen at the rear, but deletions can target two items simultaneously",
        "A hybrid sequence that permits insertions and removals at both the front and rear bounds",
        "A queue containing duplicate references of each member",
        "A queue optimized for running on dual-core processors"
      ],
      correctIndex: 1,
      explanation: "A Deque (short for Double-Ended Queue, pronounced 'deck') gives developers the flexibility of both stacks and queues, allowing addition and removal from both front and rear in O(1) time."
    },
    {
      id: "q_4",
      question: "Which tree traversal/graph search algorithm relies heavily on a Queue to process nodes level-by-level?",
      options: [
        "Depth-First Search (DFS) - traversing deep down a single parent path",
        "Breadth-First Search (BFS) - exploring neighbors first before diving deeper",
        "Binary Search - dividing search boundaries sequentially",
        "Preorder Tree Traversal - visiting parent blocks before children"
      ],
      correctIndex: 1,
      explanation: "BFS explores coordinates level-by-level (expanding outwards like ripples). A Queue is needed to process nodes in the strict order they were encountered (FIFO), keeping child nodes tracked behind parent levels."
    },
    {
      id: "q_5",
      question: "What is a Circular Queue primarily designed to solve?",
      options: [
        "Infinite loops during recursion traversal",
        "Wasted memory spaces at the front of an array after progressive dequeues",
        "Double insertion errors",
        "Memory leaks during heavy structural node deletions"
      ],
      correctIndex: 1,
      explanation: "In a linear array queue, dequeues increment the 'front' index, leaving empty, unusable memory slots at the beginning. A circular queue wraps the rear pointer back to the front via modulo math, reusing vacated memory slots."
    }
  ],
  array: [
    {
      id: "arr_1",
      question: "Why is retrieving an element by index in a dynamic array extremely fast (O(1))?",
      options: [
        "Arrays use an internal binary trees structure to search indexes",
        "Array elements are stored in contiguous memory addresses, enabling index-offset multiplication",
        "The browser pre-loads all array indices in local cash threads",
        "Dynamic arrays automatically index keys linearly"
      ],
      correctIndex: 1,
      explanation: "Because arrays are contiguous blocks of memory, the computer calculates the item’s address instantly using: StartAddress + (Index * SizeOfElement). This calculation is constant-time O(1)."
    },
    {
      id: "arr_2",
      question: "What is the amortized cost of inserting an element at the end of a dynamic array (like JavaScript Array or Java ArrayList)?",
      options: [
        "O(1) - because the majority of insertions map to readily allocated slots",
        "O(N) - because every insertion triggers complete array copies",
        "O(log N) - because the buffer grows logarithmically",
        "O(1) in theory, but O(N²) in practical garbage collecting threads"
      ],
      correctIndex: 0,
      explanation: "While a dynamic array sometimes grows and copies elements (costing O(N)), this occurs rarely (usually capacity doubles). When spread over N insertions, the average cost per insertion is amortized to constant O(1)."
    },
    {
      id: "arr_3",
      question: "What is the worst-case time complexity of inserting a value at the beginning (index 0) of an array containing N elements?",
      options: [
        "O(1) - since it is just an edit to the head node",
        "O(N) - because every single existing element must shift one index block to the right",
        "O(log N) - due to binary splitting inside arrays",
        "O(N²) - because shifting requires double iteration maps"
      ],
      correctIndex: 1,
      explanation: "To place a new element at index 0, the array must free up space by moving index 0 to index 1, index 1 to index 2, and so on. This linear cascading shift takes O(N) operations."
    },
    {
      id: "arr_4",
      question: "If a dynamic array starts with capacity 4, and doubles each time it overflows, how many total elements are copied when inserting 5 elements?",
      options: [
        "0 elements - arrays use linked references to append on overflow",
        "4 elements - copied during the single overflow resize from capacity 4 to 8",
        "16 elements - copied constantly during each consecutive insert",
        "5 elements - all items are duplicated during initialization"
      ],
      correctIndex: 1,
      explanation: "The array accommodates 4 elements natively. When the 5th element is inserted, it overflows. The array resizes to capacity 8 and copies the initial 4 elements to the new block. The 5th element is then added without additional copies."
    },
    {
      id: "arr_5",
      question: "In which scenario would a Doubly Linked List perform better than a Dynamic Array?",
      options: [
        "Frequent random index lookups (e.g., retrieving items at index 1000 arbitrary times)",
        "Frequent additions and deletions at random positions after locating the memory address",
        "Conserving overall memory usage since linked lists have lower overhead",
        "Iterative linear traversal speeds"
      ],
      correctIndex: 1,
      explanation: "Linked lists only swap pointer fields (O(1)) to add/delete nodes anywhere once reference pointers are set. Arrays require shifting all subsequent items (O(N)), making lists highly superior for heavy insertion/deletion operations."
    }
  ],
  bst: [
    {
      id: "bst_1",
      question: "What rule governs the relationship between parents and child subtrees in a valid Binary Search Tree (BST)?",
      options: [
        "All values in the left subtree must be larger, and right subtree values must be smaller than the root node",
        "All values in the left subtree must be less than, and right subtree values must be greater than the root node",
        "Both left and right child nodes must maintain balance factors within +/- 2",
        "Each parent node must have exactly two non-null leaf nodes"
      ],
      correctIndex: 1,
      explanation: "A BST maintains sorted data: for any node, all left descendants have values less than the node, and all right descendants have values higher than it."
    },
    {
      id: "bst_2",
      question: "Under which condition does search and insertion time complexity on a BST degrade from O(log N) to O(N)?",
      options: [
        "When the BST is perfectly balanced and full",
        "When elements are inserted in already-sorted order, creating a skewed tree (e.g., [10, 20, 30, 40])",
        "When the tree has an odd number of level layers",
        "When keys contain floating point fractional values"
      ],
      correctIndex: 1,
      explanation: "Inserting sorted values adds items in a single linear chain (a skewed tree). This removes the branching search benefit, turning the tree into a linked list where search requires O(N) traversals."
    },
    {
      id: "bst_3",
      question: "Which binary tree traversal algorithm prints the elements of a BST in strictly sorted, ascending order?",
      options: [
        "Preorder Traversal (Root, Left, Right)",
        "Inorder Traversal (Left, Root, Right)",
        "Postorder Traversal (Left, Right, Root)",
        "Level-Order Traversal (Breadth-First Scan)"
      ],
      correctIndex: 1,
      explanation: "Inorder traversal visits the left subtree (smaller), then the current node, then the right subtree (larger). For a BST, this traversal outputs values in sorted, ascending order."
    },
    {
      id: "bst_4",
      question: "What is the worst-case space complexity of recursive search on a BST with N total nodes and height H?",
      options: [
        "O(1) - because tree nodes occupy heap space without stack use",
        "O(H) - matching recursion call stack allocations proportional to height H",
        "O(N log N) - due to double recursive branch operations",
        "O(2^H) - due to exponential child nodes expansion"
      ],
      correctIndex: 1,
      explanation: "Each recursive call adds a stack frame. The maximum call stack depth corresponds to the deepest branch path traversed, which equals the tree's height H."
    },
    {
      id: "bst_5",
      question: "An empty BST receives insertions in the following order: [40, 20, 60, 50]. What is the root node, and what is its right child?",
      options: [
        "Root is 40; its right child is 20",
        "Root is 40; its right child is 60",
        "Root is 50; its right child is 60",
        "Root is 20; its right child is 40"
      ],
      correctIndex: 1,
      explanation: "40 is inserted first, becoming the root. 20 (smaller than 40) becomes the root's left child. 60 (larger than 40) becomes the root's right child. 50 (larger than 40, smaller than 60) becomes 60's left child."
    }
  ],
  hash_map: [
    {
      id: "hm_1",
      question: "What is a 'Collision' in the context of a Hashing Map?",
      options: [
        "When two completely identical keys trigger memory access errors",
        "When two distinct key inputs generate the same bucket slot index under the hash arithmetic",
        "When the hash map index pointers overflow allocated 32-bit registers",
        "When an update overwrites an existing key-value mapping"
      ],
      correctIndex: 1,
      explanation: "A collision occurs when different keys hash to the same bucket index (e.g., under a modulo 5 hash, key 12 and key 17 both map to index 2). Hash maps must resolve collisions to store both keys."
    },
    {
      id: "hm_2",
      question: "How does 'Separate Chaining' resolve hash collisions?",
      options: [
        "By probing sequential indexes (index+1, index+2) to store the colliding key in the main array",
        "By keeping a linked list inside each bucket to store all colliding keys together",
        "By re-running a secondary secret hash function to generate a new slot",
        "By double-allocating database size on every collision trigger"
      ],
      correctIndex: 1,
      explanation: "In separate chaining, each index of the hash array points to a list (a chain) of entries. Colliding elements are appended to this chain, keeping them grouped at that index."
    },
    {
      id: "hm_3",
      question: "What does a load factor of α = 1.6 mean in a Hash Map with 5 bucket slots?",
      options: [
        "There are exactly 1.6 times more bucket slots than keys",
        "There are 8 total elements stored, averaging 1.6 keys per bucket slot",
        "The computer's RAM storage capacity has overflowed by 60%",
        "The retrieval time complexity has increased by a factor of 1.6logN"
      ],
      correctIndex: 1,
      explanation: "The load factor α is defined as N (total keys) divided by B (total buckets). If N/B = 1.6 with B = 5 buckets, N = 8 elements. On average, each slot contains 1.6 nodes, indicating collisions."
    },
    {
      id: "hm_4",
      question: "If all N keys hash to the exact same bucket, what is the lookup time complexity in a Separately Chained Hash Map?",
      options: [
        "O(1) - because the index calculation is still constant time",
        "O(N) - because we must search sequentially through a single chain of size N",
        "O(log N) - since the elements are binary nested automatically",
        "O(B) - limited strictly by bucket count limits"
      ],
      correctIndex: 1,
      explanation: "While calculating the hash index is O(1), finding the key requires iterating through the chain at that index. If all elements are chained at a single index, traversal behaves like a linked list search and takes O(N) time."
    },
    {
      id: "hm_5",
      question: "Which of the following is an alternative to Separate Chaining that stores elements inside adjacent array slots directly?",
      options: [
        "Dynamic Allocation Pointer systems",
        "Open Addressing (e.g., Linear Probing)",
        "B-Tree nesting nodes",
        "Depth-first indexing matrix mapping"
      ],
      correctIndex: 1,
      explanation: "Open Addressing (such as Linear Probing, Quadratic Probing, or Double Hashing) handles collisions by searching for the next empty slot in the array itself, avoiding dynamic chaining allocations."
    }
  ],
  sliding_window: [
    {
      id: "sw_1",
      question: "What makes the Sliding Window technique highly efficient (O(N)) compared to a brute-force approach?",
      options: [
        "It uses parallel GPU threads to calculate subarray balances",
        "It avoids redundant work by updating and reusing overlapping calculation boundaries",
        "It sorts the array in advance to skip checks",
        "It halves the subarray size recursively on each loop"
      ],
      correctIndex: 1,
      explanation: "Instead of recalculating the sum of each window of size K from scratch (costing O(N * K)), the sliding window computes the next window by adding the entering item and subtracting the exiting item in O(1) time."
    },
    {
      id: "sw_2",
      question: "For an array of size N = 10, how many contiguous subarrays of size K = 3 exist?",
      options: [
        "10 subarrays",
        "8 subarrays",
        "30 subarrays",
        "7 subarrays"
      ],
      correctIndex: 1,
      explanation: "The formula is: N - K + 1. For N = 10 and K = 3, we have 10 - 3 + 1 = 8 sub-intervals, starting at index 0 and ending at index 7."
    },
    {
      id: "sw_3",
      question: "Which pair of actions represents shifts in a fixed sliding window of size K over an array?",
      options: [
        "Move the Right pointer rightward while keeping Left pointer locked constant",
        "Advance both Left and Right pointers by exactly 1 index unit to shift the window frame forward",
        "Move both pointers inward toward the center index coordinator",
        "Reset Left pointer back to 0 on each step"
      ],
      correctIndex: 1,
      explanation: "To shift a fixed-size window of length K, both the Left and Right pointers must step forward by 1 in unison, keeping the distance between them (the window size) constant."
    },
    {
      id: "sw_4",
      question: "What is the time complexity of finding the maximum sum of a window of size K in an array of size N using the Sliding Window technique?",
      options: [
        "O(N * K) - due to continuous internal iterations",
        "O(N) - because each sliding step computes the window update in constant time",
        "O(N²) - due to worst-case pointer mismatch overlaps",
        "O(log N) - matching height split indexes"
      ],
      correctIndex: 1,
      explanation: "Because each sliding transition only takes a constant O(1) arithmetic operations (one addition, one subtraction), iterating across the N elements requires O(N) linear time."
    },
    {
      id: "sw_5",
      question: "Which of the following problems is best solved using a DYNAMIC/VARIABLE size sliding window instead of a fixed size window?",
      options: [
        "Find the average score of all groups of size 4 contiguous students",
        "Find the shortest contiguous subarray whose elements sum to at least target S",
        "Find the maximum element in sliding frames of exactly size K",
        "Reverse an array in-place"
      ],
      correctIndex: 1,
      explanation: "Problems where the constraint is on a property of the output (e.g. sum >= S) rather than a fixed slice length require expanding and contracting the window size dynamically, which is modeled by a variable-size window."
    }
  ]
};
