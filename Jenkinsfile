pipeline {
    agent {
        docker { image 'node_build:latest' }
    }
    stages {
        stage('install') {
            steps {
                sh 'npm install'
                sh 'bower install'
            }
        }
        stage('build') {
            steps {
                sh 'gulp test'
            }
        }
    }
}
