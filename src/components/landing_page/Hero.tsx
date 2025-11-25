"use client"

import Link from "next/link";
import ExampleItem from "./Examples";
import { useLocale } from "@/components/LocaleProvider";

export default function Hero() {
  const { t } = useLocale();
  
  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-12 sm:pt-0 min-h-[calc(100vh-80px)] flex items-center justify-center">
      <div className="max-w-7xl mx-auto w-full mt-0 sm:-mt-32 lg:-mt-48">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column - Text Content */}
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-6 sm:mb-8 text-black">
              {t.heroTitle}
            </h1>
            <div className="text-base sm:text-lg lg:text-xl text-black leading-relaxed mb-8 sm:mb-10">
              {t.heroDescription.split('\n').map((line, index) => {
                if (line.startsWith('**') && line.endsWith('**')) {
                  return (
                    <h3 key={index} className="font-normal text-base sm:text-lg mb-2 mt-4">
                      {line.replace(/\*\*/g, '')}
                    </h3>
                  );
                } else if (line.startsWith('• ')) {
                  return (
                    <div key={index} className="ml-4 mb-1">
                      <span className="text-black">•</span> {line.substring(2)}
                    </div>
                  );
                } else if (line.trim() === '') {
                  return <br key={index} />;
                } else {
                  return (
                    <p key={index} className="mb-2">
                      {line}
                    </p>
                  );
                }
              })}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Link 
                href="/contact"
                className="w-full sm:w-auto text-center px-6 py-3 sm:px-6 sm:py-3 bg-black text-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150 text-base sm:text-base font-normal"
              >
                {t.contact}
              </Link>
              <Link 
                href="/login"
                className="w-full sm:w-auto text-center px-6 py-3 sm:px-6 sm:py-3 bg-white text-black border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.3)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.3)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150 text-base sm:text-base font-normal"
              >
                {t.login}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
