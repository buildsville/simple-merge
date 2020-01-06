# simple merge action
Merge pull request action.

## Inputs

### token (required)
github token.

### labels
actions trigger when these labels are included. (json array string)

### method
merge method.  
`merge` || `squash` || `rebase`

### title
commit title.

### message
commit message.

## Outputs

### result
`success` || `failure` || `skipped`  
success: merge successful.  
failure: merge failed. (see action log)  
skipped: label unmatch.

## Example usage
```
name: auto merge action
on:
  pull_request_review:
    types:
      - submitted
jobs:
  autoMerge:
    runs-on: ubuntu-latest
    steps:
      - name: automerge
        uses: buildsville/simple-merge@v1
        id: merge
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          method: 'squash'
          labels: '[ "foo", "bar" ]'
          title: 'commit title'
          message: 'commit message'
      - name: result
        run: |
          echo "result: ${{ steps.merge.outputs.result }}"
```
