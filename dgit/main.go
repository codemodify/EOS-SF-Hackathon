package main

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"io/ioutil"
	"net/http"
	"os"
)

var eosBridgeIP = "10.7.2.65"
var eosBridgeEndpoint = "http://" + eosBridgeIP + ":3001/"

func main() {
	if len(os.Args) < 3 {
		showUsage()
		return
	}

	var command = os.Args[1]
	var repository = os.Args[2]

	if command == "clone" {
		fmt.Println(fmt.Sprintf("Cloning %s ...", repository))
		handleClone(repository)
	} else if command == "push" {
		fmt.Println(fmt.Sprintf("Pushing %s ...", repository))
		handlePush(repository)
	} else if command == "pull" {
		fmt.Println(fmt.Sprintf("Pulling %s ...", repository))
		handlePull(repository)
	} else {
		showUsage()
	}
}

func showUsage() {
	fmt.Println("Usage: dgit {clone|push|pull} TheRepositoryToWorkOn")
}

func handleClone(repository string) {
	data, err := doPost(eosBridgeEndpoint+"clone", "")
	if err != nil {
		fmt.Println(err)
		return
	}

	data, _ = base64.StdEncoding.DecodeString(string(data))
	err = ioutil.WriteFile("code.py", data, 0644)
	if err != nil {
		fmt.Println(err)
	}
}

func handlePush(repository string) {
	var bountyID = os.Args[3]

	fileContent, err := ioutil.ReadFile("code.py")

	encodedFileContent := base64.StdEncoding.EncodeToString(fileContent)
	fmt.Println("pushing: " + encodedFileContent)
	_, err = doPost(
		eosBridgeEndpoint+"push",
		fmt.Sprintf("{\"code\":\"%s\", \"bounty_id\": %s}", encodedFileContent, bountyID),
	)
	if err != nil {
		fmt.Println(err)
		return
	}
}

func handlePull(repository string) {
	handleClone(repository)
}

func doPost(url string, jsonAsString string) ([]byte, error) {
	// fmt.Println(url)
	// fmt.Println(jsonAsString)

	req, err := http.NewRequest("POST", url, bytes.NewBuffer([]byte(jsonAsString)))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	return ioutil.ReadAll(resp.Body)
}
