// UI制御関数

// アニメーション用の変数
let animationStartTime = null;
let animationDuration = 1000; // 1秒（デフォルト）
let animationActive = false;
let startParams = {};
let targetParams = {};

function setEmotion(emotionName) {
  // 保存済みの感情は選択できないようにする
  if (window.savedEmotions && window.savedEmotions.has(emotionName)) {
    return;
  }
  
  if (emotions[emotionName]) {
    // 現在の感情を更新
    currentEmotion = emotionName;
    
    // パラメータを即座に変更（アニメーションなし）
    Object.assign(faceParams, emotions[emotionName]);
  }
  
  // 感情の説明を表示
  const descriptionDiv = document.getElementById('emotion-description');
  if (emotionDescriptions[emotionName]) {
    descriptionDiv.textContent = emotionDescriptions[emotionName];
  } else {
    descriptionDiv.textContent = "感情を選択してください";
  }
  
  // ボタンのアクティブ状態を更新
  const allButtons = document.querySelectorAll('.emotion-btn');
  allButtons.forEach(btn => btn.classList.remove('active'));
  
  // クリックされたボタンを探してアクティブにする
  allButtons.forEach(btn => {
    if (btn.getAttribute('onclick').includes(emotionName)) {
      btn.classList.add('active');
    }
  });
}

// パラメータとdurationを指定してアニメーションする関数
function animateToEmotion(params, duration = 0.5) {
  // 現在のパラメータを開始値として保存
  startParams = { ...faceParams };
  
  // 目標のパラメータを設定
  targetParams = params;
  
  // アニメーション時間を設定（秒をミリ秒に変換）
  animationDuration = duration * 1000;
  
  // アニメーション開始
  animationStartTime = millis();
  animationActive = true;
}

// window.animateToEmotionとして公開
window.animateToEmotion = animateToEmotion;

// アニメーション更新関数（draw関数から呼び出される）
function updateAnimation() {
  if (!animationActive) return;
  
  const currentTime = millis();
  const elapsed = currentTime - animationStartTime;
  const progress = Math.min(elapsed / animationDuration, 1);
  
  // イージング関数（ease-in-out）
  const easeProgress = progress < 0.5 
    ? 2 * progress * progress 
    : 1 - Math.pow(-2 * progress + 2, 2) / 2;
  
  // 各パラメータを補間
  for (let key in targetParams) {
    if (startParams[key] !== undefined) {
      // 線形補間
      faceParams[key] = lerp(startParams[key], targetParams[key], easeProgress);
    }
  }
  
  // アニメーション終了判定
  if (progress >= 1) {
    animationActive = false;
  }
}

