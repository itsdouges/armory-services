#!/bin/bash

# Inspiration: http://ypereirareis.github.io/blog/2015/05/04/docker-with-shell-script-or-makefile/

##
# TASK_SERVE
# Run this task to get all containers to a working "running" state on a 
# host machine.
##
task_serve() {
	task_copy_env
	task_copy_db_models

	echo "Starting api.armory.com.."
	
	task_build data
	remove_container data
	task_create data

	task_build db
	remove_container db
	task_run db

	echo "Short pause to let db container finish starting up.."
	pause_for 10

	task_build server
	remove_container server
	task_run server
}

task_serve_dev() {
	echo "Starting dev api.armory.com.."

	task_build data
	remove_container data
	task_create data

	task_build db
	remove_container db
	task_run db

	pause_for 5

	task_build devserver
	remove_container devserver
	task_run devserver
}

task_acceptance() {
	task_build acceptance
	remove_container acceptance
	task_run acceptance
}

# $1: container-name
# $2: relative location for dockerfile
build_container() {
	echo "Building $1.."

	docker build \
		-t "armory/$1:latest" \
		$2
}

pause_for() {
	printf "Pausing for $1 seconds.."

	((t = $1))

  while ((t > 0)); do
  		printf "."
      sleep 1
      ((t -= 1))
  done

  echo " Finished!"
}

##
# CREATE_CONTAINER
# Ala docker run except it doesn't run the container, but merely
# gets it ready to run. You can view it with docker ps -a.
# $1: container-name
# $2: extra commands
##
create_container() {
	echo "Creating $1.."

	docker create \
		$2 \
		--name "armory-$1" \
		-t "armory/$1:latest"
}

remove_container() {
	echo "Removing container armory-$1.."

	docker rm -f "armory-$1"
}

remove_image() {
	echo "Removing image $1.."

	docker rmi -f $1
}

# $1: container-name
# $2: extra commands
run_daemon_container() {
	echo "Running daemon $1.."

	docker run \
		-d \
		$2 \
		--name "armory-$1" \
		"armory/$1:latest"
}

run_container() {
	echo "Running $1.."

	docker run \
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
			run_daemon_container $1 "--volumes-from armory-data -e MYSQL_ROOT_PASSWORD=password -e MYSQL_PASSWORD=password -e MYSQL_USER=admin -e MYSQL_DATABASE=armory";;
		server)
			# docker run -p 8082:8082 --link armory-db:db armory/server
			run_daemon_container $1 "-p 8082:8082 --link armory-db:db";;
		devserver)
			run_container "server" "-p 8082:8082 --link armory-db:db --file=\"PATH/Dockerfile-dev\"";;
		acceptance)
			run_container $1;;
		ping) 
			run_daemon_container $1 "-p 8081:8081";;
		*)
			echo "Supported run: {acceptance|db|ping|devserver|server}";;
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
		acceptance)
			build_container $1 "./test-server/";;
		db)
			build_container $1 "./db-server/";;
		data) 
			build_container $1 "./db-data/";;
		server)
			build_container $1 "./server/";;
		ping)
			build_container $1 "./gw2-ping/";;
		*)
			echo "Supported build: {acceptance|server|db|data|ping}";;
	esac
}

task_remove() {
	case "$1" in
		acceptance)
			remove_container $1;;
		db)
			remove_container $1;;
		data) 
			remove_container $1;;
		server)
			remove_container $1;;
		ping)
			remove_container $1;;
		*)
			echo "Supported removes: {acceptance|server|db|data|ping}";;
	esac
}

task_untagged() {
	echo "Cleaning up untagged images.."
	docker images | grep "<none>" | awk '{print $3}' | xargs docker rmi -f
}

task_clean() {
	case "$1" in
		untagged)
			task_untagged $1;;
		exited) 
			task_exited $1;;
		*)
			echo "Supported removes: {exited|untagged}";;
	esac
}

task_exited() {
	echo "Cleaning up exited containers.."
	docker ps -a | grep Exit | cut -d ' ' -f 1 | xargs docker rm
}

task_copy_env() {
	echo "Copying env to gw2-ping and server.."

	cp -r environment/ gw2-ping/env/
	cp -r environment/ server/env/
}

task_copy_db_models() {
	echo "Copying db-models to gw2-ping and server.."

	cp -r db-models/ gw2-ping/models/
	cp -r db-models/ server/models/
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
	serve)
		task_serve;;
	remove)
		task_remove $2;;
	clean)
		task_clean $2;;
	servedev)
		task_serve_dev;;
	acceptance)
		task_acceptance;;
	*)
		echo "Available tasks: {acceptance|run|serve|remove|clean|create|build|servedev}"
		exit 1;;
esac