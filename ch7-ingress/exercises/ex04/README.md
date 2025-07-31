# 실습 4: 호스트 기반 라우팅 (Host-based Routing)

이전 실습에서는 URL의 \*\*경로(path)\*\*에 따라 트래픽을 나누는 방법을 배웠습니다. Ingress는 경로뿐만 아니라, 사용자가 접속을 요청한 \*\*도메인 이름(호스트)\*\*을 기준으로도 트래픽을 분배하는 강력한 기능을 제공합니다.

예를 들어, `blog.my-service.com`으로 온 요청은 블로그 서비스로 보내고, `shop.my-service.com`으로 온 요청은 쇼핑몰 서비스로 보내는 것이 가능합니다. 이 모든 것을 단 하나의 IP 주소 위에서 할 수 있습니다.

이번 실습에서는 `a.example.com`과 `b.example.com`이라는 가상의 도메인을 만들고, 각 도메인으로 들어오는 요청을 서로 다른 서비스로 라우팅하는 방법을 배워보겠습니다.

---

### 📂 예제 파일

| 파일명                    | 설명                                            |
| :------------------------ | :---------------------------------------------- |
| `ingress-host-based.yaml` | 호스트 기반 라우팅 규칙이 정의된 Ingress 리소스 |

---

### 🎯 학습 목표

1.  호스트 기반 라우팅의 개념과 사용 사례를 이해한다.
2.  로컬 PC의 `hosts` 파일을 수정하여 특정 도메인 이름이 원하는 IP 주소를 가리키도록 설정할 수 있다.
3.  Ingress 리소스에 `spec.rules.host`를 사용하여 호스트 기반 규칙을 작성할 수 있다.
4.  가상 도메인 이름을 사용하여 라우팅이 정상적으로 동작하는 것을 검증할 수 있다.

---

## 1\. Step 1: 로컬 PC에 가상 도메인 만들기 (`hosts` 파일 수정)

실제 도메인(`example.com`)을 구매하지 않아도, 내 PC에서만큼은 특정 도메인 이름을 원하는 IP 주소로 연결하도록 '속이는' 방법이 있습니다. 바로 `hosts` 파일을 이용하는 것입니다.

우리는 `a.example.com`과 `b.example.com` 두 도메인 모두 `minikube tunnel`이 제공하는 `127.0.0.1`을 가리키도록 설정할 것입니다.

**⚠️ 중요:** `hosts` 파일을 수정하려면 관리자 권한이 필요합니다.

- **Windows:**

  1.  '메모장(Notepad)'을 **'관리자 권한으로 실행'** 합니다.
  2.  `파일 > 열기`를 선택하고 `C:\Windows\System32\drivers\etc` 경로로 이동합니다.
  3.  파일 형식을 '모든 파일'로 변경한 뒤 `hosts` 파일을 엽니다.

- **macOS / Linux:**

  1.  터미널을 열고 `sudo nano /etc/hosts` 명령어를 입력합니다.

`hosts` 파일을 열었다면, 파일의 맨 아래에 다음 두 줄을 추가하고 저장하세요.

```
# Minikube Ingress 연습용 가상 도메인
127.0.0.1 a.example.com
127.0.0.1 b.example.com
```

**확인:** 터미널에서 `ping a.example.com`을 실행했을 때, `127.0.0.1`로부터 응답이 오는지 확인해 보세요.

## 2\. Step 2: 호스트 기반 Ingress 규칙 작성하기

이제 `a.example.com`으로 온 요청은 `hello-service`로, `b.example.com`으로 온 요청은 `world-service`로 보내도록 Ingress 규칙을 작성합니다.

**📄 `ingress-host-based.yaml`**

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress-host-based
spec:
  rules:
    # --- 첫 번째 호스트 규칙 ---
    - host: a.example.com # a.example.com 으로 들어온 요청은
      http:
        paths:
          - path: / # 모든 경로에 대해
            pathType: Prefix
            backend:
              service:
                name: hello-service # hello-service 로 보낸다.
                port:
                  number: 80
    # --- 두 번째 호스트 규칙 ---
    - host: b.example.com # b.example.com 으로 들어온 요청은
      http:
        paths:
          - path: / # 모든 경로에 대해
            pathType: Prefix
            backend:
              service:
                name: world-service # world-service 로 보낸다.
                port:
                  number: 80
```

- **`spec.rules`:** `ex03`과 달리, 이번에는 `host` 필드를 명시한 두 개의 별도 규칙을 배열에 넣었습니다.
- **`path: /`:** 각 호스트로 들어온 모든 경로의 요청을 해당 서비스로 전달하겠다는 의미입니다.
- 이번 예제에서는 경로 재작성이 필요 없으므로 `rewrite-target` 어노테이션은 사용하지 않았습니다.

## 3\. Step 3: Ingress 배포 및 테스트하기

1.  **기존 Ingress 삭제:** `ex03`에서 만들었던 Ingress와 충돌하지 않도록 먼저 삭제합니다.

    ```bash
    # 이전 실습에서 만든 ingress를 삭제합니다.
    kubectl delete ingress my-ingress
    ```

2.  **새 Ingress 배포:**

    ```bash
    kubectl apply -f ingress-host-based.yaml
    ```

3.  **테스트:**
    **`minikube tunnel`이 별도의 터미널에서 계속 실행 중인지 확인**한 후, `curl`을 사용하여 각 도메인으로 요청을 보내봅시다.

    ```bash
    # 1. a.example.com 으로 요청 보내기
    curl http://a.example.com:8000

    # 예상 출력:
    # Hello, world! Version: 1.0.0
    # Hostname: hello-deployment-xxxxxxxxxx-xxxxx

    # 2. b.example.com 으로 요청 보내기
    curl http://b.example.com:8000

    # 예상 출력:
    # Hello, world! Version: 2.0.0
    # Hostname: world-deployment-xxxxxxxxxx-xxxxx
    ```

    웹 브라우저 주소창에 `http://a.example.com` 과 `http://b.example.com` 을 각각 입력해서 테스트해 보아도 동일한 결과를 확인할 수 있습니다.

**결과 분석:**
두 요청 모두 동일한 IP(`127.0.0.1`)로 전달되었지만, Ingress Controller가 HTTP 요청 헤더의 `Host` 값을 읽고 우리가 정의한 규칙에 따라 요청을 올바른 서비스로 정확하게 라우팅했습니다.

---

### ⭐ 핵심 정리

- **호스트 기반 라우팅**은 `spec.rules.host` 필드를 사용하여 특정 도메인으로 들어오는 요청을 지정된 서비스로 전달하는 방식이다.
- 로컬 개발 환경에서는 **`hosts` 파일을 수정**하여 실제 도메인 없이도 호스트 기반 라우팅을 테스트할 수 있다.
- 경로 기반 라우팅과 호스트 기반 라우팅을 조합하면, 단일 IP 주소 위에서 매우 복잡하고 유연한 트래픽 관리 정책을 만들 수 있다.
