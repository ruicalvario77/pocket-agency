// src/app/page.tsx
"use client";

import { useEffect } from "react";

export default function Home() {
  useEffect(() => {
    const handleScrollToHash = () => {
      const { hash } = window.location;
      if (hash) {
        const target = document.querySelector(hash);
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    // Handle initial load and hash changes
    handleScrollToHash();
    window.addEventListener("hashchange", handleScrollToHash);
    return () => window.removeEventListener("hashchange", handleScrollToHash);
  }, []);

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section id="home" className="pt-20 min-h-screen flex flex-col items-center justify-center bg-white text-center">
        <h1 className="text-5xl font-extrabold text-blue-600">Welcome to Pocket Agency 🚀</h1>
        <p className="mt-4 text-lg text-gray-600">Your AI-powered design and web development solution.</p>
        <a href="/pricing" className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition">
          Get Started
        </a>
      </section>

      {/* Services Section */}
      <section id="services" className="pt-20 max-w-6xl mx-auto py-20 px-6 bg-gray-100">
        <h2 className="text-4xl font-bold text-blue-600 text-center">Our Services</h2>
        <p className="mt-4 text-lg text-gray-600 text-center">
          High-quality design and web development services at a fixed subscription rate.
        </p>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 border border-gray-200 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-blue-600">Website Design</h3>
            <p className="mt-2 text-gray-600">Custom UI/UX web design tailored to your business.</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-blue-600">Web Development</h3>
            <p className="mt-2 text-gray-600">Scalable, high-performance websites built with modern frameworks.</p>
          </div>
          <div className="p-6 border border-gray-200 rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-blue-600">Branding & Graphics</h3>
            <p className="mt-2 text-gray-600">Logos, business cards, and marketing assets for your brand.</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="pt-20 max-w-6xl mx-auto py-20 px-6">
        <h2 className="text-4xl font-bold text-blue-600 text-center">Contact Us</h2>
        <p className="mt-4 text-lg text-gray-600 text-center">Get in touch with us to discuss your project.</p>
        <div className="mt-10 text-center">
          <a href="mailto:hello@pocketagency.com" className="px-6 py-3 bg-green-600 text-white rounded-lg shadow-md hover:bg-green-700 transition">
            Send an Email
          </a>
        </div>
      </section>
    </div>
  );
}