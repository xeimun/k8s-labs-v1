# 실습 1: Helm 첫걸음 - Chart 생성부터 삭제까지

이번 실습에서는 Helm의 가장 기본적인 명령어들을 사용하여 차트를 생성하고, 유효성을 검사하고, 클러스터에 배포했다가 삭제하는 전체 라이프사이클을 경험합니다.

### 0단계: Helm 설치하기 (Linux/WSL)

#### Helm 설치 방법 (Linux/WSL)

아래 명령어를 터미널에 복사하여 실행해 주세요. 이 스크립트는 Helm 공식 홈페이지에서 제공하는 가장 일반적인 설치 방법입니다.

```bash
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
```

### 설치 확인

설치가 완료된 후, 터미널을 새로 시작하거나 아래 명령어를 실행하여 셸 설정을 다시 불러온 뒤 버전을 확인해 보세요.

```bash
# 셸 설정 다시 불러오기 (zsh 사용 시 ~/.zshrc)
source ~/.bashrc

# 버전 확인
helm version
```

버전 정보가 정상적으로 출력된다면 Helm 설치가 완료된 것입니다.


### 1단계: Helm Chart 생성하기 (`helm create`)

먼저 Helm이 제공하는 기본 템플릿을 사용하여 첫 번째 차트를 생성합니다. 이 명령은 정해진 디렉토리 구조와 예제 파일들을 자동으로 만들어줍니다.

```bash
helm create my-first-chart
```

`my-first-chart` 폴더 내 생성된 파일들을 확인해 보세요.

- `Chart.yaml`: 차트의 이름, 버전 등 메타 정보가 담긴 파일
- `values.yaml`: 차트의 모든 설정값을 정의하는 가장 중요한 파일. 이 파일의 값을 수정하여 배포 내용을 변경합니다.
- `templates/`: 쿠버네티스 리소스 YAML 템플릿들이 모여있는 디렉토리. (deployment.yaml, service.yaml 등)
- `templates/NOTES.txt`: helm install 성공 후 터미널에 출력될 안내 메시지를 정의하는 파일입니다.
- `charts/`: 이 차트가 의존하는 다른 차트들이 위치할 디렉토리 (지금은 비어있음).

### 2단계: Chart 유효성 검사하기 (helm lint)
차트를 설치하기 전에, 문법적인 오류는 없는지, Helm의 권장 표준은 잘 지켰는지 검사하는 것은 매우 좋은 습관입니다. helm lint 명령어가 이 역할을 합니다.

```Bash
helm lint ./my-first-chart
```
아래와 같이 0 chart(s) failed 메시지가 나오면 성공입니다.

==> Linting ./my-first-chart
[INFO] Chart.yaml: icon is recommended
1 chart(s) linted, 0 chart(s) failed

### 3단계: 최종 배포 결과물 미리보기 (helm template)
우리가 만든 차트와 values.yaml의 설정값이 조합되어 최종적으로 어떤 모습의 YAML 파일로 렌더링되는지 미리 확인하는 것은 디버깅에 매우 유용합니다. helm template 명령어로 실제 클러스터에 배포하지 않고 결과물만 안전하게 확인할 수 있습니다.

```Bash
helm template ./my-first-chart
```

service.yaml, deployment.yaml, serviceaccount.yaml 등 templates/ 폴더 안의 파일들이 values.yaml의 값들과 합쳐져 완전한 쿠버네티스 YAML 형태로 출력되는 것을 확인하세요.

### 4단계: Chart 설치 및 릴리스(Release) 확인
이제 차트를 쿠버네티스 클러스터에 실제로 설치해 보겠습니다. Helm에서는 설치된 차트의 인스턴스를 릴리스(Release) 라고 부릅니다.

`helm install <릴리스_이름> <차트_경로>` 형식으로 명령을 실행합니다.

```Bash
# "my-first-release" 라는 이름으로 my-first-chart를 설치합니다.
helm install my-first-release ./my-first-chart
```

설치가 성공하면 templates/NOTES.txt에 정의된 내용이 출력됩니다. 이제 helm list 명령으로 현재 클러스터에 배포된 릴리스 목록을 확인해 봅시다.

```Bash
helm list
# 또는 축약어인 ls 사용
helm ls
kubectl get all 명령으로 실제 리소스들이 생성되었는지도 확인해 보세요.
```

### 5단계: 릴리스 삭제하기 (helm uninstall)
실습을 마쳤으니 배포했던 모든 리소스를 한 번에 깔끔하게 삭제해 보겠습니다.

```Bash
helm uninstall my-first-release
```