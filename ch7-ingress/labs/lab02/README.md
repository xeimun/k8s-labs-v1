# Lab 02: Ingress로 `ddoddo-market` 백엔드 API 서버 노출하기

`lab01`의 성공을 발판 삼아, 이제 이 챕터의 최종 목표인 `ddoddo-market` 프로젝트의 **백엔드 API 서버**에 Ingress를 적용할 차례입니다. 이 랩을 완료하면, 여러분의 메인 프로젝트는 외부에서 안전하고 효율적으로 접근할 수 있는 API 엔드포인트를 갖추게 됩니다.

`lab01`에서 `todo-list`의 백엔드를 노출했던 방식과 완전히 동일합니다. 그 경험을 바탕으로 `ddoddo-market` 환경에 직접 적용하며 Ingress 활용 능력을 완성해 봅시다.

---

### 🎯 미션 (Your Mission)

1.  `ddoddo-market`의 백엔드 서비스를 Ingress를 통해 외부에 노출하세요.
2.  사용자는 **`http://127.0.0.1:8000`** 이라는 단일 주소로만 API 서버에 접근할 수 있어야 합니다.
    - `/api/` 로 시작하는 모든 요청은 `ddoddo-backend-svc`로 전달되어야 합니다.
3.  `lab02` 디렉토리 안에 `ddoddo-market-ingress.yaml` 파일을 직접 작성하여 미션을 완료하세요.

---

### ✅ 검증 방법 (Verification)

모든 설정을 마쳤다면, 아래 방법으로 직접 검증해 보세요.

1.  **전체 애플리케이션 배포:**

    - `ddoddo-market`의 **데이터베이스와 백엔드** 관련 모든 리소스(`StatefulSet`, `Deployment`, `Service`, `ConfigMap`, `Secret` 등)를 배포합니다.
    - 마지막으로 여러분이 작성한 `ddoddo-market-ingress.yaml`을 배포합니다.
    - `kubectl get ingress` 명령어로 Ingress 리소스가 정상적으로 생성되었는지 확인하세요.

2.  **`minikube tunnel` 실행:**

    - **별도의 터미널**에서 `minikube tunnel`을 실행하고 띄워 둡니다.

3.  **API 서버 테스트 (백엔드 라우팅 확인):**
    - `curl http://127.0.0.1:8000/api/posts` 명령어를 실행해 보세요. 비어있는 JSON 배열(`[]`)이 반환되면 백엔드 라우팅은 성공입니다.
    - `curl http://127.0.0.1:8000/` (프론트엔드 경로) 로 요청했을 때는 404 Not Found 에러가 발생하는 것이 정상입니다.
