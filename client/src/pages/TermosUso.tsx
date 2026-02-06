import { APP_TITLE } from "@/const";

export default function TermosUso() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-50 to-white">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold text-teal-700 mb-8">
          Termos de Uso
        </h1>

        <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              1. Aceitação dos Termos
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Ao acessar e utilizar a plataforma {APP_TITLE}, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deverá utilizar nossa plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              2. Descrição do Serviço
            </h2>
            <p className="text-gray-700 leading-relaxed">
              A {APP_TITLE} é uma plataforma digital que conecta assinantes a uma rede de profissionais de saúde e estabelecimentos credenciados. Nossos serviços incluem:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4 mt-3">
              <li>Consulta de médicos e serviços de saúde credenciados</li>
              <li>Informações sobre especialidades, endereços e contatos</li>
              <li>Facilitação de agendamentos e comunicação</li>
              <li>Sistema de avaliações e feedback</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              3. Cadastro e Conta de Usuário
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Para acessar determinadas funcionalidades, você pode precisar criar uma conta. Ao criar uma conta, você concorda em:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Fornecer informações verdadeiras, precisas e atualizadas</li>
              <li>Manter a confidencialidade de suas credenciais de acesso</li>
              <li>Notificar-nos imediatamente sobre qualquer uso não autorizado</li>
              <li>Ser responsável por todas as atividades realizadas em sua conta</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              4. Uso Aceitável
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Você concorda em utilizar nossa plataforma apenas para fins legítimos e de acordo com estes Termos. É proibido:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Violar qualquer lei ou regulamento aplicável</li>
              <li>Infringir direitos de propriedade intelectual</li>
              <li>Transmitir conteúdo ofensivo, difamatório ou ilegal</li>
              <li>Interferir no funcionamento da plataforma</li>
              <li>Coletar dados de outros usuários sem consentimento</li>
              <li>Utilizar a plataforma para fins comerciais não autorizados</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              5. Credenciados e Serviços de Saúde
            </h2>
            <p className="text-gray-700 leading-relaxed">
              A {APP_TITLE} atua como intermediária entre assinantes e profissionais de saúde credenciados. Não somos responsáveis pela qualidade, segurança ou legalidade dos serviços prestados pelos credenciados. A relação médico-paciente é estabelecida diretamente entre você e o profissional de saúde.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Recomendamos que você verifique as credenciais e qualificações dos profissionais antes de utilizar seus serviços.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              6. Propriedade Intelectual
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Todo o conteúdo da plataforma, incluindo textos, gráficos, logos, ícones, imagens, áudio, vídeo e software, é propriedade da {APP_TITLE} ou de seus licenciadores e está protegido por leis de direitos autorais e outras leis de propriedade intelectual.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Você não pode reproduzir, distribuir, modificar ou criar obras derivadas sem nossa autorização expressa por escrito.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              7. Avaliações e Comentários
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Ao enviar avaliações, comentários ou outros conteúdos para nossa plataforma, você concede à {APP_TITLE} uma licença mundial, não exclusiva, livre de royalties para usar, reproduzir, modificar e exibir esse conteúdo.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              Você é responsável pelo conteúdo que publica e garante que possui todos os direitos necessários. Reservamo-nos o direito de remover qualquer conteúdo que viole estes Termos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              8. Isenção de Garantias
            </h2>
            <p className="text-gray-700 leading-relaxed">
              A plataforma é fornecida "como está" e "conforme disponível", sem garantias de qualquer tipo, expressas ou implícitas. Não garantimos que a plataforma será ininterrupta, segura ou livre de erros.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              9. Limitação de Responsabilidade
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Na extensão máxima permitida por lei, a {APP_TITLE} não será responsável por quaisquer danos diretos, indiretos, incidentais, especiais ou consequenciais resultantes do uso ou incapacidade de usar nossa plataforma.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              10. Modificações dos Termos
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Reservamo-nos o direito de modificar estes Termos de Uso a qualquer momento. As alterações entrarão em vigor imediatamente após sua publicação na plataforma. Seu uso contínuo da plataforma após as alterações constitui aceitação dos novos termos.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              11. Rescisão
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Podemos suspender ou encerrar seu acesso à plataforma a qualquer momento, sem aviso prévio, por violação destes Termos ou por qualquer outro motivo que considerarmos apropriado.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              12. Lei Aplicável e Jurisdição
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Estes Termos serão regidos e interpretados de acordo com as leis da República Federativa do Brasil. Qualquer disputa decorrente destes Termos será submetida à jurisdição exclusiva dos tribunais brasileiros.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              13. Disposições Gerais
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Se qualquer disposição destes Termos for considerada inválida ou inexequível, as demais disposições permanecerão em pleno vigor e efeito. Nossa falha em fazer cumprir qualquer direito ou disposição não constituirá renúncia a esse direito ou disposição.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-teal-600 mb-4">
              14. Contato
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Para questões sobre estes Termos de Uso, entre em contato conosco:
            </p>
            <div className="mt-4 p-4 bg-teal-50 rounded-lg">
              <p className="text-gray-700"><strong>E-mail:</strong> <a href="mailto:comercial@suasaudevital.com.br" className="text-teal-600 hover:underline">comercial@suasaudevital.com.br</a></p>
              <p className="text-gray-700"><strong>Telefone:</strong> (47) 93385-3726</p>
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
