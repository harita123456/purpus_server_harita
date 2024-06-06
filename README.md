# Purpus Server Repository (from github)

## Currently using main branch for everything and main is up to date

## Version on server

Node version on server : v18.19.1
npm version on server : 10.2.4
pm2 version on server : 5.3.1


## Git commands for repo manage on server

<!-- For clone repository on server first time -->
git clone <repo_name>

<!-- For checkout on any branch of the repositoy -->
git checkout <branch_name>

<!-- For pull changes from the repository on server -->
git pull

## Commands for install dependencies on server before start services 

<!-- For install all dependencies on server -->
npm install 

## Commands for restart node js services on server

<!-- For start the node js application first time -->
pm2 start app.ja --name "purpus_live"

<!-- For restart services after pulling every changes -->
pm2 restart purpus_live
