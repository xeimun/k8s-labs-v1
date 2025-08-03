# 실습 3: 전문적인 Helm Chart 제작 및 릴리스 관리

**목표**: Helm의 고급 기능을 사용하여 전문적이고, 유지보수성이 높으며, 재사용 가능한 차트를 제작합니다. `_helpers.tpl`을 적극적으로 활용하여 중복을 제거하고, 쿠버네티스 권장 레이블을 도입하여 구조를 명확히 하며, `if` 제어문과 릴리스 관리(`upgrade`/`rollback`)까지 실습합니다.

**준비**: `ex02`에서 사용했던 템플릿 파일들을 `ex03` 디렉토리로 복사하여 시작합니다.

-----

### 1단계: `_helpers.tpl` 설계 및 작성

가장 먼저, 차트의 일관성을 책임질 `_helpers.tpl` 파일을 완성합니다. 이 파일은 이름과 레이블의 "단일 진실 공급원(Single Source of Truth)" 역할을 합니다.

`todo-list-chart/templates/_helpers.tpl` 파일의 전체 내용을 아래 코드로 작성하거나 수정하세요.

```helm
{{/*
Expand the name of the chart.
*/}}
{{- define "todo-list-chart.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "todo-list-chart.fullname" -}}
{{- if .Values.fullnameOverride -}}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- $name := default .Chart.Name .Values.nameOverride -}}
{{- if contains $name .Release.Name -}}
{{- .Release.Name | trunc 63 | trimSuffix "-" -}}
{{- else -}}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" -}}
{{- end -}}
{{- end -}}
{{- end -}}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "todo-list-chart.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" -}}
{{- end -}}

{{/*
Common labels
*/}}
{{- define "todo-list-chart.labels" -}}
helm.sh/chart: {{ include "todo-list-chart.chart" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}

{{/*
Selector labels for Backend component
*/}}
{{- define "todo-list-chart.backend.selectorLabels" -}}
app.kubernetes.io/name: {{ include "todo-list-chart.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: backend
{{- end -}}

{{/*
Selector labels for Database component
*/}}
{{- define "todo-list-chart.database.selectorLabels" -}}
app.kubernetes.io/name: {{ include "todo-list-chart.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/component: database
{{- end -}}
```

-----

### 2단계: 템플릿 파일에 헬퍼 적용하여 완성하기

이제 `_helpers.tpl`에 정의된 헬퍼를 사용하여 각 템플릿 파일을 완성합니다.

  - **`todo-db-service.yaml`**: DB 연결을 위한 고정 주소(`todo-db-service`)를 제공하는 Headless Service입니다.

    ```yaml
    apiVersion: v1
    kind: Service
    metadata:
      name: todo-db-service
      labels:
        {{- include "todo-list-chart.labels" . | nindent 4 }}
        app.kubernetes.io/component: database
    spec:
      clusterIP: None
      ports:
      - port: 3306
        name: mysql
      selector:
        {{- include "todo-list-chart.database.selectorLabels" . | nindent 4 }}
    ```

  - **`todo-db-statefulset.yaml`**: DB 파드를 관리합니다.

    ```yaml
    apiVersion: apps/v1
    kind: StatefulSet
    metadata:
      name: {{ include "todo-list-chart.fullname" . }}-db
      labels:
        {{- include "todo-list-chart.labels" . | nindent 4 }}
        app.kubernetes.io/component: database
    spec:
      serviceName: "todo-db-service"
      replicas: 1
      selector:
        matchLabels:
          {{- include "todo-list-chart.database.selectorLabels" . | nindent 6 }}
      template:
        metadata:
          labels:
            {{- include "todo-list-chart.database.selectorLabels" . | nindent 8 }}
        spec:
          containers:
          - name: mysql
            image: mysql:8.0
            ports:
            - containerPort: 3306
            envFrom:
            - secretRef:
                name: {{ include "todo-list-chart.fullname" . }}-db-secret
            - configMapRef:
                name: {{ include "todo-list-chart.fullname" . }}-db-configmap
            # ... volumeMounts ...
      # ... volumeClaimTemplates ...
    ```

  - **`todo-backend-deployment.yaml`**: 백엔드 애플리케이션 파드를 관리합니다.

    ```yaml
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: {{ include "todo-list-chart.fullname" . }}-backend
      labels:
        {{- include "todo-list-chart.labels" . | nindent 4 }}
        app.kubernetes.io/component: backend
    spec:
      replicas: {{ .Values.backend.replicaCount }}
      selector:
        matchLabels:
          {{- include "todo-list-chart.backend.selectorLabels" . | nindent 6 }}
      template:
        metadata:
          labels:
            {{- include "todo-list-chart.backend.selectorLabels" . | nindent 6 }}
        spec:
          containers:
          - name: todo-backend
            image: "{{ .Values.backend.image.repository }}:{{ .Values.backend.image.tag }}"
            ports:
            - containerPort: 8080
            env:
            - name: DB_HOST
              value: "todo-db-service"
            # ...
    ```

  - **`todo-backend-service.yaml`**: 백엔드 서비스를 외부 또는 내부에 노출합니다.

    ```yaml
    apiVersion: v1
    kind: Service
    metadata:
      name: {{ include "todo-list-chart.fullname" . }}-backend
      labels:
        {{- include "todo-list-chart.labels" . | nindent 4 }}
        app.kubernetes.io/component: backend
    spec:
      type: {{ .Values.backend.service.type }}
      ports:
      - port: {{ .Values.backend.service.port }}
        targetPort: 8080
        {{- if and (eq .Values.backend.service.type "NodePort") .Values.backend.service.nodePort.enabled }}
        nodePort: {{ .Values.backend.service.nodePort.port }}
        {{- end }}
      selector:
        {{- include "todo-list-chart.backend.selectorLabels" . | nindent 4 }}
    ```

(※ `ConfigMap`과 `Secret` 파일은 이전 가이드와 동일하게 동적 이름을 사용하면 됩니다.)

-----

### 3단계: 차트 검증 및 동적 템플릿 확인

모든 파일 작성이 끝나면, 배포 전에 차트가 유효한지, 그리고 `if`문이 잘 동작하는지 확인합니다.

1.  **문법 검사**:

    ```bash
    helm lint .
    ```

2.  **`if`문 동작 확인**: `nodePort`가 사라지는지 확인합니다.

    ```bash
    helm template . --set backend.service.nodePort.enabled=false
    ```

-----

### 4단계: 릴리스 관리 실습 (Upgrade & Rollback)

이제 완성된 차트를 클러스터에 배포하고 운영하는 실습을 진행합니다.

1.  **첫 버전 설치**:

    ```bash
    helm install todo-app .
    ```

2.  **애플리케이션 업그레이드** (`values.yaml`에서 이미지 태그를 `v2`로 변경):

    ```bash
    helm upgrade todo-app .
    ```

3.  **배포 이력 확인**:

    ```bash
    helm history todo-app
    ```

4.  **이전 버전으로 롤백**:

    ```bash
    helm rollback todo-app 1
    ```