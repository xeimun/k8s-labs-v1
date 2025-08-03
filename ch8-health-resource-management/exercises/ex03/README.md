# 실습 3: Startup Probe - 부팅이 느린 건 괜찮아, 기다려줄게

### 🎯 학습 목표
1. 초기 구동에 아주 오랜 시간이 걸리는 애플리케이션이 `livenessProbe`에 의해 계속 재시작되는 문제를 이해한다.
2. `startupProbe`를 사용하여, 초기 구동 시에만 적용되는 긴 대기 시간을 부여하고 애플리케이션이 안정적으로 시작되도록 하는 방법을 배운다.

### 📜 실습 시나리오
1.  **시작하는 데 1분이 걸리는** 웹 서버를 만든다. (대용량 데이터 로딩, 머신러닝 모델 초기화 등 시뮬레이션)
2.  **livenessProbe만 설정된 Pod**를 배포한다.
    - `livenessProbe`는 30초 안에 응답이 없으면 Pod를 실패 처리하고 재시작시킨다.
    - 애플리케이션은 1분이나 걸리므로, 부팅이 끝나기 전에 `livenessProbe`에 의해 계속 재시작되며 **영원히 실행되지 못하는 상태(CrashLoopBackOff)**에 빠진다.
3.  **startupProbe가 추가된 Pod**를 다시 배포한다.
    - `startupProbe`는 최대 2분까지 애플리케이션의 시작을 기다려준다.
    - 이 시간 동안에는 `livenessProbe`가 비활성화된다.
    - 애플리케이션은 1분 후 정상적으로 구동되고, `startupProbe`가 성공하면 그제서야 `livenessProbe`가 활성화되어 평상시의 건강 상태를 감시한다.

### ✅ 확인 포인트
- `livenessProbe`만 있을 때: `kubectl get pod`의 `STATUS`가 `Running` -> `CrashLoopBackOff`로 바뀌고 `RESTARTS` 횟수가 계속 증가함.
- `startupProbe`가 있을 때: `kubectl describe pod`로 `Startup probe`가 성공하고 `Liveness probe`가 시작되는 이벤트를 확인. Pod는 재시작 없이 안정적으로 실행됨.