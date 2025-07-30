# ex04: "가장 중요한 것은 안전하게" - `todo-list`의 비밀번호 분리 (Secret)

### 🎯 학습 목표

- `ConfigMap`이 민감 정보 관리에 부적합한 이유를 이해한다.
- `Secret` 리소스의 필요성과 `ConfigMap`과의 차이점을 학습한다.
- `Secret`을 생성하고, 이를 Pod의 환경변수로 주입하여 안전하게 민감 정보를 전달하는 방법을 익힌다.

---

### 1 단계: 보안 문제점 인식하기

`ex02`에서 우리는 `ConfigMap`을 사용해 `todo-list`의 DB 설정을 성공적으로 분리했습니다. 하지만 수정했던 `todo-db-deployment.yaml` 파일을 다시 한번 자세히 볼까요?

**📄 todo-db-deployment.yaml (`ex02` 버전)**

```yaml
---
env:
  # 비밀번호가 평문(plain text)으로 그대로 노출되어 있습니다!
  - name: MYSQL_PASSWORD
    value: "todo"
  - name: MYSQL_ROOT_PASSWORD
    value: "root"
```

`MYSQL_PASSWORD`와 같은 아주 중요한 정보가 **누구나 볼 수 있는 평문**으로 YAML 파일에 그대로 노출되어 있습니다. 만약 이 파일이 Git 저장소에 올라간다면, 모든 개발자가 데이터베이스의 루트 비밀번호를 알게 되는 끔찍한 보안 사고로 이어질 수 있습니다.

**ConfigMap은 민감하지 않은 일반적인 설정 정보를 위한 것**입니다. 비밀번호, API 키, 인증서와 같이 안전하게 보관해야 하는 정보는 \*\*`Secret`\*\*이라는 별도의 전용 리소스를 사용해야 합니다.

---

### 2 단계: Secret - 비밀을 위한 주머니

`Secret`은 사용 방식이 `ConfigMap`과 거의 동일하지만, 다음과 같은 중요한 차이점이 있습니다.

- **목적**: `Secret`은 이름 그대로 '비밀' 정보를 저장하기 위해 만들어졌습니다. 쿠버네티스는 `Secret`을 다룰 때 더 신중하게 동작합니다.
- **인코딩**: `Secret`에 저장되는 값은 기본적으로 **Base64**로 인코딩됩니다. 이는 비밀번호가 실수로 화면에 노출되는 것을 방지해주지만, 암호화(Encryption)는 아니므로 누구나 쉽게 디코딩할 수 있다는 점을 유의해야 합니다. 중요한 것은 **'비밀 정보를 다루고 있다'는 의도를 명확히** 하고, 쿠버네티스가 이를 인지하게 만드는 것입니다.

이제 `todo-list`의 비밀번호들을 담을 `Secret`을 생성해 보겠습니다.

```bash
# todo-db-secret 이라는 이름의 Secret 생성
# --from-literal을 사용하여 Key-Value 쌍을 직접 전달
kubectl create secret generic todo-db-secret \
  --from-literal=MYSQL_PASSWORD=todo \
  --from-literal=MYSQL_ROOT_PASSWORD=root1234

# 생성된 Secret 확인
kubectl get secret todo-db-secret

# NAME             TYPE     DATA   AGE
# todo-db-secret   Opaque   2      5s

# YAML 형식으로 상세 내용 확인
kubectl get secret todo-db-secret -o yaml
```

```yaml
# 출력 결과
apiVersion: v1
data:
  MYSQL_PASSWORD: dG9kbw==         #<-- "todo"가 Base64로 인코딩된 값
  MYSQL_ROOT_PASSWORD: cm9vdA==   #<-- "root"가 Base64로 인코딩된 값
kind: Secret
metadata:
  name: todo-db-secret
  ...
type: Opaque # Opaque 타입은 임의의 Key-Value 쌍을 저장하는 가장 일반적인 Secret 타입
```

`data` 필드의 값들이 알아볼 수 없는 문자열로 인코딩된 것을 확인할 수 있습니다.

---

### 3 단계: Deployment에 Secret 적용하기

`ConfigMap`과 마찬가지로 `envFrom`을 사용하되, `configMapRef` 대신 `secretRef`를 사용하여 `Secret`을 Pod에 주입할 수 있습니다.

먼저, `todo-db-deployment.yaml` 파일에서 하드코딩된 비밀번호 부분을 제거하고, 방금 만든 `Secret`을 참조하도록 수정합니다.

**📄 todo-db-deployment.yaml (수정 후)**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-db
  labels:
    app: todo-db
spec:
  replicas: 1
  selector:
    matchLabels:
      app: todo-db
  template:
    metadata:
      labels:
        app: todo-db
    spec:
      containers:
        - name: mysql
          image: mysql:8.0
          ports:
            - containerPort: 3306
          envFrom:
            - configMapRef:
                name: todo-db-config
            - secretRef: # Secret을 참조합니다.
                name: todo-db-secret
```

하드코딩된 `env` 섹션이 모두 사라지고, `configMapRef`와 `secretRef`로 깔끔하게 정리되었습니다.

이제 **Backend 서버**도 데이터베이스에 접속해야 하므로 비밀번호가 필요합니다. `todo-backend-deployment.yaml` 파일도 동일하게 수정해 줍니다. Backend는 `MYSQL_ROOT_PASSWORD`는 필요 없지만, `envFrom`으로 가져온 후 사용하지 않으면 그만이므로 코드는 동일합니다.

**📄 todo-backend-deployment.yaml**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-backend
  labels:
    app: todo-backend
spec:
  replicas: 1
  selector:
    matchLabels:
      app: todo-backend
  template:
    metadata:
      labels:
        app: todo-backend
    spec:
      containers:
        - name: backend
          image: captainyun/k8s-labs-todo-backend:v1.0
          ports:
            - containerPort: 8080
          env:
            - name: DB_HOST
              value: "todo-db-svc"
          envFrom:
            - configMapRef:
                name: todo-db-config
            - secretRef:
                name: todo-db-secret
```

> **Note:** Backend가 DB에 접속하기 위한 `DB_HOST`는 쿠버네티스 내부 DNS를 통해 Service 이름(`todo-db-svc`)으로 접근할 수 있습니다.

---

### 4 단계: 결과 확인하기

수정된 Deployment들을 클러스터에 적용합니다. `ex02`에서 만들었던 `ConfigMap`도 함께 적용해야 합니다.

```bash
# 이전 실습에서 만든 ConfigMap도 함께 적용
kubectl apply -f ../ex02/todo-db-configmap.yaml

# 수정된 Deployment와 새로운 Backend Deployment 적용
kubectl apply -f todo-db-deployment.yaml
kubectl apply -f todo-backend-deployment.yaml

# Pod들이 정상적으로 Running 상태가 되는지 확인
kubectl get pods
```

DB Pod와 Backend Pod가 모두 정상적으로 실행된다면, Backend가 `Secret`으로부터 비밀번호를 잘 받아서 DB에 성공적으로 연결했다는 의미입니다. 만약 `Secret`의 값이 틀렸다면 Pod는 `CrashLoopBackOff`와 같은 에러 상태에 빠질 것입니다.

이제 **민감 정보를 YAML 파일에서 완전히 제거**하여, 코드를 안전하게 버전 관리 시스템에 저장할 수 있게 되었습니다.

---

### 리소스 정리

```bash
kubectl delete deployment todo-db todo-backend
kubectl delete secret todo-db-secret
kubectl delete configmap todo-db-config
```
