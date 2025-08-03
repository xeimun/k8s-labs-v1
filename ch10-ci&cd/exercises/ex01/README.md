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

# 워크플로우의 이름
name: CI for Todo List Backend

# 워크플로우가 실행될 조건 (Triggers)
on:
  push:
    branches: [ "main" ] # 1. main 브랜치에 push 이벤트가 발생했을 때
    paths:
      - 'apps/todo-list/backend/**' # 2. 변경된 파일이 'apps/todo-list/backend/' 디렉토리 하위에 있을 때만

# 실행될 작업(Job)들
jobs:
  build-and-push:
    # 작업이 실행될 가상 환경
    runs-on: ubuntu-latest

    # 작업의 단계(Step)들
    steps:
      # 1. 소스 코드 체크아웃
      - name: Checkout source code
        uses: actions/checkout@v4

      # 2. Docker Hub에 로그인
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}

      # 3. Docker 이미지 빌드 및 푸시
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./apps/todo-list/backend # Docker 빌드 컨텍스트 경로
          push: true # 빌드 후 푸시 실행
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/todo-list-backend:latest # 이미지 태그 설정 (예: my-docker-id/todo-list-backend:latest)