# 실습 5: Pod의 생명주기와 재시작 정책 이해하기

이 실습에선 Pod가 생성되고 소멸되기까지의 상태(Phase) 변화를 이해하고 Pod의 `spec.restartPolicy` 설정(`Always`, `OnFailure`, `Never`)에 따라 컨테이너의 재시작 동작이 어떻게 달라지는지 실습을 통해 확인합니다.

## Pod의 생명주기

Pod는 일시적인 존재이며, 생성 후 `Pending` -> `Running` -> `Succeeded` 또는 `Failed` 와 같은 생명주기를 가집니다. 이때 컨테이너가 종료되었을 때 쿠버네티스가 어떤 조치를 취할지는 `restartPolicy`에 따라 결정됩니다.

## 1. `restartPolicy: OnFailure` - 실패했을 때만 재시작

-   컨테이너가 오류(exit code 0이 아님)를 내며 종료될 때만 재시작하는 정책입니다.
-   아래 내용으로 `onfailure-pod.yaml` 파일을 작성합니다. 이 Pod는 10초 후 실패하며 종료됩니다.

```yaml
# onfailure-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: onfailure-pod
spec:
  containers:
  - name: failing-container
    image: busybox:latest
    command: ["/bin/sh", "-c", "sleep 10; exit 1"]
  restartPolicy: OnFailure
```

## 2. `restartPolicy: Never` - 절대 재시작하지 않음

컨테이너가 어떤 상태로 종료되든 절대 재시작하지 않습니다. 배치(Batch) 작업처럼 한 번 실행하고 성공적으로 종료되어야 하는 작업에 적합합니다.

아래 내용으로 `never-pod.yaml` 파일을 작성합니다. 이 Pod는 5초 후 정상적으로(exit code 0) 종료됩니다.

```yaml
# never-pod.yaml
apiVersion: v1
kind: Pod
metadata:
  name: never-pod
spec:
  containers:
  - name: success-container
    image: busybox:latest
    command: ["/bin/sh", "-c", "echo 'Job Done!'; sleep 5;"]
  restartPolicy: Never
```

## 3. `restartPolicy: Always` - 항상 재시작 (기본값)

`restartPolicy`를 명시하지 않으면 기본값인 `Always`가 적용됩니다. 컨테이너가 어떤 이유로든 종료되면 무조건 재시작합니다. 웹 서버처럼 항상 실행되어야 하는 서비스에 적합합니다.

`never-pod.yaml` 에서 `restartPolicy` 부분만 `Always`로 변경하고(혹은 삭제하고) 다시 적용해보면, 정상적으로 종료되어도 계속 재시작되어 `CrashLoopBackOff` 상태가 되는 것을 확인할 수 있습니다.