# 실습 3: 경로 기반 라우팅 (Path-based Routing)

`ex02`에서 우리는 Ingress Controller라는 '정문 안내 데스크'를 성공적으로 설치했습니다. 하지만 아직 안내 데스크에는 아무런 '안내 규칙'이 없어 방문객을 어디로 보내야 할지 모르는 상태입니다.

이번 실습에서는 Ingress의 가장 핵심적이고 널리 사용되는 기능인 **경로 기반 라우팅(Path-based Routing)** 규칙을 만들어 보겠습니다. 우리의 목표는 단 하나의 '정문 주소'를 사용하되, `.../hello` 라는 경로로 온 손님은 `hello-service`로, `.../world` 라는 경로로 온 손님은 `world-service`로 정확히 안내하는 것입니다.

---

### 📂 예제 파일

| 파일명          | 설명                                                               |
| :-------------- | :----------------------------------------------------------------- |
| `services.yaml` | 실습에 사용할 두 개의 웹 서버(Deployment)와 내부 서비스(ClusterIP) |
| `ingress.yaml`  | 경로 기반 라우팅 규칙이 정의된 Ingress 리소스                      |

---

### 🎯 학습 목표

1.  Ingress 리소스 YAML 파일의 기본 구조를 이해한다.
2.  `spec.rules`를 사용하여 경로(`path`)에 따라 요청을 다른 서비스로 전달하는 규칙을 작성할 수 있다.
3.  `rewrite-target` 어노테이션의 중요성을 이해하고 적용할 수 있다.
4.  `minikube tunnel`을 사용하여 Docker 드라이버 환경에서도 Ingress 규칙을 안정적으로 테스트할 수 있다.

---

## 1\. Step 1: 테스트용 서비스 준비하기

먼저, 우리가 트래픽을 보낼 목적지인 두 개의 내부 서비스를 준비해야 합니다. 이 서비스들은 외부로 직접 노출될 필요가 없으므로 `type: ClusterIP`로 설정합니다.

**📄 `services.yaml`**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hello-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: hello-service
  template:
    metadata:
      labels:
        app: hello-service
    spec:
      containers:
        - name: web
          image: gcr.io/google-samples/hello-app:1.0
---
apiVersion: v1
kind: Service
metadata:
  name: hello-service
spec:
  type: ClusterIP
  selector:
    app: hello-service
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: world-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: world-service
  template:
    metadata:
      labels:
        app: world-service
    spec:
      containers:
        - name: web
          image: gcr.io/google-samples/hello-app:2.0
---
apiVersion: v1
kind: Service
metadata:
  name: world-service
spec:
  type: ClusterIP
  selector:
    app: world-service
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
```

아래 명령어로 두 개의 Deployment와 두 개의 ClusterIP 서비스를 한 번에 생성합니다.

```bash
kubectl apply -f services.yaml
```

## 2\. Step 2: Ingress 규칙(설계도) 작성하기

이제 Ingress Controller에 전달할 첫 번째 "안내 규칙"을 작성합니다.

**📄 `ingress.yaml`**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
  annotations:
    # NGINX Ingress Controller가 경로를 재작성하도록 지시합니다.
    # 예: /hello 로 들어온 요청을 백엔드 서비스에는 루트 경로(/)로 전달해줍니다.
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
    - http:
        paths:
          # --- 첫 번째 규칙 ---
          - path: /hello
            pathType: Prefix
            backend:
              service:
                name: hello-service
                port:
                  number: 80
          # --- 두 번째 규칙 ---
          - path: /world
            pathType: Prefix
            backend:
              service:
                name: world-service
                port:
                  number: 80
```

작성한 Ingress 규칙을 클러스터에 배포합니다.

```bash
kubectl apply -f ingress.yaml
```

### 3\. Step 3: 외부 접속 통로 설정 및 테스트

이제 우리가 만든 Ingress 규칙이 잘 동작하는지 외부에서 접속하여 테스트할 차례입니다. Docker 드라이버 환경에서 가장 확실한 방법인 `minikube tunnel`을 사용하고, 우리 PC의 80번 포트가 사용 중인 실무 환경을 가정하여 **`8000`번 포트**로 접속하는 실습을 진행하겠습니다.

#### \#\#\# 3-1. Ingress Controller 서비스를 `LoadBalancer` 타입 및 `8000` 포트로 변경

먼저 Ingress Controller 서비스의 `type`을 `LoadBalancer`로 바꾸고, 외부에서 접속할 `port`를 `8000`으로 수정해야 합니다. `kubectl edit` 명령어를 사용해 두 가지를 한 번에 수정하겠습니다.

1.  **`kubectl edit`** 명령어로 `ingress-nginx-controller` 서비스의 설정 파일을 엽니다.

    ```bash
    kubectl edit svc ingress-nginx-controller -n ingress-nginx
    ```

2.  텍스트 편집기가 열리면, **두 군데**를 수정합니다.

    - `spec.ports` 섹션에서 `name`이 `http`인 부분의 **`port` 값을 `80`에서 `8000`으로 수정**합니다.
    - `spec.type` 필드를 `NodePort`에서 \*\*`LoadBalancer`\*\*로 수정합니다.

    **수정 전:**

    ```yaml
    # ... (생략) ...
    spec:
      ports:
        - appProtocol: http
          name: http
          port: 80 # <--- 수정할 부분 1
          protocol: TCP
          targetPort: http
      # ... (생략) ...
      type: NodePort # <--- 수정할 부분 2
    # ... (생략) ...
    ```

    **수정 후:**

    ```yaml
    # ... (생략) ...
    spec:
      ports:
        - appProtocol: http
          name: http
          port: 8000 # <--- 이렇게 8000으로 수정
          protocol: TCP
          targetPort: http
      # ... (생략) ...
      type: LoadBalancer # <--- 이렇게 LoadBalancer로 수정
    # ... (생략) ...
    ```

3.  파일을 저장하고 편집기를 종료합니다. (`vim`의 경우 `ESC` -\> `:wq` -\> `Enter`) 터미널에 `service/ingress-nginx-controller edited` 메시지가 뜨면 성공입니다.

#### \#\#\# 3-2. `minikube tunnel`로 외부 통로 열기

변경된 설정을 적용하기 위해 `minikube tunnel`을 사용하여 윈도우 호스트와 Minikube 클러스터를 연결하는 통로를 엽니다.

1.  **반드시 새로운 터미널 창을 하나 더 엽니다.**
2.  새로운 터미널에서 아래 명령어를 실행합니다. (PC 암호를 물어볼 수 있습니다.)
    ```bash
    minikube tunnel
    ```
3.  터널이 연결되었다는 메시지가 나오면, **이 터미널을 절대로 끄지 말고 그대로 둡니다.**

## 4\. Step 4: 최종 테스트하기

이제 원래 작업하던 **첫 번째 터미널**로 돌아옵니다. `minikube tunnel` 덕분에 이제 우리는 `127.0.0.1`이라는 명확한 주소로 Ingress Controller에 접근할 수 있습니다.

```bash
# 1. /hello 경로로 요청 보내기
curl http://127.0.0.1:8000/hello

# 예상 출력:
# Hello, world! Version: 1.0.0
# Hostname: hello-deployment-xxxxxxxxxx-xxxxx

# 2. /world 경로로 요청 보내기
curl http://127.0.0.1:8000/world

# 예상 출력:
# Hello, world! Version: 2.0.0
# Hostname: world-deployment-xxxxxxxxxx-xxxxx

# 3. 규칙에 없는 경로로 요청 보내기
curl http://127.0.0.1:8000/other

# 예상 출력:
# default backend - 404
```

**결과 분석:**
이제 모든 요청이 `127.0.0.1` 이라는 단일 주소로 전달되었지만, 뒤에 붙은 경로(`/hello`, `/world`)에 따라 Ingress Controller가 규칙을 읽고 요청을 올바른 서비스로 정확하게 배달해 준 것을 확인할 수 있습니다.

---

### ⭐ 핵심 정리

- Ingress 리소스는 `spec.rules` 안에 경로(`path`)에 따라 요청을 다른 `backend.service`로 전달하는 규칙을 정의한다.
- `nginx.ingress.kubernetes.io/rewrite-target: /` 어노테이션은 백엔드 서비스가 경로 문제없이 요청을 받을 수 있도록 도와주는 매우 중요한 설정이다.
- **Docker 드라이버** 환경에서는 \*\*`minikube tunnel`\*\*을 사용하는 것이 외부에서 Ingress Controller에 안정적으로 접속하는 가장 확실한 방법이다.

이제 우리는 단일 진입점을 통해 트래픽을 지능적으로 라우팅하는 방법을 마스터했습니다. 다음 실습에서는 경로가 아닌 \*\*도메인 이름(호스트)\*\*을 기준으로 트래픽을 나누는 방법을 배워보겠습니다.
