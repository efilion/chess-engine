#!/bin/bash
#
# Deploy react frontend to gh-pages production environment
#

src=$1

git checkout gh-pages

if [[ `git symbolic-ref HEAD` == */gh-pages ]]; then
  git clean -df
  git reset --hard origin/gh-pages
  git checkout $src -- react-web-frontend
  cd react-web-frontend && npm install && npm run build && cd ..
  cp -r react-web-frontend/build/* .
  git rm -rf react-web-frontend
  if [ -n "$(git status --porcelain)" ]; then
    git add .
    commit_msg=$(echo `git log --format=%B -n 1 $src`)
    git commit -m "${commit_msg}"
    git push origin gh-pages
  else
    echo "No changes to commit."
  fi
fi
