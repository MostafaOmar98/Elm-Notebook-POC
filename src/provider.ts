import * as vscode from 'vscode';

export class ElmNotebookContentProvider implements vscode.NotebookContentProvider {
	async openNotebook(uri: vscode.Uri): Promise<vscode.NotebookData> {
		// incomplete implementation
		// loads markdown cells saved in nb4 format
		try {
			const content = JSON.parse((await vscode.workspace.fs.readFile(uri)).toString());
			const metadata = new vscode.NotebookDocumentMetadata().with({
				custom: content.metadata
			});

			const cellData: vscode.NotebookCellData[] = content.cells.map((cell: any): vscode.NotebookCellData => {
				return {
					kind: vscode.NotebookCellKind.Markdown,
					source: cell.source,
					language: 'markdown',
				}
			});

			return new vscode.NotebookData(cellData, metadata);
		} catch(e) {
			console.log(e);
			return new vscode.NotebookData([]);
		}
	}

	async resolveNotebook(): Promise<void> { 
		// console.log("Entered Resolve");
	}
	async saveNotebook(): Promise<void> {
		// console.log("Entered Save");
	 }
	async saveNotebookAs(): Promise<void> { 
		// console.log("Entered Save As");
	}
	async backupNotebook(): Promise<vscode.NotebookDocumentBackup> {
		// console.log("Entered Backup");
		return { id: '', delete: () => { } };
	}
}