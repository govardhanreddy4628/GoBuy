import * as z from "zod";
// npm install @langchain/anthropic to call the model
import { createAgent, tool, humanInTheLoopMiddleware } from "langchain";
import { ChatGroq } from "@langchain/groq";
import { Command, MemorySaver } from "@langchain/langgraph";
import readline from "node:readline/promises";
//import { stdin as input, stdout as output } from 'node:process';

export const gmailEmails = [
  {
    id: "msg-1",
    threadId: "thread-1",
    labelIds: ["INBOX", "IMPORTANT"],
    snippet: "Your refund for Order #FK12345 has been initiated...",
    payload: {
      headers: [
        { name: "From", value: "support@flipkart.com" },
        { name: "To", value: "govardhan.reddy@gmail.com" },
        { name: "Subject", value: "Refund Initiated for Your Order #FK12345" },
        { name: "Date", value: "Thu, 5 Nov 2025 10:23:00 +0530" },
      ],
      body: {
        data: "Hi Govardhan, your refund for Order #FK12345 has been initiated. It will be credited to your bank within 5-7 business days.",
      },
    },
    internalDate: "1730782380000",
  },
  {
    id: "msg-2",
    threadId: "thread-2",
    labelIds: ["INBOX"],
    snippet:
      "Return request approved. Your refund of ₹2,499 is being processed...",
    payload: {
      headers: [
        { name: "From", value: "no-reply@amazon.in" },
        { name: "To", value: "govardhan.reddy@gmail.com" },
        {
          name: "Subject",
          value: "Return Request Approved - Refund on the Way",
        },
        { name: "Date", value: "Wed, 4 Nov 2025 14:10:00 +0530" },
      ],
      body: {
        data: "We’ve processed your return for Order #AMZ7890. Your refund of ₹2,499 will be credited soon.",
      },
    },
    internalDate: "1730697600000",
  },
  {
    id: "msg-3",
    threadId: "thread-3",
    labelIds: ["INBOX", "PROMOTIONS"],
    snippet: "Your refund of ₹450 has been processed successfully...",
    payload: {
      headers: [
        { name: "From", value: "notifications@zomato.com" },
        { name: "To", value: "govardhan.reddy@gmail.com" },
        {
          name: "Subject",
          value: "Your refund for Order #ZMT456 has been processed",
        },
        { name: "Date", value: "Tue, 3 Nov 2025 19:42:00 +0530" },
      ],
      body: {
        data: "₹450 has been refunded to your original payment method.",
      },
    },
    internalDate: "1730611920000",
  },
  {
    id: "msg-4",
    threadId: "thread-4",
    labelIds: ["INBOX", "PURCHASES"],
    snippet:
      "Thank you for your purchase. You can request a refund within 30 days...",
    payload: {
      headers: [
        { name: "From", value: "billing@udemy.com" },
        { name: "To", value: "govardhan.reddy@gmail.com" },
        { name: "Subject", value: "Payment Successful - React Masterclass" },
        { name: "Date", value: "Mon, 2 Nov 2025 09:30:00 +0530" },
      ],
      body: {
        data: "Thank you for your purchase of React Masterclass. If you face issues, you can request a refund within 30 days.",
      },
    },
    internalDate: "1730507400000",
  },
  {
    id: "msg-5",
    threadId: "thread-5",
    labelIds: ["INBOX", "IMPORTANT"],
    snippet: "Your refund for ₹1,299 has been completed successfully...",
    payload: {
      headers: [
        { name: "From", value: "support@myntra.com" },
        { name: "To", value: "govardhan.reddy@gmail.com" },
        { name: "Subject", value: "Refund Completed - Order #MYN9981" },
        { name: "Date", value: "Sun, 1 Nov 2025 12:05:00 +0530" },
      ],
      body: {
        data: "Your refund for ₹1,299 has been completed successfully.",
      },
    },
    internalDate: "1730420700000",
  },
  {
    id: "msg-6",
    threadId: "thread-6",
    labelIds: ["INBOX"],
    snippet: "Your Apple One subscription has been renewed successfully...",
    payload: {
      headers: [
        { name: "From", value: "newsletter@apple.com" },
        { name: "To", value: "govardhan.reddy@gmail.com" },
        { name: "Subject", value: "Your monthly subscription invoice" },
        { name: "Date", value: "Sun, 1 Nov 2025 08:11:00 +0530" },
      ],
      body: {
        data: "Your Apple One subscription has been renewed for ₹195. No refund requested.",
      },
    },
    internalDate: "1730407860000",
  },
  {
    id: "msg-7",
    threadId: "thread-7",
    labelIds: ["INBOX", "UPDATES"],
    snippet: "We’ve received your refund request for Order #SWG123...",
    payload: {
      headers: [
        { name: "From", value: "help@swiggy.in" },
        { name: "To", value: "govardhan.reddy@gmail.com" },
        { name: "Subject", value: "Refund Request Received - Order #SWG123" },
        { name: "Date", value: "Sat, 31 Oct 2025 20:55:00 +0530" },
      ],
      body: {
        data: "We’ve received your refund request for Order #SWG123. It is currently under review.",
      },
    },
    internalDate: "1730359500000",
  },
  {
    id: "msg-8",
    threadId: "thread-8",
    labelIds: ["INBOX", "PROMOTIONS"],
    snippet: "Your Nykaa order is on the way! Track it here...",
    payload: {
      headers: [
        { name: "From", value: "offers@nykaa.com" },
        { name: "To", value: "govardhan.reddy@gmail.com" },
        { name: "Subject", value: "Your order is on the way!" },
        { name: "Date", value: "Fri, 30 Oct 2025 13:40:00 +0530" },
      ],
      body: {
        data: "Track your Nykaa order #NYK45678 using the link provided.",
      },
    },
    internalDate: "1730256600000",
  },
  {
    id: "msg-9",
    threadId: "thread-9",
    labelIds: ["INBOX", "IMPORTANT"],
    snippet: "Your Paytm refund for Transaction #PTM9001 has been initiated...",
    payload: {
      headers: [
        { name: "From", value: "care@paytm.com" },
        { name: "To", value: "govardhan.reddy@gmail.com" },
        { name: "Subject", value: "Refund Initiated for Transaction #PTM9001" },
        { name: "Date", value: "Thu, 6 Nov 2025 16:40:00 +0530" },
      ],
      body: {
        data: "Dear Govardhan, your Paytm refund for Transaction #PTM9001 has been initiated successfully. You will receive ₹899 in your Paytm Wallet within 24 hours.",
      },
    },
    internalDate: "1730872200000",
  },
];

const llm = new ChatGroq({
  model: "openai/gpt-oss-120b",
  temperature: 0,
  maxTokens: undefined,
  maxRetries: 2,
  // other params...
});

const getEmails = tool(() => {return JSON.stringify(gmailEmails)},
  {
    name: "get_emails",
    description: "Get the emails from inbox",
  }
);

const refund = tool(
  ({ emails }) => {
    return "All refunds processed successfully.";
  },
  {
    name: "refund",
    description: "process the refund for given emails",
    schema: z.object({
      emails: z
        .array(z.string())
        .describe("list of the emails which need to be refunded"),
    }),
  }
);

const agent = createAgent({
  model: llm,
  tools: [getEmails, refund],
  middleware: [
    humanInTheLoopMiddleware({
      interruptOn: { refund: true },
      descriptionPrefix: "refund pending approval",
    }),
  ],
  checkpointer: new MemorySaver(),
});

async function main() {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  let interrupts = [];

  while (true) {
    const query = await rl.question("You: ");
    if (query.toLowerCase() === "exit" || query.toLowerCase() === "quit" || query.toLowerCase() === "/bye") {
      console.log("Exiting...");
      break;
    }
    const response = await agent.invoke(
      interrupts?.length
        ? new Command({
            resume: {
              [interrupts?.[0]?.id]: {
                decisions: [{ type: query === "1" ? "approve" : "reject" }],
              },
            },
          })
        : {
            messages: [
              {
                role: "user",
                content: query,
              },
            ],
          },
      { configurable: { thread_id: "1" } }
    );

    interrupts = [];
    
    let output = "";

    if (response?.__interrupt__?.length) {
      interrupts?.push(response?.__interrupt__?.[0]);

      // narrow/cast interrupt so TypeScript knows the shape before property access
      const interrupt = (response as any)?.__interrupt__?.[0];

      if (interrupt) {
        const actionDesc = interrupt?.value?.actionRequests?.[0]?.description ?? "";
        output += actionDesc + "\n\n";
        output += "Choose:\n";

        const allowed: string[] = interrupt?.value?.reviewConfigs?.[0]?.allowedDescriptions ?? [];
        output += allowed
          .filter((decision) => decision !== "edit")
          .map((decision, idx) => `${idx + 1}. ${decision}`)
          .join("\n");
      } else {
        // fallback if interrupt unexpectedly missing
        output += "No interrupt details available.\n";
      }
    } else {
      output += response.messages[response.messages.length - 1].content;
    }
    console.log(output);
    
  }
  rl.close()
}

main();





  // if (response?.__interrupt__?.length) {
  //   interrupts.push(response.__interrupt__[0]);

  //   output +=
  //     response?.__interrupt__[0]?.value.actionRequests[0].description +
  //     "\n\n";
  //   output += "Choose:\n";

  //   output +=
  //     response?.__interrupt__[0]?.value.reviewConfigs[0].allowedDescriptions
  //       .filter((decision) => decision != "edit")
  //       .map((decision, idx) => "${idx + 1}. ${decision}")
  //       .join("\n");
  // } else {
  //   output += response.messages[response.messages.length - 1].content;
  // }
  // console.log(output);