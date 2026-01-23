import { notion } from "./client";

export const createPage = async (title: string) => {
  return notion.pages.create({
    parent: { database_id: process.env.NOTION_DATABASE_ID! },
    properties: {
      Name: {
        title: [{ text: { content: title } }],
      },
    },
  });
};
