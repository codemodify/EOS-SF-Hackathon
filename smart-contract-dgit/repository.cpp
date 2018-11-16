#include <eosiolib/eosio.hpp>
#include <eosiolib/print.hpp>
#include <eosiolib/asset.hpp>
#include <functional>
#include <vector>

using namespace eosio;
 
CONTRACT repository : public contract
{
public:

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
    std::string manager;
    std::vector<uint64_t> bounty_keys;
    std::vector<uint64_t> pr_keys;
  
    int primary_key() const { return repo_id; }
  };
  
  typedef eosio::multi_index<name("bounty"), bounty> bounty_table;
  typedef eosio::multi_index<name("repositories"), repositories> repos_table;
  typedef eosio::multi_index<name("pullrequest"), pullrequest> pull_table;

  bounty_table _bounties;
  pull_table _pullrequests;
  repos_table _repos;
  
  using contract::contract;

  repository(name receiver, name code, datastream<const char *> ds) : contract(receiver, code, ds),
                                                                      _pullrequests(receiver, receiver.value),
                                                                      _repos(receiver, receiver.value),
                                                                      _bounties(receiver, receiver.value) {}

  ACTION issuebounty(
    std::string reponame, 
    uint64_t bounty_id, 
    std::string code) 
    {
    require_auth(_self);

    auto repo = _repos.find(hashcode(reponame));
    eosio_assert(repo != _repos.end(), "repo must exist");
  
    auto existing = _bounties.find(bounty_id);
    eosio_assert(existing != _bounties.end(), "bounty does not esists");

    const auto& st = *existing;

    // *** assert contract balance >= reward

    this->setCode(reponame, code); // update code
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
    std::string manager) 
    { 
    auto repo = _repos.find(hashcode(reponame));
    eosio_assert(repo != _repos.end(), "repo must exist");
     const auto& r = *repo;
    eosio_assert(manager == r.manager, "only repo managers and directly update code");
   
    this->setCode(reponame, newcode);
  }

  ACTION createbounty(
      std::string reponame,
      std::string bountyname,
      int setreward,
      std::string description)
  {
    // require the owner of the repo is creating a new bounty
    require_auth(_self);

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

  ACTION setreponame(std::string reponame, std::string newreponame) 
  {
    auto repo = _repos.find(hashcode(reponame));
    eosio_assert(repo != _repos.end(), "repo must exist");

    _repos.modify(repo, get_self(), [&](auto& r) {
      r.reponame = newreponame;
    });
  }

  ACTION createrepo(
    std::string manager, 
    std::string reponame, 
    std::string code) 
  {
    auto repo = _repos.find(hashcode(reponame));
    eosio_assert(repo == _repos.end(), "repo name is already taken");
    _repos.emplace(_self, [&](auto &new_repo) {
      new_repo.repo_id        = hashcode(reponame);
      new_repo.reponame       = reponame;
      new_repo.code           = code;
      new_repo.manager        = manager;
      new_repo.bounty_keys    = {};
      new_repo.pr_keys        = {};
    });
  }

private:
  
  void deletebounty(std::string reponame, uint64_t bounty_id)
  {
    require_auth(_self);

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

  void setCode(
    std::string reponame, 
    std::string newcode) 
  {
    require_auth(_self);
    
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

EOSIO_DISPATCH( repository, (issuebounty)(push)(createbounty)(setreponame)(createrepo)(ownerpush) )