package dynamodb

import (
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/awserr"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/guregu/dynamo"

	"errors"
)

var sess *session.Session
var db *dynamo.DB

type Entry struct {
	url string `dynamo:"ID,hash"`
}

func init() {
	cfg := aws.Config{
		Endpoint:                      aws.String("http://localhost:8000"),
		Region:                        aws.String("eu-west-2"),
		CredentialsChainVerboseErrors: aws.Bool(true),
	}
	sess = session.Must(session.NewSession())
	db = dynamo.New(sess, &cfg)
}

func CreateTable(name string, from interface{}) error {
	ct := db.CreateTable(name, from)
	err := ct.Run()

	var ae awserr.Error

	if err != nil {
		if !errors.As(err, &ae) || ae.Code() != "ResourceInUseException" {
			return err
		}
	}

	return nil
}

func GetTables() ([]string, error) {
	var name string
	var tables []string

	lt := db.ListTables()
	iter := lt.Iter()
	for iter.Next(&name) {
		tables = append(tables, name)
	}

	return tables, nil
}
