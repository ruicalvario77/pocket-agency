import { User } from 'firebase/auth';

export default function Navbar({ user }: { user: User | null | undefined }) {
  return (
    <nav className="bg-blue-600 p-4 text-white">
      <div className="container mx-auto flex justify-between">
        <a href="/">Pocket Agency</a>
        <div>
          {user ? (
            <>
              <a href="/dashboard" className="mr-4">Dashboard</a>
              <a href="/logout">Logout</a>
            </>
          ) : (
            <a href="/auth/login">Login</a>
          )}
        </div>
      </div>
    </nav>
  );
}