# ex02: "실전 프로젝트 적용" - `todo-list`의 일반 설정 분리

### 🎯 학습 목표

- `ex01`에서 배운 `ConfigMap` 개념을 실제 프로젝트에 적용하여 리팩토링한다.
- YAML 파일을 통해 선언적으로 `ConfigMap`을 정의하고 관리하는 방법을 익힌다.
- `envFrom`을 사용하여 `ConfigMap`의 모든 데이터를 한 번에 환경변수로 주입하는 효율적인 방법을 학습한다.

---

### 1 단계: 리팩토링 대상 확인하기

`ch4-service`에서 완성했던 `todo-list`의 데이터베이스 디플로이먼트 매니페스트 파일 (`todo-db-deployment.yaml` 라고 가정)을 살펴봅시다. 데이터베이스 설정 정보가 YAML 파일에 직접 하드코딩되어 있습니다.

**📄 todo-db-deployment.yaml (수정 전)**

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
          env:
            - name: MYSQL_DATABASE # <-- 일반 설정
              value: "tododb"
            - name: MYSQL_USER # <-- 일반 설정
              value: "todouser"
            - name: MYSQL_PASSWORD # <-- 민감 정보 (Secret으로 분리 예정)
              value: "todo1234"
            - name: MYSQL_ROOT_PASSWORD # <-- 민감 정보 (Secret으로 분리 예정)
              value: "root1234"
```

이번 실습에서는 이 중 민감하지 않은 일반 설정(MYSQL_DATABASE, MYSQL_USER)을 ConfigMap으로 분리하는 작업을 진행합니다. (비밀번호는 ex04에서 Secret으로 분리할 예정입니다.)

### 2 단계: YAML 파일로 ConfigMap 정의하기

커맨드라인으로 만드는 대신, YAML 파일로 ConfigMap을 직접 정의해 보겠습니다. 이 방식은 설정을 파일로 관리할 수 있어 Git과 같은 버전 관리 시스템과 함께 사용하기에 매우 유용합니다.

📄 todo-db-configmap.yaml

```YAML
apiVersion: v1
kind: ConfigMap
metadata:
  name: todo-db-config  # ConfigMap의 이름
data:
  # 여기에 분리할 설정값들을 Key-Value 형태로 정의합니다.
  MYSQL_DATABASE: "tododb"
  MYSQL_USER: "todouser"
```

위 YAML 파일을 클러스터에 적용하여 ConfigMap 리소스를 생성합니다.

```Bash
# ConfigMap 생성
kubectl apply -f todo-db-configmap.yaml

# 생성된 ConfigMap 확인
kubectl get configmap todo-db-config

# NAME             DATA   AGE
# todo-db-config   2      3s
```

### 3 단계: Deployment에 ConfigMap 적용하기 (envFrom)

이제 todo-db-deployment.yaml 파일을 수정하여, 하드코딩된 값을 지우고 todo-db-config ConfigMap을 참조하도록 변경합니다.

이번에는 valueFrom 대신 envFrom을 사용합니다. envFrom은 지정된 ConfigMap의 모든 Key-Value 쌍을 가져와서 컨테이너의 환경변수로 만들어주는 매우 편리한 기능입니다.

📄 todo-db-deployment.yaml (수정 후)

```YAML
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
        envFrom: # env 대신 envFrom 사용
        - configMapRef:
            name: todo-db-config # 참조할 ConfigMap의 이름
        env:
        # 비밀번호는 아직 하드코딩 상태로 둡니다. (ex04에서 Secret으로 변경 예정)
        - name: MYSQL_PASSWORD
          value: "user1234"
        - name: MYSQL_ROOT_PASSWORD
          value: "root1234"
```

수정된 Deployment를 클러스터에 적용합니다.

```Bash
# 수정된 Deployment 적용
kubectl apply -f todo-db-deployment.yaml

# deployment.apps/todo-db configured
```

### 4 단계: 설정이 올바르게 주입되었는지 확인하기

Deployment가 재배포된 후, Pod에 접속하여 환경변수가 ConfigMap의 값으로 올바르게 설정되었는지 확인해 봅시다.

```Bash
# 새로 생성된 Pod 이름 확인
kubectl get pods -l app=todo-db

# NAME                      READY   STATUS    RESTARTS   AGE
# todo-db-xxxxxxxxxx-xxxxx   1/1     Running   0          20s

# Pod에 접속하여 환경변수 출력
# (Pod 이름을 자신의 환경에 맞게 수정하세요)
kubectl exec todo-db-xxxxxxxxxx-xxxxx -- printenv | grep MYSQL

# 출력 결과 확인
# MYSQL_DATABASE=tododb
# MYSQL_USER=todouser
# MYSQL_PASSWORD=todo1234
# MYSQL_ROOT_PASSWORD=root1234
```

MYSQL_DATABASE와 MYSQL_USER가 우리가 ConfigMap에 정의한 값으로 잘 설정된 것을 볼 수 있습니다.

이로써 todo-list 프로젝트의 일반 설정을 성공적으로 분리했습니다. 이제 설정 변경이 필요할 때 Deployment YAML이 아닌, todo-db-configmap.yaml 파일만 수정하고 적용하면 되므로 훨씬 유연한 관리가 가능해졌습니다.

#### 리소스 정리

```Bash
kubectl delete deployment todo-db
kubectl delete configmap todo-db-config
```
