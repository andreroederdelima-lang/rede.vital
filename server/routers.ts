import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, publicRateLimitedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import * as email from "./_core/email";
import * as notification from "./_core/notification";
import * as uploadImageMod from "./uploadImage";
import * as storage from "./storage";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),

    // Solicitar recuperação de senha
    solicitarRecuperacao: publicProcedure
      .input(z.object({ email: z.string().email() }))
      .mutation(async ({ input }) => {
        const { solicitarRecuperacaoSenha } = db;
        return await solicitarRecuperacaoSenha(input.email);
      }),

    // Validar token de recuperação
    validarToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const { validarTokenRecuperacao } = db;
        return await validarTokenRecuperacao(input.token);
      }),

    // Redefinir senha com token
    redefinirSenha: publicProcedure
      .input(z.object({
        token: z.string(),
        novaSenha: z.string().min(6),
      }))
      .mutation(async ({ input }) => {
        const { redefinirSenhaComToken } = db;
        return await redefinirSenhaComToken(input.token, input.novaSenha);
      }),
  }),

  medicos: router({
    listar: publicProcedure
      .input(z.object({
        busca: z.string().optional(),
        especialidade: z.string().optional(),
        municipio: z.string().optional(),
        descontoMinimo: z.number().optional(),
        page: z.number().int().min(1).optional().default(1),
        limit: z.number().int().min(1).max(200).optional().default(50),
      }).optional())
      .query(async ({ input }) => {
        const { listarMedicos } = db;
        return listarMedicos(input);
      }),
    
    listarEspecialidades: publicProcedure.query(async () => {
      const { listarEspecialidades } = db;
      return listarEspecialidades();
    }),

    obter: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const { obterMedicoPorId } = db;
        return obterMedicoPorId(input);
      }),

    criar: protectedProcedure
      .input(z.object({
        nome: z.string(),
        especialidade: z.string(),
        numeroRegistroConselho: z.string().optional(),
        subespecialidade: z.string().optional(),
        areaAtuacao: z.string().optional(),
        municipio: z.string(),
        endereco: z.string(),
        telefone: z.string().optional(),
        whatsapp: z.string().optional(),
        whatsappSecretaria: z.string().optional(),
        tipoAtendimento: z.enum(["presencial", "telemedicina", "ambos"]).default("presencial"),
        precoConsulta: z.string().optional(),
        valorParticular: z.string().optional(),
        valorAssinanteVital: z.string().optional(),
        descontoPercentual: z.number().default(0),
        observacoes: z.string().optional(),
        contatoParceria: z.string().optional(),
        whatsappParceria: z.string().optional(),
        email: z.string().optional(),
        logoUrl: z.string().optional(),
        fotoUrl: z.string().optional(),
        ativo: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { criarMedico, dispararWebhook, obterMedicoPorId } = db;
        const medicoId = await criarMedico(input);
        
        // Buscar médico recém-criado
        const medico = await obterMedicoPorId(medicoId);
        
        // Disparar webhook
        if (medico) {
          await dispararWebhook("medico.criado", {
            id: medico.id,
            nome: medico.nome,
            especialidade: medico.especialidade,
            municipio: medico.municipio,
            timestamp: new Date().toISOString(),
          }).catch(err => console.error('Erro ao disparar webhook:', err));
        }
        
        return medicoId;
      }),

    atualizar: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          nome: z.string().optional(),
          especialidade: z.string().optional(),
          numeroRegistroConselho: z.string().optional(),
          subespecialidade: z.string().optional(),
          areaAtuacao: z.string().optional(),
          municipio: z.string().optional(),
          endereco: z.string().optional(),
          telefone: z.string().optional(),
          whatsapp: z.string().optional(),
          whatsappSecretaria: z.string().optional(),
          telefoneOrganizacao: z.string().optional(),
          tipoAtendimento: z.enum(["presencial", "telemedicina", "ambos"]).optional(),
          precoConsulta: z.string().optional(),
          valorParticular: z.string().optional(),
          valorAssinanteVital: z.string().optional(),
          descontoPercentual: z.number().optional(),
          observacoes: z.string().optional(),
          contatoParceria: z.string().optional(),
          logoUrl: z.string().optional(),
          fotoUrl: z.string().optional(),
          whatsappParceria: z.string().optional(),
          email: z.string().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        const { atualizarMedico, dispararWebhook, obterMedicoPorId } = db;
        await atualizarMedico(input.id, input.data);
        
        // Buscar médico atualizado
        const medico = await obterMedicoPorId(input.id);
        
        // Disparar webhook
        if (medico) {
          await dispararWebhook("medico.atualizado", {
            id: medico.id,
            nome: medico.nome,
            especialidade: medico.especialidade,
            municipio: medico.municipio,
            timestamp: new Date().toISOString(),
          }).catch(err => console.error('Erro ao disparar webhook:', err));
        }
        
        return { success: true };
      }),

    excluir: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { excluirMedico } = db;
        return excluirMedico(input);
      }),

    uploadImagem: protectedProcedure
      .input(z.object({
        base64Data: z.string(),
        filename: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { uploadImage } = uploadImageMod;
        return uploadImage(input);
      }),
  }),

  instituicoes: router({
    listar: publicProcedure
      .input(z.object({
        busca: z.string().optional(),
        categoria: z.string().optional(),
        municipio: z.string().optional(),
        descontoMinimo: z.number().optional(),
        tipoServico: z.enum(["servicos_saude", "outros_servicos"]).optional(),
        procedimento: z.string().optional(),
        page: z.number().int().min(1).optional().default(1),
        limit: z.number().int().min(1).max(200).optional().default(50),
      }).optional())
      .query(async ({ input }) => {
        const { listarInstituicoes } = db;
        return listarInstituicoes(input);
      }),

    obter: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const { obterInstituicaoPorId } = db;
        return obterInstituicaoPorId(input);
      }),

    criar: protectedProcedure
      .input(z.object({
        nome: z.string(),
        tipoServico: z.enum(["servicos_saude", "outros_servicos"]).default("servicos_saude"),
        categoria: z.enum(["clinica", "farmacia", "laboratorio", "academia", "hospital", "outro"]),
        municipio: z.string(),
        endereco: z.string(),
        telefone: z.string().optional(),
        email: z.string().optional(),
        descontoPercentual: z.number().default(0),
        observacoes: z.string().optional(),
        contatoParceria: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { criarInstituicao, dispararWebhook, obterInstituicaoPorId } = db;
        const instituicaoId = await criarInstituicao(input);
        
        // Buscar instituição recém-criada
        const instituicao = await obterInstituicaoPorId(instituicaoId);
        
        // Disparar webhook
        if (instituicao) {
          await dispararWebhook("instituicao.criada", {
            id: instituicao.id,
            nome: instituicao.nome,
            categoria: instituicao.categoria,
            municipio: instituicao.municipio,
            timestamp: new Date().toISOString(),
          }).catch(err => console.error('Erro ao disparar webhook:', err));
        }
        
        return instituicaoId;
      }),

    atualizar: protectedProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          nome: z.string().optional(),
          tipoServico: z.enum(["servicos_saude", "outros_servicos"]).optional(),
          subcategoria: z.string().optional(),
          categoria: z.enum(["clinica", "farmacia", "laboratorio", "academia", "hospital", "outro"]).optional(),
          municipio: z.string().optional(),
          endereco: z.string().optional(),
          telefone: z.string().optional(),
          telefoneOrganizacao: z.string().optional(),
          email: z.string().optional(),
          whatsappSecretaria: z.string().optional(),
          precoConsulta: z.string().optional(),
          valorParticular: z.string().optional(),
          valorAssinanteVital: z.string().optional(),
          descontoPercentual: z.number().optional(),
          observacoes: z.string().optional(),
          contatoParceria: z.string().optional(),
          whatsappParceria: z.string().optional(),
        }),
          logoUrl: z.string().optional(),
          fotoUrl: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { atualizarInstituicao, dispararWebhook, obterInstituicaoPorId } = db;
        await atualizarInstituicao(input.id, input.data);
        
        // Buscar instituição atualizada
        const instituicao = await obterInstituicaoPorId(input.id);
        
        // Disparar webhook
        if (instituicao) {
          await dispararWebhook("instituicao.atualizada", {
            id: instituicao.id,
            nome: instituicao.nome,
            categoria: instituicao.categoria,
            municipio: instituicao.municipio,
            timestamp: new Date().toISOString(),
          }).catch(err => console.error('Erro ao disparar webhook:', err));
        }
        
        return { success: true };
      }),

    excluir: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { excluirInstituicao } = db;
        return excluirInstituicao(input);
      }),

    uploadImagem: protectedProcedure
      .input(z.object({
        base64Data: z.string(),
        filename: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { uploadImage } = uploadImageMod;
        return uploadImage(input);
      }),

    // Procedimentos da instituição
    listarProcedimentos: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const { listarProcedimentosPorInstituicao } = db;
        return listarProcedimentosPorInstituicao(input);
      }),

    criarProcedimento: protectedProcedure
      .input(z.object({
        instituicaoId: z.number(),
        nome: z.string(),
        valorParticular: z.string().optional(),
        valorAssinante: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { criarProcedimentoInstituicao } = db;
        return criarProcedimentoInstituicao(input);
      }),

    atualizarProcedimento: protectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        valorParticular: z.string().optional(),
        valorAssinante: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { atualizarProcedimentoInstituicao } = db;
        const { id, ...dados } = input;
        return atualizarProcedimentoInstituicao(id, dados);
      }),

    excluirProcedimento: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { excluirProcedimentoInstituicao } = db;
        return excluirProcedimentoInstituicao(input);
      }),
  }),

  municipios: router({
    listar: publicProcedure.query(async () => {
      const { listarMunicipios } = db;
      return listarMunicipios();
    }),
  }),

  parceria: router({
    // Endpoint público para criar solicitação de parceria (rate limited)
    solicitar: publicRateLimitedProcedure
      .input(z.object({
        tipoCredenciado: z.enum(["medico", "instituicao"]).default("instituicao"),
        nomeResponsavel: z.string().min(1, "Nome do responsável é obrigatório"),
        nomeEstabelecimento: z.string().min(1, "Nome do estabelecimento é obrigatório"),
        tipoServico: z.enum(["servicos_saude", "outros_servicos"]).optional(),
        categoria: z.string().min(1, "Categoria é obrigatória"),
        especialidade: z.string().optional(),
        areaAtuacao: z.string().optional(),
        numeroRegistroConselho: z.string().optional(),
        tipoAtendimento: z.enum(["presencial", "telemedicina", "ambos"]).default("presencial"),
        endereco: z.string().min(1, "Endereço é obrigatório"),
        cidade: z.string().min(1, "Cidade é obrigatória"),
        telefone: z.string().optional(),
        whatsappSecretaria: z.string().optional(),
        email: z.string().email().optional(),
        precoConsulta: z.string().optional(),
        valorParticular: z.string().optional(),
        valorAssinanteVital: z.string().optional(),
        descontoPercentual: z.number().min(0).max(100),
        descontoGeral: z.number().min(0).max(100).optional(), // Desconto geral para produtos variados
        logoUrl: z.string().optional(),
        fotoUrl: z.string().optional(),
        contatoParceria: z.string().optional(),
        whatsappParceria: z.string().optional(),
        observacoes: z.string().optional(),
        procedimentos: z.array(z.object({
          nome: z.string(),
          valorParticular: z.string(),
          valorAssinante: z.string(),
        })).optional(),
      }))
      .mutation(async ({ input }) => {
        const { criarSolicitacaoParceria, criarProcedimentoSolicitacao } = db;
        const { enviarEmailNovaParceria } = email;
        
        // Extrair procedimentos do input
        const { procedimentos, ...solicitacaoData } = input;
        
        // Criar solicitação no banco
        const solicitacaoId = await criarSolicitacaoParceria({
          ...solicitacaoData,
          status: "pendente",
        } as any);
        
        // Salvar procedimentos se houver
        if (procedimentos && procedimentos.length > 0) {
          for (const proc of procedimentos) {
            await criarProcedimentoSolicitacao({
              solicitacaoId,
              nome: proc.nome,
              valorParticular: proc.valorParticular,
              valorAssinante: proc.valorAssinante,
            });
          }
        }
        
        // Enviar e-mail de notificação
        await enviarEmailNovaParceria(solicitacaoData);
        
        return { success: true };
      }),

    // Endpoints administrativos
    listar: adminProcedure
      .input(z.object({
        status: z.enum(["pendente", "aprovado", "rejeitado"]).optional(),
      }).optional())
      .query(async ({ input }) => {
        const { listarSolicitacoesParceria } = db;
        return listarSolicitacoesParceria(input?.status);
      }),

    aprovar: adminProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { obterSolicitacaoParceriaPorId, atualizarStatusSolicitacao, criarInstituicao, criarMedico, listarProcedimentosPorSolicitacao } = db;
        const { enviarEmailAprovacaoParceria } = email;
        
        // Obter solicitação
        const solicitacao = await obterSolicitacaoParceriaPorId(input);
        if (!solicitacao) throw new Error("Solicitação não encontrada");
        
        // Buscar procedimentos da solicitação
        const procedimentos = await listarProcedimentosPorSolicitacao(input);
        
        // Criar médico ou instituição baseado no tipoCredenciado
        if (solicitacao.tipoCredenciado === "medico") {
          // Criar médico na rede credenciada
          await criarMedico({
            nome: solicitacao.nomeEstabelecimento,
            especialidade: solicitacao.especialidade || solicitacao.categoria,
            numeroRegistroConselho: solicitacao.numeroRegistroConselho,
            areaAtuacao: solicitacao.areaAtuacao,
            municipio: solicitacao.cidade,
            endereco: solicitacao.endereco,
            telefone: solicitacao.telefone,
            whatsapp: solicitacao.whatsappSecretaria,
            whatsappSecretaria: solicitacao.whatsappSecretaria,
            tipoAtendimento: solicitacao.tipoAtendimento || "presencial",
            precoConsulta: solicitacao.precoConsulta,
            valorParticular: solicitacao.valorParticular,
            valorAssinanteVital: solicitacao.valorAssinanteVital,
            descontoPercentual: solicitacao.descontoPercentual,
            observacoes: solicitacao.observacoes,
            contatoParceria: solicitacao.nomeResponsavel,
            whatsappParceria: solicitacao.whatsappParceria,
            email: solicitacao.email,
            logoUrl: solicitacao.logoUrl,
            fotoUrl: solicitacao.fotoUrl,
            ativo: 1,
          });
        } else {
          // Criar instituição na rede credenciada
          const instituicaoId = await criarInstituicao({
            nome: solicitacao.nomeEstabelecimento,
            tipoServico: solicitacao.tipoServico || "servicos_saude",
            categoria: solicitacao.categoria as any,
            municipio: solicitacao.cidade,
            endereco: solicitacao.endereco,
            telefone: solicitacao.telefone,
            whatsappSecretaria: solicitacao.whatsappSecretaria,
            email: solicitacao.email,
            precoConsulta: solicitacao.precoConsulta,
            valorParticular: solicitacao.valorParticular,
            valorAssinanteVital: solicitacao.valorAssinanteVital,
            descontoPercentual: solicitacao.descontoPercentual,
            observacoes: solicitacao.observacoes,
            contatoParceria: solicitacao.nomeResponsavel,
            whatsappParceria: solicitacao.whatsappParceria,
            logoUrl: solicitacao.logoUrl,
            fotoUrl: solicitacao.fotoUrl,
            ativo: 1,
          });
          
          // Transferir procedimentos da solicitação para a instituição
          const { transferirProcedimentosSolicitacaoParaInstituicao } = db;
          await transferirProcedimentosSolicitacaoParaInstituicao(input, instituicaoId);
        }
        
        // Atualizar status da solicitação
        await atualizarStatusSolicitacao(input, "aprovado");
        
        // Enviar email de aprovação ao parceiro
        if (solicitacao.email) {
          await enviarEmailAprovacaoParceria({
            nomeResponsavel: solicitacao.nomeResponsavel,
            nomeEstabelecimento: solicitacao.nomeEstabelecimento,
            email: solicitacao.email,
            tipoCredenciado: solicitacao.tipoCredenciado,
            categoria: solicitacao.categoria,
            procedimentos: procedimentos.map(p => ({
              nome: p.nome,
              valorParticular: p.valorParticular || '0.00',
              valorAssinante: p.valorAssinante || '0.00',
            })),
          });
        }
        
        return { success: true };
      }),

    rejeitar: adminProcedure
      .input(z.object({
        id: z.number(),
        motivo: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { atualizarStatusSolicitacao } = db;
        await atualizarStatusSolicitacao(input.id, "rejeitado", input.motivo);
        return { success: true };
      }),
  }),

  sugestao: router({
    enviarSugestaoParceiro: publicRateLimitedProcedure
      .input(z.object({
        nomeParceiro: z.string().min(1, "Nome do parceiro é obrigatório"),
        especialidade: z.string().min(1, "Especialidade é obrigatória"),
        municipio: z.string().min(1, "Município é obrigatório"),
      }))
      .mutation(async ({ input }) => {
        const { criarSugestaoParceiro } = db;
        const { enviarEmailSugestaoParceiro } = email;
        
        // Salvar sugestão no banco de dados
        await criarSugestaoParceiro({
          nomeParceiro: input.nomeParceiro,
          especialidade: input.especialidade,
          municipio: input.municipio,
          status: "pendente",
        });
        
        // Enviar e-mail de notificação
        await enviarEmailSugestaoParceiro(input);
        
        return { success: true };
      }),
    
    listar: adminProcedure.query(async () => {
      const { listarSugestoesParceiros } = db;
      return listarSugestoesParceiros();
    }),

    atualizarStatus: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["pendente", "em_contato", "link_enviado", "aguardando_cadastro", "cadastrado", "nao_interessado", "retomar_depois"]),
      }))
      .mutation(async ({ input }) => {
        const { atualizarStatusSugestao } = db;
        return atualizarStatusSugestao(input.id, input.status);
      }),

    adicionarNota: adminProcedure
      .input(z.object({
        id: z.number(),
        nota: z.string().min(1),
      }))
      .mutation(async ({ input }) => {
        const { adicionarNotaSugestao } = db;
        return adicionarNotaSugestao(input.id, input.nota);
      }),

    atualizarResponsavel: adminProcedure
      .input(z.object({
        id: z.number(),
        responsavel: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { atualizarResponsavelSugestao } = db;
        return atualizarResponsavelSugestao(input.id, input.responsavel);
      }),

    contarPorStatus: adminProcedure.query(async () => {
      const { contarSugestoesPorStatus } = db;
      return contarSugestoesPorStatus();
    }),
  }),

  usuariosAutorizados: router({
    listar: protectedProcedure.query(async () => {
      const { listarUsuariosAutorizados } = db;
      return listarUsuariosAutorizados();
    }),

    verificarAcesso: publicProcedure
      .input(z.string().email())
      .query(async ({ input }) => {
        const { obterUsuarioAutorizadoPorEmail } = db;
        const usuario = await obterUsuarioAutorizadoPorEmail(input);
        // Retorna apenas autorizado/não autorizado — sem dados do usuário
        // para evitar enumeração de contas por email
        return { autorizado: !!(usuario && usuario.ativo) };
      }),

    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        senha: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { obterUsuarioAutorizadoPorEmail } = db;
        const usuario = await obterUsuarioAutorizadoPorEmail(input.email);
        
        if (!usuario || !usuario.ativo) {
          throw new Error("Credenciais inválidas");
        }
        
        const senhaValida = await bcrypt.compare(input.senha, usuario.senhaHash);
        
        if (!senhaValida) {
          throw new Error("Credenciais inválidas");
        }
        
        // Criar sessão para usuário interno (diferente do admin)
        const token = jwt.sign(
          { 
            userId: usuario.id, 
            email: usuario.email, 
            nome: usuario.nome,
            tipo: "interno" 
          },
          process.env.JWT_SECRET!,
          { expiresIn: "7d" }
        );
        
        // Definir cookie de sessão
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie("dados_internos_session", token, cookieOptions);
        
        return { 
          success: true,
          usuario: {
            id: usuario.id,
            email: usuario.email,
            nome: usuario.nome,
          }
        };
      }),

    logout: publicProcedure
      .mutation(async ({ ctx }) => {
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.clearCookie("dados_internos_session", { ...cookieOptions, maxAge: -1 });
        return { success: true };
      }),

    criar: protectedProcedure
      .input(z.object({
        email: z.string().email(),
        nome: z.string(),
        senha: z.string().min(6),
        nivelAcesso: z.enum(["admin", "visualizador"]).default("visualizador"),
      }))
      .mutation(async ({ input }) => {
        const { criarUsuarioAutorizado } = db;
        await criarUsuarioAutorizado(input);
        
        // Enviar email de boas-vindas com credenciais
        const { enviarEmailNovoUsuario } = email;
        try {
          await enviarEmailNovoUsuario({
            nome: input.nome,
            email: input.email,
            senha: input.senha,
            nivelAcesso: input.nivelAcesso,
          });
        } catch (error) {
          console.error('[Email] Erro ao enviar email de boas-vindas:', error);
          // Não falhar a criação se o email falhar
        }
        
        return { success: true };
      }),

    atualizar: protectedProcedure
      .input(z.object({
        id: z.number(),
        email: z.string().email().optional(),
        nome: z.string().optional(),
        nivelAcesso: z.enum(["admin", "visualizador"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { atualizarUsuarioAutorizado } = db;
        const { id, ...data } = input;
        await atualizarUsuarioAutorizado(id, data);
        return { success: true };
      }),

    excluir: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { excluirUsuarioAutorizado } = db;
        await excluirUsuarioAutorizado(input);
        return { success: true };
      }),

    resetarSenha: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { alterarSenhaUsuario, obterUsuarioAutorizadoPorId } = db;

        // Buscar dados do usuário antes de resetar
        const usuario = await obterUsuarioAutorizadoPorId(input);
        if (!usuario) {
          throw new Error("Usuário não encontrado");
        }

        // Gerar nova senha temporária criptograficamente segura
        const novaSenha = randomBytes(12).toString("base64url");
        await alterarSenhaUsuario(input, novaSenha);
        
        // Enviar email com nova senha
        const { enviarEmailSenhaResetada } = email;
        try {
          await enviarEmailSenhaResetada({
            nome: usuario.nome,
            email: usuario.email,
            novaSenha: novaSenha,
            nivelAcesso: (usuario as any).nivelAcesso || "visualizador",
          });
        } catch (error) {
          console.error('[Email] Erro ao enviar email de senha resetada:', error);
          // Não falhar o reset se o email falhar
        }
        
        return { success: true, novaSenha };
      }),

    alterarSenha: protectedProcedure
      .input(z.object({
        senhaAtual: z.string(),
        novaSenha: z.string().min(6),
      }))
      .mutation(async ({ input, ctx }) => {
        // Verificar se usuário está autenticado via dados internos
        const token = ctx.req.cookies?.dados_internos_session;
        if (!token) {
          throw new Error("Não autenticado");
        }
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        const { obterUsuarioAutorizadoPorId, alterarSenhaUsuario } = db;
        const usuario = await obterUsuarioAutorizadoPorId(decoded.userId);
        
        if (!usuario) {
          throw new Error("Usuário não encontrado");
        }
        
        // Verificar senha atual
        const senhaValida = await bcrypt.compare(input.senhaAtual, usuario.senhaHash);
        
        if (!senhaValida) {
          throw new Error("Senha atual incorreta");
        }
        
        // Alterar senha
        await alterarSenhaUsuario(usuario.id, input.novaSenha);
        return { success: true };
      }),
  }),

  atualizacao: router({
    gerarLink: protectedProcedure
      .input(z.object({
        tipo: z.enum(["medico", "instituicao"]),
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { gerarTokenAtualizacao, obterMedicoPorId, obterInstituicaoPorId } = db;
        const token = await gerarTokenAtualizacao(input.tipo, input.id);
        
        // Obter nome do credenciado para mensagem WhatsApp
        let nome = "";
        if (input.tipo === "medico") {
          const medico = await obterMedicoPorId(input.id);
          nome = medico?.nome || "";
        } else {
          const instituicao = await obterInstituicaoPorId(input.id);
          nome = instituicao?.nome || "";
        }
        
        // Link será gerado no frontend usando window.location.origin
        return { token, nome };
      }),
    
    obterPorToken: publicProcedure
      .input(z.string())
      .query(async ({ input }) => {
        const { obterCredenciadoPorToken } = db;
        return obterCredenciadoPorToken(input);
      }),
    
    enviar: publicProcedure
      .input(z.object({
        token: z.string(),
        telefone: z.string().optional(),
        whatsapp: z.string().optional(),
        whatsappSecretaria: z.string().optional(),
        telefoneOrganizacao: z.string().optional(),
        fotoUrl: z.string().optional(),
        email: z.string().optional(),
        endereco: z.string().optional(),
        precoConsulta: z.string().optional(),
        valorParticular: z.string().optional(),
        valorAssinanteVital: z.string().optional(),
        descontoPercentual: z.number().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { obterCredenciadoPorToken, criarSolicitacaoAtualizacao } = db;
        
        const credenciado = await obterCredenciadoPorToken(input.token);
        if (!credenciado) {
          throw new Error("Token inv\u00e1lido ou expirado");
        }
        
        // Type casting para contornar bug de cache do TypeScript com novos campos
        await criarSolicitacaoAtualizacao({
          tipoCredenciado: credenciado.tipo,
          credenciadoId: credenciado.dados.id,
          telefone: input.telefone,
          whatsapp: input.whatsapp,
          whatsappSecretaria: input.whatsappSecretaria,
          telefoneOrganizacao: input.telefoneOrganizacao,
          fotoUrl: input.fotoUrl,
          email: input.email,
          endereco: input.endereco,
          precoConsulta: input.precoConsulta,
          descontoPercentual: input.descontoPercentual,
          observacoes: input.observacoes,
        } as any);
        
        return { success: true };
      }),
    
    listar: adminProcedure
      .input(z.object({
        status: z.enum(["pendente", "aprovado", "rejeitado"]).optional(),
      }).optional())
      .query(async ({ input }) => {
        const { listarSolicitacoesAtualizacao } = db;
        return listarSolicitacoesAtualizacao(input?.status);
      }),

    aprovar: adminProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { aprovarSolicitacaoAtualizacao } = db;
        await aprovarSolicitacaoAtualizacao(input);
        return { success: true };
      }),

    rejeitar: adminProcedure
      .input(z.object({
        id: z.number(),
        motivo: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { rejeitarSolicitacaoAtualizacao } = db;
        await rejeitarSolicitacaoAtualizacao(input.id, input.motivo);
        return { success: true };
      }),
  }),

  // Solicitações de Acesso
  solicitacoesAcesso: router({
    criar: publicRateLimitedProcedure
      .input(z.object({
        nome: z.string().min(3),
        email: z.string().email(),
        telefone: z.string().optional(),
        justificativa: z.string().min(10),
      }))
      .mutation(async ({ input }) => {
        const { criarSolicitacaoAcesso } = db;
        await criarSolicitacaoAcesso(input);
        return { success: true };
      }),

    listar: protectedProcedure
      .query(async () => {
        const { listarSolicitacoesAcesso } = db;
        return listarSolicitacoesAcesso();
      }),

    aprovar: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { aprovarSolicitacaoAcesso, criarUsuarioAutorizado } = db;
        
        // Gerar senha temporária criptograficamente segura
        const senhaTemporaria = randomBytes(12).toString("base64url");
        
        // Aprovar solicitação
        const solicitacao = await aprovarSolicitacaoAcesso(input, senhaTemporaria);
        
        // Criar usuário autorizado
        await criarUsuarioAutorizado({
          email: solicitacao.email,
          nome: solicitacao.nome,
          senha: senhaTemporaria,
        });
        
        // TODO: Enviar email com credenciais
        
        return { success: true, senhaTemporaria };
      }),

    rejeitar: protectedProcedure
      .input(z.object({
        id: z.number(),
        motivo: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { rejeitarSolicitacaoAcesso } = db;
        await rejeitarSolicitacaoAcesso(input.id, input.motivo);
        return { success: true };
      }),
  }),

  // Recuperação de Senha
  recuperacaoSenha: router({
    solicitar: publicRateLimitedProcedure
      .input(z.string().email())
      .mutation(async ({ input }) => {
        const { obterUsuarioAutorizadoPorEmail, criarTokenRecuperacao } = db;
        
        const usuario = await obterUsuarioAutorizadoPorEmail(input);
        if (!usuario) {
          // Não revelar se o email existe ou não
          return { success: true };
        }
        
        // Gerar token único
        const token = randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 3600000); // 1 hora
        
        await criarTokenRecuperacao(usuario.id, token, expiresAt);
        
        // TODO: Enviar email com link de recuperação
        
        return { success: true };
      }),

    verificarToken: publicProcedure
      .input(z.string())
      .query(async ({ input }) => {
        const { obterTokenRecuperacao } = db;
        const tokenData = await obterTokenRecuperacao(input);
        
        if (!tokenData || tokenData.usado || new Date() > tokenData.expiresAt) {
          return { valido: false };
        }
        
        return { valido: true };
      }),

    redefinir: publicProcedure
      .input(z.object({
        token: z.string(),
        novaSenha: z.string().min(6),
      }))
      .mutation(async ({ input }) => {
        const { obterTokenRecuperacao, marcarTokenComoUsado, alterarSenhaUsuario } = db;
        
        const tokenData = await obterTokenRecuperacao(input.token);
        
        if (!tokenData || tokenData.usado || new Date() > tokenData.expiresAt) {
          throw new Error("Token inválido ou expirado");
        }
        
        await alterarSenhaUsuario(tokenData.usuarioId, input.novaSenha);
        await marcarTokenComoUsado(input.token);
        
        return { success: true };
      }),
  }),

  // [REMOVIDO] Sistema de indicações removido
  // indicacoes: router({ ... }),

  // Rotas de prospecção e estatísticas
  prospeccao: router({
    estatisticasCobertura: protectedProcedure.query(async () => {
      const { obterEstatisticasCobertura } = db;
      return await obterEstatisticasCobertura();
    }),
    especialidadesUnicas: protectedProcedure.query(async () => {
      const { obterEspecialidadesUnicas } = db;
      return await obterEspecialidadesUnicas();
    }),
    categoriasUnicas: protectedProcedure.query(async () => {
      const { obterCategoriasUnicas } = db;
      return await obterCategoriasUnicas();
    }),
  }),

  // Rotas de configurações do sistema
  configuracoes: router({
    // Listar todas as configurações
    listar: protectedProcedure.query(async () => {
      const { listarConfiguracoes } = db;
      return await listarConfiguracoes();
    }),

    // Buscar configuração por chave
    buscarPorChave: publicProcedure
      .input(z.object({ chave: z.string() }))
      .query(async ({ input }) => {
        const { buscarConfiguracaoPorChave } = db;
        return await buscarConfiguracaoPorChave(input.chave);
      }),

    // Atualizar configuração
    atualizar: protectedProcedure
      .input(z.object({
        chave: z.string(),
        valor: z.string(),
        descricao: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { atualizarConfiguracao } = db;
        return await atualizarConfiguracao(
          input.chave,
          input.valor,
          input.descricao,
          ctx.user?.name || "Admin"
        );
      }),
  }),

  // [REMOVIDO] Router comissões de assinaturas removido
  // comissoesAssinaturas: router({ ... }),

  // [REMOVIDO] Materiais de divulgação removido
  // materiais: router({ ... }),

  // Templates WhatsApp
  templatesWhatsapp: router({
    listar: publicProcedure.query(async () => {
      const { listarTemplatesWhatsapp } = db;
      return await listarTemplatesWhatsapp();
    }),

    criar: protectedProcedure
      .input(z.object({
        nome: z.string(),
        tipo: z.enum(["cliente", "parceiro", "comercial"]),
        mensagem: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { criarTemplateWhatsapp } = db;
        return await criarTemplateWhatsapp(input);
      }),

    atualizar: protectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        tipo: z.enum(["cliente", "parceiro", "comercial"]).optional(),
        mensagem: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        const { atualizarTemplateWhatsapp } = db;
        return await atualizarTemplateWhatsapp(id, data);
      }),

    deletar: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deletarTemplateWhatsapp } = db;
        return await deletarTemplateWhatsapp(input.id);
      }),
  }),

  // Notificações Semestrais
  notificacoes: router({
    listarDesatualizados: protectedProcedure.query(async () => {
      const { listarCredenciadosDesatualizados } = db;
      return await listarCredenciadosDesatualizados();
    }),

    enviarTodas: protectedProcedure.mutation(async () => {
      const { enviarNotificacoesSemestrais } = db;
      return await enviarNotificacoesSemestrais();
    }),

    enviarIndividual: protectedProcedure
      .input(z.object({
        tipo: z.enum(["medico", "instituicao"]),
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { enviarNotificacaoSemestral } = db;
        return await enviarNotificacaoSemestral(input.tipo, input.id);
      }),
  }),

  // Router de copys (textos editáveis)
  copys: router({
    listar: publicProcedure.query(async () => {
      const { listarCopys } = db;
      return await listarCopys();
    }),

    criar: adminProcedure
      .input(z.object({
        titulo: z.string(),
        conteudo: z.string(),
        categoria: z.enum(["planos", "promocoes", "outros"]),
        ordem: z.number().default(0),
      }))
      .mutation(async ({ input, ctx }) => {
        const { criarCopy } = db;
        await criarCopy({
          ...input,
          updatedBy: ctx.user.email || ctx.user.name || "admin",
        });
        return { success: true };
      }),

    atualizar: adminProcedure
      .input(z.object({
        id: z.number(),
        titulo: z.string().optional(),
        conteudo: z.string().optional(),
        categoria: z.enum(["planos", "promocoes", "outros"]).optional(),
        ordem: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { atualizarCopy } = db;
        const { id, ...data } = input;
        await atualizarCopy(id, {
          ...data,
          updatedBy: ctx.user.email || ctx.user.name || "admin",
        });
        return { success: true };
      }),

    excluir: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { excluirCopy } = db;
        await excluirCopy(input.id);
        return { success: true };
      }),
  }),

  // ========== AVALIAÇÕES ==========
  avaliacoes: router({
    criar: publicRateLimitedProcedure
      .input(z.object({
        tipoCredenciado: z.enum(["medico", "instituicao"]),
        credenciadoId: z.number(),
        nomeCredenciado: z.string(),
        nota: z.number().min(1).max(5),
        comentario: z.string().optional(),
        nomeAvaliador: z.string().optional(),
        emailAvaliador: z.string().email().optional(),
        telefoneAvaliador: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { criarAvaliacao } = db;
        const { notifyOwner } = notification;
        
        await criarAvaliacao(input);
        
        // Notificar admin sobre nova avaliação
        const mensagem = `
🌟 NOVA AVALIAÇÃO RECEBIDA

Credenciado: ${input.nomeCredenciado}
Nota: ${input.nota}/5 estrelas
${input.comentario ? `Comentário: ${input.comentario}` : ""}
${input.nomeAvaliador ? `\nAvaliador: ${input.nomeAvaliador}` : ""}
${input.emailAvaliador ? `Email: ${input.emailAvaliador}` : ""}
${input.telefoneAvaliador ? `Telefone: ${input.telefoneAvaliador}` : ""}
        `.trim();
        
        await notifyOwner({
          title: "Nova Avaliação de Credenciado",
          content: mensagem,
        });
        
        return { success: true };
      }),

    listar: adminProcedure
      .query(async () => {
        const { listarAvaliacoes } = db;
        return await listarAvaliacoes();
      }),

    listarPorCredenciado: adminProcedure
      .input(z.object({
        tipoCredenciado: z.enum(["medico", "instituicao"]),
        credenciadoId: z.number(),
      }))
      .query(async ({ input }) => {
        const { listarAvaliacoesPorCredenciado } = db;
        return await listarAvaliacoesPorCredenciado(input.tipoCredenciado, input.credenciadoId);
      }),

    estatisticas: adminProcedure
      .query(async () => {
        const { estatisticasAvaliacoes } = db;
        return await estatisticasAvaliacoes();
      }),
  }),

  // ========== TOKENS ==========
  tokens: router({    
    // Criar token para atualização de dados
    criar: adminProcedure
      .input(z.object({
        tipoCredenciado: z.enum(["medico", "instituicao"]),
        credenciadoId: z.number(),
        email: z.string().email().optional(),
        telefone: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { criarToken } = db;
        const token = await criarToken({
          tipo: "atualizacao",
          tipoCredenciado: input.tipoCredenciado,
          credenciadoId: input.credenciadoId,
          email: input.email,
          telefone: input.telefone,
          createdBy: ctx.user.email || ctx.user.name || "admin",
        });
        return { token };
      }),

    // Criar token para cadastro de novo credenciado
    criarCadastro: adminProcedure
      .input(z.object({
        tipoCredenciado: z.enum(["medico", "instituicao"]),
        email: z.string().email().optional(),
        telefone: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { criarToken } = db;
        const token = await criarToken({
          tipo: "cadastro",
          tipoCredenciado: input.tipoCredenciado,
          credenciadoId: null,
          email: input.email,
          telefone: input.telefone,
          createdBy: ctx.user.email || ctx.user.name || "admin",
        });
        return { token };
      }),

    // Verificar validade do token
    verificar: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const { verificarToken } = db;
        return await verificarToken(input.token);
      }),

    // Marcar token como usado
    marcarUsado: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        const { marcarTokenUsado } = db;
        await marcarTokenUsado(input.token);
        return { success: true };
      }),
  }),

  // ========== PROCEDIMENTOS ==========
  procedimentos: router({
    listar: publicProcedure
      .input(z.object({
        instituicaoId: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        const { listarProcedimentos } = db;
        return await listarProcedimentos(input?.instituicaoId);
      }),

    listarNomes: publicProcedure
      .query(async () => {
        const { listarNomesProcedimentos } = db;
        return await listarNomesProcedimentos();
      }),

    criar: adminProcedure
      .input(z.object({
        instituicaoId: z.number(),
        nome: z.string().min(1, "Nome do procedimento é obrigatório"),
        valorParticular: z.string().optional(),
        valorAssinanteVital: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { criarProcedimento } = db;
        const id = await criarProcedimento(input);
        return { id, success: true };
      }),

    atualizar: adminProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        valorParticular: z.string().optional(),
        valorAssinanteVital: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { atualizarProcedimento } = db;
        const { id, ...data } = input;
        await atualizarProcedimento(id, data);
        return { success: true };
      }),

    excluir: adminProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { excluirProcedimento } = db;
        await excluirProcedimento(input);
        return { success: true };
      }),
      
    // Gerenciar procedimentos via token de atualização (sem autenticação)
    gerenciarComToken: publicProcedure
      .input(z.object({
        token: z.string(),
        procedimentos: z.array(z.object({
          id: z.number().optional(),
          nome: z.string(),
          valorParticular: z.string(),
          valorAssinanteVital: z.string(),
          _action: z.enum(['create', 'update', 'delete']).optional(),
        })),
      }))
      .mutation(async ({ input }) => {
        const { verificarToken } = db;
        const { criarProcedimento, atualizarProcedimento, excluirProcedimento } = db;
        
        // Verificar token
        const result = await verificarToken(input.token);
        if (!result.valido || !result.token || result.token.tipo !== "atualizacao" || result.token.tipoCredenciado !== "instituicao") {
          throw new Error("Token inválido ou expirado");
        }
        
        const instituicaoId = result.token.credenciadoId;
        if (!instituicaoId) {
          throw new Error("ID da instituição não encontrado");
        }
        
        // Processar cada procedimento
        const { verificarPropriedadeProcedimento } = db;
        for (const proc of input.procedimentos) {
          if (proc._action === 'create') {
            await criarProcedimento({
              instituicaoId,
              nome: proc.nome,
              valorParticular: proc.valorParticular,
              valorAssinanteVital: proc.valorAssinanteVital,
            });
          } else if (proc._action === 'update' && proc.id) {
            // Verifica ownership antes de atualizar (prevenção de IDOR)
            const pertence = await verificarPropriedadeProcedimento(proc.id, instituicaoId);
            if (!pertence) throw new Error("Procedimento não pertence a esta instituição");
            await atualizarProcedimento(proc.id, {
              nome: proc.nome,
              valorParticular: proc.valorParticular,
              valorAssinanteVital: proc.valorAssinanteVital,
            });
          } else if (proc._action === 'delete' && proc.id) {
            // Verifica ownership antes de excluir (prevenção de IDOR)
            const pertence = await verificarPropriedadeProcedimento(proc.id, instituicaoId);
            if (!pertence) throw new Error("Procedimento não pertence a esta instituição");
            await excluirProcedimento(proc.id);
          }
        }
        
        return { success: true };
      }),
  }),

  // ========== PROCEDIMENTOS DE SOLICITAÇÕES ==========
  procedimentosSolicitacao: router({
    listar: publicProcedure
      .input(z.object({
        solicitacaoId: z.number(),
      }))
      .query(async ({ input }) => {
        const { listarProcedimentosPorSolicitacao } = db;
        return await listarProcedimentosPorSolicitacao(input.solicitacaoId);
      }),

    criar: protectedProcedure
      .input(z.object({
        solicitacaoId: z.number(),
        nome: z.string().min(1, "Nome do procedimento é obrigatório"),
        valorParticular: z.string().optional(),
        valorAssinante: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { criarProcedimentoSolicitacao } = db;
        const id = await criarProcedimentoSolicitacao(input);
        return { id, success: true };
      }),

    atualizar: protectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        valorParticular: z.string().optional(),
        valorAssinante: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { atualizarProcedimentoSolicitacao } = db;
        const { id, ...data } = input;
        await atualizarProcedimentoSolicitacao(id, data);
        return { success: true };
      }),

    excluir: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { excluirProcedimentoSolicitacao } = db;
        await excluirProcedimentoSolicitacao(input);
        return { success: true };
      }),
  }),

  // ========== UPLOAD DE IMAGENS ==========
  upload: router({
    imagem: adminProcedure
      .input(z.object({
        base64: z.string(),
        filename: z.string(),
        contentType: z.enum(["image/jpeg", "image/png", "image/webp", "image/gif"]),
      }))
      .mutation(async ({ input }) => {

        const { storagePut } = storage;

        // Remover prefixo data:image/...;base64, se existir
        const base64Data = input.base64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        // Gerar nome único para o arquivo usando crypto (sem Math.random)
        const randomSuffix = randomBytes(4).toString("hex");
        const extension = input.filename.split(".").pop() || "jpg";
        const uniqueFilename = `credenciados/${Date.now()}-${randomSuffix}.${extension}`;

        // Upload para S3
        const result = await storagePut(uniqueFilename, buffer, input.contentType);

        return { url: result.url };
      }),
  }),

  // ============================================
  // API KEYS - Gerenciamento de chaves de API
  // ============================================
  apiKeys: router({
    // Listar todas as API Keys
    listar: protectedProcedure.query(async () => {
      const { listarApiKeys } = db;
      return listarApiKeys();
    }),

    // Criar nova API Key
    criar: protectedProcedure
      .input(z.object({
        nome: z.string().min(1, "Nome é obrigatório"),
      }))
      .mutation(async ({ input, ctx }) => {
        const { criarApiKey } = db;
        return criarApiKey(input.nome, ctx.user?.name || 'admin');
      }),

    // Ativar/Desativar API Key
    toggle: protectedProcedure
      .input(z.object({
        id: z.number(),
        ativa: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        const { toggleApiKey } = db;
        await toggleApiKey(input.id, input.ativa);
        return { success: true };
      }),

    // Deletar API Key
    deletar: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { deletarApiKey } = db;
        await deletarApiKey(input);
        return { success: true };
      }),

    // Listar logs de uma API Key
    logs: protectedProcedure
      .input(z.object({
        apiKeyId: z.number(),
        limit: z.number().optional().default(100),
      }))
      .query(async ({ input }) => {
        const { listarLogsApiKey } = db;
        return listarLogsApiKey(input.apiKeyId, input.limit);
      }),

    // Estatísticas de uma API Key
    estatisticas: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const { estatisticasApiKey } = db;
        return estatisticasApiKey(input);
      }),
  }),

  // ============================================
  // WEBHOOKS - Sistema de notificações
  // ============================================
  webhooks: router({
    // Listar todos os webhooks
    listar: protectedProcedure
      .input(z.object({
        apiKeyId: z.number().optional(),
      }).optional())
      .query(async ({ input }) => {
        const { listarWebhooks } = db;
        return listarWebhooks(input?.apiKeyId);
      }),

    // Criar novo webhook
    criar: protectedProcedure
      .input(z.object({
        apiKeyId: z.number(),
        nome: z.string().min(1, "Nome é obrigatório"),
        url: z.string().url("URL inválida"),
        eventos: z.array(z.enum([
          "medico.criado",
          "medico.atualizado",
          "instituicao.criada",
          "instituicao.atualizada"
        ])).min(1, "Selecione pelo menos um evento"),
        maxRetries: z.number().min(1).max(10).optional().default(3),
      }))
      .mutation(async ({ input }) => {
        const { criarWebhook } = db;
        return criarWebhook({
          apiKeyId: input.apiKeyId,
          nome: input.nome,
          url: input.url,
          eventos: JSON.stringify(input.eventos),
          maxRetries: input.maxRetries,
          ativo: 1,
        });
      }),

    // Atualizar webhook
    atualizar: protectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        url: z.string().url().optional(),
        eventos: z.array(z.string()).optional(),
        maxRetries: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { atualizarWebhook } = db;
        const { id, ...data } = input;
        
        const updateData: any = { ...data };
        if (data.eventos) {
          updateData.eventos = JSON.stringify(data.eventos);
        }
        
        await atualizarWebhook(id, updateData);
        return { success: true };
      }),

    // Ativar/Desativar webhook
    toggle: protectedProcedure
      .input(z.object({
        id: z.number(),
        ativo: z.boolean(),
      }))
      .mutation(async ({ input }) => {
        const { toggleWebhook } = db;
        await toggleWebhook(input.id, input.ativo);
        return { success: true };
      }),

    // Deletar webhook
    deletar: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { deletarWebhook } = db;
        await deletarWebhook(input);
        return { success: true };
      }),

    // Testar webhook (disparo manual)
    testar: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { buscarWebhookPorId, dispararWebhook } = db;
        
        const webhook = await buscarWebhookPorId(input);
        if (!webhook) {
          throw new Error("Webhook não encontrado");
        }

        // Payload de teste
        const payloadTeste = {
          evento: "teste",
          timestamp: new Date().toISOString(),
          data: {
            mensagem: "Este é um disparo de teste do webhook"
          }
        };

        await dispararWebhook("teste", payloadTeste);
        return { success: true, mensagem: "Webhook disparado com sucesso!" };
      }),

    // Listar logs de um webhook
    logs: protectedProcedure
      .input(z.object({
        webhookId: z.number(),
        limit: z.number().optional().default(100),
      }))
      .query(async ({ input }) => {
        const { listarLogsWebhook } = db;
        return listarLogsWebhook(input.webhookId, input.limit);
      }),

    // Estatísticas de um webhook
    estatisticas: protectedProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const { estatisticasWebhook } = db;
        return estatisticasWebhook(input);
      }),
  }),

  // ========== ESTATÍSTICAS DE CRESCIMENTO ==========
  estatisticas: router({
    crescimento: protectedProcedure.query(async () => {
      const { obterEstatisticasCrescimento } = db;
      return obterEstatisticasCrescimento();
    }),
  }),

  // ========== GESTÃO DE USUÁRIOS MANUS (tabela users) ==========
  usuariosManus: router({
    listar: adminProcedure.query(async () => {
      const { listarUsuariosManus } = db;
      return listarUsuariosManus();
    }),

    atualizarRole: adminProcedure
      .input(z.object({
        userId: z.number(),
        novaRole: z.enum(["admin", "user"]),
      }))
      .mutation(async ({ input }) => {
        const { atualizarRoleUsuario } = db;
        return atualizarRoleUsuario(input.userId, input.novaRole);
      }),
  }),

});

export type AppRouter = typeof appRouter;
