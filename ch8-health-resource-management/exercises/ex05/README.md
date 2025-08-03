# 실습 5: Quality of Service (QoS) - 내 Pod는 얼마나 중요할까?

### 🎯 학습 목표
1. `requests`와 `limits` 설정에 따라 쿠버네티스가 Pod에 부여하는 3가지 QoS 클래스(`Guaranteed`, `Burstable`, `BestEffort`)를 이해한다.
2. 각 QoS 클래스의 의미를 이해하고, 클러스터에 자원이 부족해지는 비상 상황에서 어떤 Pod가 먼저 종료(Eviction)되는지 그 우선순위를 설명할 수 있다.

### 📚 개념 설명: QoS 클래스란?

쿠버네티스는 Node의 메모리나 CPU가 부족해지면, 안정성을 위해 중요도가 낮은 Pod부터 강제로 종료하여 자원을 확보합니다. 이때의 '중요도'가 바로 QoS 클래스입니다.

1.  **Guaranteed (최우선 순위 ⭐⭐⭐)**
    * **조건**: 모든 컨테이너의 `cpu`와 `memory`에 대해 `requests`와 `limits`가 설정되어 있고, 그 값이 **완전히 동일**해야 합니다.
    * **의미**: "요청한 만큼의 자원을 반드시 보장받고, 그 이상은 절대 사용하지 않겠다"는 약속. 가장 중요한 Pod(DB 등)에 사용하며, 가장 마지막까지 살아남습니다.

2.  **Burstable (중간 순위 ⭐⭐)**
    * **조건**: `requests`와 `limits`가 설정되어 있지만, 값이 서로 다른 경우. (또는 `requests`만 설정된 경우)
    * **의미**: "최소 이만큼(`requests`)은 보장해줘, 하지만 여유가 있다면 `limits`까지는 더 사용해볼게" 라는 의미. 일반적인 웹 애플리케이션에 사용하며, `BestEffort`보다는 중요하지만 `Guaranteed`보다는 먼저 종료될 수 있습니다.

3.  **BestEffort (최하 순위 ⭐)**
    * **조건**: `cpu`와 `memory`에 대해 `requests`와 `limits`가 **전혀 설정되지 않은** 경우.
    * **의미**: "남는 자원이 있으면 쓰고, 없으면 말고" 라는 의미. 중요도가 낮은 테스트용 Pod나 배치(Batch) 작업에 사용하며, 자원이 부족할 때 **가장 먼저 종료 대상**이 됩니다.

### 📜 실습 시나리오
1.  각 QoS 클래스(`Guaranteed`, `Burstable`, `BestEffort`)에 해당하는 Pod YAML 파일을 각각 작성한다.
2.  3개의 Pod를 모두 클러스터에 배포한다.
3.  `kubectl describe pod` 명령어를 사용하여, 쿠버네티스가 각 Pod에 어떤 `QoS Class`를 할당했는지 직접 확인한다.

### ✅ 확인 포인트
- `kubectl describe pod <pod-name> | grep "QoS Class"` 명령어로 각 Pod의 QoS 클래스가 예상대로 출력되는지 확인.