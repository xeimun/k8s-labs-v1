# Lab 02: Ingress로 `ddoddo-market` 서비스 통합하기

`lab01`의 성공을 발판 삼아, 이제 이 챕터의 최종 목표인 `ddoddo-market` 프로젝트에 Ingress를 적용할 차례입니다. 이 랩을 완료하면, 여러분의 애플리케이션은 실제 운영 환경과 매우 유사한, 단일 진입점을 가진 세련된 네트워크 아키텍처를 갖추게 됩니다.

`todo-list`에서 사용했던 패턴과 동일합니다. 이번에는 더 익숙한 `ddoddo-market` 환경에 직접 적용해 봄으로써 Ingress 활용 능력을 완성해 봅시다.

---

### 🎯 미션 (Your Mission)

1.  `ddoddo-market`의 백엔드와 프론트엔드 서비스를 **단일 Ingress**를 통해 외부에 노출하세요.
2.  사용자는 오직 **하나의 IP 주소**로만 접속하여 `ddoddo-market`의 모든 기능을 사용할 수 있어야 합니다.
    - `/api/` 로 시작하는 모든 요청은 `ddoddo-backend-svc`로 전달되어야 합니다.
    - 그 외의 모든 요청은 `ddoddo-frontend-svc`로 전달되어야 합니다.
3.  `lab02` 디렉토리 안에 `ddoddo-market-ingress.yaml` 파일을 직접 작성하여 미션을 완료하세요.

---

### 💡 문제 해결을 위한 힌트 (Hints)

#### **1. 서비스 타입 변경부터**

- `lab01`에서 했던 것과 마찬가지로, `ddoddo-market`의 `backend-svc.yaml`과 `frontend-svc.yaml` 파일을 찾아 `type`을 **`ClusterIP`**로 변경하고 클러스터에 다시 적용(`kubectl apply`)하세요.

#### **2. Ingress Manifest 작성 (`ddoddo-market-ingress.yaml`)**

- `lab01`에서 성공적으로 만들었던 `todo-list-ingress.yaml` 파일이 훌륭한 참고 자료가 될 것입니다. 구조를 그대로 가져와 이름만 바꾸면 거의 완성됩니다.
- `metadata.name`을 `ddoddo-market-ingress`와 같이 명확하게 변경하세요.
- `backend.service.name`을 `ddoddo-backend-svc`와 `ddoddo-frontend-svc`로 각각 정확하게 수정해야 합니다.
- **규칙의 순서**와 **`rewrite-target` 어노테이션**의 중요성을 다시 한번 기억하세요! `/api` 경로 규칙이 `/` 경로 규칙보다 위에 있어야 하며, 백엔드로 전달될 때 `/api` 경로를 제거해 주는 설정이 필요합니다.

#### **3. 테스트는 모든 구성 요소를 배포한 뒤에**

- `ddoddo-market`은 데이터베이스, 백엔드, 프론트엔드가 모두 필요합니다. Ingress를 테스트하기 전에 모든 구성 요소(`StatefulSet`, `Deployment`, `Service` 등)가 정상적으로 배포되고 실행 중인지 먼저 확인하세요.

---

### ✅ 검증 방법 (Verification)

모든 설정을 마쳤다면, 아래 방법으로 직접 검증해 보세요.

1.  **전체 애플리케이션 배포:**

    - `ddoddo-market`의 모든 리소스(DB, 백엔드, 프론트엔드 관련 `StatefulSet`, `Deployment`, `Service`, `ConfigMap`, `Secret` 등)를 배포합니다.
    - 마지막으로 여러분이 작성한 `ddoddo-market-ingress.yaml`을 배포합니다.
    - `kubectl get ingress` 명령어로 Ingress 리소스가 정상적으로 생성되었는지 확인하세요.

2.  **`minikube tunnel` 실행:**

    - 별도의 터미널에서 `minikube tunnel`을 실행하고 띄워 둡니다.

3.  **웹 애플리케이션 E2E 테스트 (최종 확인):**
    - 웹 브라우저에서 `http://127.0.0.1:8000` 주소로 접속합니다.
    - `ddoddo-market`의 메인 페이지가 떠야 합니다.
    - **회원가입, 로그인, 새로운 상품 등록** 등 핵심 기능을 모두 수행해 보세요. 이 과정에서 프론트엔드와 백엔드 API 간의 통신이 모두 원활하게 이루어져야 합니다.
