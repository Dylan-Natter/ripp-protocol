import * as vscode from 'vscode';

export class RippReportViewProvider implements vscode.WebviewViewProvider {
	public static readonly viewType = 'ripp.reportView';

	private _view?: vscode.WebviewView;
	private _currentReport?: ValidationReport;

	constructor(
		private readonly _extensionUri: vscode.Uri,
	) { }

	public resolveWebviewView(
		webviewView: vscode.WebviewView,
		_context: vscode.WebviewViewResolveContext,
		_token: vscode.CancellationToken,
	) {
		this._view = webviewView;

		webviewView.webview.options = {
			enableScripts: true,
			localResourceRoots: [this._extensionUri]
		};

		webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

		// Handle messages from the webview
		webviewView.webview.onDidReceiveMessage(data => {
			switch (data.type) {
				case 'copyReport':
					this.copyReportToClipboard();
					break;
				case 'exportJson':
					this.exportReport('json');
					break;
				case 'exportMarkdown':
					this.exportReport('markdown');
					break;
			}
		});
	}

	public updateReport(report: ValidationReport) {
		this._currentReport = report;
		if (this._view) {
			this._view.webview.postMessage({ type: 'updateReport', report });
		}
	}

	private async copyReportToClipboard() {
		if (!this._currentReport) {
			return;
		}

		const reportText = this.formatReportAsText(this._currentReport);
		await vscode.env.clipboard.writeText(reportText);
		vscode.window.showInformationMessage('RIPP report copied to clipboard');
	}

	private async exportReport(format: 'json' | 'markdown') {
		if (!this._currentReport) {
			vscode.window.showWarningMessage('No report available to export');
			return;
		}

		const defaultUri = vscode.Uri.file(`ripp-report.${format === 'json' ? 'json' : 'md'}`);
		const uri = await vscode.window.showSaveDialog({
			defaultUri,
			filters: format === 'json' 
				? { 'JSON': ['json'] }
				: { 'Markdown': ['md'] }
		});

		if (!uri) {
			return;
		}

		const content = format === 'json' 
			? JSON.stringify(this._currentReport, null, 2)
			: this.formatReportAsMarkdown(this._currentReport);

		await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf8'));
		vscode.window.showInformationMessage(`Report exported to ${uri.fsPath}`);
	}

	private formatReportAsText(report: ValidationReport): string {
		const lines: string[] = [];
		lines.push('RIPP Validation Report');
		lines.push(`Status: ${report.status}`);
		lines.push(`Timestamp: ${new Date(report.timestamp).toLocaleString()}`);
		lines.push(`Total Issues: ${report.findings.length}`);
		lines.push('');
		
		for (const finding of report.findings) {
			lines.push(`${finding.severity.toUpperCase()}: ${finding.message}`);
			lines.push(`  File: ${finding.file}`);
			if (finding.line) {
				lines.push(`  Line: ${finding.line}`);
			}
			lines.push('');
		}

		return lines.join('\n');
	}

	private formatReportAsMarkdown(report: ValidationReport): string {
		const lines: string[] = [];
		lines.push('# RIPP Validation Report');
		lines.push('');
		lines.push(`**Status**: ${report.status === 'pass' ? '✓ Pass' : '✗ Fail'}`);
		lines.push(`**Timestamp**: ${new Date(report.timestamp).toLocaleString()}`);
		lines.push(`**Total Issues**: ${report.findings.length}`);
		lines.push('');
		
		if (report.findings.length > 0) {
			lines.push('## Findings');
			lines.push('');
			lines.push('| Severity | File | Line | Message |');
			lines.push('|----------|------|------|---------|');
			
			for (const finding of report.findings) {
				const severityIcon = finding.severity === 'error' ? '🔴' 
					: finding.severity === 'warning' ? '🟡' 
					: '🔵';
				lines.push(`| ${severityIcon} ${finding.severity} | ${finding.file} | ${finding.line || 'N/A'} | ${finding.message} |`);
			}
		}

		return lines.join('\n');
	}

	private _getHtmlForWebview(_webview: vscode.Webview) {
		return `<!DOCTYPE html>
		<html lang="en">
		<head>
			<meta charset="UTF-8">
			<meta name="viewport" content="width=device-width, initial-scale=1.0">
			<title>RIPP Report</title>
			<style>
				body {
					padding: 10px;
					color: var(--vscode-foreground);
					font-family: var(--vscode-font-family);
				}
				.empty-state {
					text-align: center;
					padding: 20px;
					color: var(--vscode-descriptionForeground);
				}
				.report-summary {
					padding: 10px;
					margin-bottom: 10px;
					border: 1px solid var(--vscode-panel-border);
					border-radius: 4px;
				}
				.status-pass {
					color: var(--vscode-testing-iconPassed);
				}
				.status-fail {
					color: var(--vscode-testing-iconFailed);
				}
				.findings-table {
					width: 100%;
					border-collapse: collapse;
					margin: 10px 0;
				}
				.findings-table th,
				.findings-table td {
					padding: 8px;
					text-align: left;
					border-bottom: 1px solid var(--vscode-panel-border);
				}
				.findings-table th {
					background-color: var(--vscode-editor-background);
					font-weight: bold;
				}
				.severity-error {
					color: var(--vscode-errorForeground);
				}
				.severity-warning {
					color: var(--vscode-editorWarning-foreground);
				}
				.severity-info {
					color: var(--vscode-editorInfo-foreground);
				}
				.actions {
					margin-top: 10px;
				}
				button {
					background-color: var(--vscode-button-background);
					color: var(--vscode-button-foreground);
					border: none;
					padding: 6px 12px;
					margin-right: 8px;
					cursor: pointer;
					border-radius: 2px;
				}
				button:hover {
					background-color: var(--vscode-button-hoverBackground);
				}
			</style>
		</head>
		<body>
			<div id="content">
				<div class="empty-state">
					<p>No validation report available</p>
					<p>Run RIPP validation to see results here</p>
				</div>
			</div>
			
			<script>
				const vscode = acquireVsCodeApi();
				
				window.addEventListener('message', event => {
					const message = event.data;
					
					if (message.type === 'updateReport') {
						updateReport(message.report);
					}
				});

				function updateReport(report) {
					const content = document.getElementById('content');
					const statusClass = report.status === 'pass' ? 'status-pass' : 'status-fail';
					
					let html = \`
						<div class="report-summary">
							<h3>Validation Report</h3>
							<p><strong>Status:</strong> <span class="\${statusClass}">\${report.status === 'pass' ? '✓ Pass' : '✗ Fail'}</span></p>
							<p><strong>Timestamp:</strong> \${new Date(report.timestamp).toLocaleString()}</p>
							<p><strong>Total Issues:</strong> \${report.findings.length}</p>
						</div>
					\`;

					if (report.findings.length > 0) {
						html += '<table class="findings-table"><thead><tr><th>Severity</th><th>File</th><th>Line</th><th>Message</th></tr></thead><tbody>';
						
						for (const finding of report.findings) {
							const severityClass = \`severity-\${finding.severity}\`;
							html += \`
								<tr>
									<td class="\${severityClass}">\${finding.severity}</td>
									<td>\${finding.file}</td>
									<td>\${finding.line || 'N/A'}</td>
									<td>\${finding.message}</td>
								</tr>
							\`;
						}
						
						html += '</tbody></table>';
					}

					html += \`
						<div class="actions">
							<button onclick="copyReport()">Copy Report</button>
							<button onclick="exportJson()">Export JSON</button>
							<button onclick="exportMarkdown()">Export Markdown</button>
						</div>
					\`;

					content.innerHTML = html;
				}

				function copyReport() {
					vscode.postMessage({ type: 'copyReport' });
				}

				function exportJson() {
					vscode.postMessage({ type: 'exportJson' });
				}

				function exportMarkdown() {
					vscode.postMessage({ type: 'exportMarkdown' });
				}
			</script>
		</body>
		</html>`;
	}
}

export interface ValidationReport {
	status: 'pass' | 'fail';
	timestamp: number;
	findings: Finding[];
}

export interface Finding {
	severity: 'error' | 'warning' | 'info';
	file: string;
	line?: number;
	message: string;
}
