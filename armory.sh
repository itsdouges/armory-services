#!/bin/bash

##
# TASK_SERVE
# Run this task to get all containers to a working "running" state on a 
# host machine.
##
task_serve() {
	echo "Starting api.armory.."

	task_build db
	task_run db
}

# $1: container-name
# $2: relative location for dockerfile
build_container() {
	docker build \
		-t "armory/$1:latest" \
		$2
}

##
# CREATE_CONTAINER
# Ala docker run except it doesn't run the container, but merely
# gets it ready to run. You can view it with docker ps -a.
# $1: container-name
##
create_container() {
	docker rm -f "armory-$1"

	docker create \
		--name "armory-$1" \
		-t "armory/$1:latest"

}

# $1: container-name
# $2: extra commands
run_container() {
	docker rm -f "armory-$1"

	docker run \
		-d \
		$2 \
		--name "armory-$1" \
		"armory/$1:latest"
}

# -p x:y x=host-port, y=container-port
# $1: container-name
task_run() {
	echo "Running $1.."

	case "$1" in
		db)
			# TODO: Replace user/pass with environment variables passed in.
			run_container $1 "--volumes-from armory-data -v /var/lib/mysql:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=password -e MYSQL_PASSWORD=password -e MYSQL_USER=admin -e MYSQL_DATABASE=armory";;
		auth)
			run_container $1 "-p 8080:8080";;
		server)
			run_container $1 "-p 8082:8082 --link armory-db:db";;
		ping) 
			run_container $1 "-p 8081:8081";;
		*)
			echo "Supported run: {auth|characters|db|ping|users}";;
	esac
}

task_create() {
	echo "Creating $1.."

	case "$1" in
		data)
			create_container $1;;
		*)
			echo "Supported create: {data}";;
	esac
}

# $1: container-name
task_build() {
	echo "Building $1.."

	case "$1" in
		db)
			build_container $1 "./db-server/";;
		data) 
			build_container $1 "./db-data/";;
		auth)
			build_container $1 "./auth/";;
		server)
			build_container $1 "./server/";;
		ping)
			build_container $1 "./ping/";;
		*)
			echo "Supported build: {auth|server|db|data|ping}";;
	esac
}

# $1: task
# $2: container-name
case "$1" in
	run)
		task_run $2;;
	create)
		task_create $2;;
	build)
		task_build $2;;
	start)
		task_serve;;
	*)
		echo "Available tasks: {run|create|build|serve}"
		exit 1;;
esac