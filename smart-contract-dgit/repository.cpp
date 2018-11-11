#include <eosiolib/eosio.hpp>
#include <eosiolib/print.hpp>
#include <eosiolib/asset.hpp>

using namespace eosio;

CONTRACT repository : public contract
{
public:
   TABLE bounty
  {
    uint64_t prim_key;
    std::string bountyname;
    eosio::asset reward;
    std::string description;
    uint64_t timestamp;

    auto primary_key() const { return prim_key; }
  };

  TABLE pullrequest
  {
    uint64_t prim_key;
    name user;
    std::string code;
    uint64_t bounty_id;
    uint64_t timestamp;

    auto primary_key() const { return prim_key; }
  };

  typedef eosio::multi_index<name("bounties"), bounty> bounty_table;
  // add secondary reference on bounty id
  typedef eosio::multi_index<name("pullrequest"), pullrequest> pull_table;

  std::string reponame;
  std::string code;
  bounty_table _bounties;
  pull_table _pullrequests;
  using contract::contract;

  repository(name receiver, name code, datastream<const char *> ds) : contract(receiver, code, ds),
                                                                      _pullrequests(receiver, receiver.value),
                                                                      _bounties(receiver, receiver.value) {}

  ACTION issuebounty(pullrequest pull)
  {
    require_auth(_self);

    auto existing = _bounties.find(pull.bounty_id);
    eosio_assert(existing != _bounties.end(), "bounty does not esists");
    const auto& st = *existing;

    // *** assert contract balance >= reward

    this->code = pull.code; // update code
    // *** transfer(st.user, st.reward);
    deletebounty(pull.bounty_id);
  }

  ACTION push(std::string newcode, uint64_t bounty_id, name user)
  {
    _pullrequests.emplace(_self, [&](auto &new_pull) {
      new_pull.prim_key = _pullrequests.available_primary_key();
      new_pull.code = newcode;
      new_pull.user = user;
      new_pull.bounty_id = bounty_id;
      new_pull.timestamp = now();
    });
  }

  ACTION createbounty(
      std::string bountyname,
      uint64_t bounty_id,
      asset reward,
      std::string description)
  {
    require_auth(_self);

    _bounties.emplace(_self, [&](auto &new_bounty) {
      new_bounty.prim_key     = _bounties.available_primary_key();
      new_bounty.reward       = reward;
      new_bounty.bountyname   = bountyname;
      new_bounty.description  = description;
      new_bounty.timestamp    = now();
    });
  }

  std::string pull()
  {
    return this->code;
  }
  private:
  void deletebounty(uint64_t bounty_id)
  {
    require_auth(_self);
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
  }
}; 

EOSIO_DISPATCH( repository, (issuebounty)(push)(createbounty) )