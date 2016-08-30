# bellboy-scheduler
## Handles the scheduling and triggering of the bells for [Bellboy](http://github.com/Grayda/bellboy)

## Usage
Pass the `load` function an object of bells (see `bells.json` for what that looks like) and it'll schedule the bells. When the time comes, a trigger event is emitted for other plugins (e.g. Audio) to deal with

Use eventbus' `on` function to listen for:

- `scheduler.trigger.enabled` - For bells that are _automatically_ triggered and enabled
- `scheduler.trigger.disabled` - For bells that should have triggered, but were disabled
- `scheduler.trigger.enabled.manual` - For bells that are _manually_ triggered and enabled
- `scheduler.trigger.disabled.manual` - For bells that are _manually_ triggered while disabled

You can use `scheduler.trigger.**` to listen for all trigger events and react accordingly
