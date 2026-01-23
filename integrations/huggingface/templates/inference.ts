// HuggingFace Inference Examples
import { hfInference } from "./init";

// Text generation
export async function generateText(prompt: string, model = "gpt2") {
  return hfInference(model, prompt);
}

// Text classification / Sentiment
export async function classify(text: string, model = "distilbert-base-uncased-finetuned-sst-2-english") {
  return hfInference(model, text);
}

// Embeddings
export async function getEmbeddings(text: string, model = "sentence-transformers/all-MiniLM-L6-v2") {
  return hfInference(model, { inputs: text, options: { wait_for_model: true } });
}

// Question Answering
export async function answerQuestion(question: string, context: string, model = "deepset/roberta-base-squad2") {
  return hfInference(model, { question, context });
}

// Summarization
export async function summarize(text: string, model = "facebook/bart-large-cnn") {
  return hfInference(model, text);
}

// Translation
export async function translate(text: string, model = "Helsinki-NLP/opus-mt-en-fr") {
  return hfInference(model, text);
}
