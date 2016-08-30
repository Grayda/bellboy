# bellboy-rest
## Provides a REST API for [Bellboy](http://github.com/Grayda/bellboy)

## Usage
When run, it exposes port 9001 and a variety of endpoints, including:

 - `bells/next` - Returns the next bell that will ring
 - `bells/enable/:id` - Enables a bell. Use `all` to toggle the "_all" bell
 - `bells/disable/:id` - Disables a bell. Use `all` to toggle the "_all" bell
 - `bells/trigger/:id` - Triggers a bell, even if it's disabled
 - `bells/prev` - Returns the previous bell that should have rung
 - `bells/:id` - Returns a bell

More endpoints will be added soon, as well as better security. Use the bearer auth token `ABC123` to make requests
