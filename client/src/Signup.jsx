// Signup.jsx
import React, { useState } from 'react';
import { auth } from './firebase'; // Import Firebase auth
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Reset any previous error
  
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('User signed up');
      toast.success("Registered Successfully", {
        position: "top-center",
      });
      navigate("/home");
    } catch (error) {
      setError(error.message);
      toast.error(`Error: ${error.message}`, {
        position: "top-center",
      });
    }
  };
  

  return (
    <div className="overflow-hidden flex justify-center items-center h-screen bg-gradient-to-r from-sky-900 to-gray-800">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-center mb-6">Sign Up</h2>

        {/* Display error message if it exists */}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

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
            className="w-full  text-xl font-semibold bg-orange-400 text-white py-2 rounded-md hover:bg-orange-500"
          >
            Sign Up
          </button>
        </form>

        <p className="text-center text-lg text-gray-600 mt-4">
          Already have an account?{" "}
          <Link to="/login" className="text-indigo-600 hover:underline">
            Login
          </Link>
        </p>

        {/* Toast notification container */}
        <ToastContainer />
      </div>
    </div>
  );
};

export default Signup;
