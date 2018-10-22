# pull base node image.
FROM node:7

# add the npm dependencies and install
COPY ["package.json", "bower.json", "package-lock.json", "/"]
WORKDIR /
RUN npm install

# install bower and gulp globally
RUN npm install -g gulp-cli bower
RUN bower install --config.interactive=false  --allow-root

# add files to context
COPY app /app
COPY gulp /gulp
COPY gulpfile.js /gulpfile.js
COPY properties /properties

# build it
RUN gulp build
