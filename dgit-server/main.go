package main

import (
	"fmt"

	"github.com/nic0lae/JerryMouse/Servers"
)

type DgitInputParams struct {
	Data string `json:"data,omitempty"`
}

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
	return Servers.JsonResponse{}
}
