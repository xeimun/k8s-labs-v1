# Exercise 02: 똑똑하게 스토리지 요청하기 - PVC와 PV

이전 실습에서 우리는 `hostPath`로 데이터를 보존하는 데 성공했습니다. 하지만 이 방식은 데이터가 **특정 호스트 머신(노드)에 종속**되는 치명적인 단점이 있습니다. 만약 수백 대의 서버로 운영되는 클러스터에서 Pod이 다른 서버로 옮겨가면 데이터는 그대로 남겨지게 됩니다.

이번 실습에서는 이런 문제를 해결하는 쿠버네티스의 표준 방식인 \*\*PVC(PersistentVolumeClaim)\*\*와 \*\*PV(PersistentVolume)\*\*에 대해 배워보겠습니다. 개발자가 스토리지의 복잡한 내부를 몰라도, 마치 레스토랑 테이블을 예약하듯 간단하게 "4인용 창가 자리 주세요" 라고 요청하고 공간을 할당받는 똑똑한 방법입니다.

---

### 📂 예제 파일

| 파일명              | 설명                                                  |
| :------------------ | :---------------------------------------------------- |
| `pvc.yaml`          | 1Gi 크기의 저장 공간을 요청하는 PVC(테이블 예약 요청) |
| `pod-with-pvc.yaml` | 예약된 공간(PVC)을 사용하는 Pod                       |

---

### 🎯 학습 목표

1.  `hostPath`의 한계를 이해하고, 스토리지 추상화의 필요성을 안다.
2.  **PVC(예약 요청)**, **PV(실제 테이블)**, \*\*StorageClass(레스토랑 매니저)\*\*의 관계와 역할을 이해한다.
3.  PVC를 생성하여 동적으로 PV를 할당받는 \*\*동적 프로비저닝(Dynamic Provisioning)\*\*을 실습한다.
4.  Pod에서 PVC를 참조하여 데이터를 영구적으로 저장할 수 있다.

---

## 1\. 개념 이해: 레스토랑 테이블 예약하기

`PVC`와 `PV`는 처음에는 조금 헷갈릴 수 있습니다. **레스토랑 테이블 예약**에 비유하면 아주 쉽게 이해할 수 있습니다.

- **Pod (손님):** 레스토랑에서 식사를 하려는 **손님**. 테이블이라는 '공간'이 필요합니다.
- **PersistentVolumeClaim (PVC):** "4인용 창가 자리로 예약해주세요" 라는 **예약 요청(Claim)**. 손님은 테이블의 세부사항(예: 어느 창고에서 꺼내온 몇 번 테이블인지)은 신경 쓰지 않고, 오직 **요구사항**만 전달합니다.
- **PersistentVolume (PV):** 예약 요청에 따라 **'예약석' 팻말이 놓인 실제 테이블**. 레스토랑이 보유한 **실제 물리적 공간/인프라**입니다. 한 번 예약되면 다른 손님이 사용할 수 없도록 할당(`Bound`)됩니다.
- **StorageClass (레스토랑 매니저):** 예약을 받고, 조건에 맞는 빈 테이블을 찾아 '예약석'으로 지정해주는 **레스토랑 매니저 또는 자동 예약 시스템**. 이 매니저 덕분에 손님은 직접 빈 테이블을 찾아다닐 필요가 없습니다.

> **핵심:** 개발자(손님)는 더 이상 스토리지 서버의 IP나 디렉토리 경로 같은 복잡한 것을 알 필요가 없습니다. 그저 필요한 만큼의 \*\*PVC(예약 요청)\*\*만 제출하면, \*\*StorageClass(매니저)\*\*가 알아서 \*\*PV(테이블)\*\*를 찾아 할당해주는 방식입니다.

## 2\. Step 1: 우리 레스토랑의 매니저 확인하기 (StorageClass)

Minikube에는 기본적으로 `standard` 라는 이름의 StorageClass(매니저)가 이미 준비되어 있습니다.

아래 명령어로 클러스터에 어떤 매니저가 있는지 확인해 봅시다.

```bash
kubectl get storageclass
# 또는 kubectl get sc
```

```
NAME                 PROVISIONER                RECLAIMPOLICY   VOLUMEBINDINGMODE   ALLOWVOLUMEEXPANSION   AGE
standard (default)   k8s.io/minikube-hostpath   Delete          Immediate           false                  2d
```

`(default)` 라고 표시된 `standard` StorageClass가 우리가 사용할 자동 예약 시스템입니다.

## 3\. Step 2: 테이블 예약 요청하기 (PVC 생성)

이제 "1Gi 용량의 표준 스토리지를 예약해주세요" 라는 예약 요청(PVC)을 작성해 봅시다.

**📄 `pvc.yaml`**

```yaml
apiVersion: v1
kind: PersistentVolumeClaim # 리소스 종류는 PVC 입니다.
metadata:
  name: my-pvc
spec:
  # 어떤 종류의 매니저를 사용할지 지정합니다. (생략 시 default 매니저 사용)
  storageClassName: standard
  # 접근 모드를 정의합니다. ReadWriteOnce는 한 번에 하나의 손님(Pod)만 테이블을 사용할 수 있다는 의미입니다.
  accessModes:
    - ReadWriteOnce
  # 필요한 공간의 크기를 요청합니다.
  resources:
    requests:
      storage: 1Gi # 1 기가바이트(GiB)를 요청합니다.
```

예약 요청(PVC)을 클러스터에 제출합니다.

```bash
kubectl apply -f pvc.yaml
```

## 4\. Step 3: 예약 처리 과정 확인하기 (PV 할당 확인)

예약이 잘 처리되었는지, 그리고 테이블이 잘 준비되었는지 확인해 봅시다.

1.  **PVC 상태 확인:** `STATUS`가 `Pending`에서 `Bound`(연결됨) 상태로 바뀝니다. 예약이 성공적으로 특정 테이블에 연결되었다는 의미입니다.

    ```bash
    kubectl get pvc my-pvc

    # NAME     STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
    # my-pvc   Bound    pvc-f7a9e525-8a3b-4a6e-8e6f-1234abcd5678   1Gi        RWO            standard       15s
    ```

2.  **PV 상태 확인:** PVC 요청에 따라 **StorageClass가 자동으로 PV(테이블)를 찾아 할당**한 것을 볼 수 있습니다.

    ```bash
    kubectl get pv

    # NAME                                       CAPACITY   ACCESS MODES   RECLAIM POLICY   STATUS   CLAIM            STORAGECLASS   REASON   AGE
    # pvc-f7a9e525-8a3b-4a6e-8e6f-1234abcd5678   1Gi        RWO            Delete           Bound    default/my-pvc   standard                25s
    ```

    `STATUS`가 `Bound`이고, `CLAIM`에 방금 우리가 만든 `default/my-pvc` 예약이 연결된 것을 확인하세요. 이것이 바로 **동적 프로비저닝(Dynamic Provisioning)** 입니다.

## 5\. Step 4: 예약한 테이블에 손님(Pod) 앉히기

이제 예약된 테이블(PV)을 Pod이 사용하도록 해봅시다. Pod은 실제 테이블 번호(PV 이름)를 몰라도, 본인의 **예약 요청서(PVC) 이름**만 알고 있으면 됩니다.

**📄 `pod-with-pvc.yaml`**

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: time-check-pod-pvc
spec:
  containers:
    - name: time-check
      image: busybox
      command: ["/bin/sh", "-c"]
      args:
        - >
          mkdir -p /data;
          while true; do
            echo "$(date)" >> /data/time.txt;
            sleep 200;
          done
      volumeMounts:
        - name: my-storage # 아래 volumes에서 정의한 볼륨 이름
          mountPath: /data
  volumes:
    - name: my-storage
      # hostPath 대신 persistentVolumeClaim을 사용합니다.
      persistentVolumeClaim:
        # claimName에 우리가 만든 PVC의 이름을 적어줍니다.
        claimName: my-pvc
```

`volumes` 섹션이 `hostPath`에서 `persistentVolumeClaim`으로 바뀐 것을 확인하세요.

Pod을 생성하고 데이터가 잘 저장되는지, 그리고 Pod을 재시작해도 데이터가 보존되는지 확인합니다.

```bash
# Pod 생성
kubectl apply -f pod-with-pvc.yaml

# 데이터 확인
kubectl exec time-check-pod-pvc -- cat /data/time.txt

# Pod 삭제 및 재생성
kubectl delete -f pod-with-pvc.yaml
kubectl apply -f pod-with-pvc.yaml

# 데이터가 보존되었는지 최종 확인!
kubectl exec time-check-pod-pvc -- cat /data/time.txt
```

이전 실습과 마찬가지로, 파일에 기록된 시간들이 그대로 남아있는 것을 확인할 수 있습니다.

---

### ⭐ 핵심 정리

- `hostPath`는 특정 노드에 종속되므로 운영 환경에 부적합합니다.
- **PVC**는 개발자가 스토리지에 대한 \*\*'요구사항(테이블 예약 요청)'\*\*을 정의하는 객체입니다.
- **PV**는 클러스터 내의 실제 **'저장 공간(예약된 테이블)'** 입니다.
- **StorageClass**는 PVC 요청을 받으면 **PV를 자동으로 찾아 할당**해주는 '프로비저너(레스토랑 매니저)' 입니다.
- 이 **PVC-PV 모델**을 통해 애플리케이션과 스토리지를 분리하여, 어떤 클라우드 환경이든 동일한 방식으로 데이터를 영구적으로 관리할 수 있습니다.
