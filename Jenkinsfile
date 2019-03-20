pipeline {
    agent {
        docker {
            image 'node_build:8'
            args '-v $HOME/.npm:/root/.npm'
        }
    }
    stages {
        stage('install') {
            steps {
                sh 'npm install'
                sh 'bower --allow-root install'
            }
        }
        stage('build') {
            steps {
                sh 'gulp test'
            }
        }
    }
}
