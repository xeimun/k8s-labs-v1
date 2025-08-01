const express = require('express');
const app = express();
const PORT = 8080;

let memoryHog = [];

app.get('/', (req, res) => {
  res.status(200).send(`
    Hello! This is a memory consumer app.
    Use /consume?mb=[number] to allocate memory.
    Current memory usage: ${Math.round(process.memoryUsage().rss / 1024 / 1024)} MB
  `);
});

// /consume?mb=100 와 같이 요청하면 해당 크기의 메모리를 할당
app.get('/consume', (req, res) => {
  const mbToConsume = parseInt(req.query.mb, 10);

  if (isNaN(mbToConsume) || mbToConsume <= 0) {
    return res.status(400).send('Please provide a valid number for "mb" query parameter.');
  }

  // 1MB = 1024 * 1024 bytes. 각 element가 1 byte 이므로 해당 크기의 배열 생성
  const newAllocation = new Array(mbToConsume * 1024 * 1024).fill('x');
  memoryHog.push(newAllocation);

  const currentRssMb = Math.round(process.memoryUsage().rss / 1024 / 1024);
  
  console.log(`Allocated ${mbToConsume}MB. Current total memory usage: ~${currentRssMb}MB`);
  res.status(200).send(`Successfully allocated ${mbToConsume}MB. Current RSS: ${currentRssMb}MB`);
});

app.listen(PORT, () => {
  console.log(`Memory consumer app listening on port ${PORT}`);
});