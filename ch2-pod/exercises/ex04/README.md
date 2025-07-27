
# 실습 4: Pod에 리소스 제한 설정

이 실습에서는 Pod에 CPU 및 메모리 리소스를 제한하는 방법을 배웁니다.

## 1. Pod YAML 파일 작성

`resource-pod.yaml` 파일을 생성하고 아래 내용을 작성합니다.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: resource-pod
spec:
  containers:
  - name: resource-container
    image: nginx
    ports:
    - containerPort: 80
    resources:
      requests:
        cpu: "100m"
        memory: "128Mi"
      limits:
        cpu: "200m"
        memory: "256Mi"
```

## 2. Pod 생성 및 상태 확인

Pod를 생성하고 상태를 확인하여 리소스 제한이 적용되었는지 확인합니다.

```bash
kubectl apply -f resource-pod.yaml
kubectl describe pod resource-pod
```

## 3. Pod 삭제

실습이 끝나면 아래 명령어로 Pod를 삭제합니다.

```bash
kubectl delete -f resource-pod.yaml
```
