# PasswordManagerTools

> Move passwords from one password manager to another, supports Bitwarden, Apple Passwords/iCloud Keychain.",

1. Open unencrypted data: `vi -u NONE file`
2. Test Data: 'Hello1'

## Getting Started

### Export Data

- [Bitwarden export json data](https://bitwarden.com/help/export-your-data)

### Convert Data

```sh
bunx @gutenye/password-manager-tools convert bitwarden-to-apple input.json output.csv
```

### Import Data

- [Apple Passwords import csv data]
