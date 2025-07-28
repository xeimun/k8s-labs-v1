# Chapter 4 - Lab02: 또또마켓 앱에 Service 연결하기

## 🎯 최종 목표

-   3-Tier 웹 애플리케이션(Frontend, Backend, DB)을 쿠버네티스에 배포하고 `Service`로 연결할 수 있습니다.
-   내부 통신에는 `ClusterIP`, 외부 노출에는 **`LoadBalancer`** 타입의 서비스를 사용하는 목적과 방법을 이해합니다.
-   (minikube 환경) `minikube tunnel`을 사용하여 `LoadBalancer` Service를 시뮬레이션하고 테스트할 수 있습니다.

---

### 📜 시나리오

당신은 `또또마켓`의 DevOps 엔지니어입니다. `또또마켓`은 하나의 백엔드 서버와 프론트엔드, 데이터베이스로 구성된 **3-Tier 웹 애플리케이션**입니다. `ch3`에서 각 컴포넌트를 `Deployment`로 배포하는 데 성공했고, 이제 `Service`를 통해 이들을 연결하고 사용자들이 접속할 수 있도록 외부에 노출시켜야 합니다.

**요구사항:**

1.  **Database Service:**
    * `database`는 백엔드 서버만 접근하면 됩니다. `ClusterIP` 타입의 `database-service`를 생성하세요.

2.  **Backend Service:**
    * `backend`는 프론트엔드 서버만 접근하면 됩니다. `ClusterIP` 타입의 `backend-service`를 생성하세요.

3.  **Frontend Service:**
    * `frontend`는 실제 사용자들이 접속하는 진입점입니다.
    * 클라우드 환경에 적합한 **`LoadBalancer`** 타입의 `frontend-service`를 생성하여 안정적인 외부 IP를 통해 서비스를 노출하세요.

### 📝 실습 가이드

#### 1단계: Deployment 파일 준비 및 배포

`ch3/labs/lab01`과 유사하게, `ddoddo-market`을 위한 3개의 `Deployment`를 준비하고 배포합니다. (`database`, `backend`, `frontend`)

-   `database-deployment.yaml`
-   `backend-deployment.yaml`
-   `frontend-deployment.yaml`

**❗️수정 포인트:** 각 `Deployment`의 환경 변수가 하드코딩된 IP가 아닌, 생성할 **Service 이름**을 바라보도록 수정해야 합니다.

-   `backend-deployment.yaml` -> `PGHOST`는 `database-service`를 바라보도록 수정
-   `frontend-deployment.yaml` -> API 주소는 `http://backend-service:8080`을 바라보도록 수정

수정이 완료되면 3개의 Deployment를 모두 배포합니다.

#### 2단계: Service YAML 파일 작성

요구사항에 맞게 아래 3개의 `yaml` 파일을 **직접 작성**해보세요.

-   `database-service.yaml` (Type: **ClusterIP**)
-   `backend-service.yaml` (Type: **ClusterIP**)
-   `frontend-service.yaml` (Type: **LoadBalancer**)

#### 3단계: Service 배포 및 `minikube tunnel` 실행

작성한 3개의 Service를 모두 배포합니다. `kubectl get svc`로 확인하면 `frontend-service`의 `EXTERNAL-IP`가 `<pending>` 상태일 것입니다.

이제 **새 터미널**을 열고 `minikube tunnel`을 실행하여 `frontend-service`에 외부 IP를 할당합니다.

```bash
minikube tunnel
```

### 4단계: 최종 테스트
kubectl get svc로 frontend-service의 EXTERNAL-IP가 할당되었는지 다시 확인하고, 해당 IP 주소(http://<EXTERNAL-IP>)로 브라우저에서 접속하여 또또마켓 사이트가 정상적으로 보이는지 확인합니다.

LoadBalancer를 통해 외부 트래픽이 frontend-service로 들어오고, frontend는 backend-service를 통해, backend는 database-service를 통해 통신하여 애플리케이션이 완벽하게 동작하는 것을 확인할 수 있습니다.

### 리소스 정리
```Bash
# 터널 프로세스 중지 (Ctrl + C)
kubectl delete deployment <database-deployment-name> <backend-deployment-name> <frontend-deployment-name>
kubectl delete service database-service backend-service frontend-service
```