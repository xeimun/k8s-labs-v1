# Lab 01: `ddoddo-market` 애플리케이션 Helm Chart로 패키징하기

### 🎯 목표

`ch8`까지 수동으로 배포했던 `ddoddo-market` 애플리케이션의 모든 쿠버네티스 리소스를 **하나의 완전한 Helm Chart로 직접 제작**합니다. `ex03`에서 배운 모든 베스트 프랙티스(쿠버네티스 표준 레이블, 헬퍼 사용, 동적 이름 규칙 등)를 적용하여, 실제 운영 환경에 배포 가능한 수준의 재사용성 높은 차트를 완성합니다.

### 🎯 미션 (Your Mission)

#### 1\. Helm Chart 구조 직접 생성

`helm create` 명령어에 의존하지 않고, 처음부터 직접 차트 구조를 만듭니다.

1.  **디렉토리 생성**: `ddoddo-market-chart` 라는 이름의 디렉토리를 생성하고, 그 안에 `templates`와 `charts` 디렉토리, 그리고 `Chart.yaml`, `values.yaml` 파일을 직접 생성하세요.
2.  **`Chart.yaml` 작성**: 차트의 기본 정보를 아래와 같이 작성합니다.
    ```yaml
    apiVersion: v2
    name: ddoddo-market-chart
    description: A Helm chart for the ddoddo-market 3-tier application
    type: application
    version: 0.1.0
    appVersion: "1.0.0"
    ```
3.  **`_helpers.tpl` 작성**: `ex03`에서 완성했던 `_helpers.tpl`의 전체 내용을 `templates` 디렉토리 안에 그대로 복사하여, 모든 리소스에서 사용할 이름과 레이블의 기반을 마련하세요.

-----

#### 2\. `values.yaml` 설계

`ddoddo-market` 애플리케이션의 모든 설정을 `values.yaml` 파일에서 관리하도록 설계합니다. 아래 구조를 참고하여 `values.yaml` 파일을 작성하세요.

```yaml
# values.yaml
frontend:
  replicaCount: 1
  image:
    repository: your-docker-id/ddoddo-frontend
    tag: "1.0"
  service:
    type: ClusterIP
    port: 3000

backend:
  replicaCount: 1
  image:
    repository: your-docker-id/ddoddo-backend
    tag: "1.0"
  service:
    type: ClusterIP
    port: 8080
  # 백엔드가 DB에 접속하기 위한 정보
  db:
    host: "ddoddo-db-service"

database:
  image:
    repository: postgres
    tag: "15"
  # DB 접속 정보 (Secret으로 관리될 값들)
  auth:
    username: "user"
    password: "password"
    database: "ddoddo"
  # PVC 설정
  persistence:
    size: 2Gi

ingress:
  enabled: true
  className: "nginx"
  hosts:
    - host: chart-example.local
      paths:
        - path: /
          pathType: ImplementationSpecific
          backend:
            service:
              # 이 부분은 템플릿에서 동적으로 생성될 프론트엔드 서비스 이름을 가리켜야 합니다.
              name: # placeholder
              port:
                number: 3000
```

-----

#### 3\. 모든 리소스를 템플릿으로 변환

`ch8`에서 사용했던 `ddoddo-market`의 모든 YAML 파일(`Deployment`, `StatefulSet`, `Service`, `Secret`, `ConfigMap`, `Ingress` 등)을 `templates` 디렉토리로 가져와 아래 요구사항에 맞춰 Helm 템플릿으로 변환하세요.

  * **쿠버네티스 표준 레이블 적용**: 모든 리소스의 `metadata.labels`와 `selector`에 `_helpers.tpl`에서 정의한 표준 레이블 헬퍼(`backend.selectorLabels`, `database.selectorLabels` 등)를 적용하세요.
  * **동적 이름 규칙 적용**: 모든 리소스의 `metadata.name`은 `{{ include "..." . }}` 헬퍼를 사용하여 릴리스마다 고유한 이름을 갖도록 만드세요. (단, DB 접속을 위한 Headless Service의 이름은 `ddoddo-db-service`로 고정합니다.)
  * **`values.yaml` 참조**: 이미지 태그, 복제본 수, 포트 번호, PVC 크기 등 모든 설정값은 `{{ .Values... }}` 구문을 사용하여 `values.yaml` 파일에서 가져오도록 수정하세요.
  * **`if` 제어문 활용**: `values.yaml`의 `ingress.enabled` 값이 `true`일 때만 `Ingress` 리소스가 생성되도록 `if` 블록으로 전체 `Ingress` 템플릿을 감싸세요.

-----

### ✅ 확인 방법

1.  모든 템플릿 파일 작성이 완료되면, `helm lint .` 명령으로 차트의 문법적 오류가 없는지 확인합니다.
2.  `helm template .` 명령으로 최종 생성될 YAML 결과물을 미리 확인하고, 이름과 레이블, 설정값들이 의도대로 잘 적용되었는지 검토합니다.
3.  `helm install ddoddo-market .` 명령으로 차트를 실제로 배포하고, `kubectl get all -l app.kubernetes.io/instance=ddoddo-market` 명령으로 모든 리소스가 정상적으로 `Running` 상태가 되는지 확인합니다.
4.  `Ingress`가 정상적으로 동작하는지, 설정한 호스트 주소로 접속하여 애플리케이션이 잘 보이는지 최종 확인합니다.