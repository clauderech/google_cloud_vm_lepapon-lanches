/**
 * Controller para gerenciar webhooks do WhatsApp Business API
 */

const WhatsAppWebhook = require("../models/whatsappWebhook");

class WhatsAppController {
  constructor() {
    this.webhook = new WhatsAppWebhook();
  }

  /**
   * Verifica a validade do webhook (GET)
   * Responde ao desafio de verificação da Meta
   */
  verifyWebhook(req, res) {
    try {
      const queryParams = new URLSearchParams(req.url.split("?")[1]);
      const result = this.webhook.verifyWebhook(queryParams);

      if (result.valid) {
        console.log("✅ Webhook verificado com sucesso");
        return res.status(200).send(result.challenge);
      }

      console.error("❌ Falha na verificação do webhook - Token inválido");
      return res.status(403).json({ error: "Token de verificação inválido" });
    } catch (error) {
      console.error("Erro ao verificar webhook:", error);
      return res.status(500).json({ error: "Erro ao verificar webhook" });
    }
  }

  /**
   * Processa eventos do webhook (POST)
   */
  async handleWebhookEvent(req, res) {
    try {
      // Validação inicial da resposta
      res.status(200).json({ success: true });

      const body = req.body;

      // Validar se é um objeto válido
      if (!body || !body.entry) {
        console.error("Payload inválido recebido");
        return;
      }

      // Extrair informações do webhook
      const webhookInfo = this.webhook.extractWebhookInfo(body);
      console.log("📨 Webhook recebido:", webhookInfo);

      // Processar eventos
      const events = this.webhook.processWebhookEvent(body);

      // Iterar sobre os eventos
      for (const event of events) {
        if (event.type === "incoming_message") {
          await this.handleIncomingMessage(event.data);
        } else if (event.type === "message_status") {
          await this.handleMessageStatus(event.data);
        } else if (event.type === "account_alert") {
          await this.handleAccountAlert(event.data);
        }
      }
    } catch (error) {
      console.error("Erro ao processar webhook:", error);
    }
  }

  /**
   * Manipula mensagens recebidas
   */
  async handleIncomingMessage(messageData) {
    try {
      console.log(`📬 Mensagem recebida de ${messageData.senderName} (${messageData.senderPhone})`);
      console.log(`   Tipo: ${messageData.type}`);
      console.log(`   ID: ${messageData.messageId}`);

      // Aqui você pode adicionar lógica para processar mensagens
      // Exemplos:

      // 1. Salvar mensagem em banco de dados
      // await saveMessageToDatabase(messageData);

      // 2. Processar diferentes tipos de mensagem
      switch (messageData.type) {
        case "text":
          await this.processTextMessage(messageData);
          break;

        case "image":
        case "video":
        case "audio":
        case "document":
          await this.processMediaMessage(messageData);
          break;

        case "location":
          await this.processLocationMessage(messageData);
          break;

        case "interactive":
          await this.processInteractiveMessage(messageData);
          break;

        case "button":
          await this.processButtonMessage(messageData);
          break;

        default:
          console.log("Tipo de mensagem não tratado:", messageData.type);
      }
    } catch (error) {
      console.error("Erro ao processar mensagem recebida:", error);
    }
  }

  /**
   * Processa mensagens de texto
   */
  async processTextMessage(messageData) {
    const { senderPhone, senderName, text } = messageData;

    console.log(`💬 Texto: "${text}"`);

    // Aqui você pode adicionar lógica de processamento de texto
    // Exemplos: NLP, buscar informações, gerar resposta automática, etc.

    // Exemplo de resposta automática
    const response = this.generateAutoResponse(text);
    if (response) {
      await this.sendMessage(senderPhone, response);
    }
  }

  /**
   * Processa mensagens com mídia
   */
  async processMediaMessage(messageData) {
    const { senderPhone, senderName, type, [type]: mediaData } = messageData;

    console.log(`📁 Mídia recebida (${type}):`, mediaData);

    // Aqui você pode fazer download ou processar a mídia
    // Exemplo: salvar em cloud storage, processar imagem, transcrever áudio, etc.
  }

  /**
   * Processa mensagens de localização
   */
  async processLocationMessage(messageData) {
    const { senderPhone, location } = messageData;

    console.log(`📍 Localização: ${location.latitude}, ${location.longitude}`);

    // Aqui você pode processar localização
    // Exemplo: calcular distância, buscar lojas próximas, etc.
  }

  /**
   * Processa mensagens interativas
   */
  async processInteractiveMessage(messageData) {
    const { senderPhone, interactive } = messageData;

    console.log("🔘 Mensagem interativa recebida:", interactive);

    // Processar resposta do usuário à mensagem interativa
  }

  /**
   * Processa cliques em botões
   */
  async processButtonMessage(messageData) {
    const { senderPhone, button } = messageData;

    console.log("📲 Botão pressionado:", button);

    // Processar ação do botão
  }

  /**
   * Manipula atualizações de status
   */
  async handleMessageStatus(statusData) {
    try {
      const { messageId, status, timestamp, errors } = statusData;

      console.log(`📊 Status da mensagem ${messageId}: ${status}`);

      if (errors) {
        console.error("   Erros:", errors);
      }

      // Aqui você pode atualizar o status da mensagem no banco de dados
      // await updateMessageStatus(messageId, status, timestamp);
    } catch (error) {
      console.error("Erro ao processar status da mensagem:", error);
    }
  }

  /**
   * Manipula alertas de conta
   */
  async handleAccountAlert(alertData) {
    try {
      const { alertType, alertDescription, severity } = alertData;

      console.log(`⚠️  Alerta de conta (${severity}): ${alertType}`);
      console.log(`    ${alertDescription}`);

      // Aqui você pode notificar administradores ou tomar ações
      // await notifyAdmin(alertData);
    } catch (error) {
      console.error("Erro ao processar alerta de conta:", error);
    }
  }

  /**
   * Gera resposta automática para texto
   */
  generateAutoResponse(text) {
    const lowerText = text.toLowerCase().trim();

    // Exemplos de respostas automáticas
    const responses = {
      oi: "Olá! 👋 Como posso ajudá-lo?",
      ola: "Olá! 👋 Como posso ajudá-lo?",
      oii: "Olá! 👋 Como posso ajudá-lo?",
      oj: "Olá! 👋 Como posso ajudá-lo?",
      menu: "Aqui está nosso menu:\n1. Produtos\n2. Atendimento\n3. Localização",
      ajuda: "Como posso ajudá-lo?\n\n1. Dúvida sobre produtos\n2. Realizar pedido\n3. Falar com atendente",
    };

    // Verificar se há resposta exata
    if (responses[lowerText]) {
      return responses[lowerText];
    }

    // Verificar respostas parciais
    if (lowerText.includes("oi") || lowerText.includes("olá")) {
      return "Olá! 👋 Como posso ajudá-lo?";
    }

    return null; // Sem resposta automática
  }

  /**
   * Envia mensagem de texto
   */
  async sendMessage(phoneNumber, message) {
    try {
      const payload = this.webhook.formatMessageResponse(phoneNumber, message, "text");
      const response = await this.sendToWhatsApp(payload);

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Mensagem enviada para ${phoneNumber}:`, data);
        return data;
      } else {
        console.error(`❌ Erro ao enviar mensagem para ${phoneNumber}:`, response.status);
        return null;
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
      return null;
    }
  }

  /**
   * Envia mensagem de template
   */
  async sendTemplateMessage(phoneNumber, templateName, parameters = []) {
    try {
      const payload = this.webhook.formatTemplateMessage(phoneNumber, templateName, "pt_BR", parameters);
      const response = await this.sendToWhatsApp(payload);

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Template enviado para ${phoneNumber}:`, data);
        return data;
      } else {
        console.error(`❌ Erro ao enviar template para ${phoneNumber}:`, response.status);
        return null;
      }
    } catch (error) {
      console.error("Erro ao enviar template:", error);
      return null;
    }
  }

  /**
   * Envia mensagem interativa com botões
   */
  async sendInteractiveMessage(phoneNumber, message, buttons) {
    try {
      const payload = this.webhook.formatInteractiveMessage(phoneNumber, message, buttons);
      const response = await this.sendToWhatsApp(payload);

      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Mensagem interativa enviada para ${phoneNumber}:`, data);
        return data;
      } else {
        console.error(`❌ Erro ao enviar mensagem interativa para ${phoneNumber}:`, response.status);
        return null;
      }
    } catch (error) {
      console.error("Erro ao enviar mensagem interativa:", error);
      return null;
    }
  }

  /**
   * Envia requisição para API do WhatsApp
   */
  async sendToWhatsApp(payload) {
    const phoneNumberId = process.env.WHATSAPP_PHONE_ID;
    const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

    if (!phoneNumberId || !accessToken) {
      throw new Error("Credenciais do WhatsApp não configuradas");
    }

    const url = `https://graph.instagram.com/v18.0/${phoneNumberId}/messages`;

    return fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  }

  /**
   * Obtém informações de uma mensagem
   */
  async getMessageInfo(messageId) {
    try {
      const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;

      if (!accessToken) {
        throw new Error("Token de acesso não configurado");
      }

      const url = `https://graph.instagram.com/v18.0/${messageId}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return data;
      } else {
        console.error("Erro ao obter informações da mensagem:", response.status);
        return null;
      }
    } catch (error) {
      console.error("Erro ao obter informações da mensagem:", error);
      return null;
    }
  }

  /**
   * Marca mensagem como lida
   */
  async markAsRead(messageId) {
    try {
      const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
      const phoneNumberId = process.env.WHATSAPP_PHONE_ID;

      if (!accessToken || !phoneNumberId) {
        throw new Error("Credenciais do WhatsApp não configuradas");
      }

      const url = `https://graph.instagram.com/v18.0/${phoneNumberId}/messages`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          status: "read",
          message_id: messageId,
        }),
      });

      if (response.ok) {
        console.log(`✅ Mensagem ${messageId} marcada como lida`);
        return true;
      } else {
        console.error("Erro ao marcar mensagem como lida:", response.status);
        return false;
      }
    } catch (error) {
      console.error("Erro ao marcar mensagem como lida:", error);
      return false;
    }
  }
}

module.exports = WhatsAppController;
