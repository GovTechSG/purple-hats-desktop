$PHbackendUrl = "https://github.com/GovTechSG/purple-hats/releases/latest/download/purple-hats-portable-windows.zip"
$PHfrontendUrl = "https://github.com/GovTechSG/purple-hats-desktop/releases/latest/download/purple-hats-desktop-windows-prod.zip"
$BEdestinationPath = "$env:APPDATA\PHLatest.zip"
$BEextractPath = "$env:APPDATA\Purple HATS Backend"
$FEdestinationPath = "$env:APPDATA\Purple HATS-win32-x64.zip"
$FEextractPath = "$env:APPDATA\Purple HATS-win32-x64"
$innoSetupCompilerUrl = "https://jrsoftware.org/download.php/is.exe"
$innoSetupCompilerPath = "$env:APPDATA\iscc.exe"
$current_path = (Get-Item -Path ".\" -Verbose).FullName

Invoke-WebRequest -Uri $PHbackendUrl -OutFile $BEdestinationPath

Expand-Archive -Path $BEdestinationPath -DestinationPath $BEextractPath -Force

Remove-Item -Path $BEdestinationPath

echo "Purple HATS Backend extracted to $BEextractPath."

Invoke-WebRequest -Uri $PHfrontendUrl -OutFile $FEdestinationPath

Expand-Archive -Path $FEdestinationPath -DestinationPath $FEextractPath -Force

Remove-Item -Path $FEdestinationPath

echo "Purple HATS Frontend extracted to $FEextractPath."

# Invoke-WebRequest -Uri $innoSetupCompilerUrl -OutFile $innoSetupCompilerPath

# echo "InnoSetup compiler extracted to $innoSetupCompilerPath."

# Start-Process "$env:APPDATA\iscc.exe" -ArgumentList "/LOG /O`"$env:APPDATA" `"C:\Program Files\Purple HATS Desktop\Purple HATS Frontend\hats_for_windows.iss`"" -Wait -NoNewWindow 

#echo "Inno Setup compiler has been installed."

Move-Item -Path "$current_path\hats_for_windows.iss" -Destination "$env:APPDATA\hats_for_windows.iss" -Force

echo "Moved Inno Setup script from $current_path to $env:APPDATA"
