import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";

import { makeExecutableSchema } from "@graphql-tools/schema";
import { json } from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { graphqlUploadExpress } from 'graphql-upload-minimal';
import { useServer } from "graphql-ws/lib/use/ws";
import { createServer } from "http";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import path from "path";
import { WebSocketServer } from "ws";
import { models } from './lib/models';
import { pubsub } from "./lib/pubsub";
import { auth } from "./middleware/auth";
import { errorHandler } from "./middleware/error";
import { resolvers } from "./resolvers";
import { typeDefs } from "./schema";
import { Context } from "./types";
dotenv.config();

async function startServer() {
  const app = express();
  const httpServer = createServer(app);

  // Connect to MongoDB
  const MONGODB_URI =
    process.env.MONGODB_URI ?? "mongodb://localhost:27017/befriends";

  try {
    await mongoose.connect(MONGODB_URI);
    console.log("📦 Connected to MongoDB")
    
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }

  const schema = makeExecutableSchema({ typeDefs, resolvers });

  // WebSocket server for subscriptions
  const wsServer = new WebSocketServer({
    server: httpServer,
    path: "/graphql",
  });

  const serverCleanup = useServer(
    {
      schema,
      context: async (ctx) => {
        // Extract token from connection params
        const token = ctx.connectionParams?.authorization as string;

        if (!token?.startsWith("Bearer ")) {
          return { models, pubsub };
        }

        try {
          const jwtToken = token.split(" ")[1];
          const jwtSecret = process.env.JWT_SECRET;

          if (!jwtSecret) {
            throw new Error("JWT secret not configured");
          }

          const decoded = jwt.verify(jwtToken, jwtSecret) as { userId: string };
          const user = await mongoose.models.User.findById(
            decoded.userId
          ).select("-password");

          return {
            models,
            user,
            pubsub,
          };
        } catch (error) {
          console.error("WebSocket authentication error:", error);
          return { models, pubsub };
        }
      },
    },
    wsServer
  );

  const server = new ApolloServer<Context>({
    typeDefs,
    resolvers,
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose();
            },
          };
        },
      },
    ],
  });

  await server.start();

  app.use(graphqlUploadExpress())
  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    json(),
    auth,
    expressMiddleware(server, {
      context: async ({ req }): Promise<Context> => ({
        models,
        user: req.user,
        req,
        pubsub,
      }),
    })
  );

  app.use(errorHandler);

  // Serve uploaded files
  app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

  const PORT = process.env.PORT ?? 4000;
  httpServer.listen(PORT, () => {
    console.log(`🚀 Server ready at http://localhost:${PORT}/graphql`);
  });
}

// Handle server shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Closing MongoDB connection...");
  await mongoose.connection.close();
  process.exit(0);
});

startServer().catch((error: unknown) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
