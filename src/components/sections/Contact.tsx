"use client";

import { motion } from "framer-motion";
import { Code2, Link2, Mail, MessageCircle, Phone } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { contactLinks } from "@/data/contact";

const links = [
  {
    key: "whatsapp",
    href: contactLinks.whatsapp,
    icon: MessageCircle,
    labelKey: "whatsapp" as const,
    color: "from-green-500 to-emerald-600",
  },
  {
    key: "email",
    href: contactLinks.email,
    icon: Mail,
    labelKey: "email" as const,
    color: "from-violet-500 to-purple-600",
  },
  {
    key: "phone",
    href: contactLinks.phone,
    icon: Phone,
    labelKey: "phone" as const,
    color: "from-sky-500 to-blue-600",
  },
  {
    key: "github",
    href: contactLinks.github,
    icon: Code2,
    labelKey: "github" as const,
    color: "from-slate-600 to-slate-800",
  },
  {
    key: "linkedin",
    href: contactLinks.linkedin,
    icon: Link2,
    labelKey: "linkedin" as const,
    color: "from-blue-600 to-indigo-700",
  },
];

export function Contact() {
  const { t } = useApp();

  return (
    <section id="contact" className="scroll-mt-24 px-4 py-20">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 text-center"
        >
          <h2 className="text-3xl font-bold sm:text-4xl">{t.contact.title}</h2>
          <p className="mt-2 text-[var(--text-muted)]">{t.contact.subtitle}</p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link, i) => {
            const Icon = link.icon;
            return (
              <motion.a
                key={link.key}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.04, y: -4 }}
                whileTap={{ scale: 0.98 }}
                className={`group flex items-center gap-4 rounded-2xl bg-gradient-to-br ${link.color} p-5 text-white shadow-lg`}
              >
                <div className="rounded-xl bg-white/20 p-3 transition group-hover:bg-white/30">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold">{t.contact[link.labelKey]}</p>
                  <p className="text-xs text-white/80">
                    {link.key === "email"
                      ? contactLinks.emailDisplay
                      : link.key === "phone" || link.key === "whatsapp"
                        ? contactLinks.phoneDisplay
                        : "Open →"}
                  </p>
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
