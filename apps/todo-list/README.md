
# Todo List Application with React, Node.js, and PostgreSQL

This project is a simple Todo List application built with React for the frontend, Node.js (Express) for the backend, and PostgreSQL for the database. It is designed to be deployed on Kubernetes.

## Prerequisites

- Docker
- kubectl
- A running Kubernetes cluster (e.g., Minikube, Docker Desktop)
- Node.js and npm

## Directory Structure

```
├── backend
│   ├── src
│   │   ├── controllers
│   │   │   └── todoController.js
│   │   ├── db
│   │   │   └── index.js
│   │   ├── routes
│   │   │   └── todoRoutes.js
│   │   └── index.js
│   ├── .dockerignore
│   ├── Dockerfile
│   └── package.json
├── frontend
│   ├── public
│   ├── src
│   │   ├── App.css
│   │   ├── App.js
│   │   ├── App.test.js
│   │   ├── index.css
│   │   └── index.js
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── package.json
│   └── README.md
├── k8s
│   ├── backend-deployment.yaml
│   ├── backend-service.yaml
│   ├── database.sql
│   ├── frontend-deployment.yaml
│   └── frontend-service.yaml
└── README.md
```

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Set up the database:**

    -   Make sure you have a running PostgreSQL instance.
    -   Create a database named `tododb`.
    -   Run the `database.sql` script to create the `todos` table:

        ```bash
        psql -U <your-username> -d tododb -f k8s/database.sql
        ```

3.  **Configure the backend:**

    -   Navigate to the `backend` directory.
    -   Create a `.env` file and add the following environment variables:

        ```
        PGUSER=<your-postgres-username>
        PGHOST=localhost
        PGPASSWORD=<your-postgres-password>
        PGDATABASE=tododb
        PGPORT=5432
        ```

4.  **Install dependencies and run the backend:**

    ```bash
    cd backend
    npm install
    npm start
    ```

5.  **Configure the frontend:**

    -   Navigate to the `frontend` directory.
    -   The frontend will connect to the backend at `http://localhost:5000`.

6.  **Install dependencies and run the frontend:**

    ```bash
    cd frontend
    npm install
    npm start
    ```

## Building Docker Images

1.  **Build the backend image:**

    ```bash
    cd backend
    docker build -t your-dockerhub-username/todo-backend:latest .
    ```

2.  **Build the frontend image:**

    ```bash
    cd frontend
    docker build -t your-dockerhub-username/todo-frontend:latest .
    ```

## Pushing Docker Images to Docker Hub

1.  **Log in to Docker Hub:**

    ```bash
    docker login
    ```

2.  **Push the backend image:**

    ```bash
    docker push your-dockerhub-username/todo-backend:latest
    ```

3.  **Push the frontend image:**

    ```bash
    docker push your-dockerhub-username/todo-frontend:latest
    ```

## Deploying to Kubernetes

1.  **Update the image names in the deployment files:**

    -   In `k8s/backend-deployment.yaml`, replace `your-dockerhub-username/todo-backend:latest` with your Docker Hub username and image name.
    -   In `k8s/frontend-deployment.yaml`, replace `your-dockerhub-username/todo-frontend:latest` with your Docker Hub username and image name.

2.  **Apply the Kubernetes manifests:**

    ```bash
    kubectl apply -f k8s/
    ```

3.  **Check the status of the pods:**

    ```bash
    kubectl get pods
    ```

4.  **Get the external IP of the frontend service:**

    ```bash
    kubectl get svc frontend-service
    ```

5.  **Access the application in your browser at `http://<external-ip>:3000`**
