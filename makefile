run:
	@AWS_PROFILE=frontend node -e 'require("./main").handler()'

bundle:
	@zip -r main.zip ./*