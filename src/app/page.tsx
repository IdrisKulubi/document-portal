"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import {  User, Printer, Shield, Search, Share2 } from "lucide-react";

export default function Home() {
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 },
  };

  const staggerChildren = {
    animate: { transition: { staggerChildren: 0.1 } },
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-800">
      <header className="w-full py-4 px-6 bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center"
          >
            <Image src="/assets/logo/logo.svg" alt="Document Portal" width={100} height={100} className="w-10 h-10 animate-float mr-2" />
            <span className="text-xl font-bold text-white">
              Document Portal
            </span>
          </motion.div>
          <motion.nav
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Button variant="ghost" className="text-white hover:text-blue-400">
              Features
            </Button>
            <Button variant="ghost" className="text-white hover:text-blue-400">
              About
            </Button>
            <Button variant="ghost" className="text-white hover:text-blue-400">
              Contact
            </Button>
          </motion.nav>
        </div>
      </header>

      <main className="flex-grow">
        <section className="py-20 px-6">
          <div className="container mx-auto text-center">
            <motion.h1
              className="text-4xl md:text-6xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Secure Document Sharing Made Simple
            </motion.h1>
            <motion.p
              className="text-xl text-gray-300 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Upload, manage, and share your documents with ease and security.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row justify-center gap-4"
              variants={staggerChildren}
              initial="initial"
              animate="animate"
            >
              <motion.div variants={fadeInUp}>
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-lg px-8 bg-blue-600 hover:bg-blue-700 text-white"
                  onMouseEnter={() => setHoveredButton("admin")}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  <User
                    className={`mr-2 h-5 w-5 ${
                      hoveredButton === "admin" ? "animate-bounce" : ""
                    }`}
                  />
                  Login as Admin
                </Button>
              </motion.div>
              <motion.div variants={fadeInUp}>
                <Button
                  size="lg"
                  className="w-full sm:w-auto text-lg px-8 bg-gray-600 hover:bg-gray-700 text-white"
                  onMouseEnter={() => setHoveredButton("printer")}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  <Printer
                    className={`mr-2 h-5 w-5 ${
                      hoveredButton === "printer" ? "animate-bounce" : ""
                    }`}
                  />
                  Login as Printer
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <section className="py-20 px-6 bg-gray-800">
          <div className="container mx-auto">
            <motion.h2
              className="text-3xl font-bold text-white mb-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Key Features
            </motion.h2>
            <motion.div
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
              variants={staggerChildren}
              initial="initial"
              animate="animate"
            >
              {[
                {
                  icon: Shield,
                  title: "Secure Storage",
                  description:
                    "Your documents are encrypted and stored securely.",
                },
                {
                  icon: Search,
                  title: "Easy Retrieval",
                  description:
                    "Find your documents quickly with our powerful search.",
                },
                {
                  icon: Share2,
                  title: "Controlled Sharing",
                  description: "Share documents with specific users or groups.",
                },
              ].map((feature, index) => (
                <motion.div key={index} variants={fadeInUp}>
                  <Card className="p-6 bg-gray-700 border-gray-600 hover:border-blue-400 transition-colors duration-300">
                    <feature.icon className="w-12 h-12 text-blue-400 mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300">{feature.description}</p>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-20 px-6">
          <div className="container mx-auto text-center">
            <motion.h2
              className="text-3xl font-bold text-white mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              How It Works
            </motion.h2>
            <motion.div
              className="flex flex-col md:flex-row justify-center items-center gap-8"
              variants={staggerChildren}
              initial="initial"
              animate="animate"
            >
              {[
                {
                  step: 1,
                  title: "Upload",
                  description: "Securely upload your documents",
                },
                {
                  step: 2,
                  title: "Manage",
                  description: "Organize and categorize your files",
                },
                {
                  step: 3,
                  title: "Share",
                  description: "Control access and share as needed",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="flex flex-col items-center"
                >
                  <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-bold text-white mb-4">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-300">{item.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="py-20 px-6 bg-gray-800">
          <div className="container mx-auto text-center">
            <motion.h2
              className="text-3xl font-bold text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Ready to Get Started?
            </motion.h2>
            <motion.p
              className="text-xl text-gray-300 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Join thousands of satisfied users and revolutionize your document
              management today.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Button
                size="lg"
                className="text-lg px-8 bg-blue-600 hover:bg-blue-700 text-white"
              >
                Sign Up Now
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="w-full py-6 px-6 bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 mb-4 md:mb-0">
            &copy; 2025 Document Portal. All rights reserved.
          </div>
          <nav className="flex gap-4">
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-white transition-colors"
            >
              Contact Us
            </a>
          </nav>
        </div>
      </footer>
    </div>
  );
}
