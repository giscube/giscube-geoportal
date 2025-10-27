# Giscube Geoportal

> Giscube Geoportal

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
quasar dev

# build for production with minification
quasar build

```

## Publish library

Prerelease:

npm version prerelease --preid=beta

LIB=True quasar build

npm publish


## Tests commands
```sh
# Unit test (Jest)
CONFIG=test quasar test --unit jest

# End-to-end test (Cypress)
CONFIG=test quasar test --e2e cypress

# Cypress on a visible window / specific test (see what went wrong)
CONFIG=test quasar dev           # in one tab
./node_modules/.bin/cypress open # in another tab (both running at the same time)
```

## Docker commands

docker-compose -f docker-compose-dev.yml up --build

docker-compose -f docker-compose-build.yml up --build
