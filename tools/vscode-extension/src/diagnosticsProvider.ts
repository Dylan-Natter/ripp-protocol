import * as vscode from 'vscode';

export class RippDiagnosticsProvider {
	private diagnosticCollection: vscode.DiagnosticCollection;

	constructor() {
		this.diagnosticCollection = vscode.languages.createDiagnosticCollection('ripp');
	}

	clear(): void {
		this.diagnosticCollection.clear();
	}

	parseAndSetDiagnostics(output: string, workspaceRoot: string): void {
		this.clear();
		
		// Parse validation output for errors/warnings
		// Expected format: "FILE:LINE:COL: SEVERITY: MESSAGE"
		// or "ERROR: MESSAGE" for general errors
		
		const diagnosticsMap = new Map<string, vscode.Diagnostic[]>();
		const lines = output.split('\n');
		
		for (const line of lines) {
			const diagnostic = this.parseLine(line, workspaceRoot);
			if (diagnostic) {
				const { uri, diag } = diagnostic;
				const uriString = uri.toString();
				
				if (!diagnosticsMap.has(uriString)) {
					diagnosticsMap.set(uriString, []);
				}
				diagnosticsMap.get(uriString)!.push(diag);
			}
		}

		// Set diagnostics for each file
		for (const [uriString, diagnostics] of diagnosticsMap) {
			this.diagnosticCollection.set(vscode.Uri.parse(uriString), diagnostics);
		}
	}

	private parseLine(line: string, workspaceRoot: string): { uri: vscode.Uri; diag: vscode.Diagnostic } | null {
		// Try to match patterns like:
		// "file.yaml:10:5: error: Missing required field 'purpose'"
		// "file.yaml:10: warning: Consider adding description"
		// "Error in file.yaml: Invalid schema"
		
		// Pattern 1: FILE:LINE:COL: SEVERITY: MESSAGE
		let match = line.match(/^(.+?):(\d+):(\d+):\s*(error|warning|info):\s*(.+)$/i);
		if (match) {
			const [, file, lineStr, colStr, severity, message] = match;
			return this.createDiagnostic(
				file,
				parseInt(lineStr, 10) - 1, // VS Code uses 0-based line numbers
				parseInt(colStr, 10) - 1,   // VS Code uses 0-based columns
				severity.toLowerCase(),
				message,
				workspaceRoot
			);
		}

		// Pattern 2: FILE:LINE: SEVERITY: MESSAGE
		match = line.match(/^(.+?):(\d+):\s*(error|warning|info):\s*(.+)$/i);
		if (match) {
			const [, file, lineStr, severity, message] = match;
			return this.createDiagnostic(
				file,
				parseInt(lineStr, 10) - 1,
				0,
				severity.toLowerCase(),
				message,
				workspaceRoot
			);
		}

		// Pattern 3: Error/Warning in FILE: MESSAGE
		match = line.match(/^(error|warning|info)\s+in\s+(.+?):\s*(.+)$/i);
		if (match) {
			const [, severity, file, message] = match;
			return this.createDiagnostic(
				file,
				0,
				0,
				severity.toLowerCase(),
				message,
				workspaceRoot
			);
		}

		return null;
	}

	private createDiagnostic(
		file: string,
		line: number,
		column: number,
		severity: string,
		message: string,
		workspaceRoot: string
	): { uri: vscode.Uri; diag: vscode.Diagnostic } | null {
		try {
			// Resolve file path relative to workspace
			const filePath = file.startsWith('/') ? file : `${workspaceRoot}/${file}`;
			const uri = vscode.Uri.file(filePath);
			
			const range = new vscode.Range(
				new vscode.Position(line, column),
				new vscode.Position(line, column + 1)
			);

			let diagSeverity: vscode.DiagnosticSeverity;
			switch (severity) {
				case 'error':
					diagSeverity = vscode.DiagnosticSeverity.Error;
					break;
				case 'warning':
					diagSeverity = vscode.DiagnosticSeverity.Warning;
					break;
				case 'info':
					diagSeverity = vscode.DiagnosticSeverity.Information;
					break;
				default:
					diagSeverity = vscode.DiagnosticSeverity.Information;
			}

			const diagnostic = new vscode.Diagnostic(range, message, diagSeverity);
			diagnostic.source = 'RIPP';

			return { uri, diag: diagnostic };
		} catch (error) {
			// Couldn't resolve file path
			return null;
		}
	}

	dispose(): void {
		this.diagnosticCollection.dispose();
	}
}
