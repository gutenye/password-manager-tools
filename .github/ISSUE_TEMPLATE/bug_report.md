---
name: Bug report
about: Create a report to help us improve
title: ''
labels: bug
assignees: ''

---

**Check if you're using the latest version**
> Bugs may have been fixed in the latest version.

Please provide the output of the following command:

```sh
bunx @gutenye/password-manager-tools version
```

```text
<PASTE_OUTPUT_HERE>
```

<details>
<summary>How to Update to the Latest Version</summary>

1. Find the [latest version on npm](https://www.npmjs.com/package/@gutenye/password-manager-tools)
2. If you’re not using the latest version, run it with `bunx @gutenye/password-manager-tools@<LATEST_VERSION> version`, and replace `<LATEST_VERSION>` with the latest version number.
</details>

**Describe the bug**
> Provide a clear and concise description of the issue you’re experiencing.

**To Reproduce**

Please include a minimal version of your `bitwarden.json` file that reproduces the issue. Ensure you remove or modify any sensitive information to protect your privacy.

```json
<PASTE_FILE_CONTENT_HERE>
```

<details>
<summary>example file</summary>

```json
{
  "items": [
    {
      "type": 1,
      "name": "Name",
      "username": "Username",
      "password": "Password",
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
</details>

**Output behavior**

Please provide the content of the `output.csv` file. You can generate it by running the following command:

```sh
bunx @gutenye/password-manager-tools@<LATEST_VERSION> bitwarden.json output.csv 
```

```csv
<PASTE_FILE_CONTENT_HERE>
```

<details>
<summary>example file</summary>

```csv
Title,Username,Password,OTPAuth,URL,Notes
Name,,,,example.com,
```
</details>

**Expected behavior**
> A clear and concise description of what you expected to happen.
