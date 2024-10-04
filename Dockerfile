#TODO: overwrite this boilerplate with https://github.com/docker-library/python/blob/4babb0e3da12a080e249f0d15c61404ac2e5d3b0/3.12/slim-bookworm/Dockerfile

FROM python:3.12-slim-bookworm

# Set environment variables
ENV PIP_DISABLE_PIP_VERSION_CHECK 1
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /code

# Install dependencies
COPY ./requirements.txt .
RUN pip install -r requirements.txt

# Copy project
COPY . .