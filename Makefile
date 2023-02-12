default: start

##################
# Install command
##################

install:
	npm install

start_ui:
	node server.js

start_uid:
	node --inspect server.js

start_api:
	node serverAPI.js

start_apid:
	node --inspect serverAPI.js

help: ## Display this help message
	@echo "Please use \`make <target>\` where <target> is one of"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; \
	{printf "\033[36m%-40s\033[0m %s\n", $$1, $$2}'
