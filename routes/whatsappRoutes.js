/**
 * Rotas para WhatsApp Business API webhook
 */

import { Router } from "express";
const router = Router();
import WhatsAppController from "../controllers/whatsappController";

const whatsappController = new WhatsAppController();

/**
 * GET /webhook/whatsapp
 * Verifica a validade do webhook (desafio de verificação da Meta)
 */
router.get("/whatsapp", (req, res) => {
  whatsappController.verifyWebhook(req, res);
});

/**
 * POST /webhook/whatsapp
 * Processa eventos recebidos do webhook
 */
router.post("/whatsapp", async (req, res) => {
  await whatsappController.handleWebhookEvent(req, res);
});

/**
 * POST /webhook/whatsapp/send-message
 * Envia uma mensagem de texto
 * Body: { phoneNumber: "55...", message: "..." }
 */
router.post("/whatsapp/send-message", async (req, res) => {
  try {
    const { phoneNumber, message } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({
        error: "phoneNumber e message são obrigatórios",
      });
    }

    const result = await whatsappController.sendMessage(phoneNumber, message);

    if (result) {
      return res.status(200).json({
        success: true,
        data: result,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: "Erro ao enviar mensagem",
      });
    }
  } catch (error) {
    console.error("Erro na rota de envio:", error);
    return res.status(500).json({
      error: error.message,
    });
  }
});

/**
 * POST /webhook/whatsapp/send-template
 * Envia uma mensagem de template
 * Body: { phoneNumber: "55...", templateName: "...", parameters: [...] }
 */
router.post("/whatsapp/send-template", async (req, res) => {
  try {
    const { phoneNumber, templateName, parameters } = req.body;

    if (!phoneNumber || !templateName) {
      return res.status(400).json({
        error: "phoneNumber e templateName são obrigatórios",
      });
    }

    const result = await whatsappController.sendTemplateMessage(
      phoneNumber,
      templateName,
      parameters || []
    );

    if (result) {
      return res.status(200).json({
        success: true,
        data: result,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: "Erro ao enviar template",
      });
    }
  } catch (error) {
    console.error("Erro na rota de envio de template:", error);
    return res.status(500).json({
      error: error.message,
    });
  }
});

/**
 * POST /webhook/whatsapp/send-interactive
 * Envia uma mensagem interativa com botões
 * Body: { phoneNumber: "55...", message: "...", buttons: [...] }
 */
router.post("/whatsapp/send-interactive", async (req, res) => {
  try {
    const { phoneNumber, message, buttons } = req.body;

    if (!phoneNumber || !message || !buttons) {
      return res.status(400).json({
        error: "phoneNumber, message e buttons são obrigatórios",
      });
    }

    const result = await whatsappController.sendInteractiveMessage(
      phoneNumber,
      message,
      buttons
    );

    if (result) {
      return res.status(200).json({
        success: true,
        data: result,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: "Erro ao enviar mensagem interativa",
      });
    }
  } catch (error) {
    console.error("Erro na rota de envio interativo:", error);
    return res.status(500).json({
      error: error.message,
    });
  }
});

/**
 * POST /webhook/whatsapp/mark-as-read
 * Marca uma mensagem como lida
 * Body: { messageId: "..." }
 */
router.post("/whatsapp/mark-as-read", async (req, res) => {
  try {
    const { messageId } = req.body;

    if (!messageId) {
      return res.status(400).json({
        error: "messageId é obrigatório",
      });
    }

    const result = await whatsappController.markAsRead(messageId);

    if (result) {
      return res.status(200).json({
        success: true,
        message: "Mensagem marcada como lida",
      });
    } else {
      return res.status(500).json({
        success: false,
        error: "Erro ao marcar mensagem como lida",
      });
    }
  } catch (error) {
    console.error("Erro ao marcar como lida:", error);
    return res.status(500).json({
      error: error.message,
    });
  }
});

/**
 * GET /webhook/whatsapp/message/:messageId
 * Obtém informações de uma mensagem
 */
router.get("/whatsapp/message/:messageId", async (req, res) => {
  try {
    const { messageId } = req.params;

    if (!messageId) {
      return res.status(400).json({
        error: "messageId é obrigatório",
      });
    }

    const result = await whatsappController.getMessageInfo(messageId);

    if (result) {
      return res.status(200).json({
        success: true,
        data: result,
      });
    } else {
      return res.status(500).json({
        success: false,
        error: "Erro ao obter informações da mensagem",
      });
    }
  } catch (error) {
    console.error("Erro ao obter informações:", error);
    return res.status(500).json({
      error: error.message,
    });
  }
});

export default router;
