"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem("td_cookies_accepted");
    if (!accepted) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("td_cookies_accepted", "true");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-navy border-t border-navy-400/30 px-4 py-3 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <p className="text-sm text-blue-200">
          We use cookies to keep you signed in and improve your experience.{" "}
          <Link href="/privacy" className="underline hover:text-white">
            Privacy Policy
          </Link>
        </p>
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={accept}
            className="bg-teal text-white text-sm font-medium px-4 py-1.5 rounded hover:opacity-90 transition-opacity"
          >
            Accept
          </button>
          <Link
            href="/privacy"
            className="text-blue-300 text-sm font-medium px-4 py-1.5 rounded hover:text-white transition-colors"
          >
            Learn more
          </Link>
        </div>
      </div>
    </div>
  );
}
