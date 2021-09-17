package main

import (
	"fmt"
	"os"

	"github.com/iainlane/beer/internal/dynamodb"
	"github.com/iainlane/beer/internal/website"
)

func main() {
	tables, err := dynamodb.GetTables()
	if err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
	fmt.Println(tables)
	website.MakeAndRun(":8080")
}
