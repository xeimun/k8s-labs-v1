# nginx 파드 생성

kubectl create deployment nginx --image=nginx:latest

# 배포 상태 확인

kubectl get deployments

# 파드 상태 확인

kubectl get pods

# nginx를 NodePort 서비스로 노출

kubectl expose deployment nginx --type=NodePort --port=80

# 서비스 확인

kubectl get services

# Minikube를 통해 서비스 접근

minikube service nginx
