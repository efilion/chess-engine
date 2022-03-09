#!/bin/bash
#
# Deploy python webapi to heroku production environment
#

src=$1

git checkout heroku

if [[ `git symbolic-ref HEAD` == */heroku ]]; then
  git clean -df
  git reset --hard origin/heroku
  git rm -rf --ignore-unmatch **
  git reset -- README.md
  git checkout -- README.md
  git checkout $src -- python/webapi
  git mv python/webapi/{Procfile,Pipfile,Pipfile.lock,chess-engine.py,app} . 
  git rm -rf python
  if [ -n "$(git status --porcelain)" ]; then
    git add .
    commit_msg=$(echo `git log --format=%B -n 1 $src`)
    git commit -m "${commit_msg}"
    git push origin heroku
  else
    echo "No changes to commit."
  fi
fi
