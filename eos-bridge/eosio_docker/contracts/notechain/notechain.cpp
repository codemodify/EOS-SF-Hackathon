#include <eosiolib/eosio.hpp>
#include <eosiolib/print.hpp>
#include <eosiolib/asset.hpp>
#include <functional>
#include <vector>

using namespace eosio;

// Smart Contract Name: notechain
// Table struct:
//   notestruct: multi index table to store the notes
//     prim_key(uint64): primary key
//     user(name): account name for the user
//     note(string): the note message
//     timestamp(uint64): the store the last update block time
// Public method:
//   isnewuser => to check if the given account name has note in table or not
// Public actions:
//   update => put the note into the multi-index table and sign by the given account

// Replace the contract class name when you start your own project
CONTRACT notechain : public eosio::contract
{
  TABLE bounty {
    uint64_t prim_key;
    std::string bountyname;
    int reward;
    std::string description;
    uint64_t timestamp;

    auto primary_key() const { return prim_key; }
  };
  

  TABLE pullrequest{
    uint64_t prim_key;
    name user;
    std::string code;
    uint64_t bounty_id;
    uint64_t timestamp;

    auto primary_key() const { return prim_key; }
  };
  
  TABLE repositories 
  {
    int repo_id;
    std::string reponame;
    std::string code;
    std::string repomanager;
    std::vector<uint64_t> bounty_keys;
    std::vector<uint64_t> pr_keys;
  
    int primary_key() const { return repo_id; }
  };
  
  TABLE accounts 
  {
    int acct_name_id;
    std::string accountname;
    
    int primary_key() const { return acct_name_id; }
  };
  
  typedef eosio::multi_index<name("bounty"), bounty> bounty_table;
  typedef eosio::multi_index<name("pullrequest"), pullrequest> pull_table;
  typedef eosio::multi_index<name("repositories"), repositories> repos_table;
  typedef eosio::multi_index<name("accounts"), accounts> nougit_accts;

  bounty_table _bounties;
  pull_table _pullrequests;
  repos_table _repos;
  nougit_accts _accounts;

public:
  using contract::contract;

  // constructor
  notechain(name receiver, name code, datastream<const char *> ds) : contract(receiver, code, ds),
                                                                      _pullrequests(receiver, receiver.value),
                                                                      _bounties(receiver, receiver.value),
                                                                      _repos(receiver, receiver.value),
                                                                      _accounts(receiver, receiver.value) {}
  

ACTION createacct(
    std::string name) 
  {
    auto nm = _accounts.find(hashcode(name));
    auto& acct = *nm;
    eosio_assert(acct.accountname.length() != 12, "name must be 12 characters long");
    eosio_assert(nm == _accounts.end(), "username is already taken");

    _accounts.modify(nm, get_self(), [&](auto& acct) {
      acct.acct_name_id = hashcode(name);
      acct.accountname = name;
    });
  }

  ACTION createrepo(
    std::string repomanager, 
    std::string reponame) 
  {
    auto acctname = _accounts.find(hashcode(repomanager));
    eosio_assert(acctname != _accounts.end(), "Only NouGit users can create repos");
    
    auto repo = _repos.find(hashcode(reponame));
    eosio_assert(repo == _repos.end(), "repo name is already taken");
    
    _repos.emplace(_self, [&](auto &new_repo) {
      new_repo.repo_id        = hashcode(reponame);
      new_repo.reponame       = reponame;
      new_repo.code           = "";
      new_repo.repomanager    = repomanager;
      new_repo.bounty_keys    = {};
      new_repo.pr_keys        = {};
    });
  }

  ACTION createbounty(
      std::string reponame,
      std::string bountyname,
      int setreward,
      std::string description)
  {
    // require the owner of the repo is creating a new bounty
    //require_auth(_self);

    auto repo = _repos.find(hashcode(reponame));
    eosio_assert(repo != _repos.end(), "repo must exist");
    uint64_t key = _bounties.available_primary_key();

    _repos.modify(repo, get_self(), [&](auto& r) {
      r.bounty_keys.push_back(key);
    });

    _bounties.emplace(_self, [&](auto &new_bounty) {
      new_bounty.prim_key     = key;
      new_bounty.reward       = setreward;
      new_bounty.bountyname   = bountyname;
      new_bounty.description  = description;
      new_bounty.timestamp    = now();
    });
  }

  ACTION apprbounty(
    std::string reponame, 
    uint64_t bounty_id, 
    std::string code) 
  {
    //require_auth(_self);

    auto repo = _repos.find(hashcode(reponame));
    eosio_assert(repo != _repos.end(), "repo must exist");
  
    auto existing = _bounties.find(bounty_id);
    eosio_assert(existing != _bounties.end(), "bounty does not esists");

    const auto& st = *existing;

    // *** assert contract balance >= reward

    this->setcode(reponame, code); // update code
    // *** transfer(st.user, st.reward);
    this->deletebounty(reponame, bounty_id);
  }

  ACTION push(
    std::string reponame, 
    std::string newcode, 
    uint64_t bounty_id, 
    name user) 
  { 
    auto repo = _repos.find(hashcode(reponame));
    eosio_assert(repo != _repos.end(), "repo must exist");
    uint64_t key = _pullrequests.available_primary_key();
    _repos.modify(repo, get_self(), [&](auto& r) {
      r.pr_keys.push_back(key);
    });

    _pullrequests.emplace(_self, [&](auto &new_pull) {
      new_pull.prim_key   = key;
      new_pull.code       = newcode;
      new_pull.user       = user;
      new_pull.bounty_id  = bounty_id;
      new_pull.timestamp  = now();
    });
  }

  ACTION ownerpush(
    std::string reponame, 
    std::string newcode, 
    std::string repomanager) 
  { 
    auto repo = _repos.find(hashcode(reponame));
    eosio_assert(repo != _repos.end(), "repo must exist");
     const auto& r = *repo;
    eosio_assert(repomanager == r.repomanager, "only repo repomanagers and directly update code");
   
    this->setcode(reponame, newcode);
  }

  ACTION setreponame(
    std::string reponame, 
    std::string newreponame) 
  {
    auto repo = _repos.find(hashcode(reponame));
    eosio_assert(repo != _repos.end(), "repo must exist");

    _repos.modify(repo, get_self(), [&](auto& r) {
      r.reponame = newreponame;
    });
  }

private:
  
  void deletebounty(std::string reponame, uint64_t bounty_id)
  {
    //require_auth(_self);

    auto repo = _repos.find(hashcode(reponame));
    eosio_assert(repo != _repos.end(), "repo must exist");
    const auto& r = *repo; 
    bool flag = false;
    for(auto& item : r.bounty_keys) {
      if(item == bounty_id) {
        flag = true;

      }
    }
    eosio_assert(flag, "bounty to delete must be associted with repo");

    auto itr = _bounties.find(bounty_id);
    eosio_assert(itr != _bounties.end(), "bounty must exist to be deleted");
    

    std::vector<uint64_t> keysForDeletion;
    for (auto& item : _pullrequests)
    {
      if (item.bounty_id == bounty_id)
      {
        keysForDeletion.push_back(item.prim_key);
      }
    }

    if (keysForDeletion.size() > 0)
    {
      for (uint64_t prim_key : keysForDeletion)
      {
        auto itr = _pullrequests.find(prim_key);
        if (itr != _pullrequests.end())
        {
          _pullrequests.erase(itr);
        }
      }
      auto itr = _bounties.find(bounty_id);
      _bounties.erase(itr);
    }

    _repos.modify(repo, get_self(), [&](auto& r) {
      r.bounty_keys.erase(std::remove(r.bounty_keys.begin(), r.bounty_keys.end(), bounty_id));
    });
  }

  void setcode(
    std::string reponame, 
    std::string newcode) 
  {
    //require_auth(_self);
    
    auto repo = _repos.find(hashcode(reponame));
    eosio_assert(repo != _repos.end(), "repo must exist");

    _repos.modify(repo, get_self(), [&](auto& r) {
      r.code = newcode;
    });
  }

  int hashcode(
    std::string str) 
  {
    std::hash<std::string> string_hash;
    return string_hash(str);
  }
};

// specify the contract name, and export a public action: update
EOSIO_DISPATCH( notechain, (createacct)(createrepo)(createbounty)(apprbounty)(push)(ownerpush)(setreponame) )