import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export default NextAuth({
    providers: [
        CredentialsProvider({
            credentials: {
                username: { label: 'Username', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            authorize: async (credentials) => {
                const user = { id: 1, name: 'User', role: 'editor' }; // Authenticate via DB
                return user || null;
            },
        }),
    ],
    session: {
        strategy: 'jwt',
    },
    callbacks: {
        async session(session, user) {
            session.user.id = user.id;
            session.user.role = user.role;
            return session;
        },
    },
});
