'use strict';

const getUser = (req, kit, params) => {
  return kit.auth.verifyToken(req.token||null).then(token=>{return token.user;}).catch(err=>{return null;});
};

const isSignedIn = async (req, kit, params) => {
  let user = await getUser(req,kit,params);
  return user;
};

const isProfileUser = async (req, kit, params) => {
  let user = await getUser(req,kit,params);
  return user && user.username === params.username;
};

const isValidProfile = async (req, kit, params) => {
  if (kit.isValidProfile && typeof kit.isValidProfile === 'function') {
    return kit.isValidProfile(req,kit,params) && await isProfileUser(req,kit,params);
  } else {
    return typeof req.data === 'object' &&
    Object.keys(req.data).length === 1 &&
    typeof req.data.name === 'string' &&
    req.data.name.length > 0 && req.data.name.length < 50 &&
    await isProfileUser(req,kit,params);
  }
};

const profileMethods = {
  "get":(req,kit,params) => {
    return kit.db.path(kit.parentChannel).path(req.path).get();
  },
  "put":(req,kit,params) => {
    return kit.db.path(kit.parentChannel).path(req.path).put(req.data);
  },
  "del":(req,kit,params) => {
    return kit.db.path(kit.parentChannel).path(req.path).del();
  },
  "list":(req,kit,params) => {
    return kit.db.path(kit.parentChannel).list(req.data);
  }
};

const Rules = [
  {
    "path":"/",
    "rules":{
      "list":(req, kit, params) => {
        return isSignedIn(req, kit, params) &&
          req.data && req.data.limit && typeof req.data.limit === 'number' && req.data.limit <= 10;
      }
    },
    "methods":profileMethods
  },
  {
    "path":"/:username",
    "rules":{
      "get":isSignedIn,
      "put":isValidProfile,
      "del":isProfileUser
    },
    "methods":profileMethods
  }
];

module.exports = Rules;
