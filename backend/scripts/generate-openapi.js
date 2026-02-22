const fs = require("fs");
const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Metroplex API",
      version: "1.0.0",
      description: "Travel itinerary planner API",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: [
    path.join(__dirname, "../src/routes/*.ts"),
    path.join(__dirname, "../dist/src/routes/*.js"),
  ],
};

const specs = swaggerJsdoc(options);

fs.writeFileSync(
  path.join(__dirname, "../openapi.json"),
  JSON.stringify(specs, null, 2),
);

console.log("openapi.json generated");
