import * as vscode from 'vscode';
import { Client } from 'pg';

interface IWikiSearchParameters {
	searchInput?: string;
}

export class WikiSearchTool implements vscode.LanguageModelTool<IWikiSearchParameters> {
	async invoke(
		options: vscode.LanguageModelToolInvocationOptions<IWikiSearchParameters>,
		_token: vscode.CancellationToken
	) {
		const params = options.input as IWikiSearchParameters;

		if (!params.searchInput) {
			return new vscode.LanguageModelToolResult([
				new vscode.LanguageModelTextPart('No search input provided.')
			]);
		}

		const client = new Client({
			user: 'postgres',
			host: 'localhost',
			database: 'postgres',
			password: 'postgres',
			port: 5432,
		});

		try {
			await client.connect();

			const query = `
				SELECT title, chunk
				FROM wiki_embeddings
				ORDER BY embedding <=> ai.ollama_embed('all-minilm', $1)
				LIMIT 3;
			`;

			const result = await client.query(query, [params.searchInput]);

			if (result.rows.length > 0) {
				const { title, chunk } = result.rows[0];
				return new vscode.LanguageModelToolResult([
					new vscode.LanguageModelTextPart(`Title: ${title}\nContent: ${chunk}`)
				]);
			} else {
				return new vscode.LanguageModelToolResult([
					new vscode.LanguageModelTextPart('No results found.')
				]);
			}
		} catch (error) {
			console.error('Error querying the database:', error);
			return new vscode.LanguageModelToolResult([
				new vscode.LanguageModelTextPart('An error occurred while searching the database.')
			]);
		} finally {
			await client.end();
		}
	}

	async prepareInvocation(
		options: vscode.LanguageModelToolInvocationPrepareOptions<IWikiSearchParameters>,
		_token: vscode.CancellationToken
	) {
		return {
			invocationMessage: `Searching wiki database for "${options.input.searchInput}"`,
		};
	}
}