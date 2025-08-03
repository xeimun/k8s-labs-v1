# 실습 2: todo-list 백엔드 앱을 Helm Chart로 패키징하기

이번 실습에서는 여러 개로 흩어져 있던 `todo-list`의 백엔드와 데이터베이스 YAML 파일들을 하나의 Helm Chart로 통합합니다. 하드코딩된 설정 값들을 `values.yaml` 파일로 추출하여, 재사용 가능하고 설정 변경이 유연한 차트를 만드는 방법을 배웁니다.

### 목표
- 기존 Kubernetes YAML 파일을 Helm 템플릿으로 변환할 수 있다.
- `values.yaml` 파일을 통해 이미지 태그, 복제본 수, 비밀번호 등의 설정을 동적으로 주입할 수 있다.
- 완성된 차트를 `lint`, `template`, `install` 명령어로 검증하고 배포할 수 있다.

---

### 1단계: 차트 기본 구조 생성 및 기존 파일 복사

`helm create`로 기본 구조를 만들고, `start/` 디렉토리에 미리 준비된 YAML 파일들을 `templates` 디렉토리로 복사합니다.

```bash
# 1. todo-backend-chart 라는 이름의 차트 생성
helm create todo-list-chart

# 2. 기본으로 생성된 템플릿 파일들을 모두 삭제
rm -rf todo-backend-chart/templates/*

# 3. 실습용 YAML 파일들을 templates 디렉토리로 복사
cp ./start/*.yaml ./todo-backend-chart/templates/
````

이제 `todo-backend-chart/templates` 디렉토리 안에는 `todo-list`의 백엔드와 DB를 구성하는 6개의 YAML 파일이 들어있습니다.

-----

### 2단계: `values.yaml` 설계 및 템플릿화 시작

먼저 `helm create`로 생성된 `todo-backend-chart/values.yaml` 파일의 내용을 모두 지우고, 앞으로 사용할 설정 값들을 아래와 같이 정의합니다.

```yaml
# todo-backend-chart/values.yaml

# Backend Application Settings
backend:
  replicaCount: 1
  image:
    repository: captainyun/todo-backend
    tag: "v1"
  service:
    type: NodePort
    port: 8080
    nodePort: 30001

# Database Settings
database:
  name: tododb
  user: user
  # For security, password should be handled via --set or secrets management tools in production
  password: "password"
  rootPassword: "admin"
```

이제 이 `values.yaml` 값을 사용하도록 `templates` 안의 파일들을 수정해 나갑니다.

-----

### 3단계: Deployment와 Secret 템플릿화

1.  **`05-backend-deployment.yaml` 수정**: `replicas`와 `image` 부분을 `{{ .Values... }}` 구문으로 바꿉니다.

      - **수정 후**:
        ```yaml
        replicas: {{ .Values.backend.replicaCount }}
        ...
            image: "{{ .Values.backend.image.repository }}:{{ .Values.backend.image.tag }}"
        ```

2.  **`01-mysql-secret.yaml` 수정**: 하드코딩된 비밀번호를 `values.yaml`에서 가져오도록 수정합니다.

      - **수정 후**:
        ```yaml
        ...
        stringData:
          MYSQL_ROOT_PASSWORD: {{ .Values.database.rootPassword | quote }}
          MYSQL_PASSWORD: {{ .Values.database.password | quote }}
        ```

    > **Tip**: Helm 템플릿에서 문자열 값을 사용할 때는 `quote` 함수를 붙여주는 것이 안전합니다.

-----

### 4단계: 나머지 리소스 템플릿화 및 배포

같은 방식으로 나머지 YAML 파일들도 `values.yaml`을 참조하도록 수정합니다.

  - **`06-backend-service.yaml`**: `type`, `port`, `nodePort`를 `{{ .Values.backend.service... }}`로 수정합니다.
  - **`02-mysql-configmap.yaml`**: `MYSQL_DATABASE`, `MYSQL_USER`를 `{{ .Values.database... }}`로 수정합니다.

모든 파일의 수정이 끝나면, 아래 명령어로 차트를 검증하고 배포합니다.

1.  **Lint로 문법 검사**:

    ```bash
    helm lint ./todo-backend-chart
    ```

2.  **Template으로 결과물 미리보기** (강력 추천):

    ```bash
    helm template ./todo-backend-chart
    ```

    이때 `replicas`나 `image` 태그, 비밀번호 등이 `values.yaml`의 값으로 잘 바뀌었는지 반드시 확인합니다.

3.  **릴리스 설치**:

    ```bash
    helm install todo-app ./todo-backend-chart
    ```

4.  **설치 확인 및 삭제**:

    ```bash
    # Pod, Service 등이 잘 생성되었는지 확인
    kubectl get all

    # 실습 후 삭제
    helm uninstall todo-app
    ```

### 도전 과제

`values.yaml` 파일을 직접 수정하는 대신, `helm upgrade` 명령어와 `--set` 옵션을 사용하여 배포된 `todo-app`의 백엔드 이미지 태그를 `v2`로 변경해 보세요.

```
```