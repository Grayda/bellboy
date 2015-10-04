04.10.2015
 - Added JSON schemas for ensuring loaded bell and config files match what's expected
 - BellWeb now supports "time" event for socket.io. Every 10 seconds the server passes the latest time to the client (e.g. status page), ensuring time shown on TFT display doesn't slip
   - The four buttons at the bottom of the status page are now loaded from bells.json (\_button1, \_button2, \_button3 and \_button4) so they're more dynamic
 - Moved audio folder to the root to make it easier to add new files
 - Added "ToggleBells" action to bells.json. Pass it an array of "Bells" and it'll invert their state (e.g. false becomes true)
 - BellAudio now plays random files from a given array.
 - Added (untested) "buttonrelease" event to BellPi to allow "held button" events
 -

03.10.2015
 - **NOTE: This version modifies bells.json and config.json. It's recommended that you view the new format and migrate your changes over, otherwise your app will crash**
 - BellMail and BellWeb now use lodash, instead of lodash.where
 - Updates to mail templates
   - Mail features in bells.json / bells_default.json now come under `Actions`
 - Various BellWeb changes
   - BellWeb.GetHostName can now output IP address. Simply pass `true` as the only parameter
   - Tweaks to styles.less, sidebar.less and footer.less
   - FEATURE REMOVED: Customizable web themes. If you wish to change the theme, edit `main.less`, then compile with `lessc`. Feature will be back soon.
   - Added some preliminary help files
   - Moved some links out of the sidebar and into the config page (e.g. View Logs, Update)
   - Tweaks to header.js to show bell name & next ring time
   - Cleanup of main.ejs and restructure of the legend down the bottom
     - Updates to status.ejs (should now fill 100% of the height and expand text size to fit as such)
       - Table should now fill 100% of the height
       - Uses [fitText][1] to stretch text to available width / height
 - Bugfixes in core/index.js
   - Don't update bells if they're locked
 - Bellboy now uses [later.js][2] for scheduling, which eliminates a misfiring bug present in previous versions
 - `button1`, `button2`, `button3` and `button4` events removed, replaced with a single `buttons` event with the index as the first parameter
 - Default bell and config files included in `core/config/`. You can override these by placing `bells.json` and / or `config.json` in the root config/ folder
   - If your custom `bells.json` or `config.json` files won't load for whatever reason (unclosed brace, missing comma, missing required property etc.), defaults will load instead
 - Moved "File" property of bells to the "Actions.Audio", allowing for multiple actions to take place
 - Added (untested) support for tone generators
   - Set ExternalPin in config.json to a pin on your Raspberry Pi, then hook a wire up from that pin to the remote control port on your tone generator
 - Switching schedule now uses separate json file.
   - When schedule is switched, the schedule filename is written into config.json, then the bell file saved and reloaded.
 - Added BellValidate, a small helper addon that is designed to make checking the existence of variables easier
 - Windows now uses mpg123 instead of cmdmp3 for consistency. Please see addons/bellaudio/mpg123/About This Folder.txt for further instructions
 - Various bugfixes

26.09.2015
 - Added update mechanism
   - **NOTE: This uses the commands `git stash` and `git pull` which could cause your changes to be overwritten. Please back up ./core/config/*.json prior to updating**
 - Added proper login system
   - The users are stored in ./addons/bellauth/users.json (for now) and need to be created manually using bcrypt.hash("password") until an actual user management system is in place
   - Default username is `admin`, password is `password123`

[1]: http://fittextjs.com/
[2]: http://bunkat.github.io/later/
