# Lab 01: `ddoddo-market` 백엔드 CI/CD 파이프라인 구축하기

### 🎯 목표

`exercises`에서 배운 모든 개념(CI, CD, GitOps, Helm, ArgoCD)을 종합하여, `ddoddo-market` 프로젝트의 **백엔드 애플리케이션**에 대한 완전 자동화된 CI/CD 파이프라인을 직접 구축합니다. `git push`만으로 코드 변경 사항이 쿠버네티스 클러스터에 자동으로 배포되는 전체 흐름을 완성합니다.

### 🎯 미션 (Your Mission)

#### 1\. 사전 준비 및 환경 구성

CI/CD 파이프라인을 구축하기 위한 기본 환경을 설정합니다.

1.  **운영용 Dockerfile 생성**: `apps/ddoddo-market/backend/` 경로에, `ex01`에서 배운 내용을 바탕으로 운영 환경 배포에 최적화된 `Dockerfile.prod` 파일을 직접 작성하세요.
2.  **Actuator 설정**: `ddoddo-market` 백엔드 애플리케이션에서 배포 버전을 확인할 수 있도록, 아래 요구사항에 맞게 Actuator를 설정하세요.
      * `build.gradle`에 `actuator` 의존성을 추가하고, `buildInfo()`를 활성화하여 버전 정보가 생성되도록 합니다.
      * `application.yml`에서 `/actuator/health`와 `/actuator/info` 엔드포인트를 웹으로 노출시키세요.
      * `SecurityConfig.java`에서 위 두 엔드포인트가 인증 없이 접근 가능하도록 허용하세요.
3.  **매니페스트 저장소 생성**: `ddoddo-market-manifests` 라는 이름의 새로운 **Public** Git 저장소를 생성하세요.
4.  **GitHub Secrets 등록**: `k8s-labs-v1` 저장소에 CI/CD 파이프라인이 사용할 아래 세 가지 Secret을 등록하세요.
      * `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `ACTION_PAT`

-----

#### 2\. Helm 차트 및 ArgoCD `Application` 설계

`ddoddo-market`의 백엔드와 데이터베이스를 Helm으로 패키징하고, 이를 배포하기 위한 ArgoCD의 배포 지시서를 작성합니다.

1.  **Helm 차트 작성**: `k8s-labs-v1` 저장소의 `apps/ddoddo-market/` 경로 안에, `helm create`를 사용하여 `ddoddo-chart`라는 이름으로 새 Helm 차트를 생성하세요.

      * 이전 챕터에서 사용했던 백엔드와 데이터베이스(`postgres`)의 모든 리소스(Deployment, StatefulSet, Service 등)를 이 차트의 `templates` 디렉토리로 옮겨 템플릿화하세요.
      * `values.yaml`을 수정하여, 백엔드 이미지의 `repository`와 `tag`를 설정할 수 있는 `backend.image.repository`와 `backend.image.tag` 변수를 만드세요.

2.  **ArgoCD `Application` YAML 작성**: `ddoddo-market-manifests` 저장소에, ArgoCD가 Helm 차트를 배포하도록 지시하는 `ddoddo-application.yaml` 

3.  **ArgoCD 앱 등록**: 클러스터에 ArgoCD를 설치하고, UI에 접속하여 위에서 만든 `ddoddo-market-manifests` 저장소를 바라보는 `ddoddo-market` 애플리케이션을 등록하세요.

-----

#### 3\. GitHub Actions 워크플로우 구축

`k8s-labs-v1` 저장소의 `.github/workflows/` 디렉토리에 `ci-ddoddo-backend.yml` 파일을 생성하고, 아래 모든 단계를 포함하는 워크플로우를 직접 완성하세요.

  - **트리거 조건**: `apps/ddoddo-market/backend/**` 경로에 `push` 이벤트가 발생할 때만 실행되도록 설정합니다.
  - **빌드 단계**: `gradlew`에 실행 권한을 부여하고, `build -x test` 명령으로 프로젝트를 빌드합니다.
  - **이미지 푸시 단계**: `Dockerfile.prod`를 사용하여 이미지를 빌드하고, Git 커밋 해시 앞 7자리를 태그로 사용하여 Docker Hub에 푸시합니다.
  - **매니페스트 업데이트 단계**:
      * `ddoddo-market-manifests` 저장소를 `manifests`라는 이름의 폴더로 체크아웃합니다.
      * `yq` 도구를 설치합니다.
      * `yq`를 사용하여 `manifests/ddoddo-application.yaml` 파일의 `backend.image.tag` 파라미터 `value`를 방금 푸시한 새 이미지 태그로 수정합니다.
  - **커밋 & 푸시 단계**: 수정된 `ddoddo-application.yaml` 파일을 "ci(backend): ..." 형식의 커밋 메시지와 함께 `ddoddo-market-manifests` 저장소로 다시 푸시합니다.

-----

### ✅ 확인 방법

1.  `apps/ddoddo-market/backend/build.gradle`의 `version`을 수정하고 `k8s-labs-v1` 저장소에 `push`합니다.
2.  GitHub Actions 탭에서 `CI/CD for Ddoddo-Market Backend` 워크플로우가 성공적으로 완료되는지 확인합니다.
3.  `ddoddo-market-manifests` 저장소의 커밋 히스토리에 `github-actions[bot]`이 생성한 커밋이 있는지 확인합니다.
4.  ArgoCD UI에서 `ddoddo-market` 애플리케이션의 상태가 자동으로 `Syncing` 후 `Healthy`로 바뀌며, 백엔드 `Deployment`의 Pod들만 롤링 업데이트되는 것을 관찰합니다.
5.  모든 배포가 완료된 후, 터미널에서 `curl` 명령어를 사용하여 백엔드 서비스의 `/actuator/info` 엔드포인트를 호출하고, `build.gradle`에서 수정한 버전 정보가 응답으로 오는지 최종 증명하세요.