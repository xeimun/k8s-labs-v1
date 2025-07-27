# Chapter 2 - Lab: 3티어 애플리케이션 Pod로 배포하기

## 🎯 Lab 목표

이번 실습의 목표는 3티어 구조의 웹 애플리케이션(`ddoddo-market`)을 여러분 스스로의 힘으로 쿠버네티스 환경에 배포해보는 것입니다. 각 컴포넌트(Frontend, Backend, Database)를 쿠버네티스의 가장 기본 단위인 **Pod**를 사용하여 직접 배포합니다.

이 과정은 정답을 따라 치는 것이 아닌, **주어진 문제와 힌트를 바탕으로 스스로 해결책을 찾아 나가는 도전 과제**입니다. 애플리케이션 코드를 분석하고, 필요한 설정을 찾아내며, 발생할 수 있는 문제들을 예측하고 해결하는 능력을 기르는 데 초점을 맞춥니다.

---

## 🚀 시작하기 전에: ddoddo-market 프로젝트 분석

우리가 배포할 `ddoddo-market`은 간단한 중고마켓 웹 애플리케이션이며, 3개의 티어(Tier)로 구성되어 있습니다.

1.  **Frontend:** `Next.js`로 구현된 웹 애플리케이션 서버입니다. 사용자에게 UI를 제공하고, 백엔드 API와 통신하여 데이터를 주고받습니다. (`apps/ddoddo-market/frontend`)
2.  **Backend:** `Spring Boot`로 구현된 API 서버입니다. 데이터베이스와 통신하여 비즈니스 로직을 처리하고, 프론트엔드에 API를 제공합니다. (`apps/ddoddo-market/backend`)
3.  **Database:** `PostgreSQL` 데이터베이스를 사용하여 사용자 정보, 상품 데이터 등을 저장합니다.

각 애플리케이션의 소스 코드는 `apps/ddoddo-market` 디렉토리에서 확인할 수 있습니다.


## 💻 해결 과제

여러분은 `apps/ddoddo-market` 프로젝트를 쿠버네티스 클러스터에 배포해야 합니다. 아래의 구현 목표를 만족하는 `Dockerfile` 2개와 쿠버네티스 `Pod` YAML 파일 3개를 `ch2/labs` 디렉토리에 직접 작성해주세요.

### 과제 1: Frontend & Backend 애플리케이션 컨테이너화

**구현 목표:**

1.  `ddoddo-market`의 **frontend**와 **backend** 애플리케이션을 각각 빌드하고 컨테이너 이미지로 만드세요.
    * `apps/ddoddo-market/frontend/Dockerfile`
    * `apps/ddoddo-market/backend/Dockerfile`
2.  생성한 두 개의 이미지를 Docker Hub와 같은 공개 컨테이너 레지스트리에 푸시하세요. (예: `your-username/ddoddo-frontend:v1`, `your-username/ddoddo-backend:v1`)

### 과제 2: 쿠버네티스 Pod Manifest 작성 및 Pod 생성

**구현 목표:**

아래의 요구사항을 만족하는 3개의 Pod Manifest YAML 파일을 작성하세요.

1.  **`database-pod.yaml`**
    * **Pod 이름:** `db-pod`
    * **컨테이너 이미지:** `postgres:15`
    * **환경 변수:** PostgreSQL 컨테이너 실행에 필요한 `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`를 설정하세요. (값은 자유롭게 지정)
    * **포트:** 컨테이너의 `5432` 포트를 노출하세요.

2.  **`backend-pod.yaml`**
    * **Pod 이름:** `backend-pod`
    * **컨테이너 이미지:** **과제 1**에서 빌드하고 푸시한 백엔드 이미지를 사용하세요.
    * **환경 변수:** `ddoddo-market` 백엔드 애플리케이션 실행에 필요한 모든 환경 변수를 찾아 설정하세요.
    * **포트:** 컨테이너의 `8080` 포트를 노출하세요.

3.  **`frontend-pod.yaml`**
    * **Pod 이름:** `frontend-pod`
    * **컨테이너 이미지:** **과제 1**에서 빌드하고 푸시한 프론트엔드 이미지를 사용하세요.
    * **환경 변수:** `ddoddo-market` 프론트엔드 애플리케이션 실행에 필요한 모든 환경 변수를 찾아 설정하세요.
    * **포트:** 컨테이너의 `3000` 포트를 노출하세요.

---

## 💡 문제 해결을 위한 Tips & 힌트

### Tip 1: 코드 속에 힌트가 있습니다.

애플리케이션이 어떤 환경 변수를 필요로 하는지는 **소스 코드**와 **설정 파일**에 모두 명시되어 있습니다.

* **Backend (`apps/ddoddo-market/backend`):**
    * `src/main/resources/application.yml` 과 `application-dev.yml` 파일을 열어 데이터베이스 연결에 어떤 정보가 필요한지 확인해보세요.
    * `src/main/java/com/ddoddo/backend/config/S3Config.java` 파일을 분석하면 이미지 업로드를 위해 어떤 환경 변수들이 필요한지 알 수 있습니다. Cloudflare R2는 S3와 호환되므로, 관련된 AWS 설정값을 유추할 수 있습니다.
    * **Spring Boot 환경 변수 규칙:** `spring.datasource.url` 같은 YAML 키는 `SPRING_DATASOURCE_URL` 형태의 환경 변수로 대체될 수 있습니다.

* **Frontend (`apps/ddoddo-market/frontend`):**
    * `src/utils/supabase/client.ts` 와 `server.ts` 파일은 **Supabase** 연동에 필요한 환경 변수가 무엇인지 알려줍니다.
    * `src/lib/api.ts` 파일에서 백엔드 API 서버의 주소를 어떻게 설정하는지 확인해보세요.
    * **Next.js 환경 변수 규칙:** 클라이언트 사이드에서 사용 가능한 환경 변수는 `NEXT_PUBLIC_` 접두사로 시작해야 합니다.

### Tip 2: Pod의 네트워크는 격리되어 있습니다.

쿠버네티스에서 각 **Pod는 고유한 IP 주소를 갖는 독립된 공간**입니다. Pod 내부에서 `localhost`를 호출하면 다른 Pod가 아닌 **자기 자신**을 가리킵니다.

`backend-pod`가 `db-pod`에 연결해야 할 때, 연결 주소를 `localhost`나 `127.0.0.1`로 설정하면 어떻게 될까요? 이번 실습의 핵심적인 학습 포인트 중 하나입니다. (이 문제는 다음 챕터에서 `Service`를 배우며 해결합니다.)

### Tip 3: `kubectl` 디버깅

Pod가 정상적으로 실행되지 않는다면 아래 명령어를 사용해 원인을 파악하세요.

```bash
# Pod의 현재 상태와 이벤트(에러 원인) 확인
kubectl describe pod <pod-name>

# Pod 내부 컨테이너의 로그 확인
kubectl logs <pod-name>
```