# Tracer Web

외부 서비스 장애 지도: 공개 GitHub 저장소가 쓰는 외부 서비스의 공개 상태와 코드의 호출 위치를 한 화면에서 보여주는 웹 프론트엔드.

- 백엔드: [tracer-backend](https://github.com/Imaginationer-Lab/tracer-backend)
- 배포 주소: https://tracer.kangdora.me

## 개발

```bash
npm install
npm run dev        # http://localhost:9000
```

브라우저는 같은 출처의 `/api`만 부르고, 개발 서버가 `/api`를 백엔드로 넘긴다.
백엔드는 `tracer-backend`에서 `docker compose up -d --build`로 띄운다 (기본 `http://localhost:3000`).
다른 주소를 쓰려면 `.env.local`에 `API_PROXY_TARGET=http://<백엔드 주소>`를 넣는다.

```bash
npm run typecheck
npm run lint
npm run build
```

## 배포

백엔드 compose가 먼저 떠 있어야 한다. 프론트 컨테이너가 백엔드 네트워크(`outage-map_default`)에 붙어서 `/api`를 `api:3000`으로 넘긴다.

```bash
docker compose up -d --build   # 127.0.0.1:9000
```

| 환경변수 | 기본값 | 설명 |
| --- | --- | --- |
| `WEB_HOST_PORT` | `9000` | 호스트에서 여는 포트 (`127.0.0.1`에만 묶임) |
| `API_UPSTREAM` | `http://api:3000` | `/api`를 넘길 백엔드 주소 |
| `PUBLIC_ORIGIN` | `https://tracer.kangdora.me` | 이 출처에서 온 요청은 `Origin`을 지우고 넘긴다 (같은 출처라 백엔드 CORS 설정이 필요 없음) |
| `BACKEND_NETWORK` | `outage-map_default` | 붙을 백엔드 compose 네트워크 |

요청 경로가 브라우저 → Cloudflare → 프론트(nginx) → 백엔드이므로 백엔드 `TRUST_PROXY`는 `2`다.
