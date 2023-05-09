
import dotenv from 'dotenv';
dotenv.config({});
import express from 'express';
import { google } from 'googleapis';

const app = express();

const PORT = process.env.PORT || 3000;


const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
);

const scopes = [
    'https://www.googleapis.com/auth/calendar',
];

app.get('/google', (req, res) => {


    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
    });

    res.redirect(url);
});


app.get('/google/redirect', async (req, res) => {
    const { code } = req.query;

    if (!code) {
        res.send('Code not found');
        return;
    }

    try {
        const { tokens } = await oauth2Client.getToken(code.toString());
        oauth2Client.setCredentials(tokens);

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const event = {
            summary: 'TESTE BOLADO',
            location: 'tem que ser um lugar',
            description: 'alguma descrição zika do bagui',
            start: {
                dateTime: '2023-06-28T09:00:00-07:00',
                timeZone: 'America/Los_Angeles',
            },
            end: {
                dateTime: '2023-06-28T17:00:00-07:00',
                timeZone: 'America/Los_Angeles',
            },
            recurrence: [
                'RRULE:FREQ=DAILY;COUNT=2'
            ],
            attendees: [
                { email: 'mario.igor.98@gmail.com' },
                { email: 'desenhismooficial@gmail.com' },
                { email: 'robertolokhiroshi@gmail.com' }

            ],
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 10 },
                ],
            },
        };

        const result = await calendar.events.insert({
            calendarId: 'primary',
            resource: event,
        });

        console.log(result.data.htmlLink);
        res.send(result.data.htmlLink);
    } catch (error) {
        console.log(error);
        res.send(error.message);
    }
});





app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});