# ex01: "왜 분리해야 할까?" - 첫 번째 ConfigMap

### 🎯 학습 목표
- 하드코딩된 설정의 문제점을 이해한다.
- `ConfigMap`을 사용하여 설정을 코드(YAML)와 분리하는 방법을 학습한다.
- `kubectl` 명령어로 `ConfigMap`을 생성하고, Pod에서 `valueFrom`을 통해 환경변수로 주입하는 방법을 익힌다.

---

### 1 단계: 문제점 인식하기 (The Problem: Hardcoding)

먼저, 애플리케이션의 설정값이 YAML 파일에 직접 작성되어 있는(하드코딩된) 경우를 살펴보겠습니다.

아래 `pod-hardcoded.yaml` 파일은 10초마다 "hello"라는 인사말을 출력하는 간단한 Pod입니다.

**pod-hardcoded.yaml**
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: busybox-hardcoded-pod
spec:
  containers:
  - name: busybox
    image: busybox:1.28
    command: ["/bin/sh", "-c"]
    args:
      - while true; do
          echo "인사말: $(GREETING)";
          sleep 10;
        done
    env:
    - name: GREETING
      value: "hello" # <-- 설정값이 YAML에 직접 하드코딩되어 있습니다.
  restartPolicy: Never
```

🤔 질문: 만약 여기서 인사말을 "hello"가 아닌 "hi"로 바꾸려면 어떻게 해야 할까요?

pod-hardcoded YAML 파일을 직접 수정하고, kubectl apply 명령을 다시 실행해야 합니다. 만약 이 설정이 컨테이너 이미지 안에 있었다면, 코드를 수정하고 이미지를 다시 빌드/푸시/배포하는 훨씬 복잡한 과정을 거쳐야 합니다.

아래 명령어로 직접 확인해봅시다.

```Bash
# Pod 생성
kubectl apply -f pod-hardcoded.yaml

# 10초 후 로그 확인
kubectl logs busybox-hardcoded-pod

# 출력 결과
# 인사말: hello
```

### 2️ 단계: 해결책 (The Solution: ConfigMap)
이제 설정(GREETING: "hi")을 Pod의 정의와 분리해봅시다. 이때 사용하는 것이 바로 ConfigMap 입니다.

--from-literal 옵션을 사용하면 커맨드라인에서 간단하게 Key-Value 쌍의 데이터를 가진 ConfigMap을 만들 수 있습니다.

```Bash
# GREETING=hi 라는 데이터를 가진 'greeting-config' ConfigMap 생성
kubectl create configmap greeting-config --from-literal=GREETING=hi

# 생성된 ConfigMap 확인
kubectl get configmap greeting-config

# NAME              DATA   AGE
# greeting-config   1      5s

# YAML 형식으로 상세 내용 확인
kubectl get configmap greeting-config -o yaml

# apiVersion: v1
# data:
#   GREETING: hi      #<-- 데이터가 Key:Value 형태로 저장된 것을 볼 수 있습니다.
# kind: ConfigMap
# metadata:
#   name: greeting-config
#   ...
```

### 3 단계: ConfigMap 적용하기
이제 이 greeting-config ConfigMap의 값을 참조하여 환경변수를 설정하는 새로운 Pod를 만들어 보겠습니다.

📄 pod-configmap.yaml
```YAML
apiVersion: v1
kind: Pod
metadata:
  name: busybox-configmap-pod
spec:
  containers:
  - name: busybox
    image: busybox:1.28
    command: ["/bin/sh", "-c"]
    args:
      - while true; do
          echo "인사말: $(GREETING)";
          sleep 10;
        done
    env:
    - name: GREETING # 주입할 환경 변수의 이름
      valueFrom:    # 값을 외부 소스에서 가져옵니다.
        configMapKeyRef:
          name: greeting-config # 사용할 ConfigMap의 이름
          key: GREETING         # 해당 ConfigMap에서 가져올 데이터의 Key
  restartPolicy: Never
```

valueFrom 필드는 환경 변수의 값을 직접 지정하는 대신, 다른 리소스(여기서는 ConfigMap)에서 가져오도록 지시하는 역할을 합니다.

새로운 Pod를 배포하고 로그를 확인해봅시다.

```Bash
# ConfigMap을 참조하는 새로운 Pod 생성
kubectl apply -f pod-configmap.yaml

# 10초 후 로그 확인
kubectl logs busybox-configmap-pod

# 출력 결과
# 인사말: hi
```

YAML 파일을 수정하지 않았는데도 인사말이 "hi"로 바뀐 것을 볼 수 있습니다.

### 4️ 단계: 설정 변경의 유연함 확인하기
ConfigMap을 사용했을 때의 가장 큰 장점은 Pod는 그대로 둔 채 설정만 쉽게 바꿀 수 있다는 것입니다.

아래 명령어로 greeting-config의 값을 "안녕"으로 변경해봅시다.

💡 Tip!
이미 존재하는 리소스를 수정할 때는 kubectl edit를 사용하거나, create --dry-run과 replace 명령을 조합하면 안전하게 리소스를 교체할 수 있습니다.

```Bash
# ConfigMap의 GREETING 값을 "안녕"으로 교체
kubectl create configmap greeting-config --from-literal=GREETING=안녕 -o yaml --dry-run=client | kubectl replace -f -

# configmap/greeting-config replaced
```

이제 기존 Pod를 삭제하고 다시 생성하여 변경된 설정이 적용되는지 확인합니다.

    Note: 환경변수로 주입된 ConfigMap 값은 Pod가 시작될 때 읽어오므로, 변경 사항을 적용하려면 Pod를 재시작해야 합니다. (이후 ex05에서 더 자세히 다룹니다)

```Bash
# 기존 Pod 삭제
kubectl delete pod busybox-configmap-pod

# 같은 YAML 파일로 Pod 재생성
kubectl apply -f pod-configmap.yaml

# 10초 후 로그 확인
kubectl logs busybox-configmap-pod

# 출력 결과
# 인사말: 안녕
```

이처럼 애플리케이션(Pod)의 코드는 전혀 건드리지 않고, 외부의 설정(ConfigMap)만 변경하여 동작을 바꿀 수 있습니다. 이것이 바로 설정을 분리했을 때 얻을 수 있는 가장 큰 이점입니다.

#### 리소스 정리
```Bash
kubectl delete pod busybox-hardcoded-pod
kubectl delete pod busybox-configmap-pod
kubectl delete configmap greeting-config
```
