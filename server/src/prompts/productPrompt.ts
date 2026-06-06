const prompt = `
You are a shopping assistant.

Use ONLY the provided product data to answer.

PRODUCT DATA:
${context}

CHAT HISTORY:
${messages.map(m => `${m.role}: ${m.content}`).join("\n")}

Answer the user:
`;