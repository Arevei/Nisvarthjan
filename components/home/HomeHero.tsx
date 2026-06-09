import { useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useSpring,
  useMotionValueEvent,
} from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { useLanguage } from "@/lib/language-context";

interface HeroStats {
  livesImpacted: number;
  villagesCovered: number;
  treesPlanted: number;
}

interface HeroParallaxProps {
  stats?: HeroStats | null;
}

export function HomeHero({ stats }: HeroParallaxProps) {
  const { t } = useLanguage();
  const heroRef      = useRef<HTMLDivElement>(null);
  const blurLayerRef = useRef<HTMLDivElement>(null);
  const maskRafRef   = useRef<number | null>(null);
  const pendingMask  = useRef<string>("");
  const appliedMask  = useRef<string>("");

  /* ── scroll progress over the whole 210 vh ── */
  const { scrollYProgress } = useScroll({
    target:  heroRef,
    offset: ["start start", "end end"],
  });
  const smooth = useSpring(scrollYProgress, { stiffness: 75, damping: 20 });

  /* ── radial blur mask: circle SHRINKS as you scroll ── */
  const clearPct    = useTransform(smooth, [0, 0.3, 0.68], [62, 42, 10]);
  const blurEdgePct = useTransform(smooth, [0, 0.3, 0.68], [80, 62, 34]);

  useMotionValueEvent(clearPct, "change", (v) => {
    if (!blurLayerRef.current) return;
    const r  = Math.round(v * 2) / 2;
    const e  = Math.round(blurEdgePct.get() * 2) / 2;
    const m  = `radial-gradient(ellipse ${r}% ${r * 0.87}% at 50% 54%, transparent 0%, transparent ${r * 0.93}%, rgba(0,0,0,0.55) ${e}%, black 100%)`;
    pendingMask.current = m;
    if (maskRafRef.current !== null) return;
    maskRafRef.current = window.requestAnimationFrame(() => {
      maskRafRef.current = null;
      if (!blurLayerRef.current || appliedMask.current === pendingMask.current) return;
      blurLayerRef.current.style.maskImage = pendingMask.current;
      (blurLayerRef.current.style as CSSStyleDeclaration & { webkitMaskImage: string }).webkitMaskImage = pendingMask.current;
      appliedMask.current = pendingMask.current;
    });
  });

  useEffect(() => {
    if (!blurLayerRef.current) return;
    const m = `radial-gradient(ellipse 62% 54% at 50% 54%, transparent 0%, transparent 58%, rgba(0,0,0,0.55) 80%, black 100%)`;
    blurLayerRef.current.style.maskImage = m;
    (blurLayerRef.current.style as CSSStyleDeclaration & { webkitMaskImage: string }).webkitMaskImage = m;
    appliedMask.current = m;
  }, []);

  useEffect(() => () => { if (maskRafRef.current) cancelAnimationFrame(maskRafRef.current); }, []);

  /* ── expanding rings ── */
  const ring1Scale   = useTransform(smooth, [0, 0.65], [1,   4.5]);
  const ring2Scale   = useTransform(smooth, [0, 0.65], [1,   7]);
  const ring3Scale   = useTransform(smooth, [0, 0.65], [1,  11]);
  const ring1Opacity = useTransform(smooth, [0, 0.25, 0.65], [0.55, 0.75, 0]);
  const ring2Opacity = useTransform(smooth, [0, 0.25, 0.65], [0.35, 0.50, 0]);
  const ring3Opacity = useTransform(smooth, [0, 0.25, 0.65], [0.18, 0.28, 0]);

  /* ── vignette + white wash ── */
  const vignetteOpacity = useTransform(smooth, [0, 0.35, 0.68, 0.88], [0.62, 0.78, 0.94, 0]);
  const whiteOverlay    = useTransform(smooth, [0.76, 0.97], [0, 1]);

  /* ── section transitions ── */
  const s1Opacity = useTransform(smooth, [0, 0.18, 0.44], [1, 1, 0]);
  const s1Y       = useTransform(smooth, [0, 0.44], ["0px", "-70px"]);
  const s2Opacity = useTransform(smooth, [0.44, 0.72], [0, 1]);
  const s2Y       = useTransform(smooth, [0.44, 0.72], ["70px", "0px"]);

  /* ── adaptive text colors (dark photo → white bg) ── */
  const lightMode = useTransform(smooth, [0.7, 0.96], [0, 1]);
  const h_r = useTransform(lightMode, [0, 1], [255, 139]);
  const h_g = useTransform(lightMode, [0, 1], [255, 16]);
  const h_b = useTransform(lightMode, [0, 1], [255, 35]);
  const headingColor   = useMotionTemplate`rgba(${h_r},${h_g},${h_b},0.92)`;

  const b_r = useTransform(lightMode, [0, 1], [240, 75]);
  const b_g = useTransform(lightMode, [0, 1], [230, 75]);
  const b_b = useTransform(lightMode, [0, 1], [220, 75]);
  const bodyColor      = useMotionTemplate`rgba(${b_r},${b_g},${b_b},0.85)`;

  const divOpacity     = useTransform(lightMode, [0, 1], [0.55, 0.85]);
  const dividerColor   = useMotionTemplate`rgba(177,18,38,${divOpacity})`;

  const btnBorder      = useMotionTemplate`rgba(177,18,38,${useTransform(lightMode, [0,1], [0.3, 0.55])})`;

  return (
    <section
      ref={heroRef}
      className="relative bg-white isolate overflow-hidden"
      style={{ height: "210vh" }}
    >
      {/* ══ BACKGROUND ══════════════════════════════════════════ */}
      <div className="absolute inset-0 z-0">
        {/* Sharp base image */}
        <div
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2400)",
            backgroundPosition: "center 58%",
          }}
        />

        {/* Blurred copy: radial mask creates clear-center / blurred-edge */}
        <div
          ref={blurLayerRef}
          className="absolute inset-0 bg-cover bg-no-repeat"
          style={{
            backgroundImage: "url(https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=2400)",
            backgroundPosition: "center 58%",
            filter: "blur(28px)",
            transform: "translateZ(0) scale(1.07)",
            willChange: "mask-image, transform",
            backfaceVisibility: "hidden",
          }}
        />

        {/* Warm vignette */}
        <motion.div className="absolute inset-0" style={{ opacity: vignetteOpacity }}>
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 100% 100% at 50% 50%,
                transparent 0%, transparent 26%,
                rgba(12,3,3,0.32) 52%,
                rgba(8,2,2,0.70) 76%,
                rgba(5,1,1,0.90) 100%)`,
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to bottom, rgba(8,2,2,0.42) 0%, transparent 22%, transparent 68%, rgba(8,2,2,0.62) 100%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to right, rgba(177,18,38,0.28) 0%, transparent 50%)",
            }}
          />
        </motion.div>

        {/* White wash final layer */}
        <motion.div className="absolute inset-0 bg-white" style={{ opacity: whiteOverlay }} />
      </div>

      {/* ══ EXPANDING RINGS ═════════════════════════════════════ */}
      <div className="absolute inset-0 z-[1] flex items-center justify-center pointer-events-none overflow-hidden">
        {/* Inner tight ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 180, height: 180,
            border: "1.5px solid rgba(177,18,38,0.7)",
            scale: ring1Scale, opacity: ring1Opacity,
            boxShadow: "0 0 40px rgba(177,18,38,0.25), inset 0 0 40px rgba(177,18,38,0.1)",
          }}
        />
        {/* Mid ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 180, height: 180,
            border: "1px solid rgba(177,18,38,0.4)",
            scale: ring2Scale, opacity: ring2Opacity,
            boxShadow: "0 0 60px rgba(177,18,38,0.15)",
          }}
        />
        {/* Outer gossamer ring */}
        <motion.div
          className="absolute rounded-full"
          style={{
            width: 180, height: 180,
            border: "0.5px solid rgba(251,191,36,0.3)",
            scale: ring3Scale, opacity: ring3Opacity,
          }}
        />
        {/* Amber glow dot at center */}
        <motion.div
          className="absolute rounded-full bg-amber-400/30"
          style={{
            width: 8, height: 8,
            opacity: useTransform(smooth, [0, 0.5], [0.9, 0]),
            boxShadow: "0 0 24px rgba(251,191,36,0.8)",
          }}
        />
      </div>

      {/* ══ CONTENT ═════════════════════════════════════════════ */}
      <div className="relative z-10" style={{ top: "4vh" }}>

        {/* ── Section 1: Hero headline (sticky) ── */}
        <div className="sticky top-0 h-screen flex flex-col items-center justify-start overflow-hidden px-6 pt-[13vh] text-center pointer-events-none">
          <motion.div
            className="mx-auto flex max-w-5xl flex-col items-center"
            style={{ opacity: s1Opacity, y: s1Y }}
          >
            {/* Badge */}
            {/* <motion.div
              className="mb-7"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              <span className="inline-flex items-center gap-2.5 rounded-full border border-amber-300/22 bg-black/22 backdrop-blur-sm px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-amber-200/88">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                {t("Nisvarthjan Seva Foundation", "निस्वार्थजन सेवा फाउंडेशन")}
              </span>
            </motion.div> */}

            {/* Headline */}
            <motion.h1
              className="font-serif text-white"
              style={{
                fontSize: "clamp(2.6rem, 6.4vw, 5rem)",
                fontWeight: 400,
                lineHeight: 1,
                letterSpacing: "-0.010em",
                textShadow: "0 2px 48px rgba(4,1,1,0.9), 0 0 14px rgba(4,1,1,0.7)",
              }}
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.1, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            >
              {t("Empowering", "समुदायों को")}
              <br />
              {t("Communities,", "सशक्त बनाना,")}
              <br />
              <motion.span
                className="text-white"
                style={{ fontStyle: "italic" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.1, delay: 1.0 }}
              >
                {t("Transforming Lives.", "जीवन बदलना।")}
              </motion.span>
            </motion.h1>

            {/* Amber divider */}
            <motion.div
              className="mt-8 mb-7"
              style={{ height: 1, background: "linear-gradient(to right, transparent, rgba(251,191,36,0.7), transparent)" }}
              initial={{ scaleX: 0, opacity: 0, width: 140 }}
              animate={{ scaleX: 1, opacity: 1, width: 140 }}
              transition={{ duration: 1, delay: 1.15 }}
            />

            {/* Subtitle */}
            <motion.p
              className="mb-10 max-w-2xl font-serif text-white/80"
              style={{ fontSize: "clamp(1.02rem, 1.65vw, 1.22rem)", lineHeight: 1.82 }}
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.25 }}
            >
              {t(
                "Join us in bringing education, healthcare, and hope to rural India\u2019s forgotten villages.",
                "\u0917\u094d\u0930\u093e\u092e\u0940\u0923 \u092d\u093e\u0930\u0924 \u0915\u0947 \u0935\u0902\u091a\u093f\u0924 \u0917\u093e\u0901\u0935\u094b\u0902 \u092e\u0947\u0902 \u0936\u093f\u0915\u094d\u0937\u093e, \u0938\u094d\u0935\u093e\u0938\u094d\u0925\u094d\u092f \u0938\u0947\u0935\u093e \u0914\u0930 \u0909\u092e\u094d\u092e\u0940\u0926 \u0932\u093e\u0928\u0947 \u092e\u0947\u0902 \u0939\u092e\u093e\u0930\u0947 \u0938\u093e\u0925 \u091c\u0941\u0921\u093c\u0947\u0902\u0964"
              )}
            </motion.p>

            {/* CTAs */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 pointer-events-auto"
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.42 }}
            >
              <Button
                size="lg"
                asChild
                className="bg-[#B11226] hover:bg-[#8e0e1d] text-white text-base px-10 py-6 font-semibold shadow-[0_8px_36px_rgba(177,18,38,0.55)] hover:shadow-[0_14px_48px_rgba(177,18,38,0.75)] transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
              >
                <Link href="/donate">{t("Donate Now", "\u0905\u092d\u0940 \u0926\u093e\u0928 \u0915\u0930\u0947\u0902")}</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="text-base px-10 py-6 bg-white/10 backdrop-blur-sm text-white border-white/32 hover:bg-white hover:text-[#B11226] font-semibold transition-all duration-300 hover:scale-105 hover:-translate-y-0.5"
              >
                <Link href="/membership">{t("Join as Member", "\u0938\u0926\u0938\u094d\u092f \u092c\u0928\u0947\u0902")}</Link>
              </Button>
            </motion.div>

            {/* Stats */}
            {stats && (
              <motion.div
                className="mt-12 flex flex-wrap justify-center gap-10 md:gap-14"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.62 }}
              >
                {[
                  {
                    value: Math.round(stats.livesImpacted / 1000),
                    suffix: "K+",
                    lbl: t("Lives Impacted", "\u092a\u094d\u0930\u092d\u093e\u0935\u093f\u0924 \u091c\u0940\u0935\u0928"),
                  },
                  {
                    value: stats.villagesCovered,
                    suffix: "+",
                    lbl: t("Villages", "\u0917\u093e\u0901\u0935"),
                  },
                  {
                    value: stats.treesPlanted,
                    suffix: "+",
                    lbl: t("Trees Planted", "\u0932\u0917\u093e\u090f \u0917\u090f \u092a\u0947\u0921\u093c"),
                  },
                ].map(({ value, suffix, lbl }) => (
                  <div key={lbl} className="text-center group">
                    <div className="text-[2.4rem] font-bold font-serif leading-none text-amber-300 group-hover:scale-110 transition-transform duration-300 drop-shadow-[0_2px_12px_rgba(251,191,36,0.45)]">
                      <AnimatedCounter value={value} duration={1800} />
                      {suffix}
                    </div>
                    <div className="text-[10px] text-white/52 uppercase tracking-[0.2em] mt-2">{lbl}</div>
                  </div>
                ))}
              </motion.div>
            )}

            {/* Scroll line */}
            <motion.div
              className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 2.1 }}
            >
              <span className="text-[9px] uppercase tracking-[0.32em] text-white/42">
                {t("Scroll", "\u0938\u094d\u0915\u094d\u0930\u0949\u0932")}
              </span>
              <motion.div
                className="h-10 w-px origin-top"
                style={{ background: "linear-gradient(to bottom, rgba(255,255,255,0.4), transparent)" }}
                animate={{ scaleY: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* ── Section 2: Mission statement (scrolls in) ── */}
        <div className="flex h-screen flex-col items-center justify-center px-6 pb-24">
          <motion.div
            className="mx-auto flex max-w-2xl flex-col items-center text-center"
            style={{ opacity: s2Opacity, y: s2Y }}
          >
            <motion.p
              className="mb-5 font-serif italic leading-snug"
              style={{
                fontSize: "clamp(2rem, 4vw, 3.2rem)",
                fontWeight: 600,
                lineHeight: 1.32,
                color: headingColor,
                textShadow: "0 1px 24px rgba(4,1,1,0.3)",
              }}
            >
              {t("Serve Selflessly.", "\u0928\u093f\u0938\u094d\u0935\u093e\u0930\u094d\u0925 \u092d\u093e\u0935 \u0938\u0947 \u0938\u0947\u0935\u093e \u0915\u0930\u0947\u0902\u0964")}
              <br />
              {t("Transform Together.", "\u092e\u093f\u0932\u0915\u0930 \u092c\u0926\u0932\u093e\u0935 \u0932\u093e\u090f\u0902\u0964")}
            </motion.p>

            <motion.div className="mb-7 h-px w-14" style={{ background: dividerColor }} />

            <motion.p
              className="mb-11 max-w-lg font-sans font-light"
              style={{
                fontSize: "clamp(0.95rem, 1.5vw, 1.1rem)",
                lineHeight: 1.92,
                color: bodyColor,
              }}
            >
              {t(
                "Nisvarthjan Seva Foundation walks alongside India\u2019s most marginalised communities \u2014 not as outsiders, but as partners committed to lasting change in the Vindhya and rural heartland.",
                "\u0928\u093f\u0938\u094d\u0935\u093e\u0930\u094d\u0925\u091c\u0928 \u0938\u0947\u0935\u093e \u092b\u093e\u0909\u0902\u0921\u0947\u0936\u0928 \u092d\u093e\u0930\u0924 \u0915\u0947 \u0938\u092c\u0938\u0947 \u0935\u0902\u091a\u093f\u0924 \u0938\u092e\u0941\u0926\u093e\u092f\u094b\u0902 \u0915\u0947 \u0938\u093e\u0925 \u0915\u0902\u0927\u0947 \u0938\u0947 \u0915\u0902\u0927\u093e \u092e\u093f\u0932\u093e\u0915\u0930 \u091a\u0932\u0924\u093e \u0939\u0948\u0964"
              )}
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 pointer-events-auto"
              style={{ opacity: s2Opacity }}
            >
              <Button
                size="lg"
                asChild
                className="bg-[#B11226] hover:bg-[#8e0e1d] text-white px-10 py-6 text-base font-semibold shadow-[0_6px_28px_rgba(177,18,38,0.4)] hover:shadow-[0_10px_38px_rgba(177,18,38,0.6)] transition-all duration-300 hover:scale-105"
              >
                <Link href="/about">{t("Our Story", "\u0939\u092e\u093e\u0930\u0940 \u0915\u0939\u093e\u0928\u0940")}</Link>
              </Button>
              <motion.div style={{ borderColor: btnBorder }}>
                <Button
                  size="lg"
                  variant="outline"
                  asChild
                  className="px-10 py-6 text-base font-semibold transition-all duration-300 hover:scale-105"
                >
                  <Link href="/campaigns">{t("Active Campaigns", "\u0938\u0915\u094d\u0930\u093f\u092f \u0905\u092d\u093f\u092f\u093e\u0928")}</Link>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
