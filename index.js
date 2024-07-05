import express from "express";
import axios from "axios";
import requestIp from "request-ip";

const app = express();
const port = 3000;

app.use(requestIp.mw());

app.get("/api/hello", async (req, res) => {
  let clientIp = req.clientIp;
  const visitorName = req.query.visitor_name || "Visitor";

  if (clientIp === "::1") {
    clientIp = "8.8.8.8"; // Use a sample IP for testing, or handle differently
  }

  try {
    const locationResponse = await axios.get(
      `http://ip-api.com/json/${clientIp}`
    );
    const locationData = locationResponse.data;

    const weatherResponse = await axios.get(
      `http://api.weatherapi.com/v1/current.json?key=${process.env.APIKEY}=${locationData.city}`
    );
    const weatherData = weatherResponse.data;

    res.json({
      client_ip: clientIp,
      location: locationData.city,
      greeting: `Hello, ${visitorName}! The temperature is ${weatherData.current.temp_c} degrees Celsius in ${locationData.city}`,
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch location or weather information" });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});
