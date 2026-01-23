import { notion } from "./client";

export const appendBlock = async (pageId: string, text: string) => {
  return notion.blocks.children.append({
    block_id: pageId,
    children: [
      {
        paragraph: { rich_text: [{ text: { content: text } }] },
      },
    ],
  });
};
