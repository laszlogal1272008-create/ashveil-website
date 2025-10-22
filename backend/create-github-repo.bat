@echo off
echo Creating GitHub repository and deploying...

echo Installing GitHub CLI if needed...
winget install GitHub.cli

echo Creating GitHub repository...
gh repo create ashveil-backend --public --source=. --remote=origin --push

echo Repository created and code pushed!
echo Now you can connect it to Railway at: https://railway.app/new
echo Select "Deploy from GitHub repo" and choose ashveil-backend

pause