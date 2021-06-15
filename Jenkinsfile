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
                sh 'yarn install'
                sh """
                    rm -rf node_modules && \
                    rm -rf bower_components && \
                    yarn install
                    """
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
