#!/bin/bash
set -e


# cd into the project folder
cd "$(dirname "$0")/.."


# Check that there's nothing to commit (based on https://stackoverflow.com/questions/5143795/how-can-i-check-in-a-bash-script-if-my-local-git-repository-has-changes)
git update-index -q --refresh
if [ ! -z $(git diff-index --name-only @ --) ]; then
  echo "There are uncommited changes. Aborting"
  exit
fi

# Update package version (if necessary)
if ! [[ "$(git log -1 --pretty=%B)" =~ ^[0-9]+\.[0-9]+\.[0-9]+(\-beta\.[0-9]+)?$ ]]; then  # If the last commit is NOT a version commit
  while true; do
    read -p "New prerelease? [y/n] " yn
    echo
    case $yn in
      [Yy]* ) break;;
      [Nn]* ) exit;;
      * ) echo "Please answer yes or no.";;
    esac
  done

  npm version prerelease --preid=beta

  while true; do
    read -p "Push prerelease? [Y/n] " yn
    echo
    case $yn in
      [Yy'']* )
        git push
        git push --tags
        break
        ;;
      [Nn]* ) break;;
      * ) echo "Please answer yes or no.";;
    esac
  done
fi


# Build
rm -rf dist
npm install
LIB=True quasar build


# Publish
while true; do
  read -p "Are you sure do you want to publish? [y/n] " yn
  echo
  case $yn in
    [Yy]* ) break;;
    [Nn]* ) exit;;
    * ) echo "Please answer yes or no.";;
  esac
done

npm publish
