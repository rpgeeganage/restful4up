FROM ubuntu:20.04 as restful4up

WORKDIR /opt/restful4up

ARG HTTP_PORT

RUN apt-get update

RUN DEBIAN_FRONTEND="noninteractive" apt-get -y install tzdata
RUN apt-get -y install python3-pip
RUN apt-get install -y curl
RUN apt-get install -y build-essential
RUN apt-get install -y nodejs

RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN curl https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN apt-get update
RUN apt-get install -y nodejs
RUN apt-get install -y yarn

RUN pip3 install --upgrade unipacker

COPY ./app .

ENV PATH="$HOME/.local/bin:$PATH"
ENV HTTP_PORT=$HTTP_PORT

EXPOSE ${HTTP_PORT}
ENV HTTP_PORT ${HTTP_PORT}

RUN yarn install --forzen-lockfile
RUN yarn build

CMD [ "yarn", "start" ]