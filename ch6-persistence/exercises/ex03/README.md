# 실습 3: 상태를 기억하는 관리자 - StatefulSet

`PVC`와 `PV` 덕분에 우리는 이제 Pod이 재시작되어도 데이터가 보존되는 '영속적인 저장 공간'을 갖게 되었습니다. 하지만 데이터베이스 같은 애플리케이션에게는 이것만으로는 부족합니다. 한 번 생각해 봅시다.

  - 여러 개로 복제된 데이터베이스 중 누가 '메인(Master)'이고 누가 '백업(Replica)'일까요?
  - 데이터베이스들끼리 서로를 어떻게 찾아 통신할까요? Pod의 IP는 계속 바뀌는데 말이죠.
  - 각 데이터베이스는 자신만의 독립된 저장 공간을 가져야 하지 않을까요?

`Deployment`는 이러한 요구사항을 충족시키기 어렵습니다. `Deployment`의 Pod들은 이름도 무작위이고, 언제든지 대체될 수 있는 '일회용품'에 가깝기 때문입니다. 이번 실습에서는 이러한 상태 저장 애플리케이션을 위해 특별히 설계된 **`StatefulSet`** 에 대해 배워보겠습니다.

-----

### 📂 예제 파일

| 파일명 | 설명 |
| :--- | :--- |
| `headless-service.yaml` | StatefulSet의 Pod들에게 고유한 주소를 부여하는 Headless 서비스 |
| `statefulset.yaml` | Nginx 이미지를 사용하는 기본적인 StatefulSet |

-----

### 🎯 학습 목표

1.  상태 저장 애플리케이션에 `Deployment`가 부적합한 이유를 이해한다.
2.  **`StatefulSet`** 의 세 가지 핵심 특징(안정적인 이름, 안정적인 스토리지, 순서 보장)을 이해한다.
3.  `StatefulSet`과 함께 사용되는 **`Headless Service`** 의 역할을 이해한다.
4.  `StatefulSet`을 직접 배포하고, Pod의 이름, 스토리지, 확장/축소 과정을 관찰한다.

-----

## 1\. `StatefulSet`의 세 가지 약속

`StatefulSet`은 `Deployment`와 달리 Pod들을 특별하게 다룹니다. 데이터베이스처럼 '신분'이 중요한 Pod들을 위해 세 가지를 약속합니다.

1.  **예측 가능한 고유 이름 (Stable Network Identity):** Pod 이름이 `nginx-ss-0`, `nginx-ss-1` 처럼 예측 가능한 순번으로 부여됩니다. Pod이 재시작되어도 이 이름은 절대 바뀌지 않습니다.
2.  **개별적인 영구 저장 공간 (Stable Persistent Storage):** 각 Pod은 자신의 이름에 맞는 별개의 PVC를 자동으로 할당받고, 재시작 시에도 항상 이전에 사용하던 바로 그 PVC에 다시 연결됩니다. (`nginx-ss-0`은 항상 `data-nginx-ss-0` PVC를 사용)
3.  **순서가 보장된 배포와 확장 (Ordered Deployment and Scaling):** Pod을 생성할 때는 `0`번부터 순서대로, 삭제할 때는 `N`번부터 역순으로 하나씩 처리합니다. 이는 데이터베이스 클러스터의 안정적인 운영에 필수적입니다.

## 2\. 도우미: Headless 서비스

`StatefulSet`의 Pod들이 서로를 이름으로 찾게 하려면 특별한 서비스가 필요합니다. 바로 **Headless 서비스**입니다.

`clusterIP: None` 으로 설정된 이 서비스는 일반적인 서비스처럼 트래픽을 분산하는 대신, **각 Pod의 고유한 DNS 주소를 만들어주는 역할**만 합니다. 예를 들어, 다른 Pod가 `nginx-ss-0.my-headless-svc` 라는 주소로 `nginx-ss-0` Pod에 직접 접근할 수 있게 됩니다.

## 3\. Step 1: Headless 서비스 생성하기

`StatefulSet`을 만들기 전에, Pod들의 주소를 관리해 줄 Headless 서비스를 먼저 생성해야 합니다.

**📄 `headless-service.yaml`**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-headless-svc
spec:
  # clusterIP: None 으로 설정하는 것이 Headless 서비스의 핵심입니다.
  clusterIP: None
  selector:
    # 이 서비스가 어떤 Pod들을 관리할지 라벨로 지정합니다.
    app: nginx-ss
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```

서비스를 배포합니다.

```bash
kubectl apply -f headless-service.yaml
```

`kubectl get svc my-headless-svc` 로 확인해보면 `CLUSTER-IP`가 `<none>`으로 표시될 것입니다.

## 4\. Step 2: StatefulSet 생성하기

이제 Nginx Pod 3개를 관리하는 `StatefulSet`을 생성해 봅시다.

**📄 `statefulset.yaml`**

```yaml
apiVersion: apps/v1
kind: StatefulSet # 리소스 종류는 StatefulSet 입니다.
metadata:
  name: nginx-ss
spec:
  # serviceName에 위에서 만든 Headless 서비스의 이름을 정확히 적어줍니다.
  serviceName: "my-headless-svc"
  replicas: 3
  selector:
    matchLabels:
      app: nginx-ss # 이 라벨은 Headless 서비스의 selector와 일치해야 합니다.
  template:
    metadata:
      labels:
        app: nginx-ss
    spec:
      containers:
      - name: nginx
        image: nginx:1.21
        ports:
        - containerPort: 80
        volumeMounts:
        - name: data # 아래 volumeClaimTemplates의 이름과 일치해야 합니다.
          mountPath: /usr/share/nginx/html
  # 이 부분이 StatefulSet의 핵심입니다.
  # 각 Pod을 위한 PVC를 자동으로 생성해주는 템플릿입니다.
  volumeClaimTemplates:
  - metadata:
      name: data
    spec:
      accessModes: [ "ReadWriteOnce" ]
      storageClassName: "standard" # ex02에서 확인한 StorageClass
      resources:
        requests:
          storage: 1Gi
```

`StatefulSet`을 배포합니다.

```bash
kubectl apply -f statefulset.yaml
```

## 5\. Step 3: StatefulSet의 특징 관찰하기

`StatefulSet`이 정말 약속대로 동작하는지 확인해 봅시다.

#### A. 예측 가능한 Pod 이름

`kubectl get pods` 를 실행하면 Pod 이름이 순서대로 `nginx-ss-0`, `nginx-ss-1`, `nginx-ss-2` 로 생성된 것을 볼 수 있습니다.

```bash
kubectl get pods -l app=nginx-ss

# NAME         READY   STATUS    RESTARTS   AGE
# nginx-ss-0   1/1     Running   0          2m
# nginx-ss-1   1/1     Running   0          90s
# nginx-ss-2   1/1     Running   0          1m
```

#### B. 개별적인 PVC 생성

`kubectl get pvc` 를 실행하면 `volumeClaimTemplates`에 의해 각 Pod에 대한 PVC가 자동으로 생성된 것을 볼 수 있습니다.

```bash
kubectl get pvc

# NAME               STATUS   VOLUME                                     CAPACITY   ACCESS MODES   STORAGECLASS   AGE
# data-nginx-ss-0    Bound    pvc-1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p   1Gi        RWO            standard       2m
# data-nginx-ss-1    Bound    pvc-p6o5n4m3-l2k1-j0i9-h8g7-f6e5d4c3b2a1   1Gi        RWO            standard       90s
# data-nginx-ss-2    Bound    pvc-a1b2c3d4-e5f6-g7h8-i9j0-k1l2m3n4o5p6   1Gi        RWO            standard       1m
```

PVC 이름이 `(volumeClaimTemplate의 name)-(StatefulSet의 name)-(순번)` 규칙으로 만들어진 것을 확인하세요.

#### C. 순서가 보장된 확장 및 축소

`scale` 명령어로 Pod 개수를 늘렸다가 줄여보겠습니다.

1.  **스케일 아웃 (3개 -\> 5개):**
    ```bash
    kubectl scale statefulset nginx-ss --replicas=5
    ```
    `kubectl get pods` 를 계속 실행해서 관찰해보면, `nginx-ss-3`이 먼저 생성되고 `Running` 상태가 된 **다음에야** `nginx-ss-4`가 생성되는 것을 볼 수 있습니다.
2.  **스케일 인 (5개 -\> 2개):**
    ```bash
    kubectl scale statefulset nginx-ss --replicas=2
    ```
    이번에는 순번이 가장 높은 `nginx-ss-4`가 먼저 삭제되고, 그 다음 `nginx-ss-3`이 삭제되는 것을 볼 수 있습니다.

-----

### ⭐ 핵심 정리

  - 데이터베이스처럼 상태 유지가 중요한 애플리케이션에는 `Deployment`보다 `StatefulSet`이 적합합니다.
  - `StatefulSet`은 Pod에게 **안정적인 이름**과 \*\*개별적인 영구 스토리지(PVC)\*\*를 제공하고, **배포 순서를 보장**합니다.
  - `Headless Service`는 `StatefulSet`의 Pod들이 서로를 DNS 이름으로 찾을 수 있도록 돕는 필수적인 파트너입니다.