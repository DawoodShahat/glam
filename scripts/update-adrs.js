/*
This script looks at docs/adr/, pulls all the available .md files,
and creates a list of adrs + links in index.md.
*/

const fs = require('fs');

const adrPattern = new RegExp(/\d{4}-[\S]*.md/);
const adrs = fs
  .readdirSync('../docs/adr/')
  .filter((file) => adrPattern.test(file))
  .map((file) => `- [${file}](/docs/adr/${file})`)
  .join('\n');

const README = `# GLAM Architectural Decision Records (ADRs)

We use ADRs to capture important engineering decisions made. For more
information, see [this ADR explanation](https://adr.github.io/).

We use [MADRs (markdown ADRs)](https://adr.github.io/madr/). To contribute a new
ADR,

1. copy \`template.md\` into a new file in this directory in the format
   \`nnnn-title-with-dashes.md\`. The \`nnnn\` should be the next number up from the
   highest number in the ADRs in this directory.
2. fill out the template.
3. once done, run node scripts/update-adrs to generate a new index.
4. file a PR with these changes as a branch in the GLAM repository.

## Accepted ADRs

${adrs}

`;

// write README to a new file

fs.writeFileSync('../docs/adr/README.md', README);
