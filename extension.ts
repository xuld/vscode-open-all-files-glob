import * as vscode from "vscode"

export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerCommand("open-files-glob.openAllFiles", openAllFiles))
}

async function openAllFiles(uri: vscode.Uri = vscode.workspace.workspaceFolders[0].uri) {
    const configuration = vscode.workspace.getConfiguration("open-files-glob", uri)
    const glob = await vscode.window.showInputBox({
        value: configuration.get<string>("defaultGlobs") || "**/*.{ts,tsx,jsx,js},!**​/node_modules/**",
        prompt: "Please input a glob to open"
    })
    const patterns = glob.split(",!")
    const files = await vscode.workspace.findFiles(new vscode.RelativePattern(uri.fsPath, patterns[0]), patterns.length >= 2 ? new vscode.RelativePattern(uri.fsPath, patterns[1]) : undefined)
    if (files.length == 0) {
        vscode.window.showInformationMessage("No files found in folder.")
        return
    }
    const maxFilesWithoutConfirmation = configuration.get<number>("maxFilesWithoutConfirmation", 10)
    if (maxFilesWithoutConfirmation >= 0 && files.length >= maxFilesWithoutConfirmation) {
        const answer = await vscode.window.showWarningMessage(`Are you sure you want to open ${files.length} files at once?`, "Yes", "No")
        if (answer !== "Yes") {
            return
        }
    }
    files.sort((x, y) => x.fsPath < y.fsPath ? -1 : x.fsPath > y.fsPath ? 1 : 0)
    for (const file of files) {
        vscode.commands.executeCommand("vscode.open", file, {
            preview: false
        })
    }
}