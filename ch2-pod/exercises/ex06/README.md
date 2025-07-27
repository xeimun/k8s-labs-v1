# 실습 6: 고장 난 Pod 수리하기

## 실습 목표

-   의도적으로 오류가 포함된 Pod YAML 파일을 배포해보고, Pod가 생성되지 않는 원인을 파악할 수 있다.
-   `kubectl describe pod`의 `Events` 섹션을 통해 문제 해결의 단서를 찾는 방법을 익힌다.
-   Pod 배포 실패 시 발생하는 일반적인 오류(예: `ImagePullBackOff`)에 익숙해진다.

## 1. 고장 난 Pod 배포하기

-   아래 내용으로 `broken-pod.yaml` 파일을 생성합니다.

```yaml
# broken-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: broken-pod
spec:
  containers:
  - name: nginx
    image: nginx:1.99
```

이 파일을 클러스터에 배포해봅시다.

```bash
$ kubectl apply -f broken-pod.yaml
pod/broken-pod created
```

## 2. Pod 상태 확인 및 원인 분석

`kubectl get pods` 명령어로 Pod의 상태를 확인합니다. `Running` 상태가 아닌 `ImagePullBackOff` 또는 `ErrImagePull` 상태가 표시되는 것을 볼 수 있습니다.

```bash
$ kubectl get pods
NAME         READY   STATUS             RESTARTS   AGE
broken-pod   0/1     ImagePullBackOff   0          30s
```

`ImagePullBackOff`는 쿠버네티스가 컨테이너 이미지를 가져오려 했으나 실패하여, 잠시 후 다시 시도하겠다는 의미입니다.

디버깅의 핵심! `kubectl describe pod` 명령어로 Pod의 상세 정보를 확인합니다. 특히 맨 아래 `Events` 섹션을 주목하세요.

```bash
$ kubectl describe pod broken-pod
...
Events:
  Type     Reason     Age                From               Message
  ----     ------     ----               ----               -------
  Normal   Scheduled  59s                default-scheduler  Successfully assigned default/broken-pod to minikube
  Normal   Pulling    44s (x2 over 58s)  kubelet            Pulling image "nginx:1.99"
  Warning  Failed     43s (x2 over 57s)  kubelet            Failed to pull image "nginx:1.99": rpc error: code = NotFound desc = failed to pull and unpack image "docker.io/library/nginx:1.99": failed to resolve reference "docker.io/library/nginx:1.99": docker.io/library/nginx:1.99: not found
  Warning  Failed     43s (x2 over 57s)  kubelet            Error: ErrImagePull
  Normal   BackOff    19s (x3 over 56s)  kubelet            Back-off pulling image "nginx:1.99"
  Warning  Failed     19s (x3 over 56s)  kubelet            Error: ImagePullBackOff
```

`Events`를 보면 `Failed to pull image "nginx:1.99"` 라는 메시지와 함께 `not found` 라는 명확한 원인을 찾을 수 있습니다.

## 3. Pod 수정 및 재배포

`broken-pod.yaml` 파일의 `image` 필드를 올바른 태그(예: `nginx:latest` 또는 `nginx:1.27.0`)로 수정합니다.

```yaml
# broken-pod.yaml (수정 후)
apiVersion: v1
kind: Pod
metadata:
  name: broken-pod
spec:
  containers:
  - name: nginx
    image: nginx:latest # 올바른 버전의 이미지로 수정
```

수정한 YAML 파일을 다시 `apply` 합니다. 쿠버네티스는 기존 Pod를 삭제하고 새로운 설정으로 Pod를 다시 생성합니다.

```bash
$ kubectl apply -f broken-pod.yaml
pod/broken-pod configured
```

잠시 후 Pod 상태를 확인하면 `Running` 상태로 변경된 것을 볼 수 있습니다.

```bash
$ kubectl get pods
NAME         READY   STATUS    RESTARTS   AGE
broken-pod   1/1     Running   0          15s
```