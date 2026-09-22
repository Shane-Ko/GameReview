# GameReview 배포 기록

2026-09-22, 로컬 PC에만 있던 프로젝트를 vcluster(kopo02)에 올리고 CI/CD를 붙인 과정.
**챗봇(`/api/chat`)은 의도적으로 미동작 상태로 배포**했다 — 아래 "남은 과제" 참조.

## 결과

**http://kopo02-gamereview.std.kopoctc.kr**

```
git push gitlab main
  → GitLab 웹훅 → Jenkins(gamereview-pipeline)
  → kaniko x2 빌드 → Harbor(gamereview-frontend, gamereview-backend :v{BUILD_NUMBER})
  → kopo021/gitops 의 apps/gamereview/deployment.yaml 태그 3곳 갱신·push
  → ArgoCD(kopo02-gamereview) 자동 배포
```

| 구성 요소 | 위치 |
|---|---|
| 소스 | GitHub `Shane-Ko/GameReview` (백업), GitLab `kopo02/gamereview` (CI 대상) |
| 이미지 | `kopo02/gamereview-frontend`, `kopo02/gamereview-backend` |
| 매니페스트 | `kopo021/gitops` 의 `apps/gamereview/` |
| 네임스페이스 | `gamereview` |
| 데이터 | PVC `gamereview-data` (1Gi, `nfs-std-1`) |

## 구조

파드 1개에 컨테이너 2개, PVC를 공유한다. 인그레스에서 경로로 나눈다.

```
Ingress  /api → :8001 (backend)
         /    → :3000 (frontend)

Pod ─ initContainer seed   db.json 씨앗 복사 (최초 1회)
    ├ web  node  :3000     빌드된 React + json-server + SPA fallback
    └ api  python :8001    FastAPI 챗봇
         └ 공유 PVC /data/db.json
```

`web`과 `api`가 같은 `db.json`을 봐야 해서(챗봇 시스템 프롬프트에 게임 목록을 넣는다) 한 파드에 묶었다. RWO PVC를 파드 간에 나눠 쓰는 것보다 안전하다.

## 배포 전에 고쳐야 했던 것

### 1. `http://localhost:3000` 하드코딩 22곳 / 8개 파일

`GameEdit.tsx`, `GameNew.tsx`, `ReviewForm.tsx`, `BestGames.tsx`, `GameList.tsx`, `Admin.tsx`, `GameCard.tsx`, `GameDetailModal.tsx`. 브라우저에서 실행되는 코드라 인그레스 접속 시 전부 실패한다.

→ 상대경로(`fetch("/games")`)로 변경. 개발 중에는 `vite.config.ts`의 프록시가 `/games`,`/genres`,`/reviews`를 `localhost:3000`으로 넘기므로 `yarn dev`는 그대로 동작한다.

### 2. SPA fallback 부재

`BrowserRouter`를 쓰는데 json-server에는 fallback 기능이 없다. `/admin`, `/best`에서 새로고침하면 404가 난다.

→ `server.js`를 새로 작성. json-server를 모듈로 쓰면서 정적 파일 + REST API + `index.html` fallback을 한 프로세스에서 처리한다. `db.json`의 키를 읽어 API 경로(`/games`,`/genres`,`/reviews`)를 판별하고, 그 외 확장자 없는 GET은 `index.html`로 보낸다.

```js
if (req.method === 'GET' && !isApiPath(req.path) && !path.extname(req.path)) {
  return res.sendFile(path.join(STATIC_DIR, 'index.html'));
}
```

### 3. 백엔드 설정 하드코딩

`backend/main.py`의 `OLLAMA_URL`, `MODEL_NAME`, `ALLOWED_ORIGINS`와 `open("../db.json")` 상대경로.

→ 모두 환경변수로 (`OLLAMA_URL`, `MODEL_NAME`, `ALLOWED_ORIGINS`, `DB_PATH`). 기본값은 로컬 개발 기준 그대로라 로컬 실행에 영향이 없다. 덕분에 **ollama 경로가 정해지면 매니페스트 env 한 줄만 고치면 되고 재빌드가 필요 없다.**

### 4. 데이터 영속화

리뷰 작성·좋아요·관리자 등록이 모두 `db.json`에 쓴다.

→ 이미지에는 `/app/seed/db.json` 씨앗만, 런타임은 PVC의 `/data/db.json`. initContainer가 `[ -f /data/db.json ] || cp ...` 로 최초 1회만 복사한다.

## 겪은 문제

### kaniko를 한 컨테이너에서 두 번 실행 불가

빌드 #1에서 `Build Frontend`는 성공했는데 `Build Backend`가 `ERROR: Process exited immediately after creation`으로 죽었다.

kaniko는 빌드 중 베이스 이미지를 컨테이너 루트 파일시스템 위에 펼치면서 기존 내용을 지운다. 첫 빌드 후 `/busybox/sh`까지 사라져 두 번째 `sh` 스텝을 띄울 수 없었다.

→ `kaniko-frontend`, `kaniko-backend` 두 컨테이너로 분리.

### student-quota 초과

빌드 #2가 스케줄되지 않고 Pending으로 멈췄다. describe의 Events에만 사유가 나온다:

```
Error syncing to host cluster: ... forbidden: exceeded quota: student-quota,
requested: requests.cpu=400m, used: 1120m, limited: 1500m
```

kaniko 컨테이너가 2개가 되면서 빌드 파드 요청량이 400m이 되어 20m 초과했다.

→ `kaniko-frontend 150m / kaniko-backend 80m / git 30m / jnlp 50m = 310m`으로 조정.

**취소한 빌드가 파드를 계속 재생성한다.** `kubectl delete pod`로 지워도 되살아나 quota를 점유하므로 **Jenkins UI에서 Abort** 해야 한다.

### 빌드 의존성이 Node 22+ 요구

`@rolldown/plugin-babel@0.2.3`이 `node >=22.12.0`을 요구해 `node:20-alpine` 빌드 스테이지가 실패했다. → `node:22-alpine`.

## 남은 과제: 챗봇 / ollama

`/api/chat`은 현재 `{"error": "All connection attempts failed"}`를 반환한다. FastAPI가 예외를 잡아 SSE로 흘리므로 **크래시 없이** 나머지 기능은 정상 동작한다.

확인된 사실:

- ollama는 VM `kopo02`의 **VirtualBox 호스트**에 있다. VM 안에서 `http://10.0.2.2:11434`로 접근되며 `qwen2.5:7b`를 보유.
- `10.0.2.2`는 NAT 게이트웨이라 **그 VM 안에서만 유효**하다. LAN IP(`192.168.26.172`)로는 11434가 닫혀 있다.
- **vcluster 파드에서 테스트한 결과 두 주소 모두 도달 불가.** 클러스터 노드는 원격 호스트 클러스터에 있어 VM의 NAT 주소와 무관하다.

선택지:

1. 서버 PC의 ollama를 `OLLAMA_HOST=0.0.0.0`으로 LAN 노출 — 가장 단순하나 클러스터 노드↔서버 도달성 확보 필요
2. vcluster 안에 ollama 배포 — GPU가 없고 quota상 7B 모델 구동이 현실적으로 어려움
3. 서버 PC에서 클러스터로 SSH 리버스 터널

해결되면 `apps/gamereview/deployment.yaml`의 `OLLAMA_URL` **한 줄만** 바꿔 push하면 끝난다.

## 운영 메모

- `kubectl edit`/`apply`로 클러스터를 직접 고치지 말 것 (ArgoCD selfHeal).
- `gitops` push 전 **항상 `git pull --rebase origin main`**, force push 금지.
- frontend 이미지는 initContainer와 web 컨테이너 **두 곳**에 쓰인다. `sed`의 `g` 플래그 필수.
- frontend 빌드는 kaniko 안에서 `yarn install` + `tsc` + `vite build`를 돌려 3분가량 걸린다.

## 검증 방법

```bash
kubectl -n gamereview get pods,pvc,svc,ingress
POD=$(kubectl -n gamereview get pod -l app=gamereview -o jsonpath='{.items[0].metadata.name}')
kubectl -n gamereview exec $POD -c web -- wget -qO- http://127.0.0.1:3000/games | head -c 200
kubectl -n gamereview exec $POD -c api -- python -c \
  "import urllib.request;print(urllib.request.urlopen('http://127.0.0.1:8001/api/health').read())"
# SPA fallback: /admin, /best 가 200 이어야 한다
```
