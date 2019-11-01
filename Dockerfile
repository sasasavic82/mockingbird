FROM node:10

# Install all required dependencies
RUN apt-get update

# Set the working directory
WORKDIR /mockingbird

# Copy our dependencies
COPY *.json ./
COPY *.yml ./
COPY *.ts ./
COPY bin ./bin
COPY lib ./lib

RUN npm install
RUN npm install pm2 -g

RUN npx tsc

CMD ["pm2-runtime", "cluster.yml"]
