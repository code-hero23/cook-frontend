import React from "react";
import { User, Phone, Mail, MapPin, Calendar, CreditCard, Heart, Briefcase, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const Profile = () => {
    const project = JSON.parse(localStorage.getItem("clientProject") || "{}");

    const Section = ({ title, icon: Icon, children, colorClass, delay = 0 }) => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            className="bg-white/60 backdrop-blur-xl rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50 border border-white/50 hover:shadow-2xl transition-all group"
        >
            <div className="flex items-center gap-4 mb-8">
                <div className={`w-12 h-12 rounded-2xl ${colorClass} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon size={22} />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Verified Information</p>
                </div>
            </div>
            <div className="space-y-6">
                {children}
            </div>
        </motion.div>
    );

    const DetailItem = ({ label, value, icon: Icon }) => (
        <div className="flex items-start gap-4 group/item">
            {Icon && (
                <div className="w-8 h-8 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover/item:bg-indigo-50 group-hover/item:text-indigo-600 transition-colors">
                    <Icon size={16} />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{label}</p>
                <p className="text-sm font-black text-slate-700 truncate">{value || "Not specified"}</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-5xl mx-auto p-4 md:p-10 space-y-10">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-2"
            >
                <h1 className="text-3xl md:text-4xl font-black text-slate-950 tracking-tighter">My Profile</h1>
                <p className="text-slate-500 font-bold max-w-xl leading-relaxed">Personal and project data as recorded in the Cookscape Master Registry.</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Personal Details */}
                <Section title="Lead Contact" icon={User} colorClass="bg-indigo-600 text-white" delay={0.1}>
                    <div className="grid grid-cols-2 gap-6">
                        <DetailItem label="First Name" value={project.firstName} />
                        <DetailItem label="Last Name" value={project.lastName} />
                    </div>
                    <DetailItem label="Email Identity" value={project.clientEmail} icon={Mail} />
                    <DetailItem label="Direct Line" value={project.clientPhone} icon={Phone} />
                </Section>

                {/* Spouse Details */}
                <Section title="Partner Details" icon={Heart} colorClass="bg-pink-500 text-white" delay={0.2}>
                    <DetailItem label="Partner Name" value={project.spouseName} icon={User} />
                    <DetailItem label="Direct Line" value={project.spousePhone} icon={Phone} />
                </Section>

                {/* Project Details */}
                <Section title="Project Scope" icon={Briefcase} colorClass="bg-emerald-600 text-white" delay={0.3}>
                    <div className="grid grid-cols-2 gap-6">
                        <DetailItem label="Project Alias" value={project.name} />
                        <DetailItem label="Registry ID" value={project.cpNumber} />
                    </div>
                    <DetailItem label="Physical Site" value={project.location} icon={MapPin} />
                    <DetailItem label="Allocated Budget" value={project.budget ? `₹${project.budget.toLocaleString()}` : null} icon={CreditCard} />
                </Section>

                {/* Schedule */}
                <Section title="Timeframe" icon={Calendar} colorClass="bg-amber-500 text-white" delay={0.4}>
                    <div className="grid grid-cols-2 gap-6">
                        <DetailItem label="Kick-off Date" value={project.startDate ? new Date(project.startDate).toLocaleDateString() : 'Pending'} />
                        <DetailItem label="Delivery Goal" value={project.deadline ? new Date(project.deadline).toLocaleDateString() : 'TBD'} />
                    </div>
                    <div className="pt-6 border-t border-slate-100 mt-2">
                        <DetailItem label="Forecasted Handover" value={`${project.handingOverMonth || ""} ${project.handingOverYear || ""}`} icon={ShieldCheck} />
                    </div>
                </Section>

                {/* Billing Details */}
                <Section title="Financial Records" icon={CreditCard} colorClass="bg-slate-800 text-white" delay={0.5}>
                    <DetailItem label="Billing Name" value={project.billingName || `${project.firstName} ${project.lastName}`} />
                    <DetailItem label="Registered address" value={project.location} icon={MapPin} />
                    <div className="grid grid-cols-2 gap-6">
                        <DetailItem label="Contact Link" value={project.billingPhone || project.clientPhone} icon={Phone} />
                        <DetailItem label="GST Identity" value={project.gstin} icon={ShieldCheck} />
                    </div>
                </Section>
            </div>

            {/* Access Disclaimer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="p-8 bg-slate-900 rounded-[2.5rem] text-white relative overflow-hidden shadow-2xl"
            >
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
                <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/10 group-hover:bg-white/20 transition-colors">
                        <ShieldCheck className="text-indigo-400" size={32} />
                    </div>
                    <div className="text-center md:text-left">
                        <h4 className="text-lg font-black tracking-tight mb-2">Immutable Project Registry</h4>
                        <p className="text-sm text-slate-400 font-bold leading-relaxed max-w-2xl">
                            These records are managed directly by ORBIX Operations. If any information requires correction, please initiate a formal update request through the <span className="text-indigo-400">Feedback & Support</span> portal.
                        </p>
                    </div>
                    <button className="md:ml-auto px-8 py-3 bg-white text-slate-900 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-50 transition-colors">
                        Request Change
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default Profile;
