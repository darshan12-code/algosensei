// client/src/lib/animations.js
// All preset animation data for the Visualizer component

export const PRESETS = {

  bubbleSort: () => ({
    title: 'Bubble Sort',
    vizType: 'bars',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    steps: [
      { arr: [5, 3, 8, 1, 9, 2], highlight: [], compare: [], sorted: [], pointers: {}, mapState: {}, explain: 'Starting array. We repeatedly compare adjacent elements and swap if left > right.' },
      { arr: [5, 3, 8, 1, 9, 2], highlight: [], compare: [0, 1], sorted: [], pointers: {}, mapState: {}, explain: 'Compare index 0 (5) and index 1 (3). 5 > 3, so we swap.' },
      { arr: [3, 5, 8, 1, 9, 2], highlight: [0, 1], compare: [], sorted: [], pointers: {}, mapState: {}, explain: 'Swapped: [3, 5, 8, 1, 9, 2]. Now compare index 1 (5) and index 2 (8).' },
      { arr: [3, 5, 8, 1, 9, 2], highlight: [], compare: [1, 2], sorted: [], pointers: {}, mapState: {}, explain: '5 < 8, no swap needed. Compare index 2 (8) and index 3 (1).' },
      { arr: [3, 5, 8, 1, 9, 2], highlight: [], compare: [2, 3], sorted: [], pointers: {}, mapState: {}, explain: '8 > 1, swap! Compare index 3 (8) and index 4 (9).' },
      { arr: [3, 5, 1, 8, 9, 2], highlight: [2, 3], compare: [3, 4], sorted: [], pointers: {}, mapState: {}, explain: '8 < 9, no swap. Compare index 4 (9) and index 5 (2).' },
      { arr: [3, 5, 1, 8, 9, 2], highlight: [], compare: [4, 5], sorted: [], pointers: {}, mapState: {}, explain: '9 > 2, swap! End of pass 1. 9 is now in its final position.' },
      { arr: [3, 5, 1, 8, 2, 9], highlight: [4, 5], compare: [], sorted: [5], pointers: {}, mapState: {}, explain: 'Pass 1 complete. 9 is sorted. Starting pass 2.' },
      { arr: [3, 5, 1, 8, 2, 9], highlight: [], compare: [0, 1], sorted: [5], pointers: {}, mapState: {}, explain: 'Pass 2: Compare 3 and 5. 3 < 5, no swap.' },
      { arr: [3, 5, 1, 8, 2, 9], highlight: [], compare: [1, 2], sorted: [5], pointers: {}, mapState: {}, explain: 'Compare 5 and 1. 5 > 1, swap!' },
      { arr: [3, 1, 5, 8, 2, 9], highlight: [1, 2], compare: [2, 3], sorted: [5], pointers: {}, mapState: {}, explain: 'Swapped. Compare 5 and 8. No swap.' },
      { arr: [3, 1, 5, 8, 2, 9], highlight: [], compare: [3, 4], sorted: [5], pointers: {}, mapState: {}, explain: 'Compare 8 and 2. 8 > 2, swap!' },
      { arr: [3, 1, 5, 2, 8, 9], highlight: [3, 4], compare: [], sorted: [4, 5], pointers: {}, mapState: {}, explain: 'Pass 2 complete. 8 and 9 are now sorted.' },
      { arr: [1, 3, 2, 5, 8, 9], highlight: [], compare: [], sorted: [3, 4, 5], pointers: {}, mapState: {}, explain: 'After pass 3: 5, 8, 9 in place.' },
      { arr: [1, 2, 3, 5, 8, 9], highlight: [], compare: [], sorted: [2, 3, 4, 5], pointers: {}, mapState: {}, explain: 'After pass 4. Nearly sorted!' },
      { arr: [1, 2, 3, 5, 8, 9], highlight: [], compare: [], sorted: [0, 1, 2, 3, 4, 5], pointers: {}, mapState: {}, explain: '✅ Array fully sorted: [1, 2, 3, 5, 8, 9]. Bubble sort is O(n²) — each pass bubbles the max to the end.' },
    ],
    conceptExplain: 'Bubble Sort repeatedly steps through the array, compares adjacent elements and swaps them if they are in the wrong order. The largest unsorted element "bubbles up" to its correct position each pass.',
    interviewTip: 'Interviewers want to hear you mention the optimization of stopping early if no swaps occur in a pass (best case O(n) for already-sorted input).',
  }),

  selectionSort: () => ({
    title: 'Selection Sort',
    vizType: 'bars',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    steps: [
      { arr: [4, 2, 7, 1, 6, 3], highlight: [], compare: [], sorted: [], pointers: { min: 0 }, mapState: {}, explain: 'Find the minimum in the entire array. Current minimum candidate: index 0 (value 4).' },
      { arr: [4, 2, 7, 1, 6, 3], highlight: [1], compare: [0, 1], sorted: [], pointers: { min: 1 }, mapState: {}, explain: '2 < 4, new min at index 1.' },
      { arr: [4, 2, 7, 1, 6, 3], highlight: [3], compare: [1, 3], sorted: [], pointers: { min: 3 }, mapState: {}, explain: '1 < 2, new min at index 3.' },
      { arr: [1, 2, 7, 4, 6, 3], highlight: [0, 3], compare: [], sorted: [0], pointers: {}, mapState: {}, explain: 'Swap index 0 and index 3. 1 is now in its correct position.' },
      { arr: [1, 2, 7, 4, 6, 3], highlight: [], compare: [], sorted: [0], pointers: { min: 1 }, mapState: {}, explain: 'Pass 2: Find min in remaining [2,7,4,6,3]. Min starts at index 1 (value 2).' },
      { arr: [1, 2, 7, 4, 6, 3], highlight: [], compare: [], sorted: [0, 1], pointers: {}, mapState: {}, explain: '2 is already the minimum. No swap needed. 2 is in place.' },
      { arr: [1, 2, 3, 4, 6, 7], highlight: [], compare: [], sorted: [0, 1, 2, 3], pointers: {}, mapState: {}, explain: 'After sorting remaining passes: [3, 4] placed correctly.' },
      { arr: [1, 2, 3, 4, 6, 7], highlight: [], compare: [], sorted: [0, 1, 2, 3, 4, 5], pointers: {}, mapState: {}, explain: '✅ Sorted: [1, 2, 3, 4, 6, 7]. Selection sort always does O(n²) comparisons — it never short-circuits.' },
    ],
    conceptExplain: 'Selection Sort divides the array into sorted and unsorted parts. It repeatedly selects the minimum element from the unsorted portion and places it at the end of the sorted portion.',
    interviewTip: 'Key insight: Selection sort makes at most n swaps (O(n)), making it better than bubble sort when writes are expensive. But comparisons are always O(n²).',
  }),

  insertionSort: () => ({
    title: 'Insertion Sort',
    vizType: 'array',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    steps: [
      { arr: [4, 2, 6, 1, 3], highlight: [0], compare: [], sorted: [0], pointers: {}, mapState: {}, explain: 'Single element [4] is trivially sorted.' },
      { arr: [4, 2, 6, 1, 3], highlight: [1], compare: [], sorted: [0], pointers: { key: 1 }, mapState: {}, explain: 'Pick key = 2. Compare with sorted portion [4]. 2 < 4, shift 4 right.' },
      { arr: [2, 4, 6, 1, 3], highlight: [0, 1], compare: [], sorted: [0, 1], pointers: {}, mapState: {}, explain: 'Insert 2 at index 0. Sorted: [2, 4].' },
      { arr: [2, 4, 6, 1, 3], highlight: [2], compare: [], sorted: [0, 1], pointers: { key: 2 }, mapState: {}, explain: 'Pick key = 6. 6 > 4, already in place. Sorted: [2, 4, 6].' },
      { arr: [2, 4, 6, 1, 3], highlight: [2], compare: [], sorted: [0, 1, 2], pointers: {}, mapState: {}, explain: 'Sorted: [2, 4, 6]. Now pick key = 1.' },
      { arr: [2, 4, 6, 1, 3], highlight: [3], compare: [2, 3], sorted: [0, 1, 2], pointers: { key: 3 }, mapState: {}, explain: '1 < 6, shift 6 right. 1 < 4, shift 4. 1 < 2, shift 2. Insert 1 at index 0.' },
      { arr: [1, 2, 4, 6, 3], highlight: [0], compare: [], sorted: [0, 1, 2, 3], pointers: {}, mapState: {}, explain: 'Inserted 1 at front. Sorted: [1, 2, 4, 6]. Now key = 3.' },
      { arr: [1, 2, 3, 4, 6], highlight: [2], compare: [], sorted: [0, 1, 2, 3, 4], pointers: {}, mapState: {}, explain: '✅ 3 inserted between 2 and 4. Final array: [1, 2, 3, 4, 6]. Insertion sort is O(n) for nearly-sorted arrays.' },
    ],
    conceptExplain: 'Insertion Sort builds the sorted array one element at a time by "inserting" each element into its correct position in the already-sorted portion, shifting elements right to make room.',
    interviewTip: 'Insertion sort is the go-to for small arrays (n < 20) and nearly-sorted data. Most production sort implementations (like Timsort) use it for small subarrays.',
  }),

  binarySearch: () => ({
    title: 'Binary Search',
    vizType: 'array',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    steps: [
      { arr: [1, 3, 5, 7, 9, 11, 13, 15], highlight: [], compare: [], sorted: [0,1,2,3,4,5,6,7], pointers: { L: 0, R: 7 }, mapState: {}, explain: 'Target = 9. Array is sorted. Set L=0, R=7.' },
      { arr: [1, 3, 5, 7, 9, 11, 13, 15], highlight: [3], compare: [], sorted: [0,1,2,3,4,5,6,7], pointers: { L: 0, R: 7, M: 3 }, mapState: {}, explain: 'Mid = (0+7)//2 = 3. arr[3] = 7. Target 9 > 7, so search right half.' },
      { arr: [1, 3, 5, 7, 9, 11, 13, 15], highlight: [5], compare: [], sorted: [0,1,2,3,4,5,6,7], pointers: { L: 4, R: 7, M: 5 }, mapState: {}, explain: 'L=4, R=7. Mid = (4+7)//2 = 5. arr[5] = 11. Target 9 < 11, search left.' },
      { arr: [1, 3, 5, 7, 9, 11, 13, 15], highlight: [4], compare: [], sorted: [0,1,2,3,4,5,6,7], pointers: { L: 4, R: 4, M: 4 }, mapState: {}, explain: 'L=4, R=4. Mid=4. arr[4] = 9. Target found!' },
      { arr: [1, 3, 5, 7, 9, 11, 13, 15], highlight: [], compare: [], sorted: [0,1,2,3,4,5,6,7], pointers: {}, mapState: { result: 4 }, explain: '✅ Found 9 at index 4 in just 3 comparisons instead of 8. Binary search halves the search space each step: O(log n).' },
    ],
    conceptExplain: 'Binary Search works on sorted arrays by repeatedly halving the search space. At each step, it compares the target with the middle element and discards the half that cannot contain the target.',
    interviewTip: 'Watch out for overflow: use mid = left + (right - left) / 2 instead of (left + right) / 2. Also be precise about whether your loop condition is L <= R or L < R.',
  }),

  twoSum: () => ({
    title: 'Two Sum (HashMap)',
    vizType: 'hashmap',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    steps: [
      { arr: [2, 7, 11, 15], highlight: [], compare: [], sorted: [], pointers: { i: 0 }, mapState: {}, explain: 'Target = 9. Use a hashmap to store {value: index}. For each number, check if (target - num) exists in the map.' },
      { arr: [2, 7, 11, 15], highlight: [0], compare: [], sorted: [], pointers: { i: 0 }, mapState: {}, explain: 'i=0, num=2. Need = 9 - 2 = 7. Is 7 in map? No. Store {2: 0}.' },
      { arr: [2, 7, 11, 15], highlight: [0], compare: [], sorted: [], pointers: { i: 0 }, mapState: { 2: 0 }, explain: 'Map now contains {2: 0}. Move to index 1.' },
      { arr: [2, 7, 11, 15], highlight: [1], compare: [], sorted: [], pointers: { i: 1 }, mapState: { 2: 0 }, explain: 'i=1, num=7. Need = 9 - 7 = 2. Is 2 in map? YES! Found at index 0.' },
      { arr: [2, 7, 11, 15], highlight: [0, 1], compare: [], sorted: [0, 1], pointers: {}, mapState: { 2: 0, 7: 1 }, explain: '✅ Answer: [0, 1]. nums[0] + nums[1] = 2 + 7 = 9. One pass, O(n) time. Classic hashmap pattern: store complement lookup.' },
    ],
    conceptExplain: 'Two Sum uses a hashmap to trade space for time. For each element, we check if its complement (target - element) already exists in the map. This reduces the O(n²) brute force to O(n) with one pass.',
    interviewTip: 'This is the canonical "use a hashmap to avoid nested loops" pattern. Interviewers want you to immediately recognize this and explain the space-time tradeoff.',
  }),

  validParentheses: () => ({
    title: 'Valid Parentheses (Stack)',
    vizType: 'stack',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    steps: [
      { arr: ['(', '[', '{', '}', ']', ')'], highlight: [], compare: [], sorted: [], pointers: { i: 0 }, mapState: {}, explain: 'Input: "([{}])". Use a stack. Push opening brackets, pop when we see a closing bracket.' },
      { arr: ['(', '[', '{', '}', ']', ')'], highlight: [0], compare: [], sorted: [], pointers: { i: 0 }, mapState: { 0: '(' }, explain: "i=0, char='('. Opening bracket — push to stack." },
      { arr: ['(', '[', '{', '}', ']', ')'], highlight: [1], compare: [], sorted: [], pointers: { i: 1 }, mapState: { 0: '(', 1: '[' }, explain: "i=1, char='['. Opening bracket — push to stack." },
      { arr: ['(', '[', '{', '}', ']', ')'], highlight: [2], compare: [], sorted: [], pointers: { i: 2 }, mapState: { 0: '(', 1: '[', 2: '{' }, explain: "i=2, char='{'. Opening bracket — push to stack." },
      { arr: ['(', '[', '{', '}', ']', ')'], highlight: [3], compare: [], sorted: [], pointers: { i: 3 }, mapState: { 0: '(', 1: '[' }, explain: "i=3, char='}'. Closing bracket — pop '{' from top. '{' matches '}'. ✓" },
      { arr: ['(', '[', '{', '}', ']', ')'], highlight: [4], compare: [], sorted: [], pointers: { i: 4 }, mapState: { 0: '(' }, explain: "i=4, char=']'. Pop '[' from top. '[' matches ']'. ✓" },
      { arr: ['(', '[', '{', '}', ']', ')'], highlight: [5], compare: [], sorted: [], pointers: { i: 5 }, mapState: {}, explain: "i=5, char=')'. Pop '(' from top. '(' matches ')'. ✓" },
      { arr: ['(', '[', '{', '}', ']', ')'], highlight: [], compare: [], sorted: [0,1,2,3,4,5], pointers: {}, mapState: {}, explain: '✅ Stack is empty at the end — all brackets matched! If stack was not empty OR a mismatch occurred, return false.' },
    ],
    conceptExplain: 'The stack naturally tracks the "most recently opened, not yet closed" bracket. When we see a closing bracket, the top of the stack must be its matching opener — otherwise the string is invalid.',
    interviewTip: 'Follow-up: extend to handle expressions like "a + (b * [c - {d}])". The stack approach generalizes to any nested structure validation.',
  }),

  reverseLinkedList: () => ({
    title: 'Reverse Linked List',
    vizType: 'array',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    steps: [
      { arr: [1, 2, 3, 4, 5], highlight: [], compare: [], sorted: [], pointers: { prev: -1, curr: 0 }, mapState: {}, explain: 'Linked list: 1→2→3→4→5→null. We use three pointers: prev=null, curr=head, next=undefined.' },
      { arr: [1, 2, 3, 4, 5], highlight: [0], compare: [], sorted: [], pointers: { prev: -1, curr: 0 }, mapState: { prev: 'null', curr: '1', next: '2' }, explain: 'curr=1. Save next=2. Reverse: curr.next = prev (null). Move prev=1, curr=2.' },
      { arr: [1, 2, 3, 4, 5], highlight: [1], compare: [], sorted: [0], pointers: { prev: 0, curr: 1 }, mapState: { prev: '1', curr: '2', next: '3' }, explain: 'curr=2. Save next=3. Reverse: 2.next = 1. Move prev=2, curr=3. So far: null←1←2.' },
      { arr: [1, 2, 3, 4, 5], highlight: [2], compare: [], sorted: [0, 1], pointers: { prev: 1, curr: 2 }, mapState: { prev: '2', curr: '3', next: '4' }, explain: 'curr=3. Save next=4. Reverse: 3.next = 2. Move prev=3, curr=4. null←1←2←3.' },
      { arr: [1, 2, 3, 4, 5], highlight: [3], compare: [], sorted: [0, 1, 2], pointers: { prev: 2, curr: 3 }, mapState: { prev: '3', curr: '4', next: '5' }, explain: 'curr=4. Reverse: 4.next = 3. Move prev=4, curr=5. null←1←2←3←4.' },
      { arr: [1, 2, 3, 4, 5], highlight: [4], compare: [], sorted: [0, 1, 2, 3], pointers: { prev: 3, curr: 4 }, mapState: { prev: '4', curr: '5', next: 'null' }, explain: 'curr=5. Reverse: 5.next = 4. curr becomes null. Loop ends.' },
      { arr: [5, 4, 3, 2, 1], highlight: [], compare: [], sorted: [0, 1, 2, 3, 4], pointers: { head: 0 }, mapState: {}, explain: '✅ prev is the new head. Reversed list: 5→4→3→2→1→null. Done in one pass, O(1) space.' },
    ],
    conceptExplain: 'Reversing a linked list in-place uses three pointers (prev, curr, next) to reverse each arrow one at a time. We save the next node before overwriting the pointer, then advance all three pointers forward.',
    interviewTip: 'Common follow-up: reverse only a portion of the list (LeetCode 92). The pattern is the same — just track the boundary nodes. Also know the recursive approach for interviews.',
  }),

  // ─── NEW: Median of Two Sorted Arrays (Hard) ─────────────────────────────
  medianTwoSortedArrays: () => ({
    title: 'Median of Two Sorted Arrays',
    vizType: 'hashmap',
    timeComplexity: 'O(log(m+n))',
    spaceComplexity: 'O(1)',
    steps: [
      {
        arr: [1, 3, 8, 9, 15],
        highlight: [],
        compare: [],
        sorted: [],
        pointers: {},
        mapState: { 'nums1': '[1,3,8,9,15]', 'nums2': '[7,11,18,19,21,25]' },
        explain: 'nums1 = [1,3,8,9,15] (m=5), nums2 = [7,11,18,19,21,25] (n=6). Total 11 elements — odd, so median = 6th smallest. Key insight: binary search on the SMALLER array (nums1).',
      },
      {
        arr: [1, 3, 8, 9, 15],
        highlight: [1, 2],
        compare: [],
        sorted: [],
        pointers: { lo: 0, hi: 5, p1: 2 },
        mapState: { 'half': '(5+6+1)//2 = 6', 'p1': '2 (mid of lo=0,hi=5)', 'p2': '6-2 = 4' },
        explain: 'half = (m+n+1)//2 = 6. Binary search on nums1: lo=0, hi=5. p1 = (0+5)//2 = 2. p2 = half - p1 = 4. This means we take 2 elements from nums1 and 4 from nums2 for the "left half".',
      },
      {
        arr: [1, 3, 8, 9, 15],
        highlight: [1],
        compare: [2],
        sorted: [],
        pointers: { p1: 2, p2: 4 },
        mapState: {
          'maxLeft1': 'nums1[p1-1] = nums1[1] = 3',
          'minRight1': 'nums1[p1] = nums1[2] = 8',
          'maxLeft2': 'nums2[p2-1] = nums2[3] = 19',
          'minRight2': 'nums2[p2] = nums2[4] = 21',
        },
        explain: 'With p1=2, p2=4: maxLeft1=3, minRight1=8, maxLeft2=19, minRight2=21. Check: is maxLeft2 (19) <= minRight1 (8)? NO! 19 > 8 means we took too many from nums2 → move p1 right.',
      },
      {
        arr: [1, 3, 8, 9, 15],
        highlight: [2, 3],
        compare: [],
        sorted: [],
        pointers: { lo: 3, hi: 5, p1: 4 },
        mapState: {
          'action': 'lo = p1+1 = 3, hi stays at 5',
          'p1': '(3+5)//2 = 4',
          'p2': '6 - 4 = 2',
        },
        explain: 'Adjust: lo = p1+1 = 3. New p1 = (3+5)//2 = 4, p2 = 6-4 = 2. Now take 4 elements from nums1 and 2 from nums2 for the left partition.',
      },
      {
        arr: [1, 3, 8, 9, 15],
        highlight: [3],
        compare: [4],
        sorted: [],
        pointers: { p1: 4, p2: 2 },
        mapState: {
          'maxLeft1': 'nums1[3] = 9',
          'minRight1': 'nums1[4] = 15',
          'maxLeft2': 'nums2[1] = 11',
          'minRight2': 'nums2[2] = 18',
        },
        explain: 'p1=4, p2=2: maxLeft1=9, minRight1=15, maxLeft2=11, minRight2=18. Check: maxLeft1 (9) <= minRight2 (18)? YES. maxLeft2 (11) <= minRight1 (15)? YES. Partition is VALID!',
      },
      {
        arr: [1, 3, 8, 9, 15],
        highlight: [],
        compare: [],
        sorted: [0, 1, 2, 3, 4],
        pointers: {},
        mapState: {
          'leftMax': 'max(9, 11) = 11',
          'rightMin': 'min(15, 18) = 15',
          'total': '11 (odd)',
          'median': '11 (leftMax)',
        },
        explain: 'Total 11 elements (odd) → median = max(maxLeft1, maxLeft2) = max(9, 11) = 11. ✅ Median = 11.0. If even, median = (max(leftMax) + min(rightMin)) / 2 = (11+15)/2 = 13.0.',
      },
      {
        arr: [1, 3, 8, 9, 15],
        highlight: [],
        compare: [],
        sorted: [0, 1, 2, 3, 4],
        pointers: {},
        mapState: {
          'Why binary search?': 'Avoid O(m+n) merge',
          'Key invariant': 'maxLeft1 <= minRight2 AND maxLeft2 <= minRight1',
          'Complexity': 'O(log(min(m,n)))',
        },
        explain: '✅ Algorithm complete! Binary search on the smaller array ensures we find the correct partition in O(log(min(m,n))). The partition divides both arrays so all left elements ≤ all right elements.',
      },
    ],
    conceptExplain: 'Instead of merging (O(m+n)), we binary-search for the correct partition point on the smaller array. We want to split both arrays such that all left-half elements ≤ all right-half elements. The median is then derived from the boundary elements.',
    interviewTip: 'This is one of the hardest LeetCode Hard problems. Key edge cases: p1=0 (maxLeft1=-∞), p1=m (minRight1=+∞), same for p2. Always binary search on the shorter array. Start by explaining the O(m+n) merge approach, then optimise to O(log(min(m,n))).',
  }),

};

// Fallback: pick closest preset based on keywords in the input
export const getFallbackAnimation = (input) => {
  const lower = input.toLowerCase();
  if (lower.includes('median') || lower.includes('two sorted'))          return PRESETS.medianTwoSortedArrays();
  if (lower.includes('bubble') || lower.includes('sort'))                return PRESETS.bubbleSort();
  if (lower.includes('binary') || lower.includes('search'))              return PRESETS.binarySearch();
  if (lower.includes('two sum') || lower.includes('target'))             return PRESETS.twoSum();
  if (lower.includes('parenthes') || lower.includes('bracket') || lower.includes('stack')) return PRESETS.validParentheses();
  if (lower.includes('link') || lower.includes('reverse'))               return PRESETS.reverseLinkedList();
  if (lower.includes('insert'))                                           return PRESETS.insertionSort();
  if (lower.includes('select'))                                           return PRESETS.selectionSort();
  return PRESETS.bubbleSort(); // default fallback
};