import NextAuth from 'next-auth'
import { decode } from 'next-auth/jwt'
import GitHubProvider from 'next-auth/providers/github'

export default NextAuth({
  providers: [
    GitHubProvider({
      clientId: process.env.NODE_ENV ? process.env.GITHUB_ID : process.env.GITHUB_ID_DEV,
      clientSecret: process.env.NODE_ENV
        ? process.env.GITHUB_SECRET
        : process.env.GITHUB_SECRET_DEV,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      // Persist the OAuth access_token to the token right after signin
      if (account) {
        token.accessToken = account.access_token
      }
      return token
    },
    async session(sesh) {
      const { session, user, token } = sesh
      // Send properties to the client, like an access_token from a provider.
      session.accessToken = token.accessToken
      return session
    },
    async signIn({ user, account, profile, email, credentials }) {
      const isAllowedToSignIn = process.env.ALLOWED_EMAILS?.split(',').includes(
        user?.email as string,
      )
      if (isAllowedToSignIn) {
        return true
      } else {
        // Return false to display a default error message
        return false
        // Or you can return a URL to redirect to:
        // return '/unauthorized'
      }
    },
  },
})