# Lab 02: `ddoddo-market` 프로덕션 환경 구성하기 (Spring Boot Actuator 활용)

### 🎯 목표
3-Tier 애플리케이션인 `ddoddo-market`의 백엔드와 데이터베이스에 **Health Probes**와 **Resource `requests/limits`** 를 적용하여, 실제 운영 환경 수준의 안정성과 자원 효율성을 갖추도록 만듭니다. 특히, 백엔드는 **Spring Boot Actuator**를 활용하여 표준화된 방식으로 상태를 점검합니다.

### 🎯 미션 (Your Mission)

#### 1. Spring Boot Actuator 활성화

`ddoddo-market` 백엔드 프로젝트에 Actuator를 적용하여 쿠버네티스가 상태를 확인할 수 있는 표준 엔드포인트를 노출해야 합니다.

1.  **`build.gradle` 파일에 의존성 추가:**
    `dependencies` 블록 안에 아래 라인을 추가하여 Actuator 라이브러리를 포함시키세요.
    ```groovy
    implementation 'org.springframework.boot:spring-boot-starter-actuator'
    ```

2.  **`application.yml` 파일에 설정 추가:**
    `src/main/resources/application.yml` 파일에 아래 설정을 추가하여, 쿠버네티스의 Liveness/Readiness 상태를 관리하는 Actuator의 Health Endpoint를 활성화하고 외부에 노출시키세요.
    ```yaml
    management:
      endpoints:
        web:
          exposure:
            include: "health"  # /actuator/health 엔드포인트를 외부에 노출
      health:
        livenessstate:
          enabled: true      # /actuator/health/liveness 사용 설정
        readinessstate:
          enabled: true      # /actuator/health/readiness 사용 설정
    ```
3.  **애플리케이션 재빌드 및 이미지 푸시:**
    위 변경사항을 적용하여 백엔드 애플리케이션을 다시 빌드하고, 새 버전의 Docker 이미지를 만들어 레지스트리에 푸시하세요. (예: `your-docker-id/ddoddo-backend:1.1`)

---
#### 2. Backend (`ddoddo-backend-deployment.yaml`)

* **Probes 요구사항 (Actuator 기준):**
    * **Startup Probe:** 백엔드 애플리케이션이 완전히 구동될 때까지 충분히 기다려야 합니다.
        * **구현 조건:** 컨테이너 시작 후 **20초** 뒤부터, **10초**마다 **`/actuator/health`** 경로를 확인하세요. 이 검사는 최대 12번까지 실패를 허용하여 약 2분(120초)의 시작 시간을 보장해야 합니다.
    * **Liveness Probe:** 애플리케이션의 프로세스가 살아있는지 확인합니다. 스프링부트의 Liveness 상태는 애플리케이션이 심각한 오류에 빠지지 않는 한 정상 상태를 유지합니다.
        * **구현 조건:** 컨테이너 시작 후 **30초** 뒤부터, **20초**마다 Spring Actuator가 제공하는 **`/actuator/health/liveness`** 경로로 HTTP GET 요청을 보내세요.

    * **Readiness Probe:** 애플리케이션이 DB와 연결되는 등 모든 준비를 마치고 실제 트래픽을 받을 수 있는지 확인합니다.
        * **구현 조건:** 컨테이너 시작 후 **15초** 뒤부터, **10초**마다 **`/actuator/health/readiness`** 경로로 HTTP GET 요청을 보내세요. 스프링부트는 데이터소스(DB) 등의 외부 연결이 준비되었을 때만 이 경로에 200 OK를 응답합니다.

* **Resource 요구사항:**
    * 이 백엔드 서버는 `Burstable` QoS 등급을 가져야 합니다.
    * **구현 조건:** 최소 **CPU 0.5개**와 **메모리 512Mi**를 보장받도록 요청(`requests`)하고, 최대 **CPU 1개**와 **메모리 1Gi**까지 사용하도록 제한(`limits`)하세요.

---
#### 3. Database (`ddoddo-database-statefulset.yaml`)

* **Probes 요구사항:**
    * **Startup Probe:** MySQL의 긴 초기 구동 시간을 기다려주어야 합니다.
        * **구현 조건:** 컨테이너 시작 후 **15초** 뒤부터, **10초**마다 `mysqladmin ping` 명령어를 실행하여 DB 응답을 확인하세요. 이 검사는 **최대 10번까지 실패를 허용**해야 합니다.
    * **Liveness Probe:** Startup 완료 후, DB의 건강 상태를 지속적으로 확인해야 합니다.
        * **구현 조건:** `startupProbe`와 동일한 `mysqladmin ping` 명령어를 사용하되, **30초**마다 검사하고 **3번** 연속 실패 시 Pod를 재시작하도록 설정하세요.

* **Resource 요구사항:**
    * 데이터베이스는 `Guaranteed` QoS 등급을 가져야 합니다.
    * **구현 조건:** **CPU 1개**와 **메모리 2Gi**를 요청(`requests`)하고, 그와 **동일한 값**으로 한도(`limits`)를 설정하세요.

---
### ✅ 확인 방법

1.  모든 YAML 파일을 수정한 뒤, `ddoddo-market`의 백엔드와 데이터베이스를 배포합니다.
2.  `kubectl get pods -w` 명령어로 모든 Pod들이 정상적으로 `Running`되고 `READY` 상태가 되는지 실시간으로 확인합니다.
3.  **브라우저나 `curl`을 사용**하여 백엔드 Pod의 `/actuator/health` 경로에 직접 접속해 보세요. DB 연결 상태 등이 포함된 상세한 JSON 응답을 확인할 수 있습니다.
4.  `kubectl describe pod <pod-name>` 명령어로 각 Pod에 Probe와 Resource 설정이 요구사항대로 정확히 적용되었는지, 그리고 의도한 `QoS Class`가 할당되었는지 확인합니다.