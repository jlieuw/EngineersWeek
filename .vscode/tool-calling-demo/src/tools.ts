import * as vscode from 'vscode';
import { WeatherTool } from './weatherTool';
import { WikiSearchTool } from './wikiSearchTool';

export function registerChatTools(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.lm.registerTool('tool-calling-demo-api', new WeatherTool()));
	context.subscriptions.push(vscode.lm.registerTool('chat-tools-wiki-search', new WikiSearchTool()));
}

