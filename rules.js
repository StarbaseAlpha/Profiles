'use strict';

const getUser = (body, kit, params) => {
  return kit.auth.verifyToken(body.token||null).then(token=>{return token.user;}).catch(err=>{return null;});
};

const isSignedIn = async (body, kit, params) => {
  let user = await getUser(body,kit,params);
  return user;
};

const isProfileUser = async (body, kit, params) => {
  let user = await getUser(body,kit,params);
  return user && user.username === params.username;
};

const isValidProfile = async (body, kit, params) => {
  if (kit.isValidProfile && typeof kit.isValidProfile === 'function') {
    return kit.isValidProfile(body,kit,params) && await isProfileUser(body,kit,params);
  } else {
    return typeof body.data === 'object' &&
    Object.keys(body.data).length === 3 &&

    typeof body.data.name === 'string' &&
    typeof body.data.photo === 'string' &&
    typeof body.data.about === 'string' &&

    body.data.name.length >= 0 && body.data.name.length <= 50 &&
    body.data.photo.length >= 0 && body.data.photo.length <= 255 &&
    body.data.about.length >= 0 && body.data.about.length <= 500 &&

    await isProfileUser(body,kit,params);
  }
};

const profileMethods = {
  "get":(body,kit,params) => {
    return kit.db.path(kit.parentChannel).path(body.path).get();
  },
  "put":(body,kit,params) => {
    return kit.db.path(kit.parentChannel).path(body.path).put(body.data);
  },
  "del":(body,kit,params) => {
    return kit.db.path(kit.parentChannel).path(body.path).del();
  },
  "list":(body,kit,params) => {
    return kit.db.path(kit.parentChannel).list(body.data);
  }
};

const Rules = [
  {
    "path":"/",
    "rules":{
      "list":(body, kit, params) => {
        return isSignedIn(body, kit, params) &&
          body.data && body.data.limit && typeof body.data.limit === 'number' && body.data.limit <= 10;
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
