
Set-ExecutionPolicy Bypass -Scope Process -Force; 
iex ((New-Object System.Net.WebClient).DownloadString('https://exoticlibraries.github.io/libcester/cester.ps1'))
Remove-Item cester.h

If ($args[2] -eq "clang") {
    echo "installing clang according to the walkthrough on https://ariya.io/2020/01/clang-on-windows"
    choco install --no-progress --yes msys2
    cd C:\tools\msys64\usr\bin
    $env:Path += ";C:\tools\msys64\usr\bin;C:\tools\msys64\mingw64\bin"
    pacman -Sy
    # pacman --noconfirm -S pacman-mirrors
    If ($args[1] -eq "x86") {
        pacman --noconfirm -S msys/make mingw32/mingw-w64-i686-clang
    } Else {
        pacman --noconfirm -S msys/make mingw64/mingw-w64-x86_64-clang
    }
    [System.Environment]::SetEnvironmentVariable('Path', 
                        [environment]::GetEnvironmentVariable("Path","Machine") + ";C:\tools\msys64\usr\bin;C:\tools\msys64\mingw64\bin", 
                        [System.EnvironmentVariableTarget]::Machine);
}