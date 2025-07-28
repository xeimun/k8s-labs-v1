# .bashrc에 별칭 추가

echo 'alias k=kubectl' >> ~/.bashrc
source ~/.bashrc

# kubectl 자동 완성 설정

kubectl completion bash | sudo tee /etc/bash_completion.d/kubectl > /dev/null

- 바로 적용되지 않음.

# bash 쉘 새롭게 시작 후 tab 키 활용해 명령어 자동완성 확인하기

# 별칭에도 자동 완성 적용

echo 'complete -o default -F \_\_start_kubectl k' >> ~/.bashrc
source ~/.bashrc
