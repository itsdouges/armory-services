#!/bin/bash

# $1: container-name
# $2: relative location for dockerfile
# $3: extra tag
build_container() {
	docker build \
		-t "armory-$1:latest" \
		$2
}

# $1: container-name
# $2: port forward
# $3: extra commands
run_container() {
	docker run \
		-d \ # daemon mode
		-p $2 \
		$3 \
		armory-$1:latest
}

# $1: container-name
task_run() {
	case "$1" in
		db)
			run_container $1 "3306:3306" "-e MYSQL_ROOT_PASSWORD=password";;
		auth)
			run_container $1 "8080:8000";;
		characters)
			run_container $1;;
		ping) 
			run_container $1;;
		users)
			run_container $1;;
		*)
			echo "Supported runs: {auth|characters|db|ping|users}";;
	esac
}

# $1: container-name
task_build() {
	case "$1" in
		db)
			build_container $1 "./db/";;
		auth) 
			build_container $1 "./auth/";;
		characters)
			build_container $1 "./characters/";;
		ping) 
			build_container $1 "./ping/";;
		users)
			build_container $1 "./users/";;
		*)
			echo "Supported builds: {auth|characters|db|ping|users}";;
	esac
}

# $1: task
# $2: container-name
case "$1" in
	run)
		task_run $2;;
	build)
		task_build $2;;
	*)
		echo "Available tasks: {run|build}"
		exit 1;;
esac