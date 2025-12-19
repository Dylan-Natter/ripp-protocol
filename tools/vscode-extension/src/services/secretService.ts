import * as vscode from 'vscode';

/**
 * Secrets Service
 *
 * Manages secure storage of API keys and endpoints using VS Code SecretStorage.
 * Never stores secrets in repository files.
 * Provides secrets as environment variables for CLI execution.
 */

export type AiProvider = 'openai' | 'azure-openai' | 'ollama';

export interface OpenAiSecrets {
  apiKey: string;
}

export interface AzureOpenAiSecrets {
  endpoint: string;
  apiKey: string;
  deployment: string;
  apiVersion: string;
}

export interface OllamaSecrets {
  baseUrl: string;
}

export interface ConnectionSecrets {
  provider: AiProvider;
  openai?: OpenAiSecrets;
  azureOpenai?: AzureOpenAiSecrets;
  ollama?: OllamaSecrets;
}

export class SecretService {
  private static instance: SecretService;
  private secrets: vscode.SecretStorage;

  private constructor(secrets: vscode.SecretStorage) {
    this.secrets = secrets;
  }

  public static getInstance(secrets: vscode.SecretStorage): SecretService {
    if (!SecretService.instance) {
      SecretService.instance = new SecretService(secrets);
    }
    return SecretService.instance;
  }

  /**
   * Get stored provider type
   */
  public async getProvider(): Promise<AiProvider | null> {
    const provider = await this.secrets.get('ripp.ai.provider');
    return provider as AiProvider | null;
  }

  /**
   * Set provider type
   */
  public async setProvider(provider: AiProvider): Promise<void> {
    await this.secrets.store('ripp.ai.provider', provider);
  }

  /**
   * Get OpenAI secrets
   */
  public async getOpenAiSecrets(): Promise<OpenAiSecrets | null> {
    const apiKey = await this.secrets.get('ripp.openai.apiKey');
    if (!apiKey) {
      return null;
    }
    return { apiKey };
  }

  /**
   * Store OpenAI secrets
   */
  public async setOpenAiSecrets(secrets: OpenAiSecrets): Promise<void> {
    await this.setProvider('openai');
    await this.secrets.store('ripp.openai.apiKey', secrets.apiKey);
  }

  /**
   * Get Azure OpenAI secrets
   */
  public async getAzureOpenAiSecrets(): Promise<AzureOpenAiSecrets | null> {
    const endpoint = await this.secrets.get('ripp.azureOpenai.endpoint');
    const apiKey = await this.secrets.get('ripp.azureOpenai.apiKey');
    const deployment = await this.secrets.get('ripp.azureOpenai.deployment');
    const apiVersion = await this.secrets.get('ripp.azureOpenai.apiVersion');

    if (!endpoint || !apiKey || !deployment || !apiVersion) {
      return null;
    }

    return { endpoint, apiKey, deployment, apiVersion };
  }

  /**
   * Store Azure OpenAI secrets
   */
  public async setAzureOpenAiSecrets(secrets: AzureOpenAiSecrets): Promise<void> {
    await this.setProvider('azure-openai');
    await this.secrets.store('ripp.azureOpenai.endpoint', secrets.endpoint);
    await this.secrets.store('ripp.azureOpenai.apiKey', secrets.apiKey);
    await this.secrets.store('ripp.azureOpenai.deployment', secrets.deployment);
    await this.secrets.store('ripp.azureOpenai.apiVersion', secrets.apiVersion);
  }

  /**
   * Get Ollama secrets
   */
  public async getOllamaSecrets(): Promise<OllamaSecrets | null> {
    const baseUrl = await this.secrets.get('ripp.ollama.baseUrl');
    if (!baseUrl) {
      return null;
    }
    return { baseUrl };
  }

  /**
   * Store Ollama secrets
   */
  public async setOllamaSecrets(secrets: OllamaSecrets): Promise<void> {
    await this.setProvider('ollama');
    await this.secrets.store('ripp.ollama.baseUrl', secrets.baseUrl);
  }

  /**
   * Get all connection secrets
   */
  public async getConnectionSecrets(): Promise<ConnectionSecrets | null> {
    const provider = await this.getProvider();
    if (!provider) {
      return null;
    }

    const connection: ConnectionSecrets = { provider };

    if (provider === 'openai') {
      connection.openai = (await this.getOpenAiSecrets()) || undefined;
    } else if (provider === 'azure-openai') {
      connection.azureOpenai = (await this.getAzureOpenAiSecrets()) || undefined;
    } else if (provider === 'ollama') {
      connection.ollama = (await this.getOllamaSecrets()) || undefined;
    }

    return connection;
  }

  /**
   * Clear all secrets
   */
  public async clearAll(): Promise<void> {
    await this.secrets.delete('ripp.ai.provider');
    await this.secrets.delete('ripp.openai.apiKey');
    await this.secrets.delete('ripp.azureOpenai.endpoint');
    await this.secrets.delete('ripp.azureOpenai.apiKey');
    await this.secrets.delete('ripp.azureOpenai.deployment');
    await this.secrets.delete('ripp.azureOpenai.apiVersion');
    await this.secrets.delete('ripp.ollama.baseUrl');
  }

  /**
   * Get environment variables for CLI execution
   * Converts stored secrets to the env vars expected by RIPP CLI
   */
  public async getEnvironmentVariables(): Promise<NodeJS.ProcessEnv> {
    const provider = await this.getProvider();
    const env: NodeJS.ProcessEnv = {};

    if (provider === 'openai') {
      const secrets = await this.getOpenAiSecrets();
      if (secrets) {
        env.OPENAI_API_KEY = secrets.apiKey;
      }
    } else if (provider === 'azure-openai') {
      const secrets = await this.getAzureOpenAiSecrets();
      if (secrets) {
        env.AZURE_OPENAI_ENDPOINT = secrets.endpoint;
        env.AZURE_OPENAI_API_KEY = secrets.apiKey;
        env.AZURE_OPENAI_DEPLOYMENT = secrets.deployment;
        env.AZURE_OPENAI_API_VERSION = secrets.apiVersion;
      }
    } else if (provider === 'ollama') {
      const secrets = await this.getOllamaSecrets();
      if (secrets) {
        env.OLLAMA_BASE_URL = secrets.baseUrl;
      }
    }

    return env;
  }

  /**
   * Check if secrets are configured for current provider
   */
  public async hasSecrets(): Promise<boolean> {
    const provider = await this.getProvider();
    if (!provider) {
      return false;
    }

    if (provider === 'openai') {
      return (await this.getOpenAiSecrets()) !== null;
    } else if (provider === 'azure-openai') {
      return (await this.getAzureOpenAiSecrets()) !== null;
    } else if (provider === 'ollama') {
      return (await this.getOllamaSecrets()) !== null;
    }

    return false;
  }

  /**
   * Test connection by making a minimal probe request
   * This is a placeholder - actual implementation would test the provider
   */
  public async testConnection(): Promise<{ success: boolean; message: string }> {
    const provider = await this.getProvider();

    if (!provider) {
      return { success: false, message: 'No provider configured' };
    }

    const hasSecrets = await this.hasSecrets();
    if (!hasSecrets) {
      return { success: false, message: `No secrets configured for ${provider}` };
    }

    // TODO: Implement actual connection testing
    // For now, just verify secrets exist
    return { success: true, message: `Secrets configured for ${provider}` };
  }
}
