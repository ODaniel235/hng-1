import express from "express";
import dotenv from "dotenv";
import geoIp2 from "geoip-lite2";
import axios from "axios";
dotenv.config();
const app = express();
const PORT = 8000;
app.listen(PORT, () => {
  console.log("Listening to Port: ", PORT);
});
app.get("/api/hello", async (req, res) => {
  try {
    const visitorName = req.query.visitor_name;
    const visitorIpFull = req.socket.remoteAddress;
    const visitorIp = visitorIpFull.split(":")[3];
    const visitorCity = geoIp2.lookup("146.19.109.255").city;
    const visitorTemp = await axios.get(
      `https://api.weatherapi.com/v1/current.json?key=${process.env.APIKEY}&q=${visitorCity}`
    );
    res.status(200).json({
      client_ip: visitorIp,
      location: visitorCity,
      greeting: `Hello, ${visitorName}!, the temperature is ${visitorTemp.data.current.temp_c} degree Celcius in ${visitorCity}`,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
