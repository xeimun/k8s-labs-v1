# 실습 2: NodePort Service로 서비스 외부 노출하기

## 🎯 학습 목표

-   `Service`를 클러스터 외부로 노출시키는 방법 중 하나인 **NodePort** 타입을 이해한다.
-   `NodePort` Service를 생성하고, `Node IP:NodePort` 주소로 서비스에 외부에서 접근할 수 있다.
-   `port`, `targetPort`, `nodePort`의 관계를 이해한다.

---

`ClusterIP`는 클러스터 내부 통신에만 사용할 수 있습니다. 만약 우리가 만든 웹 애플리케이션을 브라우저에서 직접 접속하려면, 서비스를 클러스터 외부 세계에 노출시켜야 합니다. **NodePort**는 그 방법 중 하나입니다.

`type: NodePort`로 Service를 생성하면, 쿠버네티스는 클러스터의 **모든 노드(워커 노드)**에 특정 포트(기본적으로 30000-32767 사이)를 할당하여 열어줍니다. 그러면 우리는 `http://<아무 노드의 IP>:<할당된 포트>` 주소로 해당 서비스에 접근할 수 있게 됩니다.

### 1. Frontend Deployment 배포

`ex01`에서 사용했던 `frontend-deployment.yaml`을 다시 배포합니다.

```bash
kubectl apply -f frontend-deployment.yaml
```

### 2. NodePort Service 배포
frontend-service-nodeport.yaml 파일을 apply하여 frontend-deployment를 외부에 노출시킵니다.

```YAML
# frontend-service-nodeport.yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  type: NodePort
  selector:
    app: frontend
  ports:
  - port: 3000       # Service의 ClusterIP 포트
    targetPort: 3000 # Pod의 컨테이너 포트
    nodePort: 30007  # ❗️ 모든 노드에 30007 포트를 개방 (지정하지 않으면 랜덤 할당)
```

```Bash
kubectl apply -f frontend-service-nodeport.yaml
```

### 3. Service 확인 및 외부 접속
get service 명령으로 Service를 확인합니다. TYPE이 NodePort로 되어 있고, PORT(S)에 3000:30007/TCP 와 같이 NodePort 정보가 표시됩니다.

```Bash
kubectl get svc frontend-service
# NAME               TYPE       CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
# frontend-service   NodePort   10.101.88.106   <none>        3000:30007/TCP   15s
```

이제 워커 노드의 IP 주소와 30007 포트를 사용하여 브라우저에서 접속할 수 있습니다.
Minikube, Docker Desktop 등 로컬 환경:

```Bash
# minikube ip 명령어 또는 docker ps로 노드 IP 확인
minikube service frontend-service
# 자동으로 브라우저가 열리며 서비스에 접속됩니다.
```

```Bash
# 워커 노드의 Public IP 확인
kubectl get nodes -o wide
브라우저 주소창에 http://<워커 노드의 Public IP>:30007 을 입력하여 접속합니다.
```

💡 주의: NodePort 방식은 주로 개발이나 테스트 단계에서 임시로 서비스를 노출할 때 사용됩니다. 실제 운영 환경에서는 보안 및 관리상의 이유로 다음에 배울 LoadBalancer나 Ingress를 사용하는 것이 일반적입니다.

4. 리소스 정리

```Bash
kubectl delete -f frontend-deployment.yaml
kubectl delete -f frontend-service-nodeport.yaml
```