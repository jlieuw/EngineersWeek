import * as vscode from 'vscode';

/**
 * Runs a SQL query in a SQL text editor.
 * @param query The SQL query to run.
 */
export async function runQuery(query: string) {
	await Promise.race([new Promise(resolve => setTimeout(resolve, 3000)), new Promise((resolve) => {
		vscode.window.onDidChangeActiveTextEditor(resolve);
		return vscode.commands.executeCommand('mssql.newQuery');
	})]);
	await vscode.window.activeTextEditor?.edit((editBuilder) => {
		editBuilder.insert(new vscode.Position(0, 0), query);
	});
	await vscode.commands.executeCommand('mssql.runQuery');
}