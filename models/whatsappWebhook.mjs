/**
 * Webhook para WhatsApp Business API da Meta
 * Gerencia mensagens recebidas e confirmações de envio
 */
require('dotenv').config();

class WhatsAppWebhook {
  constructor() {
    this.verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
    this.phoneNumberId = process.env.WHATSAPP_PHONE_ID;
    this.businessAccountId = process.env.WHATSAPP_BUSINESS_ACCOUNT_ID;
  }

  /**
   * Verifica a validade do webhook (validação inicial da Meta)
   */
  verifyWebhook(queryParams) {
    const mode = queryParams.get("hub.mode");
    const token = queryParams.get("hub.verify_token");
    const challenge = queryParams.get("hub.challenge");
    console.log("Verificando webhook:", { mode, token, challenge });
    if (mode === "subscribe" && token === this.verifyToken) {
      return { valid: true, challenge };
    }
    return { valid: false, challenge: null };
  }

  /**
   * Processa eventos recebidos do webhook
   */
  processWebhookEvent(body) {
    const { entry } = body;
    const events = [];

    entry.forEach((entryItem) => {
      const { changes } = entryItem;

      changes.forEach((change) => {
        const { value } = change;

        // Processa mensagens recebidas
        if (value.messages) {
          value.messages.forEach((message) => {
            events.push(this.processIncomingMessage(message, value.contacts, value.metadata));
          });
        }

        // Processa confirmações de status
        if (value.statuses) {
          value.statuses.forEach((status) => {
            events.push(this.processMessageStatus(status, value.metadata));
          });
        }

        // Processa atualização de status de conta
        if (value.account_alert) {
          events.push(this.processAccountAlert(value.account_alert));
        }
      });
    });

    return events;
  }

  /**
   * Processa mensagem recebida
   */
  processIncomingMessage(message, contacts, metadata) {
    const senderPhone = contacts[0].wa_id;
    const senderName = contacts[0].profile.name;
    const timestamp = message.timestamp;
    const messageId = message.id;

    let messageContent = {
      type: message.type,
      senderPhone,
      senderName,
      timestamp,
      messageId,
      metadata,
    };

    // Processa diferentes tipos de mensagem
    switch (message.type) {
      case "text":
        messageContent.text = message.text.body;
        break;

      case "image":
        messageContent.image = {
          id: message.image.id,
          caption: message.image.caption || null,
        };
        break;

      case "video":
        messageContent.video = {
          id: message.video.id,
          caption: message.video.caption || null,
        };
        break;

      case "audio":
        messageContent.audio = {
          id: message.audio.id,
          voice: message.audio.voice || false,
        };
        break;

      case "document":
        messageContent.document = {
          id: message.document.id,
          filename: message.document.filename,
          caption: message.document.caption || null,
        };
        break;

      case "location":
        messageContent.location = {
          latitude: message.location.latitude,
          longitude: message.location.longitude,
          name: message.location.name || null,
          address: message.location.address || null,
        };
        break;

      case "contacts":
        messageContent.contacts = message.contacts;
        break;

      case "interactive":
        messageContent.interactive = message.interactive;
        break;

      case "button":
        messageContent.button = message.button;
        break;

      case "order":
        messageContent.order = message.order;
        break;

      default:
        messageContent.raw = message;
    }

    return {
      type: "incoming_message",
      data: messageContent,
    };
  }

  /**
   * Processa confirmação de status da mensagem
   */
  processMessageStatus(status, metadata) {
    return {
      type: "message_status",
      data: {
        messageId: status.id,
        status: status.status, // sent, delivered, read, failed
        timestamp: status.timestamp,
        recipientId: status.recipient_id,
        metadata,
        errors: status.errors || null,
      },
    };
  }

  /**
   * Processa alerta de conta
   */
  processAccountAlert(alert) {
    return {
      type: "account_alert",
      data: {
        alertType: alert.alert_type,
        alertDescription: alert.alert_description,
        severity: alert.severity || "medium", // low, medium, high
      },
    };
  }

  /**
   * Valida que a solicitação é realmente da Meta
   */
  validateSignature(body, signature, appSecret) {
    const crypto = require("crypto");
    const hash = crypto
      .createHmac("sha256", appSecret)
      .update(body)
      .digest("hex");

    return hash === signature;
  }

  /**
   * Formata resposta para envio de mensagem
   */
  formatMessageResponse(phoneNumber, message, messageType = "text") {
    const payload = {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneNumber,
      type: messageType,
    };

    switch (messageType) {
      case "text":
        payload.text = { body: message };
        break;

      case "template":
        payload.template = message;
        break;

      case "interactive":
        payload.interactive = message;
        break;

      case "image":
        payload.image = message;
        break;

      case "document":
        payload.document = message;
        break;

      case "video":
        payload.video = message;
        break;

      case "audio":
        payload.audio = message;
        break;

      default:
        payload.text = { body: message };
    }

    return payload;
  }

  /**
   * Formata mensagem de template
   */
  formatTemplateMessage(phoneNumber, templateName, languageCode = "pt_BR", parameters = []) {
    return {
      messaging_product: "whatsapp",
      to: phoneNumber,
      type: "template",
      template: {
        name: templateName,
        language: {
          code: languageCode,
        },
        parameters: parameters.length > 0 ? { body: { parameters } } : undefined,
      },
    };
  }

  /**
   * Formata mensagem interativa com botões
   */
  formatInteractiveMessage(phoneNumber, message, buttons, headerType = "text") {
    return {
      messaging_product: "whatsapp",
      recipient_type: "individual",
      to: phoneNumber,
      type: "interactive",
      interactive: {
        type: "button",
        body: {
          text: message,
        },
        action: {
          buttons: buttons,
        },
        header: headerType === "text" ? { type: "text", text: "Menu" } : undefined,
      },
    };
  }

  /**
   * Extrai informações do webhook payload
   */
  extractWebhookInfo(body) {
    if (!body.entry || !body.entry[0] || !body.entry[0].changes) {
      return null;
    }

    const change = body.entry[0].changes[0];
    const value = change.value;

    return {
      phoneNumberId: value.metadata?.phone_number_id,
      businessAccountId: value.metadata?.display_phone_number,
      timestamp: value.metadata?.timestamp,
      messages: value.messages || [],
      statuses: value.statuses || [],
      contacts: value.contacts || [],
    };
  }

  /**
   * Valida mensagem recebida
   */
  validateMessage(message) {
    if (!message || !message.id) {
      return { valid: false, error: "ID da mensagem não encontrado" };
    }

    if (!message.type) {
      return { valid: false, error: "Tipo de mensagem não encontrado" };
    }

    if (!message.timestamp) {
      return { valid: false, error: "Timestamp não encontrado" };
    }

    return { valid: true, error: null };
  }
}

export default WhatsAppWebhook;
