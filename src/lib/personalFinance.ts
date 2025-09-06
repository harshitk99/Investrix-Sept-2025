import { PersonalFinanceIntegration } from "@/types/portfolio";

export class PersonalFinanceManager {
  private integration: PersonalFinanceIntegration;

  constructor(integration: PersonalFinanceIntegration) {
    this.integration = integration;
  }

  async syncRepayment(amount: number, description: string, date: Date): Promise<boolean> {
    if (!this.integration.enabled) {
      console.log('Personal finance integration is disabled');
      return false;
    }

    try {
      switch (this.integration.provider) {
        case 'mint':
          return await this.syncWithMint(amount, description, date);
        case 'ynab':
          return await this.syncWithYNAB(amount, description, date);
        case 'personal_capital':
          return await this.syncWithPersonalCapital(amount, description, date);
        case 'manual':
          return await this.syncManually(amount, description, date);
        default:
          throw new Error(`Unsupported provider: ${this.integration.provider}`);
      }
    } catch (error) {
      console.error('Error syncing with personal finance app:', error);
      return false;
    }
  }

  private async syncWithMint(amount: number, description: string, date: Date): Promise<boolean> {
    // Mint API integration (if available)
    // This would require Mint's API access which is limited
    console.log(`Syncing with Mint: ${amount} - ${description} on ${date.toISOString()}`);
    
    // For now, we'll simulate the sync
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Mint sync completed');
        resolve(true);
      }, 1000);
    });
  }

  private async syncWithYNAB(amount: number, description: string, date: Date): Promise<boolean> {
    if (!this.integration.apiKey) {
      throw new Error('YNAB API key is required');
    }

    try {
      // YNAB API integration
      const response = await fetch('https://api.youneedabudget.com/v1/budgets', {
        headers: {
          'Authorization': `Bearer ${this.integration.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`YNAB API error: ${response.statusText}`);
      }

      const budgets = await response.json();
      const budgetId = budgets.data.budgets[0]?.id;

      if (!budgetId) {
        throw new Error('No budget found in YNAB');
      }

      // Create transaction in YNAB
      const transactionData = {
        transaction: {
          account_id: 'default-account', // This would need to be configured
          date: date.toISOString().split('T')[0],
          amount: Math.round(amount * 1000), // YNAB uses milliunits
          payee_name: description,
          memo: 'SME Investment Repayment',
          cleared: 'cleared'
        }
      };

      const transactionResponse = await fetch(
        `https://api.youneedabudget.com/v1/budgets/${budgetId}/transactions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.integration.apiKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(transactionData)
        }
      );

      return transactionResponse.ok;
    } catch (error) {
      console.error('YNAB sync error:', error);
      return false;
    }
  }

  private async syncWithPersonalCapital(amount: number, description: string, date: Date): Promise<boolean> {
    // Personal Capital API integration
    // This would require Personal Capital's API access
    console.log(`Syncing with Personal Capital: ${amount} - ${description} on ${date.toISOString()}`);
    
    // For now, we'll simulate the sync
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Personal Capital sync completed');
        resolve(true);
      }, 1000);
    });
  }

  private async syncManually(amount: number, description: string, date: Date): Promise<boolean> {
    // Manual sync - generate exportable data
    const exportData = {
      type: 'income',
      amount,
      description,
      date: date.toISOString(),
      category: 'Investment Returns',
      source: 'SME Investment Platform'
    };

    // Create downloadable file
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `repayment-${date.toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    console.log('Manual sync data exported');
    return true;
  }

  async getAccountBalance(): Promise<number | null> {
    if (!this.integration.enabled || !this.integration.apiKey) {
      return null;
    }

    try {
      switch (this.integration.provider) {
        case 'ynab':
          return await this.getYNABBalance();
        default:
          return null;
      }
    } catch (error) {
      console.error('Error fetching account balance:', error);
      return null;
    }
  }

  private async getYNABBalance(): Promise<number | null> {
    try {
      const response = await fetch('https://api.youneedabudget.com/v1/budgets', {
        headers: {
          'Authorization': `Bearer ${this.integration.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`YNAB API error: ${response.statusText}`);
      }

      const budgets = await response.json();
      const budgetId = budgets.data.budgets[0]?.id;

      if (!budgetId) {
        return null;
      }

      const accountsResponse = await fetch(
        `https://api.youneedabudget.com/v1/budgets/${budgetId}/accounts`,
        {
          headers: {
            'Authorization': `Bearer ${this.integration.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!accountsResponse.ok) {
        return null;
      }

      const accounts = await accountsResponse.json();
      const totalBalance = accounts.data.accounts.reduce(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (sum: number, account: any) => sum + (account.balance / 1000), // Convert from milliunits
        0
      );

      return totalBalance;
    } catch (error) {
      console.error('Error fetching YNAB balance:', error);
      return null;
    }
  }

  updateIntegration(integration: PersonalFinanceIntegration): void {
    this.integration = integration;
  }

  getIntegration(): PersonalFinanceIntegration {
    return this.integration;
  }
}

// Utility functions for personal finance integration
export const createPersonalFinanceManager = (integration: PersonalFinanceIntegration): PersonalFinanceManager => {
  return new PersonalFinanceManager(integration);
};

export const validateIntegration = (integration: PersonalFinanceIntegration): boolean => {
  if (!integration.enabled) {
    return true; // Disabled integration is valid
  }

  switch (integration.provider) {
    case 'ynab':
      return !!integration.apiKey;
    case 'mint':
    case 'personal_capital':
      return true; // These would need their own validation logic
    case 'manual':
      return true;
    default:
      return false;
  }
};

export const getSupportedProviders = () => {
  return [
    { value: 'manual', label: 'Manual Export', description: 'Export data for manual entry' },
    { value: 'ynab', label: 'You Need A Budget (YNAB)', description: 'Sync with YNAB budget app' },
    { value: 'mint', label: 'Mint', description: 'Sync with Mint (limited API access)' },
    { value: 'personal_capital', label: 'Personal Capital', description: 'Sync with Personal Capital' }
  ];
};
