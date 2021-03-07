FROM ubuntu:20.04 as restful4up

ARG HTTP_PORT
ARG WORK_DIR=/opt/restful4up

ARG FLARE_FLOSS_VERSION=floss-v1.7.0-linux
ARG FLARE_FLOSS_ZIP=$FLARE_FLOSS_VERSION.zip
ARG FLARE_FLOSS_FOLDER_PATH_ZIP=$WORK_DIR/$FLARE_FLOSS_VERSION/zip
ARG FLARE_FLOSS_FOLDER_PATH_EXEC=$WORK_DIR/$FLARE_FLOSS_VERSION/exec

WORKDIR ${WORK_DIR}

RUN apt-get update

RUN DEBIAN_FRONTEND="noninteractive" apt-get -y install tzdata
RUN apt-get -y install unzip
RUN apt-get -y install python3-pip
RUN apt-get -y install curl
RUN apt-get -y install build-essential
RUN apt-get -y install nodejs
RUN apt-get -y install wget

RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN curl https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN apt-get update
RUN apt-get -y install nodejs
RUN apt-get -y install yarn

# Unipacker
RUN pip3 install --upgrade unipacker
# Flare Floss
RUN mkdir -p ${FLARE_FLOSS_FOLDER_PATH_EXEC}
RUN mkdir -p ${FLARE_FLOSS_FOLDER_PATH_ZIP}
RUN  cd ${FLARE_FLOSS_FOLDER_PATH_ZIP} && wget https://github.com/fireeye/flare-floss/releases/download/v1.7.0/${FLARE_FLOSS_ZIP}
RUN cd -
RUN unzip ${FLARE_FLOSS_FOLDER_PATH_ZIP}/${FLARE_FLOSS_ZIP} -d ${FLARE_FLOSS_FOLDER_PATH_EXEC}

COPY ./app .

ENV PATH="$HOME/.local/bin:$HOME/${FLARE_FLOSS_FOLDER_PATH_EXEC}:$PATH"
ENV HTTP_PORT=$HTTP_PORT

EXPOSE ${HTTP_PORT}
ENV HTTP_PORT ${HTTP_PORT}

RUN yarn install --forzen-lockfile
RUN yarn build

CMD [ "yarn", "start" ]