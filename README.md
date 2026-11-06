# Banco Kauan: agente financeiro com MCP

App publicado: https://kauan-pocket-whisper.lovable.app

> Demonstração com dados fictícios (Plaid Sandbox). Não representa o Open Finance brasileiro.

## Onde o cliente está
No app de um banco digital. O assistente "Kau" responde em português sobre contas, saldos e transações.
Os dados do app vêm de uma amostra local fictícia, baseada nos dados da Plaid Sandbox consultados via MCP (Etapa 1 da especificação). As respostas são simuladas, sem backend nem credenciais. Starbucks (US$ 4,33) e McDonald's (US$ 12,00) são transações de exemplo acrescentadas pelo Lovable.

## Como configurar os servidores MCP
- **Pluggy (documentação):** servidor Streamable HTTP, URL `https://mcp.pluggy.ai/mcp`, sem chave.
- **Plaid (Sandbox):** servidor STDIO, comando `uvx`, argumento `mcp-server-plaid`, variáveis `PLAID_CLIENT_ID` e `PLAID_SECRET` (Sandbox). As chaves ficam só no meu computador e não estão neste repositório.

## Prompt enviado ao Lovable
Especificação do guia (Etapa 1: frontend demonstrável com dados locais), com nome "Banco Kauan" e assistente "Kau".
Ajuste depois: tabelas viraram cartões empilhados no celular, e o rodapé passou a mostrar "3 transações de alimentação de um total de 9 analisadas".

## Melhoria escolhida
Rodapé com contagem e período em toda resposta, e cartões responsivos no celular.

## Prints
Prints das tabelas no Codex e da conversa no app estão na pasta `prints/`.
