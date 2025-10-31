// ラッセルの円環モデルの感情座標（価=X座標、覚醒=Y座標）
// labelOffset: ラベルの位置調整 {dx, dy}
const emotionCoordinates = {
  'sleepy': { x: 0.01, y: -1.00, label: 'sleepy', labelOffset: { dx: 0, dy: 12 } },
  'tired': { x: -0.01, y: -1.00, label: 'tired', labelOffset: { dx: 0, dy: 12 } },
  'afraid': { x: -0.12, y: 0.79, label: 'afraid', labelOffset: { dx: -20, dy: 0 } },
  'angry': { x: -0.40, y: 0.79, label: 'angry', labelOffset: { dx: -18, dy: -3 } },
  'calm': { x: 0.78, y: -0.68, label: 'calm', labelOffset: { dx: 18, dy: 8 } },
  'relaxed': { x: 0.71, y: -0.65, label: 'relaxed', labelOffset: { dx: 25, dy: 5 } },
  'content': { x: 0.81, y: -0.55, label: 'content', labelOffset: { dx: 25, dy: 5 } },
  'depressed': { x: -0.81, y: -0.48, label: 'depressed', labelOffset: { dx: -35, dy: 0 } },
  'discontent': { x: -0.68, y: -0.32, label: 'discontent', labelOffset: { dx: -35, dy: 0 } },
  'determined': { x: 0.73, y: 0.26, label: 'determined', labelOffset: { dx: 35, dy: 0 } },
  'happy': { x: 0.89, y: 0.17, label: 'happy', labelOffset: { dx: 25, dy: 0 } },
  'anxious': { x: -0.72, y: -0.80, label: 'anxious', labelOffset: { dx: -25, dy: 8 } },
  'good': { x: 0.90, y: -0.08, label: 'good', labelOffset: { dx: 20, dy: 0 } },
  'pensive': { x: 0.03, y: -0.60, label: 'pensive', labelOffset: { dx: 0, dy: 10 } },
  'impressed': { x: 0.39, y: -0.06, label: 'impressed', labelOffset: { dx: 30, dy: 0 } },
  'frustrated': { x: -0.60, y: 0.40, label: 'frustrated', labelOffset: { dx: -35, dy: 0 } },
  'disappointed': { x: -0.80, y: -0.03, label: 'disappointed', labelOffset: { dx: -42, dy: 0 } },
  'bored': { x: -0.35, y: -0.78, label: 'bored', labelOffset: { dx: -18, dy: 8 } },
  'annoyed': { x: -0.44, y: 0.76, label: 'annoyed', labelOffset: { dx: -25, dy: -5 } },
  'enraged': { x: -0.18, y: 0.83, label: 'enraged', labelOffset: { dx: 0, dy: -10 } },
  'excited': { x: 0.70, y: 0.71, label: 'excited', labelOffset: { dx: 20, dy: -8 } },
  'melancholy': { x: -0.05, y: -0.65, label: 'melancholy', labelOffset: { dx: -35, dy: 5 } },
  'satisfied': { x: 0.77, y: -0.63, label: 'satisfied', labelOffset: { dx: 30, dy: 5 } },
  'distressed': { x: -0.71, y: 0.55, label: 'distressed', labelOffset: { dx: -35, dy: 0 } },
  'uncomfortable': { x: -0.68, y: -0.37, label: 'uncomfortable', labelOffset: { dx: -45, dy: 0 } },
  'worried': { x: -0.07, y: -0.32, label: 'worried', labelOffset: { dx: -28, dy: 5 } },
  'amused': { x: 0.55, y: 0.19, label: 'amused', labelOffset: { dx: 25, dy: 0 } },
  'apathetic': { x: -0.20, y: -0.12, label: 'apathetic', labelOffset: { dx: -30, dy: 0 } },
  'peaceful': { x: 0.55, y: -0.80, label: 'peaceful', labelOffset: { dx: 25, dy: 8 } },
  'contemplative': { x: 0.58, y: -0.60, label: 'contemplative', labelOffset: { dx: 45, dy: 0 } },
  'embarrassed': { x: -0.31, y: -0.60, label: 'embarrassed', labelOffset: { dx: -38, dy: 5 } },
  'sad': { x: -0.81, y: -0.40, label: 'sad', labelOffset: { dx: -18, dy: 0 } },
  'hopeful': { x: 0.61, y: -0.30, label: 'hopeful', labelOffset: { dx: 28, dy: 0 } },
  'pleased': { x: 0.89, y: -0.10, label: 'pleased', labelOffset: { dx: 25, dy: 0 } }
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


  // 範囲チェック
  if (nearestGridX >= 0 && nearestGridX <= 10 && nearestGridY >= 0 && nearestGridY <= 10) {
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
  russellCanvas.text('不快', -radius - 50, 0);
  russellCanvas.text('快', radius + 50, 0);

  // Y軸ラベル（覚醒度）
  russellCanvas.push();
  russellCanvas.translate(0, -radius - 50);
  russellCanvas.text('覚醒', 0, 0);
  russellCanvas.pop();

  russellCanvas.push();
  russellCanvas.translate(0, radius + 50);
  russellCanvas.text('沈静', 0, 0);
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

  // 現在のポイントを示すマーカー（実行後の位置）
  if (rightAnimationActive || savedEmotions.has(currentEmotion)) {
    const x = currentEmotionPoint.x * radius;
    const y = -currentEmotionPoint.y * radius;

    russellCanvas.noFill();
    russellCanvas.stroke(255, 100, 0);
    russellCanvas.strokeWeight(3);
    russellCanvas.ellipse(x, y, 24, 24);
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
