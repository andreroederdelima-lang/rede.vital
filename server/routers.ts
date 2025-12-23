import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";

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
        const { solicitarRecuperacaoSenha } = await import("./db");
        return await solicitarRecuperacaoSenha(input.email);
      }),

    // Validar token de recuperação
    validarToken: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        const { validarTokenRecuperacao } = await import("./db");
        return await validarTokenRecuperacao(input.token);
      }),

    // Redefinir senha com token
    redefinirSenha: publicProcedure
      .input(z.object({
        token: z.string(),
        novaSenha: z.string().min(6),
      }))
      .mutation(async ({ input }) => {
        const { redefinirSenhaComToken } = await import("./db");
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
      }).optional())
      .query(async ({ input }) => {
        const { listarMedicos } = await import("./db");
        return listarMedicos(input);
      }),
    
    listarEspecialidades: publicProcedure.query(async () => {
      const { listarEspecialidades } = await import("./db");
      return listarEspecialidades();
    }),

    obter: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const { obterMedicoPorId } = await import("./db");
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
        const { criarMedico } = await import("./db");
        return criarMedico(input);
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
        const { atualizarMedico } = await import("./db");
        return atualizarMedico(input.id, input.data);
      }),

    excluir: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { excluirMedico } = await import("./db");
        return excluirMedico(input);
      }),

    uploadImagem: protectedProcedure
      .input(z.object({
        base64Data: z.string(),
        filename: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { uploadImage } = await import("./uploadImage");
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
      }).optional())
      .query(async ({ input }) => {
        const { listarInstituicoes } = await import("./db");
        return listarInstituicoes(input);
      }),

    obter: publicProcedure
      .input(z.number())
      .query(async ({ input }) => {
        const { obterInstituicaoPorId } = await import("./db");
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
        const { criarInstituicao } = await import("./db");
        return criarInstituicao(input);
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
        const { atualizarInstituicao } = await import("./db");
        return atualizarInstituicao(input.id, input.data);
      }),

    excluir: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { excluirInstituicao } = await import("./db");
        return excluirInstituicao(input);
      }),

    uploadImagem: protectedProcedure
      .input(z.object({
        base64Data: z.string(),
        filename: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { uploadImage } = await import("./uploadImage");
        return uploadImage(input);
      }),
  }),

  municipios: router({
    listar: publicProcedure.query(async () => {
      const { listarMunicipios } = await import("./db");
      return listarMunicipios();
    }),
  }),

  parceria: router({
    // Endpoint público para criar solicitação de parceria
    solicitar: publicProcedure
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
        telefone: z.string().min(1, "Telefone é obrigatório"),
        whatsappSecretaria: z.string().min(1, "WhatsApp é obrigatório"),
        email: z.string().email().optional(),
        precoConsulta: z.string().optional(),
        valorParticular: z.string().optional(),
        valorAssinanteVital: z.string().optional(),
        descontoPercentual: z.number().min(0).max(100),
        logoUrl: z.string().optional(),
        fotoUrl: z.string().optional(),
        contatoParceria: z.string().optional(),
        whatsappParceria: z.string().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { criarSolicitacaoParceria } = await import("./db");
        const { enviarEmailNovaParceria } = await import("./_core/email");
        
        // Criar solicitação no banco
        await criarSolicitacaoParceria({
          ...input,
          status: "pendente",
        } as any);
        
        // Enviar e-mail de notificação
        await enviarEmailNovaParceria(input);
        
        return { success: true };
      }),

    // Endpoints administrativos
    listar: protectedProcedure
      .input(z.object({
        status: z.enum(["pendente", "aprovado", "rejeitado"]).optional(),
      }).optional())
      .query(async ({ input }) => {
        const { listarSolicitacoesParceria } = await import("./db");
        return listarSolicitacoesParceria(input?.status);
      }),

    aprovar: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { obterSolicitacaoParceriaPorId, atualizarStatusSolicitacao, criarInstituicao, criarMedico } = await import("./db");
        
        // Obter solicitação
        const solicitacao = await obterSolicitacaoParceriaPorId(input);
        if (!solicitacao) throw new Error("Solicitação não encontrada");
        
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
          await criarInstituicao({
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
        }
        
        // Atualizar status da solicitação
        await atualizarStatusSolicitacao(input, "aprovado");
        
        return { success: true };
      }),

    rejeitar: protectedProcedure
      .input(z.object({
        id: z.number(),
        motivo: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { atualizarStatusSolicitacao } = await import("./db");
        await atualizarStatusSolicitacao(input.id, "rejeitado", input.motivo);
        return { success: true };
      }),
  }),

  sugestao: router({
    enviarSugestaoParceiro: publicProcedure
      .input(z.object({
        nomeParceiro: z.string().min(1, "Nome do parceiro é obrigatório"),
        especialidade: z.string().min(1, "Especialidade é obrigatória"),
        municipio: z.string().min(1, "Município é obrigatório"),
      }))
      .mutation(async ({ input }) => {
        const { enviarEmailSugestaoParceiro } = await import("./_core/email");
        
        // Enviar e-mail de sugestão
        await enviarEmailSugestaoParceiro(input);
        
        return { success: true };
      }),
  }),

  usuariosAutorizados: router({
    listar: protectedProcedure.query(async () => {
      const { listarUsuariosAutorizados } = await import("./db");
      return listarUsuariosAutorizados();
    }),

    verificarAcesso: publicProcedure
      .input(z.string().email())
      .query(async ({ input }) => {
        const { obterUsuarioAutorizadoPorEmail } = await import("./db");
        const usuario = await obterUsuarioAutorizadoPorEmail(input);
        if (!usuario || !usuario.ativo) {
          return { autorizado: false, usuario: null };
        }
        return { 
          autorizado: true, 
          usuario: {
            id: usuario.id,
            email: usuario.email,
            nome: usuario.nome,
            nivelAcesso: (usuario as any).nivelAcesso || "visualizador",
          }
        };
      }),

    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        senha: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { obterUsuarioAutorizadoPorEmail } = await import("./db");
        const usuario = await obterUsuarioAutorizadoPorEmail(input.email);
        
        if (!usuario || !usuario.ativo) {
          throw new Error("Credenciais inválidas");
        }
        
        const bcrypt = await import("bcryptjs");
        const senhaValida = await bcrypt.compare(input.senha, usuario.senhaHash);
        
        if (!senhaValida) {
          throw new Error("Credenciais inválidas");
        }
        
        // Criar sessão para usuário interno (diferente do admin)
        const jwt = await import("jsonwebtoken");
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
        const { getSessionCookieOptions } = await import("./_core/cookies");
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
        const { getSessionCookieOptions } = await import("./_core/cookies");
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
        const { criarUsuarioAutorizado } = await import("./db");
        await criarUsuarioAutorizado(input);
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
        const { atualizarUsuarioAutorizado } = await import("./db");
        const { id, ...data } = input;
        await atualizarUsuarioAutorizado(id, data);
        return { success: true };
      }),

    excluir: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { excluirUsuarioAutorizado } = await import("./db");
        await excluirUsuarioAutorizado(input);
        return { success: true };
      }),

    resetarSenha: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { resetarSenhaUsuario } = await import("./db");
        // Gerar nova senha temporária
        const novaSenha = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        await resetarSenhaUsuario(input, novaSenha);
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
        
        const jwt = await import("jsonwebtoken");
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        const { obterUsuarioAutorizadoPorId, alterarSenhaUsuario } = await import("./db");
        const usuario = await obterUsuarioAutorizadoPorId(decoded.userId);
        
        if (!usuario) {
          throw new Error("Usuário não encontrado");
        }
        
        // Verificar senha atual
        const bcrypt = await import("bcryptjs");
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
        const { gerarTokenAtualizacao, obterMedicoPorId, obterInstituicaoPorId } = await import("./db");
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
        
        const baseUrl = process.env.VITE_FRONTEND_FORGE_API_URL?.replace("/api", "") || "";
        const link = `${baseUrl}/atualizar-dados/${token}`;
        
        return { token, link, nome };
      }),
    
    obterPorToken: publicProcedure
      .input(z.string())
      .query(async ({ input }) => {
        const { obterCredenciadoPorToken } = await import("./db");
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
        const { obterCredenciadoPorToken, criarSolicitacaoAtualizacao } = await import("./db");
        
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
    
    listar: protectedProcedure
      .input(z.object({
        status: z.enum(["pendente", "aprovado", "rejeitado"]).optional(),
      }).optional())
      .query(async ({ input }) => {
        const { listarSolicitacoesAtualizacao } = await import("./db");
        return listarSolicitacoesAtualizacao(input?.status);
      }),
    
    aprovar: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { aprovarSolicitacaoAtualizacao } = await import("./db");
        await aprovarSolicitacaoAtualizacao(input);
        return { success: true };
      }),
    
    rejeitar: protectedProcedure
      .input(z.object({
        id: z.number(),
        motivo: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { rejeitarSolicitacaoAtualizacao } = await import("./db");
        await rejeitarSolicitacaoAtualizacao(input.id, input.motivo);
        return { success: true };
      }),
  }),

  // Solicitações de Acesso
  solicitacoesAcesso: router({
    criar: publicProcedure
      .input(z.object({
        nome: z.string().min(3),
        email: z.string().email(),
        telefone: z.string().optional(),
        justificativa: z.string().min(10),
      }))
      .mutation(async ({ input }) => {
        const { criarSolicitacaoAcesso } = await import("./db");
        await criarSolicitacaoAcesso(input);
        return { success: true };
      }),

    listar: protectedProcedure
      .query(async () => {
        const { listarSolicitacoesAcesso } = await import("./db");
        return listarSolicitacoesAcesso();
      }),

    aprovar: protectedProcedure
      .input(z.number())
      .mutation(async ({ input }) => {
        const { aprovarSolicitacaoAcesso, criarUsuarioAutorizado } = await import("./db");
        
        // Gerar senha temporária
        const senhaTemporaria = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
        
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
        const { rejeitarSolicitacaoAcesso } = await import("./db");
        await rejeitarSolicitacaoAcesso(input.id, input.motivo);
        return { success: true };
      }),
  }),

  // Recuperação de Senha
  recuperacaoSenha: router({
    solicitar: publicProcedure
      .input(z.string().email())
      .mutation(async ({ input }) => {
        const { obterUsuarioAutorizadoPorEmail, criarTokenRecuperacao } = await import("./db");
        
        const usuario = await obterUsuarioAutorizadoPorEmail(input);
        if (!usuario) {
          // Não revelar se o email existe ou não
          return { success: true };
        }
        
        // Gerar token único
        const crypto = await import("crypto");
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 3600000); // 1 hora
        
        await criarTokenRecuperacao(usuario.id, token, expiresAt);
        
        // TODO: Enviar email com link de recuperação
        
        return { success: true };
      }),

    verificarToken: publicProcedure
      .input(z.string())
      .query(async ({ input }) => {
        const { obterTokenRecuperacao } = await import("./db");
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
        const { obterTokenRecuperacao, marcarTokenComoUsado, alterarSenhaUsuario } = await import("./db");
        
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
      const { obterEstatisticasCobertura } = await import("./db");
      return await obterEstatisticasCobertura();
    }),
    especialidadesUnicas: protectedProcedure.query(async () => {
      const { obterEspecialidadesUnicas } = await import("./db");
      return await obterEspecialidadesUnicas();
    }),
    categoriasUnicas: protectedProcedure.query(async () => {
      const { obterCategoriasUnicas } = await import("./db");
      return await obterCategoriasUnicas();
    }),
  }),

  // Rotas de configurações do sistema
  configuracoes: router({
    // Listar todas as configurações
    listar: protectedProcedure.query(async () => {
      const { listarConfiguracoes } = await import("./db");
      return await listarConfiguracoes();
    }),

    // Buscar configuração por chave
    buscarPorChave: publicProcedure
      .input(z.object({ chave: z.string() }))
      .query(async ({ input }) => {
        const { buscarConfiguracaoPorChave } = await import("./db");
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
        const { atualizarConfiguracao } = await import("./db");
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
      const { listarTemplatesWhatsapp } = await import("./db");
      return await listarTemplatesWhatsapp();
    }),

    criar: protectedProcedure
      .input(z.object({
        nome: z.string(),
        tipo: z.enum(["cliente", "parceiro", "comercial"]),
        mensagem: z.string(),
      }))
      .mutation(async ({ input }) => {
        const { criarTemplateWhatsapp } = await import("./db");
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
        const { atualizarTemplateWhatsapp } = await import("./db");
        return await atualizarTemplateWhatsapp(id, data);
      }),

    deletar: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const { deletarTemplateWhatsapp } = await import("./db");
        return await deletarTemplateWhatsapp(input.id);
      }),
  }),

  // Notificações Semestrais
  notificacoes: router({
    listarDesatualizados: protectedProcedure.query(async () => {
      const { listarCredenciadosDesatualizados } = await import("./db");
      return await listarCredenciadosDesatualizados();
    }),

    enviarTodas: protectedProcedure.mutation(async () => {
      const { enviarNotificacoesSemestrais } = await import("./db");
      return await enviarNotificacoesSemestrais();
    }),

    enviarIndividual: protectedProcedure
      .input(z.object({
        tipo: z.enum(["medico", "instituicao"]),
        id: z.number(),
      }))
      .mutation(async ({ input }) => {
        const { enviarNotificacaoSemestral } = await import("./db");
        return await enviarNotificacaoSemestral(input.tipo, input.id);
      }),
  }),

  // Router de copys (textos editáveis)
  copys: router({
    listar: publicProcedure.query(async () => {
      const { listarCopys } = await import("./db");
      return await listarCopys();
    }),

    criar: protectedProcedure
      .input(z.object({
        titulo: z.string(),
        conteudo: z.string(),
        categoria: z.enum(["planos", "promocoes", "outros"]),
        ordem: z.number().default(0),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Apenas administradores podem criar copys");
        }
        const { criarCopy } = await import("./db");
        await criarCopy({
          ...input,
          updatedBy: ctx.user.email || ctx.user.name || "admin",
        });
        return { success: true };
      }),

    atualizar: protectedProcedure
      .input(z.object({
        id: z.number(),
        titulo: z.string().optional(),
        conteudo: z.string().optional(),
        categoria: z.enum(["planos", "promocoes", "outros"]).optional(),
        ordem: z.number().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Apenas administradores podem atualizar copys");
        }
        const { atualizarCopy } = await import("./db");
        const { id, ...data } = input;
        await atualizarCopy(id, {
          ...data,
          updatedBy: ctx.user.email || ctx.user.name || "admin",
        });
        return { success: true };
      }),

    excluir: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Apenas administradores podem excluir copys");
        }
        const { excluirCopy } = await import("./db");
        await excluirCopy(input.id);
        return { success: true };
      }),
  }),

  // ========== AVALIAÇÕES ==========
  avaliacoes: router({
    criar: publicProcedure
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
        const { criarAvaliacao } = await import("./db");
        const { notifyOwner } = await import("./_core/notification");
        
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

    listar: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Apenas administradores podem visualizar avaliações");
        }
        const { listarAvaliacoes } = await import("./db");
        return await listarAvaliacoes();
      }),

    listarPorCredenciado: protectedProcedure
      .input(z.object({
        tipoCredenciado: z.enum(["medico", "instituicao"]),
        credenciadoId: z.number(),
      }))
      .query(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Apenas administradores podem visualizar avaliações");
        }
        const { listarAvaliacoesPorCredenciado } = await import("./db");
        return await listarAvaliacoesPorCredenciado(input.tipoCredenciado, input.credenciadoId);
      }),

    estatisticas: protectedProcedure
      .query(async ({ ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Apenas administradores podem visualizar estatísticas");
        }
        const { estatisticasAvaliacoes } = await import("./db");
        return await estatisticasAvaliacoes();
      }),
  }),

  // ========== TOKENS ==========
  tokens: router({    
    // Criar token para atualização de dados
    criar: protectedProcedure
      .input(z.object({
        tipoCredenciado: z.enum(["medico", "instituicao"]),
        credenciadoId: z.number(),
        email: z.string().email().optional(),
        telefone: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Apenas administradores podem gerar tokens");
        }
        const { criarToken } = await import("./db");
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
    criarCadastro: protectedProcedure
      .input(z.object({
        tipoCredenciado: z.enum(["medico", "instituicao"]),
        email: z.string().email().optional(),
        telefone: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Apenas administradores podem gerar tokens");
        }
        const { criarToken } = await import("./db");
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
        const { verificarToken } = await import("./db");
        return await verificarToken(input.token);
      }),

    // Marcar token como usado
    marcarUsado: publicProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ input }) => {
        const { marcarTokenUsado } = await import("./db");
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
        const { listarProcedimentos } = await import("./db");
        return await listarProcedimentos(input?.instituicaoId);
      }),

    criar: protectedProcedure
      .input(z.object({
        instituicaoId: z.number(),
        nome: z.string().min(1, "Nome do procedimento é obrigatório"),
        valorParticular: z.string().optional(),
        valorAssinanteVital: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Apenas administradores podem criar procedimentos");
        }
        const { criarProcedimento } = await import("./db");
        const id = await criarProcedimento(input);
        return { id, success: true };
      }),

    atualizar: protectedProcedure
      .input(z.object({
        id: z.number(),
        nome: z.string().optional(),
        valorParticular: z.string().optional(),
        valorAssinanteVital: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Apenas administradores podem atualizar procedimentos");
        }
        const { atualizarProcedimento } = await import("./db");
        const { id, ...data } = input;
        await atualizarProcedimento(id, data);
        return { success: true };
      }),

    excluir: protectedProcedure
      .input(z.number())
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Apenas administradores podem excluir procedimentos");
        }
        const { excluirProcedimento } = await import("./db");
        await excluirProcedimento(input);
        return { success: true };
      }),
  }),

  // ========== UPLOAD DE IMAGENS ==========
  upload: router({
    imagem: protectedProcedure
      .input(z.object({
        base64: z.string(),
        filename: z.string(),
        contentType: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Apenas administradores podem fazer upload de imagens");
        }
        
        const { storagePut } = await import("./storage");
        
        // Remover prefixo data:image/...;base64, se existir
        const base64Data = input.base64.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        
        // Gerar nome único para o arquivo
        const timestamp = Date.now();
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        const extension = input.filename.split(".").pop() || "jpg";
        const uniqueFilename = `credenciados/${timestamp}-${randomSuffix}.${extension}`;
        
        // Upload para S3
        const result = await storagePut(uniqueFilename, buffer, input.contentType);
        
        return { url: result.url };
      }),
  }),

});

export type AppRouter = typeof appRouter;
