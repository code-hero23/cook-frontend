import React from "react";
import { User, Phone, Mail, MapPin, Calendar, CreditCard, Heart, Briefcase } from "lucide-react";

const Profile = () => {
    const project = JSON.parse(localStorage.getItem("clientProject") || "{}");

    const Section = ({ title, icon: Icon, children, colorClass }) => (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-6">
                <div className={`w-10 h-10 rounded-xl ${colorClass} flex items-center justify-center`}>
                    <Icon size={20} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            </div>
            <div className="space-y-4">
                {children}
            </div>
        </div>
    );

    const DetailItem = ({ label, value, icon: Icon }) => (
        <div className="flex items-start gap-3 group">
            {Icon && <Icon size={16} className="text-slate-400 mt-0.5 group-hover:text-indigo-500 transition-colors" />}
            <div className="flex-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
                <p className="text-sm font-semibold text-slate-700">{value || "Not specified"}</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Profile & Project Details</h1>
                <p className="text-slate-500 mt-1 font-medium">Manage your personal information and project specifications.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Details */}
                <Section title="Primary Contact" icon={User} colorClass="bg-indigo-50 text-indigo-600">
                    <div className="grid grid-cols-2 gap-4">
                        <DetailItem label="First Name" value={project.firstName} />
                        <DetailItem label="Last Name" value={project.lastName} />
                    </div>
                    <DetailItem label="Email Address" value={project.clientEmail} icon={Mail} />
                    <DetailItem label="Contact Number" value={project.clientPhone} icon={Phone} />
                </Section>

                {/* Spouse Details */}
                <Section title="Spouse Details" icon={Heart} colorClass="bg-pink-50 text-pink-600">
                    <DetailItem label="Spouse Name" value={project.spouseName} />
                    <DetailItem label="Contact Number" value={project.spousePhone} icon={Phone} />
                </Section>

                {/* Project Details */}
                <Section title="Project Details" icon={Briefcase} colorClass="bg-blue-50 text-blue-600">
                    <DetailItem label="Project Name" value={project.name} />
                    <DetailItem label="CP Number" value={project.cpNumber} />
                    <DetailItem label="Site Location" value={project.location} icon={MapPin} />
                    <DetailItem label="Budget" value={project.budget ? `₹${project.budget}` : null} icon={CreditCard} />
                </Section>

                {/* Schedule */}
                <Section title="Timeline & Delivery" icon={Calendar} colorClass="bg-amber-50 text-amber-600">
                    <div className="grid grid-cols-2 gap-4">
                        <DetailItem label="Start Date" value={project.startDate} />
                        <DetailItem label="Deadline" value={project.deadline} />
                    </div>
                    <div className="pt-4 border-t border-slate-50">
                        <DetailItem label="Expected Handing Over" value={`${project.handingOverMonth || ""} ${project.handingOverYear || ""}`} />
                    </div>
                </Section>

                {/* Billing Details */}
                <Section title="Billing Details" icon={CreditCard} colorClass="bg-emerald-50 text-emerald-600">
                    <DetailItem label="Billing Name" value={project.billingName || `${project.firstName} ${project.lastName}`} />
                    <DetailItem label="Billing Address" value={project.location} icon={MapPin} />
                    <DetailItem label="Billing Contact Number" value={project.billingPhone || project.clientPhone} icon={Phone} />
                    <DetailItem label="GSTIN" value={project.gstin} />
                </Section>
            </div>

            {/* Security Note */}
            <div className="mt-8 p-6 bg-slate-50 rounded-3xl border border-slate-200">
                <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
                        <User className="text-slate-400" size={20} />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-slate-800 mb-1">Project Access</h4>
                        <p className="text-xs text-slate-500 leading-relaxed">
                            This information is managed by the Admin. If you need to update any details, please contact your project manager or raise a ticket via the feedback section.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
