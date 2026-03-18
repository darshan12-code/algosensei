require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']); // force Google DNS
const mongoose = require('mongoose');
const DSAProblem = require('../models/DSAProblem');

const problems = [
  // ── ARRAY (5) ──────────────────────────────────────────────
  {
    leetcodeNum: 1, title: 'Two Sum', difficulty: 'Easy',
    topics: ['Array', 'HashMap'], companies: ['Google', 'Amazon', 'Meta', 'Apple'],
    description: 'Given an integer array nums and a target, return indices of the two numbers that add up to target.',
    examples: ['Input: nums=[2,7,11,15], target=9 → Output: [0,1]'],
    constraints: ['2 <= nums.length <= 10^4', 'Exactly one valid answer exists']
  },
  {
    leetcodeNum: 121, title: 'Best Time to Buy and Sell Stock', difficulty: 'Easy',
    topics: ['Array'], companies: ['Amazon', 'Google', 'Microsoft'],
    description: 'Find the maximum profit by choosing a day to buy and a later day to sell.',
    examples: ['Input: prices=[7,1,5,3,6,4] → Output: 5'],
    constraints: ['1 <= prices.length <= 10^5', '0 <= prices[i] <= 10^4']
  },
  {
    leetcodeNum: 15, title: '3Sum', difficulty: 'Medium',
    topics: ['Array', 'Two Pointers'], companies: ['Google', 'Meta', 'Amazon'],
    description: 'Find all unique triplets in the array that sum to zero.',
    examples: ['Input: nums=[-1,0,1,2,-1,-4] → Output: [[-1,-1,2],[-1,0,1]]'],
    constraints: ['3 <= nums.length <= 3000', '-10^5 <= nums[i] <= 10^5']
  },
  {
    leetcodeNum: 11, title: 'Container With Most Water', difficulty: 'Medium',
    topics: ['Array', 'Two Pointers'], companies: ['Google', 'Amazon', 'Bloomberg'],
    description: 'Find two lines that together with the x-axis form a container holding the most water.',
    examples: ['Input: height=[1,8,6,2,5,4,8,3,7] → Output: 49'],
    constraints: ['n == height.length', '2 <= n <= 10^5']
  },
  {
    leetcodeNum: 42, title: 'Trapping Rain Water', difficulty: 'Hard',
    topics: ['Array', 'Two Pointers'], companies: ['Google', 'Amazon', 'Meta'],
    description: 'Given n non-negative integers representing an elevation map, compute how much water it can trap.',
    examples: ['Input: height=[0,1,0,2,1,0,1,3,2,1,2,1] → Output: 6'],
    constraints: ['n == height.length', '1 <= n <= 2 * 10^4']
  },

  // ── HASHMAP (5) ─────────────────────────────────────────────
  {
    leetcodeNum: 49, title: 'Group Anagrams', difficulty: 'Medium',
    topics: ['HashMap', 'String'], companies: ['Amazon', 'Google', 'Facebook'],
    description: 'Group strings that are anagrams of each other.',
    examples: ['Input: ["eat","tea","tan","ate","nat","bat"] → Output: [["bat"],["nat","tan"],["ate","eat","tea"]]'],
    constraints: ['1 <= strs.length <= 10^4', 'strs[i] consists of lowercase English letters']
  },
  {
    leetcodeNum: 128, title: 'Longest Consecutive Sequence', difficulty: 'Medium',
    topics: ['HashMap', 'Array'], companies: ['Google', 'Amazon', 'Facebook'],
    description: 'Find the length of the longest consecutive elements sequence in O(n).',
    examples: ['Input: nums=[100,4,200,1,3,2] → Output: 4'],
    constraints: ['0 <= nums.length <= 10^5', '-10^9 <= nums[i] <= 10^9']
  },
  {
    leetcodeNum: 347, title: 'Top K Frequent Elements', difficulty: 'Medium',
    topics: ['HashMap', 'Heap'], companies: ['Amazon', 'Google', 'Facebook'],
    description: 'Return the k most frequent elements.',
    examples: ['Input: nums=[1,1,1,2,2,3], k=2 → Output: [1,2]'],
    constraints: ['1 <= nums.length <= 10^5', 'k is in range [1, unique elements]']
  },
  {
    leetcodeNum: 560, title: 'Subarray Sum Equals K', difficulty: 'Medium',
    topics: ['HashMap', 'Array'], companies: ['Facebook', 'Google', 'Amazon'],
    description: 'Find total number of subarrays whose sum equals k.',
    examples: ['Input: nums=[1,1,1], k=2 → Output: 2'],
    constraints: ['1 <= nums.length <= 2 * 10^4', '-1000 <= nums[i] <= 1000']
  },
  {
    leetcodeNum: 238, title: 'Product of Array Except Self', difficulty: 'Medium',
    topics: ['HashMap', 'Array'], companies: ['Amazon', 'Apple', 'Microsoft'],
    description: 'Return array where each element is product of all other elements. No division allowed.',
    examples: ['Input: nums=[1,2,3,4] → Output: [24,12,8,6]'],
    constraints: ['2 <= nums.length <= 10^5', 'Product fits in 32-bit integer']
  },

  // ── TWO POINTERS (5) ────────────────────────────────────────
  {
    leetcodeNum: 125, title: 'Valid Palindrome', difficulty: 'Easy',
    topics: ['Two Pointers', 'String'], companies: ['Facebook', 'Microsoft', 'Amazon'],
    description: 'Check if a string is a palindrome considering only alphanumeric characters.',
    examples: ['Input: s="A man, a plan, a canal: Panama" → Output: true'],
    constraints: ['1 <= s.length <= 2 * 10^5']
  },
  {
    leetcodeNum: 167, title: 'Two Sum II', difficulty: 'Medium',
    topics: ['Two Pointers', 'Array'], companies: ['Amazon', 'Microsoft'],
    description: 'Find two numbers in a sorted array that add to target.',
    examples: ['Input: numbers=[2,7,11,15], target=9 → Output: [1,2]'],
    constraints: ['2 <= numbers.length <= 3 * 10^4', 'Exactly one solution']
  },
  {
    leetcodeNum: 16, title: '3Sum Closest', difficulty: 'Medium',
    topics: ['Two Pointers', 'Array'], companies: ['Amazon', 'Google'],
    description: 'Find three integers whose sum is closest to target.',
    examples: ['Input: nums=[-1,2,1,-4], target=1 → Output: 2'],
    constraints: ['3 <= nums.length <= 500', '-10^4 <= target <= 10^4']
  },
  {
    leetcodeNum: 977, title: 'Squares of a Sorted Array', difficulty: 'Easy',
    topics: ['Two Pointers', 'Array'], companies: ['Google', 'Amazon'],
    description: 'Return sorted array of squares of each number.',
    examples: ['Input: nums=[-4,-1,0,3,10] → Output: [0,1,9,16,100]'],
    constraints: ['1 <= nums.length <= 10^4']
  },
  {
    leetcodeNum: 75, title: 'Sort Colors', difficulty: 'Medium',
    topics: ['Two Pointers', 'Array'], companies: ['Microsoft', 'Amazon', 'Apple'],
    description: 'Sort an array of 0s, 1s, and 2s in-place (Dutch National Flag problem).',
    examples: ['Input: nums=[2,0,2,1,1,0] → Output: [0,0,1,1,2,2]'],
    constraints: ['1 <= nums.length <= 300', 'nums[i] is 0, 1, or 2']
  },

  // ── SLIDING WINDOW (5) ──────────────────────────────────────
  {
    leetcodeNum: 3, title: 'Longest Substring Without Repeating Characters', difficulty: 'Medium',
    topics: ['Sliding Window', 'String'], companies: ['Amazon', 'Google', 'Bloomberg', 'Facebook'],
    description: 'Find the length of the longest substring without repeating characters.',
    examples: ['Input: s="abcabcbb" → Output: 3'],
    constraints: ['0 <= s.length <= 5 * 10^4']
  },
  {
    leetcodeNum: 424, title: 'Longest Repeating Character Replacement', difficulty: 'Medium',
    topics: ['Sliding Window', 'String'], companies: ['Google', 'Amazon'],
    description: 'Replace at most k characters to get the longest substring with same letter.',
    examples: ['Input: s="ABAB", k=2 → Output: 4'],
    constraints: ['1 <= s.length <= 10^5', '0 <= k <= s.length']
  },
  {
    leetcodeNum: 567, title: 'Permutation in String', difficulty: 'Medium',
    topics: ['Sliding Window', 'String'], companies: ['Microsoft', 'Google', 'Amazon'],
    description: 'Check if s2 contains a permutation of s1.',
    examples: ["Input: s1='ab', s2='eidbaooo' → Output: true"],
    constraints: ['1 <= s1.length, s2.length <= 10^4']
  },
  {
    leetcodeNum: 76, title: 'Minimum Window Substring', difficulty: 'Hard',
    topics: ['Sliding Window', 'String'], companies: ['Facebook', 'Amazon', 'Google', 'Microsoft'],
    description: 'Find the minimum window substring of s that contains all characters of t.',
    examples: ["Input: s='ADOBECODEBANC', t='ABC' → Output: 'BANC'"],
    constraints: ['1 <= m, n <= 10^5']
  },
  {
    leetcodeNum: 239, title: 'Sliding Window Maximum', difficulty: 'Hard',
    topics: ['Sliding Window', 'Deque'], companies: ['Amazon', 'Google', 'Microsoft'],
    description: 'Return the max of each sliding window of size k.',
    examples: ['Input: nums=[1,3,-1,-3,5,3,6,7], k=3 → Output: [3,3,5,5,6,7]'],
    constraints: ['1 <= nums.length <= 10^5', '1 <= k <= nums.length']
  },

  // ── STACK (5) ───────────────────────────────────────────────
  {
    leetcodeNum: 20, title: 'Valid Parentheses', difficulty: 'Easy',
    topics: ['Stack', 'String'], companies: ['Google', 'Amazon', 'Facebook', 'Microsoft'],
    description: 'Check if a string of brackets is valid.',
    examples: ["Input: s='()[]{}' → Output: true", "Input: s='(]' → Output: false"],
    constraints: ['1 <= s.length <= 10^4']
  },
  {
    leetcodeNum: 155, title: 'Min Stack', difficulty: 'Medium',
    topics: ['Stack'], companies: ['Amazon', 'Google', 'Bloomberg'],
    description: 'Design a stack that supports push, pop, top, and getMin in O(1).',
    examples: ['MinStack obj; obj.push(-3); obj.getMin() → -3'],
    constraints: ['-2^31 <= val <= 2^31 - 1', 'pop/top/getMin called on non-empty stack']
  },
  {
    leetcodeNum: 150, title: 'Evaluate Reverse Polish Notation', difficulty: 'Medium',
    topics: ['Stack', 'Array'], companies: ['Amazon', 'LinkedIn'],
    description: 'Evaluate the value of an arithmetic expression in Reverse Polish Notation.',
    examples: ['Input: tokens=["2","1","+","3","*"] → Output: 9'],
    constraints: ['1 <= tokens.length <= 10^4']
  },
  {
    leetcodeNum: 84, title: 'Largest Rectangle in Histogram', difficulty: 'Hard',
    topics: ['Stack', 'Array'], companies: ['Amazon', 'Google', 'Microsoft'],
    description: 'Find the largest rectangle in a histogram.',
    examples: ['Input: heights=[2,1,5,6,2,3] → Output: 10'],
    constraints: ['1 <= heights.length <= 10^5', '0 <= heights[i] <= 10^4']
  },
  {
    leetcodeNum: 853, title: 'Car Fleet', difficulty: 'Medium',
    topics: ['Stack', 'Array'], companies: ['Google', 'Amazon'],
    description: 'Find how many car fleets arrive at destination.',
    examples: ['Input: target=12, position=[10,8,0,5,3], speed=[2,4,1,1,3] → Output: 3'],
    constraints: ['1 <= n <= 10^5']
  },

  // ── BINARY SEARCH (5) ───────────────────────────────────────
  {
    leetcodeNum: 704, title: 'Binary Search', difficulty: 'Easy',
    topics: ['Binary Search', 'Array'], companies: ['Google', 'Amazon', 'Microsoft'],
    description: 'Search for a target in a sorted array. Return index or -1.',
    examples: ['Input: nums=[-1,0,3,5,9,12], target=9 → Output: 4'],
    constraints: ['1 <= nums.length <= 10^4', 'All elements are unique']
  },
  {
    leetcodeNum: 33, title: 'Search in Rotated Sorted Array', difficulty: 'Medium',
    topics: ['Binary Search', 'Array'], companies: ['Amazon', 'Microsoft', 'Facebook', 'Google'],
    description: 'Search for target in a rotated sorted array.',
    examples: ['Input: nums=[4,5,6,7,0,1,2], target=0 → Output: 4'],
    constraints: ['1 <= nums.length <= 5000', 'All values are unique']
  },
  {
    leetcodeNum: 153, title: 'Find Minimum in Rotated Sorted Array', difficulty: 'Medium',
    topics: ['Binary Search', 'Array'], companies: ['Microsoft', 'Amazon', 'Google'],
    description: 'Find the minimum element in a rotated sorted array.',
    examples: ['Input: nums=[3,4,5,1,2] → Output: 1'],
    constraints: ['n == nums.length', '1 <= n <= 5000', 'All integers are unique']
  },
  {
    leetcodeNum: 981, title: 'Time Based Key-Value Store', difficulty: 'Medium',
    topics: ['Binary Search', 'HashMap'], companies: ['Google', 'Facebook', 'Amazon'],
    description: 'Design a time-based key-value store with set and get using timestamps.',
    examples: ['TimeMap.set("foo","bar",1); TimeMap.get("foo",1) → "bar"'],
    constraints: ['1 <= key.length, value.length <= 100', '1 <= timestamp <= 10^7']
  },
  {
    leetcodeNum: 4, title: 'Median of Two Sorted Arrays', difficulty: 'Hard',
    topics: ['Binary Search', 'Array'], companies: ['Google', 'Amazon', 'Microsoft', 'Apple'],
    description: 'Find the median of two sorted arrays in O(log(m+n)) time.',
    examples: ['Input: nums1=[1,3], nums2=[2] → Output: 2.00000'],
    constraints: ['0 <= m, n <= 1000', 'nums1 and nums2 are sorted']
  },

  // ── LINKED LIST (5) ─────────────────────────────────────────
  {
    leetcodeNum: 206, title: 'Reverse Linked List', difficulty: 'Easy',
    topics: ['LinkedList'], companies: ['Amazon', 'Microsoft', 'Google', 'Facebook'],
    description: 'Reverse a singly linked list.',
    examples: ['Input: 1→2→3→4→5 → Output: 5→4→3→2→1'],
    constraints: ['0 <= nodes <= 5000', '-5000 <= Node.val <= 5000']
  },
  {
    leetcodeNum: 21, title: 'Merge Two Sorted Lists', difficulty: 'Easy',
    topics: ['LinkedList'], companies: ['Amazon', 'Microsoft', 'Google'],
    description: 'Merge two sorted linked lists into one sorted list.',
    examples: ['Input: l1=1→2→4, l2=1→3→4 → Output: 1→1→2→3→4→4'],
    constraints: ['0 <= nodes in each list <= 50', '-100 <= Node.val <= 100']
  },
  {
    leetcodeNum: 141, title: 'Linked List Cycle', difficulty: 'Easy',
    topics: ['LinkedList', 'Two Pointers'], companies: ['Amazon', 'Microsoft', 'Bloomberg'],
    description: "Detect if a linked list has a cycle using Floyd's algorithm.",
    examples: ['Input: 3→2→0→-4→(back to 2) → Output: true'],
    constraints: ['0 <= nodes <= 10^4', '-10^5 <= Node.val <= 10^5']
  },
  {
    leetcodeNum: 19, title: 'Remove Nth Node From End of List', difficulty: 'Medium',
    topics: ['LinkedList', 'Two Pointers'], companies: ['Amazon', 'Microsoft', 'Google'],
    description: 'Remove the nth node from the end of the list in one pass.',
    examples: ['Input: 1→2→3→4→5, n=2 → Output: 1→2→3→5'],
    constraints: ['1 <= sz <= 30', '0 <= Node.val <= 100', '1 <= n <= sz']
  },
  {
    leetcodeNum: 23, title: 'Merge K Sorted Lists', difficulty: 'Hard',
    topics: ['LinkedList', 'Heap'], companies: ['Amazon', 'Google', 'Microsoft', 'Facebook'],
    description: 'Merge k sorted linked lists into one sorted list.',
    examples: ['Input: [[1,4,5],[1,3,4],[2,6]] → Output: 1→1→2→3→4→4→5→6'],
    constraints: ['k == lists.length', '0 <= k <= 10^4', '0 <= nodes in each list <= 500']
  },

  // ── TREE (5) ────────────────────────────────────────────────
  {
    leetcodeNum: 226, title: 'Invert Binary Tree', difficulty: 'Easy',
    topics: ['Tree', 'BFS'], companies: ['Google', 'Amazon', 'Microsoft'],
    description: 'Invert a binary tree.',
    examples: ['Input: [4,2,7,1,3,6,9] → Output: [4,7,2,9,6,3,1]'],
    constraints: ['0 <= nodes <= 100', '-100 <= Node.val <= 100']
  },
  {
    leetcodeNum: 104, title: 'Maximum Depth of Binary Tree', difficulty: 'Easy',
    topics: ['Tree', 'DFS'], companies: ['LinkedIn', 'Google', 'Amazon'],
    description: 'Find the maximum depth of a binary tree.',
    examples: ['Input: [3,9,20,null,null,15,7] → Output: 3'],
    constraints: ['0 <= nodes <= 10^4', '-100 <= Node.val <= 100']
  },
  {
    leetcodeNum: 102, title: 'Binary Tree Level Order Traversal', difficulty: 'Medium',
    topics: ['Tree', 'BFS'], companies: ['Amazon', 'Microsoft', 'Facebook', 'Google'],
    description: 'Return level order traversal of binary tree values.',
    examples: ['Input: [3,9,20,null,null,15,7] → Output: [[3],[9,20],[15,7]]'],
    constraints: ['0 <= nodes <= 2000', '-1000 <= Node.val <= 1000']
  },
  {
    leetcodeNum: 98, title: 'Validate Binary Search Tree', difficulty: 'Medium',
    topics: ['Tree', 'DFS'], companies: ['Amazon', 'Microsoft', 'Facebook', 'Bloomberg'],
    description: 'Determine if a binary tree is a valid BST.',
    examples: ['Input: [2,1,3] → Output: true', 'Input: [5,1,4,null,null,3,6] → Output: false'],
    constraints: ['1 <= nodes <= 10^4', '-2^31 <= Node.val <= 2^31 - 1']
  },
  {
    leetcodeNum: 124, title: 'Binary Tree Maximum Path Sum', difficulty: 'Hard',
    topics: ['Tree', 'DFS'], companies: ['Google', 'Amazon', 'Facebook', 'Microsoft'],
    description: "Find the maximum path sum in a binary tree (path doesn't need to go through root).",
    examples: ['Input: [-10,9,20,null,null,15,7] → Output: 42'],
    constraints: ['1 <= nodes <= 3 * 10^4', '-1000 <= Node.val <= 1000']
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
    await DSAProblem.deleteMany({});
    console.log('🗑️  Cleared existing DSA problems');
    await DSAProblem.insertMany(problems);
    console.log(`✅ Seeded ${problems.length} DSA problems`);

    const counts = await DSAProblem.aggregate([
      { $unwind: '$topics' },
      { $group: { _id: '$topics', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    console.log('\n📊 Problems by first topic:');
    counts.forEach(c => console.log(`   ${c._id}: ${c.count}`));
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    mongoose.disconnect();
  }
}

seed();