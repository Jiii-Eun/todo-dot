const { expo } = require('./app.json');

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  expo: {
    ...expo,
    extra: {
      ...expo.extra,
      apiUrl: process.env.DEFAULT_API_URL?.trim() ?? '',
    },
  },
};
