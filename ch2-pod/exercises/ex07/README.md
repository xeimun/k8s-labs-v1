# 실습 7: 사이드카 컨테이너 구성하기

## 실습 목표

-   하나의 Pod 내에서 두 개 이상의 컨테이너를 실행하는 '사이드카(Sidecar)' 패턴의 기본 개념을 이해한다.
-   컨테이너 간의 파일 공유를 위해 `emptyDir` 볼륨을 사용하는 방법을 실습한다.
-   메인 애플리케이션(Nginx)과 보조 애플리케이션(Busybox)이 협력하여 동작하는 구조를 경험한다.

## 1. 사이드카 패턴이란?

사이드카 패턴은 Pod의 기본 컨테이너가 수행해야 할 핵심 기능과 부가적인 기능을 분리하여, 부가 기능을 '사이드카 컨테이너'에 위임하는 설계 방식입니다. 예를 들어, 로그 수집, 데이터 동기화, 프록시 역할 등을 사이드카 컨테이너가 담당할 수 있습니다. 이 Lab에서는 `nginx` 웹서버(메인)와, 웹 콘텐츠를 주기적으로 생성하는 `busybox`(사이드카)를 하나의 Pod에 구성해봅니다.

## 2. Volume을 공유하는 Pod YAML 작성

-   아래 내용으로 `lab03-sidecar-pod.yaml` 파일을 작성합니다. 이 YAML 파일은 두 개의 컨테이너와 두 컨테이너가 공유할 `emptyDir` 볼륨을 정의합니다.

```yaml
# lab03-sidecar-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: sidecar-pod
spec:
  # 1. 컨테이너들이 공유할 볼륨을 정의합니다.
  volumes:
  - name: shared-html
    emptyDir: {} # Pod가 살아있는 동안만 유지되는 임시 디렉토리

  containers:
  # 2. 메인 컨테이너: Nginx 웹 서버
  - name: nginx-container
    image: nginx:latest
    ports:
    - containerPort: 80
    volumeMounts: # 3. 공유 볼륨을 Nginx의 웹 루트 디렉토리에 마운트
    - name: shared-html
      mountPath: /usr/share/nginx/html

  # 4. 사이드카 컨테이너: 5초마다 index.html 파일 내용 갱신
  - name: busybox-container
    image: busybox:latest
    command: ["/bin/sh", "-c"] # 5. 실행할 명령어
    args:
    - while true; do
        echo "Hello from Sidecar! It is now $(date)" > /data/index.html;
        sleep 5;
      done
    volumeMounts: # 6. 공유 볼륨을 /data 디렉토리에 마운트
    - name: shared-html
      mountPath: /data
```

## 3. Pod 배포 및 확인

작성한 YAML 파일로 Pod를 배포합니다.

```bash
$ kubectl apply -f lab03-sidecar-pod.yaml
pod/sidecar-pod created
```

`kubectl port-forward`를 사용하여 로컬 PC의 8080 포트를 Pod의 80 포트로 연결합니다.

```bash
$ kubectl port-forward pod/sidecar-pod 8080:80
Forwarding from 127.0.0.1:8080 -> 80
Forwarding from [::1]:8080 -> 80
```

이 터미널은 계속 실행 상태로 두어야 포트 포워딩이 유지됩니다.

웹 브라우저를 열고 `http://localhost:8080`에 접속합니다. 5초마다 페이지를 새로고침하면 busybox 컨테이너가 변경한 내용으로 화면이 갱신되는 것을 확인할 수 있습니다.

## 4. 각 컨테이너 내부 확인하기

새 터미널을 열고 `kubectl exec` 명령어를 사용하여 각 컨테이너의 셸에 접속하고, 공유 볼륨이 어떻게 마운트되었는지 직접 확인해 보세요.

```bash
# Nginx 컨테이너 접속 후 확인
$ kubectl exec -it sidecar-pod -c nginx-container -- /bin/bash
root@sidecar-pod:/# ls /usr/share/nginx/html
root@sidecar-pod:/# cat /usr/share/nginx/html/index.html
```

```bash
# Busybox 컨테이너 접속 후 확인
$ kubectl exec -it sidecar-pod -c busybox-container -- /bin/sh
/ # ls /data
/ # cat /data/index.html
```