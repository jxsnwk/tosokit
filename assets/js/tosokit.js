// === 定数名 ===
// フォント名
let SELECTED_FONT_NAME = "魔術言語otf";

// キャンバスサイズ
const CANVAS = {
  WIDTH: 1000,
  HEIGHT: 1200,
  PADDING: 100,
  get DIAMETER() {
    return Math.min(this.WIDTH, this.HEIGHT);
  },
  get BASE_WIDTH() {
    return this.WIDTH - this.PADDING * 2;
  },
  get BASE_HEIGHT() {
    return this.HEIGHT - this.PADDING * 2;
  },
  get BASE_DIAMETER() {
    return Math.min(this.BASE_WIDTH, this.BASE_HEIGHT);
  },
};

// ピンの円サイズ,線の太さ
const PIN = {
  RADIUS: 20,
  LINE_WIDTH: 20,
};

// ピンの色
const COLORS = ["#000", "#CCC", "#000", "#FFAA00", "#228822", "#000088"];

// 50音母音対応
const VOWEL_MAP = {
  'ん': 0,
  'あ': 1, 'か': 1, 'さ': 1, 'た': 1, 'な': 1, 'は': 1, 'ま': 1, 'や': 1, 'ら': 1, 'わ': 1, 'が': 1, 'ざ': 1, 'だ': 1, 'ば': 1, 'ぱ': 1,
  'い': 2, 'き': 2, 'し': 2, 'ち': 2, 'に': 2, 'ひ': 2, 'み': 2, 'り': 2, 'ぎ': 2, 'じ': 2, 'ぢ': 2, 'び': 2, 'ぴ': 2,
  'う': 3, 'く': 3, 'す': 3, 'つ': 3, 'ぬ': 3, 'ふ': 3, 'む': 3, 'ゆ': 3, 'る': 3, 'ぐ': 3, 'ず': 3, 'づ': 3, 'ぶ': 3, 'ぷ': 3,
  'え': 4, 'け': 4, 'せ': 4, 'て': 4, 'ね': 4, 'へ': 4, 'め': 4, 'れ': 4, 'げ': 4, 'ぜ': 4, 'で': 4, 'べ': 4, 'ぺ': 4,
  'お': 5, 'こ': 5, 'そ': 5, 'と': 5, 'の': 5, 'ほ': 5, 'も': 5, 'よ': 5, 'ろ': 5, 'を': 5, 'ご': 5, 'ぞ': 5, 'ど': 5, 'ぼ': 5, 'ぽ': 5,
};

// === 初期化 ===
window.onload = async () => {
  document.getElementById("pinTextInput").addEventListener("input", () => {
    const rawText = document.getElementById("pinTextInput").value;
    document.getElementById("pinText").value = normalizeHiragana(rawText);
    console.log(rawText);
    console.log(document.getElementById("pinText").value);
  });

  // フォントの読み込みを待つ
  await document.fonts.load(`48px '${SELECTED_FONT_NAME}'`);
  await document.fonts.ready;

  // フォント読み込み後に初回描画を行う
  getCanvas();
};

// === ユーティリティ関数 ===
// ひらがなカタカナのみ有効(長音不可)
// カタカナをひらがなに変換
function normalizeHiragana(text) {
  return text
    .replace(/[^ぁ-んァ-ヶ]/g, '').replace(/ヶ/g, 'け')
    .replace(/[ァ-ヶ]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0x60))
    .replace(/ぁ/g, 'あ').replace(/ぃ/g, 'い').replace(/ぅ/g, 'う').replace(/ぇ/g, 'え').replace(/ぉ/g, 'お')
    .replace(/っ/g, 'つ').replace(/ゃ/g, 'や').replace(/ゅ/g, 'ゆ').replace(/ょ/g, 'よ').replace(/ゔ/g, 'ぶ');
}

// === メイン描画関数 ===
function getCanvas() {
  const canvas = document.getElementById('kiban');
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  let name = document.getElementById('kibanName').value.trim(); // 魔術基板名
  const text = document.getElementById('pinText').value; // ピンの文言
  if (!text.length) return;

  const kibanName = name ? `・${name}・` : '';
  const pins = generatePinInfo(text);

  drawBase(canvas, ctx);
  drawKibanText(ctx, kibanName, text);
  drawPins(ctx, text, pins);
}

// 基板土台部分の円描画
function drawBase(canvas, ctx) {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // 初期化
  const transparent = document.getElementById('bgClear').checked; // 背景透過チェック
  if (!transparent) {
    ctx.fillStyle = "#FFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height); // 初期化
  }
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 2;
  ctx.beginPath();
  // context.arc(X座標, Y座標, 半径, 描画開始角度, 描画終了角度, 反時計回り描画有無);
  ctx.arc(CANVAS.DIAMETER / 2, CANVAS.DIAMETER / 2, CANVAS.BASE_DIAMETER / 2 - 2, 0, Math.PI * 2);
  ctx.stroke();
}

// 基板名・文言の描画
async function drawKibanText(ctx, name, text) {
  let nameSize = 72;
  let textSize = 48;

  if (CANVAS.WIDTH <= nameSize * name.length) nameSize = CANVAS.WIDTH / name.length;
  if (CANVAS.WIDTH <= textSize * text.length) textSize = CANVAS.WIDTH / text.length;

  ctx.textAlign = "center";
  // 基板名の描画
  ctx.font = `${nameSize}px Arial`;
  ctx.fillStyle = "#000";
  ctx.fillText(name, CANVAS.DIAMETER / 2, CANVAS.HEIGHT - textSize - nameSize - 4 - CANVAS.PADDING / 2);

  // 文言の描画
  ctx.font = `${textSize}px ${SELECTED_FONT_NAME}`;
  ctx.fillStyle = "#622d18";
  ctx.fillText(text, CANVAS.DIAMETER / 2, CANVAS.HEIGHT - textSize - CANVAS.PADDING / 2);
}

// ピンの情報を取得
function generatePinInfo(text) {
  const mode = document.querySelector('#pinmode').pinmode.value;
  const chars = [...text];
  return mode === 'circle' ? generateCirclePins(chars) : generateLinePins(chars);
}

// 並べ方：列
function generateLinePins(chars) {
  const limit = chars.length > 10 ? 8 : 10; // 1行あたりの最大ピン数
  const adj = chars.length > 10 ? CANVAS.BASE_WIDTH / 10 * 1.5 : CANVAS.BASE_WIDTH / 10 * 0.5; // 余白微調整用
  const rows = Math.ceil(chars.length / limit); // 端数切り上げ
  const yStart = CANVAS.DIAMETER / 2 + rows / 2 * CANVAS.DIAMETER / 10; // Y軸基準（中心から全行の半分ずらす）

  const pins = [];
  let row = 1;
  for (let i = 0; i < chars.length; i++) {
    // ピンが中途半端な数の場合余白調整を入れる処理
    const xStart = (rows === row)
      ? CANVAS.BASE_WIDTH / 10 * (limit * rows - chars.length) / 2 + adj + CANVAS.PADDING
      : CANVAS.BASE_WIDTH / 10 * 1.5 + CANVAS.PADDING;

    const x = CANVAS.BASE_WIDTH / 10 * (i - limit * (row - 1)) + xStart;
    const y = yStart - CANVAS.WIDTH / 10 * (rows - row) * 1.6;

    pins.push({
      id: i,
      name: chars[i],
      boin: VOWEL_MAP[chars[i]],
      x,
      y,
    });

    if (limit * row - 1 <= i) row++;
  }
  return pins;
}

// 並べ方：円
function generateCirclePins(chars) {
  const cx = CANVAS.DIAMETER / 2;
  const cy = CANVAS.DIAMETER / 2 + CANVAS.PADDING / 4;
  const r = CANVAS.BASE_DIAMETER / 2 - CANVAS.PADDING;
  const angleOffset = Math.PI * 1.5;

  return chars.map((ch, i) => {
    const rad = i / chars.length * Math.PI * 2 + angleOffset;
    return {
      id: i,
      name: ch,
      boin: VOWEL_MAP[ch],
      x: r * Math.cos(rad) + cx,
      y: r * Math.sin(rad) + cy,
    };
  });
}

// ピンの情報
function drawPins(ctx, text, pins) {
  ctx.lineWidth = PIN.LINE_WIDTH;
  pins.forEach(pin => {
    ctx.beginPath();
    ctx.strokeStyle = COLORS[pin.boin];
    ctx.arc(pin.x, pin.y, PIN.RADIUS, 0, Math.PI * 2);
    ctx.stroke();

    ctx.font = `50px ${SELECTED_FONT_NAME}`;
    ctx.fillStyle = "#622d18";
    ctx.fillText(pin.name, pin.x, pin.y - PIN.RADIUS * 2);
  });
}

// === ダウンロード処理 ===
function downloadCanvas() {
  getCanvas();
  const canvas = document.getElementById('kiban');
  const link = document.getElementById('hiddenLink');
  link.href = canvas.toDataURL();
  document.getElementById('canvasImage').src = link.href;
  link.click();
}
