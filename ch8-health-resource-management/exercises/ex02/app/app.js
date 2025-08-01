const express = require('express');
const app = express();
const PORT = 8080;

let isReady = false;

// 시작 시 15초 동안 "준비 중" 상태를 시뮬레이션
console.log("Application starting... It will be ready in 15 seconds.");
setTimeout(() => {
  isReady = true;
  console.log("Application is now ready to accept traffic!");
}, 15000); // 15초 딜레이

app.get('/', (req, res) => {
  // isReady 플래그를 확인하여 준비되었을 때만 정상 응답
  if (isReady) {
    res.status(200).send(`Welcome version 2 ! The application is ready. Served by ${process.env.HOSTNAME}`);
  } else {
    // 준비되지 않았을 때 503 Service Unavailable 에러 반환
    res.status(503).send('Service is not ready yet.');
  }
});

// Readiness Probe가 사용할 헬스 체크 엔드포인트
app.get('/healthz', (req, res) => {
  if (isReady) {
    res.status(200).send('OK');
  } else {
    // 아직 준비 안 됨
    res.status(503).send('Not Ready');
  }
});

app.listen(PORT, () => {
  console.log(`Slow-starting app listening on port ${PORT}`);
});