all: build

.PHONY: prepare build

prepare:
	docker run --rm -it -v $(CURDIR):/workspace harmish/typescript typings install --save

build:
	docker run --rm -v $(CURDIR):/workspace harmish/typescript tsc -p /workspace || true
