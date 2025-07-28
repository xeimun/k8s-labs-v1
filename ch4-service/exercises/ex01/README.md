# 실습 1: ClusterIP Service로 Pod 간 통신하기

## 🎯 학습 목표

-   `Service`의 필요성과 역할을 이해한다.
-   가장 기본적인 `Service` 타입인 **ClusterIP**의 개념을 이해한다.
-   `Service`를 생성하여 여러 개의 Pod를 단일 엔드포인트로 묶고, Pod 간의 통신을 활성화할 수 있다.
-   쿠버네티스의 내부 DNS를 통해 서비스 이름으로 다른 Pod에 접근할 수 있음을 이해한다.

---

`ch3`에서 우리는 `Deployment`를 통해 Pod를 안정적으로 유지하는 방법을 배웠습니다. 하지만 `frontend` Pod와 `backend` Pod는 여전히 서로 통신할 수 없었습니다. Pod는 언제든 죽고 다시 생성될 수 있어 IP 주소가 계속 바뀌기 때문입니다.

**Service**는 이렇게 동적으로 변하는 Pod들에게 **고정된 접속 지점(엔드포인트)**을 제공하는 역할을 합니다.

**ClusterIP**는 가장 기본적인 Service 타입으로, **클러스터 내부에서만 사용 가능한 고유한 가상 IP**를 할당받습니다. 이 IP 주소는 Service가 살아있는 동안 절대 변하지 않으며, 클러스터 내의 다른 Pod들은 이 IP나 **서비스 이름**을 통해 Service에 연결된 Pod들에게 접근할 수 있습니다.

### 1. Backend Deployment와 Service 배포

먼저 `backend`를 위한 `Deployment`와 `Service`를 배포합니다. `backend-service.yaml` 파일은 `app=backend` 레이블을 가진 Pod들을 찾아내어 `8080` 포트로 묶어주는 역할을 합니다.

```bash
kubectl apply -f backend-deployment.yaml
kubectl apply -f backend-service.yaml
```

get service 또는 get svc 명령으로 생성된 Service를 확인합니다. CLUSTER-IP가 할당된 것을 볼 수 있습니다.

```Bash
kubectl get service backend-service
# NAME              TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)    AGE
# backend-service   ClusterIP   10.108.111.22   <none>        8080/TCP   10s
```

### 2. Frontend Deployment 배포
이제 frontend Deployment를 배포합니다. frontend-deployment.yaml 파일의 REACT_APP_API_URL 환경 변수 값을 주목하세요.

```YAML
# frontend-deployment.yaml
...
        env:
        - name: REACT_APP_API_URL
          # ❗️ IP 주소가 아닌 Service의 이름(backend-service)으로 접근합니다!
          value: "http://backend-service:8080"
```
쿠버네티스 클러스터는 내부에 DNS 시스템을 갖추고 있어, Pod들은 다른 Service의 이름을 마치 도메인 이름처럼 사용하여 통신할 수 있습니다.

```Bash
kubectl apply -f frontend-deployment.yaml
```

### 3. 통신 확인 (임시 Pod 사용)
아직 frontend를 외부에서 직접 접속할 방법이 없으므로, 클러스터 내부에 임시 Pod를 하나 띄워서 frontend가 backend와 통신하는지 간접적으로 확인해보겠습니다.

```Bash
# 디버깅용 임시 Pod 실행
kubectl run debug-pod --image=busybox:latest -it --rm -- /bin/sh

# Pod 내부에서 backend-service로 요청
/ # wget -qO- http://backend-service:8080/api/todos
# (backend가 db에 연결되지 않아 에러가 발생할 수 있지만, Service를 통해 backend Pod까지 요청이 도달하는 것을 확인하는 것이 중요)
이 실습을 통해 우리는 Service가 Pod들에게 안정적인 내부 엔드포인트를 제공하고, DNS 기반의 서비스 디스커버리를 가능하게 한다는 것을 확인했습니다.
```

### 4. 리소스 정리

```Bash
kubectl delete deployment backend-deployment frontend-deployment
kubectl delete service backend-service
```