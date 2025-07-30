import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.SECRET_KEY;
const userId = 1; // Replace with a valid user ID in your DB

const token = jwt.sign({ userId }, SECRET_KEY, { expiresIn: "1h" });
console.log("Generated JWT:", token);

/** 
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc1Mzg0OTA3MCwiZXhwIjoxNzUzODUyNjcwfQ.VYeWw6qLNEASdf0cRarqRoFvF1pA2J6BToQZ6tvrGEE

eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc1Mzg4ODE5MSwiZXhwIjoxNzUzODkxNzkxfQ.myPxzYrHiT2CYRq7I91DLImfyKc-kEM2YfzeVYDDeWo