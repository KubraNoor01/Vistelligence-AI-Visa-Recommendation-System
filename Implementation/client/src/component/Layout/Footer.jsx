import React from "react";
import { FaBus, FaFacebookF, FaTwitter, FaInstagram } from "react-icons/fa"; // Import icons
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-slate-800 via-slate-600 to-slate-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="flex items-center space-x-4 border border-gray-300 rounded-full w-full h-20 p-3">
            {/* Circular Icon */}
            <div className="flex items-center justify-center w-16 h-16 rounded-full overflow-hidden">
              <img
                src="images/vintageLogo.jpg"
                alt="Vintage Logo"
                className="object-cover w-full h-full"
              />
            </div>
            {/* Text */}
            <Link to="/">
              <span className="text-3xl font-lexend underline decoration-slate-300 decoration-2 underline-offset-8">
                Vistelligance
              </span>
            </Link>
          </div>

          {/* About Section */}
          <div>
            <h3 className="text-2xl underline decoration-slate-300 decoration-2 underline-offset-8 font-semibold font-lexend mb-4">
              About
            </h3>
            <p className="text-sm mt-10">
              Discover new destinations and make memories that last a lifetime.
              We’re committed to bringing you the best travel experiences with
              ease.
            </p>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className="text-2xl underline decoration-slate-300 decoration-2 underline-offset-8 font-semibold font-lexend mb-4">
              Contact
            </h3>
            <ul className="text-sm mt-10">
              <li>
                <a href="tel:+923204343973" className="hover:text-gray-300">
                  +92-3204343973
                </a>
              </li>
              <li>
                <a
                  href="mailto:info@travel.com"
                  className="hover:text-gray-300"
                >
                  info@Vintage.com
                </a>
              </li>
              <li>
                <span className="hover:text-gray-300">
                  123 Vintage  St, City, Country
                </span>
              </li>
            </ul>
          </div>

          {/* Social Media Section */}
          <div>
            <h3 className="text-2xl underline decoration-slate-300 decoration-2 underline-offset-8 font-semibold font-lexend mb-4">
              Follow Us
            </h3>
            <div className="flex space-x-4 mt-10">
              <a className="hover:text-gray-300">
                <FaFacebookF className="text-xl" />
              </a>
              <a className="hover:text-gray-300">
                <FaTwitter className="text-xl" />
              </a>
              <a className="hover:text-gray-300">
                <FaInstagram className="text-xl" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer Bottom Section */}
        <div className="text-center mt-8">
          <p className="text-md">© 2025 Travel Site. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
