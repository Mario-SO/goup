.PHONY: run build-ui build-go launch

run: build-ui build-go launch

build-ui:
	cd ui/ && bun run build

build-go:
	go build

launch:
	./goup serve
