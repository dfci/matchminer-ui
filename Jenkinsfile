pipeline {
    agent {
        docker { image 'node_build:latest' }
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
                sh 'npm run gulp test'
            }
        }
    }
}
