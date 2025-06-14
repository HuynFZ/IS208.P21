import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import db from "../../../../lib/db"; // Sử dụng kết nối DB  đã được cấu hình
import bcrypt from "bcryptjs";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        const [rows] = await db.query(
            "SELECT id, user_code, username, password, role, email FROM users WHERE email = ?",
            [credentials.username]
        );
        if (rows.length > 0) {
            const user = rows[0];
            const isValid = await bcrypt.compare(credentials.password, user.password);
            if (isValid) {
            return {
                id: user.id,
                user_code: user.user_code,
                username: user.username,
                role: user.role,
                email: user.email
            };
            }
        }
        return null;
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;        
        token.user_code = user.user_code;
        token.username = user.username;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = session.user || {};
      session.user.id = token.id;
      session.user.role = token.role;
      session.user.user_code = token.user_code;
      session.user.username = token.username;
      session.user.email = token.email;
      return session;
    }
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/dangnhap_ky/dangnhap"
  }
};

export default NextAuth(authOptions);