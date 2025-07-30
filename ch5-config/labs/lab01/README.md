# lab01: `todo-list` 애플리케이션 전체 리팩토링

### 🎯 실습 목표

`ch1`~`ch4`를 거치며 배포했던 `todo-list` 3-Tier 애플리케이션의 Deployment YAML 파일들에서, 하드코딩된 모든 설정값과 민감 정보를 **`ConfigMap`과 `Secret`으로 완전히 분리**합니다. 이번 챕터의 `exercises`에서 배운 모든 기술을 종합적으로 적용하여, 운영 환경에서도 사용 가능한 수준의 안전하고 유연한 코드를 완성하는 것이 목표입니다.

---

### 📝 사전 준비: 리팩토링 대상 파일

아래는 현재 `todo-list`의 배포 상태를 나타내는 YAML 파일들입니다. 모든 설정값이 그대로 노출되어 있는 것을 확인할 수 있습니다. 이번 실습의 목표는 이 파일들에서 하드코딩된 부분을 모두 제거하는 것입니다.

**📄 db-deployment.yaml (리팩토링 전)**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mysql-db
spec:
  selector:
    matchLabels:
      app: mysql-db
  replicas: 1
  template:
    metadata:
      labels:
        app: mysql-db
    spec:
      containers:
        - name: mysql
          image: mysql:8.0
          ports:
            - containerPort: 3306
          env:
            - name: MYSQL_ROOT_PASSWORD
              value: "1234"
            - name: MYSQL_DATABASE
              value: "todolist"
```

### 미션 1: 일반 설정 분리 (ConfigMap)

todo-list 애플리케이션의 민감하지 않은 모든 설정값을 담는 ConfigMap을 todo-list-config.yaml 파일로 생성하세요.

대상: MYSQL_DATABASE , CORS_ALLOWED_ORIGINS 등

db-deployment.yaml과 backend-deployment.yaml 파일을 수정하여, 하드코딩된 값을 지우고 방금 만든 ConfigMap을 envFrom으로 참조하도록 변경하세요.

### 미션 2: 민감 정보 분리 (Secret)

todo-list 애플리케이션의 민감한 모든 정보(비밀번호 등)를 담는 Secret을 todo-list-secret.yaml 파일로 생성하거나 kubectl create secret 명령어로 생성하세요.

대상: MYSQL_ROOT_PASSWORD, MYSQL_PASSWORD, JWT_SECRET 등

주의: Secret의 data 필드에 값을 넣을 때는 반드시 Base64로 인코딩해야 합니다.

```Bash
# 예: 'pass'를 Base64로 인코딩
echo -n 'pass' | base64
```

db-deployment.yaml과 backend-deployment.yaml 파일을 수정하여, 하드코딩된 값을 지우고 방금 만든 Secret을 envFrom으로 참조하도록 변경하세요.
