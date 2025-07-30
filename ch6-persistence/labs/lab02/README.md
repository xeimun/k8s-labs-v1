# Lab 02: `ddoddo-market` 데이터베이스를 StatefulSet으로 업그레이드하기

이번 마지막 랩에서는 이 챕터에서 배운 모든 지식을 총동원하여, 우리의 메인 프로젝트인 **`ddoddo-market`**의 데이터베이스를 `StatefulSet`으로 전환하는 작업을 수행합니다.

---

### 🎯 미션 (Your Mission)

1.  현재 `Deployment`로 실행 중인 `ddoddo-market`의 PostgreSQL 데이터베이스를 **`StatefulSet`으로 완전히 전환**하세요.
2.  이를 통해 사용자가 생성한 상품, 채팅 내용 등 모든 데이터가 Pod 재시작에도 안전하게 보존되도록 만드세요.
3.  `lab02` 디렉토리 안에 `db-headless-svc.yaml`과 `db-statefulset.yaml` 두 개의 파일을 직접 작성하여 미션을 완료해야 합니다.

---

### 💡 문제 해결을 위한 힌트 (Hints)

#### **1. 시작 전 준비**
* `lab01`과 마찬가지로, 이전에 `ddoddo-market`을 배포하며 생성했던 데이터베이스 관련 `Deployment`와 `Service`를 먼저 삭제해야 합니다. (`db-deployment`, `db-svc`)

#### **2. Headless 서비스 (`db-headless-svc.yaml`)**
* `lab01`에서 만들었던 `todo-db-headless-svc.yaml` 파일의 구조를 참고하세요. 거의 동일합니다!
* `metadata.name`은 백엔드 애플리케이션이 `ConfigMap`을 통해 찾고 있는 이름(`db-svc`)을 그대로 사용하는 것이 좋습니다. 그래야 백엔드 코드를 수정할 필요가 없습니다.
* `selector`의 라벨(`app: ddoddo-db`)이 앞으로 만들 `StatefulSet`의 Pod 라벨과 일치하도록 계획해야 합니다.

#### **3. StatefulSet (`db-statefulset.yaml`)**
* `lab01`에서 했던 것처럼, 기존 `ddoddo-market`의 `db-deployment.yaml` 파일을 기반으로 수정 작업을 시작하세요.
* `kind`를 `StatefulSet`으로, `metadata.name`을 `ddoddo-db`로, `serviceName`을 `db-svc`로 설정하는 등 `lab01`의 경험을 그대로 적용해 보세요.
* `volumeClaimTemplates`의 `metadata.name`을 `ddoddo-db-data`와 같이 명확한 이름으로 지정하는 것이 좋습니다.
* PostgreSQL의 데이터 디렉토리 경로는 `lab01`과 동일합니다. `volumeMounts`를 정확히 설정해 주세요.
* `envFrom`을 통해 `Secret`과 `ConfigMap`을 주입하는 부분은 기존 `Deployment`의 설정을 그대로 가져오면 됩니다. 이 부분은 변경할 필요가 없습니다.

---

### ✅ 검증 방법 (Verification)

모든 YAML 파일 작성을 마쳤다면, 전체 `ddoddo-market` 애플리케이션을 배포하고 직접 검증해야 합니다.

1.  **리소스 배포 및 생성 확인:**
    * 새로 만든 `db-headless-svc.yaml`과 `db-statefulset.yaml`을 배포합니다.
    * `ddoddo-market`의 `backend-deployment.yaml`과 `frontend-deployment.yaml` (그리고 관련 서비스들)도 함께 배포합니다.
    * `kubectl get statefulset ddoddo-db`
    * `kubectl get pod -l app=ddoddo-db` (Pod 이름이 `ddoddo-db-0`으로 생성되었는지 확인하세요.)
    * `kubectl get pvc` (PVC가 `ddoddo-db-data-ddoddo-db-0`과 같은 이름으로 생성되고 `Bound` 상태인지 확인하세요.)

2.  **데이터 영속성 최종 테스트:**
    * `ddoddo-market` 웹사이트에 접속하여 **회원가입 후 새로운 상품을 하나 등록**합니다. 사진도 첨부해 보세요.
    * 터미널로 돌아와 `kubectl delete pod ddoddo-db-0` 명령으로 데이터베이스 Pod을 삭제합니다.
    * Pod이 완전히 복구될 때까지 기다린 후, 웹사이트를 새로고침하고 다시 로그인합니다.

이전에 가입한 계정으로 로그인이 되고, 등록했던 상품이 사진과 함께 그대로 보인다면, 여러분은 이번 챕터의 모든 목표를 완벽하게 달성한 것입니다!