'use client';

import { useState } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';

// Pre-seeded college information
const collegeData: Record<string, string> = {
    // Timings
    "gate timings": "College gates open at 7:00 AM and close at 6:00 PM on weekdays. Saturday timings are 8:00 AM to 2:00 PM.",
    "library timings": "Library is open from 8:00 AM to 8:00 PM on weekdays, and 9:00 AM to 5:00 PM on Saturdays.",
    "canteen timings": "Canteen operates from 8:00 AM to 5:00 PM. The famous 'Vada Pav' sells out by 10 AM!",
    "office timings": "Administrative office hours are 10:00 AM to 5:00 PM, Monday to Friday.",

    // Fun Facts
    "wifi password": "Nice try! 😄 Connect to 'VARTAK_STUDENT' network and authenticate with your student ID.",
    "parking": "Two-wheeler parking is free. Four-wheelers need a parking pass from the admin office (₹500/semester).",
    "dress code": "Formal dress code on Mondays and during exams. ID cards are mandatory at all times!",
    "attendance": "Minimum 75% attendance is required. Below 65%? Say hello to detention lectures!",

    // Academics
    "departments": "We have 6 departments: Computer Science, IT, Electronics, Mechanical, Civil, and Electrical Engineering.",
    "placement": "Our placement rate is 85%+. Top recruiters include TCS, Infosys, Wipro, Cognizant, and many startups!",
    "fees": "Tuition fees range from ₹80,000 to ₹1,20,000 per year depending on the branch and category.",
    "hostel": "Boys and Girls hostels available. Hostel fees are approximately ₹45,000 per year including mess.",

    // Campus Life
    "events": "Annual fest 'TECHNOVANZA' happens in February. Cultural fest 'SPANDAN' is in September!",
    "clubs": "We have 15+ clubs including Robotics, Coding, Drama, Music, Sports, Photography, and more!",
    "sports": "Cricket ground, Basketball court, Volleyball court, and a small gym are available on campus.",
    "cafeteria": "The canteen serves the best Misal Pav in Vasai! Must try the special 'College Chai' too.",

    // Silly/Fun
    "bunking": "Pro tip: Don't bunk Prof. Sharma's class. He WILL remember your face. Forever. 👀",
    "xerox": "Xerox shop near Gate 2 is cheaper. The one inside charges extra for 'convenience'.",
    "water bottle": "Free RO water available near the library. Bring your own bottle!",
    "best professor": "All professors are great! (We know they might read this 😉)",
    "exam tips": "Start studying at least 2 days before exams. The night-before strategy is risky!",
    "secret spot": "The terrace garden near Block C is the best spot for peaceful studying. Shhh! 🤫",

    // Contact
    "principal": "Dr. R.K. Sharma is our Principal. Office hours: 11 AM - 1 PM (by appointment).",
    "contact": "Main office: 0250-2390XXX. Email: info@vartakcollege.edu.in",
    "address": "Vartak College of Engineering, Vasai Road (West), Palghar District, Maharashtra - 401202",
    "website": "Visit www.vartakcollege.edu.in for official updates and circulars.",

    // Admission
    "admission": "Admissions open in June-July. Apply through CAP rounds or Direct Second Year process.",
    "cutoff": "Last year's cutoff for CS was around 92 percentile. IT was 88. Check official website for updates.",
    "documents": "Required: 10th & 12th marksheets, Domicile, Caste certificate (if applicable), Aadhar, Photos.",

    // Default
    "hello": "Hello! 👋 I'm VartakBot. Ask me anything about the college!",
    "hi": "Hey there! 👋 How can I help you today?",
    "help": "You can ask me about: timings, fees, admission, departments, events, campus life, and more!",
};

const quickQuestions = [
    "Gate timings",
    "Library timings",
    "Canteen timings",
    "Admission",
    "Fees",
    "Placement",
    "Events",
    "Contact",
];

interface Message {
    type: 'user' | 'bot';
    text: string;
}

export default function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { type: 'bot', text: "Hello! 👋 I'm VartakBot. Ask me anything about the college - timings, fees, events, or even the best canteen food!" }
    ]);
    const [input, setInput] = useState('');

    const findAnswer = (question: string): string => {
        const q = question.toLowerCase().trim();

        // Direct match
        if (collegeData[q]) return collegeData[q];

        // Keyword search
        for (const [key, value] of Object.entries(collegeData)) {
            if (q.includes(key) || key.includes(q)) {
                return value;
            }
        }

        // Fuzzy matching for common queries
        if (q.includes('gate') || q.includes('open') || q.includes('close')) return collegeData['gate timings'];
        if (q.includes('library')) return collegeData['library timings'];
        if (q.includes('canteen') || q.includes('food') || q.includes('eat')) return collegeData['canteen timings'];
        if (q.includes('fee') || q.includes('cost') || q.includes('money')) return collegeData['fees'];
        if (q.includes('hostel') || q.includes('stay') || q.includes('accommodation')) return collegeData['hostel'];
        if (q.includes('wifi') || q.includes('internet') || q.includes('password')) return collegeData['wifi password'];
        if (q.includes('park')) return collegeData['parking'];
        if (q.includes('dress') || q.includes('uniform')) return collegeData['dress code'];
        if (q.includes('attend')) return collegeData['attendance'];
        if (q.includes('place') || q.includes('job') || q.includes('recruit')) return collegeData['placement'];
        if (q.includes('event') || q.includes('fest')) return collegeData['events'];
        if (q.includes('club') || q.includes('activity')) return collegeData['clubs'];
        if (q.includes('sport') || q.includes('gym') || q.includes('cricket')) return collegeData['sports'];
        if (q.includes('principal') || q.includes('hod')) return collegeData['principal'];
        if (q.includes('contact') || q.includes('phone') || q.includes('call')) return collegeData['contact'];
        if (q.includes('address') || q.includes('location') || q.includes('where')) return collegeData['address'];
        if (q.includes('admit') || q.includes('apply') || q.includes('enroll')) return collegeData['admission'];
        if (q.includes('cutoff') || q.includes('marks') || q.includes('percentile')) return collegeData['cutoff'];
        if (q.includes('document') || q.includes('required')) return collegeData['documents'];
        if (q.includes('bunk') || q.includes('skip')) return collegeData['bunking'];
        if (q.includes('xerox') || q.includes('print') || q.includes('photocopy')) return collegeData['xerox'];
        if (q.includes('water')) return collegeData['water bottle'];
        if (q.includes('exam') || q.includes('study')) return collegeData['exam tips'];
        if (q.includes('secret') || q.includes('spot') || q.includes('chill')) return collegeData['secret spot'];
        if (q.includes('department') || q.includes('branch')) return collegeData['departments'];

        return "Hmm, I'm not sure about that. Try asking about timings, fees, admission, events, or campus life! 🤔";
    };

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { type: 'user', text: userMsg }]);
        setInput('');

        // Simulate typing delay
        setTimeout(() => {
            const answer = findAnswer(userMsg);
            setMessages(prev => [...prev, { type: 'bot', text: answer }]);
        }, 500);
    };

    const handleQuickQuestion = (q: string) => {
        setMessages(prev => [...prev, { type: 'user', text: q }]);
        setTimeout(() => {
            const answer = findAnswer(q);
            setMessages(prev => [...prev, { type: 'bot', text: answer }]);
        }, 500);
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${isOpen ? 'bg-red-500 hover:bg-red-600' : 'bg-[#B9FF66] hover:scale-110'}`}
            >
                {isOpen ? <X size={24} className="text-white" /> : <MessageCircle size={24} className="text-black" />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-48px)] bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-black text-white p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#B9FF66] rounded-full flex items-center justify-center">
                            <Bot size={20} className="text-black" />
                        </div>
                        <div>
                            <h3 className="font-bold">VartakBot</h3>
                            <p className="text-xs text-gray-400">Your campus guide</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="h-72 overflow-y-auto p-4 space-y-3 bg-gray-50">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${msg.type === 'user' ? 'bg-black text-white rounded-br-sm' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'}`}>
                                    {msg.text}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Quick Questions */}
                    <div className="px-4 py-2 border-t border-gray-100 bg-white">
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {quickQuestions.map((q) => (
                                <button
                                    key={q}
                                    onClick={() => handleQuickQuestion(q)}
                                    className="flex-shrink-0 px-3 py-1 bg-gray-100 hover:bg-[#B9FF66] text-xs font-medium rounded-full transition-colors"
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Input */}
                    <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about anything..."
                            className="flex-1 px-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-[#B9FF66]"
                        />
                        <button
                            onClick={handleSend}
                            className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-colors"
                        >
                            <Send size={16} />
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
