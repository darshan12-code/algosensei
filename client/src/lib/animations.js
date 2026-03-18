// Each function returns { title, vizType, timeComplexity, spaceComplexity, steps[] }
// steps[] is consumed by Visualizer.jsx — same format as AI-generated steps

// ── 1. Bubble Sort ───────────────────────────────────────────
export function bubbleSort(arr = [64, 34, 25, 12, 22, 11, 90]) {
  const steps = [];
  const a = [...arr];
  const n = a.length;

  steps.push({
    arr: [...a], highlight: [], compare: [], sorted: [],
    pointers: {}, mapState: {},
    explain: `Starting bubble sort on [${a.join(', ')}]. We'll compare adjacent pairs and bubble the largest to the end.`
  });

  const sortedIndices = new Set();

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      // Highlight the pair being compared
      steps.push({
        arr: [...a], highlight: [j, j + 1], compare: [j, j + 1],
        sorted: [...sortedIndices],
        pointers: { i: j, j: j + 1 }, mapState: {},
        explain: `Comparing a[${j}]=${a[j]} and a[${j+1}]=${a[j+1]}. ${a[j] > a[j+1] ? 'a[' + j + '] > a[' + (j+1) + '], so we swap.' : 'Already in order, no swap needed.'}`
      });

      if (a[j] > a[j + 1]) {
        [a[j], a[j + 1]] = [a[j + 1], a[j]];
        steps.push({
          arr: [...a], highlight: [j, j + 1], compare: [],
          sorted: [...sortedIndices],
          pointers: {}, mapState: {},
          explain: `Swapped! Array is now [${a.join(', ')}]`
        });
      }
    }
    sortedIndices.add(n - 1 - i);
    steps.push({
      arr: [...a], highlight: [], compare: [],
      sorted: [...sortedIndices],
      pointers: {}, mapState: {},
      explain: `Pass ${i + 1} complete. ${a[n - 1 - i]} is now in its final sorted position.`
    });
  }
  sortedIndices.add(0);

  steps.push({
    arr: [...a], highlight: [], compare: [],
    sorted: [...Array(n).keys()],
    pointers: {}, mapState: {},
    explain: `✅ Array fully sorted: [${a.join(', ')}]`
  });

  return {
    title: 'Bubble Sort',
    vizType: 'array',
    timeComplexity: 'O(n²)',
    spaceComplexity: 'O(1)',
    steps
  };
}

// ── 2. Binary Search ─────────────────────────────────────────
export function binarySearch(arr = [2, 5, 8, 12, 16, 23, 38, 56, 72, 91], target = 23) {
  const steps = [];
  let low = 0, high = arr.length - 1;

  steps.push({
    arr: [...arr], highlight: [], compare: [],
    sorted: [...Array(arr.length).keys()], // all green — already sorted
    pointers: { L: low, R: high }, mapState: {},
    explain: `Binary search for target=${target} in sorted array. Start with L=0, R=${high}.`
  });

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);

    steps.push({
      arr: [...arr], highlight: [mid], compare: [low, high],
      sorted: [...Array(arr.length).keys()],
      pointers: { L: low, M: mid, R: high }, mapState: {},
      explain: `mid = (${low} + ${high}) / 2 = ${mid}. Checking arr[${mid}] = ${arr[mid]} vs target ${target}.`
    });

    if (arr[mid] === target) {
      steps.push({
        arr: [...arr], highlight: [], compare: [],
        sorted: [...Array(arr.length).keys()],
        pointers: { FOUND: mid }, mapState: {},
        explain: `✅ Found! arr[${mid}] = ${target}. Return index ${mid}.`
      });
      break;
    } else if (arr[mid] < target) {
      steps.push({
        arr: [...arr], highlight: [], compare: [low, mid],
        sorted: [...Array(arr.length).keys()],
        pointers: { L: mid + 1, R: high }, mapState: {},
        explain: `arr[${mid}]=${arr[mid]} < ${target}. Target is in right half. Move L to ${mid + 1}.`
      });
      low = mid + 1;
    } else {
      steps.push({
        arr: [...arr], highlight: [], compare: [mid, high],
        sorted: [...Array(arr.length).keys()],
        pointers: { L: low, R: mid - 1 }, mapState: {},
        explain: `arr[${mid}]=${arr[mid]} > ${target}. Target is in left half. Move R to ${mid - 1}.`
      });
      high = mid - 1;
    }
  }

  return {
    title: `Binary Search (target=${target})`,
    vizType: 'array',
    timeComplexity: 'O(log n)',
    spaceComplexity: 'O(1)',
    steps
  };
}

// ── 3. Two Sum (HashMap approach) ────────────────────────────
export function twoSum(nums = [2, 7, 11, 15, 4, 6], target = 13) {
  const steps = [];
  const map = {};

  steps.push({
    arr: [...nums], highlight: [], compare: [], sorted: [],
    pointers: {}, mapState: {},
    explain: `Two Sum: find indices where nums[i] + nums[j] = ${target}. We'll use a HashMap for O(n) time.`
  });

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    steps.push({
      arr: [...nums], highlight: [i], compare: [], sorted: [],
      pointers: { i }, mapState: { ...map },
      explain: `i=${i}, nums[i]=${nums[i]}. Need complement = ${target} - ${nums[i]} = ${complement}. Checking HashMap...`
    });

    if (map.hasOwnProperty(complement)) {
      steps.push({
        arr: [...nums], highlight: [map[complement], i], compare: [],
        sorted: [map[complement], i],
        pointers: { i, found: map[complement] },
        mapState: { ...map },
        explain: `✅ Found! ${complement} is in the map at index ${map[complement]}. Answer: [${map[complement]}, ${i}]`
      });
      break;
    }

    map[nums[i]] = i;
    steps.push({
      arr: [...nums], highlight: [], compare: [], sorted: [],
      pointers: {}, mapState: { ...map },
      explain: `${complement} not in map yet. Store nums[${i}]=${nums[i]} → index ${i} in HashMap.`
    });
  }

  return {
    title: `Two Sum (target=${target})`,
    vizType: 'hashmap',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    steps
  };
}

// ── 4. Valid Parentheses (Stack) ─────────────────────────────
export function validParentheses(s = '({[]})') {
  const steps = [];
  const stack = [];
  const matching = { ')': '(', '}': '{', ']': '[' };
  const chars = s.split('');

  steps.push({
    arr: chars, highlight: [], compare: [], sorted: [],
    pointers: {}, mapState: {},
    explain: `Valid Parentheses: checking "${s}". We'll use a stack — push openers, pop when we see a closer.`
  });

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const isOpener = ['(', '{', '['].includes(ch);

    steps.push({
      arr: chars, highlight: [i], compare: [], sorted: [],
      pointers: { i },
      mapState: Object.fromEntries(stack.map((c, idx) => [idx, c])),
      explain: `char="${ch}" at index ${i}. ${isOpener ? 'It\'s an opener — push to stack.' : `It's a closer. Check if top of stack matches.`}`
    });

    if (isOpener) {
      stack.push(ch);
      steps.push({
        arr: chars, highlight: [], compare: [], sorted: [],
        pointers: {},
        mapState: Object.fromEntries(stack.map((c, idx) => [idx, c])),
        explain: `Pushed "${ch}". Stack: [${stack.join(', ')}]`
      });
    } else {
      const top = stack[stack.length - 1];
      if (top === matching[ch]) {
        stack.pop();
        steps.push({
          arr: chars, highlight: [], compare: [], sorted: [i],
          pointers: {},
          mapState: Object.fromEntries(stack.map((c, idx) => [idx, c])),
          explain: `✓ Match! "${top}" pairs with "${ch}". Popped. Stack: [${stack.join(', ')}]`
        });
      } else {
        steps.push({
          arr: chars, highlight: [i], compare: [], sorted: [],
          pointers: {},
          mapState: Object.fromEntries(stack.map((c, idx) => [idx, c])),
          explain: `❌ Mismatch! Expected "${matching[ch]}" but got "${top || 'empty'}". Return false.`
        });
        break;
      }
    }
  }

  const valid = stack.length === 0;
  steps.push({
    arr: chars, highlight: [], compare: [],
    sorted: valid ? [...Array(chars.length).keys()] : [],
    pointers: {}, mapState: {},
    explain: valid
      ? `✅ Stack is empty — all brackets matched! Return true.`
      : `❌ Stack not empty: [${stack.join(', ')}] unmatched. Return false.`
  });

  return {
    title: `Valid Parentheses ("${s}")`,
    vizType: 'stack',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)',
    steps
  };
}

// ── 5. Reverse Linked List ────────────────────────────────────
export function reverseLinkedList(values = [1, 2, 3, 4, 5]) {
  const steps = [];

  steps.push({
    arr: [...values], highlight: [], compare: [], sorted: [],
    pointers: { prev: -1, curr: 0 }, mapState: {},
    explain: `Reverse Linked List: [${values.join(' → ')}]. Use 3 pointers: prev=null, curr=head, next.`
  });

  const result = [...values];

  // Simulate pointer-based reversal with steps
  for (let i = 0; i < values.length; i++) {
    const prevIdx = i - 1;
    const nextIdx = i + 1;

    steps.push({
      arr: [...result], highlight: [i], compare: prevIdx >= 0 ? [prevIdx, i] : [],
      sorted: [...Array(i).keys()],
      pointers: {
        prev: prevIdx,
        curr: i,
        ...(nextIdx < values.length ? { next: nextIdx } : {})
      },
      mapState: {},
      explain: `curr=${values[i]}. Save next=${values[nextIdx] ?? 'null'}. Point curr.next → prev (${values[prevIdx] ?? 'null'}).`
    });

    steps.push({
      arr: [...result], highlight: [], compare: [],
      sorted: [...Array(i + 1).keys()],
      pointers: {
        prev: i,
        curr: nextIdx < values.length ? nextIdx : -1,
      },
      mapState: {},
      explain: `Move prev to curr (${values[i]}), move curr to next (${values[nextIdx] ?? 'null'}).`
    });
  }

  steps.push({
    arr: [...values].reverse(), highlight: [], compare: [],
    sorted: [...Array(values.length).keys()],
    pointers: { head: 0 }, mapState: {},
    explain: `✅ Reversed! New list: [${[...values].reverse().join(' → ')}]. Return new head.`
  });

  return {
    title: 'Reverse Linked List',
    vizType: 'array',
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)',
    steps
  };
}

// ── Presets map — used by Visualize page buttons ─────────────
export const PRESETS = {
  bubbleSort:         () => bubbleSort(),
  binarySearch:       () => binarySearch(),
  twoSum:             () => twoSum(),
  validParentheses:   () => validParentheses(),
  reverseLinkedList:  () => reverseLinkedList(),
};

// ── Fallback matcher — if AI fails, match by keyword ─────────
export function getFallbackAnimation(text = '') {
  const t = text.toLowerCase();
  if (t.includes('bubble') || t.includes('sort'))           return bubbleSort();
  if (t.includes('binary') || t.includes('search'))         return binarySearch();
  if (t.includes('two sum') || t.includes('twosum'))        return twoSum();
  if (t.includes('parenthes') || t.includes('bracket'))     return validParentheses();
  if (t.includes('linked') || t.includes('reverse'))        return reverseLinkedList();
  return bubbleSort(); // default fallback
}