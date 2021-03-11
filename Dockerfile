FROM ubuntu:20.04 as restful4up

# HTTP port
ARG HTTP_PORT

# Working directory
ARG WORK_DIR=/opt/restful4up

# App folder path
ARG APP_FOLDER_PATH_ZIP=$WORK_DIR/zips
ARG APP_FOLDER_PATH_EXEC=$WORK_DIR/executables

WORKDIR ${WORK_DIR}

RUN apt-get update

# Installing essentials
RUN DEBIAN_FRONTEND="noninteractive" apt-get -y install tzdata
RUN apt-get -y install unzip
RUN apt-get -y install python3-pip
RUN apt-get -y install curl
RUN apt-get -y install build-essential
RUN apt-get -y install wget

# Installing NodeJs and yarn
RUN apt-get -y install nodejs

RUN curl -sL https://deb.nodesource.com/setup_14.x | bash -
RUN curl https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN apt-get update
RUN apt-get -y install nodejs
RUN apt-get -y install yarn

# Unipacker
RUN pip3 install --upgrade unipacker

# PEV tools
RUN apt-get -y install pev

# YARA
RUN apt-get -y install yara 
RUN apt-get -y install yara-doc

# Testing YARA
RUN echo rule dummy { condition: true } > my_first_rule
RUN yara my_first_rule my_first_rule

# Set environment variables
ENV PATH="$HOME/.local/bin:$HOME/${APP_FOLDER_PATH_EXEC}:$PATH"
ENV HTTP_PORT=$HTTP_PORT

EXPOSE ${HTTP_PORT}
ENV HTTP_PORT ${HTTP_PORT}

# Copy source code
COPY ./app .


RUN yarn install --forzen-lockfile
RUN yarn build

# Setting up proper environment
ENV NODE_ENV=production

CMD [ "yarn", "start" ]