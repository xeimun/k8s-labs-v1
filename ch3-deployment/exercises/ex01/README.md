# 실습 1: Pod vs Deployment

## 🎯 학습 목표
- 개별 Pod 관리 방식의 한계를 이해한다.
- `Deployment`가 어떻게 '원하는 상태'를 보장하는지 이해하고, 자동 복구 기능을 확인한다.
- `Deployment`의 기본 구조(replicas, selector, template)를 이해한다.

---

`ch2`에서 우리는 YAML 파일을 사용하여 개별 **Pod**를 만드는 방법을 배웠습니다. 이는 "Pod 하나를 생성하라"는 요청을 쿠버네티스에게 보내는 것과 같습니다. 쿠버네티스는 요청대로 Pod를 생성하고 자신의 임무를 다합니다.

하지만 만약 그 Pod에 장애가 발생하여 종료된다면 어떻게 될까요? 쿠버네티스는 이미 임무를 완수했으므로, 종료된 Pod를 자동으로 다시 살리지 않습니다.

이것이 바로 **개별 Pod 관리의 한계**입니다. 실제 서비스 환경에서는 "Pod 하나를 만들어줘"가 아니라, **"어떤 상황에서든 이 Pod가 항상 1개는 떠 있도록 상태를 유지해줘"** 라고 선언해야 합니다.

이 '상태 유지'의 책임을 지는 것이 바로 **Deployment**입니다.

### 💡 사전 준비

이 챕터의 실습을 진행하기 전에 `apps/todo-list`의 `frontend`와 `backend` 애플리케이션을 직접 컨테이너 이미지로 빌드하고, **본인의 Docker Hub 계정**과 같은 컨테이너 레지스트리에 푸시해야 합니다.

- `your-dockerhub-username/k8s-labs-todo-frontend:v1.0`
- `your-dockerhub-username/k8s-labs-todo-backend:v1.0`
- `your-dockerhub-username/k8s-labs-todo-backend:v2.0`

> ❗️ 아래 모든 예제에서 `your-dockerhub-username` 부분은 실제 본인의 계정으로 수정해야 합니다.

## 실습: Deployment로 Pod 상태 유지하기

### 1. Deployment Manifest 작성

`todo-list`의 프론트엔드 Pod 1개를 항상 유지하는 `Deployment`를 YAML 파일로 작성해 봅시다.

- `spec.replicas`: 원하는 Pod의 개수를 선언합니다.
- `spec.selector`: 이 Deployment가 어떤 Pod를 관리할지 선택하는 규칙입니다.
- `spec.template`: 이 Deployment가 생성할 Pod의 명세(청사진)입니다. `template.metadata.labels`는 반드시 `selector`와 일치해야 합니다.

```yaml
# frontend-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend # Selector와 일치해야 함
    spec:
      containers:
      - name: frontend
        image: your-dockerhub-username/k8s-labs-todo-frontend:v1.0 # 본인의 이미지 주소로 변경
        ports:
        - containerPort: 3000
```

### 2. Deployment 배포 및 Pod 확인

Deployment를 배포하고, 이 Deployment가 생성한 Pod를 확인합니다.

```bash
kubectl apply -f frontend-deployment.yaml
kubectl get pod -l app=frontend
# NAME                                   READY   STATUS    RESTARTS   AGE
# frontend-deployment-5d5f8f669c-abcde   1/1     Running   0          25s
```

### 3. 장애 상황 재현 및 자동 복구 확인

이제 Deployment가 관리하는 Pod를 강제로 삭제하여 장애 상황을 만들어 봅시다.

```bash
# Pod 이름은 위에서 확인한 실제 이름으로 변경
kubectl delete pod frontend-deployment-5d5f8f669c-abcde
```

잠시 후 다시 Pod 목록을 확인해 보세요.

```bash
kubectl get pod -l app=frontend
# NAME                                   READY   STATUS    RESTARTS   AGE
# frontend-deployment-5d5f8f669c-xyz12   1/1     Running   0          5s  <-- 새로운 Pod가 생성됨!
```

Deployment는 `replicas: 1` 이라는 **선언된 상태**를 유지하기 위해, Pod가 사라진 것을 감지하고 즉시 새로운 Pod를 생성하여 복구합니다.

### 4. 리소스 정리

```bash
kubectl delete -f frontend-deployment.yaml
```