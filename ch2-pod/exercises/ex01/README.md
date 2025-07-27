
# 실습 1: 기본적인 Pod 생성 및 확인

이 실습에서는 가장 기본적인 Pod를 생성하고 상태를 확인하는 방법을 배웁니다.

## 1. Pod 생성

아래 명령어를 사용하여 `nginx` 이미지를 사용하는 Pod를 생성합니다.

```bash
kubectl run nginx-pod --image=nginx --port=80
```

## 2. Pod 상태 확인

생성된 Pod의 상태를 확인합니다.

```bash
# Pod 목록 확인
kubectl get pods

# Pod 상세 정보 확인
kubectl describe pod nginx-pod
```

## 3. Pod 삭제

실습이 끝나면 아래 명령어로 Pod를 삭제합니다.

```bash
kubectl delete pod nginx-pod
```
