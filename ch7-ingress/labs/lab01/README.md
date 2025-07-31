# Lab 01: Ingress로 `todo-list` 백엔드 API 서버 노출하기

`exercises`를 통해 우리는 Ingress의 강력한 라우팅 기능을 배웠습니다. 이제 `todo-list` 프로젝트의 **백엔드 API 서버**에 Ingress를 직접 적용하여, 외부에서 API를 사용할 수 있도록 안전하고 효율적인 진입점을 만드는 실전 훈련을 시작하겠습니다.

이번 랩의 목표는 백엔드 서비스를 위한 **단 하나의 Ingress 규칙**을 만들어, 특정 경로로 들어오는 요청만을 백엔드 서비스로 전달하는 것입니다. 프론트엔드는 로컬 PC에서 개발한다고 가정합니다.

---

### 🎯 미션 (Your Mission)

1.  `todo-list`의 백엔드 서비스를 Ingress를 통해 외부에 노출하세요.
2.  사용자는 **하나의 IP 주소**를 통해 API 서버에 접근할 수 있어야 합니다.
    - `/api/` 로 시작하는 모든 요청은 `todo-backend-svc`로 전달되어야 합니다.
3.  `lab01` 디렉토리 안에 `todo-list-ingress.yaml` 파일을 직접 작성하여 미션을 완료해야 합니다.

---

### ✅ 검증 방법 (Verification)

모든 설정을 마쳤다면, 아래 방법으로 직접 검증해 보세요.

1.  **리소스 배포 및 확인:**

    - `todo-list`의 데이터베이스와 백엔드 관련 리소스(`StatefulSet`, `Deployment`, `Service` 등)를 모두 배포합니다.
    - 작성한 `todo-list-ingress.yaml`을 배포합니다.

2.  **`minikube tunnel` 실행:**

    - 별도의 터미널에서 `minikube tunnel`을 실행하고 띄워 둡니다.

3.  **API 서버 테스트 (백엔드 라우팅 확인):**
    - `curl http://127.0.0.1:8000/api/todos` 명령어를 실행했을 때, JSON 형태의 할 일 목록 (비어있더라도 `[]` 형태)이 반환되어야 합니다.
    - `curl http://127.0.0.1:8000/` 로 요청했을 때는 404 Not Found 에러가 발생하는 것이 정상입니다. (규칙이 없으므로)
