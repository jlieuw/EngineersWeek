// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { renderPrompt } from '@vscode/prompt-tsx';
import { runQuery } from './utils';
import { Nl2SqlPrompt } from './nl2sqlPrompt';

export function activate(context: vscode.ExtensionContext) {


	// define a chat handler
	const handler: vscode.ChatRequestHandler = async (request: vscode.ChatRequest, context: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken) => {
		const userQuery = request.prompt;

		stream.progress('Reading database context...');
		
		let { messages } = await renderPrompt(
			Nl2SqlPrompt,
			{ userQuery: request.prompt },
			{ modelMaxPromptTokens: request.model.maxInputTokens },
			request.model);

		// let dbContext = await getDatabaseContext();

		messages.push(new vscode.LanguageModelChatMessage(vscode.LanguageModelChatMessageRole.User, userQuery));


		// send the request
		const chatResponse = await request.model.sendRequest(messages, {}, token);

		let data = '';
		// stream the response
		for await (const fragment of chatResponse.text) {
			stream.markdown(fragment);
			data += fragment;
		}

		const sqlRegex = /```[^\n]*\n([\s\S]*)\n```/g;
		const match = sqlRegex.exec(data);
		if(match && match[1]) {
			stream.button({title: 'Run query', command: 'vscode-mssql-chat.runQuery', arguments: [match[1]]});
		}

		return;

	};

	vscode.commands.registerCommand('vscode-mssql-chat.runQuery', (sqlQuery: string) => {
		runQuery(sqlQuery);
	});

	// create participant
	const tutor = vscode.chat.createChatParticipant("chat-demo.nl2sql", handler);
}

// This method is called when your extension is deactivated
export function deactivate() {}
