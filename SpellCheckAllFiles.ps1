Get-ChildItem *.md -Recurse | ForEach-Object {
  $lineNumber = 1; 
  write-output "File - $($_.FullName)"; 
  get-content $_ | aspell pipe --sug-mode=ultra | ForEach-Object { 
    if( ([string]$_).StartsWith('&')){
      Write-Output "$lineNumber $_";
    } if([string]::IsNullOrEmpty($_)) {
      ++$lineNumber;
    }}}
