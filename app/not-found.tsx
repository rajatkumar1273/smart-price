import Link from "next/link";
import React from "react";
import "@/stylesheets/notFound.css";

const NotFound = () => {
  return (
    <div id="colorlib-notfound">
      <div className="colorlib-notfound">
        <div className="colorlib-notfound-404">
          <h1>Oops!</h1>
        </div>
        <h2 id="colorlib_404_customizer_page_heading">404 - Page Not Found</h2>
        <p id="colorlib_404_customizer_content">
          The page you are looking for might have been removed had its name
          changed or is temporary unavailable.
        </p>
        <Link href="/" id="colorlib_404-customizer_button_text">
          Go To HomePage
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
