all: build

.PHONY: prepare build run stop

prepare:
	@docker run --rm -it -v $(CURDIR):/workspace harmish/typescript typings install --save

build:
	@docker run --rm -v $(CURDIR):/workspace harmish/typescript tsc -p /workspace
	@docker build -t harmish/ros3dnav .

run:
	@docker run -d --name=ros3dnav \
     --restart=unless-stopped \
     -p 80:80 \
     harmish/ros3dnav

stop::
	@docker stop ros3dnav >/dev/null 2>&1 || true
	@docker rm ros3dnav >/dev/null 2>&1 || true
