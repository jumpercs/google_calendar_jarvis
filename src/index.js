
import dotenv from "dotenv";
dotenv.config({});
import express from "express";
import { google } from "googleapis";
import cors from "cors";
const app = express();

const PORT = process.env.PORT || 3000;


//allow cors origin

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
const token = "";
app.get("/google", (req, res) => {


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
});

let summary = "";
let location = "";
let description = "";
let start = "";
let end = "";
let color = "";


app.get("/google/redirect", async (req, res) => {
    const code = req.query.code;

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    console.log(req);

    res.send(`
    <html>
    <head>
    <title>Agendar Evento</title>
    </head>
    <body>
    <h1>Clique no botão para agendar um evento</h1>
    <div>
    <h2>Evento</h2>
    <p>Titulo: ${summary}</p>
    <p>Local: ${location}</p>
    <p>Descrição: ${description}</p>
    <p>Data de Inicio: ${start}</p>
    <p>Data de Fim: ${end}</p>
    <p>Cor: ${color}</p>

    </div>
    <form action="/schedule_event" method="GET">
    <input type="hidden" name="summary" value="${summary}">
    <input type="hidden" name="location" value="${location}">
    <input type="hidden" name="description" value="${description}">
    <input type="hidden" name="start" value="${start}">
    <input type="hidden" name="end" value="${end}">
    <input type="hidden" name="color" value="${color}">

    <input type="submit" value="Agendar Evento">
    </form>
    </body>
    </html>

    `);





});


const calendar = google.calendar({ version: "v3", auth: process.env.API_KEY });

app.get("/schedule_event", async (req, res) => {


    const event = {
        summary: req.query.summary,
        location: req.query.location,
        description: req.query.description,
        colorId: 1,
        start: {
            dateTime: req.query.start,
        },
        end: {
            dateTime: req.query.end,
        }, colorId: req.query.color,
    };

    try {
        const calendarResponse = await calendar.events.insert({
            calendarId: "primary",
            resource: event,
            auth: oauth2Client,

        });

        // return a html with sucess message and one button to close the tab
        res.send(`
        <html>
        <head>
        <title>Agendar Evento</title>
        </head>
        <body>
        <h1>Evento agendado com sucesso</h1>
        <button onclick="window.close()">Fechar</button>
        </body>
        </html>

        `);

    } catch (err) {
        console.log(err);
        res.send({
            message: `There was an error adding the event to the calendar: ${err.message}`,
        });
    }
});







app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});