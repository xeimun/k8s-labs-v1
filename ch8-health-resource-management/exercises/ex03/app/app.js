const express = require('express');
const app = express();
const PORT = 8080;
const STARTUP_DELAY = 60000; // 60초 (1분) 딜레이

let isReady = false;

console.log(`Application starting... This will take ${STARTUP_DELAY / 1000} seconds.`);
console.log("Simulating loading large models or warming up a cache...");

// 시작 시 60초 동안 "준비 중" 상태를 시뮬레이션
setTimeout(() => {
  isReady = true;
  console.log("✅ Application is now ready!");
}, STARTUP_DELAY);

app.get('/', (req, res) => {
  res.status(200).send(`Welcome! Application is running. Served by ${process.env.HOSTNAME}`);
});

// 모든 Probe가 공통으로 사용할 헬스 체크 엔드포인트
app.get('/healthz', (req, res) => {
  if (isReady) {
    // 준비가 끝나면 정상 응답
    console.log("Health check: OK");
    res.status(200).send('OK');
  } else {
    // 아직 준비 중이면 에러 응답
    console.log("Health check: Not Ready Yet...");
    res.status(503).send('Not Ready');
  }
});

app.listen(PORT, () => {
  console.log(`Very-slow-starting app listening on port ${PORT}`);
});