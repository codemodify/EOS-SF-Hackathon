package main

import (
	"github.com/nic0lae/JerryMouse/Servers"
	"github.com/nic0lae/JerryMouse/Contracts"
)

func main() {
	apiServer := Servers.Api()

	apiServer.SetJsonHandlers([]Servers.JsonHandler{
		{
			Route:      "/push",
			Handler:    pushRequestHandler,
			JsonObject: &interface{},
		},
		{
			Route:      "/clone",
			Handler:    cloneRequestHandler,
			JsonObject: &interface{},
		},
		{
			Route:      "/commit",
			Handler:    commitRequestHandler,
			JsonObject: &interface{},
		},
		{
			Route:      "/pull",
			Handler:    pullRequestHandler,
			JsonObject: &interface{},
		},
	})

	apiServer.Run(":9999")
}

func pushRequestHandler(data []byte) JsonResponse {

}

func cloneRequestHandler(data []byte) JsonResponse {

}

func commitRequestHandler(data []byte) JsonResponse {

}

func pullRequestHandler(data []byte) JsonResponse {

}
