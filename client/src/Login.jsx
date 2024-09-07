// Login.jsx
import React, { useState } from 'react';
import { auth } from './firebase'; // Import Firebase auth
import { signInWithEmailAndPassword } from 'firebase/auth';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link, useNavigate } from 'react-router-dom'; // Import Link for routing

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous errors

    try {
      // Firebase login
      await signInWithEmailAndPassword(auth, email, password);
      console.log('User logged in');
      toast.success("Signed In Successfully", {
        position: 'top-center',
      });
      navigate('/home');
    } catch (error) {
      setError(error.message); // Set error message
      toast.error(`Invalid credentials`, {
        position: 'top-center',
      });
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gradient-to-r from-sky-900 to-gray-800">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center mb-6">Login</h2>
        
        {/* Display error message if it exists */}
        {/* {error && <p className="text-red-500 text-center mb-4">{error}</p>} */}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-lg font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700">Password</label>
            <input
              type="password"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full text-xl font-semibold bg-orange-400 text-white py-2 rounded-md hover:bg-orange-500"
          >
            Log In
          </button>
        </form>

        <p className="text-center text-lg text-gray-600 mt-4">
          Don't have an account?{" "}
          <Link to="/signup" className="text-indigo-600 hover:underline">
            Sign up
          </Link>
        </p>

        {/* Toast notification container */}
        <ToastContainer />
      </div>
    </div>
  );
};

export default Login;
