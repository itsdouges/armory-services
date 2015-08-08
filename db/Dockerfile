FROM mysql:5.7

MAINTAINER madou <laheen@gmail.com>

LABEL Description="Database container for api.armory.net.au."

RUN sed -i -e "s/^bind-address\s*=\s*127.0.0.1/bind-address = 0.0.0.0/" /etc/mysql/my.cnf