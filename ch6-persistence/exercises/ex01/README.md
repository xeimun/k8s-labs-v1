# 실습 1: 데이터는 어디로 사라졌을까? - Volume의 필요성

지금까지 우리가 만든 Pod들은 다시 시작되면 마치 컴퓨터를 포맷한 것처럼 모든 것이 초기화되었습니다. 이번 실습에서는 이 문제를 직접 눈으로 확인하고, 쿠버네티스 **볼륨(Volume)** 이라는 개념을 통해 데이터를 영구적으로 보존하는 가장 기초적인 방법을 배워봅니다.

---

### 📂 예제 파일

| 파일명                    | 설명                                           |
| :------------------------ | :--------------------------------------------- |
| `pod-without-volume.yaml` | 볼륨이 연결되지 않아 데이터가 사라지는 Pod     |
| `pod-with-volume.yaml`    | `hostPath` 볼륨을 사용해 데이터를 보존하는 Pod |

---

### 🎯 학습 목표

1.  Pod이 재시작될 때 컨테이너 내부의 데이터가 사라지는 현상을 직접 확인한다.
2.  데이터를 영구적으로 저장하기 위한 **볼륨(Volume)** 의 필요성을 이해한다.
3.  가장 기초적인 볼륨 타입인 **`hostPath`** 를 사용하여 Pod의 데이터를 호스트 머신에 보존할 수 있다.

---

## 1\. 문제 상황: Pod의 데이터는 영구적이지 않다\!

먼저, Pod 안의 데이터가 얼마나 쉽게 사라지는지 직접 경험해 봅시다.

### Step 1: 볼륨 없는 Pod 생성하기

아래 `pod-without-volume.yaml` 파일은 10초마다 `/data/time.txt` 파일에 현재 시간을 기록하는 간단한 Pod입니다.

**📄 `pod-without-volume.yaml`**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: time-check-pod
spec:
  containers:
    - name: time-check
      image: busybox
      command: ["/bin/sh", "-c"]
      args:
        - >
          mkdir -p /data;
          while true; do
            echo "$(date)" > /data/time.txt;
            sleep 20;
          done
```

Pod을 생성합니다.

```bash
kubectl apply -f pod-without-volume.yaml
```

### Step 2: 데이터 확인하기

`exec` 명령어로 실행 중인 Pod 내부에 접속하여 `/data/time.txt` 파일이 잘 생성되고 내용이 쓰여있는지 확인합니다.

```bash
# Pod이 Running 상태가 될 때까지 잠시 기다립니다.
kubectl get pod time-check-pod

# Pod 내부의 /data/time.txt 파일 내용을 확인합니다.
kubectl exec time-check-pod -- cat /data/time.txt

# 출력 예시
# Wed Jul 30 09:02:15 UTC 2025
# Wed Jul 30 09:03:15 UTC 2025
```

### Step 3: Pod 삭제하고 다시 만들기

이제 Pod을 삭제했다가 다시 만들어 보겠습니다. 실제 운영 환경에서는 노드(서버)에 문제가 생기거나, 새로운 버전을 배포할 때 이런 일이 빈번하게 일어납니다.

```bash
# Pod을 삭제합니다.
kubectl delete -f pod-without-volume.yaml

# 동일한 파일로 Pod을 다시 생성합니다.
kubectl apply -f pod-without-volume.yaml
```

### Step 4: 데이터 유실 확인하기

새로 만들어진 Pod에 다시 접속해서 아까 그 파일의 내용을 확인해 봅시다.

```bash
# Pod이 다시 Running 상태가 될 때까지 잠시 기다립니다.
kubectl get pod time-check-pod

# 파일 내용을 다시 확인합니다.
kubectl exec time-check-pod -- cat /data/time.txt
```

아마 이전에 기록된 시간과 다른, 완전히 새로운 시간이 기록되어 있을 것입니다. Pod 컨테이너가 삭제될 때 컨테이너 내부에 저장된 `/data` 디렉토리와 파일이 **함께 삭제되었기 때문**입니다. 이것이 바로 상태 없는(Stateless) 컨테이너의 특징입니다.

---

## 2\. 해결 방법: `hostPath` 볼륨으로 데이터 보존하기

이 문제를 해결하려면 Pod의 데이터를 **Pod 외부의 어딘가에** 저장해야 합니다. **볼륨(Volume)** 은 바로 이 '어딘가'를 Pod의 특정 경로에 연결(Mount)해주는 역할을 합니다.

이번에는 가장 간단한 `hostPath` 볼륨을 사용해 보겠습니다. `hostPath`는 Pod이 실행되는 **호스트 머신(여기서는 Minikube VM)의 디렉토리**를 Pod에 직접 연결하는 방식입니다.

### Step 1: `hostPath` 볼륨을 사용하는 Pod 생성하기

`pod-with-volume.yaml` 파일은 `pod-without-volume.yaml`에 볼륨 관련 설정이 추가되었습니다.

**📄 `pod-with-volume.yaml`**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: time-check-pod-persistent
spec:
  containers:
    - name: time-check
      image: busybox
      command: ["/bin/sh", "-c"]
      args:
        - >
          while true; do
            echo "$(date)" >> /data/time.txt;
            sleep 20;
          done
      # 2. 컨테이너의 /data 경로에 'my-volume'을 연결합니다.
      volumeMounts:
        - name: my-volume
          mountPath: /data
  # 1. 'my-volume'이라는 이름의 볼륨을 정의합니다.
  # 이 볼륨은 호스트 머신(Minikube)의 /tmp/k8s-data 디렉토리를 사용합니다.
  volumes:
    - name: my-volume
      hostPath:
        path: /tmp/k8s-data
        type: DirectoryOrCreate
```

기존 Pod을 삭제하고 새로운 Pod을 생성합니다.

```bash
# 혹시 이전 Pod이 남아있다면 삭제합니다.
kubectl delete pod time-check-pod --ignore-not-found=true

# 볼륨이 연결된 새로운 Pod을 생성합니다.
kubectl apply -f pod-with-volume.yaml
```

### Step 2: 데이터 확인 및 Pod 재시작

이전과 동일하게 데이터를 확인하고 Pod을 삭제했다가 다시 만들어 보겠습니다.

```bash
# Pod 상태 확인
kubectl get pod time-check-pod-persistent

# 파일 내용 확인 (첫 번째 시간 기록)
kubectl exec time-check-pod-persistent -- cat /data/time.txt
# Wed Jul 30 09:05:30 UTC 2025

# Pod 삭제
kubectl delete -f pod-with-volume.yaml

# Pod 재생성
kubectl apply -f pod-with-volume.yaml
```

### Step 3: 데이터 보존 확인\! 🎉

다시 생성된 Pod에 접속하여 파일 내용을 확인해 봅시다.

```bash
# Pod이 Running 상태가 될 때까지 잠시 기다립니다.
kubectl get pod time-check-pod-persistent

# 파일 내용을 확인합니다.
kubectl exec time-check-pod-persistent -- cat /data/time.txt
```

놀랍게도 Pod을 삭제하기 직전에 기록되었던 시간이 그대로 남아있는 것을 볼 수 있습니다\! 데이터가 Pod 내부가 아닌, **호스트 머신의 `/tmp/k8s-data` 디렉토리**에 저장되었고, Pod이 재시작될 때 그 디렉토리를 다시 연결했기 때문입니다.

---

### 핵심 정리

- **Pod의 생명주기와 데이터는 분리되어 있다:** 기본적으로 Pod이 사라지면 그 안의 데이터도 함께 사라집니다.
- **볼륨(Volume):** Pod의 데이터를 영구적으로 저장하기 위해 외부 스토리지(저장 공간)를 Pod 내부의 특정 경로에 연결하는 기술입니다.
- **`hostPath` 볼륨:** 가장 간단한 볼륨 타입으로, Pod이 실행 중인 **호스트 머신의 파일 시스템**을 직접 사용합니다. 개념 학습에는 유용하지만, 실제 운영 환경에서는 특정 호스트에 종속되는 문제가 있어 잘 사용되지 않습니다.

이번 실습을 통해 우리는 왜 볼륨이 필요한지 명확하게 이해했습니다. 다음 실습에서는 더 똑똑하고 유연하게 스토리지를 요청하고 사용하는 방법인 `PVC`와 `PV`에 대해 알아보겠습니다.
