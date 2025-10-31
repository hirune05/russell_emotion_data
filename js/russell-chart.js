// ラッセルの円環モデルの感情座標（価=X座標、覚醒=Y座標）
// labelOffset: ラベルの位置調整 {dx, dy}
const emotionCoordinates = {
  'sleepy': { x: 0.01, y: -1.00, label: '眠い', labelOffset: { dx: 12, dy: 12 } },
  'tired': { x: -0.01, y: -1.00, label: '疲れた', labelOffset: { dx:-12, dy: 12 } },
  'afraid': { x: -0.12, y: 0.79, label: '恐れている', labelOffset: { dx: -28, dy: -20 } },
  'angry': { x: -0.40, y: 0.79, label: '怒った', labelOffset: { dx: -18, dy: -10 } },
  'calm': { x: 0.78, y: -0.68, label: '落ち着いた', labelOffset: { dx: 0, dy: 8 } },
  'relaxed': { x: 0.71, y: -0.65, label: 'リラックス', labelOffset: { dx: -20, dy: 5 } },
  'content': { x: 0.81, y: -0.55, label: '満足', labelOffset: { dx: 0, dy: 0 } },
  'depressed': { x: -0.81, y: -0.48, label: '落ち込んだ', labelOffset: { dx: -35, dy: 8 } },
  'discontent': { x: -0.68, y: -0.32, label: '不満', labelOffset: { dx: 10, dy: 0 } },
  'determined': { x: 0.73, y: 0.26, label: '決意した', labelOffset: { dx: 0, dy: 0 } },
  'happy': { x: 0.89, y: 0.17, label: '幸せ', labelOffset: { dx: 0, dy: 0 } },
  'anxious': { x: -0.72, y: -0.80, label: '不安', labelOffset: { dx: -20, dy: 8 } },
  'good': { x: 0.90, y: -0.08, label: '良い', labelOffset: { dx: 18, dy: 1 } },
  'pensive': { x: 0.03, y: -0.60, label: '物思いに耽る', labelOffset: { dx: -35, dy: 11 } },
  'impressed': { x: 0.39, y: -0.06, label: '感心した', labelOffset: { dx: 0, dy: 10 } },
  'frustrated': { x: -0.60, y: 0.40, label: 'イライラ', labelOffset: { dx: -28, dy: 10 } },
  'disappointed': { x: -0.80, y: -0.03, label: '失望', labelOffset: { dx: -20, dy: 0 } },
  'bored': { x: -0.35, y: -0.78, label: '退屈', labelOffset: { dx: -18, dy: 8 } },
  'annoyed': { x: -0.44, y: 0.76, label: 'うんざり', labelOffset: { dx: -28, dy: -5 } },
  'enraged': { x: -0.18, y: 0.83, label: '激怒', labelOffset: { dx: 10, dy: 20 } },
  'excited': { x: 0.70, y: 0.71, label: '興奮', labelOffset: { dx: 18, dy: -8 } },
  'melancholy': { x: -0.05, y: -0.65, label: '憂鬱', labelOffset: { dx: 20, dy: 5 } },
  'satisfied': { x: 0.77, y: -0.63, label: '満ち足りた', labelOffset: { dx: 30, dy: 3 } },
  'distressed': { x: -0.71, y: 0.55, label: '苦悩', labelOffset: { dx: -20, dy: 0 } },
  'uncomfortable': { x: -0.68, y: -0.37, label: '不快', labelOffset: { dx: 12, dy: 5 } },
  'worried': { x: -0.07, y: -0.32, label: '心配', labelOffset: { dx: -20, dy: 5 } },
  'amused': { x: 0.55, y: 0.19, label: '面白がる', labelOffset: { dx: -5, dy: 0 } },
  'apathetic': { x: -0.20, y: -0.12, label: '無関心', labelOffset: { dx: -25, dy: 0 } },
  'peaceful': { x: 0.55, y: -0.80, label: '平和', labelOffset: { dx: 0, dy: 8 } },
  'contemplative': { x: 0.58, y: -0.60, label: '瞑想的', labelOffset: { dx: 0, dy: 0 } },
  'embarrassed': { x: -0.31, y: -0.60, label: '恥ずかしい', labelOffset: { dx: -15, dy: -6 } },
  'sad': { x: -0.81, y: -0.40, label: '悲しい', labelOffset: { dx: -20, dy: 1 } },
  'hopeful': { x: 0.61, y: -0.30, label: '希望に満ちた', labelOffset: { dx: 34, dy: 1 } },
  'pleased': { x: 0.89, y: -0.10, label: '嬉しい', labelOffset: { dx: 22, dy: 6 } }
};

let russellCanvas;
let currentEmotionPoint = { x: 0, y: 0 };
let clickedGridPoint = null; // クリックされた格子点 {gridX, gridY}

// ラッセルチャート用のキャンバスを作成
function createRussellChart() {
  russellCanvas = createGraphics(450, 450);

  // キャンバスをDOMに追加
  setTimeout(() => {
    const chartHolder = document.getElementById('russell-chart-holder');
    if (chartHolder) {
      chartHolder.appendChild(russellCanvas.canvas);

      // クリックイベントを追加
      russellCanvas.canvas.addEventListener('click', handleRussellChartClick);
    }
  }, 100);
}

// ラッセルチャートのクリック処理
function handleRussellChartClick(event) {
  const rect = russellCanvas.canvas.getBoundingClientRect();

  // キャンバスのスケール比を計算
  const scaleX = russellCanvas.width / rect.width;
  const scaleY = russellCanvas.height / rect.height;

  // スケールを考慮してクリック位置を計算
  const clickX = (event.clientX - rect.left) * scaleX;
  const clickY = (event.clientY - rect.top) * scaleY;

  const centerX = russellCanvas.width / 2;
  const centerY = russellCanvas.height / 2;
  const radius = 120;

  // クリック位置を中心座標系に変換
  const relX = clickX - centerX;
  const relY = clickY - centerY;

  // グリッドのセルサイズ
  const cellSize = (radius * 2) / 10;

  // クリック位置から最も近い格子点を計算
  const nearestGridX = Math.round((relX + radius) / cellSize);
  const nearestGridY = Math.round((relY + radius) / cellSize);


  // 範囲チェックと除外エリアの判定
  // 中心の16マス（3,3）から（6,6）は除外
  const isInCenter = (nearestGridX >= 3 && nearestGridX <= 6) &&
                     (nearestGridY >= 3 && nearestGridY <= 6);

  // 4隅の3マスずつ（三角形状）を除外
  const isInCorner =
    // 左上: (0,0), (0,1), (1,0)
    (nearestGridX === 0 && nearestGridY === 0) ||
    (nearestGridX === 0 && nearestGridY === 1) ||
    (nearestGridX === 1 && nearestGridY === 0) ||
    // 右上: (10,0), (10,1), (9,0)
    (nearestGridX === 10 && nearestGridY === 0) ||
    (nearestGridX === 10 && nearestGridY === 1) ||
    (nearestGridX === 9 && nearestGridY === 0) ||
    // 左下: (0,10), (0,9), (1,10)
    (nearestGridX === 0 && nearestGridY === 10) ||
    (nearestGridX === 0 && nearestGridY === 9) ||
    (nearestGridX === 1 && nearestGridY === 10) ||
    // 右下: (10,10), (10,9), (9,10)
    (nearestGridX === 10 && nearestGridY === 10) ||
    (nearestGridX === 10 && nearestGridY === 9) ||
    (nearestGridX === 9 && nearestGridY === 10);

  if (nearestGridX >= 0 && nearestGridX <= 10 && nearestGridY >= 0 && nearestGridY <= 10 && !isInCenter && !isInCorner) {
    clickedGridPoint = { gridX: nearestGridX, gridY: nearestGridY };
  }
}

// ラッセルチャートを描画
function drawRussellChart() {
  if (!russellCanvas) return;

  russellCanvas.background(255);
  russellCanvas.push();

  const centerX = russellCanvas.width / 2;
  const centerY = russellCanvas.height / 2;
  const radius = 120;

  russellCanvas.translate(centerX, centerY);

  // グリッド線を描画（10x10の表）
  russellCanvas.stroke(200);
  russellCanvas.strokeWeight(1);

  // 縦線（11本）
  for (let i = 0; i <= 10; i++) {
    const x = -radius + (i * radius * 2) / 10;
    russellCanvas.line(x, -radius, x, radius);
  }

  // 横線（11本）
  for (let i = 0; i <= 10; i++) {
    const y = -radius + (i * radius * 2) / 10;
    russellCanvas.line(-radius, y, radius, y);
  }

  // 中心の16マス（4x4）を白で塗りつぶす
  const cellSize = (radius * 2) / 10;
  russellCanvas.fill(255);
  russellCanvas.noStroke();
  // 中心は(5, 5)のセルなので、(3,3)から(6,6)までの4x4を塗りつぶす
  const centerStartX = -radius + 3 * cellSize;
  const centerStartY = -radius + 3 * cellSize;
  const centerWidth = cellSize * 4;
  russellCanvas.rect(centerStartX, centerStartY, centerWidth, centerWidth);

  // 4隅の3マスずつ（三角形状）を白で塗りつぶす
  // 左上の3マス: (0,0), (0,1), (1,0)
  russellCanvas.rect(-radius, -radius, cellSize, cellSize);
  russellCanvas.rect(-radius, -radius + cellSize, cellSize, cellSize);
  russellCanvas.rect(-radius + cellSize, -radius, cellSize, cellSize);

  // 右上の3マス: (10,0), (10,1), (9,0)
  russellCanvas.rect(radius - cellSize, -radius, cellSize, cellSize);
  russellCanvas.rect(radius - cellSize, -radius + cellSize, cellSize, cellSize);
  russellCanvas.rect(radius - cellSize * 2, -radius, cellSize, cellSize);

  // 左下の3マス: (0,10), (0,9), (1,10)
  russellCanvas.rect(-radius, radius - cellSize, cellSize, cellSize);
  russellCanvas.rect(-radius, radius - cellSize * 2, cellSize, cellSize);
  russellCanvas.rect(-radius + cellSize, radius - cellSize, cellSize, cellSize);

  // 右下の3マス: (10,10), (10,9), (9,10)
  russellCanvas.rect(radius - cellSize, radius - cellSize, cellSize, cellSize);
  russellCanvas.rect(radius - cellSize, radius - cellSize * 2, cellSize, cellSize);
  russellCanvas.rect(radius - cellSize * 2, radius - cellSize, cellSize, cellSize);

  // 十字の軸を描画（太めに）
  russellCanvas.stroke(100);
  russellCanvas.strokeWeight(2);
  russellCanvas.line(-radius, 0, radius, 0); // X軸
  russellCanvas.line(0, -radius, 0, radius); // Y軸

  // 軸ラベル
  russellCanvas.fill(100);
  russellCanvas.noStroke();
  russellCanvas.textAlign(russellCanvas.CENTER, russellCanvas.CENTER);
  russellCanvas.textSize(14);

  // X軸ラベル（価）
  russellCanvas.text('不快', -radius - 50, -10);
  russellCanvas.textSize(18);
  russellCanvas.text('😞', -radius - 50, 10);

  russellCanvas.textSize(14);
  russellCanvas.text('快', radius + 50, -10);
  russellCanvas.textSize(18);
  russellCanvas.text('😊', radius + 50, 10);

  // Y軸ラベル（覚醒度）
  russellCanvas.push();
  russellCanvas.translate(0, -radius - 50);
  russellCanvas.textSize(14);
  russellCanvas.text('覚醒', 0, -10);
  russellCanvas.textSize(18);
  russellCanvas.text('😲', 0, 10);
  russellCanvas.pop();

  russellCanvas.push();
  russellCanvas.translate(0, radius + 50);
  russellCanvas.textSize(14);
  russellCanvas.text('沈静', 0, -10);
  russellCanvas.textSize(18);
  russellCanvas.text('😴', 0, 10);
  russellCanvas.pop();

  // 全ての感情ポイントを描画
  for (let emotion in emotionCoordinates) {
    const coord = emotionCoordinates[emotion];
    const x = coord.x * radius;
    const y = -coord.y * radius; // Y軸を反転（上が正）

    // 小さな点を描画
    russellCanvas.fill(100, 150, 255);
    russellCanvas.stroke(50, 100, 200);
    russellCanvas.strokeWeight(1);
    russellCanvas.ellipse(x, y, 6, 6);

    // ラベルの位置（手動調整したオフセットを使用）
    const labelX = x + (coord.labelOffset?.dx || 0);
    const labelY = y + (coord.labelOffset?.dy || -10);

    // ラベルを描画（小さめのフォント）
    russellCanvas.fill(80);
    russellCanvas.noStroke();
    russellCanvas.textSize(9);
    russellCanvas.textAlign(russellCanvas.CENTER, russellCanvas.CENTER);
    russellCanvas.text(coord.label, labelX, labelY);
  }


  // クリックされた格子点に赤点を表示
  if (clickedGridPoint !== null) {
    const cellSize = (radius * 2) / 10;
    const pointX = -radius + clickedGridPoint.gridX * cellSize;
    const pointY = -radius + clickedGridPoint.gridY * cellSize;

    russellCanvas.fill(255, 0, 0);
    russellCanvas.noStroke();
    russellCanvas.ellipse(pointX, pointY, 10, 10);
  }

  russellCanvas.pop();

  // 座標を表の下に表示
  if (clickedGridPoint !== null) {
    // 真ん中を(0, 0)にする
    // X座標: -5(左)から5(右)
    // Y座標: -5(下)から5(上)
    const displayX = clickedGridPoint.gridX - 5;
    const displayY = 5 - clickedGridPoint.gridY;

    russellCanvas.fill(0);
    russellCanvas.noStroke();
    russellCanvas.textAlign(russellCanvas.CENTER, russellCanvas.TOP);
    russellCanvas.textSize(16);
    russellCanvas.text(`(${displayX}, ${displayY})`, centerX, centerY + radius + 60);
  }
}

// 感情が変更されたときに呼び出す
function updateRussellChartEmotion(emotion) {
  if (emotionCoordinates[emotion]) {
    currentEmotionPoint = {
      x: emotionCoordinates[emotion].x,
      y: emotionCoordinates[emotion].y
    };
  }
}
