---
name: Bug report
about: Create a report to help us improve
title: ''
labels: bug
assignees: ''

---

**Check if you're using the latest version**

Check the version and paste output from `bunx @gutenye/password-manager-tools version` here

- Version: <PASTE_HERE>

<detail>
<summary>How to use the latest version?</summary>

1. Bugs may get fixed in the latest version
1. Find the [latest version](https://www.npmjs.com/package/@gutenye/password-manager-tools) on npm
2. Print your version: `bunx @gutenye/password-manager-tools version`.
3. If it's not the latest, run the latest version with `bunx @gutenye/password-manager-tools@9.9.9 version`. (In this example, 9.9.9 is the latest version)

</detail>

**Describe the bug**
A clear and concise description of what the bug is.
If applicable, add screenshots to help explain your problem.

**To Reproduce**

Provided a minimal bitwarden.json file, please edit it to protect your privacy.

```json
<PASTE_HERE>
```

<detail>
<summary>example file</summary>

```json
{
  "items": [
    {
      "type": 1,
      "name": "Name",
      "username": "Username",
      "password": "Password",
      "totp": null,
      "notes": null,
      "passwordHistory": null,
      "fields": [],
      "login": {
        "uris": [
          {
            "match": null,
            "uri": "https://example.com"
          }
        ]
      }
    }
  ]
}
```

</detail>

**Output behavior**

Paste `output.csv` file content from `bunx @gutenye/password-manager-tools@VERSION bitwarden.json output.csv`

```csv
<PASTE_HERE>
```

<detail>
<summary>example file</sumary>

```csv
Title,Username,Password,OTPAuth,URL,Notes
Name,,,,example.com,
```

</detail>

**Expected behavior**
A clear and concise description of what you expected to happen.
