const express = require("express");
const app = express();
const PORT = 8080;

let requestCount = 0;

// 동기적으로 CPU를 점유하여 블로킹을 시뮬레이션하는 함수
function sleep(seconds) {
  const waitUntil = new Date().getTime() + seconds * 1000;
  while (new Date().getTime() < waitUntil) {}
}

app.get("/", (req, res) => {
  requestCount++;

  // 5번째 요청마다 30초 동안 서버 전체를 멈추게 하는 버그
  if (requestCount % 5 === 0) {
    console.log(
      `Request #${requestCount}: Simulating a bug... blocking for 30 seconds.`
    );
    sleep(30);
    return res
      .status(200)
      .send(`Request #${requestCount}: Finally responding after a long delay!`);
  }

  console.log(`Request #${requestCount}: Responding normally.`);
  res
    .status(200)
    .send(
      `Hello from the buggy Node.js app! This is request #${requestCount}.`
    );
});

// Liveness Probe가 사용할 헬스 체크 엔드포인트
app.get("/healthz", (req, res) => {
  // 이 경로는 블로킹 로직의 영향을 받지 않아야 하지만,
  // 위 'sleep' 함수가 이벤트 루프 자체를 막으므로 실제로는 함께 멈춘다.
  // 이 현상을 통해 Liveness Probe의 필요성을 더 명확히 알 수 있다.
  res.status(200).send("OK");
});

app.listen(PORT, () => {
  console.log(`Buggy Node.js app listening on port ${PORT}`);
});
