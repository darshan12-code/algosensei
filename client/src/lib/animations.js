// src/lib/animations.js
// Each problem entry has an array of `approaches` — different ways to solve it.
// The Visualize page picks approach[0] by default and lets users switch.
// vizType determines which renderer in Visualizer.jsx is used.
//
// Viz types available:
//   'bars'       — vertical bar chart (sorting, kadane)
//   'array'      — horizontal boxes with pointer labels
//   'hashmap'    — array + map panel side by side
//   'stack'      — input array + stack column
//   'twoptr'     — array with L/R/i pointer labels + info panel
//   'dp'         — 1D dp[] table OR 2D dp[][] table (set dpTable2d)
//   'tree'       — SVG binary tree (set treeNodes per step)
//   'grid'       — 2D matrix with row/col highlights (NEW)
//   'histogram'  — bars + monotonic stack overlay (NEW)

// ─────────────────────────────────────────────────────────────────────────────
// HELPER: each problem is { id, title, approaches: [...] }
// Each approach is a full animation object:
//   { label, vizType, timeComplexity, spaceComplexity, steps[], conceptExplain, interviewTip }
// ─────────────────────────────────────────────────────────────────────────────

export const PROBLEMS = [

  // ══════════════════════════════════════════════════════
  // SORTING
  // ══════════════════════════════════════════════════════

  {
    id: 'bubbleSort',
    title: '🫧 Bubble Sort',
    category: 'Sorting',
    difficulty: 'Easy',
    approaches: [
      {
        label: 'Classic Bubble Sort',
        vizType: 'bars',
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
        steps: [
          { arr: [5,3,8,1,9,2], highlight:[], compare:[], sorted:[], pointers:{}, mapState:{}, explain:'Starting array. Compare adjacent pairs; swap if left > right. Largest element bubbles to end each pass.' },
          { arr: [5,3,8,1,9,2], highlight:[], compare:[0,1], sorted:[], pointers:{}, mapState:{}, explain:'Compare arr[0]=5 and arr[1]=3. 5 > 3 → swap.' },
          { arr: [3,5,8,1,9,2], highlight:[0,1], compare:[1,2], sorted:[], pointers:{}, mapState:{}, explain:'Swapped → [3,5,8,1,9,2]. Compare arr[1]=5 and arr[2]=8. 5 < 8 → no swap.' },
          { arr: [3,5,8,1,9,2], highlight:[], compare:[2,3], sorted:[], pointers:{}, mapState:{}, explain:'Compare arr[2]=8 and arr[3]=1. 8 > 1 → swap.' },
          { arr: [3,5,1,8,9,2], highlight:[2,3], compare:[4,5], sorted:[], pointers:{}, mapState:{}, explain:'Compare arr[4]=9 and arr[5]=2. 9 > 2 → swap. Pass 1 done — 9 in final position.' },
          { arr: [3,5,1,8,2,9], highlight:[], compare:[], sorted:[5], pointers:{}, mapState:{}, explain:'Pass 1 complete. 9 is sorted (green).' },
          { arr: [3,1,5,2,8,9], highlight:[], compare:[], sorted:[4,5], pointers:{}, mapState:{}, explain:'Pass 2 complete. 8 and 9 are sorted.' },
          { arr: [1,3,2,5,8,9], highlight:[], compare:[], sorted:[3,4,5], pointers:{}, mapState:{}, explain:'Pass 3 complete. 5, 8, 9 are sorted.' },
          { arr: [1,2,3,5,8,9], highlight:[], compare:[], sorted:[0,1,2,3,4,5], pointers:{}, mapState:{}, explain:'✅ Fully sorted: [1,2,3,5,8,9]. O(n²) worst case.' },
        ],
        conceptExplain: 'Bubble Sort repeatedly compares adjacent elements and swaps them if out of order. The largest unsorted element "bubbles" to its correct position each pass.',
        interviewTip: 'Mention the early-exit optimization: if no swaps occur in a pass, the array is sorted → O(n) best case.',
      },
      {
        label: 'Optimized (Early Exit)',
        vizType: 'bars',
        timeComplexity: 'O(n) best, O(n²) worst',
        spaceComplexity: 'O(1)',
        steps: [
          { arr: [1,2,3,5,8,9], highlight:[], compare:[], sorted:[], pointers:{}, mapState:{ swapped:'false' }, explain:'Nearly sorted input. Track a `swapped` flag each pass.' },
          { arr: [1,2,3,5,8,9], highlight:[], compare:[0,1], sorted:[], pointers:{}, mapState:{ swapped:'false' }, explain:'Compare 1 and 2. No swap. swapped stays false.' },
          { arr: [1,2,3,5,8,9], highlight:[], compare:[1,2], sorted:[], pointers:{}, mapState:{ swapped:'false' }, explain:'Compare 2 and 3. No swap.' },
          { arr: [1,2,3,5,8,9], highlight:[], compare:[2,3], sorted:[], pointers:{}, mapState:{ swapped:'false' }, explain:'Compare 3 and 5. No swap.' },
          { arr: [1,2,3,5,8,9], highlight:[], compare:[3,4], sorted:[], pointers:{}, mapState:{ swapped:'false' }, explain:'Compare 5 and 8. No swap.' },
          { arr: [1,2,3,5,8,9], highlight:[], compare:[4,5], sorted:[], pointers:{}, mapState:{ swapped:'false' }, explain:'Compare 8 and 9. No swap. End of pass. swapped=false → STOP EARLY!' },
          { arr: [1,2,3,5,8,9], highlight:[], compare:[], sorted:[0,1,2,3,4,5], pointers:{}, mapState:{}, explain:'✅ Sorted in 1 pass = O(n)! Early-exit optimization detects already-sorted input.' },
        ],
        conceptExplain: 'Optimized Bubble Sort adds a `swapped` flag. If an entire pass makes no swaps, the array is sorted — no need to continue. This gives O(n) best case for sorted or nearly-sorted inputs.',
        interviewTip: 'This optimization is the key insight interviewers want. Without it, Bubble Sort always runs O(n²) even on sorted data.',
      },
    ],
  },

  {
    id: 'selectionSort',
    title: '📌 Selection Sort',
    category: 'Sorting',
    difficulty: 'Easy',
    approaches: [
      {
        label: 'Standard Selection Sort',
        vizType: 'bars',
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
        steps: [
          { arr: [64,25,12,22,11], highlight:[], compare:[], sorted:[], pointers:{ min:0 }, mapState:{}, explain:'Find minimum in entire array. Minimum candidate starts at index 0 (64).' },
          { arr: [64,25,12,22,11], highlight:[4], compare:[0,4], sorted:[], pointers:{ min:4 }, mapState:{}, explain:'11 < 64 → new min at index 4.' },
          { arr: [11,25,12,22,64], highlight:[0], compare:[], sorted:[0], pointers:{}, mapState:{}, explain:'Swap arr[0]=64 with min arr[4]=11. Index 0 sorted.' },
          { arr: [11,25,12,22,64], highlight:[2], compare:[1,2], sorted:[0], pointers:{ min:2 }, mapState:{}, explain:'Pass 2: scan indices 1–4. Min = 12 at index 2.' },
          { arr: [11,12,25,22,64], highlight:[], compare:[], sorted:[0,1], pointers:{}, mapState:{}, explain:'Swap index 1 and 2. Indices 0–1 sorted.' },
          { arr: [11,12,22,25,64], highlight:[], compare:[], sorted:[0,1,2], pointers:{}, mapState:{}, explain:'Pass 3: min=22 at index 3. Swap index 2 and 3. Indices 0–2 sorted.' },
          { arr: [11,12,22,25,64], highlight:[], compare:[], sorted:[0,1,2,3,4], pointers:{}, mapState:{}, explain:'✅ Sorted: [11,12,22,25,64]. Selection Sort always does exactly n-1 swaps.' },
        ],
        conceptExplain: 'Selection Sort divides the array into sorted (left) and unsorted (right). Each pass finds the minimum of the unsorted portion and swaps it to the boundary.',
        interviewTip: 'Selection Sort makes O(n) swaps which is good when writes are expensive (e.g. flash memory). But it\'s not stable and always O(n²) — no best case.',
      },
    ],
  },

  {
    id: 'insertionSort',
    title: '📥 Insertion Sort',
    category: 'Sorting',
    difficulty: 'Easy',
    approaches: [
      {
        label: 'Insertion Sort',
        vizType: 'bars',
        timeComplexity: 'O(n²) worst, O(n) best',
        spaceComplexity: 'O(1)',
        steps: [
          { arr: [4,3,2,10,12,1,5,6], highlight:[], compare:[], sorted:[0], pointers:{}, mapState:{}, explain:'Insertion Sort: treat index 0 as sorted. Pick each element and insert into its correct sorted position.' },
          { arr: [3,4,2,10,12,1,5,6], highlight:[0,1], compare:[], sorted:[0,1], pointers:{ key:1 }, mapState:{ key:3 }, explain:'key=3. 3 < 4 → shift 4 right. Insert 3 at index 0. Sorted: [3,4].' },
          { arr: [2,3,4,10,12,1,5,6], highlight:[0,1,2], compare:[], sorted:[0,1,2], pointers:{ key:2 }, mapState:{ key:2 }, explain:'key=2. 2 < 4, 2 < 3 → shift both right. Insert 2. Sorted: [2,3,4].' },
          { arr: [2,3,4,10,12,1,5,6], highlight:[3], compare:[], sorted:[0,1,2,3], pointers:{ key:3 }, mapState:{ key:10 }, explain:'key=10. 10 > 4 → no shift. Insert in place. Sorted: [2,3,4,10].' },
          { arr: [1,2,3,4,10,12,5,6], highlight:[0], compare:[], sorted:[0,1,2,3,4,5], pointers:{ key:5 }, mapState:{ key:1 }, explain:'key=1. Shift everything right. Insert at index 0. Sorted: [1,2,3,4,10,12].' },
          { arr: [1,2,3,4,5,10,12,6], highlight:[4], compare:[], sorted:[0,1,2,3,4,5,6], pointers:{ key:6 }, mapState:{ key:5 }, explain:'key=5. Insert between 4 and 10.' },
          { arr: [1,2,3,4,5,6,10,12], highlight:[], compare:[], sorted:[0,1,2,3,4,5,6,7], pointers:{}, mapState:{}, explain:'✅ Sorted: [1,2,3,4,5,6,10,12]. Best case O(n) on already-sorted input.' },
        ],
        conceptExplain: 'Insertion Sort builds a sorted subarray one element at a time, inserting each new element into its correct position. Like sorting playing cards in your hand.',
        interviewTip: 'Used as the base case in hybrid sorts (Timsort, Introsort) for small subarrays (n < 10–16). It\'s stable and adaptive.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // SEARCHING
  // ══════════════════════════════════════════════════════

  {
    id: 'binarySearch',
    title: '🔍 Binary Search',
    category: 'Searching',
    difficulty: 'Easy',
    approaches: [
      {
        label: 'Iterative Binary Search',
        vizType: 'array',
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(1)',
        steps: [
          { arr: [1,3,5,7,9,11,13,15], highlight:[], compare:[], sorted:[0,1,2,3,4,5,6,7], pointers:{ L:0, R:7 }, mapState:{}, explain:'Target=9. Sorted array. Binary search halves the search space each step. L=0, R=7.' },
          { arr: [1,3,5,7,9,11,13,15], highlight:[3], compare:[], sorted:[0,1,2,3,4,5,6,7], pointers:{ L:0, R:7, M:3 }, mapState:{ mid:3, val:7 }, explain:'M=(0+7)//2=3. arr[3]=7. 7 < 9 → search right. L = M+1 = 4.' },
          { arr: [1,3,5,7,9,11,13,15], highlight:[5], compare:[], sorted:[0,1,2,3,4,5,6,7], pointers:{ L:4, R:7, M:5 }, mapState:{ mid:5, val:11 }, explain:'M=(4+7)//2=5. arr[5]=11. 11 > 9 → search left. R = M-1 = 4.' },
          { arr: [1,3,5,7,9,11,13,15], highlight:[4], compare:[], sorted:[0,1,2,3,4,5,6,7], pointers:{ L:4, R:4, M:4 }, mapState:{ mid:4, val:9 }, explain:'M=4. arr[4]=9 = target. Found in 3 comparisons vs 9 for linear search.' },
          { arr: [1,3,5,7,9,11,13,15], highlight:[], compare:[], sorted:[0,1,2,3,4,5,6,7], pointers:{}, mapState:{ result:4 }, explain:'✅ Found 9 at index 4. O(log n) — each step halves the space. 8 elements → max 3 steps.' },
        ],
        conceptExplain: 'Binary Search works by repeatedly halving the search space. Compare the target with the middle element — if smaller, search left; if larger, search right.',
        interviewTip: 'Use mid = left + (right - left) / 2 to avoid overflow. L <= R for finding an element; L < R for finding a boundary. Know both.',
      },
      {
        label: 'Recursive Binary Search',
        vizType: 'array',
        timeComplexity: 'O(log n)',
        spaceComplexity: 'O(log n) call stack',
        steps: [
          { arr: [1,3,5,7,9,11,13,15], highlight:[], compare:[], sorted:[0,1,2,3,4,5,6,7], pointers:{ L:0, R:7 }, mapState:{ call:'search(0,7)' }, explain:'Recursive call: search(arr, 0, 7, target=9).' },
          { arr: [1,3,5,7,9,11,13,15], highlight:[3], compare:[], sorted:[0,1,2,3,4,5,6,7], pointers:{ L:0, R:7, M:3 }, mapState:{ call:'search(0,7)', mid:3, arr3:7 }, explain:'mid=3, arr[3]=7 < 9. Call search(arr, 4, 7).' },
          { arr: [1,3,5,7,9,11,13,15], highlight:[5], compare:[], sorted:[0,1,2,3,4,5,6,7], pointers:{ L:4, R:7, M:5 }, mapState:{ call:'search(4,7)', mid:5, arr5:11 }, explain:'mid=5, arr[5]=11 > 9. Call search(arr, 4, 4).' },
          { arr: [1,3,5,7,9,11,13,15], highlight:[4], compare:[], sorted:[0,1,2,3,4,5,6,7], pointers:{ L:4, R:4, M:4 }, mapState:{ call:'search(4,4)', mid:4, arr4:9 }, explain:'mid=4, arr[4]=9 = target. Return 4. Unwind call stack.' },
          { arr: [1,3,5,7,9,11,13,15], highlight:[], compare:[], sorted:[0,1,2,3,4,5,6,7], pointers:{}, mapState:{ result:4 }, explain:'✅ Returns index 4. Recursive version uses O(log n) stack space — iterative is preferred in interviews.' },
        ],
        conceptExplain: 'Recursive Binary Search passes the sub-array boundaries as parameters and calls itself. Each call reduces the problem by half.',
        interviewTip: 'Prefer the iterative version in interviews — it\'s O(1) space. Mention recursive only if asked. Tail call optimization exists in some languages.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // TWO POINTERS
  // ══════════════════════════════════════════════════════

  {
    id: 'twoSum',
    title: '➕ Two Sum',
    category: 'HashMap',
    difficulty: 'Easy',
    approaches: [
      {
        label: 'HashMap (One Pass) O(n)',
        vizType: 'hashmap',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        steps: [
          { arr: [2,7,11,15], highlight:[], compare:[], sorted:[], pointers:{ i:0 }, mapState:{}, explain:'Target=9. One-pass hashmap: for each element, check if complement (9-num) is already in map.' },
          { arr: [2,7,11,15], highlight:[0], compare:[], sorted:[], pointers:{ i:0 }, mapState:{}, explain:'i=0, num=2. Complement=9-2=7. Is 7 in map? No. Store {2:0}.' },
          { arr: [2,7,11,15], highlight:[0], compare:[], sorted:[], pointers:{ i:0 }, mapState:{ 2:0 }, explain:'Map now {2:0}. Move to i=1.' },
          { arr: [2,7,11,15], highlight:[1], compare:[], sorted:[], pointers:{ i:1 }, mapState:{ 2:0 }, explain:'i=1, num=7. Complement=9-7=2. Is 2 in map? YES at index 0!' },
          { arr: [2,7,11,15], highlight:[0,1], compare:[], sorted:[0,1], pointers:{}, mapState:{ 2:0, 7:1 }, explain:'✅ Answer: [0,1]. nums[0]+nums[1]=2+7=9. One pass, O(n) time and space.' },
        ],
        conceptExplain: 'For each number, check if its complement (target - num) was already seen. The hashmap stores {value: index} giving O(1) lookup.',
        interviewTip: 'This is the canonical hashmap pattern: trade O(n) space to drop from O(n²) to O(n) time. Follow-up: Two Sum II (sorted array) → two pointers, O(1) space.',
      },
      {
        label: 'Brute Force O(n²)',
        vizType: 'array',
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
        steps: [
          { arr: [2,7,11,15], highlight:[], compare:[], sorted:[], pointers:{ i:0, j:1 }, mapState:{ target:9 }, explain:'Brute force: try every pair (i, j) where i < j. O(n²) — 2 nested loops.' },
          { arr: [2,7,11,15], highlight:[], compare:[0,1], sorted:[], pointers:{ i:0, j:1 }, mapState:{ sum:'2+7=9' }, explain:'i=0, j=1. 2+7=9 = target! Found immediately in best case.' },
          { arr: [2,7,11,15], highlight:[0,1], compare:[], sorted:[0,1], pointers:{}, mapState:{ answer:'[0,1]' }, explain:'✅ [0,1]. Best case O(1) if pair is first — worst case O(n²) if pair is last.' },
        ],
        conceptExplain: 'Try all pairs with nested loops. Simple but slow — always bring up the O(n) hashmap solution in interviews.',
        interviewTip: 'Mention this first as the naive solution, then immediately offer the O(n) hashmap improvement. Never stop at brute force.',
      },
      {
        label: 'Two Pointers (Sorted) O(n)',
        vizType: 'twoptr',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        steps: [
          { arr: [2,7,11,15], highlight:[], compare:[], sorted:[0,1,2,3], pointers:{ L:0, R:3 }, mapState:{ target:9 }, explain:'Two Sum II variant: array is SORTED. Use L and R pointers. O(n) time, O(1) space.' },
          { arr: [2,7,11,15], highlight:[], compare:[0,3], sorted:[0,1,2,3], pointers:{ L:0, R:3 }, mapState:{ sum:'2+15=17>9' }, explain:'sum = arr[L]+arr[R] = 2+15=17 > 9. Move R left.' },
          { arr: [2,7,11,15], highlight:[], compare:[0,2], sorted:[0,1,2,3], pointers:{ L:0, R:2 }, mapState:{ sum:'2+11=13>9' }, explain:'sum=2+11=13 > 9. Move R left.' },
          { arr: [2,7,11,15], highlight:[0,1], compare:[], sorted:[0,1,2,3], pointers:{ L:0, R:1 }, mapState:{ sum:'2+7=9 ✅' }, explain:'sum=2+7=9 = target. ✅ Answer: indices [0,1] (1-indexed: [1,2]).' },
        ],
        conceptExplain: 'When the array is sorted, use two pointers from both ends. If sum > target, move R left. If sum < target, move L right. O(n) time, O(1) space.',
        interviewTip: 'The two-pointer approach on a sorted array is better than hashmap when space is constrained. But for the unsorted Two Sum, hashmap wins.',
      },
    ],
  },

  {
    id: 'threeSum',
    title: '🔺 3Sum',
    category: 'Two Pointers',
    difficulty: 'Medium',
    approaches: [
      {
        label: 'Sort + Two Pointers O(n²)',
        vizType: 'twoptr',
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
        steps: [
          { arr: [-4,-1,-1,0,1,2], highlight:[], compare:[], sorted:[0,1,2,3,4,5], pointers:{ i:0 }, mapState:{ result:'[]' }, explain:'Sort first: [-4,-1,-1,0,1,2]. Fix i=0, use two pointers for the rest.' },
          { arr: [-4,-1,-1,0,1,2], highlight:[0], compare:[1,5], sorted:[0,1,2,3,4,5], pointers:{ i:0, L:1, R:5 }, mapState:{ sum:'-4+-1+2=-3' }, explain:'i=0(-4), L=1(-1), R=5(2). Sum=-3 < 0. Move L right.' },
          { arr: [-4,-1,-1,0,1,2], highlight:[0], compare:[3,5], sorted:[0,1,2,3,4,5], pointers:{ i:0, L:3, R:5 }, mapState:{ sum:'-4+0+2=-2' }, explain:'L=3(0), R=5(2). Sum=-2 < 0. Move L right. L>R-style → no triplet with i=0.' },
          { arr: [-4,-1,-1,0,1,2], highlight:[1], compare:[2,5], sorted:[0,1,2,3,4,5], pointers:{ i:1, L:2, R:5 }, mapState:{ sum:'-1+-1+2=0 ✅' }, explain:'Fix i=1(-1). L=2(-1), R=5(2). Sum=0 → TRIPLET FOUND!' },
          { arr: [-4,-1,-1,0,1,2], highlight:[1,2,5], compare:[], sorted:[0,1,2,3,4,5], pointers:{ i:1, L:3, R:4 }, mapState:{ result:'[[-1,-1,2]]' }, explain:'Add [-1,-1,2]. Move L right, R left. L=3(0), R=4(1). Sum=0 → ANOTHER TRIPLET!' },
          { arr: [-4,-1,-1,0,1,2], highlight:[1,3,4], compare:[], sorted:[0,1,2,3,4,5], pointers:{ i:2 }, mapState:{ result:'[[-1,-1,2],[-1,0,1]]' }, explain:'Add [-1,0,1]. i=2 is duplicate of i=1 → skip.' },
          { arr: [-4,-1,-1,0,1,2], highlight:[], compare:[], sorted:[0,1,2,3,4,5], pointers:{}, mapState:{ result:'[[-1,-1,2],[-1,0,1]]' }, explain:'✅ All triplets: [[-1,-1,2],[-1,0,1]]. Time O(n²): outer O(n) × inner two-pointer O(n).' },
        ],
        conceptExplain: 'Sort the array. Fix one element (i), use two pointers (L, R) on the rest. Skip duplicates at both the outer loop and inner pointers.',
        interviewTip: 'Key insight: sorting costs O(n log n) but enables the O(n) inner scan, giving O(n²) overall. Always skip duplicates explicitly.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // SLIDING WINDOW
  // ══════════════════════════════════════════════════════

  {
    id: 'slidingWindow',
    title: '🪟 Sliding Window Max',
    category: 'Sliding Window',
    difficulty: 'Medium',
    approaches: [
      {
        label: 'Fixed Window Sum O(n)',
        vizType: 'twoptr',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        steps: [
          { arr: [2,1,5,1,3,2], highlight:[], compare:[], sorted:[], pointers:{ L:0, R:0 }, mapState:{ k:3, windowSum:0, maxSum:0 }, explain:'Max sum subarray of size k=3. Sliding window: maintain running sum, slide one step at a time.' },
          { arr: [2,1,5,1,3,2], highlight:[0,1,2], compare:[], sorted:[], pointers:{ L:0, R:2 }, mapState:{ k:3, windowSum:8, maxSum:8 }, explain:'Initial window [0..2]: 2+1+5=8. maxSum=8.' },
          { arr: [2,1,5,1,3,2], highlight:[1,2,3], compare:[], sorted:[], pointers:{ L:1, R:3 }, mapState:{ k:3, windowSum:7, maxSum:8 }, explain:'Slide: add arr[3]=1, remove arr[0]=2. windowSum=8-2+1=7 < 8. maxSum stays 8.' },
          { arr: [2,1,5,1,3,2], highlight:[2,3,4], compare:[], sorted:[], pointers:{ L:2, R:4 }, mapState:{ k:3, windowSum:9, maxSum:9 }, explain:'Slide: add arr[4]=3, remove arr[1]=1. windowSum=7-1+3=9 > 8. New maxSum=9!' },
          { arr: [2,1,5,1,3,2], highlight:[3,4,5], compare:[], sorted:[], pointers:{ L:3, R:5 }, mapState:{ k:3, windowSum:6, maxSum:9 }, explain:'Slide: add arr[5]=2, remove arr[2]=5. windowSum=9-5+2=6 < 9.' },
          { arr: [2,1,5,1,3,2], highlight:[2,3,4], compare:[], sorted:[2,3,4], pointers:{}, mapState:{ answer:'[5,1,3]=9' }, explain:'✅ Max sum subarray is [5,1,3]=9. O(n) — no nested loops.' },
        ],
        conceptExplain: 'Instead of recalculating the sum each slide, add the new right element and subtract the old left element. O(n) vs O(n·k) brute force.',
        interviewTip: 'Two forms of sliding window: fixed size (this problem) and variable size (shrink when condition violated). Know both — variable size is more common in interviews.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // STACK
  // ══════════════════════════════════════════════════════

  {
    id: 'validParentheses',
    title: '🔲 Valid Parentheses',
    category: 'Stack',
    difficulty: 'Easy',
    approaches: [
      {
        label: 'Stack O(n)',
        vizType: 'stack',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        steps: [
          { arr: ['(','[','{','}',']',')'], highlight:[], compare:[], sorted:[], pointers:{ i:0 }, mapState:{}, explain:'Use a stack. Push opening brackets. When closing bracket seen, pop and verify match.' },
          { arr: ['(','[','{','}',']',')'], highlight:[0], compare:[], sorted:[], pointers:{ i:0 }, mapState:{ 0:'(' }, explain:"i=0, '('. Push to stack." },
          { arr: ['(','[','{','}',']',')'], highlight:[1], compare:[], sorted:[], pointers:{ i:1 }, mapState:{ 0:'(', 1:'[' }, explain:"i=1, '['. Push." },
          { arr: ['(','[','{','}',']',')'], highlight:[2], compare:[], sorted:[], pointers:{ i:2 }, mapState:{ 0:'(', 1:'[', 2:'{' }, explain:"i=2, '{'. Push." },
          { arr: ['(','[','{','}',']',')'], highlight:[3], compare:[], sorted:[], pointers:{ i:3 }, mapState:{ 0:'(', 1:'[' }, explain:"i=3, '}'. Pop '{'. '{' matches '}'. ✓" },
          { arr: ['(','[','{','}',']',')'], highlight:[4], compare:[], sorted:[], pointers:{ i:4 }, mapState:{ 0:'(' }, explain:"i=4, ']'. Pop '['. Match. ✓" },
          { arr: ['(','[','{','}',']',')'], highlight:[5], compare:[], sorted:[], pointers:{ i:5 }, mapState:{}, explain:"i=5, ')'. Pop '('. Match. ✓" },
          { arr: ['(','[','{','}',']',')'], highlight:[], compare:[], sorted:[0,1,2,3,4,5], pointers:{}, mapState:{}, explain:'✅ Stack empty → valid. Return false if stack non-empty OR mismatch found.' },
        ],
        conceptExplain: 'Stack tracks unclosed brackets. A closing bracket must match the top of stack. Empty stack at end means all brackets matched.',
        interviewTip: 'Return false as soon as a mismatch is found — do not continue. Also return false if stack is non-empty at the end (unmatched openers).',
      },
    ],
  },

  {
    id: 'largestRectangleHistogram',
    title: '📊 Largest Rectangle in Histogram',
    category: 'Stack',
    difficulty: 'Hard',
    approaches: [
      {
        label: 'Monotonic Stack O(n)',
        vizType: 'histogram',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        steps: [
          { bars: [2,1,5,6,2,3], activeBar: -1, stack: [], maxArea: 0, explain: 'heights=[2,1,5,6,2,3]. Monotonic stack: maintain indices of bars in increasing height order. Pop when a shorter bar is encountered.' },
          { bars: [2,1,5,6,2,3], activeBar: 0, stack: [0], maxArea: 0, explain: 'i=0, h=2. Stack empty → push index 0. Stack: [0].' },
          { bars: [2,1,5,6,2,3], activeBar: 1, stack: [], maxArea: 2, explain: 'i=1, h=1. h=1 < h[stack.top]=2. Pop index 0. Width = 1 (no left boundary). Area = 2×1=2. maxArea=2.' },
          { bars: [2,1,5,6,2,3], activeBar: 1, stack: [1], maxArea: 2, explain: 'Stack empty → push index 1 (h=1). Stack: [1].' },
          { bars: [2,1,5,6,2,3], activeBar: 2, stack: [1,2], maxArea: 2, explain: 'i=2, h=5 > h[1]=1 → push. Stack: [1,2].' },
          { bars: [2,1,5,6,2,3], activeBar: 3, stack: [1,2,3], maxArea: 2, explain: 'i=3, h=6 > h[2]=5 → push. Stack: [1,2,3].' },
          { bars: [2,1,5,6,2,3], activeBar: 4, stack: [1,2], maxArea: 6, explain: 'i=4, h=2 < h[3]=6. Pop 3. Width = i - stack.top - 1 = 4-2-1=1. Area=6×1=6. maxArea=6.' },
          { bars: [2,1,5,6,2,3], activeBar: 4, stack: [1], maxArea: 10, explain: 'h=2 < h[2]=5. Pop 2. Width=4-1-1=2. Area=5×2=10. maxArea=10!' },
          { bars: [2,1,5,6,2,3], activeBar: 4, stack: [1,4], maxArea: 10, explain: 'h=2 > h[1]=1 → push 4. Stack: [1,4].' },
          { bars: [2,1,5,6,2,3], activeBar: 5, stack: [1,4,5], maxArea: 10, explain: 'i=5, h=3 > h[4]=2 → push. Stack: [1,4,5].' },
          { bars: [2,1,5,6,2,3], activeBar: -1, stack: [], maxArea: 10, explain: 'End of array. Flush remaining stack. Pop 5: width=6-4-1=1, area=3. Pop 4: width=6-1-1=4, area=2×4=8. Pop 1: width=6, area=1×6=6. maxArea stays 10.' },
          { bars: [2,1,5,6,2,3], activeBar: -1, stack: [], maxArea: 10, explain: '✅ Largest rectangle = 10 (bars at index 2 and 3, height 5, width 2). Monotonic stack: O(n) — each bar pushed and popped exactly once.' },
        ],
        conceptExplain: 'Maintain a stack of bar indices in increasing height order. When a shorter bar is found, pop taller bars — each popped bar can extend as far as the current position minus the new stack top.',
        interviewTip: 'Width calculation when popping index i: width = current_i - stack.top - 1. If stack is empty: width = current_i. Add a sentinel 0 at the end to flush the stack cleanly.',
      },
      {
        label: 'Brute Force O(n²)',
        vizType: 'bars',
        timeComplexity: 'O(n²)',
        spaceComplexity: 'O(1)',
        steps: [
          { arr: [2,1,5,6,2,3], highlight:[], compare:[], sorted:[], pointers:{ i:0 }, mapState:{ maxArea:0 }, explain: 'For each bar, extend left and right as far as all bars are ≥ current height. O(n²).' },
          { arr: [2,1,5,6,2,3], highlight:[0], compare:[0], sorted:[], pointers:{ i:0 }, mapState:{ height:2, width:1, area:2, maxArea:2 }, explain:'i=0, h=2. Can extend 1 bar wide. Area=2.' },
          { arr: [2,1,5,6,2,3], highlight:[1], compare:[0,1,2,3,4,5], sorted:[], pointers:{ i:1 }, mapState:{ height:1, width:6, area:6, maxArea:6 }, explain:'i=1, h=1. All bars ≥ 1. Width=6. Area=6. maxArea=6.' },
          { arr: [2,1,5,6,2,3], highlight:[2,3], compare:[2,3], sorted:[], pointers:{ i:2 }, mapState:{ height:5, width:2, area:10, maxArea:10 }, explain:'i=2, h=5. Bars 2 and 3 are ≥ 5. Width=2. Area=10. maxArea=10!' },
          { arr: [2,1,5,6,2,3], highlight:[], compare:[], sorted:[2,3], pointers:{}, mapState:{ maxArea:10 }, explain:'✅ maxArea=10. O(n²) — check every possible width for each bar.' },
        ],
        conceptExplain: 'For each bar as the minimum height, expand left and right to find the maximum width where all bars are at least that height.',
        interviewTip: 'Always propose the O(n²) brute force first, then the O(n) monotonic stack. The stack solution is the key insight interviewers want.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // MATRIX
  // ══════════════════════════════════════════════════════

  {
    id: 'searchMatrix',
    title: '🔢 Search a 2D Matrix',
    category: 'Binary Search',
    difficulty: 'Medium',
    approaches: [
      {
        label: 'Treat as 1D Binary Search O(log(m·n))',
        vizType: 'grid',
        timeComplexity: 'O(log(m·n))',
        spaceComplexity: 'O(1)',
        steps: [
          { grid: [[1,3,5,7],[10,11,16,20],[23,30,34,60]], activeCell: null, highlightCells: [], explain: 'Matrix is row-sorted and each row starts > previous row end. Treat as flat sorted array of m×n elements.' },
          { grid: [[1,3,5,7],[10,11,16,20],[23,30,34,60]], activeCell: [1,1], highlightCells: [[1,1]], explain: 'Target=3. L=0, R=11. mid=5. row=5//4=1, col=5%4=1. matrix[1][1]=11. 11 > 3 → R=4.' },
          { grid: [[1,3,5,7],[10,11,16,20],[23,30,34,60]], activeCell: [0,2], highlightCells: [[0,2]], explain: 'L=0, R=4. mid=2. row=0, col=2. matrix[0][2]=5. 5 > 3 → R=1.' },
          { grid: [[1,3,5,7],[10,11,16,20],[23,30,34,60]], activeCell: [0,1], highlightCells: [[0,1]], explain: 'L=0, R=1. mid=0. row=0, col=0. matrix[0][0]=1. 1 < 3 → L=1.' },
          { grid: [[1,3,5,7],[10,11,16,20],[23,30,34,60]], activeCell: [0,1], highlightCells: [[0,1]], explain: 'L=1=R. mid=1. row=0, col=1. matrix[0][1]=3 = target! ✅' },
        ],
        conceptExplain: 'Map flat index i to (row=i//cols, col=i%cols). Binary search as if it\'s a 1D sorted array. O(log(m·n)).',
        interviewTip: 'The key insight is the index mapping: mid → (mid//cols, mid%cols). This works ONLY because each row starts greater than the previous row ends.',
      },
      {
        label: 'Staircase Search O(m+n)',
        vizType: 'grid',
        timeComplexity: 'O(m+n)',
        spaceComplexity: 'O(1)',
        steps: [
          { grid: [[1,3,5,7],[10,11,16,20],[23,30,34,60]], activeCell: [0,3], highlightCells: [[0,3]], explain: 'Start at TOP-RIGHT corner. Each step either moves left (too big) or down (too small).' },
          { grid: [[1,3,5,7],[10,11,16,20],[23,30,34,60]], activeCell: [0,2], highlightCells: [[0,2]], explain: 'matrix[0][3]=7 > 3 → move left.' },
          { grid: [[1,3,5,7],[10,11,16,20],[23,30,34,60]], activeCell: [0,1], highlightCells: [[0,1]], explain: 'matrix[0][2]=5 > 3 → move left.' },
          { grid: [[1,3,5,7],[10,11,16,20],[23,30,34,60]], activeCell: [0,1], highlightCells: [[0,1]], explain: 'matrix[0][1]=3 = target! ✅ Found in 3 steps.' },
        ],
        conceptExplain: 'Starting at the top-right: if value > target, go left; if value < target, go down. Works on any row-sorted AND col-sorted matrix.',
        interviewTip: 'Staircase search is O(m+n) but works on a more general matrix (each row AND column sorted). Binary search O(log(m·n)) requires the stricter condition that rows are consecutively sorted.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // LINKED LIST
  // ══════════════════════════════════════════════════════

  {
  id: 'reverseLinkedList',
  title: '↩ Reverse Linked List',
  category: 'Linked List',
  difficulty: 'Easy',
  approaches: [
    {
      label: 'Iterative (3 Pointers) O(1) Space',
      vizType: 'linkedlist',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(1)',
      steps: [
        {
          nodes: [{ val:1 },{ val:2 },{ val:3 },{ val:4 },{ val:5 }],
          connections: [1, 2, 3, 4, null],
          sorted: [], highlight: [], compare: [],
          pointers: { prev: -1, curr: 0, head: 0 },
          mapState: { prev: 'null', curr: '1', next: '?' },
          explain: '1→2→3→4→5→null. We use three pointers: prev=null, curr=head, next=undefined. We will reverse each arrow one at a time.',
        },
        {
          nodes: [{ val:1 },{ val:2 },{ val:3 },{ val:4 },{ val:5 }],
          connections: [null, 2, 3, 4, null],  // 1's arrow now points to null
          sorted: [0], highlight: [0], compare: [],
          pointers: { prev: 0, curr: 1, head: 0 },
          mapState: { prev: '1', curr: '2', next: '3' },
          explain: 'Save next=2. Reverse: node1.next = null (prev). Move prev=node1, curr=node2. Arrow 1→null done.',
        },
        {
          nodes: [{ val:1 },{ val:2 },{ val:3 },{ val:4 },{ val:5 }],
          connections: [null, 0, 3, 4, null],  // 2→1
          sorted: [0, 1], highlight: [1], compare: [],
          pointers: { prev: 1, curr: 2, head: 0 },
          mapState: { prev: '2', curr: '3', next: '4' },
          explain: 'Save next=3. Reverse: node2.next = node1. Move prev=node2, curr=node3. null←1←2',
        },
        {
          nodes: [{ val:1 },{ val:2 },{ val:3 },{ val:4 },{ val:5 }],
          connections: [null, 0, 1, 4, null],  // 3→2
          sorted: [0, 1, 2], highlight: [2], compare: [],
          pointers: { prev: 2, curr: 3, head: 0 },
          mapState: { prev: '3', curr: '4', next: '5' },
          explain: 'Save next=4. Reverse: node3.next = node2. null←1←2←3',
        },
        {
          nodes: [{ val:1 },{ val:2 },{ val:3 },{ val:4 },{ val:5 }],
          connections: [null, 0, 1, 2, null],  // 4→3
          sorted: [0, 1, 2, 3], highlight: [3], compare: [],
          pointers: { prev: 3, curr: 4, head: 0 },
          mapState: { prev: '4', curr: '5', next: 'null' },
          explain: 'Save next=5. Reverse: node4.next = node3. null←1←2←3←4',
        },
        {
          nodes: [{ val:1 },{ val:2 },{ val:3 },{ val:4 },{ val:5 }],
          connections: [null, 0, 1, 2, 3],  // 5→4
          sorted: [0, 1, 2, 3, 4], highlight: [4], compare: [],
          pointers: { prev: 4, curr: -1, head: 4 },  // head now points to node 5
          mapState: { prev: '5', curr: 'null', next: 'null' },
          explain: 'Reverse: node5.next = node4. curr=null → loop ends. null←1←2←3←4←5',
        },
        {
          // Final state: show the reversed list naturally left-to-right
          nodes: [{ val:5 },{ val:4 },{ val:3 },{ val:2 },{ val:1 }],
          connections: [1, 2, 3, 4, null],
          sorted: [0, 1, 2, 3, 4], highlight: [], compare: [],
          pointers: { head: 0 },
          mapState: {},
          explain: '✅ prev is the new head. Reversed list: 5→4→3→2→1→null. O(n) time, O(1) space.',
        },
      ],
      conceptExplain: 'Three pointers reverse each arrow one step at a time. Save next before overwriting to avoid losing the rest of the list.',
      interviewTip: 'The iterative solution is preferred — O(1) space. Know the recursive solution too (O(n) call stack). Follow-up: Reverse Linked List II (partial reverse, LeetCode 92).',
    },
    {
      label: 'Recursive O(n) Space',
      vizType: 'linkedlist',
      timeComplexity: 'O(n)',
      spaceComplexity: 'O(n) call stack',
      steps: [
        {
          nodes: [{ val:1 },{ val:2 },{ val:3 },{ val:4 },{ val:5 }],
          connections: [1, 2, 3, 4, null],
          sorted: [], highlight: [], compare: [],
          pointers: { curr: 0 },
          mapState: { call: 'reverse(1)' },
          explain: 'Recursive call: reverse(head=1). Each call recurses to the end first, then reverses on the way back up.',
        },
        {
          nodes: [{ val:1 },{ val:2 },{ val:3 },{ val:4 },{ val:5 }],
          connections: [1, 2, 3, 4, null],
          sorted: [], highlight: [4], compare: [],
          pointers: { curr: 4 },
          mapState: { call: 'reverse(5) — BASE CASE' },
          explain: 'Base case: node5.next = null → return node5 as new head. Unwind begins.',
        },
        {
          nodes: [{ val:1 },{ val:2 },{ val:3 },{ val:4 },{ val:5 }],
          connections: [1, 2, 3, null, 3],  // 5→4 established, 4→null
          sorted: [4, 3], highlight: [3], compare: [],
          pointers: { curr: 3 },
          mapState: { call: 'unwind at node4', action: '5.next=4, 4.next=null' },
          explain: 'Unwind at node4: node4.next.next = node4 (so 5→4). node4.next = null. 5→4→null',
        },
        {
          nodes: [{ val:1 },{ val:2 },{ val:3 },{ val:4 },{ val:5 }],
          connections: [1, 2, null, 2, 3],
          sorted: [4, 3, 2], highlight: [2], compare: [],
          pointers: { curr: 2 },
          mapState: { call: 'unwind at node3', action: '4.next=3, 3.next=null' },
          explain: 'Unwind at node3: 4→3, 3.next=null. 5→4→3→null',
        },
        {
          nodes: [{ val:1 },{ val:2 },{ val:3 },{ val:4 },{ val:5 }],
          connections: [1, null, 1, 2, 3],
          sorted: [4, 3, 2, 1], highlight: [1], compare: [],
          pointers: { curr: 1 },
          mapState: { call: 'unwind at node2', action: '3.next=2, 2.next=null' },
          explain: 'Unwind at node2: 3→2, 2.next=null. 5→4→3→2→null',
        },
        {
          nodes: [{ val:5 },{ val:4 },{ val:3 },{ val:2 },{ val:1 }],
          connections: [1, 2, 3, 4, null],
          sorted: [0, 1, 2, 3, 4], highlight: [], compare: [],
          pointers: { head: 0 },
          mapState: {},
          explain: '✅ Fully unwound. New head=5. 5→4→3→2→1→null. Uses O(n) call stack — risky for very long lists.',
        },
      ],
      conceptExplain: 'Recurse all the way to the tail (base case), then reverse pointers on the way back up. Elegant but O(n) stack space.',
      interviewTip: 'Mention that recursive reversal risks stack overflow for very long lists. Always prefer the iterative O(1) space version in production.',
    },
  ],
},

  // ══════════════════════════════════════════════════════
  // DYNAMIC PROGRAMMING
  // ══════════════════════════════════════════════════════

  {
    id: 'climbingStairs',
    title: '🪜 Climbing Stairs',
    category: '1D DP',
    difficulty: 'Easy',
    approaches: [
      {
        label: 'DP Table O(n)',
        vizType: 'dp',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(n)',
        steps: [
          { dpTable: [0,0,0,0,0,0], highlight:[], n:5, explain: 'n=5 stairs. dp[i] = number of distinct ways to reach stair i. Each step: +1 or +2.' },
          { dpTable: [1,0,0,0,0,0], highlight:[0], n:5, explain: 'dp[0]=1 (base: 1 way to stand at ground).' },
          { dpTable: [1,1,0,0,0,0], highlight:[1], n:5, explain: 'dp[1]=1 (only 1-step from ground).' },
          { dpTable: [1,1,2,0,0,0], highlight:[2], n:5, explain: 'dp[2] = dp[1]+dp[0] = 1+1 = 2. (1+1 or 2).' },
          { dpTable: [1,1,2,3,0,0], highlight:[3], n:5, explain: 'dp[3] = dp[2]+dp[1] = 2+1 = 3.' },
          { dpTable: [1,1,2,3,5,0], highlight:[4], n:5, explain: 'dp[4] = dp[3]+dp[2] = 3+2 = 5.' },
          { dpTable: [1,1,2,3,5,8], highlight:[5], n:5, explain: 'dp[5] = dp[4]+dp[3] = 5+3 = 8. ✅ 8 ways to climb 5 stairs.' },
        ],
        conceptExplain: 'Climbing Stairs is Fibonacci in disguise. Ways to reach step n = ways from n-1 (1-step) + ways from n-2 (2-step). Recognize the recurrence → DP.',
        interviewTip: 'Space-optimize to O(1): only keep two variables. Follow-ups: min cost climbing stairs (LeetCode 746), k-step variant.',
      },
      {
        label: 'Space Optimized O(1)',
        vizType: 'dp',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        steps: [
          { dpTable: [1,1,0,0,0,0], highlight:[0,1], n:5, explain: 'Instead of full table, keep only prev2 and prev1. prev2=dp[0]=1, prev1=dp[1]=1.' },
          { dpTable: [1,1,2,0,0,0], highlight:[2], n:5, explain: 'curr = prev1 + prev2 = 2. Slide: prev2=1, prev1=2.' },
          { dpTable: [1,1,2,3,0,0], highlight:[3], n:5, explain: 'curr = 2+1 = 3. Slide: prev2=2, prev1=3.' },
          { dpTable: [1,1,2,3,5,0], highlight:[4], n:5, explain: 'curr = 3+2 = 5. Slide: prev2=3, prev1=5.' },
          { dpTable: [1,1,2,3,5,8], highlight:[5], n:5, explain: 'curr = 5+3 = 8. ✅ Answer: 8. O(1) space — no array needed.' },
        ],
        conceptExplain: 'Since dp[i] only depends on dp[i-1] and dp[i-2], keep just two variables and slide them forward. Reduces O(n) space to O(1).',
        interviewTip: 'Always offer the O(1) space optimization after the O(n) table version. Interviewers love this follow-up.',
      },
    ],
  },

  {
    id: 'lcs',
    title: '📐 Longest Common Subsequence',
    category: '2D DP',
    difficulty: 'Medium',
    approaches: [
      {
        label: '2D DP Table O(m·n)',
        vizType: 'dp',
        timeComplexity: 'O(m·n)',
        spaceComplexity: 'O(m·n)',
        steps: [
          { dpTable2d: [[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0]], s1:'ACE', s2:'ABCDE', highlight2d:[], explain: 'LCS of "ACE" and "ABCDE". dp[i][j] = LCS length for s1[0..i-1] and s2[0..j-1]. If chars match: dp[i][j]=dp[i-1][j-1]+1. Else: max(dp[i-1][j], dp[i][j-1]).' },
          { dpTable2d: [[0,0,0,0,0,0],[0,1,1,1,1,1],[0,1,1,2,2,2],[0,1,1,2,2,3]], s1:'ACE', s2:'ABCDE', highlight2d:[[1,1],[2,3],[3,5]], explain: 'A matches A → dp[1][1]=1. C matches C → dp[2][3]=dp[1][2]+1=2. E matches E → dp[3][5]=dp[2][4]+1=3.' },
          { dpTable2d: [[0,0,0,0,0,0],[0,1,1,1,1,1],[0,1,1,2,2,2],[0,1,1,2,2,3]], s1:'ACE', s2:'ABCDE', highlight2d:[[3,5]], explain: '✅ LCS = dp[3][5] = 3. The LCS is "ACE". Backtrack from dp[m][n] to reconstruct the actual sequence.' },
        ],
        conceptExplain: 'Fill a 2D table. When characters match, extend the diagonal. Otherwise take max from top or left. The answer is at dp[m][n].',
        interviewTip: 'LCS is the base for git diff, Edit Distance, and DNA alignment. Know how to reconstruct the actual subsequence by backtracking the table.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // TREE
  // ══════════════════════════════════════════════════════

  {
    id: 'bstInorder',
    title: '🌲 BST Inorder Traversal',
    category: 'Trees',
    difficulty: 'Easy',
    approaches: [
      {
        label: 'Recursive Inorder',
        vizType: 'tree',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(h)',
        steps: [
          { treeNodes: [{ id:1,val:4,left:2,right:3,x:4,y:0 },{ id:2,val:2,left:4,right:5,x:2,y:1 },{ id:3,val:6,left:6,right:7,x:6,y:1 },{ id:4,val:1,left:null,right:null,x:1,y:2 },{ id:5,val:3,left:null,right:null,x:3,y:2 },{ id:6,val:5,left:null,right:null,x:5,y:2 },{ id:7,val:7,left:null,right:null,x:7,y:2 }], activeNode:null, visitedNodes:[], arr:[], explain: 'Inorder: Left→Root→Right. For a BST, this always gives sorted output.' },
          { treeNodes:'same', activeNode:2, visitedNodes:[], arr:[], explain: 'At node 2. Recurse left → node 4.' },
          { treeNodes:'same', activeNode:4, visitedNodes:[], arr:[], explain: 'At node 1 (leaf). No left. VISIT 1. No right.' },
          { treeNodes:'same', activeNode:2, visitedNodes:[4], arr:[1], explain: 'Back at node 2. Left done. VISIT 2. Output: [1,2].' },
          { treeNodes:'same', activeNode:5, visitedNodes:[4,2], arr:[1,2], explain: 'Recurse right → node 5. VISIT 3. Output: [1,2,3].' },
          { treeNodes:'same', activeNode:1, visitedNodes:[4,2,5], arr:[1,2,3], explain: 'Back at root 4. VISIT 4. Output: [1,2,3,4].' },
          { treeNodes:'same', activeNode:6, visitedNodes:[4,2,5,1], arr:[1,2,3,4], explain: 'Right subtree. Node 6 → VISIT 5.' },
          { treeNodes:'same', activeNode:3, visitedNodes:[4,2,5,1,6], arr:[1,2,3,4,5], explain: 'VISIT 6. Then right → node 7. VISIT 7.' },
          { treeNodes:'same', activeNode:null, visitedNodes:[4,2,5,1,6,3,7], arr:[1,2,3,4,5,6,7], explain: '✅ Inorder output = [1,2,3,4,5,6,7] — sorted! Inorder of any BST = sorted array.' },
        ],
        conceptExplain: 'Inorder (Left→Root→Right) of a BST gives elements in sorted ascending order. Used for range queries and finding the kth smallest element.',
        interviewTip: 'Know the iterative inorder with an explicit stack: push all left children, pop and visit, then move to right child. O(1) extra space if Morris traversal is used.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // GREEDY
  // ══════════════════════════════════════════════════════

  {
    id: 'jumpGame',
    title: '🏃 Jump Game',
    category: 'Greedy',
    difficulty: 'Medium',
    approaches: [
      {
        label: 'Greedy O(n)',
        vizType: 'twoptr',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        steps: [
          { arr: [2,3,1,1,4], highlight:[], compare:[], sorted:[], pointers:{ i:0, maxReach:0 }, mapState:{ maxReach:0 }, explain: 'Track farthest reachable index. If i > maxReach at any point → stuck → false.' },
          { arr: [2,3,1,1,4], highlight:[0], compare:[], sorted:[], pointers:{ i:0, maxReach:2 }, mapState:{ maxReach:'max(0,0+2)=2' }, explain: 'i=0, jump=2. maxReach=max(0,0+2)=2.' },
          { arr: [2,3,1,1,4], highlight:[1], compare:[], sorted:[], pointers:{ i:1, maxReach:4 }, mapState:{ maxReach:'max(2,1+3)=4' }, explain: 'i=1 ≤ 2 (reachable). jump=3. maxReach=max(2,1+3)=4. 4 ≥ last index(4) → DONE!' },
          { arr: [2,3,1,1,4], highlight:[], compare:[], sorted:[0,1,2,3,4], pointers:{}, mapState:{ result:'true' }, explain: '✅ maxReach≥lastIndex → return true. O(n) — scan once, no backtracking.' },
        ],
        conceptExplain: 'Track the farthest reachable index as you scan left to right. If you encounter an index beyond your reach, return false.',
        interviewTip: 'Jump Game II (minimum jumps) uses same greedy: track farthest in current jump range, increment jumps when you exhaust the range.',
      },
    ],
  },
{
    id: 'trappingRainWater',
    title: '🌧 Trapping Rain Water',
    category: 'Two Pointers',
    difficulty: 'Hard',
    approaches: [
      {
        label: 'Two Pointers O(n)',
        vizType: 'twoptr',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        steps: [
          { arr: [0,1,0,2,1,0,1,3,2,1,2,1], highlight:[], compare:[], sorted:[], pointers:{ L:0, R:11 }, mapState:{ leftMax:0, rightMax:0, water:0 }, explain:'Two pointers from both ends. Move the side with smaller max height.' },
          { arr: [0,1,0,2,1,0,1,3,2,1,2,1], highlight:[0], compare:[], sorted:[], pointers:{ L:0, R:11 }, mapState:{ leftMax:0, rightMax:1, water:0 }, explain:'L=0(h=0), R=11(h=1). leftMax=0 ≤ rightMax=1 → process left. h[0]=0, leftMax=0. water += max(0,0-0)=0.' },
          { arr: [0,1,0,2,1,0,1,3,2,1,2,1], highlight:[1], compare:[], sorted:[], pointers:{ L:1, R:11 }, mapState:{ leftMax:1, rightMax:1, water:0 }, explain:'L=1(h=1). leftMax=max(0,1)=1. water += max(0,1-1)=0. Move L right.' },
          { arr: [0,1,0,2,1,0,1,3,2,1,2,1], highlight:[2], compare:[], sorted:[], pointers:{ L:2, R:11 }, mapState:{ leftMax:1, rightMax:1, water:1 }, explain:'L=2(h=0). leftMax=1. water += max(0,1-0)=1. Total water=1.' },
          { arr: [0,1,0,2,1,0,1,3,2,1,2,1], highlight:[3], compare:[], sorted:[], pointers:{ L:3, R:11 }, mapState:{ leftMax:2, rightMax:1, water:1 }, explain:'L=3(h=2). leftMax=2. water += 0. Now leftMax > rightMax → switch to right side.' },
          { arr: [0,1,0,2,1,0,1,3,2,1,2,1], highlight:[11], compare:[], sorted:[], pointers:{ L:3, R:10 }, mapState:{ leftMax:2, rightMax:2, water:1 }, explain:'R=10(h=2). rightMax=2. water += 0. rightMax=leftMax → process right.' },
          { arr: [0,1,0,2,1,0,1,3,2,1,2,1], highlight:[], compare:[], sorted:[], pointers:{}, mapState:{ totalWater:6 }, explain:'✅ Continue until L > R. Total water trapped = 6 units. Key: always process the side with smaller maxHeight.' },
        ],
        conceptExplain: 'Track maxLeft and maxRight. The water at position i = min(maxLeft, maxRight) - height[i]. Two pointers achieve O(1) space by processing the side with smaller max first.',
        interviewTip: 'Follow-up: O(n) space solution uses two prefix-max arrays. The two-pointer O(1) space version is the optimal solution.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // KADANE'S ALGORITHM — Maximum Subarray
  // ══════════════════════════════════════════════════════
  {
    id: 'maxSubarray',
    title: '📈 Maximum Subarray (Kadane\'s)',
    category: 'Greedy',
    difficulty: 'Medium',
    approaches: [
      {
        label: "Kadane's Algorithm O(n)",
        vizType: 'twoptr',
        timeComplexity: 'O(n)',
        spaceComplexity: 'O(1)',
        steps: [
          { arr: [-2,1,-3,4,-1,2,1,-5,4], highlight:[], compare:[], sorted:[], pointers:{ i:0 }, mapState:{ curSum:0, maxSum:'-inf' }, explain:'Kadane: track current subarray sum. Reset to 0 if it goes negative.' },
          { arr: [-2,1,-3,4,-1,2,1,-5,4], highlight:[0], compare:[], sorted:[], pointers:{ i:0 }, mapState:{ curSum:-2, maxSum:-2 }, explain:'i=0, val=-2. curSum=-2. If curSum<0, reset to 0 in next step.' },
          { arr: [-2,1,-3,4,-1,2,1,-5,4], highlight:[1], compare:[], sorted:[], pointers:{ i:1 }, mapState:{ curSum:1, maxSum:1 }, explain:'curSum was negative → reset to 0. i=1, val=1. curSum=1. maxSum=1.' },
          { arr: [-2,1,-3,4,-1,2,1,-5,4], highlight:[2], compare:[], sorted:[], pointers:{ i:2 }, mapState:{ curSum:-2, maxSum:1 }, explain:'i=2, val=-3. curSum=1+(-3)=-2. maxSum stays 1.' },
          { arr: [-2,1,-3,4,-1,2,1,-5,4], highlight:[3], compare:[], sorted:[], pointers:{ i:3 }, mapState:{ curSum:4, maxSum:4 }, explain:'curSum negative → reset. i=3, val=4. curSum=4. maxSum=4.' },
          { arr: [-2,1,-3,4,-1,2,1,-5,4], highlight:[4,5,6], compare:[], sorted:[], pointers:{ i:6 }, mapState:{ curSum:6, maxSum:6 }, explain:'Continue: 4→3→5→6. curSum=6. maxSum=6. Subarray [4,-1,2,1].' },
          { arr: [-2,1,-3,4,-1,2,1,-5,4], highlight:[3,4,5,6], compare:[], sorted:[3,4,5,6], pointers:{}, mapState:{ answer:6 }, explain:'✅ Max subarray sum = 6 = [4,-1,2,1]. Kadane: O(n) single pass.' },
        ],
        conceptExplain: 'Kadane: maintain a running sum. If it goes negative, discard and start fresh from the next element. Track the maximum sum seen at any point.',
        interviewTip: 'Variant: "Maximum Product Subarray" needs both max and min running products (negative × negative = positive). Also know the divide-and-conquer O(n log n) variant.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // COIN CHANGE — 1D DP
  // ══════════════════════════════════════════════════════
  {
    id: 'coinChange',
    title: '🪙 Coin Change',
    category: '1D DP',
    difficulty: 'Medium',
    approaches: [
      {
        label: 'Bottom-Up DP O(n·amount)',
        vizType: 'dp',
        timeComplexity: 'O(n·amount)',
        spaceComplexity: 'O(amount)',
        steps: [
          { dpTable: [0,99,99,99,99,99,99,99,99,99,99,99], highlight:[], n:11, explain: 'coins=[1,5,11], amount=11. dp[i]=min coins to make amount i. dp[0]=0, rest=∞.' },
          { dpTable: [0,1,2,3,4,5,99,99,99,99,99,99], highlight:[1,2,3,4,5], n:11, explain: 'Using coin=1: dp[1]=1, dp[2]=2, dp[3]=3, dp[4]=4, dp[5]=5.' },
          { dpTable: [0,1,2,3,4,1,2,3,4,5,2,99], highlight:[5,6,7,8,9,10], n:11, explain: 'Using coin=5: dp[5]=min(5,1)=1. dp[6]=min(2,dp[1]+1)=2... dp[10]=min(2,dp[5]+1)=2.' },
          { dpTable: [0,1,2,3,4,1,2,3,4,5,2,1], highlight:[11], n:11, explain: 'Using coin=11: dp[11]=min(∞,dp[0]+1)=1. ✅ Min coins for amount 11 = 1 (just use coin 11!)' },
        ],
        conceptExplain: 'For each amount from 1 to target, try every coin. dp[i] = min(dp[i], dp[i - coin] + 1). Build up from smaller subproblems.',
        interviewTip: 'Coin Change II (number of combinations) uses dp[i] += dp[i-coin] instead of min. The two problems look similar but need different recurrences.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // NUMBER OF ISLANDS — BFS on Grid
  // ══════════════════════════════════════════════════════
  {
    id: 'numberOfIslands',
    title: '🏝 Number of Islands',
    category: 'Graph',
    difficulty: 'Medium',
    approaches: [
      {
        label: 'DFS/BFS O(m·n)',
        vizType: 'grid',
        timeComplexity: 'O(m·n)',
        spaceComplexity: 'O(m·n)',
        steps: [
          { grid: [[1,1,0,0,0],[1,1,0,0,0],[0,0,1,0,0],[0,0,0,1,1]], activeCell: null, highlightCells: [], explain: 'Grid: 1=land, 0=water. DFS from each unvisited land cell. Mark visited as 0 to avoid revisiting.' },
          { grid: [[1,1,0,0,0],[1,1,0,0,0],[0,0,1,0,0],[0,0,0,1,1]], activeCell: [0,0], highlightCells: [[0,0]], explain: 'Start DFS at [0,0]=1. Island 1 found. Mark as visited.' },
          { grid: [[0,0,0,0,0],[0,0,0,0,0],[0,0,1,0,0],[0,0,0,1,1]], activeCell: null, highlightCells: [[0,0],[0,1],[1,0],[1,1]], explain: 'DFS explores all connected 1s: [0,0],[0,1],[1,0],[1,1]. Mark all as 0. Island 1 done.' },
          { grid: [[0,0,0,0,0],[0,0,0,0,0],[0,0,1,0,0],[0,0,0,1,1]], activeCell: [2,2], highlightCells: [[2,2]], explain: 'Continue scan. [2,2]=1. Island 2 found. DFS marks it.' },
          { grid: [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,1,1]], activeCell: [3,3], highlightCells: [[3,3],[3,4]], explain: '[3,3]=1. Island 3 found. DFS finds [3,3] and [3,4]. Done.' },
          { grid: [[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0],[0,0,0,0,0]], activeCell: null, highlightCells: [], explain: '✅ Total islands = 3. Each DFS call = one island. Mutating the grid avoids needing a visited set.' },
        ],
        conceptExplain: 'Scan the grid. On each unvisited land cell (1), do DFS/BFS to mark the entire connected island as visited (set to 0). Count how many DFS calls you make.',
        interviewTip: 'If you cannot mutate the grid, use a visited Set. Max Depth of Island, Pacific Atlantic Water Flow all use the same DFS/BFS grid pattern.',
      },
    ],
  },

  // ══════════════════════════════════════════════════════
  // MERGE INTERVALS
  // ══════════════════════════════════════════════════════
  {
    id: 'mergeIntervals',
    title: '📊 Merge Intervals',
    category: 'Intervals',
    difficulty: 'Medium',
    approaches: [
      {
        label: 'Sort + Linear Scan O(n log n)',
        vizType: 'twoptr',
        timeComplexity: 'O(n log n)',
        spaceComplexity: 'O(n)',
        steps: [
          { arr: [1,3,2,6,8,10,15,18], highlight:[], compare:[], sorted:[], pointers:{}, mapState:{ intervals:'[[1,3],[2,6],[8,10],[15,18]]', result:'[]' }, explain:'Sort intervals by start time. Then scan: if current start ≤ previous end → merge.' },
          { arr: [1,3,2,6,8,10,15,18], highlight:[0,1], compare:[], sorted:[], pointers:{}, mapState:{ cur:'[2,6]', prev:'[1,3]', overlap:'2 ≤ 3 → MERGE', result:'[[1,6]]' }, explain:'[2,6] starts at 2 ≤ end of [1,3]=3. Merge: [min(1,2), max(3,6)] = [1,6].' },
          { arr: [1,3,2,6,8,10,15,18], highlight:[2,3], compare:[], sorted:[], pointers:{}, mapState:{ cur:'[8,10]', prev:'[1,6]', overlap:'8 > 6 → NO MERGE', result:'[[1,6],[8,10]]' }, explain:'[8,10] starts at 8 > end 6. No overlap. Add [8,10] to result.' },
          { arr: [1,3,2,6,8,10,15,18], highlight:[3], compare:[], sorted:[], pointers:{}, mapState:{ cur:'[15,18]', prev:'[8,10]', overlap:'15 > 10 → NO MERGE', result:'[[1,6],[8,10],[15,18]]' }, explain:'[15,18] starts at 15 > 10. No overlap.' },
          { arr: [1,3,2,6,8,10,15,18], highlight:[], compare:[], sorted:[0,1,2,3,4,5,6,7], pointers:{}, mapState:{ result:'[[1,6],[8,10],[15,18]]' }, explain:'✅ Result: [[1,6],[8,10],[15,18]]. Sort first: O(n log n). Merge scan: O(n).' },
        ],
        conceptExplain: 'Sort by start time. Then walk through: if the current interval\'s start ≤ previous interval\'s end, they overlap — merge by taking max of the ends.',
        interviewTip: 'Sort by start time, not end time. Insert Interval (LeetCode 57) is the same pattern but you insert before sorting.',
      },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// PRESETS (backward compatibility — used by Problems.jsx animate button)
// Returns first approach of each problem
// ─────────────────────────────────────────────────────────────────────────────
export const PRESETS = Object.fromEntries(
  PROBLEMS.map(p => [p.id, () => p.approaches[0]])
);

// ─────────────────────────────────────────────────────────────────────────────
// FALLBACK: match keywords → closest preset
// ─────────────────────────────────────────────────────────────────────────────

export const getFallbackAnimation = (input) => {
  const l = input.toLowerCase();
  const find = (id) => PROBLEMS.find(p => p.id === id)?.approaches[0];

  // Exact problem matches
  if (l.includes('histogram') || l.includes('largest rectangle')) return find('largestRectangleHistogram');
  if (l.includes('rain water') || l.includes('trapping'))         return find('trappingRainWater');
  if (l.includes('island') || l.includes('islands'))              return find('numberOfIslands');
  if (l.includes('merge interval'))                               return find('mergeIntervals');
  if (l.includes('coin change') && !l.includes('ii'))             return find('coinChange');
  if (l.includes('kadane') || l.includes('max subarray') || l.includes('maximum subarray')) return find('maxSubarray');
  if (l.includes('matrix') || l.includes('2d') || l.includes('search a 2d'))  return find('searchMatrix');
  if (l.includes('lcs') || l.includes('common subsequence'))      return find('lcs');
  if (l.includes('climb') || l.includes('stair'))                 return find('climbingStairs');
  if (l.includes('jump'))                                         return find('jumpGame');
  if (l.includes('3sum') || l.includes('three sum') || l.includes('triplet')) return find('threeSum');
  if (l.includes('window') || l.includes('sliding'))              return find('slidingWindow');
  if (l.includes('inorder') || l.includes('bst') || l.includes('tree traversal')) return find('bstInorder');
  if (l.includes('median') || l.includes('two sorted'))           return find('medianTwoSortedArrays') || find('binarySearch');
  if (l.includes('bubble') || l.includes('sort'))                 return find('bubbleSort');
  if (l.includes('binary search') || l.includes('sorted array'))  return find('binarySearch');
  if (l.includes('two sum') || l.includes('target'))              return find('twoSum');
  if (l.includes('parenthes') || l.includes('bracket'))          return find('validParentheses');
  if (l.includes('stack') || l.includes('monotonic'))             return find('validParentheses');
  if (l.includes('link') || l.includes('reverse'))               return find('reverseLinkedList');
  if (l.includes('insert'))                                       return find('insertionSort');
  if (l.includes('select'))                                       return find('selectionSort');

  // Heuristic category fallbacks
  if (l.includes('dp') || l.includes('dynamic') || l.includes('memo')) return find('climbingStairs');
  if (l.includes('graph') || l.includes('bfs') || l.includes('dfs'))   return find('numberOfIslands');
  if (l.includes('greedy'))                                             return find('jumpGame');
  if (l.includes('tree') || l.includes('node'))                        return find('bstInorder');

  return find('bubbleSort'); // last resort
};