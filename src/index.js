import dotenv from "dotenv";
dotenv.config({});
import express from "express";
import { google } from "googleapis";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// Permite o CORS
app.use(cors());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  process.env.REDIRECT_URL
);

const scopes = [
  "https://www.googleapis.com/auth/calendar",
];

app.get("/google", (req, res) => {
  try {
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
    });

    console.log(url);
    summary = req.query.summary;
    location = req.query.location;
    description = req.query.description;
    start = req.query.start;
    end = req.query.end;
    color = req.query.color;

    res.redirect(url);
  } catch (err) {
    console.error("Erro ao processar a rota /google:", err);
    res.status(500).send("Erro ao processar a rota /google");
  }
});

let summary = "";
let location = "";
let description = "";
let start = "";
let end = "";
let color = "";

app.get("/google/redirect", async (req, res) => {
  try {
    const code = req.query.code;

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    console.log(req);

    const formatStart = new Date(start).toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    });
    const formatEnd = new Date(end).toLocaleString("pt-BR", {
      timeZone: "America/Sao_Paulo",
    });

    res.send(`
    <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Agendar Evento</title>
    <!-- Importação do Material Icons -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">
    <!-- Importação do Tailwind -->
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.16/dist/tailwind.min.css">
  </head>
  <body class="bg-gray-200 min-h-screen flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-md max-w-xl w-full">
      <h1 class="text-center text-2xl font-bold mb-8">
        Clique no botão para agendar um evento
      </h1>
      <div class="mb-8">
        <h2 class="font-bold text-lg mb-4">Detalhes do Evento</h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2 md:col-span-1">
            <p class="text-gray-600 mb-2 font-bold">Título:</p>
            <p class="text-gray-800 bg-gray-100 p-2 rounded-lg mb-4">
              ${summary}  
            </p>
          </div>
          <div class="col-span-2 md:col-span-1">
            <p class="text-gray-600 mb-2 font-bold">Local:</p>
            <p class="text-gray-800 bg-gray-100 p-2 rounded-lg mb-4">
               ${location}
            </p>
          </div>
          <div class="col-span-2">
            <p class="text-gray-600 mb-2 font-bold">Descrição:</p>
            <p class="text-gray-800 bg-gray-100 p-2 rounded-lg mb-4">
                ${description}
            </p>
          </div>
          <div class="col-span-1">
            <p class="text-gray-600 mb-2 font-bold">Data de Início:</p>
            <p class="text-gray-800 bg-gray-100 p-2 rounded-lg mb-4">
                ${formatStart}
            </p>
          </div>
          <div class="col-span-1">
            <p class="text-gray-600 mb-2 font-bold">Data de Fim:</p>
            <p class="text-gray-800 bg-gray-100 p-2 rounded-lg mb-4">
                ${formatEnd}
            </p>
          </div>
          <div class="col-span-2">
            <p class="text-gray-600 mb-2 font-bold">Cor:</p>
            <div class="flex items-center justify-start">
              <div class="bg-red-500 rounded-full w-6 h-6 mr-2"></div>
              <p class="text-gray-800">${color}</p>
            </div>
          </div>
        </div>
      </div>
       <form action="/schedule_event" method="GET">
          <input type="hidden" name="summary" value="${summary}">
          <input type="hidden" name="location" value="${location}">
          <input type="hidden" name="description" value="${description}">
          <input type="hidden" name="start" value="${start}">
          <input type="hidden" name="end" value="${end}">
          <input type="hidden" name="color" value="${color}">
          <button type="submit" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg w-full">
            Agendar Evento
            </button>
    </div>
  </body  
    `);
  } catch (err) {
    console.error("Erro ao processar a rota /google/redirect:", err);
    res.status(500).send(

      `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Agendar Evento</title>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
    </head>
    <body class="bg-light d-flex align-items-center justify-content-center" style="min-height: 100vh;">
        <div class="bg-white p-5 rounded-lg shadow" style="max-width: 600px; width: 100%;">
            <h1 class="text-center mb-4">Erro ao processar a rota /google/redirect</h1>
            <button type="button" class="btn btn-primary btn-block" onclick="window.close();">Fechar</button>
        </div>
        <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js"></script>
    </body>
    </html>
    
      
      `
    );
  }
});

const calendar = google.calendar({
  version: "v3",
  auth: process.env.API_KEY,
});

app.get("/schedule_event", async (req, res) => {
  try {
    const event = {
      summary: summary,
      location: location,
      description: description,
      colorId: 1,
      start: {
        dateTime: start,
      },
      end: {
        dateTime: end,
      },
      colorId: color,
    };

    const calendarResponse = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
      auth: oauth2Client,
    });

    console.log(calendarResponse.data);

    res.send(
      `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Agendar Evento</title>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
    </head>
    <body class="bg-light d-flex align-items-center justify-content-center" style="min-height: 100vh;">
        <div class="bg-white p-5 rounded-lg shadow" style="max-width: 600px; width: 100%;">
            <h1 class="text-center mb-4">Evento agendado com sucesso!</h1>
            <button type="button" class="btn btn-primary btn-block" onclick="window.close();">Fechar</button>
        </div>
        <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js"></script>
    </body>
    </html>
    `
    );
  } catch (err) {
    console.error("Erro ao processar a rota /schedule_event:", err);
    res.status(500).send(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>Agendar Evento</title>
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css">
    </head>
    <body class="bg-light d-flex align-items-center justify-content-center" style="min-height: 100vh;">
        <div class="bg-white p-5 rounded-lg shadow" style="max-width: 600px; width: 100%;">
            <h1 class="text-center mb-4">Erro ao agendar evento!</h1>
            <button type="button" class="btn btn-primary btn-block" onclick="window.close();">Fechar</button>
        </div>
        <script src="https://code.jquery.com/jquery-3.2.1.slim.min.js"></script>
    </body>
    </html>
    `);
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
