pipeline {
    agent {
        docker {
            image 'matchminer_ui_builder:latest'
            args '-v $HOME/.npm:/root/.npm'
        }
    }
    stages {
        stage('install') {
            steps {
                sh 'npm install'
                sh 'npm install grunt@~0.4.0'
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
