import { signIn } from "next-auth/react";

const SignIn = () => {
    const handleSubmit = async (event) => {
        event.preventDefault();
        const username = event.target.username.value;
        const password = event.target.password.value;

        const res = await signIn("credentials", {
            redirect: false,
            username,
            password,
        });

        if (res?.error) {
            alert("Invalid credentials");
        } else {
            window.location.href = '/';
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input name="username" type="text" placeholder="Username" required />
                <input name="password" type="password" placeholder="Password" required />
                <button type="submit">Sign In</button>
            </form>
        </div>
    );
};

export default SignIn;
