
# need to redo this so it's legitimately line by line. 
#  we can read each line from the file, track the number and feed that line to the spell checker. 
# we can also then put aspell in terse mode
# except # means soemthing in pipe mode, save the personal dictionary
# most of markdown will be a mess. 
# so, as we pipe each line through we can just add the line number at the start, or !
# Not started with a !, that doesn't work, 
# we can start it with the line number of some kind neutral buffer. even a space will do. 

Get-ChildItem *.md -Recurse | ForEach-Object {
  $lineNumber = 1; 
  write-output "File - $($_.FullName)"; 
  get-content $_ | aspell pipe --sug-mode=ultra | ForEach-Object { 
    if( ([string]$_).StartsWith('&')){
      Write-Output "$lineNumber $_";
    } if([string]::IsNullOrEmpty($_)) {
      ++$lineNumber;
    }}}
