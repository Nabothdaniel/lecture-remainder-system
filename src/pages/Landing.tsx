import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiCalendar, FiClock, FiBell, FiLayers } from "react-icons/fi";
import { gsap } from "gsap";

const Landing = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Hero animations
    if (heroRef.current) {
      const elements = heroRef.current.querySelectorAll(".animate-hero");
      gsap.fromTo(
        elements,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, stagger: 0.2, ease: "power3.out" }
      );
    }

    // Features animation
    if (featuresRef.current) {
      const cards = featuresRef.current.querySelectorAll(".feature-card");
      gsap.fromTo(
        cards,
        { opacity: 0, y: 40, scale: 0.95 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.15,
          ease: "back.out(1.7)",
          scrollTrigger: {
            trigger: featuresRef.current,
            start: "top 80%",
          },
        }
      );
    }
  }, []);

  const features = [
    {
      icon: FiCalendar,
      title: "Schedule Management",
      description: "Organize all your lectures with dates, times, and locations in one place.",
    },
    {
      icon: FiClock,
      title: "Smart Reminders",
      description: "Never miss a class with intelligent reminder notifications.",
    },
    {
      icon: FiBell,
      title: "Upcoming Alerts",
      description: "Get notified about lectures happening in the next 24 hours.",
    },
    {
      icon: FiLayers,
      title: "Course Organization",
      description: "Group lectures by course code and track your academic schedule.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 text-gray-900">
      {/* Hero Section */}
      <div ref={heroRef} className="container mx-auto px-4 pt-20 pb-32 text-center">
        <div className="animate-hero max-w-4xl mx-auto">
          <div className="inline-block mb-6 px-4 py-2 bg-black/5 rounded-full">
            <span className="text-black font-semibold text-sm">📚 Your Academic Companion</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-black to-gray-800 bg-clip-text text-transparent">
            Lecture Reminder System
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Stay organized and never miss a lecture again. Manage your academic schedule with ease and style.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate("/auth")}
              className="text-lg px-8 py-4 bg-black text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-transform duration-300"
            >
              Get Started
            </button>
            <button
              onClick={() => featuresRef.current?.scrollIntoView({ behavior: "smooth" })}
              className="text-lg px-8 py-4 border border-gray-300 rounded-xl hover:bg-gray-100 transition-all duration-300"
            >
              Learn More
            </button>
          </div>
        </div>

        {/* Hero Visual */}
        <div className="animate-hero mt-16 max-w-5xl mx-auto">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-gray-200/40 to-gray-300/30 blur-3xl rounded-full" />
            <div className="relative backdrop-blur-sm bg-white/80 shadow-xl border border-gray-200 rounded-2xl p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <FiCalendar className="w-12 h-12 mx-auto mb-3 text-black" />
                  <h3 className="font-semibold text-lg mb-2">Easy Scheduling</h3>
                  <p className="text-gray-500 text-sm">Add lectures in seconds</p>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <FiBell className="w-12 h-12 mx-auto mb-3 text-black" />
                  <h3 className="font-semibold text-lg mb-2">Smart Alerts</h3>
                  <p className="text-gray-500 text-sm">Timely notifications</p>
                </div>
                <div className="text-center p-6 bg-gray-50 rounded-xl">
                  <FiLayers className="w-12 h-12 mx-auto mb-3 text-black" />
                  <h3 className="font-semibold text-lg mb-2">Organized View</h3>
                  <p className="text-gray-500 text-sm">Beautiful dashboard</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div ref={featuresRef} className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything You Need</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful features designed to keep your academic life organized and stress-free.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="feature-card group bg-white border border-gray-200 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
              >
                <div className="p-8">
                  <div className="mb-4 inline-block p-4 bg-gray-100 rounded-2xl group-hover:bg-gray-200 transition-colors">
                    <Icon className="w-8 h-8 text-black" />
                  </div>
                  <h3 className="text-2xl font-semibold mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CTA Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 shadow-xl rounded-2xl p-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Organized?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join students who never miss a lecture. Sign up now and take control of your schedule.
          </p>
          <button
            onClick={() => navigate("/auth")}
            className="text-lg px-10 py-5 bg-black text-white rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-transform duration-300"
          >
            Start Free Today
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-gray-500">
          <p>© {new Date().getFullYear()} Lecture Reminder System.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
