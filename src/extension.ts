import * as vscode from 'vscode';
import { AuthManager } from './auth';
import { getProviderKeys } from './config';
import { logger } from './logger';
import { ModelManagerViewProvider } from './modelView';
import { Copilot2ApiProvider } from './provider';

let activeProvider: Copilot2ApiProvider | undefined;

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  logger.info(`Activating Copilot2API ${context.extension.packageJSON.version}`);

  const authManager = new AuthManager(context.secrets);
  const provider = new Copilot2ApiProvider(authManager, context);
  const modelViewProvider = new ModelManagerViewProvider(
    context,
    authManager,
    () => {
      void provider.refreshModelPicker();
    },
  );
  activeProvider = provider;

  context.subscriptions.push(
    vscode.lm.registerLanguageModelChatProvider('copilot2api', provider),
    vscode.window.registerWebviewViewProvider(ModelManagerViewProvider.viewType, modelViewProvider, {
      webviewOptions: {
        retainContextWhenHidden: false,
      },
    }),
    vscode.commands.registerCommand('copilot2api.focusModels', () => {
      modelViewProvider.focus();
    }),
    vscode.commands.registerCommand('copilot2api.setApiKey', async () => {
      if (await authManager.promptForGlobalApiKey()) {
        void provider.refreshModelPicker();
        modelViewProvider.postState();
      }
    }),
    vscode.commands.registerCommand('copilot2api.setProviderApiKey', async () => {
      const providers = getProviderKeys();
      if (providers.length === 0) {
        vscode.window.showWarningMessage('No Copilot2API providers are configured.');
        return;
      }

      const selected = await vscode.window.showQuickPick(providers, {
        title: 'Copilot2API Provider',
        placeHolder: 'Choose the provider to configure',
      });
      if (!selected) {
        return;
      }

      if (await authManager.promptForProviderApiKey(selected)) {
        void provider.refreshModelPicker();
        modelViewProvider.postState();
      }
    }),
    vscode.commands.registerCommand('copilot2api.clearApiKey', async () => {
      await authManager.clearGlobalApiKey();
      void provider.refreshModelPicker();
      vscode.window.showInformationMessage('Copilot2API default API key cleared.');
    }),
    vscode.commands.registerCommand('copilot2api.openSettings', () => {
      vscode.commands.executeCommand('workbench.action.openSettings', 'copilot2api');
    }),
    vscode.commands.registerCommand('copilot2api.showLogs', () => logger.show()),
  );

  try {
    await vscode.extensions.getExtension('github.copilot-chat')?.activate();
  } catch (error) {
    logger.warn('Could not activate GitHub Copilot Chat before refreshing models.', formatError(error));
  }

  void provider.refreshModelPicker();
  logger.info('Copilot2API activated.');
}

export async function deactivate(): Promise<void> {
  try {
    await activeProvider?.prepareForDeactivate();
  } finally {
    activeProvider = undefined;
    logger.info('Copilot2API deactivated.');
    logger.dispose();
  }
}

function formatError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
