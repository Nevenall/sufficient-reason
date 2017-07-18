Get-ChildItem *.md -Recurse | Select-Object FullName | ForEach-Object { $_.FullName.Replace("SufficientReason","SufficientReason\html") -replace ".md",".html" }

# we want to get the part of the path tht starts at the root of our workspace
# so, take the file path, replace the workspace folder with workspace folder/html
# exect will that fail because the folders don't get created? 