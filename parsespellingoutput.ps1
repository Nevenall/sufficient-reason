#start of some powershell to parse aspell pipe mode output so we can assemble line number info for a problem matcher
#this will stream out the pipe output but add the linenumber : before each line
# we can improve this by only outputing the mistakes with the currentline number
# and include a warn string for the problem matcher to categorize issues

$lineNumber = 1;
Get-Content .\output.txt | ForEach-Object { Write-Output "$lineNumber : $_"; if ([string]::IsNullOrEmpty($_)) {
        ++$lineNumber;
    }  }
