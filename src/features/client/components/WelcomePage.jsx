import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Sparkles,
    Award,
    Wrench,
    Factory,
    FileCheck,
    PenTool,
    Snowflake,
    Users,
    X,
    ArrowRight
} from "lucide-react";
import useHaptics from "../../../shared/hooks/useHaptics";

const WelcomePage = ({ onClose }) => {
    const { trigger } = useHaptics();

    const cards = [
        {
            title: "Service",
            desc: "Experience our world-class interior service ecosystem.",
            icon: Sparkles,
            color: "from-blue-400 to-indigo-600",
            shadow: "shadow-blue-200"
        },
        {
            title: "Completion Certificate",
            desc: "Official recognition of your project's successful delivery.",
            icon: Award,
            color: "from-amber-400 to-orange-600",
            shadow: "shadow-orange-200"
        },
        {
            title: "Installation",
            desc: "Precision fit-out by our expert technical artisans.",
            icon: Wrench,
            color: "from-emerald-400 to-teal-600",
            shadow: "shadow-emerald-200"
        },
        {
            title: "Production",
            desc: "State-of-the-art manufacturing of your custom designs.",
            icon: Factory,
            color: "from-purple-400 to-fuchsia-600",
            shadow: "shadow-fuchsia-200"
        },
        {
            title: "Final set of docs",
            desc: "All your project technical drawings and manuals.",
            icon: FileCheck,
            color: "from-rose-400 to-pink-600",
            shadow: "shadow-pink-200"
        },
        {
            title: "Revised Designs",
            desc: "Iterative design refinements tailored to your vision.",
            icon: PenTool,
            color: "from-cyan-400 to-blue-600",
            shadow: "shadow-cyan-200"
        },
        {
            title: "Freezing Stage",
            desc: "Securing your final selections for production launch.",
            icon: Snowflake,
            color: "from-indigo-400 to-purple-800",
            shadow: "shadow-indigo-300"
        },
        {
            title: "Client Followups",
            desc: "Dedicated support ensuring your complete satisfaction.",
            icon: Users,
            color: "from-lime-400 to-green-600",
            shadow: "shadow-green-200"
        }
    ];

    const containerVars = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    };

    const cardVars = {
        hidden: { y: 50, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100, damping: 12 }
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[3000] bg-slate-50 flex flex-col items-center justify-center p-4 md:p-8 overflow-y-auto"
        >
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        rotate: [0, 90, 0],
                        x: [0, 50, 0],
                        y: [0, -50, 0]
                    }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-20 -left-20 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, -120, 0],
                        x: [0, -80, 0],
                        y: [0, 60, 0]
                    }}
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="absolute -bottom-20 -right-20 w-[30rem] h-[30rem] bg-pink-200/20 rounded-full blur-3xl"
                />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat"></div>
            </div>

            <div className="max-w-6xl w-full relative z-10 flex flex-col items-center">
                {/* Header Section */}
                <motion.div
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="text-center mb-12 md:mb-16"
                >
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                        className="inline-block mb-6"
                    >
                        <img src="/FINAL_LOGO.png" alt="Cookscape" className="h-16 md:h-20 drop-shadow-2xl" />
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter mb-4">
                        Welcome to <span className="text-indigo-600">Cookscape</span>
                    </h1>
                    <p className="text-lg md:text-xl font-bold text-slate-500 max-w-2xl mx-auto leading-relaxed">
                        Your journey to a beautiful home begins here. Explore the core pillars of our project lifecycle.
                    </p>
                </motion.div>

                {/* 8 Cards Grid */}
                <motion.div
                    variants={containerVars}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full"
                >
                    {cards.map((card, idx) => (
                        <motion.div
                            key={card.title}
                            variants={cardVars}
                            whileHover={{
                                y: -8,
                                transition: { type: "spring", stiffness: 400, damping: 10 }
                            }}
                            whileTap={{ scale: 0.98 }}
                            className={`bg-white rounded-[2rem] p-6 shadow-xl ${card.shadow} border border-white/50 relative overflow-hidden group cursor-pointer`}
                            onClick={() => trigger('light')}
                        >
                            {/* Background Glow */}
                            <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-10 transition-opacity blur-2xl rounded-full`} />

                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white mb-6 shadow-lg transform group-hover:rotate-6 transition-transform`}>
                                <card.icon size={28} strokeWidth={2.5} />
                            </div>

                            <h3 className="text-xl font-black text-slate-800 tracking-tight mb-2 group-hover:text-indigo-600 transition-colors">
                                {card.title}
                            </h3>
                            <p className="text-sm font-bold text-slate-400 leading-relaxed">
                                {card.desc}
                            </p>

                            <div className="mt-8 flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                                Explore <ArrowRight size={14} />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* CTA Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.6 }}
                    className="mt-16 md:mt-20 flex flex-col items-center gap-6"
                >
                    <motion.button
                        whileHover={{ scale: 1.05, boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)" }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            trigger('heavy');
                            onClose();
                        }}
                        className="px-12 py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-lg uppercase tracking-widest shadow-2xl shadow-indigo-200 transition-all flex items-center gap-3 relative overflow-hidden group"
                    >
                        <span className="relative z-10">Start My Journey</span>
                        <ArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    </motion.button>

                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                        Cookscape Internal Portal v2.0
                    </p>
                </motion.div>
            </div>

            {/* Close Button Top Right */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                onClick={() => {
                    trigger('medium');
                    onClose();
                }}
                className="absolute top-8 right-8 p-3 bg-white/50 backdrop-blur-md rounded-2xl text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all shadow-sm border border-white/50 group"
            >
                <X size={24} className="group-hover:rotate-90 transition-transform duration-300" />
            </motion.button>
        </motion.div>
    );
};

export default WelcomePage;
