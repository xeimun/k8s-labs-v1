# Chapter 4 - Lab01: Todo-List 앱에 Service 연결하기 (3-Tier)

## 🎯 최종 목표

-   `database`, `backend`, `frontend` 각 Tier에 적절한 타입의 `Service`를 직접 정의하고 배포하여 전체 애플리케이션이 정상적으로 동작하도록 만듭니다.
-   `ClusterIP`와 `NodePort` Service의 역할을 이해하고 용도에 맞게 사용할 수 있습니다.
-   Service의 `selector`를 통해 `Deployment`와 정확하게 연결할 수 있습니다.
-   환경 변수에서 IP 주소 대신 **Service 이름**을 사용하여 Pod 간 통신을 구성할 수 있습니다.

---

### 📜 시나리오

당신은 DevOps 엔지니어입니다. `ch3`에서 `Deployment`를 통해 `todo-list` 애플리케이션의 각 컴포넌트를 배포했지만, 아직 서로 통신할 수 없는 상태입니다. 이제 각 `Deployment`에 **Service**를 연결하여 애플리케이션 전체가 유기적으로 동작하도록 만들어야 합니다.

**요구사항:**

1.  **Database Tier:**
    * `database`는 클러스터 외부로 노출될 필요가 없습니다. `backend` Pod들만 접근하면 됩니다.
    * `database-service.yaml` 파일을 작성하여 `ClusterIP` 타입의 서비스를 생성하세요.
    * Service 이름은 `database-service`로 합니다.

2.  **Backend Tier:**
    * `backend` 역시 클러스터 외부로 직접 노출될 필요는 없습니다. `frontend` Pod들만 접근하면 됩니다.
    * `backend-service.yaml` 파일을 작성하여 `ClusterIP` 타입의 서비스를 생성하세요.
    * Service 이름은 `backend-service`로 합니다.

3.  **Frontend Tier:**
    * `frontend`는 사용자가 브라우저를 통해 접속해야 하는 최종 애플리케이션입니다.
    * `frontend-service.yaml` 파일을 작성하여 `NodePort` 타입의 서비스를 생성하여 외부에서 접근할 수 있도록 하세요.
    * Service 이름은 `frontend-service`로 합니다.

### 📝 실습 가이드

#### 1단계: Deployment 파일 준비 및 수정

`ch3/labs/lab01`에서 사용했던 3개의 `Deployment` 파일을 이 디렉토리로 복사하고, Service 통신을 위해 아래와 같이 환경 변수를 수정합니다.

-   `backend-deployment.yaml`의 `PGHOST` 값을 `database-service`로 변경합니다.
-   `frontend-deployment.yaml`의 `REACT_APP_API_URL` 값을 `http://backend-service:8080`으로 변경합니다.

수정이 완료되면 3개의 Deployment를 모두 배포합니다.

```bash
kubectl apply -f database-deployment.yaml
kubectl apply -f backend-deployment.yaml
kubectl apply -f frontend-deployment.yaml
```

#### 2단계: Service YAML 파일 작성 (학생 과제)
요구사항에 맞게 아래 3개의 yaml 파일을 직접 작성해보세요. ch4/exercises 폴더의 예제들을 참고하세요.

database-service.yaml (Type: ClusterIP)
backend-service.yaml (Type: ClusterIP)
frontend-service.yaml (Type: NodePort)

Hint: Service의 spec.selector.app 값은 연결하려는 Deployment의 template.metadata.labels.app 값과 일치해야 합니다!

### 3단계: Service 배포 및 최종 테스트
작성한 3개의 Service를 모두 배포하고, kubectl get service 명령으로 상태를 확인합니다. frontend-service의 NodePort 정보를 확인한 후, 브라우저를 통해 접속하여 Todo List 앱의 모든 기능(조회, 추가, 삭제)이 정상 동작하는지 확인하세요.

```Bash
# 로컬 환경 (minikube, Docker Desktop)
minikube service frontend-service
모든 기능이 정상 동작한다면, Service를 통해 3-Tier 애플리케이션의 통신을 성공적으로 구축한 것입니다! 🎉
```

#### 리소스 정리
```Bash
kubectl delete deployment database-deployment backend-deployment frontend-deployment
kubectl delete service database-service backend-service frontend-service
```