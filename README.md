# PasswordManagerTools

> Easily transfer passwords from Bitwarden to Apple Passwords

**Note: Currently, only supports transfer data from Bitwarden to Apple Passwords.**

## Features

- Comprehensive Data Preservation: transfer everything, all Bitwarden notes, custom fields, multiple URLs, and password history.
- Selective Transfer: Filter passwords by URL to move only what you need.
- Incremental Transfer: Move passwords in batches at your convenience, with remaining passwords securely stored for seamless future transfers until all are moved.
- Reverse Transfer (TODO): Seamlessly transfer passwords from Apple Passwords back to Bitwarden, while accurately setting custom fields, multiple URLs, and maintaining password history to ensure data integrity.
- In-Depth End Report (TODO): Receive a detailed summary highlighting items not moved and guidance for manual fixes.

## Getting Started

### 1) Export Data

- [Bitwarden](https://bitwarden.com/help/export-your-data): export `.json` file, supports both encrypted and unencrypted format.

- BitWarden export does not contain file attachments.

### 2) Convert Data

1. [Install Bun](https://bun.sh/docs/installation)

2. Backup original file

```sh
cp input.json input.bak.json.bak  # input.json will be overwritten later
```

3. Convert passwords

**Transfer all passwords**

```sh
bunx @gutenye/password-manager-tools convert bitwarden-to-apple <input.json> <output.csv>
```

**Incremental transfer**

```
# select some domains to transfer
bunx @gutenye/password-manager-tools convert bitwarden-to-apple input.json output.csv --include-uris a.com,b.com
#-> creates output.csv
#-> override input.json, remaining data, items in the output are removed
# input.json will be encrypted again for next time use if you exported encrypted format
``

### 3) Import Data

- [Apple Passwords](https://support.apple.com/guide/passwords/import-mchl2f1a184c/1.0/mac): import `.csv` file

- Multiple websites with same domain are handled correctly, with differnt domains, open the Apple Passwords app to edit it manually.

### Special thanks

- [warden](https://github.com/thewh1teagle/warden): offline bitwarden viewer
