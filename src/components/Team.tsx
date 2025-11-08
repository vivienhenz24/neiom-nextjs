"use client"

import { useLocale } from "@/components/LocaleProvider"
import { LinkedInLogoIcon } from "@radix-ui/react-icons"
import Image from "next/image"

export default function Team() {
  const { t } = useLocale();
  
  return (
    <div className="flex-1 px-4 sm:px-6 lg:px-8 py-8 sm:py-16 min-h-[calc(100vh-160px)]">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-8 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-black mb-4 sm:mb-6 tracking-tight">
            {t.teamTitle}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl leading-relaxed">
            {t.teamSubtitle}
          </p>
        </div>

        {/* Team Members */}
        <div className="space-y-16">
          {/* Co-founder 1 */}
          <section className="bg-gray-50 p-8 rounded-lg">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-2xl font-normal text-black mb-4">{t.vivienRole}</h2>
                <h3 className="text-xl font-normal text-black mb-4">{t.vivienName}</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {t.vivienDescription}
                </p>
                <div className="mt-4">
                  <a 
                    href="https://www.linkedin.com/in/vivienhenz/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-black text-black hover:bg-black hover:text-white transition-all duration-200 font-normal rounded-lg hover:scale-105 transform"
                  >
                    <LinkedInLogoIcon className="w-4 h-4 mr-2" />
                    LinkedIn
                  </a>
                </div>
              </div>
              <div className="flex justify-center">
                <div className="w-48 h-48 rounded-full overflow-hidden">
                  <Image 
                    src="/viv.jpeg" 
                    alt="Vivien Henz" 
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Co-founder 2 */}
          <section className="bg-gray-50 p-8 rounded-lg">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="flex justify-center md:order-first">
                <div className="w-48 h-48 rounded-full overflow-hidden">
                  <Image 
                    src="/vic.jpeg" 
                    alt="Victor Henz" 
                    width={192}
                    height={192}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <div>
                <h2 className="text-2xl font-normal text-black mb-4">{t.markRole}</h2>
                <h3 className="text-xl font-normal text-black mb-4">{t.markName}</h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {t.markDescription}
                </p>
                <div className="mt-4">
                  <a 
                    href="https://www.linkedin.com/in/victorhenz/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 border border-black text-black hover:bg-black hover:text-white transition-all duration-200 font-normal rounded-lg hover:scale-105 transform"
                  >
                    <LinkedInLogoIcon className="w-4 h-4 mr-2" />
                    LinkedIn
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="text-center">
            <h2 className="text-2xl font-normal text-black mb-4">
              Interested in Joining Our Team?
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We&apos;re always looking for passionate individuals who share our mission 
              of preserving and promoting the Luxembourgish language through technology.
            </p>
            <a 
              href="/contact"
              className="inline-block px-8 py-3 border border-black text-black hover:bg-black hover:text-white transition-all duration-200 font-normal rounded-lg hover:scale-105 transform"
            >
              Get in Touch
            </a>
          </section>
        </div>
      </div>
    </div>
  )
}
