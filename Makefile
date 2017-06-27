# ifneq ($(wildcard /local/users/username),)
#   HOME = /local/users/username
# endif

all: prepare build

.PHONY: prepare build build-image run stop

prepare:
	@docker run --rm -it -v $(CURDIR):/workspace harmish/typescript typings install --save

build:
	@docker run --rm -v $(CURDIR):/workspace harmish/typescript tsc -t ES6 -p /workspace || true

build-image:
	@docker build -t harmish/ros3dnav .

run: build-image
	@docker run -d --name=ros3dnav \
     --restart=unless-stopped \
     -p 80:80 \
     harmish/ros3dnav

stop::
	@docker stop ros3dnav >/dev/null 2>&1 || true
	@docker rm ros3dnav >/dev/null 2>&1 || true
