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
                sh 'bower --allow-root --config.interactive=false install'
            }
        }
        stage('build') {
            steps {
                sh 'gulp build'
                sh 'gulp test'

                //report on karma test results
                junit '*.xml'
            }
        }
    }
}
