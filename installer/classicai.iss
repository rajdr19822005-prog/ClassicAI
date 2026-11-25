#define MyAppName "ClassicAI"
#ifndef AppVersion
  #define AppVersion "0.1.1"
#endif
#define MyAppPublisher "ClassicAI"
#define MyAppExeName "classicai.exe"

[Setup]
AppId={{D96A38B0-5E82-4E3D-94AF-60E0A67B8F25}
AppName={#MyAppName}
AppVersion={#AppVersion}
AppPublisher={#MyAppPublisher}
DefaultDirName={autopf}\ClassicAI
DefaultGroupName=ClassicAI
OutputDir=..\dist
OutputBaseFilename=ClassicAI-Desktop-Setup
Compression=lzma2
SolidCompression=yes
WizardStyle=modern
ArchitecturesInstallIn64BitMode=x64
PrivilegesRequired=admin
UninstallDisplayIcon={app}\{#MyAppExeName}

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"

[Tasks]
Name: "desktopicon"; Description: "Create a desktop shortcut"; GroupDescription: "Additional shortcuts:"; Flags: unchecked

[Files]
Source: "..\build\windows\x64\runner\Release\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs
Source: "..\dist\MicrosoftEdgeWebView2Setup.exe"; DestDir: "{tmp}"; Flags: deleteafterinstall

[Icons]
Name: "{group}\ClassicAI"; Filename: "{app}\{#MyAppExeName}"
Name: "{autodesktop}\ClassicAI"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
Filename: "{tmp}\MicrosoftEdgeWebView2Setup.exe"; Parameters: "/silent /install"; StatusMsg: "Installing Microsoft Edge WebView2 Runtime..."; Flags: waituntilterminated
Filename: "{app}\{#MyAppExeName}"; Description: "Launch ClassicAI"; Flags: nowait postinstall skipifsilent
