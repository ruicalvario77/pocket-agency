export default function Navbar() {
  return (
    <nav className="bg-white shadow-md py-4 fixed top-0 left-0 w-full z-50">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
        <h1 className="text-2xl font-bold text-blue-600">Pocket Agency</h1>
        <div>
          <a href="#home" className="text-gray-700 hover:text-blue-600 mx-2">
            Home
          </a>
          <a href="#services" className="text-gray-700 hover:text-blue-600 mx-2">
            Services
          </a>
          <a href="#contact" className="text-gray-700 hover:text-blue-600 mx-2">
            Contact
          </a>
          <a href="/auth/login" className="text-gray-700 hover:text-blue-600 mx-2">
            Login
          </a>
        </div>
      </div>
    </nav>
  );
}