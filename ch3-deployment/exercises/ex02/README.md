# 실습 2: 스케일링 (Scaling)

## 🎯 학습 목표
- `Deployment`의 `replicas` 값을 변경하여 Pod의 개수를 동적으로 조절(스케일링)할 수 있다.
- **Scale Out**(확장)과 **Scale In**(축소)을 직접 수행한다.

---

서비스에 트래픽이 몰리면 더 많은 Pod를 실행하여 부하를 분산(Scale Out)해야 하고, 트래픽이 줄어들면 자원 낭비를 막기 위해 Pod의 개수를 줄여야(Scale In) 합니다. `Deployment`를 사용하면 YAML 파일의 `replicas` 숫자 하나만 변경하여 이 과정을 매우 간단하게 처리할 수 있습니다.

### 1. Deployment 배포

`ex01`에서 사용했던 `frontend-deployment.yaml`을 다시 배포합니다. (`replicas: 1`)

```bash
kubectl apply -f frontend-deployment.yaml
kubectl get pod -l app=frontend # Pod가 1개인지 확인
```

### 2. Scale Out: Pod 개수 늘리기

서비스에 사용자가 몰리기 시작했다고 가정하고, Pod를 3개로 늘려보겠습니다. `frontend-deployment.yaml` 파일의 `replicas` 값을 `1`에서 `3`으로 수정한 뒤, 다시 `apply` 합니다.

```yaml
# frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
spec:
  replicas: 3 # 1에서 3으로 수정
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: your-dockerhub-username/todo-list-frontend:v1.0
        ports:
        - containerPort: 3000
```

```bash
kubectl apply -f frontend-deployment.yaml
```

💡 **Tip:** `kubectl scale deployment frontend-deployment --replicas=3` 명령어를 사용해도 동일한 결과를 얻을 수 있지만, 항상 YAML 파일(선언)을 기준으로 관리하는 습관을 들이는 것이 좋습니다.

잠시 후 Pod 목록을 확인하면, 새로운 Pod 2개가 추가로 생성되어 총 3개가 실행 중인 것을 볼 수 있습니다.

```bash
kubectl get pod -l app=frontend
# NAME                                   READY   STATUS    RESTARTS   AGE
# frontend-deployment-5d5f8f669c-abcde   1/1     Running   0          5m
# frontend-deployment-5d5f8f669c-fghij   1/1     Running   0          30s
# frontend-deployment-5d5f8f669c-klmno   1/1     Running   0          30s
```

### 3. Scale In: Pod 개수 줄이기

새벽 시간이 되어 사용자가 줄었다고 가정하고, Pod를 다시 1개로 줄여보겠습니다. `replicas` 값을 `1`로 변경하고 다시 적용하면 됩니다.

```yaml
# frontend-deployment.yaml의 replicas를 1로 수정 후 apply
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
spec:
  replicas: 1 # 3에서 1로 수정
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: your-dockerhub-username/todo-list-frontend:v1.0
        ports:
        - containerPort: 3000
```

```bash
kubectl apply -f frontend-deployment.yaml
```

Pod 목록을 확인하면, 2개의 Pod가 `Terminating` 상태가 되면서 사라지고 최종적으로 1개의 Pod만 남게 됩니다.

### 4. 리소스 정리

```bash
kubectl delete -f frontend-deployment.yaml
```