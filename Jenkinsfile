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
        stage('Selenium Tests') {
            agent {
                docker { image 'python:3.8' }
            }
            steps {
                sh '''
                apt-get update
                apt-get install -y wget unzip
                wget -O /tmp/chromedriver.zip https://chromedriver.storage.googleapis.com/89.0.4389.23/chromedriver_linux64.zip
                unzip /tmp/chromedriver.zip -d /usr/local/bin/
                pip install selenium pytest
                pytest tests/test_selenium.py
                '''
            }
        }
    }
}
