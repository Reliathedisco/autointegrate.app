export function withUser(handler: any) {
  return (req: any, res: any) => {
    if (!req.auth || !req.auth.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    return handler(req, res, req.auth.userId);
  };
}

