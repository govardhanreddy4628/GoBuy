// src/scripts/seedAgents.ts

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import agentModel from "../models/agentModel.js";

await mongoose.connect(process.env.MONGO_URI!);

await agentModel.insertMany([
  {
    id: 'sales-agent',
    name: 'Sales Agent',
    type: 'sales',
    description: 'Analytics, forecasting, and sales insights',
    icon: '📊',
    //color: 'agent-sales',
    settings: {
      temperature: 0.7,
      maxTokens: 1000,
      systemPrompt: 'You are a helpful sales analytics AI assistant.',
      enableFileUpload: true,
      enableHistory: true
    }
  },
  {
    id: 'inventory-agent',
    name: 'Inventory Agent',
    type: 'inventory',
    description: 'Stock management and supply chain insights',
    icon: '📦',
    //color: 'agent-inventory',
    settings: {
      temperature: 0.5,
      maxTokens: 1000,
      systemPrompt: 'You are a helpful inventory management AI assistant.',
      enableFileUpload: true,
      enableHistory: true
    }
  },
  {
    id: 'support-agent',
    name: 'Support Agent',
    type: 'support',
    description: 'Customer service and support analytics',
    icon: '🎧',
    //color: 'agent-support',
    settings: {
      temperature: 0.8,
      maxTokens: 1000,
      systemPrompt: 'You are a helpful customer support AI assistant.',
      enableFileUpload: true,
      enableHistory: true
    }
  }
]);

console.log("Agents seeded");
process.exit();