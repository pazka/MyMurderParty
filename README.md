# MyMurderParty

Quick project to have a support for my murder party, will hold character, objects, images and guide of the whole story. The "Murder party" is more free flow and consist in a mix of "Les Loups-garous de Thiercelieux", Cluedo, Treasure Hunt, Escape Room and Roleplay... a bit of everything

- Players will be able to exchange objects and identifiy new objects by scanning their QrCodes. 

- Players will have roles that will have different interactions with the objects.

## Requirements

- Have a phone
- Print the qr-codes of the objects for the players to scan

## Go play it live !

[murder.hosh.it](https://murder.hosh.it)

## How to dev

Front :
```sh
cd Front
# legacy ecause compatibility between react ts and qrcode reader/generator
npm i --legacy-peer-deps
npm start
```

Back :
```sh
cd Back
npm i
npm run dev
```

## How to build

```sh
docker login ghcr.io
docker build . -t ghcr.io/pazka/my-murder-party:latest
docker push ghcr.io/pazka/my-murder-party:latest

ssh gh-action@hosh.it "./deploy_app.sh murder"
```


## How to deploy

docker : `docker run -e ENV=PROD -p <your_prod_port>:80 <youraccount>/my-murder-party:latest`

docker-compose.yml : 
```yaml
version: '3'

services:
  app:
    image: '<youraccount>/my-murder-party:latest'
    restart: always
    ports:
      - '<your_prod_port>:80'
    environment:
      - ENV=PROD
```
