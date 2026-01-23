import { connect } from "@planetscale/database";

export const db = connect({
  url: process.env.DATABASE_URL!,
});

