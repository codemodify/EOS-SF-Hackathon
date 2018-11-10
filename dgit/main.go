package main

import (
	"bitbucket.org/metrospot/go_sdk/es6"
	"bitbucket.org/metrospot/go_sdk/typeahead_es5/types"
	"github.com/nic0lae/JerryMouse/Servers"
)

func main() {
	es6.Ping()

	apiServer := Servers.Api()

	apiServer.SetJsonHandlers([]Servers.JsonHandler{
		{
			Route:      "/push",
			Handler:    typeAheadRequestHandler,
			JsonObject: &types.TypeAheadInputParams{},
		},
		{
			Route:      "/RefreshIndexes",
			Handler:    refreshIndexesRequestHandler,
			JsonObject: &types.RefreshIndexesInputParams{},
		},
	})

	apiServer.Run(":8010")
}
