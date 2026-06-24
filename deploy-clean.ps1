Write-Host "STARTING LOCAL BUILD & DEPLOYMENT..." -ForegroundColor Green
docker build -t vidforge-web -f apps/web/Dockerfile .
if ($LASTEXITCODE -ne 0) { Write-Host "Build failed!" -ForegroundColor Red; exit 1 }

Write-Host "Exporting image to vidforge-web.tar..." -ForegroundColor Cyan
docker save vidforge-web -o vidforge-web.tar
if ($LASTEXITCODE -ne 0) { Write-Host "Docker save failed!" -ForegroundColor Red; exit 1 }

Write-Host "Uploading image to EC2..." -ForegroundColor Cyan
scp -i "D:\key\VideoForge_AI.pem" -o StrictHostKeyChecking=no vidforge-web.tar ubuntu@3.27.132.130:~
if ($LASTEXITCODE -ne 0) { Write-Host "SCP image failed!" -ForegroundColor Red; exit 1 }

Write-Host "Uploading docker-compose.prod.yml and .env to EC2..." -ForegroundColor Cyan
ssh -i "D:\key\VideoForge_AI.pem" -o StrictHostKeyChecking=no ubuntu@3.27.132.130 "mkdir -p ~/VidForge-AI"
scp -i "D:\key\VideoForge_AI.pem" -o StrictHostKeyChecking=no docker-compose.prod.yml .env ubuntu@3.27.132.130:~/VidForge-AI/
if ($LASTEXITCODE -ne 0) { Write-Host "SCP configs failed!" -ForegroundColor Red; exit 1 }

Write-Host "Loading image and starting containers on EC2..." -ForegroundColor Cyan
ssh -i "D:\key\VideoForge_AI.pem" -o StrictHostKeyChecking=no ubuntu@3.27.132.130 "sudo docker load -i ~/vidforge-web.tar && cd ~/VidForge-AI && sudo docker compose -f docker-compose.prod.yml up -d"
if ($LASTEXITCODE -ne 0) { Write-Host "EC2 start failed!" -ForegroundColor Red; exit 1 }

Write-Host "DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
