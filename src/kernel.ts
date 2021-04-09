import * as vscode from 'vscode'
import { spawn } from 'child_process'

export class ElmKernelProvider implements vscode.NotebookKernelProvider {
    provideKernels(document: vscode.NotebookDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.NotebookKernel[]> {
        return [new ElmKernel()];
    }

}

export class ElmKernel implements vscode.NotebookKernel {
    readonly id = 'elm-poc-kernel'
    readonly label = 'Elm POC Kernel';
    readonly supportedLanguages = ['elm'];
    readonly elmRepl = spawn('elm repl', {shell: true});
    executionOrder = 0;
    outputBuffer: string = "";
    delimeter: string = "> ";
    taskQueue: vscode.NotebookCellExecutionTask[] = [];

    constructor() {
        this.elmRepl.stdout.on('data', (data) => {
            this.handleMessage(data.toString());
        });
        this.elmRepl.stderr.on('data', (data) => {
            this.handleMessage(data.toString());
        });
    }

    private handleMessage(data: string): void
    {
        if (this.taskQueue.length === 0)
            return;
        
        this.outputBuffer += data;
        if (this.isEndOfTask(data))
        {
            this.outputBuffer = this.outputBuffer.substr(0, this.outputBuffer.length - this.delimeter.length);
            this.addPlainOutput(this.taskQueue[0], this.outputBuffer);
            this.outputBuffer = "";
            this.taskQueue[0].end();
            this.taskQueue.shift();
            if (this.taskQueue.length !== 0)
                this.startTask(this.taskQueue[0]);
        }
    }

    private isEndOfTask(data: string): Boolean {
        return data.endsWith(this.delimeter);
    }

    private startTask(task: vscode.NotebookCellExecutionTask): void {
        task.executionOrder = ++this.executionOrder;
        task.start({ startTime: Date.now() });
        this.elmRepl.stdin.write(task.cell.document.getText() + "\n");
    }

    private addPlainOutput(task: vscode.NotebookCellExecutionTask, data: string) {
        const outputItem = new vscode.NotebookCellOutputItem('text/plain', data);
        const output = new vscode.NotebookCellOutput([outputItem]);
        task.appendOutput(output);
    }

    async executeCellsRequest(document: vscode.NotebookDocument, ranges: vscode.NotebookCellRange[]): Promise<void> {
		const cells: vscode.NotebookCell[] = [];
		for (let range of ranges) {
            cells.push(...document.getCells(range));
		}
		this._executeCells(cells);
    }

    private async _executeCells(cells: vscode.NotebookCell[]): Promise<void> {
		const tasks = Array.from(cells).map(cell => vscode.notebook.createNotebookCellExecutionTask(cell.notebook.uri, cell.index, this.id)!);
		for (const task of tasks) {
			await this._doExecuteCell(task);
		}
    }

    private async _doExecuteCell(task: vscode.NotebookCellExecutionTask): Promise<void> {
        this.taskQueue.push(task);
        if (this.taskQueue.length === 1)
            this.startTask(this.taskQueue[0]);
    }
    
}