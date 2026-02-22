import swaggerJsdoc from "swagger-jsdoc";

export const swaggerSpec = swaggerJsdoc({
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Metroplex API",
      version: "1.0.0",
      description: "Metroplex Travel Planning API",
    },
    servers: [{ url: "http://localhost:3001", description: "Local dev" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
      schemas: {
        ErrorResponse: {
          type: "object",
          properties: { message: { type: "string" } },
          required: ["message"],
        },

        RegisterBody: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 6 },
          },
          required: ["email", "password"],
        },
        LoginBody: {
          type: "object",
          properties: {
            email: { type: "string", format: "email" },
            password: { type: "string" },
          },
          required: ["email", "password"],
        },
        UserPublic: {
          type: "object",
          properties: {
            id: { type: "integer" },
            email: { type: "string", format: "email" },
            role: { type: "string", example: "USER" },
            createdAt: { type: "string", format: "date-time" },
          },
          required: ["id", "email", "role"],
        },
        AuthUser: {
          type: "object",
          properties: {
            id: { type: "integer" },
            email: { type: "string", format: "email" },
            role: { type: "string" },
          },
          required: ["id", "email", "role"],
        },
        LoginResponse: {
          type: "object",
          properties: {
            token: { type: "string" },
            user: { $ref: "#/components/schemas/AuthUser" },
          },
          required: ["token", "user"],
        },
        MeResponse: {
          type: "object",
          properties: { user: { type: "object" } },
          required: ["user"],
        },
        LogoutResponse: {
          type: "object",
          properties: { message: { type: "string" } },
          required: ["message"],
        },

        CreateTripBody: {
          type: "object",
          properties: {
            destination: { type: "string", example: "Paris" },
            daysCount: { type: "integer", minimum: 1, maximum: 30, example: 3 },
            budget: { type: "number", nullable: true, example: 200 },
            interests: { type: "string", example: "culture,food,nature" },
          },
          required: ["destination", "daysCount", "interests"],
        },
        RegenerateBody: {
          type: "object",
          properties: {
            interests: { type: "string", example: "museums,coffee" },
          },
        },
        TripSummary: {
          type: "object",
          properties: {
            id: { type: "integer" },
            destination: { type: "string" },
            daysCount: { type: "integer" },
            budget: { type: "number", nullable: true },
            interests: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            summary: {
              type: "object",
              properties: { totalPlannedActivities: { type: "integer" } },
              required: ["totalPlannedActivities"],
            },
          },
          required: [
            "id",
            "destination",
            "daysCount",
            "interests",
            "createdAt",
            "summary",
          ],
        },

        ActivityBody: {
          type: "object",
          properties: {
            destination: { type: "string", example: "Paris" },
            name: { type: "string", example: "Louvre Museum" },
            type: { type: "string", example: "MUSEUM" },
            durationHours: { type: "number", example: 2 },
            priceLevel: { type: "integer", minimum: 1, maximum: 5, example: 3 },
            latitude: { type: "number", nullable: true, example: 48.8606 },
            longitude: { type: "number", nullable: true, example: 2.3376 },
          },
          required: [
            "destination",
            "name",
            "type",
            "durationHours",
            "priceLevel",
          ],
        },
      },
    },
  },

  // ✅ IMPORTANT: support both dev (ts) and docker/prod (compiled js)
  apis: ["./src/routes/*.ts", "./dist/src/routes/*.js"],
});
