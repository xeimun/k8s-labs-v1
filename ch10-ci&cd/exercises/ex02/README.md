# 실습 2. CD: ArgoCD와 Helm으로 파이프라인 완성하기

## 목표

`ex01`에서 구축한 CI 파이프라인을 확장하여 완전한 CI/CD 파이프라인을 구축합니다. CI가 완료되면 GitHub Actions가 자동으로 **Manifests 저장소**의 **Helm 배포 지시서**를 업데이트하고, **ArgoCD**가 이 변경을 감지하여 쿠버네티스 클러스터에 자동으로 애플리케이션을 배포(CD)하도록 합니다.

## 1\. App Repo 준비: Helm 차트 작성

애플리케이션을 Helm으로 패키징하여 배포를 표준화하고 재사용성을 높입니다.

1.  **Helm 차트 생성:**
    `k8s-labs-v1` 저장소의 `apps/todo-list/backend/` 경로 아래에, `helm create` 명령어를 사용하여 `helm/todo-list-chart` 라는 이름으로 새 Helm 차트를 생성합니다.

    ```bash
    # k8s-labs-v1/apps/todo-list/backend/ 경로에서 실행
    helm create helm/todo-list-chart
    ```

2.  **템플릿 수정:**
    생성된 `helm/todo-list-chart/templates/` 디렉토리 안의 `deployment.yaml` 과 `service.yaml`을 열고, `ch9`에서 사용했던 `todo-list` 백엔드 리소스의 내용으로 수정합니다. 특히 `deployment.yaml`의 `image` 부분을 아래와 같이 변수로 변경합니다.

    ```yaml
    # helm/todo-list-chart/templates/deployment.yaml
    # ...
    spec:
      template:
        spec:
          containers:
            - name: {{ .Chart.Name }}
              image: "{{ .Values.image.repository }}:{{ .Values.image.tag | default .Chart.AppVersion }}" # ✨ image 값을 변수로 처리
              # ...
    ```

3.  **기본값 설정 (`values.yaml`):**
    `helm/todo-list-chart/values.yaml` 파일을 열어 `image`의 기본값을 설정합니다.

    ```yaml
    # helm/todo-list-chart/values.yaml
    image:
      repository: [내 DockerHub 계정]/k8s-labs-todo-backend # ex01에서 사용한 이미지 이름
      tag: "initial" # CI가 이 값을 덮어쓸 예정
    ```

## 2\. Manifests Repo 및 ArgoCD 준비

1.  **Manifests 저장소 생성 및 `Application` YAML 작성:**

      - `k8s-labs-todo-list-manifests` 라는 이름의 새로운 **Public** Git 저장소를 생성합니다.

      - 생성한 저장소에 `todo-list-application.yaml` 파일을 만들고 아래 내용을 작성하여 푸시합니다. **`repoURL`의 GitHub 계정은 본인 것으로 수정해야 합니다.**

        ```yaml
        # k8s-labs-todo-list-manifests/todo-list-application.yaml
        apiVersion: argoproj.io/v1alpha1
        kind: Application
        metadata:
          name: todo-list
          namespace: argocd
        spec:
          project: default
          source:
            repoURL: 'https://github.com/[내 GitHub 계정]/k8s-labs-v1.git' # App Repo 주소
            targetRevision: 'main'
            path: 'apps/todo-list/backend/helm/todo-list-chart'       # App Repo 내의 Helm 차트 경로
            helm:
              parameters:
                - name: 'image.tag'
                  value: 'initial' # CI 파이프라인이 이 값을 업데이트할 예정
          destination:
            server: 'https://kubernetes.default.svc'
            namespace: 'default'
          syncPolicy:
            automated:
              prune: true
              selfHeal: true
        ```

2.  **PAT(Personal Access Token) 설정:**
    CI 워크플로우가 위 Manifests 저장소에 `push`할 수 있도록, `repo` 권한을 가진 PAT를 생성하여 `k8s-labs-v1` 저장소 Secret에 **`ACTION_PAT`** 라는 이름으로 등록합니다.

3.  **ArgoCD 설치 및 앱 등록:**

      - 클러스터에 ArgoCD를 설치하고 UI에 로그인합니다.
      - `+ NEW APP`을 클릭하여 **`k8s-labs-todo-list-manifests`** 저장소를 바라보는 `todo-list` 애플리케이션을 생성합니다.

## 3\. GitHub Actions 워크플로우 확장

`ex01`에서 작성했던 `.github/workflows/ci-backend.yml` 파일에 CD를 위한 단계를 추가하여 아래와 같이 최종 완성합니다.

> **경로:** `<프로젝트 루트>/.github/workflows/ci-backend.yml`

```yaml
# .github/workflows/ci-backend.yml (최종본)
name: CI/CD for Todo List Backend

on:
  push:
    branches: ["main"]
    paths:
      - "apps/todo-list/backend/**"

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      # --- ex01에서 작성한 CI 단계 ---
      - name: Checkout source code
        uses: actions/checkout@v4
      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: "17"
          distribution: "temurin"
      - name: Grant execute permission for gradlew
        run: chmod +x gradlew
        working-directory: ./apps/todo-list/backend
      - name: Build with Gradle
        run: ./gradlew build -x test
        working-directory: ./apps/todo-list/backend
      - name: Login to Docker Hub
        uses: docker/login-action@v3
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./apps/todo-list/backend
          file: ./apps/todo-list/backend/Dockerfile.prod
          push: true
          tags: ${{ secrets.DOCKERHUB_USERNAME }}/k8s-labs-todo-backend:${{ substr(github.sha, 0, 7) }}
      
      # --- 여기서부터 CD를 위한 새로운 단계 추가 ---
      - name: Checkout manifests repository
        uses: actions/checkout@v4
        with:
          token: ${{ secrets.ACTION_PAT }}
          repository: ${{ github.repository_owner }}/k8s-labs-todo-list-manifests
          path: manifests

      - name: Install yq
        run: |
          sudo wget https://github.com/mikefarah/yq/releases/latest/download/yq_linux_amd64 -O /usr/bin/yq
          sudo chmod +x /usr/bin/yq

      - name: Update image tag in ArgoCD Application manifest
        run: |
          NEW_TAG=${{ substr(github.sha, 0, 7) }}
          yq e '(.spec.source.helm.parameters[] | select(.name == "image.tag")).value = strenv(NEW_TAG)' -i manifests/todo-list-application.yaml

      - name: Commit and push changes
        run: |
          cd manifests
          git config --global user.name "github-actions[bot]"
          git config --global user.email "github-actions[bot]@users.noreply.github.com"
          git add .
          if git diff --staged --quiet; then
            echo "No changes to commit"
          else
            git commit -m "ci(backend): Update image tag to ${{ substr(github.sha, 0, 7) }}"
            git push
          fi
```

## 4\. 실행 및 결과 확인

1.  `apps/todo-list/backend/` 의 소스코드를 수정하고 push 합니다. `/ping` 엔드포인트 결과 수정
2.  GitHub Actions에서 워크플로우가 성공적으로 완료되는지 확인합니다.
3.  `k8s-labs-todo-list-manifests` 저장소의 커밋 히스토리에 `github-actions[bot]`이 생성한 커밋이 있는지 확인합니다.
4.  ArgoCD UI에서 `todo-list` 앱의 상태가 자동으로 `Syncing` 후 `Healthy`로 바뀌며, Pod가 롤링 업데이트되는 것을 관찰합니다.
5.  모든 배포가 완료된 후, `curl` 명령어를 사용하여 백엔드 서비스의 `/ping` 엔드포인트를 호출하고, 수정한 버전 정보가 응답으로 오는지 최종 확인합니다.