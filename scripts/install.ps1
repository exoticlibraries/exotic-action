
Set-ExecutionPolicy Bypass -Scope Process -Force; 
iex ((New-Object System.Net.WebClient).DownloadString('https://exoticlibraries.github.io/libcester/cester.ps1'))
Remove-Item cester.h

# See https://ariya.io/2020/01/clang-on-windows
If ($args[2] -eq "clang") {
    choco install --no-progress msys2
    cd C:\tools\msys64\usr\bin
    pacman -S
    pacman --noconfirm -S pacman-mirrors
    pacman --noconfirm -S msys/make mingw64/mingw-w64-x86_64-clang
    pacman --noconfirm -S msys/make mingw32/mingw-w64-i686-clang
    SET PATH=C:\tools\msys64\usr\bin;C:\tools\msys64\mingw64\bin;%PATH%
}