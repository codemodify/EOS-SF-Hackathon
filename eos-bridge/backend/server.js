const express = require("express");
const app = express();

//require { Api, JsonRpc, RpcError, JsSignatureProvider } from 'eosjs'; // https://github.com/EOSIO/eosjs

const { Api, JsonRpc, RpcError, JsSignatureProvider } = require('eosjs');
const { TextDecoder, TextEncoder } = require('text-encoding');

const fetch = require('node-fetch');

var bodyParser = require('body-parser');
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// eosio endpoint
const endpoint = "http://localhost:8888";

const accounts = [
  {"name":"useraaaaaaaa", "privateKey":"5K7mtrinTFrVTduSxizUc5hjXJEtTjVTsqSHeBHes1Viep86FP5", "publicKey":"EOS6kYgMTCh1iqpq9XGNQbEi8Q6k5GujefN9DSs55dcjVyFAq7B6b"},
  {"name":"useraaaaaaab", "privateKey":"5KLqT1UFxVnKRWkjvhFur4sECrPhciuUqsYRihc1p9rxhXQMZBg", "publicKey":"EOS78RuuHNgtmDv9jwAzhxZ9LmC6F295snyQ9eUDQ5YtVHJ1udE6p"},
  {"name":"useraaaaaaac", "privateKey":"5K2jun7wohStgiCDSDYjk3eteRH1KaxUQsZTEmTGPH4GS9vVFb7", "publicKey":"EOS5yd9aufDv7MqMquGcQdD6Bfmv6umqSuh9ru3kheDBqbi6vtJ58"},
  {"name":"useraaaaaaad", "privateKey":"5KNm1BgaopP9n5NqJDo9rbr49zJFWJTMJheLoLM5b7gjdhqAwCx", "publicKey":"EOS8LoJJUU3dhiFyJ5HmsMiAuNLGc6HMkxF4Etx6pxLRG7FU89x6X"},
  {"name":"useraaaaaaae", "privateKey":"5KE2UNPCZX5QepKcLpLXVCLdAw7dBfJFJnuCHhXUf61hPRMtUZg", "publicKey":"EOS7XPiPuL3jbgpfS3FFmjtXK62Th9n2WZdvJb6XLygAghfx1W7Nb"},
  {"name":"useraaaaaaaf", "privateKey":"5KaqYiQzKsXXXxVvrG8Q3ECZdQAj2hNcvCgGEubRvvq7CU3LySK", "publicKey":"EOS5btzHW33f9zbhkwjJTYsoyRzXUNstx1Da9X2nTzk8BQztxoP3H"},
  {"name":"useraaaaaaag", "privateKey":"5KFyaxQW8L6uXFB6wSgC44EsAbzC7ideyhhQ68tiYfdKQp69xKo", "publicKey":"EOS8Du668rSVDE3KkmhwKkmAyxdBd73B51FKE7SjkKe5YERBULMrw"}
];


app.set("port", process.env.PORT || 3001);

// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}



// DONE!!!
// Createbounty Endpoint which calls EOS function:
// ACTION createbounty(std::string bountyname, int reward, std::string description)
app.post("/createbounty", (req, res) => {

    let account = accounts[0].name;
    let privateKey = accounts[0].privateKey;
    //let privateKey = event.target.privateKey.value;
    let note = "Mike Lin Test (not used! /createbounty endpoint)";

    // prepare variables for the switch below to send transactions
    let actionName = "";
    let actionData = {};

    console.log(req.body);

    // define actionName and action according to event type
        actionName = "createbounty";
        actionData = {
          bountyname: req.body.bountyname,
          reward: req.body.reward,
          description: req.body.description
        };


    // eosjs function call: connect to the blockchain
    const rpc = new JsonRpc(endpoint, { fetch });
    // const rpc = new JsonRpc(endpoint);
    const signatureProvider = new JsSignatureProvider([privateKey]);
    const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
    // try {
      api.transact({
        actions: [{
          account: "notechainacc",
          name: actionName,
          authorization: [{
            actor: account,
            permission: 'active',
          }],
          data: actionData,
        }]
      }, {
        blocksBehind: 3,
        expireSeconds: 30,
      }).then(function(result){
        // console.log(result);

        // res.send("success");


        const rpc = new JsonRpc(endpoint, { fetch });
        rpc.get_table_rows({
          "json": true,
          "code": "notechainacc",   // contract who owns the table
          "scope": "notechainacc",  // scope of the table
          "table": "bounty",    // name of the table as specified by the contract abi
          "limit": 100,
        }).then(function(result){
          console.log(result);
          // this.setState({ noteTable: result.rows })

          res.send(
              result.rows
          );
        }).catch(function(e){ 
        console.error(e);
        console.log('Caught exception: ' + e);
        if (e instanceof RpcError) {
          console.log(JSON.stringify(e.json, null, 2)); 
        }       
      });

      }).catch(function(e){ 
        console.error(e);
        console.log('Caught exception: ' + e);
        if (e instanceof RpcError) {
          console.log(JSON.stringify(e.json, null, 2)); 
        }       
      });
});

// Issuebounty Endpoint which calls EOS function:
// ACTION issuebounty(uint64_t bounty_id, std::string code)
app.post("/issuebounty", (req, res) => {

    let account = accounts[0].name;
    let privateKey = accounts[0].privateKey;
    //let privateKey = event.target.privateKey.value;
    let note = "Mike Lin Test (not used! /issuebounty endpoint)";

    // prepare variables for the switch below to send transactions
    let actionName = "";
    let actionData = {};

    // define actionName and action according to event type
    // switch (event.type) {
    //   case "submit":
        actionName = "issuebounty";
        actionData = {
          bounty_id: req.body.bounty_id,
          code: req.body.code
        };
    //     break;
    //   default:
    //     return;
    // }

    // eosjs function call: connect to the blockchain
    const rpc = new JsonRpc(endpoint, { fetch });
    // const rpc = new JsonRpc(endpoint);
    const signatureProvider = new JsSignatureProvider([privateKey]);
    const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
    // try {
      api.transact({
        actions: [{
          account: "notechainacc",
          name: actionName,
          authorization: [{
            actor: account,
            permission: 'active',
          }],
          data: actionData,
        }]
      }, {
        blocksBehind: 3,
        expireSeconds: 30,
      }).then(function(result){
        // console.log(result);

        // res.send("success");


        const rpc = new JsonRpc(endpoint, { fetch });
        rpc.get_table_rows({
          "json": true,
          "code": "notechainacc",   // contract who owns the table
          "scope": "notechainacc",  // scope of the table
          "table": "bounty",    // name of the table as specified by the contract abi
          "limit": 100,
        }).then(function(result){
          console.log(result);
          // this.setState({ noteTable: result.rows })

          res.send(
              result.rows
          );
        }).catch(function(e){ 
        console.error(e);
        console.log('Caught exception: ' + e);
        if (e instanceof RpcError) {
          console.log(JSON.stringify(e.json, null, 2)); 
        }       
      });

      }).catch(function(e){ 
        console.error(e);
        console.log('Caught exception: ' + e);
        if (e instanceof RpcError) {
          console.log(JSON.stringify(e.json, null, 2)); 
        }       
      });
});

//DONE!
// Push Endpoint - Front-end can call this endpoint
// => notechain.cpp declaration ==> ACTION push(std::string newcode, uint64_t bounty_id, name user)
app.post("/push", (req, res) => {
    let account = accounts[0].name;
    let privateKey = accounts[0].privateKey;
    //let privateKey = event.target.privateKey.value;
    let note = "Mike Lin Test (not used! /push endpoint)";

    // prepare variables for the switch below to send transactions
    let actionName = "";
    let actionData = {};

    // define actionName and action according to event type
        actionName = "push";
        actionData = {
          newcode: req.body.newcode,
          bounty_id: req.body.bounty_id,
          user: account,
        };

    // eosjs function call: connect to the blockchain
    const rpc = new JsonRpc(endpoint, { fetch });
    // const rpc = new JsonRpc(endpoint);
    const signatureProvider = new JsSignatureProvider([privateKey]);
    const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
    // try {
      api.transact({
        actions: [{
          account: "notechainacc",
          name: actionName,
          authorization: [{
            actor: account,
            permission: 'active',
          }],
          data: actionData,
        }]
      }, {
        blocksBehind: 3,
        expireSeconds: 30,
      }).then(function(result){
        // console.log(result);

         res.send("success");


      //   const rpc = new JsonRpc(endpoint, { fetch });
      //   rpc.get_table_rows({
      //     "json": true,
      //     "code": "notechainacc",   // contract who owns the table
      //     "scope": "notechainacc",  // scope of the table
      //     "table": "notestruct",    // name of the table as specified by the contract abi
      //     "limit": 100,
      //   }).then(function(result){
      //     console.log(result);
      //     // this.setState({ noteTable: result.rows })

      //     res.send(
      //         result.rows
      //     );
      //   }).catch(function(e){ 
      //   console.error(e);
      //   console.log('Caught exception: ' + e);
      //   if (e instanceof RpcError) {
      //     console.log(JSON.stringify(e.json, null, 2)); 
      //   }       
      // });

      }).catch(function(e){ 
        console.error(e);
        console.log('Caught exception: ' + e);
        if (e instanceof RpcError) {
          console.log(JSON.stringify(e.json, null, 2)); 
        }       
      });
});

// Ownerpush
// ACTION ownerpush(std::string newcode)
app.post("/ownerpush", (req, res) => {
    let account = accounts[0].name;
    let privateKey = accounts[0].privateKey;
    //let privateKey = event.target.privateKey.value;
    let note = "Mike Lin Test (not used! /ownerpush endpoint)";

    // prepare variables for the switch below to send transactions
    let actionName = "";
    let actionData = {};

    // define actionName and action according to event type
        actionName = "ownerpush";
        actionData = {
          newcode: req.body.newcode
        };

    // eosjs function call: connect to the blockchain
    const rpc = new JsonRpc(endpoint, { fetch });
    // const rpc = new JsonRpc(endpoint);
    const signatureProvider = new JsSignatureProvider([privateKey]);
    const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
    // try {
      api.transact({
        actions: [{
          account: "notechainacc",
          name: actionName,
          authorization: [{
            actor: account,
            permission: 'active',
          }],
          data: actionData,
        }]
      }, {
        blocksBehind: 3,
        expireSeconds: 30,
      }).then(function(result){
        // console.log(result);

         res.send("success");


      //   const rpc = new JsonRpc(endpoint, { fetch });
      //   rpc.get_table_rows({
      //     "json": true,
      //     "code": "notechainacc",   // contract who owns the table
      //     "scope": "notechainacc",  // scope of the table
      //     "table": "notestruct",    // name of the table as specified by the contract abi
      //     "limit": 100,
      //   }).then(function(result){
      //     console.log(result);
      //     // this.setState({ noteTable: result.rows })

      //     res.send(
      //         result.rows
      //     );
      //   }).catch(function(e){ 
      //   console.error(e);
      //   console.log('Caught exception: ' + e);
      //   if (e instanceof RpcError) {
      //     console.log(JSON.stringify(e.json, null, 2)); 
      //   }       
      // });

      }).catch(function(e){ 
        console.error(e);
        console.log('Caught exception: ' + e);
        if (e instanceof RpcError) {
          console.log(JSON.stringify(e.json, null, 2)); 
        }       
      });
});

// DONE!
// pull endpoint which gets table values
app.post("/pull", (req, res) => {
  const rpc = new JsonRpc(endpoint, { fetch });
        rpc.get_table_rows({
          "json": true,
          "code": "notechainacc",   // contract who owns the table
          "scope": "notechainacc",  // scope of the table
          "table": "field",    // name of the table as specified by the contract abi
          "table_key": 0,       //should be a constant and never change??
          "limit": 100,
        }).then(function(result){
          console.log(result);
          // this.setState({ noteTable: result.rows })

          res.send(
              result.rows[0].code
          );
        }).catch(function(e){ 
        console.error(e);
        console.log('Caught exception: ' + e);
        if (e instanceof RpcError) {
          console.log(JSON.stringify(e.json, null, 2)); 
        }       
      });
});

//DONE!
// clone endpoint which gets table values
app.post("/clone", (req, res) => {
  const rpc = new JsonRpc(endpoint, { fetch });
        rpc.get_table_rows({
          "json": true,
          "code": "notechainacc",   // contract who owns the table
          "scope": "notechainacc",  // scope of the table
          "table": "field",    // name of the table as specified by the contract abi
          "table_key": 0,       //should be a constant and never change??
          "limit": 100,
        }).then(function(result){
          console.log(result);
          // this.setState({ noteTable: result.rows })

          res.send(
              result.rows[0].code
          );
        }).catch(function(e){ 
        console.error(e);
        console.log('Caught exception: ' + e);
        if (e instanceof RpcError) {
          console.log(JSON.stringify(e.json, null, 2)); 
        }       
      });
});

// DONE!
// Setreponame endpoint
//ACTION setreponame(std::string reponame) {
app.post("/setreponame", (req, res) => {

  let account = accounts[0].name;
  let privateKey = accounts[0].privateKey;
  //let privateKey = event.target.privateKey.value;
  let note = "Mike Lin Test (not used! /setreponame endpoint)";

  // prepare variables for the switch below to send transactions
  let actionName = "";
  let actionData = {};

  // define actionName and action according to event type
  // switch (event.type) {
  //   case "submit":
      actionName = "setreponame";
      actionData = {
        reponame: req.body.reponame
      };
  //     break;
  //   default:
  //     return;
  // }

  // eosjs function call: connect to the blockchain
  const rpc = new JsonRpc(endpoint, { fetch });
  // const rpc = new JsonRpc(endpoint);
  const signatureProvider = new JsSignatureProvider([privateKey]);
  const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
  // try {
    api.transact({
      actions: [{
        account: "notechainacc",
        name: actionName,
        authorization: [{
          actor: account,
          permission: 'active',
        }],
        data: actionData,
      }]
    }, {
      blocksBehind: 3,
      expireSeconds: 30,
    }).then(function(result){
      console.log(result);

      res.send("success");


    //   const rpc = new JsonRpc(endpoint, { fetch });
    //   rpc.get_table_rows({
    //     "json": true,
    //     "code": "notechainacc",   // contract who owns the table
    //     "scope": "notechainacc",  // scope of the table
    //     "table": "field",    // name of the table as specified by the contract abi
    //     "limit": 100,
    //   }).then(function(result){
    //     console.log(result);
    //     // this.setState({ noteTable: result.rows })

    //     res.send(
    //         result.rows
    //     );
    //   }).catch(function(e){ 
    //   console.error(e);
    //   console.log('Caught exception: ' + e);
    //   if (e instanceof RpcError) {
    //     console.log(JSON.stringify(e.json, null, 2)); 
    //   }       
    // });

    }).catch(function(e){ 
      console.error(e);
      console.log('Caught exception: ' + e);
      if (e instanceof RpcError) {
        console.log(JSON.stringify(e.json, null, 2)); 
      }       
    });
});

app.listen(app.get("port"), () => {
  console.log(`Find the server at: http://localhost:${app.get("port")}/`); // eslint-disable-line no-console
});
