
Set-ExecutionPolicy Bypass -Scope Process -Force; 
iex ((New-Object System.Net.WebClient).DownloadString('https://exoticlibraries.github.io/libcester/cester.ps1'))
Remove-Item cester.h