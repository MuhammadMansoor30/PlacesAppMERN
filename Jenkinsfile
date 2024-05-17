pipeline {
    agent any

    stages {
        stage('Install Dependencies') {
            steps {
                // Set working directory to frontend folder
                dir('Frontend') {
                    sh 'npm install'
                }
            }
        }
        stage('Build') {
            agent {
                docker { image 'node:latest' }
            }
            steps {
                dir('Frontend') {
                    sh 'npm run build'
                }
            }
        }
        stage('Test') {
            steps {
                dir('Frontend') {
                    sh 'npm test'
                }
            }
        }
    }
}
