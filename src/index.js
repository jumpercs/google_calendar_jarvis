
import dotenv from "dotenv";
dotenv.config({});
import express from "express";
import { google } from "googleapis";

const app = express();

const PORT = process.env.PORT || 3000;


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

    res.redirect(url);
});


app.get("/google/redirect", async (req, res) => {
    const code = req.query.code;

    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    res.send({
        message: "You have successfully logged in.",
    })



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
            timeZone: "America/Denver",
        },
        end: {
            dateTime: req.query.end,
            timeZone: "America/Denver",
        },
    };

    try {
        const calendarResponse = await calendar.events.insert({
            calendarId: "primary",
            resource: event,
            auth: oauth2Client,

        });

        res.send({
            message: "Successfully added event to calendar",
            calendarResponse,
        });
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