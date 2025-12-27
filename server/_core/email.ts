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
  whatsappSecretaria?: string;
  email?: string;
  precoConsulta?: string;
  valorParticular?: string;
  valorAssinanteVital?: string;
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
          
          ${dados.whatsappSecretaria ? `
          <div class="field">
            <div class="field-label">WhatsApp ${dados.tipoCredenciado === "medico" ? "da Secretária" : "Comercial"}:</div>
            <div class="field-value">${dados.whatsappSecretaria}</div>
          </div>
          ` : ''}
          
          ${dados.email ? `
          <div class="field">
            <div class="field-label">E-mail:</div>
            <div class="field-value">${dados.email}</div>
          </div>
          ` : ''}
          
          ${dados.valorParticular ? `
          <div class="field">
            <div class="field-label">Valor Particular:</div>
            <div class="field-value">${dados.valorParticular}</div>
          </div>
          ` : ''}
          
          ${dados.valorAssinanteVital ? `
          <div class="field">
            <div class="field-label">Valor Assinante Vital:</div>
            <div class="field-value">${dados.valorAssinanteVital}</div>
          </div>
          ` : ''}
          
          ${dados.precoConsulta ? `
          <div class="field">
            <div class="field-label">Preço da Consulta/Serviço (legado):</div>
            <div class="field-value">${dados.precoConsulta}</div>
          </div>
          ` : ''}
          
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
    to: 'comercial@suasaudevital.com.br',
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
    to: 'comercial@suasaudevital.com.br',
    subject: `Sugestão de Parceiro - ${dados.nomeParceiro}`,
    html,
  });
}

/**
 * Envia e-mail de boas-vindas com credenciais para novo usuário autorizado
 */
export async function enviarEmailNovoUsuario(dados: {
  nome: string;
  email: string;
  senha: string;
  nivelAcesso: "admin" | "visualizador";
}) {
  const urlAcesso = dados.nivelAcesso === "admin" 
    ? "https://credenciados.suasaudevital.com.br/admin"
    : "https://credenciados.suasaudevital.com.br/dados-internos";

  const descricaoAcesso = dados.nivelAcesso === "admin"
    ? "Acesso total ao painel administrativo"
    : "Acesso à área de dados internos com informações de descontos";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1e9d9f; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .credentials-box { background-color: white; border: 2px solid #1e9d9f; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .field { margin: 15px 0; }
        .field-label { font-weight: bold; color: #1e9d9f; }
        .field-value { margin-top: 5px; font-size: 16px; background-color: #f0f0f0; padding: 10px; border-radius: 4px; font-family: monospace; }
        .button { display: inline-block; background-color: #1e9d9f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Bem-vindo à Sua Saúde Vital!</h1>
          <p>Suas credenciais de acesso</p>
        </div>
        
        <div class="content">
          <p>Olá <strong>${dados.nome}</strong>,</p>
          
          <p>Você foi cadastrado como usuário autorizado no sistema de gestão de credenciados da Sua Saúde Vital.</p>
          
          <div class="credentials-box">
            <h3 style="color: #1e9d9f; margin-top: 0;">📋 Suas Credenciais de Acesso</h3>
            
            <div class="field">
              <div class="field-label">Email de acesso:</div>
              <div class="field-value">${dados.email}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Senha temporária:</div>
              <div class="field-value">${dados.senha}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Nível de acesso:</div>
              <div class="field-value">${dados.nivelAcesso === "admin" ? "👑 Administrador" : "👁️ Visualizador"}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Permissões:</div>
              <div class="field-value">${descricaoAcesso}</div>
            </div>
          </div>
          
          <div class="warning">
            <strong>⚠️ Importante:</strong> Por segurança, recomendamos que você altere sua senha após o primeiro acesso. Entre em contato com o administrador caso precise de assistência.
          </div>
          
          <div style="text-align: center;">
            <a href="${urlAcesso}" class="button">Acessar Sistema</a>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            <strong>Link de acesso:</strong><br>
            <a href="${urlAcesso}" style="color: #1e9d9f;">${urlAcesso}</a>
          </p>
        </div>
        
        <div class="footer">
          <p>© 2025 Sua Saúde Vital - Sistema de Gestão de Credenciados</p>
          <p>Este é um e-mail automático, por favor não responda.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: dados.email,
    subject: '🎉 Bem-vindo à Sua Saúde Vital - Suas Credenciais de Acesso',
    html,
  });
}

/**
 * Envia e-mail de notificação de senha resetada
 */
export async function enviarEmailSenhaResetada(dados: {
  nome: string;
  email: string;
  novaSenha: string;
  nivelAcesso: "admin" | "visualizador";
}) {
  const urlAcesso = dados.nivelAcesso === "admin" 
    ? "https://credenciados.suasaudevital.com.br/admin"
    : "https://credenciados.suasaudevital.com.br/dados-internos";

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background-color: #1e9d9f; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .credentials-box { background-color: white; border: 2px solid #1e9d9f; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .field { margin: 15px 0; }
        .field-label { font-weight: bold; color: #1e9d9f; }
        .field-value { margin-top: 5px; font-size: 16px; background-color: #f0f0f0; padding: 10px; border-radius: 4px; font-family: monospace; }
        .button { display: inline-block; background-color: #1e9d9f; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        .warning { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Senha Resetada</h1>
          <p>Sua Saúde Vital</p>
        </div>
        
        <div class="content">
          <p>Olá <strong>${dados.nome}</strong>,</p>
          
          <p>Sua senha foi resetada pelo administrador do sistema. Abaixo estão suas novas credenciais de acesso:</p>
          
          <div class="credentials-box">
            <h3 style="color: #1e9d9f; margin-top: 0;">🔑 Nova Senha de Acesso</h3>
            
            <div class="field">
              <div class="field-label">Email de acesso:</div>
              <div class="field-value">${dados.email}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Nova senha:</div>
              <div class="field-value">${dados.novaSenha}</div>
            </div>
          </div>
          
          <div class="warning">
            <strong>⚠️ Importante:</strong> Por segurança, recomendamos que você altere sua senha após fazer login. Se você não solicitou esta alteração, entre em contato com o administrador imediatamente.
          </div>
          
          <div style="text-align: center;">
            <a href="${urlAcesso}" class="button">Acessar Sistema</a>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            <strong>Link de acesso:</strong><br>
            <a href="${urlAcesso}" style="color: #1e9d9f;">${urlAcesso}</a>
          </p>
        </div>
        
        <div class="footer">
          <p>© 2025 Sua Saúde Vital - Sistema de Gestão de Credenciados</p>
          <p>Este é um e-mail automático, por favor não responda.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: dados.email,
    subject: '🔐 Sua senha foi resetada - Sua Saúde Vital',
    html,
  });
}
