docker login ghcr.io
docker build . -t ghcr.io/pazka/my-murder-party:latest
docker push ghcr.io/pazka/my-murder-party:latest

ssh gh-action@hosh.it "./deploy_app.sh murder"