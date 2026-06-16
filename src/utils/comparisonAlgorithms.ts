/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const ALGO_METADATA: Record<string, {
  name: string;
  timeBest: string;
  timeAvg: string;
  timeWorst: string;
  space: string;
  desc: string;
}> = {
  bubble: {
    name: "Bubble Sort",
    timeBest: "O(N)",
    timeAvg: "O(N²)",
    timeWorst: "O(N²)",
    space: "O(1)",
    desc: "A simple comparison-based sorting algorithm. Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order."
  },
  selection: {
    name: "Selection Sort",
    timeBest: "O(N²)",
    timeAvg: "O(N²)",
    timeWorst: "O(N²)",
    space: "O(1)",
    desc: "An in-place comparison sort. Divides the input list into parts and repeatedly selects the smallest value from the unsorted partition."
  },
  insertion: {
    name: "Insertion Sort",
    timeBest: "O(N)",
    timeAvg: "O(N²)",
    timeWorst: "O(N²)",
    space: "O(1)",
    desc: "Builds the final sorted partition one element at a time by inserting each element into its correct location on the left."
  },
  quick: {
    name: "Quick Sort",
    timeBest: "O(N log N)",
    timeAvg: "O(N log N)",
    timeWorst: "O(N²)",
    space: "O(log N)",
    desc: "An efficient divide-and-conquer sort. Selects a pivot element and partitions other elements into less-than or greater-than sections."
  },
  merge: {
    name: "Merge Sort",
    timeBest: "O(N log N)",
    timeAvg: "O(N log N)",
    timeWorst: "O(N log N)",
    space: "O(N)",
    desc: "A stable recursive divide-and-conquer sort. Recursively divides segments in halves and merges them back in sorted sequence."
  },
  linear: {
    name: "Linear Search",
    timeBest: "O(1)",
    timeAvg: "O(N)",
    timeWorst: "O(N)",
    space: "O(1)",
    desc: "A simple linear scan checking elements from index 0 sequentially until the target element is spotted."
  },
  binary: {
    name: "Binary Search",
    timeBest: "O(1)",
    timeAvg: "O(log N)",
    timeWorst: "O(log N)",
    space: "O(1)",
    desc: "An incredibly fast search on sorted elements. Splices remaining ranges in halves based on mid values until the target is located."
  }
};

export interface ComparisonSnapshot {
  array: number[];
  activeIndices: number[];
  sortedIndices: number[];
  pointers: Record<string, number>;
  comparisons: number;
  swaps: number;
  log: string;
  done: boolean;
}

export const bubbleSortSnapshots = (arr: number[]): ComparisonSnapshot[] => {
  const snapshots: ComparisonSnapshot[] = [];
  const temp = [...arr];
  let comparisons = 0;
  let swaps = 0;
  const n = temp.length;

  snapshots.push({
    array: [...temp],
    activeIndices: [],
    sortedIndices: [],
    pointers: {},
    comparisons,
    swaps,
    log: "Initial unsorted array ready for Bubble Sort.",
    done: false
  });

  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      comparisons++;
      const val1 = temp[j];
      const val2 = temp[j + 1];
      const active = [j, j + 1];
      const sorted: number[] = [];
      for (let s = n - i; s < n; s++) sorted.push(s);

      let logMsg = `Comparing indices [${j}] (${val1}) and [${j + 1}] (${val2}).`;
      
      if (temp[j] > temp[j + 1]) {
        temp[j] = val2;
        temp[j + 1] = val1;
        swaps++;
        logMsg += ` Swapped: ${val1} > ${val2}.`;
      } else {
        logMsg += ` Ordered: ${val1} <= ${val2}, no swap.`;
      }

      snapshots.push({
        array: [...temp],
        activeIndices: active,
        sortedIndices: [...sorted],
        pointers: { j, i },
        comparisons,
        swaps,
        log: logMsg,
        done: false
      });
    }
  }

  snapshots.push({
    array: [...temp],
    activeIndices: [],
    sortedIndices: Array.from({ length: n }, (_, k) => k),
    pointers: {},
    comparisons,
    swaps,
    log: "Bubble Sort completed fully! 🎉",
    done: true
  });

  return snapshots;
};

export const selectionSortSnapshots = (arr: number[]): ComparisonSnapshot[] => {
  const snapshots: ComparisonSnapshot[] = [];
  const temp = [...arr];
  let comparisons = 0;
  let swaps = 0;
  const n = temp.length;

  snapshots.push({
    array: [...temp],
    activeIndices: [],
    sortedIndices: [],
    pointers: {},
    comparisons,
    swaps,
    log: "Initial unsorted array ready for Selection Sort.",
    done: false
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    snapshots.push({
      array: [...temp],
      activeIndices: [i],
      sortedIndices: Array.from({ length: i }, (_, k) => k),
      pointers: { i, minIdx },
      comparisons,
      swaps,
      log: `Starting pass. Initializing minimum element index as ${i} (${temp[i]}).`,
      done: false
    });

    for (let j = i + 1; j < n; j++) {
      comparisons++;
      const currentMinVal = temp[minIdx];
      const checkVal = temp[j];
      const isNewMin = checkVal < currentMinVal;
      let logMsg = `Checking [${j}] (${checkVal}) with min [${minIdx}] (${currentMinVal}).`;

      if (isNewMin) {
        minIdx = j;
        logMsg += ` Found smaller! New minIdx = [${j}].`;
      } else {
        logMsg += ` No change.`;
      }

      snapshots.push({
        array: [...temp],
        activeIndices: [j, minIdx],
        sortedIndices: Array.from({ length: i }, (_, k) => k),
        pointers: { i, j, minIdx },
        comparisons,
        swaps,
        log: logMsg,
        done: false
      });
    }

    if (minIdx !== i) {
      const t = temp[i];
      temp[i] = temp[minIdx];
      temp[minIdx] = t;
      swaps++;

      snapshots.push({
        array: [...temp],
        activeIndices: [i, minIdx],
        sortedIndices: Array.from({ length: i + 1 }, (_, k) => k),
        pointers: { i, minIdx },
        comparisons,
        swaps,
        log: `Swapped index [${i}] (${t}) with smallest [${minIdx}] (${temp[i]}).`,
        done: false
      });
    } else {
      snapshots.push({
        array: [...temp],
        activeIndices: [i],
        sortedIndices: Array.from({ length: i + 1 }, (_, k) => k),
        pointers: { i },
        comparisons,
        swaps,
        log: `Minimum element is already in place at position [${i}].`,
        done: false
      });
    }
  }

  snapshots.push({
    array: [...temp],
    activeIndices: [],
    sortedIndices: Array.from({ length: n }, (_, k) => k),
    pointers: {},
    comparisons,
    swaps,
    log: "Selection Sort completed fully! 🎉",
    done: true
  });

  return snapshots;
};

export const insertionSortSnapshots = (arr: number[]): ComparisonSnapshot[] => {
  const snapshots: ComparisonSnapshot[] = [];
  const temp = [...arr];
  let comparisons = 0;
  let swaps = 0;
  const n = temp.length;

  snapshots.push({
    array: [...temp],
    activeIndices: [],
    sortedIndices: [],
    pointers: {},
    comparisons,
    swaps,
    log: "Initial unsorted array ready for Insertion Sort.",
    done: false
  });

  for (let i = 1; i < n; i++) {
    const key = temp[i];
    let j = i - 1;

    snapshots.push({
      array: [...temp],
      activeIndices: [i],
      sortedIndices: Array.from({ length: i }, (_, k) => k),
      pointers: { i, j },
      comparisons,
      swaps,
      log: `Holding element ${key} at index [${i}] to insert back into its sorted location.`,
      done: false
    });

    while (j >= 0) {
      comparisons++;
      if (temp[j] > key) {
        temp[j + 1] = temp[j];
        swaps++;

        snapshots.push({
          array: [...temp],
          activeIndices: [j, j + 1],
          sortedIndices: Array.from({ length: i + 1 }, (_, k) => k).filter(x => x !== j && x !== j + 1),
          pointers: { i, j },
          comparisons,
          swaps,
          log: `Shifted [${j}] (${temp[j]}) to the right since it is larger than key ${key}.`,
          done: false
        });
        j--;
      } else {
        snapshots.push({
          array: [...temp],
          activeIndices: [j],
          sortedIndices: Array.from({ length: i }, (_, k) => k),
          pointers: { i, j },
          comparisons,
          swaps,
          log: `Stopped shifting: [${j}] (${temp[j]}) is smaller or equal to key ${key}.`,
          done: false
        });
        break;
      }
    }

    temp[j + 1] = key;
    
    snapshots.push({
      array: [...temp],
      activeIndices: [j + 1],
      sortedIndices: Array.from({ length: i + 1 }, (_, k) => k),
      pointers: { i, insertedAt: j + 1 },
      comparisons,
      swaps,
      log: `Inserted key value ${key} into index [${j + 1}].`,
      done: false
    });
  }

  snapshots.push({
    array: [...temp],
    activeIndices: [],
    sortedIndices: Array.from({ length: n }, (_, k) => k),
    pointers: {},
    comparisons,
    swaps,
    log: "Insertion Sort completed fully! 🎉",
    done: true
  });

  return snapshots;
};

export const quickSortSnapshots = (arr: number[]): ComparisonSnapshot[] => {
  const snapshots: ComparisonSnapshot[] = [];
  const temp = [...arr];
  let comparisons = 0;
  let swaps = 0;
  const n = temp.length;

  snapshots.push({
    array: [...temp],
    activeIndices: [],
    sortedIndices: [],
    pointers: {},
    comparisons,
    swaps,
    log: "Initial unsorted array ready for Quick Sort (pivot last).",
    done: false
  });

  const runQuickSort = (low: number, high: number) => {
    if (low >= high) {
      if (low === high) {
        snapshots.push({
          array: [...temp],
          activeIndices: [],
          sortedIndices: [low],
          pointers: { low, high },
          comparisons,
          swaps,
          log: `Single element at [${low}] (${temp[low]}) is sorted.`,
          done: false
        });
      }
      return;
    }

    const partition = (l: number, h: number): number => {
      const pivot = temp[h];
      let i = l - 1;

      snapshots.push({
        array: [...temp],
        activeIndices: [h],
        sortedIndices: [],
        pointers: { low: l, high: h, pivotIndex: h, i },
        comparisons,
        swaps,
        log: `Pivot set to ${pivot} at index [${h}]. Initializing partition pointer i=${i}.`,
        done: false
      });

      for (let j = l; j < h; j++) {
        comparisons++;
        let logMsg = `Comparing element [${j}] (${temp[j]}) with pivot ${pivot}.`;
        
        if (temp[j] < pivot) {
          i++;
          const t = temp[i];
          temp[i] = temp[j];
          temp[j] = t;
          swaps++;
          logMsg += ` Since ${temp[i]} < ${pivot}, increment i to ${i}, swap elements at i and j.`;
        } else {
          logMsg += ` Since ${temp[j]} >= ${pivot}, no swap.`;
        }

        snapshots.push({
          array: [...temp],
          activeIndices: [j, h],
          sortedIndices: [],
          pointers: { low: l, high: h, pivotIndex: h, i, j },
          comparisons,
          swaps,
          log: logMsg,
          done: false
        });
      }

      const t = temp[i + 1];
      temp[i + 1] = temp[h];
      temp[h] = t;
      swaps++;

      snapshots.push({
        array: [...temp],
        activeIndices: [i + 1, h],
        sortedIndices: [],
        pointers: { low: l, high: h, pivotIndex: i + 1, i: i + 1 },
        comparisons,
        swaps,
        log: `Partition done. Swap pivot ${pivot} with [${i + 1}] (${temp[h]}). Pivot is now sorted.`,
        done: false
      });

      return i + 1;
    };

    const pIdx = partition(low, high);
    runQuickSort(low, pIdx - 1);
    runQuickSort(pIdx + 1, high);
  };

  runQuickSort(0, n - 1);

  snapshots.push({
    array: [...temp],
    activeIndices: [],
    sortedIndices: Array.from({ length: n }, (_, k) => k),
    pointers: {},
    comparisons,
    swaps,
    log: "Quick Sort completed fully! 🎉",
    done: true
  });

  return snapshots;
};

export const mergeSortSnapshots = (arr: number[]): ComparisonSnapshot[] => {
  const snapshots: ComparisonSnapshot[] = [];
  const temp = [...arr];
  let comparisons = 0;
  let swaps = 0;
  const n = temp.length;

  snapshots.push({
    array: [...temp],
    activeIndices: [],
    sortedIndices: [],
    pointers: {},
    comparisons,
    swaps,
    log: "Initial unsorted array ready for Merge Sort.",
    done: false
  });

  const merge = (l: number, m: number, r: number) => {
    const n1 = m - l + 1;
    const n2 = r - m;
    const L = temp.slice(l, m + 1);
    const R = temp.slice(m + 1, r + 1);

    snapshots.push({
      array: [...temp],
      activeIndices: Array.from({ length: r - l + 1 }, (_, idx) => l + idx),
      sortedIndices: [],
      pointers: { leftBound: l, mid: m, rightBound: r },
      comparisons,
      swaps,
      log: `Splice segments to partition: [${l}...${m}] (${L.join(", ")}) and [${m + 1}...${r}] (${R.join(", ")}).`,
      done: false
    });

    let i = 0, j = 0, k = l;

    while (i < n1 && j < n2) {
      comparisons++;
      let logMsg = `Comparing left element ${L[i]} with right element ${R[j]}.`;
      
      if (L[i] <= R[j]) {
        temp[k] = L[i];
        swaps++;
        logMsg += ` Place ${L[i]} in merged index [${k}].`;
        i++;
      } else {
        temp[k] = R[j];
        swaps++;
        logMsg += ` Place ${R[j]} in merged index [${k}].`;
        j++;
      }

      snapshots.push({
        array: [...temp],
        activeIndices: [k],
        sortedIndices: [],
        pointers: { leftBound: l, mid: m, rightBound: r, k, activeMergeL: l + i, activeMergeR: m + 1 + j },
        comparisons,
        swaps,
        log: logMsg,
        done: false
      });
      k++;
    }

    while (i < n1) {
      temp[k] = L[i];
      swaps++;
      snapshots.push({
        array: [...temp],
        activeIndices: [k],
        sortedIndices: [],
        pointers: { leftBound: l, mid: m, rightBound: r, k },
        comparisons,
        swaps,
        log: `Append remainder from left subset: ${L[i]} to index [${k}].`,
        done: false
      });
      i++;
      k++;
    }

    while (j < n2) {
      temp[k] = R[j];
      swaps++;
      snapshots.push({
        array: [...temp],
        activeIndices: [k],
        sortedIndices: [],
        pointers: { leftBound: l, mid: m, rightBound: r, k },
        comparisons,
        swaps,
        log: `Append remainder from right subset: ${R[j]} to index [${k}].`,
        done: false
      });
      j++;
      k++;
    }
  };

  const runMergeSort = (l: number, r: number) => {
    if (l < r) {
      const m = Math.floor((l + r) / 2);
      runMergeSort(l, m);
      runMergeSort(m + 1, r);
      merge(l, m, r);
    }
  };

  runMergeSort(0, n - 1);

  snapshots.push({
    array: [...temp],
    activeIndices: [],
    sortedIndices: Array.from({ length: n }, (_, k) => k),
    pointers: {},
    comparisons,
    swaps,
    log: "Merge Sort completed fully! 🎉",
    done: true
  });

  return snapshots;
};

export const linearSearchSnapshots = (arr: number[], target: number): ComparisonSnapshot[] => {
  const snapshots: ComparisonSnapshot[] = [];
  let comparisons = 0;
  const n = arr.length;

  snapshots.push({
    array: [...arr],
    activeIndices: [],
    sortedIndices: [],
    pointers: {},
    comparisons,
    swaps: 0,
    log: `Starting Linear Search to seek target element ${target}.`,
    done: false
  });

  let found = false;
  for (let i = 0; i < n; i++) {
    comparisons++;
    let logMsg = `Checking [${i}] (${arr[i]}).`;
    const active = [i];

    if (arr[i] === target) {
      logMsg += ` Found match! ${arr[i]} === ${target}. 🎯`;
      found = true;
      snapshots.push({
        array: [...arr],
        activeIndices: active,
        sortedIndices: [i],
        pointers: { i },
        comparisons,
        swaps: 0,
        log: logMsg,
        done: true
      });
      break;
    } else {
      logMsg += ` No match.`;
      snapshots.push({
        array: [...arr],
        activeIndices: active,
        sortedIndices: [],
        pointers: { i },
        comparisons,
        swaps: 0,
        log: logMsg,
        done: false
      });
    }
  }

  if (!found) {
    snapshots.push({
      array: [...arr],
      activeIndices: [],
      sortedIndices: [],
      pointers: {},
      comparisons,
      swaps: 0,
      log: `Finished: target element ${target} not found inside scope.`,
      done: true
    });
  }

  return snapshots;
};

export const binarySearchSnapshots = (arr: number[], target: number): ComparisonSnapshot[] => {
  const snapshots: ComparisonSnapshot[] = [];
  let comparisons = 0;
  const sortedArr = [...arr].sort((a, b) => a - b);

  snapshots.push({
    array: [...sortedArr],
    activeIndices: [],
    sortedIndices: [],
    pointers: {},
    comparisons,
    swaps: 0,
    log: `Starting Binary Search for target ${target} (using sorted elements).`,
    done: false
  });

  let low = 0;
  let high = sortedArr.length - 1;
  let found = false;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midVal = sortedArr[mid];
    comparisons++;
    let logMsg = `Range [${low}...${high}]. midIdx=[${mid}] (${midVal}).`;

    snapshots.push({
      array: [...sortedArr],
      activeIndices: [mid],
      sortedIndices: [],
      pointers: { low, high, mid },
      comparisons,
      swaps: 0,
      log: `${logMsg} Compare mid element ${midVal} with target ${target}.`,
      done: false
    });

    if (midVal === target) {
      logMsg += ` Match found! ${midVal} === ${target} at midIdx [${mid}]. 🎯`;
      snapshots.push({
        array: [...sortedArr],
        activeIndices: [mid],
        sortedIndices: [mid],
        pointers: { low, high, mid },
        comparisons,
        swaps: 0,
        log: logMsg,
        done: true
      });
      found = true;
      break;
    } else if (midVal < target) {
      low = mid + 1;
      snapshots.push({
        array: [...sortedArr],
        activeIndices: [],
        sortedIndices: [],
        pointers: { low, high },
        comparisons,
        swaps: 0,
        log: `Since ${midVal} < target (${target}), search right division. Set low = mid + 1 = ${low}.`,
        done: false
      });
    } else {
      high = mid - 1;
      snapshots.push({
        array: [...sortedArr],
        activeIndices: [],
        sortedIndices: [],
        pointers: { low, high },
        comparisons,
        swaps: 0,
        log: `Since ${midVal} > target (${target}), search left division. Set high = mid - 1 = ${high}.`,
        done: false
      });
    }
  }

  if (!found) {
    snapshots.push({
      array: [...sortedArr],
      activeIndices: [],
      sortedIndices: [],
      pointers: {},
      comparisons,
      swaps: 0,
      log: `Finished: target element ${target} not found inside bounds.`,
      done: true
    });
  }

  return snapshots;
};
