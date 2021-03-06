# TranslatableJS

This is a **WIP** custom language inspired on [YAML](http://yaml.org/) but with several differences:

- TJS does not nor use `:` to denote the start of an object.
- TJS supports template literals, as in, you can use `{{object.property}}` inside a value.
- TJS supports functions and dynamic object accessment.
- TJS supports **import**, **define**, and **export**, for rich behaviour.

An example of this language is:

```yaml
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

# Tasks Remaining before 1.0.0 Release

- Variable name passthrough improvements:
    - Help TJS' compiler understand if a variable will ever exist:
        - Sealed variable closure, optimize away if constant.
        - Throw early error during compile time if a variable name is not found.
- Better ternary support:
    - The current compiler may be buggy due to RegExp, this will be fixed once it's rewritten.
- `as` in imports:
    - Supporting aliases for imports.
- JSON ⟷ TJS:
    - At this moment, only TJS → JS is supported.
