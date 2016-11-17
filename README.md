# JVG's Angular + A-Frame REA Demo

1. Run `npm install`
2. Run `node server.js` to allow CORS proxy server
3. In a separate terminal, run `npm run start`

# Using the app

The CORS server must be running to allow cross-domain requests to REA. 

Enter a property ID (eg. 123644458) in the search bar and press return; the app will load the image assets from REA and then build an A-Frame scene with it.

# Auto-mode / Running Without CORS server

In `js/app.js`, make `var auto = true` to load local data without having to set up a separate CORS server. This is essential if you want to test the Mobile AR version.

# Mobile AR Version

You can test the AR-ish version of this demo (only tested on Android) while on the same WiFi network as your server. Just connect to the IP address and port logged after doing `npm run start` in your mobile browser.

However, auto-mode must be set to `true` or else no images will load.