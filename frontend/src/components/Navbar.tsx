
import { Link } from "react-router-dom";

export function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4 shadow-md bg-white">
      <div className="text-2xl font-bold">
        <Link to="/">ResumeAI</Link>
      </div>
      <div className="flex gap-4">
        <Link to="/login" className="text-gray-700 hover:text-black">
          Login
        </Link>
        <Link to="/register" className="text-gray-700 hover:text-black">
          Register
        </Link>
      </div>
    </nav>
  );
}