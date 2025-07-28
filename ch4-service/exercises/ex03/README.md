# 실습 3: LoadBalancer Service로 안정적인 외부 노출

## 🎯 학습 목표

-   클라우드 환경에 적합한 `Service` 타입인 **LoadBalancer**를 이해한다.
-   `LoadBalancer` Service를 생성하면 클라우드 플랫폼에서 실제 로드 밸런서가 프로비저닝되는 과정을 이해한다.
-   `NodePort` 대비 `LoadBalancer`의 장점을 이해한다.

---

`NodePort`는 각 노드의 IP를 직접 알아야 하고, 해당 노드에 장애가 발생하면 접속이 불가능해지는 단점이 있습니다. **LoadBalancer** 타입의 Service는 이러한 문제를 해결하기 위해 클라우드 서비스 제공자(AWS, GCP, Azure 등)와 연동하여 **외부용 로드 밸런서**를 동적으로 생성하고 서비스에 연결해줍니다.

사용자는 이 로드 밸런서가 제공하는 **단일 Public IP 주소**로 접속하기만 하면, 로드 밸런서가 알아서 트래픽을 건강한 상태의 노드와 Pod로 분산시켜 줍니다.

> ⚠️ **주의:** 이 실습은 AWS(EKS), GCP(GKE), Azure(AKS) 등 실제 클라우드 환경의 쿠버네티스 클러스터에서 정상적으로 동작합니다. **Minikube**나 **Docker Desktop**과 같은 로컬 환경에서는 `minikube tunnel` 이나 별도의 설정이 필요할 수 있습니다.

### 1. Frontend Deployment 배포

`ex02`에서 사용했던 `frontend-deployment.yaml`을 다시 배포합니다.

```bash
kubectl apply -f frontend-deployment.yaml
```

### 2. LoadBalancer Service 배포
frontend-service-loadbalancer.yaml 파일을 apply합니다.

```Bash
kubectl apply -f frontend-service-loadbalancer.yaml
```

### 3. Service 확인 및 외부 접속
get service 명령으로 Service 상태를 확인합니다. 처음에는 EXTERNAL-IP가 <pending> 상태로 표시됩니다. 이는 클라우드 플랫폼이 로드 밸런서를 생성하고 IP를 할당하는 데 시간이 걸리기 때문입니다.

```Bash
# -w 플래그로 상태 변화를 계속 지켜볼 수 있습니다.
kubectl get svc frontend-service -w

# NAME               TYPE           CLUSTER-IP      EXTERNAL-IP   PORT(S)        AGE
# frontend-service   LoadBalancer   10.101.88.106   <pending>     80:31234/TCP   10s

# 잠시 후...
# NAME               TYPE           CLUSTER-IP      EXTERNAL-IP      PORT(S)        AGE
# frontend-service   LoadBalancer   10.101.88.106   35.223.10.123    80:31234/TCP   2m
EXTERNAL-IP에 실제 Public IP가 할당되면, 해당 IP로 브라우저에서 접속하여 애플리케이션을 확인할 수 있습니다.

http://<EXTERNAL-IP>
```

LoadBalancer 타입은 NodePort의 모든 기능을 포함하며, 추가적으로 안정적인 단일 진입점(Public IP)과 트래픽 분산 기능을 제공하므로, 서비스를 외부에 노출하는 가장 표준적인 방법 중 하나입니다.

### 4. 리소스 정리
```Bash
kubectl delete -f frontend-deployment.yaml
kubectl delete -f frontend-service-loadbalancer.yaml
```