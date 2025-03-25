// src/app/components/Footer.tsx
export default function Footer() {
  return (
    <footer className="bg-gray-100 text-gray-600 text-center py-4 mt-10">
      <p>
        © {new Date().getFullYear()} Pocket Agency. All rights reserved. |{" "}
        <a href="#contact" className="text-blue-600 hover:underline">
          Contact Us
        </a>
      </p>
    </footer>
  );
}