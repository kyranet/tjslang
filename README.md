# TranslatableJS

This is a **WIP** custom language inspired on [YAML](http://yaml.org/) but with several differences:

- TJS does not use quotes nor uses `:` to denote the start of an object.
- TJS supports template literals, as in, you can use `{{object.property}}` inside a value.
- TJS supports functions and dynamic object accessment.
- TJS supports **import**, **define**, and **export**, for rich behaviour.

An example of this language is:

```
import klasa.util.codeBlock

define TIMES
    YEAR
        1: "year"
        DEFAULT: "years"
    MONTH
        1: "month"
        DEFAULT: "months"

define PERMISSIONS
    ADMINISTRATOR: "Muh
        Administrator"
    VIEW_AUDIT_LOG: "View Audit Log"

define LANGUAGE
    PERMISSION
        LIST: {{PERMISSIONS}}
        RESTRICTED_HELP: (obj) => "⛔ **»»** This part of the {{obj.command}} command is only for {{obj.role}}"
        ADMIN_ONLY: "you are not an admin of this server and cannot use this command!"
    REQUIREMENTS
        NO_USER: "You have to **mention a user** / give me an **user ID** to make this happen"
        NO_MEMBER: "You have to **mention a server member** / give me a **member ID** to make this happen"
```
