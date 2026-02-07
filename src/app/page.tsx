"use client";

import { useRef, useEffect } from "react";
import { Heart, Shield, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import HeroScene from "@/components/HeroScene";
import { motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const mainRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // 3D transition for each section
    const sections = gsap.utils.toArray('section') as HTMLElement[];

    sections.forEach((section, i) => {
      // Entry animation
      if (i !== 0) {
        gsap.fromTo(section,
          {
            opacity: 0,
            scale: 0.8,
            rotationX: 45,
            z: -500,
            transformPerspective: 1000
          },
          {
            opacity: 1,
            scale: 1,
            rotationX: 0,
            z: 0,
            scrollTrigger: {
              trigger: section,
              start: "top bottom",
              end: "top top",
              scrub: 0.8,
            }
          }
        );
      }

      // Exit animation (scale out)
      if (i < sections.length - 1) {
        gsap.to(section, {
          scale: 0.9,
          opacity: 0.2,
          rotationX: -20,
          filter: "blur(10px)",
          scrollTrigger: {
            trigger: sections[i + 1],
            start: "top bottom",
            end: "top top",
            scrub: 0.8
          }
        });
      }

      // Special parallax for community images
      if (section.classList.contains('community')) {
        gsap.to('.char-puppet-wrapper', {
          y: -50,
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5
          }
        });
      }
    });
  }, { scope: mainRef });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.3,
      }
    }
  };

  const titleContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.04,
        delayChildren: 0.6,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 100, opacity: 0, skewY: 7 },
    visible: {
      y: 0,
      opacity: 1,
      skewY: 0,
      transition: {
        duration: 1.2,
        ease: [0.33, 1, 0.68, 1] as any
      }
    }
  };

  const title = "Expert Care for Every Journey";

  const charVariants = {
    hidden: { opacity: 0, scale: 0.8, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      scale: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 0.4,
        ease: "easeOut" as any
      }
    }
  };

  return (
    <div className="landing-page" ref={mainRef}>
      <header className="header">
        <div className="container header-content">
          <div className="logo">
            <Heart size={32} color="var(--secondary-color)" />
            <span>Time For Hope</span>
          </div>
          <nav className="nav">
            <Link href="/login" className="btn-secondary">Login</Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero">
          <HeroScene />
          <motion.div
            className="container hero-content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="reveal-container">
              <motion.h1
                variants={titleContainerVariants}
              >
                {title.split("").map((char, index) => (
                  <motion.span
                    key={index}
                    variants={charVariants}
                    style={{ display: 'inline-block' }}
                  >
                    {char === " " ? "\u00A0" : char}
                  </motion.span>
                ))}
              </motion.h1>
            </div>

            <div className="reveal-container">
              <motion.p variants={itemVariants}>
                Empowering NDIS and Aged Care providers with seamless management,
                document compliance, and dedicated support.
              </motion.p>
            </div>

            <div className="reveal-container">
              <motion.div className="hero-actions" variants={itemVariants}>
                <Link href="/login" className="btn-primary">
                  Get Started <ArrowRight size={20} />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </section>

        <section className="mission">
          <div className="mission-background">
            <img
              src="/modern_care_hero_1767321594406.png"
              alt="Professional Healthcare Consultation Space"
            />
            <div className="mission-overlay"></div>
          </div>
          <div className="container mission-content">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <h2>A Foundation of Trust</h2>
              <p>
                We believe that every person deserves care that is as professional as it is compassionate.
                Our platform provides the stability you need to focus on what truly matters:
                supporting your community with dignity and excellence.
              </p>
              <div className="mission-stats">
                <div className="stat">
                  <h4>100%</h4>
                  <span>Compliance Guarantee</span>
                </div>
                <div className="stat">
                  <h4>24/7</h4>
                  <span>Admin Support</span>
                </div>
                <div className="stat">
                  <h4>Real-time</h4>
                  <span>Engagement Tracking</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="community">
          <div className="container">
            <motion.div
              className="community-header"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2>Inclusive Care for All</h2>
              <p>
                From professionals and skilled workers to athletes and the elderly,
                our platform is built for the diverse faces of our community.
                Seamless management for everyone involved in care.
              </p>
            </motion.div>
            <motion.div
              className="community-characters"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
            >
              {[
                {
                  src: '/char_elderly.png', alt: 'Elderly Woman', color: 'blue', delay: 0,
                  bodyClip: 'polygon(0% 18%, 100% 18%, 100% 100%, 0% 100%)',
                  headClip: 'circle(30% at 55% 15%)',
                  actionClip: 'circle(30% at 68% 38%)',
                  type: 'typing'
                },
                {
                  src: '/char_worker.png', alt: 'Construction Worker', color: 'yellow', delay: 0.2,
                  bodyClip: 'polygon(0% 15%, 100% 15%, 100% 100%, 0% 100%)',
                  headClip: 'circle(25% at 53% 13%)',
                  actionClip: 'circle(35% at 58% 38%)',
                  type: 'writing'
                },
                {
                  src: '/char_athlete.png', alt: 'Athlete', color: 'magenta', delay: 0.4,
                  bodyClip: 'polygon(0% 18%, 100% 18%, 100% 100%, 0% 100%)',
                  headClip: 'circle(25% at 50% 15%)',
                  actionClip: 'circle(35% at 68% 45%)',
                  type: 'bouncing'
                },
                {
                  src: '/char_businessman.png', alt: 'Professional', color: 'teal', delay: 0.6,
                  bodyClip: 'polygon(0% 15%, 100% 15%, 100% 100%, 0% 100%)',
                  headClip: 'circle(22% at 52% 12%)',
                  actionClip: 'circle(30% at 35% 65%)',
                  type: 'checking'
                }
              ].map((char, i) => (
                <motion.div
                  key={i}
                  className={`character-box ${char.color}`}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ delay: char.delay, duration: 0.8 }}
                >
                  <div className="char-puppet-wrapper">
                    <img
                      src={char.src}
                      alt={char.alt}
                      className="puppet-layer body"
                      style={{ clipPath: char.bodyClip }}
                    />
                    <motion.img
                      src={char.src}
                      className="puppet-layer head"
                      style={{ clipPath: char.headClip, transformOrigin: '50% 25%' }}
                      animate={{
                        rotate: [-2, 3, -1, 0, -2],
                        y: [0, 1, -0.5, 0]
                      }}
                      transition={{ duration: 5 + i, repeat: Infinity, ease: "easeInOut" }}
                    />
                    <motion.img
                      src={char.src}
                      className="puppet-layer action"
                      style={{ clipPath: char.actionClip, transformOrigin: 'center' }}
                      animate={
                        char.type === 'typing' ? { x: [0, 1.5, 0], y: [0, 1, 0] } :
                          char.type === 'writing' ? { x: [0, 2, -1, 0], y: [0, 1.5, 0] } :
                            char.type === 'bouncing' ? { y: [0, 3, 0], scale: [1, 1.02, 1] } :
                              { rotate: [0, -1, 1, 0] }
                      }
                      transition={{ duration: 2.5 + i, repeat: Infinity, ease: "easeInOut" }}
                    />
                  </div>
                  <div className="char-glow"></div>
                </motion.div>
              ))
              }
            </motion.div>
          </div>
        </section>

        <section className="features">
          <div className="container grid">
            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <Shield size={40} color="var(--secondary-color)" />
              <h3>Compliance First</h3>
              <p>Keep your documentation up to date with our automated tracking and audit-ready storage.</p>
            </motion.div>
            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <Users size={40} color="var(--secondary-color)" />
              <h3>Support Tracking</h3>
              <p>Monitor support worker progress and induction completion in real-time from your admin dashboard.</p>
            </motion.div>
            <motion.div
              className="feature-card"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 }}
            >
              <Heart size={40} color="var(--secondary-color)" />
              <h3>Care-Centric</h3>
              <p>Designed specifically for the unique needs of NDIS and Aged Care business owners.</p>
            </motion.div>
          </div>
        </section>
      </main>

      <style jsx global>{`
        .landing-page {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          background: #020617;
          perspective: 2000px;
          overflow-x: hidden;
        }

        section {
          transform-style: preserve-3d;
          will-change: transform, opacity, filter;
        }

        .reveal-container {
          margin-bottom: 8px;
        }

        .header {
          height: var(--header-height);
          display: flex;
          align-items: center;
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(12px);
          z-index: 1000;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          width: 100%;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 12px;
          font-family: var(--font-heading);
          font-size: 24px;
          font-weight: 700;
          color: white;
        }

        .hero {
          padding: 160px 0 100px;
          position: relative;
          background: #020617;
          overflow: hidden;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
        }

        .hero-content {
          position: relative;
          z-index: 10;
          text-align: center;
          background: rgba(15, 23, 42, 0.2);
          backdrop-filter: blur(8px);
          padding: 80px;
          border-radius: var(--radius-2xl);
          border: 1px solid rgba(255, 255, 255, 0.05);
          max-width: 1000px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }

        .hero-content h1 {
          font-size: 84px;
          line-height: 1.1;
          margin-bottom: 32px;
          font-weight: 900;
          letter-spacing: -0.04em;
          color: white; /* Fallback */
        }

        .hero-content h1 span {
          background: linear-gradient(180deg, #fff 0%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          display: inline-block;
        }

        .hero-content p {
          font-size: 24px;
          color: #94a3b8;
          max-width: 700px;
          margin: 0 auto 48px;
          line-height: 1.5;
          font-weight: 400;
        }

        .hero-actions {
          display: flex;
          justify-content: center;
          gap: 16px;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 36px;
          font-size: 18px;
          border-radius: 100px;
          background: white;
          color: #020617;
          font-weight: 700;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .btn-primary:hover {
          transform: translateY(-4px) scale(1.05);
          box-shadow: 0 20px 40px rgba(255, 255, 255, 0.1);
          background: var(--secondary-color);
          color: white;
        }

        .mission {
          position: relative;
          min-height: 80vh;
          display: flex;
          align-items: center;
          overflow: hidden;
          background: #020617;
        }

        .mission-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 1;
        }

        .mission-background img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.4;
          transform: scale(1.1);
        }

        .mission-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(0deg, #020617 0%, rgba(2, 6, 23, 0.5) 50%, #020617 100%);
          z-index: 2;
        }

        .mission-content {
          position: relative;
          z-index: 10;
          max-width: 800px;
          margin-left: 0;
        }

        .mission-content h2 {
          font-size: 56px;
          color: white;
          margin-bottom: 32px;
          font-weight: 800;
        }

        .mission-content p {
          font-size: 20px;
          color: #94a3b8;
          line-height: 1.6;
          margin-bottom: 48px;
        }

        .mission-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .stat {
          padding: 24px;
          background: rgba(30, 41, 59, 0.4);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-xl);
        }

        .stat h4 {
          font-size: 28px;
          color: white;
          margin-bottom: 8px;
        }

        .stat span {
          font-size: 14px;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 600;
        }

        .community {
          padding: 120px 0;
          background: #f8fafc; /* Light slate background to blend with sketches */
          position: relative;
          z-index: 10;
          color: #020617;
        }

        .community-header h2 {
          font-size: 56px;
          color: #020617;
          margin-bottom: 24px;
          font-weight: 800;
        }

        .community-header p {
          font-size: 20px;
          color: #475569;
          line-height: 1.6;
        }

        .community-characters {
          display: flex;
          justify-content: center;
          align-items: flex-end;
          gap: 20px;
          margin-top: 60px;
          flex-wrap: wrap;
        }

        .character-box {
          position: relative;
          width: 240px;
          background: white;
          padding: 20px;
          border-radius: 30px;
          box-shadow: 0 20px 40px rgba(0,0,0,0.05);
          transition: transform 0.4s ease, box-shadow 0.4s ease;
          overflow: hidden;
        }

        .char-puppet-wrapper {
          position: relative;
          width: 100%;
          height: 380px; /* Increased height */
          border-radius: 20px;
          margin-bottom: 20px;
        }

        .puppet-layer {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          object-position: bottom;
          pointer-events: none;
        }

        .puppet-layer.body {
          z-index: 1;
          opacity: 1;
        }

        .puppet-layer.head {
          z-index: 3;
        }

        .puppet-layer.action {
          z-index: 4;
        }

        .char-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 200px;
          height: 200px;
          border-radius: 50%;
          z-index: 1;
          opacity: 0.2;
          filter: blur(40px);
        }

        .character-box.blue .char-glow { background: #60a5fa; }
        .character-box.yellow .char-glow { background: #facc15; }
        .character-box.magenta .char-glow { background: #f472b6; }
        .character-box.teal .char-glow { background: #2dd4bf; }

        .features {
          padding: 120px 0;
          background: #020617;
          position: relative;
          z-index: 10;
        }

        .grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 40px;
        }

        .feature-card {
          padding: 48px;
          background: rgba(30, 41, 59, 0.3);
          backdrop-filter: blur(8px);
          border-radius: var(--radius-2xl);
          border: 1px solid rgba(255, 255, 255, 0.05);
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .feature-card:hover {
          transform: translateY(-12px);
          background: rgba(30, 41, 59, 0.5);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.5);
        }

        .feature-card h3 {
          margin: 24px 0 16px;
          color: white;
          font-size: 24px;
        }

        .feature-card p {
          color: #94a3b8;
          font-size: 16px;
          line-height: 1.6;
        }

        @media (max-width: 768px) {
          .hero-content h1 {
            font-size: 48px;
          }
          .hero-content p {
            font-size: 18px;
          }
          .hero-content {
            padding: 40px 24px;
          }
        }
      `}</style>
    </div>
  );
}
