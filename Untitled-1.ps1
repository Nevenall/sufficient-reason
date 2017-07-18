Get-ChildItem *.md -Recurse | Select-Object FullName | ForEach-Object { $_.FullName.Replace("SufficientReason","SufficientReason\html") -replace ".md",".html" }

# we want to get the part of the path tht starts at the root of our workspace
# so, take the file path, replace the workspace folder with workspace folder/html
# exect will that fail because the folders don't get created? 
# if we want a stuctured html folder then we have to manually create the folder structure
# we could, alternately, append the pathing to the output filename. 
# that would be an easy solution. 
# or we can make a powershell module that will do the things we need. 
# or I wonder if we can make a csx script? 
