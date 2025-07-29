# ex03: "설정 '파일'을 통째로" - ConfigMap as a Volume

### 🎯 학습 목표

- 환경변수가 아닌, 설정 파일 자체를 `ConfigMap`으로 관리하는 방법을 학습한다.
- `ConfigMap`을 Volume으로 사용하여 컨테이너의 특정 경로에 파일을 마운트하는 방법을 익힌다.
- 파일 기반 설정을 사용하는 애플리케이션(e.g. Nginx)을 쿠버네티스 환경에 맞게 커스터마이징할 수 있다.

---

### 1 단계: 시나리오 이해하기

지금까지 우리는 `ConfigMap`의 데이터를 **환경변수**로 주입했습니다. 하지만 모든 설정이 환경변수로만 이루어지진 않습니다. 대표적으로 Nginx 웹서버는 `.conf` 확장자를 가진 설정 파일을 읽어서 동작합니다.

만약 우리가 Nginx 컨테이너의 기본 동작을 바꾸고 싶다면 어떻게 해야 할까요? 예를 들어, 기본 환영 페이지 대신 "Hello, ConfigMap Volume!"이라는 메시지를 보여주는 커스텀 페이지를 만들고 싶다고 가정해 봅시다.

이러한 요구사항을 해결하려면 Nginx의 설정 파일을 직접 수정해야 합니다. `ConfigMap`을 **볼륨(Volume)**처럼 사용하면, 우리가 원하는 설정 파일을 컨테이너 안의 특정 경로에 '주입'하거나 '덮어쓸' 수 있습니다.

---

### 2 단계: 커스텀 설정 파일과 ConfigMap 생성하기

먼저, Nginx가 새로운 환영 페이지를 보여주도록 하는 간단한 설정 파일을 만들어 보겠습니다.

**📄 default.conf**

```nginx
# 이 파일이 Nginx Pod의 기본 설정 파일 역할을 하게 됩니다.
server {
    listen       80;
    server_name  localhost;

    # 모든 요청(/)에 대해 200 OK 상태 코드와 함께
    # "Hello, ConfigMap Volume!" 메시지를 반환합니다.
    location / {
        return 200 "Hello, ConfigMap Volume!\n";
    }
}
```

이제 이 default.conf 파일을 내용으로 하는 ConfigMap을 생성합니다. 이번에는 --from-file 옵션을 사용합니다.

```Bash
# default.conf 파일로부터 'nginx-conf' ConfigMap 생성
kubectl create configmap nginx-conf --from-file=default.conf

# 생성된 ConfigMap의 상세 내용 확인
kubectl get configmap nginx-conf -o yaml
```

```YAML
# 출력 결과
apiVersion: v1
data:
  default.conf: |  # <-- Key가 파일 이름(default.conf)이 됩니다.
    # 이 파일이 Nginx Pod의 기본 설정 파일 역할을 하게 됩니다.
    server {
        listen       80;
    ...
kind: ConfigMap
metadata:
  name: nginx-conf
  ...
```

data 필드를 보면, --from-file 옵션으로 지정한 파일 이름(default.conf)이 Key가 되고, 파일 내용 전체가 Value가 된 것을 확인할 수 있습니다.

### 3 단계: Pod에 ConfigMap 볼륨 마운트하기

이제 ConfigMap을 볼륨으로 사용하는 Nginx Pod를 정의해 봅시다.

📄 nginx-pod.yaml

```YAML
apiVersion: v1
kind: Pod
metadata:
  name: nginx-configmap-volume-pod
spec:
  containers:
  - name: nginx
    image: nginx:1.20
    ports:
    - containerPort: 80
    volumeMounts:
    - name: nginx-conf-volume
      mountPath: /etc/nginx/conf.d
  volumes:
  - name: nginx-conf-volume
    configMap:
      name: nginx-conf
```

#### 핵심 개념 🔑

spec.volumes: Pod가 사용할 수 있는 볼륨의 목록을 정의합니다. 여기서는 nginx-conf라는 ConfigMap을 nginx-conf-volume이라는 이름의 볼륨으로 선언했습니다.

spec.containers.volumeMounts: 선언된 볼륨(nginx-conf-volume)을 컨테이너의 특정 경로(/etc/nginx/conf.d)에 **'연결(마운트)'**합니다.

이 과정을 통해 Nginx 컨테이너의 /etc/nginx/conf.d 디렉터리 안에는 nginx-conf ConfigMap의 data에 있던 default.conf 파일이 생성됩니다.

### 4 단계: 결과 확인하기

Pod를 생성하고, 실제로 우리가 원하는 대로 동작하는지 확인해 봅시다.

```Bash
# Pod 생성
kubectl apply -f nginx-pod.yaml

# 포트포워딩으로 Pod의 80 포트를 로컬의 8000 포트로 연결
kubectl port-forward nginx-configmap-volume-pod 8000:80
```

이제 새 터미널을 열고 curl 명령어로 localhost:8000에 요청을 보내봅시다.

```Bash
curl localhost:8000
# 출력 결과
# Hello, ConfigMap Volume!
```

Nginx의 기본 환영 페이지 대신, 우리가 ConfigMap으로 주입한 default.conf 파일의 내용대로 "Hello, ConfigMap Volume!" 메시지가 출력되는 것을 확인할 수 있습니다.

#### 리소스 정리

```Bash
# 포트포워딩 중이라면 Ctrl+C로 종료

kubectl delete pod nginx-configmap-volume-pod
kubectl delete configmap nginx-conf

```
