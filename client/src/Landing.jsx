import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Landing = () => {

  return (
    <div>
      {/* Container with Tailwind dark mode toggle */}
      <div className="min-h-screen flex flex-col justify-between bg-gradient-to-r from-sky-900 to-gray-800 transition-all duration-500">

        {/* Sticky Navbar */}
        <header className="sticky top-0 z-50 bg-stone-200  shadow-lg">
          <nav className="container mx-auto p-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-800 ">MyApp</h1>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <button
                  className="bg-stone-200 border border-gray-800 hover:text-white hover:bg-black text-lg font-semibold px-4 py-2 rounded-full">
                  Sign In
                </button>
              </Link>
            </div>
          </nav>
        </header>

        {/* Mai  n Content */}
        <main className="flex-1 flex flex-col items-center justify-center">
          <div className="container mx-auto px-4 py-12">
            <h2 className="text-4xl font-bold text-gray-800 dark:text-white text-center mb-6 animate-bounce">
              Schedule & Manage your events here...
            </h2>
            <p className="text-xl text-gray-300 dark:text-gray-300 text-center mb-8 ">
              Easily organize, manage, and store reports for your events.
            </p>
            <div className="text-center">
              <Link to="/signup">
                <li className="group list-none rounded-full" > {/* Added group class here */}
                  <a 
                    className="relative text-white text-xl font-medium transition-all duration-300 ease-in-out">
                    Get Started
                    <span className="absolute left-0 bottom-0 w-0 h-[2px] bg-white transition-all duration-300 ease-in-out group-hover:w-full"></span>
                  </a>
                </li>
              </Link>
            </div>
          </div>
        </main>


      </div>
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} MyApp. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
