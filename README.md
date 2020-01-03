# Update Major Version Tag

[![Test](https://github.com/nowactions/update-majorver/workflows/Test/badge.svg)](https://github.com/nowactions/update-majorver/actions)

This GitHub Action updates major version tags (e.g. v1, v2) when semantic versioning tag is pushed.
If `v1.2.3` tag is pushed, it updates `v1` tag.
It works well with [GitHub Action versioning](https://help.github.com/en/actions/automating-your-workflow-with-github-actions/about-actions#versioning-your-action).

## Usage

### Prerequisites

Create a workflow `.yml` file in your `.github/workflows` directory.
An [example workflow](#example) is available below.
For more information, reference the GitHub Help Documentation for [Creating a workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file).

### Inputs

- `github_token`: GitHub Token to use GitHub APIs. You do not need to create your own token, set the token provided by Actions for this.

## Example

```yml
name: Update Major Version Tag

on:
  push:
    tags:
      - "v*"

jobs:
  update-majorver:
    name: Update Major Version Tag
    runs-on: ubuntu-latest
    steps:
      - uses: nowactions/update-majorver@master
        with:
          github_token: ${{ secrets. GITHUB_TOKEN }}
```
