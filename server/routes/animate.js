// server/routes/animate.js
import express from 'express';
import  verifyToken  from '../middleware/auth.js';
import  rateLimit  from '../lib/rateLimiter.js';
import { groqJSON } from '../lib/groq.js';

const router = express.Router();

// ── Known problem → vizType mapping for reliable output ──
const PROBLEM_VIZTYPE_MAP = {
  // Sorting
  'bubble sort': 'bars', 'selection sort': 'bars', 'insertion sort': 'bars',
  'merge sort': 'bars', 'quick sort': 'bars', 'heap sort': 'bars',
  // Searching
  'binary search': 'array', 'linear search': 'array',
  // Array/Two Pointer
  'two sum': 'hashmap', 'three sum': 'twoptr', '3sum': 'twoptr',
  'trapping rain water': 'twoptr', 'container with most water': 'twoptr',
  'sliding window': 'twoptr', 'longest substring': 'twoptr',
  // Stack
  'valid parentheses': 'stack', 'daily temperatures': 'stack',
  'largest rectangle': 'histogram', 'histogram': 'histogram',
  'next greater element': 'stack', 'car fleet': 'stack',
  // Matrix
  'search a 2d matrix': 'grid', 'search matrix': 'grid',
  'number of islands': 'grid', 'pacific atlantic': 'grid',
  'rotting oranges': 'grid', 'walls and gates': 'grid',
  'spiral matrix': 'grid', 'set matrix zeroes': 'grid',
  // Linked List
  'reverse linked list': 'array', 'merge two sorted': 'array',
  'linked list cycle': 'array', 'remove nth node': 'array',
  // Tree
  'inorder': 'tree', 'preorder': 'tree', 'postorder': 'tree',
  'level order': 'tree', 'binary tree': 'tree', 'bst': 'tree',
  'invert binary': 'tree', 'maximum depth': 'tree',
  // DP
  'climbing stairs': 'dp', 'house robber': 'dp', 'coin change': 'dp',
  'word break': 'dp', 'longest increasing': 'dp',
  'longest common subsequence': 'dp', 'lcs': 'dp',
  'edit distance': 'dp', 'unique paths': 'dp',
  // Greedy
  'jump game': 'twoptr', 'gas station': 'twoptr',
  // HashMap
  'group anagrams': 'hashmap', 'top k frequent': 'hashmap',
  'two sum': 'hashmap',
};

function detectVizType(input) {
  const l = input.toLowerCase();
  for (const [keyword, vizType] of Object.entries(PROBLEM_VIZTYPE_MAP)) {
    if (l.includes(keyword)) return vizType;
  }
  // Heuristic fallbacks
  if (l.includes('sort') || l.includes('array') || l.includes('subarray')) return 'bars';
  if (l.includes('tree') || l.includes('node') || l.includes('root')) return 'tree';
  if (l.includes('matrix') || l.includes('grid') || l.includes('island')) return 'grid';
  if (l.includes('dp') || l.includes('dynamic') || l.includes('memo')) return 'dp';
  if (l.includes('stack') || l.includes('parenthes') || l.includes('bracket')) return 'stack';
  if (l.includes('map') || l.includes('hash') || l.includes('dict')) return 'hashmap';
  if (l.includes('pointer') || l.includes('window') || l.includes('sliding')) return 'twoptr';
  return 'array';
}

// Build the correct step schema based on vizType
function buildStepSchema(vizType) {
  const schemas = {
    bars:      '{ arr: number[], highlight: number[], compare: number[], sorted: number[], explain: string }',
    array:     '{ arr: (number|string)[], highlight: number[], compare: number[], sorted: number[], pointers: {[name: string]: number}, mapState: {[key: string]: string}, explain: string }',
    hashmap:   '{ arr: (number|string)[], highlight: number[], compare: number[], sorted: number[], pointers: {[name: string]: number}, mapState: {[key: string]: number|string}, explain: string }',
    stack:     '{ arr: (number|string)[], highlight: number[], compare: number[], sorted: number[], pointers: {i: number}, mapState: {[index: string]: string}, explain: string }',
    twoptr:    '{ arr: (number|string)[], highlight: number[], compare: number[], sorted: number[], pointers: {L?: number, R?: number, i?: number, maxReach?: number}, mapState: {[key: string]: string|number}, explain: string }',
    dp:        '{ dpTable: number[], highlight: number[], n: number, explain: string }',
    grid:      '{ grid: number[][], activeCell: [number,number]|null, highlightCells: [number,number][], explain: string }',
    histogram: '{ bars: number[], activeBar: number, stack: number[], maxArea: number, explain: string }',
    tree:      '{ treeNodes: {id:number,val:number,left:number|null,right:number|null,x:number,y:number}[], activeNode: number|null, visitedNodes: number[], arr: number[], explain: string }',
  };
  return schemas[vizType] || schemas.array;
}

// Main animation generation route
router.post('/', verifyToken, rateLimit, async (req, res) => {
  const { input } = req.body;
  if (!input) return res.status(400).json({ error: 'input required' });

  const vizType = detectVizType(input);
  const stepSchema = buildStepSchema(vizType);

  const systemPrompt = `You are an algorithm visualization engine. Generate step-by-step animation data for the given algorithm or problem.

OUTPUT FORMAT: Return ONLY valid JSON, no markdown, no explanation outside JSON.

{
  "title": "string — clear problem name",
  "vizType": "${vizType}",
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "steps": [
    ${stepSchema}
  ],
  "conceptExplain": "string — 2-3 sentence explanation of the core insight",
  "interviewTip": "string — key thing to mention in an interview"
}

STEP RULES for vizType="${vizType}":
${vizType === 'bars'      ? '- arr: the array values at this step\n- highlight: indices being swapped\n- compare: indices being compared\n- sorted: indices in final position' : ''}
${vizType === 'array'     ? '- arr: the data values\n- pointers: object mapping pointer names to their current index\n- sorted: indices fully resolved' : ''}
${vizType === 'hashmap'   ? '- arr: the input array\n- mapState: current hashmap contents as {value: index}\n- pointers.i: current array index' : ''}
${vizType === 'stack'     ? '- arr: the input sequence\n- mapState: current stack state as {0: top, 1: next, ...}\n- highlight: current character index' : ''}
${vizType === 'twoptr'    ? '- arr: the array\n- pointers.L and pointers.R: left and right pointer indices\n- mapState: window sum, max value, etc.' : ''}
${vizType === 'dp'        ? '- dpTable: full dp array at this step (all values)\n- highlight: [current index being computed]\n- n: the problem size' : ''}
${vizType === 'grid'      ? '- grid: the FULL 2D matrix every step (same matrix, just pointer changes)\n- activeCell: [row, col] of current position\n- highlightCells: [[r,c], ...] visited cells' : ''}
${vizType === 'histogram' ? '- bars: the heights array (same every step)\n- stack: current indices in monotonic stack\n- activeBar: current bar being processed (-1 when flushing)\n- maxArea: running maximum' : ''}
${vizType === 'tree'      ? '- treeNodes: FULL tree node list every step (all nodes, same structure)\n- activeNode: id of node currently being processed\n- visitedNodes: ids of already-visited nodes\n- arr: output array so far (for inorder/traversal problems)' : ''}

Generate 6-12 steps. Each step must show ONE meaningful change. Final step must show "✅" in explain with the answer.`;

  try {
    const result = await groqJSON(
      [{ role: 'user', content: `Generate step-by-step visualization for: "${input}"` }],
      { system: systemPrompt, max_tokens: 3000 }
    );

    if (!result?.steps?.length) {
      return res.status(422).json({ error: 'No steps generated' });
    }

    // Validate steps have required fields for the vizType
    const validatedSteps = result.steps.map(step => {
      if (vizType === 'grid' && !step.grid) return null;
      if (vizType === 'histogram' && !Array.isArray(step.bars)) return null;
      if (vizType === 'dp' && !Array.isArray(step.dpTable)) return null;
      return step;
    }).filter(Boolean);

    if (validatedSteps.length < 2) {
      return res.status(422).json({ error: 'Steps validation failed — insufficient valid steps' });
    }

    res.json({ ...result, steps: validatedSteps, vizType });
  } catch (err) {
    console.error('Animate error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Text explanation fallback
router.post('/explain', verifyToken, rateLimit, async (req, res) => {
  const { input } = req.body;
  if (!input) return res.status(400).json({ error: 'input required' });

  try {
    const result = await groqJSON(
      [{ role: 'user', content: `Explain this algorithm for an interview: "${input}"` }],
      {
        system: `You are a DSA interview coach. Return ONLY JSON:
{
  "concept": "string — core idea in 2-3 sentences",
  "steps": ["step 1", "step 2", ...],
  "timeComplexity": "O(...)",
  "spaceComplexity": "O(...)",
  "interviewTip": "string"
}`,
        max_tokens: 800,
      }
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;