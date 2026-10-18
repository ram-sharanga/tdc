import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="login">
      <div className="hero">
        <div className="logo">The Date Crew</div>
        <div>
          <h1>Thoughtful matches, made personally.</h1>
          <p style={{ marginTop: 16 }}>
            Your clients, their stories, and the people who might be right for
            them, in one place.
          </p>
        </div>
        <small style={{ opacity: 0.7 }}>Matchmaker workspace</small>
      </div>
      <div className="login-box">
        <LoginForm />
      </div>
    </div>
  );
}
