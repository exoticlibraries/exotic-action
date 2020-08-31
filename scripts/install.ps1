
$ExoPath="$HOME/.yo/include/exotic/"

"Downloading libcester ..."
Invoke-WebRequest https://raw.githubusercontent.com/exoticlibraries/libcester/dev/include/exotic/cester.h -OutFile ./cester.h
[System.IO.Directory]::CreateDirectory($ExoPath) > $null
If ( -not $?) {
    "Failed to create the folder $($ExoPath). Skipping..." 
    Exit 1
}
" => Installing libcester into $ExoPath"
Copy-Item -Path ./cester.h -Destination $ExoPath -Force
