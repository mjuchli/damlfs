# damlfs

This project provides a simplified filesystem written in `daml` and comes with a demo built upon the `create-daml-app` project template.

## Templates

The newly created templates `File` and `Directory` with their respective contracts can be found under `damlfs-app/daml/Filesystem.daml`.

Both templates work with a `signatory` (*creator*) and an `observer` (*owner*).
Hence once the ownership of a directory is passed to another user, the new owner must trust the original creator as this party could archive the contract at any given time.

### File

Describes a file consisting of:
- `creator`: creator of the file
- `path`: location of the file
- `name`: file name
- `content`: content of the file
- `owner`: owner of the file

Choices:
- `DeleteFile`: archives the file (currently leaves archived `ContractId` in path `Directory`)
- `ChangeFileOwner`: changes the owner of the file

### Directory

Describes a directory consisting of:
- `creator`: creator of the directory
- `parent`: it's parent directory (optional -> root level)
- `name`: directory name
- `owner`: owner of the directory
- `directories`: subdirectories
- `files`: files residing in this directory

Choices:
- `CreateFile`: creates a file within this directory
- `CreateDirectory`: creates sub-directory within this directory
- `DeleteDirectory`: archives the directory (currently leaves archived `ContractId` in parent `Directory`)
- `ChangeDirectoryOwner`: changes the owner of the directory as well as its sub-directories and files

## UI

The following components were added to `damlfs-app/ui/src/components` and integrated into the `MainView.tsx`:

- **CreateDirectoryComponent**: allows to create a new (sub-)directory.
- **CreateFileComponent**: allows to create a file within a directory
- **RemoveDirectoryComponent**: allows to remove a (sub-)directory.
- **RemoveFileComponent**: allows to remove a single file (residing within a directory).
- **FileTreeComponent**: a directory- and filetree structure (currently only 2 levels displayed).

## Tests

Tests against the contract can be found in `./script-example/ScriptExample.daml`.
The `Script` context is used, which allows to run the tests in the cli.

1. Build
```
cd script-example
daml start
```

2. Run tests
```
daml script --dar .daml/dist/script-example-0.0.1.dar --script-name ScriptExample:test --ledger-host localhost --ledger-port 6865
```
 
## Questions / Remarks

**Bidirectional relationship**

The biggest challenge was to handle the bidirectional relationships between templates.

Since a `Directory` contains a list of files (`[File]`), and vise-versa the file contains a path (`Directory`), removing a file results in an archived `ContractId` residing in the path directory.

Likewise, the `Directory` holds a parent `Directory` and a list of its sub directories (`[Directory]`). This means, whenever a directory is modified/removed and thus archived, the parent would loose the reference to the corresponding child `Directory`. Initiating a e.g. removal from the parent directory and remove the corresponding child wouldn't make this easier as the parent itself would thus be archived and therefore it's parent would loose the reference. 

*A similar problem was discussed here: https://discuss.daml.com/t/addressing-sets-of-contracts-from-within-a-daml-choice/3148*

Given the time constraints I did not resolve this issue, however, I thought it would be an interesting topic to discuss during the demo.
- We could forego the bidirectional relationship of `Directory <-> File` and only hold the reference `File -> Directory`. Using lookups on a directory level, we would be able to find and modify existing files.
- Regarding the subdirectories one could introduce a "normalization" template (e.g. `DirectoryToDirectory`), where each contract contains a parent and a child reference. Once a given directory is modified, the corresponding `DirectoryToDirectory` contracts with links from either parent or child need to be updated.