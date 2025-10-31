// キャンバスの作成
let animatedCanvas;
let canvasCreated = false;
let currentEmotion = 'normal'; // 現在選択されている感情
let savedEmotions = new Set(); // 保存済みの感情を記録


function setup() {
  // メインキャンバスを非表示で作成
  let mainCanvas = createCanvas(1, 1);
  mainCanvas.hide();

  // アニメーション顔のキャンバス
  animatedCanvas = createGraphics(540, 360);

  // ラッセルチャートを作成
  createRussellChart();

  // UIイベントリスナーの設定
  setupUIListeners();

  // 初期化処理
  setTimeout(() => {
    // ユニークな被験者IDを生成
    generateUniqueSubjectId();
  }, 200);

  // キャンバスをDOMに追加
  setTimeout(() => {
    // アニメーションキャンバスを左側に配置
    let animatedHolder = document.getElementById('animated-canvas-holder');
    animatedHolder.appendChild(animatedCanvas.canvas);

    canvasCreated = true;
  }, 100);
}

function draw() {
  if (!canvasCreated) return;

  // ラッセルチャートを描画
  drawRussellChart();

  // アニメーション顔を描画
  drawAnimatedFace();
}


// 次の未保存の感情に移動
function moveToNextUnsavedEmotion() {
  // HTMLのボタン順序と一致させる
  const emotionOrder = ['normal', 'surprise', 'anger', 'joy', 'sleepy', 'sad'];
  
  // 現在の感情のインデックスを取得
  const currentIndex = emotionOrder.indexOf(currentEmotion);
  
  // 次の未保存の感情を探す
  for (let i = 1; i <= emotionOrder.length; i++) {
    const nextIndex = (currentIndex + i) % emotionOrder.length;
    const nextEmotion = emotionOrder[nextIndex];
    
    if (!savedEmotions.has(nextEmotion)) {
      setEmotion(nextEmotion);
      break;
    }
  }
  
  // すべて保存済みの場合
  if (savedEmotions.size === emotionOrder.length) {
    alert('すべての感情のデータを保存しました！');
  }
}

// 保存済みボタンの状態を更新
function updateSavedButtonStates() {
  const allButtons = document.querySelectorAll('.emotion-btn');
  allButtons.forEach(btn => {
    const emotionName = btn.getAttribute('onclick').match(/setEmotion\('(\w+)'\)/)[1];
    if (savedEmotions.has(emotionName)) {
      btn.classList.add('saved');
      btn.disabled = true;
    }
  });
}

// ユニークな被験者IDを生成
function generateUniqueSubjectId() {
  // UUID v4を生成する関数
  function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
  
  // UUID形式のIDを生成
  const subjectId = generateUUID();
  
  // 入力フィールドに設定
  document.getElementById('subject-id').value = subjectId;
  
  // 読み取り専用にする（ユーザーが変更できないように）
  document.getElementById('subject-id').readOnly = true;
}

// アニメーション顔を描画
function drawAnimatedFace() {
  animatedCanvas.background(255, 235, 250);
  animatedCanvas.push();
  animatedCanvas.translate(animatedCanvas.width / 2, animatedCanvas.height / 2);
  
  // アニメーションを更新
  updateAnimation();
  
  // 描画コンテキストをアニメーションキャンバスに設定
  let originalCtx = setupContext(animatedCanvas);
  
  // 目を描画
  drawEyes();
  
  // 口を描画
  drawMouth();
  
  // コンテキストを復元
  restoreContext(originalCtx);
  
  animatedCanvas.pop();
}

// 保存ボタンの処理
function saveAction() {
  // 被験者IDを取得
  const subjectId = document.getElementById('subject-id').value.trim();

  if (!subjectId) {
    alert('被験者IDを入力してください。');
    return;
  }

  // 日本時間でタイムスタンプを生成
  const now = new Date();
  const jstOffset = 9 * 60; // JST is UTC+9
  const jstTime = new Date(now.getTime() + jstOffset * 60 * 1000);

  // YYYY-MM-DD HH:MM:SS.mmm形式でフォーマット
  const timestamp = jstTime.toISOString().replace('T', ' ').replace('Z', '');

  // クリックされた座標を取得（クリックされていない場合はnull）
  let coordX = null;
  let coordY = null;
  if (clickedGridPoint !== null) {
    coordX = clickedGridPoint.gridX - 5; // 真ん中を0にする
    coordY = 5 - clickedGridPoint.gridY; // 真ん中を0にする
  }

  // 保存するデータの作成
  const data = {
    subject_id: subjectId,
    timestamp: timestamp,
    x_coordinate: coordX,
    y_coordinate: coordY,
    eyeOpenness: faceParams.eyeOpenness,
    pupilSize: faceParams.pupilSize,
    pupilAngle: faceParams.pupilAngle,
    upperEyelidAngle: faceParams.upperEyelidAngle,
    upperEyelidCoverage: faceParams.upperEyelidCoverage,
    lowerEyelidCoverage: faceParams.lowerEyelidCoverage,
    mouthCurve: faceParams.mouthCurve,
    mouthHeight: faceParams.mouthHeight,
    mouthWidth: faceParams.mouthWidth
  };

  // サーバーにデータを送信
  fetch('http://localhost:3000/save-emotion-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(result => {
    if (result.success) {
      alert('データを保存しました。');
    } else {
      alert('保存エラー: ' + result.message);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('サーバーへの接続エラー。サーバーが起動していることを確認してください。');
  });
}


// コンテキストを設定
function setupContext(canvas) {
  const original = {
    push: window.push,
    pop: window.pop,
    translate: window.translate,
    fill: window.fill,
    stroke: window.stroke,
    strokeWeight: window.strokeWeight,
    ellipse: window.ellipse,
    arc: window.arc,
    rotate: window.rotate,
    radians: window.radians,
    rect: window.rect,
    line: window.line,
    noFill: window.noFill,
    noStroke: window.noStroke,
    beginShape: window.beginShape,
    vertex: window.vertex,
    endShape: window.endShape,
    curveVertex: window.curveVertex,
    width: window.width,
    height: window.height,
    drawingContext: window.drawingContext,
    abs: window.abs,
    asin: window.asin,
    cos: window.cos,
    sin: window.sin,
    PI: window.PI,
    TWO_PI: window.TWO_PI,
    CLOSE: window.CLOSE
  };
  
  // キャンバスの関数に置き換え
  window.push = () => canvas.push();
  window.pop = () => canvas.pop();
  window.translate = (x, y) => canvas.translate(x, y);
  window.fill = (...args) => canvas.fill(...args);
  window.stroke = (...args) => canvas.stroke(...args);
  window.strokeWeight = (w) => canvas.strokeWeight(w);
  window.ellipse = (x, y, w, h) => canvas.ellipse(x, y, w, h);
  window.arc = (x, y, w, h, start, stop, mode) => canvas.arc(x, y, w, h, start, stop, mode);
  window.rotate = (angle) => canvas.rotate(angle);
  window.radians = (degrees) => canvas.radians(degrees);
  window.rect = (x, y, w, h) => canvas.rect(x, y, w, h);
  window.line = (x1, y1, x2, y2) => canvas.line(x1, y1, x2, y2);
  window.noFill = () => canvas.noFill();
  window.noStroke = () => canvas.noStroke();
  window.beginShape = () => canvas.beginShape();
  window.vertex = (x, y) => canvas.vertex(x, y);
  window.endShape = (mode) => canvas.endShape(mode);
  window.curveVertex = (x, y) => canvas.curveVertex(x, y);
  window.width = canvas.width;
  window.height = canvas.height;
  window.drawingContext = canvas.canvas.getContext('2d');
  
  return original;
}

// コンテキストを復元
function restoreContext(original) {
  Object.keys(original).forEach(key => {
    window[key] = original[key];
  });
}

// パラメータをランダムに設定
function randomizeParameters() {
  // 目関連のパラメータ
  // 目の開き具合は50%の確率で1付近、50%で0.15付近
  const eyeOpenness = Math.random() < 0.5
    ? 0.85 + Math.random() * 0.15  // 0.85-1.0 (1に近い)
    : 0.15 + Math.random() * 0.15; // 0.15-0.3 (0.15に近い)
  const pupilSize = Math.random() * 0.7 + 0.3; // 0.3-1.0
  // 瞳の角度は50%の確率で0、それ以外は-30 to 30のランダム
  const pupilAngle = Math.random() < 0.5 ? 0 : Math.random() * 60 - 30;
  const upperEyelidAngle = Math.random() * 60 - 30; // -30 to 30
  // 上瞼は40%の確率で0、それ以外はランダム
  const upperEyelidCoverage = Math.random() < 0.4 ? 0 : Math.random() * 0.3;
  // 下瞼は50%の確率で0、それ以外は0-0.2のランダム
  const lowerEyelidCoverage = Math.random() < 0.5 ? 0 : Math.random() * 0.2;

  // 口関連のパラメータ
  const mouthCurve = Math.random() * 58 - 18; // -18 to 40
  const mouthHeight = Math.random() * 3; // 0-3
  const mouthWidth = Math.random() * 3.5 + 0.5; // 0.5-4

  // UIを更新
  document.getElementById('eyeOpenness').value = eyeOpenness;
  document.getElementById('eyeOpennessValue').textContent = eyeOpenness.toFixed(2);

  document.getElementById('pupilSize').value = pupilSize;
  document.getElementById('pupilSizeValue').textContent = pupilSize.toFixed(2);

  document.getElementById('pupilAngle').value = pupilAngle;
  document.getElementById('pupilAngleValue').textContent = Math.round(pupilAngle);

  document.getElementById('upperEyelidAngle').value = upperEyelidAngle;
  document.getElementById('upperEyelidAngleValue').textContent = Math.round(upperEyelidAngle);

  document.getElementById('upperEyelidCoverage').value = upperEyelidCoverage;
  document.getElementById('upperEyelidCoverageValue').textContent = upperEyelidCoverage.toFixed(2);

  document.getElementById('lowerEyelidCoverage').value = lowerEyelidCoverage;
  document.getElementById('lowerEyelidCoverageValue').textContent = lowerEyelidCoverage.toFixed(2);

  document.getElementById('mouthCurve').value = mouthCurve;
  document.getElementById('mouthCurveValue').textContent = Math.round(mouthCurve);

  document.getElementById('mouthHeight').value = mouthHeight;
  document.getElementById('mouthHeightValue').textContent = mouthHeight.toFixed(2);

  document.getElementById('mouthWidth').value = mouthWidth;
  document.getElementById('mouthWidthValue').textContent = mouthWidth.toFixed(2);

  // faceParamsを更新
  faceParams.eyeOpenness = eyeOpenness;
  faceParams.pupilSize = pupilSize;
  faceParams.pupilAngle = pupilAngle;
  faceParams.upperEyelidAngle = upperEyelidAngle;
  faceParams.upperEyelidCoverage = upperEyelidCoverage;
  faceParams.lowerEyelidCoverage = lowerEyelidCoverage;
  faceParams.mouthCurve = mouthCurve;
  faceParams.mouthHeight = mouthHeight;
  faceParams.mouthWidth = mouthWidth;
}