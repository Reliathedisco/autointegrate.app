export const generateAuth0Notes = () => `
Add these routes:

/app/api/auth/[...auth0]/route.ts

export { GET, POST } from "@auth0/nextjs-auth0/edge";

Install:
npm install @auth0/nextjs-auth0
`;

