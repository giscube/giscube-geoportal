docker-compose -f docker-compose-dev.yml down -v
docker-compose -f docker-compose-dev.yml build --no-cache
bash scripts/run.sh
