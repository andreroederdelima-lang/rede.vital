/**
 * Helper para envio de e-mails
 * Usa a API de notificação do Manus para enviar e-mails
 */

import { ENV } from './env';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Usar API de notificação do Manus para enviar e-mail
    const response = await fetch(`${ENV.forgeApiUrl}/notification/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ENV.forgeApiKey}`,
      },
      body: JSON.stringify({
        to: options.to,
        subject: options.subject,
        html: options.html,
      }),
    });

    if (!response.ok) {
      console.error('[Email] Failed to send email:', await response.text());
      return false;
    }

    return true;
  } catch (error) {
    console.error('[Email] Error sending email:', error);
    return false;
  }
}

/**
 * Envia e-mail de notificação de nova solicitação de parceria
 */
export async function enviarEmailNovaParceria(dados: {
  tipoCredenciado: "medico" | "instituicao";
  nomeResponsavel: string;
  nomeEstabelecimento: string;
  categoria: string;
  especialidade?: string;
  areaAtuacao?: string;
  endereco: string;
  cidade: string;
  telefone: string;
  descontoPercentual: number;
  imagemUrl?: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2d7a7a; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .field { margin: 15px 0; }
        .field-label { font-weight: bold; color: #2d7a7a; }
        .field-value { margin-top: 5px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .image { max-width: 300px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Nova Solicitação de Parceria</h1>
          <p>Sua Saúde Vital</p>
        </div>
        
        <div class="content">
          <p>Uma nova solicitação de parceria foi recebida através do site:</p>
          
          <div class="field">
            <div class="field-label">Nome do Responsável:</div>
            <div class="field-value">${dados.nomeResponsavel}</div>
          </div>
          
          <div class="field">
            <div class="field-label">Nome do Estabelecimento:</div>
            <div class="field-value">${dados.nomeEstabelecimento}</div>
          </div>
          
          <div class="field">
            <div class="field-label">Tipo de Credenciado:</div>
            <div class="field-value">${dados.tipoCredenciado === "medico" ? "Médico" : "Instituição"}</div>
          </div>
          
          <div class="field">
            <div class="field-label">Categoria:</div>
            <div class="field-value">${dados.categoria}</div>
          </div>
          
          ${dados.tipoCredenciado === "medico" && dados.especialidade ? `
          <div class="field">
            <div class="field-label">Especialidade:</div>
            <div class="field-value">${dados.especialidade}</div>
          </div>
          ` : ''}
          
          ${dados.tipoCredenciado === "medico" && dados.areaAtuacao ? `
          <div class="field">
            <div class="field-label">Principal Área de Atuação:</div>
            <div class="field-value">${dados.areaAtuacao}</div>
          </div>
          ` : ''}
          
          <div class="field">
            <div class="field-label">Endereço:</div>
            <div class="field-value">${dados.endereco}</div>
          </div>
          
          <div class="field">
            <div class="field-label">Cidade:</div>
            <div class="field-value">${dados.cidade}</div>
          </div>
          
          <div class="field">
            <div class="field-label">Telefone:</div>
            <div class="field-value">${dados.telefone}</div>
          </div>
          
          <div class="field">
            <div class="field-label">Desconto Oferecido:</div>
            <div class="field-value">${dados.descontoPercentual}%</div>
          </div>
          
          ${dados.imagemUrl ? `
          <div class="field">
            <div class="field-label">Imagem do Estabelecimento:</div>
            <div class="field-value">
              <img src="${dados.imagemUrl}" alt="Imagem do estabelecimento" class="image" />
            </div>
          </div>
          ` : ''}
          
          <p style="margin-top: 30px;">
            <strong>Acesse o painel administrativo para aprovar ou rejeitar esta solicitação.</strong>
          </p>
        </div>
        
        <div class="footer">
          <p>© 2025 Sua Saúde Vital - Sistema de Gestão de Credenciados</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: 'administrativo@suasaudevital.com.br',
    subject: `Nova Solicitação de Parceria - ${dados.nomeEstabelecimento}`,
    html,
  });
}

/**
 * Envia e-mail com sugestão de parceiro feita por paciente
 */
export async function enviarEmailSugestaoParceiro(dados: {
  nomeParceiro: string;
  especialidade: string;
  municipio: string;
}) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #2d7a7a; color: white; padding: 20px; text-align: center; }
        .content { background-color: #f9f9f9; padding: 20px; }
        .field { margin: 15px 0; }
        .field-label { font-weight: bold; color: #2d7a7a; }
        .field-value { margin-top: 5px; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Sugestão de Novo Parceiro</h1>
          <p>Sua Saúde Vital</p>
        </div>
        
        <div class="content">
          <p>Um paciente sugeriu um novo parceiro para a rede credenciada Vital:</p>
          
          <div class="field">
            <div class="field-label">Nome do Parceiro Sugerido:</div>
            <div class="field-value">${dados.nomeParceiro}</div>
          </div>
          
          <div class="field">
            <div class="field-label">Especialidade/Categoria:</div>
            <div class="field-value">${dados.especialidade}</div>
          </div>
          
          <div class="field">
            <div class="field-label">Município:</div>
            <div class="field-value">${dados.municipio}</div>
          </div>
          
          <p style="margin-top: 30px;">
            <strong>Entre em contato com o parceiro sugerido para avaliar possível parceria.</strong>
          </p>
        </div>
        
        <div class="footer">
          <p>© 2025 Sua Saúde Vital - Sistema de Gestão de Credenciados</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: 'administrativo@suasaudevital.com.br',
    subject: `Sugestão de Parceiro - ${dados.nomeParceiro}`,
    html,
  });
}
