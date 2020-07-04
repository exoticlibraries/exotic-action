
$NAME="cester"
$DOWNLOAD_PATH="https://raw.githubusercontent.com/exoticlibraries/libcester/master/include/exotic/cester.h"
$Global:IncludePaths = New-Object System.Collections.Generic.List[System.Object]
$Global:MingWFolder32 = "C:/msys64/mingw32/x86_64-w64-mingw32/include/exotic/"
$Global:MingWFolder64 = "C:/msys64/mingw64/x86_64-w64-mingw32/include/exotic/"

If ($args[1] -eq "x86") {
    $env:Path += ";C:\msys64\clang32\bin;C:\msys64\mingw32\bin"
} Else {
    $env:Path += ";C:\msys64\clang64\bin;C:\msys64\mingw64\bin"
}

"Downloading $NAME ..."
Invoke-WebRequest https://raw.githubusercontent.com/exoticlibraries/libcester/master/include/exotic/cester.h -OutFile ./cester.h
$Global:IncludePaths.Add(MingWFolder32)
$Global:IncludePaths.Add(MingWFolder64)
ForEach ($Path in $Global:IncludePaths) {
    If ( -not [System.IO.Directory]::Exists($Path)) {
        [System.IO.Directory]::CreateDirectory($Path) > $null
        If ( -not $?) {
            "Failed to create the folder $($Path). Skipping..." 
            continue
        }
    }
    " => Installing lib$NAME into $Path"
    Copy-Item -Path ./cester.h -Destination $Path -Force
}



<# # Clang is already installed in thw Windows image C:\msys64\
# Damn, it took me 48 hours to setup clang installtion for nothin :(
If ($args[2] -eq "clang") {
    echo "installing clang according to the walkthrough on https://ariya.io/2020/01/clang-on-windows"
    choco install --no-progress --yes msys2
    cd C:\tools\msys64\usr\bin
    $env:Path += ";C:\tools\msys64\usr\bin"
    pacman -Sy
    # pacman --noconfirm -S pacman-mirrors
    If ($args[1] -eq "x86") {
        $env:Path += ";C:\tools\msys64\mingw32\bin"
        pacman --noconfirm -S msys/make mingw32/mingw-w64-i686-clang
    } Else {
        $env:Path += ";C:\tools\msys64\mingw64\bin"
        pacman --noconfirm -S msys/make mingw64/mingw-w64-x86_64-clang
    }
    # Set the path also before running regression
} #>