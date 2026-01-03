import { getSession } from '../actions/auth';
import { BookOpen, Users, Calendar, Award, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-[#F3F3F3] text-slate-900 font-sans">
      {/* Header */}
      <header className="flex items-center justify-between px-8 lg:px-16 py-6">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="VARTAK_SA Logo" className="w-10 h-10 object-contain" />
          <span className="font-bold text-xl">VARTAK_SA</span>
        </div>

        <nav className="hidden md:flex items-center gap-8 text-sm">
          <Link href="#" className="hover:underline underline-offset-4">About us</Link>
          <Link href="#services" className="hover:underline underline-offset-4">Services</Link>
          <Link href="#" className="hover:underline underline-offset-4">Courses</Link>
          <Link href="#" className="hover:underline underline-offset-4">Events</Link>
          <Link href="#" className="hover:underline underline-offset-4">Blog</Link>
        </nav>

        {/* Header Right Actions */}
        <div className="flex items-center gap-4">
          <Link href="/admission/register" className="group">
            <button className="bg-black rounded-xl cursor-pointer border-none font-bold text-base">
              <span className="block border-2 border-black rounded-xl px-4 py-2 bg-[#B9FF66] text-black transform -translate-y-1 group-hover:-translate-y-1.5 group-active:translate-y-0 transition-transform duration-100">
                New Enroll
              </span>
            </button>
          </Link>

          {/* Login/Dashboard Button - 3D Style (Right Side) */}
          <Link href={session ? "/dashboard" : "/signin"} className="group">
            <button className="bg-black rounded-xl cursor-pointer border-none font-bold text-base">
              <span className="block border-2 border-black rounded-xl px-5 py-2 bg-[#e8e8e8] text-black transform -translate-y-1 group-hover:-translate-y-1.5 group-active:translate-y-0 transition-transform duration-100">
                {session ? "Dashboard" : "Login"}
              </span>
            </button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-8 lg:px-16 py-12 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl lg:text-5xl font-bold leading-tight">
              Navigating the<br />
              educational landscape<br />
              for success
            </h1>
            <p className="text-gray-600 max-w-md leading-relaxed">
              Our college super app helps students grow and succeed through a range of
              services including course management, attendance tracking, and campus events.
            </p>
            <Link
              href="/signup"
              className="inline-block px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Book a consultation
            </Link>
          </div>

          {/* Hero Illustration */}
          <div className="flex-1 relative">
            <div className="w-full h-80 relative">
              {/* Megaphone/Speaker illustration */}
              <div className="absolute right-0 top-1/2 -translate-y-1/2">
                <div className="w-48 h-48 bg-[#B9FF66] rounded-full flex items-center justify-center transform rotate-12">
                  <GraduationCap size={80} className="text-black" />
                </div>
                {/* Floating icons */}
                <div className="absolute -top-4 right-0 w-10 h-10 bg-[#B9FF66] rounded-full flex items-center justify-center">
                  <span className="text-black">♥</span>
                </div>
                <div className="absolute top-4 -right-8 w-10 h-10 bg-[#B9FF66] rounded-full flex items-center justify-center">
                  <span className="text-black">↗</span>
                </div>
                <div className="absolute -bottom-4 right-12 w-8 h-8 bg-[#B9FF66] rounded-full flex items-center justify-center">
                  <span className="text-black text-xs">▶</span>
                </div>
                <div className="absolute bottom-8 -left-4 w-8 h-8 bg-[#B9FF66] rounded-full flex items-center justify-center">
                  <span className="text-black text-xs">📍</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Logos */}
      <section className="px-8 lg:px-16 py-8 border-t border-b border-gray-200">
        <div className="flex flex-wrap items-center justify-center gap-12 text-gray-400 text-xl font-semibold">
          <span>IIT</span>
          <span>NIT</span>
          <span>BITS</span>
          <span>VIT</span>
          <span>MIT</span>
          <span>Stanford</span>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="px-8 lg:px-16 py-16">
        <div className="flex flex-col md:flex-row items-start gap-8 mb-12">
          <h2 className="text-3xl font-bold bg-[#B9FF66] px-4 py-2 rounded-lg">Services</h2>
          <p className="text-gray-600 max-w-xl">
            At our college super app, we offer a range of services to help students
            grow and succeed in their academic journey. These services include:
          </p>
        </div>

        {/* Service Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1 - Dark */}
          <div className="bg-black text-white p-8 rounded-3xl flex flex-col justify-between min-h-[240px] relative overflow-hidden">
            <div>
              <h3 className="text-xl font-bold mb-2">
                <span className="bg-[#B9FF66] text-black px-2 py-1 rounded">Course</span>
                <br />
                <span className="bg-white text-black px-2 py-1 rounded mt-1 inline-block">management</span>
              </h3>
            </div>
            <Link href="#" className="flex items-center gap-2 text-[#B9FF66] font-medium hover:underline">
              <div className="w-6 h-6 bg-[#B9FF66] rounded-full flex items-center justify-center">
                <span className="text-black text-xs">→</span>
              </div>
              Learn more
            </Link>
            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20">
              <BookOpen size={100} />
            </div>
          </div>

          {/* Card 2 - Light */}
          <div className="bg-white border-2 border-black p-8 rounded-3xl flex flex-col justify-between min-h-[240px] relative overflow-hidden">
            <div>
              <h3 className="text-xl font-bold mb-2">
                <span className="bg-[#B9FF66] px-2 py-1 rounded">Attendance</span>
                <br />
                <span className="bg-white px-2 py-1 rounded mt-1 inline-block">tracking</span>
              </h3>
            </div>
            <Link href="#" className="flex items-center gap-2 font-medium hover:underline">
              <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-xs">→</span>
              </div>
              Learn more
            </Link>
            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
              <Calendar size={100} />
            </div>
          </div>

          {/* Card 3 - Light */}
          <div className="bg-white border-2 border-black p-8 rounded-3xl flex flex-col justify-between min-h-[240px] relative overflow-hidden">
            <div>
              <h3 className="text-xl font-bold mb-2">
                <span className="bg-[#B9FF66] px-2 py-1 rounded">Student</span>
                <br />
                <span className="bg-white px-2 py-1 rounded mt-1 inline-block">community</span>
              </h3>
            </div>
            <Link href="#" className="flex items-center gap-2 font-medium hover:underline">
              <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
                <span className="text-white text-xs">→</span>
              </div>
              Learn more
            </Link>
            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-10">
              <Users size={100} />
            </div>
          </div>

          {/* Card 4 - Dark */}
          <div className="bg-black text-white p-8 rounded-3xl flex flex-col justify-between min-h-[240px] relative overflow-hidden">
            <div>
              <h3 className="text-xl font-bold mb-2">
                <span className="bg-[#B9FF66] text-black px-2 py-1 rounded">Campus</span>
                <br />
                <span className="bg-white text-black px-2 py-1 rounded mt-1 inline-block">events</span>
              </h3>
            </div>
            <Link href="#" className="flex items-center gap-2 text-[#B9FF66] font-medium hover:underline">
              <div className="w-6 h-6 bg-[#B9FF66] rounded-full flex items-center justify-center">
                <span className="text-black text-xs">→</span>
              </div>
              Learn more
            </Link>
            <div className="absolute right-8 top-1/2 -translate-y-1/2 opacity-20">
              <Award size={100} />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-8 lg:px-16 py-16">
        <div className="bg-[#F3F3F3] border-2 border-black rounded-3xl p-8 lg:p-12 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="flex-1 space-y-4">
            <h2 className="text-2xl lg:text-3xl font-bold">Let&apos;s make things happen</h2>
            <p className="text-gray-600 max-w-md">
              Contact us today to learn more about how our college super app
              can help you succeed in your academic journey.
            </p>
            <Link
              href="/signup"
              className="inline-block px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
            >
              Get your free proposal
            </Link>
          </div>
          <div className="flex-shrink-0">
            <div className="w-32 h-32 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-[#B9FF66] rounded-full"></div>
              </div>
              <div className="absolute top-0 right-0 w-4 h-4 bg-[#B9FF66]" style={{ clipPath: 'polygon(50% 0%, 100% 100%, 0% 100%)' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section className="px-8 lg:px-16 py-16">
        <div className="flex flex-col md:flex-row items-start gap-8 mb-12">
          <h2 className="text-3xl font-bold bg-[#B9FF66] px-4 py-2 rounded-lg">Success Stories</h2>
          <p className="text-gray-600 max-w-xl">
            Explore Real-Life Examples of Our Students&apos; Academic Success
            through Our Case Studies
          </p>
        </div>

        <div className="bg-black text-white rounded-3xl p-8 lg:p-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-gray-700">
            {/* Story 1 */}
            <div className="space-y-4 md:pr-8">
              <p className="text-gray-300 text-sm leading-relaxed">
                For a first-year student, we implemented a comprehensive study plan
                that resulted in a 50% increase in academic performance and a
                25% improvement in attendance.
              </p>
              <Link href="#" className="flex items-center gap-2 text-[#B9FF66] font-medium hover:underline">
                Learn more →
              </Link>
            </div>

            {/* Story 2 */}
            <div className="space-y-4 md:px-8 pt-8 md:pt-0">
              <p className="text-gray-300 text-sm leading-relaxed">
                For a computer science major, we optimized their course schedule
                that resulted in a first-class ranking for key subjects and a 300%
                increase in project submissions.
              </p>
              <Link href="#" className="flex items-center gap-2 text-[#B9FF66] font-medium hover:underline">
                Learn more →
              </Link>
            </div>

            {/* Story 3 */}
            <div className="space-y-4 md:pl-8 pt-8 md:pt-0">
              <p className="text-gray-300 text-sm leading-relaxed">
                For a national scholarship winner, we created a tailored study
                campaign that increased their GPA by 35% and
                generated a 20% increase in extracurricular activities.
              </p>
              <Link href="#" className="flex items-center gap-2 text-[#B9FF66] font-medium hover:underline">
                Learn more →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white px-8 lg:px-16 py-12 mt-16 rounded-t-3xl">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="VARTAK_SA Logo" className="w-10 h-10 object-contain bg-white rounded-lg p-1" />
              <span className="font-bold text-xl">VARTAK_SA</span>
            </div>
            <p className="text-gray-400 text-sm max-w-xs">
              Empowering students to achieve academic excellence through innovative technology.
            </p>
          </div>

          <div className="flex gap-12">
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <div className="flex flex-col gap-2 text-gray-400 text-sm">
                <Link href="#" className="hover:text-white">About us</Link>
                <Link href="#" className="hover:text-white">Services</Link>
                <Link href="#" className="hover:text-white">Courses</Link>
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <div className="flex flex-col gap-2 text-gray-400 text-sm">
                <span>hello@collegesuperapp.com</span>
                <span>+91 1234567890</span>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          © 2024 VARTAK_SA. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
