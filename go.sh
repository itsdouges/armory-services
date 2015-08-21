#!/bin/bash

# Inspiration: http://ypereirareis.github.io/blog/2015/05/04/docker-with-shell-script-or-makefile/

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
	echo "Building $1.."

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
	echo "Creating $1.."

	docker rm -f "armory-$1"

	docker create \
		--name "armory-$1" \
		-t "armory/$1:latest"

}

# $1: container-name
# $2: extra commands
run_container() {
	echo "Removing $1.."
	docker rm -f "armory-$1"

	echo "Running $1.."
	docker run \
		-d \
		$2 \
		--name "armory-$1" \
		"armory/$1:latest"
}

# -p x:y x=host-port, y=container-port
# $1: container-name
task_run() {
	case "$1" in
		db)
			# TODO: Replace user/pass with environment variables passed in.
			run_container $1 "--volumes-from armory-data -v /var/lib/mysql:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=password -e MYSQL_PASSWORD=password -e MYSQL_USER=admin -e MYSQL_DATABASE=armory";;
		server)
			# docker run -p 8082:8082 --link armory-db:db armory/server
			run_container $1 "-p 8082:8082 --link armory-db:db";;
		ping) 
			run_container $1 "-p 8081:8081";;
		*)
			echo "Supported run: {characters|db|ping|users}";;
	esac
}

task_create() {
	case "$1" in
		data)
			create_container $1;;
		*)
			echo "Supported create: {data}";;
	esac
}

# $1: container-name
task_build() {
	case "$1" in
		db)
			build_container $1 "./db-server/";;
		data) 
			build_container $1 "./db-data/";;
		server)
			build_container $1 "./server/";;
		ping)
			build_container $1 "./ping/";;
		*)
			echo "Supported build: {server|db|data|ping}";;
	esac
}

task_clean() {
	echo "Cleaning up untagged images.."
	docker images | grep "<none>" | awk '{print $3}' | xargs docker rmi -f
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
	clean)
		task_clean;;
	*)
		echo "Available tasks: {run|clean|create|build|serve}"
		exit 1;;
esac