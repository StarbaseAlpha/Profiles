'use strict';

const path = require('path');
const theRules = require('@starbase/therules');
const rules = require(__dirname + path.sep + '..' + path.sep + 'rules');

function Profiles(db=null,auth=null,options={}) {

  if (!options || typeof options !== 'object') {
    options = {};
  }

  if (!db) {
    throw("Starbase Channels Database object is missing"); 
  }

  if (!auth) {
    throw("Starbase Authentication object is missing");
  }

  let profiles = {};

  let kit = {
    "db": db,
    "auth":auth,
    "parentChannel":(options.parentChannel || "profiles").toString(),
    "isValidProfile":options.isValidProfile || null
  };

  profiles.express = () => {
    return (req,res) => {
      theRules(rules, req.body, kit).then(result=>{
        res.json(result);
      }).catch(err => {
        res.status(err.code||400).json(err);
      });
    };
  };

  return profiles;

}

module.exports = Profiles;
