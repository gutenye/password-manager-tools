import { mdEscape } from './Report'
import type { Data } from './types/TReport'

const DISBALE_MARKDOWN = false // for console.log
// const DISBALE_MARKDOWN = true

export function createMarkdown({
  outputPath,
  outputRemainingPath,
  processedCount,
  remainingCount,
  requireFixCount,
  itOutputRemainingFileEncrypted,
  isInputFileOverwritten,
}: Data) {
  if (DISBALE_MARKDOWN) {
    return ''
  }
  return `
# 📋 Final Report 📋

## 1. ✅ Exported Passwords

\`${processedCount}\` items have been exported successfully and saved to \`${outputPath}\`. 

To import them into the \`Passwords\` app:

1. Open the \`Passwords\` app.
2. Navigate to \`File\` > \`Import Password\`.
3. Follow the on-screen instructions to complete the import.

**Note:** For security reasons, please delete the exported file after importing.
**Note:** Exported data from Bitwarden does not include passkeys and file attachments.

${
  requireFixCount > 0
    ? `
## 2. ⚠️ Items Requiring Manual Fixes

\`${requireFixCount}\` items have multiple domains and require your attention:

1. \`Open\` the iOS \`Passwords\` app. (macOS app has a bug)
2. \`Find\` items ends with \`FIXWEBSITE\`
3. \`Add\` the corresponding website from the \`Notes\` field.
  `.trim()
    : ''
}

${
  remainingCount > 0
    ? `
## 3. 🚫 Remainig Items

${
  outputRemainingPath
    ? `
\`${remainingCount}\` remaining items have been saved to \`${outputRemainingPath}\`.`
    : `\`${remainingCount}\` remaining items has not been saved, use \`--output-remaining\` option to save them.`
}

These items can be used for incremental exports in the future.

${isInputFileOverwritten ? '**Note:** The input file has been overwritten.' : ''} 
**Note:** Please keep this file secure. ${itOutputRemainingFileEncrypted ? 'It has been encrypted with the same password.' : 'It is **not encrypted**. Please encrypt it.'} 
`.trim()
    : ''
}

# 📊 Summary 📊

|                                 |                    |
| ------------------------------- | ------------------ |
| ✅ Exported Items               | ${processedCount}  |
| ✅ Exported Items Saved In      | ${mdEscape(outputPath)}      |
${
  requireFixCount > 0
    ? `
| ⚠ Requiring Manual Fixes Items  | ${requireFixCount} |
`.trim()
    : ''
}${requireFixCount > 0 && remainingCount > 0 ? '\n' : ''}${
  remainingCount > 0
    ? `
| 🚫 Remainig Items                | ${remainingCount}    |
| 🚫 Remainig Items Saved In       | ${mdEscape(outputRemainingPath || '(not saved)')}   |
`.trim()
    : ''
}

Thank you for using our CLI app! If you found it helpful, please [⭐️ star the project️️ ⭐](https://github.com/gutenye/password-manager-tools) on GitHub. If you have any questions or encounter issues, please refer to the documentation or report an issue on GitHub.
`
}
