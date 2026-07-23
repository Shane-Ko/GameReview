const fs = require('fs');

// db.json 읽기
const db = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));

// games: string id 있으면 순차 번호로 재할당
let maxGameId = 0;
db.games.forEach(g => {
  const numId = parseInt(g.id);
  if (!isNaN(numId)) maxGameId = Math.max(maxGameId, numId);
});

db.games.forEach(g => {
  const numId = parseInt(g.id);
  if (isNaN(numId)) {
    // 문자열 id → 새 번호 할당
    maxGameId++;
    g.id = maxGameId;
  } else {
    // "1" → 1
    g.id = numId;
  }
});

// genres도 동일
db.genres.forEach(g => {
  g.id = parseInt(g.id);
});

// reviews도 동일
let maxReviewId = 0;
db.reviews.forEach(r => {
  const numId = parseInt(r.id);
  if (!isNaN(numId)) maxReviewId = Math.max(maxReviewId, numId);
});

db.reviews.forEach(r => {
  const numId = parseInt(r.id);
  if (isNaN(numId)) {
    maxReviewId++;
    r.id = maxReviewId;
  } else {
    r.id = numId;
  }
});

// 저장
fs.writeFileSync('./db.json', JSON.stringify(db, null, 2), 'utf-8');
console.log('완료!');
console.log(`총 게임: ${db.games.length}개, 마지막 id: ${maxGameId}`);
console.log(`총 리뷰: ${db.reviews.length}개, 마지막 id: ${maxReviewId}`);