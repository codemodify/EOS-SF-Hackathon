package main

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"net/http"

	"github.com/nic0lae/JerryMouse/Servers"
)

type DgitInputParams struct {
	Data string `json:"data,omitempty"`
}

var eosBridgeIP = "10.7.2.65"
var eosBridgeCheck = "http://" + eosBridgeIP + ":8888/v1/chain/get_info"

func main() {
	apiServer := Servers.Api()

	apiServer.SetJsonHandlers([]Servers.JsonHandler{
		{
			Route:      "/push",
			Handler:    pushRequestHandler,
			JsonObject: &DgitInputParams{},
		},
		{
			Route:      "/clone",
			Handler:    cloneRequestHandler,
			JsonObject: &DgitInputParams{},
		},
		{
			Route:      "/commit",
			Handler:    commitRequestHandler,
			JsonObject: DgitInputParams{},
		},
		{
			Route:      "/pull",
			Handler:    pullRequestHandler,
			JsonObject: &DgitInputParams{},
		},
	})

	fmt.Println("Catch me at :9999")
	apiServer.Run(":9999")
}

func pushRequestHandler(data []byte) Servers.JsonResponse {
	return Servers.JsonResponse{}
}

func cloneRequestHandler(data []byte) Servers.JsonResponse {
	return Servers.JsonResponse{}
}

func commitRequestHandler(data []byte) Servers.JsonResponse {
	return Servers.JsonResponse{}
}

func pullRequestHandler(data []byte) Servers.JsonResponse {
	dataFromServer, err := doPost(eosBridgeCheck, "")
	if err != nil {
		return Servers.JsonResponse{
			Error: err.Error(),
		}
	}

	return Servers.JsonResponse{
		Data: string(dataFromServer),
	}
}

func doPost(url string, jsonAsString string) ([]byte, error) {
	req, err := http.NewRequest("POST", url, bytes.NewBuffer([]byte(jsonAsString)))
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	// fmt.Println("response Status:", resp.Status)
	// fmt.Println("response Headers:", resp.Header)
	return ioutil.ReadAll(resp.Body)
}
