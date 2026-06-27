FROM postgres:18

ENV POSTGRES_USER=myuser
ENV POSTGRES_PASSWORD=mypassword
ENV POSTGRES_DB=mydatabase

COPY ./init.sql /docker-entrypoint-initdb.d/

EXPOSE 5432