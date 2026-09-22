pipeline {
    agent {
        kubernetes {
            yaml '''
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: kaniko
    image: gcr.io/kaniko-project/executor:v1.23.2-debug
    imagePullPolicy: IfNotPresent
    command:
    - sleep
    args:
    - "9999999"
    resources:
      requests:
        memory: "512Mi"
        cpu: "200m"
      limits:
        memory: "2Gi"
        cpu: "2000m"
    volumeMounts:
    - name: kaniko-secret
      mountPath: /kaniko/.docker
  - name: git
    image: alpine/git:latest
    command:
    - sleep
    args:
    - "9999999"
    resources:
      requests:
        memory: "64Mi"
        cpu: "50m"
      limits:
        memory: "256Mi"
        cpu: "200m"
  - name: jnlp
    resources:
      requests:
        memory: "128Mi"
        cpu: "50m"
      limits:
        memory: "512Mi"
        cpu: "500m"
  restartPolicy: Never
  volumes:
  - name: kaniko-secret
    secret:
      secretName: harbor-cred
      items:
      - key: .dockerconfigjson
        path: config.json
'''
        }
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
    }

    environment {
        HARBOR_URL = 'std-harbor.kopoctc.kr'
        HARBOR_PROJECT = 'kopo02'
        FRONTEND_IMAGE = 'gamereview-frontend'
        BACKEND_IMAGE = 'gamereview-backend'
        IMAGE_TAG = "v${BUILD_NUMBER}"
        GITOPS_REPO = 'std-gitlab.kopoctc.kr/kopo021/gitops.git'
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Source code checked out'
                sh 'ls -la'
            }
        }

        stage('Build Frontend') {
            steps {
                container('kaniko') {
                    sh """
                        /kaniko/executor \
                          --context=\${WORKSPACE} \
                          --dockerfile=\${WORKSPACE}/Dockerfile \
                          --destination=${HARBOR_URL}/${HARBOR_PROJECT}/${FRONTEND_IMAGE}:${IMAGE_TAG} \
                          --skip-tls-verify
                    """
                }
            }
        }

        stage('Build Backend') {
            steps {
                container('kaniko') {
                    sh """
                        /kaniko/executor \
                          --context=\${WORKSPACE}/backend \
                          --dockerfile=\${WORKSPACE}/backend/Dockerfile \
                          --destination=${HARBOR_URL}/${HARBOR_PROJECT}/${BACKEND_IMAGE}:${IMAGE_TAG} \
                          --skip-tls-verify
                    """
                }
            }
        }

        stage('Update Manifest') {
            steps {
                container('git') {
                    withCredentials([usernamePassword(
                        credentialsId: 'gitlab-token',
                        usernameVariable: 'GIT_USER',
                        passwordVariable: 'GIT_TOKEN'
                    )]) {
                        sh """
                            rm -rf gitops-repo
                            git clone https://\$GIT_USER:\$GIT_TOKEN@${GITOPS_REPO} gitops-repo
                            cd gitops-repo
                            # frontend 는 initContainer 와 web 컨테이너 두 곳에 쓰인다 (g 플래그 필수)
                            sed -i 's|image: ${HARBOR_URL}/${HARBOR_PROJECT}/${FRONTEND_IMAGE}:.*|image: ${HARBOR_URL}/${HARBOR_PROJECT}/${FRONTEND_IMAGE}:${IMAGE_TAG}|g' apps/gamereview/deployment.yaml
                            sed -i 's|image: ${HARBOR_URL}/${HARBOR_PROJECT}/${BACKEND_IMAGE}:.*|image: ${HARBOR_URL}/${HARBOR_PROJECT}/${BACKEND_IMAGE}:${IMAGE_TAG}|g' apps/gamereview/deployment.yaml
                            git config user.email "jenkins@kopoctc.kr"
                            git config user.name "Jenkins"
                            git add apps/gamereview/deployment.yaml
                            git diff --cached --quiet || git commit -m "Update gamereview images to ${IMAGE_TAG}"
                            git push origin main
                        """
                    }
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline succeeded! Images: ${FRONTEND_IMAGE}:${IMAGE_TAG}, ${BACKEND_IMAGE}:${IMAGE_TAG}"
        }
        failure {
            echo "Pipeline failed!"
        }
    }
}
