// 빌드된 React 앱(정적)과 json-server REST API 를 한 프로세스/한 오리진에서 서빙한다.
// 프론트가 상대경로(`/games`, `/reviews` …)로 호출하므로 CORS 가 필요 없고,
// BrowserRouter 를 쓰므로 새로고침 대비 SPA fallback 이 필요하다.
const path = require('path');
const fs = require('fs');
const jsonServer = require('json-server');

const DB_PATH = process.env.DB_PATH || '/data/db.json';
const STATIC_DIR = process.env.STATIC_DIR || path.join(__dirname, 'dist');
const PORT = Number(process.env.PORT || 3000);

const db = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
// '$schema' 같은 메타 키는 리소스가 아니다.
const resources = Object.keys(db).filter((k) => !k.startsWith('$'));
const isApiPath = (p) => resources.some((r) => p === `/${r}` || p.startsWith(`/${r}/`));

const server = jsonServer.create();
const router = jsonServer.router(DB_PATH);

// defaults 가 정적 파일 서빙을 포함한다. 실제 파일이 있으면 여기서 응답된다.
server.use(jsonServer.defaults({ static: STATIC_DIR }));
server.use(jsonServer.bodyParser);

// 정적 파일도 아니고 API 도 아닌 GET(= 클라이언트 라우트)은 index.html 로 넘긴다.
server.use((req, res, next) => {
  if (req.method === 'GET' && !isApiPath(req.path) && !path.extname(req.path)) {
    return res.sendFile(path.join(STATIC_DIR, 'index.html'));
  }
  next();
});

server.use(router);

server.listen(PORT, '0.0.0.0', () => {
  console.log(`GameReview serving ${STATIC_DIR} and ${DB_PATH} on :${PORT}`);
  console.log(`resources: ${resources.join(', ')}`);
});
