# HuggingFace Inference API

Run any HF inference model with a universal client.

## Environment Variables

```env
HF_API_KEY=
```

## Usage

```typescript
import { hfRequest } from "./client";

// Text generation
const text = await hfRequest("gpt2", { inputs: "Hello, I'm a language model" });

// Sentiment analysis
const sentiment = await hfRequest("distilbert-base-uncased-finetuned-sst-2-english", {
  inputs: "I love this product!"
});

// Image classification
const classification = await hfRequest("google/vit-base-patch16-224", {
  inputs: base64Image
});
```

## Popular Models

- `gpt2` - Text generation
- `facebook/bart-large-cnn` - Summarization
- `sentence-transformers/all-MiniLM-L6-v2` - Embeddings
- `stabilityai/stable-diffusion-2-1` - Image generation
