export default function Login() {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-3xl font-bold">Login</h1>
        <form className="mt-4">
          <input type="email" placeholder="Email" className="block border p-2 mb-4" />
          <input type="password" placeholder="Password" className="block border p-2 mb-4" />
          <button type="submit" className="px-6 py-3 bg-blue-600 text-white rounded">Login</button>
        </form>
      </div>
    );
  }
  