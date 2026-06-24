Write-Host "ðŸš€ STARTING LOCAL BUILD & DEPLOYMENT..." -ForegroundColor Green

Write-Host "`nðŸ“¦ 1. Building Docker Image locally..." -ForegroundColor Cyan
docker build -t vidforge-web -f apps/web/Dockerfile .
if ($LASTEXITCODE -ne 0) { Write-Host "âŒ Build failed!" -ForegroundColor Red; exit 1 }

Write-Host "`nðŸ“¦ 2. Exporting image to vidforge-web.tar..." -ForegroundColor Cyan
docker save vidforge-web -o vidforge-web.tar
if ($LASTEXITCODE -ne 0) { Write-Host "âŒ Docker save failed!" -ForegroundColor Red; exit 1 }

Write-Host "`nðŸ“¤ 3. Uploading image to EC2 (This may take a few minutes)..." -ForegroundColor Cyan
scp -i "D:\key\VideoForge_AI.pem" -o StrictHostKeyChecking=no vidforge-web.tar ubuntu@3.27.132.130:~
if ($LASTEXITCODE -ne 0) { Write-Host "âŒ SCP image failed!" -ForegroundColor Red; exit 1 }

Write-Host "`nðŸ“¤ 4. Uploading docker-compose.prod.yml and .env to EC2..." -ForegroundColor Cyan
ssh -i "D:\key\VideoForge_AI.pem" -o StrictHostKeyChecking=no ubuntu@3.27.132.130 "mkdir -p ~/VidForge-AI"
scp -i "D:\key\VideoForge_AI.pem" -o StrictHostKeyChecking=no docker-compose.prod.yml .env ubuntu@3.27.132.130:~/VidForge-AI/
if ($LASTEXITCODE -ne 0) { Write-Host "âŒ SCP configs failed!" -ForegroundColor Red; exit 1 }

Write-Host "`nðŸŸ¢ 5. Loading image and starting containers on EC2..." -ForegroundColor Cyan
ssh -i "D:\key\VideoForge_AI.pem" -o StrictHostKeyChecking=no ubuntu@3.27.132.130 "sudo docker load -i ~/vidforge-web.tar && cd ~/VidForge-AI && sudo docker compose -f docker-compose.prod.yml up -d --force-recreate"
if ($LASTEXITCODE -ne 0) { Write-Host "âŒ EC2 start failed!" -ForegroundColor Red; exit 1 }

Write-Host "`nðŸŽ‰ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
