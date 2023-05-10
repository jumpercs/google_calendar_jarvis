# Agendamento de Eventos com Google Calendar API

Este projeto tem como objetivo demonstrar como realizar o agendamento de eventos no Google Calendar utilizando a API do Google Calendar. O código é escrito em JavaScript e faz uso dos seguintes pacotes:

- dotenv
- express
- googleapis
- cors

## Pré-requisitos

Antes de executar o projeto, é necessário realizar as seguintes etapas:

1. Criar um projeto no [Google Cloud Console](https://console.cloud.google.com/) e habilitar a API do Google Calendar.
2. Gerar as credenciais da API do Google Calendar para utilizar no projeto.
3. Configurar as variáveis de ambiente com as credenciais da API do Google Calendar.

## Instalação

1. Clone o repositório do projeto
2. Instale as dependências utilizando o comando `npm install`
3. Crie um arquivo `.env` na raiz do projeto com as seguintes informações:

```
CLIENT_ID=YOUR_CLIENT_ID
CLIENT_SECRET=YOUR_CLIENT_SECRET
REDIRECT_URL=YOUR_REDIRECT_URL
API_KEY=YOUR_API_KEY
```

4. Execute o projeto utilizando o comando `npm start`

## Uso

1. Acesse a URL `http://localhost:3000/google`
2. Faça o login com a conta do Google para autorizar o acesso do aplicativo ao Google Calendar
3. Preencha as informações do evento na tela que será exibida após a autorização
4. Clique no botão "Agendar Evento"
5. O evento será agendado no Google Calendar

## Licença

Este projeto está licenciado sob a licença MIT. Consulte o arquivo LICENSE para obter mais informações.
