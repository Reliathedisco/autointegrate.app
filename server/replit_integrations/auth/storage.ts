import { users, type User, type UpsertUser } from "../../../shared/models/auth.js";
import { db } from "../../db.js";
import { eq } from "drizzle-orm";

export interface IAuthStorage {
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
}

class AuthStorage implements IAuthStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    console.log(`[Auth Storage] getUser(${id}) - hasPaid: ${user?.hasPaid || "N/A"}`);
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = await this.getUser(userData.id!);
    
    if (existingUser) {
      const [user] = await db
        .update(users)
        .set({
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          profileImageUrl: userData.profileImageUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userData.id!))
        .returning();
      
      console.log(`[Auth Storage] upsertUser UPDATE - user ${userData.id}, preserved hasPaid: ${user.hasPaid}`);
      return user;
    } else {
      const [user] = await db
        .insert(users)
        .values({
          ...userData,
          hasPaid: "false",
        })
        .returning();
      
      console.log(`[Auth Storage] upsertUser INSERT - new user ${userData.id}, hasPaid: ${user.hasPaid}`);
      return user;
    }
  }
}

export const authStorage = new AuthStorage();
