import { APP_TITLE } from "@/const";

const ULTIMA_ATUALIZACAO = "06 de Maio de 2026";
const EMAIL_CONTATO = "administrativo@suasaudevital.com.br";
const WHATSAPP_CONTATO = "(47) 93384-2133";

export default function TermosUso() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-teal-700 mb-3">
          Termo de Parceria
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          Rede {APP_TITLE} de Credenciados
        </p>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <section>
            <p className="text-gray-700 leading-relaxed">
              A {APP_TITLE} mantém uma rede de profissionais e estabelecimentos parceiros para oferecer aos clientes Vital atendimento com condições diferenciadas. Este termo formaliza nossa parceria de forma simples e transparente — sem complicação, sem letras miúdas.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              1. O que vai aparecer sobre você na plataforma
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Ao se cadastrar, você autoriza a publicação dos seguintes dados para os clientes Vital (no site e em materiais de divulgação da rede):
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Nome profissional ou nome do estabelecimento</li>
              <li>Especialidade ou categoria de serviço</li>
              <li>Foto profissional ou logo do estabelecimento</li>
              <li>Endereço do consultório / estabelecimento</li>
              <li>Telefone do consultório</li>
              <li>WhatsApp para agendamento (visível para os clientes entrarem em contato)</li>
            </ul>
            <div className="mt-4 p-4 bg-teal-50 border-l-4 border-teal-500 rounded">
              <p className="text-gray-800 leading-relaxed">
                <strong>🔒 Valores e descontos NÃO ficam visíveis na plataforma pública.</strong> As informações de preço que você fornecer aparecem apenas para a equipe Vital (vendedores e consultores), que orientam os clientes assinantes no momento do atendimento.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              2. Seus compromissos como parceiro
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Pra parceria funcionar bem para todos, você se compromete a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Manter os valores informados — avisar com antecedência razoável se mudar (preço da consulta, serviços, desconto Vital)</li>
              <li>Avisar se mudar telefone, endereço, horário ou disponibilidade</li>
              <li>Aplicar o desconto Vital aos clientes que se identificarem como assinantes (sugerimos um mínimo de 10%)</li>
              <li>Manter sua atuação dentro do que está cadastrado (especialidade, serviços ofertados)</li>
              <li>Tratar os clientes Vital com a mesma qualidade e atenção que oferece aos demais pacientes</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              Tudo isso é resolvido em 1 minuto pelo seu painel de credenciado ou diretamente com a equipe Vital pelo e-mail{" "}
              <a href={`mailto:${EMAIL_CONTATO}`} className="text-teal-600 hover:underline">
                {EMAIL_CONTATO}
              </a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              3. Uso de imagem e marca
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Você autoriza a {APP_TITLE} a:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Exibir sua foto/logo no site e em materiais de divulgação da rede</li>
              <li>Mencionar você em campanhas (redes sociais, anúncios online, materiais impressos)</li>
              <li>Usar seu nome como integrante da Rede Vital de Credenciados</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              A autorização é gratuita e vale enquanto você for parceiro ativo. Se quiser sair da rede, basta avisar — todo o material é removido.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              4. Saída da parceria
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Você pode encerrar a parceria a qualquer momento, sem multa e sem burocracia. Basta um e-mail para{" "}
              <a href={`mailto:${EMAIL_CONTATO}`} className="text-teal-600 hover:underline">
                {EMAIL_CONTATO}
              </a>{" "}
              solicitando o descadastro. Removemos seus dados da plataforma em até 7 dias úteis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              5. Proteção de dados (LGPD)
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>A {APP_TITLE} trata seus dados de cadastro de acordo com a Lei Geral de Proteção de Dados (Lei 13.709/2018)</li>
              <li>Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento via {EMAIL_CONTATO}</li>
              <li>Não compartilhamos seus dados com terceiros sem sua autorização</li>
              <li>Você é responsável pelos dados dos seus pacientes — a {APP_TITLE} não armazena prontuário médico</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              6. Relação comercial
            </h2>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Este termo não cria vínculo trabalhista nem societário entre você e a {APP_TITLE}</li>
              <li>Você atua como profissional autônomo ou estabelecimento independente</li>
              <li>A {APP_TITLE} não interfere na sua agenda, condutas profissionais ou prescrições</li>
              <li>A relação com o paciente é estabelecida diretamente entre você e ele</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              7. Atualizações deste termo
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Se este termo precisar ser atualizado, avisamos os parceiros por e-mail com antecedência razoável. A versão vigente é sempre a publicada nesta página.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              8. Contato e foro
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Dúvidas, alterações ou solicitações:
            </p>
            <div className="p-4 bg-teal-50 rounded-lg space-y-1">
              <p className="text-gray-700">
                <strong>E-mail:</strong>{" "}
                <a href={`mailto:${EMAIL_CONTATO}`} className="text-teal-600 hover:underline">
                  {EMAIL_CONTATO}
                </a>
              </p>
              <p className="text-gray-700">
                <strong>WhatsApp:</strong> {WHATSAPP_CONTATO}
              </p>
            </div>
            <p className="text-gray-700 leading-relaxed mt-4">
              Em caso de divergência que não seja resolvida amigavelmente, fica eleito o foro da comarca de Timbó/SC.
            </p>
          </section>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Última atualização: {ULTIMA_ATUALIZACAO}
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Voltar para o Início
          </a>
        </div>
      </div>
    </div>
  );
}
