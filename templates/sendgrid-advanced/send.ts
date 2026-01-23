import { sendgrid } from "./client";

export const sendTransactional = async (to: string, templateId: string, data: any) => {
  return sendgrid.send({
    to,
    from: process.env.SENDGRID_FROM!,
    templateId,
    dynamicTemplateData: data,
  });
};
