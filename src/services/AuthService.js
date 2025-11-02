const authService = {
    login: async (credentials) => {
        console.log('Mock login attempt:', credentials);
        if (credentials.usernameOrEmail && credentials.password) {
            localStorage.setItem('authToken', 'MockToken_fyp_secure_cloud');
            return {
                token: 'MockToken_fyp_secure_cloud',
                user: { username: credentials.usernameOrEmail.split('@')[0] || credentials.usernameOrEmail },
            };
        }
        throw new Error('Invalid credentials (Mock Error)');
    },

    //Mock succesful reegistration
    register: async (userData) => {
        console.log('Mock registration attempt:', userData);
        localStorage.setItem('authToken', 'MockToken_fyp_secure_cloud');
        return { message: 'Registration succesful' };
    }
};

export default authService;