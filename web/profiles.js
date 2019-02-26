'use strict';

function Profiles(api=null,auth=null) {

  if (!api) {
    throw("The Starbase Channels API client is missing");
  }

  if (!auth) {
    throw("The Starbase Authentication client is missing");
  }

  async function getProfile(username) {
    api.setToken(await auth.getToken());
    return api.path(username).get();
  }

  async function deleteProfile(username) {
    api.setToken(await auth.getToken());
    return api.path(username).del();
  }

  async function updateProfile(username,profile) {
    api.setToken(await auth.getToken());
    return api.path(username).put(profile);
  }

  async function listProfiles(query={}) {
    if (!query || typeof query !== 'object') {
      query = {};
      query.limit = 10;
    }
    if (!query.limit || query.limit > 10) {
      query.limit = 10;
    }
    api.setToken(await auth.getToken());
    return api.list(query);
  }

  return {"getProfile":getProfile,"deleteProfile":deleteProfile,"updateProfile":updateProfile,"listProfiles":listProfiles,"auth":auth};

}
