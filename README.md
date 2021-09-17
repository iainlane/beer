# For testing

Run dynamodb like this:

```
docker run -it --rm -v$(pwd)/docker/dynamodb:/home/dynamodblocal/data -p8000:8000 amazon/dynamodb-local:latest -jar DynamoDBLocal.jar -sharedDb -dbPath ./data
```

and then run our webapp like this:

```
AWS_ACCESS_KEY_ID=DUMMYIDEXAMPLE AWS_SECRET_ACCESS_KEY=DUMMYEXAMPLEKEY go run github.com/iainlane/beer/cmd/beer
```
