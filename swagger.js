import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Kampung Connect API",
    description: "API documentation for Kampung Connect",
  },
  host: "localhost:3000",
};

const outputFile = "./swagger.json";
const routes = ["./src/app.js"];

swaggerAutogen()(outputFile, routes, doc);
