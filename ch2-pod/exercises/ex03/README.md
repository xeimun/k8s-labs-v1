
# 실습 3: Pod에 환경 변수 설정

이 실습에서는 Pod에 환경 변수를 설정하는 방법을 배웁니다.

## 1. Pod YAML 파일 작성

`env-pod.yaml` 파일을 생성하고 아래 내용을 작성합니다.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: env-pod
spec:
  containers:
  - name: env-container
    image: busybox
    command: ["/bin/sh", "-c", "while true; do printenv; sleep 3600; done"]
    env:
    - name: MY_ENV_VAR
      value: "my-value"
```

## 2. Pod 생성 및 로그 확인

Pod를 생성하고 로그를 통해 환경 변수가 설정되었는지 확인합니다.

```bash
kubectl apply -f env-pod.yaml
kubectl logs env-pod
```

## 3. Pod 삭제

실습이 끝나면 아래 명령어로 Pod를 삭제합니다.

```bash
kubectl delete -f env-pod.yaml
```
