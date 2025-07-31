# 실습 1: `LoadBalancer`의 문제점과 Ingress의 필요성

우리는 이전에 `LoadBalancer` 타입의 서비스를 사용하여 애플리케이션을 외부에 노출하는 방법을 배웠습니다. 이 방법은 클라우드 환경에서 클릭 몇 번으로 외부 IP를 할당받아 서비스를 즉시 노출할 수 있어 매우 편리합니다.

하지만 만약 우리가 수십, 수백 개의 마이크로서비스를 운영한다면 어떨까요? `LoadBalancer` 방식은 심각한 비효율과 비용 문제를 야기합니다. 이번 실습에서는 그 문제점을 직접 눈으로 확인하고, **Ingress**가 왜 필요한지에 대한 강력한 동기를 얻게 될 것입니다.

---

### 📂 예제 파일

| 파일명           | 설명                                                              |
| :--------------- | :---------------------------------------------------------------- |
| `service-a.yaml` | `hello-service`라는 간단한 웹 서버와 `LoadBalancer` 타입의 서비스 |
| `service-b.yaml` | `world-service`라는 간단한 웹 서버와 `LoadBalancer` 타입의 서비스 |

---

### 🎯 학습 목표

1.  `LoadBalancer` 타입 서비스의 동작 방식을 복습한다.
2.  여러 개의 서비스를 `LoadBalancer`로 노출했을 때의 문제점(비용, 관리 포인트 증가)을 이해한다.
3.  Ingress가 '단일 진입점(Single Entrypoint)'으로서 이 문제를 어떻게 해결하는지 개념적으로 이해한다.

---

## 1\. Step 1: 두 개의 `LoadBalancer` 서비스 배포하기

서로 다른 응답을 보내는 두 개의 간단한 웹 애플리케이션을 각각 `LoadBalancer` 타입의 서비스로 배포해 보겠습니다.

**📄 `service-a.yaml`**

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
  type: LoadBalancer # LoadBalancer 타입의 서비스
  selector:
    app: hello-service
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
```

**📄 `service-b.yaml`**

```yaml
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
          # "Hello, world!" 뒤에 버전 정보가 다른 이미지
          image: gcr.io/google-samples/hello-app:2.0
---
apiVersion: v1
kind: Service
metadata:
  name: world-service
spec:
  type: LoadBalancer # LoadBalancer 타입의 서비스
  selector:
    app: world-service
  ports:
    - protocol: TCP
      port: 80
      targetPort: 8080
```

두 개의 YAML 파일을 클러스터에 적용합니다.

```bash
kubectl apply -f service-a.yaml
kubectl apply -f service-b.yaml
```

## 2\. Step 2: 할당된 외부 IP 확인하기

`kubectl get service` 명령어를 실행하여 각 서비스의 상태를 확인해 봅시다.

그리고 현재 실습 환경이 클라우드 환경이 아닌 Minikube 이므로 `minikube tunnel` 명령어를 실행해
여러분의 로컬 PC 네트워크와 Minikube 클러스터를 연결하여 로드밸런서를 시뮬레이션해 줍니다.

⚠️ 중요: minikube tunnel은 별도의 터미널 창에서 실행해야 하며, 실습이 끝날 때까지 그 창을 끄면 안 됩니다.

```Bash
# 새로운 터미널 창을 열고 아래 명령을 실행합니다.
minikube tunnel
```

터널이 성공적으로 연결되었다는 메시지가 뜨면, 그 터미널은 그대로 둔 채 원래 작업하던 터미널로 돌아옵니다.

```bash
kubectl get service

# 예상 출력:
# NAME            TYPE           CLUSTER-IP     EXTERNAL-IP     PORT(S)        AGE
# hello-service   LoadBalancer   10.100.10.1    127.0.0.1       80:31111/TCP   1m
# world-service   LoadBalancer   10.100.20.2    127.0.0.1       80:32222/TCP   1m
# ... (다른 서비스들)
```

**가장 중요한 점:** `hello-service`와 `world-service`가 \*\*서로 다른 `EXTERNAL-IP`\*\*를 할당받은 것을 확인하세요.

## 3\. Step 3: 문제점 인식하기 🤔

우리는 단 두 개의 서비스를 배포했을 뿐인데, 벌써 두 개의 외부 IP 주소를 사용하고 있습니다.

여기서 우리는 다음과 같은 심각한 문제에 직면합니다.

- **💰 비용 문제:** 클라우드 제공업체(GCP, AWS, Azure)는 **공인 IP 주소 하나마다 시간당 비용을 청구**합니다. 만약 우리가 100개의 마이크로서비스를 운영한다면, 100개의 `LoadBalancer` 서비스와 100개의 IP 주소에 대한 비용을 감당해야 합니다. 이것은 엄청난 낭비입니다.

- **🤯 관리 문제:** 각 서비스의 IP 주소를 모두 기억하고 관리해야 합니다. 또한, SSL/TLS 인증서를 적용해야 할 경우, 100개의 모든 로드밸런서에 개별적으로 인증서를 설정하고 갱신해야 하는 끔찍한 상황이 발생합니다.

- **🌐 라우팅의 한계:** `LoadBalancer` 서비스는 단순히 IP와 포트로 들어온 요청을 Pod에게 전달할 뿐, `https://my-domain.com/users` 나 `https://my-domain.com/products` 처럼 **URL 경로에 따라 다른 서비스로 보내는 지능적인 라우팅**을 할 수 없습니다.

## 4\. 해결책: 인그레스(Ingress)의 등장 💡

이 모든 문제를 해결하기 위해 등장한 것이 바로 **인그레스(Ingress)** 입니다.

Ingress는 마치 아파트 단지의 **'정문'** 과 같습니다. 모든 방문객(트래픽)은 이 정문으로만 들어옵니다. 그리고 정문 안내 데스크(Ingress Controller)에서 방문 목적지(URL 경로, 도메인)를 확인하고 "101동은 왼쪽, 102동은 오른쪽"처럼 올바른 동(서비스)으로 안내해주는 역할을 합니다.

- **단일 진입점:** 단 하나의 IP 주소와 로드밸런서만 사용하여 비용을 획기적으로 절감합니다.
- **지능적인 라우팅:** URL 경로, 도메인 이름 등 다양한 조건에 따라 트래픽을 서로 다른 서비스로 분배할 수 있습니다.
- **중앙 집중 관리:** SSL/TLS 인증서 관리, 인증, 로깅 등을 한 곳에서 통합 관리할 수 있습니다.

---

### ⭐ 핵심 정리

- `LoadBalancer` 타입의 서비스는 **서비스마다 별개의 공인 IP를 할당**받아 비용과 관리 측면에서 비효율적이다.
- **Ingress**는 여러 서비스를 위한 \*\*단일 진입점(Single Entrypoint)\*\*을 제공하여 이 문제를 해결한다.
- Ingress를 사용하려면, Ingress 규칙을 실행시켜 줄 **Ingress Controller**가 반드시 클러스터에 설치되어 있어야 한다.

이제 `LoadBalancer` 방식의 한계를 명확히 알았으니, 다음 실습에서는 Ingress의 핵심 동력인 **Ingress Controller를 설치**해 보겠습니다.
