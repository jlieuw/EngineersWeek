// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { renderPrompt } from '@vscode/prompt-tsx';
import { runQuery } from './utils';
import { Nl2SqlPrompt } from './nl2sqlPrompt';

export function activate(context: vscode.ExtensionContext) {


	// define a chat handler
	const handler: vscode.ChatRequestHandler = async (request: vscode.ChatRequest, context: vscode.ChatContext, stream: vscode.ChatResponseStream, token: vscode.CancellationToken) => {
		
		stream.progress('Reading database context...');
		
		const { messages } = await renderPrompt(
			Nl2SqlPrompt,
			{ userQuery: request.prompt },
			{ modelMaxPromptTokens: request.model.maxInputTokens },
			request.model);

		// get all the previous participant messages
		const previousMessages = context.history.filter(
			(h) => h instanceof vscode.ChatResponseTurn
		);

		// add the previous messages to the messages array
		previousMessages.forEach((m) => {
			let fullMessage = '';
			m.response.forEach((r) => {
				const mdPart = r as vscode.ChatResponseMarkdownPart;
				fullMessage += mdPart.value.value;
			});
			messages.push(vscode.LanguageModelChatMessage.Assistant(fullMessage));
		});

		// add in the user's message
		messages.push(vscode.LanguageModelChatMessage.User(request.prompt));

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
