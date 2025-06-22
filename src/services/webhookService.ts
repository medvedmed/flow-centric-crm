
const WEBHOOK_URL = 'https://medvedg.app.n8n.cloud/webhook-test/crm';

export interface WebhookData {
  event: string;
  timestamp: string;
  source: string;
  data: any;
}

class WebhookService {
  private async sendWebhook(data: WebhookData): Promise<boolean> {
    try {
      console.log('Sending webhook to n8n:', WEBHOOK_URL, data);
      
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify(data),
      });

      // Since we're using no-cors, we can't check response status
      // We'll assume success if no error is thrown
      console.log('Webhook sent successfully');
      return true;
    } catch (error) {
      console.error('Webhook failed:', error);
      return false;
    }
  }

  async clientCreated(client: any): Promise<boolean> {
    return this.sendWebhook({
      event: 'client_created',
      timestamp: new Date().toISOString(),
      source: 'aura_salon_crm',
      data: {
        type: 'client',
        action: 'created',
        client
      }
    });
  }

  async appointmentCreated(appointment: any): Promise<boolean> {
    return this.sendWebhook({
      event: 'appointment_created',
      timestamp: new Date().toISOString(),
      source: 'aura_salon_crm',
      data: {
        type: 'appointment',
        action: 'created',
        appointment
      }
    });
  }

  async appointmentUpdated(appointment: any): Promise<boolean> {
    return this.sendWebhook({
      event: 'appointment_updated',
      timestamp: new Date().toISOString(),
      source: 'aura_salon_crm',
      data: {
        type: 'appointment',
        action: 'updated',
        appointment
      }
    });
  }

  async testWebhook(testData: any): Promise<boolean> {
    return this.sendWebhook({
      event: 'webhook_test',
      timestamp: new Date().toISOString(),
      source: 'aura_salon_crm',
      data: {
        type: 'test',
        action: 'manual_test',
        testData
      }
    });
  }
}

export const webhookService = new WebhookService();
