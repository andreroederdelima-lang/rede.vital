import { APP_LOGO, APP_TITLE } from "@/const";

export default function TermosDeUso() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-amber-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt={APP_TITLE} className="h-12" />
            <div>
              <h1 className="text-xl font-bold text-teal-700">{APP_TITLE}</h1>
              <p className="text-sm text-gray-600">Termos de Credenciamento</p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <div className="prose prose-teal max-w-none">
            <h1 className="text-3xl font-bold text-teal-700 mb-6">
              ✅ TERMO DE CREDENCIAMENTO E USO DE SISTEMAS – SUA SAÚDE VITAL / VITAL AMBULÂNCIAS
            </h1>

            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6">
              <p className="font-semibold text-amber-900">VERSÃO OPT-IN (para aceite online)</p>
              <p className="text-amber-800 mt-2">
                Ao prosseguir com o cadastro, o profissional declara ter lido e aceito integralmente este termo.
              </p>
            </div>

            <hr className="my-6" />

            <h2 className="text-2xl font-bold text-teal-700 mt-8 mb-4">1. APRESENTAÇÃO</h2>
            <p>
              Este Termo regula o credenciamento, participação e uso dos sistemas, páginas, plataformas e canais da Sua Saúde Vital / Vital Ambulâncias ("Vital") por médicos, profissionais de saúde, clínicas e estabelecimentos parceiros.
            </p>
            <p>
              Ao confirmar o opt-in neste formulário, o Parceiro concorda com todas as cláusulas abaixo.
            </p>

            <hr className="my-6" />

            <h2 className="text-2xl font-bold text-teal-700 mt-8 mb-4">2. OBJETO</h2>
            <p>Este termo tem como objetivo:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>Regular o credenciamento do Parceiro na rede Vital;</li>
              <li>Definir direitos e responsabilidades do Parceiro;</li>
              <li>Autorizar o uso dos sistemas e plataformas Vital;</li>
              <li>Autorizar a divulgação institucional do Parceiro na rede credenciada;</li>
              <li>Estabelecer regras comerciais, éticas e operacionais aplicáveis.</li>
            </ol>

            <hr className="my-6" />

            <h2 className="text-2xl font-bold text-teal-700 mt-8 mb-4">3. DADOS QUE SERÃO PUBLICADOS AO CLIENTE VITAL</h2>
            <p>Ao aceitar este termo, o Parceiro autoriza a exibição pública dos seguintes dados:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Nome do profissional</li>
              <li>CRM ou registro profissional</li>
              <li>Especialidade</li>
              <li>Endereço do atendimento</li>
              <li>Telefone / WhatsApp comercial</li>
              <li>Percentual de desconto Vital</li>
              <li>Foto profissional</li>
            </ul>
            <p className="mt-4">O Parceiro declara que todos os dados fornecidos são verdadeiros.</p>

            <hr className="my-6" />

            <h2 className="text-2xl font-bold text-teal-700 mt-8 mb-4">4. RESPONSABILIDADES DO PARCEIRO</h2>
            <p>O Parceiro concorda em:</p>

            <h3 className="text-xl font-semibold text-teal-600 mt-6 mb-3">4.1. Manter regularidade profissional</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>possuir registro ativo no conselho competente;</li>
              <li>possuir RQE para anunciar especialidade médica (quando aplicável);</li>
              <li>manter alvarás e documentos atualizados.</li>
            </ul>

            <h3 className="text-xl font-semibold text-teal-600 mt-6 mb-3">4.2. Atuar com ética e alinhamento à cultura Vital</h3>
            <p>Compromisso com:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>humanização,</li>
              <li>cordialidade,</li>
              <li>qualidade assistencial,</li>
              <li>respeito ao paciente,</li>
              <li>boa comunicação com a equipe.</li>
            </ul>

            <h3 className="text-xl font-semibold text-teal-600 mt-6 mb-3">4.3. Aplicar corretamente o desconto Vital</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Desconto mínimo obrigatório: 10% para clientes Vital.</li>
              <li>É proibida a cobrança de valores divergentes do que constar no cadastro.</li>
            </ul>

            <h3 className="text-xl font-semibold text-teal-600 mt-6 mb-3">4.4. Emitir nota fiscal ou recibo quando solicitado.</h3>

            <h3 className="text-xl font-semibold text-teal-600 mt-6 mb-3">4.5. Comunicar alterações</h3>
            <p>
              O Parceiro deve comunicar à Vital, com 15 dias de antecedência, via{" "}
              <a href="mailto:administrativo@suasaudevital.com.br" className="text-teal-600 underline">
                administrativo@suasaudevital.com.br
              </a>
              , nas seguintes situações:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>mudança de valores ou reajustes;</li>
              <li>alteração do percentual de desconto;</li>
              <li>mudança de endereço, telefone ou WhatsApp comercial;</li>
              <li>alteração de agenda, horários, interrupções temporárias;</li>
              <li>entrada ou saída de profissionais vinculados;</li>
              <li>suspensão dos atendimentos por mais de 15 dias.</li>
            </ul>
            <p className="mt-4 font-semibold">Este item é obrigatório.</p>

            <h3 className="text-xl font-semibold text-teal-600 mt-6 mb-3">4.6. Responsabilidade técnica integral do Parceiro</h3>
            <p>Incluindo:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>condutas,</li>
              <li>prescrições,</li>
              <li>prontuário,</li>
              <li>sigilo profissional,</li>
              <li>intercorrências.</li>
            </ul>
            <p className="mt-4">A Vital não responde por atos assistenciais do Parceiro.</p>

            <hr className="my-6" />

            <h2 className="text-2xl font-bold text-teal-700 mt-8 mb-4">5. RESPONSABILIDADES DA VITAL</h2>
            <p>A Vital compromete-se a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>divulgar o Parceiro na rede credenciada;</li>
              <li>garantir que seus dados apareçam corretamente ao público;</li>
              <li>manter sistemas e páginas funcionais com razoabilidade;</li>
              <li>oferecer suporte administrativo;</li>
              <li>prover atendimento pré-hospitalar eletivo com equipe de enfermagem e regulação médica 24h (USB), sem promessa de tempo de chegada, exclusivamente em caráter eletivo.</li>
            </ul>

            <hr className="my-6" />

            <h2 className="text-2xl font-bold text-teal-700 mt-8 mb-4">6. AMBULÂNCIA E SERVIÇOS PRÉ-HOSPITALARES</h2>
            <p>O Parceiro declara ciência de que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>a ambulância Vital é de suporte básico (USB);</li>
              <li>o atendimento é eletivo, mediante regulação médica;</li>
              <li>não há promessa de tempo de chegada;</li>
              <li>não se trata de serviço de urgência/emergência.</li>
            </ul>

            <hr className="my-6" />

            <h2 className="text-2xl font-bold text-teal-700 mt-8 mb-4">7. USO DOS SISTEMAS E FERRAMENTAS VITAL</h2>
            <p>
              O Parceiro recebe licença limitada, não exclusiva e intransferível para uso dos sistemas Vital apenas para fins de credenciamento, atualização de cadastro e relacionamento com a rede Vital.
            </p>
            <p className="mt-4">É proibido:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>copiar, reproduzir, redistribuir, capturar ou replicar conteúdo;</li>
              <li>acessar áreas internas de forma indevida;</li>
              <li>permitir acesso a terceiros não autorizados.</li>
            </ul>

            <hr className="my-6" />

            <h2 className="text-2xl font-bold text-teal-700 mt-8 mb-4">8. PRIVACIDADE, SIGILO E LGPD</h2>
            <p>O Parceiro se compromete a:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>tratar dados dos pacientes conforme LGPD;</li>
              <li>manter sigilo de informações sensíveis;</li>
              <li>proteger suas credenciais de acesso;</li>
              <li>armazenar prontuário próprio (a Vital não armazena prontuário médico).</li>
            </ul>
            <p className="mt-4">A Vital manterá os dados cadastrais do Parceiro de forma segura.</p>

            <hr className="my-6" />

            <h2 className="text-2xl font-bold text-teal-700 mt-8 mb-4">9. FLUXO DE AGENDAMENTO</h2>
            <p>O Parceiro concorda que:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>o agendamento será realizado diretamente pela clínica, via WhatsApp comercial ou telefone;</li>
              <li>a Vital não interfere na organização da agenda da clínica.</li>
            </ul>

            <hr className="my-6" />

            <h2 className="text-2xl font-bold text-teal-700 mt-8 mb-4">10. DESVINCULAÇÃO E PENALIDADES</h2>
            <p>O Parceiro poderá ser descredenciado imediatamente em caso de:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>falha ética grave;</li>
              <li>repetidas reclamações fundamentadas;</li>
              <li>descumprimento do desconto acordado;</li>
              <li>preços divergentes;</li>
              <li>negativa injustificada de atendimento;</li>
              <li>uso indevido da marca Vital;</li>
              <li>fornecimento de informações falsas;</li>
              <li>risco à imagem institucional.</li>
            </ul>
            <p className="mt-4">A Vital pode suspender ou remover o cadastro sem aviso prévio.</p>

            <hr className="my-6" />

            <h2 className="text-2xl font-bold text-teal-700 mt-8 mb-4">11. AUSÊNCIA DE VÍNCULO</h2>
            <p>
              Este termo não cria vínculo trabalhista, societário ou de subordinação entre o Parceiro e a Vital.
              O Parceiro atua como profissional autônomo e independente.
            </p>

            <hr className="my-6" />

            <h2 className="text-2xl font-bold text-teal-700 mt-8 mb-4">12. ALTERAÇÕES DO TERMO</h2>
            <p>
              A Vital poderá atualizar este termo a qualquer momento.
              A versão vigente será sempre a publicada no site.
            </p>

            <hr className="my-6" />

            <h2 className="text-2xl font-bold text-teal-700 mt-8 mb-4">13. FORO</h2>
            <p>Fica eleito o foro da comarca de Timbó/SC.</p>

            <hr className="my-6" />

            <div className="bg-teal-50 border-l-4 border-teal-500 p-6 mt-8">
              <h2 className="text-2xl font-bold text-teal-700 mb-4">✔️ DECLARAÇÃO DE ACEITE (OPT-IN)</h2>
              <p className="mb-4">Ao prosseguir com o cadastro, o Parceiro declara que:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>leu e aceitou integralmente este Termo;</li>
                <li>confirma que seus dados são verdadeiros;</li>
                <li>compromete-se a cumprir todas as regras aqui estabelecidas;</li>
                <li>autoriza a exibição pública de suas informações profissionais;</li>
                <li>reconhece sua autonomia técnica e ausência de vínculo com a Vital.</li>
              </ul>
              <p className="mt-6 font-bold text-teal-900 text-lg">
                "LI E ACEITO OS TERMOS DE CREDENCIAMENTO E USO DOS SISTEMAS VITAL."
              </p>
              <p className="mt-4 text-sm text-teal-700">(Checkbox obrigatório no formulário.)</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-teal-700 text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm">
            © {new Date().getFullYear()} Sua Saúde Vital / Vital Ambulâncias. Todos os direitos reservados.
          </p>
          <p className="text-sm mt-2">
            Dúvidas? Entre em contato:{" "}
            <a href="mailto:administrativo@suasaudevital.com.br" className="underline">
              administrativo@suasaudevital.com.br
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
