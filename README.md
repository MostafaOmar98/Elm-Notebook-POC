A proof of concept for vscode support of elm notebooks.

Requires elm compiler to be installed and added to path. More specifically, it requires elm repl to run when you execute "elm repl" in the shell.

Currently only works for single lined cells, but supports multi-line outputs.

Implements vscode's notebook proposed API: https://code.visualstudio.com/api/extension-guides/notebook