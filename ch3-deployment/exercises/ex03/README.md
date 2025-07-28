# 실습 3: 롤링 업데이트 (Rolling Update)

## 🎯 학습 목표
- `Deployment`의 롤링 업데이트 전략을 이해한다.
- 서비스 중단 없이 애플리케이션 버전을 안전하게 업데이트할 수 있다.
- 업데이트 기록을 확인하고, 이전 버전으로 롤백(Rollback)할 수 있다.

---

서비스를 운영하다 보면 버그 수정이나 기능 추가를 위해 애플리케이션을 새로운 버전으로 업데이트해야 합니다. `Deployment`는 **롤링 업데이트(Rolling Update)** 전략을 기본으로 사용하여, 서비스 중단을 최소화하면서 안전하게 업데이트를 진행합니다.

롤링 업데이트는 **새로운 버전의 Pod를 하나씩 점진적으로 추가**하면서, **기존 버전의 Pod를 하나씩 제거**하는 방식입니다. 이 과정을 통해 업데이트 중에도 항상 요청을 처리할 수 있는 Pod가 최소 1개 이상 유지되므로 서비스 중단(downtime)이 발생하지 않습니다.

### 1. v1.0 Deployment 배포

`todo-list`의 백엔드 `v1.0` 버전을 `replicas: 3`으로 배포합니다.

```yaml
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        # 본인의 v1.0 이미지 주소로 변경
        image: your-dockerhub-username/k8s-labs-todo-backend:v1.0
        ports:
        - containerPort: 8080
```

### 2. v2.0으로 롤링 업데이트

이제 `image` 버전을 `v2.0`으로 변경하여 업데이트를 진행합니다. `backend-deployment.yaml` 파일의 이미지 태그만 수정하고 다시 `apply`하면 됩니다.

```yaml
# backend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: backend-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: backend
  template:
    metadata:
      labels:
        app: backend
    spec:
      containers:
      - name: backend
        # 본인의 v2.0 이미지 주소로 변경
        image: your-dockerhub-username/k8s-labs-todo-backend:v2.0
        ports:
        - containerPort: 8080
```

새 터미널을 열어 Pod의 변화를 관찰(`watch`)하고, 다른 터미널에서 업데이트를 적용합니다.

-   **터미널 1 (관찰용):**
    ```bash
    watch kubectl get pods -l app=backend
    ```

-   **터미널 2 (실행용):**
    ```bash
    kubectl apply -f backend-deployment.yaml
    ```

관찰용 터미널을 보면, 새로운 Pod(`v2.0`)가 `ContainerCreating` 상태로 생성되고, `Running`이 되면 기존 Pod(`v1.0`)가 `Terminating` 상태로 사라지는 과정이 순차적으로 반복되는 것을 볼 수 있습니다.

### 3. 업데이트 기록 확인 및 롤백

`rollout history` 명령으로 업데이트 기록을 확인할 수 있습니다.

```bash
kubectl rollout history deployment backend-deployment
```

만약 `v2.0` 버전에 심각한 버그가 발견되었다면, `rollout undo` 명령으로 즉시 이전 버전으로 돌아갈 수 있습니다.

```bash
kubectl rollout undo deployment backend-deployment
```

다시 관찰용 터미널을 보면, `v1.0` Pod들이 다시 생성되고 `v2.0` Pod들이 사라지는 롤백 과정이 진행됩니다.

### 4. 리소스 정리

```bash
kubectl delete deployment backend-deployment
```