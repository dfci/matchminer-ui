# pull base node image.
FROM node:7-alpine

# copy the data
COPY dist /var/www/apache-flask/api/static

# UI is mounted into the api docker image via a volume in the docker-compose file
# docker-compose file and other relevant configs are in the API repo.