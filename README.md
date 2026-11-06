# Kauan Pocket Whisper

Crie um app web de chat financeiro chamado "Banco Kauan", em português do Brasil. O assistente se chama "Kau". É uma demonstração educacional de IA, MCP e APIs financeiras, com dados fictícios da Plaid Sandbox. Cenário: app de um banco digital.



Visual: banco digital simples, verde profundo, branco e cinza claro, layout responsivo (celular e desktop). Foco no chat, não é landing page. Mostrar fixo o aviso "Demonstração · Dados fictícios · Não é o Open Finance real".



Chat: saudação "Olá! Sou o Kau. O que você quer entender sobre suas finanças?". Botões de sugestão que enviam a pergunta: Mostrar minhas contas; Consultar meus saldos; Ver minhas últimas transações; Quanto gastei com alimentação?; Resumir minhas movimentações. Campo de mensagem fixo, botão enviar, Enter envia, Shift+Enter quebra linha, mensagem vazia bloqueada, indicador de carregamento, mensagens de erro claras, histórico e botão de nova conversa. Respostas podem usar tabelas e cartões simples.



Dados locais fictícios (sem backend, sem chaves, sem login), referência 25/09/2026, em USD no formato "US$ 110,00":

- Plaid Checking: saldo 110,00, disponível 100,00

- Plaid Saving: saldo 210,00, disponível 200,00

- Plaid Credit Card: dívida 410,00, disponível "Não informado"

- Plaid Business Credit Card: dívida 5.020,00, crédito disponível 4.980,00

Transações (todas confirmadas): 24/09 Uber 072515 SF**POOL** (Checking) 6,33, Transporte; 21/09 Tectra Inc (cartão) 500,00; 20/09 AUTOMATIC PAYMENT - THANK (cartão) 2.078,50, Pagamento de dívida; 20/09 KFC (cartão) 500,00, Alimentação; 20/09 Madison Bicycle Shop (cartão) 500,00. Pode acrescentar mais algumas com categorias coerentes.



Regras: não converter para reais. Saldo devedor não é dinheiro disponível. Campo ausente aparece como "Não informado". Valor positivo de transação é saída e negativo é entrada. Informar período e quantidade de registros analisados. Não inventar dados. Perguntas sem suporte recebem explicação e sugestões válidas. Sem pagamentos, transferências ou operações de escrita. Nunca escrever "Conectado": os dados são locais e as respostas são simuladas. Não pedir credenciais. Separe os dados em uma camada de serviços substituível. Não publique automaticamente.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://kauan-pocket-whisper.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7aef6431-cf82-4ed7-92c7-ae627ba956d4).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
