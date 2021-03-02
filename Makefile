#!make
DOCKER_IMAGE_NAME := restful4up
HTTP_PORT := 7887

build:
	@docker build -t $(DOCKER_IMAGE_NAME) .

run:
	@docker run -e HTTP_PORT=$(HTTP_PORT) -e DEBUG=* -p $(HTTP_PORT):$(HTTP_PORT) --rm $(DOCKER_IMAGE_NAME)