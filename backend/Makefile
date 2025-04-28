api:
	@go-swagger3 --module-path . --main-file-path ./internal/api/api.go --output oas.json --schema-without-pkg --generate-yaml true

build-linux:
	@echo "compiling linux application..."
	@GOOS=linux GOARCH=amd64 go build -v -o build/shogun-linux ./cmd/shogun
	@echo "compiling for linux done."

build-local:
	@echo "compiling mac application..."
	@go build -o build/shogun ./cmd/shogun
	@echo "compiling for mac done."

move: build-linux
	@dns="ubuntu@home.dreson4.dev" && \
	remotePath="/home/ubuntu/shogun/shogun" && \
	localPath="./build/shogun-linux" && \
	pemPath="$$HOME/.ssh/wizpacenode" && \
	ssh -i "$$pemPath" "$$dns" "rm -rf $$remotePath" && \
	echo "removing file from remote: $$?" && \
	scp -C -i "$$pemPath" "$$localPath" "$$dns:$$remotePath" && \
	echo "sending file to remote: $$?" && \
	ssh -i "$$pemPath" "$$dns" "sudo systemctl restart shogun" && \
	echo "restarting shogun: $$?"

run:
	@go build -o build/shogun ./cmd/shogun && ./build/shogun

.PHONY: api build move run