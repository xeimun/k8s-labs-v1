# 최신 Minikube 바이너리 다운로드

curl -LO https://storage.googleapis.com/minikube/releases/latest/minikube-linux-amd64

# /usr/local/bin에 설치 (실행 권한 부여)

sudo install minikube-linux-amd64 /usr/local/bin/minikube

# Minikube 버전 확인

minikube version

# kubectl 설치

sudo snap install kubectl --classic

# 기본 클러스터 시작

minikube start --driver=docker
