package main

import (
	"encoding/base64"
	"fmt"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
)

func handler(request events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {

	fmt.Println("[request.Headers] =>", request.Headers)
	fmt.Println("[request.IsBase64Encoded, body 封裝格式] =>", request.IsBase64Encoded)
	// fmt.Println("[request.Body] =>", request.Body)

	// body
	var body []byte
	if request.IsBase64Encoded {
		body, _ = base64.StdEncoding.DecodeString(request.Body)
	} else {
		body = []byte(request.Body)
	}
	fmt.Println("body =>", string(body))

	return events.APIGatewayProxyResponse{
		StatusCode: 200,
		Body:       "....",
	}, nil
}

func main() {
	lambda.Start(handler)
}
