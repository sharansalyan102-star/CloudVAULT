import './LoginPage.css'
function LoginPage() {
  return (
    <main className="login-page">
      <section className="login-card">
        <h1>Welcome to CloudVault</h1>
        <p>Securely store and manage your files.</p>

        <form>
          <div>
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Enter your password"
            />
          </div>

          <button type="submit">Login</button>
        </form>

        <p className='signup-text'>
          Don't have an account? <a href="#">Create an account</a>
        </p>
      </section>
    </main>
  )
}

export default LoginPage