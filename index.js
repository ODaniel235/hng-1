import express from "express";
import dotenv from "dotenv";
import geoIp2 from "geoip-lite2";
import axios from "axios";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log("Listening on Port: ", PORT);
});

app.get("/api/hello", async (req, res) => {
  try {
    //Setting query to be Guest if the user did not add any query
    const visitorName = req.query.visitor_name || "Guest";
    const visitorIpFull =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    // Handle IPv6 addresses
    const visitorIp = visitorIpFull.includes(":")
      ? visitorIpFull.split(":").pop()
      : visitorIpFull;
    //Fetch city using geoip-lite2
    const visitorLocation = geoIp2.lookup(visitorIp);
    if (!visitorLocation) {
      throw new Error("Unable to determine location from IP address");
    }
    //Handling error incase location is not fetched
    const city = visitorLocation.city || "Unknown City";

    const weatherResponse = await axios.get(
      `https://api.weatherapi.com/v1/current.json?key=${process.env.APIKEY}&q=${city}`
    );

    const temperature = weatherResponse.data.current.temp_c;

    res.status(200).json({
      client_ip: visitorIp,
      location: city,
      greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${city}.`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
