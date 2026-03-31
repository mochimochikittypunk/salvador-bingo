// src/utils/bingoLogic.ts

// 1. 各商品の名前と価格データ
const topItems = [
  { name: 'エチオピア', price: 1500 },
  { name: 'ケニア', price: 1920 },
  { name: 'ルワンダ', price: 1380 }
];
const midItems = [
  { name: 'ブレンド', price: 990 },
  { name: 'ゲイシャ', price: 1480 },
  { name: 'ディカフェ', price: 1380 }
];
const botItems = [
  { name: 'コロンビア', price: 1584 },
  { name: 'メキシコ', price: 1800 },
  { name: 'エルサルバドル', price: 1760 }
];

// 3要素の全ての並び順（6通り）を生成する関数
function getPermutations(arr: {name: string, price: number}[]) {
  return [
    [arr[0], arr[1], arr[2]], [arr[0], arr[2], arr[1]],
    [arr[1], arr[0], arr[2]], [arr[1], arr[2], arr[0]],
    [arr[2], arr[0], arr[1]], [arr[2], arr[1], arr[0]]
  ];
}

// 2. シード値を用いた疑似乱数生成器
function cyrb128(str: string) {
  let h1 = 1779033703, h2 = 3144134277,
      h3 = 1013904242, h4 = 2773480762;
  for (let i = 0, k; i < str.length; i++) {
      k = str.charCodeAt(i);
      h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
      h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
      h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
      h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
  }
  h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
  h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
  h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
  h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
  h1 ^= (h2 ^ h3 ^ h4), h2 ^= h1, h3 ^= h1, h4 ^= h1;
  return [h1>>>0, h2>>>0, h3>>>0, h4>>>0];
}

function mulberry32(a: number) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}

// 3. 216通りの盤面から、最も「ビンゴした時の金額の偏り」が少ないものを探す関数
export function getOptimizedBoard(seedString: string): string[] {
  const topPerms = getPermutations(topItems);
  const midPerms = getPermutations(midItems);
  const botPerms = getPermutations(botItems);

  let evaluatedBoards = [];

  for (let t of topPerms) {
    for (let m of midPerms) {
      for (let b of botPerms) {
        const variableLines = [
          t[0].price + m[0].price + b[0].price, // 縦1
          t[1].price + m[1].price + b[1].price, // 縦2
          t[2].price + m[2].price + b[2].price, // 縦3
          t[0].price + m[1].price + b[2].price, // 斜め1
          t[2].price + m[1].price + b[0].price  // 斜め2
        ];

        const mean = variableLines.reduce((acc, val) => acc + val, 0) / 5;
        const variance = variableLines.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / 5;

        evaluatedBoards.push({
          board: [...t, ...m, ...b].map(item => item.name),
          variance: variance
        });
      }
    }
  }

  evaluatedBoards.sort((a, b) => a.variance - b.variance);

  // 指定された合言葉をシード値としてPRNGを初期化
  const seed = cyrb128(seedString);
  const rand = mulberry32(seed[0]);

  // 上位5パターンから、シード付き乱数を使って固定の1パターンを選択
  const randomIndex = Math.floor(rand() * 5);
  return evaluatedBoards[randomIndex].board;
}

// 4. ビンゴとリーチの判定
export const winningLines = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

export function checkGameStatus(markedState: boolean[]) {
  let isReach = false;
  let isBingo = false;
  let bingoCount = 0;

  for (const line of winningLines) {
    let markCount = 0;
    for (const index of line) {
      if (markedState[index]) markCount++;
    }
    if (markCount === 3) {
      isBingo = true;
      bingoCount++;
    } else if (markCount === 2) {
      isReach = true;
    }
  }

  return { isReach, isBingo, bingoCount };
}
