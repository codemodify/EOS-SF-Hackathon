#include <eosiolib/eosio.hpp>
#include <eosiolib/print.hpp>
#include <eosiolib/asset.hpp>

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
private:
  bool isnewuser(name user)
  {
    // get notes by using secordary key
    auto note_index = _notes.get_index<name("getbyuser")>();
    auto note_iterator = note_index.find(user.value);

    return note_iterator == note_index.end();
  }

  TABLE notestruct
  {
    uint64_t prim_key;  // primary key
    name user;          // account name for the user
    std::string note;   // the note message
    
    uint64_t test_key;
    std::string testData;   // the note message
    

    uint64_t timestamp; // the store the last update block time

    // primary key
    auto primary_key() const { return prim_key; }
    // secondary key
    // only supports uint64_t, uint128_t, uint256_t, double or long double
    uint64_t get_by_user() const { return user.value; }
  };

  // create a multi-index table and support secondary key
  typedef eosio::multi_index<name("notestruct"), notestruct,
                             indexed_by<name("getbyuser"), const_mem_fun<notestruct, uint64_t, &notestruct::get_by_user>>>
      note_table;

  note_table _notes;

  TABLE bounty
  {
    uint64_t prim_key;
    std::string bountyname;
    int reward;
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

  TABLE field 
  {
    uint64_t prim_key;
    std::string reponame;
    std::string code;

    auto primary_key() const { return prim_key; }
  };

  typedef eosio::multi_index<name("bounty"), bounty> bounty_table;
  typedef eosio::multi_index<name("field"), field> field_table;
  typedef eosio::multi_index<name("pullrequest"), pullrequest> pull_table;

  std::string reponame;
  std::string code;
  bounty_table _bounties;
  pull_table _pullrequests;
  field_table _fields;
  //using contract::contract;

public:
  using contract::contract;

  // constructor
  notechain(name receiver, name code, datastream<const char *> ds) : contract(receiver, code, ds),
                                                                     _notes(receiver, receiver.value),
                                                                     _pullrequests(receiver, receiver.value),
                                                                     _fields(receiver, receiver.value),
                                                                     _bounties(receiver, receiver.value) {}

  ACTION update(name user, std::string & note)
  {
    // to sign the action with the given account
    //    require_auth(user);

    // create new / update note depends whether the user account exist or not
    if (isnewuser(user))
    {
      // insert new note
      _notes.emplace(_self, [&](auto &new_user) {
        new_user.prim_key = _notes.available_primary_key();
        new_user.user = user;
        new_user.note = note;
        new_user.timestamp = now();
      });
    }
    else
    {
      // get object by secordary key
      auto note_index = _notes.get_index<name("getbyuser")>();
      auto &note_entry = note_index.get(user.value);
      // update existing note
      _notes.modify(note_entry, _self, [&](auto &modified_user) {
        modified_user.note = note;
        modified_user.timestamp = now();
      });
    }
  }

/**************/

//
ACTION pulling(name user, std::string & note)
  {
    // to sign the action with the given account
//    require_auth(user);

    // create new / update note depends whether the user account exist or not
    // if (isnewuser(user))
    // {
    //   // insert new note
      _notes.emplace(_self, [&](auto &new_user) {
        new_user.prim_key = _notes.available_primary_key();
        new_user.user = user;
        new_user.note = note;
        new_user.timestamp = now();
      });
    // else
    // {
    //   // get object by secordary key
    //   auto note_index = _notes.get_index<name("getbyuser")>();
    //   auto &note_entry = note_index.get(user.value);
    //   // update existing note
    //   _notes.modify(note_entry, _self, [&](auto &modified_user) {
    //     modified_user.note = note;
    //     modified_user.timestamp = now();
    //   });
    // }
  }


/**********************/  




ACTION issuebounty(uint64_t bounty_id, std::string code)
  {
//    require_auth(_self);

    auto existing = _bounties.find(bounty_id);
    eosio_assert(existing != _bounties.end(), "bounty does not esists");
    const auto& st = *existing;

    // *** assert contract balance >= reward

    this->setCode(code); // update code
    // *** transfer(st.user, st.reward);
    deletebounty(bounty_id);
  }

  ACTION ownerpush(std::string newcode)
  {
    
//    require_auth(_self);
    this->setCode(newcode);
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
//      uint64_t bounty_id,
      int reward,
      std::string description)
  {
//    require_auth(_self);

    _bounties.emplace(_self, [&](auto &new_bounty) {
      new_bounty.prim_key     = _bounties.available_primary_key();
      new_bounty.reward       = reward;
      new_bounty.bountyname   = bountyname;
      new_bounty.description  = description;
      new_bounty.timestamp    = now();
    });
  }

  ACTION setreponame(std::string reponame) {
    auto itr = _fields.find(0);
    if(itr == _fields.end()) {
      _fields.emplace( _self, [&](auto& new_data ) {
        new_data.prim_key = 0,
        new_data.reponame = reponame,
        new_data.code     = "";
      });
    } else {
      auto st = *itr;
      _fields.modify(itr, _self, [&](auto& new_data) {
        new_data.prim_key = st.prim_key,
        new_data.reponame = reponame,
        new_data.code     = st.code;
      });
    }
  }

  private:
  void deletebounty(uint64_t bounty_id)
  {
//    require_auth(_self);
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
  void setCode(std::string code) {
    auto itr = _fields.find(0);
    if(itr == _fields.end()) {
      _fields.emplace( _self, [&](auto& new_data ) {
        new_data.prim_key = 0,
        new_data.reponame = "",
        new_data.code     = code;
      });
    } else {
      auto st = *itr;
      _fields.modify(itr, _self, [&](auto& new_data) {
        new_data.prim_key = st.prim_key,
        new_data.reponame = st.reponame,
        new_data.code     = code;
      });
    }
  }
};

// specify the contract name, and export a public action: update
EOSIO_DISPATCH(notechain, (update)(pulling)(issuebounty)(push)(createbounty)(setreponame)(ownerpush))
