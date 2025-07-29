# ex05: "실무자가 꼭 알아야 할 차이" - 업데이트는 어떻게 될까?

### 🎯 학습 목표
- `ConfigMap`의 변경 사항이 Pod에 전파되는 두 가지 방식의 차이점을 명확히 이해한다.
- **볼륨 마운트** 방식은 동적으로 업데이트되지만, **환경변수** 방식은 Pod 재시작이 필요함을 학습한다.
- 이 차이점을 바탕으로 어떤 상황에 어떤 방식을 사용해야 할지 판단하는 능력을 기른다.

---

### 1️⃣ 단계: 시나리오 1 - 볼륨 마운트 방식의 업데이트

`ex03`에서 만들었던 Nginx Pod와 ConfigMap을 다시 사용해 보겠습니다. 이 방식은 `ConfigMap`을 볼륨으로 마운트하여 설정 파일을 Pod에 주입했습니다.

**준비**

먼저 `ex03`의 리소스들을 다시 생성합니다.
```bash
# ex03의 파일들이 있는 디렉토리로 이동했다고 가정
# 또는 파일 경로를 정확히 지정해주세요.
kubectl apply -f ../ex03/default.conf -f ../ex03/nginx-pod.yaml

# Pod가 준비될 때까지 대기
kubectl wait --for=condition=Ready pod/nginx-configmap-volume-pod

# 포트포워딩 실행 (새 터미널을 열어두세요)
kubectl port-forward nginx-configmap-volume-pod 8080:80
````

다른 터미널에서 `curl`로 확인하여 초기 상태를 점검합니다.

```bash
curl localhost:8080
# Hello, ConfigMap Volume!
```

초기 메시지가 잘 나옵니다.

**업데이트 및 결과 확인**

이제, **Pod를 재시작하지 않고** `nginx-conf` ConfigMap의 내용만 변경해 보겠습니다.

```bash
# 1. default.conf 파일의 내용을 수정합니다.
# "Hello, ConfigMap Volume!" -> "Volume Updated!"
# (아래 명령어로 파일 내용을 간단히 덮어쓸 수 있습니다.)
echo 'server { listen 80; server_name localhost; location / { return 200 "Volume Updated!\n"; } }' > ../ex03/default.conf


# 2. 수정된 파일 내용으로 ConfigMap을 교체합니다.
kubectl create configmap nginx-conf --from-file=../ex03/default.conf -o yaml --dry-run=client | kubectl replace -f -
```

이제 잠시 (약 10\~20초) 기다린 후, 다시 `curl` 명령을 실행해 봅시다.

```bash
curl localhost:8080
# Volume Updated!
```

놀랍게도 **Pod를 재시작하지 않았는데도 응답 메시지가 변경**되었습니다\!

> **이유는? 🤔**
> `ConfigMap`을 볼륨으로 마운트하면, 쿠버네티스는 주기적으로 변경 사항을 감지하여 Pod 안의 마운트된 파일을 **자동으로 업데이트**해줍니다. Nginx처럼 설정 파일을 다시 읽는 기능(hot-reload)이 있는 애플리케이션은 이 변경 사항을 감지하고 즉시 동작에 반영할 수 있습니다.

-----

### 2️⃣ 단계: 시나리오 2 - 환경변수 방식의 업데이트

이번에는 `ex01`에서 사용했던, `ConfigMap`을 환경변수로 주입한 `busybox` Pod를 사용해 보겠습니다.

**준비**

```bash
# ex01의 리소스들을 다시 생성합니다.
# GREETING 값을 "Aloha"로 설정하여 시작합니다.
kubectl create configmap greeting-config --from-literal=GREETING=Aloha
kubectl apply -f ../ex01/pod-configmap.yaml
```

잠시 후 로그를 확인하여 초기 상태를 점검합니다.

```bash
# Pod가 생성될 때까지 10초 정도 대기
sleep 10
kubectl logs busybox-configmap-pod
# 인사말: Aloha
```

**업데이트 및 결과 확인**

이제, `greeting-config` ConfigMap의 값을 "Env Var Updated\!"로 변경해 보겠습니다.

```bash
# ConfigMap의 값을 변경
kubectl create configmap greeting-config --from-literal=GREETING="Env Var Updated!" -o yaml --dry-run=client | kubectl replace -f -
```

ConfigMap이 변경되었습니다. 다시 Pod의 로그를 확인해 볼까요?

```bash
kubectl logs busybox-configmap-pod
# 인사말: Aloha
# 인사말: Aloha
# ...
```

아무리 기다려도 로그는 **전혀 바뀌지 않습니다.**

> **이유는? 🤔**
> **환경변수는 프로세스가 시작될 때 단 한 번만 설정**됩니다. 컨테이너가 일단 실행되고 나면, 외부에서 `ConfigMap`을 아무리 변경해도 이미 실행중인 프로세스의 환경변수에는 아무런 영향을 주지 못합니다.

**변경 사항을 적용하려면?**

이 변경 사항을 적용하는 유일한 방법은 **Pod를 재시작**하는 것입니다.

```bash
# Pod를 삭제하고...
kubectl delete pod busybox-configmap-pod

# 같은 YAML로 다시 생성합니다.
kubectl apply -f ../ex01/pod-configmap.yaml

# 잠시 후 로그를 다시 확인
sleep 10
kubectl logs busybox-configmap-pod
# 인사말: Env Var Updated!
```

Pod가 새로 생성되면서 변경된 `ConfigMap` 값을 읽어와 환경변수를 설정했기 때문에, 이제야 새로운 메시지가 출력됩니다.

-----

### 💡 결론 및 요약

| 방식 | 업데이트 반영 | 장점 | 단점 | 주요 사용 사례 |
| :--- | :---: | :--- | :--- | :--- |
| **Volume Mount** | **동적 (Live)** | 설정 파일 전체 관리 용이, 실시간 반영 가능 | 앱이 파일 변경을 감지해야 함 | Nginx/Prometheus 설정 파일, `application.properties` 등 |
| **Environment Variable** | **Pod 재시작 필요** | 사용이 간편, 대부분의 앱에서 지원 | 업데이트 시 Pod 재시작 필수 | DB 호스트, 포트, 간단한 기능 플래그 등 |

이 두 가지 방식의 차이점을 이해하는 것은 쿠버네티스에서 애플리케이션 설정을 효과적으로 관리하는 데 매우 중요합니다.

-----

### 리소스 정리

```bash
# 포트포워딩 종료 (실행중인 경우)
# kubectl delete pod, configmap...
kubectl delete pod nginx-configmap-volume-pod busybox-configmap-pod
kubectl delete configmap nginx-conf greeting-config
```