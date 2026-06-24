import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { db, users, tenants, tenantMembers } from "@vidforge/db"
import { eq } from "drizzle-orm"
 
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    })
  ],
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.JWT_SECRET || "default_secret_for_development",
  callbacks: {
    async jwt({ token, user }) {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(token.sub || "");
      
      if (user || (!isUUID && token.email)) {
        const email = user?.email || token.email;
        if (email) {
          let dbUser = await db.query.users.findFirst({
            where: eq(users.email, email)
          });
          
          if (!dbUser) {
            const name = user?.name || token.name || "User";
            const image = user?.image || (token as any).picture || null;
            const newUsers = await db.insert(users).values({
              name: name,
              email: email,
              avatarUrl: image,
            }).returning();
            dbUser = newUsers[0];
            
            const newTenants = await db.insert(tenants).values({
              name: `${name}'s Workspace`,
              slug: `workspace-${dbUser.id.substring(0, 8)}`,
            }).returning();
            
            await db.insert(tenantMembers).values({
              tenantId: newTenants[0].id,
              userId: dbUser.id,
              role: "owner"
            });
          }
          
          token.sub = dbUser.id;
          token.role = email === process.env.ADMIN_EMAIL ? "admin" : "user";
        }
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        // @ts-ignore - appending custom property to session
        session.user.role = token.role;
        // @ts-ignore
        session.user.id = token.sub;
      }
      return session;
    }
  }
})
