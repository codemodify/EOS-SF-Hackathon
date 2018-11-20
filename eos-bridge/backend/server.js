//const sqlite3 = require("sqlite3");
const express = require("express");

const app = express();
//const db = sqlite3.Database('./EOS-SF-Hackathon/dgit/sqlite/nougit.db');
//require { Api, JsonRpc, RpcError, JsSignatureProvider } from 'eosjs'; // https://github.com/EOSIO/eosjs

const { Api, JsonRpc, RpcError, JsSignatureProvider } = require('eosjs');
const { TextDecoder, TextEncoder } = require('text-encoding');

const fetch = require('node-fetch');

let bodyParser = require('body-parser');
app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));

// eosio endpoint
const endpoint = "http://localhost:8888";

const accounts = [
  { "name": "colbygilbert", "privateKey": "5K7mtrinTFrVTduSxizUc5hjXJEtTjVTsqSHeBHes1Viep86FP5", "publicKey": "EOS7R49e5CGtwxX4qNAUN6FiRG5NJguTNo6ey1yGUvMAjvdhfncye" },
  { "name": "useraaaaaaab", "privateKey": "5KLqT1UFxVnKRWkjvhFur4sECrPhciuUqsYRihc1p9rxhXQMZBg", "publicKey": "EOS78RuuHNgtmDv9jwAzhxZ9LmC6F295snyQ9eUDQ5YtVHJ1udE6p" },
  { "name": "useraaaaaaac", "privateKey": "5K2jun7wohStgiCDSDYjk3eteRH1KaxUQsZTEmTGPH4GS9vVFb7", "publicKey": "EOS5yd9aufDv7MqMquGcQdD6Bfmv6umqSuh9ru3kheDBqbi6vtJ58" },
  { "name": "useraaaaaaad", "privateKey": "5KNm1BgaopP9n5NqJDo9rbr49zJFWJTMJheLoLM5b7gjdhqAwCx", "publicKey": "EOS8LoJJUU3dhiFyJ5HmsMiAuNLGc6HMkxF4Etx6pxLRG7FU89x6X" },
  { "name": "useraaaaaaae", "privateKey": "5KE2UNPCZX5QepKcLpLXVCLdAw7dBfJFJnuCHhXUf61hPRMtUZg", "publicKey": "EOS7XPiPuL3jbgpfS3FFmjtXK62Th9n2WZdvJb6XLygAghfx1W7Nb" },
  { "name": "useraaaaaaaf", "privateKey": "5KaqYiQzKsXXXxVvrG8Q3ECZdQAj2hNcvCgGEubRvvq7CU3LySK", "publicKey": "EOS5btzHW33f9zbhkwjJTYsoyRzXUNstx1Da9X2nTzk8BQztxoP3H" },
  { "name": "useraaaaaaag", "privateKey": "5KFyaxQW8L6uXFB6wSgC44EsAbzC7ideyhhQ68tiYfdKQp69xKo", "publicKey": "EOS8Du668rSVDE3KkmhwKkmAyxdBd73B51FKE7SjkKe5YERBULMrw" },
  { "name": "eosio", "privatekey": "5KQwrPbwdL6PhXujxW37FSSQZ1JiwsST4cqQzDeyXtP79zkvFD3", "publickey": "EOS4yvPNMR6gHdovkjfvdujPnnz5CS1vc4MERTpkYAx66qsCD9w81" }
];


app.set("port", process.env.PORT || 3001);

// Express only serves static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static("client/build"));
}

// creat_acct endpoint
// Smart Contract: ACTION crateacct(std::string name)  
// Request Feilds: account_name 
app.post("/create_acct", (req, res) => {

  let account = accounts[0].name;
  let privateKey = accounts[0].privateKey;
  //let privateKey = event.target.privateKey.value;
  let note = "Mike Lin Test (not used! /createrepo endpoint)";

  // prepare variables for the switch below to send transactions
  let actionName = "";
  let actionData = {};

  // define actionName and action according to event type
  // switch (event.type) {
  //   case "submit":
  actionName = "createacct";
  actionData = {
    name: req.body.account_name,
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
    }).then(function (result) {
      console.log(result);

      res.send("success");

      // db.run("INSERT INTO Scatter ( Account_Name, Password, Public_Key, Private_Key) VALUES ($account_Name, $password, $aublic_Key, $private_Key);",{
      //   $account_Name: result.account_name,
      //   $password: req.body.password,
      //   $public_Key: , //TODO
      //   $private_Key  //TODO
      //   }, (row, err) => {
      //     if(err) {
      //       console.log(err);
      //       return;
      //     }
      //   }); 



    }).catch(function (e) {
      console.error(e);
      console.log('Caught exception: ' + e);
      if (e instanceof RpcError) {
        console.log(JSON.stringify(e.json, null, 2));
      }
    });
});

// creatrepo endpoint
// ACTION createrepo( std::string manager, std::string reponame, std::string code)  
app.post("/create_repo", (req, res) => {

  let account = accounts[0].name;
  let privateKey = accounts[0].privateKey;
  //let privateKey = event.target.privateKey.value;
  let note = "Mike Lin Test (not used! /createrepo endpoint)";

  // define actionName and action according to event type
  // switch (event.type) {
  //   case "submit":
  let actionName = "createrepo";
  let actionData = {
    manager: req.body.manager,
    reponame: req.body.reponame,
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
    }).then(function (result) {
      console.log(result);

      res.send("success");

      // db.run("INSERT INTO IPFS ( Repo_ID, Repo_Name, Repo_Manager, Code ) VALUES ($repo_id, $repo_Name, $repo_Manager, $code );",{
      //   $repo_id: result.repo_id, 
      //   $repo_Name: result.reponame, 
      //   $repo_Manager: result.repomanager, 
      //   $code: result.code
      // }, (row, err) => {
      //   if(err) {
      //     console.log(err);
      //     return;
      //   }
      // }); 


    }).catch(function (e) {
      console.error(e);
      console.log('Caught exception: ' + e);
      if (e instanceof RpcError) {
        console.log(JSON.stringify(e.json, null, 2));
      }
    });
});

// Createbounty Endpoint which calls EOS function:
// ACTION createbounty(std::string bountyname, int reward, std::string description)
app.post("/create_bounty", (req, res) => {

  let account = accounts[0].name;
  let privateKey = accounts[0].privateKey;
  // ***TOGGLE WITH ^
  // let account = req.body.account_name;
  // let privateKey;
  // db.get("SELECT * FROM Scatter WHERE Account_Name = $account_Name;", {
  //   $account_name: account 
  // }, (row, err) => {
  //   if(err) {
  //     console.log(err);
  //     return;
  //   }
  //   privateKey = row.privateKey;
  // });

  //let privateKey = event.target.privateKey.value;
  let note = "Mike Lin Test (not used! /createbounty endpoint)";

  console.log(req.body);

  // define actionName and action according to event type
  let actionName = "createbounty";
  let actionData = {
    reponame: req.body.reponame,
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
    }).then(function (result) {
      // console.log(result);

      // res.send("success");


      const rpc = new JsonRpc(endpoint, { fetch });
      rpc.get_table_rows({
        "json": true,
        "code": "notechainacc",   // contract who owns the table
        "scope": "notechainacc",  // scope of the table
        "table": "bounty",    // name of the table as specified by the contract abi
        "limit": 100,
      }).then(function (result) {
        console.log(result);
        // this.setState({ noteTable: result.rows })

        res.send(
          result.rows
        );
      }).catch(function (e) {
        console.error(e);
        console.log('Caught exception: ' + e);
        if (e instanceof RpcError) {
          console.log(JSON.stringify(e.json, null, 2));
        }
      });

    }).catch(function (e) {
      console.error(e);
      console.log('Caught exception: ' + e);
      if (e instanceof RpcError) {
        console.log(JSON.stringify(e.json, null, 2));
      }
    });
});

// Issuebounty Endpoint which calls EOS function:
// ACTION apprbounty(uint64_t bounty_id, std::string code)
app.post("/appr_bounty", (req, res) => {

  let account = accounts[0].name;
  let privateKey = accounts[0].privateKey;
  // ***TOGGLE WITH ^
  // let account = req.body.account_name;
  // let privateKey;
  // db.get("SELECT * FROM Scatter WHERE Account_Name = $account_Name;", {
  //   $account_name: account 
  // }, (row, err) => {
  //   if(err) {
  //     console.log(err);
  //     return;
  //   }
  //   privateKey = row.privateKey;
  // });

  // define actionName and action according to event type
  // switch (event.type) {
  //   case "submit":
  let actionName = "apprbounty";
  let actionData = {
    reponame: req.body.reponame,
    bounty_id: req.body.bounty_id,
    code: req.body.code
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
    }).then(function (result) {
      // console.log(result);

      // res.send("success");
      // *** TOGGLE
      // db.run("UPDATE IPFS SET Code = $code WHERE Repo_ID = $repo_ID;", {
      //   $repo_ID: result.repoid,
      //   $code: req.body.code      
      // }, (row, err) => {
      //   if(err) {
      //     console.log(err);
      //   }
      // });

      const rpc = new JsonRpc(endpoint, { fetch });
      rpc.get_table_rows({
        "json": true,
        "code": "notechainacc",   // contract who owns the table
        "scope": "notechainacc",  // scope of the table
        "table": "bounty",    // name of the table as specified by the contract abi
        "limit": 100,
      }).then(function (result) {
        console.log(result);
        // this.setState({ noteTable: result.rows })

        res.send(
          result.rows
        );
      }).catch(function (e) {
        console.error(e);
        console.log('Caught exception: ' + e);
        if (e instanceof RpcError) {
          console.log(JSON.stringify(e.json, null, 2));
        }
      });

    }).catch(function (e) {
      console.error(e);
      console.log('Caught exception: ' + e);
      if (e instanceof RpcError) {
        console.log(JSON.stringify(e.json, null, 2));
      }
    });
});

// Push Endpoint - Front-end can call this endpoint
// => notechain.cpp declaration ==> ACTION push(std::string code, uint64_t bounty_id, name user)
app.post("/push", (req, res) => {
  let account = accounts[0].name;
  let privateKey = accounts[0].privateKey;
  // ***TOGGLE WITH ^
  // let account = req.body.account_name;
  // let privateKey;
  // db.get("SELECT * FROM Scatter WHERE Account_Name = $account_Name;", {
  //   $account_name: account 
  // }, (row, err) => {
  //   if(err) {
  //     console.log(err);
  //     return;
  //   }
  //   privateKey = row.privateKey;
  // });
  // define actionName and action according to event type
  let actionName = "push";
  let actionData = {
    reponame: req.body.reponame,
    code: req.body.code, // *** TOGGLE 
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
    }).then(function (result) {
      // console.log(result);

      // *** TOGGLE
      // db.run("SELECT * FROM PullRequests WHERE PR_ID = $pr_ID;", {
      //   $repo_ID: result.prim_key,
      //   $code: req.body.code      
      // }, (row, err) => {
      //   if(err) {
      //     console.log(err);
      //   }
      // });
      res.send("success");


    }).catch(function (e) {
      console.error(e);
      console.log('Caught exception: ' + e);
      if (e instanceof RpcError) {
        console.log(JSON.stringify(e.json, null, 2));
      }
    });
});

// Ownerpush
// ACTION ownerpush(std::string code)
app.post("/owner_push", (req, res) => {
  let account = accounts[0].name;
  let privateKey = accounts[0].privateKey;
  // ***TOGGLE WITH ^
  // let account = req.body.account_name;
  // let privateKey;
  // db.get("SELECT * FROM Scatter WHERE Account_Name = $account_Name;", {
  //   $account_name: account 
  // }, (row, err) => {
  //   if(err) {
  //     console.log(err);
  //     return;
  //   }
  //   privateKey = row.privateKey;
  // });

  // define actionName and action according to event type
  let actionName = "ownerpush";
  let actionData = {
    reponame: req.body.reponame,
    code: req.body.code, // *** TOGGLE  
    manager: rew.body.manager
  };

  // eosjs function call: connect to the blockchain
  const rpc = new JsonRpc(endpoint, { fetch });
  // const rpc = new JsonRpc(endpoint);
  const signatureProvider = new JsSignatureProvider([privateKey]);
  const api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
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
    }).then(function (result) {
      // console.log(result);

      // *** TOGGLE
      // db.run("UPDATE IPFS SET Code = $code WHERE Repo_ID = $repo_ID;", {
      //   $repo_ID: result.repoid,
      //   $code: req.body.code      
      // }, (row, err) => {
      //   if(err) {
      //     console.log(err);
      //   }
      // });
      res.send("success");

    }).catch(function (e) {
      console.error(e);
      console.log('Caught exception: ' + e);
      if (e instanceof RpcError) {
        console.log(JSON.stringify(e.json, null, 2));
      }
    });
});

// Setreponame endpoint
//ACTION setreponame(std::string reponame) {
app.post("/set_repo_name", (req, res) => {

  let account = accounts[0].name;
  let privateKey = accounts[0].privateKey;
  // ***TOGGLE WITH ^
  // let account = req.body.account_name;
  // let privateKey;
  // db.get("SELECT * FROM Scatter WHERE Account_Name = $account_Name;", {
  //   $account_name: account 
  // }, (row, err) => {
  //   if(err) {
  //     console.log(err);
  //     return;
  //   }
  //   privateKey = row.privateKey;
  // });

  // *** TOGGLE
  //let rname = req.body.reponame;

  let actionName = "setreponame";
  let actionData = {
    reponame: req.body.reponame, // *** TOGGLE reponame: rname
    newreponame: req.body.newreponame
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
    }).then(function (result) {
      console.log(result);

      // *** TOGGLE
      // db.run("UPDATE IPFS SET Repo_Name = $repo_Name WHERE Repo_ID = $repo_ID;", {
      //   $repo_ID: result.repoid,
      //   $repo_Name: rname      
      // }, (row, err) => {
      //   if(err) {
      //     console.log(err);
      //   }
      // });

      res.send("success");

    }).catch(function (e) {
      console.error(e);
      console.log('Caught exception: ' + e);
      if (e instanceof RpcError) {
        console.log(JSON.stringify(e.json, null, 2));
      }
    });
});

// getallrepos endpoint
app.post("/get_all_repos", (req, res) => {

  const rpc = new JsonRpc(endpoint, { fetch });

  rpc.get_table_rows({
    "json": true,
    "code": "notechainacc",   // contract who owns the table
    "scope": "notechainacc",  // scope of the table
    "table": "repositories",        // name of the table as specified by the contract abi
    "lower_bound": 0,        // ???? TO fix later???
    "limit": 200,
  }).then(function (repos) {

    console.log(repos);
    // this.setState({ noteTable: result.rows })
    res.send(
      repos.rows
    );
  }).catch(function (e) {
    console.error(e);
    console.log('Caught exception: ' + e);
    if (e instanceof RpcError) {
      console.log(JSON.stringify(e.json, null, 2));
    }
  });
});
// getrepo endpoint
app.post("/get_repo", (req, res) => {
  let reponame = req.body.reponame;

  const rpc = new JsonRpc(endpoint, { fetch });
  rpc.get_table_rows({
    "json": true,
    "code": "notechainacc",   // contract who owns the table
    "scope": "notechainacc",  // scope of the table
    "table": "repositories",        // name of the table as specified by the contract abi
    "lower_bound": 0,        // ???? TO fix later???
    "limit": 200,
  }).then((repos) => {

    let repo = "repo does not exists"
    for (let i = 0; i < repos.lenth; i++) {
      if (repos[i].reponame = reponame) {
        repo = repos[i];
      }
    }
    console.log(repo);
    // this.setState({ noteTable: result.rows })

    res.send(
      repo
    );
  }).catch(function (e) {
    console.error(e);
    console.log('Caught exception: ' + e);
    if (e instanceof RpcError) {
      console.log(JSON.stringify(e.json, null, 2));
    }
  });
});

// getallbounties endpoint
app.post("/get_all_bounties", (req, res) => {

  const rpc = new JsonRpc(endpoint, { fetch });

  rpc.get_table_rows({
    "json": true,
    "code": "notechainacc",   // contract who owns the table
    "scope": "notechainacc",  // scope of the table
    "table": "bounty",        // name of the table as specified by the contract abi
    "lower_bound": 0,        // ???? TO fix later???
    "limit": 200,
  }).then(function (bounties) {

    console.log(bounties);
    // this.setState({ noteTable: result.rows })
    res.send(
      bounties.rows
    );
  }).catch(function (e) {
    console.error(e);
    console.log('Caught exception: ' + e);
    if (e instanceof RpcError) {
      console.log(JSON.stringify(e.json, null, 2));
    }
  });
});

// getrepobounties endpoint
app.post("/get_repo_bounties", (req, res) => {
  let reponame = req.body.reponame;

  const rpc = new JsonRpc(endpoint, { fetch });
  rpc.get_table_rows({
    "json": true,
    "code": "notechainacc",   // contract who owns the table
    "scope": "notechainacc",  // scope of the table
    "table": "repositories",        // name of the table as specified by the contract abi
    "lower_bound": 0,        // ???? TO fix later???
    "limit": 200,
  }).then((repos) => {
    rpc.get_table_rows({
      "json": true,
      "code": "notechainacc",   // contract who owns the table
      "scope": "notechainacc",  // scope of the table
      "table": "bounty",        // name of the table as specified by the contract abi
      "lower_bound": 0,        // ???? TO fix later???
      "limit": 200,
    }).then(function (bounties) {
      let list = [];
      for (let i = 0; i < repos.lenth; i++) {
        if (repos[i].reponame = reponame) {
          for (let j = 0; j < bounties.lenght(); i++) {
            if (repos[i].bounty_keys.indexOf(bounties[i].bounty_id) > -1) {
              list.add(bounties[i]);
            }
          }
        }
      }
      console.log(list);
      // this.setState({ noteTable: result.rows })

      res.send(
        list
      );
    })
  }).catch(function (e) {
    console.error(e);
    console.log('Caught exception: ' + e);
    if (e instanceof RpcError) {
      console.log(JSON.stringify(e.json, null, 2));
    }
  });
});

// getpullrequests endpoint
app.post("/get_pull_requests", (req, res) => {


  let bounty_id = req.body.bounty_id;

  const rpc = new JsonRpc(endpoint, { fetch });
  rpc.get_table_rows({
    "json": true,
    "code": "notechainacc",   // contract who owns the table
    "scope": "notechainacc",  // scope of the table
    "table": "pullrequest",    // name of the table as specified by the contract abi
    "lower_bound": 0,       //should be a constant and never change??
    "limit": 100,
  }).then(function (result) {

    // this.setState({ noteTable: result.rows })

    rpc.get_table_rows({
      "json": true,
      "code": "notechainacc",   // contract who owns the table
      "scope": "notechainacc",  // scope of the table
      "table": "pullrequest",    // name of the table as specified by the contract abi
      "table_key": bounty_id,       //should be a constant and never change??
      "limit": 100,
    }).then((bounty) => {
      console.log(bounty);
      let list = [];

      for (let i = 0; i < result.rows.length; i++) {
        if (result.rows[i].bounty_id === bounty_id) {
          list.push(result.rows[i]);
        }
      }

      console.log(list)
      res.send(
        {
          bounty: bounty,
          pullrequests: list
        }
      );

    }).catch(function (e) {
      console.error(e);
      console.log('Caught exception: ' + e);
      if (e instanceof RpcError) {
        console.log(JSON.stringify(e.json, null, 2));
      }
    });
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
  }).then(function (result) {
    console.log(result);
    // this.setState({ noteTable: result.rows })

    res.send(
      result.rows[0].code
    );
  }).catch(function (e) {
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
  }).then(function (result) {
    console.log(result);
    // this.setState({ noteTable: result.rows })

    res.send(
      result.rows[0].code
    );
  }).catch(function (e) {
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
