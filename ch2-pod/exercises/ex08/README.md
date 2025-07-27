# 실습 8: 3티어 애플리케이션을 Pod로 배포하기

이 실습에서는 이전에 만든 `todo-list` 애플리케이션의 각 컴포넌트(frontend, backend, database)를 개별 Pod로 생성하여 멀티 컨테이너 애플리케이션을 쿠버네티스에 배포하는 경험을 합니다.

**참고:** 이 실습은 Pod의 기본적인 기능만을 사용하므로, Pod가 재시작되면 데이터가 사라지고 다른 Pod와 통신할 수 없는 등 실제 운영 환경에서는 사용할 수 없는 한계점을 명확히 이해하는 것을 목표로 합니다.

## 1. Docker 이미지 빌드 및 푸시

이 실습을 진행하기 전에 `apps/todo-list` 애플리케이션의 `frontend`와 `backend` 이미지를 빌드하고 Docker Hub와 같은 컨테이너 레지스트리에 푸시해야 합니다.

**중요:** 아래 명령어에서 `your-dockerhub-username` 부분을 실제 Docker Hub 사용자 이름으로 변경해야 합니다.

### 1.1. Docker Hub 로그인

```bash
docker login
```

### 1.2. Backend 이미지 빌드 및 푸시

```bash
cd apps/todo-list/backend
docker build -t your-dockerhub-username/k8s-labs-todo-backend:latest .
docker push your-dockerhub-username/k8s-labs-todo-backend:latest
cd ../../..
```

### 1.3. Frontend 이미지 빌드 및 푸시

```bash
cd apps/todo-list/frontend
docker build -t your-dockerhub-username/k8s-labs-todo-frontend:latest .
docker push your-dockerhub-username/k8s-labs-todo-frontend:latest
cd ../../..
```

이제 아래 YAML 파일들에서 `your-dockerhub-username` 부분을 실제 Docker Hub 사용자 이름으로 변경해야 합니다.

## 2. PostgreSQL Pod 생성

데이터베이스를 위한 PostgreSQL Pod를 생성합니다. `postgres-pod.yaml` 파일을 작성하고 적용합니다.

```bash
kubectl apply -f postgres-pod.yaml
```

## 3. Backend Pod 생성

애플리케이션의 백엔드 서버를 위한 Pod를 생성합니다. `backend-pod.yaml` 파일을 작성하고 적용합니다.

```bash
kubectl apply -f backend-pod.yaml
```

## 4. Frontend Pod 생성

애플리케이션의 프론트엔드 UI를 위한 Pod를 생성합니다. `frontend-pod.yaml` 파일을 작성하고 적용합니다.

```bash
kubectl apply -f frontend-pod.yaml
```

## 5. Pod 상태 확인 및 한계점 고민

모든 Pod들이 정상적으로 실행되는지 확인합니다.

```bash
kubectl get pods -o wide
```

- 각 Pod는 자신만의 IP 주소를 가집니다.
- `frontend` Pod에서 `backend` Pod로 어떻게 접근할 수 있을까요?
- `postgres-pod`가 재시작되면 데이터는 어떻게 될까요?

이러한 문제점들은 다음 챕터에서 배울 `Service`, `PersistentVolume` 등을 통해 해결할 수 있습니다.

## 6. Pod 삭제

실습이 끝나면 아래 명령어로 모든 Pod를 삭제합니다.

```bash
kubectl delete pod --all
```
