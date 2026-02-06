import { APP_TITLE } from "@/const";

export default function PoliticaPrivacidade() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-teal-700 mb-8">
          Política de Privacidade
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              1. Informações Gerais
            </h2>
            <p className="text-gray-700 leading-relaxed">
              A {APP_TITLE} ("nós", "nosso" ou "nos") está comprometida em proteger e respeitar sua privacidade. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações pessoais quando você utiliza nossa plataforma de credenciados.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018) e demais legislações aplicáveis.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              2. Informações que Coletamos
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Podemos coletar e processar os seguintes tipos de informações:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Informações de Identificação:</strong> Nome, CPF, RG, data de nascimento</li>
              <li><strong>Informações de Contato:</strong> Endereço, telefone, e-mail</li>
              <li><strong>Informações Profissionais:</strong> CRM, especialidade médica, registro profissional</li>
              <li><strong>Informações de Uso:</strong> Dados de navegação, endereço IP, tipo de dispositivo</li>
              <li><strong>Informações de Saúde:</strong> Apenas quando necessário para prestação de serviços médicos</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              3. Como Usamos Suas Informações
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Utilizamos suas informações pessoais para:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Fornecer acesso à rede de credenciados</li>
              <li>Processar solicitações de cadastro de parceiros</li>
              <li>Facilitar agendamentos e consultas</li>
              <li>Enviar comunicações sobre serviços e atualizações</li>
              <li>Melhorar nossos serviços e experiência do usuário</li>
              <li>Cumprir obrigações legais e regulatórias</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              4. Compartilhamento de Informações
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Não vendemos, alugamos ou compartilhamos suas informações pessoais com terceiros para fins de marketing. Podemos compartilhar suas informações apenas nas seguintes situações:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-3">
              <li>Com profissionais de saúde credenciados para prestação de serviços</li>
              <li>Com prestadores de serviços que nos auxiliam nas operações</li>
              <li>Quando exigido por lei ou ordem judicial</li>
              <li>Para proteger nossos direitos legais</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              5. Segurança dos Dados
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Implementamos medidas técnicas e organizacionais adequadas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-3">
              <li>Criptografia de dados em trânsito e em repouso</li>
              <li>Controles de acesso rigorosos</li>
              <li>Monitoramento contínuo de segurança</li>
              <li>Treinamento regular de nossa equipe</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              6. Seus Direitos (LGPD)
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              De acordo com a LGPD, você tem os seguintes direitos:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li><strong>Confirmação e Acesso:</strong> Confirmar se tratamos seus dados e acessá-los</li>
              <li><strong>Correção:</strong> Corrigir dados incompletos, inexatos ou desatualizados</li>
              <li><strong>Anonimização ou Bloqueio:</strong> Solicitar anonimização ou bloqueio de dados desnecessários</li>
              <li><strong>Eliminação:</strong> Solicitar eliminação de dados tratados com seu consentimento</li>
              <li><strong>Portabilidade:</strong> Solicitar portabilidade de dados a outro fornecedor</li>
              <li><strong>Revogação do Consentimento:</strong> Revogar consentimento a qualquer momento</li>
              <li><strong>Oposição:</strong> Opor-se ao tratamento de dados</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              Para exercer seus direitos, entre em contato conosco através do e-mail: <a href="mailto:privacidade@suasaudevital.com.br" className="text-teal-600 hover:underline">privacidade@suasaudevital.com.br</a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              7. Retenção de Dados
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Retemos suas informações pessoais apenas pelo tempo necessário para cumprir as finalidades descritas nesta política, a menos que um período de retenção mais longo seja exigido ou permitido por lei.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              8. Cookies e Tecnologias Similares
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Utilizamos cookies e tecnologias similares para melhorar sua experiência em nossa plataforma, analisar o uso e personalizar conteúdo. Você pode configurar seu navegador para recusar cookies, mas isso pode afetar algumas funcionalidades.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              9. Menores de Idade
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Nossa plataforma não é direcionada a menores de 18 anos. Não coletamos intencionalmente informações de menores sem o consentimento dos pais ou responsáveis legais.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              10. Alterações nesta Política
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre alterações significativas por e-mail ou através de aviso em nossa plataforma. A data da última atualização será sempre indicada no início desta política.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              11. Contato
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Se você tiver dúvidas sobre esta Política de Privacidade ou sobre o tratamento de seus dados pessoais, entre em contato conosco:
            </p>
            <div className="mt-4 p-4 bg-teal-50 rounded-lg">
              <p className="text-gray-700"><strong>E-mail:</strong> <a href="mailto:privacidade@suasaudevital.com.br" className="text-teal-600 hover:underline">privacidade@suasaudevital.com.br</a></p>
              <p className="text-gray-700"><strong>Telefone:</strong> (47) 93385-3726</p>
              <p className="text-gray-700"><strong>Encarregado de Dados (DPO):</strong> A definir</p>
            </div>
          </section>

          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500 text-center">
              Última atualização: 06 de Fevereiro de 2026
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
