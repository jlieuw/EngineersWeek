import * as vscode from 'vscode';
import axios from 'axios'; // Import axios for API requests

interface IWeatherParameters {
	tabGroup?: number;
}

export class WeatherTool implements vscode.LanguageModelTool<IWeatherParameters> {
	async invoke(
		options: vscode.LanguageModelToolInvocationOptions<IWeatherParameters>,
		_token: vscode.CancellationToken
	) {
		console.log('WeatherTool invoked with options:', options);
		const params = options.input;

		try {
			// Make an API request to fetch weather data
			const response = await axios.get('http://localhost:5231/weatherforecast');
			const weatherData = response.data;

			// Format the weather data into a readable string
			const weatherSummary = (weatherData as Array<{ date: string; summary: string; temperatureC: number; temperatureF: number }>).map((entry: any) => {
				return `${entry.date}: ${entry.summary} with a temperature of ${entry.temperatureC}°C (${entry.temperatureF}°F)`;
			}).join('\n');

			return new vscode.LanguageModelToolResult([
				new vscode.LanguageModelTextPart(`Here is the weather forecast:\n${weatherSummary}`)
			]);
		} catch (error) {
			console.error('Error fetching weather data:', error);
			return new vscode.LanguageModelToolResult([
				new vscode.LanguageModelTextPart('Failed to fetch weather data. Please try again later.')
			]);
		}
	}

	async prepareInvocation(
		options: vscode.LanguageModelToolInvocationPrepareOptions<IWeatherParameters>,
		_token: vscode.CancellationToken
	) {
		const confirmationMessages = {
			title: 'Fetch Weather Information',
			message: new vscode.MarkdownString(
				`Fetch the latest weather information?`
			),
		};

		return {
			invocationMessage: 'Fetching weather information',
			confirmationMessages,
		};
	}
}