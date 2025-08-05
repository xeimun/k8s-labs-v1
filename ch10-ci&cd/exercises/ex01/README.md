# 실습 1. CI: GitHub Actions로 이미지 자동 빌드

## 목표

`todo-list` 백엔드 애플리케이션의 소스 코드가 변경되어 `main` 브랜치에 푸시(Push)될 때, GitHub Actions를 통해 자동으로 Docker 이미지를 빌드하고 Docker Hub에 푸시하는 CI(지속적 통합) 파이프라인을 구축합니다.

## 1. 실습 환경 준비: GitHub Secrets 설정

CI 파이프라인이 Docker Hub에 로그인하려면 인증 정보가 필요합니다. 이 정보를 코드에 직접 노출하는 것은 매우 위험하므로, GitHub의 암호화된 `Secrets` 기능을 사용합니다.

1.  `k8s-labs-v1` GitHub 저장소의 **Settings > Secrets and variables > Actions** 메뉴로 이동합니다.
2.  **New repository secret** 버튼을 클릭하여 아래 두 개의 Secret을 생성합니다.
    * **Name:** `DOCKERHUB_USERNAME`
        * **Secret:** 본인의 Docker Hub 사용자 계정 ID (예: `my-docker-id`)
    * **Name:** `DOCKERHUB_TOKEN`
        * **Secret:** Docker Hub에서 생성한 Access Token 값 (로그인 비밀번호가 아닌, **Access Token**을 사용해야 합니다!)

![GitHub Secrets](https://i.imgur.com/your-image-placeholder.png)  
*(수업 시 실제 스크린샷으로 대체하면 좋습니다)*

## 2. GitHub Actions 워크플로우 작성

프로젝트의 루트 경로에 `.github/workflows` 디렉토리를 생성하고, 그 안에 아래 내용으로 `ci-backend.yml` 파일을 작성합니다.

> **경로:** `<프로젝트 루트>/.github/workflows/ci-backend.yml`

```yaml
# .github/workflows/ci-backend.yml

name: CI for Todo List Backend

# 워크플로우가 실행될 조건 (Triggers)
on:
  push:
    branches: ["main"]
    paths:
      - "apps/todo-list/backend/**"

# 실행될 작업(Job)들
jobs:
  build-and-push:
    runs-on: ubuntu-latest
    steps:
      # 1. 소스 코드 체크아웃
      - name: Checkout source code
        uses: actions/checkout@v4

      # 2. JDK 17 설정
      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: "17"
          distribution: "temurin"

      # 3. Gradle 캐싱
      - name: Gradle Caching
        uses: actions/cache@v4
        with:
          path: |
            ~/.gradle/caches
            ~/.gradle/wrapper
          key: ${{ runner.os }}-gradle-${{ hashFiles('**/*.gradle*', '**/gradle-wrapper.properties') }}
          restore-keys: |
            ${{ runner.os }}-gradle-

      # 4. gradlew에 실행 권한 부여
      - name: Grant execute permission for gradlew
        run: chmod +x gradlew
        working-directory: ./apps/todo-list/backend

      # 5. Gradle로 프로젝트 빌드
      - name: Build with Gradle
        run: ./gradlew build -x test
        working-directory: ./apps/todo-list/backend

      # 6. Docker Hub에 로그인
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      # 7. Docker 이미지 빌드 및 푸시
      - name: Build and push Docker image
        id: build-push
        uses: docker/build-push-action@v5
        with:
          context: ./apps/todo-list/backend
          file: ./apps/todo-list/backend/Dockerfile.prod
          push: true
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/k8s-labs-todo-backend:${{ github.sha }}

      # 8. 생성된 이미지 태그 출력
      - name: Print image tag
        run: echo "Image tagged with:${{ secrets.DOCKERHUB_USERNAME }}/k8s-labs-todo-backend:${{ github.sha }}"
