@echo off
echo 📦 Initialisation du dépôt Git...

git init
git add .
git commit -m "Initial commit"

set /p repo_url=🔗 Entrez l'URL de votre dépôt GitHub (ex: https://github.com/votre-utilisateur/cnam-dashboard.git) :

git branch -M main
git remote add origin %repo_url%
git push -u origin main

echo ✅ Déploiement terminé !
pause
