
# 실습 2: YAML 파일을 이용한 Pod 생성

이 실습에서는 YAML 파일을 사용하여 Pod를 생성하는 방법을 배웁니다.

## 1. Pod YAML 파일 작성

`nginx-pod.yaml(.yml)` 파일을 생성하고 아래 내용을 작성합니다.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: nginx-pod-yaml
spec:
  containers:
  - name: nginx-container
    image: nginx
    ports:
    - containerPort: 80
```

## 2. YAML 파일을 이용한 Pod 생성

작성한 YAML 파일을 사용하여 Pod를 생성합니다.

```bash
kubectl apply -f nginx-pod.yaml
```

## 3. Pod 상태 확인

생성된 Pod의 상태를 확인합니다.

```bash
kubectl get pods
kubectl describe pod nginx-pod-yaml
kubectl logs nginx-pod-yaml
kubectl get events
```

## 4. Pod 삭제

실습이 끝나면 아래 명령어로 Pod를 삭제합니다.

```bash
kubectl delete -f nginx-pod.yaml
```
