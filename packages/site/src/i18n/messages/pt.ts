import type { Messages } from '@/i18n/messages/es';

export const pt: Messages = {
  'meta.title': 'Stellar Snap · Stellar e Soroban no MetaMask',
  'meta.description':
    'O Stellar Snap adiciona contas Stellar e Soroban ao MetaMask: envie, receba, troque e assine sem instalar outra wallet. Para mainnet, testnet e futurenet.',

  'nav.skip': 'Pular para o conteúdo',
  'nav.main': 'Principal',
  'nav.language': 'Idioma',
  'nav.donate': 'Doar',
  'link.newTab': '(abre em uma nova aba)',
  'theme.toDark': 'Mudar para o modo escuro',
  'theme.toLight': 'Mudar para o modo claro',

  'suggest.text': 'Esta página também está disponível em português.',
  'suggest.action': 'Ver em português',
  'suggest.dismiss': 'Dispensar',

  'hero.eyebrow': 'Compatível com Cosmos Wallet e Freighter',
  'hero.title': 'Sua conta *Stellar*, *dentro* do ==MetaMask.==',
  'hero.lead': 'Contas, pagamentos e assinaturas da Stellar e do Soroban sem sair do MetaMask, com o *Stellar Snap*.',
  'hero.install': 'Instalar no MetaMask',
  'hero.installed': 'Instalado no MetaMask',
  'hero.cta': 'Obter Cosmos Wallet',
  'hero.sponsoredBy': 'Patrocinado por',
  'stats.networks': 'Redes Stellar',
  'stats.api': 'API padrão',
  'stats.extensions': 'Extensões extras',

  'features.eyebrow': 'Recursos',
  'features.title': 'Toda a Stellar, *sem sair do MetaMask.*',
  'features.lead':
    'O *Stellar Snap* adiciona ao MetaMask uma wallet Stellar completa, com tela própria dentro da extensão.',
  'features.accounts.title': 'Contas Stellar',
  'features.accounts.text':
    'Crie várias contas a partir da Frase de Recuperação Secreta do MetaMask, ou importe uma chave secreta ou uma frase de recuperação.',
  'features.payments.title': 'Enviar e receber',
  'features.payments.text':
    'Envie XLM e outros ativos revisando a taxa e o memo antes de assinar, e receba com um código QR.',
  'features.assets.title': 'Ativos e trustlines',
  'features.assets.text':
    'Adicione ativos do registro da Cosmos Pay, ou qualquer outro pelo código e emissor, e remova-os quando não usar mais.',
  'features.swaps.title': 'Trocas',
  'features.swaps.text':
    'Troque ativos na DEX da Stellar com cotações da Cosmos Pay. O Snap verifica cada transação antes de pedir sua assinatura.',
  'features.soroban.title': 'Soroban e mensagens',
  'features.soroban.text':
    'Assine autorizações de contratos Soroban vendo o contrato, a função e os argumentos, e assine mensagens com SEP-53.',
  'features.evm.title': 'Conta EVM vinculada',
  'features.evm.text':
    'Vincule seu endereço 0x do MetaMask à sua conta Stellar com assinaturas que qualquer pessoa pode verificar.',

  'start.eyebrow': 'Como começar',
  'start.title': 'Pronto em *três passos.*',
  'start.metamask.title': 'Instale o MetaMask',
  'start.metamask.text': 'Adicione a extensão do MetaMask ao seu navegador de desktop, se ainda não tiver.',
  'start.install.title': 'Adicione o Stellar Snap',
  'start.install.text': 'Clique em «Instalar no MetaMask» nesta página e aprove as permissões que o MetaMask mostrar.',
  'start.use.title': 'Use sua conta Stellar',
  'start.use.text':
    'No MetaMask, abra o menu ⋮ → Snaps → Stellar Snap. Dali você envia, recebe, troca e gerencia suas contas.',

  'dev.eyebrow': 'Para desenvolvedores',
  'dev.title': 'Conecte sua dApp com *uma API padrão.*',
  'dev.lead':
    'O adaptador `@cosmosapp/stellar-metamask-adapter` implementa a SEP-43: na mainnet usa o suporte a Stellar integrado ao MetaMask e, na testnet e na futurenet, o Stellar Snap.',
  'dev.sep43': '*SEP-43*: os mesmos métodos e códigos de erro das outras wallets Stellar.',
  'dev.kit': '*Stellar Wallets Kit*: um módulo que adiciona o MetaMask ao seletor de wallets.',
  'dev.freighter':
    '*API do Freighter*: dApps feitas para o Freighter funcionam com um alias do bundler, sem mudar o código.',
  'dev.example': 'Conectar e assinar com SEP-43',
  'dev.repo': 'Ver o código no GitHub',

  'faq.eyebrow': 'Perguntas frequentes',
  'faq.title': 'O que você *precisa saber.*',
  'faq.what.q': 'O que é o Stellar Snap?',
  'faq.what.a':
    'É um Snap do MetaMask de código aberto que adiciona contas Stellar e Soroban ao MetaMask, com tela própria dentro da extensão. É um produto da Cosmos Pay e da Cosmos.',
  'faq.official.q': 'É um produto oficial do MetaMask?',
  'faq.official.a':
    'Não. O Stellar Snap é um projeto independente: não é afiliado, patrocinado nem aprovado pela MetaMask, pela Consensys ou pela Stellar Development Foundation.',
  'faq.networks.q': 'Quais redes Stellar ele suporta?',
  'faq.networks.a':
    'As três. Na testnet e na futurenet, quem assina é o Stellar Snap. Na mainnet, o adaptador usa o suporte a Stellar integrado ao MetaMask e, se a sua versão não tiver, o Snap.',
  'faq.keys.q': 'Onde ficam minhas chaves?',
  'faq.keys.a':
    'No MetaMask. As contas são derivadas da sua frase secreta com a SEP-0005, como em outras wallets Stellar, e as chaves nunca saem do MetaMask. De uma conta importada, só a chave secreta é guardada, criptografada pelo MetaMask.',
  'faq.cost.q': 'Quanto custa?',
  'faq.cost.a':
    'Instalar e usar é grátis. Você paga as taxas da rede Stellar, e as trocas incluem uma taxa de plataforma da Cosmos Pay que aparece na cotação antes de confirmar.',
  'faq.extension.q': 'Preciso de outra wallet ou extensão?',
  'faq.extension.a':
    'Não. Você só precisa do MetaMask: o Snap funciona dentro da extensão, e as dApps Stellar se conectam por meio dela.',
  'faq.dapp.q': 'Como integro na minha dApp?',
  'faq.dapp.a':
    'Com o adaptador SEP-43, o módulo do Stellar Wallets Kit ou a API compatível com o Freighter. O código e o guia de integração estão no [GitHub]({repo}).',

  'donate.eyebrow': 'Doações',
  'donate.title': 'Ajude-nos a *continuar construindo.*',
  'donate.lead':
    'O Stellar Snap é gratuito e de código aberto. Se ele for útil para você, você pode doar na rede Stellar: cada contribuição financia auditorias, manutenção e novos recursos.',
  'donate.address': 'Endereço Stellar para doações',
  'donate.copy': 'Copiar endereço',
  'donate.copied': 'Endereço copiado',
  'donate.qr': 'Código QR com o endereço de doação',
  'donate.note':
    'Aceita XLM e outros ativos Stellar, como USDC, na rede pública (mainnet). Não envie fundos de testnet nem de outras blockchains.',
  'donate.other': 'Outras formas de doar',

  'connect.button': 'Conectar MetaMask',
  'connect.done': 'Conectado',

  'account.title': 'Sua conta',
  'account.network': 'Rede',
  'account.address': 'Endereço',
  'account.signer': 'Assinante',
  'account.balance': 'Saldo',
  'account.evm': 'EVM vinculada',
  'account.unfunded': 'Conta sem fundos',
  'account.refresh': 'Atualizar saldo',
  'account.refreshed': 'Saldo atualizado',
  'account.fund': 'Financiar com Friendbot',
  'account.funded': 'Conta financiada com XLM de teste.',
  'account.friendbot': 'Friendbot',
  'account.link': 'Vincular minha conta EVM',
  'account.linked': 'Contas vinculadas',
  'account.switched': 'Rede alterada',
  'backend.official': 'MetaMask (Stellar integrada)',
  'backend.snap': 'Stellar Snap',

  'soroban.title': 'Autorização Soroban (signAuthEntry)',
  'soroban.text':
    'Monta a autorização de um `transfer` de exemplo, assina no MetaMask e verifica com o SDK da Stellar, como faria uma dApp Soroban.',
  'soroban.button': 'Assinar autorização de exemplo',
  'soroban.done': 'Autorização Soroban assinada e verificada',

  'payment.title': 'Enviar pagamento',
  'payment.destination': 'Destino',
  'payment.amount': 'Valor (XLM)',
  'payment.memo': 'Memo',
  'payment.memoPlaceholder': 'opcional',
  'payment.submit': 'Enviar',
  'payment.done': 'Pagamento enviado',

  'sign.title': 'Assinar mensagem (SEP-53)',
  'sign.message': 'Mensagem',
  'sign.default': 'Olá do Stellar Snap',
  'sign.submit': 'Assinar',
  'sign.done': 'Assinatura SEP-53',

  'error.rejected.title': 'Solicitação recusada',
  'error.rejected.text': 'Você cancelou a solicitação no MetaMask.',
  'error.invalid.title': 'Solicitação inválida',
  'error.external.title': 'Serviço indisponível',
  'error.internal.title': 'Algo deu errado',
  'error.connectFirst': 'Conecte o MetaMask primeiro.',
  'error.unknownNetwork': 'Rede desconhecida: {network}',
  'error.friendbot': 'O Friendbot respondeu com o código {status}.',
  'error.mainnetPayment': 'Na mainnet, use o botão «Enviar» do MetaMask.',
  'error.noSignature': 'A wallet não devolveu nenhuma assinatura.',

  'toast.region': 'Notificações',
  'toast.close': 'Fechar',

  'consent.label': 'Medição do site',
  'consent.text':
    'Com a sua permissão, usamos o Google Analytics para contar visitas e medir o desempenho do site. Sem publicidade.',
  'consent.accept': 'Aceitar',
  'consent.reject': 'Recusar',
  'consent.policy': 'Política de privacidade',

  'footer.copyright': '© {year} Stellar Snap é um produto da Cosmos Pay e da Cosmos.',
  'footer.pages': 'Sobre e contato',
  'footer.privacy': 'Privacidade',
  'footer.terms': 'Termos',
  'footer.credits': 'Créditos',
  'footer.contact': 'Contato',
  'footer.socialLink': 'Cosmos no {network}',
  'footer.analytics': 'Preferências de medição',
  'doc.updated': 'Última atualização: {date}',
  'doc.translationNote': 'Este documento está disponível em espanhol e inglês; esta é a versão em inglês.',
  'breadcrumb.label': 'Trilha de navegação',
  'breadcrumb.home': 'Início',

  'notFound.title': 'Página não encontrada',
  'notFound.text':
    'O endereço que você abriu não existe ou mudou de lugar. Confira se está escrito corretamente ou volte ao início.',
  'notFound.home': 'Ir para o início',
};
