import * as vscode from 'vscode';
import { ElmKernelProvider as ElmKernelProvider } from './kernel';
import { ElmNotebookContentProvider as ElmNotebookContentProvider } from './provider'


export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(vscode.notebook.registerNotebookContentProvider(
		'elm-poc-notebook',
		new ElmNotebookContentProvider()
	));
	context.subscriptions.push(vscode.notebook.registerNotebookKernelProvider({viewType: "elm-poc-notebook"}, new ElmKernelProvider()));
}

export function deactivate() { }
